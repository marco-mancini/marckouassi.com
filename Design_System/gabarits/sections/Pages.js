/**
 * PAGES — assemblage des pages publiques à partir des sections.
 * Une page = Document + en-tête + planches + surcouches. Les sections
 * sont rendues dans l'ordre et selon la visibilité des données.
 */
import { html } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Encart } from "../../composants/Encart/Encart.js";
import { Grille } from "../../composants/Grille/Grille.js";
import { Pastille } from "../../composants/Pastille/Pastille.js";
import { Media } from "../../composants/Media/Media.js";
import { Segments } from "../../composants/Segments/Segments.js";
import { texteEnrichi } from "../../composants/Accent/Accent.js";
import { Gabarit_Projet, vueProjet, parcours } from "../Gabarit_Projet/Gabarit_Projet.js";
import { Visionneuse } from "../../composants/Galerie/Galerie.js";
import { Intro } from "../Intro/Intro.js";
import { Assistant } from "../Assistant/Assistant.js";
import { Maintenance } from "../Maintenance/Maintenance.js";
import { Introuvable } from "../Etats/Etats.js";
import { media } from "../outils.js";
import { Document, enTeteEtMenu, enTeteDocument, optionsLangues, credit } from "./commun.js";
import { Couverture } from "./Couverture.js";
import { Introduction } from "./Introduction.js";
import { Apropos } from "./Apropos.js";
import { Savoirfaire } from "./Savoirfaire.js";
import { Parcours } from "./Parcours.js";
import { Projets } from "./Projets.js";
import { Prestations } from "./Prestations.js";
import { Contact } from "./Contact.js";

/** Gabarit de chaque type de section. Un nouveau type = une entrée ici + son gabarit. */
export const GABARITS_SECTIONS = { couverture: Couverture, introduction: Introduction, apropos: Apropos, savoirfaire: Savoirfaire, parcours: Parcours, projets: Projets, prestations: Prestations, contact: Contact };

function meta(contenu, ctx, { titre = null, description = null, chemin = "" } = {}) {
  const seo = contenu.site.seo;
  return {
    titre: titre ?? ctx.c(seo.titre, "site.seo.titre"),
    description: description ?? ctx.c(seo.description, "site.seo.description"),
    canonique: ctx.url(chemin),
    image: seo.image ? ctx.url(ctx.media(seo.image.src).src.replace(ctx.racine, "")) : null,
  };
}

/** Page d'accueil : toutes les sections, la modale d'étude, le menu, l'accueil animé. */
export function PageAccueil({ contenu, ctx }) {
  const { entete, menu } = enTeteEtMenu({ contenu, ctx });
  const sections = contenu.sections.filter((section) => section.visible !== false)
    .map((section) => GABARITS_SECTIONS[section.type]?.({ section, contenu, ctx }) ?? "");
  return Document({
    ctx, meta: meta(contenu, ctx),
    corps: html`${entete}<main id="contenu" class="page-planches" tabindex="-1">${sections}</main>${Gabarit_Projet({ ctx, mode: "modale" })}${Visionneuse({ ctx })}${menu}${Intro({ intro: contenu.site.intro, ctx, langues: optionsLangues(ctx), contenu })}${Assistant({ assistant: contenu.site.assistant, ctx, endpoint: ctx.assistantEndpoint })}`,
  });
}

/**
 * Page de maintenance : rendue à chaque adresse publique quand le mode est
 * coché dans le CMS. Jamais indexée : l'index garde les vraies pages.
 */
export function PageMaintenance({ contenu, ctx }) {
  return Document({
    ctx, meta: { ...meta(contenu, ctx, { chemin: ctx.chemin }), titre: ctx.t("formats.titrePage", { titre: ctx.t("maintenance.titre"), nom: contenu.site.identite.nom }), robots: "noindex" },
    corps: Maintenance({ site: contenu.site, ctx, langues: optionsLangues(ctx) }),
  });
}

/**
 * Page introuvable (404) : servie par l'hébergeur à toute adresse inconnue,
 * avec une racine absolue. Jamais indexée.
 */
export function PageIntrouvable({ contenu, ctx }) {
  return Document({
    ctx, meta: { ...meta(contenu, ctx), titre: ctx.t("formats.titrePage", { titre: ctx.t("etats.introuvable.onglet"), nom: contenu.site.identite.nom }), robots: "noindex" },
    corps: Introuvable({ ctx }),
  });
}

/** Page d'un projet : l'étude complète, lisible sans JavaScript et indexable. */
export function PageProjet({ contenu, ctx, projet }) {
  const versAccueil = ctx.pageAccueil();
  const { entete, menu } = enTeteEtMenu({ contenu, ctx, versAccueil });
  // Le titre et la description viennent de la VUE du projet, comme partout
  // ailleurs : la page ne recalcule plus ce que le gabarit central résout.
  const vue = vueProjet({ projet, ctx });
  const retour = `${versAccueil}#${contenu.sections.find((s) => s.type === "projets")?.id ?? ""}`;
  return Document({
    ctx, meta: { ...meta(contenu, ctx, { titre: ctx.t("formats.titrePage", { titre: vue.titre, nom: contenu.site.identite.nom }), description: vue.description, chemin: ctx.chemin }), type: "article" },
    corps: html`${entete}<main id="contenu" class="page-planches" tabindex="-1">${Gabarit_Projet({ projet, ctx, mode: "page", options: { retour, voisins: parcours(contenu.projets, projet.id) } })}</main>${Visionneuse({ ctx })}${menu}`,
  });
}

/** Page CV : même contenu que le parcours, détaillé, plus les rubriques propres au CV. */
export function PageCv({ contenu, ctx }) {
  const cv = contenu.cv;
  const versAccueil = ctx.pageAccueil();
  const entete = enTeteDocument({ contenu, ctx, versAccueil });
  const c = (valeur, chemin) => ctx.l(valeur, `cv.${chemin}`);
  // Un élément est un texte, ou { texte, precision } : la précision s'affiche en petit, comme dans la référence.
  const element = (valeur, chemin) => (valeur && valeur.texte !== undefined
    ? html`${ctx.l(valeur.texte, `${chemin}.texte`, texteEnrichi)} <small class="cv__precision">${ctx.l(valeur.precision, `${chemin}.precision`)}</small>`
    : ctx.l(valeur, chemin, texteEnrichi));
  const liste = (elements, chemin, classe = "liste-puces") => html`<ul class="${classe}">${elements.map((valeur, rang) => html`<li>${element(valeur, `cv.${chemin}.${rang}`)}</li>`)}</ul>`;
  const bandeau = (titre, chemin, corps) => Encart({ ton: "bandeau", niveau: 2, titre: c(titre, chemin), contenu: corps });
  // Une information peut référencer une coordonnée commune du site (type) : elle n'est jamais recopiée.
  const { email, linkedin } = contenu.site.contact;
  const informations = html`<ul class="cv__informations">${cv.informations.map((info, rang) => {
    if (info.type === "email") return html`<li>${Bouton({ texte: email, variante: "lien", href: `mailto:${email}` })}</li>`;
    if (info.type === "linkedin") return linkedin ? html`<li>${Bouton({ texte: ctx.c(info.valeur, `cv.informations.${rang}.valeur`), variante: "lien", href: linkedin, options: { attributs: { target: "_blank", rel: "noreferrer" } } })}</li>` : "";
    if (info.lien) return html`<li>${Bouton({ texte: ctx.c(info.valeur, `cv.informations.${rang}.valeur`), variante: "lien", href: info.lien })}</li>`;
    return html`<li>${c(info.valeur, `informations.${rang}.valeur`)}</li>`;
  })}</ul>`;
  const competences = cv.competences.groupes.map((groupe, rang) => html`<h3 class="cv__sous-titre texte-etiquette">${c(groupe.titre, `competences.groupes.${rang}.titre`)}</h3>${liste(groupe.elements, `competences.groupes.${rang}.elements`)}`);
  const postes = html`<ol class="cv__postes">${cv.experience.postes.map((poste, rang) => html`<li><h3 class="cv__poste-titre">${c(poste.titre, `experience.postes.${rang}.titre`)}</h3><p class="cv__poste-lieu">${c(poste.lieu, `experience.postes.${rang}.lieu`)}</p>${liste(poste.points, `experience.postes.${rang}.points`, "liste-puces liste-puces--cercle")}</li>`)}</ol>`;
  const formation = Grille({ min: "var(--cv-carte-min)", espace: ["var(--space-6)"], elements: cv.formation.groupes.map((groupe, rang) => Encart({ titre: c(groupe.titre, `formation.groupes.${rang}.titre`), contenu: liste(groupe.elements, `formation.groupes.${rang}.elements`, "cv__separee") })) });
  const titreId = idTitre("cv");
  // Le portrait vient des donnees de la section « A propos » : une seule
  // source pour l'image et son texte alternatif, jamais recopies (PM-127).
  const apropos = contenu.sections.find((section) => section.type === "apropos");
  const portrait = apropos?.portrait
    ? html`<div class="cv-lateral__portrait">${Media({ media: media(ctx, apropos.portrait, { chemin: `sections.${apropos.id}.portrait` }), cadre: "detoure", ajustement: "contenir" })}</div>`
    : "";
  // Disposition du PDF de reference : le patronyme, le titre et le resume en
  // tete de la colonne de droite, au-dessus des experiences ; le portrait et
  // les deux bandeaux lateraux dans le panneau de gauche.
  const identite = html`<div class="cv-identite">${Titre({ niveau: 1, echelle: "document", texte: ctx.l(cv.nom, "cv.nom", (t) => texteEnrichi(t, { grand: true })), id: titreId })}<p class="cv-identite__titre">${ctx.l(cv.titre, "cv.titre", texteEnrichi)}</p><p class="cv-identite__resume texte-corps">${ctx.l(cv.resume, "cv.resume", texteEnrichi)}</p></div>`;
  return Document({
    ctx, meta: { ...meta(contenu, ctx, { titre: ctx.c(cv.seo.titre, "cv.seo.titre"), description: ctx.c(cv.seo.description, "cv.seo.description"), chemin: ctx.chemin }), type: "profile" },
    corps: html`${entete}<main id="contenu" class="page-planches page-cv" tabindex="-1">
${Planche({ classe: "cv-corps", contenu: html`<div class="cv-corps__colonnes"><div class="cv-corps__lateral">${portrait}${bandeau(cv.titres.informations, "titres.informations", informations)}${bandeau(cv.titres.competences, "titres.competences", competences)}</div><div class="cv-corps__principal">${identite}${bandeau(cv.titres.experience, "titres.experience", postes)}</div></div>` })}
${Planche({ classe: "cv-corps", contenu: html`${bandeau(cv.titres.formation, "titres.formation", formation)}${Grille({ min: "var(--cv-carte-min)", espace: ["var(--space-6)"], elements: [bandeau(cv.titres.ia, "titres.ia", liste(cv.ia, "ia", "liste-puces cv__aeree")), bandeau(cv.titres.forces, "titres.forces", liste(cv.forces, "forces", "liste-puces cv__aeree"))] })}${bandeau(cv.titres.references, "titres.references", html`<ul class="cv__references">${cv.references.map((reference, rang) => html`<li>${Pastille({ texte: ctx.c(reference, `cv.references.${rang}`), variante: "contour" })}</li>`)}</ul>`)}` })}
<div class="cv__pied">${Bouton({ texte: ctx.t("cv.retour"), variante: "lien", href: versAccueil || "./", options: { icone: "retour" } })}${Segments({ options: optionsLangues(ctx), etiquette: ctx.t("langue.selecteur") })}</div>
</main>`,
  });
}

export { optionsLangues };
