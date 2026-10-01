import { html, attributs, brut } from "../../fondations/rendu.js";

/**
 * TexteProgressif — texte qui s'écrit caractère par caractère.
 *
 * Le texte complet est dans le HTML : lu d'emblée par les lecteurs
 * d'écran (copie masquée), affiché en entier sans JavaScript. Le script
 * ne fait que rejouer l'écriture de la copie visible.
 *
 * @param {object} p
 * @param {string} p.texte
 * @param {string} [p.balise]
 * @param {string|null} [p.lang]   langue du texte si elle diffère de la page
 */
export function TexteProgressif({ texte, balise = "p", lang = null }) {
  const b = brut(balise);
  return html`<${b}${attributs({ class: "texte-progressif", lang, "data-texte-progressif": true })}><span class="visually-hidden">${texte}</span><span class="texte-progressif__visible" aria-hidden="true">${texte}</span></${b}>`;
}

/**
 * Navigateur uniquement : écrit le texte. Promesse résolue à la fin.
 * Réduction des animations : affichage immédiat.
 */
export function ecrire(element, { reduit = false } = {}) {
  const visible = element.querySelector(".texte-progressif__visible");
  if (!visible) return Promise.resolve();
  const texte = visible.textContent;
  if (reduit) return Promise.resolve();
  const pas = parseFloat(getComputedStyle(element).getPropertyValue("--texte-progressif-pas")) || 28;
  visible.textContent = "";
  element.classList.add("est-en-cours");
  return new Promise((resoudre) => {
    let rang = 0;
    const suivant = () => {
      visible.textContent = texte.slice(0, ++rang);
      if (rang < texte.length) setTimeout(suivant, pas);
      else { element.classList.remove("est-en-cours"); resoudre(); }
    };
    suivant();
  });
}
