/**
 * PAGES — contexte de rendu d'une page et choix du gabarit.
 * Partagé par le build, les tests et l'aperçu du back-office : une seule
 * façon de produire une page, sans lecture de fichier ni réseau.
 */
import { creerContexte, cheminLangue, versRacine } from "../i18n/langue.js";
import { PageAccueil, PageProjet, PageCv } from "./sections/Pages.js";

/** Chemins des pages, sans préfixe de langue : accueil, CV, un par projet. */
export function cheminsPages(contenu) {
  return ["", "cv/", ...contenu.projets.map((projet) => `projets/${projet.id}/`)];
}

/**
 * @param {object} p
 * @param {object} p.site            content/site.json
 * @param {string} p.langue
 * @param {string} p.chemin          chemin sans préfixe de langue
 * @param {object} p.dictionnaires   { fr, en }
 * @param {Map}    p.medias          table source → fichier publié
 * @param {object} p.ressources      { sprite, couleurTheme, annee }
 */
export function contextePage({ site, langue, chemin, dictionnaires, medias, ressources }) {
  const defaut = site.langueParDefaut;
  const racine = versRacine(cheminLangue(langue, defaut, chemin));
  const ctx = creerContexte({ langue, langueParDefaut: defaut, dictionnaires });
  return Object.assign(ctx, {
    racine, chemin, langues: site.langues, dictionnaires, ...ressources,
    media: (src) => {
      const publie = medias.get(src);
      return publie ? { ...publie, src: racine + publie.src } : {};
    },
    url: (c = chemin) => `${site.url}/${cheminLangue(langue, defaut, c)}`,
    pageDansLangue: (code) => racine + cheminLangue(code, defaut, chemin),
    pageAccueil: () => racine + cheminLangue(langue, defaut, ""),
    pageProjet: (projet) => racine + cheminLangue(langue, defaut, `projets/${projet.id}/`),
    pageCv: () => racine + cheminLangue(langue, defaut, "cv/"),
    alternatives: site.langues.map((code) => ({ langue: code, href: `${site.url}/${cheminLangue(code, defaut, chemin)}` })),
  });
}

/** Rend la page d'un chemin avec le gabarit qui lui correspond. */
export function rendrePage({ contenu, ctx, chemin }) {
  if (chemin === "") return PageAccueil({ contenu, ctx });
  if (chemin === "cv/") return PageCv({ contenu, ctx });
  const projet = contenu.projets.find((p) => chemin === `projets/${p.id}/`);
  if (!projet) throw new Error(`Aucune page pour « ${chemin} »`);
  return PageProjet({ contenu, ctx, projet });
}
