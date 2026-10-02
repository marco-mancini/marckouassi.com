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

/* --------------------------------------------------------------------------
   DISCIPLINES DES PROJETS — le filtre du sommaire.

   Deux sources, et aucune liste ici :
     - le CATALOGUE vit dans la section qui porte le filtre
       (`sections[sommaire].categories`) : un identifiant stable et un
       libellé traduisible par discipline ;
     - le RATTACHEMENT vit dans chaque projet (`projets[].categories`) :
       des identifiants, jamais des libellés.

   Un projet appartient à plusieurs disciplines sans être dupliqué : il
   porte simplement plusieurs identifiants.
   -------------------------------------------------------------------------- */

/** Identifiants de discipline d'un projet, dédoublonnés, dans l'ordre des données. */
export function disciplinesDe(projet) {
  return [...new Set(projet?.categories ?? [])];
}

/**
 * Disciplines réellement proposées au visiteur : celles du catalogue qui
 * comptent au moins un projet, dans l'ordre du catalogue.
 *
 * Une discipline déclarée mais vide n'est PAS affichée : un filtre qui ne
 * rend rien n'est pas une proposition, c'est une impasse. Elle réapparaît
 * d'elle-même dès qu'un projet la revendique — rien à toucher dans le code.
 *
 * @param {Array<{id: string, libelle: object}>} catalogue  sections[sommaire].categories
 * @param {Array<object>} projets
 * @returns {Array<{id: string, libelle: object, rang: number, total: number}>}
 */
export function disciplinesProposees(catalogue, projets) {
  const comptes = new Map();
  for (const projet of projets ?? []) {
    for (const id of disciplinesDe(projet)) comptes.set(id, (comptes.get(id) ?? 0) + 1);
  }
  return (catalogue ?? [])
    .map((discipline, rang) => ({ ...discipline, rang, total: comptes.get(discipline.id) ?? 0 }))
    .filter((discipline) => discipline.total > 0);
}

/**
 * Projets d'une discipline. `null` — l'état « tous » — les rend tous, dans
 * leur ordre d'origine : le filtre ne réordonne jamais rien.
 */
export function projetsDeLaDiscipline(projets, id = null) {
  return id === null ? [...(projets ?? [])] : (projets ?? []).filter((p) => disciplinesDe(p).includes(id));
}

/** Identifiants rattachés à un projet mais absents du catalogue. Vide = données saines. */
export function disciplinesInconnues(catalogue, projets) {
  const connus = new Set((catalogue ?? []).map((d) => d.id));
  const inconnus = new Set();
  for (const projet of projets ?? []) {
    for (const id of disciplinesDe(projet)) if (!connus.has(id)) inconnus.add(id);
  }
  return [...inconnus];
}
