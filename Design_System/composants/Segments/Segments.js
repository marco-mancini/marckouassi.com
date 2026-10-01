import { html, attributs, classes } from "../../fondations/rendu.js";

/**
 * Segments — choix entre quelques options.
 *   mode « liens »   : navigation (sélecteur de langue public) → aria-current + hreflang ;
 *   mode « boutons » : bascule dans l'interface (langue d'édition, taille d'aperçu) → aria-pressed.
 *
 * @param {object} p
 * @param {Array<{libelle:string, href?:string, valeur?:string, actif?:boolean, lang?:string, nom?:string}>} p.options
 *        `nom` : intitulé complet lu par les lecteurs d'écran (ex. « English » pour « EN »)
 * @param {string} p.etiquette            nom accessible du groupe (dictionnaire)
 * @param {"liens"|"boutons"} [p.mode]
 * @param {string|null} [p.cle]           identifiant de la bascule, transmis aux écouteurs
 */
export function Segments({ options, etiquette, mode = "liens", cle = null }) {
  const elements = options.map((option) => {
    const libelle = option.nom
      ? html`<span aria-hidden="true">${option.libelle}</span><span class="visually-hidden">${option.nom}</span>`
      : option.libelle;
    return mode === "liens"
      ? html`<a${attributs({ class: "segments__option", href: option.href, hreflang: option.lang || null, lang: option.lang || null, "aria-current": option.actif ? "true" : null })}>${libelle}</a>`
      : html`<button${attributs({ type: "button", class: "segments__option", "data-valeur": option.valeur, "aria-pressed": option.actif ? "true" : "false" })}>${libelle}</button>`;
  });
  return mode === "liens"
    ? html`<nav${attributs({ class: classes("segments", "segments--liens"), "aria-label": etiquette })}>${elements}</nav>`
    : html`<div${attributs({ class: classes("segments", "segments--boutons"), role: "group", "aria-label": etiquette, "data-segments": cle })}>${elements}</div>`;
}

/** Navigateur : mode boutons, une seule option pressée ; rappel avec la valeur choisie. */
export function activerSegments(groupe, surChangement) {
  groupe.addEventListener("click", (evenement) => {
    const bouton = evenement.target.closest(".segments__option");
    if (!bouton) return;
    for (const autre of groupe.querySelectorAll(".segments__option")) autre.setAttribute("aria-pressed", String(autre === bouton));
    surChangement?.(bouton.dataset.valeur, groupe.dataset.segments);
  });
}
