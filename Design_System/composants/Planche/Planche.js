import { html, attributs, classes } from "../../fondations/rendu.js";

/** Identifiant du titre d'une planche : la planche s'annonce par lui. */
export function idTitre(id) {
  return id ? `titre-${id}` : null;
}

/**
 * Planche — cadre éditorial autonome, crème ou olive.
 *
 * @param {object} p
 * @param {"creme"|"olive"} [p.ton]   fond de la planche ; « olive » pose le contexte .ilot-olive
 * @param {{rubrique:string, mention?:string, signature?:string}|null} [p.credit]  ligne de crédit
 * @param {string} [p.id]             ancre de la planche ; son titre doit porter idTitre(id)
 * @param {string} [p.classe]         crochet de composition du gabarit (disposition seulement)
 * @param {*} p.contenu               HTML déjà rendu
 */
export function Planche({ ton = "creme", credit = null, id = null, classe = "", contenu }) {
  return html`<section${attributs({ class: classes("planche-scene", classe && `${classe}-scene`), id, "aria-labelledby": idTitre(id) })}><div${attributs({
    class: classes("planche", ton === "olive" && "planche--olive ilot-olive", classe),
    "data-apparition": "douce",
  })}>${credit ? Credit(credit) : ""}${contenu}</div></section>`;
}

function Credit({ rubrique, mention, signature }) {
  const mentionPresente = mention !== undefined && mention !== null && String(mention) !== "";
  return html`<div class="${classes("planche__credit", !mentionPresente && "planche__credit--deux")}"><span>${rubrique}</span>${mentionPresente ? html`<span>${mention}</span>` : ""}${signature ? html`<span>${signature}</span>` : ""}</div>`;
}
