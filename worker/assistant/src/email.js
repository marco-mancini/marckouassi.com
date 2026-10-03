/** Transmission ponctuelle du brief à partir du contrat de qualification. */
import { creerBrief } from "./qualification.js";

const MAX_CORPS = 16000;

function erreurResend(nom) {
  const erreur = new Error(nom);
  erreur.name = nom;
  return erreur;
}

function libelle(champ) {
  return champ.split(".").map((partie) => partie.replace(/([a-z])([A-Z])/g, "$1 $2")).join(" · ");
}

/** Construit un courriel texte sans HTML ni valeur issue des en-têtes. */
export function construireCourrielBrief({ qualification, destinataire, session }) {
  const brief = creerBrief(qualification);
  const contact = brief.faits["prospect.contact.email"]
    || brief.faits["prospect.contact.telephone"]
    || brief.faits["prospect.contact.whatsapp"];
  if (!brief.exploitable || !brief.confirme || brief.recontact !== "oui" || !contact) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinataire ?? "")) return null;

  const lignes = [
    "NOUVEAU PROJET — BRIEF CONFIRMÉ PAR LE PROSPECT",
    "",
    `SYNTHÈSE DU BESOIN : ${brief.synthese.resume}`,
    "",
    "FAITS COMMUNIQUÉS PAR LE PROSPECT",
    ...Object.entries(brief.faits).map(([champ, valeur]) => `${libelle(champ)} : ${valeur ?? "Non communiqué"}`),
    "",
    "OPTIONS PROPOSÉES PAR MARCOS (DISTINCTES DES FAITS)",
    ...(brief.propositionsMarcoS.length ? brief.propositionsMarcoS.map((option) => `- ${option}`) : ["Aucune consignée"]),
    "",
    `RECONTACT : accord explicite (${brief.recontact})`,
    `CONFIRMATION DU BRIEF : ${brief.confirme ? "oui" : "non"}`,
    `PROCHAINE ACTION : ${brief.prochaineAction}`,
    `INFORMATIONS MANQUANTES : ${brief.manquants.length ? brief.manquants.join(", ") : "aucune"}`,
    "",
    "Reprise : M. Kouassi (directeur artistique / expert).",
  ];
  const text = lignes.join("\n");
  if (text.length > MAX_CORPS || !/^[A-Za-z0-9_-]{8,64}$/.test(session ?? "")) return null;

  return {
    to: [destinataire],
    ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.faits["prospect.contact.email"] ?? "") ? { reply_to: brief.faits["prospect.contact.email"] } : {}),
    subject: "Nouveau projet prospect — MarcoS",
    text,
    idempotencyKey: `marcos_brief_${session}`,
  };
}

/** Appel REST natif du Worker : aucune dépendance ni journal contenant le brief. */
export async function envoyerAvecResend({ courriel, env, fetcher = fetch }) {
  const from = env.RESEND_EXPEDITEUR;
  if (!env.RESEND_CLE || typeof from !== "string" || !from.trim() || /[\r\n]/.test(from)) {
    throw erreurResend("resend_non_configure");
  }
  const { idempotencyKey, ...payload } = courriel;
  const signal = AbortSignal.timeout(Number(env.DELAI_RESEND_MS ?? 10000));
  let reponse;
  try {
    reponse = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_CLE}`,
        "content-type": "application/json",
        "idempotency-key": idempotencyKey,
      },
      body: JSON.stringify({ ...payload, from: from.trim() }),
      signal,
    });
  } catch {
    throw erreurResend("resend_reseau");
  }
  if (!reponse.ok) throw erreurResend("resend_refus");
  let resultat;
  try { resultat = await reponse.json(); } catch { throw erreurResend("resend_reponse_invalide"); }
  if (typeof resultat?.id !== "string" || !resultat.id) throw erreurResend("resend_reponse_invalide");
  return { id: resultat.id };
}
