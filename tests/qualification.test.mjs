import { test } from "node:test";
import assert from "node:assert/strict";
import { CHAMPS_BRIEF, validerQualification, creerBrief } from "../worker/assistant/src/qualification.js";
import { chargerFichiers } from "../tools/contenu.mjs";
import { baseQualification } from "../Design_System/gabarits/connaissance.js";

const contenu = await chargerFichiers(process.cwd());

const q = (faits = {}, recontact = { accord: "inconnu", preuve: "" }) => ({ faits, recontact });
const msg = (contenu, role = "user") => ({ role, contenu });
const fait = (valeur) => ({ valeur, preuve: valeur });

test("le schéma du brief est générique et ses champs sont uniques", () => {
  assert.equal(new Set(CHAMPS_BRIEF).size, CHAMPS_BRIEF.length);
  assert.ok(CHAMPS_BRIEF.includes("projet.objectif"));
  assert.ok(CHAMPS_BRIEF.includes("creation.livrables"));
  assert.ok(CHAMPS_BRIEF.includes("creation.hesitations"));
  assert.ok(CHAMPS_BRIEF.includes("creation.decisionPourExpert"));
  assert.ok(!CHAMPS_BRIEF.some((champ) => /identite|campagne|print|uxui/i.test(champ)));
});

test("les questions de qualification suivent les offres du contenu en FR et EN", () => {
  const fr = baseQualification({ contenu, langue: "fr" }).offres;
  const en = baseQualification({ contenu, langue: "en" }).offres;
  assert.equal(fr.length, en.length);
  for (const [rang, offre] of fr.entries()) {
    assert.match(offre.id, /^[a-z0-9-]+$/);
    assert.equal(offre.id, en[rang].id);
    assert.ok(offre.declencheur);
    assert.equal(offre.questions.length, en[rang].questions.length);
    for (const [i, q] of offre.questions.entries()) {
      assert.ok(q.champ && q.texte, `champ/question FR ${offre.id}`);
      assert.ok(en[rang].questions[i].texte, `question EN ${offre.id}`);
    }
  }
});

test("un fait n'est accepté que s'il reprend un extrait exact du visiteur", () => {
  const messages = [msg("Je veux refaire l'identité de ma boulangerie pour attirer les familles.")];
  const valeur = "les familles";
  const valide = validerQualification(q({ "projet.cible": fait(valeur) }), messages);
  assert.equal(valide.ok, true);
  assert.equal(valide.faits["projet.cible"].valeur, valeur);

  const invente = validerQualification(q({ "projet.cible": fait("les jeunes actifs") }), messages);
  assert.equal(invente.ok, false);
  const paraphrase = validerQualification(q({ "projet.cible": { valeur: "familles", preuve: "les familles" } }), messages);
  assert.equal(paraphrase.ok, false, "la valeur factuelle reste une citation exacte");
});

test("une réponse précédente de MarcoS ne peut pas justifier un fait", () => {
  const messages = [msg("Pour des familles.", "assistant")];
  assert.equal(validerQualification(q({ "projet.cible": fait("Pour des familles.") }), messages).ok, false);
});

test("schéma strict : clé inconnue, preuve manquante et champs hors liste refusés", () => {
  const messages = [msg("Je veux un site.")];
  assert.equal(validerQualification(q({ "projet.inventé": fait("site") }), messages).ok, false);
  assert.equal(validerQualification(q({ "projet.nature": { valeur: "site" } }), messages).ok, false);
  assert.equal(validerQualification({ ...q(), autre: true }, messages).ok, false);
  assert.equal(validerQualification(q({ "projet.nature": fait("x".repeat(501)) }), [msg("x".repeat(501))]).ok, false);
});

test("les coordonnées sont bloquées sans accord explicite de recontact", () => {
  const messages = [msg("Mon adresse est client@example.test")];
  assert.equal(validerQualification(q({ "prospect.contact.email": fait("client@example.test") }), messages).ok, false);
});

test("les coordonnées exigent accord et preuve dans les mots du visiteur", () => {
  const messages = [
    msg("Vous pouvez me recontacter à client@example.test"),
  ];
  const resultat = validerQualification(q(
    { "prospect.contact.email": fait("client@example.test") },
    { accord: "oui", preuve: "Vous pouvez me recontacter à client@example.test" },
  ), messages);
  assert.equal(resultat.ok, true);
  assert.equal(resultat.recontact.accord, "oui");
  assert.equal(validerQualification(q({}, { accord: "oui", preuve: "oui" }), [msg("Pas d'accord donné.")]).ok, false);
  const refusMasque = "Vous pouvez pas me recontacter.";
  assert.equal(validerQualification(q({}, { accord: "oui", preuve: refusMasque }), [msg(refusMasque)]).ok, false);
  assert.equal(validerQualification(q({}, { accord: "non", preuve: "Je ne souhaite pas être recontacté" }), [msg("Je ne souhaite pas être recontacté")]).ok, true);
});

test("la confirmation du brief n'est acquise que si le visiteur la fournit", () => {
  const messages = [msg("Oui.")];
  const nonConfirme = validerQualification(q(), messages);
  assert.equal(creerBrief(nonConfirme).confirme, false);
  const confirme = validerQualification({ ...q(), confirmation: { etat: "oui", preuve: "Oui." } }, messages);
  assert.equal(confirme.ok, true);
  assert.equal(creerBrief(confirme).confirme, true);
  const fauxOui = [msg("Je ne sais pas, le projet n'est pas oui pour le moment.")];
  assert.equal(validerQualification({ ...q(), confirmation: { etat: "oui", preuve: "oui" } }, fauxOui).ok, false);
});

test("le brief explicite toutes les absences et ne devient exploitable qu'avec le socle", () => {
  const vide = creerBrief({ faits: {}, recontact: { accord: "inconnu" } });
  assert.equal(vide.exploitable, false);
  assert.equal(vide.faits["contraintes.budget"], null);
  assert.deepEqual(vide.manquants, ["projet.nature", "projet.contexte", "projet.besoin", "projet.objectif", "projet.perimetre|creation.livrables"]);

  const faits = Object.fromEntries([
    ["projet.nature", "identité de marque"],
    ["projet.contexte", "boulangerie"],
    ["projet.besoin", "refaire l'identité"],
    ["projet.objectif", "attirer les familles"],
    ["creation.livrables", "un logo"],
  ].map(([champ, valeur]) => [champ, fait(valeur)]));
  const brief = creerBrief({ faits });
  assert.equal(brief.exploitable, true);
  assert.deepEqual(brief.manquants, []);
  assert.equal(brief.faits["contraintes.budget"], null);
  assert.equal(brief.reprise.role, "expert");
  assert.equal(brief.synthese.resume, "identité de marque — boulangerie — refaire l'identité — attirer les familles — un logo");
  assert.equal(brief.prochaineAction, "faire_confirmer");
});
