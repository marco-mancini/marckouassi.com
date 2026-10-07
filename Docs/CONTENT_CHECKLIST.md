# Contenus du portfolio

Les principaux projets présentés sur le site s’appuient sur les visuels et les indications transmis par Marc. Les récits mettent en avant le contexte, l’intention créative, la direction artistique et la valeur des supports, sans attribuer aux campagnes de résultats non documentés.

## Projets et périodes

**Confirmées par Marc le 7 octobre 2026** (PM-029, [#29](https://github.com/marco-mancini/marckouassi.com/issues/29)) : « On utilise les dates du site, elles sont correctes. » Plus aucune période n'est estimée.

La source est `content/projets.json`, champ `annees` de chaque projet. Cette liste en est le reflet, pas une seconde source : en cas d'écart, c'est le contenu qui fait foi.

| Projet | Période | Nature |
|---|---|---|
| Orange Sénégal · FIFA 26 | 2026 | campagne publicitaire, sponsor de la Coupe du monde 2026 |
| World Cola · Ramadan | 2024–2025 | campagne Ramadan pour SOBEBRA au Bénin |
| La Béninoise | 2024–2025 | campagne de marque |
| ANACADI | 2025 | campagne pour la Journée d'excellence de la Région du Gbêkê |
| CEELI Group | 2023 | identité et charte graphique complète, projet distinct d'ANACADI |
| VELANOVA | 2025 | identité pour le lancement d'un projet d'équipements sportifs |
| AUREX | 2023 | identité |
| FEROV | 2023 | identité |
| VOON | 2022 | identité |
| TP Solutions | 2023 | identité |
| CI20 Connect | 2025–2026 | expérience UX/UI |

> **D'où venaient les contradictions.** Trois projets différaient entre cette
> liste et les données du site : World Cola, La Béninoise et ANACADI. L'arbitrage
> du 7 octobre tranche que **c'était cette liste éditoriale qui se trompait**,
> pas le contenu. Les onze périodes de `content/projets.json` sont confirmées
> telles quelles, et **aucune n'a été modifiée**.

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

Aucun. Le dernier — les périodes des projets — a été tranché par Marc le
7 octobre 2026 (PM-029), en faveur des données du site.
