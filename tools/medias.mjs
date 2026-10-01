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
const IMAGES = new Set([".png", ".jpg", ".jpeg", ".webp"]);
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
    // Un média du stockage (« stockage:medias/x.png ») est publié sous Public/medias/.
    const base = src.startsWith(PREFIXE_STOCKAGE) ? `Public/${src.slice(PREFIXE_STOCKAGE.length)}` : src;
    const publie = estImage ? base.slice(0, -extension.length) + ".webp" : base;
    const cible = path.join(sortie, publie);
    try {
      const source = await lireSource(src);
      await fs.mkdir(path.dirname(cible), { recursive: true });
      if (!estImage) {
        await fs.writeFile(cible, source.contenu);
        table.set(src, { src: publie, type: extension === ".pdf" ? "document" : extension.match(/\.(mp4|webm)$/) ? "video" : "fichier" });
        bilan.copies += 1;
        continue;
      }
      const cle = crypto.createHash("sha1").update(`${src}|${source.empreinte}|${JSON.stringify(REGLAGES)}|${JSON.stringify(fond)}`).digest("hex");
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
        const { data, info: ecrit } = await image
          .resize({ width: Math.min(REGLAGES.largeurMax, info.width || REGLAGES.largeurMax), withoutEnlargement: true })
          .flatten({ background: fond })
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
