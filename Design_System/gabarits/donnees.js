/**
 * DONNÉES — règles partagées par le build, l'Edge Function et le
 * back-office : validation du contenu et inventaire des médias.
 * Module pur : ni fichier, ni réseau.
 */

/** Les quatre documents qui composent le contenu du site. */
export const DOCUMENTS = ["site", "sections", "projets", "cv"];

/**
 * Validation : les champs indispensables existent dans la langue par
 * défaut. Une traduction absente n'est pas une erreur (elle est signalée).
 * Renvoie des erreurs STRUCTURÉES { code, chemin } : le texte affiché
 * vient du dictionnaire (« validation.<code> »), jamais d'ici.
 */
export function valider(contenu) {
  const erreurs = [];
  const defaut = contenu.site.langueParDefaut;
  const requis = (valeur, chemin) => {
    const texte = valeur && typeof valeur === "object" ? valeur[defaut] : valeur;
    if (texte === undefined || texte === null || texte === "") erreurs.push({ code: "requis", chemin });
  };
  requis(contenu.site.seo?.titre, "site.seo.titre");
  requis(contenu.site.seo?.description, "site.seo.description");
  requis(contenu.site.identite?.nom, "site.identite.nom");
  const ids = new Set();
  for (const section of contenu.sections) {
    if (ids.has(section.id)) erreurs.push({ code: "doublon", chemin: `sections.${section.id}` });
    ids.add(section.id);
    if (section.type !== "couverture") requis(section.navigation, `sections.${section.id}.navigation`);
  }
  const idsProjets = new Set();
  contenu.projets.forEach((projet, rang) => {
    const base = projet.id ? `projets.${projet.id}` : `projets.${rang}`;
    if (!/^[a-z0-9-]+$/.test(projet.id || "")) erreurs.push({ code: "identifiant", chemin: `${base}.id` });
    if (idsProjets.has(projet.id)) erreurs.push({ code: "doublon", chemin: `${base}.id` });
    idsProjets.add(projet.id);
    for (const champ of ["titre", "categorie", "contexte", "role", "disciplines", "idee", "valeur"]) requis(projet[champ], `${base}.${champ}`);
    if (!projet.annees?.debut) erreurs.push({ code: "annee", chemin: `${base}.annees.debut` });
  });
  return erreurs;
}

/** Erreurs de validation en phrases, avec les modèles d'un dictionnaire (« validation.* »). */
export function formaterErreurs(erreurs, t, nommer = (chemin) => chemin) {
  return erreurs.map(({ code, chemin }) => t(`validation.${code}`, { chemin: nommer(chemin) }));
}

/** Tous les fichiers référencés par le contenu (clés « src » et « poster »). */
export function referencesMedias(contenu) {
  const trouves = new Set();
  const parcourir = (valeur) => {
    if (Array.isArray(valeur)) return valeur.forEach(parcourir);
    if (valeur && typeof valeur === "object") {
      for (const [cle, v] of Object.entries(valeur)) {
        if ((cle === "src" || cle === "poster") && typeof v === "string") trouves.add(v);
        else parcourir(v);
      }
    }
  };
  parcourir(contenu);
  return [...trouves];
}
