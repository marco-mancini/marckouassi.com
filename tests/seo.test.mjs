/**
 * Favicon, carte de partage et référencement (#183, #184, #185, #186).
 * Rendu des pages en mémoire : aucun build, aucun navigateur.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { chargerFichiers, referencesMedias } from "../tools/contenu.mjs";
import { contextePage, rendrePage } from "../tools/pages.mjs";
import { sceauVert, ico, publierIcones, couleurJeton, ICONES } from "../tools/icones.mjs";
import { publierPartage, fichierCarte, FICHIER_EMPREINTE, DIMENSIONS_CARTE } from "../tools/partage.mjs";
import { sourceLocale } from "../tools/medias.mjs";
import { CartePartage, textesPartage } from "../Design_System/gabarits/Partage/Partage.js";
import { jsonLd } from "../Design_System/gabarits/sections/commun.js";
import { configurationCms } from "../tools/cms.mjs";

const RACINE = process.cwd();
const contenu = await chargerFichiers(RACINE);
const { site } = contenu;
const dictionnaires = Object.fromEntries(site.langues.map((l) => [l, JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8"))]));
const medias = new Map(referencesMedias(contenu).map((src) => [src, { src: `${src}.webp`, type: "image", largeur: 1, hauteur: 1 }]));
const image = (src) => ({ src, largeur: 1200, hauteur: 630 });
const PARTAGE = {
  site: Object.fromEntries(site.langues.map((l) => [l, image(fichierCarte(l))])),
  cv: null,
  projets: Object.fromEntries(contenu.projets.map((p) => [p.id, image(`Public/partage/projets/${p.id}.jpg`)])),
};
const rendre = ({ langue = "fr", chemin = "", partage = PARTAGE, donnees = contenu } = {}) => String(rendrePage({
  contenu: donnees, chemin,
  ctx: contextePage({ site: donnees.site, langue, chemin, dictionnaires, medias, ressources: { sprite: "", couleurTheme: "#000000", annee: 2030, partage } }),
}));
const meta = (page, nom) => page.match(new RegExp(`<meta (?:property|name)="${nom}" content="([^"]*)">`))?.[1];
const donneesStructurees = (page) => JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const projet = contenu.projets[0];

/* ---------- Favicon (#183) ---------- */

test("favicon : le sceau complet du sprite, aux couleurs du sceau vert, sans jeton non résolu", async () => {
  const { svg, fond } = await sceauVert(RACINE);
  assert.doesNotMatch(svg, /var\(/);
  assert.equal(fond, await couleurJeton(RACINE, "--clair-logo-lettre"));
  for (const jeton of ["--sceau-vert-lettre", "--sceau-vert-accent"]) assert.ok(svg.includes(await couleurJeton(RACINE, jeton)), jeton);
  // Toutes les formes du sceau : rond, traits de fond, M et K.
  const sprite = fs.readFileSync("Design_System/assets/logos-sprite.svg", "utf8").match(/<symbol id="logo-mk-seal"[\s\S]*?<\/symbol>/)[0];
  assert.equal((svg.match(/<(path|circle)\b/g) || []).length, (sprite.match(/<(path|circle)\b/g) || []).length);
});

test("favicon : conteneur ICO valide, une image par taille", () => {
  const donnees = ico([{ taille: 16, donnees: Buffer.from("a") }, { taille: 32, donnees: Buffer.from("bb") }]);
  assert.equal(donnees.readUInt16LE(2), 1);
  assert.equal(donnees.readUInt16LE(4), 2);
  assert.equal(donnees.readUInt8(6), 16);
  assert.equal(donnees.readUInt32LE(6 + 16 + 12), 6 + 32 + 1);
});

test("favicon : icônes et manifeste écrits, nets à leur taille", async () => {
  const sortie = fs.mkdtempSync(path.join(os.tmpdir(), "icones-"));
  try {
    await publierIcones({ racine: RACINE, sortie, site });
    for (const { fichier, taille } of [...ICONES.android, { fichier: ICONES.apple, taille: 180 }]) {
      const { width, height } = await sharp(path.join(sortie, fichier)).metadata();
      assert.deepEqual([width, height], [taille, taille], fichier);
    }
    // iOS remplit la transparence en noir : l'icône Apple est opaque.
    assert.equal((await sharp(path.join(sortie, ICONES.apple)).stats()).isOpaque, true);
    const manifeste = JSON.parse(fs.readFileSync(path.join(sortie, ICONES.manifeste), "utf8"));
    assert.equal(manifeste.name, site.identite.nom);
    assert.deepEqual(manifeste.icons.map((i) => i.src), ICONES.android.map((i) => `/${i.fichier}`));
    assert.equal(fs.readFileSync(path.join(sortie, ICONES.ico)).readUInt16LE(4), 3);
  } finally { fs.rmSync(sortie, { recursive: true, force: true }); }
});

test("favicon : chaque page déclare SVG, ICO, icône Apple et manifeste depuis sa racine", () => {
  const page = rendre({ langue: "en", chemin: `projets/${projet.id}/` });
  for (const lien of [
    '<link rel="icon" href="../../../favicon.ico" sizes="32x32">',
    '<link rel="icon" href="../../../favicon.svg" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="../../../apple-touch-icon.png">',
    '<link rel="manifest" href="../../../site.webmanifest">',
  ]) assert.ok(page.includes(lien), lien);
});

/* ---------- Carte de partage (#184) ---------- */

test("partage : l'accueil et le CV portent la carte de leur langue, en adresse absolue sans préfixe de langue", () => {
  for (const langue of site.langues) {
    for (const chemin of ["", "cv/"]) {
      const page = rendre({ langue, chemin });
      assert.equal(meta(page, "og:image"), `${site.url}/${fichierCarte(langue)}`, `${langue} /${chemin}`);
      assert.equal(meta(page, "og:image:width"), "1200");
      assert.equal(meta(page, "og:image:height"), "630");
      // Texte alternatif : modèle du dictionnaire rempli par le contenu.
      const textes = textesPartage({ contenu, ctx: contextePage({ site, langue, chemin, dictionnaires, medias, ressources: { sprite: "" } }) });
      assert.equal(meta(page, "og:image:alt"), `${textes.portrait.alt} ${textes.accent} ${textes.mot}.`.replace(/'/g, "&#39;"));
      assert.equal(meta(page, "twitter:card"), "summary_large_image");
      assert.equal(meta(page, "og:site_name"), site.identite.nom);
    }
  }
});

test("partage : une page projet porte sa vignette ; sans table, aucune image et une carte simple", () => {
  const page = rendre({ chemin: `projets/${projet.id}/` });
  assert.equal(meta(page, "og:image"), `${site.url}/Public/partage/projets/${projet.id}.jpg`);
  const sans = rendre({ chemin: `projets/${projet.id}/`, partage: null });
  assert.equal(meta(sans, "og:image"), undefined);
  assert.equal(meta(sans, "twitter:card"), "summary");
});

test("partage : la carte dérive de la couverture et du portrait, sans texte propre", () => {
  const ctx = contextePage({ site, langue: "fr", chemin: "", dictionnaires, medias, ressources: { sprite: "" } });
  const textes = textesPartage({ contenu, ctx });
  const couverture = contenu.sections.find((s) => s.type === "couverture");
  assert.equal(textes.promesse, couverture.promesse.fr);
  assert.equal(textes.salutation, couverture.signature.salutation.fr);
  const carte = String(CartePartage({ contenu, ctx }));
  for (const texte of [textes.edition, textes.role, textes.accent, textes.mot]) assert.ok(carte.includes(texte), texte);
  assert.match(carte, /sceau--partage/);
  assert.equal(textesPartage({ contenu: { ...contenu, sections: [] }, ctx }), null);
});

test("partage : les cartes versionnées existent en JPEG 1200 × 630 et correspondent à la couverture", async () => {
  const empreintes = JSON.parse(fs.readFileSync(FICHIER_EMPREINTE, "utf8"));
  for (const langue of site.langues) {
    const { format, width, height } = await sharp(fichierCarte(langue)).metadata();
    assert.deepEqual([format, width, height], ["jpeg", DIMENSIONS_CARTE.largeur, DIMENSIONS_CARTE.hauteur], langue);
    const ctx = contextePage({ site, langue, chemin: "", dictionnaires, medias, ressources: { sprite: "" } });
    assert.deepEqual(empreintes[langue], textesPartage({ contenu, ctx }), `${langue} : carte périmée, lancer « npm run partage »`);
  }
});

test("partage : le build publie la carte et une vignette 1200 × 630 par projet", async () => {
  const sortie = fs.mkdtempSync(path.join(os.tmpdir(), "partage-"));
  const avertissements = [];
  try {
    const un = { ...contenu, projets: contenu.projets.slice(0, 1) };
    const table = await publierPartage({ racine: RACINE, sortie, contenu: un, dictionnaires, lireSource: sourceLocale(RACINE), journal: { warn: (m) => avertissements.push(m) } });
    assert.deepEqual(avertissements, []);
    for (const langue of site.langues) assert.ok(fs.existsSync(path.join(sortie, table.site[langue].src)));
    const vignette = table.projets[projet.id];
    const { format, width, height } = await sharp(path.join(sortie, vignette.src)).metadata();
    assert.deepEqual([format, width, height], ["jpeg", 1200, 630]);
    assert.equal(table.cv, null);
  } finally { fs.rmSync(sortie, { recursive: true, force: true }); }
});

/* ---------- Données structurées (#185) ---------- */

test("JSON-LD : personne et site sur chaque page, dérivés du contenu", () => {
  for (const chemin of ["", "cv/", `projets/${projet.id}/`]) {
    const graphe = donneesStructurees(rendre({ chemin }))["@graph"];
    const personne = graphe.find((n) => n["@type"] === "Person");
    assert.equal(personne.name, site.identite.nom);
    assert.deepEqual(personne.sameAs, [site.contact.linkedin]);
    assert.ok(graphe.some((n) => n["@type"] === "WebSite"), chemin);
  }
  const projetGraphe = donneesStructurees(rendre({ langue: "en", chemin: `projets/${projet.id}/` }))["@graph"];
  const oeuvre = projetGraphe.find((n) => n["@type"] === "CreativeWork");
  assert.equal(oeuvre.inLanguage, "en");
  assert.equal(oeuvre.creator["@id"], `${site.url}/#personne`);
  assert.ok(donneesStructurees(rendre({ chemin: "cv/" }))["@graph"].some((n) => n["@type"] === "ProfilePage"));
});

test("JSON-LD : aucune donnée ne peut fermer la balise script", () => {
  assert.equal(jsonLd({ nom: "</script><b>" }), '{"nom":"\\u003c/script>\\u003cb>"}');
});

/* ---------- Description courte (#186) ---------- */

test("description courte : prise dans sa langue seulement, sinon le résumé du projet", () => {
  const avec = { ...contenu, projets: contenu.projets.map((p, i) => (i === 0 ? { ...p, seo: { description: { fr: "Courte en français." } } } : p)) };
  assert.equal(meta(rendre({ donnees: avec, chemin: `projets/${projet.id}/` }), "description"), "Courte en français.");
  const anglais = meta(rendre({ donnees: avec, langue: "en", chemin: `projets/${projet.id}/` }), "description");
  assert.notEqual(anglais, "Courte en français.");
  assert.equal(anglais, meta(rendre({ langue: "en", chemin: `projets/${projet.id}/` }), "description"));
});

test("description courte : proposée dans le CMS pour chaque projet, avec son image de partage", () => {
  const fr = JSON.parse(fs.readFileSync("Design_System/i18n/admin.fr.json", "utf8"));
  const config = configurationCms({ contenu, fr });
  const champs = JSON.stringify(config);
  assert.match(champs, /"name":"seo","label":"[^"]+","required":false,"widget":"object","fields":\[\{"name":"description"/);
});
