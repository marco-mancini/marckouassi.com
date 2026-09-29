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

/**
 * Compresse une image vers WebP et renvoie son poids ET ses dimensions
 * reelles.
 *
 * Les dimensions sont celles du fichier ECRIT, pas celles de la source :
 * le redimensionnement a 1600 px les change, et c'est le fichier servi
 * que le navigateur doit reserver.
 */
async function compresserImage(source, destination) {
  const image = sharp(source, { failOn: "none" }).rotate(); // rotate() applique l'orientation EXIF
  const meta = await image.metadata();

  const { data, info } = await image
    .resize({
      width: Math.min(LARGEUR_MAX, meta.width || LARGEUR_MAX),
      withoutEnlargement: true,
    })
    .flatten({ background: FOND })
    .webp({ quality: QUALITE_WEBP, effort: 5 })
    .toBuffer({ resolveWithObject: true });

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, data);
  return { poids: data.length, largeur: info.width, hauteur: info.height };
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

/**
 * Aligne les attributs width/height des balises <img> du HTML sur les
 * dimensions du fichier WebP reellement produit.
 *
 * Les sources declarent la taille de l'image d'origine ; le build la
 * redimensionne a 1600 px. Le ratio survit au redimensionnement, mais
 * pas toujours : une source dont les dimensions declarees a la main ne
 * correspondaient deja plus au fichier reservait une boite au mauvais
 * rapport, et la page sautait au chargement.
 */
function reecrireDimensionsHtml(texte, dimensions) {
  let corrigees = 0;
  const sortie = texte.replace(/<img\b[^>]*>/g, (balise) => {
    const src = balise.match(/\bsrc="([^"]+)"/);
    if (!src) return balise;
    const taille = dimensions.get(src[1]);
    if (!taille) return balise;
    let touchee = false;
    const neuve = balise
      .replace(/\bwidth="\d+"/, () => { touchee = true; return `width="${taille[0]}"`; })
      .replace(/\bheight="\d+"/, () => `height="${taille[1]}"`);
    if (touchee && neuve !== balise) corrigees += 1;
    return neuve;
  });
  return { texte: sortie, corrigees };
}

/**
 * Injecte la table des dimensions reelles en tete du script, et branche
 * la creation des images dessus.
 *
 * On ne touche NI aux donnees des projets, NI aux fonctions qui les
 * construisent : la table sert de correction au dernier moment, quand
 * l'element <img> est fabrique. Une image absente de la table garde les
 * valeurs declarees.
 */
function injecterTableDimensions(texte, dimensions) {
  const table = JSON.stringify(Object.fromEntries(dimensions));
  const entete =
    "/* Genere au build : dimensions reelles des fichiers WebP servis. */\n" +
    "var DIMENSIONS_SERVIES = " + table + ";\n";

  const avant = 'image.width = asset.width;\n    image.height = asset.height;';
  const apres =
    'var tailleServie = DIMENSIONS_SERVIES[asset.src];\n' +
    '    image.width = tailleServie ? tailleServie[0] : asset.width;\n' +
    '    image.height = tailleServie ? tailleServie[1] : asset.height;';
  if (!texte.includes(avant)) {
    throw new Error(
      "Le point d'insertion des dimensions a disparu de script.js. " +
      "Sans lui, le site publierait des tailles d'image fausses en silence."
    );
  }
  return entete + texte.replace(avant, apres);
}

async function main() {
  const debut = Date.now();
  await viderDossier(SORTIE);

  // 1. Système de design (styles, polices, logos) copié tel quel.
  await copierDossier(path.join(RACINE, "Design_System"), path.join(SORTIE, "Design_System"));

  // 2. Visuels : compression de chaque image, copie simple pour le reste.
  //    On releve au passage les dimensions reelles de chaque WebP ecrit.
  const sourceImages = path.join(RACINE, "Public", "images");
  const sortieImages = path.join(SORTIE, "Public", "images");
  const fichiers = await listerFichiers(sourceImages);

  let poidsAvant = 0;
  let poidsApres = 0;
  let compressees = 0;
  const echecs = [];
  const dimensions = new Map(); // chemin web servi -> [largeur, hauteur]

  for (const fichier of fichiers) {
    const relatif = path.relative(sourceImages, fichier);
    const extension = path.extname(fichier).toLowerCase();
    const taille = (await fs.stat(fichier)).size;
    poidsAvant += taille;

    if (!EXTENSIONS_IMAGE.has(extension)) continue; // on ignore les fichiers non-image

    const sansExtension = relatif.slice(0, relatif.length - extension.length);
    const destination = path.join(sortieImages, sansExtension + ".webp");

    try {
      const rendu = await compresserImage(fichier, destination);
      poidsApres += rendu.poids;
      compressees += 1;
      dimensions.set(
        "Public/images/" + sansExtension.split(path.sep).join("/") + ".webp",
        [rendu.largeur, rendu.hauteur]
      );
    } catch (erreur) {
      echecs.push(`${relatif} : ${erreur.message}`);
    }
  }

  // 3. Page et script : références réécrites vers les WebP, puis
  //    dimensions alignées sur les fichiers réellement produits.
  //    Cet ordre est obligatoire : les dimensions sont indexées sur les
  //    chemins .webp, qui n'existent qu'après la réécriture.
  let dimensionsCorrigees = 0;
  for (const fichier of ["index.html", "script.js"]) {
    const contenu = await fs.readFile(path.join(RACINE, "Frontend", fichier), "utf8");
    let sortie = reecrireReferences(contenu);
    if (fichier === "index.html") {
      const r = reecrireDimensionsHtml(sortie, dimensions);
      sortie = r.texte;
      dimensionsCorrigees += r.corrigees;
    } else {
      sortie = injecterTableDimensions(sortie, dimensions);
    }
    await fs.writeFile(path.join(SORTIE, fichier), sortie, "utf8");
  }

  // 4. Nécessaire pour que GitHub Pages ne filtre pas les dossiers.
  await fs.writeFile(path.join(SORTIE, ".nojekyll"), "");

  const mo = (octets) => (octets / 1024 / 1024).toFixed(1);
  console.log(`Images compressées : ${compressees}/${fichiers.length}`);
  console.log(`Poids des visuels  : ${mo(poidsAvant)} Mo → ${mo(poidsApres)} Mo`);
  if (poidsAvant > 0) {
    console.log(`Réduction          : ${Math.round(100 - (poidsApres / poidsAvant) * 100)} %`);
  }
  console.log(`Dimensions alignées: ${dimensionsCorrigees} balise(s) <img>, ${dimensions.size} entrées pour le script`);
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
