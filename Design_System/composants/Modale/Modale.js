import { html, attributs, classes } from "../../fondations/rendu.js";
import { Bouton } from "../Bouton/Bouton.js";

/**
 * Modale — boîte de dialogue native (<dialog>) : étude de projet, menu
 * mobile du site, navigation du back-office sous 850 px, confirmation,
 * aperçu, panneau de MarcoS. Un seul mécanisme pour tous.
 *
 * `ancre` : panneau borné posé au-dessus de la présence flottante, en bas à
 * droite. Le fond reste transparent — le portfolio demeure visible, et MarcoS
 * avec lui (MARCOS_AVATAR_UI §7). Le piège à focus et Échap sont ceux du
 * <dialog>, inchangés.
 *
 * @param {object} p
 * @param {string} p.id
 * @param {{id:string}|string} p.etiquette     id de l'élément titre, ou nom accessible
 * @param {*} p.contenu
 * @param {*} [p.entete]                       contenu de l'en-tête (ex. compteur)
 * @param {{variante?:"centre"|"plein-ecran"|"ancre", libelleFermer?:string, fermeture?:"icone"|"texte"|"aucune", modal?:boolean, iconeFermer?:string}} p.options
 *        modal : false ouvre avec show() au lieu de showModal(). Le reste de la
 *        page demeure actif, et le focus n'est pas piégé — c'est ce que décrit
 *        la maquette de MarcoS (aria-modal="false") : le visiteur continue de
 *        parcourir le portfolio pendant la conversation.
 *        fermeture « texte » : bouton de fermeture à libellé visible.
 *        fermeture « aucune » : aucune commande dans l'en-tête. Réservé au cas
 *        où la sortie est ailleurs — l'accueil animé se quitte par son propre
 *        bouton d'entrée, par le choix de langue, ou par Échap. L'en-tête garde
 *        sa hauteur, donc la composition en dessous ne bouge pas.
 */
export function Modale({ id, etiquette, contenu, entete = "", options }) {
  const { variante = "centre", libelleFermer, fermeture = "icone", modal = true, iconeFermer = "fermer" } = options;
  const nom = typeof etiquette === "string" ? { "aria-label": etiquette } : { "aria-labelledby": etiquette.id };
  return html`<dialog${attributs({
    class: classes("modale", `modale--${variante}`, variante === "plein-ecran" && "ilot-olive"),
    id, ...nom, "data-modal": modal ? null : "false",
  })}><div class="modale__entete">${entete}${fermeture === "aucune" ? "" : fermeture === "texte"
    ? Bouton({ texte: libelleFermer, variante: "contour", options: { attributs: { "data-modale-fermer": true } } })
    : Bouton({
      texte: libelleFermer, variante: variante === "plein-ecran" ? "contour" : "filet", forme: "rond",
      options: { icone: iconeFermer, iconeSeule: true, attributs: { "data-modale-fermer": true } },
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
  // Non modale : la page reste active, le focus n'est pas piégé, et le
  // défilement n'est PAS verrouillé — rien ne doit être repris à la fermeture.
  // Échap devient notre affaire : l'évènement « cancel » n'existe que pour une
  // modale (voir activerModales).
  if (dialogue.dataset.modal === "false") {
    dialogue.show();
    return;
  }
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
  // Échap rendu à la main pour les dialogues non modaux, qui n'ont ni « cancel »
  // ni fermeture native. Un seul écouteur, et seule la dernière ouverte ferme.
  racine.addEventListener("keydown", (evenement) => {
    if (evenement.key !== "Escape") return;
    const ouvertes = [...racine.querySelectorAll('dialog.modale[data-modal="false"][open]')];
    const derniere = ouvertes[ouvertes.length - 1];
    if (derniere) { evenement.preventDefault(); fermerModale(derniere); }
  });

  for (const dialogue of racine.querySelectorAll("dialog.modale")) {
    // Un clic sur le fond ne concerne que les modales : une non modale n'a pas
    // de fond, et la zone cliquée appartient alors à la page.
    if (dialogue.dataset.modal !== "false") {
    }
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
