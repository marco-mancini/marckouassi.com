# État du déploiement de marckouassi.com

Constaté le 1er octobre 2026 sur `main` au commit `2a6b9c6`. Ce document décrit
ce qui a été vérifié, ce qui bloque et ce qu'il reste à faire. Aucun résultat
n'y est supposé : chaque point indique sa source.

## Ce qui fonctionne

| Élément | État | Vérification |
|---|---|---|
| Build | `npm run build` produit `_site/` | exécuté dans le dépôt |
| Tests | `npm test` et `npm run test:navigateur` passent | exécutés dans le dépôt |
| `vercel.json` | `buildCommand: "npm run build"`, `outputDirectory: "_site"`, `framework: null` | lu dans le dépôt |
| Workflow Pages | `.github/workflows/pages.yml` : push sur `main`, `npm ci`, `npm test`, `npm run build`, envoi de `_site/` | lu dans le dépôt |
| `main` | contient la version finale (`2a6b9c6`) | `git log` |

## Ce qui bloque

### 1. Le nom de domaine n'existe pas

- DNS public (Google, 1er octobre 2026) : `marckouassi.com` → **NXDOMAIN**,
  réponse faite par les serveurs de la zone `.com` (`a.gtld-servers.net`).
- Registre RDAP de Verisign (`rdap.verisign.com/com/v1/domain/marckouassi.com`) :
  **404**, aucun enregistrement.

Le domaine n'est donc pas enregistré, ou son enregistrement a expiré. Aucun
réglage du dépôt ne peut le rendre accessible.

### 2. GitHub Pages n'est pas activé sur le dépôt

Le run 82 du workflow « Publier le portfolio sur GitHub Pages » (commit
`2a6b9c6`) échoue à l'étape `actions/configure-pages@v5` :

```text
Get Pages site failed. Please verify that the repository has Pages enabled and
configured to build using GitHub Actions […] Error: Not Found
```

Les runs 76, 80 et 81 ont échoué pour la même raison. Le build et les tests ne
sont pas en cause : le job s'arrête avant eux. Le workflow n'est pas à modifier.

Le dépôt n'est pas visible sans connexion (page GitHub en 404) : il est donc
privé. GitHub Pages sur un dépôt privé demande une offre payante (GitHub Pro,
Team ou Enterprise) ; sinon, le dépôt doit être rendu public, ou le site publié
par Vercel.

### 3. Vercel et Cloudflare : état inconnu ou futur

- Vercel : cette session n'a accès ni au tableau de bord ni aux statuts de
  déploiement. La configuration du dépôt est correcte (voir
  [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)).
- Cloudflare Pages : prévu seulement. `.github/workflows/publier.yml` reste
  inactif tant que la variable `CLOUDFLARE_PROJET` n'existe pas.

## Actions à effectuer (Marc)

1. **Enregistrer ou renouveler `marckouassi.com`** chez un registraire.
   Vérification : `https://rdap.verisign.com/com/v1/domain/marckouassi.com`
   renvoie une fiche au lieu d'une erreur 404.
2. **Activer GitHub Pages** : dépôt → *Settings* → *Pages* → *Build and
   deployment* → *Source* : **GitHub Actions**. Si l'option n'est pas
   proposée, le dépôt est privé sans offre compatible (voir plus haut).
3. **Relancer la publication** : *Actions* → « Publier le portfolio sur GitHub
   Pages » → *Run workflow* sur `main`. Vérification : le run est vert et
   `https://marco-mancini.github.io/marckouassi.com/` affiche le site.
4. **Déclarer le domaine** : *Settings* → *Pages* → *Custom domain* :
   `marckouassi.com`, puis, une fois le certificat émis, **Enforce HTTPS**.
5. **Configurer le DNS** chez le registraire (valeurs publiées par GitHub) :

   | Nom | Type | Valeur |
   |---|---|---|
   | `@` | A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
   | `@` | AAAA | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
   | `www` | CNAME | `marco-mancini.github.io` |

   Vérification : `dig marckouassi.com +short` renvoie les quatre adresses,
   puis `https://marckouassi.com` affiche le site avec un certificat valide.

Avec un workflow GitHub Actions, le domaine se déclare dans les réglages : aucun
fichier `CNAME` n'est nécessaire dans le dépôt.

Si le site doit plutôt être servi par Vercel, l'étape 2 est remplacée par
l'ajout du domaine dans le projet Vercel (*Settings* → *Domains*), et l'étape 5
par les enregistrements que Vercel affiche alors.
