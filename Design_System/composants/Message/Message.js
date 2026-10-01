import { html, attributs, classes } from "../../fondations/rendu.js";

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
 * @param {"encart"|"toast"} [p.mode]
 */
export function Message({ type = "info", titre = null, texte, action = null, mode = "encart" }) {
  return html`<div${attributs({ class: classes("message", `message--${type}`, `message--${mode}`), role: ROLES[type], "aria-busy": type === "chargement" ? "true" : null })}><div class="message__texte">${titre ? html`<p class="message__titre">${titre}</p>` : ""}<p>${texte}</p></div>${action ? html`<div class="message__action">${action}</div>` : ""}</div>`;
}

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
