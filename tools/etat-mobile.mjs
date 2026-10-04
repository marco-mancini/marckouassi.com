import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const RACINE = process.cwd();
const REPO = process.env.GITHUB_REPOSITORY || "marco-mancini/marckouassi.com";
const PAR_PAGE = 100;
const API = (page) => `https://api.github.com/repos/${REPO}/issues?state=all&per_page=${PAR_PAGE}&page=${page}`;
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

/**
 * Les étiquettes qui marquent un blocage, dans le vocabulaire réel du dépôt.
 * Relevé au 3 octobre 2026 : seule « blocage » est utilisée. Le motif est
 * ancré, pour qu'une étiquette voisine ne soit pas comptée par accident.
 */
const ETIQUETTE_BLOCAGE = /^(blocage|bloqu(?:é|ée|ant|ante)|blocked)$/i;

export function issuesBloquees(issues) {
  return issuesOuvertes(issues).filter((issue) => (issue.labels || []).some((label) => ETIQUETTE_BLOCAGE.test(String(label.name).trim())));
}

/**
 * Les pull requests ouvertes. L'endpoint « issues » les renvoie déjà, marquées
 * par le champ `pull_request` : les lister ici ne coûte aucun appel de plus, et
 * le miroir montre alors ce qui attend une fusion, pas seulement ce qui attend
 * une décision.
 */
export function pullRequestsOuvertes(issues) {
  return issues.filter((issue) => issue.pull_request != null && issue.state === "open");
}

export function issueEnCours(issues) {
  const marqueurs = new Set(["en cours", "in progress", "wip"]);
  return issuesOuvertes(issues).find((issue) => (issue.labels || []).some((label) => marqueurs.has(String(label.name).toLowerCase())));
}

/**
 * Le SHA depuis lequel le miroir est généré (AGENTS.md §6.4). En intégration
 * continue il vient de l'environnement ; en local on le lit dans le dépôt,
 * plutôt que d'écrire « local », qui ne désigne aucun état vérifiable.
 */
export function shaCourant() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: RACINE, encoding: "utf8" }).trim();
  } catch {
    return "inconnu";
  }
}

/**
 * Le commit depuis lequel le miroir est généré, sujet compris. Le SHA seul ne
 * dit pas sur quoi il porte ; sur mobile, le sujet est ce qui se lit.
 */
export function commitCourant() {
  try {
    return execFileSync("git", ["log", "-1", "--format=%h %s"], { cwd: RACINE, encoding: "utf8" }).trim();
  } catch {
    return "inconnu";
  }
}

export function formaterEtat(issues, { date = new Date(), sha = shaCourant(), commit = commitCourant() } = {}) {
  const ouvertes = issuesOuvertes(issues);
  const terminees = issues.filter((issue) => issue.pull_request == null && issue.state === "closed");
  const bloquees = issuesBloquees(issues);
  const enCours = issueEnCours(issues);
  const prOuvertes = pullRequestsOuvertes(issues);
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

## Pull requests ouvertes
- ${prOuvertes.length ? prOuvertes.map((pr) => `#${pr.number} — ${pr.title}`).join("\n- ") : "Aucune pull request ouverte."}

## Prochaine action
- ${prochaineAction}

## Dernier commit
- ${commit}

## Dernière preuve
- ${dernierePreuve ? `Issue #${dernierePreuve.number} mise à jour le ${dernierePreuve.updated_at}.` : "Aucune preuve déductible depuis les issues."}

## Dernière mise à jour
- ${date.toISOString()}
`;
}

/**
 * Toutes les issues, page par page.
 *
 * Cet endpoint renvoie les issues ET les pull requests : sur ce dépôt le total
 * dépasse une page, et s'arrêter à la première donnait un comptage faux — 36
 * fermées relevées contre 51 réelles, et aucune tâche bloquée alors que #7
 * porte l'étiquette « blocage ». Un miroir tronqué est aussi trompeur qu'un
 * miroir tenu à la main, ce que la règle §6.4 cherche justement à éviter.
 */
export async function chargerIssues(fetcher = fetch) {
  const toutes = [];
  for (let page = 1; ; page += 1) {
    const reponse = await fetcher(API(page), { headers: enteteGithub() });
    if (!reponse.ok) throw new Error(`GitHub issues : HTTP ${reponse.status}`);
    const lot = await reponse.json();
    if (!Array.isArray(lot)) throw new Error("GitHub issues : réponse inattendue");
    toutes.push(...lot);
    if (lot.length < PAR_PAGE) return toutes;
  }
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
