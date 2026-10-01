# Bouton

**Responsabilité** : toute action du site et du back-office, qu'elle prenne la forme d'un `<button>` ou d'un lien `<a>`.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `texte` | chaîne | — | Libellé, depuis le dictionnaire ou le contenu. |
| `variante` | `principal` \| `contour` \| `filet` \| `texte` \| `lien` \| `nu` \| `surface` | `contour` | Apparence. `texte` : lien souligné dans le flux (« Le portfolio ↓ ») ; `lien` : souligné sur une ligne de 44 px (coordonnées et retour du CV) ; `nu` : sans soulignement, ligne de 44 px (liens de Contact). Pour ces trois variantes, la flèche suit le mot à une espace, comme dans le texte d'origine. |
| `forme` | `pilule` \| `rond` \| `libre` | `pilule` | Géométrie. |
| `href` | URL \| `null` | `null` | Présent : rend un lien. |
| `options` | objet | `{}` | `icone`, `iconeSeule`, `etat`, `taille`, `attributs`. |

## États

| État | Mise en œuvre |
|---|---|
| Survol | Couleur de fond ou d'encre |
| Focus | `:focus-visible` global |
| Désactivé | `disabled` pour un bouton, `aria-disabled` pour un lien |
| Chargement | `aria-busy="true"` et indicateur rotatif |
| Menu ouvert | `aria-expanded` croise les deux barres |

## Accessibilité

- Cible de 44 × 44 px minimum.
- Un bouton réduit à une icône porte son texte en `visually-hidden`.
- Les glyphes (↗ ↓ ← ×) sont toujours `aria-hidden` : le sens est dans le texte.
- Survol de `contour` et `filet` : `--bouton-survol` (olive par défaut) ; un contexte peut le redéfinir (barre du CV : `--hover-on-dark`).

## Contraintes

- Aucun libellé en dur.
- Les icônes sont un jeu de glyphes de présentation, pas du contenu.

## Dépendances

`rendu.js`.
