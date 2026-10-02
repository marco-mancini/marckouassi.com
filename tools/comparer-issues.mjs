// Compare Docs/ISSUES.md à l'état réel des issues GitHub et signale chaque écart.
//
// AGENTS.md §6.2 : les issues GitHub sont la source de vérité, l'index en est le
// reflet. Un écart se corrige immédiatement, jamais « plus tard ». Ce script rend
// cette vérification mesurable au lieu de reposer sur une relecture à l'œil.
//
//   npm run comparer-issues
//
// Il lit GitHub par la ligne de commande `gh`, déjà authentifiée sur le poste.
// Il n'est pas branché sur le workflow « Vérifier » : la CI n'a pas de jeton
// capable de lire les issues, et un contrôle qui échoue faute de droits ne
// mesure rien. Sortie 0 si l'index est exact, 1 sinon.

import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const RACINE = path.resolve(import.meta.dirname, "..");
const INDEX = "Docs/ISSUES.md";
const DEPOT = "marco-mancini/marckouassi.com";

// « ouverte », « fermée — réglée par la PR #41 » → l'état seul.
const etat = (cellule) => (/^ferm/i.test(cellule) ? "CLOSED" : /^ouvert/i.test(cellule) ? "OPEN" : null);

const etiquettes = (cellule) =>
  cellule === "—" ? [] : cellule.split(",").map((e) => e.trim()).filter(Boolean).sort();

function lireIndex(texte) {
  const lignes = [];
  for (const ligne of texte.split("\n")) {
    if (!ligne.startsWith("| PM-")) continue;
    const cellules = ligne.split("|").slice(1, -1).map((c) => c.trim());
    const [pm, github, titre, labels, , statut] = cellules;
    const numero = Number(github.match(/\[#(\d+)\]/)?.[1]);
    if (!Number.isInteger(numero)) throw new Error(`${INDEX} : numéro GitHub illisible dans « ${ligne} »`);
    lignes.push({ pm, numero, titre, etiquettes: etiquettes(labels), etat: etat(statut), statut });
  }
  if (!lignes.length) throw new Error(`${INDEX} : aucune ligne « | PM-… » trouvée ; le format a changé.`);
  return lignes;
}

function lireGitHub() {
  let brut;
  try {
    brut = execFileSync(
      "gh",
      ["issue", "list", "--repo", DEPOT, "--state", "all", "--limit", "300", "--json", "number,title,state,labels"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (erreur) {
    // Jamais d'échec silencieux : sans GitHub, le script ne conclut rien (AGENTS.md §6.8).
    throw new Error(`lecture des issues GitHub impossible (« gh » authentifié est requis) : ${erreur.stderr || erreur.message}`);
  }
  const issues = JSON.parse(brut);
  if (!issues.length) throw new Error("GitHub n'a renvoyé aucune issue ; refus de conclure.");
  return new Map(
    issues.map((i) => [
      i.number,
      {
        numero: i.number,
        titre: i.title.replace(/^\[PM-\d+\]\s*/, "").trim(),
        etat: i.state === "OPEN" ? "OPEN" : "CLOSED",
        etiquettes: i.labels.map((l) => l.name).sort(),
      },
    ]),
  );
}

const index = lireIndex(await fs.readFile(path.join(RACINE, INDEX), "utf8"));
const github = lireGitHub();
const ecarts = [];

for (const ligne of index) {
  const reel = github.get(ligne.numero);
  if (!reel) {
    ecarts.push(`${ligne.pm} (#${ligne.numero}) : présente dans l'index, absente de GitHub`);
    continue;
  }
  if (ligne.pm !== `PM-${String(ligne.numero).padStart(3, "0")}`) {
    ecarts.push(`${ligne.pm} : la référence PM ne correspond pas au numéro GitHub #${ligne.numero}`);
  }
  if (ligne.etat === null) {
    ecarts.push(`${ligne.pm} : état illisible dans l'index (« ${ligne.statut} »)`);
  } else if (ligne.etat !== reel.etat) {
    const mot = { OPEN: "ouverte", CLOSED: "fermée" };
    ecarts.push(`${ligne.pm} (#${ligne.numero}) : index « ${mot[ligne.etat]} », GitHub « ${mot[reel.etat]} »`);
  }
  if (ligne.titre !== reel.titre) {
    ecarts.push(`${ligne.pm} (#${ligne.numero}) : titre index « ${ligne.titre} » ≠ GitHub « ${reel.titre} »`);
  }
  if (ligne.etiquettes.join(", ") !== reel.etiquettes.join(", ")) {
    ecarts.push(
      `${ligne.pm} (#${ligne.numero}) : étiquettes index « ${ligne.etiquettes.join(", ") || "—"} » ≠ GitHub « ${reel.etiquettes.join(", ") || "—"} »`,
    );
  }
}

const connus = new Set(index.map((l) => l.numero));
for (const [numero, reel] of [...github].sort(([a], [b]) => a - b)) {
  if (!connus.has(numero)) ecarts.push(`#${numero} (« ${reel.titre} ») : sur GitHub, absente de l'index`);
}

const ouvertes = [...github.values()].filter((i) => i.etat === "OPEN").length;
const fermees = github.size - ouvertes;
console.log(`GitHub : ${github.size} issues (${ouvertes} ouvertes, ${fermees} fermées) ; ${INDEX} : ${index.length} lignes`);

const annonce = (await fs.readFile(path.join(RACINE, INDEX), "utf8")).match(
  /(\d+) issues? ouvertes?, (\d+) fermées?/,
);
if (!annonce) {
  ecarts.push(`${INDEX} : la phrase de comptage « N issues ouvertes, N fermées » est introuvable`);
} else if (Number(annonce[1]) !== ouvertes || Number(annonce[2]) !== fermees) {
  ecarts.push(
    `${INDEX} : comptage annoncé ${annonce[1]} ouvertes / ${annonce[2]} fermées, réel ${ouvertes} / ${fermees}`,
  );
}

if (ecarts.length === 0) {
  console.log("0 écart.");
  process.exit(0);
}
console.error(`\n${ecarts.length} écart(s) :`);
for (const e of ecarts) console.error(`  - ${e}`);
process.exit(1);
