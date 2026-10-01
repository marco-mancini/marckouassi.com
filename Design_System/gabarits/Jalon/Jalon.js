import { html } from "../../fondations/rendu.js";
import { Pastille } from "../../composants/Pastille/Pastille.js";
import { plage } from "../outils.js";

/**
 * Jalon — une étape du parcours : période, intitulé, récit, lieu.
 *
 * @param {object} p
 * @param {object} p.etape   { annees:{debut,fin}, titre, texte, lieu }
 * @param {string} p.chemin  chemin des données (« sections.parcours.etapes.0 ») : désigne les champs à traduire
 * @param {object} p.ctx
 */
export function Jalon({ etape, chemin, ctx }) {
  return html`<article class="jalon">${Pastille({ texte: plage(etape.annees, ctx, "plageParcours") })}<div class="jalon__texte"><h3 class="jalon__titre">${ctx.l(etape.titre, `${chemin}.titre`)}</h3><p class="jalon__recit">${ctx.l(etape.texte, `${chemin}.texte`)}</p></div><span class="jalon__lieu texte-etiquette">${ctx.l(etape.lieu, `${chemin}.lieu`)}</span></article>`;
}
