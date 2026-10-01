/**
 * Site public dans un vrai navigateur : FR/EN, accessibilité, clavier,
 * responsive, robustesse (sans JS, JS en échec, animations réduites),
 * menu, études de projet, accueil. Prérequis : npm run build.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { servir, lancer, ouvrir, defiler } from "./outils.mjs";

const axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
let serveur; let nav;
before(async () => { serveur = await servir(); nav = await lancer(); });
after(async () => { await nav?.close(); serveur?.fermer(); });

test("pages FR et EN : lang, canonique, hreflang, og:locale, aucune erreur", async () => {
  for (const [chemin, lang, locale] of [["/", "fr", "fr_FR"], ["/en/", "en", "en_US"], ["/cv/", "fr", "fr_FR"], ["/en/projets/fifa26/", "en", "en_US"]]) {
    const page = await ouvrir(nav, serveur.url + chemin);
    assert.equal(await page.getAttribute("html", "lang"), lang, chemin);
    assert.equal(await page.getAttribute('meta[property="og:locale"]', "content"), locale, chemin);
    const alternatives = await page.$$eval('link[rel="alternate"]', (l) => l.map((e) => e.hreflang).sort());
    assert.deepEqual(alternatives, ["en", "fr", "x-default"], chemin);
    assert.ok((await page.getAttribute('link[rel="canonical"]', "href")).startsWith("https://"), chemin);
    assert.deepEqual(page.erreurs, [], chemin);
    await page.fermer();
  }
});

test("EN : un texte non traduit est affiché en français et balisé lang=fr (jamais inventé)", async () => {
  const page = await ouvrir(nav, `${serveur.url}/en/`);
  const balises = await page.$$eval('main [lang="fr"]', (l) => l.length);
  assert.ok(balises > 0);
  assert.equal(await page.textContent(".skip-link"), "Skip to content");
  await page.fermer();
});

test("le contenu est visible sans JavaScript, avec un script en échec et avec animations réduites", async () => {
  const cas = [{ js: false }, { bloquerScript: true }, { reduit: true, defile: true }, { defile: true }];
  for (const options of cas) {
    const page = await ouvrir(nav, serveur.url + "/", options);
    if (options.defile) await defiler(page); else await page.waitForTimeout(1200);
    const masques = await page.$$eval(".carte, .projet-carte, .planche", (l) => l.filter((e) => +getComputedStyle(e).opacity < 0.99).length);
    assert.equal(masques, 0, JSON.stringify(options));
    await page.fermer();
  }
});

test("animations réduites : la couverture est visible dès le chargement, sans attendre un délai", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { reduit: true });
  const caches = await page.$$eval(".couverture-scene *", (l) => l.filter((e) => +getComputedStyle(e).opacity < 0.99).map((e) => e.className));
  assert.deepEqual(caches, []);
  await page.fermer();
});

test("aucun débordement horizontal, de 320 à 1440 px, sur toutes les pages types", async () => {
  for (const chemin of ["/", "/en/", "/cv/", "/projets/ceeli/"]) {
    for (const largeur of [320, 375, 768, 850, 1024, 1440]) {
      const page = await ouvrir(nav, serveur.url + chemin, { largeur });
      const debord = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.equal(debord, 0, `${chemin} à ${largeur}px`);
      await page.fermer();
    }
  }
});

test("toutes les images se chargent et réservent leur place (width/height)", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  await defiler(page);
  await page.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = "eager"; return i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }); })));
  const bilan = await page.$$eval("img", (l) => ({ total: l.length, cassees: l.filter((i) => !i.naturalWidth).map((i) => i.src), sansDimensions: l.filter((i) => !i.getAttribute("width") || !i.getAttribute("height")).length, sansAlt: l.filter((i) => !i.hasAttribute("alt")).length }));
  assert.deepEqual(bilan.cassees, []);
  assert.equal(bilan.sansDimensions, 0);
  assert.equal(bilan.sansAlt, 0);
  await page.fermer();
});

test("clavier : le premier arrêt est le lien d'évitement, il mène au contenu", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.className), "skip-link");
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => location.hash), "#contenu");
  await page.fermer();
});

test("menu mobile : Modale plein écran, focus piégé, Échap, retour du focus, lien qui ferme", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { largeur: 375 });
  const bouton = page.locator('[data-modale-ouvrir="menu"]');
  assert.ok(await bouton.isVisible());
  assert.equal(await bouton.getAttribute("aria-expanded"), "false");
  await bouton.click();
  assert.ok(await page.locator("#menu").evaluate((d) => d.open));
  assert.equal(await bouton.getAttribute("aria-expanded"), "true");
  assert.ok(await page.evaluate(() => document.activeElement.closest("#menu") !== null));
  await page.keyboard.press("Escape");
  assert.ok(!(await page.locator("#menu").evaluate((d) => d.open)));
  assert.equal(await page.evaluate(() => document.activeElement.dataset.modaleOuvrir), "menu");
  await bouton.click();
  await page.locator('#menu a[href="#parcours"]').click();
  assert.ok(!(await page.locator("#menu").evaluate((d) => d.open)));
  assert.equal(await page.evaluate(() => location.hash), "#parcours");
  await page.fermer();
});

test("sans JavaScript, la navigation mobile reste accessible (pas de bouton de menu mort)", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { largeur: 375, js: false });
  assert.ok(!(await page.locator('[data-modale-ouvrir="menu"]').isVisible()));
  assert.ok(await page.locator('.en-tete .navigation a[href="#contact"]').isVisible() || await page.locator(".en-tete__navigation").isVisible());
  await page.fermer();
});

test("étude de projet : ouverture en modale, compteur calculé, Échap, focus rendu ; sans JS : page du projet", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  const lien = page.locator('a[data-etude="aurex"]');
  await lien.scrollIntoViewIfNeeded();
  await lien.click();
  await page.waitForFunction(() => document.getElementById("etude").open);
  assert.equal(await page.textContent("[data-etude-compteur]"), "Projet 07 / 11");
  assert.equal(await page.getAttribute("#etude", "aria-labelledby"), "etude-aurex");
  assert.match(await page.textContent("#etude h2"), /AUREX/);
  assert.ok(await page.$$eval("#etude img", (l) => l.length) === 9);
  await page.keyboard.press("Escape");
  assert.equal(await page.evaluate(() => document.activeElement.dataset.etude), "aurex");
  await page.fermer();
  const sansJs = await ouvrir(nav, serveur.url + "/", { js: false });
  await sansJs.locator('a[data-etude="aurex"]').click();
  await sansJs.waitForURL(/projets\/aurex\/$/);
  assert.match(await sansJs.textContent("h1"), /AUREX/);
  await sansJs.fermer();
});

test("navigation : aria-current suit la section visible", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  await page.evaluate(() => document.getElementById("parcours").scrollIntoView());
  // Défilement fluide : on attend la fin du mouvement, pas une durée arbitraire.
  await page.waitForFunction(() => document.querySelector('.en-tete .navigation a[href="#parcours"]').getAttribute("aria-current") === "location", null, { timeout: 5000 }).catch(() => {});
  assert.equal(await page.getAttribute('.en-tete .navigation a[href="#parcours"]', "aria-current"), "location");
  await page.fermer();
});

test("accueil animé : apparaît, « Passer » le ferme, mémorisé ; animations réduites : choix de langue direct", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { introVue: false });
  await page.waitForFunction(() => document.getElementById("intro")?.open);
  const passer = page.locator('#intro [data-modale-fermer]');
  assert.ok(await passer.isVisible());
  assert.equal((await passer.textContent()).trim(), "Passer l’introduction");
  await passer.click();
  // L'événement « close » d'un <dialog> est asynchrone : on attend la condition.
  await page.waitForFunction(() => !document.getElementById("intro"), null, { timeout: 5000 });
  assert.equal(await page.evaluate(() => sessionStorage.getItem("mk-intro-vue")), "1");
  await page.reload();
  await page.waitForTimeout(500);
  assert.equal(await page.locator("#intro").count(), 0, "l'accueil ne se rejoue pas dans la même session");
  await page.fermer();

  const reduit = await ouvrir(nav, serveur.url + "/", { introVue: false, reduit: true });
  await reduit.waitForFunction(() => document.getElementById("intro")?.open);
  assert.ok(await reduit.locator('#intro [data-etape="langue"]').isVisible());
  await reduit.locator('#intro .segments__option[lang="en"]').click();
  await reduit.waitForURL(/\/en\/$/);
  await reduit.waitForTimeout(500);
  assert.equal(await reduit.locator("#intro").count(), 0, "l'accueil ne se rejoue pas après le choix de langue");
  await reduit.fermer();
});

test("accessibilité (axe-core) : aucune violation grave ou critique", async () => {
  for (const chemin of ["/", "/en/", "/cv/", "/projets/fifa26/"]) {
    for (const theme of ["light", "dark"]) {
      const page = await ouvrir(nav, serveur.url + chemin, { reduit: true, theme });
      await defiler(page);
      await page.addScriptTag({ content: axe });
      const violations = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations
        .filter((v) => ["serious", "critical"].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length}) : ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`));
      assert.deepEqual(violations, [], `${chemin} ${theme}`);
      await page.fermer();
    }
  }
});
