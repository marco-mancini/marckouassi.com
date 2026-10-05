import { html, attributs, classes } from "../../fondations/rendu.js";
import { Modale } from "../../composants/Modale/Modale.js";
import { Conversation } from "../../composants/Conversation/Conversation.js";
import { Saisie } from "../../composants/Saisie/Saisie.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";

/** Longueur maximale d'une question, alignée sur la validation du Worker. */
export const LONGUEUR_MAX = 500;

/** Nombre de barreaux de l'onde. Le rang porte le décalage d'animation. */
const BARREAUX_ONDE = 5;

/**
 * États de MarcoS, ceux de la maquette d'interaction et de MARCOS.md §4.
 *
 * Ce sont SEPT états d'exécution, pas dix. Les dix fichiers de
 * `Public/Avatar_MarcoS/` sont une bibliothèque d'expressions : plusieurs
 * états peuvent partager une image, et trois expressions ne servent à aucun
 * état aujourd'hui (MARCOS_AVATAR_EXPRESSIONS.md §7).
 */
export const ETATS = ["rest", "hover", "open", "listening", "thinking", "responding", "end"];

/** État de départ, et repli quand le contenu ne déclare pas d'image. */
export const ETAT_REPOS = "rest";

/**
 * Les états qui n'existent que panneau ouvert. `end` en fait partie : il ferme
 * un échange, il ne ferme pas la conversation.
 *
 * LA MAQUETTE A ICI UN DÉFAUT, et nous ne le reproduisons pas. Son calcul
 * `ouvert = (open|listening|thinking|responding)` laisse `end` hors de la
 * liste : le panneau se refermait donc à la seconde où la réponse finissait de
 * s'écrire, avant que le visiteur ait pu la lire, et le retour à `open` prévu
 * 1,4 s plus tard ne se déclenchait jamais puisqu'il se garde sur `ouvert`.
 * Ici `data-ouvert` suit l'attribut `open` du <dialog>, source unique : la
 * question ne se pose plus.
 */
export const ETATS_OUVERTS = new Set(["open", "listening", "thinking", "responding", "end"]);

/**
 * Délais repris de la maquette, en millisecondes : la durée de l'état « end »
 * avant le retour au panneau ouvert, et le pas de la frappe progressive.
 */
export const DELAIS = { fin: 1400, frappe: 18 };

/** En dessous de ce nombre de caractères restants, le compteur alerte. */
export const SEUIL_COMPTEUR = 30;

/** Points de la bulle de réflexion. Le rang porte le décalage d'animation. */
const POINTS_REFLEXION = 3;

/** Un texte traduisible est vide quand aucune langue n'est renseignée. */
const renseigne = (valeur) => Boolean(valeur && Object.values(valeur).some((v) => String(v ?? "").trim()));

/**
 * Libellés dont le comportement a besoin dans le navigateur, où `ctx` n'existe
 * plus. Ils voyagent dans un attribut `data-`, comme `data-frequence` d'Intro
 * et `data-compteur` de Projet_etude : aucun texte n'est écrit dans le script.
 */
function libelles(t) {
  const erreurs = {};
  for (const code of ["requete_invalide", "origine_refusee", "trop_long", "trop_de_demandes", "quota_journalier", "indisponible", "delai_depasse", "hors_ligne"]) {
    erreurs[code] = t(`erreurs.${code}`);
  }
  return { vous: t("vous"), assistant: t("assistant"), etiquette: t("etiquette"), reessayer: t("reessayer"), erreurs };
}

/**
 * Les expressions du buste, une balise par état déclaré dans le contenu.
 *
 * Une seule image est chargée au premier affichage : celle du repos. Les autres
 * portent `hidden`, donc le navigateur ne les demande qu'au moment où un état
 * les révèle (MARCOS_AVATAR_UI §12).
 */
function expressions({ assistant, ctx }) {
  const declares = (assistant.avatar?.etats || []).filter((e) => e?.src && ETATS.includes(e.etat));
  const balises = declares.map(({ etat, src }) => {
    const media = ctx.media(src);
    if (!media.src) return "";
    const repos = etat === ETAT_REPOS;
    return html`<img class="avimg"${attributs({
      src: media.src, alt: "", width: media.largeur || null, height: media.hauteur || null,
      "data-expression": etat, loading: repos ? "eager" : "lazy", decoding: "async",
      fetchpriority: repos ? "high" : null, hidden: repos ? null : true,
    })}>`;
  });
  return balises.some(Boolean) ? balises : null;
}

/**
 * Assistant — MarcoS tel que la maquette d'interaction le décrit : une présence
 * flottante en bas à droite, et un panneau de conversation posé au-dessus.
 *
 * LA STRUCTURE EN DEUX SOCLES, et pourquoi. Le buste est `position: absolute`
 * et `bottom: 100 %` de son socle : il est donc POSÉ sur le porteur, jamais
 * devant ni derrière lui. Or le porteur change — la barre quand c'est fermé, le
 * panneau quand c'est ouvert. Il faut donc un buste par socle, et un seul des
 * deux est visible à la fois. Un buste unique qu'on déplacerait devrait changer
 * de parent en cours d'animation.
 *
 * Ne rend rien sans adresse d'endpoint ni si `assistant.active` est faux : tant
 * que Marc n'a pas écrit l'accueil dans Paramètres, MarcoS n'existe pas pour le
 * visiteur (D-9, AI_UX.md).
 *
 * @param {object} p
 * @param {{active:boolean,accueil:object,exemples:Array<object>,confidentialite:object,avatar?:{etats:Array<{etat:string,src:string}>}}} p.assistant
 * @param {object} p.ctx
 * @param {string|null} p.endpoint
 */
export function Assistant({ assistant, ctx, endpoint }) {
  if (!assistant?.active || !endpoint) return "";
  const t = (cle, variables) => ctx.t(`assistant.${cle}`, variables);

  // Un exemple vide ne devient pas un bouton sans fonction : le CMS laisse
  // ajouter une ligne avant de la remplir.
  const exemples = (assistant.exemples || []).map((exemple, rang) => ({ exemple, rang })).filter(({ exemple }) => renseigne(exemple));

  const buste = expressions({ assistant, ctx });
  const socleBuste = buste ? html`<span class="av" aria-hidden="true">${buste}</span>` : "";

  const onde = html`<span class="onde" aria-hidden="true">${Array.from({ length: BARREAUX_ONDE }, (_, rang) => html`<i${attributs({ style: `--rang: ${rang}` })}></i>`)}</span>`;

  // L'accueil et ses suggestions vivent DANS le fil, comme premier tour de
  // MarcoS : la maquette les montre dans la bulle d'accueil, pas au-dessus.
  const accueil = html`<div class="${classes("bulle", "lui")}" data-assistant-accueil>
    <p class="bulle__texte">${ctx.c(assistant.accueil, "site.assistant.accueil")}</p>
    ${exemples.length ? html`<div class="exemples" data-assistant-exemples>${exemples.map(({ exemple, rang }) => Bouton({
      texte: ctx.l(exemple, `site.assistant.exemples.${rang}`),
      variante: "filet",
      // Le rang porte le retard de la cascade : les suggestions se posent
      // l'une apres l'autre, elles n'apparaissent pas en bloc.
      options: { attributs: { type: "button", "data-assistant-exemple": "", style: `--rang: ${rang}` } },
    }))}</div>` : ""}
  </div>`;

  const entete = html`<span class="pan-tete__identite">
    <span class="nom">${t("assistant")}</span>
    <span class="role">${t("role")}</span>
  </span>`;

  const contenu = html`<div class="assistant" data-assistant${attributs({
    "data-endpoint": endpoint, "data-longueur-max": String(LONGUEUR_MAX), "data-libelles": JSON.stringify(libelles(t)),
  })}>
    <div class="zone-fil">
      <div class="fil" data-assistant-log>${accueil}${Conversation({ echanges: [], etiquette: t("etiquette"), libelles: { visiteur: t("vous"), assistant: t("assistant") }, vide: "" })}</div>
      ${Bouton({ texte: t("nouvelle"), variante: "principal", options: { icone: "bas", attributs: { type: "button", class: "neuf", "data-assistant-neuf": "", "data-on": "0" } } })}
    </div>
    <div class="erreur" data-assistant-erreur role="alert"></div>
    <div class="saisie">
      <label class="visually-hidden" for="assistant-question">${t("question")}</label>
      ${Saisie({ id: "assistant-question", type: "texte", options: { nom: "question", etat: { aide: true }, invite: t("placeholder") } })}
      <span class="compteur" data-assistant-compteur aria-hidden="true" data-limite="0">${String(LONGUEUR_MAX)}</span>
      <span class="visually-hidden" id="assistant-question-aide" data-assistant-aide aria-live="polite">${t("aide", { n: LONGUEUR_MAX })}</span>
      ${Bouton({ texte: t("envoyer"), variante: "principal", forme: "rond", options: { icone: "fleche", iconeSeule: true, attributs: { type: "button", class: "env", "data-assistant-envoyer": "" } } })}
    </div>
    ${renseigne(assistant.confidentialite) ? html`<p class="confid">${ctx.c(assistant.confidentialite, "site.assistant.confidentialite")}</p>` : ""}
  </div>`;

  const panneau = Modale({
    id: "assistant",
    etiquette: t("etiquette"),
    entete,
    contenu,
    // Non modale : le portfolio reste parcourable pendant la conversation,
    // exactement ce que la maquette décrit (aria-modal="false").
    options: { variante: "ancre", libelleFermer: t("fermer"), modal: false, iconeFermer: "croix" },
  });

  return html`<div class="marcos" data-marcos${attributs({ "data-etat": ETAT_REPOS, "data-ouvert": "0", "data-erreur": "0" })}>
    <div class="${classes("socle", "socle-panneau")}">${socleBuste}${panneau}</div>
    <div class="${classes("socle", "socle-barre")}">${socleBuste}<nav class="barre"${attributs({ "aria-label": t("assistant") })}>
      ${Bouton({ texte: t("ouvrir"), variante: "nu", forme: "rond", options: { icone: "bulle", iconeSeule: true, attributs: { type: "button", "data-modale-ouvrir": "assistant", "aria-haspopup": "dialog", "aria-expanded": "false", "aria-controls": "assistant" } } })}
      <span class="sep" aria-hidden="true"></span>
      <span class="activite"${attributs({ role: "img", "aria-label": t("activite") })}>${onde}</span>
      <span class="sep" aria-hidden="true"></span>
      ${Bouton({ texte: t("effacer"), variante: "nu", forme: "rond", options: { icone: "corbeille", iconeSeule: true, attributs: { type: "button", "data-assistant-effacer": "" } } })}
    </nav></div>
  </div>`;
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

/**
 * Pilote d'état : un seul `data-etat`, sur `.marcos`, lu par le buste, par la
 * barre et par le panneau. Il n'existe pas un second système d'état, et aucune
 * animation ne tourne sans rapport avec l'état réel.
 */
export function pilote(racine) {
  if (!racine) return { poser: () => {}, etat: () => null, ouvert: () => false, arreter: () => {}, plusTard: () => {} };
  // Deux socles, donc DEUX images par expression. Une Map « nom → image »
  // n'en gardait qu'une, et le buste de la barre ne changeait jamais.
  const images = new Map();
  for (const img of racine.querySelectorAll("[data-expression]")) {
    const liste = images.get(img.dataset.expression) ?? [];
    liste.push(img);
    images.set(img.dataset.expression, liste);
  }
  let minuteries = [];

  const arreter = () => { minuteries.forEach(clearTimeout); minuteries = []; };
  const plusTard = (fn, ms) => { minuteries.push(setTimeout(fn, ms)); };

  const montrer = (etat) => {
    // Plusieurs états partagent une expression, et un état sans image garde
    // celle du repos : MarcoS ne disparaît jamais. C'est le cas de `hover`,
    // où la maquette soulève le buste sans en changer.
    const visibles = new Set(images.get(etat) ?? images.get(ETAT_REPOS) ?? []);
    for (const [, liste] of images) for (const img of liste) img.hidden = !visibles.has(img);
  };

  const poser = (etat, { puis = null, delai = 0 } = {}) => {
    if (!ETATS.includes(etat)) return;
    racine.dataset.etat = etat;
    montrer(etat);
    // Une suite programmée est annulable : un nouvel état posé entre-temps
    // l'emporte, et la file ne s'empile pas.
    if (puis && delai > 0) plusTard(() => poser(puis), delai);
  };

  montrer(racine.dataset.etat || ETAT_REPOS);
  return { poser, arreter, plusTard, etat: () => racine.dataset.etat, ouvert: () => racine.dataset.ouvert === "1" };
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

  const marcos = racine.querySelector("[data-marcos]");
  const panneau = racine.querySelector("#assistant");
  const pilotage = pilote(marcos);

  const fil = hote.querySelector("[data-assistant-log]");
  const accueil = fil.querySelector("[data-assistant-accueil]");
  const zoneErreur = hote.querySelector("[data-assistant-erreur]");
  const champ = hote.querySelector("#assistant-question");
  const compteur = hote.querySelector("[data-assistant-compteur]");
  // Le chiffre nu de la maquette ne dit rien a un lecteur d'ecran : la phrase
  // complete du dictionnaire l'accompagne, invisible et annoncee poliment.
  const aide = hote.querySelector("[data-assistant-aide]");
  const modeleAide = aide?.textContent ?? "";
  const neuf = hote.querySelector("[data-assistant-neuf]");
  const envoyer = hote.querySelector("[data-assistant-envoyer]");
  const effacer = panneau?.querySelector("[data-assistant-effacer]") ?? racine.querySelector("[data-assistant-effacer]");
  const ouvrir = racine.querySelector('[data-modale-ouvrir="assistant"]');
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

  /* ------------------------------------------------------------------ */
  /* Défilement du fil : le visiteur garde la main.                      */
  /* ------------------------------------------------------------------ */

  const enBas = () => fil.scrollHeight - fil.scrollTop - fil.clientHeight < 40;
  const versLeBas = () => { fil.scrollTop = fil.scrollHeight; if (neuf) neuf.dataset.on = "0"; };
  // Si le visiteur a remonté le fil pour relire, on ne le ramène pas de force :
  // on lui signale la nouveauté par un bouton, qu'il prend ou non.
  const suivre = () => { if (enBas()) versLeBas(); else if (neuf) neuf.dataset.on = "1"; };
  fil.addEventListener("scroll", () => { if (enBas() && neuf) neuf.dataset.on = "0"; });
  neuf?.addEventListener("click", versLeBas);

  /* ------------------------------------------------------------------ */
  /* Rendu.                                                              */
  /* ------------------------------------------------------------------ */

  const journalCourant = () => fil.querySelector(".conversation");

  const afficher = () => {
    journalCourant().outerHTML = String(Conversation({
      echanges,
      etiquette: libelle.etiquette,
      libelles: { visiteur: libelle.vous, assistant: libelle.assistant },
      vide: "",
    }));
    // L'accueil tient la place du vide : il s'efface dès le premier échange.
    if (accueil) accueil.hidden = echanges.length > 0;
    // « Effacer » n'a rien à effacer tant que rien n'a été dit. Il est
    // DÉSACTIVÉ, pas masqué : la barre garde ses trois emplacements, comme
    // dans la maquette, et une commande indisponible n'est pas un bouton mort
    // (§6.8) — elle le dit.
    if (effacer) effacer.disabled = echanges.length === 0;
    suivre();
  };

  const majCompteur = () => {
    const reste = longueurMax - (champ?.value.length || 0);
    if (compteur) {
      compteur.textContent = String(reste);
      compteur.dataset.limite = reste <= SEUIL_COMPTEUR ? "1" : "0";
    }
    // Le modele vient du dictionnaire : on n'y remplace que le nombre.
    if (aide && modeleAide) aide.textContent = modeleAide.replace(/\d+/, String(reste));
  };

  const erreur = (code) => {
    marcos.dataset.erreur = code ? "1" : "0";
    zoneErreur.textContent = code ? libelle.erreurs[code] : "";
    if (!code) return;
    // « Réessayer » renvoie la MÊME question : elle n'est jamais perdue.
    zoneErreur.insertAdjacentHTML("beforeend", String(Bouton({
      texte: libelle.reessayer, variante: "nu",
      options: { attributs: { type: "button", "data-assistant-reessayer": "" } },
    })));
  };

  afficher();
  majCompteur();

  /* ------------------------------------------------------------------ */
  /* Réponse : apparition progressive, coupée en mouvement réduit.       */
  /* ------------------------------------------------------------------ */

  const sansMouvement = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Bulle de réflexion : trois points qui tiennent la place de la réponse
   * pendant que MarcoS cherche. Elle n'entre jamais dans `echanges` — ce n'est
   * pas un tour de conversation, c'est une attente.
   */
  const reflexion = {
    poser() {
      if (fil.querySelector("[data-assistant-pense]")) return;
      const bulle = document.createElement("div");
      bulle.classList.add("bulle", "lui", "pense");
      bulle.dataset.assistantPense = "";
      const points = document.createElement("span");
      points.classList.add("points");
      for (let i = 0; i < POINTS_REFLEXION; i += 1) points.append(document.createElement("i"));
      bulle.append(points);
      fil.append(bulle);
      suivre();
    },
    retirer() { fil.querySelector("[data-assistant-pense]")?.remove(); },
  };

  const ecrireProgressivement = (echange) => new Promise((termine) => {
    const poser = () => { echanges[echanges.length - 1] = echange; afficher(); termine(); };
    echanges.push({ ...echange, texte: "", liens: [] });
    afficher();
    const cible = fil.querySelector(".conversation__tour:last-child .conversation__texte");
    if (!cible || sansMouvement()) return poser();
    // Le curseur suit la frappe : c'est lui qui donne l'impression que MarcoS
    // écrit, plutôt qu'un texte qui s'allonge tout seul.
    const curseur = document.createElement("span");
    curseur.className = "curseur";
    let i = 0;
    const frappe = () => {
      if (i > echange.texte.length) { curseur.remove(); return poser(); }
      cible.textContent = echange.texte.slice(0, i);
      cible.append(curseur);
      i += 1;
      suivre();
      pilotage.plusTard(frappe, DELAIS.frappe);
    };
    frappe();
  });

  /* ------------------------------------------------------------------ */
  /* Le vrai pipeline : endpoint, session, historique, erreurs.          */
  /* ------------------------------------------------------------------ */

  const occupe = (actif) => {
    const noeud = journalCourant();
    if (actif) noeud?.setAttribute("aria-busy", "true"); else noeud?.removeAttribute("aria-busy");
    if (envoyer) envoyer.disabled = actif;
  };

  const demander = async (contenu) => {
    derniere = contenu;
    erreur(null);
    pilotage.poser("thinking");
    reflexion.poser();
    occupe(true);
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
      if (!reponse.ok) throw new Error(corps.erreur || "indisponible");
      pilotage.poser("responding");
      reflexion.retirer();
      // Un lien doit avoir une adresse interne ET de quoi se nommer : sans nom
      // accessible il s'afficherait comme une ancre vide.
      const liens = (corps.liens || []).filter((lien) => String(lien.href || "").startsWith("/") && (lien.libelle || lien.id));
      await ecrireProgressivement({ role: "assistant", texte: corps.texte, liens });
      conversation.ecrire(JSON.stringify(echanges));
      // Fin, puis retour au panneau ouvert : MarcoS ne s'éteint pas d'un coup.
      pilotage.poser("end", { puis: "open", delai: DELAIS.fin });
    } catch (cause) {
      const code = libelle.erreurs?.[cause.message] ? cause.message : "indisponible";
      reflexion.retirer();
      erreur(code);
      pilotage.poser("open");
    } finally {
      occupe(false);
      champ?.focus({ preventScroll: true });
    }
  };

  const poser = () => {
    const contenu = String(champ?.value || "").trim();
    if (!contenu || contenu.length > longueurMax) return;
    pilotage.arreter();
    pilotage.poser("listening");
    // La pulsation accompagne le depart : on la retire a la fin de l'animation
    // pour qu'elle puisse etre rejouee a la question suivante.
    envoyer?.classList.remove("part");
    requestAnimationFrame(() => envoyer?.classList.add("part"));
    envoyer?.addEventListener("animationend", () => envoyer.classList.remove("part"), { once: true });
    echanges.push({ role: "visiteur", texte: contenu });
    conversation.ecrire(JSON.stringify(echanges));
    if (champ) { champ.value = ""; majCompteur(); }
    afficher();
    demander(contenu);
  };

  /* ------------------------------------------------------------------ */
  /* Interactions.                                                       */
  /* ------------------------------------------------------------------ */

  envoyer?.addEventListener("click", poser);
  champ?.addEventListener("keydown", (evenement) => {
    if (evenement.key === "Enter") { evenement.preventDefault(); poser(); }
  });
  champ?.addEventListener("input", () => {
    majCompteur();
    // L'écoute ne l'emporte jamais sur la réflexion ni sur la réponse : l'état
    // réel bat la frappe.
    if (pilotage.etat() === "open" && champ.value.length > 0) pilotage.poser("listening");
    if (pilotage.etat() === "listening" && champ.value.length === 0) pilotage.poser("open");
  });

  zoneErreur.addEventListener("click", (evenement) => {
    if (evenement.target.closest("[data-assistant-reessayer]") && derniere) demander(derniere);
  });

  hote.addEventListener("click", (evenement) => {
    const exemple = evenement.target.closest("[data-assistant-exemple]");
    if (!exemple || !champ) return;
    champ.value = exemple.textContent.trim();
    majCompteur();
    champ.focus();
  });

  effacer?.addEventListener("click", () => {
    pilotage.arreter();
    echanges = [];
    derniere = null;
    conversation.effacer();
    erreur(null);
    afficher();
    pilotage.poser(pilotage.ouvert() ? "open" : ETAT_REPOS);
    versLeBas();
    champ?.focus();
  });

  // Survol : micro-réaction, et seulement depuis le repos. Aucune ouverture
  // automatique, jamais.
  marcos?.addEventListener("pointerenter", () => { if (pilotage.etat() === ETAT_REPOS) pilotage.poser("hover"); });
  marcos?.addEventListener("pointerleave", () => { if (pilotage.etat() === "hover") pilotage.poser(ETAT_REPOS); });

  // Ouverture et fermeture : le panneau est un <dialog>, et `open` est un
  // attribut, donc observable. Un seul chemin mène à l'état, quel que soit le
  // bouton — entrée, croix, Échap.
  if (panneau) {
    const ouverture = () => {
      pilotage.arreter();
      marcos.dataset.ouvert = "1";
      pilotage.poser("open");
      versLeBas();
      champ?.focus({ preventScroll: true });
    };
    const fermeture = () => {
      pilotage.arreter();
      marcos.dataset.ouvert = "0";
      pilotage.poser(ETAT_REPOS);
    };
    new MutationObserver(() => { if (panneau.open) ouverture(); else fermeture(); })
      .observe(panneau, { attributes: true, attributeFilter: ["open"] });
    if (panneau.open) ouverture();
  }

  // L'entrée bascule : un second clic referme, comme dans la maquette, plutôt
  // que de rouvrir un panneau déjà ouvert. En capture, avant la délégation.
  ouvrir?.addEventListener("click", (evenement) => {
    if (!panneau?.open) return;
    evenement.preventDefault();
    evenement.stopPropagation();
    panneau.close();
  }, true);
}
