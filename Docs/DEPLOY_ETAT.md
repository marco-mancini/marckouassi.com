# État du déploiement

Mis à jour le 1er octobre 2026. Chaque point indique s'il a été **vérifié**
(constaté) ou s'il reste **à faire**.

## Architecture réelle

```text
content/*.json  ──►  npm run build (tools/build.mjs)  ──►  _site/  ──►  Vercel
(seule source)       pages FR/EN, images compressées                   https://marckouassi-com.vercel.app
```

- **Hébergeur** : Vercel, offre Hobby. Chaque push sur `main` déclenche un
  build de production ; les autres branches produisent des aperçus.
  Réglages : [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md).
- **Source du contenu** : `content/` (site, sections, projets, cv). Rien
  d'autre n'alimente le site publié.
- **Adresse publique** : `url` dans `content/site.json`. Canonical, og:url,
  hreflang, plan du site et robots.txt en sont dérivés.
- **Vérification** : le workflow `.github/workflows/verifier.yml` lance
  tests unitaires, build et tests navigateur à chaque push et pull request.
  Il ne publie rien.
- **Édition** : directement dans `content/` (GitHub ou poste local). Un CMS
  Git est **à venir** : il écrira dans `content/`, Vercel reconstruira.

## Vérifié le 1er octobre 2026

| Point | Constat |
|---|---|
| Site en ligne | `https://marckouassi-com.vercel.app` répond, version de `main` |
| Adresse canonique | pointe vers `https://marckouassi-com.vercel.app` |
| Données personnelles | `/cv/` ne publie ni date de naissance, ni quartier, ni téléphone |
| PDF du CV | retiré ; `/Design_System/assets/Cv_Marc.pdf` répond 404 en production |
| Build | `npm run build` produit `_site/` ; images : 330 Mo d'originaux → 9 Mo publiés |
| Tests | unitaires, navigateur et contrôle de `_site` passent en local |

## Abandonné ou en sommeil

| Élément | État | Remarque |
|---|---|---|
| GitHub Pages (`pages.yml`) | **abandonné**, workflow retiré | voir [RETIRES.md](RETIRES.md) pour le rétablir |
| Cloudflare Pages (`publier.yml`) | **abandonné**, workflow retiré | voir [RETIRES.md](RETIRES.md) pour le rétablir |
| Back-office Supabase (`Admin/`, `supabase/`) | en sommeil | jamais relié ; remplacé par le CMS Git à venir |
| Domaine `marckouassi.com` | non acheté | NXDOMAIN ; à l'achat, changer seulement `url` dans `content/site.json`, puis ajouter le domaine dans Vercel (Settings → Domains) |

## Décisions et suites (Marc)

1. **Conditions de Vercel** : décidé le 1er octobre 2026, Marc reste sur
   Hobby et assume le risque ; textes et options dans
   [HEBERGEMENT.md](HEBERGEMENT.md).
2. **Anciens déploiements Vercel** : ils restent accessibles à leur propre
   adresse et contiennent l'ancien PDF du CV. Les supprimer dans
   Vercel → Deployments.
3. **CMS Git** : à installer après validation de la proposition.
