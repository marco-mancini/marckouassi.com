import { html, formater } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Encart } from "../../composants/Encart/Encart.js";
import { Pastille } from "../../composants/Pastille/Pastille.js";
import { Grille } from "../../composants/Grille/Grille.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Decouverte } from "../Decouverte/Decouverte.js";
import { credit } from "./commun.js";
import { nombreEnLettres } from "../outils.js";

/**
 * Prestations — une prestation est un Encart (ton or ou clair ALTERNÉ
 * par le rang), une liste à puces et une Pastille de prix. Pas de
 * composant « Prestation », pas de classe par prestation.
 * L'accroche peut citer le nombre d'offres : {nombre}, calculé.
 */
export function Prestations({ section, contenu, ctx }) {
  const chemin = `sections.${section.id}`;
  const offres = section.offres.map((offre, rang) => {
    const ton = rang % 2 === 0 ? "or" : "clair";
    return Encart({
      ton, titre: ctx.l(offre.titre, `${chemin}.offres.${rang}.titre`),
      contenu: html`<ul class="liste-puces">${offre.points.map((point, i) => html`<li>${ctx.l(point, `${chemin}.offres.${rang}.points.${i}`)}</li>`)}</ul>`,
      pied: Pastille({ texte: ctx.c(offre.prix, `${chemin}.offres.${rang}.prix`), variante: ton, forme: "bloc" }),
    });
  });
  const accroche = ctx.l(section.accroche, `${chemin}.accroche`, (texte) => formater(texte, { nombre: nombreEnLettres(section.offres.length, ctx, { majuscule: true }) }));

  // « Découvrir » ouvre le parcours immersif (#128). L'ancre des projets est
  // lue dans les données : aucune route parallèle, aucun identifiant en dur.
  const ancreProjets = contenu.sections.find((autre) => autre.type === "projets")?.id ?? section.id;
  const parcours = section.parcours
    ? html`<div class="prestations__entree">${Bouton({
        texte: ctx.c(section.parcours.action, `${chemin}.parcours.action`),
        variante: "principal",
        options: { attributs: { type: "button", "data-decouverte-ouvrir": "", "aria-expanded": "false", "aria-controls": `decouverte-${section.id}` } },
      })}</div>${Decouverte({ parcours: section.parcours, projets: contenu.projets, ctx, chemin: `${chemin}.parcours`, ancreProjets, idSection: section.id })}`
    : "";

  return Planche({
    ton: "olive", id: section.id, classe: "prestations", credit: credit(section, contenu.sections, ctx),
    contenu: html`<div class="prestations__tete">${Titre({ echelle: "affiche", texte: ctx.c(section.titre, `${chemin}.titre`), id: idTitre(section.id) })}<p class="prestations__accroche texte-accroche">${accroche}</p></div>${Grille({ elements: offres, min: "var(--prestations-grid-min)", espace: ["var(--space-6)"] })}${parcours}`,
  });
}
