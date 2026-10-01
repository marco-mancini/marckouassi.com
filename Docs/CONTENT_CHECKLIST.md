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
- Le CV PDF a été retiré du site le 1er octobre 2026 (données privées, ancienne adresse e-mail) ; Marc le refera. Pour le republier : ajouter le fichier, puis déclarer `site.contact.cv` (`src`, `nomTelechargement`) dans `content/site.json`.

## Médias

- ANACADI et CEELI Group sont présentés comme deux projets distincts.
- La couverture affichée pour CEELI est un aperçu de la première page de la charte. Aucun PDF de la charte n'est publié : le dépôt n'en contient pas et le projet n'a pas de champ `document`. Pour en joindre un : champ « document » du projet dans le CMS.
- Les images sont locales dans `Public/images/` ; le build les optimise (WebP, 1600 px au plus). Les fichiers déposés depuis le CMS sont commités dans `Public/images/` puis publiés de la même façon.

## Où modifier le contenu

- `content/` est la seule source du contenu (un texte = `{ "fr": …, "en": … }`).
- On le modifie depuis le CMS Git (Sveltia) à `/admin/`, qui commite dans `content/` ; Vercel reconstruit alors le site. Voir [CMS.md](CMS.md).
- L'ancien back-office Supabase est en sommeil : il n'enregistre ni ne publie rien. Voir [ADMIN_EN_SOMMEIL.md](ADMIN_EN_SOMMEIL.md).
- Un champ sans version anglaise est compté « à traduire » dans le rapport du build ; le CMS n'affiche pas cet état.

## Points à confirmer

- Périodes : trois projets diffèrent entre cette liste et les données du site, reprises telles quelles de l’ancienne page. À trancher par Marc, sans rien modifier d’ici là (PM-029, #29) :
  - World Cola : liste 2024, site 2024–2025 ;
  - La Béninoise : liste 2023, site 2024–2025 ;
  - ANACADI : liste 2024, site 2025.
