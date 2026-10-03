import test from "node:test";
import assert from "node:assert/strict";
import { formaterEtat, issueEnCours, issuesOuvertes } from "../tools/etat-mobile.mjs";

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
