/**
 * MARCOS, FENÊTRE DE CHAT (IA-08) — accessibilité, clavier, responsive.
 *
 * La fenêtre ne se rend que si `assistant.active` est vrai ET qu'une adresse
 * existe : ni l'un ni l'autre n'est dans le dépôt, et c'est voulu (D-9). Ce
 * fichier construit donc une page d'essai avec les VRAIS gabarit, composant,
 * dictionnaires et script du site, puis l'éprouve dans Chromium.
 *
 * Le Worker n'est jamais appelé : les réponses sont interceptées par
 * Playwright. Aucune clé, aucun réseau.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { servir, lancer, ouvrir } from "./outils.mjs";
import { chargerFichiers } from "../../tools/contenu.mjs";
import { contextePage } from "../../tools/pages.mjs";
import { PageAccueil } from "../../Design_System/gabarits/sections/Pages.js";

const libelles = JSON.parse(fs.readFileSync("Design_System/i18n/fr.json", "utf8"));

const PAGE = "essai-assistant.html";
const FICHIER = path.resolve("_site", PAGE);
const ENDPOINT = "/essai/assistant";
let serveur; let nav;

/**
 * Les VRAIS textes de D-9, lus dans le contenu — pas un jeu d'essai. Seul
 * `active` est forcé : il reste `false` dans le dépôt, et l'activation est un
 * geste de Marc qui demande en plus une adresse de Worker.
 */
const D9 = JSON.parse(fs.readFileSync("content/site.json", "utf8")).assistant;
const ASSISTANT = { ...D9, active: true };

/**
 * Les expressions du buste passent par la table des médias, comme toute image
 * du site. Le serveur d'essai sert `_site`, où le build les a déjà publiées en
 * WebP : la page de test pointe donc les vrais fichiers.
 */
const mediasAvatar = () => new Map((ASSISTANT.avatar?.etats || []).map(({ src }) => [src, { src: `${src.slice(0, -4)}.webp`, type: "image", largeur: 783, hauteur: 667 }]));

before(async () => {
  const contenu = await chargerFichiers(process.cwd());
  const dictionnaires = Object.fromEntries(contenu.site.langues.map((l) => [l,
    JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8"))]));
  const site = { ...contenu.site, assistant: ASSISTANT };
  const ctx = contextePage({
    site, langue: "fr", chemin: "", dictionnaires, medias: mediasAvatar(),
    ressources: {
      sprite: fs.readFileSync("Design_System/assets/logos-sprite.svg", "utf8"),
      couleurTheme: "#fffff2", annee: 2026, assistantEndpoint: ENDPOINT,
    },
  });
  fs.writeFileSync(FICHIER, String(PageAccueil({ contenu: { ...contenu, site }, ctx })), "utf8");
  serveur = await servir();
  nav = await lancer();
});

after(async () => {
  await nav?.close();
  serveur?.fermer();
  fs.rmSync(FICHIER, { force: true });
});

/** Ouvre la page d'essai, la fenêtre dépliée, avec une réponse simulée. */
/**
 * La réponse s'écrit lettre à lettre et le panneau s'ouvre en cascade : une
 * mesure prise trop tôt lit un état transitoire. Ces deux attentes rendent les
 * tests déterministes sans figer les animations.
 */
const attendreLaFinDesAnimations = (page) => page.waitForFunction(() =>
  document.getAnimations().filter((a) => a.playState === "running" && !(a.effect?.getTiming?.().iterations === Infinity)).length === 0);

const attendreLeTexte = (page, extrait) => page.waitForFunction(
  (t) => [...document.querySelectorAll("#assistant .conversation__tour")].some((e) => e.textContent.includes(t)),
  extrait, { timeout: 15000 });

/**
 * D-35 : MarcoS ne se montre qu'une fois la couverture passée — posé en bas à
 * droite, il recouvrait « Le portfolio ↓ », qui est l'entrée du site. Tant que
 * la couverture occupe l'écran, `.marcos` porte `data-retire="1"` et reste
 * `visibility: hidden`. Un visiteur descend avant de le voir ; le test fait
 * donc la même chose, au lieu de cliquer dans le vide.
 */
async function descendreJusquaMarcoS(page) {
  await page.evaluate(() => document.getElementById("introduction")?.scrollIntoView({ block: "start" }));
  await page.waitForFunction(() => document.querySelector(".marcos")?.dataset.retire === "0");
}

async function ouvrirFenetre({ largeur = 1440, theme = "light", repondre } = {}) {
  const page = await ouvrir(nav, `${serveur.url}/${PAGE}`, { largeur, theme });
  await descendreJusquaMarcoS(page);
  await page.route(`**${ENDPOINT}`, async (route) => {
    const r = repondre ?? { status: 200, json: { texte: "Réponse courte.", liens: [] } };
    await route.fulfill({ status: r.status, contentType: "application/json", body: JSON.stringify(r.json) });
  });
  return page;
}

test("MarcoS s'ouvre depuis Contact, depuis le menu et depuis sa présence flottante", async () => {
  const page = await ouvrirFenetre();
  const entrees = page.locator('[data-modale-ouvrir="assistant"]');
  assert.equal(await entrees.count(), 5, "Contact, le menu (D-4), la barre, et les deux bustes qui sont eux-mêmes des commandes");
  assert.equal(await page.locator(".marcos[data-etat=rest]").count(), 1, "la présence naît au repos");
  assert.equal(await page.locator("#assistant").evaluate((d) => d.open), false, "fermée au départ");
  // Le panneau est ancré : il ne couvre pas le portfolio, et il laisse la
  // présence visible sous lui.
  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  await attendreLaFinDesAnimations(page);
  const place = await page.evaluate(() => {
    const d = document.getElementById("assistant").getBoundingClientRect();
    const barre = document.querySelector(".barre").getBoundingClientRect();
    // Le buste respire en continu : son rectangle visuel oscille de quelques
    // pixels. Ce qu'on vérifie, c'est sa POSITION DE MISE EN PAGE — « posé sur
    // le panneau » est une règle de layout, pas une image à un instant donné.
    // On neutralise donc la transformation le temps de la mesure.
    const av = document.querySelector(".socle-panneau .av");
    const anime = av?.style.animation;
    if (av) av.style.animation = "none";
    const buste = av?.getBoundingClientRect();
    if (av) av.style.animation = anime ?? "";
    return {
      basDuPanneau: Math.round(d.bottom), hautDeLaBarre: Math.round(barre.top),
      basDuBuste: buste ? Math.round(buste.bottom) : null, hautDuPanneau: Math.round(d.top),
      presenceVisible: getComputedStyle(document.querySelector(".marcos")).visibility,
      respire: Boolean(av && getComputedStyle(av).animationName !== "none"),
      deborde: d.right > innerWidth || d.left < 0 || d.bottom > innerHeight,
    };
  });
  assert.ok(place.basDuPanneau <= place.hautDeLaBarre, "le panneau se pose AU-DESSUS de la barre");
  // Posé veut dire au contact : on tolère le pixel de l'arrondi du rendu,
  // pas davantage. Un chevauchement se compterait en dizaines.
  assert.ok(Math.abs(place.basDuBuste - place.hautDuPanneau) <= 1, `le buste est POSÉ sur le panneau (écart ${place.basDuBuste - place.hautDuPanneau} px)`);
  assert.ok(place.respire, "et il respire : la mesure ci-dessus a bien neutralisé une animation");
  assert.equal(place.deborde, false, "le panneau ne sort jamais du viewport");
  assert.equal(place.presenceVisible, "visible", "MarcoS reste visible pendant la conversation");
  await page.fermer();
});

test("la présence flottante suit l'état de la conversation, et rien d'autre", async () => {
  // Brief §7 : aucune animation indépendante. L'image du buste et l'état de la
  // barre viennent du MÊME attribut, pose par les évènements réels.
  const page = await ouvrirFenetre();
  const etat = () => page.evaluate(() => {
    const l = document.querySelector(".marcos");
    return l.dataset.etat + "/" + [...document.querySelectorAll("[data-expression]")].find((i) => !i.hidden)?.dataset.expression;
  });
  assert.equal(await etat(), "rest/rest", "au repos");

  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  assert.equal(await etat(), "open/open", "à l'ouverture");

  await page.locator("#assistant-question").fill("Qui est M. Kouassi ?");
  await page.waitForFunction(() => document.querySelector(".marcos").dataset.etat === "listening");
  assert.equal(await etat(), "listening/listening", "pendant la saisie");

  await page.locator("[data-assistant-envoyer]").click();
  await page.waitForFunction(() => document.querySelector(".marcos").dataset.etat === "responding");
  assert.equal(await etat(), "responding/responding", "quand la réponse arrive");

  await page.waitForFunction(() => document.querySelector(".marcos").dataset.etat === "end", null, { timeout: 6000 });
  await page.fermer();
});

test("seule l'expression du repos est chargee tant qu'aucun etat ne reclame les autres", async () => {
  const page = await ouvrirFenetre();
  const chargees = () => page.evaluate(() => [...document.querySelectorAll("[data-expression]")].filter((i) => i.naturalWidth > 0).map((i) => i.dataset.expression));
  // Deux socles : le buste de la barre et celui du panneau partagent l'etat.
  assert.deepEqual(await chargees(), ["rest", "rest"], "une image par socle au premier affichage");
  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.querySelector(".marcos").dataset.etat === "open");
  // L'image est demandée à l'ouverture ; elle arrive un instant après. On
  // attend le chargement au lieu de lire un état transitoire.
  await page.waitForFunction(() => [...document.querySelectorAll("[data-expression]")]
    .some((i) => i.dataset.expression === "open" && i.naturalWidth > 0), null, { timeout: 5000 });
  assert.ok((await chargees()).includes("open"), "l'expression d'ouverture n'est demandée qu'à l'ouverture");
  await page.fermer();
});

test("au clavier seul : on atteint l'entrée, on ouvre, le focus entre, Échap ferme et le rend", async () => {
  const page = await ouvrirFenetre();
  const entree = page.locator('[data-modale-ouvrir="assistant"]').first();
  await entree.focus();
  assert.equal(await page.evaluate(() => document.activeElement.dataset.modaleOuvrir), "assistant");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.getElementById("assistant").open);
  const dedans = await page.evaluate(() => document.getElementById("assistant").contains(document.activeElement));
  assert.equal(dedans, true, "le focus est entré dans le dialogue");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.getElementById("assistant").open);
  assert.equal(await page.evaluate(() => document.activeElement.dataset.modaleOuvrir), "assistant", "le focus est rendu");
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("le journal est annoncé poliment, et l'état vide ne dit rien de faux", async () => {
  const page = await ouvrirFenetre();
  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  const journal = page.locator("#assistant [role=log]");
  assert.equal(await journal.count(), 1);
  assert.equal(await journal.getAttribute("aria-live"), "polite");
  assert.equal(await page.locator("#assistant .conversation__tour").count(), 0, "aucun tour avant la première question");
  assert.ok((await page.locator("[data-assistant-accueil]").textContent()).includes(D9.accueil.fr));
  await page.fermer();
});

test("une question part, la réponse arrive, et les deux tours sont étiquetés", async () => {
  const page = await ouvrirFenetre();
  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  await page.fill("#assistant-question", "Qui est M. Kouassi ?");
  await page.click("[data-assistant-envoyer]");
  await attendreLeTexte(page, "Réponse courte.");
  const tours = await page.$$eval("#assistant .conversation__tour", (l) => l.map((e) => e.textContent.trim()));
  assert.ok(tours[0].includes("Qui est M. Kouassi ?"));
  assert.ok(tours[1].includes("Réponse courte."));
  // La réponse est du TEXTE : jamais de HTML injecté.
  assert.equal(await page.locator("#assistant .conversation__tour script").count(), 0);
  assert.equal(await page.locator("[data-assistant-accueil]").evaluate((e) => e.hidden), true, "l'accueil s'efface");
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("une réponse du modèle contenant du HTML est affichée comme du texte, jamais interprétée", async () => {
  const page = await ouvrirFenetre({ repondre: { status: 200, json: { texte: "<img src=x onerror=alert(1)><b>gras</b>", liens: [] } } });
  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  await page.fill("#assistant-question", "Essai");
  await page.click("[data-assistant-envoyer]");
  await attendreLeTexte(page, "<b>gras</b>");
  assert.equal(await page.locator("#assistant .conversation__tour img, #assistant .conversation__tour b").count(), 0);
  assert.ok((await page.locator("#assistant .conversation__tour").last().textContent()).includes("<b>gras</b>"));
  await page.fermer();
});

test("chaque code d'erreur du Worker devient une phrase du dictionnaire, pas un code brut", async () => {
  for (const [code, statut] of [["quota_journalier", 429], ["indisponible", 503], ["trop_de_demandes", 429]]) {
    const page = await ouvrirFenetre({ repondre: { status: statut, json: { erreur: code } } });
    await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
    await page.waitForFunction(() => document.getElementById("assistant").open);
    await page.fill("#assistant-question", "Essai");
    await page.click("[data-assistant-envoyer]");
    // On attend l'état d'ERREUR, pas l'état de chargement : celui-ci occupe la
    // même zone et apparaît d'abord.
    await page.waitForSelector("[data-assistant-reessayer]", { timeout: 5000 });
    const texte = (await page.locator("[data-assistant-erreur]").textContent()).trim();
    // La garantie utile : c'est LA phrase du dictionnaire de ce code, et non
    // un identifiant technique ni la phrase d'un autre code. Le client lit
    // « corps.erreur » ; lire « corps.code » les écrasait tous.
    const attendu = libelles.assistant.erreurs[code];
    assert.ok(texte.includes(attendu), `${code} : sa propre phrase est affichée`);
    assert.notEqual(texte, code, `${code} : jamais l'identifiant brut seul`);
    for (const [autre, phrase] of Object.entries(libelles.assistant.erreurs)) {
      if (autre !== code && phrase !== attendu) {
        assert.ok(!texte.includes(phrase), `${code} : ce n'est pas la phrase de ${autre}`);
      }
    }
    await page.fermer();
  }
});

test("l'aide du champ compte les caractères restants, et le plafond est celui du Worker", async () => {
  const page = await ouvrirFenetre();
  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  const aide = page.locator("#assistant-question-aide");
  assert.ok((await aide.textContent()).includes("500"));
  await page.fill("#assistant-question", "abcde");
  await page.waitForFunction(() => document.getElementById("assistant-question-aide").textContent.includes("495"));
  assert.equal(await page.locator("#assistant-question").getAttribute("aria-describedby"), "assistant-question-aide");
  await page.fermer();
});

test("la fenêtre tient à 320, 375, 768, 1024 et 1440 px, en clair et en sombre", async () => {
  for (const theme of ["light", "dark"]) for (const largeur of [320, 375, 768, 1024, 1440]) {
    const page = await ouvrirFenetre({ largeur, theme });
    await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
    await page.waitForFunction(() => document.getElementById("assistant").open);
    await attendreLaFinDesAnimations(page);
    const r = await page.evaluate(() => {
      const d = document.getElementById("assistant");
      const champ = document.getElementById("assistant-question");
      const envoyer = d.querySelector("[data-assistant-envoyer]");
      const b = envoyer.getBoundingClientRect();
      return {
        visible: d.getBoundingClientRect().width > 0,
        deborde: d.scrollWidth > document.documentElement.clientWidth,
        champ: champ.getBoundingClientRect().width > 0,
        cible: Math.min(b.width, b.height),
      };
    });
    assert.equal(r.visible, true, `${theme} ${largeur}px`);
    assert.equal(r.deborde, false, `${theme} ${largeur}px : débordement`);
    assert.equal(r.champ, true, `${theme} ${largeur}px : champ`);
    assert.ok(r.cible >= 44, `${theme} ${largeur}px : cible ${r.cible}px`);
    assert.deepEqual(page.erreurs, [], `${theme} ${largeur}px`);
    await page.fermer();
  }
});

test("la fenêtre existe en anglais avec les mêmes repères", async () => {
  const contenu = await chargerFichiers(process.cwd());
  const dictionnaires = Object.fromEntries(contenu.site.langues.map((l) => [l,
    JSON.parse(fs.readFileSync(`Design_System/i18n/${l}.json`, "utf8"))]));
  const site = { ...contenu.site, assistant: ASSISTANT };
  const ctx = contextePage({
    site, langue: "en", chemin: "", dictionnaires, medias: mediasAvatar(),
    ressources: { sprite: "", couleurTheme: "#fffff2", annee: 2026, assistantEndpoint: ENDPOINT },
  });
  const anglais = path.resolve("_site", "essai-assistant-en.html");
  fs.writeFileSync(anglais, String(PageAccueil({ contenu: { ...contenu, site }, ctx })), "utf8");
  const page = await ouvrir(nav, `${serveur.url}/essai-assistant-en.html`, { largeur: 1440 });
  await descendreJusquaMarcoS(page);
  assert.equal(await page.locator('[data-modale-ouvrir="assistant"]').count(), 5);
  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  assert.equal(await page.locator("#assistant [role=log]").count(), 1);
  assert.ok((await page.locator("[data-assistant-accueil]").textContent()).includes(D9.accueil.en));
  await page.fermer();
  fs.rmSync(anglais, { force: true });
});

test("D-9 : le message d'accueil, les dix exemples et la mention s'affichent au mot près", async () => {
  const page = await ouvrirFenetre();
  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.getElementById("assistant").open);

  assert.equal((await page.locator("[data-assistant-accueil] .bulle__texte").textContent()).trim(), D9.accueil.fr);

  const exemples = await page.$$eval("[data-assistant-exemple]", (l) => l.map((e) => e.textContent.trim()));
  assert.equal(exemples.length, 10, "les dix exemples validés");
  assert.deepEqual(exemples, D9.exemples.map((e) => e.fr));

  assert.equal((await page.locator(".confid").textContent()).trim(), D9.confidentialite.fr);
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("un exemple cliqué remplit le champ sans envoyer : le visiteur garde la main", async () => {
  const page = await ouvrirFenetre();
  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.getElementById("assistant").open);
  await page.locator("[data-assistant-exemple]").first().click();
  assert.equal(await page.inputValue("#assistant-question"), D9.exemples[0].fr);
  assert.equal(await page.locator("#assistant .conversation__tour").count(), 0, "rien n'est parti");
  await page.fermer();
});

test("accessibilité axe-core de la fenêtre ouverte : aucune violation grave ou critique", async () => {
  const axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
  for (const theme of ["light", "dark"]) {
    const page = await ouvrirFenetre({ theme, largeur: 1024 });
    await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
    await page.waitForFunction(() => document.getElementById("assistant").open);
    await page.fill("#assistant-question", "Qui est M. Kouassi ?");
    await page.click("[data-assistant-envoyer]");
    await page.waitForFunction(() => document.querySelectorAll("#assistant .conversation__tour").length === 2);
    // Les bulles entrent en fondu : mesurer pendant, c'est mesurer une couleur
    // composite. axe lisait #f0f1e2 sur #687752 — 4,23 — là où la bulle posée
    // vaut --paper sur --olive, soit 6,09. On attend qu'elles soient en place.
    await attendreLaFinDesAnimations(page);
    await page.addScriptTag({ content: axe });
    const trouvees = await page.evaluate(async () => (await window.axe.run("#assistant", { resultTypes: ["violations"] }))
      .violations.filter((v) => ["serious", "critical"].includes(v.impact))
      .map((v) => ({ cle: `${v.id} (${v.nodes.length})`, ou: v.nodes.map((n) => `${n.target[0]} — ${(n.failureSummary || "").split("\n")[1] || ""}`) })));
    const violations = trouvees.map((v) => v.cle);
    // Le détail voyage avec l'échec : une violation sans son élément oblige à
    // tout refaire à la main pour la retrouver.
    assert.deepEqual(violations, [], `${theme} : ${JSON.stringify(trouvees, null, 1)}`);
    await page.fermer();
  }
});

test("la réponse se pose entière, d'un seul coup : aucune écriture lettre à lettre (#168)", async () => {
  // Le défaut que ce test ferme. La réponse s'écrivait caractère par caractère
  // dans `.conversation__texte`, toutes les 18 ms. Ce nœud vit dans le journal
  // `role="log"` `aria-live="polite"` : une réponse de 200 caractères y faisait
  // 200 mutations de la même région annoncée, et un lecteur d'écran pouvait en
  // lire les fragments. AI_UX.md l'interdit deux fois.
  //
  // La mesure est faite par un MutationObserver, pas par des captures à
  // intervalles : une boucle de sondage ne prouverait rien, elle pourrait
  // simplement tomber entre deux frappes.
  const phrase = "M. Kouassi est directeur artistique, et il travaille à Abidjan depuis plusieurs années.";
  const page = await ouvrirFenetre({ repondre: { status: 200, json: { texte: phrase, liens: [] } } });
  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.getElementById("assistant").open);

  // L'observateur est posé AVANT l'envoi, sur le journal entier.
  await page.evaluate(() => {
    window.__etapes = [];
    const journal = document.querySelector("#assistant [data-assistant-log]");
    new MutationObserver(() => {
      const dernier = [...journal.querySelectorAll(".conversation__texte")].at(-1);
      if (dernier) window.__etapes.push(dernier.textContent);
    }).observe(journal, { childList: true, subtree: true, characterData: true });
  });

  await page.fill("#assistant-question", "Qui est M. Kouassi ?");
  await page.click("[data-assistant-envoyer]");
  await attendreLeTexte(page, phrase);
  // Large marge : à 18 ms par caractère, l'ancienne frappe durait 1,5 s.
  await page.waitForTimeout(600);

  const etapes = await page.evaluate(() => window.__etapes);
  // Aucune étape ne doit porter un PRÉFIXE strict de la phrase : c'est la
  // signature d'une frappe, et elle ne peut pas arriver autrement.
  const prefixes = etapes.filter((e) => e && e.length > 0 && e !== phrase && phrase.startsWith(e));
  assert.deepEqual(prefixes, [], `la réponse s'est écrite progressivement : ${JSON.stringify(prefixes.slice(0, 5))}`);
  assert.ok(etapes.includes(phrase), "le texte complet est apparu en une fois");
  assert.equal(await page.locator("#assistant .curseur").count(), 0, "aucun curseur de frappe");
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("Entrée envoie, Maj + Entrée passe à la ligne (#168)", async () => {
  // AI_UX.md § Parcours : « Entrée envoie, Maj + Entrée passe à la ligne ».
  // `keydown` n'examinait pas `shiftKey` : la combinaison envoyait la question,
  // et le champ de trois lignes ne pouvait jamais recevoir de retour à la ligne.
  const page = await ouvrirFenetre();
  await page.locator('.barre [data-modale-ouvrir="assistant"]').click();
  await page.waitForFunction(() => document.getElementById("assistant").open);

  await page.fill("#assistant-question", "Première ligne");
  await page.locator("#assistant-question").press("Shift+Enter");
  await page.locator("#assistant-question").type("seconde ligne");
  assert.equal(await page.locator("#assistant-question").inputValue(), "Première ligne\nseconde ligne", "Maj + Entrée a inséré un retour à la ligne");
  assert.equal(await page.locator("#assistant .conversation__tour").count(), 0, "rien n'a été envoyé");

  // Entrée seule, elle, envoie — et vide le champ.
  await page.locator("#assistant-question").press("Enter");
  await attendreLeTexte(page, "Réponse courte.");
  assert.equal(await page.locator("#assistant-question").inputValue(), "", "le champ est vidé après l'envoi");
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});
