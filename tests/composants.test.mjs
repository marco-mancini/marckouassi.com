/**
 * Tests des composants du Design System : rendu pur, accessibilité,
 * contrat (5 props au plus, fichiers css/js/md), aucun texte en dur.
 * Les textes utilisés ici sont des données de test, pas du contenu.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { textesLitteraux } from "./textes.mjs";

const RACINE = path.resolve(import.meta.dirname, "../Design_System/composants");
const NOMS = fs.readdirSync(RACINE).filter((n) => fs.statSync(path.join(RACINE, n)).isDirectory());
const charger = (nom) => import(`../Design_System/composants/${nom}/${nom}.js`);

test("les 26 composants de l'audit existent, chacun avec css + js + md", () => {
  // 26 depuis IA-04 : « Conversation » est le seul composant que l'audit n'avait
  // pas, et AI_UX.md le décide — aucun existant ne porte la sémantique d'un
  // journal d'échanges, et Message annoncerait chaque réponse comme une alerte.
  const attendus = ["Planche", "Encart", "Grille", "Pile", "CadreAdmin", "EnTete", "Navigation", "Segments", "Titre", "Signature", "Accent", "Champ", "Pastille", "Bouton", "Saisie", "Liste", "Televersement", "Media", "Galerie", "Sceau", "Carte", "Modale", "Message", "Conversation", "Apparition", "TexteProgressif"];
  assert.deepEqual([...NOMS].sort(), [...attendus].sort());
  for (const nom of NOMS) for (const ext of ["css", "js", "md"]) assert.ok(fs.existsSync(path.join(RACINE, nom, `${nom}.${ext}`)), `${nom}.${ext} manquant`);
});

test("chaque composant exporte sa fonction de rendu, avec 5 props au plus", async () => {
  for (const nom of NOMS) {
    const module = await charger(nom);
    assert.equal(typeof module[nom], "function", `${nom} n'exporte pas ${nom}()`);
    const source = fs.readFileSync(path.join(RACINE, nom, `${nom}.js`), "utf8");
    const signature = source.match(new RegExp(`export function ${nom}\\(\\{([^}]*)\\}`));
    assert.ok(signature, `signature de ${nom} introuvable`);
    const props = signature[1].replace(/\[[^\]]*\]/g, "[]").replace(/"[^"]*"/g, "\"\"").split(",").map((s) => s.trim()).filter(Boolean);
    assert.ok(props.length <= 5, `${nom} a ${props.length} props`);
  }
});

test("aucun composant ne contient de texte d'interface ou éditorial en dur", () => {
  for (const nom of NOMS) {
    const trouves = textesLitteraux(fs.readFileSync(path.join(RACINE, nom, `${nom}.js`), "utf8"));
    assert.deepEqual(trouves, [], `${nom} contient du texte en dur : ${trouves.join(" | ")}`);
  }
});

test("le détecteur de texte en dur détecte bien un texte (témoin)", () => {
  assert.deepEqual(textesLitteraux('const a = "Fermer le menu"; const b = html`<p>Aller au contenu</p>`; const c = "planche planche--olive";'), ["Fermer le menu", "Aller au contenu"]);
});

test("aucune feuille de composant n'utilise de sélecteur contextuel de page ni de couleur brute", () => {
  const interdit = /\.(cover|about|expertise|parcours|index|prestations|contact|introduction|cv)-[a-z-]*board|\.(artboard|board-)|#[0-9a-f]{3,8}\b|rgba?\(/i;
  for (const nom of NOMS) {
    const css = fs.readFileSync(path.join(RACINE, nom, `${nom}.css`), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    assert.doesNotMatch(css, interdit, `${nom}.css`);
  }
});

test("Planche : section nommée par son titre, crédit à deux colonnes sans mention", async () => {
  const { Planche, idTitre } = await charger("Planche");
  const sortie = String(Planche({ ton: "olive", id: "apropos", credit: { rubrique: "R", signature: "S" }, contenu: "" }));
  assert.match(sortie, /aria-labelledby="titre-apropos"/);
  assert.match(sortie, /planche--olive ilot-olive/);
  assert.match(sortie, /planche__credit--deux/);
  assert.equal(idTitre("x"), "titre-x");
});

test("Titre : point masqué, esperluette évidée en affiche, saut de ligne, échappement", async () => {
  const { Titre } = await charger("Titre");
  const sortie = String(Titre({ echelle: "affiche", texte: "A & B\n<C>", id: "t" }));
  assert.match(sortie, /<h2 class="titre titre--affiche" id="t">/);
  assert.match(sortie, /titre__esperluette/);
  assert.match(sortie, /<br>&lt;C&gt;/);
  assert.match(sortie, /aria-hidden="true">\.<\/b>/);
  assert.doesNotMatch(String(Titre({ echelle: "interface", texte: "x" })), /titre__point/);
});

test("Accent / texteEnrichi : seule la syntaxe ** et les sauts de ligne sont interprétés", async () => {
  const { texteEnrichi } = await charger("Accent");
  assert.equal(String(texteEnrichi("a **b** <i>\nc", { grand: true })), 'a <b class="accent accent--grand">b</b> &lt;i&gt;<br>c');
});

test("Bouton : lien ou bouton, icône masquée, états désactivé et chargement", async () => {
  const { Bouton } = await charger("Bouton");
  const lien = String(Bouton({ texte: "x", href: "/a", options: { icone: "externe" } }));
  assert.match(lien, /^<a class="bouton bouton--contour bouton--pilule" href="\/a">/);
  assert.match(lien, /aria-hidden="true">↗/);
  assert.match(String(Bouton({ texte: "x", options: { etat: "chargement" } })), /aria-busy="true"/);
  assert.match(String(Bouton({ texte: "x", options: { etat: "desactive" } })), / disabled/);
  assert.match(String(Bouton({ texte: "Fermer", forme: "rond", options: { iconeSeule: true, icone: "fermer" } })), /visually-hidden">Fermer/);
});

test("Champ + Saisie : label relié, aide et erreur décrites, aria-invalid", async () => {
  const { Champ } = await charger("Champ");
  const { Saisie } = await charger("Saisie");
  const saisie = Saisie({ id: "t", options: { requis: true, etat: { aide: true, erreur: true }, lang: "en" } });
  const sortie = String(Champ({ etiquette: "L", contenu: saisie, variante: "formulaire", id: "t", messages: { aide: "a", erreur: "e" } }));
  assert.match(sortie, /<label class="champ__etiquette" for="t">/);
  assert.match(sortie, /aria-describedby="t-aide t-erreur"/);
  assert.match(sortie, /aria-invalid="true"/);
  assert.match(sortie, /aria-required="true"/);
  assert.match(sortie, /lang="en"/);
  assert.match(sortie, /id="t-erreur"/);
});

test("Media : dimensions, chargement différé, vidéo sans lecture auto, emplacement absent", async () => {
  const { Media } = await charger("Media");
  const img = String(Media({ media: { src: "a.webp", largeur: 10, hauteur: 5, alt: "A", lang: "fr" } }));
  assert.match(img, /width="10" height="5" loading="lazy"/);
  assert.match(img, /lang="fr"/);
  const video = String(Media({ media: { type: "video", src: "v.mp4", alt: "V" } }));
  assert.match(video, /<video controls playsinline preload="metadata"/);
  assert.doesNotMatch(video, /autoplay/);
  assert.match(String(Media({ media: { alt: "absent" } })), /media--absent" role="img" aria-label="absent"/);
});

test("Galerie : aperçu borné à 3, nombre réel exposé", async () => {
  const { Galerie } = await charger("Galerie");
  const medias = Array.from({ length: 9 }, (_, i) => ({ src: `${i}.webp`, alt: `${i}` }));
  const sortie = String(Galerie({ medias }));
  assert.match(sortie, /data-nombre="3"/);
  assert.equal((sortie.match(/<img/g) || []).length, 3);
  assert.equal((String(Galerie({ medias, variante: "detail" })).match(/<img/g) || []).length, 9);
});

test("Modale : dialog natif nommé, bouton de fermeture accessible", async () => {
  const { Modale } = await charger("Modale");
  const sortie = String(Modale({ id: "m", etiquette: { id: "t" }, contenu: "", options: { libelleFermer: "Fermer" } }));
  assert.match(sortie, /<dialog class="modale modale--centre" id="m" aria-labelledby="t">/);
  assert.match(sortie, /data-modale-fermer/);
  assert.match(String(Modale({ id: "n", etiquette: "Menu", contenu: "", options: { variante: "plein-ecran", libelleFermer: "F" } })), /modale--plein-ecran ilot-olive" id="n" aria-label="Menu"/);
});

test("Message : rôle vivant selon le type", async () => {
  const { Message } = await charger("Message");
  assert.match(String(Message({ type: "erreur", texte: "x" })), /role="alert"/);
  assert.match(String(Message({ type: "succes", texte: "x" })), /role="status"/);
  assert.match(String(Message({ type: "chargement", texte: "x" })), /aria-busy="true"/);
  assert.doesNotMatch(String(Message({ type: "vide", texte: "x" })), /role=/);
});

test("Navigation, Segments : aria-current, hreflang, aria-pressed", async () => {
  const { Navigation } = await charger("Navigation");
  const { Segments } = await charger("Segments");
  assert.match(String(Navigation({ liens: [{ libelle: "A", href: "/a", actif: true, numero: "01" }], etiquette: "N" })), /aria-current="page"/);
  const langues = String(Segments({ options: [{ libelle: "FR", href: "/", lang: "fr", actif: true }, { libelle: "EN", href: "/en/", lang: "en", nom: "English" }], etiquette: "L" }));
  assert.match(langues, /hreflang="fr" lang="fr" aria-current="true"/);
  assert.match(langues, /visually-hidden">English/);
  assert.match(String(Segments({ options: [{ libelle: "A", valeur: "a", actif: true }], etiquette: "L", mode: "boutons" })), /aria-pressed="true"/);
});

test("Liste : vide, boutons Monter/Descendre nommés, bornes désactivées", async () => {
  const { Liste } = await charger("Liste");
  assert.equal(String(Liste({ elements: [], etiquette: "L", vide: "VIDE" })), "VIDE");
  const sortie = String(Liste({ elements: [{ id: "1", nom: "Un", contenu: "u" }, { id: "2", nom: "Deux", contenu: "d" }], etiquette: "L", ordonnable: true, libelles: { monter: "Monter {nom}", descendre: "Descendre {nom}" } }));
  assert.match(sortie, /Monter Un/);
  assert.match(sortie, /Descendre Deux/);
  assert.equal((sortie.match(/ disabled/g) || []).length, 2);
  assert.match(sortie, /aria-live="polite"/);
});

test("Televersement : SVG exclu, progression nommée, erreur en alerte", async () => {
  const { Televersement, TYPES_ACCEPTES } = await charger("Televersement");
  assert.ok(!TYPES_ACCEPTES.image.includes("image/svg+xml"));
  const sortie = String(Televersement({ id: "f", etat: { progression: 40, erreur: "E" }, libelles: { choisir: "c", remplacer: "r", deposer: "d", progression: "{pourcentage} %" } }));
  assert.match(sortie, /<progress max="100" value="40" aria-label="40 %">/);
  assert.match(sortie, /role="alert"/);
  assert.match(sortie, /accept="image\/png,image\/jpeg,image\/webp"/);
});

test("Carte, Apparition, TexteProgressif : visibles sans script, texte complet pour les lecteurs d'écran", async () => {
  const { Carte } = await charger("Carte");
  const { attributsApparition } = await charger("Apparition");
  const { TexteProgressif } = await charger("TexteProgressif");
  assert.match(String(Carte({ rang: "01", libelle: "L", options: { indice: 2 } })), /data-apparition="bas" style="--i: 2"/);
  assert.deepEqual(attributsApparition({ direction: "gauche", indice: 1, declenchement: "etape" }), { "data-apparition": "gauche", "data-declenchement": "etape", style: "--i: 1" });
  const texte = String(TexteProgressif({ texte: "Bonjour" }));
  assert.match(texte, /visually-hidden">Bonjour<\/span><span class="texte-progressif__visible" aria-hidden="true">Bonjour/);
  const css = fs.readFileSync(path.join(RACINE, "Apparition/Apparition.css"), "utf8");
  assert.match(css, /html\.js-anime \[data-apparition\]/);
});
