import test from "node:test";
import assert from "node:assert/strict";
import { formaterEtat, issueEnCours, issuesOuvertes, issuesBloquees, chargerIssues, shaCourant, pullRequestsOuvertes, commitCourant } from "../tools/etat-mobile.mjs";

const issue = (number, state, labels = []) => ({ number, title: `Issue ${number}`, state, labels: labels.map((name) => ({ name })), pull_request: null, updated_at: "2026-10-03T10:00:00Z" });

test("l'état mobile ne déclare pas une tâche en cours sans marqueur explicite", () => {
  const issues = [issue(1, "open")];
  assert.equal(issueEnCours(issues), undefined);
  assert.match(formaterEtat(issues, { date: new Date("2026-10-03T10:00:00Z"), sha: "abc" }), /Aucune tâche explicitement marquée/);
});

test("une issue marquée en cours devient la tâche et la prochaine action", () => {
  const issues = [issue(12, "open", ["en cours"]), issue(13, "open")];
  assert.equal(issueEnCours(issues).number, 12);
  const texte = formaterEtat(issues, { date: new Date("2026-10-03T10:00:00Z"), sha: "abc" });
  assert.match(texte, /#12 — Issue 12/);
});

test("les pull requests ne sont pas comptées comme issues de suivi", () => {
  const issues = [issue(12, "open"), { ...issue(99, "open"), pull_request: { url: "https://example.test" } }];
  assert.equal(issuesOuvertes(issues).length, 1);
});

test("l'étiquette de blocage du dépôt est « blocage », et elle est reconnue", () => {
  // Le motif cherchait « bloqu » : il manquait « blocage », la seule étiquette
  // réellement utilisée ici. #7 était donc annoncée non bloquée.
  const issues = [issue(7, "open", ["decision-marc", "blocage", "infrastructure"]), issue(8, "open", ["dette"])];
  assert.deepEqual(issuesBloquees(issues).map((i) => i.number), [7]);
  assert.match(formaterEtat(issues, { date: new Date("2026-10-03T10:00:00Z"), sha: "abc" }), /#7 — Issue 7/);
  // Une étiquette voisine ne doit pas être comptée : le motif est ancré.
  assert.deepEqual(issuesBloquees([issue(9, "open", ["debloque"])]), []);
});

test("une issue fermée n'est jamais comptée comme bloquée", () => {
  assert.deepEqual(issuesBloquees([issue(7, "closed", ["blocage"])]), []);
});

test("toutes les pages d'issues sont lues, pas seulement la première", () => {
  // L'endpoint renvoie les issues ET les pull requests : sur ce dépôt le total
  // dépasse une page. S'arrêter à la première donnait 36 fermées contre 51.
  const page = (n, taille) => Array.from({ length: taille }, (_, i) => issue(n * 1000 + i, "closed"));
  const appels = [];
  const fetcher = async (url) => {
    appels.push(url);
    const n = Number(new URL(url).searchParams.get("page"));
    const lot = n === 1 ? page(1, 100) : n === 2 ? page(2, 100) : page(3, 7);
    return { ok: true, json: async () => lot };
  };
  return chargerIssues(fetcher).then((toutes) => {
    assert.equal(toutes.length, 207, "les trois pages doivent être concaténées");
    assert.equal(appels.length, 3, "la lecture s'arrête sur la page incomplète");
  });
});

test("une panne de GitHub fait échouer la génération au lieu de produire un miroir faux", () => {
  // §6.4 : s'il ne peut pas être généré, il n'est pas créé.
  const fetcher = async () => ({ ok: false, status: 503, json: async () => ({}) });
  return assert.rejects(() => chargerIssues(fetcher), /HTTP 503/);
});

test("le miroir porte un SHA réel, jamais « local »", () => {
  // §6.4 exige le SHA depuis lequel le miroir est généré ; « local » ne
  // désigne aucun état vérifiable.
  assert.match(shaCourant(), /^[0-9a-f]{40}$/, "le SHA doit venir de l'environnement ou du dépôt");
  assert.match(formaterEtat([issue(1, "open")]), /depuis [0-9a-f]{40}\./);
});

test("le miroir montre les pull requests ouvertes, séparées des issues", () => {
  // §6.4 : le miroir doit refléter l'état réel. Une PR ouverte est un travail
  // qui attend une fusion ; l'ignorer donnait un miroir incomplet. L'endpoint
  // « issues » les renvoie déjà : aucun appel supplémentaire.
  const pr = (number, state) => ({ ...issue(number, state), title: `PR ${number}`, pull_request: { url: "https://example.test" } });
  const issues = [issue(12, "open"), pr(143, "open"), pr(141, "closed")];
  assert.deepEqual(pullRequestsOuvertes(issues).map((p) => p.number), [143]);
  const texte = formaterEtat(issues, { date: new Date("2026-10-03T10:00:00Z"), sha: "abc", commit: "abc1234 sujet" });
  assert.match(texte, /## Pull requests ouvertes\n- #143 — PR 143/);
  // La PR ne doit pas être comptée parmi les issues ouvertes.
  assert.match(texte, /Issue #12 — Issue 12/);
});

test("sans pull request ouverte, le miroir le dit au lieu de laisser un vide", () => {
  const texte = formaterEtat([issue(12, "open")], { date: new Date("2026-10-03T10:00:00Z"), sha: "abc", commit: "abc1234 sujet" });
  assert.match(texte, /## Pull requests ouvertes\n- Aucune pull request ouverte\./);
});

test("le miroir porte le commit avec son sujet, pas seulement un SHA", () => {
  // Sur mobile, « 9723e32 » ne dit rien ; le sujet dit sur quoi porte l'état.
  assert.match(commitCourant(), /^[0-9a-f]{7,} \S/, "le commit doit venir du dépôt, sujet compris");
  assert.match(formaterEtat([issue(1, "open")]), /## Dernier commit\n- [0-9a-f]{7,} \S/);
});
