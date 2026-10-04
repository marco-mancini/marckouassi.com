# Système de design

Tout ce qui produit l'apparence du site et du back-office, sans
framework ni étape de compilation : HTML, CSS et JavaScript (modules).

```text
Design_System/
├── fondations/   jetons (Tokens.css), thème, typographie, mouvement, responsive,
│                 moteur de rendu (rendu.js : gabarit html qui échappe tout)
├── composants/   26 composants : Nom.css + Nom.js (rendu pur) + Nom.md (contrat)
├── gabarits/     assemblages : sections du site, pages, projet, Intro ;
│                 Gabarit_Bo (coquille unique du back-office) et écrans Admin
│                 + données partagées (donnees.js, pages.js, outils.js)
├── i18n/         dictionnaires d'interface (fr, en ; admin.fr, admin.en) et langue.js
├── styles/       Index.css, point d'entrée CSS unique
└── assets/       polices locales, sprite des logos, sceau, CV PDF
```

Règles essentielles (détail dans `composants/README.md` et `AGENTS.md`) :

- **Rien en dur** : les textes viennent de `content/` (contenu) ou de `i18n/`
  (interface). Les tests `tests/riendur.test.mjs` et `tests/composants.test.mjs`
  le vérifient sur les sources et sur les pages rendues.
- **Couleurs** : valeurs brutes uniquement dans `fondations/Tokens.css`.
- **Points de rupture** : documentés dans `Tokens.css` (`--bp-*`) ;
  `Responsive.css` ne redéfinit que des jetons.
- **Réduction des animations** : chaque feuille animée porte sa propre
  adaptation ; `Motion.css` neutralise durées et délais.
- **Même rendu partout** : les fonctions des composants et gabarits
  tournent dans le build (pages statiques) et dans le navigateur (aperçu
  du back-office).
