import { html, attributs, brut } from "../../fondations/rendu.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { attributsApparition, reveler } from "../../composants/Apparition/Apparition.js";

/**
 * Parcours — l'expérience immersive de la section 06 (issues #128 et #132).
 *
 * Le parcours est une narration : question, quatre cartes, révélations, puis
 * intention, territoire, système, réalisations et la trace finale.
 *
 * TOUT le contenu est rendu dans le document, visible par défaut. Le
 * séquencement n'est qu'une amélioration : les étapes ne sont mises en attente
 * que si `html` porte `.js-anime`, comme le veut le principe d'`Apparition`.
 * Sans JavaScript, avec un script en échec ou avec les animations réduites, la
 * narration se lit donc de bout en bout, dans l'ordre, sans rien perdre.
 *
 * Les projets viennent de `contenu.projets` : aucun n'est recréé ici.
 */

/** Une étape du parcours. Numérotée pour l'annonce de progression. */
function Etape({ id, rang, contenu, balise = "section", etiquette = null }) {
  const b = brut(balise);
  return html`<${b}${attributs({ class: `decouverte__etape decouverte__etape--${id}`, "data-decouverte-etape": id, "data-rang": String(rang), "aria-label": etiquette })}>${contenu}</${b}>`;
}

/** Un texte révélé, posé en apparition d'étape. */
function Revele({ contenu, classe, indice = 0, direction = "bas", balise = "p" }) {
  const b = brut(balise);
  return html`<${b}${attributs({ class: classe, ...attributsApparition({ direction, indice, declenchement: "etape" }) })}>${contenu}</${b}>`;
}

/**
 * Une carte à retourner. C'est un bouton de divulgation : le clavier l'ouvre
 * comme la souris, et sa révélation est liée par `aria-controls`. Les autres
 * cartes restent utilisables après une sélection.
 */
function CarteDecouverte({ carte, rang, chemin, verdicts, ctx }) {
  const base = `${chemin}.cartes.${rang}`;
  const idPanneau = `decouverte-revelation-${carte.id}`;
  const verdict = carte.juste ? verdicts.juste : verdicts.insuffisant;
  return html`<li class="decouverte__carte-hote"${attributs(attributsApparition({ direction: "bas", indice: rang, declenchement: "etape" }))}>
    <button type="button" class="decouverte__carte" id="decouverte-carte-${carte.id}" aria-expanded="false"${attributs({ "aria-controls": idPanneau, "data-decouverte-carte": carte.id, "data-decouverte-juste": carte.juste ? "" : null })}>
      <span class="decouverte__carte-face">
        <span class="decouverte__carte-rang" aria-hidden="true">${String(rang + 1).padStart(2, "0")}</span>
        <span class="decouverte__carte-titre">${ctx.c(carte.titre, `${base}.titre`)}</span>
      </span>
    </button>
    <div class="decouverte__revelation" id="${idPanneau}" role="group">
      <p class="decouverte__revelation-texte texte-corps">${ctx.c(carte.revelation, `${base}.revelation`)}</p>
      <p class="decouverte__verdict texte-etiquette"${attributs({ "data-decouverte-verdict": carte.juste ? "juste" : "insuffisant" })}>${ctx.c(verdict, `${chemin}.verdicts.${carte.juste ? "juste" : "insuffisant"}`)}</p>
    </div>
  </li>`;
}

/** Les notions d'une étape : territoire et système les font émerger une à une. */
function Elements({ elements, chemin, classe, ctx }) {
  return html`<ol class="decouverte__elements">${elements.map((element, rang) => html`<li class="${classe}"${attributs(attributsApparition({ direction: "fondu", indice: rang, declenchement: "etape" }))}>${ctx.c(element, `${chemin}.${rang}`)}</li>`)}</ol>`;
}

/**
 * @param {object} p
 * @param {object} p.parcours      `sections.prestations.parcours` du contenu
 * @param {Array}  p.projets       `contenu.projets`, les données existantes
 * @param {object} p.ctx
 * @param {string} p.chemin        chemin du parcours dans les données
 * @param {string} p.ancreProjets  ancre de la section des projets, lue dans les données
 * @param {string} p.idSection     identifiant de la section hôte, pour aria-controls
 */
export function Decouverte({ parcours, projets, ctx, chemin, ancreProjets, idSection }) {
  if (!parcours) return "";
  const t = (cle, variables) => ctx.t(`decouverte.${cle}`, variables);
  let rang = 0;
  const suivant = () => { rang += 1; return rang; };

  const continuer = (vers) => Bouton({
    texte: t("continuer"), variante: "contour",
    options: { attributs: { type: "button", "data-decouverte-continuer": vers } },
  });

  const question = Etape({
    id: "question", rang: suivant(),
    contenu: html`${Revele({ balise: "p", classe: "decouverte__question", contenu: ctx.c(parcours.question, `${chemin}.question`), direction: "douce" })}`,
  });

  const cartes = Etape({
    id: "cartes", rang: suivant(),
    contenu: html`${Revele({ contenu: ctx.c(parcours.invitation, `${chemin}.invitation`), classe: "decouverte__invitation texte-accroche" })}
      <ol class="decouverte__cartes">${parcours.cartes.map((carte, i) => CarteDecouverte({ carte, rang: i, chemin, verdicts: parcours.verdicts, ctx }))}</ol>
      <div class="decouverte__suite" data-decouverte-suite="cartes" hidden>${continuer("transition")}</div>`,
  });

  // Intention, puis les matières : l'ordre des jalons vient des données.
  const jalons = [
    { titre: parcours.intention.titre, chemin: `${chemin}.intention` },
    ...parcours.matieres.map((matiere, i) => ({ titre: matiere.titre, chemin: `${chemin}.matieres.${i}` })),
  ];

  const transition = Etape({
    id: "transition", rang: suivant(),
    contenu: html`${Revele({ classe: "decouverte__question decouverte__question--relance", contenu: ctx.c(parcours.transition, `${chemin}.transition`), direction: "douce" })}
      <ol class="decouverte__jalons">${jalons.map(({ titre, chemin: ou }, i) => html`<li class="decouverte__jalon"${attributs(attributsApparition({ direction: "gauche", indice: i, declenchement: "etape" }))}>${ctx.c(titre, `${ou}.titre`)}</li>`)}</ol>
      <div class="decouverte__suite">${continuer("intention")}</div>`,
  });

  const etapeIntention = (() => {
    const base = `${chemin}.intention`;
    const moments = html`<ol class="decouverte__moments">${parcours.intention.moments.map((moment, j) => html`<li class="decouverte__moment"${attributs(attributsApparition({ direction: "bas", indice: j, declenchement: "etape" }))}>
      <p class="decouverte__moment-titre">${ctx.c(moment.titre, `${base}.moments.${j}.titre`)}</p>
      <p class="decouverte__moment-texte texte-corps">${ctx.c(moment.texte, `${base}.moments.${j}.texte`)}</p>
    </li>`)}</ol>`;
    return Etape({
      id: "intention", rang: suivant(),
      contenu: html`${Titre({ niveau: 3, echelle: "etude", texte: ctx.c(parcours.intention.titre, `${base}.titre`), id: "decouverte-intention" })}${moments}${Revele({ classe: "decouverte__conclusion", contenu: ctx.c(parcours.intention.conclusion, `${base}.conclusion`), indice: 1 })}<div class="decouverte__suite">${continuer(parcours.matieres[0]?.id ?? "realisations")}</div>`,
    });
  })();

  const etapesMatieres = parcours.matieres.map((matiere, i) => {
    const base = `${chemin}.matieres.${i}`;
    const apres = parcours.matieres[i + 1]?.id ?? "realisations";
    return Etape({
      id: matiere.id, rang: suivant(),
      contenu: html`${Titre({ niveau: 3, echelle: "etude", texte: ctx.c(matiere.titre, `${base}.titre`), id: `decouverte-${matiere.id}` })}
        ${Revele({ classe: "decouverte__ouverture texte-accroche", contenu: ctx.c(matiere.ouverture, `${base}.ouverture`) })}
        ${Elements({ elements: matiere.elements, chemin: `${base}.elements`, classe: `decouverte__element decouverte__element--${matiere.id}`, ctx })}
        ${Revele({ classe: "decouverte__conclusion", contenu: ctx.c(matiere.conclusion, `${base}.conclusion`), indice: 1 })}
        <div class="decouverte__suite">${continuer(apres)}</div>`,
    });
  });

  // Les réalisations se révèlent, elles ne se recopient pas : la grille de
  // cartes appartient à la section 05, et #128 §20 interdit une galerie
  // parallèle. Les titres émergent un à un et mènent aux pages existantes ;
  // « Explorer les projets » renvoie ensuite à la section elle-même.
  const realisations = Etape({
    id: "realisations", rang: suivant(),
    contenu: html`${Titre({ niveau: 3, echelle: "etude", texte: ctx.c(parcours.realisations, `${chemin}.realisations`), id: "decouverte-realisations" })}
      <ol class="decouverte__marques">${projets.map((projet, i) => html`<li class="decouverte__marque"${attributs(attributsApparition({ direction: "fondu", indice: i, declenchement: "etape" }))}>
        <a class="decouverte__marque-lien" href="${ctx.pageProjet(projet)}">${ctx.c(projet.titre, `projets.${projet.id}.titre`)}</a>
      </li>`)}</ol>
      <div class="decouverte__suite">${continuer("conclusion")}</div>`,
  });

  const conclusion = Etape({
    id: "conclusion", rang: suivant(),
    contenu: html`${Revele({ classe: "decouverte__question decouverte__question--retour", contenu: ctx.c(parcours.conclusion.question, `${chemin}.conclusion.question`), direction: "douce" })}
      ${Revele({ classe: "decouverte__trace", contenu: ctx.c(parcours.conclusion.revelation, `${chemin}.conclusion.revelation`), direction: "douce", indice: 1 })}
      ${Revele({ classe: "decouverte__suite-texte texte-accroche", contenu: ctx.c(parcours.conclusion.suite, `${chemin}.conclusion.suite`), indice: 2 })}
      ${Revele({ classe: "decouverte__signature texte-etiquette", contenu: ctx.c(parcours.conclusion.signature, `${chemin}.conclusion.signature`), indice: 3 })}
      <div class="decouverte__navigation">
        ${Bouton({ texte: ctx.c(parcours.navigation.projets, `${chemin}.navigation.projets`), variante: "principal", href: `#${ancreProjets}`, options: { icone: "suite" } })}
        <span class="decouverte__retour">${Bouton({ texte: ctx.c(parcours.navigation.retour, `${chemin}.navigation.retour`), variante: "nu", options: { attributs: { type: "button", "data-decouverte-fermer": "" } } })}</span>
      </div>`,
  });

  return html`<div class="decouverte" data-decouverte${attributs({ id: `decouverte-${idSection}`, "data-decouverte-total": String(rang), "aria-label": t("etiquette"), role: "region" })}>
    ${question}${cartes}${transition}${etapeIntention}${etapesMatieres}${realisations}${conclusion}
  </div>`;
}

/**
 * Comportement du parcours immersif (#128), séparé du rendu comme les études
 * de projet et l'accueil animé.
 *
 * Le document porte déjà TOUTE la narration. Ici on ne fait que la séquencer :
 * replier le parcours, ouvrir une étape à la fois, retourner une carte. Si ce
 * script ne s'exécute pas, `html.js-anime` est absent, rien n'est replié, et la
 * narration se lit en entier.
 *
 * Avec les animations réduites, le parcours garde exactement les mêmes étapes
 * et le même contenu : seules les transitions tombent, ce dont Motion.css se
 * charge déjà. On révèle alors sans attendre.
 */
export function activerDecouverte(racine = document, { reduit = false } = {}) {
  const decouverte = racine.querySelector("[data-decouverte]");
  if (!decouverte) return;

  const ouvrir = racine.querySelector("[data-decouverte-ouvrir]");
  const etapes = [...decouverte.querySelectorAll("[data-decouverte-etape]")];
  if (!etapes.length) return;
  const etape = (nom) => etapes.find((e) => e.dataset.decouverteEtape === nom);

  /** Ouvre une étape et déclenche les apparitions qu'elle contient. */
  const ouvrirEtape = (element, { focus = false } = {}) => {
    if (!element || element.classList.contains("est-ouverte")) return;
    element.classList.add("est-ouverte");
    element.querySelectorAll("[data-declenchement='etape']").forEach(reveler);
    if (focus) {
      // Le focus va sur l'étape, pas sur un bouton : l'ordre de lecture suit
      // la narration et rien ne vole le focus au milieu d'une phrase.
      element.setAttribute("tabindex", "-1");
      element.focus({ preventScroll: reduit });
    }
  };

  /** Les cartes restent utilisables après une sélection : on n'en ferme aucune. */
  const retourner = (bouton) => {
    const panneau = racine.getElementById(bouton.getAttribute("aria-controls"));
    if (!panneau) return;
    const ouverte = bouton.getAttribute("aria-expanded") === "true";
    bouton.setAttribute("aria-expanded", String(!ouverte));
    if (ouverte) return;
    panneau.querySelectorAll("[data-apparition]").forEach(reveler);
    // « Être reconnue » prépare l'étape suivante : la suite s'ouvre alors.
    if (bouton.hasAttribute("data-decouverte-juste")) {
      const suite = decouverte.querySelector("[data-decouverte-suite='cartes']");
      if (suite) suite.hidden = false;
    }
  };

  decouverte.addEventListener("click", (evenement) => {
    const carte = evenement.target.closest("[data-decouverte-carte]");
    if (carte) return retourner(carte);
    const continuer = evenement.target.closest("[data-decouverte-continuer]");
    if (continuer) {
      ouvrirEtape(etape(continuer.dataset.decouverteContinuer), { focus: true });
      return;
    }
    if (evenement.target.closest("[data-decouverte-fermer]")) fermer();
  });

  function fermer() {
    decouverte.classList.remove("est-ouvert");
    ouvrir?.setAttribute("aria-expanded", "false");
    ouvrir?.focus({ preventScroll: true });
  }

  ouvrir?.addEventListener("click", () => {
    if (decouverte.classList.contains("est-ouvert")) return fermer();
    decouverte.classList.add("est-ouvert");
    ouvrir.setAttribute("aria-expanded", "true");
    ouvrirEtape(etapes[0], { focus: true });
    // La question appelle les cartes : elles suivent sans action du visiteur.
    ouvrirEtape(etape("cartes"));
  });
}
