import { html } from "../../fondations/rendu.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Champ } from "../../composants/Champ/Champ.js";
import { Galerie } from "../../composants/Galerie/Galerie.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { Modale, ouvrirModale } from "../../composants/Modale/Modale.js";

/**
 * Projet_etude — LA VUE ÉTUDE d'un projet : rubrique, titre, contexte,
 * rôle / disciplines / période, intention, valeur, document, galerie.
 * Rendue telle quelle sur la page du projet ; chargée dans la modale
 * partagée quand JavaScript est disponible.
 *
 * Comme la carte, elle ne lit plus l'enregistrement du projet : elle reçoit
 * la VUE résolue par `Gabarit_Projet`. Les médias, le titre et l'identifiant
 * du titre sont donc exactement les mêmes que ceux de la carte — c'est ce
 * qui garantit que la modale sait toujours nommer le dialogue qu'elle ouvre.
 *
 * @param {object} p
 * @param {object} p.vue      sortie de `vueProjet` (Gabarit_Projet)
 * @param {object} p.ctx
 * @param {1|2} [p.niveau]    niveau du titre : 1 sur la page du projet
 */
export function Projet_etude({ vue, ctx, niveau = 1 }) {
  const meta = vue.champs.map((champ) => Champ({ etiquette: champ.etiquette, contenu: champ.contenu, variante: "meta" }));
  meta.push(Champ({ etiquette: ctx.t("projet.periode"), contenu: vue.periode, variante: "meta" }));
  const document = vue.document
    ? Bouton({ texte: vue.document.libelle, variante: "texte", href: vue.document.href, options: { icone: "externe" } })
    : "";
  return html`<article class="projet-etude" data-projet-etude="${vue.id}"><div class="projet-etude__texte"><p class="projet-etude__rubrique texte-etiquette">${vue.categorieHtml}</p><div class="projet-etude__titre">${Titre({ niveau, echelle: "etude", texte: vue.titre, id: vue.idEtude, sceau: false })}</div><p class="projet-etude__contexte texte-corps">${vue.contexteHtml}</p><div class="projet-etude__meta">${meta}</div><p class="projet-etude__libelle texte-etiquette">${ctx.t("projet.intention")}</p><p class="projet-etude__idee">${vue.ideeHtml}</p><p class="projet-etude__libelle texte-etiquette">${ctx.t("projet.valeur")}</p><p class="projet-etude__valeur">${vue.valeurHtml}</p>${document}</div>${Galerie({ medias: vue.medias, variante: "detail", etiquette: ctx.t("projet.images") })}</article>`;
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
