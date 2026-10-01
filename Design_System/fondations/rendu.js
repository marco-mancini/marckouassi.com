/**
 * RENDU — socle des fonctions de rendu du Design System.
 *
 * Chaque composant exporte une fonction pure : données → HTML. Ces
 * fonctions tournent à l'identique dans le build (Node) et dans
 * l'aperçu du back-office (navigateur). D'où les règles de ce module :
 * aucune dépendance, aucun accès au DOM, aucun texte.
 *
 * Toute valeur interpolée dans `html` est échappée, sauf si elle est
 * elle-même le résultat d'un `html` ou d'un `brut` : on ne peut pas
 * injecter du HTML par accident en passant une donnée.
 */

/** Fragment HTML déjà sûr. */
export class Html {
  constructor(valeur) { this.valeur = valeur; }
  toString() { return this.valeur; }
}

/** Marque une chaîne comme HTML de confiance. Réservé au code, jamais aux données. */
export function brut(valeur) {
  return new Html(String(valeur ?? ""));
}

const ENTITES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function echapper(valeur) {
  return String(valeur).replace(/[&<>"']/g, (c) => ENTITES[c]);
}

function convertir(valeur) {
  if (valeur === null || valeur === undefined || valeur === false) return "";
  if (valeur instanceof Html) return valeur.valeur;
  if (Array.isArray(valeur)) return valeur.map(convertir).join("");
  return echapper(valeur);
}

/** Gabarit étiqueté : html`<p>${texte}</p>` échappe `texte`. */
export function html(parties, ...valeurs) {
  let sortie = parties[0];
  for (let i = 0; i < valeurs.length; i++) sortie += convertir(valeurs[i]) + parties[i + 1];
  return new Html(sortie);
}

/**
 * Attributs HTML à partir d'un objet. `null`, `undefined` et `false`
 * sont omis, `true` donne un attribut booléen.
 */
export function attributs(objet) {
  const sortie = [];
  for (const [nom, valeur] of Object.entries(objet)) {
    if (valeur === null || valeur === undefined || valeur === false) continue;
    sortie.push(valeur === true ? ` ${nom}` : ` ${nom}="${echapper(valeur)}"`);
  }
  return new Html(sortie.join(""));
}

/** Liste de classes, valeurs vides ignorées. */
export function classes(...liste) {
  return liste.flat().filter(Boolean).join(" ");
}

/** 3 → "03". Numérotation calculée, jamais écrite à la main. */
export function deuxChiffres(nombre) {
  return String(nombre).padStart(2, "0");
}

/** Identifiant stable dérivé d'un préfixe et d'une clé. */
export function identifiant(prefixe, cle) {
  return `${prefixe}-${String(cle).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

/**
 * Remplit un modèle du dictionnaire : formater("Monter {nom}", { nom: "FIFA" }).
 * Une variable absente reste visible entre accolades, pour être repérée.
 */
export function formater(modele, valeurs = {}) {
  return String(modele ?? "").replace(/\{(\w+)\}/g, (tout, cle) => (cle in valeurs ? String(valeurs[cle]) : tout));
}
