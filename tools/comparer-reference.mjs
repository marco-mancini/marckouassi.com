/**
 * COMPARER À LA RÉFÉRENCE — un commit de main validé visuellement sert de
 * référence. Cet outil le reconstruit en lecture seule (git archive), puis
 * compare l'accueil et le CV à _site, de 320 à 1440 px, en clair et en
 * sombre : hauteur de page et hauteur de chaque section. Prérequis :
 * npm run build. Code de sortie 1 au moindre écart : toute différence avec
 * la référence est inattendue.
 *
 *   npm run comparer-reference            (référence par défaut : f48646f)
 *   npm run comparer-reference -- <commit>
 *
 * Référence : f48646f (main, 2 octobre 2026), depuis PM-108 (#108). Elle
 * remplace e8b729c, périmée par PM-106 (#106) : le portrait de « À propos »
 * perd son cadre, se pose sur le bord bas du bloc vert et aligne la tête sur
 * « Bonjour », et l'espace entre les deux colonnes passe de
 * clamp(24px, 4vw, 60px) à clamp(20px, 2vw, 32px). Changement de rendu
 * demandé par Marc, mesuré dans la PR #107, et reproductible —
 * `npm run comparer-reference -- e8b729c` rejoue l'écart à l'identique.
 *
 * e8b729c remplaçait 9d51394, périmée par le remplacement du portrait par sa
 * version détourée (PM-097, #97) : le ratio de l'image passait de 0,563 à
 * 0,623. 9d51394 remplaçait elle-même 71cfb9d (refonte/editorial-final-v2,
 * 29 septembre 2026) depuis PM-046 (#46).
 *
 * RÈGLE : changer de référence après tout changement de rendu voulu et
 * validé, JAMAIS pour faire taire un écart inexpliqué.
 *
 * Un commit de l'architecture actuelle est généré avec son propre build
 * (copie du cache des médias : clé = chemin + empreinte + réglages). Un
 * commit de l'ancienne architecture, reconnu à Frontend/index.html
 * (71cfb9d et avant), est assemblé comme le faisait son ancien flux de
 * publication.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { servir, lancer, ouvrir, defiler } from "../tests/navigateur/outils.mjs";

const COMMIT = process.argv[2] || "f48646f";
const RACINE = process.cwd();
const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "reference-"));
const source = path.join(dossier, "source");
fs.mkdirSync(source);
execFileSync("sh", ["-c", `git archive ${COMMIT} | tar -x -C "${source}"`]);

let site, cheminCv;
if (!fs.existsSync(path.join(source, "Frontend", "index.html"))) {
  fs.symlinkSync(path.join(RACINE, "node_modules"), path.join(source, "node_modules"), "dir");
  const cacheMedias = path.join(RACINE, ".cache", "medias");
  if (fs.existsSync(cacheMedias)) fs.cpSync(cacheMedias, path.join(source, ".cache", "medias"), { recursive: true });
  execFileSync(process.execPath, ["tools/build.mjs"], { cwd: source, stdio: "ignore" });
  site = path.join(source, "_site");
  cheminCv = "/cv/";
} else {
  site = path.join(dossier, "site");
  fs.mkdirSync(path.join(site, "Public"), { recursive: true });
  for (const f of ["index.html", "script.js"]) fs.copyFileSync(path.join(source, "Frontend", f), path.join(site, f));
  fs.cpSync(path.join(source, "Design_System"), path.join(site, "Design_System"), { recursive: true });
  fs.cpSync(path.join(source, "Public/images"), path.join(site, "Public/images"), { recursive: true });
  cheminCv = "/Design_System/assets/Cv_Marc.html";
}

const ref = await servir(site); const neuf = await servir("_site"); const nav = await lancer();
const PAGES = [["accueil", "/", "/"], ["cv", cheminCv, "/cv/"]];
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
