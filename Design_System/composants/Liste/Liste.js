import { html, attributs, classes, formater } from "../../fondations/rendu.js";
import { Bouton } from "../Bouton/Bouton.js";

/**
 * Liste — lignes avec actions, réordonnables en option.
 * Réordonner se fait au glisser ET au clavier (Monter / Descendre) :
 * le glisser seul n'est pas accessible (WCAG 2.5.7).
 *
 * @param {object} p
 * @param {Array<{id:string, nom:string, contenu:*, actions?:*}>} p.elements
 *        `nom` : texte court de la ligne, utilisé dans les libellés accessibles
 * @param {string} p.etiquette
 * @param {boolean} [p.ordonnable]
 * @param {{monter?:string, descendre?:string, supprimer?:string, annonce?:string}} [p.libelles]
 *        modèles du dictionnaire, avec {nom}, {position}, {total}
 * @param {*} [p.vide]                                   Message affiché quand la liste est vide
 */
export function Liste({ elements, etiquette, ordonnable = false, libelles = {}, vide = null }) {
  if (!elements.length) return html`${vide}`;
  const total = elements.length;
  return html`<div class="liste-conteneur"><ul${attributs({ class: classes("liste", ordonnable && "liste--ordonnable"), "aria-label": etiquette, "data-liste": true, "data-annonce": libelles.annonce || null })}>${elements.map((element, rang) =>
    html`<li${attributs({ class: "liste__ligne", "data-id": element.id, "data-nom": element.nom, draggable: ordonnable ? "true" : null })}>${ordonnable ? html`<span class="liste__poignee" aria-hidden="true">⠿</span>` : ""}<div class="liste__contenu">${element.contenu}</div><div class="liste__actions">${element.actions || ""}${ordonnable ? html`${Bouton({ texte: formater(libelles.monter, { nom: element.nom }), variante: "filet", forme: "rond", options: { iconeSeule: true, icone: "haut", etat: rang === 0 ? "desactive" : null, attributs: { "data-liste-monter": true } } })}${Bouton({ texte: formater(libelles.descendre, { nom: element.nom }), variante: "filet", forme: "rond", options: { iconeSeule: true, icone: "bas", etat: rang === total - 1 ? "desactive" : null, attributs: { "data-liste-descendre": true } } })}` : ""}${libelles.supprimer ? Bouton({ texte: formater(libelles.supprimer, { nom: element.nom }), variante: "filet", forme: "rond", options: { iconeSeule: true, icone: "fermer", attributs: { "data-liste-supprimer": true } } }) : ""}</div></li>`
  )}</ul><p class="visually-hidden" aria-live="polite" data-liste-annonce></p></div>`;
}

/* ------------------------------------------------------------------ */
/* Comportement — navigateur uniquement.                               */
/* ------------------------------------------------------------------ */

function ordre(liste) {
  return [...liste.querySelectorAll(":scope > .liste__ligne")].map((ligne) => ligne.dataset.id);
}

function rafraichir(liste) {
  const lignes = [...liste.querySelectorAll(":scope > .liste__ligne")];
  lignes.forEach((ligne, rang) => {
    const monter = ligne.querySelector("[data-liste-monter]");
    const descendre = ligne.querySelector("[data-liste-descendre]");
    if (monter) monter.disabled = rang === 0;
    if (descendre) descendre.disabled = rang === lignes.length - 1;
  });
}

function annoncer(liste, ligne) {
  const zone = liste.parentElement.querySelector("[data-liste-annonce]");
  const lignes = ordre(liste);
  if (zone && liste.dataset.annonce) {
    zone.textContent = formater(liste.dataset.annonce, { nom: ligne.dataset.nom, position: lignes.indexOf(ligne.dataset.id) + 1, total: lignes.length });
  }
}

/**
 * Branche une liste : clavier, glisser-déposer, suppression.
 * Les rappels reçoivent l'ordre des identifiants ou l'identifiant supprimé.
 */
export function activerListe(liste, { surReordonner, surSupprimer } = {}) {
  let glisse = null;
  const deplacer = (ligne, vers) => {
    if (vers === "haut" && ligne.previousElementSibling) ligne.previousElementSibling.before(ligne);
    else if (vers === "bas" && ligne.nextElementSibling) ligne.nextElementSibling.after(ligne);
    else return;
    rafraichir(liste);
    annoncer(liste, ligne);
    surReordonner?.(ordre(liste));
  };
  liste.addEventListener("click", (evenement) => {
    const ligne = evenement.target.closest(".liste__ligne");
    if (!ligne) return;
    if (evenement.target.closest("[data-liste-monter]")) { deplacer(ligne, "haut"); ligne.querySelector("[data-liste-monter]:not(:disabled)")?.focus() || ligne.querySelector("[data-liste-descendre]")?.focus(); }
    else if (evenement.target.closest("[data-liste-descendre]")) { deplacer(ligne, "bas"); ligne.querySelector("[data-liste-descendre]:not(:disabled)")?.focus() || ligne.querySelector("[data-liste-monter]")?.focus(); }
    else if (evenement.target.closest("[data-liste-supprimer]")) surSupprimer?.(ligne.dataset.id);
  });
  liste.addEventListener("dragstart", (evenement) => {
    glisse = evenement.target.closest(".liste__ligne");
    glisse?.classList.add("est-glisse");
    evenement.dataTransfer?.setData("text/plain", glisse?.dataset.id || "");
  });
  liste.addEventListener("dragover", (evenement) => {
    const cible = evenement.target.closest(".liste__ligne");
    if (!glisse || !cible || cible === glisse) return;
    evenement.preventDefault();
    const milieu = cible.getBoundingClientRect().top + cible.offsetHeight / 2;
    if (evenement.clientY < milieu) cible.before(glisse); else cible.after(glisse);
  });
  liste.addEventListener("dragend", () => {
    if (!glisse) return;
    glisse.classList.remove("est-glisse");
    rafraichir(liste);
    annoncer(liste, glisse);
    surReordonner?.(ordre(liste));
    glisse = null;
  });
}
