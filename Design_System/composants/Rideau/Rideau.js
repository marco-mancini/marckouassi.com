import { html, attributs } from "../../fondations/rendu.js";

/**
 * Rideau — carte d'entrée animée : un libellé, une note, le rang en
 * filigrane, un signe d'ouverture. Toujours un lien.
 *
 * Elle s'ouvre en rideau à son apparition, puis reste vivante : un reflet
 * la traverse, son signe d'ouverture pousse vers l'extérieur, et
 * activerRideaux() la désigne à tour de rôle comme « vedette », remplie de
 * crème. Décision de Marc : #191.
 *
 * @param {object} p
 * @param {string} p.rang      calculé par le gabarit ("01"…)
 * @param {string} p.libelle
 * @param {string|null} [p.note]
 * @param {string} p.href
 * @param {number} [p.indice]  rang d'apparition et de vague (décalage)
 */
export function Rideau({ rang, libelle, note = null, href, indice = 0 }) {
  return html`<a${attributs({
    class: "rideau",
    href,
    "data-apparition": "rideau",
    style: `--i: ${Number(indice) || 0}`,
  })}><span class="rideau__libelle">${libelle}</span><span class="rideau__fleche" aria-hidden="true"></span>${note ? html`<span class="rideau__note">${note}</span>` : ""}<span class="rideau__rang" aria-hidden="true">${rang}</span></a>`;
}

/* ------------------------------------------------------------------ */
/* Comportement — navigateur uniquement.                              */
/* ------------------------------------------------------------------ */

const lireDuree = (element, nom) => {
  const valeur = getComputedStyle(element).getPropertyValue(nom).trim();
  const nombre = parseFloat(valeur);
  if (!Number.isFinite(nombre)) throw new Error(`Rideau : le jeton ${nom} est absent ou illisible (« ${valeur} »).`);
  return valeur.endsWith("ms") ? nombre : nombre * 1000;
};

/**
 * La vedette : une carte de chaque groupe se soulève et se remplit, puis la
 * suivante. Elle dit, sans geste du visiteur, que ces cartes s'ouvrent —
 * sur téléphone, il n'y a pas de survol pour le montrer.
 *
 * Elle s'efface dès qu'une main ou un clavier entre dans le groupe, ne
 * tourne que si le groupe est à l'écran et affiché, et jamais avec la
 * réduction des animations (système ou réglage du visiteur, relu à chaque pas).
 */
export function activerRideaux(racine = document, { reduit = false } = {}) {
  const groupes = new Map();
  racine.querySelectorAll(".rideau").forEach((carte) => {
    const parent = carte.parentElement;
    if (!groupes.has(parent)) groupes.set(parent, []);
    groupes.get(parent).push(carte);
  });
  if (!groupes.size) return;
  const html = document.documentElement;
  const mouvementReduit = () => reduit || html.dataset.animations === "reduites" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pas = lireDuree(html, "--rideau-vedette-pas");
  const attente = lireDuree(html, "--rideau-vedette-attente");

  groupes.forEach((cartes, groupe) => {
    let rang = -1, occupe = false, visible = false, minuteur = 0;
    const effacer = () => cartes.forEach((carte) => carte.classList.remove("est-vedette"));
    const suivante = () => {
      effacer();
      // offsetParent nul : le groupe est replié (une catégorie est ouverte).
      if (occupe || !visible || document.hidden || groupe.offsetParent === null || mouvementReduit()) return;
      rang = (rang + 1) % cartes.length;
      cartes[rang].classList.add("est-vedette");
    };
    const occuper = () => { occupe = true; effacer(); };
    const liberer = () => { occupe = false; };
    groupe.addEventListener("pointerenter", occuper);
    groupe.addEventListener("pointerleave", liberer);
    groupe.addEventListener("focusin", occuper);
    groupe.addEventListener("focusout", (e) => { if (!groupe.contains(e.relatedTarget)) liberer(); });
    // Au toucher, pas de « pointerleave » fiable : la main est rendue après un pas.
    groupe.addEventListener("touchstart", occuper, { passive: true });
    groupe.addEventListener("touchend", () => setTimeout(liberer, pas), { passive: true });

    const demarrer = () => {
      if (minuteur) return;
      minuteur = setTimeout(() => { suivante(); minuteur = setInterval(suivante, pas); }, attente);
    };
    if (!("IntersectionObserver" in window)) { visible = true; demarrer(); return; }
    new IntersectionObserver(([entree]) => {
      visible = entree.isIntersecting;
      if (visible) demarrer(); else effacer();
    }, { threshold: 0.25 }).observe(groupe);
  });
}
