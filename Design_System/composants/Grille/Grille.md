# Grille

**Responsabilité** : disposer des éléments en colonnes, en nombre fixe par largeur ou avec une largeur minimale de colonne.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `elements` | HTML[] | — | Les cellules. |
| `colonnes` | `[large, compact, téléphone]` | `[1,1,1]` | Nombre de colonnes aux seuils de 850 et 390 px. |
| `min` | jeton \| `null` | `null` | Largeur minimale : bascule en mode *auto-fit*. |
| `espace` | `[espace, espace compact]` | `[var(--space-5)]` | Valeurs de jetons. |
| `conteneur` | `{balise, etiquette, alignement}` | `{}` | `ul` ou `ol` pour une liste, `aria-label` éventuel. |

## Contraintes

- Aucune valeur de design brute : `espace` et `min` sont des références à des jetons (`var(--…)`).
- La grille ne connaît ni la page ni le contenu.

## Accessibilité

Avec `balise: "ol"` ou `"ul"`, les cellules doivent être des `<li>` : la Carte le permet avec `balise: "li"`.
