/**
 * LANGUE — textes d'interface et valeurs de contenu, en FR/EN.
 *
 * Deux sources, jamais mélangées :
 *   - le DICTIONNAIRE (fr.json, en.json) : libellés d'interface et
 *     d'accessibilité (« Fermer », « Aller au contenu »…) ;
 *   - le CONTENU (content/*.json) : textes éditoriaux. Une valeur y est
 *     soit commune (chaîne, nombre, URL : stockée une fois), soit
 *     traduisible ({ fr: "…", en: "…" }).
 *
 * Une traduction absente n'est JAMAIS inventée : la langue par défaut
 * est affichée, balisée de sa vraie langue (lang="fr") pour les lecteurs
 * d'écran, et l'absence est consignée pour le rapport « à traduire ».
 *
 * Aucune dépendance, aucun DOM : utilisable dans le build et dans le
 * navigateur (aperçu du back-office).
 */
import { html, brut, formater, Html } from "../fondations/rendu.js";

/** Vrai si la valeur est un objet de traductions { fr, en }. */
export function estTraduisible(valeur) {
  if (valeur === null || typeof valeur !== "object" || Array.isArray(valeur) || valeur instanceof Html) return false;
  // Toutes les clés sont des codes de langue : un objet qui porte aussi
  // « id », « src »… est une donnée structurée, pas un texte traduit.
  const cles = Object.keys(valeur);
  return cles.length > 0 && cles.every((cle) => /^[a-z]{2}$/.test(cle) && cle !== "id");
}

/** Lit une clé pointée : lire({a:{b:1}}, "a.b") → 1. */
export function lire(objet, cle) {
  return cle.split(".").reduce((courant, morceau) => {
    if (courant == null) return undefined;
    // Dans une liste, un morceau non numérique désigne l'élément par son id
    // (« sections.contact », « projets.aurex ») : stable quand l'ordre change.
    if (Array.isArray(courant) && !/^\d+$/.test(morceau)) return courant.find((element) => element?.id === morceau);
    return courant[morceau];
  }, objet);
}

/**
 * Crée le contexte de langue d'une page.
 * @param {object} p
 * @param {string} p.langue              langue de la page
 * @param {string} p.langueParDefaut     langue de repli (celle du contenu de référence)
 * @param {Record<string, object>} p.dictionnaires   { fr: {...}, en: {...} }
 */
export function creerContexte({ langue, langueParDefaut, dictionnaires }) {
  const manquants = [];
  const dictionnaire = dictionnaires[langue] || {};
  const repli = dictionnaires[langueParDefaut] || {};

  /** Texte d'interface. Une clé absente des deux dictionnaires est une erreur de code. */
  function t(cle, valeurs) {
    let modele = lire(dictionnaire, cle);
    if (typeof modele !== "string") {
      modele = lire(repli, cle);
      if (typeof modele !== "string") throw new Error(`Clé de dictionnaire inconnue : « ${cle} »`);
      manquants.push({ type: "interface", cle, langue });
    }
    return formater(modele, valeurs);
  }
  /** Vrai si la clé existe (pour un libellé facultatif, ex. un champ de contenu nouveau). */
  t.existe = (cle) => typeof lire(dictionnaire, cle) === "string" || typeof lire(repli, cle) === "string";
  /** Liste du dictionnaire (ex. « nombres »), avec repli sur la langue par défaut. */
  t.liste = (cle) => {
    const liste = lire(dictionnaire, cle);
    return Array.isArray(liste) ? liste : lire(repli, cle);
  };

  /** Résout une valeur de contenu : { texte, lang } où lang n'est posé qu'en cas de repli. */
  function resoudre(valeur, chemin = "", { consigner = true } = {}) {
    if (!estTraduisible(valeur)) return { texte: valeur ?? "", lang: null };
    const traduit = valeur[langue];
    if (traduit !== undefined && traduit !== null && traduit !== "") return { texte: traduit, lang: null };
    const reference = valeur[langueParDefaut];
    if (langue !== langueParDefaut && consigner) manquants.push({ type: "contenu", cle: chemin, langue });
    return { texte: reference ?? "", lang: langue !== langueParDefaut ? langueParDefaut : null };
  }

  /** Valeur de contenu en texte brut (attributs, titres de page…). */
  function c(valeur, chemin) {
    return resoudre(valeur, chemin).texte;
  }

  /** Valeur de contenu en HTML : balisée lang="…" quand c'est un repli. */
  function l(valeur, chemin, transformer = (texte) => texte) {
    const { texte, lang } = resoudre(valeur, chemin);
    const rendu = transformer(texte);
    return lang ? html`<span lang="${lang}">${rendu}</span>` : html`${rendu}`;
  }

  /** Langue effective d'une valeur (pour un attribut lang sur une image, un champ…). */
  function langDe(valeur) {
    // Ne consigne rien : le texte lui-même est résolu (et signalé) par c() ou l().
    return resoudre(valeur, "", { consigner: false }).lang;
  }

  return { langue, langueParDefaut, t, c, l, langDe, resoudre, manquants };
}

/** Chemin d'une page dans une langue : la langue par défaut est à la racine. */
export function cheminLangue(langue, langueParDefaut, chemin = "") {
  const base = langue === langueParDefaut ? "" : `${langue}/`;
  return `${base}${chemin}`;
}

/** Préfixe relatif vers la racine du site depuis un chemin de page ("en/projets/x/" → "../../../"). */
export function versRacine(chemin) {
  const profondeur = chemin.split("/").filter(Boolean).length;
  return profondeur ? "../".repeat(profondeur) : "./";
}

export { brut };
