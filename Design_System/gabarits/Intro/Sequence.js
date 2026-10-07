import { html, attributs } from "../../fondations/rendu.js";
import { Sceau, construireSceau } from "../../composants/Sceau/Sceau.js";
import { Bouton } from "../../composants/Bouton/Bouton.js";
import { verrouiller, deverrouiller } from "../../composants/Modale/Modale.js";
import { projetsDeLaCategorie } from "../outils.js";

/**
 * Séquence d'ouverture — jouée après l'entrée par la langue, avant d'arriver
 * sur la couverture (page 1). Décision de Marc : #40, D-35, D-37.
 *
 *   0 · le sceau de l'accueil se charge de lumière puis se désintègre en particules
 *   1 · les particules tourbillonnent en galaxie et s'abattent sur la grille de la page
 *   2 · les visuels des réalisations arrivent sur le temps, les catégories défilent
 *   3 · les visuels se fendent en bandes et sont aspirés au centre
 *   4 · le nom se recompose en bandes, puis le métier
 *   5 · le sceau de la couverture se construit à sa place exacte ; le champ se
 *       rétracte sur la carte de la couverture, du même vert ; même image :
 *       le vrai sceau prend le relais au pixel, le contenu se révèle.
 *
 * Tout ce qui s'affiche vient du contenu : nom et métier de la couverture,
 * libellés des catégories, premier visuel et titre des réalisations. Rien
 * n'est écrit ici. Les couleurs viennent des jetons, lus à l'exécution.
 */

/** Nombre de visuels du collage : six places, chacune dessinée pour un écran large et un écran haut. */
const PLACES = 6;

/**
 * Visuels : une réalisation par catégorie, à tour de rôle dans l'ordre du
 * catalogue, jusqu'à remplir les places. Le collage montre ainsi la variété
 * des territoires plutôt que les premiers projets d'une seule catégorie.
 */
export function visuelsDeSequence(categories, projets, places = PLACES) {
  const files = (categories ?? []).map((categorie) => projetsDeLaCategorie(projets, categorie.id).filter((projet) => projet.medias?.[0]?.src));
  const choisis = [];
  for (let rang = 0; choisis.length < places && files.some((file) => file.length > rang); rang++) {
    for (const file of files) if (file[rang] && choisis.length < places) choisis.push(file[rang]);
  }
  return choisis;
}

/**
 * Rendu : la scène dans un <template>, clonée par le navigateur au moment voulu.
 * Sans JavaScript, elle n'existe pas.
 *
 * @param {object} p
 * @param {object} p.contenu   contenu complet (sections, projets)
 * @param {object} p.ctx       contexte de langue (t, c, media)
 */
export function Sequence({ contenu, ctx }) {
  const { t, c } = ctx;
  const couverture = (contenu.sections ?? []).find((section) => section.type === "couverture");
  const sommaire = (contenu.sections ?? []).find((section) => Array.isArray(section.categories));
  if (!couverture || !sommaire) return "";
  const chemin = `sections.${couverture.id}`;
  const lignes = c(couverture.signature?.salutation, `${chemin}.signature.salutation`).split(/\s+/).filter(Boolean);
  const visuels = visuelsDeSequence(sommaire.categories, contenu.projets).map((projet) => {
    const media = ctx.media(projet.medias[0].src);
    // Légende : le nom du projet, avant son sous-titre (« VELANOVA · donner forme… » → « VELANOVA »).
    const nom = c(projet.titre, `projets.${projet.id}.titre`).split(" · ")[0];
    return { src: media.src, largeur: media.largeur, hauteur: media.hauteur, titre: nom };
  }).filter((visuel) => visuel.src);
  const bande = (texte) => [0, 1, 2].map((rang) => html`<span class="sequence__bande-texte" data-bande="${rang}">${texte}</span>`);
  return html`<template id="intro-sequence"><div class="sequence" aria-hidden="true" hidden>
<div class="sequence__champ"></div>
<canvas class="sequence__particules"></canvas>
<div class="sequence__depart"></div>
<div class="sequence__grille"><i></i><i></i><i></i><i></i></div>
<div class="sequence__ancre"><div class="sequence__sceau-fin">${Sceau({ taille: "couverture", anime: "construction" })}</div></div>
<div class="sequence__collage">${visuels.map((visuel) => html`<figure${attributs({ class: "sequence__visuel", "data-ratio": visuel.largeur && visuel.hauteur ? (visuel.hauteur / visuel.largeur).toFixed(4) : null })}>${[0, 1, 2].map(() => html`<div class="sequence__bande"><img${attributs({ src: visuel.src, alt: "", decoding: "async" })}></div>`)}<figcaption>${visuel.titre}</figcaption></figure>`)}</div>
<div class="sequence__mots">${sommaire.categories.map((categorie, rang) => html`<span class="${rang % 2 ? "sequence__mot sequence__mot--creux" : "sequence__mot"}">${c(categorie.libelle, `sections.${sommaire.id}.categories.${rang}.libelle`)}</span>`)}</div>
<div class="sequence__eclair"></div>
<div class="sequence__signature"><p class="sequence__nom">${lignes.map((ligne) => html`<span class="sequence__ligne"><span class="sequence__fantome">${ligne}</span>${bande(ligne)}</span>`)}</p><p class="sequence__metier">${c(couverture.role, `${chemin}.role`)}</p></div>
</div>${Bouton({ texte: t("intro.passer"), variante: "contour", options: { attributs: { "data-sequence-passer": true, hidden: true } } })}</template>`;
}

/* ------------------------------------------------------------------ */
/* Orchestration — navigateur uniquement.                              */
/* ------------------------------------------------------------------ */

const FIN = 7.9; // durée totale, en secondes, de la dissolution à la couverture révélée
const BASCULE = 7.05; // l'image où le champ disparaît et où le vrai sceau prend le relais
// Collage : [x %, y %, largeur en % de l'écran, rotation, sens d'ouverture]
const PAYSAGE = [[23, 30, 28, -4, 0], [76, 26, 24, 3, 1], [52, 64, 30, -1, 2], [15, 73, 22, 5, 3], [85, 72, 22, -5, 0], [43, 26, 17, 2, 1]];
const PORTRAIT = [[30, 19, 54, -4, 0], [73, 33, 48, 3, 1], [42, 50, 60, -1, 2], [68, 66, 50, 5, 3], [30, 80, 52, -5, 0], [62, 84, 44, 2, 2]];
// La couverture se révèle élément par élément, après le relais.
const COUVERTURE = [".couverture__edition", ".signature--couverture", ".couverture__role", ".couverture__promesse", ".couverture__faits"];

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const p = (t, a, b) => clamp((t - a) / (b - a));
const outExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const outCubic = (x) => 1 - Math.pow(1 - x, 3);
const inCubic = (x) => x * x * x;
const inOut = (x) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, x) => a + (b - a) * x;
const rgb = (couleur) => (String(couleur).match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
const melange = (a, b, x) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], x))).join(",")})`;

/** Prépare la scène sans la montrer : les visuels se chargent pendant l'accueil. */
export function preparerSequence(doc = document) {
  const modele = doc.getElementById("intro-sequence");
  if (!modele) return null;
  const existante = doc.querySelector("[data-sequence-hote]");
  if (existante) return existante;
  const hote = doc.createElement("div");
  hote.dataset.sequenceHote = "";
  hote.append(modele.content.cloneNode(true));
  doc.body.append(hote);
  return hote;
}

/**
 * Joue la séquence.
 * @param {object} o
 * @param {{rect:DOMRect, dessin:DOMRect, clone:Element, fond:string}|null} [o.depart]
 *        le sceau de l'accueil au moment du clic ; absent (arrivée par l'autre langue) :
 *        le sceau est posé au centre, à la taille de l'accueil.
 * @param {boolean} [o.son]   l'entrée vient d'un geste : le navigateur autorise le son
 * @returns {Promise<void>}   résolue quand la couverture est révélée, ou à « Passer »
 */
export function jouerSequence({ depart = null, son = false } = {}) {
  const hote = preparerSequence();
  if (!hote) return Promise.resolve();
  const $ = (s) => hote.querySelector(s);
  const $$ = (s) => [...hote.querySelectorAll(s)];
  const racine = document.documentElement;
  const scene = $(".sequence"), champ = $(".sequence__champ"), toile = $(".sequence__particules"), departEl = $(".sequence__depart");
  const grille = $$(".sequence__grille i"), collage = $(".sequence__collage"), visuels = $$(".sequence__visuel");
  const mots = $$(".sequence__mot"), eclair = $(".sequence__eclair"), sceauFin = $(".sequence__sceau-fin"), ancre = $(".sequence__ancre");
  const signature = $(".sequence__signature"), metier = $(".sequence__metier"), passer = $("[data-sequence-passer]");
  const lignes = $$(".sequence__ligne").map((ligne) => [...ligne.querySelectorAll(".sequence__bande-texte")]);
  const ctx = toile.getContext("2d");
  const jeton = (nom) => getComputedStyle(racine).getPropertyValue(nom).trim();
  const COULEURS = ["--accent-gold", "--accent-gold-soft", "--paper", "--olive-ghost"].map(jeton);

  return new Promise((terminer) => {
    let raf = 0, debut = 0, fini = false;

    // ---------- Couverture : la page 1, cible exacte de la fin ----------
    scrollTo({ top: 0, behavior: "instant" });
    const section = document.querySelector(".couverture-scene") || document.getElementById("accueil");
    const carte = section?.querySelector(".planche") || section;
    const sceauReel = section?.querySelector(".sceau");
    const reels = COUVERTURE.map((selecteur) => section?.querySelector(selecteur)).filter(Boolean);
    let fin = null;
    const mesurerFin = () => {
      if (fin || !carte || !sceauReel) return fin;
      const styles = getComputedStyle(carte), r = sceauReel.getBoundingClientRect(), rc = carte.getBoundingClientRect();
      // Le vrai sceau est dessiné dans le calque de la carte : le sceau de la séquence est posé dans un
      // calque de même origine, pour que les bords tombent sur les mêmes pixels à la bascule.
      Object.assign(ancre.style, { left: `${rc.left}px`, top: `${rc.top}px` });
      Object.assign(sceauFin.style, { left: `${r.left - rc.left}px`, top: `${r.top - rc.top}px`, width: `${r.width}px`, height: `${r.height}px` });
      fin = { carte: rc, rayon: parseFloat(styles.borderTopLeftRadius) || 0, couleur: styles.backgroundColor };
      return fin;
    };
    // Les apparitions CSS de la couverture l'emporteraient sur nos styles : suspendues le temps de la séquence.
    if (sceauReel) sceauReel.style.opacity = "0";
    reels.forEach((el) => { el.style.animation = "none"; el.style.opacity = "0"; });

    // ---------- Départ : le sceau de l'accueil, au pixel près ----------
    const fondAccueil = depart?.fond || jeton("--olive-deep");
    if (depart?.clone) {
      const clone = depart.clone;
      clone.classList.remove("est-construit"); // le sceau fixe, sans rejouer sa construction
      clone.style.width = `${depart.rect.width}px`;
      departEl.replaceChildren(clone);
    } else {
      departEl.innerHTML = Sceau({ taille: "grand" });
      departEl.firstElementChild.style.width = "var(--intro-sceau-taille)";
    }
    const posDepart = () => {
      if (depart) return { rect: depart.rect, dessin: depart.dessin };
      const s = departEl.firstElementChild, w = s.getBoundingClientRect().width;
      const rect = { left: innerWidth / 2 - w / 2, top: innerHeight / 2 - w / 2, width: w, height: w };
      return { rect, dessin: rect };
    };

    // ---------- Particules ----------
    const N = Math.min(innerWidth, innerHeight) < 600 ? 1500 : 2600;
    const P = { a: new Float32Array(N), r: new Float32Array(N), d: new Float32Array(N), s: new Float32Array(N), g: new Float32Array(N), c: new Uint8Array(N), ux: new Float32Array(N), uy: new Float32Array(N) };
    for (let i = 0; i < N; i++) {
      P.a[i] = Math.random() * Math.PI * 2; P.r[i] = .12 + Math.pow(Math.random(), .7); P.d[i] = Math.random(); P.g[i] = Math.random();
      P.s[i] = Math.random() < .08 ? 2.2 : .9 + Math.random() * .8; P.c[i] = Math.random() < .45 ? 0 : 2 + Math.floor(Math.random() * 2);
    }
    // Points de départ : les vraies formes du symbole #logo-mk-seal (traits), et son disque crème
    const symbole = document.getElementById("logo-mk-seal");
    const [vbX, vbY, vbL, vbH] = (symbole?.getAttribute("viewBox") || "0 0 1 1").split(/\s+/).map(Number);
    if (symbole) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", symbole.getAttribute("viewBox"));
      svg.classList.add("sequence__mesure");
      symbole.querySelectorAll("circle, path").forEach((forme) => svg.append(forme.cloneNode()));
      document.body.append(svg);
      const formes = [...svg.children].map((f) => ({ f, l: f.getTotalLength() })), total = formes.reduce((s, x) => s + x.l, 0);
      const cercle = symbole.querySelector("circle");
      const [cx0, cy0, r0] = ["cx", "cy", "r"].map((a) => Number(cercle?.getAttribute(a)) || 0);
      for (let i = 0; i < N; i++) {
        if (Math.random() < .45 && cercle) {
          const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * r0;
          P.ux[i] = (cx0 + Math.cos(a) * r - vbX) / vbL - .5; P.uy[i] = (cy0 + Math.sin(a) * r - vbY) / vbH - .5; P.c[i] = 1;
        } else {
          let u = Math.random() * total, k = 0;
          while (k < formes.length - 1 && u > formes[k].l) { u -= formes[k].l; k++; }
          const pt = formes[k].f.getPointAtLength(u);
          P.ux[i] = (pt.x - vbX) / vbL - .5; P.uy[i] = (pt.y - vbY) / vbH - .5;
        }
      }
      svg.remove();
    }
    const ordre = [...Array(N).keys()].sort((a, b) => P.c[a] - P.c[b]);
    let W = 0, H = 0, tAvant = 0;
    const tailler = () => {
      const d = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
      toile.width = W * d; toile.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const particules = (t) => {
      if (W !== innerWidth || H !== innerHeight) tailler();
      const vie = 1 - p(t, 2.2, 2.6);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${t < tAvant ? 1 : t > .6 && t < 1.6 ? .18 : t >= 1.75 ? .6 : .4})`; ctx.fillRect(0, 0, W, H); tAvant = t;
      toile.style.visibility = vie > 0 ? "visible" : "hidden";
      if (vie <= 0) return;
      ctx.globalCompositeOperation = "lighter";
      const { dessin } = posDepart(), cx = W / 2, cy = H / 2, U = Math.min(W, H) * .55;
      const onde = p(t, 1.75, 2.3);
      if (onde > 0 && onde < 1) {
        ctx.globalAlpha = (1 - onde) * .7; ctx.strokeStyle = COULEURS[1]; ctx.lineWidth = 1 + (1 - onde) * 5;
        ctx.beginPath(); ctx.arc(cx, cy, outExpo(onde) * Math.hypot(W, H) * .6, 0, Math.PI * 2); ctx.stroke();
      }
      const incl = lerp(1.2, .5, inOut(p(t, .3, 1.6))), tour = Math.max(0, t - .3) * .3;
      let couleur = -1;
      for (let k = 0; k < N; k++) {
        const i = ordre[k];
        if (P.c[i] !== couleur) { couleur = P.c[i]; ctx.fillStyle = COULEURS[couleur]; }
        const x0 = dessin.left + (P.ux[i] + .5) * dessin.width, y0 = dessin.top + (P.uy[i] + .5) * dessin.height;
        const ang = P.a[i] + Math.max(0, t - .3) * (1.9 / Math.pow(P.r[i], .8));
        const R = P.r[i] * U, X = Math.cos(ang) * R, Z = Math.sin(ang) * R, Y = (P.g[i] - .5) * U * .08;
        const Xr = X * Math.cos(tour) - Z * Math.sin(tour), Zr = X * Math.sin(tour) + Z * Math.cos(tour);
        const Yr = Y * Math.cos(incl) - Zr * Math.sin(incl), Zf = Y * Math.sin(incl) + Zr * Math.cos(incl), f = 900 / (900 + Zf);
        const ligne = i % 4;
        const x2 = ligne < 2 ? P.g[i] * W : W * (ligne === 2 ? .33 : .67), y2 = ligne < 2 ? H * (ligne === 0 ? .33 : .67) : P.g[i] * H;
        const dx = (x0 - dessin.left) / Math.max(1, dessin.width);
        const e1 = outCubic(p(t, .3 + dx * .35 + P.d[i] * .1, 1.05 + dx * .35 + P.d[i] * .1));
        const e2 = outExpo(p(t, 1.5 + P.d[i] * .25, 2.1 + P.d[i] * .25));
        const x = lerp(lerp(x0, cx + Xr * f, e1), x2, e2), y = lerp(lerp(y0, cy + Yr * f, e1), y2, e2);
        const z = P.s[i] * (1 + (1 - e1) * .3);
        ctx.globalAlpha = p(t, .18, .4) * .85 * vie;
        ctx.fillRect(x - z / 2, y - z / 2, z, z);
      }
      ctx.globalAlpha = 1;
    };

    // ---------- Collage, mots, nom : mesures ----------
    let mesures = null;
    const mesurer = () => {
      const W = innerWidth, H = innerHeight, places = H > W * 1.1 ? PORTRAIT : PAYSAGE;
      visuels.forEach((el, i) => {
        const [x, y, w, r, sens] = places[i % places.length];
        const ratio = Number(el.dataset.ratio) || .7, lw = w * W / 100, lh = lw * ratio;
        el.style.width = `${lw}px`; el.style.height = `${lh}px`;
        el.base = { x: x * W / 100 - lw / 2, y: y * H / 100 - lh / 2, r, sens };
      });
      // Une catégorie longue ne doit jamais déborder : elle se resserre pour tenir dans l'écran.
      mots.forEach((mot) => { mot.style.transform = "none"; mot.ajuste = Math.min(1, (W * .84) / Math.max(1, mot.offsetWidth)); });
      mesures = { W, H, sig: { w: signature.offsetWidth, h: signature.offsetHeight } };
    };

    // ---------- Une image à l'instant t ----------
    const PAS_MOTS = 2 / Math.max(1, mots.length);
    const rendu = (t) => {
      if (!mesures) mesurer();
      const f0 = mesurerFin();
      const { W, H, sig } = mesures;
      // Couleur : du vert de l'accueil à celui de la couverture
      if (f0) champ.style.background = melange(rgb(fondAccueil), rgb(f0.couleur), inOut(p(t, .3, 1.6)));
      // 0 · Le sceau de l'accueil se charge, puis se dissout de gauche à droite
      const { rect } = posDepart(), charge = Math.sin(clamp(t / .32) * Math.PI);
      departEl.style.visibility = t < .8 ? "visible" : "hidden";
      // Position par left/top (comme le sceau de l'accueil, posé par la mise en page) : une translation
      // fractionnaire serait lissée autrement, et le relais se verrait d'un demi-pixel.
      departEl.style.left = `${rect.left}px`; departEl.style.top = `${rect.top}px`;
      departEl.style.transform = charge > .001 ? `scale(${1 + charge * .045})` : "none";
      departEl.style.setProperty("--sequence-charge", charge.toFixed(3));
      departEl.classList.toggle("est-charge", charge > .01);
      departEl.style.clipPath = `inset(-10% -10% -10% ${clamp((t - .3) / .45) * 100}%)`;
      // 1 · Particules, onde d'impact, secousse
      particules(t);
      const secousse = 1 - p(t, 1.75, 2.1);
      scene.style.transform = t > 1.75 && secousse > 0 ? `translate(${(Math.random() - .5) * secousse * 10}px, ${(Math.random() - .5) * secousse * 10}px)` : "";
      const opaciteGrille = .55 * p(t, 1.95, 2.35) * (1 - p(t, 4.5, 4.9));
      grille.forEach((l) => (l.style.opacity = opaciteGrille));
      // 2 · Collage et catégories
      const cam = outCubic(p(t, 2.2, 4.4)), ex = inOut(p(t, 4.35, 4.95)), conv = inCubic(p(t, 4.85, 5.25));
      collage.style.transform = `scale(${lerp(1.06, 1, cam) + ex * .22}) rotate(${lerp(-1.2, .6, cam) + ex * 5}deg)`;
      visuels.forEach((el, i) => {
        const b = el.base, s = 2.25 + i * .32, e = outExpo(p(t, s, s + .55));
        const reste = (1 - e) * 100;
        el.style.clipPath = `inset(${[`0 ${reste}% 0 0`, `0 0 0 ${reste}%`, `${reste}% 0 0 0`, `0 0 ${reste}% 0`][b.sens]})`;
        el.style.visibility = t >= s && conv < 1 ? "visible" : "hidden";
        const dx = (b.sens === 0 ? -1 : b.sens === 1 ? 1 : 0) * (1 - e) * 60, dy = (b.sens === 2 ? 1 : b.sens === 3 ? -1 : 0) * (1 - e) * 60;
        const tx = lerp(b.x + dx, W / 2 - el.offsetWidth / 2, conv), ty = lerp(b.y + dy, H / 2 - el.offsetHeight / 2, conv);
        el.style.transform = `translate(${tx}px, ${ty}px) rotate(${b.r + ex * (i % 2 ? 9 : -9)}deg) scale(${lerp(1, .08, conv) * (1 + ex * .1)})`;
        el.style.opacity = 1 - p(t, 5.05, 5.25);
        el.lastElementChild.style.opacity = 1 - p(t, 4.3, 4.5);
        // 3 · Chaque visuel se fend en trois bandes
        el.querySelectorAll(".sequence__bande").forEach((bande, j) => {
          bande.style.transform = `translateX(${((j + i) % 2 ? -1 : 1) * ex * (18 + j * 14 + i * 4)}%)`;
          bande.firstElementChild.style.transform = `scale(${lerp(1.18, 1, e)})`;
        });
      });
      mots.forEach((mot, k) => {
        const s = 2.35 + k * PAS_MOTS, f = s + PAS_MOTS + .02, visible = t >= s && t < f;
        mot.style.visibility = visible ? "visible" : "hidden";
        if (!visible) return;
        const e = outExpo(p(t, s, s + PAS_MOTS * .6));
        mot.style.letterSpacing = `${lerp(.25, -.005, e)}em`;
        mot.style.transform = `scale(${(lerp(1.12, 1, e) + p(t, s, f) * .04) * mot.ajuste})`;
        mot.style.opacity = e * (1 - p(t, f - .06, f));
      });
      const eclat = outExpo(p(t, 5.05, 5.3)) * (1 - p(t, 5.35, 5.7));
      eclair.style.transform = `scaleX(${eclat})`; eclair.style.opacity = eclat;
      // 4 · Le nom se recompose en bandes, puis repart en bandes
      signature.style.visibility = t >= 5.15 && t < 7 ? "visible" : "hidden";
      lignes.forEach((bandes, li) => bandes.forEach((bande, j) => {
        const e = outExpo(p(t, 5.2 + j * .06 + li * .1, 5.95 + j * .06 + li * .1));
        const sortie = inCubic(p(t, 6.3 + j * .05 + li * .06, 6.75 + j * .05 + li * .06));
        bande.style.transform = `translateX(${((1 - e) * 70 - sortie * 130) * ((j + li) % 2 ? -1 : 1)}vw)`;
      }));
      const m = outCubic(p(t, 5.75, 6.4));
      metier.style.opacity = m * (1 - p(t, 6.2, 6.5)); metier.style.letterSpacing = `${lerp(.9, .32, m)}em`;
      signature.style.transform = `translate(${W / 2 - sig.w / 2}px, ${H / 2 - sig.h / 2}px)`;
      // 5 · Le sceau de la couverture se construit à sa place, le champ se rétracte sur la carte
      if (f0) {
        const tr = inOut(p(t, 6.4, BASCULE)), c = f0.carte;
        champ.style.clipPath = `inset(${c.top * tr}px ${(W - c.right) * tr}px ${(H - c.bottom) * tr}px ${c.left * tr}px round ${f0.rayon * tr}px)`;
        champ.style.visibility = t < BASCULE ? "visible" : "hidden";
        sceauFin.style.visibility = t >= 3.5 && t < BASCULE ? "visible" : "hidden";
        if (t >= 3.5 && !sceauFin.dataset.lance) { sceauFin.dataset.lance = "1"; construireSceau(sceauFin.firstElementChild); }
        // Juste avant le relais, la construction est achevée quoi qu'il arrive : un appareil lent
        // ne doit jamais montrer deux sceaux différents à la bascule.
        if (t >= BASCULE - .2 && !sceauFin.dataset.acheve) { sceauFin.dataset.acheve = "1"; sceauFin.getAnimations?.({ subtree: true }).forEach((animation) => animation.finish()); }
        // Même image : le champ disparaît, le sceau de la séquence cède sa place au vrai, au même pixel.
        if (sceauReel) sceauReel.style.opacity = t >= BASCULE ? "" : "0";
        passer.hidden = t >= BASCULE; // la page est rendue : plus rien à passer
        reels.forEach((el, k) => {
          const d = BASCULE + k * .09, e = outCubic(p(t, d, d + .55));
          el.style.opacity = e;
          if (el.matches(".signature")) el.style.clipPath = `inset(-20% ${(1 - outExpo(p(t, d, d + .7))) * 100}% -20% -5%)`;
          else el.style.transform = `translateY(${(1 - e) * 18}px)`;
        });
      }
    };

    // ---------- Son : synthétisé, sans fichier ; seulement après un geste ----------
    let A = null, maitre = null, envoi = null, bruitTampon = null;
    const bruit = () => {
      if (bruitTampon) return bruitTampon;
      bruitTampon = A.createBuffer(1, A.sampleRate * 2, A.sampleRate);
      const d = bruitTampon.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return bruitTampon;
    };
    const sortie = (g, rev) => { g.connect(maitre); if (rev) { const s = A.createGain(); s.gain.value = rev; g.connect(s).connect(envoi); } };
    const choc = (at, f0, f1, dur, vol, rev = 0) => { const o = A.createOscillator(), g = A.createGain(); o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + dur * .6); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + .006); g.gain.exponentialRampToValueAtTime(.0008, at + dur); o.connect(g); sortie(g, rev); o.start(at); o.stop(at + dur + .05); };
    const souffle = (at, dur, f0, f1, vol, montee = .8, rev = .3) => { const s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain(); s.buffer = bruit(); s.loop = true; f.type = "bandpass"; f.Q.value = 1.3; f.frequency.setValueAtTime(f0, at); f.frequency.exponentialRampToValueAtTime(f1, at + dur); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + dur * montee); g.gain.linearRampToValueAtTime(0, at + dur); s.connect(f).connect(g); sortie(g, rev); s.start(at); s.stop(at + dur + .05); };
    const note = (at, fq, dur, vol, type = "sine", rev = .6) => { const o = A.createOscillator(), g = A.createGain(); o.type = type; o.frequency.value = fq; g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + .01); g.gain.exponentialRampToValueAtTime(.0005, at + dur); o.connect(g); sortie(g, rev); o.start(at); o.stop(at + dur + .05); };
    const tic = (at) => { const s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain(); s.buffer = bruit(); f.type = "highpass"; f.frequency.value = 5000; g.gain.setValueAtTime(.25, at); g.gain.exponentialRampToValueAtTime(.001, at + .06); s.connect(f).connect(g); sortie(g, .2); s.start(at); s.stop(at + .08); };
    const ouvrirSon = () => {
      try {
        A = new (window.AudioContext || window.webkitAudioContext)();
        const comp = A.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(A.destination);
        maitre = A.createGain(); maitre.gain.value = .9; maitre.connect(comp);
        const rev = A.createConvolver(), long = A.sampleRate * 2.4, ir = A.createBuffer(2, long, A.sampleRate);
        for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < long; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / long, 2.8); }
        rev.buffer = ir; envoi = A.createGain(); envoi.gain.value = .4; envoi.connect(rev).connect(maitre);
        A.resume?.().catch(() => { /* sans geste, le navigateur garde le silence : la séquence reste muette, c'est voulu */ });
      } catch (erreur) { console.warn(erreur); A = null; }
    };
    const partition = () => {
      if (!A || A.state !== "running") return;
      const a = (x) => A.currentTime + .05 + x;
      choc(a(.02), 70, 42, .4, .6); note(a(.05), 659.3, 1.2, .05);
      souffle(a(.3), .7, 7000, 700, .3, .15, .5); note(a(.32), 1318.5, 1.8, .09, "sine", .9);
      souffle(a(.6), 1.1, 250, 6500, .26, .95, .2);
      choc(a(1.75), 120, 32, 1.4, 1, .3); souffle(a(1.75), .9, 2200, 160, .32, .02, .6);
      for (let i = 0; i < Math.min(visuels.length, 6); i++) {
        const x = 2.25 + i * .32;
        if (i) choc(a(x), 70, 40, .35, .55); tic(a(x + .16)); note(a(x), [392, 440, 523.3, 587.3, 659.3, 784][i], .5, .05, "square", .3);
      }
      souffle(a(4.1), 1.1, 250, 7000, .3, .95, .2); souffle(a(4.85), .4, 5000, 300, .25, .9, 0);
      choc(a(5.2), 120, 30, 1.6, 1, .35); souffle(a(5.2), 1, 2000, 150, .35, .02, .7);
      [5.2, 5.36, 5.52].forEach((x) => tic(a(x)));
      [196, 293.7, 392, 493.9, 587.3].forEach((fq, k) => note(a(5.22 + k * .02), fq, 2.8, .05, "triangle", .9));
      souffle(a(6.4), .9, 400, 4000, .18, .5, .4);
      [1174.7, 1568, 2349.3].forEach((fq, k) => note(a(BASCULE + k * .06), fq, 1.8, .05 / (k + 1), "sine", 1));
    };
    const couperSon = () => {
      if (!A) return;
      const contexte = A;
      maitre?.gain.setTargetAtTime(0, contexte.currentTime, .06);
      setTimeout(() => contexte.close?.().catch(() => { /* déjà fermé */ }), 500);
      A = null;
    };

    // ---------- Déroulé ----------
    const terminerSequence = () => {
      if (fini) return; fini = true;
      cancelAnimationFrame(raf); couperSon();
      removeEventListener("keydown", echap); removeEventListener("resize", remesurer);
      if (sceauReel) sceauReel.style.opacity = "";
      reels.forEach((el) => { el.style.opacity = ""; el.style.transform = ""; el.style.clipPath = ""; });
      hote.remove();
      deverrouiller();
      document.getElementById("contenu")?.focus({ preventScroll: true });
      terminer();
    };
    const echap = (e) => { if (e.key === "Escape") terminerSequence(); };
    const remesurer = () => { mesures = null; fin = null; };
    const boucle = () => {
      // performance.now() plutôt que l'horodatage de requestAnimationFrame : une seule horloge pour le départ et chaque image.
      const t = (performance.now() - debut) / 1000;
      if (t >= FIN) return terminerSequence();
      rendu(t); raf = requestAnimationFrame(boucle);
    };

    verrouiller();
    scene.hidden = false;
    tailler(); rendu(0); // même image que l'accueil, posée avant toute attente
    passer.hidden = false;
    passer.addEventListener("click", terminerSequence);
    addEventListener("keydown", echap); addEventListener("resize", remesurer);
    passer.focus({ preventScroll: true });
    if (son) ouvrirSon();
    // Les visuels se chargent depuis l'accueil : on n'attend que ceux qui manqueraient encore.
    Promise.all([...collage.querySelectorAll("img")].map((img) => img.decode?.().catch(() => { /* image absente : son cadre reste vide */ }))).then(() => {
      if (fini) return;
      mesures = null; partition();
      debut = performance.now(); raf = requestAnimationFrame(boucle);
    });
  });
}
