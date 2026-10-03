import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const lire = (nom) => fs.readFile(new URL(`../Docs/${nom}`, import.meta.url), "utf8");

test("MarcoS respecte l'identité et les transitions comportementales documentées", async () => {
  const texte = await lire("MARCOS_BEHAVIOR.md");
  for (const terme of ["M. Kouassi", "Jamais d'invention", "je ne suis pas autorisé", "initiative", "Ou vous préférez que M. Kouassi le choisisse ?"]) {
    assert.match(texte, new RegExp(terme.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("la qualification documente le brief, le consentement et les coordonnées volontaires", async () => {
  const texte = await lire("MARCOS_QUALIFICATION.md");
  for (const terme of ["coordonnées", "consentement", "cahier des charges", "Resend", "idempot", "compaction"]) {
    assert.match(texte.toLowerCase(), terme.toLowerCase());
  }
});

test("le plan d'implémentation conserve PM-110 à PM-114 dans l'ordre des dépendances", async () => {
  const texte = await lire("AI_IMPLEMENTATION_PLAN.md");
  assert.match(texte, /PM-110/);
  assert.match(texte, /PM-114/);
  assert.match(texte, /dans l'ordre de leurs dépendances/);
});
