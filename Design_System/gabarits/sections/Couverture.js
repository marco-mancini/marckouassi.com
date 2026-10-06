import { html } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Signature } from "../../composants/Signature/Signature.js";
import { Sceau } from "../../composants/Sceau/Sceau.js";
import { Champ } from "../../composants/Champ/Champ.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Grille } from "../../composants/Grille/Grille.js";
import { nombreEnLettres, plageDesProjets } from "../outils.js";

/**
 * Couverture — signature, rôle, promesse, sceau, et trois faits.
 * Un fait est soit une valeur du contenu, soit un calcul (« selection » :
 * nombre de projets en lettres et plage de leurs années), soit un lien.
 */
/** La part d'un fait qui tombe sur un ecran etroit. */
const detail = (contenu) => html`<span class="couverture__detail">${contenu}</span>`;

export function Couverture({ section, contenu, ctx }) {
  const chemin = `sections.${section.id}`;
  const valeurFait = (fait, rang) => {
    if (fait.calcul === "selection") {
      // Le nombre d'abord, la plage ensuite : sur un ecran etroit, seule la
      // seconde tombe. Elle est un detail, pas le fait.
      return html`${ctx.t("formats.selection", { nombre: nombreEnLettres(contenu.projets.length, ctx, { majuscule: true }) })}${detail(ctx.t("formats.selectionPlage", { plage: plageDesProjets(contenu.projets, ctx) }))}`;
    }
    if (fait.lien) return Bouton({ texte: ctx.c(fait.lien.texte, `${chemin}.faits.${rang}.lien.texte`), variante: "texte", href: `#${fait.lien.cible}`, options: { icone: "bas" } });
    // Un fait peut porter un complement : la part que l'ecran etroit laisse
    // tomber, nommee par la DONNEE et jamais devinee par le gabarit.
    const valeur = ctx.l(fait.valeur, `${chemin}.faits.${rang}.valeur`);
    return fait.complement ? html`${valeur}${detail(ctx.l(fait.complement, `${chemin}.faits.${rang}.complement`))}` : valeur;
  };
  const faits = section.faits.map((fait, rang) => Champ({ etiquette: ctx.c(fait.etiquette, `${chemin}.faits.${rang}.etiquette`), contenu: valeurFait(fait, rang), variante: "fait" }));
  return Planche({
    ton: "olive", id: section.id, classe: "couverture",
    contenu: html`<p class="couverture__edition texte-etiquette">${ctx.l(section.edition, `${chemin}.edition`)}</p><div class="couverture__disposition"><div class="couverture__titre">${Signature({ niveau: 1, echelle: "couverture", id: idTitre(section.id), textes: { salutation: ctx.c(section.signature.salutation, `${chemin}.signature.salutation`), accent: ctx.c(section.signature.accent, `${chemin}.signature.accent`), mot: ctx.c(section.signature.mot, `${chemin}.signature.mot`) } })}<p class="couverture__role texte-etiquette">${ctx.l(section.role, `${chemin}.role`)}</p><p class="couverture__promesse">${ctx.l(section.promesse, `${chemin}.promesse`)}</p></div><div class="couverture__sceau">${Sceau({ taille: "couverture", libelle: ctx.t("accessibilite.monogramme") })}</div></div><div class="couverture__faits">${Grille({ elements: faits, colonnes: [3, 2, 2], espace: ["var(--cover-bottom-gap)", "var(--space-4) var(--space-3)"], conteneur: { alignement: "fin" } })}</div>`,
  });
}
