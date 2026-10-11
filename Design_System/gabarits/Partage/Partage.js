/**
 * PARTAGE — la carte de partage (og:image) : 1200 × 630, une par langue (#184).
 *
 * Composition, pas composant : le portrait de « À propos » devant le sceau
 * complet sur fond vert (Sceau, taille « partage »), et à droite les deux mots
 * de la signature de la couverture en grand (Signature, échelle « partage »,
 * sans salutation), le rôle dessous. Décision de Marc du 11 octobre : ni
 * édition, ni nom manuscrit, ni promesse, illisibles en vignette. Aucun texte
 * ici : tout vient de la couverture et du portrait.
 *
 * La carte n'est jamais servie comme page : tools/partage.mjs la capture en
 * image (Public/images/Partage/). Le build ne fait que publier cette image.
 */
import { html, attributs } from "../../fondations/rendu.js";
import { Sceau } from "../../composants/Sceau/Sceau.js";
import { Signature } from "../../composants/Signature/Signature.js";

/**
 * Textes et portrait de la carte, résolus dans la langue du contexte, ou null.
 * Sert aussi d'empreinte : la carte publiée est périmée dès qu'ils changent.
 */
export function textesPartage({ contenu, ctx }) {
  const couverture = contenu.sections.find((section) => section.type === "couverture");
  const apropos = contenu.sections.find((section) => section.type === "apropos");
  // Sans couverture ni portrait, pas de carte : l'appelant le signale.
  if (!couverture || !apropos?.portrait?.src) return null;
  const chemin = `sections.${couverture.id}`;
  return {
    accent: ctx.c(couverture.signature.accent, `${chemin}.signature.accent`),
    mot: ctx.c(couverture.signature.mot, `${chemin}.signature.mot`),
    role: ctx.c(couverture.role, `${chemin}.role`),
    portrait: { src: apropos.portrait.src, alt: ctx.c(apropos.portrait.alt, `sections.${apropos.id}.portrait.alt`) },
  };
}

/**
 * @param {object} p
 * @param {object} p.contenu
 * @param {object} p.ctx  contexte de page ; ctx.media() résout le portrait
 */
export function CartePartage({ contenu, ctx }) {
  const textes = textesPartage({ contenu, ctx });
  if (!textes) return "";
  return html`<div class="partage">
<div class="partage__sceau">${Sceau({ taille: "partage" })}</div>
<img${attributs({ class: "partage__portrait", src: ctx.media(textes.portrait.src).src, alt: textes.portrait.alt })}>
<div class="partage__texte">
${Signature({ niveau: 1, echelle: "partage", textes: { accent: textes.accent, mot: textes.mot } })}
<p class="partage__role">${textes.role}</p>
</div>
</div>`;
}
