/**
 * Outils des tests de navigateur : serveur statique de _site (sans
 * dépendance) et ouverture de pages Playwright avec les réglages voulus.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2", ".pdf": "application/pdf", ".xml": "application/xml", ".txt": "text/plain" };

export function servir(dossier = "_site") {
  const racine = path.resolve(dossier);
  const serveur = http.createServer((requete, reponse) => {
    let chemin = decodeURIComponent(new URL(requete.url, "http://x").pathname);
    if (chemin.endsWith("/")) chemin += "index.html";
    const fichier = path.join(racine, chemin);
    if (!fichier.startsWith(racine) || !fs.existsSync(fichier) || fs.statSync(fichier).isDirectory()) { reponse.writeHead(404); reponse.end("introuvable"); return; }
    reponse.writeHead(200, { "content-type": TYPES[path.extname(fichier)] || "application/octet-stream" });
    fs.createReadStream(fichier).pipe(reponse);
  });
  return new Promise((resoudre) => serveur.listen(0, () => resoudre({ url: `http://localhost:${serveur.address().port}`, fermer: () => serveur.close() })));
}

export async function lancer() {
  return chromium.launch();
}

/**
 * Ouvre une page. Options : largeur, hauteur, js, reduit, theme, introVue (défaut : vrai),
 * bloquerScript (simule un script en échec), horloge (horloge du navigateur à l'arrêt,
 * avancée par page.clock.runFor : les animations scriptées deviennent mesurables image par image).
 * Collecte les erreurs console.
 */
export async function ouvrir(navigateur, url, { largeur = 1440, hauteur = 900, js = true, reduit = false, theme = "light", introVue = true, bloquerScript = false, horloge = false } = {}) {
  const contexte = await navigateur.newContext({ viewport: { width: largeur, height: hauteur }, javaScriptEnabled: js, reducedMotion: reduit ? "reduce" : "no-preference", colorScheme: theme });
  const page = await contexte.newPage();
  page.erreurs = [];
  page.on("pageerror", (e) => page.erreurs.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") page.erreurs.push(m.text()); });
  if (introVue) await page.addInitScript(() => { try { sessionStorage.setItem("mk-intro-vue", "1"); } catch { /* */ } });
  if (horloge) { await page.clock.install({ time: new Date("2026-10-07T10:00:00") }); await page.clock.pauseAt(new Date("2026-10-07T10:00:01")); }
  if (bloquerScript) await page.route(/site\.js$/, (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: 'throw new Error("échec simulé")' }));
  await page.goto(url, { waitUntil: "load" });
  page.fermer = () => contexte.close();
  return page;
}

/**
 * Fait défiler toute la page pour déclencher apparitions et images différées.
 * Défilement instantané : le site déclare scroll-behavior: smooth, et un
 * scrollTo fluide relancé toutes les 80 ms n'atteindrait jamais le bas.
 */
export async function defiler(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo({ top: y, behavior: "instant" }); await new Promise((r) => setTimeout(r, 80)); }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(1200);
}
