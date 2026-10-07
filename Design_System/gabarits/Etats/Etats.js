/**
 * ÉTATS — les états du site qui ne vivent dans aucune section (#162) :
 * page introuvable (404), perte et retour du réseau, média qui ne se charge
 * pas. Tous passent par Message en mode sceau : même gabarit partout.
 *
 * Aucun texte ici : dictionnaire « etats » (et « assistant.erreurs.hors_ligne »,
 * la même phrase que MarcoS). Les messages du navigateur sont rendus au build
 * dans un <template> : le script ne fait que les cloner.
 */
import { html } from "../../fondations/rendu.js";
import { Message } from "../../composants/Message/Message.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { activerSceaux } from "../../composants/Sceau/Sceau.js";
import { creerContexte } from "../../i18n/langue.js";

/** Durée d'affichage de « Connexion rétablie », lue dans les jetons. */
const JETON_RETABLIE = "--etats-retablie-duree";

/**
 * Messages du navigateur, prêts à cloner : hors connexion, connexion
 * rétablie, média indisponible. Plus la zone vivante qui les reçoit.
 * @param {object} p
 * @param {object} p.ctx
 */
export function EtatsDuNavigateur({ ctx }) {
  const { t } = ctx;
  return html`<div class="messages" data-etats-zone aria-live="polite"></div><template data-etats>
<div data-etat="hors-connexion">${Message({ type: "attention", titre: t("etats.horsConnexion.titre"), texte: t("assistant.erreurs.hors_ligne"), mode: { sceau: "chantier", compact: true, toast: true } })}</div>
<div data-etat="retablie">${Message({ type: "succes", titre: t("etats.retablie.titre"), texte: t("etats.retablie.texte"), mode: { sceau: "bati", compact: true, toast: true } })}</div>
<div data-etat="media">${Message({ type: "vide", titre: t("etats.media.titre"), texte: t("etats.media.texte"), mode: { sceau: "chantier", compact: true } })}</div>
</template>`;
}

/**
 * Page introuvable : une seule page 404 sert toutes les adresses, dans
 * chaque langue. Chaque langue a son message ; le navigateur montre celui
 * de l'adresse demandée (« /en/… » : anglais). Sans script : la langue par défaut.
 * @param {object} p
 * @param {object} p.ctx    contexte de la langue par défaut, racine absolue
 */
export function Introuvable({ ctx }) {
  const messages = ctx.langues.map((langue) => {
    const c = creerContexte({ langue, langueParDefaut: ctx.langueParDefaut, dictionnaires: ctx.dictionnaires });
    const accueil = ctx.pageDansLangue(langue);
    return html`<div class="introuvable__langue" data-introuvable="${langue}" lang="${langue}"${langue === ctx.langueParDefaut ? "" : html` hidden`}>${Message({
      type: "erreur", titre: c.t("etats.introuvable.titre"), texte: c.t("etats.introuvable.texte"),
      action: Bouton({ texte: c.t("etats.introuvable.retour"), href: accueil, variante: "principal" }),
      mode: { sceau: "perdu", niveau: 1 },
    })}</div>`;
  });
  return html`<main id="contenu" class="introuvable ilot-olive" tabindex="-1">${messages}</main>`;
}

const clone = (document, nom) => document.querySelector("template[data-etats]")?.content.querySelector(`[data-etat="${nom}"] > .message`)?.cloneNode(true) ?? null;

/**
 * Navigateur : branche les états.
 *   - 404 : montre le message de la langue de l'adresse ;
 *   - réseau : « Hors connexion » tant que le réseau manque, puis
 *     « Connexion rétablie » quelques secondes ;
 *   - média : une image ou une vidéo qui échoue laisse place au message,
 *     à la taille exacte du média.
 * @param {Document} document
 */
export function activerEtats(document) {
  const fenetre = document.defaultView;
  activerSceaux(document);

  const introuvables = document.querySelectorAll("[data-introuvable]");
  if (introuvables.length) {
    const langue = [...introuvables].map((bloc) => bloc.dataset.introuvable).find((code) => fenetre.location.pathname.startsWith(`/${code}/`));
    if (langue) {
      introuvables.forEach((bloc) => { bloc.hidden = bloc.dataset.introuvable !== langue; });
      document.documentElement.lang = langue;
    }
  }

  const zone = document.querySelector("[data-etats-zone]");
  if (zone) {
    let courant = null;
    let minuterie = null;
    const montrer = (nom) => {
      clearTimeout(minuterie);
      courant?.remove();
      courant = clone(document, nom);
      if (!courant) return;
      zone.append(courant);
      activerSceaux(zone);
    };
    fenetre.addEventListener("offline", () => montrer("hors-connexion"));
    fenetre.addEventListener("online", () => {
      if (!courant) return;
      montrer("retablie");
      const duree = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(JETON_RETABLIE)) * 1000;
      minuterie = setTimeout(() => { courant?.remove(); courant = null; }, duree);
    });
    if (fenetre.navigator.onLine === false) montrer("hors-connexion");
  }

  const remplacer = (media) => {
    const figure = media.closest("figure.media");
    if (!figure || figure.classList.contains("media--indisponible")) return;
    const message = clone(document, "media");
    if (!message) return;
    // Le cadre garde la taille du média : la mise en page ne saute pas.
    const largeur = Number(media.getAttribute("width")) || figure.clientWidth;
    const hauteur = Number(media.getAttribute("height")) || figure.clientHeight;
    if (largeur && hauteur) figure.style.aspectRatio = `${largeur} / ${hauteur}`;
    figure.classList.add("media--indisponible");
    figure.replaceChildren(message);
    activerSceaux(figure);
  };
  document.addEventListener("error", (evenement) => {
    const cible = evenement.target;
    if (cible instanceof fenetre.HTMLImageElement) remplacer(cible);
    else if (cible instanceof fenetre.HTMLSourceElement) remplacer(cible.parentElement);
  }, true);
  // Images déjà en échec avant le script (chargement immédiat).
  document.querySelectorAll(".media > img").forEach((image) => {
    if (image.complete && image.naturalWidth === 0 && image.getAttribute("src")) remplacer(image);
  });
}
