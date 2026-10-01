/**
 * Back-office dans un vrai navigateur, en mode démonstration (service
 * sans réseau, même interface que Supabase). La configuration de
 * démonstration est injectée par interception de config.js : le site
 * construit reste celui qui est publié. Prérequis : npm run build.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { servir, lancer, ouvrir } from "../navigateur/outils.mjs";

const axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
let serveur; let nav;
before(async () => { serveur = await servir(); nav = await lancer(); });
after(async () => { await nav?.close(); serveur?.fermer(); });

async function admin({ largeur = 1440, chemin = "" } = {}) {
  const page = await nav.newPage({ viewport: { width: largeur, height: 900 } });
  page.erreurs = [];
  page.on("pageerror", (e) => page.erreurs.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") page.erreurs.push(m.text()); });
  await page.route(/\/admin\/config\.js$/, (r) => r.fulfill({ contentType: "text/javascript", body: "export const CONFIG = { supabaseUrl: null, supabaseClePublique: null, demo: true };" }));
  await page.goto(`${serveur.url}/admin/${chemin}`);
  await page.waitForSelector("[data-connexion]");
  await page.fill("#courriel", "essai@exemple.org");
  await page.fill("#motdepasse", "essai");
  await page.click("[data-connexion] [type=submit]");
  await page.waitForSelector(".cadre-admin");
  return page;
}

test("sans configuration : aucun mode démonstration silencieux, un message clair", async () => {
  const page = await ouvrir(nav, `${serveur.url}/admin/`);
  await page.waitForSelector("#admin .message--attention");
  assert.match(await page.textContent("#admin"), /pas encore relié à Supabase/);
  assert.equal(await page.locator("[data-connexion], .cadre-admin").count(), 0);
  assert.deepEqual(page.erreurs, []);
  assert.equal(await page.getAttribute('meta[name="robots"]', "content"), "noindex, nofollow");
  await page.fermer();
});

test("édition : langue d'édition (Segments), saisie EN, « À traduire », enregistrement, conservation", async () => {
  const page = await admin({ chemin: "#/projets/0" });
  const bloc = page.locator('[data-traduisible="projets.0.titre"]');
  assert.ok(await bloc.locator("[data-statut-traduction]").isVisible());
  assert.ok(await page.locator('[name="projets.0.titre.fr"]').isVisible());
  assert.ok(!(await page.locator('[name="projets.0.titre.en"]').isVisible()));
  await page.locator('[data-segments="langue-edition"] [data-valeur="en"]').click();
  assert.equal(await page.getAttribute('[data-segments="langue-edition"] [data-valeur="en"]', "aria-pressed"), "true");
  assert.ok(!(await page.locator('[name="projets.0.titre.fr"]').isVisible()));
  await page.fill('[name="projets.0.titre.en"]', "Orange Senegal · FIFA 26 (essai)");
  assert.ok(!(await bloc.locator("[data-statut-traduction]").isVisible()));
  await page.click("[data-enregistrer]");
  await page.waitForSelector(".message--succes");
  assert.match(await page.textContent("[data-statut-enregistrement]"), /Tout est enregistré/);
  await page.reload();
  await page.waitForSelector(".cadre-admin");
  assert.equal(await page.inputValue('[name="projets.0.titre.en"]'), "Orange Senegal · FIFA 26 (essai)");
  assert.ok(await page.locator('[name="projets.0.titre.en"]').isVisible(), "langue d'édition mémorisée");
  assert.deepEqual(page.erreurs, []);
  await page.close();
});

test("projets : réordonner au clavier, ajouter (validation à la publication), supprimer avec confirmation", async () => {
  const page = await admin({ chemin: "#/projets" });
  const noms = () => page.$$eval('[data-ordre="projets"] .liste__ligne', (l) => l.map((e) => e.dataset.nom));
  const avant = await noms();
  await page.locator('[data-ordre="projets"] .liste__ligne').nth(1).locator("[data-liste-monter]").click();
  const apres = await noms();
  assert.deepEqual(apres.slice(0, 2), [avant[1], avant[0]]);

  await page.click("[data-ajouter-projet]");
  await page.waitForURL(/#\/projets\/11$/);
  assert.equal(await page.inputValue('[name="projets.11.id"]'), "");
  await page.click("[data-publier]");
  const erreur = page.locator(".message--erreur");
  await erreur.waitFor();
  assert.match(await erreur.textContent(), /Publication impossible/);
  assert.match(await erreur.textContent(), /Projets › 11 › Identifiant/);

  await page.goto(`${serveur.url}/admin/#/projets`);
  await page.waitForSelector('[data-ordre="projets"]');
  assert.equal((await noms()).length, 12);
  await page.locator('[data-ordre="projets"] .liste__ligne').last().locator("[data-liste-supprimer]").click();
  await page.waitForFunction(() => document.getElementById("confirmation").open);
  await page.click("#confirmation [data-confirmer]");
  await page.waitForFunction(() => document.querySelectorAll('[data-ordre="projets"] .liste__ligne').length === 11);
  assert.deepEqual(page.erreurs, []);
  await page.close();
});

test("médias : envoi avec progression puis succès ; type refusé signalé", async () => {
  const page = await admin({ chemin: "#/projets/0" });
  await page.locator("details[data-element^='projets.0.medias']").first().evaluate((d) => { d.open = true; });
  const champ = page.locator('[data-media="projets.0.medias.0.src"]');
  await champ.locator("input[type=file]").setInputFiles({ name: "vue.png", mimeType: "image/png", buffer: PNG });
  await page.locator('[data-media="projets.0.medias.0.src"] .message--succes').waitFor();
  assert.match(await page.locator('[data-media="projets.0.medias.0.src"] img').getAttribute("src"), /^blob:/);
  await page.locator('[data-media="projets.0.medias.0.src"] input[type=file]').setInputFiles({ name: "logo.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg/>") });
  await page.locator('[data-media="projets.0.medias.0.src"] .message--erreur').waitFor();
  assert.deepEqual(page.erreurs, []);
  await page.close();
});

test("aperçu : la page d'accueil est rendue avec les modifications en cours", async () => {
  const page = await admin({ chemin: "#/projets/0" });
  await page.fill('[name="projets.0.titre.fr"]', "Titre d'aperçu essai");
  await page.click("[data-apercu-ouvrir]");
  await page.waitForFunction(() => document.getElementById("apercu").open);
  const cadre = page.frameLocator("[data-apercu]");
  await cadre.locator("text=Titre d'aperçu essai").first().waitFor();
  assert.deepEqual(page.erreurs, []);
  await page.close();
});

test("sous 850 px : barre latérale remplacée par le menu en Modale ; aucun débordement à 320 px", async () => {
  for (const largeur of [320, 375, 768]) {
    const page = await admin({ largeur });
    assert.ok(!(await page.locator(".cadre-admin__navigation").isVisible()), `${largeur}`);
    const bouton = page.locator('[data-modale-ouvrir="menu-admin"]');
    assert.ok(await bouton.isVisible());
    await bouton.click();
    assert.ok(await page.locator("#menu-admin").evaluate((d) => d.open));
    await page.locator('#menu-admin a[href="#/projets"]').click();
    await page.waitForURL(/#\/projets$/);
    assert.ok(!(await page.locator("#menu-admin").evaluate((d) => d.open)));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), 0, `${largeur}`);
    await page.close();
  }
  const large = await admin({ largeur: 1024 });
  assert.ok(await large.locator(".cadre-admin__navigation").isVisible());
  assert.ok(!(await large.locator('[data-modale-ouvrir="menu-admin"]').isVisible()));
  await large.close();
});

test("interface en anglais à la demande, préférence mémorisée", async () => {
  const page = await admin();
  await page.locator('[data-segments="langue-interface"] [data-valeur="en"]').first().click();
  await page.waitForFunction(() => document.documentElement.lang === "en");
  assert.match(await page.textContent("#titre-ecran"), /Dashboard/);
  await page.reload();
  await page.waitForSelector(".cadre-admin");
  assert.match(await page.textContent("#titre-ecran"), /Dashboard/);
  await page.close();
});

test("accessibilité (axe-core) : connexion, tableau de bord, éditeur — aucune violation grave", async () => {
  const page = await nav.newPage({ viewport: { width: 1440, height: 900 } });
  await page.route(/\/admin\/config\.js$/, (r) => r.fulfill({ contentType: "text/javascript", body: "export const CONFIG = { supabaseUrl: null, supabaseClePublique: null, demo: true };" }));
  await page.goto(`${serveur.url}/admin/`);
  await page.waitForSelector("[data-connexion]");
  const verifier = async (nom) => {
    // Contraste mesuré au repos : on attend la fin des animations d'entrée (finies).
    await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished)));
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations
      .filter((v) => ["serious", "critical"].includes(v.impact)).map((v) => `${v.id} : ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`));
    assert.deepEqual(violations, [], nom);
  };
  await verifier("connexion");
  await page.fill("#courriel", "essai@exemple.org");
  await page.fill("#motdepasse", "essai");
  await page.click("[data-connexion] [type=submit]");
  await page.waitForSelector(".cadre-admin");
  await verifier("tableau");
  await page.goto(`${serveur.url}/admin/#/projets/0`);
  await page.waitForSelector("[data-edition]");
  await verifier("éditeur de projet");
  await page.goto(`${serveur.url}/admin/#/medias`);
  await page.waitForSelector(".gabarit-bo__media");
  await verifier("médias");
  await page.close();
  const sombre = await nav.newPage({ viewport: { width: 375, height: 900 }, colorScheme: "dark" });
  await sombre.route(/\/admin\/config\.js$/, (r) => r.fulfill({ contentType: "text/javascript", body: "export const CONFIG = { supabaseUrl: null, supabaseClePublique: null, demo: true };" }));
  await sombre.goto(`${serveur.url}/admin/`);
  await sombre.waitForSelector("[data-connexion]");
  await sombre.addScriptTag({ content: axe });
  const violations = await sombre.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations.filter((v) => ["serious", "critical"].includes(v.impact)).map((v) => v.id));
  assert.deepEqual(violations, [], "connexion sombre 375");
  await sombre.close();
});
