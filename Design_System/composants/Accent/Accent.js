import { html, brut, echapper, classes, Html } from "../../fondations/rendu.js";

/**
 * Accent — fragment mis en valeur dans un texte courant.
 *
 * @param {object} p
 * @param {string} p.texte
 * @param {boolean} [p.grand]  texte de 24 px et plus : le doré de grand texte tient son seuil
 */
export function Accent({ texte, grand = false }) {
  return html`<b class="${classes("accent", grand && "accent--grand")}">${texte}</b>`;
}

/**
 * Texte enrichi — la seule syntaxe permise dans les textes du contenu :
 *   **fragment**  → Accent
 *   saut de ligne → <br>
 * Tout le reste est échappé. C'est ce qui remplace le balisage écrit
 * directement dans les paragraphes de l'ancienne page.
 */
export function texteEnrichi(texte, { grand = false } = {}) {
  if (texte instanceof Html) return texte;
  const morceaux = String(texte ?? "").split(/(\*\*[^*]+\*\*)/g);
  const sortie = morceaux.map((morceau) => {
    const accent = morceau.match(/^\*\*([^*]+)\*\*$/);
    if (accent) return String(Accent({ texte: accent[1], grand }));
    return echapper(morceau).replace(/\n/g, "<br>");
  });
  return brut(sortie.join(""));
}
