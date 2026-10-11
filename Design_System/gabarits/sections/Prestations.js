import { html, formater } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Volets } from "../../composants/Volets/Volets.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Decouverte } from "../Decouverte/Decouverte.js";
import { credit } from "./commun.js";
import { nombreEnLettres, numero } from "../outils.js";

/**
 * Prestations — les offres en Volets (#199) : la liste à gauche et l'offre
 * ouverte à droite sur grand écran, un accordéon sur téléphone. Chaque offre
 * dit ce qui est livré et porte une seule action, « Parler de ce projet ».
 *
 * Cette action ouvre MarcoS, avec l'offre en question préremplie. Tant que
 * MarcoS n'est pas actif (site.assistant.active, ou pas d'adresse de Worker),
 * elle mène à la section Contact : le bouton ne fait jamais semblant.
 * Aucun prix n'est affiché : décision de Marc du 11 octobre 2026.
 */
export function Prestations({ section, contenu, ctx }) {
  const chemin = `sections.${section.id}`;
  const total = section.offres.length;
  const marcos = Boolean(contenu.site.assistant?.active && ctx.assistantEndpoint);
  const ancreContact = contenu.sections.find((autre) => autre.type === "contact")?.id ?? section.id;

  const elements = section.offres.map((offre, rang) => {
    const titre = ctx.l(offre.titre, `${chemin}.offres.${rang}.titre`);
    const action = marcos
      ? Bouton({
          texte: ctx.t("prestations.parler"), variante: "principal",
          options: { icone: "ouvrir", attributs: { type: "button", "data-modale-ouvrir": "assistant", "aria-haspopup": "dialog", "aria-controls": "assistant", "data-assistant-question": ctx.t("prestations.question", { offre: ctx.c(offre.titre, `${chemin}.offres.${rang}.titre`) }) } },
        })
      : Bouton({ texte: ctx.t("prestations.parler"), variante: "principal", href: `#${ancreContact}`, options: { icone: "ouvrir" } });
    return {
      id: offre.id,
      titre,
      contenu: html`<div class="prestations__offre">
        <p class="prestations__offre-rang">${ctx.t("prestations.offre", { numero: numero(rang), total: numero(total - 1) })}</p>
        <p class="prestations__offre-titre" aria-hidden="true">${titre}</p>
        <p class="prestations__offre-sous">${ctx.t("prestations.livre")}</p>
        <ul class="liste-puces prestations__livrables">${offre.points.map((point, i) => html`<li>${ctx.l(point, `${chemin}.offres.${rang}.points.${i}`)}</li>`)}</ul>
        <div class="prestations__offre-pied">${action}</div>
      </div>`,
    };
  });
  const accroche = ctx.l(section.accroche, `${chemin}.accroche`, (texte) => formater(texte, { nombre: nombreEnLettres(total, ctx, { majuscule: true }) }));

  // « Découvrir » ouvre le parcours immersif (#128), porté par sa question.
  // L'ancre des projets est lue dans les données : aucune route parallèle.
  const ancreProjets = contenu.sections.find((autre) => autre.type === "projets")?.id ?? section.id;
  const parcours = section.parcours
    ? html`<aside class="prestations__invitation ilot-clair" aria-labelledby="${`invitation-${section.id}`}">
        <div class="prestations__invitation-texte"><p class="prestations__invitation-amorce">${ctx.t("prestations.avant")}</p><p class="prestations__invitation-question" id="${`invitation-${section.id}`}">${ctx.c(section.parcours.question, `${chemin}.parcours.question`)}</p></div>
        <div class="prestations__entree">${Bouton({
          texte: ctx.c(section.parcours.action, `${chemin}.parcours.action`),
          variante: "principal",
          options: { icone: "fleche", attributs: { type: "button", "data-decouverte-ouvrir": "", "aria-expanded": "false", "aria-controls": `decouverte-${section.id}` } },
        })}</div>
      </aside>${Decouverte({ parcours: section.parcours, projets: contenu.projets, ctx, chemin: `${chemin}.parcours`, ancreProjets, idSection: section.id })}`
    : "";

  // Même tête que les autres planches : titre, sceau, affirmation or dessous.
  return Planche({
    ton: "olive", id: section.id, classe: "prestations", credit: credit(section, contenu.sections, ctx),
    contenu: html`<div class="savoirfaire__tete prestations__tete">${Titre({ texte: ctx.c(section.titre, `${chemin}.titre`), id: idTitre(section.id), sceau: "petit" })}<div class="projets__accroche"><p class="introduction__accroche texte-affirmation">${accroche}</p><p class="prestations__choisir">${ctx.t("prestations.choisir")}</p></div></div>${Volets({ elements, etiquette: ctx.t("prestations.offres"), id: `offre-${section.id}` })}${parcours}`,
  });
}
