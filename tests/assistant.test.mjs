/**
 * MARCOS, INTERFACE (IA-04) — composant Conversation et gabarit Assistant.
 *
 * Les tests portent sur le comportement, pas sur la présence de mots : ce qui
 * est rendu, ce qui ne l'est pas, et ce qui n'est jamais écrit en dur.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Conversation } from "../Design_System/composants/Conversation/Conversation.js";
import { Assistant, LONGUEUR_MAX } from "../Design_System/gabarits/Assistant/Assistant.js";
import { CODES } from "../worker/assistant/src/erreurs.js";

const fr = JSON.parse(fs.readFileSync("Design_System/i18n/fr.json", "utf8"));
const en = JSON.parse(fs.readFileSync("Design_System/i18n/en.json", "utf8"));
const site = JSON.parse(fs.readFileSync("content/site.json", "utf8"));

/** Contexte minimal : les libellés sortent du dictionnaire, les textes des données. */
const ctx = {
  t: (cle, variables = {}) => {
    const valeur = cle.split(".").reduce((o, k) => o?.[k], fr);
    assert.ok(typeof valeur === "string", `clé de dictionnaire absente : ${cle}`);
    return valeur.replace(/\{(\w+)\}/g, (_, n) => String(variables[n] ?? `{${n}}`));
  },
  c: (valeur) => valeur?.fr ?? "",
  l: (valeur) => valeur?.fr ?? "",
};

const actif = (surcharge = {}) => ({ active: true, accueil: { fr: "Bonjour.", en: "Hello." }, exemples: [], confidentialite: { fr: "", en: "" }, ...surcharge });

test("Conversation rend un journal annoncé poliment, et rien d'autre", () => {
  const sortie = String(Conversation({ echanges: [], etiquette: "É", libelles: { visiteur: "V", assistant: "A" }, vide: "—" }));
  assert.match(sortie, /<ol class="conversation" role="log" aria-live="polite" aria-relevant="additions"/);
  assert.match(sortie, /aria-label="É"/);
  assert.match(sortie, /conversation__vide/, "le vide est explicite (AGENTS.md §6.8)");
});

test("Conversation étiquette chaque tour selon son rôle et échappe le texte", () => {
  const sortie = String(Conversation({
    echanges: [{ role: "visiteur", texte: "<script>alert(1)</script>" }, { role: "assistant", texte: "Réponse", liens: [{ libelle: "CV", href: "/cv/" }] }],
    etiquette: "É", libelles: { visiteur: "Vous", assistant: "MarcoS" }, vide: "",
  }));
  assert.match(sortie, /conversation__tour--visiteur/);
  assert.match(sortie, /conversation__tour--assistant/);
  assert.ok(!sortie.includes("<script>"), "le texte du visiteur est échappé, jamais exécuté");
  assert.match(sortie, /&lt;script&gt;/);
  assert.match(sortie, /href="\/cv\/"/);
});

test("Conversation porte lang seulement quand le tour en a un", () => {
  assert.match(String(Conversation({ echanges: [{ role: "assistant", texte: "Hello", lang: "en" }], etiquette: "É", libelles: { visiteur: "V", assistant: "A" }, vide: "" })), /lang="en"/);
  assert.ok(!String(Conversation({ echanges: [{ role: "assistant", texte: "Bonjour" }], etiquette: "É", libelles: { visiteur: "V", assistant: "A" }, vide: "" })).includes("lang="));
});

test("Assistant ne rend rien sans endpoint ni quand il est inactif", () => {
  // Tant que Marc n'a pas écrit l'accueil, MarcoS n'existe pas pour le visiteur.
  assert.equal(Assistant({ assistant: actif(), ctx, endpoint: null }), "");
  assert.equal(Assistant({ assistant: { ...actif(), active: false }, ctx, endpoint: "https://x.test" }), "");
  assert.equal(Assistant({ assistant: undefined, ctx, endpoint: "https://x.test" }), "");
});

test("l'état livré du dépôt ne rend pas MarcoS", () => {
  // Le champ « assistant » n'est pas encore dans content/site.json : Marc doit
  // y écrire ses trois textes (D-9), et le CMS efface les valeurs vides à
  // l'enregistrement — un gabarit amorcé à vide s'effacerait de lui-même.
  // Quelle que soit la raison, l'absence du champ ne rend rien.
  assert.equal(Assistant({ assistant: site.assistant, ctx, endpoint: "https://x.test" }), "");
});

test("Assistant rendu : modale centrée, journal, formulaire, et l'endpoint transmis", () => {
  const sortie = String(Assistant({ assistant: actif(), ctx, endpoint: "https://worker.test/api/assistant" }));
  assert.match(sortie, /data-endpoint="https:\/\/worker\.test\/api\/assistant"/);
  assert.match(sortie, /data-assistant-form/);
  assert.match(sortie, /role="log"/);
  assert.match(sortie, /data-longueur-max="500"/);
  assert.equal(LONGUEUR_MAX, 500, "aligné sur la validation du Worker");
});

test("un exemple vide ne devient jamais un bouton sans fonction", () => {
  // L'élément vide de content/site.json n'est là que pour le CMS.
  const vide = String(Assistant({ assistant: actif({ exemples: [{ fr: "", en: "" }] }), ctx, endpoint: "https://x.test" }));
  assert.ok(!vide.includes("data-assistant-exemple"), "aucune zone d'exemples");
  const plein = String(Assistant({ assistant: actif({ exemples: [{ fr: "Quels projets ?", en: "Which projects?" }] }), ctx, endpoint: "https://x.test" }));
  assert.match(plein, /data-assistant-exemple/);
  assert.match(plein, /Quels projets \?/);
});

test("une confidentialité non écrite n'affiche pas de paragraphe vide", () => {
  const sortie = String(Assistant({ assistant: actif(), ctx, endpoint: "https://x.test" }));
  assert.ok(!sortie.includes("assistant__confidentialite"));
  assert.match(String(Assistant({ assistant: actif({ confidentialite: { fr: "Rien n'est conservé.", en: "Nothing is kept." } }), ctx, endpoint: "https://x.test" })), /assistant__confidentialite/);
});

test("aucun texte d'interface n'est écrit dans le gabarit ni dans le composant", () => {
  // Le dictionnaire est la seule source : on remplace chaque libellé par un
  // marqueur et on vérifie qu'aucun mot d'origine ne subsiste dans le rendu.
  const MARQUE = "⟦x⟧";
  const faux = { ...ctx, t: () => MARQUE, c: () => MARQUE, l: () => MARQUE };
  const sortie = String(Assistant({ assistant: actif({ exemples: [{ fr: "x", en: "x" }], confidentialite: { fr: "x", en: "x" } }), ctx: faux, endpoint: "https://x.test" }));
  const visible = [...sortie.matchAll(/>([^<]+)</g)].map((m) => m[1]).join(" ").replaceAll(MARQUE, " ");
  assert.ok(!/\p{L}{2,}/u.test(visible), `texte en dur dans le rendu : « ${visible.trim()} »`);
});

test("les libellés transmis au navigateur couvrent tous les codes du Worker", () => {
  // Le Worker ne renvoie qu'un code : sans libellé, l'état serait muet.
  const sortie = String(Assistant({ assistant: actif(), ctx, endpoint: "https://x.test" }));
  const attribut = sortie.match(/data-libelles="([^"]*)"/)?.[1];
  assert.ok(attribut, "les libellés voyagent dans data-libelles");
  const libelles = JSON.parse(attribut.replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">"));
  for (const code of CODES) {
    assert.ok(libelles.erreurs[code], `code du Worker sans libellé : ${code}`);
  }
  assert.ok(libelles.erreurs.hors_ligne, "la perte de connexion a son propre message");
});

test("le dictionnaire couvre exactement les codes du Worker, en FR et en EN", () => {
  // Dérivé du Worker : ajouter un code là-bas fait échouer ici, pas en production.
  for (const [langue, dico] of [["fr", fr], ["en", en]]) {
    for (const code of CODES) {
      assert.ok(typeof dico.assistant.erreurs[code] === "string" && dico.assistant.erreurs[code].trim(), `${langue} : libellé manquant pour ${code}`);
    }
  }
});

test("l'aide du champ porte le compteur de caractères, pas un nombre en dur", () => {
  for (const [langue, dico] of [["fr", fr], ["en", en]]) {
    assert.match(dico.assistant.aide, /\{n\}/, `${langue} : l'aide doit accueillir le nombre restant`);
  }
  assert.match(String(Assistant({ assistant: actif(), ctx, endpoint: "https://x.test" })), /500 caractères restants/);
});
