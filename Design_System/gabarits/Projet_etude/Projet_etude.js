import { html } from "../../fondations/rendu.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Champ } from "../../composants/Champ/Champ.js";
import { Galerie } from "../../composants/Galerie/Galerie.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Modale, ouvrirModale } from "../../composants/Modale/Modale.js";
import { media, periodeProjet } from "../outils.js";

/**
 * Projet_etude — l'étude complète d'un projet : rubrique, titre,
 * contexte, rôle / disciplines / période, intention, valeur, document,
 * galerie. Rendue dans la page du projet ; chargée dans la modale
 * partagée quand JavaScript est disponible.
 *
 * @param {object} p
 * @param {object} p.projet
 * @param {object} p.ctx
 * @param {1|2} [p.niveau]    niveau du titre : 1 sur la page du projet
 */
export function Projet_etude({ projet, ctx, niveau = 1 }) {
  const chemin = `projets.${projet.id}`;
  const medias = (projet.medias || []).map((entree, i) => media(ctx, entree, { motifAlt: projet.altImages, rang: i, chemin: `${chemin}.medias.${i}`, cheminMotif: `${chemin}.altImages` }));
  const meta = [["projet.role", projet.role, "role"], ["projet.disciplines", projet.disciplines, "disciplines"]]
    .map(([cle, valeur, nom]) => Champ({ etiquette: ctx.t(cle), contenu: ctx.l(valeur, `${chemin}.${nom}`), variante: "meta" }));
  meta.push(Champ({ etiquette: ctx.t("projet.periode"), contenu: periodeProjet(projet, ctx), variante: "meta" }));
  const document = projet.document?.src
    ? Bouton({ texte: projet.document.libelle ? ctx.c(projet.document.libelle, `projets.${projet.id}.document.libelle`) : ctx.t("projet.document"), variante: "texte", href: ctx.media(projet.document.src).src, options: { icone: "externe" } })
    : "";
  return html`<article class="projet-etude" data-projet-etude="${projet.id}"><div class="projet-etude__texte"><p class="projet-etude__rubrique texte-etiquette">${ctx.l(projet.categorie, `${chemin}.categorie`)}</p><div class="projet-etude__titre">${Titre({ niveau, echelle: "etude", texte: ctx.c(projet.titre, `${chemin}.titre`), id: `etude-${projet.id}`, sceau: false })}</div><p class="projet-etude__contexte texte-corps">${ctx.l(projet.contexte, `${chemin}.contexte`)}</p><div class="projet-etude__meta">${meta}</div><p class="projet-etude__libelle texte-etiquette">${ctx.t("projet.intention")}</p><p class="projet-etude__idee">${ctx.l(projet.idee, `${chemin}.idee`)}</p><p class="projet-etude__libelle texte-etiquette">${ctx.t("projet.valeur")}</p><p class="projet-etude__valeur">${ctx.l(projet.valeur, `${chemin}.valeur`)}</p>${document}</div>${Galerie({ medias, variante: "detail", etiquette: ctx.t("projet.images") })}</article>`;
}

/** La modale partagée du sommaire, vide : l'étude y est chargée à la demande. */
export function ModaleEtude({ ctx }) {
  return Modale({ id: "etude", etiquette: ctx.t("projet.images"), contenu: "", entete: html`<p class="projet-etude__compteur" data-etude-compteur></p>`, options: { libelleFermer: ctx.t("projet.fermer") } });
}

/* ------------------------------------------------------------------ */
/* Comportement — navigateur uniquement.                               */
/* ------------------------------------------------------------------ */

/** Rend absolues les adresses d'un fragment chargé depuis une autre page. */
function ancrer(fragment, base) {
  for (const element of fragment.querySelectorAll("[src], [href], [poster]")) {
    for (const nom of ["src", "href", "poster"]) {
      const valeur = element.getAttribute(nom);
      if (valeur && !valeur.startsWith("#")) element.setAttribute(nom, new URL(valeur, base).href);
    }
  }
}

/**
 * Amélioration progressive : un clic sur l'entrée d'un projet charge
 * l'étude depuis sa page et l'ouvre dans la modale. En cas d'échec
 * (réseau, page absente), la navigation normale reprend.
 */
export function activerEtudes(racine = document) {
  const dialogue = racine.getElementById ? racine.getElementById("etude") : document.getElementById("etude");
  if (!dialogue) return;
  const corps = dialogue.querySelector(".modale__corps");
  const compteur = dialogue.querySelector("[data-etude-compteur]");
  racine.addEventListener("click", async (evenement) => {
    const lien = evenement.target.closest("a[data-etude]");
    if (!lien || evenement.metaKey || evenement.ctrlKey || evenement.shiftKey) return;
    evenement.preventDefault();
    try {
      const reponse = await fetch(lien.href);
      if (!reponse.ok) throw new Error(String(reponse.status));
      const page = new DOMParser().parseFromString(await reponse.text(), "text/html");
      const etude = page.querySelector("[data-projet-etude]");
      if (!etude) { window.location.href = lien.href; return; }
      ancrer(etude, reponse.url);
      etude.querySelectorAll("h1").forEach((h1) => {
        const h2 = document.createElement("h2");
        for (const attribut of h1.attributes) h2.setAttribute(attribut.name, attribut.value);
        h2.innerHTML = h1.innerHTML;
        h1.replaceWith(h2);
      });
      corps.replaceChildren(document.importNode(etude, true));
      corps.scrollTop = 0;
      compteur.textContent = lien.dataset.compteur || "";
      dialogue.setAttribute("aria-labelledby", `etude-${lien.dataset.etude}`);
      dialogue.removeAttribute("aria-label");
      ouvrirModale(dialogue, lien);
    } catch {
      window.location.href = lien.href;
    }
  });
}
