/**
 * CONNAISSANCE — base de MarcoS, réduite par liste blanche.
 *
 * Entrée : le contenu validé. Sortie : un objet réduit, DANS UNE SEULE LANGUE,
 * que le build publie en JSON et que le Worker lit pour construire le contexte.
 * La mise en forme envoyée au modèle appartient au Worker (phase IA-03).
 *
 * Module pur : aucune lecture de fichier, aucun réseau, aucun DOM. Même
 * principe que donnees.js et pages.js, et utilisable par le build comme par
 * les tests.
 *
 * LA LISTE BLANCHE EST ÉCRITE CHAMP PAR CHAMP, VOLONTAIREMENT.
 * Aucun parcours générique du contenu : un champ ajouté à content/ n'entre pas
 * ici tout seul. C'est ce qui rend les exclusions STRUCTURELLES et non
 * déclaratives — aucune injection de prompt ne peut faire sortir ce qui n'a
 * jamais été transmis.
 *
 * Ce qui est exclu, et pourquoi (décisions de Marc du 2 octobre 2026,
 * Docs/MARCOS_DECISIONS.md) :
 *   - D-3  : cv.informations — téléphone, adresse précise, date de naissance ;
 *   - D-12 : projets[].contexte et projets[].valeur (cadrage et enjeu, que
 *            titre/categorie/idee portent déjà), et sections[parcours].etapes
 *            (doublon de cv.experience, qui est plus factuel) ;
 *   - D-14 : le profil comportemental et personnel de Docs/MARCOS.md §18-25,
 *            qui n'est pas dans content/ et n'y entrera pas sans décision ;
 *   - toujours : médias, chemins de fichiers, textes alternatifs, métadonnées
 *            internes (_role, _origine, _statut), et tout secret.
 */

/** Jetons estimés d'un texte. Même convention que la documentation : ÷ 3,5. */
export const JETONS_PAR_CARACTERE = 1 / 3.5;

/**
 * Plafond du FICHIER publié, en jetons estimés, pour UNE langue.
 *
 * Mesuré le 2 octobre 2026 : 3 834 jetons en français, 3 644 en anglais.
 * Le plafond laisse la marge de deux ou trois projets supplémentaires. Au-delà,
 * c'est une décision de Marc et non un ajustement : la contrainte de verbosité
 * minimale se défend ici, par un build qui échoue.
 *
 * Ce que le modèle reçoit sera PLUS LÉGER que ce fichier : le Worker rendra la
 * base en lignes « clé: valeur » plutôt qu'en JSON, ce qui économise
 * l'enveloppe — mesuré à 3 302 jetons en français, soit 532 de moins. Ce rendu
 * appartient au Worker et arrive en phase IA-03 : il porte des libellés de
 * structure, qui n'ont pas leur place dans un gabarit du Design System
 * (AGENTS.md : rien en dur).
 */
export const PLAFOND_JETONS = 4200;

/**
 * Nettoie un texte de contenu pour le contexte du modèle :
 *   - le balisage d'emphase `**…**` du site est retiré. C'est de la mise en
 *     forme, pas du sens, et elle coûte quatre caractères par emphase ;
 *   - les retours à la ligne sont aplatis. Le contenu en contient (titre du CV,
 *     détails de sections) et ils casseraient le format « clé: valeur ».
 */
function nettoyer(chaine) {
  return String(chaine).replaceAll("**", "").replace(/\s+/g, " ").trim();
}

/** Lit une valeur { fr, en } dans la langue voulue, avec repli documenté. */
function texte(valeur, langue, langueParDefaut) {
  if (valeur === null || valeur === undefined) return "";
  if (typeof valeur === "string") return nettoyer(valeur);
  const voulu = valeur[langue];
  if (voulu !== undefined && voulu !== null && voulu !== "") return nettoyer(voulu);
  return valeur[langueParDefaut] ? nettoyer(valeur[langueParDefaut]) : "";
}

/** Applique `texte` à une liste, en retirant les entrées vides. */
function textes(liste, langue, defaut) {
  if (!Array.isArray(liste)) return [];
  return liste.map((v) => texte(v, langue, defaut)).filter(Boolean);
}

/**
 * Un élément de liste du CV : soit { fr, en }, soit
 * { texte: { fr, en }, precision: { fr, en } }. Les deux formes existent dans
 * content/cv.json, et la seconde se perd silencieusement si on ne la traite pas.
 */
function element(entree, langue, defaut) {
  if (entree && typeof entree === "object" && entree.texte) {
    const base = texte(entree.texte, langue, defaut);
    const precision = texte(entree.precision, langue, defaut);
    return precision ? `${base} ${precision}` : base;
  }
  return texte(entree, langue, defaut);
}

/** Groupes { titre, elements } du CV (compétences, formation). */
function groupes(bloc, langue, defaut) {
  return (bloc?.groupes ?? []).map((g) => ({
    titre: texte(g.titre, langue, defaut),
    elements: (g.elements ?? []).map((e) => element(e, langue, defaut)).filter(Boolean),
  })).filter((g) => g.titre || g.elements.length);
}

/** Retire les clés vides : un contexte minimal ne transporte pas de vide. */
function compact(objet) {
  if (Array.isArray(objet)) {
    const liste = objet.map(compact).filter((v) => v !== undefined);
    return liste.length ? liste : undefined;
  }
  if (objet && typeof objet === "object") {
    const sortie = {};
    for (const [cle, valeur] of Object.entries(objet)) {
      const propre = compact(valeur);
      if (propre !== undefined) sortie[cle] = propre;
    }
    return Object.keys(sortie).length ? sortie : undefined;
  }
  if (objet === "" || objet === null) return undefined;
  return objet;
}

/** Section d'un type donné, ou undefined. */
const section = (sections, type) => sections.find((s) => s.type === type);

/**
 * Période affichée d'un projet, calculée comme le site : libellé explicite
 * s'il existe, sinon la plage d'années. MarcoS ne recompte rien lui-même.
 */
function periode(projet, langue, defaut) {
  if (projet.periode) return texte(projet.periode, langue, defaut);
  const { debut, fin = debut } = projet.annees ?? {};
  if (debut === undefined) return "";
  return debut === fin ? String(debut) : `${debut}–${fin}`;
}

/**
 * Adresses internes que MarcoS peut citer, sous la forme id → chemin.
 * Le Worker ne produit un lien que si l'identifiant est dans cette liste.
 */
export function pagesConnues(contenu) {
  const pages = [
    { id: "accueil", href: "/" },
    { id: "cv", href: "/cv/" },
    ...contenu.projets.map((p) => ({ id: p.id, href: `/projets/${p.id}/` })),
  ];
  for (const s of contenu.sections) {
    if (s.id && s.type !== "couverture") pages.push({ id: s.id, href: `/#${s.id}` });
  }
  return pages;
}

/** Questions de qualification, publiées séparément de la base générale. */
export function baseQualification({ contenu, langue, langueParDefaut = contenu.site.langueParDefaut }) {
  const prestations = section(contenu.sections, "prestations");
  return {
    langue,
    offres: (prestations?.offres ?? []).map((offre) => ({
      id: offre.id,
      titre: texte(offre.titre, langue, langueParDefaut),
      declencheur: texte(offre.qualification?.declencheur, langue, langueParDefaut),
      questions: (offre.qualification?.questions ?? []).map((question) => ({
        champ: question.champ,
        texte: texte(question.texte, langue, langueParDefaut),
      })),
    })),
  };
}

/**
 * Base de connaissance d'une langue.
 *
 * @param {object} p
 * @param {object} p.contenu           contenu validé (site, sections, projets, cv)
 * @param {string} p.langue            langue de la base
 * @param {string} [p.langueParDefaut] langue de repli ; par défaut celle du site
 * @returns {object} base réduite, sans clé vide
 */
export function baseConnaissance({ contenu, langue, langueParDefaut = contenu.site.langueParDefaut }) {
  const { site, sections, projets, cv } = contenu;
  const d = langueParDefaut;
  const T = (v) => texte(v, langue, d);

  const couverture = section(sections, "couverture");
  const introduction = section(sections, "introduction");
  const apropos = section(sections, "apropos");
  const savoirfaire = section(sections, "savoirfaire");
  const prestations = section(sections, "prestations");

  const base = {
    langue,
    identite: {
      nom: site.identite?.nom ?? "",
      titre: T(cv?.titre),
      role: T(couverture?.role),
    },
    presentation: {
      promesse: T(couverture?.promesse),
      faits: (couverture?.faits ?? []).map((f) => ({ etiquette: T(f.etiquette), valeur: T(f.valeur) })),
      introduction: {
        titre: T(introduction?.titre),
        accroche: T(introduction?.accroche),
        detail: T(introduction?.detail),
      },
      apropos: {
        accroche: T(apropos?.accroche),
        detail: T(apropos?.detail),
        affirmation: T(apropos?.affirmation),
      },
    },
    savoirfaire: {
      titre: T(savoirfaire?.titre),
      promesse: textes(savoirfaire?.promesse, langue, d),
      domaines: (savoirfaire?.domaines ?? []).map((x) => ({ libelle: T(x.libelle), note: T(x.note) })),
      methode: {
        etiquette: T(introduction?.methode?.etiquette),
        etapes: textes(introduction?.methode?.etapes, langue, d),
      },
    },
    // D-12 : ni `contexte`, ni `valeur`. Le client et la nature du projet sont
    // dans `titre` et `categorie` ; l'idée créative est dans `idee`.
    projets: projets.map((p) => ({
      id: p.id,
      titre: T(p.titre),
      categorie: T(p.categorie),
      periode: periode(p, langue, d),
      role: T(p.role),
      disciplines: T(p.disciplines),
      idee: T(p.idee),
      page: `/projets/${p.id}/`,
    })),
    prestations: {
      titre: T(prestations?.titre),
      accroche: T(prestations?.accroche),
      offres: (prestations?.offres ?? []).map((o) => ({
        id: o.id,
        titre: T(o.titre),
        points: textes(o.points, langue, d),
        prix: T(o.prix),
      })),
    },
    // D-3 : `cv.informations` n'est jamais lu.
    cv: {
      resume: T(cv?.resume),
      competences: groupes(cv?.competences, langue, d),
      experiences: (cv?.experience?.postes ?? []).map((poste) => ({
        titre: T(poste.titre),
        lieu: T(poste.lieu),
        points: (poste.points ?? []).map((pt) => element(pt, langue, d)).filter(Boolean),
      })),
      formation: groupes(cv?.formation, langue, d),
      ia: textes(cv?.ia, langue, d),
      forces: textes(cv?.forces, langue, d),
      references: (cv?.references ?? []).filter((r) => typeof r === "string" && r),
    },
    contact: {
      email: site.contact?.email ?? "",
      linkedin: site.contact?.linkedin ?? "",
      cv: site.contact?.cv?.src ? "/cv/" : "",
    },
    pages: pagesConnues(contenu),
  };

  return compact(base) ?? {};
}

/** Taille estimée d'une chaîne, en caractères et en jetons. */
export function mesurerTexte(chaine) {
  const n = String(chaine).length;
  return { caracteres: n, jetons: Math.round(n * JETONS_PAR_CARACTERE) };
}

/**
 * Taille du FICHIER publié (JSON). À ne pas confondre avec ce qui est envoyé au
 * modèle : le JSON porte son enveloppe, et `JSON.stringify` échappe en plus les
 * retours à la ligne, ce qui gonfle encore le compte. Pour le contexte réel,
 * mesurer `rendreTexte(base)` avec `mesurerTexte`.
 */
export function mesurer(base) {
  return mesurerTexte(JSON.stringify(base));
}
