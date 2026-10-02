/**
 * ENDPOINT DE MARCOS — `POST /api/assistant`.
 *
 * Ce fichier ne contient que l'enchaînement. Chaque étape vit dans son module,
 * et l'ordre est le garde-fou : rien n'atteint le fournisseur avant d'avoir
 * passé la validation, les limites et le budget.
 *
 *   origine → pré-vol → méthode → type → taille → schéma   (requete.js)
 *   → débit → budget journalier                            (limites.js)
 *   → contexte                                             (IA-06)
 *   → prompt et assemblage                                 (IA-03)
 *   → fournisseur                                          (IA-05)
 *   → liens internes validés, réponse normalisée
 *
 * Phase IA-02 : les étapes marquées d'une phase à venir sont des points
 * d'ancrage explicites, pas des oublis. Elles lèvent une erreur claire si on
 * les atteint, plutôt que de rendre une réponse vide qui passerait les tests.
 *
 * Le Worker ne renvoie jamais de texte d'erreur : seulement un code stable
 * (erreurs.js). Le texte affiché vient du dictionnaire de l'interface.
 */
import { erreur, STATUTS } from "./erreurs.js";
import { validerRequete, entetesCors } from "./requete.js";
import { limiterDebit, creerBudget } from "./limites.js";

/**
 * Crée le gestionnaire. L'injection des dépendances n'est pas de la cérémonie :
 * c'est ce qui rend l'endpoint testable sous Node, sans wrangler, sans réseau
 * et sans clé.
 *
 * @param {object} [deps]
 * @param {import("./fournisseur.js").Fournisseur} [deps.fournisseur]
 * @param {(p: {langue: string}) => Promise<string>} [deps.contexte]   IA-06
 * @param {(p: object) => {systeme: string, messages: Array}} [deps.assembler]  IA-03
 * @param {ReturnType<typeof creerBudget>} [deps.budget]
 * @param {(entree: object) => void} [deps.journaliser]
 */
export function creerGestionnaire(deps = {}) {
  const budget = deps.budget ?? creerBudget();

  return async function gerer(request, env = {}, _ctx = undefined) {
    const debut = Date.now();

    // 1 à 6. Validation. Aucun appel au fournisseur n'a eu lieu ici.
    const valide = await validerRequete(request, env);
    if (!valide.ok) return valide.reponse;
    const { requete, origine } = valide;
    const cors = entetesCors(origine);

    // 7. Débit. D-6 : si le binding n'existe pas, on continue sans payer.
    const debit = await limiterDebit({
      env,
      session: requete.session,
      ip: request.headers.get("cf-connecting-ip"),
    });
    if (!debit.ok) {
      return erreur(debit.code, { entetes: { ...cors, "retry-after": String(debit.apres ?? 60) } });
    }

    // 8. Budget journalier. C'est lui qui borne la dépense.
    const compte = budget.consommer();
    if (!compte.ok) return erreur(compte.code, { entetes: { ...cors, "retry-after": "3600" } });

    // 9 à 11. Contexte, prompt, fournisseur.
    const journal = {
      langue: requete.langue,
      echanges: requete.messages.length,
      budgetRestant: compte.restant,
      limiteur: debit.binding,
    };
    try {
      if (!deps.contexte || !deps.assembler || !deps.fournisseur) {
        // Phase IA-02 : la chaîne n'est pas encore branchée. On le dit par un
        // code honnête plutôt que par une réponse vide.
        deps.journaliser?.({ ...journal, sortie: "indisponible", motif: "chaine_incomplete", ms: Date.now() - debut });
        return erreur("indisponible", { entetes: cors });
      }

      const contexte = await deps.contexte({ langue: requete.langue });
      const { systeme, messages } = deps.assembler({ requete, contexte });
      const reponse = await deps.fournisseur.repondre({
        systeme,
        messages,
        maxJetons: Number(env.MAX_JETONS_REPONSE ?? 180),
      });

      deps.journaliser?.({
        ...journal,
        sortie: 200,
        jetonsEntree: reponse.jetonsEntree,
        jetonsSortie: reponse.jetonsSortie,
        ms: Date.now() - debut,
      });

      return new Response(JSON.stringify({ texte: reponse.texte, liens: reponse.liens ?? [] }), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8", ...cors },
      });
    } catch (cause) {
      // Jamais d'échec silencieux : on journalise le motif, sans le texte de la
      // question (décision D-10), et on rend un code stable.
      deps.journaliser?.({ ...journal, sortie: "indisponible", motif: cause?.name ?? "erreur", ms: Date.now() - debut });
      return erreur("indisponible", { entetes: cors });
    }
  };
}

export default { fetch: creerGestionnaire() };
export { STATUTS };
