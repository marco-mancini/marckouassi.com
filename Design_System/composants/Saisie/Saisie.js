import { html, attributs, classes } from "../../fondations/rendu.js";

const TYPES_INPUT = { texte: "text", courriel: "email", url: "url", nombre: "number", motdepasse: "password", code: "text" };

/**
 * Saisie — contrôle de formulaire : texte, texte long, nombre, courriel,
 * adresse, mot de passe, code, choix dans une liste, case à cocher.
 * Toujours posée dans un Champ (formulaire), qui porte le libellé.
 *
 * @param {object} p
 * @param {string} p.id
 * @param {"texte"|"long"|"nombre"|"courriel"|"url"|"motdepasse"|"code"|"choix"|"case"} [p.type]
 * @param {*} [p.valeur]
 * @param {object} [p.options]
 * @param {string} [p.options.nom]
 * @param {Array<{valeur:string, libelle:string}>} [p.options.choix]
 * @param {boolean} [p.options.requis]
 * @param {boolean} [p.options.desactive]
 * @param {string} [p.options.lang]           langue du texte saisi (champ EN d'un contenu)
 * @param {number} [p.options.lignes]
 * @param {{aide?:boolean, erreur?:boolean}} [p.options.etat]
 * @param {string} [p.options.complement]     valeur d'autocomplete
 * @param {string} [p.options.invite]         texte d'invite (placeholder). Il ne
 *        remplace JAMAIS une etiquette : il la complete.
 */
export function Saisie({ id, type = "texte", valeur = "", options = {} }) {
  const { nom = id, choix = [], requis = false, desactive = false, lang = null, lignes = 5, etat = {}, complement = null, invite = null } = options;
  const decritPar = [etat.aide && `${id}-aide`, etat.erreur && `${id}-erreur`].filter(Boolean).join(" ") || null;
  const communs = {
    id, name: nom, class: classes("saisie", `saisie--${type}`), required: requis, "aria-required": requis ? "true" : null,
    disabled: desactive, lang, "aria-invalid": etat.erreur ? "true" : null, "aria-describedby": decritPar, autocomplete: complement,
    placeholder: invite,
  };
  if (type === "long") return html`<textarea${attributs({ ...communs, rows: lignes })}>${valeur ?? ""}</textarea>`;
  if (type === "choix") {
    return html`<select${attributs(communs)}>${choix.map((option) => html`<option${attributs({ value: option.valeur, selected: String(option.valeur) === String(valeur) })}>${option.libelle}</option>`)}</select>`;
  }
  if (type === "case") return html`<input${attributs({ ...communs, type: "checkbox", checked: valeur === true || valeur === "true" })}>`;
  return html`<input${attributs({ ...communs, type: TYPES_INPUT[type] || "text", value: valeur ?? "", inputmode: type === "code" ? "numeric" : null })}>`;
}
