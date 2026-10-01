# CadreAdmin

**Responsabilité** : la mise en page de tout écran du back-office. Elle comprend la barre haute, la navigation latérale, le contenu, la zone de publication et la zone des messages.

Ce n'est pas un écran : un écran est un assemblage placé **dans** le CadreAdmin.

## Props (5)

| Prop | Type | Rôle |
|---|---|---|
| `entete` | HTML | `EnTete` en variante `admin`. |
| `navigation` | HTML | `Navigation` verticale. |
| `contenu` | HTML | L'écran. |
| `barre` | HTML | Zone de publication : statut (`Pastille`) et actions (`Bouton`). Il n'y a pas de composant « BarrePublication ». |
| `surcouches` | HTML | Modales de l'écran : menu, aperçu, confirmation. |

## Adaptation aux écrans

Sous 850 px, la navigation latérale est masquée. L'en-tête ouvre alors la même `Navigation` dans une `Modale` plein écran, **exactement le mécanisme du menu mobile public** : la logique n'est pas dupliquée.

## Accessibilité

- `<main id="contenu">` est la cible du lien d'évitement.
- La zone des messages est une région vivante (`aria-live="polite"`).
- La barre de publication reste visible en bas de l'écran (`sticky`).
