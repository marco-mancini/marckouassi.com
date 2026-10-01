import { html, attributs, classes } from "../../fondations/rendu.js";
import { Media } from "../Media/Media.js";

const APERCU_MAX = 6;

const REGLAGES = {
  apercu: { cadre: "vignette", ajustement: "recadrer", zoom: true },
  detail: { cadre: "detail", ajustement: "contenir", zoom: false },
  bande: { cadre: "passe-partout", ajustement: "recadrer", zoom: false },
};

/**
 * Galerie — grille de médias, le premier mis en avant.
 *
 * @param {object} p
 * @param {Array} p.medias                               objets média (voir Media)
 * @param {"apercu"|"detail"|"bande"} [p.variante]
 * @param {string|null} [p.etiquette]                    nom accessible du groupe
 * @param {*} [p.superposition]                          action posée sur la galerie (ex. ouvrir)
 */
export function Galerie({ medias = [], variante = "apercu", etiquette = null, superposition = null }) {
  const liste = variante === "apercu" ? medias.slice(0, APERCU_MAX) : medias;
  const reglage = REGLAGES[variante];
  return html`<div${attributs({ class: classes("galerie", `galerie--${variante}`), "data-nombre": liste.length, role: etiquette ? "group" : null, "aria-label": etiquette })}>${liste.map((media, rang) =>
    html`<div class="${classes("galerie__element", rang === 0 && "galerie__element--principal", rang === 1 && "galerie__element--second")}">${Media({ media, ...reglage })}</div>`
  )}${superposition ? html`<div class="galerie__superposition">${superposition}</div>` : ""}</div>`;
}
