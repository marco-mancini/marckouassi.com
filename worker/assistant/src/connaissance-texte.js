/**
 * RENDU TEXTE DE LA BASE — ce que le modèle reçoit réellement.
 *
 * Le fichier publié par le build est du JSON : il se versionne, se teste et se
 * compare. Mais le JSON coûte son enveloppe — accolades, guillemets, et le nom
 * de chaque champ répété à chaque projet. Mesuré le 2 octobre 2026 :
 * **855 jetons sur 3 834, soit 22 % du contexte dépensés en ponctuation.**
 *
 * Ce module dit la même chose en lignes « clé: valeur ». Gain mesuré :
 * **532 jetons** en français. La verbosité minimale est un critère de
 * conception de Marc, et elle se défend ici autant que dans la liste blanche.
 *
 * POURQUOI CE FICHIER EST DANS LE WORKER ET PAS DANS LE DESIGN SYSTEM.
 * Il a d'abord été écrit dans `Design_System/gabarits/connaissance.js`, et
 * `tests/riendur.test.mjs` l'a refusé — à juste titre : il porte des libellés
 * de structure en dur, ce qu'un gabarit du Design System ne doit pas faire.
 * Ces libellés ne sont pas du contenu affiché : ce sont les en-têtes d'un
 * prompt, au même titre que des noms de clés JSON. Leur place est ici.
 */

/**
 * @param {object} base  sortie de `baseConnaissance` (une langue)
 * @returns {string}
 */
export function rendreConnaissance(base) {
  const l = [];
  const ligne = (etiquette, valeur) => { if (valeur) l.push(`${etiquette}: ${valeur}`); };
  const liste = (etiquette, valeurs) => { if (valeurs?.length) l.push(`${etiquette}: ${valeurs.join(" · ")}`); };

  const { identite = {}, presentation = {}, savoirfaire = {}, prestations = {}, cv = {}, contact = {} } = base;

  l.push("# IDENTITÉ");
  ligne("Nom", identite.nom);
  ligne("Titre", identite.titre);
  ligne("Rôle", identite.role);

  l.push("", "# PRÉSENTATION");
  ligne("Promesse", presentation.promesse);
  for (const f of presentation.faits ?? []) ligne(f.etiquette, f.valeur);
  ligne("Accroche", presentation.introduction?.accroche);
  ligne("Détail", presentation.introduction?.detail);
  ligne("À propos", presentation.apropos?.accroche);
  ligne("À propos, détail", presentation.apropos?.detail);
  ligne("Affirmation", presentation.apropos?.affirmation);

  l.push("", "# SAVOIR-FAIRE");
  liste("Promesse", savoirfaire.promesse);
  for (const d of savoirfaire.domaines ?? []) ligne(d.libelle, d.note);
  liste(savoirfaire.methode?.etiquette || "Méthode", savoirfaire.methode?.etapes);

  l.push("", `# PROJETS (${(base.projets ?? []).length})`);
  for (const p of base.projets ?? []) {
    l.push("", `## ${p.id} — ${p.titre}${p.periode ? ` (${p.periode})` : ""}`);
    ligne("Catégorie", p.categorie);
    ligne("Rôle", p.role);
    ligne("Disciplines", p.disciplines);
    ligne("Idée", p.idee);
  }

  l.push("", "# PRESTATIONS");
  ligne("Accroche", prestations.accroche);
  for (const o of prestations.offres ?? []) {
    l.push(`## ${o.titre}${o.prix ? ` — ${o.prix}` : ""}`);
    liste("Points", o.points);
  }

  l.push("", "# CV");
  ligne("Résumé", cv.resume);
  for (const g of cv.competences ?? []) liste(g.titre, g.elements);
  for (const e of cv.experiences ?? []) {
    l.push(`## ${e.titre}${e.lieu ? ` — ${e.lieu}` : ""}`);
    liste("Points", e.points);
  }
  for (const g of cv.formation ?? []) liste(g.titre, g.elements);
  liste("Compétences IA", cv.ia);
  liste("Forces", cv.forces);
  liste("Références", cv.references);

  l.push("", "# CONTACT");
  ligne("E-mail", contact.email);
  ligne("LinkedIn", contact.linkedin);

  return l.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Liste des pages citables, pour le marqueur {{PAGES}} du prompt. */
export function rendrePages(base) {
  return (base.pages ?? []).map((p) => `${p.id} -> ${p.href}`).join("\n");
}
