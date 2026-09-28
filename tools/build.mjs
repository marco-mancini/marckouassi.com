/**
 * Construction du site publiable.
 *
 * Assemble le contenu de `Frontend/`, `Design_System/` et `Public/images/`
 * dans un dossier `_site`, en compressant automatiquement chaque visuel.
 *
 * Les images d'origine ne sont jamais modifiées : on dépose ce qu'on veut
 * dans `Public/images` (PNG, JPEG, WebP, quelle que soit la taille), et la
 * compression se fait ici, à chaque publication. Les références aux images
 * sont réécrites au passage pour pointer vers les versions allégées.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RACINE = process.cwd();
const SORTIE = path.join(RACINE, "_site");

const LARGEUR_MAX = 1600;   // au-delà, inutile pour un affichage écran
const QUALITE_WEBP = 78;
const FOND = { r: 255, g: 255, b: 242 }; // crème du site, pour aplatir la transparence
const EXTENSIONS_IMAGE = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function viderDossier(cible) {
  await fs.rm(cible, { recursive: true, force: true });
  await fs.mkdir(cible, { recursive: true });
}

async function listerFichiers(racine) {
  const resultats = [];
  async function parcourir(dossier) {
    let entrees;
    try {
      entrees = await fs.readdir(dossier, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entree of entrees) {
      const complet = path.join(dossier, entree.name);
      if (entree.isDirectory()) await parcourir(complet);
      else resultats.push(complet);
    }
  }
  await parcourir(racine);
  return resultats.sort();
}

async function copierDossier(source, destination) {
  await fs.cp(source, destination, { recursive: true });
}

/** Compresse une image vers WebP et renvoie le poids obtenu. */
async function compresserImage(source, destination) {
  const image = sharp(source, { failOn: "none" }).rotate(); // rotate() applique l'orientation EXIF
  const meta = await image.metadata();

  const donnees = await image
    .resize({
      width: Math.min(LARGEUR_MAX, meta.width || LARGEUR_MAX),
      withoutEnlargement: true,
    })
    .flatten({ background: FOND })
    .webp({ quality: QUALITE_WEBP, effort: 5 })
    .toBuffer();

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, donnees);
  return donnees.length;
}

/**
 * Réécrit les références d'images vers le format compressé.
 * On ne touche qu'aux chemins situés sous Public/images pour ne pas
 * affecter les polices, le CV ou les logos SVG.
 */
function reecrireReferences(texte) {
  return texte.replace(
    /(Public\/images\/[^"'`)\s]+?)\.(png|jpe?g)\b/gi,
    (_, base) => `${base}.webp`
  ).replace(
    // script.js construit certains noms par concaténation : prefixe + numero + ".png"
    /(["'])\.(png|jpe?g)\1/gi,
    (_, guillemet) => `${guillemet}.webp${guillemet}`
  );
}

async function main() {
  const debut = Date.now();
  await viderDossier(SORTIE);

  // 1. Page et script, avec réécriture des références d'images.
  for (const fichier of ["index.html", "script.js"]) {
    const contenu = await fs.readFile(path.join(RACINE, "Frontend", fichier), "utf8");
    await fs.writeFile(path.join(SORTIE, fichier), reecrireReferences(contenu), "utf8");
  }

  // 2. Système de design (styles, polices, logos) copié tel quel.
  await copierDossier(path.join(RACINE, "Design_System"), path.join(SORTIE, "Design_System"));

  // 3. Visuels : compression de chaque image, copie simple pour le reste.
  const sourceImages = path.join(RACINE, "Public", "images");
  const sortieImages = path.join(SORTIE, "Public", "images");
  const fichiers = await listerFichiers(sourceImages);

  let poidsAvant = 0;
  let poidsApres = 0;
  let compressees = 0;
  const echecs = [];

  for (const fichier of fichiers) {
    const relatif = path.relative(sourceImages, fichier);
    const extension = path.extname(fichier).toLowerCase();
    const taille = (await fs.stat(fichier)).size;
    poidsAvant += taille;

    if (!EXTENSIONS_IMAGE.has(extension)) continue; // on ignore les fichiers non-image

    const destination = path.join(
      sortieImages,
      relatif.slice(0, relatif.length - extension.length) + ".webp"
    );

    try {
      poidsApres += await compresserImage(fichier, destination);
      compressees += 1;
    } catch (erreur) {
      echecs.push(`${relatif} : ${erreur.message}`);
    }
  }

  // 4. Nécessaire pour que GitHub Pages ne filtre pas les dossiers.
  await fs.writeFile(path.join(SORTIE, ".nojekyll"), "");

  const mo = (octets) => (octets / 1024 / 1024).toFixed(1);
  console.log(`Images compressées : ${compressees}/${fichiers.length}`);
  console.log(`Poids des visuels  : ${mo(poidsAvant)} Mo → ${mo(poidsApres)} Mo`);
  if (poidsAvant > 0) {
    console.log(`Réduction          : ${Math.round(100 - (poidsApres / poidsAvant) * 100)} %`);
  }
  console.log(`Durée              : ${Math.round((Date.now() - debut) / 1000)} s`);

  if (echecs.length) {
    console.log(`\n${echecs.length} image(s) non traitée(s) :`);
    for (const echec of echecs) console.log(`  - ${echec}`);
  }
}

main().catch((erreur) => {
  console.error("Échec de la construction :", erreur);
  process.exit(1);
});
