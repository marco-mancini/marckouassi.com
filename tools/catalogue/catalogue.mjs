/**
 * Catalogue du Design System : chaque composant rendu avec des DONNÉES
 * DE TEST, pour la vérification visuelle et les tests de navigateur.
 * Usage : node tools/catalogue/catalogue.mjs <fichier.html>   (dans _site, jamais publié)
 * Les textes ci-dessous sont des jeux d'essai, pas du contenu du site.
 */
import fs from "node:fs";
import path from "node:path";
import { html, brut } from "../../Design_System/fondations/rendu.js";
import { Planche } from "../../Design_System/composants/Planche/Planche.js";
import { Titre } from "../../Design_System/composants/Titre/Titre.js";
import { Signature } from "../../Design_System/composants/Signature/Signature.js";
import { texteEnrichi } from "../../Design_System/composants/Accent/Accent.js";
import { Champ } from "../../Design_System/composants/Champ/Champ.js";
import { Pastille } from "../../Design_System/composants/Pastille/Pastille.js";
import { Bouton } from "../../Design_System/composants/Bouton/Bouton.js";
import { Encart } from "../../Design_System/composants/Encart/Encart.js";
import { Carte } from "../../Design_System/composants/Carte/Carte.js";
import { Grille } from "../../Design_System/composants/Grille/Grille.js";
import { Pile } from "../../Design_System/composants/Pile/Pile.js";
import { Media } from "../../Design_System/composants/Media/Media.js";
import { Galerie } from "../../Design_System/composants/Galerie/Galerie.js";
import { Sceau } from "../../Design_System/composants/Sceau/Sceau.js";
import { Modale } from "../../Design_System/composants/Modale/Modale.js";
import { Message } from "../../Design_System/composants/Message/Message.js";
import { Navigation } from "../../Design_System/composants/Navigation/Navigation.js";
import { EnTete } from "../../Design_System/composants/EnTete/EnTete.js";
import { Segments } from "../../Design_System/composants/Segments/Segments.js";
import { Saisie } from "../../Design_System/composants/Saisie/Saisie.js";
import { Liste } from "../../Design_System/composants/Liste/Liste.js";
import { Televersement } from "../../Design_System/composants/Televersement/Televersement.js";
import { TexteProgressif } from "../../Design_System/composants/TexteProgressif/TexteProgressif.js";
import { deuxChiffres } from "../../Design_System/fondations/rendu.js";
import * as E from "./essai.mjs";

const sortie = process.argv[2] || "_site/catalogue.html";
const racine = path.relative(path.dirname(sortie), ".") || ".";
const sprite = fs.readFileSync("Design_System/assets/logos-sprite.svg", "utf8");
const img = (n) => ({ src: `Public/images/${n.replace(/\.(png|jpe?g)$/, ".webp")}`, alt: E.alt, largeur: 1600, hauteur: 1200 });

const liens = E.sections.map((s, i) => ({ libelle: s, href: `#s${i}`, numero: deuxChiffres(i + 1) }));
const page = html`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${E.titrePage}</title><link rel="stylesheet" href="Design_System/styles/Index.css"></head><body>${brut(sprite)}
${EnTete({ marque: { href: "#", libelle: E.marque }, navigation: Navigation({ liens, etiquette: E.nav }), actions: { large: Bouton({ texte: E.cta, href: "#", options: { icone: "externe" } }), compact: html`${Segments({ options: [{ libelle: "FR", href: "#", lang: "fr", actif: true }, { libelle: "EN", href: "#", lang: "en", nom: E.english }], etiquette: E.langue })}${Bouton({ texte: E.menu, forme: "rond", options: { icone: "menu", iconeSeule: true, attributs: { "data-modale-ouvrir": "menu", "aria-expanded": "false", "aria-controls": "menu" } } })}` } })}
<main style="padding: 0 var(--page-gutter)">
${Planche({ ton: "olive", id: "s0", credit: { rubrique: "00 / Test", mention: E.mention, signature: E.marque }, contenu: html`${Signature({ niveau: 1, echelle: "couverture", textes: E.signature, id: "titre-s0" })}${Grille({ colonnes: [3, 2, 2], conteneur: { alignement: "fin" }, elements: E.faits.map(([e, v]) => Champ({ etiquette: e, contenu: v, variante: "fait" })) })}` })}
${Planche({ id: "s1", credit: { rubrique: "01 / Titre", mention: E.mention, signature: E.marque }, contenu: html`${Titre({ texte: E.titre, id: "titre-s1", sceau: "moyen" })}<p>${texteEnrichi(E.enrichi)}</p>${Grille({ colonnes: [4, 2, 2], espace: ["var(--process-column-gap)"], conteneur: { balise: "ol", etiquette: E.nav }, elements: E.etapes.map((l, i) => Carte({ rang: deuxChiffres(i + 1), libelle: l, balise: "li", options: { liee: true, indice: i } })) })}` })}
${Planche({ ton: "olive", id: "s2", credit: { rubrique: "02 / Cartes" }, contenu: html`${Titre({ texte: E.titre2, id: "titre-s2", sceau: "petit" })}${Galerie({ variante: "bande", medias: ["Image_05.jpg", "Image_06.jpg", "Image_07.jpg"].map(img) })}${Grille({ colonnes: [3, 2, 1], elements: E.etapes.map((l, i) => Carte({ rang: deuxChiffres(i + 1), libelle: l, note: E.note, options: { baliseLibelle: "h3", indice: i } })) })}` })}
${Planche({ ton: "olive", id: "s3", credit: { rubrique: "03 / Encarts", mention: E.mention, signature: E.marque }, contenu: html`${Titre({ echelle: "affiche", texte: E.affiche, id: "titre-s3" })}${Grille({ min: "var(--prestations-grid-min)", espace: ["var(--space-6)"], elements: [0, 1, 2].map((i) => Encart({ ton: i % 2 ? "clair" : "or", titre: E.encart, contenu: html`<ul class="liste-puces">${E.puces.map((p) => html`<li>${p}</li>`)}</ul>`, pied: Pastille({ texte: E.prix, variante: i % 2 ? "clair" : "or", forme: "bloc" }) })) })}` })}
${Planche({ id: "s4", credit: { rubrique: "04 / Galerie" }, contenu: html`${Galerie({ medias: ["Projet_FIFA26_01.png", "Projet_FIFA26_02.png", "Projet_FIFA26_03.png", "Projet_FIFA26_04.png", "Projet_FIFA26_05.png", "Projet_FIFA26_06.png"].map(img), superposition: Bouton({ texte: E.ouvrir, variante: "surface", forme: "rond", options: { icone: "ouvrir", iconeSeule: true } }) })}${Pile({ direction: "ligne", elements: [Pastille({ texte: "01", forme: "rond" }), Pastille({ texte: "2025 — 2026" }), Pastille({ texte: E.ref, variante: "contour" }), Pastille({ texte: E.statut, variante: "attention" })] })}${Grille({ colonnes: [2, 1, 1], elements: [Encart({ titre: E.encart, contenu: E.note }), Encart({ ton: "bandeau", niveau: 2, titre: E.encart, contenu: E.note })] })}` })}
${Planche({ id: "s5", credit: { rubrique: "05 / Formulaire" }, contenu: html`${Titre({ echelle: "interface", texte: E.titre, id: "titre-s5" })}${Pile({ elements: [
  Champ({ etiquette: E.libelle, variante: "formulaire", id: "c1", messages: { aide: E.aide }, contenu: Saisie({ id: "c1", valeur: E.valeur, options: { etat: { aide: true } } }) }),
  Champ({ etiquette: E.libelle, variante: "formulaire", id: "c2", messages: { erreur: E.erreur }, contenu: Saisie({ id: "c2", type: "long", options: { requis: true, etat: { erreur: true } } }) }),
  Champ({ etiquette: E.libelle, variante: "formulaire", id: "c3", contenu: Saisie({ id: "c3", type: "choix", valeur: "b", options: { choix: [{ valeur: "a", libelle: "A" }, { valeur: "b", libelle: "B" }] } }) }),
  Liste({ etiquette: E.nav, ordonnable: true, libelles: E.libellesListe, elements: E.etapes.map((l, i) => ({ id: String(i), nom: l, contenu: html`<span style="width:64px;height:48px">${Media({ media: img("Projet_VOON_0" + (1 + (i % 3)) + ".png"), cadre: "detail" })}</span>${l}` })) }),
  Televersement({ id: "f1", media: img("Image_04.png"), etat: { progression: 45 }, libelles: E.libellesTeleversement }),
  Message({ type: "succes", titre: E.statut, texte: E.note }), Message({ type: "erreur", texte: E.erreur }), Message({ type: "chargement", texte: E.note }),
  Message({ type: "vide", texte: E.note, action: Bouton({ texte: E.cta, variante: "principal" }) }),
  Pile({ direction: "ligne", elements: [Bouton({ texte: E.cta, variante: "principal" }), Bouton({ texte: E.cta }), Bouton({ texte: E.cta, options: { etat: "chargement" } }), Bouton({ texte: E.cta, options: { etat: "desactive" } }), Bouton({ texte: E.cta, variante: "texte", href: "#", options: { icone: "externe" } })] }),
  TexteProgressif({ texte: E.note }), Sceau({ taille: "grand", lien: "#", libelle: E.marque }),
] })}` })}
</main>
${Modale({ id: "menu", etiquette: E.nav, options: { variante: "plein-ecran", libelleFermer: E.fermer }, contenu: Navigation({ liens, orientation: "verticale", echelle: "affichage", etiquette: E.nav, fermeModale: true }) })}
</body></html>`;
fs.writeFileSync(sortie, String(page).replaceAll('href="Design_System', `href="${racine}/Design_System`).replaceAll('src="Public', `src="${racine}/Public`));
console.log("catalogue écrit :", sortie);
