/**
 * ERREURS DE L'ENDPOINT — codes stables, SANS TEXTE.
 *
 * Le Worker ne renvoie jamais de phrase au visiteur : seulement un code. Le
 * texte affiché vient du dictionnaire de l'interface
 * (`Design_System/i18n/{fr,en}.json`, clé `assistant.erreurs.<code>`).
 *
 * Pourquoi : un message d'erreur est du contenu. S'il vit dans le Worker, il
 * échappe aux traductions, au CMS et à la relecture — et il faut redéployer un
 * service pour corriger une virgule.
 *
 * Ces codes sont un CONTRAT : l'interface les connaît un par un. En ajouter un
 * demande d'ajouter la clé de dictionnaire correspondante, et un test du dépôt
 * le vérifie.
 */

/** @typedef {"requete_invalide"|"origine_refusee"|"trop_long"|"trop_de_demandes"|"quota_journalier"|"indisponible"|"delai_depasse"} CodeErreur */

/** Code d'erreur → statut HTTP. Un seul endroit, pour qu'ils ne divergent pas. */
export const STATUTS = {
  requete_invalide: 400,
  origine_refusee: 403,
  trop_long: 413,
  trop_de_demandes: 429,
  quota_journalier: 429,
  indisponible: 503,
  delai_depasse: 504,
};

export const CODES = Object.keys(STATUTS);

/**
 * Réponse d'erreur normalisée.
 * @param {CodeErreur} code
 * @param {object} [options]
 * @param {Record<string,string>} [options.entetes]  en-têtes à ajouter (CORS, Retry-After)
 */
export function erreur(code, { entetes = {} } = {}) {
  const statut = STATUTS[code];
  if (!statut) throw new Error(`Code d'erreur inconnu : « ${code} »`);
  return new Response(JSON.stringify({ erreur: code }), {
    status: statut,
    headers: { "content-type": "application/json; charset=utf-8", ...entetes },
  });
}
