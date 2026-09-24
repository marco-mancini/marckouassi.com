# Système de design

Ce système centralise les règles visuelles et les éléments réutilisables.

```text
Design_System/
├── animations/   Documentation des animations centralisées dans Motion.css
├── assets/       Ressources visuelles partagées
├── components/   Composants React (.tsx) et styles associés (.css)
├── hooks/        Fonctions de cycle de vie et d’état React
├── providers/    Fournisseurs de contexte React
└── styles/       Styles CSS généraux, adaptatifs, typographiques et icônes
```

Le portfolio publié est une page statique en HTML, CSS et JavaScript. Le flux de publication copie le dossier complet du système de design dans l’artefact GitHub Pages, et la page charge les styles généraux depuis `styles/`. Les composants, fonctions de cycle de vie et fournisseurs React préparent une évolution future ; ils ne sont ni compilés ni nécessaires au site actuel.

`Tailwind.css` est une petite couche locale de classes utilitaires inspirées de Tailwind, sans dépendance ni compilation de Tailwind.

`Typography.css` est l'unique feuille qui définit la hiérarchie et les tailles de texte : titres, corps, navigation, légendes et variantes pour téléphone, tablette et ordinateur. `Index.css` reste le point d'entrée CSS unique du site.
