# Signature

**Responsabilité** : titre en deux registres, une salutation cursive posée sur deux mots en capitales étroites.

## Props (4)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `niveau` | 1 \| 2 | 2 | Niveau réel du titre. |
| `echelle` | `couverture` \| `section` | `section` | Taille et chevauchement. |
| `textes` | `{salutation, accent, mot}` | — | Les trois registres, depuis le contenu. |
| `id` | chaîne | `null` | Cible d'`aria-labelledby`. |

## Usages

Couverture (h1), À propos, message de bienvenue de l'accueil, écran de connexion du back-office.

## Accessibilité

- Un seul titre, lu dans l'ordre : salutation, accent, mot.
- Le point est `aria-hidden`.

## Contraintes

- Conçu pour un fond sombre : ce sont les rôles `--texte` et `--point-titre` qui s'adaptent au contexte.

## Dépendances

`rendu.js`.
