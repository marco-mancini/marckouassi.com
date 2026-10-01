import { html } from "../../fondations/rendu.js";
import { Planche, idTitre } from "../../composants/Planche/Planche.js";
import { Titre } from "../../composants/Titre/Titre.js";
import { Sceau } from "../../composants/Sceau/Sceau.js";
import { Champ } from "../../composants/Champ/Champ.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { credit } from "./commun.js";

/**
 * Contact — appel, sceau de retour, liens et pied. Fait office de pied
 * de page. Les adresses viennent de site.contact : un lien porte un
 * « type » (email, linkedin, cv), jamais une adresse écrite ici.
 */
export function Contact({ section, contenu, ctx }) {
  const chemin = `sections.${section.id}`;
  const { contact, identite } = contenu.site;
  const cibles = {
    email: { href: `mailto:${contact.email}`, icone: "externe" },
    linkedin: { href: contact.linkedin, icone: "externe", attributs: { target: "_blank", rel: "noreferrer" } },
    // Sans PDF déclaré dans site.contact.cv, le lien mène à la page CV du site.
    cv: contact.cv
      ? { href: ctx.media(contact.cv.src).src, icone: "bas", attributs: { download: ctx.c(contact.cv.nomTelechargement, "site.contact.cv.nomTelechargement") } }
      : { href: ctx.pageCv(), icone: "externe" },
  };
  // Le rang est celui des données (avant filtrage) : c'est lui qui désigne le champ à traduire.
  const liens = section.liens.map((lien, rang) => ({ lien, rang })).filter(({ lien }) => cibles[lien.type]?.href).map(({ lien, rang }) => {
    const cible = cibles[lien.type];
    return Champ({ etiquette: ctx.c(lien.etiquette, `${chemin}.liens.${rang}.etiquette`), contenu: Bouton({ texte: ctx.c(lien.texte, `${chemin}.liens.${rang}.texte`), variante: "nu", href: cible.href, options: { icone: cible.icone, attributs: cible.attributs || {} } }) });
  });
  return Planche({
    id: section.id, classe: "contact", credit: credit(section, contenu.sections, ctx),
    contenu: html`<div class="contact__principal">${Titre({ echelle: "appel", texte: ctx.c(section.titre, `${chemin}.titre`), id: idTitre(section.id) })}${Sceau({ taille: "grand", lien: "#accueil", libelle: ctx.t("accessibilite.retourCouverture") })}</div><footer class="contact__pied">${liens}<p class="contact__credits texte-etiquette">${ctx.l(section.pied, `${chemin}.pied`)}<br>${ctx.t("pied.droits", { annee: ctx.annee, nom: identite.nom })}</p></footer>`,
  });
}
