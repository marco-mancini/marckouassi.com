/**
 * Tests de résistance : le site se construit à partir de données
 * modifiées comme le ferait le back-office (projet ajouté, supprimé,
 * déplacé, média absent, traduction absente, texte long ou vide), sans
 * qu'aucun gabarit ne soit retouché. Les textes ajoutés ici sont des
 * valeurs d'essai, jamais du contenu du site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { chargerFichiers, valider, referencesMedias } from "../tools/contenu.mjs";
import { cheminsPages, contextePage, rendrePage } from "../tools/pages.mjs";
import { lire } from "../Design_System/i18n/langue.js";

const RACINE = process.cwd();
const dictionnaires = { fr: JSON.parse(fs.readFileSync("Design_System/i18n/fr.json", "utf8")), en: JSON.parse(fs.readFileSync("Design_System/i18n/en.json", "utf8")) };
const ressources = { sprite: "<svg></svg>", couleurTheme: "#000000", annee: 2030 };
const base = await chargerFichiers(RACINE);
const copie = () => structuredClone(base);

/** Table de médias factice : chaque référence est « publiée », sauf celles qu'on retire. */
function tableMedias(contenu, absents = []) {
  return new Map(referencesMedias(contenu).filter((src) => !absents.includes(src)).map((src) => [src, { src: `Public/${src}.webp`, type: "image", largeur: 800, hauteur: 600 }]));
}

function rendre(contenu, { langue = "fr", chemin = "", absents = [] } = {}) {
  assert.deepEqual(valider(contenu), []);
  const ctx = contextePage({ site: contenu.site, langue, chemin, dictionnaires, medias: tableMedias(contenu, absents), ressources });
  return { page: String(rendrePage({ contenu, ctx, chemin })), ctx };
}

const compteurs = (page) => [...page.matchAll(/data-compteur="([^"]+)"/g)].map((m) => m[1]);
const pastilles = (page) => [...page.matchAll(/projet-carte__entete"><span[^>]*>(\d+)</g)].map((m) => m[1]);

test("le contenu actuel est valide et toutes les pages se rendent, en FR et en EN", () => {
  for (const langue of base.site.langues) for (const chemin of cheminsPages(base)) assert.ok(rendre(copie(), { langue, chemin }).page.startsWith("<!doctype html>"), `${langue} ${chemin}`);
});

test("11 → 12 projets : compteur, numéros, nombre en lettres et plage d'années recalculés", () => {
  const contenu = copie();
  const nouveau = { ...structuredClone(contenu.projets[0]), id: "essai-douze", annees: { debut: 2027, fin: 2027 } };
  contenu.projets.push(nouveau);
  const { page } = rendre(contenu, { chemin: `realisations/${nouveau.categoriePrincipale}/` });
  const total = contenu.projets.filter((projet) => projet.categoriePrincipale === nouveau.categoriePrincipale).length;
  assert.equal(compteurs(page).length, total);
  assert.equal(compteurs(page).at(-1), `Réalisation ${String(total).padStart(2, "0")} / ${String(total).padStart(2, "0")}`);
  assert.equal(compteurs(page)[0], `Réalisation 01 / ${String(total).padStart(2, "0")}`);
  assert.match(rendre(contenu).page, /Douze réalisations · 2022 — 2027/);
  assert.ok(cheminsPages(contenu).includes("projets/essai-douze/"));
  assert.match(rendre(contenu, { chemin: "projets/essai-douze/" }).page, /<h1/);
  assert.match(rendre(contenu, { langue: "en" }).page, /Twelve works/);
});

test("projet supprimé : plus de trou dans la numérotation, plus de page, total recalculé", () => {
  const contenu = copie();
  const supprime = contenu.projets.splice(4, 1)[0];
  const page = rendre(contenu, { chemin: `realisations/${supprime.categoriePrincipale}/` }).page;
  const attendus = contenu.projets.filter((projet) => projet.categoriePrincipale === supprime.categoriePrincipale).length;
  assert.equal(compteurs(page).length, attendus);
  assert.ok(!page.includes(`projets/${base.projets[4].id}/`));
});

test("projet déplacé : l'ordre des données fait l'ordre et les numéros", () => {
  const contenu = copie();
  const deplace = contenu.projets.pop();
  contenu.projets.unshift(deplace);
  const categorie = deplace.categoriePrincipale;
  const { page } = rendre(contenu, { chemin: `realisations/${categorie}/` });
  const premier = page.indexOf(`data-etude="${base.projets.at(-1).id}"`);
  const liste = contenu.projets.filter((projet) => projet.categoriePrincipale === categorie);
  assert.ok(premier > -1 && premier === page.indexOf(`data-etude="${liste[0].id}"`));
  assert.equal(compteurs(page)[0], `Réalisation 01 / ${String(liste.length).padStart(2, "0")}`);
});

test("média absent : emplacement conservé, aucune image cassée ni « undefined »", () => {
  const contenu = copie();
  const absent = contenu.projets[0].medias[0].src;
  const { page } = rendre(contenu, { chemin: `realisations/${contenu.projets[0].categoriePrincipale}/`, absents: [absent] });
  assert.match(page, /media--absent/);
  assert.ok(!/src="(undefined|null)?"/.test(page));
  assert.ok(!page.includes("undefined"));
  const etude = rendre(contenu, { chemin: `projets/${contenu.projets[0].id}/`, absents: [absent] }).page;
  assert.match(etude, /media--absent/);
  assert.ok(!etude.includes("undefined"));
});

test("traduction EN absente : repli FR balisé lang=fr, consigné, jamais inventé", () => {
  const contenu = copie();
  const projet = contenu.projets[0];
  const titreFr = typeof projet.titre === "object" ? projet.titre.fr : projet.titre;
  projet.contexte = { fr: "Contexte essai uniquement en français" };
  const { page, ctx } = rendre(contenu, { langue: "en", chemin: `projets/${projet.id}/` });
  assert.match(page, /lang="fr"[^>]*>Contexte essai uniquement en français/);
  assert.ok(ctx.manquants.some((m) => m.langue === "en" && m.cle.endsWith(`${projet.id}.contexte`)));
  assert.ok(page.includes(titreFr.replace(/&/g, "&amp;")) || page.includes(titreFr));
});

test("valeur FR obligatoire manquante : la construction est refusée avec un message clair", () => {
  const contenu = copie();
  contenu.projets[0].titre = { en: "Only English" };
  assert.deepEqual(valider(contenu), [{ code: "requis", chemin: `projets.${contenu.projets[0].id}.titre` }]);
  const doublon = copie();
  doublon.projets.push(structuredClone(doublon.projets[0]));
  assert.ok(valider(doublon).some((e) => e.code === "doublon"));
});

test("textes longs, balisage et caractères spéciaux : échappés, jamais interprétés", () => {
  const contenu = copie();
  const long = `${"Très long titre d'essai ".repeat(20)}<script>alert(1)</script> & « guillemets »`;
  contenu.projets[0].titre = { fr: long };
  const { page } = rendre(contenu, { chemin: `realisations/${contenu.projets[0].categoriePrincipale}/` });
  assert.ok(!page.includes("<script>alert(1)</script>"));
  assert.ok(page.includes("&lt;script&gt;alert(1)&lt;/script&gt; &amp; « guillemets »"));
});

test("listes vides : un projet sans médias et une section sans éléments optionnels se rendent", () => {
  const contenu = copie();
  contenu.projets[0].medias = [];
  const { page } = rendre(contenu);
  assert.ok(!page.includes("undefined"));
  assert.ok(rendre(contenu, { chemin: `projets/${contenu.projets[0].id}/` }).page.includes("<h1"));
});

test("nouveau projet sans traduction EN : page EN générée, champs balisés en français", () => {
  const contenu = copie();
  const nouveau = structuredClone(contenu.projets[0]);
  for (const champ of ["titre", "categorie", "contexte", "role", "idee", "valeur"]) {
    const v = nouveau[champ];
    nouveau[champ] = { fr: typeof v === "object" && !Array.isArray(v) ? v.fr : v };
  }
  nouveau.id = "essai-fr-seul";
  contenu.projets.push(nouveau);
  const { page, ctx } = rendre(contenu, { langue: "en", chemin: "projets/essai-fr-seul/" });
  assert.match(page, /<html lang="en"/);
  assert.ok(ctx.manquants.filter((m) => m.cle.includes("essai-fr-seul")).length >= 1);
});

test("chaque champ « à traduire » désigne un chemin réel des données (pour le back-office)", () => {
  // Le contenu réel est entièrement traduit : on retire l'anglais de la copie
  // pour que chaque texte traduisible devienne un champ « à traduire ».
  const sansAnglais = (o) => {
    if (Array.isArray(o)) return o.forEach(sansAnglais);
    if (!o || typeof o !== "object") return;
    if ("fr" in o && "en" in o) delete o.en;
    Object.values(o).forEach(sansAnglais);
  };
  const contenu = copie();
  sansAnglais(contenu);
  const valeurA = (chemin) => lire(contenu, chemin);
  const signales = new Set();
  for (const chemin of cheminsPages(contenu)) for (const m of rendre(contenu, { langue: "en", chemin }).ctx.manquants) if (m.type === "contenu") signales.add(m.cle);
  assert.ok(signales.size > 0);
  for (const cle of signales) {
    assert.ok(cle, "champ signalé sans chemin");
    const valeur = valeurA(cle);
    assert.ok(valeur !== undefined && valeur !== null, `chemin introuvable : ${cle}`);
    assert.ok(typeof valeur === "object" && "fr" in valeur && !("en" in valeur), `${cle} n'est pas un texte traduisible sans EN`);
  }
});
