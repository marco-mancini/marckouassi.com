/**
 * MARCOS, FENÊTRE DE CHAT (IA-08) — accessibilité, clavier, responsive.
 *
 * La fenêtre ne se rend que si `assistant.active` est vrai ET qu'une adresse
 * existe : ni l'un ni l'autre n'est dans le dépôt, et c'est voulu (D-9). Ce
 * fichier construit donc une page d'essai avec les VRAIS gabarit, composant,
 * dictionnaires et script du site, puis l'éprouve dans Chromium.
 *
 * Le Worker n'est jamais appelé : les réponses sont interceptées par
 * Playwright. Aucune clé, aucun réseau.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { servir, lancer, ouvrir } from "./outils.mjs";
import { chargerFichiers } from "../../tools/contenu.mjs";
import { contextePage } from "../../tools/pages.mjs";
import { PageAccueil } from "../../Design_System/gabarits/sections/Pages.js";

const libelles = JSON.parse(fs.readFileSync("Design_System/i18n/fr.json", "utf8"));

const PAGE = "essai-assistant.html";
const FICHIER = path.resolve("_site", PAGE);
const ENDPOINT = "/essai/assistant";
let serveur; let nav;

/** Textes d'essai : ils ne sont PAS le contenu de Marc, seulement de quoi rendre. */
const ASSISTANT = {
  active: true,
  accueil: { fr: "Posez votre question.", en: "Ask your question." },
  exemples: [{ fr: "Quels projets a-t-il réalisés ?", en: "Which projects has he delivered?" }],
  confidentialite: { fr: "Vos questions ne sont pas conservées.", en: "Your questions are not kept." },
};

before(async () => {
  const contenu = await chargerFichiers(process.cwd());
  const dictionnaires = Object.fromEntries(contenu.site.langues.map((l) => [l,
    JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8"))]));
  const site = { ...contenu.site, assistant: ASSISTANT };
  const ctx = contextePage({
    site, langue: "fr", chemin: "", dictionnaires, medias: new Map(),
    ressources: {
      sprite: fs.readFileSync("Design_System/assets/logos-sprite.svg", "utf8"),
      couleurTheme: "#fffff2", annee: 2026, assistantEndpoint: ENDPOINT,
    },
  });
  fs.writeFileSync(FICHIER, String(PageAccueil({ contenu: { ...contenu, site }, ctx })), "utf8");
  serveur = await servir();
  nav = await lancer();
});

after(async () => {
  await nav?.close();
  serveur?.fermer();
  fs.rmSync(FICHIER, { force: true });
});

/** Ouvre la page d'essai, la fenêtre dépliée, avec une réponse simulée. */
async function ouvrirFenetre({ largeur = 1440, theme = "light", repondre } = {}) {
  const page = await ouvrir(nav, `${serveur.url}/${PAGE}`, { largeur, theme });
  await page.route(`**${ENDPOINT}`, async (route) => {
    const r = repondre ?? { status: 200, json: { texte: "Réponse courte.", liens: [] } };
    await route.fulfill({ status: r.status, contentType: "application/json", body: JSON.stringify(r.json) });
  });
  return page;
}

test("MarcoS s'ouvre depuis Contact et depuis le menu, et nulle part ailleurs", async () => {
  const page = await ouvrirFenetre();
  const entrees = page.locator('[data-modale-ouvrir="assistant"]');
  assert.equal(await entrees.count(), 2, "exactement deux entrées (D-4)");
  // D-13 : aucune présence flottante, aucun avatar, aucun bouton flottant.
  assert.equal(await page.locator('[class*="flottant"], [class*="presence"], img[src*="Avatar_MarcoS"]').count(), 0);
  assert.equal(await page.locator("#assistant").evaluate((d) => d.open), false, "fermée au départ");
  await page.fermer();
});

test("au clavier seul : on atteint l'entrée, on ouvre, le focus entre, Échap ferme et le rend", async () => {
  const page = await ouvrirFenetre();
  const entree = page.locator('[data-modale-ouvrir="assistant"]').first();
  await entree.focus();
  assert.equal(await page.evaluate(() => document.activeElement.dataset.modaleOuvrir), "assistant");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.getElementById("assistant").open);
  const dedans = await page.evaluate(() => document.getElementById("assistant").contains(document.activeElement));
  assert.equal(dedans, true, "le focus est entré dans le dialogue");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.getElementById("assistant").open);
  assert.equal(await page.evaluate(() => document.activeElement.dataset.modaleOuvrir), "assistant", "le focus est rendu");
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("le journal est annoncé poliment, et l'état vide ne dit rien de faux", async () => {
  const page = await ouvrirFenetre();
  await page.locator('[data-modale-ouvrir="assistant"]').first().click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  const journal = page.locator("#assistant [role=log]");
  assert.equal(await journal.count(), 1);
  assert.equal(await journal.getAttribute("aria-live"), "polite");
  assert.equal(await page.locator("#assistant .conversation__tour").count(), 0, "aucun tour avant la première question");
  assert.ok((await page.locator("[data-assistant-accueil]").textContent()).includes("Posez votre question"));
  await page.fermer();
});

test("une question part, la réponse arrive, et les deux tours sont étiquetés", async () => {
  const page = await ouvrirFenetre();
  await page.locator('[data-modale-ouvrir="assistant"]').first().click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  await page.fill("#assistant-question", "Qui est M. Kouassi ?");
  await page.click("#assistant [type=submit]");
  await page.waitForFunction(() => document.querySelectorAll("#assistant .conversation__tour").length === 2);
  const tours = await page.$$eval("#assistant .conversation__tour", (l) => l.map((e) => e.textContent.trim()));
  assert.ok(tours[0].includes("Qui est M. Kouassi ?"));
  assert.ok(tours[1].includes("Réponse courte."));
  // La réponse est du TEXTE : jamais de HTML injecté.
  assert.equal(await page.locator("#assistant .conversation__tour script").count(), 0);
  assert.equal(await page.locator("[data-assistant-accueil]").evaluate((e) => e.hidden), true, "l'accueil s'efface");
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("une réponse du modèle contenant du HTML est affichée comme du texte, jamais interprétée", async () => {
  const page = await ouvrirFenetre({ repondre: { status: 200, json: { texte: "<img src=x onerror=alert(1)><b>gras</b>", liens: [] } } });
  await page.locator('[data-modale-ouvrir="assistant"]').first().click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  await page.fill("#assistant-question", "Essai");
  await page.click("#assistant [type=submit]");
  await page.waitForFunction(() => document.querySelectorAll("#assistant .conversation__tour").length === 2);
  assert.equal(await page.locator("#assistant .conversation__tour img, #assistant .conversation__tour b").count(), 0);
  assert.ok((await page.locator("#assistant .conversation__tour").last().textContent()).includes("<b>gras</b>"));
  await page.fermer();
});

test("chaque code d'erreur du Worker devient une phrase du dictionnaire, pas un code brut", async () => {
  for (const [code, statut] of [["quota_journalier", 429], ["indisponible", 503], ["trop_de_demandes", 429]]) {
    const page = await ouvrirFenetre({ repondre: { status: statut, json: { erreur: code } } });
    await page.locator('[data-modale-ouvrir="assistant"]').first().click();
    await page.waitForFunction(() => document.getElementById("assistant").open);
    await page.fill("#assistant-question", "Essai");
    await page.click("#assistant [type=submit]");
    // On attend l'état d'ERREUR, pas l'état de chargement : celui-ci occupe la
    // même zone et apparaît d'abord.
    await page.waitForSelector("[data-assistant-reessayer]", { timeout: 5000 });
    const texte = (await page.locator("[data-assistant-etat]").textContent()).trim();
    // La garantie utile : c'est LA phrase du dictionnaire de ce code, et non
    // un identifiant technique ni la phrase d'un autre code. Le client lit
    // « corps.erreur » ; lire « corps.code » les écrasait tous.
    const attendu = libelles.assistant.erreurs[code];
    assert.ok(texte.includes(attendu), `${code} : sa propre phrase est affichée`);
    assert.notEqual(texte, code, `${code} : jamais l'identifiant brut seul`);
    for (const [autre, phrase] of Object.entries(libelles.assistant.erreurs)) {
      if (autre !== code && phrase !== attendu) {
        assert.ok(!texte.includes(phrase), `${code} : ce n'est pas la phrase de ${autre}`);
      }
    }
    await page.fermer();
  }
});

test("l'aide du champ compte les caractères restants, et le plafond est celui du Worker", async () => {
  const page = await ouvrirFenetre();
  await page.locator('[data-modale-ouvrir="assistant"]').first().click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  const aide = page.locator("#assistant-question-aide");
  assert.ok((await aide.textContent()).includes("500"));
  await page.fill("#assistant-question", "abcde");
  await page.waitForFunction(() => document.getElementById("assistant-question-aide").textContent.includes("495"));
  assert.equal(await page.locator("#assistant-question").getAttribute("aria-describedby"), "assistant-question-aide");
  await page.fermer();
});

test("la fenêtre tient à 320, 375, 768, 1024 et 1440 px, en clair et en sombre", async () => {
  for (const theme of ["light", "dark"]) for (const largeur of [320, 375, 768, 1024, 1440]) {
    const page = await ouvrirFenetre({ largeur, theme });
    await page.locator('[data-modale-ouvrir="assistant"]').first().click();
    await page.waitForFunction(() => document.getElementById("assistant").open);
    const r = await page.evaluate(() => {
      const d = document.getElementById("assistant");
      const champ = document.getElementById("assistant-question");
      const envoyer = d.querySelector("[type=submit]");
      const b = envoyer.getBoundingClientRect();
      return {
        visible: d.getBoundingClientRect().width > 0,
        deborde: d.scrollWidth > document.documentElement.clientWidth,
        champ: champ.getBoundingClientRect().width > 0,
        cible: Math.min(b.width, b.height),
      };
    });
    assert.equal(r.visible, true, `${theme} ${largeur}px`);
    assert.equal(r.deborde, false, `${theme} ${largeur}px : débordement`);
    assert.equal(r.champ, true, `${theme} ${largeur}px : champ`);
    assert.ok(r.cible >= 44, `${theme} ${largeur}px : cible ${r.cible}px`);
    assert.deepEqual(page.erreurs, [], `${theme} ${largeur}px`);
    await page.fermer();
  }
});

test("la fenêtre existe en anglais avec les mêmes repères", async () => {
  const contenu = await chargerFichiers(process.cwd());
  const dictionnaires = Object.fromEntries(contenu.site.langues.map((l) => [l,
    JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8"))]));
  const site = { ...contenu.site, assistant: ASSISTANT };
  const ctx = contextePage({
    site, langue: "en", chemin: "", dictionnaires, medias: new Map(),
    ressources: { sprite: "", couleurTheme: "#fffff2", annee: 2026, assistantEndpoint: ENDPOINT },
  });
  const anglais = path.resolve("_site", "essai-assistant-en.html");
  fs.writeFileSync(anglais, String(PageAccueil({ contenu: { ...contenu, site }, ctx })), "utf8");
  const page = await ouvrir(nav, `${serveur.url}/essai-assistant-en.html`, { largeur: 1440 });
  assert.equal(await page.locator('[data-modale-ouvrir="assistant"]').count(), 2);
  await page.locator('[data-modale-ouvrir="assistant"]').first().click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  assert.equal(await page.locator("#assistant [role=log]").count(), 1);
  assert.ok((await page.locator("[data-assistant-accueil]").textContent()).includes("Ask your question"));
  await page.fermer();
  fs.rmSync(anglais, { force: true });
});

test("accessibilité axe-core de la fenêtre ouverte : aucune violation grave ou critique", async () => {
  const axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
  for (const theme of ["light", "dark"]) {
    const page = await ouvrirFenetre({ theme, largeur: 1024 });
    await page.locator('[data-modale-ouvrir="assistant"]').first().click();
    await page.waitForFunction(() => document.getElementById("assistant").open);
    await page.fill("#assistant-question", "Qui est M. Kouassi ?");
    await page.click("#assistant [type=submit]");
    await page.waitForFunction(() => document.querySelectorAll("#assistant .conversation__tour").length === 2);
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => (await window.axe.run("#assistant", { resultTypes: ["violations"] }))
      .violations.filter((v) => ["serious", "critical"].includes(v.impact))
      .map((v) => `${v.id} (${v.nodes.length})`));
    assert.deepEqual(violations, [], theme);
    await page.fermer();
  }
});
