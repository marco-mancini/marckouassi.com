# Contenus du portfolio

Les principaux projets présentés sur le site s’appuient sur les visuels et les indications transmis par Marc. Les récits mettent en avant le contexte, l’intention créative, la direction artistique et la valeur des supports, sans attribuer aux campagnes de résultats non documentés.

## Projets et périodes

- FIFA 26 — campagne publicitaire pour Orange Sénégal, sponsor de la Coupe du monde 2026 ; année : 2026.
- World Cola — campagne Ramadan pour SOBEBRA au Bénin ; période estimée : 2024.
- La Béninoise — campagne de marque ; période estimée : 2023.
- ANACADI — campagne pour la Journée d’excellence de la Région du Gbêkê ; période estimée : 2024.
- CEELI Group — identité et charte graphique complète, projet distinct d’ANACADI ; période estimée : 2023.
- VELANOVA — identité pour le lancement d’un projet d’équipements sportifs ; février 2025.
- AUREX, FEROV, VOON et TP Solutions — périodes estimées à partir du parcours professionnel de Marc.
- CI20 Connect — expérience UX/UI ; période estimée : 2025–2026.

## Informations personnelles

- La biographie est éditoriale et porte sur la curiosité créative de Marc ; elle ne remplace pas les dates et postes détaillés dans le CV.
- L’expertise UX/UI et l’usage créatif de l’intelligence artificielle figurent dans des rubriques dédiées.
- Les coordonnées et liens de contact doivent rester ceux confirmés par Marc.
- Le CV PDF est fourni dans `Design_System/assets/Cv_Marc.pdf`.

## Médias

- ANACADI et CEELI Group sont présentés comme deux projets distincts.
- La couverture affichée pour CEELI est un aperçu de la première page de la charte ; le document complet reste accessible en PDF.
- Les images sont locales dans `Public/images/` ; le build les optimise (WebP, 1600 px au plus). Les fichiers déposés depuis le back-office sont stockés chez Supabase puis publiés de la même façon.

## Où modifier le contenu

- Avant la mise en service du back-office : fichiers de `content/` (un texte = `{ "fr": …, "en": … }`).
- Ensuite : le back-office `/admin/`, qui enregistre le même contenu chez Supabase.
- Un champ sans version anglaise est signalé « À traduire » dans le back-office et dans le rapport du build.

## Points à confirmer

- Périodes : trois projets diffèrent entre cette liste et les données du site, reprises telles quelles de l’ancienne page. À trancher par Marc, sans rien modifier d’ici là :
  - World Cola : liste 2024, site 2024–2025 ;
  - La Béninoise : liste 2023, site 2024–2025 ;
  - ANACADI : liste 2024, site 2025.
