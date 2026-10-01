/**
 * COMPARER À LA RÉFÉRENCE — le design de 71cfb9d (refonte/editorial-final-v2)
 * est la référence visuelle. Cet outil reconstruit ce site en lecture seule
 * (git archive, comme le faisait son flux de publication), puis compare
 * l'accueil et le CV à _site, de 320 à 1440 px, en clair et en sombre :
 * hauteur de page et position de chaque section. Prérequis : npm run build.
 *
 *   npm run comparer-reference            (référence par défaut : 71cfb9d)
 *   npm run comparer-reference -- <commit>
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { servir, lancer, ouvrir, defiler } from "../tests/navigateur/outils.mjs";

const COMMIT = process.argv[2] || "71cfb9d";
const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "reference-"));
const source = path.join(dossier, "source");
const site = path.join(dossier, "site");
fs.mkdirSync(source);
execFileSync("sh", ["-c", `git archive ${COMMIT} | tar -x -C "${source}"`]);
fs.mkdirSync(path.join(site, "Public"), { recursive: true });
for (const f of ["index.html", "script.js"]) fs.copyFileSync(path.join(source, "Frontend", f), path.join(site, f));
fs.cpSync(path.join(source, "Design_System"), path.join(site, "Design_System"), { recursive: true });
fs.cpSync(path.join(source, "Public/images"), path.join(site, "Public/images"), { recursive: true });

const ref = await servir(site); const neuf = await servir("_site"); const nav = await lancer();
const PAGES = [["accueil", "/", "/"], ["cv", "/Design_System/assets/Cv_Marc.html", "/cv/"]];
let ecarts = 0;
for (const [nom, cheminRef, cheminNeuf] of PAGES) {
  for (const largeur of [320, 375, 768, 850, 1024, 1440]) {
    for (const theme of ["light", "dark"]) {
      const mesures = [];
      for (const [serveur, chemin] of [[ref, cheminRef], [neuf, cheminNeuf]]) {
        const page = await ouvrir(nav, serveur.url + chemin, { largeur, reduit: true, theme });
        await defiler(page);
        mesures.push(await page.evaluate(() => ({ hauteur: document.documentElement.scrollHeight, sections: [...document.querySelectorAll("section[id]")].map((s) => [s.id, Math.round(s.getBoundingClientRect().height)]) })));
        await page.fermer();
      }
      const [a, b] = mesures;
      const sections = a.sections.filter(([id, h]) => { const autre = b.sections.find(([i]) => i === id); return autre && autre[1] !== h; }).map(([id, h]) => `${id} ${h}→${b.sections.find(([i]) => i === id)[1]}`);
      const ecart = b.hauteur - a.hauteur;
      if (ecart || sections.length) ecarts += 1;
      console.log(`${nom.padEnd(8)} ${String(largeur).padEnd(5)} ${theme.padEnd(5)} ${ecart ? `Δ ${ecart} px` : "identique"}${sections.length ? `  (${sections.join(", ")})` : ""}`);
    }
  }
}
await nav.close(); ref.fermer(); neuf.fermer();
fs.rmSync(dossier, { recursive: true, force: true });
console.log(ecarts ? `\n${ecarts} configuration(s) différente(s) de la référence ${COMMIT}.` : `\nAucune dérive par rapport à ${COMMIT}.`);
process.exitCode = ecarts ? 1 : 0;
