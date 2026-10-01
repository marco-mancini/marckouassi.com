import { html } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Signature } from "../../composants/Signature/Signature.js";
import { Sceau } from "../../composants/Sceau/Sceau.js";
import { Media } from "../../composants/Media/Media.js";
import { texteEnrichi } from "../../composants/Accent/Accent.js";
import { credit } from "./commun.js";
import { media } from "../outils.js";

/** À propos — portrait, signature et sceau, accroche, affirmation, détail. */
export function Apropos({ section, contenu, ctx }) {
  const chemin = `sections.${section.id}`;
  const grand = (texte) => texteEnrichi(texte, { grand: true });
  return Planche({
    ton: "olive", id: section.id, classe: "apropos", credit: credit(section, contenu.sections, ctx),
    contenu: html`<div class="apropos__disposition"><div class="apropos__portrait">${Media({ media: media(ctx, section.portrait, { chemin: `${chemin}.portrait` }), cadre: "arrondi", zoom: true })}</div><div class="apropos__texte"><div class="apropos__tete">${Signature({ niveau: 2, echelle: "section", id: idTitre(section.id), textes: { salutation: ctx.c(section.signature.salutation, `${chemin}.signature.salutation`), accent: ctx.c(section.signature.accent, `${chemin}.signature.accent`), mot: ctx.c(section.signature.mot, `${chemin}.signature.mot`) } })}${Sceau({ taille: "grand" })}</div><div class="apropos__copie"><p class="apropos__accroche texte-accroche">${ctx.l(section.accroche, `${chemin}.accroche`, grand)}</p><p class="apropos__affirmation texte-affirmation">${ctx.l(section.affirmation, `${chemin}.affirmation`, grand)}</p><p class="apropos__detail texte-corps">${ctx.l(section.detail, `${chemin}.detail`, texteEnrichi)}</p></div></div></div>`,
  });
}
