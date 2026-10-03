import { html } from "../../fondations/rendu.js";
import { Modale } from "../../composants/Modale/Modale.js";
import { Conversation } from "../../composants/Conversation/Conversation.js";
import { Champ } from "../../composants/Champ/Champ.js";
import { Saisie } from "../../composants/Saisie/Saisie.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Message } from "../../composants/Message/Message.js";

export function Assistant({ assistant, ctx, endpoint }) {
  if (!assistant?.active || !endpoint) return "";
  const t = (cle, variables) => ctx.t(`assistant.${cle}`, variables);
  const contenu = html`<div class="assistant" data-assistant data-endpoint="${endpoint}">
    <div class="assistant__accueil" data-assistant-accueil>
      <p class="assistant__accueil-texte">${ctx.c(assistant.accueil, "site.assistant.accueil")}</p>
      ${assistant.exemples?.length ? html`<div class="assistant__exemples" data-assistant-exemples>${assistant.exemples.map((exemple, i) => Bouton({ texte: ctx.l(exemple, `site.assistant.exemples.${i}`), variante: "filet", options: { attributs: { type: "button", "data-assistant-exemple": "" } } }))}</div>` : ""}
      <p class="assistant__confidentialite texte-etiquette">${ctx.c(assistant.confidentialite, "site.assistant.confidentialite")}</p>
    </div>
    <div data-assistant-log></div>
    <div class="assistant__etat" data-assistant-etat></div>
    <form class="assistant__formulaire" data-assistant-form>
      ${Champ({ etiquette: t("question"), variante: "formulaire", id: "assistant-question", contenu: Saisie({ id: "assistant-question", type: "long", options: { lignes: 3, etat: { aide: true }, nom: "question" } }), messages: { aide: t("aide") } })}
      <div class="assistant__actions">${Bouton({ texte: t("envoyer"), variante: "principal", options: { etat: null, attributs: { type: "submit" } } })}</div>
    </form>
  </div>`;
  return Modale({ id: "assistant", etiquette: t("etiquette"), entete: html`<span class="texte-etiquette">MarcoS</span>${Bouton({ texte: t("effacer"), variante: "nu", options: { attributs: { type: "button", "data-assistant-effacer": "" } } })}`, contenu, options: { variante: "centre", libelleFermer: t("fermer") } });
}

function sessionId() {
  const cle = "marcos-session";
  let valeur = sessionStorage.getItem(cle);
  if (!valeur) {
    valeur = `${crypto.randomUUID().replaceAll("-", "")}`;
    sessionStorage.setItem(cle, valeur);
  }
  return valeur;
}

export function activerAssistant(racine, { langue = document.documentElement.lang, page = location.pathname } = {}) {
  const racineAssistant = racine?.querySelector("[data-assistant]");
  if (!racineAssistant) return;
  const formulaire = racineAssistant.querySelector("[data-assistant-form]");
  const journal = racineAssistant.querySelector("[data-assistant-log]");
  const etat = racineAssistant.querySelector("[data-assistant-etat]");
  const champ = racineAssistant.querySelector("#assistant-question");
  const endpoint = racineAssistant.dataset.endpoint;
  const stockage = "marcos-conversation";
  let echanges = JSON.parse(sessionStorage.getItem(stockage) || "[]");

  const afficher = () => {
    journal.innerHTML = String(Conversation({
      echanges,
      etiquette: racineAssistant.querySelector(".conversation")?.getAttribute("aria-label") || "Conversation avec MarcoS",
      libelles: { visiteur: "Vous", assistant: "MarcoS" },
      vide: racineAssistant.querySelector("[data-assistant-accueil]") || "",
    }));
  };
  const sauvegarder = () => sessionStorage.setItem(stockage, JSON.stringify(echanges));
  const messageEtat = (texte, type = "erreur") => { etat.innerHTML = String(Message({ type, texte })); };

  afficher();
  formulaire?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const contenu = String(champ?.value || "").trim();
    if (!contenu || contenu.length > 500) return;
    echanges.push({ role: "visiteur", texte: contenu });
    sauvegarder(); afficher(); messageEtat("", "vide");
    formulaire.querySelector("button[type=submit]")?.setAttribute("aria-busy", "true");
    try {
      const reponse = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ version: 1, langue, page, session: sessionId(), messages: echanges.map(({ role, texte }) => ({ role: role === "visiteur" ? "user" : "assistant", contenu: texte })) }) });
      const corps = await reponse.json();
      if (!reponse.ok) throw new Error(corps.code || "indisponible");
      echanges.push({ role: "assistant", texte: corps.texte, liens: corps.liens || [] });
      sauvegarder(); afficher();
      if (champ) champ.value = "";
    } catch {
      messageEtat("MarcoS est momentanément indisponible. Vous pouvez poursuivre par e-mail.");
    } finally {
      formulaire.querySelector("button[type=submit]")?.removeAttribute("aria-busy");
      champ?.focus();
    }
  });

  racineAssistant.querySelectorAll("[data-assistant-exemple]").forEach((bouton) => bouton.addEventListener("click", () => {
    if (champ) { champ.value = bouton.textContent.trim(); champ.focus(); }
  }));
  racineAssistant.querySelector("[data-assistant-effacer]")?.addEventListener("click", () => {
    echanges = []; sessionStorage.removeItem(stockage); afficher(); champ?.focus();
  });
}
