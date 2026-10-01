# Navigation

**Responsabilité** : une liste de liens de navigation, présentée en ligne ou empilée. Les liens proviennent d'une seule source de données : ils ne sont jamais écrits deux fois.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `liens` | `[{libelle, href, numero?, actif?, lang?}]` | — | Issus des sections ; `numero` est calculé. |
| `orientation` | `horizontale` \| `verticale` | `horizontale` | |
| `echelle` | `normale` \| `affichage` | `normale` | `affichage` : menu mobile en grandes capitales. |
| `etiquette` | chaîne | — | Nom accessible (dictionnaire). |
| `fermeModale` | booléen | `false` | Un clic ferme la modale qui contient la navigation. |

## Comportement

`suivreSectionCourante(racine)` pose `aria-current="location"` sur le lien de la section visible, dans toutes les navigations à la fois.

## Accessibilité

- `<nav aria-label>`.
- L'état courant passe par `aria-current` (`page` ou `location`), jamais par une simple classe.
- Le numéro est `aria-hidden` : c'est une décoration, le libellé suffit.
- Chaque lien fait au moins 44 px de haut.

## Usages

En-tête du site, menu mobile (dans une Modale plein écran), barre latérale du back-office.
