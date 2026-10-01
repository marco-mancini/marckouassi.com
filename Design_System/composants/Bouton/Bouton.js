import { html, attributs, classes } from "../../fondations/rendu.js";

/**
 * Icônes typographiques : présentation, pas contenu. Elles sont toujours
 * masquées des lecteurs d'écran ; le sens est porté par le texte.
 */
const ICONES = { externe: "↗", bas: "↓", haut: "↑", retour: "←", fermer: "×", ouvrir: "↗", menu: "" };
const ICONES_AVANT = new Set(["retour"]);

/**
 * Bouton — toute action du site et du back-office, bouton ou lien.
 *
 * @param {object} p
 * @param {string} p.texte                     libellé (du dictionnaire ou du contenu)
 * @param {"principal"|"contour"|"filet"|"texte"|"lien"|"nu"|"surface"} [p.variante]
 *        texte : lien souligné dans le flux ; lien : souligné sur une ligne de 44 px ;
 *        nu : sans soulignement, sur une ligne de 44 px
 * @param {"pilule"|"rond"|"libre"} [p.forme]
 * @param {string|null} [p.href]               présent : rend un lien
 * @param {object} [p.options]
 * @param {keyof ICONES} [p.options.icone]
 * @param {boolean} [p.options.iconeSeule]     texte réservé aux lecteurs d'écran
 * @param {"chargement"|"desactive"|null} [p.options.etat]
 * @param {"grand"|null} [p.options.taille]
 * @param {object} [p.options.attributs]       attributs techniques (type, aria-*, data-*, download…)
 */
export function Bouton({ texte, variante = "contour", forme = "pilule", href = null, options = {} }) {
  const { icone = null, iconeSeule = false, etat = null, taille = null, attributs: autres = {} } = options;
  const glyphe = icone ? html`<span class="${classes("bouton__icone", `bouton__icone--${icone}`)}" aria-hidden="true">${ICONES[icone] ?? ""}</span>` : "";
  const libelle = iconeSeule ? html`<span class="visually-hidden">${texte}</span>` : html`<span class="bouton__texte">${texte}</span>`;
  // Liens texte et nu : une vraie espace entre le mot et sa flèche, comme dans
  // le texte d'origine (« Le portfolio ↓ ») ; le soulignement court sous les deux.
  const lien = variante === "texte" || variante === "lien" || variante === "nu";
  const espace = lien && glyphe && !iconeSeule ? " " : "";
  const suite = icone && ICONES_AVANT.has(icone) ? html`${glyphe}${espace}${libelle}` : html`${libelle}${espace}${glyphe}`;
  const interieur = variante === "nu" || variante === "lien" ? html`<span class="bouton__ligne">${suite}</span>` : suite;
  // Un lien n'a pas de forme : il suit la ligne.
  const classe = classes("bouton", `bouton--${variante}`, `bouton--${lien ? "libre" : forme}`, taille && `bouton--${taille}`, icone === "menu" && "bouton--menu");
  const occupe = etat === "chargement" ? "true" : null;
  const desactive = etat === "desactive" || etat === "chargement";
  if (href) {
    return html`<a${attributs({ class: classe, href: desactive ? null : href, "aria-disabled": desactive ? "true" : null, "aria-busy": occupe, ...autres })}>${interieur}</a>`;
  }
  return html`<button${attributs({ type: "button", class: classe, disabled: etat === "desactive", "aria-disabled": etat === "chargement" ? "true" : null, "aria-busy": occupe, ...autres })}>${icone === "menu" ? html`<span class="bouton__barres" aria-hidden="true"><span></span><span></span></span>` : ""}${interieur}</button>`;
}
