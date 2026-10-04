import { html, attributs } from "../../fondations/rendu.js";
import { Galerie } from "../../composants/Galerie/Galerie.js";
import { Pastille } from "../../composants/Pastille/Pastille.js";

/**
 * Projet_carte — LA VUE CARTE d'un projet, et rien d'autre : l'aperçu en
 * galerie, le numéro, le titre, la catégorie et la période.
 *
 * Elle ne lit plus l'enregistrement du projet. Elle reçoit la VUE résolue par
 * `Gabarit_Projet` : même titre, mêmes médias, même contrat d'ouverture que
 * l'étude et la page. Tout ce qui est commun aux projets est en amont ; ici
 * ne reste que la disposition propre à une carte.
 *
 * L'entrée est un VRAI lien vers la page du projet : sans JavaScript on y
 * navigue ; avec, l'étude s'ouvre dans la modale partagée.
 *
 * @param {object} p
 * @param {object} p.vue   sortie de `vueProjet` (Gabarit_Projet)
 * @param {object} p.ctx   contexte de langue et de page
 */
export function Projet_carte({ vue, ctx }) {
  return html`<a${attributs({
    class: "projet-carte",
    href: vue.lien,
    "aria-label": ctx.t("projet.ouvrir", { titre: vue.titre }),
    ...vue.ouverture,
    "data-apparition": "bas",
    "data-categorie": vue.categoriePrincipale,
  })}>${Galerie({ medias: vue.medias, variante: "apercu" })}<header class="projet-carte__entete">${Pastille({ texte: vue.numero, forme: "rond" })}<div class="projet-carte__nom"><h3 class="projet-carte__titre">${vue.titreHtml}</h3><p class="projet-carte__categorie">${ctx.t("formats.categorieEtPeriode", { categorie: vue.categorie, periode: vue.periode })}</p></div></header></a>`;
}
