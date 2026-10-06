import { html, attributs, classes } from "../../fondations/rendu.js";

/**
 * Journal d'échanges accessible. Les textes viennent exclusivement des props.
 * @param {object} p
 * @param {Array<{role:"visiteur"|"assistant",texte:string,liens?:Array<{libelle?:string,id?:string,href:string}>,lang?:string}>} p.echanges
 *        Le Worker renvoie `{id, href}` (worker/.../prompt.js) ; `libelle` est
 *        l'étiquette lisible quand elle existe. Un lien sans ni l'un ni l'autre
 *        n'arrive jamais ici : `Assistant` l'écarte avant (lien sans nom
 *        accessible = WCAG 2.4.4, et bouton mort au sens du §6.8).
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
    ${echange.liens?.length ? html`<ul class="conversation__liens">${echange.liens.map((lien) => html`<li><a class="bouton bouton--texte" href="${lien.href}">${lien.libelle || lien.id}</a></li>`)}</ul>` : ""}
  </li>`);
  // `role="log"` porte sur l'enveloppe, PAS sur la liste. Posé sur le <ol>, il
  // écrase la sémantique de liste et laisse les <li> orphelins — axe-core le
  // relève en « serious » (règle listitem). L'annonce reste la même pour les
  // lecteurs d'écran, et la liste redevient une liste.
  return html`<div class="conversation" role="log" aria-live="polite" aria-relevant="additions" aria-label="${etiquette}"><ol class="conversation__tours">${tours.length ? tours : html`<li class="conversation__vide">${vide}</li>`}</ol></div>`;
}
