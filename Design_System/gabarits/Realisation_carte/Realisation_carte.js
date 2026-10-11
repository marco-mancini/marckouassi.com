import { html, attributs } from "../../fondations/rendu.js";
import { Galerie } from "../../composants/Galerie/Galerie.js";
import { Pastille } from "../../composants/Pastille/Pastille.js";
import { SigneOuverture } from "../../composants/Bouton/Bouton.js";
import { media, numero } from "../outils.js";

/**
 * REALISATION_CARTE — la carte d'une réalisation isolée, pour TOUTES les
 * catégories.
 *
 * POURQUOI CE GABARIT EXISTE. Une catégorie peut porter des réalisations
 * isolées plutôt que des projets complets. Leur carte était composée dans
 * la section « Réalisations », ce qui revenait à donner sa propre
 * composition à chaque catégorie. Elle vit désormais ici, une seule fois :
 * une catégorie fournit des DONNÉES, jamais une mise en page.
 *
 * LE CADRE. La carte est un paysage 15 × 10 à fond papier, cerné d'un filet.
 * La galerie « vitrine » le remplit et contient les visuels : une planche de
 * marque, une affiche ou une photo y entre ENTIÈRE, jamais rognée.
 *
 * Ce gabarit ne lit ni le catalogue, ni la catégorie, ni aucun libellé : il
 * reçoit la vue résolue par `vueRealisation`.
 */

/**
 * VUE D'UNE RÉALISATION — tout ce dont la carte a besoin, résolu une fois.
 *
 * @param {object} p
 * @param {object} p.realisation   enregistrement d'une réalisation
 * @param {object} p.ctx           contexte de langue et de page
 * @param {string} p.chemin        chemin de la réalisation dans les données
 * @param {number} p.rang          position dans la catégorie
 */
export function vueRealisation({ realisation, ctx, chemin, rang }) {
  const entrees = realisation.medias ?? (realisation.media ? [realisation.media] : []);
  const libelle = ctx.c(realisation.libelle, `${chemin}.libelle`);
  return {
    libelle,
    libelleHtml: ctx.l(realisation.libelle, `${chemin}.libelle`),
    descriptionHtml: ctx.l(realisation.description, `${chemin}.description`),
    numero: ctx.t("formats.numeroProjet", { numero: numero(rang) }),
    medias: entrees.map((entree, i) => media(ctx, entree, {
      motifAlt: realisation.altImages, rang: i,
      chemin: `${chemin}.medias.${i}`, cheminMotif: `${chemin}.altImages`,
    })),
  };
}

/**
 * @param {object} p
 * @param {object} p.vue   sortie de `vueRealisation`
 */
export function Realisation_carte({ vue }) {
  return html`<article${attributs({ class: "realisation-carte", "data-apparition": "bas" })}><div class="realisation-carte__cadre">${
    Galerie({
      medias: vue.medias, variante: "vitrine", etiquette: vue.libelle,
      // Le signe attend derriere [hidden] : c'est « activerVisionneuse » qui le
      // decouvre, en meme temps qu'il rend les visuels cliquables. Sans script,
      // aucune fleche ne promet une ouverture qui n'aurait pas lieu.
      superposition: html`<span hidden data-vitrine-signe>${SigneOuverture()}</span>`,
    })
  }</div><header class="realisation-carte__entete">${
    Pastille({ texte: vue.numero, variante: "contour" })
  }<div class="realisation-carte__nom"><h3 class="realisation-carte__titre">${vue.libelleHtml}</h3><p class="realisation-carte__sous-titre">${vue.descriptionHtml}</p></div></header></article>`;
}
