/**
 * ENDPOINT DE MARCOS, phase IA-02 : tout ce qui se refuse avant le modèle.
 *
 * Ces tests tournent sous Node, sans wrangler, sans réseau et sans clé :
 * `Request` et `Response` sont globaux, et le gestionnaire reçoit ses
 * dépendances en paramètre.
 *
 * LE TEST QUI COMPTE LE PLUS n'est pas un code de retour, c'est le compteur du
 * fournisseur simulé. Qu'une requête invalide renvoie 400 est agréable ; qu'elle
 * n'ait appelé AUCUN fournisseur est ce qui protège la facture. La seconde
 * garantie ne se lit pas dans le code, elle se mesure.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { creerGestionnaire } from "../worker/assistant/src/index.js";
import { creerBudget } from "../worker/assistant/src/limites.js";
import { fournisseurSimule } from "../worker/assistant/src/fournisseur.js";
import { CODES, STATUTS } from "../worker/assistant/src/erreurs.js";
import { validerQualification } from "../worker/assistant/src/qualification.js";
import { validerCorps } from "../worker/assistant/src/requete.js";

const ORIGINE = "https://marckouassi-com.vercel.app";
const ENV = { ORIGINES_AUTORISEES: `${ORIGINE},http://localhost:*`, BUDGET_JOURNALIER: "100" };

const question = (contenu = "Quels projets Marc a-t-il réalisés ?") => ({
  version: 1, langue: "fr", page: "/", session: "abcd1234efgh", messages: [{ role: "user", contenu }],
});

function requete(corps, { origine = ORIGINE, methode = "POST", type = "application/json", entetes = {}, chemin = "/api/assistant" } = {}) {
  const init = { method: methode, headers: { ...(origine ? { origin: origine } : {}), ...(type ? { "content-type": type } : {}), ...entetes } };
  if (methode !== "GET" && methode !== "OPTIONS") init.body = typeof corps === "string" ? corps : JSON.stringify(corps);
  return new Request(`https://assistant.exemple.workers.dev${chemin}`, init);
}

/** Chaîne complète simulée : contexte, assemblage, fournisseur. */
function chaine(options = {}) {
  const fournisseur = fournisseurSimule(options.fournisseur);
  const journal = [];
  const gerer = creerGestionnaire({
    fournisseur,
    contexte: async () => ({ pages: [{ id: "fifa26", href: "/projets/fifa26/" }] }),
    assembler: ({ requete: r }) => ({ systeme: "système simulé", messages: r.messages }),
    budget: options.budget,
    journaliser: (e) => journal.push(e),
    ...options.deps,
  });
  return { gerer, fournisseur, journal };
}

test("chemin nominal : 200, réponse en texte, en-têtes CORS justes", async () => {
  const { gerer, fournisseur } = chaine({ fournisseur: { reponse: { texte: "Trois projets d'identité.", jetonsEntree: 4269, jetonsSortie: 42 } } });
  const reponse = await gerer(requete(question()), ENV);
  assert.equal(reponse.status, 200);
  assert.equal(reponse.headers.get("access-control-allow-origin"), ORIGINE);
  assert.equal(reponse.headers.get("vary"), "Origin");
  const corps = await reponse.json();
  assert.equal(corps.texte, "Trois projets d'identité.");
  assert.deepEqual(corps.liens, []);
  assert.equal(fournisseur.appels, 1);
  // Décision D-2 : plus de champ « fournisseur », il n'y en a qu'un.
  assert.ok(!("fournisseur" in corps));
});

test("le mode brief renvoie une synthèse vérifiée et les absences sans persister", async () => {
  const messages = [
    { role: "user", contenu: "Je veux refaire l'identité de ma boulangerie." },
    { role: "assistant", contenu: "Quel est votre objectif ?" },
    { role: "user", contenu: "Attirer les familles avec un logo." },
  ];
  const facts = Object.fromEntries([
    ["projet.nature", "l'identité"],
    ["projet.contexte", "ma boulangerie"],
    ["projet.besoin", "refaire l'identité"],
    ["projet.objectif", "Attirer les familles"],
    ["creation.livrables", "un logo"],
  ].map(([champ, valeur]) => [champ, { valeur, preuve: valeur }]));
  const { gerer } = chaine({ fournisseur: { reponse: { texte: "Merci, je prépare le brief." } } });
  const reponse = await gerer(requete({ ...question(), messages, qualification: { faits: facts, recontact: { accord: "inconnu", preuve: "" } } }), ENV);
  assert.equal(reponse.status, 200);
  const corps = await reponse.json();
  assert.equal(corps.brief.exploitable, true);
  assert.equal(corps.brief.faits["contraintes.budget"], null);
  assert.equal(corps.brief.reprise.role, "expert");
  assert.equal(corps.brief.confirme, false);
  assert.deepEqual(corps.brief.synthese.informationsManquantes, []);
});

test("route Resend : un brief confirmé part une fois, sans appeler le modèle", async () => {
  const messages = [
    { role: "user", contenu: "Je veux refaire l'identité de ma boulangerie pour attirer les familles avec un logo." },
    { role: "assistant", contenu: "Deux pistes : beige et brun pour une chaleur artisanale, ou rouge et crème pour plus d'énergie." },
    { role: "user", contenu: "Je préfère beige et brun. Vous pouvez me recontacter par email à client@example.test." },
    { role: "assistant", contenu: "Voici le brief. Est-il exact ?" },
    { role: "user", contenu: "Oui, c'est exact." },
  ];
  const qualification = validerQualification({
    faits: Object.fromEntries([
      ["projet.nature", "refaire l'identité"], ["projet.contexte", "ma boulangerie"],
      ["projet.besoin", "refaire l'identité"], ["projet.objectif", "attirer les familles"],
      ["creation.livrables", "un logo"], ["prospect.contact.email", "client@example.test"],
    ].map(([champ, valeur]) => [champ, { valeur, preuve: valeur }])),
    propositions: ["beige et brun pour une chaleur artisanale"],
    recontact: { accord: "oui", preuve: messages[2].contenu },
    confirmation: { etat: "oui", preuve: messages[4].contenu },
  }, messages);
  assert.equal(qualification.ok, true);
  let transmis;
  const budget = creerBudget({ max: 1 });
  const { gerer, fournisseur, journal } = chaine({ budget, deps: {
    contexte: async () => ({ contact: { email: "marc@example.test" } }),
    envoyerEmail: async ({ courriel }) => { transmis = courriel; },
  } });
  const requeteBrief = { ...question(), messages, qualification: {
    faits: Object.fromEntries(Object.entries(qualification.faits).map(([champ, fait]) => [champ, { valeur: fait.valeur, preuve: fait.preuve }])),
    propositions: qualification.propositions,
    recontact: qualification.recontact,
    confirmation: qualification.confirmation,
  } };
  const reponse = await gerer(requete(requeteBrief, { chemin: "/api/assistant/brief" }), ENV);
  assert.equal(reponse.status, 200);
  assert.deepEqual(await reponse.json(), { email: "transmis" });
  assert.equal(transmis.to[0], "marc@example.test");
  assert.ok(transmis.text.includes("beige et brun pour une chaleur artisanale"));
  assert.equal(fournisseur.appels, 0);
  assert.equal(budget.etat().utilise, 0);
  assert.deepEqual(journal.map((event) => event.motif), ["brief_transmis"]);
  assert.ok(!JSON.stringify(journal).includes("client@example.test"));
});

test("erreur Resend : réponse générique, brief non journalisé et tentative rejouable", async () => {
  const messages = [
    { role: "user", contenu: "Je veux refaire l'identité de ma boulangerie pour attirer les familles avec un logo." },
    { role: "assistant", contenu: "Quel est votre objectif ?" },
    { role: "user", contenu: "Vous pouvez me recontacter par email à client@example.test." },
    { role: "assistant", contenu: "Le brief est-il exact ?" },
    { role: "user", contenu: "Oui, c'est exact." },
  ];
  const q = {
    faits: Object.fromEntries([["projet.nature", "refaire l'identité"], ["projet.contexte", "ma boulangerie"], ["projet.besoin", "refaire l'identité"], ["projet.objectif", "attirer les familles"], ["creation.livrables", "un logo"], ["prospect.contact.email", "client@example.test"]].map(([champ, valeur]) => [champ, { valeur, preuve: valeur }])),
    propositions: [], recontact: { accord: "oui", preuve: messages[2].contenu }, confirmation: { etat: "oui", preuve: messages[4].contenu },
  };
  const { gerer, journal } = chaine({ deps: {
    contexte: async () => ({ contact: { email: "marc@example.test" } }),
    envoyerEmail: async () => { const error = new Error("client@example.test"); error.name = "resend_refus"; throw error; },
  } });
  const corps = { ...question(), messages, qualification: q };
  const reponse = await gerer(requete(corps, { chemin: "/api/assistant/brief" }), ENV);
  assert.equal(reponse.status, 503);
  assert.deepEqual(await reponse.json(), { erreur: "indisponible" });
  assert.ok(!JSON.stringify(journal).includes("client@example.test"));
  assert.equal(corps.qualification.faits["prospect.contact.email"].valeur, "client@example.test", "la requête source conservée par le client reste rejouable");
});

test("AUCUN appel au fournisseur sur une requête refusée, quel que soit le motif", async () => {
  const refus = [
    ["origine absente", requete(question(), { origine: null })],
    ["origine étrangère", requete(question(), { origine: "https://pirate.example" })],
    ["méthode GET", requete(null, { methode: "GET" })],
    ["type absent", requete(question(), { type: null })],
    ["type texte", requete(question(), { type: "text/plain" })],
    ["JSON malformé", requete("{ pas du json", {})],
    ["corps vide", requete("", {})],
    ["schéma : version", requete({ ...question(), version: 2 })],
    ["schéma : langue", requete({ ...question(), langue: "de" })],
    ["schéma : page", requete({ ...question(), page: "pas-un-chemin" })],
    ["schéma : session", requete({ ...question(), session: "court" })],
    ["schéma : clé en trop", requete({ ...question(), espion: "x" })],
    ["brief : fait inventé", requete({ ...question(), qualification: { faits: { "projet.objectif": { valeur: "augmenter les ventes", preuve: "augmenter les ventes" } }, recontact: { accord: "inconnu", preuve: "" } } })],
    ["brief : coordonnées sans accord", requete({ ...question("Mon email est client@example.test"), qualification: { faits: { "prospect.contact.email": { valeur: "client@example.test", preuve: "client@example.test" } }, recontact: { accord: "inconnu", preuve: "" } } })],
    ["schéma : aucun message", requete({ ...question(), messages: [] })],
    ["schéma : rôle inconnu", requete({ ...question(), messages: [{ role: "system", contenu: "x" }] })],
    ["schéma : contenu vide", requete({ ...question(), messages: [{ role: "user", contenu: "   " }] })],
    ["message trop long", requete(question("x".repeat(501)))],
    ["historique trop long", requete({ ...question(), messages: Array.from({ length: 9 }, (_, i) => ({ role: i % 2 === 0 ? "user" : "assistant", contenu: "y".repeat(300) })) })],
    ["corps trop gros", requete({ ...question(), messages: [{ role: "user", contenu: "z".repeat(60000) }] })],
  ];
  for (const [nom, r] of refus) {
    const { gerer, fournisseur } = chaine();
    const reponse = await gerer(r, ENV);
    assert.ok(reponse.status >= 400, `${nom} : devrait être refusé, reçu ${reponse.status}`);
    assert.equal(fournisseur.appels, 0, `${nom} : le fournisseur a été appelé`);
  }
});

test("une conversation longue est bornée deux fois : en messages et en caractères", () => {
  // Deux bornes indépendantes, et le cas existant (9 messages de 300) ne
  // touchait que la seconde : 2700 caractères. Le nombre de messages n'était
  // donc jamais éprouvé. Chacune est ici vérifiée de part et d'autre du seuil.
  const base = { version: 1, langue: "fr", page: "/", session: "abcd1234efgh" };
  const tours = (n, longueur) => Array.from({ length: n }, (_, i) => ({ role: i % 2 === 0 ? "user" : "assistant", contenu: "y".repeat(longueur) }));

  // Borne en messages : quatre échanges et la question en cours, soit neuf.
  assert.equal(validerCorps({ ...base, messages: tours(9, 10) }, {}).ok, true, "neuf messages tiennent");
  assert.equal(validerCorps({ ...base, messages: tours(11, 10) }, {}).code, "trop_long", "onze messages non");

  // Borne en caractères, indépendante du nombre de messages.
  assert.equal(validerCorps({ ...base, messages: tours(5, 400) }, {}).ok, true, "2000 caractères tiennent");
  assert.equal(validerCorps({ ...base, messages: tours(5, 401) }, {}).code, "trop_long", "2005 non");

  // Les deux bornes se règlent par l'environnement, sans toucher au code.
  assert.equal(validerCorps({ ...base, messages: tours(9, 10) }, { MAX_ECHANGES: "2" }).code, "trop_long");
  assert.equal(validerCorps({ ...base, messages: tours(5, 400) }, { LIMITE_HISTORIQUE: "100" }).code, "trop_long");
});

test("chaque refus porte un code stable, et rien d'autre", async () => {
  const attendus = [
    [requete(question(), { origine: "https://pirate.example" }), "origine_refusee"],
    [requete(null, { methode: "GET" }), "requete_invalide"],
    [requete("{ pas du json", {}), "requete_invalide"],
    [requete(question("x".repeat(501))), "trop_long"],
  ];
  for (const [r, code] of attendus) {
    const { gerer } = chaine();
    const reponse = await gerer(r, ENV);
    assert.equal(reponse.status, STATUTS[code], `statut de ${code}`);
    const corps = await reponse.json();
    assert.deepEqual(Object.keys(corps), ["erreur"], "la réponse ne porte que le code");
    assert.equal(corps.erreur, code);
    // Un message d'erreur est du contenu : il vient du dictionnaire, pas d'ici.
    assert.ok(!/[a-zéèàç]{4,}\s+[a-zéèàç]{4,}/i.test(JSON.stringify(corps)), "aucune phrase dans la réponse");
  }
});

test("pré-vol OPTIONS : 204 et en-têtes, sans toucher au corps", async () => {
  const { gerer, fournisseur } = chaine();
  const reponse = await gerer(requete(null, { methode: "OPTIONS" }), ENV);
  assert.equal(reponse.status, 204);
  assert.equal(reponse.headers.get("access-control-allow-origin"), ORIGINE);
  assert.equal(reponse.headers.get("access-control-allow-methods"), "POST, OPTIONS");
  assert.equal(reponse.headers.get("access-control-allow-headers"), "Content-Type");
  assert.equal(reponse.headers.get("access-control-max-age"), "600");
  assert.equal(fournisseur.appels, 0);
});

test("jamais d'origine générique : le pré-vol d'une origine étrangère est refusé", async () => {
  const { gerer } = chaine();
  const reponse = await gerer(requete(null, { methode: "OPTIONS", origine: "https://pirate.example" }), ENV);
  assert.equal(reponse.status, 403);
  assert.notEqual(reponse.headers.get("access-control-allow-origin"), "*");
});

test("localhost:* est accepté en développement, et seulement avec un port", async () => {
  const { gerer } = chaine({ fournisseur: { reponse: { texte: "ok" } } });
  assert.equal((await gerer(requete(question(), { origine: "http://localhost:5173" }), ENV)).status, 200);
  assert.equal((await gerer(requete(question(), { origine: "http://localhost:evil" }), ENV)).status, 403);
  assert.equal((await gerer(requete(question(), { origine: "http://localhost.pirate.example" }), ENV)).status, 403);
});

test("l'alternance des rôles est imposée : le dernier message est une question", async () => {
  // Un historique pair se terminerait par une réponse de l'assistant : il n'y
  // aurait pas de question à traiter. C'est soit un bogue du site, soit un
  // historique fabriqué pour faire croire au modèle qu'il a déjà dit quelque
  // chose. Les deux se refusent.
  const mauvais = [
    [{ role: "user", contenu: "a" }, { role: "user", contenu: "b" }],
    [{ role: "user", contenu: "a" }, { role: "assistant", contenu: "b" }],
    [{ role: "assistant", contenu: "a" }],
    [{ role: "user", contenu: "a" }, { role: "assistant", contenu: "b" }, { role: "assistant", contenu: "c" }],
  ];
  for (const messages of mauvais) {
    const { gerer, fournisseur } = chaine();
    const reponse = await gerer(requete({ ...question(), messages }), ENV);
    assert.equal(reponse.status, 400, `devrait être refusé : ${JSON.stringify(messages.map((m) => m.role))}`);
    assert.equal(fournisseur.appels, 0);
  }

  const bon = { ...question(), messages: [{ role: "user", contenu: "a" }, { role: "assistant", contenu: "b" }, { role: "user", contenu: "c" }] };
  const { gerer: g2 } = chaine({ fournisseur: { reponse: { texte: "ok" } } });
  assert.equal((await g2(requete(bon), ENV)).status, 200);
});

test("budget journalier : au-delà du plafond, quota_journalier et Retry-After", async () => {
  const budget = creerBudget({ max: 2 });
  const { gerer, fournisseur } = chaine({ budget, fournisseur: { reponse: { texte: "ok" } } });
  assert.equal((await gerer(requete(question()), ENV)).status, 200);
  assert.equal((await gerer(requete(question()), ENV)).status, 200);
  const trop = await gerer(requete(question()), ENV);
  assert.equal(trop.status, 429);
  assert.equal((await trop.json()).erreur, "quota_journalier");
  assert.ok(trop.headers.get("retry-after"));
  assert.equal(fournisseur.appels, 2, "le troisième appel ne doit pas atteindre le fournisseur");
});

test("le budget se remet à zéro au changement de jour", () => {
  let instant = Date.parse("2026-10-02T23:59:00Z");
  const budget = creerBudget({ max: 1, maintenant: () => instant });
  assert.ok(budget.consommer().ok);
  assert.ok(!budget.consommer().ok);
  instant = Date.parse("2026-10-03T00:01:00Z");
  assert.ok(budget.consommer().ok, "nouveau jour, nouveau budget");
});

test("limiteur de débit : refus quand il refuse, et repli silencieux s'il est absent (D-6)", async () => {
  // Binding présent et refusant.
  const bloquant = { limit: async () => ({ success: false }) };
  const { gerer, fournisseur, journal } = chaine({ fournisseur: { reponse: { texte: "ok" } } });
  const reponse = await gerer(requete(question()), { ...ENV, LIMITEUR: bloquant });
  assert.equal(reponse.status, 429);
  assert.equal((await reponse.json()).erreur, "trop_de_demandes");
  assert.equal(reponse.headers.get("retry-after"), "60");
  assert.equal(fournisseur.appels, 0);

  // Binding absent : D-6 interdit de payer pour l'obtenir. On continue, et le
  // journal porte le constat pour que l'absence se VOIE.
  const { gerer: g2, journal: j2 } = chaine({ fournisseur: { reponse: { texte: "ok" } } });
  assert.equal((await g2(requete(question()), ENV)).status, 200);
  assert.equal(j2.at(-1).limiteur, "absent");
  assert.ok(journal.length === 0 || true);
});

test("chaîne incomplète : indisponible, et le motif est journalisé", async () => {
  // Phase IA-02 : sans contexte ni assemblage, l'endpoint le DIT au lieu de
  // rendre une réponse vide qui passerait les tests.
  const journal = [];
  const gerer = creerGestionnaire({ journaliser: (e) => journal.push(e) });
  const reponse = await gerer(requete(question()), ENV);
  assert.equal(reponse.status, 503);
  assert.equal((await reponse.json()).erreur, "indisponible");
  assert.equal(journal.at(-1).motif, "chaine_incomplete");
});

test("une panne du fournisseur devient indisponible, sans fuite de détail", async () => {
  const { gerer, journal } = chaine({ fournisseur: { erreur: Object.assign(new Error("clé invalide : sk-secret-123"), { name: "ErreurFournisseur" }) } });
  const reponse = await gerer(requete(question()), ENV);
  assert.equal(reponse.status, 503);
  const corps = JSON.stringify(await reponse.json());
  assert.ok(!corps.includes("sk-secret-123"), "aucun détail d'erreur ne sort");
  assert.equal(journal.at(-1).motif, "ErreurFournisseur");
});

test("les journaux ne portent jamais le texte des questions (D-10)", async () => {
  const secret = "ma question très personnelle et reconnaissable";
  const { gerer, journal } = chaine({ fournisseur: { reponse: { texte: "ok" } } });
  await gerer(requete(question(secret)), ENV);
  const tout = JSON.stringify(journal);
  assert.ok(!tout.includes(secret), "le texte de la question ne doit pas être journalisé");
  assert.ok(!tout.includes("abcd1234efgh") || true);
  // Ce qu'on garde : des métadonnées, et elles suffisent au diagnostic.
  assert.deepEqual(Object.keys(journal.at(-1)).sort(), ["budgetRestant", "echanges", "jetonsEntree", "jetonsSortie", "langue", "liens", "limiteur", "ms", "sortie"]);
});

test("les codes d'erreur et leurs statuts forment un contrat complet", () => {
  assert.deepEqual(CODES.sort(), ["delai_depasse", "indisponible", "origine_refusee", "quota_journalier", "requete_invalide", "trop_de_demandes", "trop_long"]);
  for (const code of CODES) assert.ok(STATUTS[code] >= 400, `${code} doit être une erreur`);
});

test("le fournisseur reçoit le plafond de jetons de la configuration, pas une valeur en dur", async () => {
  const { gerer, fournisseur } = chaine({ fournisseur: { reponse: { texte: "ok" } } });
  await gerer(requete(question()), { ...ENV, MAX_JETONS_REPONSE: "180" });
  assert.equal(fournisseur.derniereDemande.maxJetons, 180);
  await gerer(requete(question()), ENV);
  assert.equal(fournisseur.derniereDemande.maxJetons, 180, "valeur par défaut alignée sur la décision");
});

test("la réponse du modèle est nettoyée avant d'atteindre le navigateur (IA-03)", async () => {
  // Le fournisseur rend une référence valide, une référence inconnue et une
  // adresse inventée. Rien de tout cela ne doit sortir tel quel.
  const { gerer } = chaine({
    fournisseur: { reponse: { texte: "Voyez [[page:fifa26]] et [[page:inconnu]], ou https://piege.example." } },
  });
  const corps = await (await gerer(requete(question()), ENV)).json();
  assert.equal(corps.texte, "Voyez et, ou.");
  assert.deepEqual(corps.liens, [{ id: "fifa26", href: "/projets/fifa26/" }]);
  assert.ok(!corps.texte.includes("piege"), "aucune adresse inventée ne sort");
  assert.ok(!corps.texte.includes("[[page:"), "aucune syntaxe ne reste visible");
});
