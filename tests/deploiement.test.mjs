/**
 * Déploiement : la configuration Vercel désigne la commande et le dossier
 * réellement produits par le build. Sans vercel.json, Vercel cherche
 * « public » et échoue (« No Output Directory named "public" found »).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("vercel.json : commande de build du dépôt et dossier de sortie du build (_site)", () => {
  const vercel = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
  const paquet = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const build = fs.readFileSync("tools/build.mjs", "utf8");
  const sortie = build.match(/const SORTIE = path\.join\(RACINE, "([^"]+)"\)/)?.[1];
  assert.equal(vercel.buildCommand, "npm run build");
  assert.ok(paquet.scripts.build, "script build absent de package.json");
  assert.equal(sortie, "_site");
  assert.equal(vercel.outputDirectory, sortie);
  assert.equal(vercel.framework, null);
});
