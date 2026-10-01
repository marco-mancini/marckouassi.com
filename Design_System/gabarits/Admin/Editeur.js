import { html, attributs, classes } from "../../fondations/rendu.js";
import { estTraduisible } from "../../i18n/langue.js";
import { Champ } from "../../composants/Champ/Champ.js";
import { Saisie } from "../../composants/Saisie/Saisie.js";
import { Pastille } from "../../composants/Pastille/Pastille.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Liste } from "../../composants/Liste/Liste.js";
import { Message } from "../../composants/Message/Message.js";
import { Televersement } from "../../composants/Televersement/Televersement.js";

/**
 * Editeur — formulaire produit à partir de la FORME des données : aucun
 * écran n'est écrit champ par champ, si bien qu'un champ ajouté au
 * contenu apparaît de lui-même dans le back-office.
 *
 *   { fr, en }        → deux saisies, « À traduire » si l'anglais manque
 *   src / poster      → Televersement (aperçu, remplacement)
 *   liste             → Liste réordonnable + Ajouter
 *   objet             → groupe titré
 *   texte, nombre, oui/non → Saisie
 *   valeur technique  → affichée, non modifiable
 *
 * Chaque contrôle porte name = chemin de la valeur (« projets.3.titre.fr ») :
 * le back-office écrit la saisie à ce chemin, sans table de correspondance.
 *
 * @param {object} p
 * @param {*} p.valeur              la donnée à éditer
 * @param {string} p.chemin         son chemin dans le contenu (« projets.3 »)
 * @param {object} p.ctx            contexte du back-office (t du dictionnaire admin)
 * @param {object} [p.options]
 * @param {(src:string)=>string} [p.options.urlMedia]   adresse d'aperçu d'un média
 * @param {boolean} [p.options.identifiantModifiable]   l'id peut être saisi (nouveau projet)
 * @param {"fr"|"en"} [p.options.langueEdition]        langue affichée des textes traduisibles (Segments de Gabarit_Bo)
 */
export function Editeur({ valeur, chemin, ctx, options = {} }) {
  return html`<div class="editeur"${attributs({ "data-langue-edition": options.langueEdition || null })}>${corps(valeur, chemin, "", ctx, options)}</div>`;
}

/* Valeurs techniques : lues par les gabarits, jamais saisies ici. */
const LECTURE_SEULE = new Set(["type", "calcul", "cible", "gabarit", "langues", "langueParDefaut"]);
const MEDIA = /\.(png|jpe?g|webp|mp4|webm|pdf)$/i;
const NATURES = { mp4: "video", webm: "video", pdf: "document" };

/** Libellé d'une clé de contenu, depuis le dictionnaire (« champs.<clé> »). */
export function libelleChamp(ctx, cle) {
  return ctx.t.existe(`champs.${cle}`) ? ctx.t(`champs.${cle}`) : cle;
}

/** Identifiant HTML stable tiré d'un chemin. */
export function idDeChemin(chemin) {
  return `champ-${chemin.replace(/[^a-zA-Z0-9]+/g, "-")}`;
}

/** Nature d'un média d'après son nom de fichier. */
export function natureMedia(src = "") {
  return NATURES[src.split(".").pop()?.toLowerCase()] || "image";
}

/** Nom court d'un élément de liste (titre, nom, libellé… dans la langue par défaut). */
export function nomElement(element, rang, ctx) {
  const texte = (v) => (estTraduisible(v) ? v.fr ?? Object.values(v)[0] : v);
  const candidat = typeof element === "string" || estTraduisible(element)
    ? texte(element)
    : ["titre", "nom", "texte", "libelle", "etiquette", "navigation", "valeur", "id"].map((cle) => texte(element?.[cle])).find((v) => typeof v === "string" && v.trim());
  const propre = typeof candidat === "string" ? candidat.replace(/\*\*/g, "").replace(/\s+/g, " ").trim() : "";
  return propre ? (propre.length > 60 ? `${propre.slice(0, 59)}…` : propre) : ctx.t("editeur.element", { numero: rang + 1 });
}

/** Nombre de textes sans version anglaise dans une valeur. */
export function compterATraduire(valeur, langue = "en", reference = "fr") {
  if (estTraduisible(valeur)) return valeur[reference] && !valeur[langue] ? 1 : 0;
  if (Array.isArray(valeur)) return valeur.reduce((total, v) => total + compterATraduire(v, langue, reference), 0);
  if (valeur && typeof valeur === "object") return Object.entries(valeur).reduce((total, [cle, v]) => total + (cle.startsWith("_") ? 0 : compterATraduire(v, langue, reference)), 0);
  return 0;
}

function corps(valeur, chemin, cle, ctx, options) {
  if (valeur && typeof valeur === "object" && !Array.isArray(valeur) && !estTraduisible(valeur)) {
    return Object.entries(valeur).filter(([k]) => !k.startsWith("_")).map(([k, v]) => champ(v, chemin ? `${chemin}.${k}` : k, k, ctx, options));
  }
  return champ(valeur, chemin, cle, ctx, options);
}

function champ(valeur, chemin, cle, ctx, options, etiquette = libelleChamp(ctx, cle)) {
  const id = idDeChemin(chemin);

  if (LECTURE_SEULE.has(cle) || (cle === "id" && !options.identifiantModifiable)) {
    const affiche = Array.isArray(valeur) ? valeur.join(", ") : String(valeur ?? "");
    return Champ({ etiquette, contenu: html`<code class="editeur__technique">${affiche}</code>`, variante: "simple" });
  }
  if (estTraduisible(valeur)) return traduisible(valeur, chemin, etiquette, ctx);
  if ((cle === "src" || cle === "poster") || (typeof valeur === "string" && (MEDIA.test(valeur) || valeur.startsWith("stockage:")))) {
    return ChampMedia({ valeur, chemin, etiquette, ctx, options });
  }
  if (Array.isArray(valeur)) return collection(valeur, chemin, etiquette, ctx, options);
  if (valeur && typeof valeur === "object") {
    return html`<fieldset class="editeur__groupe"><legend class="editeur__legende">${etiquette}</legend>${corps(valeur, chemin, cle, ctx, options)}</fieldset>`;
  }
  if (typeof valeur === "boolean") {
    return html`<div class="editeur__case">${Saisie({ id, type: "case", valeur, options: { nom: chemin } })}<label${attributs({ for: id })}>${etiquette}</label></div>`;
  }
  if (cle === "frequence") {
    const choix = ["session", "une-fois", "toujours"].map((v) => ({ valeur: v, libelle: ctx.t(`frequences.${v}`) }));
    return Champ({ etiquette, id, variante: "formulaire", contenu: Saisie({ id, type: "choix", valeur, options: { nom: chemin, choix } }) });
  }
  if (typeof valeur === "number" || (valeur === null && /^(debut|fin)$/.test(cle))) {
    return Champ({ etiquette, id, variante: "formulaire", contenu: Saisie({ id, type: "nombre", valeur: valeur ?? "", options: { nom: chemin } }) });
  }
  const aide = cle === "id" ? ctx.t("editeur.aideIdentifiant") : null;
  return Champ({
    etiquette, id, variante: "formulaire", messages: { aide },
    contenu: Saisie({ id, type: long(valeur) ? "long" : (cle === "email" ? "courriel" : "texte"), valeur: valeur ?? "", options: { nom: chemin, etat: { aide: Boolean(aide) }, lignes: lignes(valeur) } }),
  });
}

const long = (texte) => typeof texte === "string" && (texte.length > 80 || texte.includes("\n"));
const lignes = (texte) => Math.min(12, Math.max(3, Math.ceil(String(texte ?? "").length / 70) + String(texte ?? "").split("\n").length - 1));

function traduisible(valeur, chemin, etiquette, ctx) {
  const reference = valeur.fr ?? "";
  const enrichi = Object.values(valeur).some((v) => typeof v === "string" && v.includes("**"));
  const motif = Object.values(valeur).some((v) => typeof v === "string" && v.includes("{numero}"));
  const aide = enrichi ? ctx.t("editeur.aideEnrichi") : motif ? ctx.t("editeur.aideMotif") : null;
  const saisie = (langue, libelle) => {
    const id = idDeChemin(`${chemin}.${langue}`);
    const texte = valeur[langue] ?? "";
    return html`<div data-langue-champ="${langue}">${Champ({
      etiquette: libelle, id, variante: "formulaire", messages: { aide: langue === "fr" ? aide : null },
      contenu: Saisie({ id, type: long(reference) || long(texte) ? "long" : "texte", valeur: texte, options: { nom: `${chemin}.${langue}`, lang: langue, lignes: lignes(reference), etat: { aide: langue === "fr" && Boolean(aide) } } }),
    })}</div>`;
  };
  const manque = Boolean(reference) && !valeur.en;
  return html`<fieldset${attributs({ class: classes("editeur__traduisible", manque && "est-a-traduire"), "data-traduisible": chemin })}><legend class="editeur__legende">${etiquette}<span class="editeur__statut" data-statut-traduction${attributs({ hidden: !manque })}>${Pastille({ texte: ctx.t("editeur.aTraduire"), variante: "attention" })}</span></legend><div class="editeur__langues">${saisie("fr", ctx.t("editeur.francais"))}${saisie("en", ctx.t("editeur.anglais"))}</div></fieldset>`;
}

/**
 * Champ d'un média, exporté pour que le back-office le redessine seul
 * pendant un envoi (progression, erreur, succès).
 */
export function ChampMedia({ valeur, chemin, etiquette, ctx, options = {}, etat = {} }) {
  const accepte = natureMedia(valeur);
  const aide = { image: "aideImage", video: "aideVideo", document: "aideDocument" }[accepte];
  const apercu = valeur ? { src: options.urlMedia ? options.urlMedia(valeur) : valeur, type: accepte === "video" ? "video" : "image", alt: "" } : null;
  return html`<fieldset class="editeur__media" data-media="${chemin}" data-etiquette="${etiquette}"><legend class="editeur__legende">${etiquette}</legend>${Televersement({
    id: idDeChemin(chemin), accepte, media: accepte === "document" ? null : apercu, etat,
    libelles: { choisir: ctx.t("medias.choisir"), remplacer: ctx.t("medias.remplacer"), deposer: ctx.t("medias.deposer"), aide: ctx.t(`medias.${aide}`), progression: ctx.t("medias.progression") },
  })}${accepte === "document" && valeur ? html`<p class="editeur__fichier"><code>${valeur.split("/").pop()}</code></p>` : ""}</fieldset>`;
}

function collection(valeurs, chemin, etiquette, ctx, options) {
  const elements = valeurs.map((element, rang) => {
    const nom = nomElement(element, rang, ctx);
    const cheminElement = `${chemin}.${rang}`;
    const simple = typeof element !== "object" || element === null || estTraduisible(element);
    return {
      id: String(rang), nom,
      contenu: simple
        ? champ(element, cheminElement, "", ctx, options, ctx.t("editeur.element", { numero: rang + 1 }))
        : html`<details class="editeur__element" data-element="${cheminElement}"><summary class="editeur__resume">${nom}</summary>${corps(element, cheminElement, "", ctx, options)}</details>`,
    };
  });
  return html`<fieldset class="editeur__collection" data-collection="${chemin}"><legend class="editeur__legende">${etiquette}</legend>${Liste({
    elements, etiquette, ordonnable: true,
    libelles: { monter: ctx.t("editeur.liste.monter"), descendre: ctx.t("editeur.liste.descendre"), supprimer: ctx.t("editeur.liste.supprimer"), annonce: ctx.t("editeur.liste.annonce") },
    vide: Message({ type: "vide", texte: ctx.t("editeur.vide") }),
  })}${Bouton({ texte: ctx.t("editeur.ajouterDans", { nom: etiquette }), variante: "contour", options: { icone: "ouvrir", attributs: { "data-ajouter": chemin } } })}</fieldset>`;
}

/**
 * Élément vide de même forme qu'un modèle (pour « Ajouter ») : textes
 * vidés, listes vidées, valeurs techniques conservées (type, calcul…).
 */
export function elementVide(modele) {
  if (estTraduisible(modele)) return Object.fromEntries(Object.keys(modele).map((langue) => [langue, ""]));
  if (Array.isArray(modele)) return [];
  if (modele && typeof modele === "object") {
    return Object.fromEntries(Object.entries(modele).map(([cle, v]) => [cle, LECTURE_SEULE.has(cle) ? v : elementVide(v)]));
  }
  if (typeof modele === "number") return null;
  if (typeof modele === "boolean") return false;
  return "";
}
