import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { creerContexte, estTraduisible, cheminLangue, versRacine, lire } from "../Design_System/i18n/langue.js";

const dictionnaires = { fr: { a: { b: "Bonjour {nom}" }, seul: "Seulement FR" }, en: { a: { b: "Hello {nom}" } } };

test("textes d'interface : traduits, repli consigné, clé inconnue = erreur", () => {
  const en = creerContexte({ langue: "en", langueParDefaut: "fr", dictionnaires });
  assert.equal(en.t("a.b", { nom: "Marc" }), "Hello Marc");
  assert.equal(en.t("seul"), "Seulement FR");
  assert.deepEqual(en.manquants, [{ type: "interface", cle: "seul", langue: "en" }]);
  assert.throws(() => en.t("inexistant"), /Clé de dictionnaire inconnue/);
});

test("contenu : valeur commune, traduction, repli balisé lang=fr et consigné", () => {
  const en = creerContexte({ langue: "en", langueParDefaut: "fr", dictionnaires });
  assert.equal(en.c("https://x"), "https://x");
  assert.equal(en.c({ fr: "Titre", en: "Title" }), "Title");
  assert.equal(String(en.l({ fr: "Titre" }, "projets.0.titre")), '<span lang="fr">Titre</span>');
  assert.deepEqual(en.manquants, [{ type: "contenu", cle: "projets.0.titre", langue: "en" }]);
  const fr = creerContexte({ langue: "fr", langueParDefaut: "fr", dictionnaires });
  assert.equal(String(fr.l({ fr: "Titre" })), "Titre");
  assert.equal(fr.manquants.length, 0);
});

test("chemins et utilitaires", () => {
  assert.equal(cheminLangue("fr", "fr", "cv/"), "cv/");
  assert.equal(cheminLangue("en", "fr", "cv/"), "en/cv/");
  assert.equal(versRacine(""), "./");
  assert.equal(versRacine("en/projets/x/"), "../../../");
  assert.ok(estTraduisible({ fr: "a" }));
  assert.ok(!estTraduisible(["a"]));
  assert.equal(lire({ a: { b: 1 } }, "a.b"), 1);
});

test("les dictionnaires FR et EN ont exactement les mêmes clés", () => {
  const cles = (o, p = "") => Object.entries(o).flatMap(([k, v]) => (k.startsWith("_") ? [] : typeof v === "object" ? cles(v, `${p}${k}.`) : [`${p}${k}`]));
  const fr = JSON.parse(fs.readFileSync("Design_System/i18n/fr.json", "utf8"));
  const en = JSON.parse(fs.readFileSync("Design_System/i18n/en.json", "utf8"));
  assert.deepEqual(cles(en).sort(), cles(fr).sort());
});
