import { html } from "../../fondations/rendu.js";
import { CadreAdmin } from "../../composants/CadreAdmin/CadreAdmin.js";
import { EnTete } from "../../composants/EnTete/EnTete.js";
import { Navigation } from "../../composants/Navigation/Navigation.js";
import { Segments } from "../../composants/Segments/Segments.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Modale } from "../../composants/Modale/Modale.js";
import { Message } from "../../composants/Message/Message.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Planche } from "../../composants/Planche/Planche.js";

/**
 * Gabarit_Bo — coquille UNIQUE du back-office. Tout écran (connexion
 * comprise) est un contenu métier posé dans ce gabarit : il n'en
 * redéfinit ni la structure, ni la navigation, ni les états globaux.
 *
 *   variante « application » (écrans connectés)
 *     EnTete · Navigation (barre latérale ; Modale sous 850 px)
 *     zone principale : [démonstration] · tête (retour, Titre, Pastille, actions, intro, messages) · contenu
 *     zone d'action : barre de publication
 *     surcouches communes : menu, aperçu, confirmation
 *   variante « accueil » (connexion)
 *     une Planche olive centrée qui reçoit le contenu
 *
 * @param {object} p
 * @param {object} p.ctx                 contexte du back-office (t du dictionnaire admin)
 * @param {string|null} p.ecran          clé de l'écran actif (lien courant de la navigation)
 * @param {object} [p.tete]              { titre, statut, intro, retour:{texte,href}, actions, messages }
 * @param {*} p.contenu                  contenu métier de l'écran
 * @param {object} [p.options]           { variante, liens, barre, demo }
 */
export function Gabarit_Bo({ ctx, ecran = null, tete = {}, contenu, options = {} }) {
  const { variante = "application", liens = [], barre = "", demo = false } = options;
  const evitement = html`<a class="skip-link" href="#contenu">${ctx.t("evitement")}</a>`;

  if (variante === "accueil") {
    return html`${evitement}<main class="gabarit-bo gabarit-bo--accueil" id="contenu" tabindex="-1">${Planche({ ton: "olive", id: "accueil-bo", classe: "gabarit-bo-accueil", contenu })}</main>`;
  }

  const navigation = liens.map((lien) => ({ ...lien, actif: lien.cle === ecran }));
  const langues = Segments({ mode: "boutons", cle: "langue-interface", etiquette: ctx.t("langueInterface"), options: optionsLangues(ctx, ctx.langue) });
  const voirSite = Bouton({ texte: ctx.t("navigation.voirSite"), variante: "filet", href: "../", options: { icone: "externe", attributs: { target: "_blank", rel: "noopener" } } });
  const deconnexion = Bouton({ texte: ctx.t("navigation.deconnexion"), variante: "texte", options: { attributs: { "data-deconnexion": true } } });
  const entete = EnTete({
    variante: "admin", marque: { href: "#/", libelle: ctx.t("marque") },
    actions: {
      large: html`${langues}${voirSite}${deconnexion}`,
      compact: Bouton({ texte: ctx.t("navigation.menu"), variante: "contour", forme: "rond", options: { icone: "menu", iconeSeule: true, attributs: { "data-modale-ouvrir": "menu-admin", "aria-expanded": "false", "aria-controls": "menu-admin" } } }),
    },
  });

  const surcouches = html`${Modale({
    id: "menu-admin", etiquette: ctx.t("navigation.etiquette"), options: { variante: "plein-ecran", libelleFermer: ctx.t("navigation.fermer") },
    contenu: html`${Navigation({ liens: navigation, orientation: "verticale", echelle: "affichage", etiquette: ctx.t("navigation.etiquette"), fermeModale: true })}<div class="gabarit-bo__menu-actions">${langues}${voirSite}${deconnexion}</div>`,
  })}${Modale({
    id: "apercu", etiquette: ctx.t("apercu.titre"), options: { variante: "centre", libelleFermer: ctx.t("apercu.fermer") },
    entete: Segments({ mode: "boutons", cle: "langue-apercu", etiquette: ctx.t("apercu.langue"), options: optionsLangues(ctx, "fr") }),
    contenu: html`<iframe class="gabarit-bo__apercu" title="${ctx.t("apercu.cadre")}" sandbox="allow-same-origin" data-apercu></iframe>`,
  })}${Modale({
    id: "confirmation", etiquette: ctx.t("editeur.confirmer"), options: { libelleFermer: ctx.t("editeur.annuler") },
    contenu: html`<p class="gabarit-bo__confirmation" data-confirmation-texte></p><div class="gabarit-bo__confirmation-actions">${Bouton({ texte: ctx.t("editeur.annuler"), variante: "contour", options: { attributs: { "data-modale-fermer": true } } })}${Bouton({ texte: ctx.t("editeur.confirmer"), variante: "principal", options: { attributs: { "data-confirmer": true } } })}</div>`,
  })}`;

  return html`${evitement}${CadreAdmin({
    entete,
    navigation: Navigation({ liens: navigation, orientation: "verticale", etiquette: ctx.t("navigation.etiquette") }),
    contenu: html`${demo ? Message({ type: "attention", titre: ctx.t("demo.titre"), texte: ctx.t("demo.texte") }) : ""}${Tete(ctx, tete)}<div class="gabarit-bo__contenu">${contenu}</div>`,
    barre, surcouches,
  })}`;
}

/** Tête d'écran : retour, titre et statut, actions (ex. langue d'édition), introduction, messages. */
function Tete(ctx, { titre = null, statut = null, intro = null, retour = null, actions = null, messages = null }) {
  if (!titre) return "";
  return html`<div class="gabarit-bo__tete">${retour ? Bouton({ texte: retour.texte, variante: "texte", href: retour.href, options: { icone: "retour" } }) : ""}<div class="gabarit-bo__titre">${Titre({ niveau: 1, echelle: "interface", texte: titre, id: "titre-ecran" })}${statut || ""}</div>${actions ? html`<div class="gabarit-bo__actions">${actions}</div>` : ""}${intro ? html`<p class="gabarit-bo__intro">${intro}</p>` : ""}${messages || ""}</div>`;
}

/** Options d'un choix de langue : code affiché, nom complet lu (dictionnaire). */
export function optionsLangues(ctx, active) {
  return ["fr", "en"].map((code) => ({ libelle: code.toUpperCase(), valeur: code, nom: ctx.t(`nomsLangues.${code}`), actif: code === active }));
}
