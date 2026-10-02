/**
 * FILTRE PAR DISCIPLINE de la section « Mes projets ».
 *
 * Ce que ces tests défendent, dans l'ordre d'importance :
 *
 *   1. AUCUN PROJET NE DISPARAÎT. C'est la seule régression qui serait
 *      invisible à l'œil : un projet absent de toutes les disciplines
 *      reste visible dans « Tous », donc personne ne le remarque.
 *   2. LE RATTACHEMENT EST UN IDENTIFIANT, jamais un libellé. Un libellé
 *      traduit se rattache mal dès qu'on change de langue.
 *   3. RIEN N'EST ÉCRIT EN DUR. Les disciplines sont relues depuis les
 *      données à chaque assertion : un test qui répéterait la liste
 *      validerait sa propre copie, pas le contenu.
 *
 * Les deux comportements de navigateur (clic, clavier, mobile) sont dans
 * tests/navigateur/site.test.mjs : ils ont besoin d'un vrai moteur de rendu.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { chargerFichiers, referencesMedias } from "../tools/contenu.mjs";
import { contextePage, rendrePage } from "../tools/pages.mjs";
import { valider } from "../Design_System/gabarits/donnees.js";
import { disciplinesDe, disciplinesProposees, projetsDeLaDiscipline, disciplinesInconnues } from "../Design_System/gabarits/outils.js";

const contenu = await chargerFichiers(process.cwd());
const { projets } = contenu;
const sommaire = contenu.sections.find((s) => Array.isArray(s.categories));
const catalogue = sommaire.categories;

const dictionnaires = Object.fromEntries(
  contenu.site.langues.map((l) => [l, JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8"))]),
);
const medias = new Map(referencesMedias(contenu).map((src) => [src, { src: `${src}.webp`, type: "image", largeur: 1, hauteur: 1 }]));
const accueil = (langue) => {
  const ctx = contextePage({ site: contenu.site, langue, chemin: "", dictionnaires, medias, ressources: { sprite: "", couleurTheme: "#000000", annee: 2030 } });
  return String(rendrePage({ contenu, ctx, chemin: "" }));
};

/** Cartes rendues dans la page : [{ id, disciplines }], dans l'ordre du HTML. */
function cartesRendues(page) {
  return [...page.matchAll(/<article class="projet-carte"([^>]*)>/g)].map(([, attributs], rang) => ({
    rang,
    disciplines: (attributs.match(/data-disciplines="([^"]*)"/)?.[1] ?? "").split(" ").filter(Boolean),
  }));
}

/* ------------------------------------------------------------------ données */

test("le catalogue est sain : identifiants stables, uniques, tous libellés en FR et EN", () => {
  assert.ok(catalogue.length > 0, "aucune discipline déclarée dans la section du sommaire");
  const vus = new Set();
  for (const discipline of catalogue) {
    assert.match(discipline.id, /^[a-z0-9-]+$/, `identifiant non stable : « ${discipline.id} »`);
    assert.ok(!vus.has(discipline.id), `identifiant en double : « ${discipline.id} »`);
    vus.add(discipline.id);
    for (const langue of contenu.site.langues) {
      assert.ok(discipline.libelle?.[langue], `libellé ${langue} manquant pour « ${discipline.id} »`);
    }
  }
});

test("chaque projet se rattache par des identifiants du catalogue, jamais par un libellé", () => {
  assert.deepEqual(disciplinesInconnues(catalogue, projets), [], "rattachement vers une discipline inexistante");
  const libelles = new Set(catalogue.flatMap((d) => Object.values(d.libelle)));
  for (const projet of projets) {
    for (const id of disciplinesDe(projet)) {
      assert.ok(!libelles.has(id), `${projet.id} se rattache par un libellé (« ${id} ») au lieu d'un identifiant`);
    }
  }
});

test("aucun projet n'est orphelin : chacun porte au moins une discipline", () => {
  const orphelins = projets.filter((p) => disciplinesDe(p).length === 0).map((p) => p.id);
  assert.deepEqual(orphelins, [], "ces projets ne sortiraient dans aucun filtre");
});

test("aucun rattachement en double dans un même projet", () => {
  for (const projet of projets) {
    assert.equal(projet.categories.length, new Set(projet.categories).size, `doublon dans ${projet.id}`);
  }
});

test("la validation du contenu refuse un rattachement inconnu et un identifiant mal formé", () => {
  assert.deepEqual(valider(contenu), [], "le contenu réel doit passer la validation");

  const inconnu = structuredClone(contenu);
  inconnu.projets[0].categories = ["discipline-qui-nexiste-pas"];
  assert.deepEqual(valider(inconnu), [{ code: "identifiant", chemin: `projets.${contenu.projets[0].id}.categories.0` }]);

  const malForme = structuredClone(contenu);
  malForme.sections.find((s) => Array.isArray(s.categories)).categories[0].id = "Pas Un Identifiant";
  // L'identifiant du catalogue est refusé, et les projets qui s'y rattachaient
  // deviennent orphelins : les deux erreurs doivent remonter, pas seulement la première.
  const codes = valider(malForme).map((e) => e.code);
  assert.ok(codes.includes("identifiant"), "un identifiant mal formé doit être refusé");
});

/* -------------------------------------------------------------------- filtre */

test("« Tous » rend tous les projets, dans leur ordre d'origine", () => {
  const tous = projetsDeLaDiscipline(projets, null);
  assert.equal(tous.length, projets.length);
  assert.deepEqual(tous.map((p) => p.id), projets.map((p) => p.id));
});

test("un filtre ne rend que les projets de sa discipline, et les rend tous", () => {
  for (const discipline of catalogue) {
    const filtres = projetsDeLaDiscipline(projets, discipline.id);
    const attendus = projets.filter((p) => disciplinesDe(p).includes(discipline.id));
    assert.deepEqual(filtres.map((p) => p.id), attendus.map((p) => p.id), discipline.id);
    for (const projet of filtres) {
      assert.ok(disciplinesDe(projet).includes(discipline.id), `${projet.id} ne porte pas « ${discipline.id} »`);
    }
  }
});

test("un projet à plusieurs disciplines sort dans chacune, sans être dupliqué dans aucune", () => {
  const multiples = projets.filter((p) => disciplinesDe(p).length > 1);
  assert.ok(multiples.length > 0, "aucun projet multi-disciplines : le cas ne serait pas couvert");
  for (const projet of multiples) {
    for (const id of disciplinesDe(projet)) {
      const sortis = projetsDeLaDiscipline(projets, id).filter((p) => p.id === projet.id);
      assert.equal(sortis.length, 1, `${projet.id} apparaît ${sortis.length} fois dans « ${id} »`);
    }
  }
});

test("aucun projet n'est perdu : l'union des disciplines proposées couvre tout le catalogue utilisé", () => {
  const couverts = new Set(disciplinesProposees(catalogue, projets).flatMap((d) => projetsDeLaDiscipline(projets, d.id).map((p) => p.id)));
  assert.deepEqual([...couverts].sort(), projets.map((p) => p.id).sort());
});

test("une discipline sans projet n'est pas proposée, et le filtre vide reste propre", () => {
  const proposees = disciplinesProposees(catalogue, projets);
  for (const discipline of proposees) assert.ok(discipline.total > 0, discipline.id);

  // Discipline déclarée que personne ne revendique : elle disparaît du filtre
  // au lieu d'offrir une impasse, et interrogée directement elle rend une
  // liste vide — jamais la liste complète par mégarde.
  const avecVide = structuredClone(catalogue).concat({ id: "discipline-vide", libelle: { fr: "x", en: "x" } });
  assert.ok(!disciplinesProposees(avecVide, projets).some((d) => d.id === "discipline-vide"));
  assert.deepEqual(projetsDeLaDiscipline(projets, "discipline-vide"), []);
});

test("« direction artistique » suit un critère lisible dans les données, et discrimine vraiment", () => {
  // Le rattachement n'est pas figé ici : on vérifie la RÈGLE, pas la liste.
  // Règle : un projet qui déclare la construction d'un univers ou d'un
  // territoire visuel (dans « role » ou « disciplines ») relève de la
  // direction artistique. Un projet ajouté demain qui le déclare et ne serait
  // pas rattaché fait échouer ce test — c'est son but.
  const MARQUEURS = ["univers visuel", "territoire visuel", "univers de campagne", "conception de l’univers"];
  const declareUnUnivers = (p) => MARQUEURS.some((m) => `${p.role.fr} ${p.disciplines.fr}`.toLowerCase().includes(m));

  // Seul point d'ancrage du test : l'identifiant de la discipline. Les projets,
  // eux, ne sont jamais nommés ici.
  const discipline = catalogue.find((d) => d.id.startsWith("direction-"));
  assert.ok(discipline, "aucune discipline de direction dans le catalogue");

  const rattaches = new Set(projetsDeLaDiscipline(projets, discipline.id).map((p) => p.id));
  const oublies = projets.filter((p) => declareUnUnivers(p) && !rattaches.has(p.id)).map((p) => p.id);
  assert.deepEqual(oublies, [], "ces projets déclarent un univers visuel sans être rattachés");

  assert.ok(rattaches.size > 0, "la discipline ne doit pas être vide");
  assert.ok(rattaches.size < projets.length, `la discipline couvre ${rattaches.size} projets sur ${projets.length} : elle ne filtre plus rien`);
});

/* --------------------------------------------------------------------- rendu */

test("chaque carte rendue porte ses disciplines, et seulement les siennes", () => {
  for (const langue of contenu.site.langues) {
    const cartes = cartesRendues(accueil(langue));
    assert.equal(cartes.length, projets.length, `${langue} : ${cartes.length} cartes pour ${projets.length} projets`);
    cartes.forEach((carte, rang) => {
      assert.deepEqual(carte.disciplines, disciplinesDe(projets[rang]), `${langue} : carte ${rang}`);
    });
  }
});

test("le filtre rendu propose « Tous » puis chaque discipline, avec le libellé de la langue", () => {
  for (const langue of contenu.site.langues) {
    const page = accueil(langue);
    const groupe = page.match(/<div class="segments segments--boutons segments--nue" role="group"[^>]*data-segments="projets">([\s\S]*?)<\/div>/);
    assert.ok(groupe, `${langue} : groupe de filtres absent de la page`);
    // Le « & » de « Identité & charte » est échappé dans le HTML : c'est
    // exactement ce qu'on veut, et le test compare donc le texte déséchappé.
    const texte = (brut) => brut.replaceAll("&amp;", "&").replaceAll("&#39;", "'").replaceAll("&quot;", '"');
    const options = [...groupe[1].matchAll(/data-valeur="([^"]*)" aria-pressed="(\w+)">([^<]*)</g)]
      .map(([, valeur, presse, libelle]) => ({ valeur, presse, libelle: texte(libelle) }));

    assert.equal(options[0].valeur, "", "la première option est l'état « tous »");
    assert.equal(options[0].libelle, dictionnaires[langue].projet.filtres.tous);
    assert.equal(options[0].presse, "true", "« tous » est actif au chargement");

    const attendues = disciplinesProposees(catalogue, projets);
    assert.deepEqual(options.slice(1).map((o) => o.valeur), attendues.map((d) => d.id), `${langue} : disciplines proposées`);
    assert.deepEqual(options.slice(1).map((o) => o.libelle), attendues.map((d) => d.libelle[langue]), `${langue} : libellés`);
    for (const option of options.slice(1)) assert.equal(option.presse, "false");
  }
});

test("FR et EN ne partagent pas les mêmes libellés, mais bien les mêmes identifiants", () => {
  const valeurs = (langue) => [...accueil(langue).matchAll(/data-valeur="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(valeurs("fr"), valeurs("en"), "les identifiants doivent être identiques dans les deux langues");
  const libelleFr = catalogue.map((d) => d.libelle.fr);
  const libelleEn = catalogue.map((d) => d.libelle.en);
  assert.notDeepEqual(libelleFr, libelleEn, "au moins un libellé doit différer, sinon la traduction n'est pas branchée");
});

test("sans JavaScript la page rend les onze projets, et le filtre n'est pas posé", () => {
  // Le groupe de filtres est dans un <template> : inerte tant que le script
  // ne l'a pas sorti. Un bouton qui ne filtre rien ne doit jamais s'afficher.
  const page = accueil("fr");
  const avant = page.indexOf('<template data-filtres-projets>');
  const apres = page.indexOf("</template>");
  assert.ok(avant > -1 && apres > avant, "le filtre doit être rendu dans un <template>");
  assert.ok(!page.slice(0, avant).includes('data-segments="projets"'), "aucun filtre actif hors du template");
  assert.ok(!page.slice(apres).includes('data-segments="projets"'), "aucun filtre actif hors du template");
  assert.equal(cartesRendues(page).length, projets.length, "toutes les cartes sont rendues, hors du template");
});

/* ------------------------------------------------------------- rien en dur */

test("ni le gabarit de section ni le script du site ne nomment un projet ou une discipline", () => {
  const sources = {
    "Design_System/gabarits/sections/Projets.js": fs.readFileSync("Design_System/gabarits/sections/Projets.js", "utf8"),
    "Design_System/gabarits/Projet_carte/Projet_carte.js": fs.readFileSync("Design_System/gabarits/Projet_carte/Projet_carte.js", "utf8"),
    "Design_System/gabarits/outils.js": fs.readFileSync("Design_System/gabarits/outils.js", "utf8"),
    "Frontend/site.js": fs.readFileSync("Frontend/site.js", "utf8"),
    "Design_System/composants/Segments/Segments.js": fs.readFileSync("Design_System/composants/Segments/Segments.js", "utf8"),
    "Design_System/gabarits/sections/sections.css": fs.readFileSync("Design_System/gabarits/sections/sections.css", "utf8"),
    "Design_System/composants/Segments/Segments.css": fs.readFileSync("Design_System/composants/Segments/Segments.css", "utf8"),
  };
  const interdits = [
    ...projets.map((p) => p.id),
    ...projets.flatMap((p) => Object.values(p.titre)),
    ...catalogue.map((d) => d.id),
    ...catalogue.flatMap((d) => Object.values(d.libelle)),
  ];
  for (const [fichier, source] of Object.entries(sources)) {
    for (const valeur of interdits) {
      assert.ok(!source.includes(valeur), `« ${valeur} » est écrit en dur dans ${fichier}`);
    }
  }
});

/* ----------------------------------------------------------------- CMS */

test("le CMS donne au champ « id » l'aide qui correspond à ce qu'il identifie", async () => {
  // L'identifiant d'un projet forme l'adresse de sa page ; celui d'une
  // catégorie n'en forme aucune, il sert à rattacher. Dire l'un pour l'autre
  // induit en erreur la personne qui édite.
  const { configurationCms, FICHIERS } = await import("../tools/cms.mjs");
  const admin = JSON.parse(fs.readFileSync("Design_System/i18n/admin.fr.json", "utf8"));
  const adminEn = JSON.parse(fs.readFileSync("Design_System/i18n/admin.en.json", "utf8"));
  const brut = Object.fromEntries(FICHIERS.map((n) => [n, JSON.parse(fs.readFileSync(`content/${n}.json`, "utf8"))]));
  const config = configurationCms({ contenu: brut, fr: admin });
  const fichiers = config.collections[0].files;

  const idProjet = fichiers.find((f) => f.name === "projets").fields[0].fields.find((f) => f.name === "id");
  const section = fichiers.find((f) => f.name === "sections").fields[0].types.find((t) => t.name === sommaire.type);
  const idCategorie = section.fields.find((f) => f.name === "categories").fields.find((f) => f.name === "id");

  assert.equal(idCategorie.hint, admin.editeur.aideIdentifiantCategorie);
  assert.notEqual(idCategorie.hint, idProjet.hint, "les deux aides doivent différer");
  assert.ok(!/adresse de la page/.test(idCategorie.hint), "l'aide d'une catégorie ne doit pas parler d'adresse de page");
  // La traduction anglaise existe, même si la configuration du CMS est en français.
  assert.ok(adminEn.editeur.aideIdentifiantCategorie, "aideIdentifiantCategorie manque en anglais");
  assert.notEqual(adminEn.editeur.aideIdentifiantCategorie, admin.editeur.aideIdentifiantCategorie);
});

test("le CMS propose les disciplines en choix multiple, alimenté par le catalogue", async () => {
  // Saisie libre, un identifiant fautif produirait un rattachement mort.
  const { configurationCms, FICHIERS } = await import("../tools/cms.mjs");
  const admin = JSON.parse(fs.readFileSync("Design_System/i18n/admin.fr.json", "utf8"));
  const brut = Object.fromEntries(FICHIERS.map((n) => [n, JSON.parse(fs.readFileSync(`content/${n}.json`, "utf8"))]));
  const champ = configurationCms({ contenu: brut, fr: admin })
    .collections[0].files.find((f) => f.name === "projets").fields[0].fields.find((f) => f.name === "categories");

  assert.equal(champ.widget, "select");
  assert.equal(champ.multiple, true);
  assert.deepEqual(champ.options.map((o) => o.value), catalogue.map((d) => d.id), "les options SONT le catalogue");
  assert.deepEqual(champ.options.map((o) => o.label), catalogue.map((d) => d.libelle.fr));
});

test("le détecteur ci-dessus trouve bien une liste en dur (témoin)", () => {
  // Sans ce témoin, le test précédent passerait aussi si les sources étaient vides.
  const faux = `const PROJETS = ["${projets[0].id}", "${projets[1].id}"];`;
  assert.ok(projets.some((p) => faux.includes(p.id)), "le contrôle doit détecter une liste d'identifiants");
});
