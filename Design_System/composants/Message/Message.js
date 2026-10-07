import { html, attributs, classes, echapper, brut } from "../../fondations/rendu.js";
import { Sceau } from "../Sceau/Sceau.js";

const ROLES = { erreur: "alert", succes: "status", info: "status", attention: "status", chargement: "status", vide: null };

/**
 * Message — retour d'interface : information, succès, erreur, attention,
 * chargement, état vide. En encart dans la page ou en toast.
 *
 * @param {object} p
 * @param {"info"|"succes"|"erreur"|"attention"|"chargement"|"vide"} [p.type]
 * @param {string|null} [p.titre]
 * @param {string} p.texte
 * @param {*} [p.action]                         Bouton éventuel (ex. « Ajouter un projet »)
 * @param {"encart"|"toast"|{sceau:string, compact?:boolean, toast?:boolean, niveau?:number, nu?:boolean}} [p.mode]
 *        objet : l'état du site (#162) — sceau animé de l'humeur `sceau` (Sceau, HUMEURS),
 *        titre bicolore, phrase, actions ; même gabarit partout. `compact` : en petit
 *        (conversation, média, bas d'écran) ; `toast` : entrée d'un toast ; `niveau` :
 *        le titre devient un titre hN (page entière : 1) ; `nu` : voir ci-dessous.
 *
 *        `nu` — le même gabarit SANS son îlot olive : le sceau animé, le titre et
 *        la phrase se posent directement sur le fond qui les accueille. C'est ce
 *        dont MarcoS a besoin : son panneau est déjà une surface à lui, et un
 *        second fond plein à l'intérieur ferait une boîte dans une boîte. Les
 *        tailles, l'animation et le titre bicolore ne changent pas — seuls le
 *        fond et le contexte de couleurs tombent, donc les textes reprennent
 *        ceux du thème au lieu de ceux de l'olive.
 */
export function Message({ type = "info", titre = null, texte, action = null, mode = "encart" }) {
  if (mode && typeof mode === "object") {
    // Page entière (404, maintenance) : le titre est le h1 de la page.
    const balise = mode.niveau ? `h${mode.niveau}` : "p";
    // `nu` retire l'îlot olive ET sa classe : sans elle, les variables de
    // couleur ne sont pas redéfinies, et le contenu lit celles du thème.
    return html`<div${attributs({ class: classes("message", `message--${type}`, "message--sceau", mode.compact && "message--compact", mode.toast && "message--toast", mode.nu ? "message--nu" : "ilot-olive"), role: ROLES[type], "aria-busy": type === "chargement" ? "true" : null })}>${Sceau({ taille: "grand", anime: mode.sceau, auto: true })}${titre ? html`<${brut(balise)} class="message__titre">${titreBicolore(titre)}</${brut(balise)}>` : ""}<p class="message__phrase">${texte}</p>${action ? html`<div class="message__action">${action}</div>` : ""}</div>`;
  }
  return html`<div${attributs({ class: classes("message", `message--${type}`, `message--${mode}`), role: ROLES[type], "aria-busy": type === "chargement" ? "true" : null })}><div class="message__texte">${titre ? html`<p class="message__titre">${titre}</p>` : ""}<p>${texte}</p></div>${action ? html`<div class="message__action">${action}</div>` : ""}</div>`;
}

/**
 * Titre bicolore : la partie entre astérisques en or (« *Char*gement »),
 * à défaut le premier mot ; le reste en crème ; un point doré final.
 * Le texte vient du dictionnaire ou des données : il est échappé.
 * @param {string} texte
 */
export function titreBicolore(texte) {
  const brutTexte = String(texte ?? "");
  const marque = brutTexte.match(/^([^*]*)\*([^*]+)\*(.*)$/);
  const [avant, or, apres] = marque ? marque.slice(1) : ["", ...(brutTexte.match(/^(\S+)(.*)$/)?.slice(1) ?? [brutTexte, ""])];
  return brut(`${echapper(avant)}<span class="message__or">${echapper(or)}</span>${echapper(apres)}<span class="message__or" aria-hidden="true">.</span>`);
}

/** Le même titre, sans ses marques : pour un onglet ou un nom accessible. */
export const titreSimple = (texte) => String(texte ?? "").replaceAll("*", "");

/**
 * Navigateur : affiche un toast dans la région vivante `zone`.
 * Succès et information disparaissent seuls ; une erreur reste jusqu'à
 * ce qu'on la ferme ou qu'une autre la remplace.
 */
export function afficherMessage(zone, message, { type = "info", duree = 5000 } = {}) {
  const gabarit = document.createElement("template");
  gabarit.innerHTML = String(message);
  const element = gabarit.content.firstElementChild;
  zone.append(element);
  if (type !== "erreur") setTimeout(() => element.remove(), duree);
  return element;
}
