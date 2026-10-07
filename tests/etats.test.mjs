/**
 * États du site (#162) : Message en mode sceau, humeurs du sceau, page
 * introuvable, messages du navigateur, état vide, maintenance.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Message, titreBicolore, titreSimple } from "../Design_System/composants/Message/Message.js";
import { Sceau, HUMEURS } from "../Design_System/composants/Sceau/Sceau.js";
import { chargerFichiers } from "../tools/contenu.mjs";
import { contextePage, rendrePage, PageIntrouvable } from "../tools/pages.mjs";

const vrai = await chargerFichiers(process.cwd());
const dictionnaires = Object.fromEntries(vrai.site.langues.map((l) => [l, JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8"))]));
const ressources = { sprite: "", couleurTheme: "#000000", annee: 2030 };
const contexte = (langue, chemin = "", plus = {}) => contextePage({ site: vrai.site, langue, chemin, dictionnaires, medias: new Map(), ressources: { ...ressources, ...plus } });

test("titre bicolore : la partie marquée en or, sinon le premier mot ; point doré ; texte échappé", () => {
  assert.equal(String(titreBicolore("*Char*gement")), '<span class="message__or">Char</span>gement<span class="message__or" aria-hidden="true">.</span>');
  assert.equal(String(titreBicolore("Univers #04")), '<span class="message__or">Univers</span> #04<span class="message__or" aria-hidden="true">.</span>');
  assert.match(String(titreBicolore("*<b>*x")), /&lt;b&gt;/);
  assert.equal(titreSimple("*Page* introuvable"), "Page introuvable");
});

test("Message en mode sceau : un seul gabarit (sceau, titre, phrase, actions), sur l'îlot olive", () => {
  const rendu = String(Message({ type: "erreur", titre: "*In*disponible", texte: "Phrase.", action: "<x>", mode: { sceau: "panne", compact: true } }));
  assert.match(rendu, /class="message message--erreur message--sceau message--compact ilot-olive" role="alert"/);
  assert.match(rendu, /class="sceau sceau--grand sceau--humeur sceau--bati sceau--panne"[^>]*data-sceau-auto/);
  assert.match(rendu, /<p class="message__titre"><span class="message__or">In<\/span>disponible/);
  assert.match(rendu, /<p class="message__phrase">Phrase\.<\/p>/);
  assert.match(String(Message({ type: "info", titre: "x", texte: "y", mode: { sceau: "bati", niveau: 1 } })), /<h1 class="message__titre">/);
  // Les autres modes ne changent pas.
  assert.doesNotMatch(String(Message({ texte: "y" })), /sceau/);
});

test("humeurs du sceau : chacune a ses règles, et un repos sous mouvement réduit", () => {
  const css = fs.readFileSync("Design_System/composants/Sceau/Sceau.css", "utf8");
  const reduit = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce) {\n  .sceau--humeur"));
  for (const classe of new Set(Object.values(HUMEURS).flatMap((c) => c.split(" ")))) assert.ok(css.includes(`.${classe}`), classe);
  assert.match(reduit, /\.sceau--humeur\.est-construit \[data-forme\] \{ animation: none/);
  assert.match(css, /html\[data-animations="reduites"\] \.sceau--humeur/);
  assert.match(String(Sceau({ anime: "vide", auto: true })), /sceau--vide" aria-hidden="true" data-sceau-auto/);
});

test("dictionnaires : chaque état a ses textes dans chaque langue, titres marqués", () => {
  const cles = (d) => JSON.stringify(Object.keys(d.etats).filter((k) => k !== "_role").map((k) => [k, Object.keys(d.etats[k])]));
  assert.equal(cles(dictionnaires.fr), cles(dictionnaires.en));
  for (const langue of vrai.site.langues) {
    for (const [cle, valeur] of Object.entries(dictionnaires[langue].etats)) {
      if (cle !== "_role") assert.match(valeur.titre, /^[^*]*\*[^*]+\*/, `${langue} etats.${cle}.titre`);
    }
  }
});

test("page introuvable : une page par site, racine absolue, un message par langue, non indexée", () => {
  const ctx = contexte(vrai.site.langueParDefaut, "", { racine: "/" });
  const page = String(PageIntrouvable({ contenu: vrai, ctx }));
  assert.match(page, /<meta name="robots" content="noindex">/);
  assert.match(page, /href="\/Design_System\/styles\/Index\.css"/);
  assert.match(page, /src="\/Frontend\/site\.js"/);
  for (const langue of vrai.site.langues) {
    const bloc = page.slice(page.indexOf(`data-introuvable="${langue}"`));
    assert.ok(bloc.includes(dictionnaires[langue].etats.introuvable.texte), langue);
    assert.ok(bloc.includes(`href="/${langue === vrai.site.langueParDefaut ? "" : `${langue}/`}"`), `${langue} : retour à l'accueil de sa langue`);
  }
  assert.match(page, /data-introuvable="en" lang="en" hidden/);
  assert.match(page, /<h1 class="message__titre">/);
});

test("chaque page porte les messages du navigateur (réseau, média), dans sa langue", () => {
  for (const langue of vrai.site.langues) {
    const page = String(rendrePage({ contenu: vrai, ctx: contexte(langue), chemin: "" }));
    const modele = page.slice(page.indexOf("<template data-etats>"));
    assert.match(page, /<div class="messages" data-etats-zone aria-live="polite"><\/div>/);
    for (const nom of ["hors-connexion", "retablie", "media"]) assert.match(modele, new RegExp(`data-etat="${nom}"`), nom);
    assert.ok(modele.includes(dictionnaires[langue].assistant.erreurs.hors_ligne), "même phrase que MarcoS");
    assert.ok(modele.includes(dictionnaires[langue].etats.media.texte));
  }
});

test("une catégorie sans réalisation affiche l'état vide, sceau « vide » ; les autres non", () => {
  const page = String(rendrePage({ contenu: vrai, ctx: contexte("fr"), chemin: "" }));
  const blocs = page.split('<section class="categorie-projets"').slice(1).map((b) => b.slice(0, b.indexOf("</section>")));
  assert.ok(blocs.length > 0);
  for (const bloc of blocs) {
    const rempli = /projet-carte|categorie-projets__carte-image/.test(bloc);
    assert.equal(/message--vide message--sceau/.test(bloc), !rempli, bloc.slice(0, 60));
    if (!rempli) assert.match(bloc, /sceau--humeur sceau--vide/);
  }
});

test("maintenance : l'état « Maintenance » au même gabarit, titre h1", () => {
  const site = { ...vrai.site, maintenance: { active: true } };
  const ctx = contextePage({ site, langue: "fr", chemin: "", dictionnaires, medias: new Map(), ressources });
  const page = String(rendrePage({ contenu: { ...vrai, site }, ctx, chemin: "" }));
  assert.match(page, /<h1 class="message__titre"><span class="message__or">Main<\/span>tenance/);
  assert.match(page, /sceau--humeur sceau--bati/);
});

test("mode sceau « nu » : le même gabarit sans son îlot, pour MarcoS (#166)", () => {
  // Le besoin : le panneau de MarcoS est déjà une surface à lui. Un second fond
  // plein à l'intérieur ferait une boîte dans une boîte.
  const nu = String(Message({ type: "chargement", titre: "*Char*gement", texte: "Phrase.", mode: { sceau: "chargement", compact: true, nu: true } }));
  assert.match(nu, /class="message message--chargement message--sceau message--compact message--nu"/);
  assert.doesNotMatch(nu, /ilot-olive/, "l'îlot tombe, donc les couleurs du thème s'appliquent");

  // Ce qui NE change pas : le sceau, son humeur, son animation, le titre bicolore.
  assert.match(nu, /class="sceau sceau--grand sceau--humeur sceau--chargement"[^>]*data-sceau-auto/);
  assert.match(nu, /<span class="message__or">Char<\/span>gement/);
  assert.match(nu, /<p class="message__phrase">Phrase\.<\/p>/);

  // Le défaut reste l'îlot : aucun état du site existant ne bouge.
  const habituel = String(Message({ type: "erreur", titre: "*In*disponible", texte: "Phrase.", mode: { sceau: "panne", compact: true } }));
  assert.match(habituel, /ilot-olive/);
  assert.doesNotMatch(habituel, /message--nu/);

  // Le fond est bien retiré, et la couleur héritée.
  const css = fs.readFileSync("Design_System/composants/Message/Message.css", "utf8");
  assert.match(css, /\.message--nu \{ background: transparent; color: inherit; \}/);
});
