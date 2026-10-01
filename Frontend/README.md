# Script du site public

Les pages ne sont plus écrites à la main : `npm run build` les génère
à partir de `content/` avec les gabarits du Design System (voir
`Deploy/README.md`).

`site.js` est le seul script des pages publiques. Il branche les
comportements sur le HTML déjà rendu (modales, en-tête, section
courante, études de projet, apparitions, accueil animé), puis pose
`html.js-anime`. S'il ne se charge pas ou échoue, tout le contenu reste
visible et utilisable : c'est vérifié par `npm run test:navigateur`.
