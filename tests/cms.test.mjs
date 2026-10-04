/**
 * CMS Git (Sveltia) : la configuration déclare TOUTES les clés de content/,
 * y compris _role et _origine. Une clé non déclarée serait réordonnée par
 * le CMS à l'enregistrement : ce test échoue si une seule manque.
 * Aussi : chemins d'images écrits par le CMS, polices servies en local.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { configurationCms, localiserPolices, POLICES, DOSSIER_IMAGES, FICHIERS } from "../tools/cms.mjs";
import { chargerFichiers, normaliserChemins, referencesMedias } from "../tools/contenu.mjs";
import { publierMedias, sourceLocale } from "../tools/medias.mjs";
import { estTraduisible } from "../Design_System/i18n/langue.js";

const fr = JSON.parse(fs.readFileSync("Design_System/i18n/admin.fr.json", "utf8"));
const lireBrut = (nom) => JSON.parse(fs.readFileSync(`content/${nom}.json`, "utf8"));
const brut = () => Object.fromEntries(FICHIERS.map((nom) => [nom, lireBrut(nom)]));

/** Chemins de content/ absents de la configuration (vide = tout est déclaré). */
export function clesNonDeclarees(config, contenu) {
  const manquantes = [];
  const fichiers = config.collections[0].files;
  const visiter = (valeur, champs, chemin) => {
    if (Array.isArray(valeur) || valeur === null || typeof valeur !== "object") return;
    for (const [cle, v] of Object.entries(valeur)) {
      const champ = champs.find((c) => c.name === cle);
      if (!champ) { manquantes.push(`${chemin}.${cle}`); continue; }
      descendre(v, champ, `${chemin}.${cle}`);
    }
  };
  const descendre = (valeur, champ, chemin) => {
    if (champ.widget === "list") {
      if (!Array.isArray(valeur)) return;
      valeur.forEach((element, rang) => {
        if (champ.types) {
          const type = champ.types.find((t) => t.name === element[champ.typeKey]);
          if (!type) { manquantes.push(`${chemin}.${rang} (type « ${element[champ.typeKey]} »)`); return; }
          const { [champ.typeKey]: _, ...reste } = element;
          visiter(reste, type.fields, `${chemin}.${rang}`);
        } else if (champ.field) descendre(element, champ.field, `${chemin}.${rang}`);
        else visiter(element, champ.fields, `${chemin}.${rang}`);
      });
    } else if (champ.widget === "object") visiter(valeur, champ.fields, chemin);
  };
  for (const fichier of fichiers) {
    const nom = path.basename(fichier.file, ".json");
    const [racine] = fichier.fields;
    if (racine?.root) descendre(contenu[nom], racine, nom);
    else visiter(contenu[nom], fichier.fields, nom);
  }
  return manquantes;
}

test("configuration CMS : chaque clé de content/ est déclarée, _role et _origine compris", () => {
  const contenu = brut();
  const config = configurationCms({ contenu, fr });
  assert.deepEqual(clesNonDeclarees(config, contenu), []);
  const texte = JSON.stringify(config);
  for (const cle of ["_role", "_origine"]) assert.ok(texte.includes(`"name":"${cle}","widget":"hidden"`), `${cle} doit être déclarée (champ caché)`);
});

test("le contrôle des clés échoue bien si une clé manque dans la configuration", () => {
  const contenu = brut();
  const config = configurationCms({ contenu, fr });
  const site = config.collections[0].files.find((f) => f.name === "site");
  site.fields = site.fields.filter((f) => f.name !== "url");
  assert.deepEqual(clesNonDeclarees(config, contenu), ["site.url"]);
  const sansRole = configurationCms({ contenu, fr });
  const cv = sansRole.collections[0].files.find((f) => f.name === "cv");
  cv.fields = cv.fields.filter((f) => f.name !== "_role");
  assert.deepEqual(clesNonDeclarees(sansRole, contenu), ["cv._role"]);
});

test("une clé ajoutée au contenu est déclarée sans retoucher la configuration", () => {
  const contenu = brut();
  contenu.projets[0].essaiNouvelleCle = { fr: "Valeur d'essai" };
  contenu.cv.essaiListe = ["a", "b"];
  assert.deepEqual(clesNonDeclarees(configurationCms({ contenu, fr }), contenu), []);
});

test("configuration CMS : dépôt, branche, dossier des images, libellés repris du dictionnaire", () => {
  const config = configurationCms({ contenu: brut(), fr });
  assert.equal(config.backend.name, "github");
  assert.equal(config.backend.repo, "marco-mancini/marckouassi.com");
  assert.equal(config.backend.branch, "main");
  assert.equal(config.media_folder, DOSSIER_IMAGES);
  assert.equal(config.public_folder, DOSSIER_IMAGES);
  assert.equal(config.output.omit_empty_optional_fields, true);
  assert.deepEqual(config.collections[0].files.map((f) => f.file), FICHIERS.map((n) => `content/${n}.json`));
  const site = config.collections[0].files.find((f) => f.name === "site");
  assert.equal(site.fields.find((f) => f.name === "url").label, fr.champs.url);
  // Champs facultatifs lus par les gabarits : proposés même vides.
  const seo = site.fields.find((f) => f.name === "seo");
  assert.ok(seo.fields.some((f) => f.name === "image"));
  assert.ok(site.fields.find((f) => f.name === "contact").fields.some((f) => f.name === "cv"));
});

test("chemin écrit par le CMS (« /Public/images/x.png ») ramené à la forme du build", () => {
  assert.equal(normaliserChemins("/Public/images/x.png"), "Public/images/x.png");
  assert.equal(normaliserChemins("Public/images/x.png"), "Public/images/x.png");
  assert.equal(normaliserChemins("/cv/"), "/cv/");
  assert.equal(normaliserChemins("/Public/images/Projet_TP_Solution 01.png"), "Public/images/Projet_TP_Solution 01.png");
  assert.deepEqual(normaliserChemins({ medias: [{ src: "/Public/images/a.jpg", alt: { fr: "/Public/ reste un texte ?" } }] }), { medias: [{ src: "Public/images/a.jpg", alt: { fr: "/Public/ reste un texte ?" } }] });
});

test("image déposée par le CMS : chemin normalisé au chargement, publiée en WebP compressé", async () => {
  // Copie de travail : content/ du dépôt, une image d'essai écrite comme le fait le CMS.
  const racine = fs.mkdtempSync(path.join(os.tmpdir(), "cms-"));
  const sortie = path.join(racine, "_site");
  fs.cpSync("content", path.join(racine, "content"), { recursive: true });
  fs.mkdirSync(path.join(racine, "Design_System/fondations"), { recursive: true });
  fs.copyFileSync("Design_System/fondations/Tokens.css", path.join(racine, "Design_System/fondations/Tokens.css"));
  fs.mkdirSync(path.join(racine, "Public/images"), { recursive: true });
  const original = fs.readFileSync("Public/images/Image_04.png");
  fs.writeFileSync(path.join(racine, "Public/images/essai-cms.png"), original);
  const site = JSON.parse(fs.readFileSync(path.join(racine, "content/site.json"), "utf8"));
  site.seo.image = { src: "/Public/images/essai-cms.png" };
  fs.writeFileSync(path.join(racine, "content/site.json"), JSON.stringify(site, null, 2));

  const contenu = await chargerFichiers(racine);
  assert.equal(contenu.site.seo.image.src, "Public/images/essai-cms.png");
  const references = referencesMedias(contenu).filter((src) => src === "Public/images/essai-cms.png");
  assert.equal(references.length, 1);
  const { table } = await publierMedias({ references, racine, sortie, lireSource: sourceLocale(racine), journal: { log() {}, warn() {} } });
  const publie = table.get("Public/images/essai-cms.png");
  assert.equal(publie.src, "Public/images/essai-cms.webp");
  const fichier = fs.readFileSync(path.join(sortie, publie.src));
  assert.equal(fichier.subarray(8, 12).toString(), "WEBP");
  assert.ok(fichier.length < original.length / 3, `WebP ${fichier.length} o pour un original de ${original.length} o`);
  assert.ok(publie.largeur <= 1600);
  fs.rmSync(racine, { recursive: true, force: true });
});

test("polices du CMS : adresses du CDN remplacées par les fichiers servis avec le site", () => {
  const code = fs.readFileSync("node_modules/@sveltia/cms/dist/sveltia-cms.js", "utf8");
  const local = localiserPolices(code);
  assert.ok(!/cdn\.jsdelivr\.net\/fontsource/.test(local));
  for (const { paquet } of POLICES) {
    assert.ok(fs.existsSync(path.join("node_modules", paquet)), paquet);
    assert.ok(local.includes(`polices/${path.basename(paquet)}`));
  }
  assert.throws(() => localiserPolices("aucune police ici"), /Police attendue absente/);
});

/* Repris de l'ancien back-office (en sommeil) : le CMS lit ces dictionnaires et cette fonction. */
const cles = (objet, prefixe = "") => Object.entries(objet).flatMap(([k, v]) => (k.startsWith("_") ? [] : v && typeof v === "object" && !Array.isArray(v) ? cles(v, `${prefixe}${k}.`) : [`${prefixe}${k}`]));

test("dictionnaires admin (libellés du CMS) : mêmes clés en FR et en EN", () => {
  const en = JSON.parse(fs.readFileSync("Design_System/i18n/admin.en.json", "utf8"));
  assert.deepEqual(cles(en).sort(), cles(fr).sort());
});

test("estTraduisible : un objet { fr, en } oui ; une donnée qui porte « id » non (régression)", () => {
  assert.ok(estTraduisible({ fr: "a", en: "b" }));
  assert.ok(estTraduisible({ fr: "a" }));
  assert.ok(!estTraduisible({ id: "fifa26", titre: { fr: "x" } }));
  assert.ok(!estTraduisible({ id: "x" }));
  assert.ok(!estTraduisible(["fr"]));
});

/**
 * Le CMS réécrit les clés d'une liste dans l'ordre de l'UNION des formes de
 * ses éléments, telle qu'il les rencontre. Des formes différentes ne posent
 * aucun problème en soi — le contenu en compte cinq qui tiennent depuis
 * toujours — tant que l'union reste compatible avec l'ordre de chacune.
 *
 * Ce qui casse, c'est une INVERSION : si un élément déclare « conclusion »
 * avant qu'un autre n'introduise « ouverture », l'union place « conclusion »
 * en premier, et plus aucun élément n'est écrit dans son propre ordre.
 * Enregistrer un champ sans rapport remanie alors le fichier entier.
 *
 * C'est exactement ce qu'a produit le parcours de la section 06. La règle est
 * donc écrite ici, et vaut pour les éditions futures de Marc.
 */
test("dans chaque liste du contenu, l'ordre des clés de chaque élément suit l'union", () => {
  const ecarts = [];
  const clesDe = (valeur) => Object.keys(valeur).filter((cle) => !cle.startsWith("_"));
  /** Les clés de l'élément apparaissent-elles dans l'ordre de l'union ? */
  const suitLUnion = (cles, union) => {
    let curseur = -1;
    return cles.every((cle) => {
      const place = union.indexOf(cle);
      if (place <= curseur) return false;
      curseur = place;
      return true;
    });
  };
  const parcourir = (valeur, ou) => {
    if (Array.isArray(valeur)) {
      const objets = valeur.filter((v) => v && typeof v === "object" && !Array.isArray(v));
      // Les sections forment une liste À TYPES : le CMS traite chaque type
      // séparément, avec sa propre forme. Rien à vérifier entre eux.
      if (objets.length > 1 && !objets.every((o) => o.type)) {
        const union = [];
        for (const objet of objets) for (const cle of clesDe(objet)) if (!union.includes(cle)) union.push(cle);
        for (const [rang, objet] of objets.entries()) {
          const cles = clesDe(objet);
          if (!suitLUnion(cles, union)) ecarts.push(`${ou}[${rang}] : [${cles.join(",")}] contredit l'union [${union.join(",")}]`);
        }
      }
      valeur.forEach((v, i) => parcourir(v, `${ou}[${i}]`));
      return;
    }
    if (valeur && typeof valeur === "object") {
      for (const [cle, v] of Object.entries(valeur)) if (!cle.startsWith("_")) parcourir(v, `${ou}.${cle}`);
    }
  };
  for (const [nom, donnees] of Object.entries(brut())) parcourir(donnees, nom);
  assert.deepEqual(ecarts, []);
});

test("le témoin : une inversion d'ordre est bien détectée", () => {
  // Sans ce témoin, le test voisin pourrait passer parce qu'il ne regarde rien.
  const union = [];
  const liste = [{ id: 1, titre: 2, moments: 3, conclusion: 4 }, { id: 1, titre: 2, ouverture: 3, elements: 4, conclusion: 5 }];
  for (const objet of liste) for (const cle of Object.keys(objet)) if (!union.includes(cle)) union.push(cle);
  assert.deepEqual(union, ["id", "titre", "moments", "conclusion", "ouverture", "elements"]);
  // Le second élément écrit « conclusion » en dernier, l'union l'attend en
  // quatrième : c'est la forme exacte qui a cassé l'enregistrement du CMS.
  const suit = (cles) => { let c = -1; return cles.every((k) => { const p = union.indexOf(k); if (p <= c) return false; c = p; return true; }); };
  assert.equal(suit(Object.keys(liste[0])), true);
  assert.equal(suit(Object.keys(liste[1])), false);
});

test("le parcours de la section 06 est écrit dans une forme que le CMS préserve", () => {
  const prestations = brut().sections.find((s) => s.type === "prestations");
  const parcours = prestations.parcours;
  assert.ok(parcours, "le parcours est la partie la plus imbriquée du contenu");
  for (const [nom, liste] of [["matieres", parcours.matieres], ["cartes", parcours.cartes]]) {
    const formes = [...new Set(liste.map((e) => Object.keys(e).join(",")))];
    assert.equal(formes.length, 1, `${nom} : formes différentes — ${formes.join(" | ")}`);
  }
  // « juste » est explicite partout : absent d'une carte, il rendrait le champ
  // optionnel pour toutes, et Sveltia pourrait l'écarter.
  assert.ok(parcours.cartes.every((c) => typeof c.juste === "boolean"));
  assert.equal(parcours.cartes.filter((c) => c.juste).length, 1, "une seule bonne réponse");
});
