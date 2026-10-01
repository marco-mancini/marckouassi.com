import { html, attributs, classes, brut } from "../../fondations/rendu.js";

/**
 * Pile — empilement vertical, ou rangée horizontale qui se replie.
 *
 * @param {object} p
 * @param {Array} p.elements
 * @param {"colonne"|"ligne"} [p.direction]
 * @param {string} [p.espace]                              valeur de jeton
 * @param {"debut"|"centre"|"fin"|"ecarte"} [p.alignement]
 * @param {string} [p.balise]
 */
export function Pile({ elements, direction = "colonne", espace = "var(--space-4)", alignement = "debut", balise = "div" }) {
  const b = brut(balise);
  return html`<${b}${attributs({ class: classes("pile", `pile--${direction}`, `pile--${alignement}`), style: `--pile-espace: ${espace}` })}>${elements}</${b}>`;
}
