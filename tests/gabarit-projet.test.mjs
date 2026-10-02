/**
 * GABARIT_PROJET — le système de référence d'un projet.
 *
 * Ce que ces tests défendent :
 *
 *   1. LES QUATRE MODES PARTAGENT LA MÊME VUE. Si la carte et l'étude
 *      résolvaient un titre ou un média différemment, la modale ouvrirait
 *      un dialogue qu'elle ne saurait pas nommer — et personne ne le verrait
 *      avant de l'essayer au lecteur d'écran.
 *   2. LE CONTRAT D'OUVERTURE EST ENTIER. `data-etude`, `data-compteur`,
 *      `aria-haspopup` et l'identifiant `etude-<id>` doivent s'accorder entre
 *      la carte, l'étude et la page. C'est la raison d'être de cette couche.
 *   3. AUCUNE DONNÉE N'EST ÉCRITE DANS LE GABARIT. Les projets et les
 *      disciplines sont relus depuis `content/` à chaque assertion.
 *
 * Les comportements de navigateur (ouverture, Échap, focus, filtre) sont
 * dans tests/navigateur/site.test.mjs : ils ont besoin d'un vrai moteur.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { chargerFichiers, referencesMedias } from "../tools/contenu.mjs";
import { contextePage, rendrePage } from "../tools/pages.mjs";
import { Gabarit_Projet, vueProjet, parcours, MODES } from "../Design_System/gabarits/Gabarit_Projet/Gabarit_Projet.js";

const contenu = await chargerFichiers(process.cwd());
const { projets } = contenu;
const dictionnaires = Object.fromEntries(
  contenu.site.langues.map((l) => [l, JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8"))]),
);
const medias = new Map(referencesMedias(contenu).map((src) => [src, { src: `${src}.webp`, type: "image", largeur: 1, hauteur: 1 }]));
const contexte = (langue, chemin = "") => contextePage({
  site: contenu.site, langue, chemin, dictionnaires, medias,
  ressources: { sprite: "", couleurTheme: "#000000", annee: 2030 },
});
const rendre = (projet, mode, options = {}, langue = "fr") =>
  String(Gabarit_Projet({ projet, ctx: contexte(langue), mode, options }));

/* ------------------------------------------------------------------- modes */

test("les quatre modes existent et rendent tous quelque chose", () => {
  assert.deepEqual([...MODES], ["carte", "etude", "modale", "page"]);
  const projet = projets[0];
  for (const mode of MODES) {
    const sortie = String(Gabarit_Projet({ projet, ctx: contexte("fr"), mode, options: { rang: 0, total: projets.length, retour: "./" } }));
    assert.ok(sortie.length > 0, `le mode « ${mode} » ne rend rien`);
  }
});

test("un mode inconnu lève, au lieu de rendre une page vide en silence", () => {
  assert.throws(() => Gabarit_Projet({ projet: projets[0], ctx: contexte("fr"), mode: "carrousel" }), /mode inconnu/);
});

test("la modale est le seul mode sans projet ; les autres l'exigent", () => {
  const modale = String(Gabarit_Projet({ ctx: contexte("fr"), mode: "modale" }));
  assert.match(modale, /id="etude"/, "la modale partagée doit porter l'identifiant que le script ouvre");
  assert.ok(!/data-projet-etude/.test(modale), "elle est un réceptacle, pas un contenu");
  for (const mode of MODES.filter((m) => m !== "modale")) {
    assert.throws(() => Gabarit_Projet({ ctx: contexte("fr"), mode }), /exige un projet/, mode);
  }
});

test("chaque mode rend la vue qui lui revient, et pas celle d'un autre", () => {
  const projet = projets[0];
  const carte = rendre(projet, "carte", { rang: 0, total: projets.length });
  const etude = rendre(projet, "etude");
  const page = rendre(projet, "page", { retour: "./" });

  assert.match(carte, /class="projet-carte"/);
  assert.ok(!/class="projet-etude"/.test(carte), "la carte ne doit pas contenir l'étude");

  assert.match(etude, /class="projet-etude"/);
  assert.ok(!/class="planche page-projet"/.test(etude), "l'étude seule n'est pas une page");

  assert.match(page, /class="planche page-projet"/);
  assert.match(page, /class="projet-etude"/, "la page compose l'étude, elle ne la duplique pas");
});

/* --------------------------------------------------------- vue partagée */

test("la vue résout une seule fois ce que les trois vues utilisent", () => {
  for (const langue of contenu.site.langues) {
    const ctx = contexte(langue);
    for (const projet of projets) {
      const vue = vueProjet({ projet, ctx, rang: 0, total: projets.length });
      assert.equal(vue.id, projet.id);
      assert.equal(vue.chemin, `projets.${projet.id}`);
      assert.equal(vue.idEtude, `etude-${projet.id}`);
      assert.equal(vue.titre, ctx.c(projet.titre, `projets.${projet.id}.titre`));
      assert.equal(vue.description, ctx.c(projet.contexte, `projets.${projet.id}.contexte`));
      assert.equal(vue.medias.length, (projet.medias || []).length, `${projet.id} : médias perdus`);
      assert.deepEqual(vue.disciplines, [...new Set(projet.categories ?? [])]);
      assert.ok(vue.lien.endsWith(`projets/${projet.id}/`), `${langue} · ${projet.id} : ${vue.lien}`);
    }
  }
});

test("carte et étude reçoivent exactement les mêmes médias", () => {
  // C'est la duplication qui existait avant ce gabarit : la même expression de
  // résolution était écrite deux fois. Deux copies, c'est deux dérives possibles.
  const ctx = contexte("fr");
  for (const projet of projets) {
    const a = vueProjet({ projet, ctx, rang: 0, total: 1 }).medias;
    const b = vueProjet({ projet, ctx }).medias;
    assert.deepEqual(a, b, `${projet.id}`);
  }
});

test("la vue sans rang n'invente ni numéro ni compteur", () => {
  const vue = vueProjet({ projet: projets[0], ctx: contexte("fr") });
  assert.equal(vue.numero, null);
  assert.equal(vue.compteur, null);
  assert.ok(!("data-compteur" in vue.ouverture), "pas de compteur sans position connue");
});

/* ------------------------------------------------- contrat d'ouverture */

test("le contrat d'ouverture est entier sur chaque carte", () => {
  const ctx = contexte("fr");
  projets.forEach((projet, rang) => {
    const vue = vueProjet({ projet, ctx, rang, total: projets.length });
    assert.equal(vue.ouverture["data-etude"], projet.id);
    assert.equal(vue.ouverture["aria-haspopup"], "dialog");
    assert.equal(vue.ouverture["data-compteur"], vue.compteur);
    assert.match(vue.compteur, new RegExp(`\\b${String(projets.length)}\\b`), "le compteur doit porter le total");
  });
});

test("l'identifiant du titre de l'étude est celui que la page et la modale nomment", () => {
  // Si les deux divergeaient, le dialogue s'ouvrirait sans nom accessible.
  const ctx = contexte("fr");
  for (const projet of projets) {
    const vue = vueProjet({ projet, ctx });
    const etude = String(Gabarit_Projet({ projet, ctx, mode: "etude" }));
    const page = String(Gabarit_Projet({ projet, ctx, mode: "page", options: { retour: "./" } }));
    assert.ok(etude.includes(`id="${vue.idEtude}"`), `${projet.id} : le titre de l'étude ne porte pas son identifiant`);
    assert.ok(page.includes(`aria-labelledby="${vue.idEtude}"`), `${projet.id} : la page ne nomme pas sa planche par ce titre`);
  }
});

test("la carte porte son contrat d'ouverture dans le HTML rendu", () => {
  const carte = rendre(projets[2], "carte", { rang: 2, total: projets.length });
  assert.match(carte, new RegExp(`data-etude="${projets[2].id}"`));
  assert.match(carte, /aria-haspopup="dialog"/);
  assert.match(carte, /data-compteur="[^"]+"/);
  assert.match(carte, /data-disciplines="[^"]+"/);
});

/* ------------------------------------------------------------- parcours */

test("le parcours tient l'ordre de lecture, bornes comprises", () => {
  const premier = parcours(projets, projets[0].id);
  assert.equal(premier.rang, 0);
  assert.equal(premier.total, projets.length);
  assert.equal(premier.precedent, null, "le premier n'a pas de précédent");
  assert.equal(premier.suivant.id, projets[1].id);

  const dernier = parcours(projets, projets.at(-1).id);
  assert.equal(dernier.rang, projets.length - 1);
  assert.equal(dernier.suivant, null, "le dernier n'a pas de suivant");
  assert.equal(dernier.precedent.id, projets.at(-2).id);

  const milieu = parcours(projets, projets[3].id);
  assert.equal(milieu.precedent.id, projets[2].id);
  assert.equal(milieu.suivant.id, projets[4].id);

  const absent = parcours(projets, "nexiste-pas");
  assert.equal(absent.rang, -1);
  assert.equal(absent.precedent, null);
  assert.equal(absent.suivant, null);
});

test("le parcours ne saute ni ne duplique aucun projet", () => {
  const vus = projets.map((p) => parcours(projets, p.id).rang);
  assert.deepEqual(vus, projets.map((_, i) => i));
  assert.equal(new Set(vus).size, projets.length, "deux projets au même rang");
});

/* ------------------------------------------- aucun projet perdu, pages */

test("les pages publiées rendent les onze projets et chacune de leurs pages", () => {
  for (const langue of contenu.site.langues) {
    const accueil = String(rendrePage({ contenu, ctx: contexte(langue), chemin: "" }));
    assert.equal((accueil.match(/class="projet-carte"/g) ?? []).length, projets.length, `${langue} : cartes manquantes`);
    assert.equal((accueil.match(/aria-haspopup="dialog"/g) ?? []).length, projets.length + 1, `${langue} : une entrée de projet ou le menu manque`);

    for (const projet of projets) {
      const chemin = `projets/${projet.id}/`;
      const page = String(rendrePage({ contenu, ctx: contexte(langue, chemin), chemin }));
      assert.match(page, new RegExp(`data-projet-etude="${projet.id}"`), `${langue} /${chemin}`);
      assert.match(page, new RegExp(`id="etude-${projet.id}"`), `${langue} /${chemin}`);
      assert.equal((page.match(/<h1/g) ?? []).length, 1, `${langue} /${chemin} : il faut un seul h1`);
    }
  }
});

test("aucune adresse de projet n'a changé", () => {
  // Les URL publiées sont un engagement : une page de projet déplacée casse
  // un lien déjà partagé.
  for (const langue of contenu.site.langues) {
    const ctx = contexte(langue);
    for (const projet of projets) {
      const attendu = langue === contenu.site.langueParDefaut ? `projets/${projet.id}/` : `en/projets/${projet.id}/`;
      assert.ok(vueProjet({ projet, ctx }).lien.endsWith(attendu), `${langue} · ${projet.id}`);
    }
  }
});

/* --------------------------------------------------------- rien en dur */

test("le gabarit central ne nomme aucun projet, aucune discipline, aucun libellé", () => {
  const source = fs.readFileSync("Design_System/gabarits/Gabarit_Projet/Gabarit_Projet.js", "utf8");
  const sommaire = contenu.sections.find((s) => Array.isArray(s.categories));
  const interdits = [
    ...projets.map((p) => p.id),
    ...projets.flatMap((p) => Object.values(p.titre)),
    ...sommaire.categories.map((d) => d.id),
    ...sommaire.categories.flatMap((d) => Object.values(d.libelle)),
  ];
  const trouves = interdits.filter((valeur) => source.includes(valeur));
  assert.deepEqual(trouves, [], "valeurs de contenu écrites dans Gabarit_Projet");
});

test("les vues spécialisées ne lisent plus l'enregistrement du projet", () => {
  // Elles reçoivent la vue. Si l'une d'elles recommençait à lire `projet`,
  // les résolutions redeviendraient deux, et pourraient diverger.
  for (const fichier of ["Projet_carte/Projet_carte.js", "Projet_etude/Projet_etude.js"]) {
    // Les commentaires ET les chaînes sont retirés d'abord : « projet.ouvrir »
    // est une clé de dictionnaire, pas une lecture de l'enregistrement.
    const source = fs.readFileSync(`Design_System/gabarits/${fichier}`, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
      .replace(/'(?:[^'\\\n]|\\.)*'/g, "''");
    assert.ok(!/\bprojet\s*[.?[]/.test(source), `${fichier} lit encore l'enregistrement du projet`);
  }
});
