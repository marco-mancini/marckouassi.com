import { html, attributs } from "../../fondations/rendu.js";
import { Modale, ouvrirModale, fermerModale } from "../../composants/Modale/Modale.js";
import { Sceau, construireSceau } from "../../composants/Sceau/Sceau.js";
import { Segments, activerSegments } from "../../composants/Segments/Segments.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Sequence, jouerSequence, preparerSequence } from "./Sequence.js";

/**
 * Intro — expérience d'entrée, par assemblage :
 *   1. le sceau, seul, grand et centré, qui se construit (Sceau, anime : "construction")
 *   2. en haut, le choix FR/EN (Segments, boutons) traduit l'accueil sur place ;
 *      en bas, « Entrer » et sa flèche animée entrent dans la langue choisie
 *   3. la séquence d'ouverture (Sequence.js) : le sceau se désintègre et construit
 *      l'animation, qui se termine sur la couverture (page 1)
 *
 * Tout est rendu dans des <template> : sans JavaScript l'accueil n'existe
 * pas, et le portfolio (déjà dans le HTML) s'affiche directement.
 *
 * @param {object} p
 * @param {object} p.intro        contenu : { active, frequence }
 * @param {object} p.ctx          contexte de langue (t, c, l)
 * @param {Array} p.langues       options du sélecteur de langue
 * @param {object} [p.contenu]    contenu complet, pour la séquence (couverture, catégories, réalisations)
 */
export function Intro({ intro, ctx, langues, contenu = null }) {
  if (!intro?.active) return "";
  const { t } = ctx;
  // Textes de l'accueil dans chaque langue : le choix FR/EN les bascule sur place, sans recharger.
  const traductions = (cle) => Object.fromEntries(langues.map((langue) => [`data-texte-${langue.lang}`, lireTexte(ctx.dictionnaires?.[langue.lang], cle) ?? t(cle)]));
  const pages = Object.fromEntries(langues.map((langue) => [`data-page-${langue.lang}`, langue.href]));
  const scene = html`<div class="intro__scene"${attributs({ tabindex: "-1", autofocus: true, ...traductions("intro.passer") })}>
<div class="intro__etape intro__langues" data-etape="langue"${attributs(traductions("langue.selecteur"))}>${Segments({ options: langues.map((langue) => ({ libelle: langue.libelle, nom: langue.nom, valeur: langue.lang, actif: langue.actif })), etiquette: t("langue.selecteur"), mode: "boutons", cle: "intro-langue" })}</div>
<div class="intro__etape intro__etape--ouverture" data-etape="ouverture"${attributs(traductions("intro.etiquette"))}>${Sceau({ taille: "grand", anime: "construction" })}</div>
<div class="intro__etape intro__entree" data-etape="entree">${Bouton({ texte: t("intro.entrer"), variante: "nu", options: { icone: "bas", taille: "grand", attributs: { "data-intro-entrer": true, ...pages, ...traductions("intro.entrer") } } })}</div>
</div>`;
  return html`<template id="intro-modele"${attributs({ "data-frequence": intro.frequence || "session" })}>${Modale({
    id: "intro", etiquette: t("intro.etiquette"), contenu: scene,
    options: { variante: "plein-ecran", libelleFermer: t("intro.passer"), fermeture: "texte" },
  })}</template>${contenu ? Sequence({ contenu, ctx }) : ""}`;
}

/* ------------------------------------------------------------------ */
/* Orchestration — navigateur uniquement.                              */
/* ------------------------------------------------------------------ */

const CLE = "mk-intro-vue";
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
/** Durée d'un jeton de mouvement (« 1.6s », « 400ms ») en millisecondes. */
const dureeJeton = (nom, repli) => {
  const valeur = getComputedStyle(document.documentElement).getPropertyValue(nom).trim();
  const nombre = parseFloat(valeur);
  return Number.isFinite(nombre) ? (valeur.endsWith("ms") ? nombre : nombre * 1000) : repli;
};

function dejaVue(frequence) {
  try {
    if (frequence === "toujours") return false;
    const stockage = frequence === "une-fois" ? localStorage : sessionStorage;
    return stockage.getItem(CLE) === "1";
  } catch { return false; }
}
function memoriser(frequence) {
  try { (frequence === "une-fois" ? localStorage : sessionStorage).setItem(CLE, "1"); } catch { /* stockage indisponible : l'accueil rejouera */ }
}

/** Texte d'un dictionnaire par sa clé pointée (« intro.entrer »), ou undefined. */
function lireTexte(dictionnaire, cle) {
  const valeur = cle.split(".").reduce((noeud, partie) => noeud?.[partie], dictionnaire);
  return typeof valeur === "string" ? valeur : undefined;
}

/** Arrivée par l'autre langue : la séquence se joue sur la page d'arrivée. */
const CLE_SEQUENCE = "mk-intro-sequence";
const lireSequence = () => { try { const v = sessionStorage.getItem(CLE_SEQUENCE); sessionStorage.removeItem(CLE_SEQUENCE); return v === "1"; } catch { return false; } };
const promettreSequence = () => { try { sessionStorage.setItem(CLE_SEQUENCE, "1"); } catch { /* stockage indisponible : la page d'arrivée s'ouvre sans séquence */ } };

/**
 * Lance l'accueil s'il existe et n'a pas encore été vu.
 * Réduction des animations : ni construction ni séquence ; le choix de langue ferme l'accueil.
 * « Passer » et Échap ferment à tout moment.
 */
export async function lancerIntro({ reduit = false } = {}) {
  const modele = document.getElementById("intro-modele");
  if (!modele) return;
  const frequence = modele.dataset.frequence;
  if (dejaVue(frequence)) {
    // Arrivée depuis l'autre langue : la séquence reprend ici, sans repasser par l'accueil.
    if (lireSequence() && !reduit) await jouerSequence();
    return;
  }

  document.body.append(modele.content.cloneNode(true));
  const dialogue = document.getElementById("intro");
  const etape = (nom) => dialogue.querySelector(`[data-etape="${nom}"]`);
  const montrer = (nom) => etape(nom)?.classList.add("est-active");
  let terminee = false;
  // Les visuels de la séquence se chargent pendant que le sceau se construit.
  if (!reduit) preparerSequence();

  let enSequence = false;
  dialogue.addEventListener("close", () => {
    terminee = true;
    memoriser(frequence);
    dialogue.remove();
    // Pendant la séquence, le focus reste sur son bouton « Passer » ; elle le rendra au contenu.
    if (!enSequence) document.getElementById("contenu")?.focus({ preventScroll: true });
  });

  // Le choix FR/EN traduit l'accueil sur place ; « Entrer » entre dans la langue choisie.
  const langueDePage = document.documentElement.lang;
  let langueChoisie = langueDePage;
  const entrer = dialogue.querySelector("[data-intro-entrer]");
  const passer = dialogue.querySelector("[data-modale-fermer]");
  const groupe = dialogue.querySelector("[data-segments]");
  const traduire = (langue) => {
    const texte = (element) => element?.getAttribute(`data-texte-${langue}`);
    entrer.querySelector(".bouton__texte").textContent = texte(entrer);
    entrer.setAttribute("lang", langue);
    groupe.setAttribute("aria-label", texte(etape("langue")));
    passer.querySelector(".bouton__texte").textContent = texte(dialogue.querySelector(".intro__scene"));
    dialogue.setAttribute("aria-label", texte(etape("ouverture")));
  };
  activerSegments(groupe, (langue) => { langueChoisie = langue; traduire(langue); });
  entrer.addEventListener("click", () => {
    memoriser(frequence);
    if (langueChoisie === langueDePage) { dialogue.dispatchEvent(new Event("intro-continuer")); return; }
    // L'autre langue est une autre page : la séquence s'y jouera à l'arrivée.
    if (!reduit) promettreSequence();
    window.location.href = entrer.getAttribute(`data-page-${langueChoisie}`);
  });
  const choix = new Promise((resoudre) => dialogue.addEventListener("intro-continuer", resoudre, { once: true }));

  ouvrirModale(dialogue);
  montrer("ouverture");
  if (!reduit) {
    // Le sceau se construit forme par forme : l'étape dure le temps de la construction.
    construireSceau(etape("ouverture").querySelector(".sceau"));
    await pause(dureeJeton("--construction-duree-totale", 3000));
    if (terminee) return;
  }
  montrer("langue");
  montrer("entree");
  // Pas de focus forcé : il afficherait un anneau sans geste au clavier. L'ordre de tabulation
  // reste naturel : « Passer », FR/EN, puis « Entrer ».
  await choix;
  if (terminee) return;
  if (reduit) return fermerModale(dialogue);

  // Le sceau de l'accueil, relevé au pixel : la séquence repart exactement de lui.
  const sceau = etape("ouverture").querySelector(".sceau");
  // Un appareil lent peut n'avoir pas fini l'affinage : on l'achève, le relais part de l'état final exact.
  sceau.getAnimations?.({ subtree: true }).forEach((animation) => animation.finish());
  const depart = { rect: sceau.getBoundingClientRect(), dessin: sceau.querySelector("svg").getBoundingClientRect(), clone: sceau.cloneNode(true), fond: getComputedStyle(dialogue).backgroundColor };
  enSequence = true;
  // Fermer d'abord : le navigateur rend alors le focus à la page, puis la séquence le prend
  // pour « Passer ». Les deux se font dans la même tâche : aucune image intermédiaire.
  dialogue.close();
  await jouerSequence({ depart, son: true });
}
