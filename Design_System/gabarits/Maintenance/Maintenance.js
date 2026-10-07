/**
 * MAINTENANCE — la page qui remplace tout le site public quand
 * content/site.json → maintenance.active est coché dans le CMS.
 *
 * Composition, pas composant : le sceau qui se construit (Sceau, variante
 * construction), un Titre, le choix de langue (Segments) et le bouton
 * « écrire » du site. Aucun texte ici : dictionnaire « maintenance » et
 * contenu du site (nom, bouton « écrire », adresse). Décision : Docs/DECISIONS.md, D-38.
 */
import { html } from "../../fondations/rendu.js";
import { Sceau, construireSceau } from "../../composants/Sceau/Sceau.js";
import { Titre } from "../../composants/Titre/Titre.js";
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
  const ecrire = site.contact?.email
    ? Bouton({ texte: ctx.c(site.navigation.ecrire, "site.navigation.ecrire"), href: `mailto:${site.contact.email}`, variante: "contour", options: { icone: "externe" } })
    : "";
  return html`<main id="contenu" class="maintenance ilot-olive" tabindex="-1" data-maintenance>
<div class="maintenance__langues">${Segments({ options: langues, etiquette: t("langue.selecteur") })}</div>
<div class="maintenance__coeur">
${Sceau({ taille: "grand", anime: "construction" })}
<p class="maintenance__etiquette">${site.identite.nom}</p>
${Titre({ niveau: 1, echelle: "appel", texte: t("maintenance.titre") })}
<p class="maintenance__texte">${t("maintenance.texte")}</p>
${ecrire}
</div>
</main>`;
}

/**
 * Navigateur : construit le sceau de la page de maintenance. Mouvement
 * réduit : le sceau reste statique.
 * @param {Document} document
 * @param {object} [o]
 * @param {boolean} [o.reduit]
 */
export function activerMaintenance(document, { reduit = false } = {}) {
  const sceau = document.querySelector("[data-maintenance] .sceau--construction");
  if (!sceau || reduit) return false;
  return construireSceau(sceau);
}
