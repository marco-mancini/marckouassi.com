/**
 * Edge Function « publier », exécutée sous Node : Deno et le client
 * Supabase sont simulés, GitHub aussi. On vérifie les refus (session,
 * droits, secret) et le chemin nominal, sans aucun service réel.
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ENV = { SUPABASE_URL: "https://essai.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "cle-serveur-essai", GITHUB_DEPOT: "proprio/depot", GITHUB_JETON: "jeton-essai", PUBLICATION_SECRET: "secret-partage-essai", ORIGINE_ADMIN: "https://exemple.org" };
let gerer; const base = { documents: [], publications: [], administrateurs: [], utilisateurs: {} }; let appelsGithub = []; let reponseGithub = 204;

/** Faux client : juste ce que la fonction utilise, sur des tableaux en mémoire. */
function fauxClient() {
  const requete = (table) => {
    const etat = { filtres: [], tri: null, limite: null, maj: null };
    const lignes = () => base[table].filter((l) => etat.filtres.every((f) => f(l)));
    const api = {
      select: () => api, order: (c, { ascending }) => { etat.tri = { c, ascending }; return api; }, limit: (n) => { etat.limite = n; return api; },
      eq: (c, v) => { etat.filtres.push((l) => l[c] === v); return api; }, lt: (c, v) => { etat.filtres.push((l) => l[c] < v); return api; }, in: (c, v) => { etat.filtres.push((l) => v.includes(l[c])); return api; },
      update: (maj) => { etat.maj = maj; return api; },
      insert: async (ligne) => { if (base[table].some((l) => l.version === ligne.version)) return { error: { code: "23505" } }; base[table].push({ statut: "en_attente", ...ligne }); return { error: null }; },
      maybeSingle: async () => ({ data: resultat()[0] ?? null }),
      then: (ok) => ok({ data: resultat(), error: null }),
    };
    const resultat = () => {
      if (etat.maj) { lignes().forEach((l) => Object.assign(l, etat.maj)); return []; }
      let r = lignes();
      if (etat.tri) r = [...r].sort((a, b) => (etat.tri.ascending ? 1 : -1) * (a[etat.tri.c] - b[etat.tri.c]));
      return etat.limite ? r.slice(0, etat.limite) : r;
    };
    return api;
  };
  return { from: requete, auth: { getUser: async (jeton) => (base.utilisateurs[jeton] ? { data: { user: base.utilisateurs[jeton] }, error: null } : { data: null, error: { message: "jeton" } }) } };
}

before(async () => {
  const source = fs.readFileSync("supabase/functions/publier/index.ts", "utf8").replace(/^import \{ createClient \} from "jsr:[^"]+";$/m, "const createClient = globalThis.__fauxClient;");
  const fichier = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "publier-")), "index.ts");
  fs.writeFileSync(fichier, source);
  globalThis.__fauxClient = fauxClient;
  globalThis.Deno = { env: { get: (n) => ENV[n] }, serve: (h) => { gerer = h; } };
  globalThis.fetch = async (url, options) => { appelsGithub.push({ url, corps: JSON.parse(options.body), auth: options.headers.Authorization }); return { ok: reponseGithub < 300, status: reponseGithub }; };
  await import(fichier);
});

const appeler = (corps, entetes = {}) => gerer(new Request("https://fn/publier", { method: "POST", headers: { "content-type": "application/json", ...entetes }, body: JSON.stringify(corps) }));
const remplir = () => {
  base.documents = ["site", "sections", "projets", "cv"].map((cle) => ({ cle, contenu: { essai: cle } }));
  base.publications = []; base.administrateurs = [{ user_id: "u-admin" }];
  base.utilisateurs = { "jeton-admin": { id: "u-admin" }, "jeton-visiteur": { id: "u-visiteur" } };
  appelsGithub = []; reponseGithub = 204;
};

test("refus : sans session (401), compte non administrateur (403), action inconnue (400)", async () => {
  remplir();
  assert.equal((await appeler({ action: "publier" })).status, 401);
  assert.equal((await appeler({ action: "publier" }, { Authorization: "Bearer jeton-visiteur" })).status, 403);
  assert.equal((await appeler({ action: "autre" }, { Authorization: "Bearer jeton-admin" })).status, 400);
  assert.equal(base.publications.length, 0);
  assert.equal(appelsGithub.length, 0);
});

test("publication : instantané numéroté, flux GitHub déclenché avec la version", async () => {
  remplir();
  const r = await appeler({ action: "publier" }, { Authorization: "Bearer jeton-admin" });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { version: 1 });
  assert.deepEqual(Object.keys(base.publications[0].instantane).sort(), ["cv", "projets", "sections", "site"]);
  assert.equal(appelsGithub[0].url, "https://api.github.com/repos/proprio/depot/dispatches");
  assert.deepEqual(appelsGithub[0].corps, { event_type: "publier", client_payload: { version: 1 } });
  assert.equal((await (await appeler({ action: "publier" }, { Authorization: "Bearer jeton-admin" })).json()).version, 2);
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), "https://exemple.org");
});

test("brouillon incomplet refusé (422) ; échec GitHub consigné « echec » (502)", async () => {
  remplir();
  base.documents.pop();
  assert.equal((await appeler({ action: "publier" }, { Authorization: "Bearer jeton-admin" })).status, 422);
  remplir();
  reponseGithub = 401;
  assert.equal((await appeler({ action: "publier" }, { Authorization: "Bearer jeton-admin" })).status, 502);
  assert.equal(base.publications[0].statut, "echec");
});

test("retour du flux : secret exigé ; en ligne → anciennes versions « remplacee »", async () => {
  remplir();
  base.publications = [{ version: 1, statut: "en_ligne" }, { version: 2, statut: "en_attente" }, { version: 3, statut: "en_attente" }];
  assert.equal((await appeler({ action: "statut", version: 3, statut: "en_ligne" })).status, 401);
  assert.equal((await appeler({ action: "statut", version: 3, statut: "en_ligne" }, { "x-publication-secret": "mauvais" })).status, 401);
  assert.equal((await appeler({ action: "statut", version: 3, statut: "piraté" }, { "x-publication-secret": ENV.PUBLICATION_SECRET })).status, 400);
  assert.equal((await appeler({ action: "statut", version: 3, statut: "en_ligne" }, { "x-publication-secret": ENV.PUBLICATION_SECRET })).status, 200);
  assert.deepEqual(base.publications.map((p) => p.statut), ["remplacee", "remplacee", "en_ligne"]);
});
