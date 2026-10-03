/**
 * SITE — branchement des comportements du site public.
 *
 * Aucun contenu ici, aucune logique propre : chaque comportement vient
 * du composant ou du gabarit qui le porte. Le HTML est complet et lisible
 * sans ce script ; il ne fait qu'ajouter menu, dialogues, apparitions et
 * accueil.
 *
 * La classe html.js-anime est posée À LA FIN : tant qu'elle manque (script
 * absent, bloqué ou en échec avant la fin), rien n'est masqué.
 */
import { activerModales } from "../Design_System/composants/Modale/Modale.js";
import { activerEnTete } from "../Design_System/composants/EnTete/EnTete.js";
import { suivreSectionCourante } from "../Design_System/composants/Navigation/Navigation.js";
import { activerApparitions } from "../Design_System/composants/Apparition/Apparition.js";
import { activerProjets } from "../Design_System/gabarits/Gabarit_Projet/Gabarit_Projet.js";
import { activerNavigationCategories } from "../Design_System/gabarits/sections/Projets.js";
import { lancerIntro } from "../Design_System/gabarits/Intro/Intro.js";

const racine = document.documentElement;
const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches || racine.dataset.animations === "reduites";

activerModales(document);
activerEnTete(document.querySelector('[data-en-tete="site"]'));
suivreSectionCourante(document);
activerProjets(document);
activerNavigationCategories(document);
activerApparitions(document, { reduit });
racine.classList.add("js-anime");
lancerIntro({ reduit });
