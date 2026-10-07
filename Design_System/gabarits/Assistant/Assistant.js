import { html, brut, attributs } from "../../fondations/rendu.js";
import { Modale } from "../../composants/Modale/Modale.js";
import { Conversation } from "../../composants/Conversation/Conversation.js";
import { Champ } from "../../composants/Champ/Champ.js";
import { Saisie } from "../../composants/Saisie/Saisie.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Message } from "../../composants/Message/Message.js";
import { activerSceaux } from "../../composants/Sceau/Sceau.js";

/** Longueur maximale d'une question, alignée sur la validation du Worker. */
export const LONGUEUR_MAX = 500;

/** Asset visuel officiel validé par l'issue #49 et D-35. */
const AVATAR_NEUTRE = "/Avatar_MarcoS/Avatar_02_NEUTRE_DISPONIBLE.png";

/** Un texte traduisible est vide quand aucune langue n'est renseignée. */
const renseigne = (valeur) => Boolean(valeur && Object.values(valeur).some((v) => String(v ?? "").trim()));

/**
 * Libellés dont le comportement a besoin dans le navigateur, où `ctx` n'existe
 * plus. Ils voyagent dans un attribut `data-`, comme `data-frequence` d'Intro
 * et `data-compteur` de Projet_etude : aucun texte n'est écrit dans le script.
 */
function libelles(t, tSite) {
  const erreurs = {};
  for (const code of ["requete_invalide", "origine_refusee", "trop_long", "trop_de_demandes", "quota_journalier", "indisponible", "delai_depasse", "hors_ligne"]) {
    erreurs[code] = t(`erreurs.${code}`);
  }
  // Titres bicolores des états (#162) : ceux de tout le site, dictionnaire « etats ».
  const titres = { chargement: tSite("etats.assistant.titre"), indisponible: tSite("etats.indisponible.titre"), hors_ligne: tSite("etats.horsConnexion.titre") };
  return { vous: t("vous"), assistant: t("assistant"), etiquette: t("etiquette"), chargement: t("chargement"), reessayer: t("reessayer"), aide: t("aide"), erreurs, titres };
}

/**
 * Assistant — présence flottante + Modale + Conversation + formulaire.
 *
 * La présence flottante est l'entrée visuelle primaire de MarcoS en V1 (D-35).
 * L'avatar utilisé ici est l'expression neutre officielle ; les dix expressions
 * restent une bibliothèque visuelle et ne deviennent pas dix états runtime.
 * Sans endpoint ou sans activation D-9, rien n'est rendu.
 *
 * @param {object} p
 * @param {{active:boolean,accueil:object,exemples:Array<object>,confidentialite:object}} p.assistant
 * @param {object} p.ctx
 * @param {string|null} p.endpoint
 */
export function Assistant({ assistant, ctx, endpoint }) {
  if (!assistant?.active || !endpoint) return "";
  const t = (cle, variables) => ctx.t(`assistant.${cle}`, variables);
  // Un exemple vide ne devient pas un bouton sans fonction : le CMS laisse
  // ajouter une ligne avant de la remplir.
  const exemples = (assistant.exemples || []).map((exemple, rang) => ({ exemple, rang })).filter(({ exemple }) => renseigne(exemple));

  const contenu = html`<div class="assistant" data-assistant${attributs({ "data-endpoint": endpoint, "data-longueur-max": String(LONGUEUR_MAX), "data-libelles": JSON.stringify(libelles(t, ctx.t)) })}>
    <div class="assistant__presence">
      ${Bouton({ texte: t("assistant"), variante: "nu", options: { attributs: { "data-modale-ouvrir": "assistant", "aria-haspopup": "dialog", "aria-expanded": "false", "aria-controls": "assistant", "data-assistant-presence": "" } } })}
    </div>
    <div class="assistant__accueil" data-assistant-accueil>
      <p class="assistant__accueil-texte texte-corps">${ctx.c(assistant.accueil, "site.assistant.accueil")}</p>
      ${exemples.length ? html`<div class="assistant__exemples" data-assistant-exemples>${exemples.map(({ exemple, rang }) => Bouton({ texte: ctx.l(exemple, `site.assistant.exemples.${rang}`), variante: "filet", options: { attributs: { type: "button", "data-assistant-exemple": "" } } }))}</div>` : ""}
      ${renseigne(assistant.confidentialite) ? html`<p class="assistant__confidentialite texte-etiquette">${ctx.c(assistant.confidentialite, "site.assistant.confidentialite")}</p>` : ""}
    </div>
    <div data-assistant-log>${Conversation({ echanges: [], etiquette: t("etiquette"), libelles: { visiteur: t("vous"), assistant: t("assistant") }, vide: "" })}</div>
    <div class="assistant__etat" data-assistant-etat></div>
    <form class="assistant__formulaire" data-assistant-form>
      ${Champ({
        etiquette: t("question"),
        variante: "formulaire",
        id: "assistant-question",
        contenu: Saisie({ id: "assistant-question", type: "long", options: { lignes: 3, etat: { aide: true }, nom: "question" } }),
        messages: { aide: t("aide", { n: LONGUEUR_MAX }) },
      })}
      <div class="assistant__actions">${Bouton({ texte: t("envoyer"), variante: "principal", options: { attributs: { type: "submit" } } })}</div>
    </form>
  </div>`;

  return Modale({
    id: "assistant",
    etiquette: t("etiquette"),
    entete: html`<div class="assistant__entete-identite"><img class="assistant__avatar assistant__avatar--entete" src="${AVATAR_NEUTRE}" alt="" aria-hidden="true"><span class="texte-etiquette">${t("assistant")}</span></div>${Bouton({ texte: t("effacer"), variante: "nu", options: { attributs: { type: "button", "data-assistant-effacer": "" } } })}`,
    contenu,
    options: { variante: "centre", libelleFermer: t("fermer") },
  });
}

/**
 * Le stockage de session peut être refusé (navigation privée, site bloqué).
 * On ne laisse jamais ce refus interrompre MarcoS : la conversation vit alors
 * en mémoire, le temps de l'onglet.
 */
function memoire(cle) {
  const disponible = (() => {
    try {
      sessionStorage.setItem(cle, sessionStorage.getItem(cle) ?? "");
      return true;
    } catch {
      return false;
    }
  })();
  let secours = null;
  return {
    lire() {
      if (!disponible) return secours;
      try {
        return sessionStorage.getItem(cle);
      } catch {
        return secours;
      }
    },
    ecrire(valeur) {
      secours = valeur;
      if (!disponible) return;
      try {
        sessionStorage.setItem(cle, valeur);
      } catch { /* refusé en cours de route : la mémoire suffit */ }
    },
    effacer() {
      secours = null;
      if (!disponible) return;
      try {
        sessionStorage.removeItem(cle);
      } catch { /* idem */ }
    },
  };
}

/** Identifiant d'onglet, douze caractères comme l'attend le Worker. */
function session(stock) {
  const existant = stock.lire();
  if (existant) return existant;
  const valeur = crypto.randomUUID().replaceAll("-", "").slice(0, 12);
  stock.ecrire(valeur);
  return valeur;
}

export function activerAssistant(racine, { langue = document.documentElement.lang, page = location.pathname } = {}) {
  const hote = racine?.querySelector("[data-assistant]");
  if (!hote) return;

  let libelle;
  try {
    libelle = JSON.parse(hote.dataset.libelles || "{}");
  } catch {
    return; // Sans libellés, on n'affiche rien plutôt que du texte en dur.
  }

  const formulaire = hote.querySelector("[data-assistant-form]");
  const journal = hote.querySelector("[data-assistant-log]");
  const zoneEtat = hote.querySelector("[data-assistant-etat]");
  const accueil = hote.querySelector("[data-assistant-accueil]");
  const champ = hote.querySelector("#assistant-question");
  const aide = hote.querySelector("#assistant-question-aide");
  const envoyer = formulaire?.querySelector("button[type=submit]");
  const endpoint = hote.dataset.endpoint;
  const longueurMax = Number(hote.dataset.longueurMax) || 500;

  const conversation = memoire("marcos-conversation");
  const identifiant = memoire("marcos-session");
  let echanges = (() => {
    try {
      const brutes = JSON.parse(conversation.lire() || "[]");
      return Array.isArray(brutes) ? brutes : [];
    } catch {
      conversation.effacer(); // Valeur illisible : on repart propre, sans planter.
      return [];
    }
  })();
  let derniere = null;

  const afficher = () => {
    journal.innerHTML = String(Conversation({
      echanges,
      etiquette: libelle.etiquette,
      libelles: { visiteur: libelle.vous, assistant: libelle.assistant },
      vide: "",
    }));
    // L'accueil est masqué dès le premier échange : il tient la place du vide.
    if (accueil) accueil.hidden = echanges.length > 0;
  };
  const etat = (noeud) => { zoneEtat.innerHTML = noeud ? String(noeud) : ""; activerSceaux(zoneEtat); };
  const compteur = () => {
    if (aide && libelle.aide) aide.textContent = libelle.aide.replace("{n}", String(longueurMax - (champ?.value.length || 0)));
  };

  afficher();
  compteur();
  champ?.addEventListener("input", compteur);

  const demander = async (contenu) => {
    derniere = contenu;
    etat(Message({ type: "chargement", titre: libelle.titres?.chargement, texte: libelle.chargement, mode: { sceau: "chargement", compact: true } }));
    envoyer?.setAttribute("aria-busy", "true");
    journal.setAttribute("aria-busy", "true");
    try {
      if (navigator.onLine === false) throw new Error("hors_ligne");
      const reponse = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          version: 1, langue, page, session: session(identifiant),
          messages: echanges.map(({ role, texte }) => ({ role: role === "visiteur" ? "user" : "assistant", contenu: texte })),
        }),
      });
      const corps = await reponse.json().catch(() => ({}));
      // Le contrat du Worker est « { erreur: code } » (worker/.../erreurs.js).
      // Lire « corps.code » écrasait chaque code par « indisponible » : le
      // quota et la limite de débit n'étaient jamais annoncés au visiteur.
      if (!reponse.ok) throw new Error(corps.erreur || "indisponible");
      echanges.push({ role: "assistant", texte: corps.texte, liens: (corps.liens || []).filter((lien) => String(lien.href || "").startsWith("/")) });
      conversation.ecrire(JSON.stringify(echanges));
      afficher();
      etat(null);
      if (champ) { champ.value = ""; compteur(); }
    } catch (erreur) {
      const code = libelle.erreurs?.[erreur.message] ? erreur.message : "indisponible";
      const horsLigne = code === "hors_ligne";
      etat(Message({
        type: code === "trop_de_demandes" ? "attention" : "erreur",
        titre: horsLigne ? libelle.titres?.hors_ligne : libelle.titres?.indisponible,
        texte: libelle.erreurs[code],
        mode: { sceau: horsLigne ? "chantier" : "panne", compact: true },
        action: Bouton({ texte: libelle.reessayer, variante: "nu", options: { attributs: { type: "button", "data-assistant-reessayer": "" } } }),
      }));
    } finally {
      envoyer?.removeAttribute("aria-busy");
      journal.removeAttribute("aria-busy");
      champ?.focus();
    }
  };

  formulaire?.addEventListener("submit", (evenement) => {
    evenement.preventDefault();
    const contenu = String(champ?.value || "").trim();
    if (!contenu || contenu.length > longueurMax) return;
    echanges.push({ role: "visiteur", texte: contenu });
    conversation.ecrire(JSON.stringify(echanges));
    afficher();
    demander(contenu);
  });

  // « Réessayer » renvoie la même question : elle n'est jamais perdue.
  zoneEtat.addEventListener("click", (evenement) => {
    if (evenement.target.closest("[data-assistant-reessayer]") && derniere) demander(derniere);
  });

  hote.querySelectorAll("[data-modale-ouvrir=\"assistant\"]").forEach((bouton) => bouton.addEventListener("click", () => {
    requestAnimationFrame(() => champ?.focus());
  }));

  hote.querySelectorAll("[data-assistant-exemple]").forEach((bouton) => bouton.addEventListener("click", () => {
    if (!champ) return;
    champ.value = bouton.textContent.trim();
    compteur();
    champ.focus();
  }));

  hote.querySelector("[data-assistant-effacer]")?.addEventListener("click", () => {
    echanges = [];
    derniere = null;
    conversation.effacer();
    afficher();
    etat(null);
    champ?.focus();
  });
}
