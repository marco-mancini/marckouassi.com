# marckouassi.com

Portfolio personnel de Marc Kouassi, directeur artistique, et son
back-office (`/admin/`).

## Structure

```text
content/              Contenu du site (site, sections, projets, cv), FR et EN
Design_System/        Fondations, composants, gabarits, dictionnaires, ressources
Frontend/site.js      Comportements des pages publiques
Admin/                Back-office : application et services (Supabase, démonstration)
supabase/             Schéma, règles d'accès et Edge Function « publier »
tools/                Build : validation, médias (Sharp), pages, back-office
tests/                Tests (npm test) et tests navigateur (npm run test:navigateur)
Public/images/        Visuels des projets
Deploy/               Publication et mise en service du back-office
Docs/                 Documentation éditoriale
.github/workflows/    Flux de publication (GitHub Pages, Cloudflare Pages)
```

## Commandes

```sh
npm ci
npm test                 # rendu, langues, résistance, rien en dur, back-office, Edge Function
npm run build            # génère _site/ (pages FR et EN, médias optimisés, sitemap)
npm run test:navigateur  # Chromium : accessibilité, responsive, sans JS, back-office
```

Le site publié est statique : pages générées en français (`/`) et en
anglais (`/en/`). Un texte sans traduction anglaise s'affiche en
français, balisé comme tel, et figure dans le rapport du build ; aucune
traduction n'est inventée.

Contenu et projets : [liste des contenus](Docs/CONTENT_CHECKLIST.md).
Mise en service du back-office : [Deploy/README.md](Deploy/README.md).

## Conventions

Les règles de contribution et d'accessibilité propres à ce portfolio sont dans [AGENTS.md](AGENTS.md).
