# Script du site public

Les pages ne sont plus écrites à la main : `npm run build` les génère à partir
de `content/` avec les gabarits du Design System. Le build est décrit par
[`tools/`](../tools) et le déploiement par
[`Docs/DEPLOY_VERCEL.md`](../Docs/DEPLOY_VERCEL.md). *(`Deploy/README.md`, cité
ici auparavant, concerne la mise en service de l'ancien back-office endormi.)*

`site.js` est le seul script des pages publiques (avec `mesure.js`, qu'il importe). Il ne contient aucun texte et
aucune logique propre : chaque comportement vient du composant ou du gabarit
qui le porte. Il branche, dans cet ordre :

| Appel | Ce qu'il branche |
|---|---|
| `activerMesure` (`mesure.js`) | Google Analytics 4, depuis l'adresse publique seulement (D-38) |
| `activerModales` | dialogues natifs, verrou de défilement |
| `activerEnTete` | en-tête du site |
| `suivreSectionCourante` | section active dans la navigation |
| `activerProjets` | ouverture des études de projet |
| `activerNavigationCategories` | dépliage d'une catégorie de réalisations |
| `activerDecouverte` | parcours immersif de la section 06 |
| `activerApparitions` | apparitions au défilement |
| `activerAssistant` | MarcoS, s'il est actif |
| `activerMaintenance` | sceau de la page de maintenance |

Puis il pose `html.js-anime`, **en dernier** : tant que cette classe manque —
script absent, bloqué, ou en échec avant la fin — rien n'est masqué par une
animation. S'il ne se charge pas, le contenu reste visible et utilisable, et
c'est vérifié par `npm run test:navigateur`.
