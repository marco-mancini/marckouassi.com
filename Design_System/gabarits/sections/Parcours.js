import { html } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Jalon } from "../Jalon/Jalon.js";
import { credit } from "./commun.js";

/** Parcours — titre, accroche, frise des jalons (autant que de données). */
export function Parcours({ section, contenu, ctx }) {
  const chemin = `sections.${section.id}`;
  return Planche({
    id: section.id, classe: "parcours", credit: credit(section, contenu.sections, ctx),
    contenu: html`<div class="parcours__titre">${Titre({ texte: ctx.c(section.titre, `${chemin}.titre`), id: idTitre(section.id) })}</div><p class="parcours__accroche texte-accroche">${ctx.l(section.accroche, `${chemin}.accroche`)}</p><div class="parcours__frise">${section.etapes.map((etape, rang) => Jalon({ etape, chemin: `${chemin}.etapes.${rang}`, ctx }))}</div>`,
  });
}
