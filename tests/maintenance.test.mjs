/**
 * Mode maintenance et mesure d'audience (content/site.json → maintenance,
 * mesure) : rendu des pages, textes du dictionnaire, déclaration dans le CMS.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { chargerFichiers } from "../tools/contenu.mjs";
import { cheminsPages, contextePage, rendrePage } from "../tools/pages.mjs";
import { configurationCms } from "../tools/cms.mjs";

const vrai = await chargerFichiers(process.cwd());
const dictionnaires = Object.fromEntries(vrai.site.langues.map((l) => [l, JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8"))]));
const fr = JSON.parse(fs.readFileSync("Design_System/i18n/admin.fr.json", "utf8"));

function rendre(site, langue, chemin) {
  const contenu = { ...vrai, site };
  const ctx = contextePage({ site, langue, chemin, dictionnaires, medias: new Map(), ressources: { sprite: "", couleurTheme: "#000000", annee: 2030 } });
  return String(rendrePage({ contenu, ctx, chemin }));
}

test("maintenance cochée : chaque adresse, dans chaque langue, rend la page de maintenance, non indexée", () => {
  const site = { ...vrai.site, maintenance: { active: true } };
  for (const langue of vrai.site.langues) {
    for (const chemin of cheminsPages(vrai)) {
      const page = rendre(site, langue, chemin);
      assert.match(page, /data-maintenance/, `${langue} /${chemin}`);
      assert.match(page, /<meta name="robots" content="noindex">/);
      assert.ok(page.includes(dictionnaires[langue].maintenance.titre), "titre du dictionnaire");
      assert.ok(page.includes(dictionnaires[langue].maintenance.texte), "texte du dictionnaire");
      assert.ok(page.includes(`href="mailto:${vrai.site.contact.email}"`), "le contact reste joignable");
      assert.doesNotMatch(page, /id="intro"|class="page-planches/, "ni accueil animé ni planches");
    }
  }
  assert.throws(() => rendre(site, "fr", "inconnue/"), /Aucune page/);
});

test("maintenance décochée ou absente : le site normal", () => {
  for (const maintenance of [undefined, { active: false }]) {
    const page = rendre({ ...vrai.site, maintenance }, "fr", "");
    assert.doesNotMatch(page, /data-maintenance/);
    assert.match(page, /class="page-planches/);
  }
});

test("mesure : l'identifiant GA4 du contenu est posé dans l'en-tête ; vide, rien", () => {
  assert.ok(vrai.site.mesure?.ga4, "content/site.json porte l'identifiant");
  for (const chemin of ["", "cv/", cheminsPages(vrai).at(-1)]) {
    assert.ok(rendre(vrai.site, "en", chemin).includes(`<meta name="mesure-ga4" content="${vrai.site.mesure.ga4}">`), `/${chemin}`);
  }
  assert.ok(rendre({ ...vrai.site, maintenance: { active: true } }, "fr", "").includes('name="mesure-ga4"'), "la maintenance est mesurée aussi");
  for (const mesure of [undefined, { ga4: "" }]) assert.doesNotMatch(rendre({ ...vrai.site, mesure }, "fr", ""), /mesure-ga4/);
  // Aucun script tiers écrit dans la page : il n'est chargé que par Frontend/mesure.js.
  assert.doesNotMatch(rendre(vrai.site, "fr", ""), /googletagmanager/);
});

test("CMS : maintenance et mesure proposées, même absentes, jamais obligatoires", () => {
  for (const site of [vrai.site, { ...vrai.site, mesure: undefined, maintenance: undefined }]) {
    const champs = configurationCms({ contenu: { ...vrai, site }, fr }).collections[0].files.find((f) => f.name === "site").fields;
    const maintenance = champs.find((f) => f.name === "maintenance");
    const mesure = champs.find((f) => f.name === "mesure");
    assert.deepEqual(maintenance.fields, [{ name: "active", label: fr.champs.maintenanceActif, required: false, widget: "boolean" }]);
    assert.deepEqual(mesure.fields, [{ name: "ga4", label: fr.champs.ga4, required: false, widget: "string" }]);
    assert.equal(maintenance.required, false);
    assert.equal(mesure.required, false);
  }
});

test("dictionnaires : les textes de maintenance existent dans chaque langue", () => {
  for (const langue of vrai.site.langues) {
    for (const cle of ["titre", "texte"]) assert.ok(dictionnaires[langue].maintenance?.[cle], `${langue} maintenance.${cle}`);
  }
});
