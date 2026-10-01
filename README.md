# marckouassi.com

Portfolio personnel de Marc Kouassi, directeur artistique. Site statique
généré à partir de `content/`, publié par Vercel :
https://marckouassi-com.vercel.app.

## Structure

```text
content/              Contenu du site (site, sections, projets, cv), FR et EN
Design_System/        Fondations, composants, gabarits, dictionnaires, ressources
Frontend/site.js      Comportements des pages publiques
Admin/                Back-office Supabase, en sommeil (remplacé par le CMS Git, voir Docs/CMS.md)
supabase/             Schéma et Edge Function du back-office Supabase, en sommeil
tools/                Build : validation, médias (Sharp), pages, CMS (cms.mjs)
tests/                Tests (npm test) et tests navigateur (npm run test:navigateur)
Public/images/        Visuels des projets
Deploy/               Mise en service du back-office Supabase (en sommeil)
Docs/                 Documentation : déploiement, contenus, assistant NéO
.github/workflows/    verifier.yml : tests et build à chaque push et pull request
```

## Commandes

```sh
npm ci
npm test                 # rendu, langues, résistance, rien en dur, CMS, secrets
npm run build            # génère _site/ (pages FR et EN, médias optimisés, sitemap)
npm run test:navigateur  # Chromium : accessibilité, responsive, sans JS, site généré, CMS
npm run comparer-reference  # fidélité au design de référence (71cfb9d), 320 à 1440 px, clair et sombre
```

Le design de 71cfb9d est la référence visuelle : la refonte est architecturale,
pas graphique. Le contenu s'édite avec le CMS Git à `/admin/`
([Docs/CMS.md](Docs/CMS.md)) ; l'ancien back-office (`Gabarit_Bo`) est en
sommeil ([Docs/ADMIN_EN_SOMMEIL.md](Docs/ADMIN_EN_SOMMEIL.md)).

Le site publié est statique : pages générées en français (`/`) et en
anglais (`/en/`). Un texte sans traduction anglaise s'affiche en
français, balisé comme tel, et figure dans le rapport du build ; aucune
traduction n'est inventée.

Contenu et projets : [liste des contenus](Docs/CONTENT_CHECKLIST.md).
Déploiement : [état](Docs/DEPLOY_ETAT.md) et [Vercel](Docs/DEPLOY_VERCEL.md).

## Conventions

Les règles de contribution et d'accessibilité propres à ce portfolio sont dans [AGENTS.md](AGENTS.md).
