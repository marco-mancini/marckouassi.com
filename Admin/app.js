/**
 * BACK-OFFICE — application. Elle choisit l'écran, branche les
 * comportements et appelle les services ; le rendu est entièrement fait
 * par les gabarits du Design System (Design_System/gabarits/Admin).
 *
 *   état (brouillon en mémoire) ──► écran (fonction pure) ──► DOM
 *        ▲                                                    │
 *        └──────────── saisie (name = chemin de la valeur) ◄──┘
 *
 * Le contenu édité a exactement la forme de content/*.json : le build
 * le lit tel quel, rien n'est converti.
 */
import { CONFIG } from "./config.js";
import { creerContexte, lire } from "../Design_System/i18n/langue.js";
import { valider, formaterErreurs, referencesMedias, DOCUMENTS } from "../Design_System/gabarits/donnees.js";
import { contextePage, rendrePage } from "../Design_System/gabarits/pages.js";
import { Gabarit_Bo } from "../Design_System/gabarits/Gabarit_Bo/Gabarit_Bo.js";
import { Connexion, BarrePublication, TableauDeBord, EcranSections, EcranProjets, EcranDocument, EcranMedias, liensAdmin } from "../Design_System/gabarits/Admin/Ecrans.js";
import { activerApparitions } from "../Design_System/composants/Apparition/Apparition.js";
import { ChampMedia, elementVide, compterATraduire, nomElement, natureMedia, libelleChamp } from "../Design_System/gabarits/Admin/Editeur.js";
import { activerModales, ouvrirModale, fermerModale } from "../Design_System/composants/Modale/Modale.js";
import { activerListe } from "../Design_System/composants/Liste/Liste.js";
import { activerSegments } from "../Design_System/composants/Segments/Segments.js";
import { activerTeleversement, TYPES_ACCEPTES } from "../Design_System/composants/Televersement/Televersement.js";
import { Message, afficherMessage } from "../Design_System/composants/Message/Message.js";
import { creerServiceDemo } from "./services/demo.js";

const TAILLE_MAX = 50 * 1024 * 1024;
const CLE_LANGUE = "mk-admin-langue";
const CLE_EDITION = "mk-admin-langue-edition";
const racine = document.getElementById("admin");

const etat = {
  langue: (() => { try { return localStorage.getItem(CLE_LANGUE) || "fr"; } catch { return "fr"; } })(),
  session: null,
  contenu: null,
  revisions: {},
  modifies: new Set(),
  publications: [],
  occupe: null,
  erreurConnexion: null,
  langueEdition: (() => { try { return localStorage.getItem(CLE_EDITION) || "fr"; } catch { return "fr"; } })(),
  signature: null,
};
let service; let dictionnaires; let ctx; let premierRendu = true;

/* ------------------------------------------------------------------ */
/* Outils                                                              */
/* ------------------------------------------------------------------ */

const json = async (adresse) => { const r = await fetch(adresse); if (!r.ok) throw new Error(adresse); return r.json(); };

function contexte() {
  ctx = creerContexte({ langue: etat.langue, langueParDefaut: "fr", dictionnaires });
  document.documentElement.lang = etat.langue;
  document.title = ctx.t("titre", { nom: etat.contenu?.site?.identite?.nom?.fr ?? etat.contenu?.site?.identite?.nom ?? "" });
}

/** Écrit une valeur à un chemin (« projets.3.titre.fr »). */
function ecrireChemin(objet, chemin, valeur) {
  const morceaux = chemin.split(".");
  const dernier = morceaux.pop();
  const parent = morceaux.reduce((courant, m) => courant[m], objet);
  parent[dernier] = valeur;
}
const parentDe = (chemin) => chemin.split(".").slice(0, -1).join(".");

/** Modèle d'un nouvel élément : un élément existant de même forme, ailleurs dans le contenu si la liste est vide. */
function modeleDe(chemin) {
  const liste = lire(etat.contenu, chemin);
  if (liste?.length) return liste[0];
  // Même liste dans un autre élément : « projets.4.medias » ~ « projets.\d+.medias ».
  const motif = new RegExp(`^${chemin.split(".").map((m) => (/^\d+$/.test(m) ? "\\d+" : m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))).join("\\.")}$`);
  let trouve;
  const parcourir = (valeur, ici) => {
    if (trouve !== undefined) return;
    if (Array.isArray(valeur)) {
      if (motif.test(ici) && valeur.length) { trouve = valeur[0]; return; }
      valeur.forEach((v, i) => parcourir(v, `${ici}.${i}`));
    } else if (valeur && typeof valeur === "object") Object.entries(valeur).forEach(([k, v]) => parcourir(v, ici ? `${ici}.${k}` : k));
  };
  parcourir(etat.contenu, "");
  return trouve ?? "";
}

function marquerModifie(chemin) {
  etat.modifies.add(chemin.split(".")[0]);
  rafraichirBarre();
}

function message(type, texte, titre = null) {
  const zone = racine.querySelector("[data-messages]");
  if (zone) afficherMessage(zone, Message({ type, texte, titre, mode: "toast" }), { type });
}

const formaterDate = (date) => new Intl.DateTimeFormat(etat.langue, { dateStyle: "long", timeStyle: "short" }).format(new Date(date));

/** Chemin lisible pour un message (« Projets › aurex › Titre »). */
function nommer(chemin) {
  return chemin.split(".").map((morceau, rang) => (rang === 0 ? ctx.t(`documents.${morceau}`) : ctx.t.existe(`champs.${morceau}`) ? libelleChamp(ctx, morceau) : morceau)).join(" › ");
}

function aTraduire() {
  return DOCUMENTS.reduce((total, cle) => total + compterATraduire(etat.contenu?.[cle]), 0);
}

const urlMedia = (src) => service.urlMedia(src) || `../${src.replace(/\.(png|jpe?g)$/i, ".webp")}`;

/* ------------------------------------------------------------------ */
/* Écrans                                                              */
/* ------------------------------------------------------------------ */

function route() {
  const [, ecran = "", detail = null] = (location.hash.replace(/^#\/?/, "/") || "/").split("/").map(decodeURIComponent);
  return { ecran: ecran || "tableau", detail };
}

/** L'écran courant : { ecran, tete, contenu }. La coquille est toujours Gabarit_Bo. */
function ecranCourant() {
  const { ecran, detail } = route();
  const c = etat.contenu;
  const document = (titre, valeur, chemin, retour = null, options = {}) => EcranDocument({ ctx, titre, valeur, chemin, retour, options: { urlMedia, langueEdition: etat.langueEdition, ...options } });
  if (ecran === "sections" && detail) {
    const rang = c.sections.findIndex((s) => s.id === detail);
    if (rang >= 0) {
      const section = c.sections[rang];
      const lien = liensAdmin({ ctx, sections: c.sections }).find((l) => l.href === `#/sections/${encodeURIComponent(section.id)}`);
      return { ecran: lien ? lien.cle : "sections", ...document(nomElement(section, rang, ctx), section, `sections.${rang}`, { texte: ctx.t("editeur.retour"), href: "#/sections" }) };
    }
  }
  if (ecran === "sections") return { ecran, ...EcranSections({ ctx, sections: c.sections }) };
  if (ecran === "projets" && detail !== null && c.projets[Number(detail)]) {
    const rang = Number(detail);
    return { ecran, ...document(nomElement(c.projets[rang], rang, ctx), c.projets[rang], `projets.${rang}`, { texte: ctx.t("projets.retour"), href: "#/projets" }, { identifiantModifiable: true }) };
  }
  if (ecran === "projets") return { ecran, ...EcranProjets({ ctx, projets: c.projets }) };
  if (ecran === "medias") return { ecran, ...EcranMedias({ ctx, contenu: c, urlMedia }) };
  if (ecran === "cv") return { ecran, ...document(ctx.t("navigation.cv"), c.cv, "cv") };
  if (ecran === "parametres") return { ecran, ...document(ctx.t("navigation.parametres"), c.site, "site") };
  return { ecran: "tableau", ...TableauDeBord({ ctx, contenu: c, publications: etat.publications, formaterDate }) };
}

function rendre({ conserver = false } = {}) {
  const ouverts = conserver ? [...racine.querySelectorAll("details[open][data-element]")].map((d) => d.dataset.element) : [];
  const defilement = conserver ? window.scrollY : 0;
  if (!etat.session) {
    const { contenu } = Connexion({ ctx, erreur: etat.erreurConnexion, enCours: etat.occupe === "connexion", signature: etat.signature });
    racine.innerHTML = String(Gabarit_Bo({ ctx, contenu, options: { variante: "accueil" } }));
    brancherConnexion();
    return;
  }
  const { ecran, tete, contenu } = ecranCourant();
  racine.innerHTML = String(Gabarit_Bo({
    ctx, ecran, tete, contenu,
    options: { liens: liensAdmin({ ctx, sections: etat.contenu.sections }), demo: service.demo, barre: BarrePublication({ ctx, modifie: etat.modifies.size > 0, occupe: etat.occupe }) },
  }));
  brancher();
  for (const chemin of ouverts) racine.querySelector(`details[data-element="${CSS.escape(chemin)}"]`)?.setAttribute("open", "");
  if (conserver) window.scrollTo(0, defilement);
  else if (!premierRendu) racine.querySelector("#contenu")?.focus({ preventScroll: true });
  premierRendu = false;
}

function rafraichirBarre() {
  const barre = racine.querySelector(".cadre-admin__barre");
  if (barre) {
    barre.innerHTML = String(BarrePublication({ ctx, modifie: etat.modifies.size > 0, occupe: etat.occupe }));
  }
}

/* ------------------------------------------------------------------ */
/* Comportements                                                       */
/* ------------------------------------------------------------------ */

function brancherConnexion() {
  const formulaire = racine.querySelector("[data-connexion]");
  formulaire?.addEventListener("submit", async (evenement) => {
    evenement.preventDefault();
    const courriel = formulaire.querySelector("#courriel").value.trim();
    const motdepasse = formulaire.querySelector("#motdepasse").value;
    etat.occupe = "connexion"; etat.erreurConnexion = null; rendre();
    try {
      etat.session = await service.connecter(courriel, motdepasse);
      etat.occupe = null;
      await chargerContenu();
      rendre();
    } catch (e) {
      etat.occupe = null;
      etat.erreurConnexion = ctx.t({ nonAdmin: "connexion.nonAdmin", identifiants: "connexion.erreur" }[e.code] || "connexion.reseau");
      rendre();
      racine.querySelector("#courriel").value = courriel;
      racine.querySelector("#motdepasse")?.focus();
    }
  });
  racine.querySelector("#courriel")?.focus();
}

/** Demande une confirmation dans la Modale « confirmation ». */
function confirmer(texte, declencheur) {
  const dialogue = racine.querySelector("#confirmation");
  dialogue.querySelector("[data-confirmation-texte]").textContent = texte;
  return new Promise((resoudre) => {
    const bouton = dialogue.querySelector("[data-confirmer]");
    const oui = () => { nettoyer(); fermerModale(dialogue); resoudre(true); };
    const non = () => { nettoyer(); resoudre(false); };
    const nettoyer = () => { bouton.removeEventListener("click", oui); dialogue.removeEventListener("close", non); };
    bouton.addEventListener("click", oui);
    dialogue.addEventListener("close", non, { once: true });
    ouvrirModale(dialogue, declencheur);
  });
}

function brancher() {
  activerModales(racine);
  activerApparitions(racine, { reduit: window.matchMedia("(prefers-reduced-motion: reduce)").matches });

  // Langue d'édition : une seule langue de saisie à la fois, préférence mémorisée.
  racine.querySelectorAll('[data-segments="langue-edition"]').forEach((groupe) => activerSegments(groupe, (langue) => {
    etat.langueEdition = langue;
    try { localStorage.setItem(CLE_EDITION, langue); } catch { /* préférence non mémorisée */ }
    racine.querySelectorAll("[data-langue-edition]").forEach((editeur) => { editeur.dataset.langueEdition = langue; });
  }));

  // Saisie : la valeur est écrite à son chemin, au fil de la frappe.
  racine.querySelectorAll("form[data-edition]").forEach((formulaire) => {
    formulaire.addEventListener("submit", (e) => e.preventDefault());
    formulaire.addEventListener("input", (evenement) => {
      const champ = evenement.target;
      if (!champ.name) return;
      const valeur = champ.type === "checkbox" ? champ.checked : champ.type === "number" ? (champ.value === "" ? null : Number(champ.value)) : champ.value;
      ecrireChemin(etat.contenu, champ.name, valeur);
      const bloc = champ.closest("[data-traduisible]");
      if (bloc) {
        const valeurs = lire(etat.contenu, bloc.dataset.traduisible);
        const manque = Boolean(valeurs.fr) && !valeurs.en;
        bloc.classList.toggle("est-a-traduire", manque);
        bloc.querySelector("[data-statut-traduction]").hidden = !manque;
      }
      marquerModifie(champ.name);
    });
  });

  // Listes du formulaire : réordonner, supprimer, ajouter.
  racine.querySelectorAll("[data-collection]").forEach((collection) => {
    const chemin = collection.dataset.collection;
    const liste = collection.querySelector(":scope > .liste-conteneur > [data-liste]");
    if (liste) {
      activerListe(liste, {
        surReordonner: (ordre) => { const avant = lire(etat.contenu, chemin); ecrireChemin(etat.contenu, chemin, ordre.map((i) => avant[Number(i)])); marquerModifie(chemin); rendre({ conserver: true }); },
        surSupprimer: async (id) => {
          const valeurs = lire(etat.contenu, chemin);
          if (!(await confirmer(ctx.t("editeur.confirmerSuppression", { nom: nomElement(valeurs[Number(id)], Number(id), ctx) }), document.activeElement))) return;
          valeurs.splice(Number(id), 1); marquerModifie(chemin); rendre({ conserver: true });
        },
      });
    }
  });
  racine.querySelectorAll("[data-ajouter]").forEach((bouton) => bouton.addEventListener("click", () => {
    const chemin = bouton.dataset.ajouter;
    const modele = modeleDe(chemin);
    lire(etat.contenu, chemin).push(elementVide(modele));
    marquerModifie(chemin);
    rendre({ conserver: true });
    const ajoute = `${chemin}.${lire(etat.contenu, chemin).length - 1}`;
    const details = racine.querySelector(`details[data-element="${CSS.escape(ajoute)}"]`);
    details?.setAttribute("open", "");
    (details || racine.querySelector(`[name^="${CSS.escape(ajoute)}"]`)?.closest(".champ, fieldset"))?.querySelector("input, textarea, select")?.focus();
  }));

  // Ordre des sections et des projets.
  for (const cle of ["sections", "projets"]) {
    const liste = racine.querySelector(`[data-ordre="${cle}"] [data-liste]`);
    if (!liste) continue;
    activerListe(liste, {
      surReordonner: (ordre) => { const avant = etat.contenu[cle]; etat.contenu[cle] = ordre.map((i) => avant[Number(i)]); marquerModifie(cle); rendre({ conserver: true }); },
      surSupprimer: async (id) => {
        const projet = etat.contenu[cle][Number(id)];
        if (!(await confirmer(ctx.t("projets.confirmerSuppression", { nom: nomElement(projet, Number(id), ctx) }), document.activeElement))) return;
        etat.contenu[cle].splice(Number(id), 1); marquerModifie(cle); rendre({ conserver: true });
      },
    });
  }
  racine.querySelector("[data-ajouter-projet]")?.addEventListener("click", () => {
    etat.contenu.projets.push({ ...elementVide(modeleDe("projets")), id: "" });
    marquerModifie("projets");
    location.hash = `#/projets/${etat.contenu.projets.length - 1}`;
  });

  // Médias : envoi, progression, remplacement.
  racine.querySelectorAll("[data-media]").forEach((champ) => brancherMedia(champ));

  // En-tête et barre.
  racine.querySelectorAll('[data-segments="langue-interface"]').forEach((groupe) => activerSegments(groupe, (langue) => {
    etat.langue = langue;
    try { localStorage.setItem(CLE_LANGUE, langue); } catch { /* préférence non mémorisée */ }
    contexte(); rendre({ conserver: true });
  }));
  racine.querySelectorAll("[data-deconnexion]").forEach((b) => b.addEventListener("click", async () => {
    await service.deconnecter(); etat.session = null; etat.contenu = null; etat.modifies.clear(); rendre();
  }));
  racine.querySelector(".cadre-admin__barre")?.addEventListener("click", (evenement) => {
    if (evenement.target.closest("[data-enregistrer]")) enregistrer();
    else if (evenement.target.closest("[data-publier]")) publier();
    else if (evenement.target.closest("[data-apercu-ouvrir]")) apercu("fr");
  });
  const groupeApercu = racine.querySelector('[data-segments="langue-apercu"]');
  if (groupeApercu) activerSegments(groupeApercu, (langue) => apercu(langue));
}

function brancherMedia(champ) {
  const chemin = champ.dataset.media;
  const etiquette = champ.dataset.etiquette;
  const redessiner = (etatMedia) => {
    const nouveau = document.createElement("template");
    nouveau.innerHTML = String(ChampMedia({ valeur: lire(etat.contenu, chemin), chemin, etiquette, ctx, options: { urlMedia }, etat: etatMedia }));
    const element = nouveau.content.firstElementChild;
    racine.querySelector(`[data-media="${CSS.escape(chemin)}"]`)?.replaceWith(element);
    brancherMedia(element);
    return element;
  };
  activerTeleversement(champ, async (fichier) => {
    const nature = natureMedia(lire(etat.contenu, chemin) || "");
    if (!TYPES_ACCEPTES[nature].includes(fichier.type)) { redessiner({ erreur: ctx.t("medias.typeRefuse") }); return; }
    if (fichier.size > TAILLE_MAX) { redessiner({ erreur: ctx.t("medias.tropLourd") }); return; }
    redessiner({ progression: 0 });
    try {
      const src = await service.televerser(fichier, (pourcentage) => {
        const barre = racine.querySelector(`[data-media="${CSS.escape(chemin)}"] progress`);
        if (barre) { barre.value = pourcentage; barre.setAttribute("aria-label", ctx.t("medias.progression", { pourcentage })); }
      });
      ecrireChemin(etat.contenu, chemin, src);
      marquerModifie(chemin);
      redessiner({ succes: ctx.t("medias.envoye") }).querySelector(".televersement__zone")?.focus?.();
    } catch {
      redessiner({ erreur: ctx.t("medias.echec") });
    }
  });
}

/* ------------------------------------------------------------------ */
/* Enregistrer, publier, aperçu                                        */
/* ------------------------------------------------------------------ */

async function enregistrer() {
  if (!etat.modifies.size || etat.occupe) return true;
  etat.occupe = "enregistrement"; rafraichirBarre();
  try {
    for (const cle of [...etat.modifies]) {
      etat.revisions[cle] = await service.enregistrer(cle, etat.contenu[cle], etat.revisions[cle] ?? null);
      etat.modifies.delete(cle);
    }
    message("succes", ctx.t("messages.enregistre"));
    return true;
  } catch (e) {
    message("erreur", ctx.t(e.code === "conflit" ? "messages.conflit" : "messages.erreurEnregistrement"));
    return false;
  } finally {
    etat.occupe = null; rafraichirBarre();
  }
}

async function publier() {
  if (etat.occupe) return;
  const erreurs = valider(etat.contenu);
  if (erreurs.length) {
    message("erreur", formaterErreurs(erreurs, ctx.t, (chemin) => nommer(chemin)).join(" · "), ctx.t("messages.invalide"));
    return;
  }
  if (!(await enregistrer())) return;
  etat.occupe = "publication"; rafraichirBarre();
  try {
    const { version } = await service.publier();
    message("succes", service.demo ? ctx.t("messages.publieDemo") : ctx.t("messages.publie", { version }));
    etat.publications = await service.publications();
  } catch {
    message("erreur", ctx.t("messages.erreurPublication"));
  } finally {
    etat.occupe = null;
    if (route().ecran === "tableau") rendre({ conserver: true }); else rafraichirBarre();
  }
}

let siteRessources;
/** Aperçu : la page d'accueil rendue par les MÊMES gabarits que le build, sans script. */
async function apercu(langue) {
  const cadre = racine.querySelector("[data-apercu]");
  if (!cadre) return;
  siteRessources ||= {
    dictionnaires: { fr: await json("../Design_System/i18n/fr.json"), en: await json("../Design_System/i18n/en.json") },
    sprite: await (await fetch("../Design_System/assets/logos-sprite.svg")).text(),
  };
  const medias = new Map(referencesMedias(etat.contenu).map((src) => [src, { src: urlMedia(src), type: natureMedia(src) === "document" ? "document" : natureMedia(src) }]));
  const page = contextePage({ site: etat.contenu.site, langue, chemin: "", dictionnaires: siteRessources.dictionnaires, medias, ressources: { sprite: siteRessources.sprite, couleurTheme: null, annee: new Date().getFullYear() } });
  const base = new URL("../", location.href).href;
  // Sans script (sandbox) : la page doit être complète sans JavaScript, c'est ce que l'aperçu montre.
  cadre.srcdoc = String(rendrePage({ contenu: etat.contenu, ctx: page, chemin: "" }))
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace("<head>", `<head><base href="${base}">`);
}

/* ------------------------------------------------------------------ */
/* Démarrage                                                           */
/* ------------------------------------------------------------------ */

async function chargerContenu() {
  const documents = await service.charger();
  const contenu = {}; let amorce = false;
  for (const cle of DOCUMENTS) {
    if (documents[cle]) { contenu[cle] = documents[cle].contenu; etat.revisions[cle] = documents[cle].revision; }
    else { contenu[cle] = await json(`amorce/${cle}.json`); etat.revisions[cle] = null; etat.modifies.add(cle); amorce = true; }
  }
  etat.contenu = contenu;
  etat.publications = await service.publications().catch(() => []);
  contexte();
  if (amorce) setTimeout(() => message("info", ctx.t("messages.amorce")), 0);
}

async function demarrer() {
  dictionnaires = { fr: await json("../Design_System/i18n/admin.fr.json"), en: await json("../Design_System/i18n/admin.en.json") };
  // Signature de l'écran de connexion : celle du site (contenu existant), jamais un texte du back-office.
  try {
    const signature = (await json("amorce/site.json")).intro?.signature;
    if (signature) etat.signature = Object.fromEntries(Object.entries(signature).map(([cle, v]) => [cle, v?.[etat.langue] || v?.fr || v]));
  } catch { /* sans signature, le titre de connexion suffit */ }
  contexte();
  document.documentElement.classList.add("js-anime");
  // La démonstration n'est jamais un repli silencieux : seul le build la demande (ADMIN_DEMO=1).
  if (CONFIG.demo) service = creerServiceDemo();
  else if (CONFIG.supabaseUrl && CONFIG.supabaseClePublique && window.supabase) service = (await import("./services/supabase.js")).creerServiceSupabase({ url: CONFIG.supabaseUrl, clePublique: CONFIG.supabaseClePublique });
  else { racine.innerHTML = String(Gabarit_Bo({ ctx, contenu: Message({ type: "attention", texte: ctx.t("nonConfigure") }), options: { variante: "accueil" } })); return; }
  try {
    etat.session = await service.session();
    if (etat.session) await chargerContenu();
  } catch {
    racine.innerHTML = String(Gabarit_Bo({ ctx, contenu: Message({ type: "erreur", texte: ctx.t("messages.chargementImpossible") }), options: { variante: "accueil" } }));
    return;
  }
  rendre();
  window.addEventListener("hashchange", () => rendre());
  window.addEventListener("beforeunload", (evenement) => {
    if (etat.modifies.size) { evenement.preventDefault(); evenement.returnValue = ctx.t("messages.quitter"); }
  });
}

demarrer();
