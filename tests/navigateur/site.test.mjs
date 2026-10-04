/**
 * Site public dans un vrai navigateur : FR/EN, accessibilité, clavier,
 * responsive, robustesse (sans JS, JS en échec, animations réduites),
 * menu, études de projet, accueil. Prérequis : npm run build.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { servir, lancer, ouvrir, defiler } from "./outils.mjs";
import { chargerFichiers } from "../../tools/contenu.mjs";
import { lire } from "../../Design_System/i18n/langue.js";

const axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
let serveur; let nav;
before(async () => { serveur = await servir(); nav = await lancer(); });
after(async () => { await nav?.close(); serveur?.fermer(); });

test("pages FR et EN : lang, canonique, hreflang, og:locale, aucune erreur", async () => {
  for (const [chemin, lang, locale] of [["/", "fr", "fr_FR"], ["/en/", "en", "en_US"], ["/cv/", "fr", "fr_FR"], ["/en/projets/fifa26/", "en", "en_US"]]) {
    const page = await ouvrir(nav, serveur.url + chemin);
    assert.equal(await page.getAttribute("html", "lang"), lang, chemin);
    assert.equal(await page.getAttribute('meta[property="og:locale"]', "content"), locale, chemin);
    const alternatives = await page.$$eval('link[rel="alternate"]', (l) => l.map((e) => e.hreflang).sort());
    assert.deepEqual(alternatives, ["en", "fr", "x-default"], chemin);
    assert.ok((await page.getAttribute('link[rel="canonical"]', "href")).startsWith("https://"), chemin);
    assert.deepEqual(page.erreurs, [], chemin);
    await page.fermer();
  }
});

// Le repli lui-même (FR balisé lang=fr, jamais inventé) est éprouvé par
// tests/langue.test.mjs et tests/resistance.test.mjs. Ici, sur le site
// réellement généré : un texte français n'apparaît sur une page anglaise
// QUE pour un champ sans traduction consigné par le build. Site traduit :
// aucun texte français.
test("EN : un texte français n'apparaît que pour un champ non traduit (rapport du build)", async () => {
  const sansEspace = (t) => String(t).replaceAll("**", "").replace(/\s+/g, "");
  const contenu = await chargerFichiers(process.cwd());
  const manquants = JSON.parse(fs.readFileSync(".cache/traductions-manquantes.json", "utf8")).filter((m) => m.langue === "en");
  const francais = manquants.map((m) => sansEspace(lire(contenu, m.cle)?.fr ?? "")).filter(Boolean);
  for (const chemin of ["/en/", "/en/cv/", "/en/projets/fifa26/"]) {
    const page = await ouvrir(nav, serveur.url + chemin);
    // Le sélecteur de langue nomme chaque langue dans sa propre langue : « FR Français » est voulu.
    const textes = await page.$$eval('main [lang="fr"]', (l) => l.filter((e) => !e.closest(".segments")).map((e) => e.textContent));
    const inattendus = textes.map(sansEspace).filter((t) => t && !francais.some((f) => f.includes(t)));
    assert.deepEqual(inattendus, [], chemin);
    if (!manquants.length) assert.deepEqual(textes, [], `${chemin} : site traduit, aucun texte français attendu`);
    assert.equal(await page.textContent(".skip-link"), "Skip to content", chemin);
    await page.fermer();
  }
});

// Le sélecteur de langue est fait de liens vers les pages statiques /en/ :
// chaque point d'entrée doit mener à la page anglaise correspondante.
test("bascule FR → EN depuis chaque point d'entrée : page anglaise, lang=en, aucune erreur", async () => {
  const cas = [
    { depart: "/", largeur: 1440, zone: ".en-tete__large", arrivee: "/en/" },
    { depart: "/", largeur: 375, zone: ".en-tete__compact", arrivee: "/en/" },
    { depart: "/", largeur: 375, zone: "#menu", menu: true, arrivee: "/en/" },
    { depart: "/cv/", largeur: 375, zone: ".cv__pied", arrivee: "/en/cv/" },
    { depart: "/projets/aurex/", largeur: 1440, zone: "body", arrivee: "/en/projets/aurex/" },
  ];
  for (const { depart, largeur, zone, menu, arrivee } of cas) {
    const page = await ouvrir(nav, serveur.url + depart, { largeur });
    if (menu) await page.click('[data-modale-ouvrir="menu"]');
    await page.locator(`${zone} .segments__option[lang="en"]`).filter({ visible: true }).first().click();
    await page.waitForURL(serveur.url + arrivee);
    assert.equal(await page.getAttribute("html", "lang"), "en", `${depart} ${zone}`);
    assert.equal(await page.textContent(".skip-link"), "Skip to content", `${depart} ${zone}`);
    assert.deepEqual(page.erreurs, [], `${depart} ${zone}`);
    await page.fermer();
  }
});

// AGENTS.md §3.4 : toute zone interactive mesure au moins 44 × 44 px. On
// mesure la zone qui reçoit réellement le clic (elementFromPoint), pas la
// boîte dessinée : un pseudo-élément peut l'agrandir sans changer le dessin.
test("sélecteur de langue : chaque option reçoit le clic sur 44 × 44 px", async () => {
  for (const largeur of [375, 1440]) {
    const page = await ouvrir(nav, serveur.url + "/", { largeur });
    const manques = await page.evaluate(() => {
      const cible = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--cible-tactile"));
      return [...document.querySelectorAll(".en-tete .segments__option")].filter((o) => o.getClientRects().length && o.getBoundingClientRect().width).flatMap((o) => {
        const r = o.getBoundingClientRect(); const cx = r.left + r.width / 2; const cy = r.top + r.height / 2; const demi = cible / 2 - 0.5;
        return [[cx, cy - demi], [cx, cy + demi], [cx - demi, cy], [cx + demi, cy]]
          .filter(([x, y]) => document.elementFromPoint(x, y)?.closest(".segments__option") !== o)
          .map(([x, y]) => `${o.textContent.trim()} (${Math.round(x)}, ${Math.round(y)})`);
      });
    });
    assert.deepEqual(manques, [], `${largeur}px`);
    await page.fermer();
  }
});

test("le contenu est visible sans JavaScript, avec un script en échec et avec animations réduites", async () => {
  const cas = [{ js: false }, { bloquerScript: true }, { reduit: true, defile: true }, { defile: true }];
  for (const options of cas) {
    const page = await ouvrir(nav, serveur.url + "/", options);
    if (options.defile) await defiler(page); else await page.waitForTimeout(1200);
    const masques = await page.$$eval(".carte, .projet-carte, .planche", (l) => l.filter((e) => +getComputedStyle(e).opacity < 0.99).length);
    assert.equal(masques, 0, JSON.stringify(options));
    await page.fermer();
  }
});

test("animations réduites : la couverture est visible dès le chargement, sans attendre un délai", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { reduit: true });
  const caches = await page.$$eval(".couverture-scene *", (l) => l.filter((e) => +getComputedStyle(e).opacity < 0.99).map((e) => e.className));
  assert.deepEqual(caches, []);
  await page.fermer();
});

test("aucun débordement horizontal, de 320 à 1440 px, sur toutes les pages types", async () => {
  for (const chemin of ["/", "/en/", "/cv/", "/projets/ceeli/"]) {
    for (const largeur of [320, 375, 768, 850, 1024, 1440]) {
      const page = await ouvrir(nav, serveur.url + chemin, { largeur });
      const debord = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.equal(debord, 0, `${chemin} à ${largeur}px`);
      await page.fermer();
    }
  }
});

test("toutes les images se chargent et réservent leur place (width/height)", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  await defiler(page);
  await page.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = "eager"; return i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }); })));
  const bilan = await page.$$eval("img", (l) => ({ total: l.length, cassees: l.filter((i) => !i.naturalWidth).map((i) => i.src), sansDimensions: l.filter((i) => !i.getAttribute("width") || !i.getAttribute("height")).length, sansAlt: l.filter((i) => !i.hasAttribute("alt")).length }));
  assert.deepEqual(bilan.cassees, []);
  assert.equal(bilan.sansDimensions, 0);
  assert.equal(bilan.sansAlt, 0);
  await page.fermer();
});

test("clavier : le premier arrêt est le lien d'évitement, il mène au contenu", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.className), "skip-link");
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => location.hash), "#contenu");
  await page.fermer();
});

test("menu mobile : Modale plein écran, focus piégé, Échap, retour du focus, lien qui ferme", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { largeur: 375 });
  const bouton = page.locator('[data-modale-ouvrir="menu"]');
  assert.ok(await bouton.isVisible());
  assert.equal(await bouton.getAttribute("aria-expanded"), "false");
  await bouton.click();
  assert.ok(await page.locator("#menu").evaluate((d) => d.open));
  assert.equal(await bouton.getAttribute("aria-expanded"), "true");
  assert.ok(await page.evaluate(() => document.activeElement.closest("#menu") !== null));
  await page.keyboard.press("Escape");
  assert.ok(!(await page.locator("#menu").evaluate((d) => d.open)));
  assert.equal(await page.evaluate(() => document.activeElement.dataset.modaleOuvrir), "menu");
  await bouton.click();
  await page.locator('#menu a[href="#parcours"]').click();
  assert.ok(!(await page.locator("#menu").evaluate((d) => d.open)));
  assert.equal(await page.evaluate(() => location.hash), "#parcours");
  await page.fermer();
});

test("sans JavaScript, la navigation mobile reste accessible (pas de bouton de menu mort)", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { largeur: 375, js: false });
  assert.ok(!(await page.locator('[data-modale-ouvrir="menu"]').isVisible()));
  assert.ok(await page.locator('.en-tete .navigation a[href="#contact"]').isVisible() || await page.locator(".en-tete__navigation").isVisible());
  await page.fermer();
});

test("étude de projet : ouverture en modale, compteur calculé, Échap, focus rendu ; sans JS : page du projet", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  const lien = page.locator('a[data-etude="aurex"]');
  await lien.scrollIntoViewIfNeeded();
  await lien.click();
  await page.waitForFunction(() => document.getElementById("etude").open);
  assert.equal(await page.textContent("[data-etude-compteur]"), "Projet 07 / 11");
  assert.equal(await page.getAttribute("#etude", "aria-labelledby"), "etude-aurex");
  assert.match(await page.textContent("#etude h2"), /AUREX/);
  assert.ok(await page.$$eval("#etude img", (l) => l.length) === 9);
  await page.keyboard.press("Escape");
  assert.equal(await page.evaluate(() => document.activeElement.dataset.etude), "aurex");
  await page.fermer();
  const sansJs = await ouvrir(nav, serveur.url + "/", { js: false });
  await sansJs.locator('a[data-etude="aurex"]').click();
  await sansJs.waitForURL(/projets\/aurex\/$/);
  assert.match(await sansJs.textContent("h1"), /AUREX/);
  await sansJs.fermer();
});

/**
 * L'écart sous l'en-tête après un saut d'ancre. Décision de Marc, PM-018 :
 * 24 px sur ordinateur, 16 px sous 850 px. Aucun test ne le mesurait, et il
 * avait dérivé à 90 px et 68 px — scroll-padding-top et le scroll-margin-top
 * de .planche-scene s'additionnaient, et trois jetons décrivaient la même
 * hauteur d'en-tête.
 */
const ECART_ANCRE = { ordinateur: 24, compact: 16 };

test("ancres : l'écart sous l'en-tête vaut la valeur décidée, à toutes les largeurs", async () => {
  for (const largeur of [320, 375, 768, 850, 851, 1024, 1440, 1920]) {
    const attendu = largeur <= 850 ? ECART_ANCRE.compact : ECART_ANCRE.ordinateur;
    const page = await ouvrir(nav, serveur.url + "/", { largeur });
    const ecarts = await page.evaluate(async (ids) => {
      const mesures = {};
      const entete = document.querySelector(".en-tete--site") || document.querySelector(".en-tete");
      for (const id of ids) {
        location.hash = id;
        // Défilement fluide : on attend que la page se pose avant de mesurer.
        await new Promise((resoudre) => {
          let derniere = window.scrollY; let stables = 0;
          const battre = () => {
            if (window.scrollY === derniere) stables += 1; else { stables = 0; derniere = window.scrollY; }
            if (stables >= 5) resoudre(); else requestAnimationFrame(battre);
          };
          requestAnimationFrame(battre);
        });
        mesures[id] = Math.round(document.getElementById(id).getBoundingClientRect().top - entete.getBoundingClientRect().bottom);
      }
      return mesures;
    }, ["introduction", "apropos", "expertise", "parcours", "prestations"]);
    for (const [id, ecart] of Object.entries(ecarts)) {
      assert.ok(Math.abs(ecart - attendu) <= 1, `${largeur}px, #${id} : écart ${ecart}px, attendu ${attendu}px`);
    }
    await page.fermer();
  }
});

test("ancres : un seul mécanisme compense l'en-tête", async () => {
  // Deux mécanismes s'additionneraient. scroll-padding-top porte l'écart,
  // la planche ne compense plus rien.
  for (const [largeur, entete, ecart] of [[375, 62, 16], [1440, 68, 24]]) {
    const page = await ouvrir(nav, serveur.url + "/", { largeur });
    const lu = await page.evaluate(() => ({
      padding: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
      marge: parseFloat(getComputedStyle(document.querySelector(".planche-scene")).scrollMarginTop),
      entete: Math.round((document.querySelector(".en-tete--site") || document.querySelector(".en-tete")).getBoundingClientRect().height),
    }));
    assert.equal(lu.marge, 0, `${largeur}px : .planche-scene ne doit plus porter de scroll-margin-top`);
    assert.equal(lu.entete, entete, `${largeur}px : hauteur réelle de l'en-tête`);
    assert.equal(lu.padding, entete + ecart, `${largeur}px : scroll-padding-top = hauteur + écart`);
    await page.fermer();
  }
});

test("navigation : aria-current suit la section visible", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  await page.evaluate(() => document.getElementById("parcours").scrollIntoView());
  // Défilement fluide : on attend la fin du mouvement, pas une durée arbitraire.
  await page.waitForFunction(() => document.querySelector('.en-tete .navigation a[href="#parcours"]').getAttribute("aria-current") === "location", null, { timeout: 5000 }).catch(() => {});
  assert.equal(await page.getAttribute('.en-tete .navigation a[href="#parcours"]', "aria-current"), "location");
  await page.fermer();
});

test("accueil animé : apparaît, « Passer » le ferme, mémorisé ; animations réduites : choix de langue direct", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { introVue: false });
  await page.waitForFunction(() => document.getElementById("intro")?.open);
  const passer = page.locator('#intro [data-modale-fermer]');
  assert.ok(await passer.isVisible());
  assert.equal((await passer.textContent()).trim(), "Passer l’introduction");
  await passer.click();
  // L'événement « close » d'un <dialog> est asynchrone : on attend la condition.
  await page.waitForFunction(() => !document.getElementById("intro"), null, { timeout: 5000 });
  assert.equal(await page.evaluate(() => sessionStorage.getItem("mk-intro-vue")), "1");
  await page.reload();
  await page.waitForTimeout(500);
  assert.equal(await page.locator("#intro").count(), 0, "l'accueil ne se rejoue pas dans la même session");
  await page.fermer();

  const reduit = await ouvrir(nav, serveur.url + "/", { introVue: false, reduit: true });
  await reduit.waitForFunction(() => document.getElementById("intro")?.open);
  assert.ok(await reduit.locator('#intro [data-etape="langue"]').isVisible());
  await reduit.locator('#intro .segments__option[lang="en"]').click();
  await reduit.waitForURL(/\/en\/$/);
  await reduit.waitForTimeout(500);
  assert.equal(await reduit.locator("#intro").count(), 0, "l'accueil ne se rejoue pas après le choix de langue");
  await reduit.fermer();
});


/**
 * L'événement « close » d'un <dialog> est ASYNCHRONE : .open bascule avant que
 * l'écouteur ne s'exécute. Attendre .open puis vérifier le verrou court contre
 * lui — mesuré instable, trois échecs sur quatre passages. On attend donc le
 * rendu du verrou lui-même.
 */
const verrouRendu = (page) => page.waitForFunction(
  () => !document.documentElement.classList.contains("has-overlay"),
  null, { timeout: 4000 },
);

const verrouille = (page) => page.evaluate(() => ({
  classe: document.documentElement.classList.contains("has-overlay"),
  overflow: getComputedStyle(document.documentElement).overflow,
}));

/**
 * Le défilement UTILISATEUR, à la molette : c'est lui que le défaut bloquait.
 * window.scrollTo reste permis sous overflow: hidden, et c'est précisément ce
 * qui avait rendu toute la suite aveugle. Le site déclarant scroll-behavior:
 * smooth, on laisse la page se poser avant et après.
 */
async function molette(page) {
  const pose = () => page.waitForFunction(() => new Promise((r) => {
    let derniere = window.scrollY; let stables = 0;
    const battre = () => {
      if (window.scrollY === derniere) stables += 1; else { stables = 0; derniere = window.scrollY; }
      if (stables >= 3) r(true); else requestAnimationFrame(battre);
    };
    requestAnimationFrame(battre);
  }), null, { timeout: 4000 });
  await pose();
  const avant = await page.evaluate(() => window.scrollY);
  await page.mouse.move(600, 400);
  await page.mouse.wheel(0, 1200);
  await pose();
  return Math.abs((await page.evaluate(() => window.scrollY)) - avant) > 50;
}

test("intro : ouverture verrouille le défilement de la page", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { introVue: false });
  await page.waitForFunction(() => document.getElementById("intro")?.open);
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains("has-overlay")), true);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).overflow), "hidden");
  await page.fermer();
});

test("intro : fermeture libère le défilement de la page", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { introVue: false });
  await page.waitForFunction(() => document.getElementById("intro")?.open);
  await page.locator('#intro [data-modale-fermer]').click();
  await page.waitForFunction(() => !document.getElementById("intro"));
  await verrouRendu(page);
  assert.deepEqual(await verrouille(page), { classe: false, overflow: "visible" });
  assert.ok(await molette(page), "le défilement utilisateur doit être rendu");
  await page.fermer();
});

test("étude de projet : fermeture libère le défilement après une ouverture dynamique", async () => {
  const page = await ouvrir(nav, serveur.url + "/");
  const lien = page.locator('a[data-etude="aurex"]');
  await lien.scrollIntoViewIfNeeded();
  await lien.click();
  await page.waitForFunction(() => document.getElementById("etude").open);
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains("has-overlay")), true);
  await page.keyboard.press("Escape");
  await verrouRendu(page);
  assert.deepEqual(await verrouille(page), { classe: false, overflow: "visible" });
  await page.fermer();
});

test("menu mobile : le verrou reste libéré après fermeture", async () => {
  const page = await ouvrir(nav, serveur.url + "/", { largeur: 375 });
  const bouton = page.locator('[data-modale-ouvrir="menu"]');
  for (let cycle = 0; cycle < 3; cycle += 1) {
    await bouton.click();
    await page.waitForFunction(() => document.getElementById("menu").open);
    assert.equal((await verrouille(page)).classe, true, `cycle ${cycle} : ouverture`);
    await page.keyboard.press("Escape");
    await verrouRendu(page);
    assert.equal((await verrouille(page)).classe, false, `cycle ${cycle} : le verrou doit être rendu`);
  }
  assert.ok(await molette(page), "le défilement fonctionne après trois cycles");
  await page.fermer();
});

test("accessibilité (axe-core) : aucune violation grave ou critique", async () => {
  for (const chemin of ["/", "/en/", "/cv/", "/projets/fifa26/"]) {
    for (const theme of ["light", "dark"]) {
      const page = await ouvrir(nav, serveur.url + chemin, { reduit: true, theme });
      await defiler(page);
      await page.addScriptTag({ content: axe });
      const violations = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations
        .filter((v) => ["serious", "critical"].includes(v.impact)).map((v) => `${v.id} (${v.nodes.length}) : ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`));
      assert.deepEqual(violations, [], `${chemin} ${theme}`);
      await page.fermer();
    }
  }
});
