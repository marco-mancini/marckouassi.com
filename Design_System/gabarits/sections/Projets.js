import { Message } from "../../composants/Message/Message.js";
import { html } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Grille } from "../../composants/Grille/Grille.js";
import { Carte } from "../../composants/Carte/Carte.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Pastille } from "../../composants/Pastille/Pastille.js";
import { Galerie } from "../../composants/Galerie/Galerie.js";
import { Media } from "../../composants/Media/Media.js";
import { texteEnrichi } from "../../composants/Accent/Accent.js";
import { Gabarit_Projet } from "../Gabarit_Projet/Gabarit_Projet.js";
import { credit } from "./commun.js";
import { reveler } from "../../composants/Apparition/Apparition.js";
import { media, numero, projetsDeLaCategorie } from "../outils.js";

/** Réaligne la catégorie choisie après que l'état :target a masqué l'accueil. */
export function activerNavigationCategories(racine = document) {
  let categorieOuverte = false;
  const aligner = (element) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => element.scrollIntoView({ block: "start" })));
  const alignerCategorie = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const cible = racine.getElementById(id);
    const categorieActive = cible?.classList.contains("categorie-projets") ? cible : null;
    const onQuitteUneCategorie = categorieOuverte && !categorieActive;
    categorieOuverte = Boolean(categorieActive);
    const page = racine.getElementById("contenu");
    page?.classList.toggle("page-planches--categorie", Boolean(categorieActive));
    page?.querySelectorAll(":scope > .planche-scene").forEach((scene) => {
      scene.classList.toggle("planche-scene--categorie-active", Boolean(categorieActive && scene.contains(categorieActive)));
    });
    // Les cartes d'un bloc replié ne sont jamais entrées dans le champ : leur
    // observateur d'apparition ne s'est pas déclenché et elles resteraient à
    // l'opacité 0 une fois le bloc ouvert. On les révèle à l'ouverture.
    if (categorieActive) {
      categorieActive.querySelectorAll("[data-apparition]").forEach(reveler);
      aligner(categorieActive);
    } else if (onQuitteUneCategorie && cible) {
      // En quittant une catégorie, les planches masquées reviennent d'un coup :
      // le saut d'ancre du navigateur a mesuré une page qui n'existe plus, et
      // l'on se retrouve en haut du site. On réaligne sur la cible retrouvée —
      // les réalisations, d'où la catégorie avait été ouverte.
      aligner(cible);
    }
  };
  window.addEventListener("hashchange", alignerCategorie);
  // Le retour suit son propre lien, qui pointe vers la section. L'ancien
  // raccourci par history.back() rendait la sortie imprévisible : il ramenait
  // à la dernière ancre visitée — l'introduction, par exemple — et non aux
  // réalisations d'où la catégorie avait été ouverte.
  alignerCategorie();
}

function accrocheRealisations(texte) {
  const [principale, suite] = String(texte ?? "").split("\n", 2);
  if (!suite) return html`<div class="projets__accroche"><p class="introduction__accroche texte-affirmation">${principale}</p></div>`;
  return html`<div class="projets__accroche"><p class="introduction__accroche texte-affirmation">${principale}</p><p class="projets__accroche-suite texte-detail">${texteEnrichi(suite)}</p></div>`;
}

/** Déclinaisons propres aux fiches Logotype, toutes pilotées par le contenu. */
function plancheLogotype(presentation, medias, libelle, ctx) {
  const logo = media(ctx, presentation.logo);
  const isotype = media(ctx, presentation.isotype);
  const couleurs = presentation.palette ?? [];
  const typographies = presentation.typographies ?? [];
  const classePalette = presentation.variant;
  return html`<div class="logotype__planche logotype__planche--${classePalette}">
    <section class="logotype__panneau logotype__panneau--logo"><h4 class="logotype__libelle">${ctx.t("projet.logotype.logo")}</h4><div class="logotype__visuel">${Media({ media: logo, ajustement: "contenir" })}</div></section>
    <section class="logotype__panneau logotype__panneau--isotype"><h4 class="logotype__libelle">${ctx.t("projet.logotype.isotype")}</h4><div class="logotype__visuel">${Media({ media: isotype, ajustement: "contenir" })}</div></section>
    <section class="logotype__panneau logotype__panneau--palette"><h4 class="logotype__libelle">${ctx.t("projet.logotype.palette")}</h4><div class="logotype__couleurs">${couleurs.map((couleur, index) => html`<div class="logotype__couleur"><span class="logotype__pastille-couleur logotype__pastille-couleur--${index + 1}" aria-hidden="true"></span><p class="logotype__code-couleur">${couleur}</p></div>`)}</div></section>
    <section class="logotype__panneau logotype__panneau--typo"><h4 class="logotype__libelle">${ctx.t("projet.logotype.typographie")}</h4><div class="logotype__typographies">${typographies.map((nom) => html`<p>${nom}</p>`)}</div></section>
    <div class="logotype__mockups">${medias.map((m) => html`<div class="logotype__mockup">${Media({ media: m, ajustement: "recadrer", cadre: "vignette" })}</div>`)}</div>
  </div>`;
}

/**
 * Réalisations — une page d'accueil unique, découpée par catégorie.
 *
 * TOUT VIENT DES DONNÉES. Le catalogue des disciplines est lu dans la
 * section (`sections[sommaire].categories`), le rattachement dans chaque
 * projet (`projets[].categoriePrincipale`). Chaque catégorie conserve sa
 * propre grille, mais toutes restent dans cette page.
 */
export function Projets({ section, contenu, ctx }) {
  const chemin = `sections.${section.id}`;
  const categories = section.categories ?? [];
  const accroche = accrocheRealisations(ctx.c(section.accroche, `${chemin}.accroche`));
  const retour = Bouton({ texte: ctx.t("projet.categories.retour"), variante: "surface", forme: "rond", href: `#${section.id}`, options: { icone: "retour", iconeSeule: true, taille: "grand", attributs: { "data-categorie-retour": "" } } });
  const choix = categories.map((d, rang) => Carte({
    rang: numero(rang), libelle: ctx.c(d.libelle, `${chemin}.categories.${rang}.libelle`),
    note: ctx.c(d.note, `${chemin}.categories.${rang}.note`),
    options: { classe: "carte--choix", indice: rang, href: `#categorie-${d.id}` },
  }));
  const blocs = categories.map((categorie, rang) => {
    const cheminCategorie = `${chemin}.categories.${rang}`;
    const projets = projetsDeLaCategorie(contenu.projets, categorie.id);
    const cartes = projets.map((projet, index) => Gabarit_Projet({
      projet, ctx, mode: "carte", options: { rang: index, total: projets.length },
    }));
    // Une catégorie peut porter des réalisations isolées plutôt que des projets
    // complets. C'est la DONNÉE qui le dit, jamais un identifiant écrit ici :
    // le critère de clôture de #123 interdit toute donnée métier en dur.
    const cartesRealisations = (categorie.realisations ?? []).length
      ? Grille({ elements: categorie.realisations.map((realisation, index) => {
        const cheminRealisation = `${cheminCategorie}.realisations.${index}`;
        const libelle = ctx.c(realisation.libelle, `${cheminRealisation}.libelle`);
        const entrees = realisation.medias ?? (realisation.media ? [realisation.media] : []);
        const medias = entrees.map((entree, rang) => media(ctx, entree, {
          motifAlt: `${libelle} — visuel {numero}`,
          rang,
          chemin: `${cheminRealisation}.medias.${rang}`,
          cheminMotif: `${cheminRealisation}.libelle`,
        }));
        const contenuVisuel = realisation.presentation
          ? plancheLogotype(realisation.presentation, medias, libelle, ctx)
          : html`<div class="categorie-projets__carte-visuel">${Galerie({ medias, variante: "apercu", etiquette: libelle })}</div>`;
        return html`<article class="categorie-projets__carte-image${medias.length > 1 ? " categorie-projets__carte-image--composition" : ""}${realisation.presentation ? " categorie-projets__carte-image--logotype" : ""}">${contenuVisuel}<div class="categorie-projets__carte-legende projet-carte__entete">${Pastille({ texte: ctx.t("formats.numeroProjet", { numero: numero(index) }), variante: "contour" })}<div class="projet-carte__nom"><h3 class="projet-carte__titre">${libelle}</h3><p class="projet-carte__categorie categorie-projets__carte-sous-titre">${ctx.c(realisation.description, `${cheminRealisation}.description`)}</p></div></div></article>`;
      }), colonnes: [4, 2, 1], espace: ["var(--projets-espace)", "var(--projets-espace-compact)"] })
      : null;
    return html`<section class="categorie-projets" id="categorie-${categorie.id}" aria-labelledby="titre-${categorie.id}">
      <header class="categorie-projets__entete">
        <div class="categorie-projets__ligne-titre">
          ${Titre({ niveau: 2, echelle: "document", texte: ctx.c(categorie.libelle, `${cheminCategorie}.libelle`), id: `titre-${categorie.id}` })}
          <p class="categorie-projets__numero">${ctx.t("projet.categories.numero", { numero: numero(rang) })}</p>
        </div>
        <p class="categorie-projets__sous-titre texte-accroche">${ctx.c(categorie.note, `${cheminCategorie}.note`)}</p>
        <p class="categorie-projets__recit texte-corps">${ctx.c(categorie.recit, `${cheminCategorie}.recit`)}</p>
      </header>
      ${projets.length ? Grille({ elements: cartes, colonnes: [1, 1, 1], espace: ["var(--projets-espace)", "var(--projets-espace-compact)"] }) : cartesRealisations ?? Message({ type: "vide", titre: ctx.t("projet.categories.numero", { numero: numero(rang) }), texte: ctx.t("projet.categories.vide"), mode: { sceau: "vide" } })}
    </section>`;
  });

  return Planche({
    ton: "olive", id: section.id, classe: "projets", credit: { ...credit(section, contenu.sections, ctx), avantRubrique: retour },
    contenu: html`<div class="savoirfaire__tete projets__tete">${Titre({ texte: ctx.c(section.titre, `${chemin}.titre`), id: idTitre(section.id), sceau: "petit" })}${accroche}</div><nav class="projets__categories" aria-label="${ctx.t("projet.categories.navigation")}"><div class="projets__choix">${choix}</div></nav><div class="projets__groupes">${blocs}</div>`,
  });
}
