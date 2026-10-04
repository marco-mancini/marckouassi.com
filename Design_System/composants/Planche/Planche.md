# Planche

**Responsabilité** : cadre éditorial autonome d'une section. Porte le fond (crème ou olive), la ligne de crédit et l'ancre de navigation.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `ton` | `"creme"` \| `"olive"` | `"creme"` | Fond. `olive` pose le contexte `.ilot-olive`. |
| `credit` | `{rubrique, mention?, signature?}` \| `null` | `null` | Ligne de crédit. Sans `mention`, deux colonnes. |
| `id` | chaîne | `null` | Ancre. Le titre de la planche doit porter `idTitre(id)`. |
| `classe` | chaîne | `""` | Crochet de composition pour le gabarit (disposition uniquement). |
| `contenu` | HTML | — | Contenu déjà rendu. |

## Données

Aucun texte en dur : `rubrique`, `mention` et `signature` viennent du contenu de la section.

## Variantes et états

- `creme` / `olive`.
- Apparition douce au défilement (`data-apparition="douce"`), sans effet si JavaScript est absent.

## Accessibilité

- `<section aria-labelledby>` pointe vers le titre de la planche.
- L'ancre ne compense rien elle-même : `scroll-padding-top` sur `html` vaut
  `--header-height + --ancre-degagement`, et c'est le seul mécanisme. Un
  `scroll-margin-top` ici s'ajouterait à lui (PM-018).

## Contraintes

- Ne connaît aucune page.
- Les couleurs passent par les rôles `--fond`, `--texte`, `--filet`, `--texte-discret`.
- La bordure utilise `--planche-bordure` (calculée à la racine) pour être identique sur les deux fonds.

## Dépendances

`fondations/rendu.js`.

## Exemple

```js
Planche({ ton: "olive", id: "apropos", credit: { rubrique: "02 / À propos", signature: "Portrait" }, contenu })
```
