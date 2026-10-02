/**
 * LIMITES — freiner les rafales, et borner la dépense.
 *
 * Deux mécanismes, et il faut les distinguer parce qu'ils ne protègent pas la
 * même chose :
 *
 *   - le BINDING RATE LIMITING de Cloudflare freine une rafale. Ses compteurs
 *     sont locaux à chaque emplacement et la documentation dit qu'ils sont
 *     « intentionally designed to not be used as an accurate accounting
 *     system ». Il freine, il ne compte pas d'argent.
 *   - le BUDGET JOURNALIER borne le nombre de questions. C'est lui qui protège
 *     la facture, et c'est le seul qui ne dépend d'aucun plan payant.
 *
 * DÉCISION D-6 DE MARC : la disponibilité du binding sur l'offre Workers Free
 * n'est pas publiée, et on ne paie pas pour le savoir. Si le binding est
 * absent, ce module le CONSTATE et continue avec le budget journalier seul —
 * sans échouer, et sans faire semblant d'avoir une protection qu'il n'a pas.
 * Le constat est journalisé, pour que l'absence se voie.
 */

/** Résultat d'un contrôle de limite. */
const PASSE = { ok: true, binding: null };

/**
 * Applique les limites par session et par adresse IP, si le binding existe.
 *
 * @param {object} p
 * @param {object} p.env        environnement du Worker (bindings et vars)
 * @param {string} p.session    identifiant aléatoire de l'onglet
 * @param {string|null} p.ip    adresse IP du visiteur, ou null
 * @returns {Promise<{ok: boolean, code?: string, apres?: number, binding: "present"|"absent"|null}>}
 */
export async function limiterDebit({ env, session, ip }) {
  const limiteur = env.LIMITEUR;
  // Pas de binding : D-6. On ne paie pas, on se replie, et on le dit.
  if (!limiteur || typeof limiteur.limit !== "function") return { ok: true, binding: "absent" };

  for (const cle of [`s:${session}`, ip ? `i:${ip}` : null]) {
    if (!cle) continue;
    const { success } = await limiteur.limit({ key: cle });
    if (!success) {
      return { ok: false, code: "trop_de_demandes", apres: Number(env.RETRY_APRES_S ?? 60), binding: "present" };
    }
  }
  return { ok: true, binding: "present" };
}

/**
 * Budget journalier, en nombre de questions.
 *
 * Volontairement approximatif : les compteurs d'un Worker sont locaux à leur
 * emplacement, donc le total réel peut dépasser le plafond sur plusieurs
 * emplacements. On ne cherche pas l'exactitude comptable — on cherche à ce
 * qu'un abus ne puisse pas devenir une facture. Avec aucun moyen de paiement
 * enregistré (D-18), le pire cas est l'indisponibilité.
 *
 * Le compteur vit dans l'état passé par l'appelant, ce qui le rend testable
 * sans aucune infrastructure.
 */
export function creerBudget({ max = 100, maintenant = () => Date.now() } = {}) {
  let jour = null;
  let utilise = 0;
  return {
    /** @returns {{ok: boolean, code?: string, restant: number}} */
    consommer() {
      const aujourdhui = new Date(maintenant()).toISOString().slice(0, 10);
      if (jour !== aujourdhui) {
        jour = aujourdhui;
        utilise = 0;
      }
      if (utilise >= max) return { ok: false, code: "quota_journalier", restant: 0 };
      utilise += 1;
      return { ok: true, restant: max - utilise };
    },
    etat() {
      return { jour, utilise, max };
    },
  };
}

export { PASSE };
