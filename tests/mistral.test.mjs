/**
 * FOURNISSEUR MISTRAL (IA-05) — éprouvé SANS CLÉ et SANS RÉSEAU.
 *
 * Chaque test injecte son propre `fetcher`. Aucun appel ne sort d'ici, et
 * aucune clé réelle n'existe : la chaîne doit être testable avant que Marc
 * n'en fournisse une.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { creerFournisseur, verifierModele, validerModele, MAX_JETONS } from "../worker/assistant/src/mistral.js";
import { chaineReelle, reinitialiserChaine, STATUTS } from "../worker/assistant/src/index.js";

const CLE = "cle-de-test-jamais-reelle";
const ENV = { MISTRAL_CLE: CLE, MISTRAL_MODELE: "mistral-small-2603", BUDGET_TEMPS_MS: "20000" };
const reponseOk = (texte = "Trois phrases au plus.") => ({
  ok: true, status: 200, headers: new Headers(),
  json: async () => ({ choices: [{ message: { content: texte } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }),
});
const demande = { systeme: "S", messages: [{ role: "user", contenu: "<question>Bonjour</question>" }], maxJetons: 180, langue: "fr", version: "v1" };

test("sans MISTRAL_CLE : aucun fournisseur, et surtout aucun appel réseau", async () => {
  let appels = 0;
  const f = creerFournisseur({ env: { MISTRAL_MODELE: "mistral-small-2603" }, fetcher: async () => { appels += 1; } });
  assert.equal(f, null, "pas de fournisseur sans clé");
  assert.equal(appels, 0, "aucun appel n'a été tenté");
});

test("sans clé, le Worker reste debout : indisponible, sans réseau et sans crash", async () => {
  reinitialiserChaine();
  let appels = 0;
  const gerer = chaineReelle({ env: { ORIGINES_AUTORISEES: "http://localhost:*" }, modeleSysteme: "M", fetcher: async () => { appels += 1; } });
  const reponse = await gerer(new Request("https://w.test/api/assistant", {
    method: "POST", headers: { origin: "http://localhost:4173", "content-type": "application/json" },
    body: JSON.stringify({ version: 1, langue: "fr", page: "/", session: "abcdef123456", messages: [{ role: "user", contenu: "Bonjour" }] }),
  }), { ORIGINES_AUTORISEES: "http://localhost:*" });
  assert.equal(reponse.status, 503);
  assert.deepEqual(await reponse.json(), { erreur: "indisponible" });
  assert.equal(appels, 0, "aucun appel réseau sans clé");
});

test("l'alias « -latest » est refusé au démarrage, pas découvert en production (D-19)", () => {
  assert.throws(() => validerModele("mistral-small-latest"), /modele_alias_interdit/);
  assert.throws(() => validerModele(""), /modele_absent/);
  assert.equal(validerModele(" mistral-small-2603 "), "mistral-small-2603");
});

test("l'appel porte exactement le contrat : endpoint, modèle, plafonds, cache et garde-fous", async () => {
  let vu = null;
  const f = creerFournisseur({ env: ENV, fetcher: async (url, init) => { vu = { url: String(url), init }; return reponseOk(); } });
  const r = await f.repondre(demande);

  assert.equal(vu.url, "https://api.mistral.ai/v1/chat/completions");
  assert.equal(vu.init.method, "POST");
  const corps = JSON.parse(vu.init.body);
  assert.equal(corps.model, "mistral-small-2603");
  assert.equal(corps.max_tokens, 180);
  assert.equal(corps.temperature, 0.2);
  assert.equal(corps.prompt_cache_key, "connaissance-v1-fr", "la clé porte la version ET la langue (AI_DATA.md)");
  assert.deepEqual(corps.guardrails, { input: true }, "modération d'entrée");
  assert.equal(corps.messages[0].role, "system");
  assert.equal(r.texte, "Trois phrases au plus.");
  assert.equal(f.appels, 1);
});

test("la clé ne voyage que dans l'en-tête : jamais d'URL, jamais de corps", async () => {
  let vu = null;
  const f = creerFournisseur({ env: ENV, fetcher: async (url, init) => { vu = { url: String(url), init }; return reponseOk(); } });
  await f.repondre(demande);
  assert.equal(vu.init.headers.authorization, `Bearer ${CLE}`);
  assert.ok(!vu.url.includes(CLE), "pas dans l'URL");
  assert.ok(!vu.init.body.includes(CLE), "pas dans le corps");
});

test("la clé de cache suit la version et la langue : une publication l'invalide", async () => {
  const cles = [];
  const f = creerFournisseur({ env: ENV, fetcher: async (_u, init) => { cles.push(JSON.parse(init.body).prompt_cache_key); return reponseOk(); } });
  await f.repondre({ ...demande, langue: "fr", version: "v1" });
  await f.repondre({ ...demande, langue: "en", version: "v1" });
  await f.repondre({ ...demande, langue: "fr", version: "v2" });
  assert.deepEqual(cles, ["connaissance-v1-fr", "connaissance-v1-en", "connaissance-v2-fr"]);
});

test("le plafond de 180 jetons ne peut pas être dépassé par la configuration", async () => {
  let corps = null;
  const f = creerFournisseur({ env: ENV, fetcher: async (_u, init) => { corps = JSON.parse(init.body); return reponseOk(); } });
  await f.repondre({ ...demande, maxJetons: 4000 });
  assert.equal(corps.max_tokens, MAX_JETONS);
  assert.equal(MAX_JETONS, 180);
});

test("429 avec Retry-After court : une seule reprise, puis la réponse", async () => {
  let n = 0;
  const f = creerFournisseur({ env: ENV, fetcher: async () => {
    n += 1;
    if (n === 1) return { ok: false, status: 429, headers: new Headers({ "retry-after": "1" }) };
    return reponseOk("Réponse après reprise.");
  } });
  const r = await f.repondre(demande);
  assert.equal(n, 2, "une seule reprise");
  assert.equal(r.texte, "Réponse après reprise.");
});

test("429 sans reprise possible : quota_journalier, le code que l'interface sait dire", async () => {
  const f = creerFournisseur({ env: ENV, fetcher: async () => ({ ok: false, status: 429, headers: new Headers({ "retry-after": "600" }) }) });
  await assert.rejects(() => f.repondre(demande), (e) => e.name === "quota_journalier");
});

test("500 : une reprise après une seconde, puis indisponible si elle échoue aussi", async () => {
  let n = 0;
  const f = creerFournisseur({ env: ENV, fetcher: async () => { n += 1; return { ok: false, status: 500, headers: new Headers() }; } });
  await assert.rejects(() => f.repondre(demande), (e) => e.name === "indisponible");
  assert.equal(n, 2);
});

test("401, 403, 404 : aucune reprise, et rien ne fuit du motif", async () => {
  for (const statut of [400, 401, 403, 404, 422]) {
    let n = 0;
    const f = creerFournisseur({ env: ENV, fetcher: async () => { n += 1; return { ok: false, status: statut, headers: new Headers() }; } });
    await assert.rejects(() => f.repondre(demande), (e) => {
      assert.equal(e.name, "indisponible", `statut ${statut}`);
      assert.ok(!String(e.message).includes(CLE), "la clé ne fuit jamais dans l'erreur");
      return true;
    });
    assert.equal(n, 1, `statut ${statut} : pas de reprise`);
  }
});

test("une réponse vide ou illisible devient indisponible, jamais une bulle vide", async () => {
  for (const charge of [{ choices: [] }, { choices: [{ message: { content: "   " } }] }]) {
    const f = creerFournisseur({ env: ENV, fetcher: async () => ({ ok: true, status: 200, headers: new Headers(), json: async () => charge }) });
    await assert.rejects(() => f.repondre(demande), (e) => e.name === "indisponible");
  }
  const casse = creerFournisseur({ env: ENV, fetcher: async () => ({ ok: true, status: 200, headers: new Headers(), json: async () => { throw new Error("JSON"); } }) });
  await assert.rejects(() => casse.repondre(demande), (e) => e.name === "indisponible");
});

test("le quota de Mistral remonte jusqu'au visiteur comme quota_journalier, avec Retry-After", async () => {
  reinitialiserChaine();
  const env = { ...ENV, ORIGINES_AUTORISEES: "http://localhost:*", CONNAISSANCE_URL: "http://localhost:4173" };
  const base = { contact: { email: "x@y.z" }, pages: [], projets: [] };
  const gerer = chaineReelle({
    env, modeleSysteme: "SYSTEME {{LANGUE}} {{PAGES}} {{CONNAISSANCE}}",
    fetcher: async (url) => (String(url).includes("connaissance")
      ? { ok: true, json: async () => base }
      : { ok: false, status: 429, headers: new Headers({ "retry-after": "600" }) }),
  });
  const reponse = await gerer(new Request("https://w.test/api/assistant", {
    method: "POST", headers: { origin: "http://localhost:4173", "content-type": "application/json" },
    body: JSON.stringify({ version: 1, langue: "fr", page: "/", session: "abcdef123456", messages: [{ role: "user", contenu: "Bonjour" }] }),
  }), env);
  assert.equal(reponse.status, STATUTS.quota_journalier);
  assert.deepEqual(await reponse.json(), { erreur: "quota_journalier" });
  assert.equal(reponse.headers.get("retry-after"), "3600");
});

test("GET /v1/models refuse d'appeler quoi que ce soit sans clé (D-19)", async () => {
  let appels = 0;
  await assert.rejects(() => verifierModele({ env: { MISTRAL_MODELE: "mistral-small-2603" }, fetcher: async () => { appels += 1; } }),
    (e) => e.name === "cle_absente");
  assert.equal(appels, 0);
});

test("GET /v1/models dit si le modèle épinglé existe, sans le choisir à notre place", async () => {
  const f = async () => ({ ok: true, status: 200, json: async () => ({ data: [{ id: "mistral-small-2603" }, { id: "autre" }] }) });
  const r = await verifierModele({ env: ENV, fetcher: f });
  assert.equal(r.modele, "mistral-small-2603");
  assert.equal(r.present, true);
  const absent = await verifierModele({ env: { ...ENV, MISTRAL_MODELE: "mistral-small-9999" }, fetcher: f });
  assert.equal(absent.present, false, "il le dit, il n'invente pas de remplacement");
});

test("aucune clé réelle n'est écrite dans le dépôt, ni dans ce test", () => {
  const source = fs.readFileSync("worker/assistant/src/mistral.js", "utf8");
  const config = fs.readFileSync("worker/assistant/wrangler.jsonc", "utf8");
  for (const texte of [source, config]) {
    assert.ok(!/MISTRAL_CLE\s*[:=]\s*["'][^"']+["']/.test(texte), "aucune valeur de clé");
  }
  // MISTRAL_CLE ne doit apparaître dans AUCUN bloc `vars` : une variable de
  // configuration est publiée avec le Worker, un secret ne l'est pas. Les
  // mentions en commentaire, elles, sont la documentation du contraire.
  const sansCommentaires = config.split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
  assert.ok(!sansCommentaires.includes("MISTRAL_CLE"), "la clé n'est jamais une variable de configuration");
  assert.match(config, /wrangler secret put MISTRAL_CLE/, "la façon de la poser est documentée");
  assert.match(source, /env\.MISTRAL_CLE/, "elle n'est lue que depuis l'environnement");
});
