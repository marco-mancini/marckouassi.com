import { html, attributs, brut } from "../../fondations/rendu.js";

/**
 * Apparition — entrée animée d'un élément : direction et rang de décalage.
 *
 * Deux usages :
 *   - attributsApparition() à étaler sur un élément existant (aucun
 *     conteneur ajouté, la mise en page ne bouge pas) ;
 *   - Apparition() quand un conteneur est souhaité.
 *
 * Déclenchement : au défilement (défaut), ou à une étape d'une
 * séquence (« etape »), révélée par le code qui orchestre (Intro).
 *
 * Principe : le contenu est visible par défaut. Il n'est masqué en
 * attente que si html porte .js-anime (voir Motion.css).
 */
export function attributsApparition({ direction = "bas", indice = 0, declenchement = "defilement" } = {}) {
  return {
    "data-apparition": direction,
    "data-declenchement": declenchement === "defilement" ? null : declenchement,
    style: `--i: ${Number(indice) || 0}`,
  };
}

/**
 * @param {object} p
 * @param {*} p.contenu
 * @param {"bas"|"haut"|"gauche"|"droite"|"fondu"|"douce"|"rideau"} [p.direction]
 * @param {number} [p.indice]
 * @param {"defilement"|"etape"} [p.declenchement]
 * @param {string} [p.balise]
 */
export function Apparition({ contenu, direction = "bas", indice = 0, declenchement = "defilement", balise = "div" }) {
  const b = brut(balise);
  return html`<${b}${attributs(attributsApparition({ direction, indice, declenchement }))}>${contenu}</${b}>`;
}

/** Révèle un élément tout de suite (étape d'une séquence). */
export function reveler(element) {
  element.classList.add("est-apparu");
}

/**
 * Navigateur uniquement : observe les éléments déclenchés au défilement.
 * Sans IntersectionObserver ou avec la réduction des animations, tout
 * est révélé immédiatement.
 */
export function activerApparitions(racine = document, { reduit = false } = {}) {
  const elements = [...racine.querySelectorAll("[data-apparition]:not([data-declenchement])")];
  if (reduit || !("IntersectionObserver" in window)) {
    elements.forEach(reveler);
    return;
  }
  const observateur = new IntersectionObserver((entrees) => {
    for (const entree of entrees) {
      if (!entree.isIntersecting) continue;
      reveler(entree.target);
      observateur.unobserve(entree.target);
    }
  }, { threshold: 0.16 });
  elements.forEach((element) => observateur.observe(element));
}
