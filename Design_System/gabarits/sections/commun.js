/**
 * COMMUN DES PAGES — pièces assemblées par toutes les pages publiques :
 * document HTML, en-tête, menu mobile, sélecteur de langue, crédit
 * numéroté. Aucun texte : dictionnaire (ctx.t) et contenu (ctx.c / ctx.l).
 */
import { html, brut, attributs } from "../../fondations/rendu.js";
import { EnTete } from "../../composants/EnTete/EnTete.js";
import { Navigation } from "../../composants/Navigation/Navigation.js";
import { Segments } from "../../composants/Segments/Segments.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Modale } from "../../composants/Modale/Modale.js";
import { numero } from "../outils.js";

/**
 * Entrée de MarcoS. D-4 : Contact et le menu en V1, pas de présence flottante.
 * La condition est exactement celle du gabarit Assistant — sans elle, le bouton
 * ouvrirait une modale qui n'existe pas, c'est-à-dire un bouton mort (§6.8).
 */
export function entreeAssistant({ contenu, ctx, taille }) {
  if (!contenu.site.assistant?.active || !ctx.assistantEndpoint) return "";
  return Bouton({
    texte: ctx.t("assistant.ouvrir"),
    variante: "contour",
    options: {
      ...(taille ? { taille } : {}),
      attributs: { type: "button", "data-modale-ouvrir": "assistant", "aria-haspopup": "dialog", "aria-expanded": "false", "aria-controls": "assistant" },
    },
  });
}

/** Sections numérotées (toutes sauf la couverture), dans l'ordre du contenu. */
export function sectionsNumerotees(sections) {
  return sections.filter((section) => section.visible !== false && section.type !== "couverture");
}

/** Ligne de crédit d'une planche : « 03 / Savoir-faire », calculée. */
export function credit(section, sections, ctx) {
  const rang = sectionsNumerotees(sections).indexOf(section);
  const chemin = `sections.${section.id}`;
  return {
    rubrique: ctx.t("formats.rubrique", { numero: numero(rang), nom: ctx.c(section.navigation, `${chemin}.navigation`) }),
    mention: section.credit?.mention ? ctx.c(section.credit.mention, `${chemin}.credit.mention`) : null,
    signature: section.credit?.signature ? ctx.c(section.credit.signature, `${chemin}.credit.signature`) : null,
  };
}

/** Liens de navigation : une seule source, les sections. */
export function liens(sections, ctx, { versAccueil = "" } = {}) {
  return sectionsNumerotees(sections).map((section, rang) => ({
    libelle: ctx.c(section.navigation, `sections.${section.id}.navigation`),
    href: `${versAccueil}#${section.id}`,
    numero: numero(rang),
  }));
}

/** Options du sélecteur de langue : liens vers la même page dans chaque langue. */
export function optionsLangues(ctx) {
  return ctx.langues.map((code) => ({
    libelle: ctx.dictionnaires[code].langue.code,
    nom: ctx.dictionnaires[code].langue.nom,
    href: ctx.pageDansLangue(code),
    lang: code,
    actif: code === ctx.langue,
  }));
}

/** En-tête du site et menu mobile (Modale plein écran), partagés par toutes les pages. */
export function enTeteEtMenu({ contenu, ctx, versAccueil = "" }) {
  const { site, sections } = contenu;
  const l = liens(sections, ctx, { versAccueil });
  const langues = Segments({ options: optionsLangues(ctx), etiquette: ctx.t("langue.selecteur") });
  const contact = site.navigation.cta;
  const entete = EnTete({
    marque: { href: `${versAccueil}#accueil`, libelle: ctx.t("accessibilite.marque", { nom: site.identite.nom }) },
    navigation: Navigation({ liens: l, etiquette: ctx.t("accessibilite.navigationPrincipale") }),
    actions: {
      large: html`${langues}${Bouton({ texte: ctx.c(contact.texte, "site.navigation.cta.texte"), href: `${versAccueil}#contact`, options: { icone: "externe" } })}`,
      compact: html`${langues}${Bouton({ texte: ctx.t("accessibilite.ouvrirMenu"), forme: "rond", options: { icone: "menu", iconeSeule: true, attributs: { "data-modale-ouvrir": "menu", "aria-haspopup": "dialog", "aria-expanded": "false", "aria-controls": "menu" } } })}`,
    },
  });
  const menu = Modale({
    id: "menu", etiquette: ctx.t("accessibilite.menu"),
    entete: html`<span class="texte-etiquette">${ctx.t("accessibilite.explorer")}</span>`,
    options: { variante: "plein-ecran", libelleFermer: ctx.t("accessibilite.fermerMenu") },
    contenu: html`${Navigation({ liens: l, orientation: "verticale", echelle: "affichage", etiquette: ctx.t("accessibilite.navigationMobile"), fermeModale: true })}${Bouton({ texte: ctx.c(site.navigation.ecrire, "site.navigation.ecrire"), href: `mailto:${site.contact.email}`, options: { icone: "externe", taille: "grand", attributs: { "data-modale-fermer": true } } })}${entreeAssistant({ contenu, ctx, taille: "grand" })}${langues}`,
  });
  return { entete, menu };
}

/**
 * En-tête d'un document autonome (page CV) : la marque et le retour au
 * portfolio, sans navigation ni menu, exactement comme dans la référence.
 * Le choix de langue est posé par la page (pied du CV) : ajouté ici, il
 * faisait déborder la barre à 320 px.
 */
export function enTeteDocument({ contenu, ctx, versAccueil = "" }) {
  return EnTete({
    variante: "document",
    marque: { href: `${versAccueil}#accueil`, libelle: ctx.t("accessibilite.marque", { nom: contenu.site.identite.nom }) },
    actions: { large: Bouton({ texte: ctx.t("cv.retour"), href: versAccueil || "./", options: { icone: "retour" } }) },
  });
}

/**
 * Document HTML complet : métadonnées externalisées, alternatives de
 * langue (hreflang), sprite unique, lien d'évitement, script du site.
 */
export function Document({ ctx, meta, corps }) {
  const r = ctx.racine;
  return html`<!doctype html>
<html${attributs({ lang: ctx.langue })}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color"${attributs({ content: ctx.couleurTheme })}>
<title>${meta.titre}</title>
<meta name="description"${attributs({ content: meta.description })}>
<link rel="canonical"${attributs({ href: meta.canonique })}>
${ctx.alternatives.map((alt) => html`<link rel="alternate"${attributs({ hreflang: alt.langue, href: alt.href })}>`)}
<link rel="alternate" hreflang="x-default"${attributs({ href: ctx.alternatives.find((alt) => alt.langue === ctx.langueParDefaut)?.href })}>
<meta property="og:type"${attributs({ content: meta.type || "website" })}>
<meta property="og:title"${attributs({ content: meta.titre })}>
<meta property="og:description"${attributs({ content: meta.description })}>
<meta property="og:url"${attributs({ content: meta.canonique })}>
<meta property="og:locale"${attributs({ content: ctx.t("langue.locale") })}>
${ctx.alternatives.filter((alt) => alt.langue !== ctx.langue).map((alt) => html`<meta property="og:locale:alternate"${attributs({ content: ctx.dictionnaires[alt.langue].langue.locale })}>`)}
${meta.image ? html`<meta property="og:image"${attributs({ content: meta.image })}>` : ""}
${meta.robots ? html`<meta name="robots"${attributs({ content: meta.robots })}>` : ""}
<link rel="icon"${attributs({ href: `${r}Design_System/assets/logo-mk-seal.svg`, type: "image/svg+xml" })}>
<link rel="stylesheet"${attributs({ href: `${r}Design_System/styles/Index.css` })}>
<script type="module"${attributs({ src: `${r}Frontend/site.js` })}></script>
</head>
<body>
${brut(ctx.sprite)}
<a class="skip-link" href="#contenu">${ctx.t("accessibilite.allerAuContenu")}</a>
${corps}
</body>
</html>
`;
}
