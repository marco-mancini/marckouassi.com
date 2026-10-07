import { html, attributs, classes } from "../../fondations/rendu.js";

/**
 * Humeurs du sceau : l'animation propre à chaque état du site (#162).
 *   bati        construction, contour crème puis couleurs (maintenance, connexion rétablie)
 *   chargement  tracé, remplissage, effacement, en boucle
 *   chantier    lignes de construction puis MK, en boucle (hors connexion, média)
 *   vide        lignes de construction seules, qui respirent
 *   panne       construction, puis le K grésille (indisponible)
 *   perdu       construction, puis le K se décroche (page introuvable)
 */
export const HUMEURS = {
  bati: "sceau--humeur sceau--bati",
  chargement: "sceau--humeur sceau--chargement",
  chantier: "sceau--humeur sceau--chantier",
  vide: "sceau--humeur sceau--vide",
  panne: "sceau--humeur sceau--bati sceau--panne",
  perdu: "sceau--humeur sceau--bati sceau--perdu",
};

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
 * @param {boolean|string} [p.anime]  true : entrée animée (expérience d'accueil) ;
 *        "construction" : le sceau se construit forme par forme (voir construireSceau) ;
 *        une humeur (HUMEURS) : l'animation d'un état du site (Message, mode sceau)
 * @param {boolean} [p.auto]  construit par activerSceaux, sans autre déclencheur
 */
export function Sceau({ taille = "moyen", lien = null, libelle = null, anime = false, auto = false } = {}) {
  const humeur = HUMEURS[anime] ?? null;
  const classe = classes("sceau", `sceau--${taille}`, anime === "construction" ? "sceau--construction" : humeur ? humeur : anime && "sceau--anime");
  const dessin = html`<svg aria-hidden="true" focusable="false"><use href="#logo-mk-seal"></use></svg>`;
  if (lien) return html`<a${attributs({ class: classe, href: lien, "aria-label": libelle })}>${dessin}</a>`;
  return html`<span${attributs({ class: classe, role: libelle ? "img" : null, "aria-label": libelle, "aria-hidden": libelle ? null : "true", "data-sceau-auto": auto || null })}>${dessin}</span>`;
}

/**
 * Construction du sceau — navigateur uniquement.
 *
 * Remplace la référence au sprite par une copie de ses formes, pour que
 * chacune se trace à son tour : le cercle, les lignes de construction, le M,
 * le K, puis le remplissage. Les formes viennent du symbole #logo-mk-seal
 * déjà présent dans la page : rien n'est recopié dans le code.
 * Sans sprite ou sans script, le sceau reste le sceau statique.
 *
 * @param {Element} sceau        élément .sceau--construction
 * @param {object} [o]
 * @param {boolean} [o.rejouer]  relance la construction si elle a déjà eu lieu
 * @returns {boolean}            vrai si la construction est lancée
 */
export function construireSceau(sceau, { rejouer = false } = {}) {
  const svg = sceau?.querySelector("svg");
  const symbole = sceau?.ownerDocument.getElementById("logo-mk-seal");
  if (!svg || !symbole) return false;
  const reference = svg.querySelector("use");
  if (reference) {
    svg.setAttribute("viewBox", symbole.getAttribute("viewBox"));
    reference.replaceWith(...[...symbole.childNodes].map((noeud) => noeud.cloneNode(true)));
    svg.querySelector("circle")?.setAttribute("data-forme", "cercle");
    svg.querySelectorAll("g[opacity] path").forEach((trait) => trait.setAttribute("data-forme", "fantome"));
    const [lettre, accent] = svg.querySelectorAll(":scope > g:last-of-type > path");
    lettre?.setAttribute("data-forme", "lettre");
    accent?.setAttribute("data-forme", "accent");
    svg.querySelectorAll("[data-forme]").forEach((forme) => forme.setAttribute("pathLength", "1"));
  } else if (rejouer) {
    sceau.classList.remove("est-construit");
    void sceau.offsetWidth; // relance des animations CSS
  }
  sceau.classList.add("est-construit");
  return true;
}

/**
 * Navigateur : construit chaque sceau marqué `data-sceau-auto` sous `racine`
 * (états du site rendus dans la page ou insérés par un script).
 * @param {ParentNode} racine
 */
export function activerSceaux(racine) {
  racine.querySelectorAll("[data-sceau-auto]:not(.est-construit)").forEach((sceau) => construireSceau(sceau));
}
