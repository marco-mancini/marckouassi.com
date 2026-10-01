import { html, brut, classes } from "../../fondations/rendu.js";

/**
 * Encart — boîte titrée : un en-tête, un corps, un pied optionnel.
 * Prestation, carte de CV, section de CV, section de formulaire du
 * back-office : même structure, quatre tons.
 *
 * @param {object} p
 * @param {string} p.titre
 * @param {*} p.contenu
 * @param {*} [p.pied]                       ex. Pastille de prix, chevauchant le bas
 * @param {"or"|"clair"|"contour"|"bandeau"} [p.ton]
 * @param {2|3|4} [p.niveau]
 */
export function Encart({ titre, contenu, pied = null, ton = "contour", niveau = 3 }) {
  const balise = brut(`h${niveau}`);
  return html`<section class="${classes("encart", `encart--${ton}`)}"><${balise} class="encart__titre">${titre}</${balise}><div class="encart__corps">${contenu}</div>${pied ? html`<div class="encart__pied">${pied}</div>` : ""}</section>`;
}
