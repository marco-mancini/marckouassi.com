import { test } from "node:test";
import assert from "node:assert/strict";
import { construireCourrielBrief, envoyerAvecResend } from "../worker/assistant/src/email.js";
import { CHAMPS_BRIEF, validerQualification } from "../worker/assistant/src/qualification.js";
import { chargerConnaissancePublique } from "../worker/assistant/src/connaissance.js";

const messages = [
  { role: "user", contenu: "Je veux refaire l'identité de ma boulangerie pour attirer les familles avec un logo. J'hésite sur les couleurs." },
  { role: "assistant", contenu: "Deux pistes : beige et brun pour une chaleur artisanale, ou rouge et crème pour plus d'énergie." },
  { role: "user", contenu: "Je préfère beige et brun. Mon budget est 5000 €. Vous pouvez me recontacter par email à client@example.test. Je laisse M. Kouassi décider de la couleur finale." },
  { role: "assistant", contenu: "Le brief est-il exact ?" },
  { role: "user", contenu: "Oui, c'est exact." },
];
const faits = Object.fromEntries([
  ["projet.nature", "refaire l'identité"],
  ["projet.contexte", "ma boulangerie"],
  ["projet.besoin", "refaire l'identité"],
  ["projet.objectif", "attirer les familles"],
  ["creation.livrables", "un logo"],
  ["creation.hesitations", "J'hésite sur les couleurs."],
  ["creation.choixProspect", "Je préfère beige et brun."],
  ["creation.decisionPourExpert", "Je laisse M. Kouassi décider de la couleur finale."],
  ["contraintes.budget", "5000 €"],
  ["prospect.contact.email", "client@example.test"],
].map(([id, valeur]) => [id, { valeur, preuve: valeur }]));
const qualification = validerQualification({
  faits,
  propositions: ["beige et brun pour une chaleur artisanale", "rouge et crème pour plus d'énergie"],
  recontact: { accord: "oui", preuve: messages[2].contenu },
  confirmation: { etat: "oui", preuve: messages[4].contenu },
}, messages);
assert.equal(qualification.ok, true);
const qualificationData = Object.fromEntries(Object.entries(qualification).filter(([cle]) => cle !== "ok"));

test("brief email fidèle : faits, propositions et décisions séparés", () => {
  const courriel = construireCourrielBrief({ qualification, destinataire: "marc@example.test", session: "session_123456" });
  assert.equal(courriel.to[0], "marc@example.test");
  assert.equal(courriel.reply_to, "client@example.test");
  assert.equal(courriel.subject, "Nouveau projet prospect — MarcoS");
  assert.match(courriel.text, /NOUVEAU PROJET/);
  assert.match(courriel.text, /projet · objectif : attirer les familles/);
  assert.match(courriel.text, /contraintes · budget : 5000 €/);
  assert.match(courriel.text, /OPTIONS PROPOSÉES PAR MARCOS/);
  assert.match(courriel.text, /beige et brun pour une chaleur artisanale/);
  assert.match(courriel.text, /creation · decision Pour Expert : Je laisse M. Kouassi décider de la couleur finale/);
  assert.match(courriel.text, /INFORMATIONS MANQUANTES/);
  for (const champ of CHAMPS_BRIEF.filter((id) => !(id in faits))) {
    const label = champ.split(".").map((partie) => partie.replace(/([a-z])([A-Z])/g, "$1 $2")).join(" · ");
    assert.ok(courriel.text.includes(`${label} : Non communiqué`));
  }
  assert.equal(courriel.idempotencyKey, "marcos_brief_session_123456");
});

test("aucun envoi sans brief exploitable, confirmation, consentement et contact", () => {
  const sansConfirmation = { ...qualificationData, confirmation: { etat: "inconnue", preuve: null } };
  assert.equal(construireCourrielBrief({ qualification: sansConfirmation, destinataire: "marc@example.test", session: "session_123456" }), null);
  assert.equal(construireCourrielBrief({ qualification, destinataire: "invalide", session: "session_123456" }), null);
  assert.equal(construireCourrielBrief({ qualification, destinataire: "marc@example.test", session: "court" }), null);
  const messagesSansContact = [messages[0], messages[1], { role: "user", contenu: "Je préfère beige et brun. Mon budget est 5000 €. Je ne souhaite pas être recontacté. Je laisse M. Kouassi décider de la couleur finale." }, messages[3], messages[4]];
  const sansEmail = validerQualification({
    ...qualificationData,
    faits: Object.fromEntries(Object.entries(qualification.faits).filter(([id]) => !id.startsWith("prospect.contact."))),
    recontact: { accord: "non", preuve: messagesSansContact[2].contenu },
  }, messagesSansContact);
  assert.equal(sansEmail.ok, true);
  assert.equal(construireCourrielBrief({ qualification: sansEmail, destinataire: "marc@example.test", session: "session_123456" }), null);
});

test("Resend reçoit la clé serveur et l'idempotence; aucune donnée n'est renvoyée au client", async () => {
  let capture;
  const reponse = await envoyerAvecResend({
    courriel: construireCourrielBrief({ qualification, destinataire: "marc@example.test", session: "session_123456" }),
    env: { RESEND_CLE: "secret-test", RESEND_EXPEDITEUR: "Portfolio <noreply@example.test>" },
    fetcher: async (...args) => {
      capture = args;
      return new Response(JSON.stringify({ id: "email-id-test" }), { status: 200 });
    },
  });
  assert.deepEqual(reponse, { id: "email-id-test" });
  assert.equal(capture[0], "https://api.resend.com/emails");
  assert.equal(capture[1].headers.authorization, "Bearer secret-test");
  assert.equal(capture[1].headers["idempotency-key"], "marcos_brief_session_123456");
  const corps = JSON.parse(capture[1].body);
  assert.equal(corps.from, "Portfolio <noreply@example.test>");
  assert.deepEqual(corps.to, ["marc@example.test"]);
  assert.equal(corps.reply_to, "client@example.test");
  assert.ok(!JSON.stringify(reponse).includes("client@example.test"));
});

test("échec Resend neutralisé pour le client et non masqué dans les journaux", async () => {
  await assert.rejects(
    envoyerAvecResend({ courriel: { idempotencyKey: "brief_session_1234" }, env: {}, fetcher: async () => { throw new Error("détail contenant des données personnelles"); } }),
    (erreur) => erreur.name === "resend_non_configure" && !erreur.message.includes("données personnelles"),
  );
  await assert.rejects(
    envoyerAvecResend({ courriel: { idempotencyKey: "brief_session_1234" }, env: { RESEND_CLE: "secret", RESEND_EXPEDITEUR: "noreply@example.test" }, fetcher: async () => new Response("{}", { status: 500 }) }),
    (erreur) => erreur.name === "resend_refus",
  );
});

test("le destinataire du Worker vient du fichier public et dépend de la langue", async () => {
  let adresse;
  const connaissance = await chargerConnaissancePublique({
    env: { CONNAISSANCE_URL: "https://portfolio.example", DELAI_CONTEXTE_MS: "5000" },
    langue: "fr",
    fetcher: async (url) => {
      adresse = String(url);
      return new Response(JSON.stringify({ contact: { email: "marc@example.test" } }));
    },
  });
  assert.equal(adresse, "https://portfolio.example/connaissance.fr.json");
  assert.equal(connaissance.contact.email, "marc@example.test");
  await assert.rejects(chargerConnaissancePublique({ env: { CONNAISSANCE_URL: "http://evil.example" }, langue: "fr" }), (erreur) => erreur.name === "connaissance_url_invalide");
  await assert.rejects(chargerConnaissancePublique({ env: { CONNAISSANCE_URL: "https://portfolio.example" }, langue: "es" }), (erreur) => erreur.name === "connaissance_non_configuree");
});
