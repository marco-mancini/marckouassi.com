/**
 * BASE DE CONNAISSANCE DE MARCOS (phase IA-01).
 *
 * Ce que ces tests garantissent, et pourquoi la méthode est celle-là.
 *
 * Les exclusions de MarcoS sont STRUCTURELLES : un champ exclu n'est pas
 * « filtré », il n'est jamais lu. Vérifier l'absence d'un TEXTE ne le prouve
 * pas — « Abidjan, Côte d'Ivoire » est à la fois dans `cv.informations` et,
 * légitimement, dans les faits de la couverture affichés sur le site. Chercher
 * la chaîne donnerait une fausse alerte, et chercher le nom du champ donnerait
 * une fausse garantie.
 *
 * D'où la méthode du MARQUEUR : on injecte une chaîne impossible dans chaque
 * champ exclu, puis on vérifie qu'elle ne ressort nulle part. Si quelqu'un
 * ajoute un jour un parcours générique du contenu, ces tests tombent.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { chargerFichiers } from "../tools/contenu.mjs";
import { baseConnaissance, mesurer, pagesConnues, PLAFOND_JETONS } from "../Design_System/gabarits/connaissance.js";

const MARQUEUR = "⟦INTERDIT-7f3a⟧";
const contenu = await chargerFichiers(process.cwd());
const marque = { fr: MARQUEUR, en: MARQUEUR };

/** Copie du contenu avec le marqueur posé dans tous les champs exclus. */
function contenuMarque() {
  const copie = structuredClone(contenu);
  // D-12 : retirés des projets.
  for (const p of copie.projets) { p.contexte = marque; p.valeur = marque; }
  // D-12 : doublon de cv.experience.
  const parcours = copie.sections.find((s) => s.type === "parcours");
  if (parcours) for (const e of parcours.etapes ?? []) { e.texte = marque; e.titre = marque; e.lieu = marque; }
  // D-3 : téléphone, adresse précise, date de naissance.
  copie.cv.informations = [{ valeur: marque }, { valeur: marque, type: "email" }];
  // Médias et textes alternatifs.
  for (const p of copie.projets) {
    p.altImages = marque;
    for (const m of p.medias ?? []) { m.alt = marque; m.src = MARQUEUR; }
  }
  // Métadonnées internes et titres de rubriques du CV.
  copie.cv._role = MARQUEUR;
  copie.cv.titres = { informations: marque, competences: marque, experience: marque, formation: marque, ia: marque, forces: marque, references: marque };
  // D-14 : un profil personnel ajouté au contenu n'entre pas tout seul.
  copie.site.profil = marque;
  copie.site.seo = { ...copie.site.seo, titre: marque, description: marque };
  return copie;
}

test("exclusions structurelles : aucun champ exclu ne ressort, dans aucune langue", () => {
  const abime = contenuMarque();
  for (const langue of contenu.site.langues) {
    const base = baseConnaissance({ contenu: abime, langue });
    assert.ok(!JSON.stringify(base).includes(MARQUEUR), `${langue} : un champ exclu est entré dans la base`);
  }
});

test("le contrôle par marqueur détecte bien une fuite (témoin)", () => {
  // Si le marqueur est posé dans un champ RETENU, il doit ressortir : sans ce
  // témoin, le test précédent passerait même si la base était vide.
  const abime = structuredClone(contenu);
  abime.projets[0].idee = marque;
  const base = baseConnaissance({ contenu: abime, langue: "fr" });
  assert.ok(JSON.stringify(base).includes(MARQUEUR), "un champ retenu doit ressortir");
});

test("la base contient ce qu'elle doit contenir", () => {
  const base = baseConnaissance({ contenu, langue: "fr" });
  assert.equal(base.projets.length, contenu.projets.length);
  for (const p of base.projets) {
    for (const cle of ["id", "titre", "categorie", "periode", "idee", "page"]) {
      assert.ok(p[cle], `projet ${p.id} : ${cle} manquant`);
    }
    assert.ok(!("contexte" in p) && !("valeur" in p), `projet ${p.id} : champ retiré présent`);
  }
  assert.ok(base.cv.experiences.length > 0, "les expériences du CV sont la source du parcours");
  assert.ok(base.cv.references.length > 0);
  assert.ok(base.contact.email);
  assert.ok(base.identite.nom);
  assert.ok(!("informations" in base.cv), "cv.informations ne doit pas apparaître");
});

test("une seule langue par base, et repli sur le français quand l'anglais manque", () => {
  const fr = baseConnaissance({ contenu, langue: "fr" });
  const en = baseConnaissance({ contenu, langue: "en" });
  assert.equal(fr.langue, "fr");
  assert.equal(en.langue, "en");
  assert.notEqual(JSON.stringify(fr.projets[0]), JSON.stringify(en.projets[0]), "les deux langues diffèrent");

  const sansAnglais = structuredClone(contenu);
  delete sansAnglais.projets[0].idee.en;
  const base = baseConnaissance({ contenu: sansAnglais, langue: "en" });
  // Le repli rend la valeur française, passée par le même nettoyage que le
  // reste : on la compare donc à la base française, pas au contenu brut.
  assert.equal(base.projets[0].idee, fr.projets[0].idee, "repli sur le français, nettoyé comme ailleurs");
  assert.notEqual(base.projets[0].idee, en.projets[0].idee, "sans repli, l'anglais diffère");
});

test("taille bornée : le fichier publié reste sous le plafond, dans chaque langue", () => {
  for (const langue of contenu.site.langues) {
    const { jetons } = mesurer(baseConnaissance({ contenu, langue }));
    assert.ok(jetons <= PLAFOND_JETONS, `${langue} : ${jetons} jetons, plafond ${PLAFOND_JETONS}`);
  }
});

test("le nettoyage retire le balisage d'emphase et aplatit les retours à la ligne", () => {
  // Le `**` du site est de la mise en forme, pas du sens : il coûte quatre
  // caractères de contexte par emphase. Les retours à la ligne du contenu
  // casseraient la mise en forme que le Worker appliquera en IA-03.
  const base = baseConnaissance({ contenu, langue: "fr" });
  const json = JSON.stringify(base);
  assert.ok(!json.includes("**"), "aucune emphase ne doit subsister");
  assert.ok(!json.includes("\\n"), "aucun retour à la ligne ne doit subsister");
  assert.ok(contenu.cv.titre.fr.includes("\n"), "témoin : le contenu source en contient bien");
});

test("les pages citables couvrent chaque projet, et aucun lien n'est inventé", () => {
  const base = baseConnaissance({ contenu, langue: "fr" });
  const connues = new Set(base.pages.map((p) => p.id));
  for (const p of base.projets) {
    assert.ok(connues.has(p.id), `le projet ${p.id} doit être citable`);
    assert.equal(base.pages.find((x) => x.id === p.id).href, p.page);
  }
  assert.ok(connues.has("accueil") && connues.has("cv"));
  for (const page of base.pages) {
    assert.match(page.href, /^\/[\w\-/#]*$/, `adresse interne attendue : ${page.href}`);
  }
});

test("résistance : projet retiré, aucun projet, section absente", () => {
  const unSeul = structuredClone(contenu);
  unSeul.projets = [unSeul.projets[0]];
  assert.equal(baseConnaissance({ contenu: unSeul, langue: "fr" }).projets.length, 1);

  const aucun = structuredClone(contenu);
  aucun.projets = [];
  const base = baseConnaissance({ contenu: aucun, langue: "fr" });
  assert.ok(!base.projets, "aucune clé vide : compact() retire les listes vides");
  assert.equal(pagesConnues(aucun).filter((p) => p.href.startsWith("/projets/")).length, 0);

  const sansSections = structuredClone(contenu);
  sansSections.sections = [];
  assert.doesNotThrow(() => baseConnaissance({ contenu: sansSections, langue: "fr" }), "une section absente ne doit pas casser la base");
});

test("les éléments de CV à précision ne se perdent pas", () => {
  // content/cv.json mélange { fr, en } et { texte, precision } : la seconde
  // forme disparaît sans bruit si on ne la traite pas.
  const avec = structuredClone(contenu);
  avec.cv.competences.groupes[0].elements = [{ texte: { fr: "Base", en: "Base" }, precision: { fr: "(précisé)", en: "(detail)" } }];
  const base = baseConnaissance({ contenu: avec, langue: "fr" });
  assert.equal(base.cv.competences[0].elements[0], "Base (précisé)");
});
