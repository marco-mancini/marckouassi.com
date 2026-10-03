/** Contrats de la navigation et du contenu des catégories de réalisations. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { chargerFichiers } from "../tools/contenu.mjs";
import { contextePage, cheminsPages, rendrePage } from "../tools/pages.mjs";
import { valider } from "../Design_System/gabarits/donnees.js";
import { categoriePrincipaleDe, projetsDeLaCategorie, categoriesInconnues } from "../Design_System/gabarits/outils.js";

const contenu = await chargerFichiers(process.cwd());
const { projets } = contenu;
const section = contenu.sections.find((s) => Array.isArray(s.categories));
const catalogue = section.categories;
const dictionnaires = Object.fromEntries(contenu.site.langues.map((l) => [l, JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8"))]));
const medias = new Map();
const ctxPour = (langue, chemin = "") => contextePage({
  site: contenu.site, langue, chemin, dictionnaires, medias,
  ressources: { sprite: "", couleurTheme: "#000000", annee: 2030 },
});

test("le catalogue contient huit catégories traduites, ordonnées, titrées et racontées", () => {
  assert.equal(catalogue.length, 8);
  assert.equal(new Set(catalogue.map((c) => c.id)).size, catalogue.length);
  for (const categorie of catalogue) for (const langue of contenu.site.langues) {
    assert.ok(categorie.libelle?.[langue], `${categorie.id} : libellé ${langue}`);
    assert.ok(categorie.note?.[langue], `${categorie.id} : sous-titre ${langue}`);
    assert.ok(categorie.recit?.[langue], `${categorie.id} : récit ${langue}`);
  }
});

test("chaque projet porte exactement une catégorie principale valide", () => {
  assert.deepEqual(categoriesInconnues(catalogue, projets), []);
  for (const projet of projets) {
    assert.ok(categoriePrincipaleDe(projet), `${projet.id} doit avoir une catégorie principale`);
    assert.ok(catalogue.some((categorie) => categorie.id === projet.categoriePrincipale), projet.id);
  }
  assert.deepEqual(valider(contenu), []);
  const invalide = structuredClone(contenu);
  delete invalide.projets[0].categoriePrincipale;
  assert.ok(valider(invalide).some((e) => e.chemin === `projets.${contenu.projets[0].id}.categoriePrincipale`));
});

test("les catégories vides restent déclarées et leur sélection ne reçoit aucun projet", () => {
  const vides = catalogue.filter((categorie) => projetsDeLaCategorie(projets, categorie.id).length === 0);
  assert.ok(vides.length > 0, "les états vides sont couverts par le contenu actuel");
  for (const categorie of vides) assert.deepEqual(projetsDeLaCategorie(projets, categorie.id), []);
});

test("le sommaire montre ses huit liens de catégorie et aucune carte de réalisation", () => {
  for (const langue of contenu.site.langues) {
    const page = String(rendrePage({ contenu, ctx: ctxPour(langue), chemin: "" }));
    assert.equal((page.match(/class="projet-carte"/g) ?? []).length, 0);
    for (const categorie of catalogue) {
      assert.match(page, new RegExp(`href="[^"]*realisations/${categorie.id}/"`), `${langue} ${categorie.id}`);
      assert.ok(page.includes(categorie.libelle[langue].replaceAll("&", "&amp;")), `${langue} ${categorie.id} : libellé`);
      assert.ok(page.includes(categorie.note[langue]), `${langue} ${categorie.id} : sous-titre`);
    }
    assert.ok(page.includes(section.accroche[langue]));
  }
});

test("chaque page catégorie ne rend que ses projets, ou son état vide", () => {
  for (const langue of contenu.site.langues) for (const categorie of catalogue) {
    const chemin = `realisations/${categorie.id}/`;
    const page = String(rendrePage({ contenu, ctx: ctxPour(langue, chemin), chemin }));
    const attendus = projetsDeLaCategorie(projets, categorie.id);
    assert.equal((page.match(/class="projet-carte"/g) ?? []).length, attendus.length, `${langue} ${categorie.id}`);
    if (!attendus.length) assert.match(page, /projet.categories.vide|waiting for its first pieces of work|attend ses premières réalisations/);
    else for (const projet of attendus) assert.ok(page.includes(`data-etude="${projet.id}"`), projet.id);
  }
});

test("les routes catégories sont localisées et les routes de projets restent inchangées", () => {
  const routes = cheminsPages(contenu);
  for (const categorie of catalogue) assert.ok(routes.includes(`realisations/${categorie.id}/`));
  for (const projet of projets) assert.ok(routes.includes(`projets/${projet.id}/`));
  for (const langue of contenu.site.langues) for (const categorie of catalogue) {
    const ctx = ctxPour(langue, `realisations/${categorie.id}/`);
    assert.ok(ctx.alternatives.some((alt) => alt.langue === langue));
  }
});

test("les gabarits de présentation ne contiennent aucun identifiant ni libellé de contenu", () => {
  const sources = [
    "Design_System/gabarits/sections/Projets.js",
    "Design_System/gabarits/sections/Pages.js",
    "Design_System/gabarits/Gabarit_Projet/Gabarit_Projet.js",
    "Design_System/gabarits/Projet_carte/Projet_carte.js",
    "Frontend/site.js",
  ];
  const interdits = [...catalogue.flatMap((c) => [c.id, ...Object.values(c.libelle)]), ...projets.flatMap((p) => [p.id, ...Object.values(p.titre)])];
  for (const fichier of sources) {
    const source = fs.readFileSync(fichier, "utf8");
    for (const valeur of interdits) assert.ok(!source.includes(valeur), `${valeur} en dur dans ${fichier}`);
  }
});

test("le CMS propose une catégorie principale unique tirée du catalogue", async () => {
  const { configurationCms, FICHIERS } = await import("../tools/cms.mjs");
  const admin = JSON.parse(fs.readFileSync("Design_System/i18n/admin.fr.json", "utf8"));
  const brut = Object.fromEntries(FICHIERS.map((n) => [n, JSON.parse(fs.readFileSync(`content/${n}.json`, "utf8"))]));
  const champ = configurationCms({ contenu: brut, fr: admin }).collections[0].files
    .find((f) => f.name === "projets").fields[0].fields.find((f) => f.name === "categoriePrincipale");
  assert.equal(champ.widget, "select");
  assert.equal(champ.multiple, undefined);
  assert.deepEqual(champ.options.map((option) => option.value), catalogue.map((categorie) => categorie.id));
});
