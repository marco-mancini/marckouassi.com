/**
 * Back-office : gabarits purs (éditeur, écrans), dictionnaires, garde
 * contre une clé secrète. Les tests navigateur sont dans tests/navigateur.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { creerContexte, estTraduisible } from "../../Design_System/i18n/langue.js";
import { Editeur, elementVide, compterATraduire, nomElement } from "../../Design_System/gabarits/Admin/Editeur.js";
import { Connexion, BarrePublication, TableauDeBord, EcranProjets, EcranSections, EcranDocument, EcranMedias, PageAdmin, liensAdmin } from "../../Design_System/gabarits/Admin/Ecrans.js";
import { Gabarit_Bo } from "../../Design_System/gabarits/Gabarit_Bo/Gabarit_Bo.js";
import { valider, formaterErreurs, DOCUMENTS } from "../../Design_System/gabarits/donnees.js";
import { estCleSecrete } from "../../tools/admin.mjs";
import { chargerFichiers } from "../../tools/contenu.mjs";
import { textesLitteraux } from "../textes.mjs";

const fr = JSON.parse(fs.readFileSync("Design_System/i18n/admin.fr.json", "utf8"));
const en = JSON.parse(fs.readFileSync("Design_System/i18n/admin.en.json", "utf8"));
const ctx = creerContexte({ langue: "fr", langueParDefaut: "fr", dictionnaires: { fr, en } });
const contenu = await chargerFichiers(process.cwd());

const cles = (objet, prefixe = "") => Object.entries(objet).flatMap(([k, v]) => (k.startsWith("_") ? [] : v && typeof v === "object" && !Array.isArray(v) ? cles(v, `${prefixe}${k}.`) : [`${prefixe}${k}`]));

test("éditeur : chaque clé du contenu a un libellé du dictionnaire, chaque contrôle un label relié", () => {
  for (const cle of DOCUMENTS) {
    const rendu = String(Editeur({ valeur: contenu[cle], chemin: cle, ctx, options: { identifiantModifiable: true } }));
    const ids = [...rendu.matchAll(/<(?:input|textarea|select)[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
    for (const id of ids) assert.ok(rendu.includes(`for="${id}"`), `${cle} : contrôle sans label ${id}`);
    assert.equal(new Set(ids).size, ids.length, `${cle} : identifiants en double`);
  }
  const vus = new Set();
  const parcourir = (v) => {
    if (Array.isArray(v)) return v.forEach(parcourir);
    if (v && typeof v === "object" && !estTraduisible(v)) for (const [k, x] of Object.entries(v)) { if (!k.startsWith("_")) vus.add(k); parcourir(x); }
  };
  DOCUMENTS.forEach((cle) => parcourir(contenu[cle]));
  const sansLibelle = [...vus].filter((k) => !ctx.t.existe(`champs.${k}`));
  assert.deepEqual(sansLibelle, []);
});

test("éditeur : valeurs techniques non modifiables, id modifiable seulement si demandé, échappement", () => {
  const section = contenu.sections[0];
  const rendu = String(Editeur({ valeur: section, chemin: "sections.0", ctx }));
  assert.ok(!rendu.includes('name="sections.0.type"'));
  assert.ok(!rendu.includes('name="sections.0.id"'));
  const piege = String(Editeur({ valeur: { titre: { fr: '"><script>alert(1)</script>' } }, chemin: "x", ctx }));
  assert.ok(!piege.includes("<script>alert(1)"));
});

test("elementVide : même forme, textes vidés, valeurs techniques conservées", () => {
  const vide = elementVide(contenu.projets[0]);
  assert.deepEqual(Object.keys(vide), Object.keys(contenu.projets[0]));
  assert.deepEqual(vide.titre, Object.fromEntries(Object.keys(contenu.projets[0].titre).map((langue) => [langue, ""])));
  assert.deepEqual(vide.medias, []);
  assert.equal(vide.annees.debut, null);
  const section = elementVide(contenu.sections.find((s) => s.type === "contact"));
  assert.equal(section.type, "contact");
});

test("compterATraduire et nomElement", () => {
  assert.equal(compterATraduire({ a: { fr: "x" }, b: [{ fr: "y", en: "z" }, { fr: "w", en: "" }], _role: { fr: "ignoré" } }), 2);
  assert.equal(nomElement({ titre: { fr: "Un **titre**" } }, 0, ctx), "Un titre");
  assert.equal(nomElement({}, 2, ctx), "Élément 3");
});

test("validation : erreurs structurées, phrases du dictionnaire", () => {
  const essai = structuredClone(contenu);
  essai.projets.push({ ...elementVide(essai.projets[0]), id: "" });
  const erreurs = valider(essai);
  assert.ok(erreurs.some((e) => e.code === "identifiant" && e.chemin === "projets.11.id"));
  assert.ok(erreurs.every((e) => fr.validation[e.code]));
  assert.match(formaterErreurs(erreurs, ctx.t)[0], /projets\.11/);
});

test("Gabarit_Bo : coquille commune (évitement, main, navigation active, menu en Modale, barre)", () => {
  const liens = liensAdmin({ ctx, sections: contenu.sections });
  assert.deepEqual(liens.map((l) => l.cle), ["tableau", "sections", "parcours", "projets", "prestations", "medias", "cv", "parametres"]);
  const { tete, contenu: corps } = EcranProjets({ ctx, projets: contenu.projets });
  const rendu = String(Gabarit_Bo({ ctx, ecran: "projets", tete, contenu: corps, options: { liens, barre: BarrePublication({ ctx, modifie: true }), demo: true } }));
  assert.match(rendu, /class="skip-link" href="#contenu"/);
  assert.match(rendu, /<main class="cadre-admin__principal" id="contenu"/);
  assert.match(rendu, /href="#\/projets" aria-current="page"|aria-current="page"[^>]*href="#\/projets"/);
  assert.match(rendu, /<dialog[^>]*id="menu-admin"/);
  assert.match(rendu, /<dialog[^>]*id="apercu"/);
  assert.match(rendu, /<dialog[^>]*id="confirmation"/);
  assert.match(rendu, /<h1[^>]*id="titre-ecran"/);
  assert.match(rendu, /data-statut-enregistrement/);
  const accueil = String(Gabarit_Bo({ ctx, contenu: Connexion({ ctx, signature: { salutation: "a", accent: "b", mot: "c" } }).contenu, options: { variante: "accueil" } }));
  assert.match(accueil, /planche--olive/);
  assert.match(accueil, /<main[^>]*id="contenu"/);
  assert.match(accueil, /aria-labelledby="titre-accueil-bo"/);
  assert.match(accueil, /id="titre-accueil-bo"/);
});

test("écrans : contenu métier seulement (aucune coquille), états et noms accessibles", () => {
  const ecrans = [
    TableauDeBord({ ctx, contenu, publications: [{ version: 3, statut: "en_ligne", cree_le: "2026-01-01" }], formaterDate: (d) => d }),
    EcranSections({ ctx, sections: contenu.sections }),
    EcranProjets({ ctx, projets: contenu.projets }),
    EcranDocument({ ctx, titre: "x", valeur: contenu.projets[0], chemin: "projets.0" }),
    EcranMedias({ ctx, contenu, urlMedia: (s) => s }),
  ];
  for (const { tete, contenu: corps } of ecrans) {
    assert.ok(tete?.titre);
    assert.doesNotMatch(String(corps), /cadre-admin|en-tete|skip-link|<main/);
  }
  assert.match(String(ecrans[0].contenu), /class="carte/);
  assert.match(String(ecrans[3].tete.actions), /data-segments="langue-edition"/);
  assert.match(String(ecrans[3].contenu), /data-langue-edition="fr"/);
  assert.match(String(Connexion({ ctx, erreur: "x" }).contenu), /aria-invalid="true"/);
  assert.match(String(PageAdmin({ ctx, nom: "Nom" })), /noindex, nofollow/);
});

test("aucun écran du back-office n'est rendu hors de Gabarit_Bo", () => {
  const app = fs.readFileSync("Admin/app.js", "utf8");
  const rendus = [...app.matchAll(/racine\.innerHTML\s*=\s*([^;]+);/g)].map((m) => m[1]);
  assert.ok(rendus.length >= 3);
  for (const r of rendus) assert.match(r, /^String\(Gabarit_Bo\(/, r);
});

test("garde : une clé secrète Supabase n'entre jamais dans la configuration publique", () => {
  const jwt = (role) => ["e30", Buffer.from(JSON.stringify({ role })).toString("base64url"), "sig"].join(".");
  assert.ok(estCleSecrete(jwt("service_role")));
  assert.ok(estCleSecrete("sb_secret_abc"));
  assert.ok(!estCleSecrete(jwt("anon")));
  assert.ok(!estCleSecrete("sb_publishable_abc"));
  assert.ok(!estCleSecrete(null));
});

test("aucun texte en dur dans le script et les services du back-office", () => {
  for (const fichier of ["Admin/app.js", "Admin/services/supabase.js", "Admin/services/demo.js"]) {
    assert.deepEqual(textesLitteraux(fs.readFileSync(fichier, "utf8")), [], fichier);
  }
});

// Parité des dictionnaires admin et estTraduisible : tests/cms.test.mjs (toujours vérifiés).
// Recherche de clés et de jetons : tests/secrets.test.mjs (tous les fichiers suivis).
