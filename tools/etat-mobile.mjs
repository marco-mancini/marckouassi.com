import fs from "node:fs/promises";
import path from "node:path";

const RACINE = process.cwd();
const REPO = process.env.GITHUB_REPOSITORY || "marco-mancini/marckouassi.com";
const API = `https://api.github.com/repos/${REPO}/issues?state=all&per_page=100`;
const SORTIE = path.join(RACINE, "Docs/suivi/ETAT_MOBILE.md");

function enteteGithub() {
  return {
    Accept: "application/vnd.github+json",
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    ...(process.env.GITHUB_TOKEN ? { "X-GitHub-Api-Version": "2022-11-28" } : {}),
  };
}

export function issuesOuvertes(issues) {
  return issues.filter((issue) => issue.pull_request == null && issue.state === "open");
}

export function issueEnCours(issues) {
  const marqueurs = new Set(["en cours", "in progress", "wip"]);
  return issuesOuvertes(issues).find((issue) => (issue.labels || []).some((label) => marqueurs.has(String(label.name).toLowerCase())));
}

export function formaterEtat(issues, { date = new Date(), sha = process.env.GITHUB_SHA || "local" } = {}) {
  const ouvertes = issuesOuvertes(issues);
  const terminees = issues.filter((issue) => issue.pull_request == null && issue.state === "closed");
  const bloquees = ouvertes.filter((issue) => (issue.labels || []).some((label) => /bloqu|blocked/i.test(String(label.name))));
  const enCours = issueEnCours(issues);
  const prochaine = enCours || ouvertes[0] || null;
  const prochaineAction = prochaine
    ? `Issue #${prochaine.number} — ${prochaine.title}`
    : "Aucune action déductible depuis les issues ouvertes.";
  const dernierePreuve = [...issues]
    .filter((issue) => issue.updated_at)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0] || null;

  return `<!-- GÉNÉRÉ AUTOMATIQUEMENT — toute modification manuelle sera écrasée. -->
# État mobile — marckouassi.com

> Source unique : issues GitHub. Généré le ${date.toISOString()} depuis ${sha}.

## Projet
- **Dépôt** : ${REPO}
- **État global** : ${ouvertes.length ? "EN COURS" : "OK"}

## Lot en cours
- ${enCours ? `#${enCours.number} — ${enCours.title}` : "Aucune issue explicitement marquée « en cours »."}

## Tâche en cours
- ${enCours ? `#${enCours.number} — ${enCours.title}` : "Aucune tâche explicitement marquée « en cours » dans GitHub."}

## Tâches terminées
- ${terminees.length} issue(s) fermée(s).

## Tâches bloquées
- ${bloquees.length ? bloquees.map((issue) => `#${issue.number} — ${issue.title}`).join("\n- ") : "Aucune issue marquée comme bloquée."}

## Prochaine action
- ${prochaineAction}

## Dernière preuve
- ${dernierePreuve ? `Issue #${dernierePreuve.number} mise à jour le ${dernierePreuve.updated_at}.` : "Aucune preuve déductible depuis les issues."}

## Dernière mise à jour
- ${date.toISOString()}
`;
}

export async function chargerIssues(fetcher = fetch) {
  const reponse = await fetcher(API, { headers: enteteGithub() });
  if (!reponse.ok) throw new Error(`GitHub issues : HTTP ${reponse.status}`);
  return reponse.json();
}

async function main() {
  const issues = await chargerIssues();
  const texte = formaterEtat(issues);
  await fs.mkdir(path.dirname(SORTIE), { recursive: true });
  await fs.writeFile(SORTIE, texte, "utf8");
  process.stdout.write(`${SORTIE}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((erreur) => {
  console.error("Échec de génération de l'état mobile :", erreur.message);
  process.exit(1);
});
