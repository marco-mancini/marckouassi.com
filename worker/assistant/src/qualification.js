/**
 * ÉTAT STRUCTURÉ D'UN BRIEF — faits visiteur et propositions MarcoS séparés.
 *
 * Les valeurs sont conservées comme extraits exacts de la conversation : le
 * modèle peut les classer, jamais les compléter ou les paraphraser en faits.
 * Aucune conversation n'est enregistrée par le Worker.
 */

/** Champs communs, neutres vis-à-vis des catégories de prestations. */
export const CHAMPS_BRIEF = Object.freeze([
  "prospect.nom", "prospect.entreprise", "prospect.fonction",
  "prospect.contact.email", "prospect.contact.telephone", "prospect.contact.whatsapp",
  "projet.nature", "projet.contexte", "projet.besoin", "projet.objectif",
  "projet.cible", "projet.perimetre",
  "creation.livrables", "creation.supports", "creation.direction",
  "creation.references", "creation.existant",
  "creation.hesitations", "creation.choixProspect", "creation.decisionPourExpert",
  "contraintes.delai", "contraintes.budget", "contraintes.production",
  "contraintes.autres",
  "qualification.urgence", "qualification.maturite",
  "qualification.decideur", "qualification.prochaineEtape",
]);

const CHAMPS = new Set(CHAMPS_BRIEF);
const MAX_VALEUR = 500;
const MAX_PREUVE = 500;

function correspond(texte, preuve) {
  return String(texte).normalize("NFC").toLocaleLowerCase()
    .includes(String(preuve).normalize("NFC").toLocaleLowerCase());
}

function messageExact(texte, preuve) {
  return String(texte).normalize("NFC").trim().toLocaleLowerCase()
    === String(preuve).normalize("NFC").trim().toLocaleLowerCase();
}

function accordExplicite(texte) {
  const positif = /(?:vous pouvez|tu peux|je vous autorise|je souhaite être|je veux être|j'accepte d'être|j’accepte d’être|you can|please contact|i authorize|i agree to|you have my permission to).{0,60}(?:recontacter|contacter|joindre|appeler|écrire|contact|reach out|email|call)/i;
  const negatif = /(?:\bpas\b.{0,35}(?:recontacter|contacter|joindre|appeler|écrire)|\b(?:don't|do not|not)\b.{0,35}(?:contact|reach out|email|call))/i;
  return positif.test(texte) && !negatif.test(texte);
}

function confirmationExplicite(texte) {
  return /^\s*(?:oui(?:,\s*(?:c'est exact|tout est exact|c'est correct))?|yes(?:,\s*(?:that's correct|that's accurate|all correct))?)[.!…]*\s*$/i.test(texte);
}

/**
 * Valide un état compact fourni avec la requête suivante.
 * Chaque fait doit être un extrait utilisateur exact. Chaque proposition
 * doit venir d'un extrait exact d'un message assistant. Les deux sources ne
 * peuvent pas être interverties.
 *
 * @returns {{ok: true, faits: object, propositions: string[], recontact: object} | {ok:false, code:string}}
 */
export function validerQualification(entree, messages) {
  if (!entree || typeof entree !== "object" || Array.isArray(entree)) return refus();
  if (Object.keys(entree).some((cle) => !["faits", "propositions", "recontact", "confirmation"].includes(cle))) return refus();
  if (!entree.faits || typeof entree.faits !== "object" || Array.isArray(entree.faits)) return refus();
  const utilisateurs = (messages ?? []).filter((m) => m?.role === "user").map((m) => m.contenu);
  const assistant = (messages ?? []).filter((m) => m?.role === "assistant").map((m) => m.contenu);
  const faits = {};
  for (const [champ, fait] of Object.entries(entree.faits)) {
    if (!CHAMPS.has(champ) || !fait || typeof fait !== "object" || Array.isArray(fait)) return refus();
    if (Object.keys(fait).some((cle) => !["valeur", "preuve"].includes(cle))) return refus();
    const valeur = typeof fait.valeur === "string" ? fait.valeur.trim() : "";
    const preuve = typeof fait.preuve === "string" ? fait.preuve.trim() : "";
    if (!valeur || !preuve || valeur.length > MAX_VALEUR || preuve.length > MAX_PREUVE) return refus();
    if (valeur !== preuve || !utilisateurs.some((texte) => correspond(texte, preuve))) return refus();
    faits[champ] = { valeur, preuve };
  }

  const propositions = entree.propositions ?? [];
  if (!Array.isArray(propositions) || propositions.length > 3) return refus();
  const propositionsValidees = [];
  for (const proposition of propositions) {
    if (typeof proposition !== "string" || !proposition.trim() || proposition.length > MAX_PREUVE) return refus();
    const extrait = proposition.trim();
    if (!assistant.some((texte) => correspond(texte, extrait))) return refus();
    if (!propositionsValidees.includes(extrait)) propositionsValidees.push(extrait);
  }

  const recontact = entree.recontact;
  if (!recontact || typeof recontact !== "object" || Array.isArray(recontact)) return refus();
  if (Object.keys(recontact).some((cle) => !["accord", "preuve"].includes(cle))) return refus();
  if (!["oui", "non", "inconnu"].includes(recontact.accord)) return refus();
  const preuveRecontact = typeof recontact.preuve === "string" ? recontact.preuve.trim() : "";
  if (recontact.accord === "inconnu") {
    if (preuveRecontact) return refus();
  } else if (!preuveRecontact || preuveRecontact.length > MAX_PREUVE || !utilisateurs.some((texte) => messageExact(texte, preuveRecontact)) || (recontact.accord === "oui" && !accordExplicite(preuveRecontact))) {
    return refus();
  }

  const confirmation = entree.confirmation ?? { etat: "inconnue", preuve: "" };
  if (!confirmation || typeof confirmation !== "object" || Array.isArray(confirmation)) return refus();
  if (Object.keys(confirmation).some((cle) => !["etat", "preuve"].includes(cle))) return refus();
  if (!["oui", "non", "inconnue"].includes(confirmation.etat)) return refus();
  const preuveConfirmation = typeof confirmation.preuve === "string" ? confirmation.preuve.trim() : "";
  if (confirmation.etat === "inconnue") {
    if (preuveConfirmation) return refus();
  } else if (!preuveConfirmation || preuveConfirmation.length > MAX_PREUVE || !utilisateurs.some((texte) => messageExact(texte, preuveConfirmation)) || (confirmation.etat === "oui" && !confirmationExplicite(preuveConfirmation))) {
    return refus();
  }

  // Sans accord explicite, une adresse ou un numéro déjà saisi n'est pas
  // admissible dans les faits transmis pour recontact.
  if (recontact.accord !== "oui" && Object.keys(faits).some((cle) => cle.startsWith("prospect.contact."))) return refus();
  return {
    ok: true,
    faits,
    propositions: propositionsValidees,
    recontact: { accord: recontact.accord, preuve: preuveRecontact || null },
    confirmation: { etat: confirmation.etat, preuve: preuveConfirmation || null },
  };
}

function refus() {
  return { ok: false, code: "qualification_invalide" };
}

/**
 * Produit le brief normalisé. Les absences restent null dans les données ;
 * leur présentation localisée (« non communiqué ») appartient au rendu.
 */
export function creerBrief(qualification) {
  const faits = qualification?.faits ?? {};
  const valeur = (champ) => faits[champ]?.valeur ?? null;
  const manquants = [
    "projet.nature", "projet.contexte", "projet.besoin", "projet.objectif",
  ].filter((champ) => !valeur(champ));
  const perimetre = valeur("projet.perimetre") || valeur("creation.livrables");
  if (!perimetre) manquants.push("projet.perimetre|creation.livrables");
  const cleResume = ["projet.nature", "projet.contexte", "projet.besoin", "projet.objectif", "projet.perimetre", "creation.livrables"];
  const resume = cleResume.map(valeur).filter(Boolean).join(" — ") || null;
  const confirme = qualification?.confirmation?.etat === "oui";
  const accord = qualification?.recontact?.accord ?? "inconnu";
  const aUnContact = Boolean(valeur("prospect.contact.email") || valeur("prospect.contact.telephone") || valeur("prospect.contact.whatsapp"));
  const prochaineAction = manquants.length
    ? "completer_brief"
    : !confirme
      ? "faire_confirmer"
      : accord === "oui" && aUnContact
        ? "transmettre_a_expert"
        : "attendre_recontact_volontaire";

  return {
    faits: Object.fromEntries(CHAMPS_BRIEF.map((champ) => [champ, valeur(champ)])),
    propositionsMarcoS: qualification?.propositions ?? [],
    synthese: { resume, informationsManquantes: manquants },
    reprise: { role: "expert" },
    recontact: accord,
    confirme,
    exploitable: manquants.length === 0,
    manquants,
    prochaineAction,
  };
}
