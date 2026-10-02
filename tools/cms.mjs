/**
 * CMS — assemble le CMS Git (Sveltia CMS) dans _site/admin.
 *
 *   index.html     page du CMS (textes du dictionnaire admin)
 *   config.json    configuration GÉNÉRÉE à partir de la forme de content/
 *   sveltia-cms.js Sveltia CMS, servi par le site (aucun CDN)
 *   polices/       polices de l'interface du CMS, servies par le site
 *
 * Le CMS écrit dans content/*.json et dépose les images, telles quelles,
 * dans Public/images/ ; chaque enregistrement est un commit sur main.
 * Vercel reconstruit alors le site et build.mjs compresse les images.
 *
 * La configuration n'est écrite champ par champ nulle part : elle se déduit
 * des données, comme le faisait l'éditeur de l'ancien back-office, et ses
 * libellés sont ceux de Design_System/i18n/admin.fr.json (« champs »).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { estTraduisible } from "../Design_System/i18n/langue.js";

export const DEPOT = "marco-mancini/marckouassi.com";
export const BRANCHE = "main";
/** Dossier des images, tel que Sveltia l'écrit (chemin absolu depuis la racine du dépôt). */
export const DOSSIER_IMAGES = "/Public/images";
export const FICHIERS = ["site", "sections", "projets", "cv"];

/* Valeurs techniques, lues par les gabarits : conservées, jamais saisies. */
const TECHNIQUES = new Set(["_role", "_origine", "calcul", "cible", "gabarit", "langues", "langueParDefaut"]);
const MEDIA = /\.(png|jpe?g|webp|mp4|webm|pdf)$/i;
const OCTETS_MAX = 50 * 1024 * 1024;

/* Polices de l'interface de Sveltia : adresses du CDN écrites dans son code → fichiers des paquets npm. */
export const POLICES = [
  { distante: "https://cdn.jsdelivr.net/fontsource/fonts/source-sans-3:vf@5.3.0/latin-wght-normal.woff2", paquet: "@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2" },
  { distante: "https://cdn.jsdelivr.net/fontsource/fonts/material-symbols-outlined:vf@5.3.8/latin-wght-normal.woff2", paquet: "@fontsource-variable/material-symbols-outlined/files/material-symbols-outlined-latin-wght-normal.woff2" },
  { distante: "https://cdn.jsdelivr.net/fontsource/fonts/noto-mono@5.3.0/latin-400-normal.woff2", paquet: "@fontsource/noto-mono/files/noto-mono-latin-400-normal.woff2" },
];

const nature = (v) => {
  if (v === null || v === undefined) return "vide";
  if (Array.isArray(v)) return "liste";
  if (estTraduisible(v)) return "traduisible";
  if (typeof v === "object") return "objet";
  return typeof v;
};
const long = (t) => typeof t === "string" && (t.length > 80 || t.includes("\n"));

/**
 * Produit la configuration Sveltia à partir du contenu et du dictionnaire admin.
 * @param {object} p
 * @param {object} p.contenu  { site, sections, projets, cv }
 * @param {object} p.fr       Design_System/i18n/admin.fr.json
 */
export function configurationCms({ contenu, fr }) {
  const libelle = (cle) => ({ fr: fr.editeur.francais, en: fr.editeur.anglais })[cle] ?? fr.champs[cle] ?? cle;

  /* Catalogue des disciplines, lu dans la section qui porte le filtre : il
     devient la liste de choix du champ « categories » d'un projet. Aucune
     discipline n'est écrite ici — ajouter une ligne au catalogue suffit. */
  const disciplines = ((contenu.sections ?? []).find((s) => Array.isArray(s.categories))?.categories ?? [])
    .map((d) => ({ value: d.id, label: d.libelle?.fr ?? d.id }));

  /* Champs facultatifs que les gabarits savent lire mais que les données
     peuvent ne pas contenir (un champ vide n'est pas enregistré) : déclarés
     ici pour rester proposés dans le CMS même vides. Chemin → champs. */
  const fichierJoint = (aide) => ({ name: "src", label: libelle("src"), required: false, widget: "file", hint: aide });
  const FACULTATIFS = {
    "site.seo": [{ name: "image", label: libelle("image"), required: false, widget: "object", fields: [{ name: "src", label: libelle("src"), required: false, widget: "image", hint: fr.medias.aideImage }] }],
    "site.contact": [{ name: "cv", label: libelle("cv"), required: false, widget: "object", fields: [fichierJoint(fr.medias.aideDocument), traduisible({ name: "nomTelechargement", label: libelle("nomTelechargement"), required: false }, [])] }],
    "projets[]": [{ name: "document", label: libelle("document"), required: false, widget: "object", fields: [fichierJoint(fr.medias.aideDocument), traduisible({ name: "libelle", label: libelle("libelle"), required: false }, [])] }],
    "projets[].medias[]": [{ name: "poster", label: libelle("poster"), required: false, widget: "image", hint: fr.medias.aideImage }],
  };
  FACULTATIFS["cv.seo"] = FACULTATIFS["site.seo"];

  /** Champ déduit de toutes les valeurs rencontrées pour une même clé. */
  function champ(cle, valeurs, chemin) {
    const presentes = valeurs.filter((v) => v !== null && v !== undefined);
    const natures = new Set(presentes.map(nature));
    const base = { name: cle, label: libelle(cle), required: presentes.length === valeurs.length && presentes.length > 0 };

    if (TECHNIQUES.has(cle)) return { name: cle, widget: "hidden" };
    // L'aide de l'identifiant dépend de ce qu'il identifie : celui d'un projet
    // forme l'adresse de sa page, celui d'une catégorie ne forme aucune adresse
    // — il sert à rattacher les projets. Dire l'un pour l'autre induit en erreur.
    if (cle === "id") {
      const categorie = /\.categories\b/.test(chemin);
      return { ...base, widget: "string", hint: categorie ? fr.editeur.aideIdentifiantCategorie : fr.editeur.aideIdentifiant };
    }
    // Disciplines d'un projet : une liste d'identifiants du catalogue. Saisie
    // libre, elle produirait des rattachements morts ; en choix multiple, les
    // options sont le catalogue lui-même, libellés compris.
    if (cle === "categories" && chemin.startsWith("projets")) {
      return { ...base, required: false, widget: "select", multiple: true, options: disciplines };
    }
    if (cle === "frequence") return { ...base, widget: "select", options: Object.entries(fr.frequences).map(([value, label]) => ({ value, label })) };
    if (natures.has("liste")) return liste(base, valeurs.flatMap((v) => (Array.isArray(v) ? [v] : [])), chemin);
    if (natures.size === 1 && natures.has("traduisible")) return traduisible(base, presentes);
    if (natures.has("objet")) return objet(base, presentes, chemin);
    if (cle === "src" || cle === "poster" || presentes.some((v) => typeof v === "string" && MEDIA.test(v)) || (cle === "image" && presentes.length === 0)) {
      return { ...base, widget: "image", hint: fr.medias.aideImage };
    }
    if (natures.has("boolean")) return { ...base, widget: "boolean" };
    if (natures.has("number") || /^(debut|fin)$/.test(cle)) return { ...base, widget: "number", value_type: "int" };
    return texte(base, presentes);
  }

  function texte(base, valeurs) {
    const aide = valeurs.some((v) => typeof v === "string" && v.includes("**")) ? fr.editeur.aideEnrichi
      : valeurs.some((v) => typeof v === "string" && v.includes("{numero}")) ? fr.editeur.aideMotif : undefined;
    return { ...base, widget: valeurs.some(long) ? "text" : "string", ...(aide ? { hint: aide } : {}) };
  }

  /** { fr, en } : deux champs, l'anglais facultatif (un texte sans anglais s'affiche en français). */
  function traduisible(base, valeurs) {
    const langue = (code, label, requis) => texte({ name: code, label, required: requis }, valeurs.map((v) => v[code]).filter((t) => typeof t === "string"));
    return { ...base, widget: "object", fields: [langue("fr", fr.editeur.francais, base.required && valeurs.every((v) => v.fr)), langue("en", fr.editeur.anglais, false)] };
  }

  /** Objet : l'union des clés de toutes les occurrences, dans leur ordre d'apparition. */
  function sousChamps(objets, chemin) {
    const cles = [...new Set(objets.flatMap((o) => Object.keys(o)))];
    const deduits = cles.map((cle) => champ(cle, objets.map((o) => o[cle]), `${chemin}.${cle}`));
    return [...deduits, ...(FACULTATIFS[chemin] ?? []).filter((f) => !cles.includes(f.name))];
  }

  function objet(base, valeurs, chemin) {
    // Éléments mixtes (texte { fr, en } OU objet structuré) : union des deux formes, tout facultatif.
    const mixte = valeurs.some(estTraduisible);
    return { ...base, widget: "object", fields: sousChamps(valeurs, chemin).map((f) => (mixte ? { ...f, required: false } : f)) };
  }

  function liste(base, listes, chemin) {
    const elements = listes.flat();
    const natures = new Set(elements.filter((v) => v !== null).map(nature));
    const commun = { ...base, required: false, widget: "list", label_singular: base.label };
    if (elements.length === 0 || (natures.size === 1 && natures.has("string"))) {
      return { ...commun, field: texte({ name: "valeur", label: base.label, required: true }, elements) };
    }
    if (natures.size === 1 && natures.has("traduisible")) return { ...commun, field: traduisible({ name: "valeur", label: base.label, required: true }, elements) };
    return { ...commun, fields: objet({ name: "x", label: "x", required: true }, elements, `${chemin}[]`).fields, summary: resume(elements) };
  }

  /** Texte de chaque élément dans la liste : son titre, son nom… en français. */
  function resume(elements) {
    const cle = ["titre", "nom", "texte", "libelle", "etiquette", "navigation", "valeur", "id"].find((c) => elements.some((e) => e && e[c] !== undefined));
    if (!cle) return undefined;
    return elements.some((e) => estTraduisible(e?.[cle])) ? `{{fields.${cle}.fr}}` : `{{fields.${cle}}}`;
  }

  /** Sections : une liste à types (couverture, introduction…), distingués par leur clé « type ». */
  function sections(liste) {
    const types = [...new Set(liste.map((s) => s.type))];
    return {
      name: "sections", label: fr.documents.sections, label_singular: fr.cms.section, widget: "list", root: true, typeKey: "type",
      types: types.map((type) => {
        const occurrences = liste.filter((s) => s.type === type).map(({ type: _, ...reste }) => reste);
        const nom = occurrences.find((s) => estTraduisible(s.navigation))?.navigation.fr ?? type.charAt(0).toUpperCase() + type.slice(1);
        return { name: type, label: nom, widget: "object", fields: sousChamps(occurrences, `sections[${type}]`) };
      }),
    };
  }

  const fichier = (cle, champs) => ({ name: cle, label: fr.documents[cle], file: `content/${cle}.json`, format: "json", fields: champs });
  return {
    backend: {
      name: "github", repo: DEPOT, branch: BRANCHE,
      commit_messages: {
        create: "Contenu : créer {{collection}} « {{slug}} »",
        update: "Contenu : modifier {{collection}} « {{slug}} »",
        delete: "Contenu : supprimer {{collection}} « {{slug}} »",
        uploadMedia: "Média : ajouter « {{path}} »",
        deleteMedia: "Média : supprimer « {{path}} »",
      },
    },
    media_folder: DOSSIER_IMAGES,
    public_folder: DOSSIER_IMAGES,
    // Noms de fichiers sans espace ni majuscule à l'envoi : adresses d'images sûres.
    media_libraries: { default: { config: { max_file_size: OCTETS_MAX, slugify_filename: true } } },
    output: { omit_empty_optional_fields: true, json: { indent_style: "space", indent_size: 2 } },
    collections: [{
      name: "contenu", label: fr.cms.collection,
      files: [
        fichier("site", sousChamps([contenu.site], "site")),
        fichier("sections", [sections(contenu.sections)]),
        fichier("projets", [{ ...liste({ name: "projets", label: fr.documents.projets, required: false }, [contenu.projets], "projets"), root: true }]),
        fichier("cv", sousChamps([contenu.cv], "cv")),
      ],
    }],
  };
}

/** Page du CMS : aucun texte écrit ici, tout vient du dictionnaire admin. */
function page({ fr, nom }) {
  const echapper = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${echapper(fr.titre.replace("{nom}", nom))}</title>
<link href="config.json" type="application/json" rel="cms-config-url">
</head>
<body>
<noscript>${echapper(fr.sansScript)}</noscript>
<script src="sveltia-cms.js"></script>
</body>
</html>
`;
}

/** Remplace les adresses de polices du CDN par les fichiers servis avec le CMS. */
export function localiserPolices(code) {
  let resultat = code;
  for (const { distante, paquet } of POLICES) {
    if (!resultat.includes(distante)) throw new Error(`Police attendue absente de Sveltia CMS : ${distante}. Mettre à jour POLICES dans tools/cms.mjs.`);
    resultat = resultat.split(distante).join(`polices/${path.basename(paquet)}`);
  }
  if (/cdn\.jsdelivr\.net\/fontsource/.test(resultat)) throw new Error("Une police de Sveltia CMS pointe encore vers le CDN.");
  return resultat;
}

export async function construireCms({ racine, sortie, contenu }) {
  const fr = JSON.parse(await fs.readFile(path.join(racine, "Design_System/i18n/admin.fr.json"), "utf8"));
  const cible = path.join(sortie, "admin");
  const modules = path.join(racine, "node_modules");
  await fs.mkdir(path.join(cible, "polices"), { recursive: true });
  const nom = contenu.site.identite.nom?.fr ?? contenu.site.identite.nom;
  await fs.writeFile(path.join(cible, "index.html"), page({ fr, nom }));
  await fs.writeFile(path.join(cible, "config.json"), `${JSON.stringify(configurationCms({ contenu, fr }), null, 2)}\n`);
  const dist = path.join(modules, "@sveltia/cms/dist");
  await fs.writeFile(path.join(cible, "sveltia-cms.js"), localiserPolices(await fs.readFile(path.join(dist, "sveltia-cms.js"), "utf8")));
  await fs.cp(path.join(dist, "chunks"), path.join(cible, "chunks"), { recursive: true, filter: (f) => !f.endsWith(".map") });
  for (const { paquet } of POLICES) await fs.copyFile(path.join(modules, paquet), path.join(cible, "polices", path.basename(paquet)));
}
