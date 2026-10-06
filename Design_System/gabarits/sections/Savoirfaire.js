import { html } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Galerie } from "../../composants/Galerie/Galerie.js";
import { Carte } from "../../composants/Carte/Carte.js";
import { Grille } from "../../composants/Grille/Grille.js";
import { texteEnrichi } from "../../composants/Accent/Accent.js";
import { credit } from "./commun.js";
import { media, numero } from "../outils.js";

/** Savoir-faire — titre, promesse en trois temps, bande d'images, six domaines. */
export function Savoirfaire({ section, contenu, ctx }) {
  const chemin = `sections.${section.id}`;
  const domaines = section.domaines.map((domaine, rang) => Carte({
    rang: numero(rang), libelle: ctx.l(domaine.libelle, `${chemin}.domaines.${rang}.libelle`), note: ctx.l(domaine.note, `${chemin}.domaines.${rang}.note`),
    options: { baliseLibelle: "h3", indice: rang },
  }));
  return Planche({
    ton: "olive", id: section.id, classe: "savoirfaire", credit: credit(section, contenu.sections, ctx),
    contenu: html`<div class="savoirfaire__tete">${Titre({ texte: ctx.c(section.titre, `${chemin}.titre`), id: idTitre(section.id) })}<p class="savoirfaire__promesse texte-accroche">${section.promesse.map((temps, rang) => html`<span>${ctx.l(temps, `${chemin}.promesse.${rang}`, (t) => texteEnrichi(t, { grand: true }))}</span>`)}</p></div><div class="savoirfaire__images">${Galerie({ variante: "bande", medias: section.images.map((image, rang) => media(ctx, image, { chemin: `${chemin}.images.${rang}` })) })}</div>${Grille({ elements: domaines, colonnes: [3, 2, 2], espace: ["var(--space-5)", "var(--space-3)"] })}`,
  });
}
