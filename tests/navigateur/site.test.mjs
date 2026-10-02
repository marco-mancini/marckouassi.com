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

/**
 * FILTRE PAR DISCIPLINE — ce que seul un vrai navigateur peut dire :
 * que le clic masque les bonnes cartes, que le clavier fait la même chose
 * que la souris, que rien ne déborde sur un téléphone, et que les cartes
 * masquées sortent aussi de l'arbre d'accessibilité.
 *
 * Les disciplines et les projets sont relus dans content/ : ce fichier ne
 * nomme ni l'un ni l'autre. Si Marc ajoute une discipline, le test la
 * couvre sans retouche.
 */
const catalogueDuContenu = async () => {
  const contenu = await chargerFichiers(process.cwd());
  const catalogue = contenu.sections.find((s) => Array.isArray(s.categories)).categories;
  return catalogue
    .map((d) => ({ id: d.id, attendus: contenu.projets.filter((p) => (p.categories ?? []).includes(d.id)).length }))
    .filter((d) => d.attendus > 0);
};

test("filtre des projets : chaque discipline ne laisse que ses cartes, « Tous » les rend toutes", async () => {
  const disciplines = await catalogueDuContenu();
  const page = await ouvrir(nav, serveur.url + "/");
  const visibles = () => page.$$eval(".projets .projet-carte", (l) => l.filter((e) => !e.hidden).length);
  const total = await page.$$eval(".projets .projet-carte", (l) => l.length);

  assert.equal(await visibles(), total, "au chargement, tout est visible");
  assert.equal(await page.getAttribute('[data-segments="projets"] [data-valeur=""]', "aria-pressed"), "true");

  for (const { id, attendus } of disciplines) {
    await page.locator(`[data-segments="projets"] [data-valeur="${id}"]`).click();
    assert.equal(await visibles(), attendus, `discipline « ${id} »`);
    // Chaque carte restée visible porte bien la discipline : pas de survivante.
    const intruses = await page.$$eval(".projets .projet-carte", (l, d) => l.filter((e) => !e.hidden && !e.dataset.disciplines.split(" ").includes(d)).length, id);
    assert.equal(intruses, 0, `une carte sans « ${id} » est restée visible`);
    assert.equal(await page.getAttribute(`[data-segments="projets"] [data-valeur="${id}"]`, "aria-pressed"), "true");
    const presses = await page.$$eval('[data-segments="projets"] .segments__option', (l) => l.filter((e) => e.getAttribute("aria-pressed") === "true").length);
    assert.equal(presses, 1, "une seule discipline active à la fois");
  }

  await page.locator('[data-segments="projets"] [data-valeur=""]').click();
  assert.equal(await visibles(), total, "« Tous » rend toutes les cartes");
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("filtre des projets : une carte masquée sort aussi de l'arbre d'accessibilité", async () => {
  const [premiere] = await catalogueDuContenu();
  const page = await ouvrir(nav, serveur.url + "/");
  await page.locator(`[data-segments="projets"] [data-valeur="${premiere.id}"]`).click();
  // `hidden` retire l'élément du rendu ET de l'arbre : un lecteur d'écran ne
  // doit pas annoncer un projet que l'œil ne voit plus.
  const fantomes = await page.$$eval(".projets .projet-carte[hidden] a", (l) => l.filter((a) => a.offsetParent !== null).length);
  assert.equal(fantomes, 0, "un lien de carte masquée reste atteignable");
  const tabulables = await page.$$eval(".projets .projet-carte[hidden]", (l) => l.filter((e) => e.querySelector("a,button")?.matches(":not([inert]) *") && e.getClientRects().length).length);
  assert.equal(tabulables, 0, "une carte masquée garde une zone cliquable");
  await page.fermer();
});

test("filtre des projets : le clavier seul fait exactement ce que fait la souris", async () => {
  const [premiere] = await catalogueDuContenu();
  const page = await ouvrir(nav, serveur.url + "/");
  const bouton = page.locator(`[data-segments="projets"] [data-valeur="${premiere.id}"]`);
  await bouton.scrollIntoViewIfNeeded();
  await bouton.focus();
  assert.equal(await page.evaluate(() => document.activeElement.dataset.valeur), premiere.id, "l'option prend le focus");
  await page.keyboard.press("Enter");
  assert.equal(await page.$$eval(".projets .projet-carte", (l) => l.filter((e) => !e.hidden).length), premiere.attendus);
  await page.keyboard.press("Space");
  assert.equal(await page.$$eval(".projets .projet-carte", (l) => l.filter((e) => !e.hidden).length), premiere.attendus, "la barre d'espace ne doit pas inverser l'état");
  assert.deepEqual(page.erreurs, []);
  await page.fermer();
});

test("filtre des projets : aucun débordement et cible de 44 px, de 320 à 1440 px", async () => {
  for (const largeur of [320, 375, 768, 1024, 1440]) {
    const page = await ouvrir(nav, serveur.url + "/", { largeur });
    await page.locator('[data-segments="projets"]').scrollIntoViewIfNeeded();
    const debordement = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(debordement <= 0, `${largeur}px : débordement de ${debordement}px`);
    // Sous 850 px la rangée défile : une option hors champ n'est pas
    // atteignable par elementFromPoint tant qu'elle n'a pas été amenée dans
    // le champ. On la fait défiler AVANT de sonder, comme le ferait un doigt
    // ou la tabulation — sinon on mesurerait l'absence d'écran, pas la cible.
    const manques = await page.evaluate(() => {
      const cible = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--cible-tactile"));
      const options = [...document.querySelectorAll('[data-segments="projets"] .segments__option')];
      const absents = [];
      for (const o of options) {
        o.scrollIntoView({ block: "nearest", inline: "center" });
        const r = o.getBoundingClientRect(); const cx = r.left + r.width / 2; const cy = r.top + r.height / 2; const demi = cible / 2 - 0.5;
        for (const [x, y] of [[cx, cy - demi], [cx, cy + demi]]) {
          if (document.elementFromPoint(x, y)?.closest(".segments__option") !== o) {
            absents.push(`${o.textContent.trim()} (${Math.round(x)}, ${Math.round(y)})`);
          }
        }
      }
      return absents;
    });
    assert.deepEqual(manques, [], `${largeur}px`);
    await page.fermer();
  }
});

test("filtre des projets : en anglais, mêmes identifiants et mêmes comptes", async () => {
  const disciplines = await catalogueDuContenu();
  const page = await ouvrir(nav, serveur.url + "/en/");
  for (const { id, attendus } of disciplines) {
    await page.locator(`[data-segments="projets"] [data-valeur="${id}"]`).click();
    assert.equal(await page.$$eval(".projets .projet-carte", (l) => l.filter((e) => !e.hidden).length), attendus, `EN · ${id}`);
  }
  await page.fermer();
});

test("sans JavaScript, le filtre n'est pas posé et les projets restent tous là", async () => {
  // Un bouton de filtre inerte serait pire que pas de bouton : il promet une
  // action qu'il ne peut pas rendre.
  const page = await ouvrir(nav, serveur.url + "/", { js: false });
  assert.equal(await page.locator('[data-segments="projets"]').count(), 0, "le filtre ne doit pas être posé sans script");
  const contenu = await chargerFichiers(process.cwd());
  assert.equal(await page.$$eval(".projets .projet-carte", (l) => l.filter((e) => !e.hidden).length), contenu.projets.length);
  await page.fermer();
});

test("filtre des projets : sous 850 px, une seule rangée qui défile, sans rien perdre", async () => {
  // Avant ce comportement, sept disciplines s'empilaient sur jusqu'à six
  // rangs à 320 px et repoussaient le premier projet de 268 px.
  const disciplines = await catalogueDuContenu();
  for (const largeur of [320, 375, 768]) {
    const page = await ouvrir(nav, serveur.url + "/", { largeur });
    const m = await page.evaluate(() => {
      const bloc = document.querySelector(".projets__filtres");
      const groupe = bloc.querySelector('[data-segments="projets"]');
      const options = [...groupe.children];
      return {
        rangs: new Set(options.map((o) => Math.round(o.getBoundingClientRect().top))).size,
        options: options.length,
        defile: bloc.scrollWidth > bloc.clientWidth,
        hauteur: Math.round(bloc.getBoundingClientRect().height),
        enveloppe: Math.round(document.querySelector(".projets").getBoundingClientRect().width),
      };
    });
    assert.equal(m.rangs, 1, `${largeur}px : ${m.rangs} rangs au lieu d'un seul`);
    assert.equal(m.options, disciplines.length + 1, `${largeur}px : une option manque`);
    // Toutes les options restent atteignables : celles qui dépassent se
    // rejoignent en faisant défiler la rangée, jamais en les supprimant.
    for (const { id } of disciplines) {
      const atteinte = await page.evaluate((cible) => {
        const option = document.querySelector(`[data-segments="projets"] [data-valeur="${cible}"]`);
        if (!option) return false;
        option.scrollIntoView({ block: "nearest", inline: "center" });
        const r = option.getBoundingClientRect();
        const bloc = document.querySelector(".projets__filtres").getBoundingClientRect();
        return r.left >= bloc.left - 1 && r.right <= bloc.right + 1;
      }, id);
      assert.ok(atteinte, `${largeur}px : « ${id} » reste hors d'atteinte`);
    }
    await page.fermer();
  }
});

test("filtre des projets : la rangée qui défile ne coupe ni le contour de focus ni la cible de 44 px", async () => {
  // `overflow-x: auto` rend aussi l'axe vertical scrollable : sans marge, le
  // contour de focus et la zone cliquable étendue seraient rognés.
  for (const largeur of [320, 375]) {
    const page = await ouvrir(nav, serveur.url + "/", { largeur });
    const m = await page.evaluate(() => {
      const bloc = document.querySelector(".projets__filtres");
      const option = bloc.querySelector(".segments__option");
      option.focus();
      const style = getComputedStyle(document.documentElement);
      const contour = parseFloat(style.getPropertyValue("--outline-focus")) + parseFloat(style.getPropertyValue("--outline-focus-offset"));
      const marge = parseFloat(getComputedStyle(bloc).paddingTop);
      const r = option.getBoundingClientRect();
      const b = bloc.getBoundingClientRect();
      return {
        focusVisible: option.matches(":focus-visible"),
        margeSuffisante: marge >= contour,
        hautRogne: r.top - contour < b.top - 0.5,
        basRogne: r.bottom + contour > b.bottom + 0.5,
        defilementVertical: bloc.scrollHeight > bloc.clientHeight + 1,
      };
    });
    assert.ok(m.focusVisible, `${largeur}px : le focus clavier n'est pas visible`);
    assert.ok(m.margeSuffisante, `${largeur}px : la marge verticale ne couvre pas le contour de focus`);
    assert.ok(!m.hautRogne && !m.basRogne, `${largeur}px : le contour de focus déborde du conteneur qui défile`);
    assert.ok(!m.defilementVertical, `${largeur}px : la rangée défile aussi verticalement, ce qu'elle ne doit pas`);
    await page.fermer();
  }
});

test("filtre des projets : le défilement de la rangée ne déborde jamais sur la page", async () => {
  // Une rangée qui défile mal poussée élargit le document entier.
  for (const largeur of [320, 375, 768, 1024, 1440]) {
    const page = await ouvrir(nav, serveur.url + "/", { largeur });
    const m = await page.evaluate(() => {
      const bloc = document.querySelector(".projets__filtres");
      bloc.scrollLeft = bloc.scrollWidth; // poussée à fond, le pire cas
      return { debordement: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    assert.ok(m.debordement <= 0, `${largeur}px : débordement de ${m.debordement}px`);
    await page.fermer();
  }
});
