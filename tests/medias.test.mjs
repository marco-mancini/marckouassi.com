/**
 * MÉDIAS — transparence conservée seulement quand elle est réelle.
 *
 * Le build aplatit les images sur la couleur papier. C'est bon pour une photo
 * opaque, et faux pour un détourage : en mode sombre, un rectangle clair
 * apparaîtrait derrière le sujet.
 *
 * Mais on ne peut pas se fier au seul canal alpha : mesuré sur les 115 images
 * du dépôt, 64 portent un canal alpha ENTIÈREMENT OPAQUE — un export qui traîne
 * un canal inutilisé. D'où un seuil, et ces tests qui le défendent.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { partTransparente, SEUIL_TRANSPARENCE } from "../tools/medias.mjs";

/** Carré uni, avec un canal alpha à la valeur voulue. */
async function carre({ alpha = 255, taille = 200 } = {}) {
  return sharp({ create: { width: taille, height: taille, channels: 4, background: { r: 20, g: 40, b: 60, alpha: alpha / 255 } } }).png().toBuffer();
}

test("un canal alpha entièrement opaque ne compte pas comme de la transparence", async () => {
  // Le cas des 64 images du dépôt : alpha présent, mais inutilisé.
  assert.equal(await partTransparente(await carre({ alpha: 255 })), 0);
});

test("une image entièrement transparente est détectée", async () => {
  assert.equal(await partTransparente(await carre({ alpha: 0 })), 1);
});

test("le seuil sépare l'anticrénelage d'un vrai détourage", async () => {
  // Une bande transparente sur un dixième de la hauteur : au-dessus du seuil.
  const opaque = { create: { width: 200, height: 180, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } };
  const vide = { create: { width: 200, height: 20, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } };
  const image = await sharp({ create: { width: 200, height: 200, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: await sharp(opaque).png().toBuffer(), top: 20, left: 0 }, { input: await sharp(vide).png().toBuffer(), top: 0, left: 0 }])
    .png().toBuffer();
  const part = await partTransparente(image);
  assert.ok(part > SEUIL_TRANSPARENCE, `${part} devrait dépasser le seuil ${SEUIL_TRANSPARENCE}`);
  assert.ok(part > 0.05 && part < 0.2, `part mesurée inattendue : ${part}`);
});

test("le seuil est posé dans un intervalle où rien ne vit", () => {
  // Relevé du 2 octobre 2026 : la seule image réellement détourée est à 49,2 %,
  // la suivante à 0,9 %. Le seuil doit rester entre les deux, avec de la marge.
  assert.ok(SEUIL_TRANSPARENCE > 0.01, "au-dessus de l'anticrénelage de bord");
  assert.ok(SEUIL_TRANSPARENCE < 0.4, "en dessous d'un vrai détourage");
});

test("le portrait détourée du dépôt dépasse le seuil, les autres images non", async () => {
  const fs = await import("node:fs");
  const part = await partTransparente(fs.readFileSync("Public/images/Photo_Marc.png"));
  assert.ok(part >= SEUIL_TRANSPARENCE, `le portrait est à ${(part * 100).toFixed(1)} %, il doit garder sa transparence`);
  for (const f of ["Public/images/Projet_AUREX_09.png", "Public/images/Projet_Ci20_01.png"]) {
    const autre = await partTransparente(fs.readFileSync(f));
    assert.ok(autre < SEUIL_TRANSPARENCE, `${f} est à ${(autre * 100).toFixed(1)} %, il doit rester aplati`);
  }
});

test("les dix expressions de MarcoS sortent du build en WebP, transparence intacte", async () => {
  // Le piège que ce test ferme : `publierMedias` aplatit par défaut sur la
  // couleur papier. Appliqué aux avatars, il mettrait MarcoS dans un carré
  // crème — invisible en thème clair, flagrant en thème sombre.
  //
  // La garantie est comparative, et pas « l'angle vaut zéro » : l'angle bas
  // droit d'`Avatar_07_IDEE_SUGGESTION.png` vaut déjà 75 DANS LA SOURCE (le
  // geste touche le cadre). Ce qui doit être vrai, c'est que la sortie ne soit
  // pas PLUS opaque que l'entrée. Un aplatissement porterait les quatre angles
  // à 255 d'un coup.
  const fs = await import("node:fs");
  const fsp = await import("node:fs/promises");
  const os = await import("node:os");
  const path = await import("node:path");
  const { publierMedias, sourceLocale, SEUIL_TRANSPARENCE: seuil } = await import("../tools/medias.mjs");

  /** Les quatre angles d'une image, en alpha. */
  const angles = async (octets) => {
    const { data, info } = await sharp(octets).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const alpha = (x, y) => data[(y * info.width + x) * 4 + 3];
    return { canaux: info.channels, coins: [alpha(0, 0), alpha(info.width - 1, 0), alpha(0, info.height - 1), alpha(info.width - 1, info.height - 1)] };
  };

  const sources = fs.readdirSync("Public/Avatar_MarcoS").filter((f) => f.endsWith(".png")).sort();
  assert.equal(sources.length, 10, "les dix expressions officielles (#49)");

  const sortie = await fsp.mkdtemp(path.join(os.tmpdir(), "avatars-"));
  try {
    const { table, bilan } = await publierMedias({
      references: sources.map((f) => `Public/Avatar_MarcoS/${f}`),
      racine: process.cwd(),
      sortie,
      lireSource: sourceLocale(process.cwd()),
      journal: { log() {} },
    });
    assert.deepEqual(bilan.echecs, []);

    for (const nom of sources) {
      const source = `Public/Avatar_MarcoS/${nom}`;
      const publie = table.get(source);
      assert.match(publie.src, /\.webp$/, `${nom} est publié en WebP`);

      const octets = fs.readFileSync(path.join(sortie, publie.src));
      const avant = await angles(fs.readFileSync(source));
      const apres = await angles(octets);

      assert.equal(apres.canaux, 4, `${nom} garde son canal alpha`);
      // 6/255 de marge : le WebP est à perte, il ne recopie pas l'alpha au bit.
      apres.coins.forEach((alpha, rang) => {
        assert.ok(alpha <= avant.coins[rang] + 6, `${nom} : l'angle ${rang} passe de ${avant.coins[rang]} à ${alpha} — la transparence a été aplatie`);
      });

      const part = await partTransparente(octets);
      assert.ok(part >= seuil, `${nom} publié n'est transparent qu'à ${(part * 100).toFixed(1)} %`);
    }
  } finally {
    await fsp.rm(sortie, { recursive: true, force: true });
  }
});
