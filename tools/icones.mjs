/**
 * ICÔNES — favicon et icônes d'application, générés au build (#183).
 *
 * Source unique : le symbole `#logo-mk-seal` du sprite
 * (Design_System/assets/logos-sprite.svg), le sceau complet. Ses couleurs
 * sont des jetons (--logo-fond, --logo-lettre, --logo-accent) : ils prennent
 * ici les valeurs du « sceau vert » de Tokens.css (--sceau-vert-*). Aucun
 * dessin n'est recopié, aucune couleur n'est écrite ici.
 *
 * Produit à la racine de la sortie :
 *   favicon.svg           vectoriel, net à toute taille (navigateurs récents)
 *   favicon.ico           16, 32 et 48 px (anciens navigateurs, outils, /favicon.ico)
 *   apple-touch-icon.png  180 px, fond plein (iOS remplit la transparence en noir)
 *   icone-192.png, icone-512.png, site.webmanifest  (Android, écran d'accueil)
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { lireJeton } from "./medias.mjs";

/** Fichiers produits, dans l'ordre où le gabarit de page les déclare. */
export const ICONES = {
  svg: "favicon.svg",
  ico: "favicon.ico",
  apple: "apple-touch-icon.png",
  manifeste: "site.webmanifest",
  android: [{ fichier: "icone-192.png", taille: 192 }, { fichier: "icone-512.png", taille: 512 }],
};
const TAILLES_ICO = [16, 32, 48];
const TAILLE_APPLE = 180;

/** Valeur d'un jeton, en suivant ses renvois `var(--autre)` jusqu'à une couleur. */
export async function couleurJeton(racine, nom) {
  const tokens = await fs.readFile(path.join(racine, "Design_System/fondations/Tokens.css"), "utf8");
  const renvoi = tokens.match(new RegExp(`${nom}:\\s*var\\((--[\\w-]+)\\)`));
  return renvoi ? couleurJeton(racine, renvoi[1]) : lireJeton(racine, nom);
}

/** Le sceau complet, fond vert, en SVG autonome. */
export async function sceauVert(racine) {
  const sprite = await fs.readFile(path.join(racine, "Design_System/assets/logos-sprite.svg"), "utf8");
  const symbole = sprite.match(/<symbol id="logo-mk-seal" viewBox="([^"]+)">([\s\S]*?)<\/symbol>/);
  if (!symbole) throw new Error("Symbole #logo-mk-seal introuvable dans logos-sprite.svg");
  const couleurs = {
    "--logo-fond": await couleurJeton(racine, "--sceau-vert-fond"),
    "--logo-lettre": await couleurJeton(racine, "--sceau-vert-lettre"),
    "--logo-accent": await couleurJeton(racine, "--sceau-vert-accent"),
  };
  const dessin = symbole[2]
    .replace(/var\((--logo-[\w-]+)\)/g, (tout, jeton) => {
      if (!couleurs[jeton]) throw new Error(`Jeton ${jeton} du sceau sans valeur pour le favicon`);
      return couleurs[jeton];
    })
    // Épaisseur de tracé de l'animation : hors animation, elle vaut 0.
    .replace(/var\(--trace-epaisseur,\s*0\)/g, "0");
  if (/var\(/.test(dessin)) throw new Error("Le sceau du favicon lit un jeton non résolu");
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${symbole[1]}">${dessin}</svg>\n`, fond: couleurs["--logo-fond"] };
}

/** PNG carré, le sceau centré ; `fond` remplit le carré (sinon transparent). */
async function png(svg, taille, fond = null) {
  // Densité calculée pour rastériser directement à la taille finale, à 4×,
  // puis réduire en lanczos : bords nets, jamais d'agrandissement flou.
  const densite = Math.ceil((72 * taille * 4) / 381);
  const sceau = await sharp(Buffer.from(svg), { density: densite })
    .resize(taille, taille, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: "lanczos3" })
    .png().toBuffer();
  if (!fond) return sceau;
  return sharp({ create: { width: taille, height: taille, channels: 4, background: fond } })
    .composite([{ input: sceau }]).png().toBuffer();
}

/** Conteneur ICO à images PNG (format reconnu par tous les navigateurs depuis Windows Vista). */
export function ico(images) {
  const entete = Buffer.alloc(6 + 16 * images.length);
  entete.writeUInt16LE(0, 0); entete.writeUInt16LE(1, 2); entete.writeUInt16LE(images.length, 4);
  let decalage = entete.length;
  images.forEach(({ taille, donnees }, rang) => {
    const e = 6 + 16 * rang;
    entete.writeUInt8(taille >= 256 ? 0 : taille, e); entete.writeUInt8(taille >= 256 ? 0 : taille, e + 1);
    entete.writeUInt8(0, e + 2); entete.writeUInt8(0, e + 3);
    entete.writeUInt16LE(1, e + 4); entete.writeUInt16LE(32, e + 6);
    entete.writeUInt32LE(donnees.length, e + 8); entete.writeUInt32LE(decalage, e + 12);
    decalage += donnees.length;
  });
  return Buffer.concat([entete, ...images.map((i) => i.donnees)]);
}

/** Écrit toutes les icônes et le manifeste dans `sortie`. */
export async function publierIcones({ racine, sortie, site }) {
  const { svg, fond } = await sceauVert(racine);
  const ecrire = (nom, donnees) => fs.writeFile(path.join(sortie, nom), donnees);
  await ecrire(ICONES.svg, svg);
  await ecrire(ICONES.ico, ico(await Promise.all(TAILLES_ICO.map(async (taille) => ({ taille, donnees: await png(svg, taille) })))));
  await ecrire(ICONES.apple, await png(svg, TAILLE_APPLE, fond));
  for (const { fichier, taille } of ICONES.android) await ecrire(fichier, await png(svg, taille));
  // Nom et couleurs dérivés : le nom du site, le fond de page et le vert du sceau.
  const manifeste = {
    name: site.identite.nom,
    short_name: site.identite.nom,
    lang: site.langueParDefaut,
    start_url: "/",
    display: "browser",
    background_color: await couleurJeton(racine, "--clair-surface-page"),
    theme_color: await couleurJeton(racine, "--clair-surface-page"),
    icons: ICONES.android.map(({ fichier, taille }) => ({ src: `/${fichier}`, sizes: `${taille}x${taille}`, type: "image/png" })),
  };
  await ecrire(ICONES.manifeste, `${JSON.stringify(manifeste, null, 2)}\n`);
}
