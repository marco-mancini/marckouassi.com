import { html, attributs, classes } from "../../fondations/rendu.js";

/**
 * Sceau — le monogramme MK sur son rond crème.
 *
 * Le symbole vient du sprite unique inséré une fois par page
 * (assets/logos-sprite.svg) ; le sceau ne fait que le référencer.
 *
 * @param {object} p
 * @param {"couverture"|"grand"|"moyen"|"petit"|"document"} [p.taille]   document : en-tête du CV
 * @param {string|null} [p.lien]      rend le sceau cliquable
 * @param {string|null} [p.libelle]   nom accessible ; sans lui le sceau est décoratif
 * @param {boolean} [p.anime]         entrée animée (expérience d'accueil)
 */
export function Sceau({ taille = "moyen", lien = null, libelle = null, anime = false } = {}) {
  const classe = classes("sceau", `sceau--${taille}`, anime && "sceau--anime");
  const dessin = html`<svg aria-hidden="true" focusable="false"><use href="#logo-mk-seal"></use></svg>`;
  if (lien) return html`<a${attributs({ class: classe, href: lien, "aria-label": libelle })}>${dessin}</a>`;
  return html`<span${attributs({ class: classe, role: libelle ? "img" : null, "aria-label": libelle, "aria-hidden": libelle ? null : "true" })}>${dessin}</span>`;
}
