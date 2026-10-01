/** Détection des textes écrits en dur dans un source JS (partagée par les tests). */

/**
 * Extrait les textes littéraux d'un source JS : chaînes entre guillemets
 * et nœuds texte des gabarits html``. Un texte = au moins deux mots, qui
 * n'est ni une liste de classes, ni une valeur technique.
 */
export function textesLitteraux(source) {
  const propre = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const candidats = [
    ...[...propre.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)].map((m) => m[1]),
    ...[...propre.matchAll(/'((?:[^'\\\n]|\\.)*)'/g)].map((m) => m[1]),
    ...[...propre.matchAll(/`([^`]*)`/g)].flatMap((m) => [...m[1].matchAll(/>([^<>$]+)</g)].map((n) => n[1])),
  ];
  const estClasses = (t) => t.split(/\s+/).every((mot) => /^[a-z][a-z0-9]*(?:[-_]{1,2}[a-z0-9]+)*$/.test(mot)) && /[-_]/.test(t);
  return candidats.map((t) => t.trim()).filter((t) => /[A-Za-zÀ-ÿ]{2,}\s+[A-Za-zÀ-ÿ]{2,}/.test(t) && !estClasses(t) && !/^[a-z ]+:/.test(t));
}
