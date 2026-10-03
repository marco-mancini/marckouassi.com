import { html } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Grille } from "../../composants/Grille/Grille.js";
import { Carte } from "../../composants/Carte/Carte.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Pastille } from "../../composants/Pastille/Pastille.js";
import { texteEnrichi } from "../../composants/Accent/Accent.js";
import { Gabarit_Projet } from "../Gabarit_Projet/Gabarit_Projet.js";
import { credit } from "./commun.js";
import { media, numero, projetsDeLaCategorie } from "../outils.js";

function accrocheRealisations(texte) {
  const [principale, suite] = String(texte ?? "").split("\n", 2);
  if (!suite) return html`<div class="projets__accroche"><p class="introduction__accroche texte-affirmation">${principale}</p></div>`;
  return html`<div class="projets__accroche"><p class="introduction__accroche texte-affirmation">${principale}</p><p class="projets__accroche-suite texte-detail">${texteEnrichi(suite)}</p></div>`;
}

/**
 * Réalisations — catalogue d'accueil et pages de catégorie.
 *
 * TOUT VIENT DES DONNÉES. Le catalogue des disciplines est lu dans la
 * section (`sections[sommaire].categories`), le rattachement dans chaque
 * projet (`projets[].categoriePrincipale`). Chaque catégorie possède une
 * page construite à partir du même catalogue et du même gabarit.
 */
export function rendreCategorie({ section, categorie, contenu, ctx, rang, niveauTitre = 1 }) {
  const cheminSection = `sections.${section.id}`;
  const rangCategorie = rang ?? section.categories.findIndex((item) => item.id === categorie.id);
  const cheminCategorie = `${cheminSection}.categories.${rangCategorie}`;
  const projets = projetsDeLaCategorie(contenu.projets, categorie.id);
  const cartes = projets.map((projet, index) => Gabarit_Projet({
    projet, ctx, mode: "carte", options: { rang: index, total: projets.length },
  }));
  const cartesCatalogue = categorie.realisations?.length
    ? Grille({ elements: categorie.realisations.map((realisation, index) => {
      const cheminRealisation = `${cheminCategorie}.realisations.${index}`;
      const visuel = media(ctx, realisation.media, { chemin: `${cheminRealisation}.media` });
      return html`<figure class="categorie-projets__carte-image"><div class="categorie-projets__carte-visuel"><img src="${visuel.src}" alt="${ctx.c(realisation.libelle, `${cheminRealisation}.libelle`)}" loading="lazy" decoding="async"><span class="bouton bouton--surface bouton--rond categorie-projets__carte-fleche" aria-hidden="true"><span class="bouton__icone bouton__icone--ouvrir">↗</span></span></div><figcaption class="categorie-projets__carte-legende projet-carte__entete">${Pastille({ texte: numero(index), variante: "contour", forme: "rond" })}<div class="projet-carte__nom"><h3 class="projet-carte__titre">${ctx.c(realisation.libelle, `${cheminRealisation}.libelle`)}</h3><p class="projet-carte__categorie categorie-projets__carte-sous-titre">${ctx.c(realisation.description, `${cheminRealisation}.description`)}</p></div></figcaption></figure>`;
    }), colonnes: [4, 2, 1], espace: ["var(--projets-espace)", "var(--projets-espace-compact)"] })
    : null;
  return html`<section class="categorie-projets" id="categorie-${categorie.id}" aria-labelledby="titre-${categorie.id}">
    <header class="categorie-projets__entete">
      <div class="categorie-projets__ligne-titre">
        ${Titre({ niveau: niveauTitre, echelle: "document", texte: ctx.c(categorie.libelle, `${cheminCategorie}.libelle`), id: `titre-${categorie.id}` })}
        <p class="categorie-projets__numero">${ctx.t("projet.categories.numero", { numero: numero(rangCategorie) })}</p>
      </div>
      <p class="categorie-projets__sous-titre texte-accroche">${ctx.c(categorie.note, `${cheminCategorie}.note`)}</p>
      <p class="categorie-projets__recit texte-corps">${ctx.c(categorie.recit, `${cheminCategorie}.recit`)}</p>
    </header>
    ${projets.length ? Grille({ elements: cartes, colonnes: [2, 2, 1], espace: ["var(--projets-espace)", "var(--projets-espace-compact)"] }) : cartesCatalogue ?? html`<p class="categorie-projets__vide">${ctx.t("projet.categories.vide")}</p>`}
  </section>`;
}

export function Projets({ section, contenu, ctx }) {
  const chemin = `sections.${section.id}`;
  const categories = section.categories ?? [];
  const accroche = accrocheRealisations(ctx.c(section.accroche, `${chemin}.accroche`));
  const choix = categories.map((categorie, rang) => Carte({
    rang: numero(rang), libelle: ctx.c(categorie.libelle, `${chemin}.categories.${rang}.libelle`),
    note: ctx.c(categorie.note, `${chemin}.categories.${rang}.note`),
    options: { classe: "carte--choix", indice: rang, href: ctx.pageCategorie(categorie) },
  }));
  return Planche({
    ton: "olive", id: section.id, classe: "projets", credit: credit(section, contenu.sections, ctx),
    contenu: html`<div class="savoirfaire__tete projets__tete">${Titre({ texte: ctx.c(section.titre, `${chemin}.titre`), id: idTitre(section.id) })}${accroche}</div><nav class="projets__categories" aria-label="${ctx.t("projet.categories.navigation")}"><div class="projets__choix">${choix}</div></nav>`,
  });
}
