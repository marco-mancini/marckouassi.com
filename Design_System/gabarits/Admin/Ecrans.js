import { html, attributs, brut } from "../../fondations/rendu.js";
import { Segments } from "../../composants/Segments/Segments.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Message } from "../../composants/Message/Message.js";
import { Encart } from "../../composants/Encart/Encart.js";
import { Champ } from "../../composants/Champ/Champ.js";
import { Saisie } from "../../composants/Saisie/Saisie.js";
import { Liste } from "../../composants/Liste/Liste.js";
import { Grille } from "../../composants/Grille/Grille.js";
import { Pile } from "../../composants/Pile/Pile.js";
import { Carte } from "../../composants/Carte/Carte.js";
import { Media } from "../../composants/Media/Media.js";
import { Pastille } from "../../composants/Pastille/Pastille.js";
import { Signature } from "../../composants/Signature/Signature.js";
import { Editeur, nomElement, natureMedia, compterATraduire } from "./Editeur.js";
import { optionsLangues } from "../Gabarit_Bo/Gabarit_Bo.js";

/**
 * Écrans du back-office : chacun renvoie { tete, contenu }, le contenu
 * MÉTIER seulement. La coquille (en-tête, navigation, zones, surcouches,
 * responsive) est toujours Gabarit_Bo : aucun écran ne s'affiche hors de lui.
 * Fonctions pures (données → HTML) ; textes du dictionnaire admin.
 */

/** Coquille HTML de /admin/ : sans script, un message ; avec, l'application. */
export function PageAdmin({ ctx, nom, sprite = "" }) {
  return html`<!doctype html>
<html${attributs({ lang: ctx.langue })}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>${ctx.t("titre", { nom })}</title>
<link rel="icon" href="../Design_System/assets/logo-mk-seal.svg" type="image/svg+xml">
<link rel="stylesheet" href="../Design_System/styles/Index.css">
<script src="vendor/supabase.js" defer></script>
<script type="module" src="app.js"></script>
</head>
<body class="page-admin">
${brut(sprite)}
<div id="admin" data-admin>${Message({ type: "chargement", texte: ctx.t("chargement") })}</div>
<noscript>${Message({ type: "attention", texte: ctx.t("sansScript") })}</noscript>
</body>
</html>
`;
}

/**
 * Liens de la navigation, une seule source (barre latérale, menu sous 850 px,
 * tableau de bord). Parcours et prestations pointent vers leur section,
 * trouvée par son type : aucun identifiant de contenu n'est écrit ici.
 */
export function liensAdmin({ ctx, sections = [] }) {
  const section = (type) => sections.find((s) => s.type === type);
  return [
    { cle: "tableau", href: "#/" },
    { cle: "sections", href: "#/sections" },
    section("parcours") && { cle: "parcours", href: `#/sections/${encodeURIComponent(section("parcours").id)}` },
    { cle: "projets", href: "#/projets" },
    section("prestations") && { cle: "prestations", href: `#/sections/${encodeURIComponent(section("prestations").id)}` },
    { cle: "medias", href: "#/medias" },
    { cle: "cv", href: "#/cv" },
    { cle: "parametres", href: "#/parametres" },
  ].filter(Boolean).map((lien) => ({ ...lien, libelle: ctx.t(`navigation.${lien.cle}`) }));
}

/** Connexion : Signature du site (contenu existant), formulaire, message d'erreur. */
export function Connexion({ ctx, erreur = null, enCours = false, courriel = "", signature = null }) {
  const champ = (id, type, etiquette, complement, valeur = "") => Champ({
    etiquette, id, variante: "formulaire",
    contenu: Saisie({ id, type, valeur, options: { requis: true, complement, etat: { erreur: Boolean(erreur) } } }),
  });
  const titre = signature
    ? html`${Signature({ niveau: 1, echelle: "section", textes: signature, id: "titre-accueil-bo" })}<h2>${ctx.t("connexion.titre")}</h2>`
    : html`<h1 id="titre-accueil-bo">${ctx.t("connexion.titre")}</h1>`;
  return {
    contenu: html`${titre}<p>${ctx.t("connexion.intro")}</p><form data-connexion novalidate>${Pile({ espace: "var(--space-5)", elements: [
      champ("courriel", "courriel", ctx.t("connexion.courriel"), "username", courriel),
      champ("motdepasse", "motdepasse", ctx.t("connexion.motdepasse"), "current-password"),
      erreur ? Message({ type: "erreur", texte: erreur }) : "",
      Bouton({ texte: enCours ? ctx.t("connexion.enCours") : ctx.t("connexion.valider"), variante: "principal", options: { etat: enCours ? "chargement" : null, attributs: { type: "submit" } } }),
    ] })}</form>`,
  };
}

/** Barre de publication (zone d'action de Gabarit_Bo). */
export function BarrePublication({ ctx, modifie = false, occupe = null }) {
  const statut = occupe === "enregistrement" ? ctx.t("barre.enregistrement") : occupe === "publication" ? ctx.t("barre.publication") : modifie ? ctx.t("barre.nonEnregistre") : ctx.t("barre.enregistre");
  const etat = (action) => (occupe === action ? "chargement" : occupe ? "desactive" : null);
  return html`<p class="gabarit-bo__statut" role="status" data-statut-enregistrement>${modifie && !occupe ? Pastille({ texte: statut, variante: "attention" }) : statut}</p><div class="gabarit-bo__barre-actions">${Bouton({ texte: ctx.t("barre.apercu"), variante: "filet", options: { etat: occupe ? "desactive" : null, attributs: { "data-modale-ouvrir": "apercu", "data-apercu-ouvrir": true, "aria-expanded": "false" } } })}${Bouton({ texte: ctx.t("barre.enregistrer"), variante: "contour", options: { etat: etat("enregistrement") ?? (modifie ? null : "desactive"), attributs: { "data-enregistrer": true } } })}${Bouton({ texte: ctx.t("barre.publier"), variante: "principal", options: { etat: etat("publication"), attributs: { "data-publier": true } } })}</div>`;
}

const statutPublication = (ctx, p) => Pastille({ texte: ctx.t(`statuts.${p.statut}`), variante: p.statut === "echec" ? "attention" : p.statut === "en_ligne" ? "plein" : "contour" });

/** Tableau de bord : Cartes (publication, traductions, accès), historique. */
export function TableauDeBord({ ctx, contenu, publications = [], formaterDate }) {
  const derniere = publications[0];
  const aTraduire = ["site", "sections", "projets", "cv"].reduce((total, cle) => total + compterATraduire(contenu?.[cle]), 0);
  const cartes = [
    Carte({ rang: "", libelle: ctx.t("tableau.publication"), note: derniere ? ctx.t("tableau.derniere", { version: derniere.version, date: formaterDate(derniere.cree_le) }) : ctx.t("tableau.aucune"), options: { baliseLibelle: "h2", indice: 0 } }),
    Carte({ rang: "", libelle: ctx.t("tableau.traductions"), note: aTraduire ? ctx.t("tableau.traductionsTexte", { nombre: aTraduire }) : ctx.t("tableau.traductionsCompletes"), options: { baliseLibelle: "h2", indice: 1 } }),
  ];
  const acces = liensAdmin({ ctx, sections: contenu?.sections }).slice(1).map((lien, rang) => Carte({ rang: "", libelle: lien.libelle, options: { href: lien.href, indice: rang + 2 } }));
  const historique = Encart({
    ton: "contour", niveau: 2, titre: ctx.t("tableau.historique"),
    contenu: Liste({ etiquette: ctx.t("tableau.historique"), vide: Message({ type: "vide", texte: ctx.t("tableau.historiqueVide") }), elements: publications.map((p) => ({ id: String(p.version), nom: String(p.version), contenu: html`${ctx.t("tableau.derniere", { version: p.version, date: formaterDate(p.cree_le) })} ${statutPublication(ctx, p)}` })) }),
  });
  return {
    tete: { titre: ctx.t("tableau.titre"), statut: derniere ? statutPublication(ctx, derniere) : null },
    contenu: html`${Grille({ elements: cartes, colonnes: [2, 2, 1], espace: ["var(--space-5)"] })}<section aria-labelledby="titre-acces"><h2 class="visually-hidden" id="titre-acces">${ctx.t("tableau.acces")}</h2>${Grille({ elements: acces, colonnes: [4, 2, 1], espace: ["var(--space-4)"] })}</section>${historique}`,
  };
}

/** Liste réordonnable d'éléments (sections, projets) avec lien de modification. */
function listeElements({ ctx, elements, cle, href, supprimable }) {
  return Liste({
    etiquette: ctx.t(`${cle}.etiquette`), ordonnable: true,
    libelles: { monter: ctx.t("editeur.liste.monter"), descendre: ctx.t("editeur.liste.descendre"), annonce: ctx.t("editeur.liste.annonce"), supprimer: supprimable ? ctx.t("editeur.liste.supprimer") : null },
    vide: Message({ type: "vide", texte: ctx.t("projets.vide") }),
    elements: elements.map((element, rang) => {
      const nom = nomElement(element, rang, ctx);
      const manque = compterATraduire(element);
      return { id: String(rang), nom, contenu: html`${Bouton({ texte: nom, variante: "texte", href: href(element, rang), options: { attributs: { "aria-label": ctx.t(`${cle}.modifier`, { nom }) } } })}${manque ? html` ${Pastille({ texte: ctx.t("navigation.aTraduire", { nombre: manque }), variante: "attention" })}` : ""}` };
    }),
  });
}

export function EcranSections({ ctx, sections }) {
  return { tete: { titre: ctx.t("sections.titre"), intro: ctx.t("sections.intro") }, contenu: html`<div data-ordre="sections">${listeElements({ ctx, elements: sections, cle: "sections", href: (s) => `#/sections/${encodeURIComponent(s.id)}` })}</div>` };
}

export function EcranProjets({ ctx, projets }) {
  return {
    tete: { titre: ctx.t("projets.titre"), intro: ctx.t("projets.intro"), actions: Bouton({ texte: ctx.t("projets.ajouter"), variante: "principal", options: { icone: "ouvrir", attributs: { "data-ajouter-projet": true } } }) },
    contenu: html`<div data-ordre="projets">${listeElements({ ctx, elements: projets, cle: "projets", href: (p, rang) => `#/projets/${rang}`, supprimable: true })}</div>`,
  };
}

/** Écran d'édition (section, projet, CV, paramètres) : langue d'édition en Segments. */
export function EcranDocument({ ctx, titre, valeur, chemin, retour = null, options = {} }) {
  const { langueEdition = "fr", ...optionsEditeur } = options;
  const manque = compterATraduire(valeur);
  return {
    tete: {
      titre, retour,
      statut: manque ? Pastille({ texte: ctx.t("navigation.aTraduire", { nombre: manque }), variante: "attention" }) : null,
      actions: Segments({ mode: "boutons", cle: "langue-edition", etiquette: ctx.t("editeur.langueEdition"), options: optionsLangues(ctx, langueEdition) }),
    },
    contenu: html`<form data-edition="${chemin}" novalidate>${Editeur({ valeur, chemin, ctx, options: { ...optionsEditeur, langueEdition } })}</form>`,
  };
}

/**
 * Médias : tout ce que le site affiche, avec son aperçu et l'endroit où il
 * sert (lien vers l'écran qui le modifie). Les fichiers déposés depuis le
 * back-office sont signalés.
 */
export function EcranMedias({ ctx, contenu, urlMedia }) {
  const usages = new Map();
  const parcourir = (valeur, lieu) => {
    if (Array.isArray(valeur)) return valeur.forEach((v) => parcourir(v, lieu));
    if (valeur && typeof valeur === "object") {
      for (const [cle, v] of Object.entries(valeur)) {
        if ((cle === "src" || cle === "poster") && typeof v === "string") {
          if (!usages.has(v)) usages.set(v, new Map());
          usages.get(v).set(lieu.href, lieu);
        } else parcourir(v, lieu);
      }
    }
  };
  contenu.projets.forEach((projet, rang) => parcourir(projet, { nom: nomElement(projet, rang, ctx), href: `#/projets/${rang}` }));
  contenu.sections.forEach((section, rang) => parcourir(section, { nom: nomElement(section, rang, ctx), href: `#/sections/${encodeURIComponent(section.id)}` }));
  parcourir(contenu.site, { nom: ctx.t("navigation.parametres"), href: "#/parametres" });
  parcourir(contenu.cv, { nom: ctx.t("navigation.cv"), href: "#/cv" });
  const elements = [...usages].map(([src, lieux]) => {
    const nature = natureMedia(src);
    const apercu = nature === "document"
      ? html`<p><code>${src.split("/").pop()}</code></p>`
      : Media({ media: { src: urlMedia(src), type: nature === "video" ? "video" : "image", alt: "" }, cadre: "vignette" });
    return html`<figure class="gabarit-bo__media">${apercu}<figcaption>${src.startsWith("stockage:") ? Pastille({ texte: ctx.t("medias.depose"), variante: "contour" }) : ""}${[...lieux.values()].map((lieu) => Bouton({ texte: lieu.nom, variante: "texte", href: lieu.href }))}</figcaption></figure>`;
  });
  return {
    tete: { titre: ctx.t("medias.titre"), intro: ctx.t("medias.intro", { nombre: elements.length }) },
    contenu: elements.length ? Grille({ elements, min: "12rem", espace: ["var(--space-5)"] }) : Message({ type: "vide", texte: ctx.t("medias.vide") }),
  };
}
