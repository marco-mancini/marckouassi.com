/**
 * Mode maintenance et mesure d'audience dans le navigateur.
 *
 * La page de maintenance est rendue ici par les mêmes gabarits que le build
 * (maintenance cochée) et servie à la racine de _site, avec ses vraies
 * ressources. La mesure est éprouvée sur l'adresse publique du site,
 * simulée : ses requêtes sont servies depuis _site, et Google Tag Manager
 * par un témoin — aucune requête ne sort vers Google pendant les tests.
 * Prérequis : npm run build.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { servir, lancer, ouvrir } from "./outils.mjs";
import { chargerFichiers } from "../../tools/contenu.mjs";
import { contextePage, rendrePage } from "../../tools/pages.mjs";
import { lireJeton } from "../../tools/medias.mjs";

const RACINE = process.cwd();
const contenu = await chargerFichiers(RACINE);
const { site } = contenu;
const dictionnaires = Object.fromEntries(site.langues.map((l) => [l, JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8"))]));
const sprite = fs.readFileSync("Design_System/assets/logos-sprite.svg", "utf8");
const couleurTheme = await lireJeton(RACINE, "--clair-surface-page");

function pageMaintenance(langue) {
  const enMaintenance = { ...site, maintenance: { active: true } };
  const ctx = contextePage({ site: enMaintenance, langue, chemin: "", dictionnaires, medias: new Map(), ressources: { sprite, couleurTheme, annee: 2030 } });
  return String(rendrePage({ contenu: { ...contenu, site: enMaintenance }, ctx, chemin: "" }));
}

let serveur;
let nav;
before(async () => { serveur = await servir(); nav = await lancer(); });
after(async () => { await nav.close(); serveur.fermer(); });

async function ouvrirMaintenance(options = {}) {
  const page = await ouvrir(nav, "about:blank", options);
  page.echecs = [];
  page.on("requestfailed", (r) => page.echecs.push(r.url()));
  await page.route(`${serveur.url}/`, (r) => r.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: pageMaintenance("fr") }));
  await page.goto(`${serveur.url}/`, { waitUntil: "load" });
  return page;
}

test("maintenance : page complète, sceau construit, contact joignable, aucun débordement ni erreur", async () => {
  for (const largeur of [320, 375, 390, 768, 1024, 1280, 1440]) {
    for (const theme of ["light", "dark"]) {
      const page = await ouvrirMaintenance({ largeur, theme });
      await page.waitForTimeout(3400);
      const etat = await page.evaluate(() => ({
        titre: document.querySelector("h1")?.textContent,
        construit: document.querySelector("[data-maintenance] .sceau")?.classList.contains("est-construit"),
        deborde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        robots: document.querySelector('meta[name="robots"]')?.content,
        contact: document.querySelector('[data-maintenance] a[href^="mailto:"]')?.getBoundingClientRect().height,
      }));
      const lieu = `${largeur} px, ${theme}`;
      assert.ok(etat.titre?.includes(dictionnaires.fr.maintenance.titre), lieu);
      assert.equal(etat.construit, true, `sceau construit : ${lieu}`);
      assert.equal(etat.deborde, 0, `débordement : ${lieu}`);
      assert.equal(etat.robots, "noindex");
      assert.ok(etat.contact >= 44, `contact ≥ 44 px : ${lieu}`);
      assert.deepEqual(page.erreurs, [], lieu);
      assert.deepEqual(page.echecs, [], lieu);
      await page.fermer();
    }
  }
});

test("maintenance : mouvement réduit, le sceau reste statique", async () => {
  const page = await ouvrirMaintenance({ reduit: true });
  assert.equal(await page.locator("[data-maintenance] .sceau.est-construit").count(), 0);
  assert.equal(await page.locator("[data-maintenance] .sceau svg use").count(), 1, "le sceau du sprite, intact");
  await page.fermer();
});

test("mesure : depuis l'adresse publique, GA4 est chargé avec l'identifiant du contenu", async () => {
  const page = await ouvrir(nav, "about:blank");
  const gtm = [];
  await page.route("https://www.googletagmanager.com/**", (r) => { gtm.push(r.request().url()); r.fulfill({ status: 200, contentType: "text/javascript", body: "window.temoinGtm = true;" }); });
  await page.route(`${site.url}/**`, (r) => {
    let chemin = decodeURIComponent(new URL(r.request().url()).pathname);
    if (chemin.endsWith("/")) chemin += "index.html";
    const fichier = path.join(RACINE, "_site", chemin);
    if (!fs.existsSync(fichier)) return r.fulfill({ status: 404, body: "" });
    return r.fulfill({ status: 200, body: fs.readFileSync(fichier), contentType: { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp" }[path.extname(fichier)] });
  });
  await page.goto(`${site.url}/`, { waitUntil: "load" });
  await page.waitForFunction(() => window.temoinGtm === true);
  assert.deepEqual(gtm, [`https://www.googletagmanager.com/gtag/js?id=${site.mesure.ga4}`]);
  const configuration = await page.evaluate(() => window.dataLayer.map((entree) => [...entree]).find((entree) => entree[0] === "config"));
  assert.deepEqual(configuration, ["config", site.mesure.ga4]);
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("mesure : hors de l'adresse publique (aperçu, poste local), rien n'est envoyé", async () => {
  const page = await ouvrir(nav, "about:blank");
  const gtm = [];
  await page.route("https://www.googletagmanager.com/**", (r) => { gtm.push(r.request().url()); r.abort(); });
  await page.goto(`${serveur.url}/`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  assert.equal(await page.locator('meta[name="mesure-ga4"]').count(), 1, "l'identifiant est bien dans la page");
  assert.deepEqual(gtm, []);
  assert.equal(await page.evaluate(() => window.dataLayer), undefined);
  await page.fermer();
});
