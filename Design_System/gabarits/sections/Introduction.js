import { html, brut, echapper } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Media } from "../../composants/Media/Media.js";
import { Carte } from "../../composants/Carte/Carte.js";
import { Grille } from "../../composants/Grille/Grille.js";
import { texteEnrichi } from "../../composants/Accent/Accent.js";
import { credit } from "./commun.js";
import { media, numero } from "../outils.js";

/** Première ligne détachée en capitales (par le style), le reste en texte enrichi. */
function detail(texte) {
  const [premiere, ...suite] = String(texte).split("\n");
  return html`<span class="introduction__ouverture">${brut(echapper(premiere))}</span>${suite.length ? html`<br>${texteEnrichi(suite.join("\n"))}` : ""}`;
}

/** Introduction — titre et sceau, visuel, accroche, détail, frise de la méthode. */
export function Introduction({ section, contenu, ctx }) {
  const chemin = `sections.${section.id}`;
  const etapes = section.methode.etapes.map((etape, rang) => Carte({ rang: numero(rang), libelle: ctx.l(etape, `${chemin}.methode.etapes.${rang}`), balise: "li", options: { liee: true, indice: rang } }));
  return Planche({
    id: section.id, classe: "introduction", credit: credit(section, contenu.sections, ctx),
    contenu: html`<div class="introduction__titre">${Titre({ texte: ctx.c(section.titre, `${chemin}.titre`), id: idTitre(section.id), sceau: "moyen" })}</div><div class="introduction__disposition"><div class="introduction__visuel">${Media({ media: media(ctx, section.image, { chemin: `${chemin}.image` }), cadre: "arrondi", zoom: true })}</div><div class="introduction__recit"><p class="introduction__accroche texte-affirmation">${ctx.l(section.accroche, `${chemin}.accroche`)}</p><p class="introduction__detail texte-detail">${ctx.l(section.detail, `${chemin}.detail`, detail)}</p></div></div><div class="introduction__bas">${Grille({ elements: etapes, colonnes: [4, 2, 2], espace: ["var(--process-column-gap)"], conteneur: { balise: "ol", etiquette: ctx.c(section.methode.etiquette, `${chemin}.methode.etiquette`) } })}</div>`,
  });
}
