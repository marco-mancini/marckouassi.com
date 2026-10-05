import { html, attributs, classes } from "../../fondations/rendu.js";
import { Media } from "../Media/Media.js";
import { Bouton } from "../Bouton/Bouton.js";
import { Modale, ouvrirModale } from "../Modale/Modale.js";

// Trois medias : la grande image, et deux qui l'accompagnent dans la colonne
// de droite. La rangee du bas alourdissait la carte sans rien dire de plus —
// l'etude complete, elle, montre tout.
const APERCU_MAX = 3;

const REGLAGES = {
  apercu: { cadre: "vignette", ajustement: "recadrer", zoom: true },
  // « contenir », et pas « recadrer » : les visuels des etudes sont des pages
  // et des planches, de sept formats differents du 16:9 au portrait. Remplir
  // la case coupait leurs bords — le S de SOMMAIRE, la premiere lettre des
  // titres. Le filet clair tient la forme, l'image reste entiere.
  detail: { cadre: "detail", ajustement: "contenir", zoom: true },
  bande: { cadre: "passe-partout", ajustement: "recadrer", zoom: false },
};

/**
 * Galerie — grille de médias, le premier mis en avant.
 *
 * @param {object} p
 * @param {Array} p.medias                               objets média (voir Media)
 * @param {"apercu"|"detail"|"bande"} [p.variante]
 * @param {string|null} [p.etiquette]                    nom accessible du groupe
 * @param {*} [p.superposition]                          action posée sur la galerie (ex. ouvrir)
 * @param {number|null} [p.premieres]                    images montrées d'emblée ; les
 *        autres attendent derrière un seul bouton, qui les déplie toutes d'un
 *        coup. Sans JavaScript, aucun bouton n'est posé et TOUTES les images
 *        restent visibles : une commande qui ne commande rien vaut moins que
 *        pas de commande, et une image cachée pour toujours vaudrait encore
 *        moins.
 * @param {string|null} [p.libelleAutres]                libellé de ce bouton, avec {nombre}
 */
export function Galerie({ medias = [], variante = "apercu", etiquette = null, superposition = null, premieres = null, libelleAutres = null }) {
  const liste = variante === "apercu" ? medias.slice(0, APERCU_MAX) : medias;
  const reglage = REGLAGES[variante];
  // Le modèle dort dans un <template> : c'est le navigateur qui le pose, et
  // lui seul sait paginer. Le libellé vient du dictionnaire, par le gabarit.
  const replie = premieres && liste.length > premieres;
  const modele = replie
    ? html`<template data-galerie-modele-autres>${Bouton({ texte: String(libelleAutres ?? "").replace("{nombre}", String(liste.length - premieres)), variante: "contour", options: { icone: "bas", attributs: { "data-galerie-autres": "" } } })}</template>`
    : "";
  return html`<div${attributs({ class: classes("galerie", `galerie--${variante}`), "data-nombre": liste.length, "data-galerie-premieres": replie ? String(premieres) : null, role: etiquette ? "group" : null, "aria-label": etiquette })}>${liste.map((media, rang) =>
    html`<div class="${classes("galerie__element", rang === 0 && "galerie__element--principal", rang === 1 && "galerie__element--second")}">${Media({ media, ...reglage })}</div>`
  )}${modele}${superposition ? html`<div class="galerie__superposition">${superposition}</div>` : ""}</div>`;
}

/**
 * DÉPLIAGE DES GALERIES — navigateur uniquement.
 *
 * Une galerie repliée montre ses premières images, puis UN bouton qui dit
 * combien il en reste et les ouvre toutes d'un coup. Un clic, pas quatre : le
 * visiteur n'a jamais à deviner où il en est.
 *
 * Idempotent : une galerie déjà branchée est ignorée, ce qui permet de
 * rappeler la fonction après chaque chargement d'étude dans la modale.
 */
export function activerGaleries(racine = document) {
  for (const galerie of racine.querySelectorAll("[data-galerie-premieres]")) {
    if (galerie.dataset.galerieDepliee) continue;
    galerie.dataset.galerieDepliee = "1";
    const premieres = Number(galerie.dataset.galeriePremieres);
    const modele = galerie.querySelector("[data-galerie-modele-autres]");
    const elements = [...galerie.querySelectorAll(".galerie__element")];
    if (!modele || !premieres || elements.length <= premieres) continue;
    const bouton = document.importNode(modele.content, true).firstElementChild;
    const enveloppe = document.createElement("div");
    enveloppe.className = "galerie__autres";
    enveloppe.append(bouton);
    elements.forEach((element, rang) => { element.hidden = rang >= premieres; });
    // Hors de la grille : a l'interieur, le bouton heritait de la hauteur
    // d'une rangee et s'etirait en ellipse.
    galerie.after(enveloppe);
    bouton.addEventListener("click", () => {
      elements.forEach((element) => { element.hidden = false; });
      // Le bouton a fait son travail : il s'efface plutot que de rester la
      // sans rien a ouvrir. Le focus passe a la premiere image revelee.
      enveloppe.remove();
      elements[premieres]?.focus?.();
    });
  }
}

/**
 * VISIONNEUSE — le réceptacle plein écran d'une image, partagé par la page.
 *
 * Elle est posée UNE fois par page, comme la modale d'étude : les images n'y
 * entrent qu'à la demande. Vide tant que personne n'a cliqué.
 */
export function Visionneuse({ ctx }) {
  return Modale({
    id: "visionneuse",
    etiquette: ctx.t("projet.images"),
    // Les deux libelles voyagent avec le receptacle : le navigateur n'a pas
    // le dictionnaire, et aucun texte ne doit etre ecrit dans le script.
    entete: html`<p${attributs({ class: "visionneuse__compteur", "data-visionneuse-compteur": "", "data-modele": ctx.t("projet.imageCompteur"), "data-agrandir": ctx.t("projet.agrandir") })}></p>`,
    contenu: html`<div class="visionneuse__scene"><div class="visionneuse__image" data-visionneuse-image></div></div><div class="visionneuse__commandes">${Bouton({
      texte: ctx.t("projet.imagePrecedente"), variante: "contour", forme: "rond", options: { icone: "retour", iconeSeule: true, taille: "grand", attributs: { "data-visionneuse-precedent": "" } },
    })}${Bouton({
      texte: ctx.t("projet.imageSuivanteSeule"), variante: "contour", forme: "rond", options: { icone: "suite", iconeSeule: true, taille: "grand", attributs: { "data-visionneuse-suivant": "" } },
    })}</div>`,
    options: { variante: "plein-ecran", libelleFermer: ctx.t("projet.fermer") },
  });
}

/**
 * OUVERTURE PLEIN ÉCRAN DES IMAGES — navigateur uniquement.
 *
 * Chaque image d'une galerie d'étude devient une commande : elle s'ouvre en
 * grand dans la visionneuse, et les flèches — celles de l'écran comme celles
 * du clavier — passent à la suivante ou à la précédente. Le parcours couvre
 * TOUTE la galerie, pas la seule page affichée : agrandir ne doit pas enfermer
 * le visiteur dans la page où il se trouvait.
 *
 * Sans JavaScript, aucune image n'annonce qu'elle s'agrandit, et aucune ne le
 * fait : la grille reste une grille, entière et lisible.
 */
export function activerVisionneuse(racine = document) {
  const commande = brancherVisionneuse();
  if (!commande) return;
  for (const galerie of racine.querySelectorAll(".galerie--detail")) {
    if (galerie.dataset.galerieAgrandie) continue;
    galerie.dataset.galerieAgrandie = "1";
    const cases = [...galerie.querySelectorAll(".galerie__element")];
    cases.forEach((element, index) => {
      if (!element.querySelector("img")) return;
      // La case devient une commande : seul le navigateur la pose, donc elle
      // n'existe jamais sans le comportement qui va avec.
      element.setAttribute("role", "button");
      element.setAttribute("tabindex", "0");
      element.setAttribute("aria-haspopup", "dialog");
      element.setAttribute("aria-label", commande.libelleAgrandir);
      const ouvrir = () => commande.ouvrir(cases.map((autre) => autre.querySelector("img")).filter(Boolean), index, element);
      element.addEventListener("click", ouvrir);
      element.addEventListener("keydown", (evenement) => {
        if (evenement.key !== "Enter" && evenement.key !== " ") return;
        if (evenement.target !== element) return;
        evenement.preventDefault();
        ouvrir();
      });
    });
  }
}

/**
 * Branche la visionneuse de la page, UNE SEULE FOIS, et rend sa commande.
 *
 * activerVisionneuse est rappelee a chaque etude chargee dans la modale :
 * sans ce verrou, chaque appel reposait un ecouteur sur les memes fleches, et
 * les parcours se marchaient dessus.
 */
const VISIONNEUSES = new WeakMap();

function brancherVisionneuse() {
  const dialogue = document.getElementById("visionneuse");
  if (!dialogue) return null;
  if (VISIONNEUSES.has(dialogue)) return VISIONNEUSES.get(dialogue);

  const scene = dialogue.querySelector("[data-visionneuse-image]");
  const compteur = dialogue.querySelector("[data-visionneuse-compteur]");
  const precedent = dialogue.querySelector("[data-visionneuse-precedent]");
  const suivant = dialogue.querySelector("[data-visionneuse-suivant]");
  const libelleCompteur = compteur.dataset.modele || "";
  let images = [];
  let rang = 0;

  const montrer = () => {
    const source = images[rang];
    if (!source) return;
    const copie = source.cloneNode(true);
    for (const attribut of ["loading", "width", "height", "fetchpriority"]) copie.removeAttribute(attribut);
    scene.replaceChildren(copie);
    compteur.textContent = libelleCompteur
      .replace("{numero}", String(rang + 1).padStart(2, "0"))
      .replace("{total}", String(images.length).padStart(2, "0"));
    const seule = images.length < 2;
    precedent.hidden = seule;
    suivant.hidden = seule;
  };
  const deplacer = (pas) => {
    if (!images.length) return;
    rang = (rang + pas + images.length) % images.length;
    montrer();
  };

  precedent.addEventListener("click", () => deplacer(-1));
  suivant.addEventListener("click", () => deplacer(1));
  dialogue.addEventListener("keydown", (evenement) => {
    if (evenement.key === "ArrowLeft") { evenement.preventDefault(); deplacer(-1); }
    if (evenement.key === "ArrowRight") { evenement.preventDefault(); deplacer(1); }
  });

  const commande = {
    libelleAgrandir: compteur.dataset.agrandir || "",
    ouvrir(liste, depart, declencheur) {
      images = liste;
      rang = depart;
      montrer();
      ouvrirModale(dialogue, declencheur);
    },
  };
  VISIONNEUSES.set(dialogue, commande);
  return commande;
}
