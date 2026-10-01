/**
 * OUTILS DES GABARITS — calculs partagés, sans texte ni DOM.
 *
 * Tout ce qui peut se déduire du contenu est calculé ici : numéros,
 * plages d'années, nombres en lettres, textes alternatifs par motif,
 * résolution des médias. Rien de tout cela n'est stocké.
 */
import { deuxChiffres, formater } from "../fondations/rendu.js";

/** « 11 » → « Onze » (dictionnaire) ; au-delà du dictionnaire, les chiffres. */
export function nombreEnLettres(nombre, ctx, { majuscule = false } = {}) {
  const mots = ctx.t.liste ? ctx.t.liste("nombres") : null;
  const mot = mots?.[nombre] ?? String(nombre);
  return majuscule ? mot.charAt(0).toLocaleUpperCase(ctx.langue) + mot.slice(1) : mot;
}

/** Plage d'années { debut, fin } → « 2024–2025 », ou l'année seule. */
export function plage(annees, ctx, format) {
  if (!annees) return "";
  const { debut, fin = debut } = annees;
  return debut === fin ? String(debut) : ctx.t(`formats.${format}`, { debut, fin });
}

/** Période affichée d'un projet : libellé explicite s'il existe (« Février 2025 »), sinon la plage. */
export function periodeProjet(projet, ctx) {
  return projet.periode ? ctx.c(projet.periode, `projets.${projet.id}.periode`) : plage(projet.annees, ctx, "plageProjet");
}

/** Plage couverte par tous les projets : du plus ancien début à la plus récente fin. */
export function plageDesProjets(projets, ctx) {
  const avec = projets.filter((p) => p.annees);
  if (!avec.length) return "";
  const debut = Math.min(...avec.map((p) => p.annees.debut));
  const fin = Math.max(...avec.map((p) => p.annees.fin ?? p.annees.debut));
  return plage({ debut, fin }, ctx, "plageSelection");
}

/** Numéro affiché d'un rang (0 → « 01 »). */
export function numero(rang) {
  return deuxChiffres(rang + 1);
}

/**
 * Objet média prêt pour le composant Media :
 *   - fichier résolu (chemin publié, dimensions réelles) par ctx.media ;
 *   - texte alternatif : celui du média, sinon le motif du parent
 *     rempli avec le rang (« … — vue {numero}. »).
 * `chemin` désigne l'entrée dans les données, `cheminMotif` le motif :
 * c'est le champ réellement utilisé qui est signalé « à traduire ».
 */
export function media(ctx, entree, { motifAlt = null, rang = 0, chemin = "", cheminMotif = "" } = {}) {
  if (!entree) return { alt: "" };
  const fichier = entree.src ? ctx.media(entree.src) : {};
  const sourceAlt = entree.alt ?? motifAlt;
  const { texte, lang } = ctx.resoudre(sourceAlt, entree.alt ? `${chemin}.alt` : cheminMotif);
  return {
    ...fichier,
    type: entree.type || fichier.type || "image",
    poster: entree.poster ? ctx.media(entree.poster).src : undefined,
    alt: entree.alt ? texte : formater(texte, { numero: deuxChiffres(rang + 1) }),
    lang: lang || undefined,
  };
}

/** Lien d'une section d'ancre, ou d'un chemin de page relatif à la racine. */
export function ancre(section) {
  return `#${section.id}`;
}
