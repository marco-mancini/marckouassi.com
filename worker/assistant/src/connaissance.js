/** Lit le fichier de connaissance public produit depuis content/ au build. */
function erreurConnaissance(nom) {
  const erreur = new Error(nom);
  erreur.name = nom;
  return erreur;
}

export async function chargerConnaissancePublique({ env, langue, fetcher = fetch }) {
  if (!env?.CONNAISSANCE_URL || !["fr", "en"].includes(langue)) {
    throw erreurConnaissance("connaissance_non_configuree");
  }
  let adresse;
  try {
    adresse = new URL(`/connaissance.${langue}.json`, env.CONNAISSANCE_URL);
  } catch {
    throw erreurConnaissance("connaissance_url_invalide");
  }
  if (adresse.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(adresse.hostname)) {
    throw erreurConnaissance("connaissance_url_invalide");
  }
  let reponse;
  try {
    reponse = await fetcher(adresse, { signal: AbortSignal.timeout(Number(env.DELAI_CONTEXTE_MS ?? 5000)) });
  } catch {
    throw erreurConnaissance("connaissance_indisponible");
  }
  if (!reponse.ok) throw erreurConnaissance("connaissance_indisponible");
  let connaissance;
  try { connaissance = await reponse.json(); } catch { throw erreurConnaissance("connaissance_invalide"); }
  if (typeof connaissance?.contact?.email !== "string") throw erreurConnaissance("connaissance_invalide");
  return connaissance;
}
