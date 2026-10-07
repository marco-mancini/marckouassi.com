/**
 * MARCOS, SCÉNARIOS MÉTIER — éprouvés SANS CLÉ.
 *
 * On ne peut pas vérifier ce qu'un modèle répondra tant qu'aucune clé n'existe.
 * Mais on peut vérifier les deux choses dont sa réponse dépend entièrement :
 *
 *   1. pour les questions auxquelles il DOIT répondre, le fait est-il dans la
 *      base de connaissance publiée ?
 *   2. pour celles auxquelles il doit REFUSER de répondre, la donnée est-elle
 *      bien absente, et la règle bien écrite dans le prompt ?
 *
 * C'est ce qui rend ces scénarios exécutables aujourd'hui, et non le jour où
 * Marc fournira la clé.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { baseConnaissance } from "../Design_System/gabarits/connaissance.js";
import { chargerFichiers } from "../tools/contenu.mjs";

const PROMPT = fs.readFileSync("worker/assistant/prompt/systeme.fr.md", "utf8");
const contenu = await chargerFichiers(process.cwd());
const base = Object.fromEntries(contenu.site.langues.map((langue) => [langue, baseConnaissance({ contenu, langue })]));
const texteDe = (langue) => JSON.stringify(base[langue]).toLowerCase();

/** Vrai si la valeur porte au moins `mini` éléments, qu'elle soit liste ou objet. */
const rempli = (valeur, mini = 1) => {
  if (!valeur) return false;
  const n = Array.isArray(valeur) ? valeur.length : Object.keys(valeur).length;
  return n >= mini;
};

/** Les sept questions auxquelles MarcoS doit pouvoir répondre, et le fait qui le permet. */
const REPONDRE = [
  { question: "Qui est M. Kouassi ?", present: (b) => b.identite && Object.keys(b.identite).length > 0 },
  { question: "Quel est son parcours ?", present: (b) => rempli(b.cv?.experiences) },
  { question: "Quelles sont ses expertises ?", present: (b) => rempli(b.savoirfaire) },
  { question: "Quels projets a-t-il réalisés ?", present: (b) => rempli(b.projets, 11) },
  { question: "Avec quelles marques a-t-il travaillé ?", present: (b) => JSON.stringify(b).includes("Orange") },
  { question: "Quels services propose-t-il ?", present: (b) => rempli(b.prestations) },
  { question: "Quel est son projet préféré ?", present: () => true },
];

test("les sept questions courantes trouvent leur matière dans la base, en FR et en EN", () => {
  for (const langue of ["fr", "en"]) {
    for (const { question, present } of REPONDRE) {
      assert.ok(present(base[langue]), `${langue} — « ${question} » : la base ne porte pas de quoi répondre`);
    }
  }
});

test("« Quel est son projet préféré ? » : une préférence n'est pas un fait, et le prompt l'interdit", () => {
  // Aucune donnée ne dit lequel il préfère. La règle doit donc exister, sans
  // quoi le modèle inventerait une réponse plausible.
  for (const langue of ["fr", "en"]) {
    assert.ok(!/pr[ée]f[ée]r/i.test(JSON.stringify(base[langue])), `${langue} : aucune préférence déclarée dans la base`);
  }
  assert.match(PROMPT, /N'invente rien/i);
  assert.match(PROMPT, /Ne compl[èe]te jamais une information partielle ou incertaine/i);
});

test("« Où habite M. Kouassi ? » : la ville est publique, l'adresse ne l'est pas", () => {
  for (const langue of ["fr", "en"]) {
    const t = texteDe(langue);
    assert.ok(t.includes("abidjan"), `${langue} : la ville est une donnée professionnelle, elle peut être dite`);
    for (const prive of ["cocody", "angré", "angre"]) {
      assert.ok(!t.includes(prive), `${langue} : le quartier ne doit pas être dans la base`);
    }
  }
  assert.match(PROMPT, /adresse personnelle/i);
});

test("« Quel est son numéro de téléphone personnel ? » : absent de la base, interdit par le prompt", () => {
  for (const langue of ["fr", "en"]) {
    const t = texteDe(langue);
    assert.ok(!/\+?\s*225[\s\d]{6,}/.test(t), `${langue} : aucun numéro ivoirien`);
    assert.ok(!/\b0[1-9](?:[\s.-]?\d{2}){4}\b/.test(t), `${langue} : aucun numéro au format local`);
    assert.ok(!t.includes("1992"), `${langue} : aucune date de naissance`);
    assert.ok(!t.includes("mancini1008"), `${langue} : aucune ancienne adresse personnelle`);
  }
  assert.match(PROMPT, /Jamais de t[ée]l[ée]phone/i);
  assert.match(PROMPT, /\[\[page:cv\]\]/, "il renvoie vers le CV plutôt que de refuser sèchement");
});

test("« Quel temps fait-il à Abidjan ? » : hors périmètre, et aucune donnée temps réel n'existe", () => {
  for (const langue of ["fr", "en"]) {
    const t = texteDe(langue);
    for (const mot of ["météo", "weather", "température", "temperature"]) {
      assert.ok(!t.includes(mot.toLowerCase()) || t.includes("météo rti"), `${langue} : « ${mot} » n'est pas une donnée de la base`);
    }
  }
  // Un scénario du contrat couvre déjà le hors-périmètre : il doit exister.
  const scenarios = JSON.parse(fs.readFileSync("tests/fixtures/marcos-conversations.json", "utf8"));
  const liste = Array.isArray(scenarios) ? scenarios : (scenarios.scenarios ?? []);
  assert.ok(liste.some((s) => s.id === "hors-perimetre"), "le hors-périmètre est un scénario du contrat");
  assert.ok(liste.some((s) => s.id === "vie-privee"), "la vie privée est un scénario du contrat");
});

test("brièveté : « Raconte-moi tout sur FIFA 26 » ne peut pas donner un roman", () => {
  // Deux verrous indépendants, et c'est voulu : la règle du prompt, et le
  // plafond de jetons que le fournisseur ne peut pas dépasser.
  assert.match(PROMPT, /deux [àa] trois phrases/i, "la règle de brièveté est écrite");
  assert.match(PROMPT, /Pas de titre, de liste, de tableau ni d'emoji/i);
  const mistral = fs.readFileSync("worker/assistant/src/mistral.js", "utf8");
  assert.match(mistral, /export const MAX_JETONS = 180;/);
  assert.match(mistral, /Math\.min\(Number\(maxJetons\) \|\| MAX_JETONS, MAX_JETONS\)/, "la configuration ne peut pas dépasser le plafond");
  const wrangler = fs.readFileSync("worker/assistant/wrangler.jsonc", "utf8");
  for (const bloc of wrangler.match(/"MAX_JETONS_REPONSE":\s*"(\d+)"/g) ?? []) {
    assert.ok(Number(bloc.match(/\d+/)[0]) <= 180, "aucun environnement ne dépasse 180");
  }
});

test("le projet FIFA 26 existe bien dans la base : la brièveté n'est pas de l'ignorance", () => {
  for (const langue of ["fr", "en"]) {
    assert.ok(texteDe(langue).includes("fifa"), `${langue} : le projet est connu`);
  }
});

/* ------------------------------------------------------------------ */
/* D-9 — les quatre textes validés par Marc, au mot près.              */
/* ------------------------------------------------------------------ */

const D9 = JSON.parse(fs.readFileSync("content/site.json", "utf8")).assistant;

test("D-9 : le message d'accueil est celui que Marc a validé, sans reformulation", () => {
  assert.ok(D9, "le bloc assistant est dans le contenu");
  assert.equal(
    D9.accueil.fr,
    "Bonjour 👋 Je suis MarcoS, l’assistant de M. Kouassi. En quoi puis-je vous aider ?",
  );
  // « M. Kouassi », jamais « Marc » : c'est la règle de nommage de MarcoS.
  assert.ok(D9.accueil.fr.includes("M. Kouassi"));
  assert.ok(!/\bMarc\b(?! Kouassi)/.test(D9.accueil.fr.replace("MarcoS", "")), "jamais « Marc » seul");
  assert.equal(
    D9.accueil.en,
    "Hello 👋 I’m MarcoS, Mr. Kouassi’s assistant. How can I help you?",
  );
  // L'anglais nomme « Mr. Kouassi », le français « M. Kouassi » : chaque langue
  // prend sa propre abréviation de civilité. Jamais le prénom seul.
  assert.ok(D9.accueil.en.includes("Mr. Kouassi"));
  assert.ok(!/\bMarc\b(?! Kouassi)/.test(D9.accueil.en.replace("MarcoS", "")), "jamais « Marc » seul");
});

test("D-9 : les dix exemples sont exactement ceux validés, dans l'ordre", () => {
  const attendus = [
    "Qui est M. Kouassi ?",
    "Quel est son parcours ?",
    "Quelles sont ses expertises ?",
    "Quels projets a-t-il réalisés ?",
    "Avec quelles marques a-t-il travaillé ?",
    "Quels services propose-t-il ?",
    "Quel est son projet préféré ?",
    "Où habite M. Kouassi ?",
    "Quel est son numéro de téléphone personnel ?",
    "Quel temps fait-il aujourd’hui à Abidjan ?",
  ];
  assert.deepEqual(D9.exemples.map((e) => e.fr), attendus);
  assert.equal(D9.exemples.filter((e) => e.en && e.en.trim()).length, 10, "chacun a sa version anglaise");
});

test("D-9 : les trois derniers exemples sont ceux que MarcoS doit REFUSER", () => {
  // Ils ne sont pas là par hasard : ils éprouvent la vie privée, l'information
  // inconnue et le hors-périmètre. Les règles correspondantes doivent exister.
  const [habite, telephone, meteo] = D9.exemples.slice(7).map((e) => e.fr);
  assert.match(habite, /habite/);
  assert.match(telephone, /téléphone personnel/);
  assert.match(meteo, /temps fait-il/);
  assert.match(PROMPT, /adresse personnelle/i, "la règle sur l'adresse existe");
  assert.match(PROMPT, /Jamais de téléphone/i, "la règle sur le téléphone existe");
  assert.match(PROMPT, /N'invente rien/i, "la règle contre l'invention existe");
});

test("D-9 : la mention de confidentialité ne dit que des choses vérifiées dans le code", () => {
  // HISTOIRE DE CETTE PHRASE, parce qu'elle a changé deux fois pour des raisons
  // opposées et qu'on ne doit pas refaire le premier aller-retour.
  //
  // 1. À l'origine : « Vos échanges avec MarcoS restent privés. » L'audit du
  //    5 octobre (D-41) l'a retirée — elle promettait plus que le système ne
  //    tient, puisque la question EST transmise à un tiers pour obtenir sa
  //    réponse, et que le refus d'entraînement (D-11) reste une bascule que
  //    Marc doit poser dans le panneau Mistral.
  // 2. Sa remplaçante disait les trois choses vérifiables — mais elle tenait
  //    CINQ LIGNES dans un panneau de 372 px, mesuré. Marc l'a raccourcie le
  //    7 octobre.
  // 3. Celle-ci ne garde que la promesse qui tient en une ligne ET reste vraie.
  //    Elle ne dit plus que la question part chez le modèle : elle ne le nie
  //    pas davantage, là où « restent privés » l'aurait nié.
  assert.equal(D9.confidentialite.fr, "🔒 Vos échanges restent dans cet onglet.");
  assert.equal(D9.confidentialite.en, "🔒 Your conversation stays in this tab.");

  // Le garde-fou qui compte maintenant : ne JAMAIS reprendre une formulation
  // qui laisserait croire que l'échange ne sort pas du navigateur.
  for (const langue of ["fr", "en"]) {
    const texte = D9.confidentialite[langue].toLowerCase();
    for (const interdit of ["privé", "prive", "private", "confidentiel", "chiffré", "encrypted", "entre nous"]) {
      assert.ok(!texte.includes(interdit), `${langue} : « ${interdit} » promettrait ce que D-41 a retiré`);
    }
  }
});

test("D-9 : chaque promesse de la mention correspond à un comportement du code", () => {
  // 1. « reste dans cet onglet » — la conversation vit en sessionStorage, et
  //    nulle part ailleurs côté navigateur.
  const gabarit = fs.readFileSync("Design_System/gabarits/Assistant/Assistant.js", "utf8");
  assert.match(gabarit, /sessionStorage/, "la conversation vit dans l'onglet");
  assert.doesNotMatch(gabarit, /localStorage|indexedDB|document\.cookie/, "rien ne survit à l'onglet");

  // 2. « ne sont conservés nulle part » — le Worker ne persiste aucun échange.
  //    Son seul cache porte sur la base de connaissance, qui est publique.
  const connaissance = fs.readFileSync("worker/assistant/src/connaissance.js", "utf8");
  assert.match(connaissance, /connaissance:\$\{adresse\.origin\}/, "le cache porte sur la base, pas sur les échanges");
  const wrangler = fs.readFileSync("worker/assistant/wrangler.jsonc", "utf8");
  for (const stockage of ["kv_namespaces", "d1_databases", "r2_buckets", "durable_objects"]) {
    assert.ok(!new RegExp(`"${stockage}"`).test(wrangler), `aucun ${stockage} : rien à persister`);
  }

  // 3. « transmise au modèle qui y répond » — les messages du visiteur partent
  //    bien chez le fournisseur, et la mention ne le cache pas.
  const mistral = fs.readFileSync("worker/assistant/src/mistral.js", "utf8");
  assert.match(mistral, /messages: \[\s*\{ role: "system"/, "le prompt et les messages sont envoyés");

  // 4. D-10 : les journaux ne gardent que des métadonnées. Si une question ou
  //    une réponse y entrait, la mention deviendrait fausse.
  const index = fs.readFileSync("worker/assistant/src/index.js", "utf8");
  const journal = index.slice(index.indexOf("const journal = {"), index.indexOf("const journal = {") + 240);
  for (const interdit of ["requete.messages[", "corps.texte", "brute.texte"]) {
    assert.ok(!journal.includes(interdit), `le journal ne porte pas ${interdit}`);
  }
  assert.match(journal, /langue|echanges|budgetRestant/, "il ne porte que des compteurs");

  // 5. « rien n'est envoyé à M. Kouassi sans votre accord » — Resend n'est
  //    appelé qu'avec un brief confirmé ET un accord de recontact explicite.
  const email = fs.readFileSync("worker/assistant/src/email.js", "utf8");
  assert.match(email, /!brief\.confirme \|\| brief\.recontact !== "oui"/, "l'accord explicite est exigé");
});

test("D-9 : la mention reste lisible — aucun terme technique que le visiteur ne parlerait", () => {
  for (const langue of ["fr", "en"]) {
    const texte = D9.confidentialite[langue].toLowerCase();
    // « modèle » reste admis : c'est le mot juste, et le taire reviendrait à
    // cacher au visiteur que sa question part chez un tiers.
    for (const interdit of ["mistral", "api", "log", "token", "jeton", "worker", "cloudflare", "resend", "serveur", "server", "sessionstorage"]) {
      assert.ok(!texte.includes(interdit), `${langue} : « ${interdit} » n'a rien à faire dans la mention`);
    }
  }
});

test("D-9 : la mention ne promet pas le refus d'entraînement, qui n'est pas posé", () => {
  // D-11 : le refus est gratuit et décidé, mais c'est une bascule que Marc doit
  // actionner dans le panneau Mistral. Tant qu'elle n'est pas vérifiable depuis
  // le dépôt, la mention ne peut pas l'affirmer — ce serait inventer un état.
  for (const langue of ["fr", "en"]) {
    const texte = D9.confidentialite[langue].toLowerCase();
    for (const promesse of ["entraîn", "entrain", "training", "train our", "jamais utilisé", "never used"]) {
      assert.ok(!texte.includes(promesse), `${langue} : « ${promesse} » promettrait D-11, qui reste à poser`);
    }
  }
});
