/**
 * États du site dans le navigateur (#162) : page introuvable, réseau,
 * média en échec, état vide, MarcoS. Même gabarit partout ; le sceau se
 * construit ; mouvement réduit respecté. Prérequis : npm run build.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { servir, lancer, ouvrir } from "./outils.mjs";
import { chargerFichiers } from "../../tools/contenu.mjs";
import { contextePage, rendrePage } from "../../tools/pages.mjs";
import { lireJeton } from "../../tools/medias.mjs";

const RACINE = process.cwd();
const contenu = await chargerFichiers(RACINE);
const dictionnaires = Object.fromEntries(contenu.site.langues.map((l) => [l, JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8"))]));
const simple = (titre) => `${titre.replaceAll("*", "")}.`;
const LARGEURS = [320, 375, 390, 768, 1024, 1280, 1440];

let serveur;
let nav;
before(async () => { serveur = await servir(); nav = await lancer(); });
after(async () => { await nav.close(); serveur.fermer(); });

/** Mesures communes à tout état : gabarit, sceau construit, rien qui déborde. */
const mesurer = (page, selecteur) => page.evaluate((s) => {
  const message = document.querySelector(s);
  const titre = message?.querySelector(".message__titre");
  const sceau = message?.querySelector(".sceau");
  return {
    present: Boolean(message),
    titre: titre?.textContent,
    or: titre ? getComputedStyle(titre.querySelector(".message__or")).color !== getComputedStyle(titre).color : false,
    construit: sceau?.classList.contains("est-construit"),
    formes: sceau?.querySelectorAll("[data-forme]").length,
    deborde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}, selecteur);

test("page introuvable : FR à la racine, EN sous /en/, sceau construit, aucun débordement", async () => {
  for (const largeur of LARGEURS) {
    for (const theme of ["light", "dark"]) {
      for (const [langue, adresse] of [["fr", "/nexiste-pas/"], ["en", "/en/nexiste-pas/"]]) {
        const page = await ouvrir(nav, serveur.url + adresse, { largeur, theme });
        const lieu = `${langue} ${largeur} px ${theme}`;
        const etat = await mesurer(page, `[data-introuvable="${langue}"] .message`);
        assert.equal(etat.titre, simple(dictionnaires[langue].etats.introuvable.titre), lieu);
        assert.equal(etat.or, true, `titre bicolore : ${lieu}`);
        assert.equal(etat.construit, true, lieu);
        assert.equal(etat.deborde, 0, lieu);
        assert.equal(await page.evaluate(() => document.documentElement.lang), langue);
        assert.equal(await page.locator("[data-introuvable]:visible").count(), 1, lieu);
        const retour = page.locator(`[data-introuvable="${langue}"] a.bouton`);
        assert.equal(await retour.getAttribute("href"), langue === "fr" ? "/" : "/en/");
        assert.ok((await retour.boundingBox()).height >= 44);
        // Seule erreur admise : le statut 404 de la page elle-même.
        assert.deepEqual(page.erreurs.filter((e) => !/status of 404/.test(e)), [], lieu);
        await page.fermer();
      }
    }
  }
});

test("réseau : « Hors connexion » à la coupure, « Connexion rétablie » au retour, puis plus rien", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { largeur: 390 });
  await page.context().setOffline(true);
  await page.waitForSelector("[data-etats-zone] .message");
  let etat = await mesurer(page, "[data-etats-zone] .message");
  assert.equal(etat.titre, simple(dictionnaires.fr.etats.horsConnexion.titre));
  assert.equal(etat.construit, true);
  assert.ok(await page.locator("[data-etats-zone] .sceau--chantier").count());
  await page.context().setOffline(false);
  await page.waitForFunction(() => document.querySelector("[data-etats-zone] .sceau--bati"));
  etat = await mesurer(page, "[data-etats-zone] .message");
  assert.equal(etat.titre, simple(dictionnaires.fr.etats.retablie.titre));
  await page.waitForFunction(() => !document.querySelector("[data-etats-zone] .message"), null, { timeout: 6000 });
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("média en échec : le message prend sa place, à sa taille, sans décaler la page", async () => {
  const page = await ouvrir(nav, "about:blank", { largeur: 390 });
  await page.route(/\.webp$/, (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto(serveur.url + "/#categorie-logotype", { waitUntil: "load" });
  await page.waitForSelector(".media--indisponible:visible");
  const etat = await page.evaluate(() => {
    const figure = [...document.querySelectorAll(".media--indisponible")].find((f) => f.offsetParent !== null);
    const boite = figure.getBoundingClientRect();
    return { largeur: boite.width, hauteur: boite.height, titre: figure.querySelector(".message__titre")?.textContent, construit: figure.querySelector(".sceau")?.classList.contains("est-construit"), images: figure.querySelectorAll("img").length };
  });
  assert.equal(etat.titre, simple(dictionnaires.fr.etats.media.titre));
  assert.equal(etat.construit, true);
  assert.equal(etat.images, 0, "plus d'image cassée");
  assert.ok(etat.largeur > 0 && etat.hauteur > 0, "le cadre garde sa taille");
  await page.fermer();
});

test("état vide : une catégorie sans réalisation porte l'état « vide », bicolore", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  const id = await page.evaluate(() => document.querySelector(".categorie-projets .message--vide")?.closest(".categorie-projets").id);
  assert.ok(id, "au moins une catégorie vide dans le contenu actuel");
  await page.goto(`${serveur.url}/#${id}`);
  const etat = await mesurer(page, `#${id} .message--vide`);
  assert.equal(etat.or, true);
  assert.equal(etat.construit, true);
  assert.ok(await page.locator(`#${id} .sceau--vide`).isVisible());
  await page.fermer();
});

test("mouvement réduit : les sceaux des états sont immobiles", async () => {
  const page = await ouvrir(nav, serveur.url + "/en/nexiste-pas/", { reduit: true });
  const animations = await page.evaluate(() => document.querySelector('[data-introuvable="en"] .sceau').getAnimations({ subtree: true }).length);
  assert.equal(animations, 0);
  await page.fermer();
});

test("MarcoS : « Chargement » pendant l'attente, puis « Indisponible » ou « Hors connexion »", async () => {
  // MarcoS n'est pas encore actif dans le contenu : la page est rendue ici
  // actif, avec une adresse de Worker simulée.
  const site = { ...contenu.site, assistant: { active: true, accueil: { fr: "Bonjour." }, exemples: [], confidentialite: { fr: "" } } };
  const sprite = fs.readFileSync("Design_System/assets/logos-sprite.svg", "utf8");
  const ctx = contextePage({ site, langue: "fr", chemin: "", dictionnaires, medias: new Map(), ressources: { sprite, couleurTheme: await lireJeton(RACINE, "--clair-surface-page"), annee: 2030, assistantEndpoint: "https://worker.test/" } });
  const html = String(rendrePage({ contenu: { ...contenu, site }, ctx, chemin: "" }));
  const page = await ouvrir(nav, "about:blank", { largeur: 390 });
  let relacher;
  const attente = new Promise((r) => { relacher = r; });
  await page.route(`${serveur.url}/`, (r) => r.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: html }));
  await page.route("https://worker.test/**", async (r) => { await attente; r.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ code: "indisponible" }) }); });
  await page.goto(`${serveur.url}/`);
  await page.evaluate(() => document.querySelector('[data-modale-ouvrir="assistant"]')?.click());
  await page.fill("[data-assistant-form] textarea", "Bonjour");
  await page.click("[data-assistant-form] button[type=submit]");
  await page.waitForSelector("[data-assistant-etat] .sceau--chargement.est-construit");
  assert.equal((await mesurer(page, "[data-assistant-etat] .message")).titre, simple(dictionnaires.fr.etats.assistant.titre));
  relacher();
  await page.waitForSelector("[data-assistant-etat] .sceau--panne.est-construit");
  const etat = await mesurer(page, "[data-assistant-etat] .message");
  assert.equal(etat.titre, simple(dictionnaires.fr.etats.indisponible.titre));
  assert.ok(await page.locator("[data-assistant-etat] [data-assistant-reessayer]").isVisible(), "Réessayer reste là");
  // Hors ligne : la même phrase que le message du site, sceau « chantier ».
  await page.context().setOffline(true);
  await page.click("[data-assistant-etat] [data-assistant-reessayer]");
  await page.waitForSelector("[data-assistant-etat] .sceau--chantier");
  assert.equal((await mesurer(page, "[data-assistant-etat] .message")).titre, simple(dictionnaires.fr.etats.horsConnexion.titre));
  await page.fermer();
});
