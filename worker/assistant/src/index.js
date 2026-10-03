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
import { extraireLiens } from "./prompt.js";
import { creerBrief } from "./qualification.js";
import { construireCourrielBrief, envoyerAvecResend } from "./email.js";
import { chargerConnaissancePublique } from "./connaissance.js";

/**
 * Crée le gestionnaire. L'injection des dépendances n'est pas de la cérémonie :
 * c'est ce qui rend l'endpoint testable sous Node, sans wrangler, sans réseau
 * et sans clé.
 *
 * @param {object} [deps]
 * @param {import("./fournisseur.js").Fournisseur} [deps.fournisseur]
 * @param {(p: {langue: string}) => Promise<object>} [deps.contexte]   base de la langue (IA-06)
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

    const chemin = new URL(request.url).pathname;
    if (chemin === "/api/assistant/brief") {
      // La transmission a sa propre route : elle ne rappelle pas le modèle et
      // ne consomme pas le budget journalier de questions.
      const journal = { langue: requete.langue, operation: "transmission_brief", limiteur: debit.binding };
      try {
        if (!requete.qualification) return erreur("requete_invalide", { entetes: cors });
        const base = await (deps.contexte ?? chargerConnaissancePublique)({
          langue: requete.langue,
          env,
          fetcher: deps.fetcher,
        });
        const courriel = construireCourrielBrief({
          qualification: requete.qualification,
          destinataire: base.contact?.email,
          session: requete.session,
        });
        if (!courriel) return erreur("requete_invalide", { entetes: cors });
        if (!deps.envoyerEmail && (!env.RESEND_CLE || !env.RESEND_EXPEDITEUR)) {
          deps.journaliser?.({ ...journal, sortie: "indisponible", motif: "resend_non_configure" });
          return erreur("indisponible", { entetes: cors });
        }
        await (deps.envoyerEmail ?? envoyerAvecResend)({ courriel, env, fetcher: deps.fetcher });
        deps.journaliser?.({ ...journal, sortie: 200, motif: "brief_transmis" });
        return new Response(JSON.stringify({ email: "transmis" }), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8", ...cors },
        });
      } catch (cause) {
        deps.journaliser?.({ ...journal, sortie: "indisponible", motif: cause?.name ?? "erreur" });
        return erreur("indisponible", { entetes: cors });
      }
    }
    if (chemin !== "/api/assistant") return erreur("requete_invalide", { entetes: cors });

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

      const base = await deps.contexte({ langue: requete.langue });
      const { systeme, messages } = deps.assembler({ requete, base });
      const brute = await deps.fournisseur.repondre({
        systeme,
        messages,
        maxJetons: Number(env.MAX_JETONS_REPONSE ?? 180),
      });

      // La réponse du modèle n'est JAMAIS rendue telle quelle : les références
      // internes sont validées contre la base, et toute adresse qu'il aurait
      // écrite est retirée (IA-03).
      const { texte, liens } = extraireLiens(brute.texte, base);

      deps.journaliser?.({
        ...journal,
        sortie: 200,
        jetonsEntree: brute.jetonsEntree,
        jetonsSortie: brute.jetonsSortie,
        liens: liens.length,
        ms: Date.now() - debut,
      });

      const corps = { texte, liens };
      if (requete.qualification) corps.brief = creerBrief(requete.qualification);
      return new Response(JSON.stringify(corps), {
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
