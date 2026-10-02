import { html } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Grille } from "../../composants/Grille/Grille.js";
import { Segments } from "../../composants/Segments/Segments.js";
import { Gabarit_Projet } from "../Gabarit_Projet/Gabarit_Projet.js";
import { disciplinesProposees } from "../outils.js";
import { credit } from "./commun.js";

/**
 * Projets — le sommaire : une carte par projet, filtrable par discipline.
 *
 * TOUT VIENT DES DONNÉES. Le catalogue des disciplines est lu dans la
 * section (`sections[sommaire].categories`), le rattachement dans chaque
 * projet (`projets[].categories`). Ni liste de projets, ni liste de
 * disciplines, ni libellé n'existe dans ce fichier : ajouter une discipline
 * ou en retirer une ne demande aucune retouche ici.
 *
 * Le filtre est un ENRICHISSEMENT. Sans JavaScript la page rend les onze
 * projets, et le groupe de filtres n'est même pas écrit : un bouton qui ne
 * fait rien vaut moins que pas de bouton. C'est `Gabarit_Projet` qui le pose
 * au navigateur, à partir du modèle `<template>` rendu ici : le filtrage est
 * un comportement commun à TOUS les projets, il appartient au gabarit central.
 */
export function Projets({ section, contenu, ctx }) {
  const chemin = `sections.${section.id}`;
  const total = contenu.projets.length;
  const disciplines = disciplinesProposees(section.categories, contenu.projets);

  // « Tous » est un ÉTAT DU FILTRE, pas une discipline du contenu : son
  // libellé vient du dictionnaire, pas de content/ (décision du modèle).
  const options = [
    { libelle: ctx.t("projet.filtres.tous"), valeur: "", actif: true },
    ...disciplines.map((d) => ({ libelle: ctx.c(d.libelle, `${chemin}.categories.${d.rang}.libelle`), valeur: d.id, actif: false })),
  ];
  const filtre = disciplines.length
    ? html`<template data-filtres-projets><div class="projets__filtres">${Segments({ options, etiquette: ctx.t("projet.filtres.etiquette"), mode: "boutons", cle: "projets", variante: "nue" })}</div><p class="projets__vide" hidden>${ctx.t("projet.filtres.aucun")}</p></template>`
    : "";

  return Planche({
    ton: "olive", id: section.id, classe: "projets", credit: credit(section, contenu.sections, ctx),
    contenu: html`<div class="projets__tete">${Titre({ echelle: "compacte", texte: ctx.c(section.titre, `${chemin}.titre`), id: idTitre(section.id), sceau: "petit" })}</div>${filtre}${Grille({ elements: contenu.projets.map((projet, rang) => Gabarit_Projet({ projet, ctx, mode: "carte", options: { rang, total } })), espace: ["var(--projets-espace)", "var(--projets-espace-compact)"] })}`,
  });
}
