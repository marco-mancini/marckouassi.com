import { html, attributs, classes } from "../../fondations/rendu.js";

/**
 * Champ — une étiquette et son contenu. En lecture : une information
 * (« Basé à / Abidjan »). En édition : un libellé relié à son contrôle,
 * avec aide et erreur.
 *
 * @param {object} p
 * @param {string} p.etiquette
 * @param {*} p.contenu                           valeur rendue, ou contrôle (Saisie)
 * @param {"simple"|"fait"|"meta"|"formulaire"} [p.variante]
 * @param {string|null} [p.id]                    id du contrôle ; requis en formulaire
 * @param {{aide?:string, erreur?:string}} [p.messages]
 */
export function Champ({ etiquette, contenu, variante = "simple", id = null, messages = {} }) {
  const classe = classes("champ", `champ--${variante}`, messages.erreur && "champ--erreur");
  if (variante === "formulaire") {
    return html`<div class="${classe}"><label class="champ__etiquette"${attributs({ for: id })}>${etiquette}</label>${contenu}${messages.aide ? html`<p class="champ__aide"${attributs({ id: `${id}-aide` })}>${messages.aide}</p>` : ""}${messages.erreur ? html`<p class="champ__erreur"${attributs({ id: `${id}-erreur` })}>${messages.erreur}</p>` : ""}</div>`;
  }
  return html`<div class="${classe}"><span class="champ__etiquette">${etiquette}</span><div class="champ__valeur">${contenu}</div></div>`;
}
