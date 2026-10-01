# Fichiers retirés et comment les rétablir

Tout fichier retiré reste dans l'historique Git. Pour le rétablir, on le
relit au dernier commit où il existait, puis on le commite à nouveau :

```sh
git show <commit>:<chemin> > <chemin>
```

| Fichier | Retiré le | Dernier commit où il existe | Motif |
|---|---|---|---|
| `Design_System/assets/Cv_Marc.pdf` | 1er oct. 2026 | `6593c16` | données privées, ancienne adresse e-mail ; Marc le refera |
| `.github/workflows/pages.yml` | 1er oct. 2026 | `2b5487f` | GitHub Pages abandonné ; remplacé par `verifier.yml` |
| `.github/workflows/publier.yml` | 1er oct. 2026 | `2b5487f` | Supabase et Cloudflare abandonnés |
| `RAPPORT-NUIT.md` | 1er oct. 2026 | `2b5487f` | historique ; ses trois points ouverts sont dans [DETTE_TECHNIQUE.md](DETTE_TECHNIQUE.md) |
| `Design_System/assets/Fonts/PRELON_identite_fr.html` | 1er oct. 2026 | `2b5487f` | page d'un autre designer avec ses coordonnées personnelles, sans licence ni usage : **à ne pas rétablir** |

## Rétablir la publication GitHub Pages (`pages.yml`)

1. `git show 2b5487f:.github/workflows/pages.yml > .github/workflows/pages.yml`
2. Dans le dépôt GitHub : Settings → Pages → Source : **GitHub Actions**.
   Sans ce réglage, le workflow échoue à l'étape `configure-pages`
   (« Get Pages site failed »), comme sur ses 83 premiers runs.
3. Sur un compte gratuit, GitHub Pages exige un dépôt public.
4. Les tests sont déjà lancés par `verifier.yml` : `pages.yml` peut se
   limiter au build et à la publication.

## Rétablir la publication Cloudflare et le back-office Supabase (`publier.yml`)

`publier.yml` publiait `_site/` sur Cloudflare Pages quand le back-office
Supabase demandait une publication, et lisait Supabase chaque jour pour
éviter la mise en pause du projet gratuit. Il ne sert qu'avec le
back-office Supabase, en sommeil (voir [ADMIN_EN_SOMMEIL.md](ADMIN_EN_SOMMEIL.md)).

1. `git show 2b5487f:.github/workflows/publier.yml > .github/workflows/publier.yml`
2. Variables du dépôt (Settings → Secrets and variables → Actions) :
   `CLOUDFLARE_PROJET`, `SUPABASE_URL`, `SUPABASE_CLE_PUBLIQUE`.
3. Secrets : `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
   `PUBLICATION_SECRET`.
4. Côté Supabase : la mise en service décrite dans
   [Deploy/README.md](../Deploy/README.md).
