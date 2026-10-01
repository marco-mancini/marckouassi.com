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
const TECHNIQUES = new Set(["id", "type", "src", "poster", "href", "url", "langues", "langueParDefaut", "ton", "variante", "frequence", "active", "section", "gabarit", "annees", "debut", "fin", "cle", "fichier", "mime", "_origine", "_statut", "icone", "forme", "disposition", "colonnes"]);

function marquer(valeur, cle = "") {
  if (TECHNIQUES.has(cle)) return valeur;
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

test("aucun gabarit ni script du site ne contient de texte en dur", () => {
  const fichiers = ["Frontend/site.js", "tools/pages.mjs", ...fs.readdirSync("Design_System/gabarits", { recursive: true }).filter((f) => f.endsWith(".js")).map((f) => `Design_System/gabarits/${f}`)];
  for (const fichier of fichiers) assert.deepEqual(textesLitteraux(fs.readFileSync(fichier, "utf8")), [], fichier);
});

test("aucune feuille de gabarit ne contient de couleur brute", () => {
  const css = fs.readdirSync("Design_System/gabarits", { recursive: true }).filter((f) => f.endsWith(".css"));
  for (const f of css) assert.doesNotMatch(fs.readFileSync(`Design_System/gabarits/${f}`, "utf8").replace(/\/\*[\s\S]*?\*\//g, ""), /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i, f);
});

test("le contrôle des pages détecte bien un texte en dur (témoin)", () => {
  assert.deepEqual(motsRestants(`<p>${MARQUE}</p><p>Texte en dur</p><img alt="Image en dur"><span>07 / 11</span>`).map((t) => t.trim()), ["Texte en dur", "Image en dur"]);
});
