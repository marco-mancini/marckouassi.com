/**
 * CONNAISSANCE, CACHE (IA-06) — éprouvé sans clé, sans réseau, sans Supabase.
 *
 * Le contrat vient de AI_DATA.md §Cache : base 24 h sous
 * `connaissance:{version}:{langue}`, version 60 s. Une publication change la
 * version, donc la clé : aucune invalidation à gérer.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { chargerConnaissancePublique, viderCache } from "../worker/assistant/src/connaissance.js";

const ENV = { CONNAISSANCE_URL: "https://site.test", DELAI_CONTEXTE_MS: "5000" };
const base = (langue) => ({ langue, contact: { email: "contact@site.test" }, pages: [], projets: [] });

/** Faux CDN : compte ses lectures, et sait changer de version ou tomber. */
function cdn({ version = "v1", enPanne = false, illisible = false } = {}) {
  const etat = { version, enPanne, illisible, lectures: { version: 0, fr: 0, en: 0 } };
  etat.fetcher = async (url) => {
    const chemin = new URL(String(url)).pathname;
    if (chemin === "/version.json") {
      etat.lectures.version += 1;
      return { ok: true, json: async () => ({ version: etat.version }) };
    }
    const langue = chemin.includes(".en.") ? "en" : "fr";
    etat.lectures[langue] += 1;
    if (etat.enPanne) return { ok: false, status: 502 };
    if (etat.illisible) return { ok: true, json: async () => { throw new Error("JSON"); } };
    return { ok: true, json: async () => base(langue) };
  };
  return etat;
}

test("cache froid : une lecture de version, une lecture de base, et la version voyage avec elle", async () => {
  viderCache();
  const c = cdn();
  const b = await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: c.fetcher, maintenant: () => 0 });
  assert.equal(b.contact.email, "contact@site.test");
  assert.equal(b._version, "v1", "la version accompagne la base, pour la clé de cache de prompt");
  assert.deepEqual(c.lectures, { version: 1, fr: 1, en: 0 });
});

test("cache chaud : la base n'est pas relue, et la version pas redemandée avant 60 s", async () => {
  viderCache();
  const c = cdn();
  for (const t of [0, 1000, 59_000]) {
    await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: c.fetcher, maintenant: () => t });
  }
  assert.equal(c.lectures.fr, 1, "une seule lecture de la base");
  assert.equal(c.lectures.version, 1, "la version tient 60 s");
});

test("après 60 s la version est relue, mais la base reste en cache si elle n'a pas changé", async () => {
  viderCache();
  const c = cdn();
  await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: c.fetcher, maintenant: () => 0 });
  await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: c.fetcher, maintenant: () => 61_000 });
  assert.equal(c.lectures.version, 2);
  assert.equal(c.lectures.fr, 1, "même version, même clé : rien à relire");
});

test("nouvelle publication : la version change, donc la clé, donc la base est relue", async () => {
  viderCache();
  const c = cdn();
  const avant = await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: c.fetcher, maintenant: () => 0 });
  c.version = "v2";
  const apres = await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: c.fetcher, maintenant: () => 61_000 });
  assert.equal(avant._version, "v1");
  assert.equal(apres._version, "v2");
  assert.equal(c.lectures.fr, 2, "aucune invalidation à gérer : la clé a changé");
});

test("la base expire au bout de 24 h, même sans nouvelle publication", async () => {
  viderCache();
  const c = cdn();
  await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: c.fetcher, maintenant: () => 0 });
  await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: c.fetcher, maintenant: () => 24 * 3600 * 1000 + 1 });
  assert.equal(c.lectures.fr, 2);
});

test("FR et EN sont deux bases distinctes, chacune sa clé", async () => {
  viderCache();
  const c = cdn();
  const fr = await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: c.fetcher, maintenant: () => 0 });
  const en = await chargerConnaissancePublique({ env: ENV, langue: "en", fetcher: c.fetcher, maintenant: () => 0 });
  assert.equal(fr.langue, "fr");
  assert.equal(en.langue, "en");
  assert.deepEqual(c.lectures, { version: 1, fr: 1, en: 1 });
});

test("fichier absent : la dernière base connue est servie plutôt que le silence", async () => {
  viderCache();
  const c = cdn();
  await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: c.fetcher, maintenant: () => 0 });
  c.enPanne = true;
  c.version = "v2";
  const repli = await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: c.fetcher, maintenant: () => 61_000 });
  assert.equal(repli.contact.email, "contact@site.test", "une panne de CDN ne rend pas MarcoS muet");
});

test("fichier illisible et aucun cache : l'erreur remonte, elle n'est pas masquée", async () => {
  viderCache();
  const c = cdn({ illisible: true });
  await assert.rejects(() => chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: c.fetcher, maintenant: () => 0 }),
    (e) => e.name === "connaissance_invalide");
  viderCache();
  const panne = cdn({ enPanne: true });
  await assert.rejects(() => chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher: panne.fetcher, maintenant: () => 0 }),
    (e) => e.name === "connaissance_indisponible");
});

test("une base sans adresse de contact est refusée : c'est le signe d'un fichier tronqué", async () => {
  viderCache();
  const fetcher = async (url) => (String(url).includes("version")
    ? { ok: true, json: async () => ({ version: "v1" }) }
    : { ok: true, json: async () => ({ langue: "fr", projets: [] }) });
  await assert.rejects(() => chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher, maintenant: () => 0 }),
    (e) => e.name === "connaissance_invalide");
});

test("version illisible : ce n'est pas une panne, le cache fonctionne encore", async () => {
  viderCache();
  let lectures = 0;
  const fetcher = async (url) => {
    if (String(url).includes("version")) return { ok: false, status: 404 };
    lectures += 1;
    return { ok: true, json: async () => base("fr") };
  };
  const b = await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher, maintenant: () => 0 });
  assert.equal(b._version, "inconnue");
  await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher, maintenant: () => 1000 });
  assert.equal(lectures, 1, "le cache tient même sans empreinte");
});

test("ni clé, ni identifiant, ni base de données : seulement un fichier public", async () => {
  viderCache();
  const vues = [];
  const c = cdn();
  const fetcher = async (url, init) => { vues.push({ url: String(url), init }); return c.fetcher(url, init); };
  await chargerConnaissancePublique({ env: ENV, langue: "fr", fetcher, maintenant: () => 0 });
  for (const v of vues) {
    assert.ok(!/authorization|api[-_]?key|token/i.test(JSON.stringify(v.init ?? {})), "aucune autorisation envoyée");
    assert.ok(v.url.startsWith("https://site.test/"), "un fichier du site, rien d'autre");
  }
});

test("adresse non configurée ou langue inconnue : refus net, sans réseau", async () => {
  viderCache();
  let appels = 0;
  const fetcher = async () => { appels += 1; };
  for (const cas of [{ env: {}, langue: "fr" }, { env: ENV, langue: "de" }]) {
    await assert.rejects(() => chargerConnaissancePublique({ ...cas, fetcher, maintenant: () => 0 }),
      (e) => e.name === "connaissance_non_configuree");
  }
  assert.equal(appels, 0);
});

test("une adresse non chiffrée hors localhost est refusée", async () => {
  viderCache();
  await assert.rejects(() => chargerConnaissancePublique({
    env: { CONNAISSANCE_URL: "http://exemple.test" }, langue: "fr",
    fetcher: async () => ({ ok: true, json: async () => ({ version: "v1" }) }), maintenant: () => 0,
  }), (e) => e.name === "connaissance_url_invalide");
});
