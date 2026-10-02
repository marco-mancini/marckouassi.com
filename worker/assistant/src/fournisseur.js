/**
 * FOURNISSEUR — interface unique, et un fournisseur SIMULÉ pour développer.
 *
 * Il n'y a qu'un fournisseur réel (Mistral), décision D-2 de Marc : pas de
 * second, pas de matrice de repli, pas de disjoncteur, pas de carte bancaire.
 * L'interface reste nommée « fournisseur » parce qu'elle sépare le Worker du
 * service, pas parce qu'il y en aurait plusieurs.
 *
 * Le fournisseur simulé n'est pas un décor : il COMPTE SES APPELS. C'est ce qui
 * permet de prouver qu'une requête refusée n'a coûté aucun jeton — une
 * garantie qu'on ne peut pas obtenir en lisant le code.
 *
 * Le vrai fournisseur Mistral arrive en phase IA-05, avec la clé de Marc.
 */

/**
 * @typedef {object} Reponse
 * @property {string} texte          réponse du modèle, en texte
 * @property {number} [jetonsEntree]
 * @property {number} [jetonsSortie]
 */

/**
 * @typedef {object} Fournisseur
 * @property {(p: {systeme: string, messages: Array<{role: string, contenu: string}>, maxJetons: number, signal?: AbortSignal}) => Promise<Reponse>} repondre
 * @property {number} appels
 */

/**
 * Fournisseur simulé.
 *
 * @param {object} [options]
 * @param {(p: object) => Reponse|Promise<Reponse>} [options.reponse]  réponse à rendre
 * @param {Error} [options.erreur]  erreur à lever, pour éprouver les pannes
 * @returns {Fournisseur}
 */
export function fournisseurSimule({ reponse, erreur } = {}) {
  const simule = {
    appels: 0,
    derniereDemande: null,
    async repondre(demande) {
      simule.appels += 1;
      simule.derniereDemande = demande;
      if (erreur) throw erreur;
      if (typeof reponse === "function") return reponse(demande);
      return reponse ?? { texte: "Réponse simulée.", jetonsEntree: 0, jetonsSortie: 0 };
    },
  };
  return simule;
}
