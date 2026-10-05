/**
 * MARCOS, INTERFACE (IA-04) — composant Conversation et gabarit Assistant.
 *
 * Les tests portent sur le comportement, pas sur la présence de mots : ce qui
 * est rendu, ce qui ne l'est pas, et ce qui n'est jamais écrit en dur.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Conversation } from "../Design_System/composants/Conversation/Conversation.js";
import { Assistant, LONGUEUR_MAX, ETATS, ETAT_REPOS, ETATS_OUVERTS } from "../Design_System/gabarits/Assistant/Assistant.js";
import { CODES } from "../worker/assistant/src/erreurs.js";
import { contextePage } from "../Design_System/gabarits/pages.js";
import { PageAccueil } from "../Design_System/gabarits/sections/Pages.js";

const fr = JSON.parse(fs.readFileSync("Design_System/i18n/fr.json", "utf8"));
const en = JSON.parse(fs.readFileSync("Design_System/i18n/en.json", "utf8"));
const site = JSON.parse(fs.readFileSync("content/site.json", "utf8"));

/** Contexte minimal : les libellés sortent du dictionnaire, les textes des données. */
const ctx = {
  t: (cle, variables = {}) => {
    const valeur = cle.split(".").reduce((o, k) => o?.[k], fr);
    assert.ok(typeof valeur === "string", `clé de dictionnaire absente : ${cle}`);
    return valeur.replace(/\{(\w+)\}/g, (_, n) => String(variables[n] ?? `{${n}}`));
  },
  c: (valeur) => valeur?.fr ?? "",
  l: (valeur) => valeur?.fr ?? "",
  // Les expressions passent par la table des médias, comme toute image du site.
  // On imite ce que le build publie : le PNG source devient un WebP.
  media: (src) => (src ? { src: `${src.slice(0, -4)}.webp`, type: "image", largeur: 783, hauteur: 667 } : {}),
};

const actif = (surcharge = {}) => ({ active: true, accueil: { fr: "Bonjour.", en: "Hello." }, exemples: [], confidentialite: { fr: "", en: "" }, ...surcharge });

test("Conversation rend un journal annoncé poliment, et rien d'autre", () => {
  const sortie = String(Conversation({ echanges: [], etiquette: "É", libelles: { visiteur: "V", assistant: "A" }, vide: "—" }));
  assert.match(sortie, /<div class="conversation" role="log" aria-live="polite" aria-relevant="additions"/);
  assert.match(sortie, /aria-label="É"/);
  assert.match(sortie, /conversation__vide/, "le vide est explicite (AGENTS.md §6.8)");
});

test("Conversation étiquette chaque tour selon son rôle et échappe le texte", () => {
  const sortie = String(Conversation({
    echanges: [{ role: "visiteur", texte: "<script>alert(1)</script>" }, { role: "assistant", texte: "Réponse", liens: [{ libelle: "CV", href: "/cv/" }] }],
    etiquette: "É", libelles: { visiteur: "Vous", assistant: "MarcoS" }, vide: "",
  }));
  assert.match(sortie, /conversation__tour--visiteur/);
  assert.match(sortie, /conversation__tour--assistant/);
  assert.ok(!sortie.includes("<script>"), "le texte du visiteur est échappé, jamais exécuté");
  assert.match(sortie, /&lt;script&gt;/);
  assert.match(sortie, /href="\/cv\/"/);
});

test("Conversation porte lang seulement quand le tour en a un", () => {
  assert.match(String(Conversation({ echanges: [{ role: "assistant", texte: "Hello", lang: "en" }], etiquette: "É", libelles: { visiteur: "V", assistant: "A" }, vide: "" })), /lang="en"/);
  assert.ok(!String(Conversation({ echanges: [{ role: "assistant", texte: "Bonjour" }], etiquette: "É", libelles: { visiteur: "V", assistant: "A" }, vide: "" })).includes("lang="));
});

test("Assistant ne rend rien sans endpoint ni quand il est inactif", () => {
  // Tant que Marc n'a pas écrit l'accueil, MarcoS n'existe pas pour le visiteur.
  assert.equal(Assistant({ assistant: actif(), ctx, endpoint: null }), "");
  assert.equal(Assistant({ assistant: { ...actif(), active: false }, ctx, endpoint: "https://x.test" }), "");
  assert.equal(Assistant({ assistant: undefined, ctx, endpoint: "https://x.test" }), "");
});

test("l'état livré du dépôt ne rend pas MarcoS", () => {
  // Le champ « assistant » n'est pas encore dans content/site.json : Marc doit
  // y écrire ses trois textes (D-9), et le CMS efface les valeurs vides à
  // l'enregistrement — un gabarit amorcé à vide s'effacerait de lui-même.
  // Quelle que soit la raison, l'absence du champ ne rend rien.
  assert.equal(Assistant({ assistant: site.assistant, ctx, endpoint: "https://x.test" }), "");
});

test("Assistant rendu : presence flottante, panneau ancre, journal, saisie, endpoint", () => {
  const sortie = String(Assistant({ assistant: actif(), ctx, endpoint: "https://worker.test/api/assistant" }));
  assert.match(sortie, /data-endpoint="https:\/\/worker\.test\/api\/assistant"/);
  assert.match(sortie, /role="log"/);
  assert.match(sortie, /data-longueur-max="500"/);
  assert.equal(LONGUEUR_MAX, 500, "aligné sur la validation du Worker");
  // La maquette : une racine d'etat, deux socles, une barre a trois commandes.
  assert.match(sortie, /<div class="marcos" data-marcos data-etat="rest" data-ouvert="0" data-erreur="0"/);
  assert.match(sortie, /class="socle socle-panneau"/);
  assert.match(sortie, /class="socle socle-barre"/);
  assert.equal((sortie.match(/class="barre"/g) || []).length, 1, "une seule barre");
  for (const marque of ["data-assistant-envoyer", "data-assistant-effacer", "data-assistant-neuf", "data-assistant-erreur", "data-assistant-compteur"]) {
    assert.ok(sortie.includes(marque), `la maquette prévoit ${marque}`);
  }
});

test("le panneau n'est pas modal : le portfolio reste parcourable pendant la conversation", () => {
  // MARCOS_AVATAR_UI §2 et la maquette (aria-modal="false") : MarcoS ne prend
  // jamais la page. C'est `data-modal="false"` qui fait ouvrir avec show().
  const sortie = String(Assistant({ assistant: actif(), ctx, endpoint: "https://x.test" }));
  assert.match(sortie, /<dialog[^>]*data-modal="false"/);
  assert.match(sortie, /modale--ancre/);
});

test("les sept états de la maquette, et pas un de plus", () => {
  // Dix expressions dans la bibliotheque ne font pas dix etats d'execution.
  assert.deepEqual(ETATS, ["rest", "hover", "open", "listening", "thinking", "responding", "end"]);
  assert.equal(ETAT_REPOS, "rest");
  // `end` ferme un echange, pas la conversation : le panneau reste ouvert.
  assert.ok(ETATS_OUVERTS.has("end"), "end n'est pas un etat de fermeture");
  assert.ok(!ETATS_OUVERTS.has("hover") && !ETATS_OUVERTS.has("rest"));
});

test("un exemple vide ne devient jamais un bouton sans fonction", () => {
  // L'élément vide de content/site.json n'est là que pour le CMS.
  const vide = String(Assistant({ assistant: actif({ exemples: [{ fr: "", en: "" }] }), ctx, endpoint: "https://x.test" }));
  assert.ok(!vide.includes("data-assistant-exemple"), "aucune zone d'exemples");
  const plein = String(Assistant({ assistant: actif({ exemples: [{ fr: "Quels projets ?", en: "Which projects?" }] }), ctx, endpoint: "https://x.test" }));
  assert.match(plein, /data-assistant-exemple/);
  assert.match(plein, /Quels projets \?/);
});

test("une confidentialité non écrite n'affiche pas de paragraphe vide", () => {
  const sortie = String(Assistant({ assistant: actif(), ctx, endpoint: "https://x.test" }));
  assert.ok(!sortie.includes('class="confid"'));
  assert.match(String(Assistant({ assistant: actif({ confidentialite: { fr: "Rien n'est conservé.", en: "Nothing is kept." } }), ctx, endpoint: "https://x.test" })), /class="confid"/);
});

test("aucun texte d'interface n'est écrit dans le gabarit ni dans le composant", () => {
  // Le dictionnaire est la seule source : on remplace chaque libellé par un
  // marqueur et on vérifie qu'aucun mot d'origine ne subsiste dans le rendu.
  const MARQUE = "⟦x⟧";
  const faux = { ...ctx, t: () => MARQUE, c: () => MARQUE, l: () => MARQUE };
  const sortie = String(Assistant({ assistant: actif({ exemples: [{ fr: "x", en: "x" }], confidentialite: { fr: "x", en: "x" } }), ctx: faux, endpoint: "https://x.test" }));
  const visible = [...sortie.matchAll(/>([^<]+)</g)].map((m) => m[1]).join(" ").replaceAll(MARQUE, " ");
  assert.ok(!/\p{L}{2,}/u.test(visible), `texte en dur dans le rendu : « ${visible.trim()} »`);
});

test("les libellés transmis au navigateur couvrent tous les codes du Worker", () => {
  // Le Worker ne renvoie qu'un code : sans libellé, l'état serait muet.
  const sortie = String(Assistant({ assistant: actif(), ctx, endpoint: "https://x.test" }));
  const attribut = sortie.match(/data-libelles="([^"]*)"/)?.[1];
  assert.ok(attribut, "les libellés voyagent dans data-libelles");
  const libelles = JSON.parse(attribut.replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">"));
  for (const code of CODES) {
    assert.ok(libelles.erreurs[code], `code du Worker sans libellé : ${code}`);
  }
  assert.ok(libelles.erreurs.hors_ligne, "la perte de connexion a son propre message");
});

test("le dictionnaire couvre exactement les codes du Worker, en FR et en EN", () => {
  // Dérivé du Worker : ajouter un code là-bas fait échouer ici, pas en production.
  for (const [langue, dico] of [["fr", fr], ["en", en]]) {
    for (const code of CODES) {
      assert.ok(typeof dico.assistant.erreurs[code] === "string" && dico.assistant.erreurs[code].trim(), `${langue} : libellé manquant pour ${code}`);
    }
  }
});

test("l'aide du champ porte le compteur de caractères, pas un nombre en dur", () => {
  for (const [langue, dico] of [["fr", fr], ["en", en]]) {
    assert.match(dico.assistant.aide, /\{n\}/, `${langue} : l'aide doit accueillir le nombre restant`);
  }
  assert.match(String(Assistant({ assistant: actif(), ctx, endpoint: "https://x.test" })), /500 caractères restants/);
});

/* ------------------------------------------------------------------ */
/* IA-04 au rendu du site (PM-121, #130) : l'intégration, pas le gabarit. */
/* ------------------------------------------------------------------ */

const contenuReel = {
  site,
  sections: JSON.parse(fs.readFileSync("content/sections.json", "utf8")),
  projets: JSON.parse(fs.readFileSync("content/projets.json", "utf8")),
  cv: JSON.parse(fs.readFileSync("content/cv.json", "utf8")),
};
const dictionnaires = { fr, en };
const accueil = ({ assistant, endpoint }) => {
  const contenu = { ...contenuReel, site: { ...site, ...(assistant === undefined ? {} : { assistant }) } };
  // Les expressions de la présence flottante passent par la table des médias,
  // comme toute image du site : sans elle, `ctx.media` ne rend rien.
  const medias = new Map((assistant?.avatar?.etats || []).map(({ src }) => [src, { src: `${src}.webp`, type: "image", largeur: 783, hauteur: 667 }]));
  const ctxPage = contextePage({
    site: contenu.site, langue: "fr", chemin: "", dictionnaires, medias,
    ressources: { sprite: "", couleurTheme: "#fff", annee: 2026, assistantEndpoint: endpoint },
  });
  return String(PageAccueil({ contenu, ctx: ctxPage }));
};

test("l'accueil ne porte ni la modale de MarcoS ni son entrée tant qu'il n'est pas actif", () => {
  // Trois états du dépôt réel : pas de champ, pas d'adresse, champ inactif.
  for (const cas of [
    { assistant: undefined, endpoint: "https://worker.test/api" },
    { assistant: { active: true, accueil: { fr: "Bonjour." } }, endpoint: null },
    { assistant: { active: false, accueil: { fr: "Bonjour." } }, endpoint: "https://worker.test/api" },
  ]) {
    const page = accueil(cas);
    assert.doesNotMatch(page, /id="assistant"/, "aucune modale");
    assert.doesNotMatch(page, /data-modale-ouvrir="assistant"/, "aucune entrée");
  }
});

test("actif et avec une adresse, l'accueil porte la présence primaire, le panneau et les accès secondaires", () => {
  // D-35 : la présence flottante est l'entrée visuelle primaire. D-4 reste vrai
  // pour les deux accès secondaires — Contact et le menu.
  const page = accueil({ assistant: { active: true, accueil: { fr: "Bonjour." } }, endpoint: "https://worker.test/api" });
  assert.match(page, /<dialog[^>]*id="assistant"/, "le panneau est rendu");
  assert.match(page, /data-modal="false"/, "non modal : le portfolio reste parcourable");
  // Sans avatar déclaré, trois entrées : Contact, le menu, la barre.
  const entrees = page.match(/data-modale-ouvrir="assistant"/g) || [];
  assert.equal(entrees.length, 3, "Contact, le menu (D-4) et la barre de la présence");

  // Avec l'avatar, les deux bustes en sont deux de plus : ils ouvrent et
  // referment eux aussi le panneau.
  const avatar = { etats: [{ etat: "rest", src: "Public/Avatar_MarcoS/Avatar_02_NEUTRE_DISPONIBLE.png" }] };
  const avecBuste = accueil({ assistant: { active: true, accueil: { fr: "Bonjour." }, avatar }, endpoint: "https://worker.test/api" });
  assert.equal((avecBuste.match(/data-modale-ouvrir="assistant"/g) || []).length, 5, "les deux bustes sont des commandes");
  assert.match(page, /<div class="marcos" data-marcos data-etat="rest"/, "la présence naît au repos");
});

test("la présence flottante ne rend que les expressions déclarées, et ne charge que celle du repos", () => {
  // Performance : une seule image par socle au premier affichage ; les autres
  // restent `hidden`, donc le navigateur ne les demande qu'à leur état. Et une
  // expression dont l'état n'existe pas n'entre pas dans la page.
  const avatar = { etats: [
    { etat: "rest", src: "Public/Avatar_MarcoS/Avatar_02_NEUTRE_DISPONIBLE.png" },
    { etat: "thinking", src: "Public/Avatar_MarcoS/Avatar_03_REFLEXION.png" },
    { etat: "inconnu", src: "Public/Avatar_MarcoS/Avatar_04_ANALYSE.png" },
  ] };
  const page = accueil({ assistant: { active: true, accueil: { fr: "Bonjour." }, avatar }, endpoint: "https://worker.test/api" });
  const images = page.match(/data-expression="[a-z]+"/g) || [];
  // Deux socles, donc deux fois chaque expression : le buste est posé sur la
  // barre quand c'est fermé, sur le panneau quand c'est ouvert.
  assert.deepEqual(images, [
    'data-expression="rest"', 'data-expression="thinking"',
    'data-expression="rest"', 'data-expression="thinking"',
  ], "l'état inconnu est écarté, et chaque socle porte le jeu complet");
  assert.match(page, /data-expression="rest"[^>]*loading="eager"/, "le repos est chargé tout de suite");
  assert.match(page, /<img[^>]*data-expression="thinking"[^>]*hidden/, "les autres attendent leur état");
});

test("sans expression déclarée, la présence flottante garde sa barre", () => {
  // L'avatar est décoratif : son absence ne supprime jamais le point d'entrée.
  const page = accueil({ assistant: { active: true, accueil: { fr: "Bonjour." } }, endpoint: "https://worker.test/api" });
  assert.match(page, /class="barre"/, "la barre reste");
  assert.doesNotMatch(page, /class="av"/, "aucun socle de buste vide");
});

test("la présence flottante est muette pour les technologies d'assistance, sauf ses commandes", () => {
  // MARCOS_AVATAR_UI §12 : aucune information ne passe par l'avatar seul.
  const avatar = { etats: [{ etat: "rest", src: "Public/Avatar_MarcoS/Avatar_02_NEUTRE_DISPONIBLE.png" }] };
  const page = accueil({ assistant: { active: true, accueil: { fr: "Bonjour." }, avatar }, endpoint: "https://worker.test/api" });
  const marcos = page.slice(page.indexOf('<div class="marcos"'));
  // Le buste n'est plus décoratif : c'est une commande, qui ouvre et referme
  // le panneau. Ce sont ses IMAGES qui ne disent rien.
  assert.match(marcos, /<button class="av" type="button" aria-label="[^"]+" data-modale-ouvrir="assistant"/, "le buste est une commande nommée");
  assert.match(marcos, /<span class="onde" aria-hidden="true">/, "l'onde est décorative");
  assert.match(marcos, /<img[^>]*alt=""/, "l'image ne porte aucun texte alternatif");
  // L'activité n'est pas muette pour autant : elle a un nom, depuis le dictionnaire.
  assert.match(marcos, /class="activite" role="img" aria-label="[^"]+"/);

  // Garantie reprise de #156 : c'est bien l'asset officiel validé par #49 qui
  // est rendu, et il passe par la table des médias — aucun chemin de fichier
  // n'est écrit dans le gabarit.
  const officiel = { etats: [{ etat: "rest", src: "Public/Avatar_MarcoS/Avatar_02_NEUTRE_DISPONIBLE.png" }] };
  const rendu = accueil({ assistant: { active: true, accueil: { fr: "Bonjour." }, avatar: officiel }, endpoint: "https://worker.test/api" });
  assert.match(rendu, /Avatar_MarcoS\/Avatar_02_NEUTRE_DISPONIBLE/, "l'expression neutre officielle est l'image de repos");
  // Le chemin ne doit vivre dans aucune chaîne du gabarit : il vient du contenu
  // et passe par la table des médias. Les commentaires peuvent citer le dossier.
  const gabarit = fs.readFileSync("Design_System/gabarits/Assistant/Assistant.js", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(gabarit, /Avatar_MarcoS/, "aucun chemin d'avatar en dur dans le gabarit");
});

test("chaque entrée de MarcoS annonce le dialogue qu'elle ouvre", () => {
  // §6.8 : un bouton qui n'ouvre rien est un bouton mort. L'entrée déclare la
  // modale qu'elle contrôle, et cette modale existe dans la même page.
  const page = accueil({ assistant: { active: true, accueil: { fr: "Bonjour." } }, endpoint: "https://worker.test/api" });
  for (const attribut of ['aria-haspopup="dialog"', 'aria-controls="assistant"', 'aria-expanded="false"']) {
    assert.ok(page.includes(attribut), `l'entrée porte ${attribut}`);
  }
});

test("la présence flottante reste absente quand MarcoS est inactif", () => {
  const page = accueil({ assistant: { active: false, accueil: { fr: "Bonjour." } }, endpoint: "https://worker.test/api" });
  assert.doesNotMatch(page, /data-assistant-presence/);
});

test("l'avatar reste visible pendant la conversation", () => {
  // Garantie de #156, tenue autrement par D-40 : l'avatar ne vit plus dans
  // l'en-tête de la modale mais sur un socle propre au panneau, où il est POSÉ
  // au-dessus de lui. Il reste donc visible tout le temps de l'échange, et
  // c'était bien l'intention.
  const avatar = { etats: [{ etat: "rest", src: "Public/Avatar_MarcoS/Avatar_02_NEUTRE_DISPONIBLE.png" }] };
  const sortie = String(Assistant({ assistant: actif({ avatar }), ctx, endpoint: "https://worker.test/api/assistant" }));
  assert.match(sortie, /class="socle socle-panneau"><button class="av"/, "le panneau porte son propre buste");
  assert.match(sortie, /class="socle socle-barre"><button class="av"/, "la barre porte le sien");
  assert.match(sortie, /Avatar_MarcoS\/Avatar_02_NEUTRE_DISPONIBLE/, "l'expression neutre officielle");
});

test("le script du site branche MarcoS, et sort sans rien faire quand il est absent", () => {
  const script = fs.readFileSync("Frontend/site.js", "utf8");
  assert.match(script, /activerAssistant\(document\)/, "le comportement est branché");
  const gabarit = fs.readFileSync("Design_System/gabarits/Assistant/Assistant.js", "utf8");
  assert.match(gabarit, /const hote = racine\?\.querySelector\("\[data-assistant\]"\);\s*\n\s*if \(!hote\) return;/, "sans hôte, il sort immédiatement");
});

test("le build ne donne une adresse à MarcoS que si ASSISTANT_URL existe", () => {
  // Sans la variable, l'adresse est nulle et le gabarit ne rend rien : le site
  // publié est identique, sans drapeau à retirer ni code mort.
  const build = fs.readFileSync("tools/build.mjs", "utf8");
  assert.match(build, /assistantEndpoint: env\.ASSISTANT_URL \|\| null/);
});
