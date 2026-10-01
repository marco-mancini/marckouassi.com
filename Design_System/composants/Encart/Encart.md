# Encart

**Responsabilité** : une boîte titrée, composée d'un en-tête, d'un corps et d'un pied optionnel.

Sert aussi de section de formulaire dans le back-office.

Une prestation n'est **pas** un composant : c'est un Encart `or` ou `clair` (alternance calculée d'après le rang) qui contient une liste à puces, avec une Pastille `bloc` en pied.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `titre` | chaîne | — | Depuis le contenu ou le dictionnaire. |
| `contenu` | HTML | — | Corps. |
| `pied` | HTML | `null` | Pied optionnel, qui chevauche le bas pour `or` et `clair`. |
| `ton` | `or` \| `clair` \| `contour` \| `bandeau` | `contour` | Présentation. |
| `niveau` | 2 \| 3 \| 4 | 3 | Niveau réel du titre. |

## Accessibilité

- `<section>` introduite par un vrai titre.
- Le contraste de l'encre sur les aplats est de 7,69:1 (or) et 13,23:1 (clair).

## Dépendances

`rendu.js`.
