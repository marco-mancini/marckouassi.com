import { test } from "node:test";
import assert from "node:assert/strict";
import { html, brut, attributs, classes, deuxChiffres, identifiant } from "../Design_System/fondations/rendu.js";

test("toute donnée interpolée est échappée", () => {
  assert.equal(String(html`<p>${'<script>"x"</script>'}</p>`), "<p>&lt;script&gt;&quot;x&quot;&lt;/script&gt;</p>");
});
test("un fragment html imbriqué n'est pas ré-échappé", () => {
  assert.equal(String(html`<div>${html`<b>${"a&b"}</b>`}</div>`), "<div><b>a&amp;b</b></div>");
});
test("valeurs vides et listes", () => {
  assert.equal(String(html`${null}${undefined}${false}${["a", html`<i></i>`]}`), "a<i></i>");
  assert.equal(String(brut("<br>")), "<br>");
});
test("attributs : omis, booléens, échappés", () => {
  assert.equal(String(attributs({ href: 'a"b', hidden: true, inert: false, title: null })), ' href="a&quot;b" hidden');
});
test("utilitaires calculés", () => {
  assert.equal(classes("a", false, ["b", null]), "a b");
  assert.equal(deuxChiffres(3), "03");
  assert.equal(identifiant("titre", "À propos"), "titre-a-propos");
});

import { formater } from "../Design_System/fondations/rendu.js";
test("formater remplit les modèles du dictionnaire", () => {
  assert.equal(formater("Projet {n} / {total}", { n: "03", total: "11" }), "Projet 03 / 11");
  assert.equal(formater("{absent}", {}), "{absent}");
});
