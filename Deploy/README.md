# Déploiement et back-office

Ce document décrit comment le site est construit et publié, et comment
relier le back-office (`/admin/`) à Supabase. Les étapes marquées
**action humaine** demandent un compte ou une décision que le dépôt ne
peut pas fournir.

## Vue d'ensemble

```text
Marc, dans /admin/  ──Enregistrer──►  Supabase : table documents (brouillon)
                    ──Publier──────►  Edge Function « publier »
                                        │ vérifie l'administrateur
                                        │ fige le brouillon (table publications, n° de version)
                                        ▼
                                      GitHub Actions « publier.yml »
                                        │ npm test, npm run build (contenu de la publication)
                                        │ images optimisées (Sharp, cache)
                                        ▼
                                      Cloudflare Pages ──► marckouassi.com
                                        │
                                        └─ résultat renvoyé au back-office (en ligne / échec)
```

Le site publié est entièrement statique : il ne lit rien chez Supabase
à l'affichage. Si Supabase ou GitHub sont indisponibles, le site reste en
ligne ; seule la modification est suspendue.

## Construire le site

```sh
npm ci
npm test                 # tests rapides (rendu, langue, résistance, back-office)
npm run build            # _site/ à partir de content/
npm run test:navigateur  # tests dans Chromium (site et back-office), après le build
```

Variables reconnues par `npm run build` :

| Variable | Rôle |
|---|---|
| `CONTENU_SOURCE=publication` | lit la dernière publication du back-office au lieu de `content/` |
| `PUBLICATION_VERSION` | numéro précis à construire (fourni par le flux de publication) |
| `SUPABASE_URL`, `SUPABASE_CLE_PUBLIQUE` | lecture de la publication (clé **publique** uniquement) |
| `ADMIN_SUPABASE_URL`, `ADMIN_SUPABASE_CLE_PUBLIQUE` | configuration publique du back-office (sinon : les deux précédentes) |
| `ADMIN_DEMO=1` | back-office en démonstration (aucun réseau ; pour essayer ou tester) |

Le build refuse une clé secrète dans la configuration du back-office.
Sans configuration Supabase, `/admin/` affiche « pas encore relié à
Supabase » : il n'y a jamais de démonstration silencieuse en ligne.

Essai local du back-office :

```sh
ADMIN_DEMO=1 npm run build
python3 -m http.server -d _site 8080   # puis http://localhost:8080/admin/
```

## Flux GitHub

- `.github/workflows/pages.yml` — **publication actuelle** : à chaque
  envoi sur `main`, construit le site depuis `content/` et le publie sur
  GitHub Pages. Il reste en place tant que le domaine n'est pas basculé
  vers Cloudflare.
- `.github/workflows/publier.yml` — **publication depuis le back-office** :
  déclenché par l'Edge Function, construit la version demandée et la
  déploie sur Cloudflare Pages. Inactif tant que la variable
  `CLOUDFLARE_PROJET` n'est pas définie. Chaque jour, il lit aussi une
  ligne chez Supabase pour éviter la mise en pause d'un projet gratuit
  inactif.

## Mise en service (action humaine)

### 1. Supabase

1. Créer un projet (offre gratuite).
2. Appliquer le schéma : coller `supabase/migrations/20261001000000_back_office.sql`
   dans l'éditeur SQL du tableau de bord, ou, avec la CLI :
   `supabase link --project-ref <réf>` puis `supabase db push`.
3. Authentification : désactiver l'inscription libre (seuls les comptes
   créés à la main existent), puis créer le compte de Marc
   (e-mail + mot de passe) dans la liste des utilisateurs.
4. Donner l'accès au back-office à ce compte, dans l'éditeur SQL :
   ```sql
   insert into public.administrateurs (user_id)
   select id from auth.users where email = '<adresse de Marc>';
   ```
5. Déployer la fonction et ses secrets (CLI) :
   ```sh
   supabase functions deploy publier
   supabase secrets set GITHUB_DEPOT=marco-mancini/marckouassi.com \
     GITHUB_JETON=<jeton GitHub> PUBLICATION_SECRET=<longue valeur aléatoire> \
     ORIGINE_ADMIN=https://marckouassi.com
   ```
   `GITHUB_JETON` : jeton GitHub « à portée fine », limité à ce dépôt,
   avec la permission *Contents* en lecture et écriture (nécessaire pour
   déclencher le flux). La clé secrète Supabase reste dans la fonction :
   elle n'est jamais copiée ailleurs.

### 2. Cloudflare Pages

1. Créer un projet Pages en « envoi direct » (*Direct Upload*), par exemple `marckouassi`.
2. Créer un jeton d'API avec la permission *Cloudflare Pages : Edit* et relever l'identifiant du compte.

### 3. GitHub (Settings → Secrets and variables → Actions)

| Type | Nom | Valeur |
|---|---|---|
| Variable | `SUPABASE_URL` | adresse du projet Supabase |
| Variable | `SUPABASE_CLE_PUBLIQUE` | clé publique (*anon* ou *publishable*) |
| Variable | `CLOUDFLARE_PROJET` | nom du projet Pages |
| Secret | `CLOUDFLARE_API_TOKEN` | jeton d'API Cloudflare |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | identifiant du compte Cloudflare |
| Secret | `PUBLICATION_SECRET` | la même valeur que dans Supabase |

### 4. Bascule du domaine — DÉCISION À PRENDRE

Ajouter `marckouassi.com` comme domaine personnalisé du projet Pages,
vérifier le site sur l'adresse `*.pages.dev`, puis basculer le DNS.
Une fois la bascule faite, désactiver GitHub Pages pour que
`pages.yml` ne publie plus en parallèle.

## Premier usage du back-office

À la première connexion, les documents n'existent pas encore chez
Supabase : le back-office reprend le contenu du site actuel
(`/admin/amorce/`) et propose de l'enregistrer. Après « Enregistrer »,
Supabase devient la source du contenu ; `content/` reste le contenu de
départ et la référence des tests.

## Limites à connaître (offres gratuites)

- Fichiers déposés : 50 Mo au plus chacun ; SVG refusé (il peut contenir du script).
- Les images sont optimisées au build (1600 px, WebP) : l'original n'est jamais servi tel quel.
- Un projet Supabase gratuit inactif une semaine est mis en pause : le flux quotidien l'évite.
