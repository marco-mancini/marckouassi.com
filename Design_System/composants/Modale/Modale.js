import { html, attributs, classes } from "../../fondations/rendu.js";
import { Bouton } from "../Bouton/Bouton.js";

/**
 * Modale — boîte de dialogue native (<dialog>) : étude de projet, menu
 * mobile du site, navigation du back-office sous 850 px, confirmation,
 * aperçu. Un seul mécanisme pour tous.
 *
 * @param {object} p
 * @param {string} p.id
 * @param {{id:string}|string} p.etiquette     id de l'élément titre, ou nom accessible
 * @param {*} p.contenu
 * @param {*} [p.entete]                       contenu de l'en-tête (ex. compteur)
 * @param {{variante?:"centre"|"plein-ecran", libelleFermer:string, fermeture?:"icone"|"texte"}} p.options
 *        fermeture « texte » : bouton de fermeture à libellé visible (ex. « Passer l'introduction »)
 */
export function Modale({ id, etiquette, contenu, entete = "", options }) {
  const { variante = "centre", libelleFermer, fermeture = "icone" } = options;
  const nom = typeof etiquette === "string" ? { "aria-label": etiquette } : { "aria-labelledby": etiquette.id };
  return html`<dialog${attributs({ class: classes("modale", `modale--${variante}`, variante === "plein-ecran" && "ilot-olive"), id, ...nom })}><div class="modale__entete">${entete}${fermeture === "texte"
    ? Bouton({ texte: libelleFermer, variante: "contour", options: { attributs: { "data-modale-fermer": true } } })
    : Bouton({
      texte: libelleFermer, variante: variante === "plein-ecran" ? "contour" : "filet", forme: "rond",
      options: { icone: "fermer", iconeSeule: true, attributs: { "data-modale-fermer": true } },
    })}</div><div class="modale__corps">${contenu}</div></dialog>`;
}

/* ------------------------------------------------------------------ */
/* Comportement — navigateur uniquement.                               */
/* ------------------------------------------------------------------ */

let ouvertes = 0;

function verrouiller() { ouvertes += 1; document.documentElement.classList.add("has-overlay"); }
function deverrouiller() { ouvertes = Math.max(0, ouvertes - 1); if (!ouvertes) document.documentElement.classList.remove("has-overlay"); }

/**
 * Ouvre une modale et mémorise le déclencheur pour lui rendre le focus.
 *
 * Le verrou est rendu par l'ouverture elle-même, et non par un câblage
 * préalable : `activerModales()` ne voit que les dialogues présents à son
 * appel, or l'accueil animé vit dans un `<template>` et n'est injecté
 * qu'ensuite. Sa fermeture ne rendait donc rien, et la page restait en
 * `overflow: hidden` jusqu'au rechargement — molette et PageDown bloqués,
 * les ancres continuant de fonctionner.
 *
 * L'écouteur est posé APRÈS `showModal()` : si l'ouverture échoue, aucun
 * verrou n'est pris et aucun déverrouillage ne reste en attente.
 */
export function ouvrirModale(dialogue, declencheur = null) {
  if (!dialogue || dialogue.open) return;
  dialogue._declencheur = declencheur;
  if (declencheur) declencheur.setAttribute("aria-expanded", "true");
  dialogue.showModal();
  verrouiller();
  dialogue.addEventListener("close", deverrouiller, { once: true });
}

export function fermerModale(dialogue) {
  if (dialogue && dialogue.open) dialogue.close();
}

/**
 * Branche toutes les modales d'une racine :
 *   [data-modale-ouvrir="id"] ouvre, [data-modale-fermer] ferme,
 *   clic sur le fond ferme, Échap ferme (natif), le focus revient au
 *   déclencheur, le défilement de la page est verrouillé.
 */
export function activerModales(racine = document) {
  racine.addEventListener("click", (evenement) => {
    const ouvrir = evenement.target.closest("[data-modale-ouvrir]");
    if (ouvrir) {
      const dialogue = document.getElementById(ouvrir.dataset.modaleOuvrir);
      if (dialogue) { evenement.preventDefault(); ouvrirModale(dialogue, ouvrir); }
      return;
    }
    const fermer = evenement.target.closest("[data-modale-fermer]");
    if (fermer) fermerModale(fermer.closest("dialog"));
  });
  for (const dialogue of racine.querySelectorAll("dialog.modale")) {
    dialogue.addEventListener("click", (evenement) => { if (evenement.target === dialogue) dialogue.close(); });
    // Le déverrouillage appartient à ouvrirModale() : le poser ici aussi
    // décrémenterait deux fois le compteur pour une modale rendue par le
    // serveur, et libérerait le défilement alors qu'une autre est ouverte.
    dialogue.addEventListener("close", () => {
      const declencheur = dialogue._declencheur;
      if (declencheur) {
        declencheur.setAttribute("aria-expanded", "false");
        if (declencheur.isConnected) declencheur.focus({ preventScroll: true });
      }
      dialogue._declencheur = null;
    });
  }
}
