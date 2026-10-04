import { html, attributs, classes, brut, echapper, Html } from "../../fondations/rendu.js";
import { Sceau } from "../Sceau/Sceau.js";

const ECHELLES_SANS_POINT = new Set(["interface"]);

/**
 * Texte d'un titre : un saut de ligne des données devient <br> ; dans
 * l'échelle « affiche », l'esperluette est évidée. Tout le reste est échappé.
 */
function contenuTitre(texte, echelle) {
  if (texte instanceof Html) return texte;
  const lignes = String(texte ?? "").split("\n").map((ligne) => {
    const sur = echapper(ligne);
    return echelle === "affiche" ? sur.replace(/ &amp; /g, ' <b class="titre__esperluette">&amp;</b> ') : sur;
  });
  return brut(lignes.join("<br>"));
}

/**
 * Titre — titre de planche ou d'écran, avec son point doré et, en
 * option, le sceau à l'opposé.
 *
 * @param {object} p
 * @param {1|2|3} [p.niveau]
 * @param {"section"|"appel"|"affiche"|"etude"|"document"|"interface"} [p.echelle]
 * @param {string|Html} p.texte
 * @param {string|null} [p.id]
 * @param {false|"moyen"|"petit"} [p.sceau]
 */
export function Titre({ niveau = 2, echelle = "section", texte, id = null, sceau = false }) {
  const balise = `h${niveau}`;
  const point = ECHELLES_SANS_POINT.has(echelle) ? "" : brut('<b class="titre__point" aria-hidden="true">.</b>');
  const titre = html`<${brut(balise)}${attributs({ class: classes("titre", `titre--${echelle}`), id })}>${contenuTitre(texte, echelle)}${point}</${brut(balise)}>`;
  if (!sceau) return titre;
  return html`<div class="titre-ligne">${titre}<span class="titre-ligne__sceau">${Sceau({ taille: sceau })}</span></div>`;
}
