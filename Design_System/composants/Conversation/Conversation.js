import { html, attributs, classes } from "../../fondations/rendu.js";

/**
 * Journal d'échanges accessible. Les textes viennent exclusivement des props.
 * @param {object} p
 * @param {Array<{role:"visiteur"|"assistant",texte:string,liens?:Array<{libelle:string,href:string}>,lang?:string}>} p.echanges
 * @param {string} p.etiquette
 * @param {{visiteur:string,assistant:string}} p.libelles
 * @param {*} p.vide
 */
export function Conversation({ echanges = [], etiquette, libelles, vide }) {
  // Les valeurs d'attribut sont entourées de guillemets : sans eux, une classe
  // à deux mots se coupait au premier espace et le modificateur de rôle
  // (« conversation__tour--assistant ») était perdu.
  const tours = echanges.map((echange) => html`<li class="${classes("conversation__tour", `conversation__tour--${echange.role}`)}"${attributs({ lang: echange.lang || null })}>
    <p class="conversation__etiquette texte-etiquette">${echange.role === "assistant" ? libelles.assistant : libelles.visiteur}</p>
    <p class="conversation__texte texte-corps">${echange.texte}</p>
    ${echange.liens?.length ? html`<ul class="conversation__liens">${echange.liens.map((lien) => html`<li><a class="bouton bouton--texte" href="${lien.href}">${lien.libelle}</a></li>`)}</ul>` : ""}
  </li>`);
  return html`<ol class="conversation" role="log" aria-live="polite" aria-relevant="additions" aria-label="${etiquette}">${tours.length ? tours : html`<li class="conversation__vide">${vide}</li>`}</ol>`;
}
