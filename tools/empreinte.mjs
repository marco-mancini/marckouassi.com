// Empreinte des ressources du site (#197).
//
// Les pages chargent Index.css et site.js, qui chargent à leur tour une
// trentaine de feuilles (@import) et de modules (import). Ces adresses ne
// changeaient jamais : un navigateur qui gardait une ancienne copie pouvait
// associer une page neuve à d'anciennes feuilles. C'est arrivé le 11 octobre
// 2026 : les cartes Rideau s'affichaient en texte brut sur le téléphone de
// Marc, parce que l'ancien Index.css n'importait pas Rideau.css.
//
// L'empreinte est celle du CONTENU : un déploiement qui ne change aucune
// ressource garde les mêmes adresses, et le cache reste utile. Un seul
// changement, et toutes les adresses changent ensemble — jamais de mélange
// d'anciennes et de nouvelles ressources.

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/** Sources publiées comme ressources : celles que le build copie dans _site. */
const SOURCES = ["Design_System", "Frontend/site.js", "Frontend/mesure.js"];
const ESTRESSOURCE = /\.(css|js)$/;

async function fichiers(chemin) {
  const stat = await fs.stat(chemin);
  if (!stat.isDirectory()) return [chemin];
  const entrees = await fs.readdir(chemin, { withFileTypes: true });
  const listes = await Promise.all(entrees.map((e) => fichiers(path.join(chemin, e.name))));
  return listes.flat();
}

/** Empreinte courte (10 hexadécimaux) de toutes les feuilles et de tous les modules publiés. */
export async function calculerEmpreinte(racine) {
  const hache = crypto.createHash("sha256");
  const liste = (await Promise.all(SOURCES.map((s) => fichiers(path.join(racine, s))))).flat()
    .filter((f) => ESTRESSOURCE.test(f)).sort();
  for (const fichier of liste) {
    hache.update(path.relative(racine, fichier));
    hache.update(await fs.readFile(fichier));
  }
  return hache.digest("hex").slice(0, 10);
}

/** Ajoute ?v=<empreinte> aux @import d'une feuille. */
export function versionnerCss(texte, empreinte) {
  return texte.replace(/@import\s+url\((["'])([^"')?]+\.css)\1\)/g, (_, q, url) => `@import url(${q}${url}?v=${empreinte}${q})`);
}

/** Ajoute ?v=<empreinte> aux imports relatifs d'un module (statiques et dynamiques). */
export function versionnerJs(texte, empreinte) {
  return texte.replace(/(\bfrom\s*|\bimport\s*\(?\s*)(["'])(\.{1,2}\/[^"'?]+\.js)\2/g, (_, avant, q, url) => `${avant}${q}${url}?v=${empreinte}${q}`);
}

/** Réécrit, dans la sortie, les feuilles et modules publiés pour qu'ils se chargent entre eux avec l'empreinte. */
export async function versionnerRessources(sortie, empreinte) {
  const liste = (await Promise.all(["Design_System", "Frontend"].map((d) => fichiers(path.join(sortie, d))))).flat();
  for (const fichier of liste) {
    if (fichier.endsWith(".css")) {
      const texte = await fs.readFile(fichier, "utf8");
      const nouveau = versionnerCss(texte, empreinte);
      if (nouveau !== texte) await fs.writeFile(fichier, nouveau);
    } else if (fichier.endsWith(".js")) {
      const texte = await fs.readFile(fichier, "utf8");
      const nouveau = versionnerJs(texte, empreinte);
      if (nouveau !== texte) await fs.writeFile(fichier, nouveau);
    }
  }
}
