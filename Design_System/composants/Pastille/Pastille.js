import { html, attributs, classes } from "../../fondations/rendu.js";

/**
 * Pastille — information courte : période, numéro, référence, prix, statut.
 *
 * @param {object} p
 * @param {string} p.texte
 * @param {"plein"|"contour"|"or"|"clair"|"attention"} [p.variante]
 * @param {"pilule"|"rond"|"bloc"} [p.forme]
 * @param {string|null} [p.etiquette]   nom accessible quand le texte seul ne suffit pas (ex. statut)
 */
export function Pastille({ texte, variante = "plein", forme = "pilule", etiquette = null }) {
  return html`<span${attributs({ class: classes("pastille", `pastille--${variante}`, `pastille--${forme}`), title: etiquette })}>${etiquette ? html`<span class="visually-hidden">${etiquette} : </span>` : ""}${texte}</span>`;
}
