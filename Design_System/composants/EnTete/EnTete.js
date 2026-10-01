import { html, attributs, classes } from "../../fondations/rendu.js";

/**
 * EnTete — barre haute : marque, navigation, actions.
 *
 * @param {object} p
 * @param {{href:string, libelle:string}} p.marque           nom accessible de la marque (contenu)
 * @param {*} [p.navigation]                                 Navigation horizontale
 * @param {{large?:*, compact?:*}} [p.actions]               large : visible au-dessus de 1000 px ;
 *                                                            compact : en dessous, si le script a démarré
 * @param {"site"|"document"|"admin"} [p.variante]           site : olive jusqu'au défilement ;
 *                                                            document : barre olive fixe, actions toujours visibles (page CV)
 */
export function EnTete({ marque, navigation = "", actions = {}, variante = "site" }) {
  return html`<header${attributs({ class: classes("en-tete", `en-tete--${variante}`, (variante === "site" || variante === "document") && "ilot-olive"), "data-en-tete": variante })}><a class="en-tete__marque"${attributs({ href: marque.href, "aria-label": marque.libelle })}><svg aria-hidden="true" focusable="false"><use href="#logo-mk-header"></use></svg></a>${navigation ? html`<div class="en-tete__navigation">${navigation}</div>` : ""}<div class="en-tete__actions">${actions.large ? html`<div class="en-tete__large">${actions.large}</div>` : ""}${actions.compact ? html`<div class="en-tete__compact">${actions.compact}</div>` : ""}</div></header>`;
}

/**
 * Navigateur : la barre du site quitte l'olive au premier défilement.
 * Le contexte change par la classe .ilot-olive : couleurs, logo et
 * boutons suivent d'eux-mêmes.
 */
export function activerEnTete(entete) {
  if (!entete || entete.dataset.enTete !== "site") return;
  const mettreAJour = () => {
    const defile = window.scrollY > 40;
    entete.classList.toggle("est-defile", defile);
    entete.classList.toggle("ilot-olive", !defile);
  };
  document.addEventListener("scroll", mettreAJour, { passive: true });
  mettreAJour();
}
