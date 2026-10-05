/**
 * GABARIT_PROJET — le système de référence d'un projet.
 *
 * POURQUOI CETTE COUCHE EXISTE. Avant elle, un projet était rendu à trois
 * endroits qui ne se parlaient pas : la carte du sommaire, l'étude, la page
 * dédiée. Chacun recalculait le chemin de données, le titre et la liste des
 * médias — la même expression de résolution des médias était écrite deux fois,
 * mot pour mot. Surtout, le CONTRAT qui relie la carte à la modale
 * (`data-etude`, `data-compteur`, `aria-haspopup`, l'identifiant
 * `etude-<id>` repris en `aria-labelledby`) était éparpillé sur trois
 * fichiers : en changer un seul membre cassait l'ouverture sans qu'aucun
 * fichier ne le dise. Ce contrat vit désormais ici, en un seul endroit.
 *
 * CE QUE CE GABARIT CONTRÔLE : la représentation d'un projet, quel que soit
 * l'endroit où il apparaît, et le comportement commun à tous les projets
 * (ouverture, fermeture, parcours, filtrage, branchement).
 *
 * CE QU'IL NE CONTRÔLE PAS, et ne doit jamais contrôler :
 *   - les DONNÉES : elles vivent dans `content/projets.json`, toujours ;
 *   - le CATALOGUE : il vit dans la section « Réalisations » ;
 *   - le DESSIN : chaque mode délègue à son gabarit spécialisé, qui garde
 *     ses classes et sa feuille de style.
 *
 * Aucune liste de projets, aucune liste de catégories, aucun titre, aucune
 * image, aucun libellé n'est écrit dans ce fichier.
 */
import { html } from "../../fondations/rendu.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { media, numero, periodeProjet } from "../outils.js";
import { Projet_carte } from "../Projet_carte/Projet_carte.js";
import { Projet_etude, ModaleEtude, activerEtudes } from "../Projet_etude/Projet_etude.js";

/**
 * Les modes d'affichage d'un projet. Ajouter un mode, c'est ajouter une
 * entrée ici et une branche dans `Gabarit_Projet` — jamais un nouveau
 * chemin de rendu parallèle.
 *
 *   carte   le projet dans le catalogue (sommaire)
 *   etude   l'étude complète, texte et galerie
 *   modale  le réceptacle partagé où l'étude est chargée à la demande
 *   page    la page dédiée /projets/<id>/
 */
export const MODES = Object.freeze(["carte", "etude", "modale", "page"]);

/**
 * VUE D'UN PROJET — tout ce dont un mode a besoin, résolu une seule fois.
 *
 * Chaque mode lit cette vue et n'interroge plus `projet` directement. C'est
 * ce qui garantit qu'un titre, un média ou un identifiant est calculé de la
 * même façon dans la carte, dans l'étude et sur la page.
 *
 * @param {object} p
 * @param {object} p.projet        enregistrement de content/projets.json
 * @param {object} p.ctx           contexte de langue et de page
 * @param {number|null} [p.rang]   position dans l'ensemble des projets
 * @param {number|null} [p.total]  nombre de projets
 */
export function vueProjet({ projet, ctx, rang = null, total = null }) {
  const chemin = `projets.${projet.id}`;
  const numerote = rang !== null && total !== null;
  const titre = ctx.c(projet.titre, `${chemin}.titre`);
  return {
    id: projet.id,
    chemin,
    titre,
    titreHtml: ctx.l(projet.titre, `${chemin}.titre`),
    // Deux formes de la même valeur : le texte brut entre dans un modèle du
    // dictionnaire (« {categorie} · {periode} »), le HTML porte le balisage
    // lang="…" quand la traduction manque et qu'on retombe sur le français.
    categorie: ctx.c(projet.categorie, `${chemin}.categorie`),
    categorieHtml: ctx.l(projet.categorie, `${chemin}.categorie`),
    // Résumé du projet en texte brut : sert la description de sa page.
    description: ctx.c(projet.contexte, `${chemin}.contexte`),
    contexteHtml: ctx.l(projet.contexte, `${chemin}.contexte`),
    ideeHtml: ctx.l(projet.idee, `${chemin}.idee`),
    valeurHtml: ctx.l(projet.valeur, `${chemin}.valeur`),
    periode: periodeProjet(projet, ctx),
    categoriePrincipale: projet.categoriePrincipale,
    lien: ctx.pageProjet(projet),
    // L'identifiant du titre de l'étude. La modale le reprend en
    // `aria-labelledby` : les deux doivent toujours s'accorder.
    idEtude: `etude-${projet.id}`,
    numero: numerote ? ctx.t("formats.numeroProjet", { numero: numero(rang) }) : null,
    compteur: numerote ? ctx.t("projet.compteur", { numero: numero(rang), total: String(total).padStart(2, "0") }) : null,
    // La même liste pour la carte et pour l'étude : seule la variante de
    // Galerie change. Résoudre deux fois, c'était risquer deux résultats.
    medias: (projet.medias || []).map((entree, i) => media(ctx, entree, {
      motifAlt: projet.altImages, rang: i, chemin: `${chemin}.medias.${i}`, cheminMotif: `${chemin}.altImages`,
    })),
    document: projet.document?.src
      ? { href: ctx.media(projet.document.src).src, libelle: projet.document.libelle ? ctx.c(projet.document.libelle, `${chemin}.document.libelle`) : ctx.t("projet.document") }
      : null,
    // Les disciplines ne sont plus montrées dans l'étude : elles répétaient la
    // catégorie posée juste au-dessus du titre. La donnée reste dans
    // content/projets.json, et MarcoS continue de la lire (connaissance.js).
    champs: [["projet.role", projet.role, "role"]]
      .map(([cle, valeur, nom]) => ({ etiquette: ctx.t(cle), contenu: ctx.l(valeur, `${chemin}.${nom}`) })),
    /**
     * LE CONTRAT D'OUVERTURE. Ces attributs, posés sur le lien d'entrée,
     * sont ce que `activerEtudes` lit pour charger l'étude dans la modale
     * et nommer le dialogue. Ils ne doivent exister qu'ici.
     */
    ouverture: {
      "data-etude": projet.id,
      "aria-haspopup": "dialog",
      ...(numerote ? { "data-compteur": ctx.t("projet.compteur", { numero: numero(rang), total: String(total).padStart(2, "0") }) } : {}),
    },
  };
}

/**
 * PARCOURS — la place d'un projet dans l'ensemble, et ses voisins.
 *
 * Fonction pure, sans DOM : c'est elle qui tient l'ordre de lecture. Elle
 * alimente aujourd'hui le compteur « Projet 07 / 11 » et constitue le siège
 * d'une navigation précédent / suivant, le jour où elle sera demandée — sans
 * qu'aucun autre fichier n'ait à connaître l'ordre des projets.
 *
 * @returns {{rang: number, total: number, precedent: object|null, suivant: object|null}}
 */
export function parcours(projets, id) {
  const liste = projets ?? [];
  const rang = liste.findIndex((p) => p.id === id);
  if (rang < 0) return { rang: -1, total: liste.length, precedent: null, suivant: null };
  return {
    rang,
    total: liste.length,
    precedent: liste[rang - 1] ?? null,
    suivant: liste[rang + 1] ?? null,
  };
}

/**
 * RENDU D'UN PROJET DANS UN MODE.
 *
 * Point d'entrée unique. Les modes partagent la même vue et les mêmes
 * primitives ; chacun délègue son dessin au gabarit spécialisé qui le porte.
 *
 * @param {object} p
 * @param {object|null} [p.projet]  requis sauf en mode « modale », qui rend un
 *                                  réceptacle vide, partagé par tous les projets
 * @param {object} p.ctx
 * @param {"carte"|"etude"|"modale"|"page"} [p.mode]
 * @param {object} [p.options]   rang, total (carte) · niveau (etude) · retour (page)
 */
export function Gabarit_Projet({ projet = null, ctx, mode = "carte", options = {} }) {
  if (!MODES.includes(mode)) throw new Error(`Gabarit_Projet : mode inconnu « ${mode} »`);
  // La modale est le seul mode sans projet : elle est le réceptacle, pas le
  // contenu. L'étude y est chargée à la demande, depuis la page du projet.
  if (mode === "modale") return ModaleEtude({ ctx });
  if (!projet) throw new Error(`Gabarit_Projet : le mode « ${mode} » exige un projet`);

  const vue = vueProjet({ projet, ctx, rang: options.rang ?? null, total: options.total ?? null });
  if (mode === "carte") return Projet_carte({ vue, ctx });
  if (mode === "etude") return Projet_etude({ vue, ctx, niveau: options.niveau ?? 1 });

  // Mode page : la planche du projet, retour compris. L'enveloppe du
  // document (en-tête, menu, métadonnées) reste à PageProjet : elle n'est
  // pas propre au projet.
  const retour = options.retour
    ? Bouton({ texte: ctx.t("projet.retour"), variante: "texte", href: options.retour, options: { icone: "retour" } })
    : "";
  return html`<section class="planche-scene" aria-labelledby="${vue.idEtude}"><div class="planche page-projet">${retour}${Projet_etude({ vue, ctx, niveau: 1, voisins: vuesVoisines(options.voisins, ctx) })}</div></section>`;
}

/**
 * LES DEUX VOISINS D'UN PROJET, RÉSOLUS COMME LUI.
 *
 * `parcours` donne les enregistrements ; ici ils passent par `vueProjet`, le
 * même chemin que le projet affiché. Les liens de parcours portent donc le
 * CONTRAT D'OUVERTURE : cliqués dans la modale, ils y chargent l'étude
 * suivante au lieu de quitter la page.
 */
function vuesVoisines(voisins, ctx) {
  if (!voisins) return null;
  const { rang, total, precedent, suivant } = voisins;
  const vue = (projet, decalage) => (projet ? vueProjet({ projet, ctx, rang: rang + decalage, total }) : null);
  return { precedent: vue(precedent, -1), suivant: vue(suivant, 1) };
}

/**
 * COMPORTEMENT COMMUN À TOUS LES PROJETS — navigateur uniquement.
 *
 * Un seul branchement pour l'ouverture des études, partout où une carte de
 * réalisation est rendue.
 *
 * Ajouter un comportement qui concerne TOUS les projets se fait ici, pas
 * dans chaque vue.
 */
export function activerProjets(racine = document) {
  activerEtudes(racine);
}
