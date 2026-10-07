/**
 * « Rien en dur » sur les pages entières : chaque texte des données et
 * des dictionnaires est remplacé par un marqueur. Si un mot subsiste dans
 * le HTML rendu (texte visible ou attribut lu par les technologies
 * d'assistance), il a été écrit en dur dans un gabarit ou un composant.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { chargerFichiers, referencesMedias } from "../tools/contenu.mjs";
import { cheminsPages, contextePage, rendrePage } from "../tools/pages.mjs";
import { textesLitteraux } from "./textes.mjs";

const MARQUE = "⟦x⟧";
// Valeurs techniques (identifiants, codes, chemins, réglages) : jamais affichées comme texte.
const TECHNIQUES = new Set(["id", "type", "src", "poster", "href", "url", "langues", "langueParDefaut", "ton", "variante", "frequence", "active", "section", "gabarit", "annees", "debut", "fin", "cle", "fichier", "mime", "_origine", "_statut", "icone", "forme", "disposition", "colonnes", "categories"]);

// Une cle technique porte un identifiant ou une liste d'identifiants : on la
// laisse telle quelle. Si elle porte un OBJET, c'est qu'elle structure du
// contenu (le catalogue des disciplines : { id, libelle }) et on y descend.
const estTechnique = (valeur, cle) =>
  TECHNIQUES.has(cle) && (typeof valeur !== "object" || valeur === null || (Array.isArray(valeur) && valeur.every((v) => typeof v === "string")));

function marquer(valeur, cle = "") {
  if (estTechnique(valeur, cle)) return valeur;
  if (typeof valeur === "string") return valeur.includes("{") ? valeur.replace(/[^{}]+(?=\{|$)/g, (m) => (m.trim() ? MARQUE : m)).replace(/\}[^{}]+/g, (m) => `}${MARQUE}`) : MARQUE;
  if (Array.isArray(valeur)) return valeur.map((v) => marquer(v, cle));
  if (valeur && typeof valeur === "object") return Object.fromEntries(Object.entries(valeur).map(([k, v]) => [k, marquer(v, /^(fr|en)$/.test(k) ? cle : k)]));
  return valeur;
}

const vrai = await chargerFichiers(process.cwd());
const contenu = { ...marquer(vrai), site: { ...marquer(vrai.site), langues: vrai.site.langues, langueParDefaut: vrai.site.langueParDefaut, url: vrai.site.url } };
const dictionnaires = Object.fromEntries(vrai.site.langues.map((l) => [l, marquer(JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8")))]));
const medias = new Map(referencesMedias(contenu).map((src) => [src, { src: `${src}.webp`, type: "image", largeur: 1, hauteur: 1 }]));

/** Mots restants dans le texte visible et les attributs lisibles. */
function motsRestants(page) {
  const corps = page.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<svg[\s\S]*?<\/svg>/g, "");
  const textes = [...corps.matchAll(/>([^<]+)</g)].map((m) => m[1]);
  const attributs = [...corps.matchAll(/\s(?:alt|title|aria-label|placeholder|content|data-compteur)="([^"]*)"/g)].map((m) => m[1]);
  return [...textes, ...attributs]
    .map((t) => t.replaceAll(MARQUE, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/https?:\/\/\S+/g, " "))
    .filter((t) => /\p{L}{2,}/u.test(t) && !/^\s*(width=device-width|text\/html|summary_large_image|website|article|profile|noindex|index, follow)/.test(t.trim()));
}

test("aucun texte en dur dans les pages rendues (FR, EN ; accueil, CV, projet)", () => {
  for (const langue of vrai.site.langues) {
    for (const chemin of ["", "cv/", cheminsPages(contenu).at(-1)]) {
      const ctx = contextePage({ site: contenu.site, langue, chemin, dictionnaires, medias, ressources: { sprite: "", couleurTheme: "#000000", annee: 2030 } });
      const restants = [...new Set(motsRestants(String(rendrePage({ contenu, ctx, chemin }))).map((t) => t.trim()))];
      assert.deepEqual(restants, [], `${langue} /${chemin}`);
    }
  }
});

test("aucun texte en dur dans la page de maintenance (FR, EN)", () => {
  const site = { ...contenu.site, maintenance: { active: true } };
  for (const langue of vrai.site.langues) {
    const ctx = contextePage({ site, langue, chemin: "", dictionnaires, medias, ressources: { sprite: "", couleurTheme: "#000000", annee: 2030 } });
    const page = String(rendrePage({ contenu: { ...contenu, site }, ctx, chemin: "" }));
    assert.match(page, /data-maintenance/);
    assert.deepEqual([...new Set(motsRestants(page).map((t) => t.trim()))], [], langue);
  }
});

test("aucun gabarit ni script du site ne contient de texte en dur", () => {
  const fichiers = ["Frontend/site.js", "Frontend/mesure.js", "tools/pages.mjs", ...fs.readdirSync("Design_System/gabarits", { recursive: true }).filter((f) => f.endsWith(".js")).map((f) => `Design_System/gabarits/${f}`)];
  for (const fichier of fichiers) assert.deepEqual(textesLitteraux(fs.readFileSync(fichier, "utf8")), [], fichier);
});

// AGENTS.md 3.3 : une couleur ne s'écrit en clair que dans Tokens.css.
const COULEUR_BRUTE = /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i;
const sansCommentaires = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

test("aucune feuille du Design System, hors Tokens.css, ne contient de couleur brute", () => {
  const css = fs.readdirSync("Design_System", { recursive: true }).filter((f) => f.endsWith(".css") && f !== "fondations/Tokens.css");
  assert.ok(css.some((f) => f.startsWith("composants/")) && css.some((f) => f.startsWith("fondations/")) && css.some((f) => f.startsWith("gabarits/")), "composants, fondations et gabarits sont tous couverts");
  for (const f of css) assert.doesNotMatch(sansCommentaires(fs.readFileSync(`Design_System/${f}`, "utf8")), COULEUR_BRUTE, f);
});

test("le contrôle des couleurs brutes détecte bien une couleur (témoin)", () => {
  for (const brute of [".a { color: #fff; }", ".a { color: #576740; }", ".a { background: rgba(0,0,0,.5); }", ".a { color: hsl(90 20% 30%); }"]) assert.match(sansCommentaires(brute), COULEUR_BRUTE, brute);
  for (const propre of [".a { color: var(--texte); }", "/* #fff */ .a { color: var(--texte); }", "#ancre { color: var(--texte); }"]) assert.doesNotMatch(sansCommentaires(propre), COULEUR_BRUTE, propre);
});

test("le contrôle des pages détecte bien un texte en dur (témoin)", () => {
  assert.deepEqual(motsRestants(`<p>${MARQUE}</p><p>Texte en dur</p><img alt="Image en dur"><span>07 / 11</span>`).map((t) => t.trim()), ["Texte en dur", "Image en dur"]);
});
