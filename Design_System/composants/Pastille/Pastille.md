# Pastille

**Responsabilité** : une information courte. Période du parcours, numéro de projet, référence du CV, prix d'une prestation, statut dans le back-office.

## Props (4)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `texte` | chaîne | — | Valeur, depuis le contenu ou calculée (numéro). |
| `variante` | `plein` \| `contour` \| `or` \| `clair` \| `attention` | `plein` | Apparence. |
| `forme` | `pilule` \| `rond` \| `bloc` | `pilule` | Géométrie. |
| `etiquette` | chaîne \| `null` | `null` | Préfixe lu par les lecteurs d'écran (ex. « Statut »). |

## Correspondance des statuts du back-office

| Statut | Variante |
|---|---|
| publié | `plein` |
| brouillon | `contour` |
| modifié | `or` |
| à traduire | `attention` |

Les libellés des statuts viennent du dictionnaire.

## Accessibilité

- Le statut n'est jamais porté par la seule couleur : le texte est toujours présent.
- L'étiquette optionnelle précise le sens à la lecture.

## Dépendances

`rendu.js`.
