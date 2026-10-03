/**
 * CMS Git dans un vrai navigateur : le Sveltia CMS publié dans _site/admin,
 * en mode « dépôt local ». Le sélecteur de dossier est remplacé par un
 * dossier du navigateur (OPFS) qui contient content/ : le CMS y lit et y
 * écrit exactement ce qu'il commiterait sur GitHub. Prérequis : npm run build.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { servir, lancer } from "./outils.mjs";

const FICHIERS = [["site", "Paramètres du site"], ["sections", "Sections"], ["projets", "Projets"], ["cv", "CV"]];
const contenus = Object.fromEntries(FICHIERS.map(([nom]) => [nom, fs.readFileSync(`content/${nom}.json`, "utf8")]));
const IMAGE = "Public/images/Projet_VOON_01.png";
/* Seuls appels extérieurs tolérés : vérification de version et état de GitHub. Aucune police, aucune icône. */
const HOTES_TOLERES = new Set(["unpkg.com", "www.githubstatus.com"]);
let serveur; let nav;
before(async () => { serveur = await servir(); nav = await lancer(); });
after(async () => { await nav?.close(); serveur?.fermer(); });

/** Ouvre le CMS sur un dépôt local simulé contenant content/. */
async function ouvrirCms() {
  const contexte = await nav.newContext({ locale: "en-US", viewport: { width: 1280, height: 1000 } });
  const page = await contexte.newPage();
  page.erreurs = []; page.distants = [];
  page.on("pageerror", (e) => page.erreurs.push(e.message));
  page.on("request", (r) => { const url = new URL(r.url()); if (!["http:", "https:"].includes(url.protocol) || r.url().startsWith(serveur.url)) return; page.distants.push(url); });
  await page.goto(`${serveur.url}/admin/config.json`);
  await page.evaluate(async (contenus) => {
    const racine = await navigator.storage.getDirectory();
    await racine.getDirectoryHandle(".git", { create: true });
    const dossier = await racine.getDirectoryHandle("content", { create: true });
    for (const [nom, texte] of Object.entries(contenus)) {
      const ecriture = await (await dossier.getFileHandle(`${nom}.json`, { create: true })).createWritable();
      await ecriture.write(texte); await ecriture.close();
    }
  }, contenus);
  await contexte.addInitScript(() => { window.showDirectoryPicker = async () => navigator.storage.getDirectory(); });
  await page.goto(`${serveur.url}/admin/`);
  await page.getByText("Work with Local Repository").click();
  await page.getByText(FICHIERS[0][1], { exact: true }).first().waitFor();
  // Le CMS peut finir d'écrire juste après l'annonce « Entry saved » : quelques essais.
  page.lire = (chemin) => page.evaluate(async (chemin) => {
    for (let essai = 0; ; essai += 1) {
      try {
        let dossier = await navigator.storage.getDirectory();
        const parties = chemin.split("/");
        for (const partie of parties.slice(0, -1)) dossier = await dossier.getDirectoryHandle(partie);
        return new Uint8Array(await (await (await dossier.getFileHandle(parties.at(-1))).getFile()).arrayBuffer());
      } catch (erreur) {
        if (essai >= 20) throw erreur;
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  }, chemin).then((octets) => Buffer.from(Object.values(octets)));
  page.fermer = () => contexte.close();
  return page;
}

/** Ouvre une entrée et attend que ses champs portent leurs valeurs. */
async function ouvrirEntree(page, libelle) {
  await page.waitForTimeout(1500);
  const ligne = page.getByRole("row").filter({ hasText: libelle, visible: true }).first();
  if (!(await ligne.isVisible())) await page.goto(`${serveur.url}/admin/#/collections/contenu`);
  await ligne.waitFor({ state: "visible" });
  await ligne.click();
  const champ = page.locator("input[type=text]:visible, textarea:visible").first();
  await champ.waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll("input[type=text], textarea")].some((e) => e.value), null, { timeout: 15000 });
  await page.waitForTimeout(800);
  return champ;
}

/** Contenu JSON d'un fichier une fois réécrit par le CMS (différent de l'ancien, complet). */
async function lireReecrit(page, chemin, ancien) {
  for (let essai = 0; essai < 40; essai += 1) {
    const texte = (await page.lire(chemin)).toString("utf8");
    try { if (texte !== ancien) { JSON.parse(texte); return texte; } } catch { /* écriture en cours */ }
    await page.waitForTimeout(250);
  }
  throw new Error(`${chemin} n'a pas été réécrit`);
}

async function enregistrer(page) {
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByText("Entry saved.").waitFor();
}

test("page du CMS : non indexée, quatre fichiers de content/, ni police ni icône distante", async () => {
  const page = await ouvrirCms();
  assert.equal(await page.getAttribute('meta[name="robots"]', "content"), "noindex, nofollow");
  for (const [, libelle] of FICHIERS) assert.ok(await page.getByText(libelle, { exact: true }).first().isVisible(), libelle);
  await page.waitForTimeout(1500);
  const hotes = [...new Set(page.distants.map((url) => url.hostname))];
  assert.deepEqual(hotes.filter((hote) => !HOTES_TOLERES.has(hote)), [], `appels extérieurs : ${hotes.join(", ")}`);
  assert.ok(!page.distants.some((url) => /\.(woff2?|ttf|otf|css)$/.test(url.pathname)), "police ou feuille de style distante");
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("enregistrer depuis le CMS ne change que la ligne modifiée, dans chacun des quatre fichiers", async () => {
  const page = await ouvrirCms();
  for (const [nom, libelle] of FICHIERS) {
    const champ = await ouvrirEntree(page, libelle);
    const avant = await champ.inputValue();
    await champ.fill(`${avant} ESSAI`);
    await enregistrer(page);
    const attendu = contenus[nom].split(JSON.stringify(avant).slice(1, -1)).join(JSON.stringify(`${avant} ESSAI`).slice(1, -1));
    assert.deepEqual(JSON.parse(await lireReecrit(page, `content/${nom}.json`, contenus[nom])), JSON.parse(attendu), `${nom}.json : autre chose que le champ modifié a changé`);
  }
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("image téléversée : déposée telle quelle dans Public/images, chemin « /Public/images/… » dans content/", async () => {
  const page = await ouvrirCms();
  await ouvrirEntree(page, "Paramètres du site");
  await page.getByRole("checkbox", { name: /Image/ }).first().click();
  await page.getByText("Browse", { exact: true }).first().click();
  const choix = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /upload/i }).first().click();
  await (await choix).setFiles(IMAGE);
  await page.getByRole("button", { name: "Insert" }).click();
  await page.waitForTimeout(800);
  await enregistrer(page);
  const site = JSON.parse(await lireReecrit(page, "content/site.json", contenus.site));
  assert.match(site.seo.image.src, /^\/Public\/images\/[^/]+\.png$/);
  const depose = await page.lire(site.seo.image.src.slice(1));
  assert.ok(depose.equals(fs.readFileSync(IMAGE)), "le CMS doit déposer l'original, sans le recompresser");
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});
