/**
 * MÉDIAS — optimisation des images et publication des fichiers.
 *
 * Réglages identiques à l'ancien build : largeur maximale 1600 px, WebP
 * qualité 78, orientation EXIF appliquée, transparence aplatie sur le
 * crème du site. Chaque image n'est traitée qu'une fois : le résultat
 * est mis en cache (.cache/medias), clé = chemin + empreinte du contenu + réglages.
 *
 * Les dimensions publiées sont celles du fichier ÉCRIT : ce sont elles
 * que le navigateur doit réserver.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

export const REGLAGES = { largeurMax: 1600, qualite: 78, effort: 5 };

/**
 * Part de pixels non opaques au-delà de laquelle on GARDE la transparence au
 * lieu de l'aplatir.
 *
 * Pourquoi un seuil, et pourquoi celui-là. Mesuré sur les 115 images du dépôt
 * le 2 octobre 2026 : 64 portent un canal alpha **inutilisé** — un export qui
 * traîne un canal entièrement opaque — et 4 seulement ont un pixel non opaque.
 * Sur ces 4, trois sont à 0,0 %, 0,0 % et 0,9 % : de l'anticrénelage de bord.
 * La quatrième, le portrait détouré, est à **49,2 %**.
 *
 * Le seuil est donc posé dans un intervalle de 48 points où rien ne vit. Il
 * sépare une image réellement découpée d'un canal alpha résiduel, sans avoir à
 * déclarer quoi que ce soit dans le contenu.
 */
export const SEUIL_TRANSPARENCE = 0.05;

/**
 * Part de pixels non opaques d'une image, mesurée sur une réduction : on
 * cherche la PRÉSENCE de transparence, pas sa carte exacte.
 */
export async function partTransparente(entree) {
  const { data, info } = await sharp(entree, { failOn: "none" })
    .resize({ width: 400, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let nonOpaques = 0;
  for (let i = 3; i < data.length; i += info.channels) if (data[i] < 250) nonOpaques += 1;
  return nonOpaques / (info.width * info.height);
}
const IMAGES = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const SVG = ".svg";
export const PREFIXE_STOCKAGE = "stockage:";

/** Crème d'aplatissement, lu dans Tokens.css : aucune couleur recopiée. */
export async function lireJeton(racine, nom) {
  const tokens = await fs.readFile(path.join(racine, "Design_System/fondations/Tokens.css"), "utf8");
  const trouve = tokens.match(new RegExp(`${nom}:\\s*(#[0-9a-fA-F]{6})`));
  if (!trouve) throw new Error(`Jeton ${nom} introuvable dans Tokens.css`);
  return trouve[1];
}

function hexVersRvb(hex) {
  return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
}

/**
 * Publie chaque média référencé dans `sortie`. Renvoie la table
 * source → { chemin publié, largeur, hauteur, type }.
 * `lireSource(src)` fournit le fichier (disque local ou stockage distant).
 */
export async function publierMedias({ references, racine, sortie, lireSource, journal = console }) {
  const cache = path.join(racine, ".cache", "medias");
  await fs.mkdir(cache, { recursive: true });
  const fond = hexVersRvb(await lireJeton(racine, "--clair-surface-page"));
  const table = new Map();
  const bilan = { images: 0, copies: 0, depuisCache: 0, echecs: [] };

  for (const src of references) {
    const extension = path.extname(src).toLowerCase();
    const estImage = IMAGES.has(extension);
    const estSvg = extension === SVG;
    // Un média du stockage (« stockage:medias/x.png ») est publié sous Public/medias/.
    const base = src.startsWith(PREFIXE_STOCKAGE) ? `Public/${src.slice(PREFIXE_STOCKAGE.length)}` : src;
    const publie = estImage ? base.slice(0, -extension.length) + ".webp" : base;
    const cible = path.join(sortie, publie);
    try {
      const source = await lireSource(src);
      await fs.mkdir(path.dirname(cible), { recursive: true });
      if (estSvg) {
        const texte = source.contenu.toString("utf8");
        const racineSvg = texte.match(/<svg\b[^>]*>/i)?.[0];
        const viewBox = racineSvg?.match(/\bviewBox=["']\s*([\d.+-]+)[ ,]+([\d.+-]+)[ ,]+([\d.+-]+)[ ,]+([\d.+-]+)\s*["']/i);
        if (!racineSvg || !viewBox) throw new Error("SVG sans viewBox exploitable");
        const largeur = Number(viewBox[3]);
        const hauteur = Number(viewBox[4]);
        if (!(largeur > 0 && hauteur > 0)) throw new Error("Dimensions SVG invalides");
        await fs.writeFile(cible, source.contenu);
        table.set(src, { src: publie, type: "image", largeur, hauteur, mime: "image/svg+xml" });
        bilan.copies += 1;
        continue;
      }
      if (!estImage) {
        await fs.writeFile(cible, source.contenu);
        table.set(src, { src: publie, type: extension === ".pdf" ? "document" : extension.match(/\.(mp4|webm)$/) ? "video" : "fichier" });
        bilan.copies += 1;
        continue;
      }
      // La décision de garder l'alpha entre dans la clé de cache : sans cela, une
      // image déjà aplatie serait resservie telle quelle.
      const transparence = await partTransparente(source.contenu).catch(() => 0);
      const garderAlpha = transparence >= SEUIL_TRANSPARENCE;
      const cle = crypto.createHash("sha1").update(`${src}|${source.empreinte}|${JSON.stringify(REGLAGES)}|${JSON.stringify(fond)}|alpha:${garderAlpha}`).digest("hex");
      const enCache = path.join(cache, `${cle}.webp`);
      const meta = path.join(cache, `${cle}.json`);
      let dimensions;
      try {
        dimensions = JSON.parse(await fs.readFile(meta, "utf8"));
        await fs.copyFile(enCache, cible);
        bilan.depuisCache += 1;
      } catch {
        const image = sharp(source.contenu, { failOn: "none" }).rotate();
        const info = await image.metadata();
        let rendu = image.resize({ width: Math.min(REGLAGES.largeurMax, info.width || REGLAGES.largeurMax), withoutEnlargement: true });
        // Une image réellement détourée garde sa transparence : elle se pose sur
        // `--surface-image`, qui suit le thème. L'aplatir sur la couleur papier
        // mettrait un rectangle clair derrière le sujet en mode sombre.
        if (!garderAlpha) rendu = rendu.flatten({ background: fond });
        const { data, info: ecrit } = await rendu
          .webp({ quality: REGLAGES.qualite, effort: REGLAGES.effort })
          .toBuffer({ resolveWithObject: true });
        await fs.writeFile(enCache, data);
        dimensions = { largeur: ecrit.width, hauteur: ecrit.height };
        await fs.writeFile(meta, JSON.stringify(dimensions));
        await fs.writeFile(cible, data);
        bilan.images += 1;
      }
      table.set(src, { src: publie, type: "image", ...dimensions });
    } catch (erreur) {
      bilan.echecs.push(`${src} : ${erreur.message}`);
    }
  }
  journal.log(`Médias : ${bilan.images} optimisés, ${bilan.depuisCache} depuis le cache, ${bilan.copies} copiés, ${bilan.echecs.length} en échec`);
  for (const echec of bilan.echecs) journal.log(`  - ${echec}`);
  return { table, bilan };
}

/** Source locale : un fichier du dépôt. */
export function sourceLocale(racine) {
  return async (src) => {
    // Empreinte du CONTENU, pas de la date : stable d'un clonage à l'autre (cache de CI).
    const contenu = await fs.readFile(path.join(racine, src));
    return { contenu, empreinte: crypto.createHash("sha1").update(contenu).digest("hex") };
  };
}

/**
 * Source distante : les médias déposés depuis le back-office vivent dans
 * le stockage Supabase (seau public « medias », noms aléatoires). Les
 * autres restent lus dans le dépôt. Grâce au cache, un original n'est
 * téléchargé qu'une fois.
 */
export function sourceDistante({ racine, url }) {
  const locale = sourceLocale(racine);
  return async (src) => {
    if (!src.startsWith(PREFIXE_STOCKAGE)) return locale(src);
    const reponse = await fetch(`${url}/storage/v1/object/public/${src.slice(PREFIXE_STOCKAGE.length)}`);
    if (!reponse.ok) throw new Error(`stockage ${reponse.status}`);
    const contenu = Buffer.from(await reponse.arrayBuffer());
    return { contenu, empreinte: crypto.createHash("sha1").update(contenu).digest("hex") };
  };
}
