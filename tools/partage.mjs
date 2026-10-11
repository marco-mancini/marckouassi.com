/**
 * PARTAGE — capture la carte de partage (og:image) de chaque langue (#184).
 *
 *   npm run partage
 *
 * La carte est un gabarit du Design System (gabarits/Partage) : mêmes
 * composants, jetons et polices que le site. Le navigateur (Playwright) la
 * rend et la capture en JPEG 1200 × 630 dans Public/images/Partage/.
 *
 * Pourquoi pas au build : l'hébergeur (Vercel) n'a pas de navigateur, et
 * Sharp ne sait pas dessiner les polices du site (WOFF2). L'image est donc
 * produite ici puis versionnée ; `empreinte.json` garde les textes dont elle
 * dérive, et le build signale une carte périmée (tools/build.mjs).
 *
 * À relancer après toute modification de la couverture (édition, signature,
 * rôle, promesse) ou du portrait « À propos ».
 */
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { creerContexte } from "../Design_System/i18n/langue.js";
import { couleurJeton } from "./icones.mjs";
import { chargerFichiers } from "./contenu.mjs";
import { contextePage } from "./pages.mjs";
import { CartePartage, textesPartage } from "../Design_System/gabarits/Partage/Partage.js";

export const DOSSIER_PARTAGE = "Public/images/Partage";
export const fichierCarte = (langue) => `${DOSSIER_PARTAGE}/Carte_${langue}.jpg`;
export const FICHIER_EMPREINTE = `${DOSSIER_PARTAGE}/empreinte.json`;
export const DIMENSIONS_CARTE = { largeur: 1200, hauteur: 630 };
const QUALITE = 88;

/** Images publiées : la carte du site, et une vignette par projet ou pour le CV. */
const DOSSIER_PUBLIE = "Public/partage";
const IMAGE = /\.(png|jpe?g|webp)$/i;

/**
 * Publie les images de partage dans `sortie` et renvoie leur table, lue par
 * les gabarits (ctx.partage) :
 *   site[langue]  site.seo.image si Marc l'a choisie, sinon la carte de la langue
 *   cv            cv.seo.image, s'il y en a une (sinon celle du site)
 *   projets[id]   seo.image du projet, sinon sa première image
 * Toutes en JPEG 1200 × 630, le format que lisent tous les réseaux.
 * Une carte absente ou périmée est signalée, jamais inventée.
 */
export async function publierPartage({ racine, sortie, contenu, dictionnaires, lireSource, journal = console }) {
  const { site } = contenu;
  const { largeur, hauteur } = DIMENSIONS_CARTE;
  const entree = (src) => ({ src, largeur, hauteur });
  const fond = await couleurJeton(racine, "--clair-surface-page");
  const table = { site: {}, cv: null, projets: {} };
  const vignette = async (src, publie) => {
    try {
      const { contenu: donnees } = await lireSource(src);
      await fs.mkdir(path.dirname(path.join(sortie, publie)), { recursive: true });
      await sharp(donnees, { failOn: "none" })
        .resize(largeur, hauteur, { fit: "cover", position: sharp.strategy.attention })
        .flatten({ background: fond })
        .jpeg({ quality: QUALITE, mozjpeg: true })
        .toFile(path.join(sortie, publie));
      return entree(publie);
    } catch (erreur) {
      journal.warn(`Partage : ${src} illisible (${erreur.message}) ; pas d'image pour ${publie}`);
      return null;
    }
  };

  const empreintes = JSON.parse(await fs.readFile(path.join(racine, FICHIER_EMPREINTE), "utf8").catch(() => "{}"));
  const imageSite = site.seo?.image?.src ? await vignette(site.seo.image.src, `${DOSSIER_PUBLIE}/site.jpg`) : null;
  for (const langue of site.langues) {
    if (imageSite) { table.site[langue] = imageSite; continue; }
    const carte = fichierCarte(langue);
    try {
      await fs.mkdir(path.dirname(path.join(sortie, carte)), { recursive: true });
      await fs.copyFile(path.join(racine, carte), path.join(sortie, carte));
      table.site[langue] = entree(carte);
    } catch {
      journal.warn(`Partage : ${carte} absente ; lancer « npm run partage »`);
      continue;
    }
    const ctx = creerContexte({ langue, langueParDefaut: site.langueParDefaut, dictionnaires });
    if (JSON.stringify(empreintes[langue]) !== JSON.stringify(textesPartage({ contenu, ctx }))) {
      journal.warn(`Partage : la carte ${langue} ne correspond plus à la couverture ; lancer « npm run partage »`);
    }
  }
  if (contenu.cv?.seo?.image?.src) table.cv = await vignette(contenu.cv.seo.image.src, `${DOSSIER_PUBLIE}/cv.jpg`);
  for (const projet of contenu.projets) {
    const src = projet.seo?.image?.src ?? (projet.medias || []).find((m) => m.src && IMAGE.test(m.src) && m.type !== "video")?.src;
    if (src) {
      const image = await vignette(src, `${DOSSIER_PUBLIE}/projets/${projet.id}.jpg`);
      if (image) table.projets[projet.id] = image;
    }
  }
  return table;
}

async function main() {
  const racine = process.cwd();
  const contenu = await chargerFichiers(racine);
  const { site } = contenu;
  const dictionnaires = {};
  for (const langue of site.langues) dictionnaires[langue] = JSON.parse(await fs.readFile(path.join(racine, "Design_System/i18n", `${langue}.json`), "utf8"));
  const sprite = await fs.readFile(path.join(racine, "Design_System/assets/logos-sprite.svg"), "utf8");
  // Racine en URL de fichier : la page temporaire charge les vraies
  // ressources du dépôt (Index.css, polices, portrait source).
  const base = `${pathToFileURL(racine).href}/`;
  const temporaire = await fs.mkdtemp(path.join(os.tmpdir(), "partage-"));
  // Le portrait source, tel quel : la capture le réduit elle-même.
  const portrait = contenu.sections.find((section) => section.type === "apropos")?.portrait?.src;
  if (!portrait || !contenu.sections.some((section) => section.type === "couverture")) throw new Error("Carte de partage : il faut la section couverture et le portrait de « À propos »");
  const medias = new Map([[portrait, { src: portrait, type: "image" }]]);
  // Import différé : le build importe ce module sans navigateur (Vercel).
  const { chromium } = await import("playwright");
  const navigateur = await chromium.launch();
  const empreintes = {};
  try {
    const page = await navigateur.newPage({ viewport: { width: DIMENSIONS_CARTE.largeur, height: DIMENSIONS_CARTE.hauteur }, colorScheme: "light", reducedMotion: "reduce" });
    for (const langue of site.langues) {
      const ctx = contextePage({ site, langue, chemin: "", dictionnaires, medias, ressources: { racine: base } });
      const fichier = path.join(temporaire, `carte-${langue}.html`);
      await fs.writeFile(fichier, `<!doctype html><html lang="${langue}"><head><meta charset="utf-8"><link rel="stylesheet" href="${base}Design_System/styles/Index.css"></head><body style="margin:0">${sprite}${CartePartage({ contenu, ctx })}</body></html>`);
      await page.goto(pathToFileURL(fichier).href);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
      const sortie = path.join(racine, fichierCarte(langue));
      await fs.mkdir(path.dirname(sortie), { recursive: true });
      await page.locator(".partage").screenshot({ path: sortie, type: "jpeg", quality: QUALITE });
      empreintes[langue] = textesPartage({ contenu, ctx });
      console.log(`Carte de partage : ${fichierCarte(langue)}`);
    }
  } finally {
    await navigateur.close();
    await fs.rm(temporaire, { recursive: true, force: true });
  }
  await fs.writeFile(path.join(racine, FICHIER_EMPREINTE), `${JSON.stringify(empreintes, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
