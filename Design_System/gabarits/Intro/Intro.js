import { html, attributs, classes } from "../../fondations/rendu.js";
import { Modale, ouvrirModale, fermerModale } from "../../composants/Modale/Modale.js";
import { Sceau } from "../../composants/Sceau/Sceau.js";
import { Signature } from "../../composants/Signature/Signature.js";
import { Segments } from "../../composants/Segments/Segments.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { TexteProgressif, ecrire } from "../../composants/TexteProgressif/TexteProgressif.js";
import { attributsApparition, reveler } from "../../composants/Apparition/Apparition.js";

const DIRECTIONS = ["gauche", "droite", "haut", "bas"];

/**
 * Intro — expérience d'entrée, par assemblage :
 *   1. Sceau animé            4. choix FR/EN (Segments en liens)
 *   2. bienvenue : Signature  5. TexteProgressif
 *   3. Apparition             6. apparitions multidirectionnelles
 *                             7. rideau, puis navigation normale
 *
 * Tout est rendu dans un <template> : sans JavaScript l'accueil n'existe
 * pas, et le portfolio (déjà dans le HTML) s'affiche directement.
 *
 * @param {object} p
 * @param {object} p.intro        contenu : { active, frequence, signature, transition, mots }
 * @param {object} p.ctx          contexte de langue (t, c, l)
 * @param {Array} p.langues       options du sélecteur de langue
 */
export function Intro({ intro, ctx, langues }) {
  if (!intro?.active) return "";
  const { t, c } = ctx;
  const contenu = html`<div class="intro__scene">
<div class="intro__etape intro__etape--ouverture" data-etape="ouverture">${Sceau({ taille: "grand", anime: true })}</div>
<div class="${classes("intro__etape")}" data-etape="bienvenue"${attributs(attributsApparition({ direction: "fondu", declenchement: "etape" }))}>${Signature({ niveau: 2, echelle: "section", textes: { salutation: c(intro.signature.salutation, "site.intro.signature.salutation"), accent: c(intro.signature.accent, "site.intro.signature.accent"), mot: c(intro.signature.mot, "site.intro.signature.mot") } })}</div>
<div class="intro__etape" data-etape="langue"><p class="intro__invite">${t("intro.choisirLangue")}</p>${Segments({ options: langues, etiquette: t("langue.selecteur") })}${Bouton({ texte: t("intro.entrer"), variante: "principal", options: { attributs: { "data-intro-continuer": true } } })}</div>
<div class="intro__etape" data-etape="transition">${TexteProgressif({ texte: c(intro.transition, "site.intro.transition"), lang: ctx.langDe(intro.transition) })}</div>
<ul class="intro__etape intro__mots" data-etape="mots">${(intro.mots || []).map((mot, rang) => html`<li${attributs({ ...attributsApparition({ direction: DIRECTIONS[rang % DIRECTIONS.length], indice: rang, declenchement: "etape" }), lang: ctx.langDe(mot) })}>${c(mot, `site.intro.mots.${rang}`)}</li>`)}</ul>
</div>`;
  return html`<template id="intro-modele"${attributs({ "data-frequence": intro.frequence || "session" })}>${Modale({
    id: "intro", etiquette: t("intro.etiquette"), contenu,
    options: { variante: "plein-ecran", libelleFermer: t("intro.passer"), fermeture: "texte" },
  })}</template>`;
}

/* ------------------------------------------------------------------ */
/* Orchestration — navigateur uniquement.                              */
/* ------------------------------------------------------------------ */

const CLE = "mk-intro-vue";
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

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

/**
 * Lance l'accueil s'il existe et n'a pas encore été vu.
 * Réduction des animations : on va directement au choix de la langue.
 * « Passer » et Échap ferment à tout moment.
 */
export async function lancerIntro({ reduit = false } = {}) {
  const modele = document.getElementById("intro-modele");
  if (!modele) return;
  const frequence = modele.dataset.frequence;
  if (dejaVue(frequence)) return;

  document.body.append(modele.content.cloneNode(true));
  const dialogue = document.getElementById("intro");
  const etape = (nom) => dialogue.querySelector(`[data-etape="${nom}"]`);
  const montrer = (nom) => etape(nom)?.classList.add("est-active");
  let terminee = false;

  dialogue.addEventListener("close", () => {
    terminee = true;
    memoriser(frequence);
    dialogue.remove();
    document.getElementById("contenu")?.focus({ preventScroll: true });
  });

  // Lien vers l'autre langue : l'accueil est marqué vu avant de partir.
  dialogue.addEventListener("click", (evenement) => {
    const lien = evenement.target.closest(".segments__option");
    if (lien) {
      memoriser(frequence);
      if (lien.getAttribute("aria-current") === "true") { evenement.preventDefault(); dialogue.dispatchEvent(new Event("intro-continuer")); }
    }
    if (evenement.target.closest("[data-intro-continuer]")) dialogue.dispatchEvent(new Event("intro-continuer"));
  });
  const choix = new Promise((resoudre) => dialogue.addEventListener("intro-continuer", resoudre, { once: true }));

  ouvrirModale(dialogue);

  if (!reduit) {
    montrer("ouverture");
    await pause(900);
    if (terminee) return;
    montrer("bienvenue");
    reveler(etape("bienvenue"));
    await pause(1300);
    if (terminee) return;
  } else {
    montrer("bienvenue");
    reveler(etape("bienvenue"));
  }
  montrer("langue");
  dialogue.querySelector('.segments__option[aria-current="true"]')?.focus();
  await choix;
  if (terminee) return;
  if (reduit) return fermerModale(dialogue);

  etape("langue").classList.remove("est-active");
  etape("bienvenue").classList.remove("est-active");
  etape("ouverture").classList.remove("est-active");
  montrer("transition");
  await ecrire(etape("transition").querySelector("[data-texte-progressif]"), { reduit });
  if (terminee) return;
  montrer("mots");
  etape("mots").querySelectorAll("[data-apparition]").forEach(reveler);
  await pause(1600);
  if (terminee) return;
  dialogue.classList.add("est-sortie");
  await pause(900);
  fermerModale(dialogue);
}
