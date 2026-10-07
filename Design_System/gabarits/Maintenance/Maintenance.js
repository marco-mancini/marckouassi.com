/**
 * MAINTENANCE — la page qui remplace tout le site public quand
 * content/site.json → maintenance.active est coché dans le CMS.
 *
 * Composition, pas composant : le choix de langue (Segments) et l'état
 * « Maintenance » (Message, mode sceau : le gabarit de tous les états du
 * site, #162), avec le bouton « écrire » du site et l'adresse. Aucun texte
 * ici : dictionnaires « etats » et « maintenance », contenu du site.
 * Décisions : D-38, D-39.
 */
import { html } from "../../fondations/rendu.js";
import { Message } from "../../composants/Message/Message.js";
import { Segments } from "../../composants/Segments/Segments.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";

/**
 * @param {object} p
 * @param {object} p.site     content/site.json
 * @param {object} p.ctx      contexte de page
 * @param {Array}  p.langues  optionsLangues(ctx)
 */
export function Maintenance({ site, ctx, langues }) {
  const { t } = ctx;
  const email = site.contact?.email;
  const ecrire = email
    ? html`${Bouton({ texte: ctx.c(site.navigation.ecrire, "site.navigation.ecrire"), href: `mailto:${email}`, variante: "contour", options: { icone: "externe" } })}<span class="message__adresse">${email}</span>`
    : null;
  return html`<main id="contenu" class="maintenance ilot-olive" tabindex="-1" data-maintenance>
<div class="maintenance__langues">${Segments({ options: langues, etiquette: t("langue.selecteur") })}</div>
<div class="maintenance__coeur">${Message({ type: "info", titre: t("etats.maintenance.titre"), texte: t("maintenance.texte"), action: ecrire, mode: { sceau: "bati", niveau: 1 } })}</div>
</main>`;
}
