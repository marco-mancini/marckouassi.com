import { html } from "../../fondations/rendu.js";
import { Galerie } from "../../composants/Galerie/Galerie.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Pastille } from "../../composants/Pastille/Pastille.js";
import { media, numero, periodeProjet } from "../outils.js";

/**
 * Projet_carte — la carte d'un projet dans le sommaire.
 * L'entrée est un VRAI lien vers la page du projet : sans JavaScript on
 * y navigue ; avec, l'étude s'ouvre dans la modale partagée.
 *
 * @param {object} p
 * @param {object} p.projet      données du projet
 * @param {number} p.rang        position dans la liste (le numéro affiché en découle)
 * @param {number} p.total       nombre de projets (compteur de l'étude)
 * @param {object} p.ctx         contexte de langue et de page
 */
export function Projet_carte({ projet, rang, total, ctx }) {
  const chemin = `projets.${projet.id}`;
  const titre = ctx.c(projet.titre, `${chemin}.titre`);
  const medias = (projet.medias || []).map((entree, i) => media(ctx, entree, { motifAlt: projet.altImages, rang: i, chemin: `${chemin}.medias.${i}`, cheminMotif: `${chemin}.altImages` }));
  const entrer = Bouton({
    texte: ctx.t("projet.ouvrir", { titre }), variante: "surface", forme: "rond", href: ctx.pageProjet(projet),
    options: { icone: "ouvrir", iconeSeule: true, attributs: { "data-etude": projet.id, "aria-haspopup": "dialog", "data-compteur": ctx.t("projet.compteur", { numero: numero(rang), total: String(total).padStart(2, "0") }) } },
  });
  return html`<article class="projet-carte" data-apparition="bas">${Galerie({ medias, variante: "apercu", superposition: entrer })}<header class="projet-carte__entete">${Pastille({ texte: numero(rang), forme: "rond" })}<div class="projet-carte__nom"><h3 class="projet-carte__titre">${ctx.l(projet.titre, `${chemin}.titre`)}</h3><p class="projet-carte__categorie">${ctx.t("formats.categorieEtPeriode", { categorie: ctx.c(projet.categorie, `${chemin}.categorie`), periode: periodeProjet(projet, ctx) })}</p></div></header></article>`;
}
