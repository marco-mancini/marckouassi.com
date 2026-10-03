/**
 * BUILD — génère le site public statique à partir des DONNÉES.
 *
 *   données (content/ ou dernière publication)
 *     → validation
 *     → médias optimisés (Sharp, avec cache)
 *     → pages rendues par les gabarits, une par langue (/ et /en/)
 *     → sitemap, robots, version
 *
 * Le site produit n'appelle aucun service à la lecture : il reste
 * disponible même si le back-office ou Supabase ne l'est pas.
 *
 * Variables d'environnement (flux de publication uniquement) :
 *   CONTENU_SOURCE=publication, SUPABASE_URL, SUPABASE_CLE_PUBLIQUE, PUBLICATION_VERSION (facultatif)
 *   ADMIN_SUPABASE_URL / ADMIN_SUPABASE_CLE_PUBLIQUE : configuration du back-office
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { cheminLangue, creerContexte } from "../Design_System/i18n/langue.js";
import { formaterErreurs } from "../Design_System/gabarits/donnees.js";
import { cheminsPages, contextePage, rendrePage } from "./pages.mjs";
import { chargerFichiers, chargerPublication, valider, referencesMedias } from "./contenu.mjs";
import { publierMedias, sourceLocale, sourceDistante, lireJeton } from "./medias.mjs";
import { construireCms } from "./cms.mjs";
import { baseConnaissance, baseQualification, mesurer, PLAFOND_JETONS } from "../Design_System/gabarits/connaissance.js";

const RACINE = process.cwd();
const SORTIE = path.join(RACINE, "_site");

async function copier(source, destination, filtre = () => true) {
  await fs.cp(path.join(RACINE, source), path.join(SORTIE, destination), { recursive: true, filter: (chemin) => filtre(chemin) });
}

async function ecrire(chemin, contenu) {
  const cible = path.join(SORTIE, chemin);
  await fs.mkdir(path.dirname(cible), { recursive: true });
  await fs.writeFile(cible, contenu, "utf8");
}

async function main() {
  const debut = Date.now();
  const env = process.env;

  // 1. Données
  let contenu; let version = new Date().toISOString(); let lireSource = sourceLocale(RACINE);
  const publication = env.CONTENU_SOURCE === "publication"
    ? await chargerPublication({ url: env.SUPABASE_URL, cle: env.SUPABASE_CLE_PUBLIQUE, version: env.PUBLICATION_VERSION || null })
    : null;
  if (publication) {
    contenu = publication.contenu;
    version = String(publication.version);
    lireSource = sourceDistante({ racine: RACINE, url: env.SUPABASE_URL });
    console.log(`Données : publication n° ${publication.version}`);
  } else {
    contenu = await chargerFichiers(RACINE);
    console.log(env.CONTENU_SOURCE === "publication" ? "Données : aucune publication encore, content/ du dépôt" : "Données : content/");
  }
  const erreurs = valider(contenu);
  if (erreurs.length) {
    const admin = creerContexte({ langue: "fr", langueParDefaut: "fr", dictionnaires: { fr: JSON.parse(await fs.readFile(path.join(RACINE, "Design_System/i18n/admin.fr.json"), "utf8")) } });
    throw new Error(`Contenu invalide :\n  - ${formaterErreurs(erreurs, admin.t).join("\n  - ")}`);
  }

  await fs.rm(SORTIE, { recursive: true, force: true });
  await fs.mkdir(SORTIE, { recursive: true });

  // 2. Médias
  const { table: medias } = await publierMedias({ references: referencesMedias(contenu), racine: RACINE, sortie: SORTIE, lireSource });

  // 3. Pages
  const { site } = contenu;
  const defaut = site.langueParDefaut;
  const dictionnaires = {};
  for (const langue of site.langues) dictionnaires[langue] = JSON.parse(await fs.readFile(path.join(RACINE, "Design_System/i18n", `${langue}.json`), "utf8"));
  const sprite = await fs.readFile(path.join(RACINE, "Design_System/assets/logos-sprite.svg"), "utf8");
  const couleurTheme = await lireJeton(RACINE, "--clair-surface-page");
  const annee = new Date().getFullYear();
  const pages = cheminsPages(contenu);
  const ressources = { sprite, couleurTheme, annee };
  const manquants = [];

  for (const langue of site.langues) {
    for (const chemin of pages) {
      const ctx = contextePage({ site, langue, chemin, dictionnaires, medias, ressources });
      await ecrire(path.join(cheminLangue(langue, defaut, chemin), "index.html"), String(rendrePage({ contenu, ctx, chemin })));
      manquants.push(...ctx.manquants);
    }
  }

  // 4. Fichiers statiques : Design System et script du site
  // Ni documentation (.md) ni page HTML : le Design System ne publie que des ressources.
  await copier("Design_System", "Design_System", (chemin) => !/\.(md|html)$/.test(chemin));
  await copier("Frontend/site.js", "Frontend/site.js");
  // /admin/ : CMS Git (Sveltia). L'ancien back-office Supabase (tools/admin.mjs) est en sommeil.
  await construireCms({ racine: RACINE, sortie: SORTIE, contenu });

  // 5. Référencement et version
  const urls = site.langues.flatMap((langue) => pages.map((chemin) => ({ langue, chemin })));
  await ecrire("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(({ langue, chemin }) => `  <url>
    <loc>${site.url}/${cheminLangue(langue, defaut, chemin)}</loc>
${site.langues.map((code) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${site.url}/${cheminLangue(code, defaut, chemin)}"/>`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${site.url}/${cheminLangue(defaut, defaut, chemin)}"/>
  </url>`).join("\n")}
</urlset>
`);
  await ecrire("robots.txt", `User-agent: *\nDisallow: /admin/\nSitemap: ${site.url}/sitemap.xml\n`);
  await ecrire("version.json", JSON.stringify({ version, date: new Date().toISOString() }));
  await ecrire(".nojekyll", "");

  // 5 bis. Base de connaissance de MarcoS, une par langue.
  // C'est la SOURCE de l'assistant (décision #23 : pas de base de données).
  // Publiée avec le site : elle suit chaque déploiement, sans clé ni compte.
  const tailles = [];
  for (const langue of site.langues) {
    const base = baseConnaissance({ contenu, langue });
    await ecrire(`connaissance.${langue}.json`, JSON.stringify(base));
    await ecrire(`qualification.${langue}.json`, JSON.stringify(baseQualification({ contenu, langue })));
    const { jetons } = mesurer(base);
    tailles.push(`${langue} ${jetons}`);
    // Le plafond se défend ici : un contenu qui gonfle casse le build, il ne
    // dégrade pas silencieusement la facture et la latence de MarcoS.
    if (jetons > PLAFOND_JETONS) {
      throw new Error(`Base de connaissance ${langue} : ${jetons} jetons, plafond ${PLAFOND_JETONS}. Réduire la liste blanche ou décider de relever le plafond (Docs/MARCOS_DECISIONS.md).`);
    }
  }
  console.log(`MarcoS : base de connaissance publiée (jetons du fichier — ${tailles.join(", ")} ; plafond ${PLAFOND_JETONS})`);

  // 6. Rapport des traductions manquantes (hors site publié)
  const manquantsContenu = [...new Map(manquants.filter((m) => m.type === "contenu").map((m) => [`${m.langue}:${m.cle}`, m])).values()];
  await fs.mkdir(path.join(RACINE, ".cache"), { recursive: true });
  await fs.writeFile(path.join(RACINE, ".cache", "traductions-manquantes.json"), JSON.stringify(manquantsContenu, null, 2));
  console.log(`Pages : ${urls.length} (${site.langues.join(", ")}) ; à traduire : ${manquantsContenu.length} champ(s) de contenu`);
  const parGroupe = new Map();
  for (const { langue, cle } of manquantsContenu) {
    const groupe = `${langue} · ${cle.split(".").slice(0, 2).join(".")}`;
    parGroupe.set(groupe, (parGroupe.get(groupe) || 0) + 1);
  }
  for (const [groupe, nombre] of parGroupe) console.log(`  - ${groupe} : ${nombre}`);
  console.log(`Durée : ${Math.round((Date.now() - debut) / 1000)} s`);
}

main().catch((erreur) => {
  console.error("Échec de la construction :", erreur.message);
  process.exit(1);
});
