import { html, attributs } from "../../fondations/rendu.js";
import { Galerie, activerGaleries, activerVisionneuse } from "../../composants/Galerie/Galerie.js";
import { Pastille } from "../../composants/Pastille/Pastille.js";
import { SigneOuverture } from "../../composants/Bouton/Bouton.js";
import { ouvrirModale } from "../../composants/Modale/Modale.js";
import { Projet_etude } from "../Projet_etude/Projet_etude.js";
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
 * CE QU'UNE RÉALISATION N'A PAS, et qu'un projet a : un identifiant, une
 * page dédiée, des années. Sa fiche ne peut donc pas être chargée depuis une
 * page comme l'est une étude ; elle est rendue AVEC la carte, dans le flux.
 *
 * PROGRESSIVITÉ. Sans JavaScript, la fiche reste dans la page, lisible : le
 * texte n'est jamais perdu. Dès que le script a démarré, elle est repliée,
 * la carte devient une commande et la fiche s'ouvre dans la modale partagée
 * du sommaire — celle des études. Aucune flèche n'apparaît avant que le
 * comportement ne soit posé.
 */

/**
 * VUE D'UNE RÉALISATION — la même forme que celle d'un projet, pour que
 * l'étude commune sache la rendre sans rien savoir d'elle.
 *
 * Les champs de texte sont tous FACULTATIFS : ce que la donnée ne porte pas
 * ne s'affiche pas.
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
  const id = `${chemin.replace(/\./g, "-")}`;
  const champ = (valeur, nom, cle) => (valeur ? [{ etiquette: ctx.t(cle), contenu: ctx.l(valeur, `${chemin}.${nom}`) }] : []);
  return {
    id,
    titre: libelle,
    libelleHtml: ctx.l(realisation.libelle, `${chemin}.libelle`),
    descriptionHtml: ctx.l(realisation.description, `${chemin}.description`),
    // La rubrique de la fiche : la catégorie propre à la réalisation si elle
    // en porte une, sinon la ligne qui accompagne déjà son titre.
    categorieHtml: ctx.l(realisation.categorie ?? realisation.description, `${chemin}.${realisation.categorie ? "categorie" : "description"}`),
    contexteHtml: realisation.contexte ? ctx.l(realisation.contexte, `${chemin}.contexte`) : "",
    ideeHtml: realisation.idee ? ctx.l(realisation.idee, `${chemin}.idee`) : "",
    periode: null,
    document: null,
    champs: [...champ(realisation.role, "role", "projet.role")],
    // Pas d'identifiant de titre : la fiche vit dans le flux ET entre dans la
    // modale. Deux elements porteraient le meme id. Le dialogue se nomme donc
    // par aria-label, avec le titre de la realisation.
    idEtude: null,
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
 * @param {object} p.ctx
 */
export function Realisation_carte({ vue, ctx }) {
  return html`<article${attributs({ class: "realisation-carte", "data-apparition": "bas", "data-realisation": vue.id })}><div${attributs({
    class: "realisation-carte__cadre", "data-realisation-entree": "", "aria-label": ctx.t("projet.ouvrirFiche", { titre: vue.titre }),
  })}>${Galerie({
    medias: vue.medias, variante: "vitrine", etiquette: vue.titre,
    // Le signe attend derrière [hidden] : c'est le script qui le découvre, en
    // même temps qu'il rend la carte cliquable. Sans script, aucune flèche ne
    // promet une ouverture qui n'aurait pas lieu.
    superposition: html`<span hidden data-vitrine-signe>${SigneOuverture()}</span>`,
  })}</div><header class="realisation-carte__entete">${
    Pastille({ texte: vue.numero, variante: "contour" })
  }<div class="realisation-carte__nom"><h3 class="realisation-carte__titre">${vue.libelleHtml}</h3><p class="realisation-carte__sous-titre">${vue.descriptionHtml}</p></div></header><div class="realisation-carte__fiche" data-realisation-fiche>${
    Projet_etude({ vue, ctx, niveau: 3 })
  }</div></article>`;
}

/* ------------------------------------------------------------------ */
/* Comportement — navigateur uniquement.                               */
/* ------------------------------------------------------------------ */

/**
 * La carte devient une commande, et sa fiche s'ouvre dans la modale partagée.
 *
 * Idempotent : une carte déjà branchée est ignorée.
 */
export function activerRealisations(racine = document) {
  const dialogue = document.getElementById("etude");
  if (!dialogue) return;
  const corps = dialogue.querySelector(".modale__corps");
  const compteur = dialogue.querySelector("[data-etude-compteur]");
  for (const carte of racine.querySelectorAll("[data-realisation]")) {
    if (carte.dataset.realisationBranchee) continue;
    carte.dataset.realisationBranchee = "1";
    const entree = carte.querySelector("[data-realisation-entree]");
    const fiche = carte.querySelector("[data-realisation-fiche]");
    if (!entree || !fiche) continue;
    carte.querySelector("[data-vitrine-signe]")?.removeAttribute("hidden");
    entree.setAttribute("role", "button");
    entree.setAttribute("tabindex", "0");
    entree.setAttribute("aria-haspopup", "dialog");
    const ouvrir = () => {
      corps.replaceChildren(document.importNode(fiche.firstElementChild, true));
      activerGaleries(corps);
      activerVisionneuse(corps);
      corps.scrollTop = 0;
      compteur.textContent = "";
      dialogue.removeAttribute("aria-labelledby");
      dialogue.setAttribute("aria-label", entree.getAttribute("aria-label") || "");
      ouvrirModale(dialogue, entree);
    };
    entree.addEventListener("click", ouvrir);
    entree.addEventListener("keydown", (evenement) => {
      if (evenement.key !== "Enter" && evenement.key !== " ") return;
      if (evenement.target !== entree) return;
      evenement.preventDefault();
      ouvrir();
    });
  }
}
