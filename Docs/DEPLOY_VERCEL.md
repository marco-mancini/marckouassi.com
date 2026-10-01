# Déploiement Vercel (aperçus)

Vérifié le 1er octobre 2026 sur `version-finale/portfolio-bo` au commit `5e31048`.
L'état « Ready » d'un déploiement **n'a pas pu être constaté** : cette session n'a
accès ni au tableau de bord Vercel ni aux statuts que Vercel publie sur les
commits GitHub. Ce document décrit ce qui a été vérifié dans le dépôt et
comment conclure côté Vercel.

## Architecture actuelle

```text
content/*.json ─┐
Design_System/ ─┼─► npm run build (node tools/build.mjs) ─► _site/ ─► Vercel (aperçus)
Frontend/      ─┤                                                ├─► GitHub Pages (.github/workflows/pages.yml)
Admin/         ─┘                                                └─► Cloudflare Pages (.github/workflows/publier.yml, cible)
```

Le site est **statique** : `tools/build.mjs` génère toutes les pages dans `_site/`.
Le même dossier est publié par les trois chemins ci-dessus ; aucun n'utilise
`public/`.

| Fichier | Rôle | Valeur |
|---|---|---|
| `package.json` | script `build` | `node tools/build.mjs` ; `engines.node` : `>=22.6` |
| `tools/build.mjs` | dossier produit | `const SORTIE = path.join(RACINE, "_site")` |
| `vercel.json` | consignes Vercel | `buildCommand: "npm run build"`, `outputDirectory: "_site"`, `framework: null` |

## Problème rencontré

Sur les commits `3da45af`, `e37f493` et `32650b7`, Vercel échouait avec :

> No Output Directory named "public" found after the Build completed. Configure
> the Output Directory in your Project Settings. Alternatively, configure
> vercel.json#outputDirectory.

## Cause

`vercel.json` avait été ajouté au commit `dbfab94` (« Corriger le déploiement
Vercel… ») précisément pour indiquer `_site`. Le nettoyage du commit `3da45af`
l'a supprimé par erreur, en le croyant lié à une architecture abandonnée.
Sans ce fichier et sans réglage dans le projet Vercel, Vercel (« Other », sans
framework) cherche un dossier `public`, qui n'existe pas. Le dossier `Public/`
du dépôt (visuels sources, avec une majuscule) n'est pas ce dossier : Vercel
construit sous Linux, où la casse compte, et il ne contient de toute façon
pas le site.

## Correction (commit `5e31048`)

- `vercel.json` restauré **à l'identique** de `dbfab94`.
- Test `tests/deploiement.test.mjs` : il échoue si `vercel.json` disparaît ou si
  `outputDirectory` ne correspond plus au dossier produit par `tools/build.mjs`.
- Note dans `Deploy/README.md`.
- Aucun changement de rendu, de contenu, de composant ni de comportement.

## Configuration attendue

`vercel.json` (à la racine du dépôt) :

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "_site",
  "framework": null
}
```

Réglages du projet Vercel (Project Settings) :

| Réglage | Valeur attendue |
|---|---|
| Root Directory | vide (racine du dépôt) |
| Framework Preset | Other (ou laissé à `vercel.json`, `framework: null`) |
| Build Command / Output Directory | non surchargés, ou identiques à `vercel.json` |
| Install Command | défaut (`npm install`) |
| Node.js Version | 22.x ou plus récent (le build exige Node 22.6 au minimum) |
| Variables d'environnement | aucune n'est requise (voir ci-dessous) |

Variables lues par le build, **toutes facultatives** :
`CONTENU_SOURCE`, `PUBLICATION_VERSION`, `SUPABASE_URL`, `SUPABASE_CLE_PUBLIQUE`,
`ADMIN_SUPABASE_URL`, `ADMIN_SUPABASE_CLE_PUBLIQUE`, `ADMIN_DEMO`.
Sans elles, le build lit `content/` et `/admin/` affiche « pas encore relié à
Supabase ». Ne jamais y mettre une clé secrète : le build la refuse.

## Vérifications locales (1er octobre 2026)

| Vérification | Résultat |
|---|---|
| `vercel.json` présent, cohérent avec `package.json` et `tools/build.mjs` | oui |
| Références à `outputDirectory` / `vercel.json` | uniquement `vercel.json`, `tests/deploiement.test.mjs`, `Deploy/README.md` |
| Configuration pointant vers `public` | aucune |
| Fichiers lus par le build | tous présents dans le dépôt (`content/`, dictionnaires, sprite, `Tokens.css`, `Frontend/site.js`, client supabase-js de `node_modules`) |
| Build **à froid** (sans `_site/` ni `.cache/`) | 41 s ; 110 images optimisées, 0 en échec ; 26 pages FR/EN |
| Contenu de `_site/` | `index.html`, `en/`, `cv/`, `projets/`, `admin/`, `Design_System/`, `Frontend/`, `Public/`, `sitemap.xml`, `robots.txt`, `version.json` ; 27 `index.html` ; 13 Mo |
| `npm test` | 63 tests, tous passent |
| `npm run test:navigateur` | 21 tests, tous passent |
| `npm run comparer-reference` | aucune dérive par rapport à 71cfb9d |
| Changements inutiles pour Vercel | aucun : seul `vercel.json` (et son test, sa note) |

## Ce qui reste à vérifier dans Vercel

1. Onglet **Deployments** : le Preview du commit `5e31048` (ou suivant) est **Ready**.
2. Journal de build : la ligne `Pages : 26 (fr, en)` apparaît et aucune erreur ne suit.
3. Sur l'URL de Preview : `/`, `/en/`, `/cv/`, `/projets/aurex/`, `/admin/`
   répondent, les styles et images se chargent.
4. Ne fusionner vers `main` qu'une fois le Preview **Ready**.

## Si le Preview échoue encore

| Symptôme dans le journal | Cause probable | Réglage à vérifier |
|---|---|---|
| `No Output Directory named "public"` | `vercel.json` absent de la branche déployée, ou surcharge dans le projet | vérifier que le commit déployé contient `vercel.json` ; vider la surcharge « Output Directory » du projet |
| `Missing script: "build"` / commande inconnue | Root Directory mal réglé | Root Directory vide |
| erreur de syntaxe ou `--experimental-strip-types` | Node trop ancien | Node.js Version 22.x ou plus |
| erreur à l'installation de `sharp` | binaire natif indisponible | relancer sans cache de build (Redeploy, sans cache) ; vérifier que `npm install` installe les dépendances optionnelles |
| `Contenu invalide : …` | donnée obligatoire manquante dans `content/` | corriger le champ cité (le message nomme le chemin) |
| `Clé secrète refusée…` | une clé secrète Supabase dans les variables Vercel | la remplacer par la clé publique |
| build OK, page sans style | ressource demandée hors de `_site` | ouvrir la console réseau ; les chemins sont relatifs à la page |

Pour reproduire localement exactement ce que fait Vercel :

```sh
rm -rf node_modules _site .cache
npm install
npm run build
ls _site
```
