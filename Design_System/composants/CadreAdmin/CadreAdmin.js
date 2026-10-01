import { html } from "../../fondations/rendu.js";

/**
 * CadreAdmin — mise en page de tout écran du back-office :
 * barre haute, navigation latérale, contenu, zone de publication, zone
 * des messages. Sous 850 px la navigation latérale disparaît : l'en-tête
 * propose alors la même Navigation dans une Modale plein écran, le même
 * mécanisme que le menu mobile public.
 *
 * @param {object} p
 * @param {*} p.entete        EnTete variante admin
 * @param {*} p.navigation    Navigation verticale
 * @param {*} p.contenu       l'écran
 * @param {*} [p.barre]       zone de publication (statut + actions)
 * @param {*} [p.surcouches]  modales de l'écran (menu, aperçu, confirmation)
 */
export function CadreAdmin({ entete, navigation, contenu, barre = "", surcouches = "" }) {
  return html`<div class="cadre-admin">${entete}<aside class="cadre-admin__navigation">${navigation}</aside><main class="cadre-admin__principal" id="contenu" tabindex="-1">${contenu}</main>${barre ? html`<div class="cadre-admin__barre">${barre}</div>` : ""}<div class="messages" aria-live="polite" data-messages></div></div>${surcouches}`;
}
