import { html } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Grille } from "../../composants/Grille/Grille.js";
import { Projet_carte } from "../Projet_carte/Projet_carte.js";
import { credit } from "./commun.js";

/** Projets — le sommaire : une carte par projet, dans l'ordre des données. */
export function Projets({ section, contenu, ctx }) {
  const chemin = `sections.${section.id}`;
  const total = contenu.projets.length;
  return Planche({
    ton: "olive", id: section.id, classe: "projets", credit: credit(section, contenu.sections, ctx),
    contenu: html`<div class="projets__tete">${Titre({ echelle: "compacte", texte: ctx.c(section.titre, `${chemin}.titre`), id: idTitre(section.id), sceau: "petit" })}</div>${Grille({ elements: contenu.projets.map((projet, rang) => Projet_carte({ projet, rang, total, ctx })), espace: ["var(--projets-espace)", "var(--projets-espace-compact)"] })}`,
  });
}
