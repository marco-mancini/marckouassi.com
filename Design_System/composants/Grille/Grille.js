import { html, attributs, classes, brut } from "../../fondations/rendu.js";

/**
 * Grille — disposition en colonnes, fixe ou à largeur minimale.
 *
 * @param {object} p
 * @param {Array} p.elements                     HTML déjà rendu, un par cellule
 * @param {number[]} [p.colonnes]               [large, compact ≤850, téléphone ≤390]
 * @param {string|null} [p.min]                 largeur minimale d'une colonne (jeton) : mode auto-fit
 * @param {string[]} [p.espace]                 [espace, espace compact] : valeurs de jetons
 * @param {{balise?:string, etiquette?:string, alignement?:"debut"|"fin"|"etirer"}} [p.conteneur]
 */
export function Grille({ elements, colonnes = [1, 1, 1], min = null, espace = ["var(--space-5)"], conteneur = {} }) {
  const { balise = "div", etiquette = null, alignement = "etirer" } = conteneur;
  const [large, compact = large, telephone = compact] = colonnes;
  const [ecart, ecartCompact = ecart] = espace;
  const style = [
    `--grille-colonnes: ${large}`, `--grille-colonnes-compact: ${compact}`, `--grille-colonnes-telephone: ${telephone}`,
    `--grille-espace: ${ecart}`, `--grille-espace-compact: ${ecartCompact}`, min && `--grille-min: ${min}`,
  ].filter(Boolean).join("; ");
  const b = brut(balise);
  return html`<${b}${attributs({ class: classes("grille", min && "grille--auto", `grille--${alignement}`), style, "aria-label": etiquette })}>${elements}</${b}>`;
}
