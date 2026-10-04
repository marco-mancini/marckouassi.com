/**
 * PARCOURS — la section 06 immersive (#128, #132).
 *
 * Les tests portent sur la narration et sur l'architecture : l'ordre des
 * étapes, la carte juste, l'absence de contenu en dur, et le fait que les
 * projets viennent des données existantes sans seconde galerie.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Decouverte } from "../Design_System/gabarits/Decouverte/Decouverte.js";
import { chargerFichiers } from "../tools/contenu.mjs";

const fr = JSON.parse(fs.readFileSync("Design_System/i18n/fr.json", "utf8"));
const en = JSON.parse(fs.readFileSync("Design_System/i18n/en.json", "utf8"));
const contenu = await chargerFichiers(process.cwd());
const section = contenu.sections.find((s) => s.type === "prestations");
const parcours = section.parcours;

const ctxLangue = (langue) => {
  const dico = langue === "fr" ? fr : en;
  return {
    t: (cle) => {
      const valeur = cle.split(".").reduce((o, k) => o?.[k], dico);
      assert.ok(typeof valeur === "string", `clé absente en ${langue} : ${cle}`);
      return valeur;
    },
    c: (valeur) => (valeur?.[langue] ?? valeur?.fr ?? ""),
    pageProjet: (projet) => `/projets/${projet.id}/`,
  };
};

const rendre = (langue = "fr", options = {}) => String(Decouverte({
  parcours, projets: contenu.projets, ctx: ctxLangue(langue),
  chemin: `sections.${section.id}.parcours`, ancreProjets: "sommaire", idSection: section.id, ...options,
}));

test("sans données de parcours, la section 06 ne rend aucune expérience", () => {
  assert.equal(Decouverte({ parcours: undefined, projets: [], ctx: ctxLangue("fr"), chemin: "x", ancreProjets: "y", idSection: "z" }), "");
});

test("les étapes se suivent dans l'ordre narratif validé", () => {
  const sortie = rendre();
  const ordre = [...sortie.matchAll(/data-decouverte-etape="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ordre, ["question", "cartes", "transition", "intention", "territoire", "systeme", "realisations", "conclusion"]);
});

test("les quatre cartes sont dans l'ordre de la progression, et une seule est juste", () => {
  const sortie = rendre();
  const cartes = [...sortie.matchAll(/data-decouverte-carte="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(cartes, ["etre-vue", "etre-comprise", "etre-ressentie", "etre-reconnue"]);
  // La progression validée mène de « être vue » à « être reconnue ».
  assert.equal(cartes.at(-1), "etre-reconnue");
  assert.equal([...sortie.matchAll(/data-decouverte-juste/g)].length, 1);
  assert.match(sortie, /data-decouverte-carte="etre-reconnue" data-decouverte-juste|data-decouverte-juste[^>]*>|aria-controls="decouverte-revelation-etre-reconnue"/);
});

test("chaque révélation est reliée à sa carte, et à elle seule", () => {
  const sortie = rendre();
  for (const carte of parcours.cartes) {
    const bouton = new RegExp(`id="decouverte-carte-${carte.id}"[^>]*aria-controls="decouverte-revelation-${carte.id}"`);
    assert.match(sortie, bouton, `${carte.id} : le bouton ne commande pas sa révélation`);
    assert.match(sortie, new RegExp(`id="decouverte-revelation-${carte.id}"`), `${carte.id} : révélation absente`);
    // Le texte de la carte est bien celui de ses données, pas d'une autre.
    assert.ok(sortie.includes(carte.revelation.fr), `${carte.id} : révélation non rendue`);
  }
});

test("le verdict juste diffère des autres par son texte, pas seulement par la couleur", () => {
  const sortie = rendre();
  assert.ok(sortie.includes(parcours.verdicts.juste.fr), "le verdict juste est écrit");
  assert.ok(sortie.includes(parcours.verdicts.insuffisant.fr), "le verdict insuffisant est écrit");
  assert.notEqual(parcours.verdicts.juste.fr, parcours.verdicts.insuffisant.fr);
  assert.equal([...sortie.matchAll(/data-decouverte-verdict="juste"/g)].length, 1);
  assert.equal([...sortie.matchAll(/data-decouverte-verdict="insuffisant"/g)].length, 3);
});

test("les cartes sont des boutons de divulgation : utilisables au clavier", () => {
  const sortie = rendre();
  for (const carte of parcours.cartes) {
    assert.match(sortie, new RegExp(`<button type="button" class="decouverte__carte" id="decouverte-carte-${carte.id}" aria-expanded="false"`), `${carte.id} : pas un bouton replié`);
  }
  // La révélation est repliée par l'état du bouton, PAS par un attribut
  // « hidden » du document : sans JavaScript, son texte doit se lire.
  assert.equal([...sortie.matchAll(/class="decouverte__revelation"/g)].length, parcours.cartes.length);
  assert.ok(!/class="decouverte__revelation"[^>]*\shidden/.test(sortie), "aucune révélation masquée dans le document");
  for (const carte of parcours.cartes) {
    assert.ok(sortie.includes(carte.revelation.fr), `${carte.id} : texte lisible sans script`);
  }
});

test("l'intention présente une question à la fois, chacune avec son texte", () => {
  const sortie = rendre();
  const intention = parcours.intention;
  assert.equal(intention.moments.length, 3);
  for (const moment of intention.moments) {
    assert.ok(sortie.includes(moment.titre.fr), `question absente : ${moment.titre.fr}`);
    assert.ok(sortie.includes(moment.texte.fr), `texte absent pour : ${moment.titre.fr}`);
  }
  assert.ok(sortie.includes(intention.conclusion.fr));
});

test("territoire et système font émerger leurs notions dans l'ordre", () => {
  const sortie = rendre();
  assert.deepEqual(parcours.matieres.map((m) => m.id), ["territoire", "systeme"]);
  for (const id of ["territoire", "systeme"]) {
    const etape = parcours.matieres.find((e) => e.id === id);
    const rendus = [...sortie.matchAll(new RegExp(`class="decouverte__element decouverte__element--${id}"[^>]*>([^<]+)<`, "g"))].map((m) => m[1]);
    assert.deepEqual(rendus, etape.elements.map((e) => e.fr), `${id} : ordre des notions`);
    assert.ok(sortie.includes(etape.conclusion.fr), `${id} : conclusion absente`);
  }
});

test("les projets viennent des données, et le parcours ne crée pas de seconde galerie", () => {
  const sortie = rendre();
  // Un lien par projet, vers sa page existante, dans l'ordre des données.
  const liens = [...sortie.matchAll(/class="decouverte__marque-lien" href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(liens, contenu.projets.map((p) => `/projets/${p.id}/`));
  // #128 §20 : aucune grille de cartes projet dupliquée ici.
  assert.ok(!sortie.includes("projet-carte"), "une galerie parallèle a été recréée");
});

test("la conclusion mène à la trace, puis à la forme, puis à la signature", () => {
  const sortie = rendre();
  const positions = [parcours.conclusion.question, parcours.conclusion.revelation, parcours.conclusion.suite, parcours.conclusion.signature]
    .map((valeur) => sortie.indexOf(valeur.fr));
  assert.ok(positions.every((p) => p >= 0), "un texte de conclusion manque");
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, "l'ordre de la conclusion n'est pas respecté");
});

test("la navigation finale réutilise l'ancre des projets, sans route parallèle", () => {
  const sortie = rendre("fr", { ancreProjets: "sommaire" });
  assert.match(sortie, /href="#sommaire"/);
  assert.match(sortie, /data-decouverte-fermer/);
  // L'ancre vient des données : la changer change le lien.
  assert.match(rendre("fr", { ancreProjets: "autre" }), /href="#autre"/);
});

test("aucun texte métier n'est écrit dans le gabarit", () => {
  // Tout passe par le contenu et le dictionnaire : marqués, il ne doit rester
  // aucun mot dans le rendu.
  const MARQUE = "⟦x⟧";
  const faux = { t: () => MARQUE, c: () => MARQUE, pageProjet: () => "/x/" };
  const sortie = String(Decouverte({ parcours, projets: contenu.projets, ctx: faux, chemin: "x", ancreProjets: "y", idSection: "z" }));
  const visible = [...sortie.matchAll(/>([^<]+)</g)].map((m) => m[1]).join(" ").replaceAll(MARQUE, " ");
  assert.ok(!/\p{L}{2,}/u.test(visible), `texte en dur dans le rendu : « ${visible.trim().slice(0, 80)} »`);
});

test("le parcours existe entièrement en français et en anglais", () => {
  for (const langue of ["fr", "en"]) {
    const sortie = rendre(langue);
    for (const carte of parcours.cartes) {
      assert.ok(sortie.includes(carte.titre[langue]), `${langue} : titre de ${carte.id} absent`);
      assert.ok(sortie.includes(carte.revelation[langue]), `${langue} : révélation de ${carte.id} absente`);
    }
    assert.ok(sortie.includes(parcours.question[langue]), `${langue} : grande question absente`);
    assert.ok(sortie.includes(parcours.conclusion.revelation[langue]), `${langue} : la trace est absente`);
    assert.ok(sortie.includes(parcours.navigation.retour[langue]), `${langue} : retour absent`);
  }
});

test("aucune phrase du parcours n'est restée en français dans la version anglaise", () => {
  // Un repli silencieux ferait passer du français pour de l'anglais. On ne
  // contrôle que les PHRASES : « Image », « Logo » ou « Compositions » sont
  // identiques dans les deux langues sans que rien ne manque, et la signature
  // de M. Kouassi ne se traduit pas.
  const aTraduire = [];
  const parcourir = (valeur, ou) => {
    if (!valeur || typeof valeur !== "object") return;
    if (typeof valeur.fr === "string" && typeof valeur.en === "string") {
      const phrase = valeur.fr.trim().includes(" ");
      if (phrase && valeur.fr === valeur.en && !/^M\./.test(valeur.fr)) aTraduire.push(`${ou} : « ${valeur.fr} »`);
      return;
    }
    for (const [cle, v] of Object.entries(valeur)) if (!cle.startsWith("_")) parcourir(v, `${ou}.${cle}`);
  };
  parcourir(parcours, "parcours");
  assert.deepEqual(aTraduire, [], "phrases identiques en FR et EN");
});

test("chaque mot resté identique en anglais l'est parce qu'il se dit pareil", () => {
  // Le test voisin ne regarde que les phrases. Ce verrou-là nomme les mots
  // simples admis : si un autre apparaît, il faut le vérifier, pas l'ignorer.
  const admis = new Set(["Image", "Logo", "Compositions", "M. Kouassi"]);
  const identiques = [];
  const parcourir = (valeur) => {
    if (!valeur || typeof valeur !== "object") return;
    if (typeof valeur.fr === "string" && typeof valeur.en === "string") {
      if (valeur.fr === valeur.en) identiques.push(valeur.fr);
      return;
    }
    for (const [cle, v] of Object.entries(valeur)) if (!cle.startsWith("_")) parcourir(v);
  };
  parcourir(parcours);
  assert.deepEqual(identiques.filter((mot) => !admis.has(mot)), []);
});
