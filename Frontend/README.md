# Interface du site

La page publiée se trouve dans `index.html`. Elle présente les travaux par catégories et ouvre chaque réalisation dans une présentation détaillée. Le script `script.js` gère les interactions et contient une liste unique des projets. Pour ajouter un projet, déposer ses visuels dans `Public/images/`, puis renseigner son entrée dans `PROJECTS` avec le chemin, le texte alternatif, les dimensions et les informations confirmées. Les contenus inconnus restent clairement provisoires.

Toutes les pages chargent une seule feuille CSS : `Design_System/styles/Index.css`. Elle importe les modules du système ; toutes les animations et transitions sont définies dans `Design_System/styles/Motion.css`.
