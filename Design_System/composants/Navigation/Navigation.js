import { html, attributs, classes } from "../../fondations/rendu.js";

/**
 * Navigation — liste de liens, en ligne ou empilée. Une seule source
 * de liens pour l'en-tête, le menu mobile et la barre latérale du
 * back-office : les liens ne sont jamais écrits deux fois.
 *
 * @param {object} p
 * @param {Array<{libelle:string, href:string, numero?:string, actif?:boolean, lang?:string}>} p.liens
 * @param {"horizontale"|"verticale"} [p.orientation]
 * @param {"normale"|"affichage"} [p.echelle]      affichage : grandes capitales du menu mobile
 * @param {string} p.etiquette                     nom accessible (dictionnaire)
 * @param {boolean} [p.fermeModale]                un clic ferme la modale qui contient la navigation
 */
export function Navigation({ liens, orientation = "horizontale", echelle = "normale", etiquette, fermeModale = false }) {
  return html`<nav${attributs({ class: classes("navigation", `navigation--${orientation}`, `navigation--${echelle}`), "aria-label": etiquette })}>${liens.map((lien, rang) =>
    html`<a${attributs({ class: "navigation__lien", href: lien.href, style: echelle === "affichage" ? `--i: ${rang}` : null, "aria-current": lien.actif ? "page" : null, lang: lien.lang || null, "data-modale-fermer": fermeModale || null })}><span class="navigation__libelle">${lien.libelle}</span>${lien.numero ? html`<span class="navigation__numero" aria-hidden="true">${lien.numero}</span>` : ""}</a>`
  )}</nav>`;
}

/**
 * Navigateur : marque le lien de la section visible (aria-current="location")
 * dans toutes les navigations d'ancres de la page.
 */
export function suivreSectionCourante(racine = document) {
  if (!("IntersectionObserver" in window)) return;
  const liens = [...racine.querySelectorAll('.navigation__lien[href^="#"]')];
  const cibles = [...new Set(liens.map((lien) => lien.getAttribute("href").slice(1)))].map((id) => document.getElementById(id)).filter(Boolean);
  const observateur = new IntersectionObserver((entrees) => {
    for (const entree of entrees) {
      if (!entree.isIntersecting) continue;
      for (const lien of liens) {
        if (lien.getAttribute("href") === `#${entree.target.id}`) lien.setAttribute("aria-current", "location");
        else if (lien.getAttribute("aria-current") === "location") lien.removeAttribute("aria-current");
      }
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  cibles.forEach((cible) => observateur.observe(cible));
}
