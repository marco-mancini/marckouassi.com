/**
 * PARTAGE — la carte de partage (og:image) : 1200 × 630, une par langue (#184).
 *
 * Composition, pas composant : le portrait de « À propos » devant le sceau
 * complet sur fond vert (Sceau, taille « partage »), et à droite la signature de la
 * couverture (Signature, échelle « partage »). Aucun texte ici : tout vient de
 * la section couverture et du portrait, exactement comme sur le site.
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
    edition: ctx.c(couverture.edition, `${chemin}.edition`),
    salutation: ctx.c(couverture.signature.salutation, `${chemin}.signature.salutation`),
    accent: ctx.c(couverture.signature.accent, `${chemin}.signature.accent`),
    mot: ctx.c(couverture.signature.mot, `${chemin}.signature.mot`),
    role: ctx.c(couverture.role, `${chemin}.role`),
    promesse: ctx.c(couverture.promesse, `${chemin}.promesse`),
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
<p class="partage__edition">${textes.edition}</p>
${Signature({ niveau: 1, echelle: "partage", textes })}
<p class="partage__role">${textes.role}</p>
<p class="partage__promesse">${textes.promesse}</p>
</div>
</div>`;
}
