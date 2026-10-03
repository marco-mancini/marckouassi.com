/**
 * Site généré : _site contient toutes les pages que les données annoncent,
 * dans chaque langue, ainsi que le plan du site et robots.txt pointant vers
 * l'adresse publique de content/site.json. Prérequis : npm run build.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chargerFichiers } from "../../tools/contenu.mjs";
import { cheminsPages } from "../../tools/pages.mjs";
import { cheminLangue } from "../../Design_System/i18n/langue.js";

const SITE = path.resolve("_site");
const contenu = await chargerFichiers(process.cwd());
const { site } = contenu;

test("_site : chaque page attendue existe dans chaque langue, avec son adresse canonique", () => {
  assert.ok(fs.existsSync(SITE), "_site absent : lancer npm run build");
  const attendues = site.langues.flatMap((langue) => cheminsPages(contenu).map((chemin) => cheminLangue(langue, site.langueParDefaut, chemin)));
  const categories = contenu.sections.find((section) => Array.isArray(section.categories)).categories;
  assert.equal(attendues.length, site.langues.length * (2 + categories.length + contenu.projets.length));
  for (const chemin of attendues) {
    const fichier = path.join(SITE, chemin, "index.html");
    assert.ok(fs.existsSync(fichier), `page absente : /${chemin}`);
    assert.ok(fs.readFileSync(fichier, "utf8").includes(`<link rel="canonical" href="${site.url}/${chemin}">`), `adresse canonique incorrecte : /${chemin}`);
  }
});

test("_site : plan du site et robots.txt désignent l'adresse publique", () => {
  const plan = fs.readFileSync(path.join(SITE, "sitemap.xml"), "utf8");
  assert.equal([...plan.matchAll(/<loc>/g)].length, cheminsPages(contenu).length * site.langues.length);
  assert.ok([...plan.matchAll(/<loc>([^<]+)<\/loc>/g)].every(([, adresse]) => adresse.startsWith(`${site.url}/`)));
  assert.match(fs.readFileSync(path.join(SITE, "robots.txt"), "utf8"), new RegExp(`Sitemap: ${site.url}/sitemap\\.xml`));
});

test("_site : feuilles de style, script et images référencés par l'accueil sont présents", () => {
  const accueil = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
  const locales = [...accueil.matchAll(/(?:href|src)="\.\/([^"#?]+)"/g)].map(([, chemin]) => decodeURIComponent(chemin)).filter((chemin) => !chemin.endsWith("/"));
  assert.ok(locales.length > 5, `trop peu de ressources locales trouvées (${locales.length})`);
  for (const chemin of locales) assert.ok(fs.existsSync(path.join(SITE, chemin)), `ressource absente : ${chemin}`);
});
