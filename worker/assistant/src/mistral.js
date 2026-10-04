/**
 * FOURNISSEUR MISTRAL — le seul fournisseur réel (décision D-2).
 *
 * Il implémente EXACTEMENT la même interface que le fournisseur simulé :
 * `{ appels, repondre({ systeme, messages, maxJetons, langue, signal }) }`.
 * C'est ce qui permet au Worker de ne rien savoir du service, et aux tests de
 * tourner sans clé et sans réseau.
 *
 * Ce que ce module ne fait jamais :
 *   - écrire la clé dans une URL, un journal ou un message d'erreur ;
 *   - suivre une adresse écrite par le modèle (c'est prompt.js qui les retire) ;
 *   - rendre du HTML : la réponse est du texte, et le navigateur l'affiche
 *     comme du texte ;
 *   - conserver quoi que ce soit de la conversation.
 *
 * Sans `MISTRAL_CLE`, il n'existe pas : `creerFournisseur` rend `null` et le
 * Worker répond `indisponible` sans qu'aucun appel réseau n'ait lieu.
 */

const ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MODELES = "https://api.mistral.ai/v1/models";

/** Plafond absolu de la réponse. Aucune configuration ne le dépasse. */
export const MAX_JETONS = 180;

/** Erreur portant un code du contrat, pour que l'endpoint le relaie tel quel. */
function panne(code, { statut } = {}) {
  const erreur = new Error(code);
  erreur.name = code;
  if (statut) erreur.statut = statut;
  return erreur;
}

/**
 * L'identifiant du modèle doit être épinglé. Mistral avertit que les alias
 * exposent à des « silent updates in model behavior and pricing » (D-19) :
 * un `-latest` est donc refusé au démarrage, pas découvert en production.
 */
export function validerModele(modele) {
  const nom = String(modele ?? "").trim();
  if (!nom) throw panne("modele_absent");
  if (/-latest$/i.test(nom)) throw panne("modele_alias_interdit");
  return nom;
}

/**
 * Vérification de l'identifiant exact, `GET /v1/models` (D-19).
 *
 * N'est JAMAIS appelée par le Worker : elle sert au contrôle manuel décrit
 * dans AI_ARCHITECTURE.md, le jour où la clé existe. Sans clé, elle refuse
 * avant tout réseau.
 */
export async function verifierModele({ env = {}, fetcher = fetch } = {}) {
  if (!env.MISTRAL_CLE) throw panne("cle_absente");
  const attendu = validerModele(env.MISTRAL_MODELE);
  const reponse = await fetcher(MODELES, {
    headers: { authorization: `Bearer ${env.MISTRAL_CLE}` },
    signal: AbortSignal.timeout(Number(env.DELAI_FOURNISSEUR_MS ?? 15000)),
  });
  if (!reponse.ok) throw panne("modeles_indisponibles", { statut: reponse.status });
  const corps = await reponse.json();
  const connus = (corps?.data ?? []).map((m) => m?.id).filter(Boolean);
  return { modele: attendu, present: connus.includes(attendu), connus };
}

/**
 * Décide s'il faut réessayer, et après combien de temps.
 * La matrice vient de AI_ARCHITECTURE.md ; elle n'est pas inventée ici.
 */
function strategie({ statut, retryApres, tempsRestantMs }) {
  if (statut === 429) {
    const apres = Number(retryApres);
    if (Number.isFinite(apres) && apres <= 2 && tempsRestantMs >= 10000) {
      return { rejouer: true, attendreMs: Math.max(0, apres * 1000), sinon: "quota_journalier" };
    }
    return { rejouer: false, code: "quota_journalier" };
  }
  if ([500, 502, 503, 504].includes(statut)) {
    return { rejouer: true, attendreMs: 1000, sinon: "indisponible" };
  }
  // 400 et 422 : requête mal formée, c'est un défaut du Worker.
  // 401 et 403 : clé absente, invalide, ou permissions.
  // 404 : modèle inconnu ou retiré (D-19).
  return { rejouer: false, code: "indisponible" };
}

const dormir = (ms) => new Promise((resoudre) => setTimeout(resoudre, ms));

/**
 * Crée le fournisseur, ou `null` si la clé manque.
 *
 * Rendre `null` plutôt que lever garde le Worker fonctionnel sans clé : la
 * chaîne reste incomplète, l'endpoint répond `indisponible`, et **aucun appel
 * réseau n'est tenté**.
 *
 * @param {object} p
 * @param {object} p.env
 * @param {typeof fetch} [p.fetcher]
 * @param {() => number} [p.maintenant]
 */
export function creerFournisseur({ env = {}, fetcher = fetch, maintenant = () => Date.now() } = {}) {
  if (!env.MISTRAL_CLE) return null;
  const modele = validerModele(env.MISTRAL_MODELE);
  const delaiMs = Number(env.DELAI_FOURNISSEUR_MS ?? 15000);
  const budgetTempsMs = Number(env.BUDGET_TEMPS_MS ?? 20000);

  const fournisseur = {
    appels: 0,
    modele,
    async repondre({ systeme, messages, maxJetons, langue = "fr", version = "inconnue", signal }) {
      const depart = maintenant();
      // Le plafond de la configuration ne peut jamais dépasser celui du contrat.
      const plafond = Math.min(Number(maxJetons) || MAX_JETONS, MAX_JETONS);
      const corps = {
        model: modele,
        max_tokens: plafond,
        temperature: 0.2,
        // AI_DATA.md §Cache : `connaissance-{version}-{langue}`. La version
        // suffit à invalider le cache à chaque publication, et la langue
        // sépare deux bases systèmes qui diffèrent entièrement.
        prompt_cache_key: `connaissance-${version}-${langue}`,
        // Modération d'entrée côté Mistral, en plus de la neutralisation
        // des balises faite dans prompt.js.
        guardrails: { input: true },
        messages: [
          { role: "system", content: systeme },
          ...messages.map(({ role, contenu }) => ({ role, content: contenu })),
        ],
      };

      const appeler = async () => {
        fournisseur.appels += 1;
        const horloge = AbortSignal.timeout(delaiMs);
        const abandon = signal ? AbortSignal.any([signal, horloge]) : horloge;
        return fetcher(ENDPOINT, {
          method: "POST",
          headers: {
            // La clé ne voyage que dans cet en-tête. Jamais d'URL, jamais de journal.
            authorization: `Bearer ${env.MISTRAL_CLE}`,
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(corps),
          signal: abandon,
        });
      };

      let reponse;
      try {
        reponse = await appeler();
      } catch (cause) {
        // Délai dépassé ou réseau coupé : une seule reprise, après 1 s.
        if (maintenant() - depart >= budgetTempsMs) throw panne("delai_depasse");
        await dormir(1000);
        try {
          reponse = await appeler();
        } catch {
          throw panne(cause?.name === "TimeoutError" ? "delai_depasse" : "indisponible");
        }
      }

      if (!reponse.ok) {
        const tempsRestantMs = budgetTempsMs - (maintenant() - depart);
        const plan = strategie({
          statut: reponse.status,
          retryApres: reponse.headers?.get?.("retry-after"),
          tempsRestantMs,
        });
        if (!plan.rejouer) throw panne(plan.code, { statut: reponse.status });
        await dormir(plan.attendreMs);
        try {
          reponse = await appeler();
        } catch {
          throw panne(plan.sinon, { statut: reponse.status });
        }
        if (!reponse.ok) throw panne(plan.sinon, { statut: reponse.status });
      }

      let charge;
      try {
        charge = await reponse.json();
      } catch {
        throw panne("indisponible");
      }
      const texte = charge?.choices?.[0]?.message?.content;
      if (typeof texte !== "string" || !texte.trim()) throw panne("indisponible");

      return {
        texte,
        jetonsEntree: charge?.usage?.prompt_tokens,
        jetonsSortie: charge?.usage?.completion_tokens,
      };
    },
  };
  return fournisseur;
}
