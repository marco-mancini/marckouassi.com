/**
 * VALIDATION DE LA REQUÊTE — tout ce qui se refuse AVANT d'appeler le modèle.
 *
 * L'ordre des contrôles n'est pas décoratif : il va du moins coûteux au plus
 * coûteux, et surtout du plus général au plus précis. On ne lit pas un corps de
 * 16 Ko pour s'apercevoir ensuite que l'origine n'est pas autorisée.
 *
 * Aucun contrôle ici ne consomme de jeton, ne touche au réseau, ni ne coûte un
 * centime. C'est le seul endroit où un abus se paie en microsecondes.
 */
import { erreur } from "./erreurs.js";
import { validerQualification } from "./qualification.js";

/** Liste d'origines autorisées, lue depuis les `vars` (séparateur : virgule). */
export function originesAutorisees(env) {
  return String(env.ORIGINES_AUTORISEES ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

/**
 * Une origine est-elle autorisée ?
 * `http://localhost:*` est accepté comme motif, pour le développement local
 * seulement : le port d'un serveur de développement change à chaque lancement.
 */
export function origineAutorisee(origine, autorisees) {
  if (!origine) return false;
  for (const motif of autorisees) {
    if (motif === origine) return true;
    if (motif.endsWith(":*")) {
      const prefixe = motif.slice(0, -1); // « http://localhost: »
      if (origine.startsWith(prefixe) && /^\d+$/.test(origine.slice(prefixe.length))) return true;
    }
  }
  return false;
}

/** En-têtes CORS d'une origine autorisée. Jamais `*`, et toujours `Vary`. */
export function entetesCors(origine) {
  return {
    "access-control-allow-origin": origine,
    vary: "Origin",
  };
}

/** Réponse à une requête de pré-vol. */
export function reponsePrevol(origine) {
  return new Response(null, {
    status: 204,
    headers: {
      ...entetesCors(origine),
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "access-control-max-age": "600",
    },
  });
}

const LANGUES = new Set(["fr", "en"]);

/**
 * Valide le corps déjà analysé. Retourne `{ ok: true, requete }` ou
 * `{ ok: false, code }`.
 *
 * Le schéma est vérifié CHAMP PAR CHAMP, et tout champ inconnu est refusé :
 * une requête qui porte des clés en trop est soit un bogue du site, soit une
 * sonde. Dans les deux cas on ne devine pas.
 */
export function validerCorps(corps, env) {
  const limiteMessage = Number(env.LIMITE_MESSAGE ?? 500);
  const limiteHistorique = Number(env.LIMITE_HISTORIQUE ?? 2000);
  const maxEchanges = Number(env.MAX_ECHANGES ?? 4);

  if (corps === null || typeof corps !== "object" || Array.isArray(corps)) return { ok: false, code: "requete_invalide" };

  const permises = new Set(["version", "langue", "page", "session", "messages", "qualification"]);
  for (const cle of Object.keys(corps)) if (!permises.has(cle)) return { ok: false, code: "requete_invalide" };

  if (corps.version !== 1) return { ok: false, code: "requete_invalide" };
  if (!LANGUES.has(corps.langue)) return { ok: false, code: "requete_invalide" };
  if (typeof corps.page !== "string" || !corps.page.startsWith("/") || corps.page.length > 200) return { ok: false, code: "requete_invalide" };
  if (typeof corps.session !== "string" || !/^[A-Za-z0-9_-]{8,64}$/.test(corps.session)) return { ok: false, code: "requete_invalide" };
  if (!Array.isArray(corps.messages) || corps.messages.length === 0) return { ok: false, code: "requete_invalide" };

  // Un échange = une question et sa réponse. La suite alterne question, réponse,
  // question… et se TERMINE par une question : c'est celle à laquelle on répond.
  // Donc un nombre IMPAIR de messages. Un nombre pair signifie soit un bogue du
  // site, soit un historique fabriqué pour faire dire au modèle qu'il a déjà
  // répondu quelque chose — on ne devine pas, on refuse.
  if (corps.messages.length % 2 === 0) return { ok: false, code: "requete_invalide" };
  if (corps.messages.length > maxEchanges * 2 + 1) return { ok: false, code: "trop_long" };

  let total = 0;
  for (const [rang, message] of corps.messages.entries()) {
    if (message === null || typeof message !== "object" || Array.isArray(message)) return { ok: false, code: "requete_invalide" };
    for (const cle of Object.keys(message)) if (cle !== "role" && cle !== "contenu") return { ok: false, code: "requete_invalide" };
    if (message.role !== "user" && message.role !== "assistant") return { ok: false, code: "requete_invalide" };
    if (typeof message.contenu !== "string" || message.contenu.trim() === "") return { ok: false, code: "requete_invalide" };
    // Rang pair = question du visiteur, rang impair = réponse précédente.
    // La longueur étant impaire, le dernier rang est pair : une question.
    if (message.role !== (rang % 2 === 0 ? "user" : "assistant")) return { ok: false, code: "requete_invalide" };
    if (message.contenu.length > limiteMessage) return { ok: false, code: "trop_long" };
    total += message.contenu.length;
  }
  if (total > limiteHistorique) return { ok: false, code: "trop_long" };

  let qualification;
  if (Object.hasOwn(corps, "qualification")) {
    const valide = validerQualification(corps.qualification, corps.messages);
    if (!valide.ok) return { ok: false, code: "requete_invalide" };
    qualification = valide;
  }

  return { ok: true, requete: { ...corps, ...(qualification ? { qualification } : {}) } };
}

/**
 * Valide la requête HTTP entière. Ne lit le corps que si tout le reste passe.
 * @returns {Promise<{ok: true, requete: object, origine: string} | {ok: false, reponse: Response}>}
 */
export async function validerRequete(request, env) {
  const origine = request.headers.get("origin");
  const autorisees = originesAutorisees(env);

  // 1. Origine. En premier : elle ne coûte rien à vérifier, et une origine
  //    étrangère n'a pas à apprendre quoi que ce soit de notre schéma.
  if (!origineAutorisee(origine, autorisees)) return { ok: false, reponse: erreur("origine_refusee") };
  const cors = entetesCors(origine);

  // 2. Pré-vol.
  if (request.method === "OPTIONS") return { ok: false, reponse: reponsePrevol(origine) };

  // 3. Méthode.
  if (request.method !== "POST") return { ok: false, reponse: erreur("requete_invalide", { entetes: { ...cors, allow: "POST, OPTIONS" } }) };

  // 4. Type de contenu.
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) return { ok: false, reponse: erreur("requete_invalide", { entetes: cors }) };

  // 5. Taille annoncée. `content-length` peut mentir ou manquer : la taille
  //    réelle est revérifiée après lecture, juste en dessous.
  const maxOctets = Number(env.MAX_OCTETS ?? 16384);
  const annoncee = Number(request.headers.get("content-length") ?? 0);
  if (annoncee > maxOctets) return { ok: false, reponse: erreur("trop_long", { entetes: cors }) };

  // 6. Corps.
  const brut = await request.text();
  if (brut.length > maxOctets) return { ok: false, reponse: erreur("trop_long", { entetes: cors }) };

  let corps;
  try {
    corps = JSON.parse(brut);
  } catch {
    return { ok: false, reponse: erreur("requete_invalide", { entetes: cors }) };
  }

  // 7. Schéma.
  const valide = validerCorps(corps, env);
  if (!valide.ok) return { ok: false, reponse: erreur(valide.code, { entetes: cors }) };

  return { ok: true, requete: valide.requete, origine };
}
