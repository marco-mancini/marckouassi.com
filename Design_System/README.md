# Design System

Le système visuel centralise les règles et composants réutilisables.

```text
Design_System/
├── animations/   Animations et réductions de mouvement
├── assets/       Ressources visuelles partagées
├── components/   Composants React (.tsx) et styles associés (.css)
├── hooks/        Hooks React partagés
├── providers/    Contextes et providers React
└── styles/       CSS global, responsive, typographie, icônes et tokens
```

Le portfolio publié aujourd’hui reste une page HTML/CSS/JS statique. Le workflow copie le dossier complet du Design System dans l’artefact GitHub Pages, et la page charge les styles globaux depuis `styles/`. Les composants, hooks et providers React sont des fondations pour une évolution future ; ils ne sont pas compilés ni requis pour servir le site actuel.

`Tailwind.css` est une couche légère d’utilitaires inspirés de Tailwind, sans dépendance ni compilation Tailwind.
