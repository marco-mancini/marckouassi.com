import { html, attributs, classes, brut } from "../../fondations/rendu.js";

/**
 * Carte — jalon numéroté : un point, un libellé, une note optionnelle,
 * le rang en filigrane.
 *
 * @param {object} p
 * @param {string} p.rang                   calculé par le gabarit ("01"…)
 * @param {string} p.libelle
 * @param {string|null} [p.note]
 * @param {"article"|"li"|"div"|"button"} [p.balise]
 * @param {object} [p.options]
 * @param {"span"|"h3"} [p.options.baliseLibelle]
 * @param {string} [p.options.href]          carte entièrement cliquable
 * @param {boolean} [p.options.liee]         flèche vers la carte suivante
 * @param {number} [p.options.indice]        rang d'apparition (décalage)
 * @param {string} [p.options.classe]         classe complémentaire
 * @param {object} [p.options.attributs]      attributs complémentaires de la racine
 */
export function Carte({ rang, libelle, note = null, balise = "article", options = {} }) {
  const { baliseLibelle = "span", href = null, liee = false, indice = 0, classe = "", attributs: attributsExtra = {} } = options;
  const racine = brut(href ? "a" : balise);
  const titre = brut(baliseLibelle);
  return html`<${racine}${attributs({
    ...attributsExtra,
    class: classes("carte", liee && "carte--liee", href && "carte--lien", classe),
    href,
    "data-rang": rang,
    "data-apparition": "bas",
    style: `--i: ${Number(indice) || 0}`,
  })}><span class="carte__reflet" aria-hidden="true"></span><span class="carte__point" aria-hidden="true"></span><${titre} class="carte__libelle">${libelle}</${titre}>${note ? html`<p class="carte__note">${note}</p>` : ""}</${racine}>`;
}
