import { html, attributs, classes, brut } from "../../fondations/rendu.js";

/**
 * Signature — titre en deux registres : une salutation manuscrite qui
 * chevauche deux mots en capitales étroites, le premier doré.
 *
 * @param {object} p
 * @param {1|2} [p.niveau]
 * @param {"couverture"|"section"|"partage"} [p.echelle]  partage : carte de partage, taille fixe
 * @param {{salutation?:string, accent:string, mot:string}} p.textes  sans salutation : les deux mots seuls (carte de partage)
 * @param {string|null} [p.id]
 */
export function Signature({ niveau = 2, echelle = "section", textes, id = null }) {
  const balise = brut(`h${niveau}`);
  return html`<${balise}${attributs({ class: classes("signature", `signature--${echelle}`), id })}>${textes.salutation ? html`<span class="signature__salut">${textes.salutation}</span>` : ""}<span class="signature__mot signature__mot--accent">${textes.accent}</span><span class="signature__mot">${textes.mot}<b class="signature__point" aria-hidden="true">.</b></span></${balise}>`;
}
