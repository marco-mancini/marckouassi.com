/**
 * PARCOURS dans le navigateur (#128, #132).
 *
 * On éprouve le comportement réel : l'ouverture, le retournement d'une carte,
 * la progression, le clavier, les animations réduites et l'absence de script.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { servir, lancer, ouvrir } from "./outils.mjs";

let serveur;
let nav;

before(async () => { serveur = await servir(); nav = await lancer(); });
after(async () => { await nav.close(); serveur.fermer(); });

const LARGEURS = [320, 375, 768, 1024, 1440, 1920];

test("replié au chargement : « Découvrir » ouvre la question et les cartes", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  const parcours = page.locator("[data-decouverte]");
  assert.equal(await parcours.isVisible(), false, "le parcours est replié avant l'action");
  const ouvrirBouton = page.locator("[data-decouverte-ouvrir]");
  assert.equal(await ouvrirBouton.getAttribute("aria-expanded"), "false");

  await ouvrirBouton.click();
  assert.equal(await parcours.isVisible(), true);
  assert.equal(await ouvrirBouton.getAttribute("aria-expanded"), "true");
  assert.equal(await page.locator("[data-decouverte-etape='question']").isVisible(), true);
  assert.equal(await page.locator("[data-decouverte-etape='cartes']").isVisible(), true);
  // Les étapes suivantes attendent leur tour.
  assert.equal(await page.locator("[data-decouverte-etape='transition']").isVisible(), false);
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("une carte se retourne, révèle son texte, et les autres restent utilisables", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  await page.locator("[data-decouverte-ouvrir]").click();
  const carte = page.locator("[data-decouverte-carte='etre-vue']");
  const revelation = page.locator("#decouverte-revelation-etre-vue");
  assert.equal(await revelation.isVisible(), false);

  await carte.click();
  assert.equal(await carte.getAttribute("aria-expanded"), "true");
  assert.equal(await revelation.isVisible(), true);
  assert.match(await revelation.innerText(), /attirer le regard/);

  // Les autres cartes n'ont pas été fermées ni désactivées.
  for (const id of ["etre-comprise", "etre-ressentie", "etre-reconnue"]) {
    assert.equal(await page.locator(`[data-decouverte-carte='${id}']`).isEnabled(), true, id);
  }
  await page.locator("[data-decouverte-carte='etre-comprise']").click();
  assert.equal(await revelation.isVisible(), true, "la première révélation reste ouverte");
  assert.equal(await page.locator("#decouverte-revelation-etre-comprise").isVisible(), true);
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("seule « Être reconnue » ouvre la suite du parcours", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  await page.locator("[data-decouverte-ouvrir]").click();
  const suite = page.locator("[data-decouverte-suite='cartes']");

  for (const id of ["etre-vue", "etre-comprise", "etre-ressentie"]) {
    await page.locator(`[data-decouverte-carte='${id}']`).click();
    assert.equal(await suite.isVisible(), false, `${id} ne doit pas ouvrir la suite`);
  }
  await page.locator("[data-decouverte-carte='etre-reconnue']").click();
  assert.equal(await suite.isVisible(), true, "la carte juste ouvre la suite");
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("la progression suit l'ordre narratif jusqu'à la trace", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  await page.locator("[data-decouverte-ouvrir]").click();
  await page.locator("[data-decouverte-carte='etre-reconnue']").click();

  for (const etape of ["transition", "intention", "territoire", "systeme", "realisations", "conclusion"]) {
    await page.locator(`[data-decouverte-continuer='${etape}']`).first().click();
    assert.equal(await page.locator(`[data-decouverte-etape='${etape}']`).isVisible(), true, `étape ${etape}`);
  }
  assert.match(await page.locator(".decouverte__trace").innerText(), /trace/i);
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("« Retour aux prestations » referme le parcours et rend le focus", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  await page.locator("[data-decouverte-ouvrir]").click();
  await page.locator("[data-decouverte-carte='etre-reconnue']").click();
  for (const etape of ["transition", "intention", "territoire", "systeme", "realisations", "conclusion"]) {
    await page.locator(`[data-decouverte-continuer='${etape}']`).first().click();
  }
  await page.locator("[data-decouverte-fermer]").click();
  assert.equal(await page.locator("[data-decouverte]").isVisible(), false);
  assert.equal(await page.locator("[data-decouverte-ouvrir]").getAttribute("aria-expanded"), "false");
  assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute("data-decouverte-ouvrir")), true, "le focus revient au bouton d'ouverture");
  await page.fermer();
});

test("clavier seul : ouvrir, atteindre une carte et la retourner sans souris", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  await page.locator("[data-decouverte-ouvrir]").focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("[data-decouverte]").isVisible(), true);

  await page.locator("[data-decouverte-carte='etre-vue']").focus();
  const visible = await page.evaluate(() => {
    const e = document.querySelector("[data-decouverte-carte='etre-vue']");
    const style = getComputedStyle(e);
    return { outline: style.outlineStyle, largeur: style.outlineWidth, ombre: style.boxShadow !== "none" };
  });
  assert.ok(visible.outline !== "none" || visible.ombre, "le focus doit être visible");

  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#decouverte-revelation-etre-vue").isVisible(), true);
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("animations réduites : même contenu, même parcours, sans transition", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { reduit: true });
  await page.locator("[data-decouverte-ouvrir]").click();
  assert.equal(await page.locator("[data-decouverte-etape='question']").isVisible(), true);
  // Rien n'est laissé à mi-chemin : la question est pleinement opaque.
  const opacite = await page.evaluate(() => Number(getComputedStyle(document.querySelector(".decouverte__question")).opacity));
  assert.ok(opacite > 0.99, `question à ${opacite}`);
  await page.locator("[data-decouverte-carte='etre-reconnue']").click();
  assert.equal(await page.locator("#decouverte-revelation-etre-reconnue").isVisible(), true);
  assert.equal(await page.locator("[data-decouverte-suite='cartes']").isVisible(), true);
  await page.fermer();
});

test("sans JavaScript, toute la narration est lisible et rien n'est masqué", async () => {
  for (const options of [{ js: false }, { bloquerScript: true }]) {
    const page = await ouvrir(nav, serveur.url + "/", options);
    const parcours = page.locator("[data-decouverte]");
    assert.equal(await parcours.isVisible(), true, `${JSON.stringify(options)} : le parcours doit être visible`);
    const masques = await page.$$eval(".decouverte__etape, .decouverte__question, .decouverte__carte, .decouverte__trace", (l) => l.filter((e) => +getComputedStyle(e).opacity < 0.99).length);
    assert.equal(masques, 0, JSON.stringify(options));
    // Les huit étapes sont lisibles d'affilée.
    assert.equal(await page.locator("[data-decouverte-etape]").count(), 8);
    const texte = await page.locator("[data-decouverte]").innerText();
    for (const attendu of ["attirer le regard", "trouver son territoire", "ne vit jamais seule", "trace"]) {
      assert.match(texte, new RegExp(attendu, "i"), `${JSON.stringify(options)} : « ${attendu} » manquant`);
    }
    await page.fermer();
  }
});

test("aucun débordement horizontal du parcours ouvert, de 320 à 1920 px", async () => {
  for (const largeur of LARGEURS) {
    const page = await ouvrir(nav, serveur.url + "/", { largeur });
    await page.locator("[data-decouverte-ouvrir]").click();
    await page.locator("[data-decouverte-carte='etre-reconnue']").click();
    const debord = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.equal(debord, 0, `débordement à ${largeur}px`);
    await page.fermer();
  }
});

test("cartes empilées et manipulables sur téléphone", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { largeur: 320 });
  await page.locator("[data-decouverte-ouvrir]").click();
  const boites = await page.$$eval("[data-decouverte-carte]", (l) => l.map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), h: Math.round(r.height) }; }));
  assert.equal(boites.length, 4);
  // Empilées : même abscisse, ordonnées croissantes.
  assert.equal(new Set(boites.map((b) => b.x)).size, 1, "les cartes doivent être sur une colonne");
  for (let i = 1; i < boites.length; i += 1) assert.ok(boites[i].y > boites[i - 1].y, "ordre vertical");
  // Cibles confortables au doigt.
  for (const boite of boites) assert.ok(boite.h >= 44, `hauteur de carte ${boite.h}px`);
  await page.locator("[data-decouverte-carte='etre-vue']").click();
  assert.equal(await page.locator("#decouverte-revelation-etre-vue").isVisible(), true);
  await page.fermer();
});

test("le parcours tient dans les deux thèmes et dans les deux langues", async () => {
  for (const chemin of ["/", "/en/"]) {
    for (const theme of ["light", "dark"]) {
      const page = await ouvrir(nav, serveur.url + chemin, { theme });
      await page.locator("[data-decouverte-ouvrir]").click();
      await page.locator("[data-decouverte-carte='etre-reconnue']").click();
      const lu = await page.evaluate(() => {
        const trace = document.querySelector(".decouverte__trace");
        const juste = document.querySelector('[data-decouverte-verdict="juste"]');
        return { trace: getComputedStyle(trace).color, juste: juste.textContent.trim(), couleurJuste: getComputedStyle(juste).color };
      });
      assert.ok(lu.trace.startsWith("rgb"), `${chemin} ${theme} : la trace prend sa couleur du thème`);
      assert.ok(lu.juste.length > 0, `${chemin} ${theme} : le verdict juste porte un texte`);
      assert.notEqual(lu.couleurJuste, "", `${chemin} ${theme}`);
      assert.deepEqual(page.erreurs, [], `${chemin} ${theme}`);
      await page.fermer();
    }
  }
});
