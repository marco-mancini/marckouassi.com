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
