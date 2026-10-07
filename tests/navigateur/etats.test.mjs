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

test("MarcoS : le gabarit d'état au sceau, sur une ligne à l'attente, cerné d'un filet à l'erreur", async () => {
  // CE QUE CE TEST GARANTIT MAINTENANT, et pourquoi il a encore changé de forme.
  //
  // Version du 7 octobre (#162) : le gabarit au sceau, mais sur l'ancienne
  // fenêtre, avec des sélecteurs qui n'existent plus.
  // Version suivante : la bulle à trois points de la maquette (D-40).
  // Celle-ci : le gabarit au sceau revient, en mode `nu`, après arbitrage de
  // Marc sur #166 — mais sur UNE LIGNE à l'attente, parce que le gabarit
  // complet coûtait 173 px dans un panneau de 460 et faisait déborder le fil.
  const site = { ...contenu.site, assistant: { ...contenu.site.assistant, active: true } };
  const sprite = fs.readFileSync("Design_System/assets/logos-sprite.svg", "utf8");
  const ctx = contextePage({ site, langue: "fr", chemin: "", dictionnaires, medias: new Map(), ressources: { sprite, couleurTheme: await lireJeton(RACINE, "--clair-surface-page"), annee: 2030, assistantEndpoint: "https://worker.test/" } });
  const html = String(rendrePage({ contenu: { ...contenu, site }, ctx, chemin: "" }));

  const page = await ouvrir(nav, "about:blank", { largeur: 390 });
  let relacher;
  const attente = new Promise((r) => { relacher = r; });
  await page.route(`${serveur.url}/`, (r) => r.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: html }));
  await page.route("https://worker.test/**", async (r) => { await attente; r.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ erreur: "indisponible" }) }); });
  await page.goto(`${serveur.url}/`);

  await page.evaluate(() => document.getElementById("introduction")?.scrollIntoView({ block: "start" }));
  await page.waitForFunction(() => document.querySelector(".marcos")?.dataset.retire === "0");
  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  await page.fill("#assistant-question", "Bonjour");
  await page.click("[data-assistant-envoyer]");

  // ATTENTE — le sceau « chargement », sur une ligne, dans le fil.
  await page.waitForSelector("[data-assistant-pense] .sceau--chargement.est-construit");
  assert.equal(await page.locator(".marcos[data-etat=thinking]").count(), 1, "le buste réfléchit");
  const attenteMesure = await page.evaluate(() => {
    const m = document.querySelector("[data-assistant-pense] .message");
    const p = document.querySelector("[data-assistant-pense] .message__phrase");
    return { h: Math.round(m.getBoundingClientRect().height), ligne: m.classList.contains("message--ligne"),
      phraseDansLeDom: Boolean(p?.textContent.trim()), phraseVisible: p.getBoundingClientRect().width > 2 };
  });
  assert.equal(attenteMesure.ligne, true);
  assert.ok(attenteMesure.h < 80, `l'attente tient sur une ligne : ${attenteMesure.h} px`);
  // La phrase est masquée à l'œil mais reste lue : c'est la contrepartie du mode `ligne`.
  assert.equal(attenteMesure.phraseDansLeDom, true, "la phrase reste lue par un lecteur d'écran");
  assert.equal(attenteMesure.phraseVisible, false, "mais elle n'occupe pas la place");

  relacher();

  // ERREUR — sous le fil, cernée d'un filet, titre « Indisponible », jamais tronquée.
  await page.waitForSelector("[data-assistant-erreur] .sceau--panne.est-construit");
  const zone = page.locator("[data-assistant-erreur]");
  assert.equal(await zone.getAttribute("role"), "alert");
  const erreurMesure = await page.evaluate(() => {
    const m = document.querySelector("[data-assistant-erreur] .message");
    const r = m.getBoundingClientRect(), p = document.querySelector("#assistant").getBoundingClientRect();
    return { nu: m.classList.contains("message--nu"), filet: getComputedStyle(m).borderTopWidth,
      titre: m.querySelector(".message__titre")?.textContent,
      entiere: r.top >= p.top - 1 && r.bottom <= p.bottom + 1 };
  });
  assert.equal(erreurMesure.nu, true, "sans îlot : le panneau est déjà une surface");
  assert.notEqual(erreurMesure.filet, "0px", "un filet la distingue d'un chargement");
  assert.equal(erreurMesure.titre, simple(dictionnaires.fr.etats.indisponible.titre));
  assert.equal(erreurMesure.entiere, true, "l'erreur n'est jamais tronquée : elle est sous le fil");
  assert.ok((await zone.textContent()).includes(dictionnaires.fr.assistant.erreurs.indisponible));
  assert.ok(await page.locator("[data-assistant-reessayer]").isVisible());
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);

  // HORS LIGNE — son propre titre, son propre sceau.
  await page.context().setOffline(true);
  await page.click("[data-assistant-reessayer]");
  await page.waitForSelector("[data-assistant-erreur] .sceau--chantier");
  assert.equal(await page.evaluate(() => document.querySelector("[data-assistant-erreur] .message__titre").textContent),
    simple(dictionnaires.fr.etats.horsConnexion.titre));
  await page.fermer();
});
