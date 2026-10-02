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
