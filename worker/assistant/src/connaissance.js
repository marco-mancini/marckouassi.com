/**
 * CONNAISSANCE (IA-06) — lecture de la base publiée avec le site, et cache.
 *
 * La base est un fichier public de CDN : aucune clé, aucun identifiant, aucune
 * base de données. C'est la source éditoriale du site, produite au build
 * depuis `content/`.
 *
 * Le cache suit AI_DATA.md §Cache :
 *
 *   | Base de connaissance | 24 h | `connaissance:{version}:{langue}` |
 *   | Version publiée      | 60 s | lecture de l'empreinte du fichier |
 *
 * Une nouvelle publication change la version, donc la clé : **il n'y a pas
 * d'invalidation à gérer**. Si le fichier devient illisible, le Worker sert la
 * dernière base connue si elle existe — une panne de CDN ne doit pas rendre
 * MarcoS muet — et seulement sinon il échoue.
 */

const VINGT_QUATRE_HEURES = 24 * 60 * 60 * 1000;
const SOIXANTE_SECONDES = 60 * 1000;

/** Cache d'isolat. Exporté pour que les tests repartent d'un cache froid. */
const bases = new Map();
let versionConnue = { valeur: null, jusqua: 0 };

export function viderCache() {
  bases.clear();
  versionConnue = { valeur: null, jusqua: 0 };
}

function erreurConnaissance(nom) {
  const erreur = new Error(nom);
  erreur.name = nom;
  return erreur;
}

function adresseDe(base, chemin) {
  let adresse;
  try {
    adresse = new URL(chemin, base);
  } catch {
    throw erreurConnaissance("connaissance_url_invalide");
  }
  if (adresse.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(adresse.hostname)) {
    throw erreurConnaissance("connaissance_url_invalide");
  }
  return adresse;
}

/**
 * Empreinte de la publication, lue dans `version.json` et gardée 60 s.
 *
 * Son absence n'est pas une panne : sans elle on se rabat sur une empreinte
 * neutre, et le cache fonctionne encore — simplement il ne se renouvelle qu'au
 * bout de 24 h au lieu de suivre la publication.
 */
async function lireVersion({ env, fetcher, maintenant }) {
  if (versionConnue.valeur && maintenant() < versionConnue.jusqua) return versionConnue.valeur;
  let valeur = "inconnue";
  try {
    const reponse = await fetcher(adresseDe(env.CONNAISSANCE_URL, "/version.json"), {
      signal: AbortSignal.timeout(Number(env.DELAI_CONTEXTE_MS ?? 5000)),
    });
    if (reponse.ok) {
      const corps = await reponse.json();
      if (typeof corps?.version === "string" && corps.version) valeur = corps.version;
    }
  } catch { /* une version illisible n'est pas une panne : voir plus haut */ }
  versionConnue = { valeur, jusqua: maintenant() + SOIXANTE_SECONDES };
  return valeur;
}

/**
 * Lit la base de la langue demandée, en cache par version.
 *
 * @returns {Promise<object>} la base, enrichie de `_version` (non éditoriale)
 */
export async function chargerConnaissancePublique({ env, langue, fetcher = fetch, maintenant = () => Date.now() }) {
  if (!env?.CONNAISSANCE_URL || !["fr", "en"].includes(langue)) {
    throw erreurConnaissance("connaissance_non_configuree");
  }

  // L'adresse est validée AVANT toute consultation du cache : sans cela, une
  // adresse invalide serait servie depuis une entrée remplie par une adresse
  // saine, et le contrôle de protocole ne vaudrait plus rien.
  const adresse = adresseDe(env.CONNAISSANCE_URL, `/connaissance.${langue}.json`);

  const version = await lireVersion({ env, fetcher, maintenant });
  // La clé porte l'origine : deux sources différentes ne partagent pas un cache.
  const cle = `connaissance:${adresse.origin}:${version}:${langue}`;
  const enCache = bases.get(cle);
  if (enCache && maintenant() < enCache.jusqua) return enCache.base;

  let reponse;
  try {
    reponse = await fetcher(adresse, { signal: AbortSignal.timeout(Number(env.DELAI_CONTEXTE_MS ?? 5000)) });
  } catch {
    return dernierRecours(adresse.origin, langue, erreurConnaissance("connaissance_indisponible"));
  }
  if (!reponse.ok) return dernierRecours(adresse.origin, langue, erreurConnaissance("connaissance_indisponible"));

  let connaissance;
  try {
    connaissance = await reponse.json();
  } catch {
    return dernierRecours(adresse.origin, langue, erreurConnaissance("connaissance_invalide"));
  }
  if (typeof connaissance?.contact?.email !== "string") {
    return dernierRecours(adresse.origin, langue, erreurConnaissance("connaissance_invalide"));
  }

  const base = { ...connaissance, _version: version };
  bases.set(cle, { base, jusqua: maintenant() + VINGT_QUATRE_HEURES });
  return base;
}

/**
 * Dernière base connue de cette langue, quelle que soit sa version.
 *
 * Une panne de CDN ou une publication cassée ne doit pas rendre MarcoS muet si
 * une base saine a déjà été lue. Faute de quoi, l'erreur d'origine remonte.
 */
function dernierRecours(origine, langue, cause) {
  for (const [cle, entree] of [...bases.entries()].reverse()) {
    if (cle.startsWith(`connaissance:${origine}:`) && cle.endsWith(`:${langue}`)) return entree.base;
  }
  throw cause;
}
