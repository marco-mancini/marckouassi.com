/**
 * Jetons : tout jeton lu sans valeur de repli (var(--x)) est déclaré.
 * Couvre CSS, JS et SVG : un jeton retiré alors qu'un SVG le lit encore
 * rend le dessin noir sans aucune erreur visible (cas réel : --logo-fond).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const fichiers = (dossier, ext) => fs.readdirSync(dossier, { recursive: true }).filter((f) => ext.some((e) => f.endsWith(e))).map((f) => path.join(dossier, f));
const sources = [...fichiers("Design_System", [".css", ".js", ".svg"]), ...fichiers("Admin", [".js"]), "Frontend/site.js"];

test("tout jeton lu sans repli est déclaré (CSS, JS, SVG)", () => {
  const declares = new Set();
  const lus = new Map();
  for (const f of sources) {
    const texte = fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of texte.matchAll(/(--[\w-]+)\s*:/g)) declares.add(m[1]);
    for (const m of texte.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) { if (!lus.has(m[1])) lus.set(m[1], f); }
  }
  const manquants = [...lus].filter(([j]) => !declares.has(j)).map(([j, f]) => `${j} (${f})`);
  assert.deepEqual(manquants, []);
});
