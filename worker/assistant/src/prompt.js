/**
 * ASSEMBLAGE DU PROMPT, et traitement de la réponse.
 *
 * Deux surfaces d'attaque vivent ici, et une seule ligne de défense chacune.
 *
 * 1. CE QUE LE VISITEUR ÉCRIT entre dans le prompt. S'il peut fermer une balise,
 *    il peut faire passer son texte pour une consigne. D'où la neutralisation :
 *    `<` et `>` sont remplacés AVANT l'assemblage, pas filtrés après.
 *
 * 2. CE QUE LE MODÈLE ÉCRIT ressort vers le navigateur. S'il invente une
 *    adresse, le visiteur peut cliquer dessus. D'où la règle : seuls les
 *    identifiants PRÉSENTS dans la base deviennent des liens, et toute autre
 *    adresse est retirée du texte.
 *
 * Aucune de ces deux défenses n'est une consigne au modèle : une consigne se
 * contourne, un remplacement de caractères non.
 */
import { rendreConnaissance, rendrePages } from "./connaissance-texte.js";

/** Longueur d'un texte en jetons estimés. Même convention que la documentation. */
export const jetons = (chaine) => Math.round(String(chaine).length / 3.5);

/**
 * Neutralise les chevrons d'un texte de visiteur.
 *
 * On ne retire pas le contenu et on n'échappe pas en entités : on remplace les
 * chevrons par des guillemets simples typographiques. Le sens de la phrase est
 * conservé — « est-ce que <script> compte ? » reste lisible — mais plus aucune
 * balise ne peut être fermée ni ouverte.
 */
export function neutraliser(texte) {
  return String(texte).replaceAll("<", "‹").replaceAll(">", "›");
}

/** Noms de langues écrits dans le prompt, pour le marqueur {{LANGUE}}. */
const NOMS_LANGUE = { fr: "français", en: "anglais" };

/**
 * Assemble le message système et la suite des messages.
 *
 * @param {object} p
 * @param {string} p.modele     texte du prompt, avec ses marqueurs
 * @param {object} p.base       base de connaissance de la langue
 * @param {object} p.requete    requête validée
 * @returns {{systeme: string, messages: Array<{role: string, contenu: string}>}}
 */
export function assembler({ modele, base, requete }) {
  const systeme = String(modele)
    .replace("{{LANGUE}}", NOMS_LANGUE[requete.langue] ?? NOMS_LANGUE.fr)
    .replace("{{PAGES}}", rendrePages(base))
    .replace("{{CONNAISSANCE}}", rendreConnaissance(base));

  const messages = requete.messages.map(({ role, contenu }) => ({
    role,
    // La question du visiteur est TOUJOURS entre balises, et son contenu est
    // neutralisé avant d'y entrer. Les réponses passées de l'assistant ne le
    // sont pas : elles viennent de nous, pas de lui.
    contenu: role === "user" ? `<question>${neutraliser(contenu)}</question>` : String(contenu),
  }));

  return { systeme, messages };
}

/** Taille de l'entrée assemblée, en jetons estimés. */
export function mesurerEntree({ systeme, messages }) {
  return jetons(systeme) + messages.reduce((total, m) => total + jetons(m.contenu), 0);
}

const REFERENCE = /\[\[page:([a-z0-9-]{1,40})\]\]/gi;
// Toute forme d'adresse écrite par le modèle, protocole ou non.
const ADRESSES = /\b(?:https?:\/\/|www\.)\S+/gi;

/**
 * Transforme la réponse brute du modèle en texte sûr et en liens validés.
 *
 * @param {string} brut     texte rendu par le modèle
 * @param {object} base     base de connaissance, pour la liste des pages
 * @returns {{texte: string, liens: Array<{id: string, href: string}>}}
 */
export function extraireLiens(brut, base) {
  const connues = new Map((base.pages ?? []).map((p) => [p.id.toLowerCase(), p.href]));
  const liens = [];

  let texte = String(brut).replace(REFERENCE, (_, id) => {
    const href = connues.get(String(id).toLowerCase());
    // Un identifiant inconnu disparaît, sans laisser de trace de syntaxe : le
    // visiteur n'a pas à lire nos marqueurs, et un lien mort vaut moins que rien.
    if (!href) return "";
    if (!liens.some((l) => l.id === id)) liens.push({ id, href });
    return "";
  });

  // Une adresse écrite par le modèle est retirée. Il n'en a pas besoin : les
  // seuls liens légitimes passent par [[page:…]], et sont déjà validés.
  //
  // La ponctuation finale est RENDUE à la phrase : `\S+` avale le point de
  // « … sur https://exemple.com. », et la phrase perdrait son point.
  texte = texte.replace(ADRESSES, (adresse) => (adresse.match(/[.,;:!?)\]]+$/) ?? [""])[0]);

  // Le retrait laisse des espaces doubles et des espaces avant ponctuation.
  texte = texte
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([,.;:!?…])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { texte, liens };
}
