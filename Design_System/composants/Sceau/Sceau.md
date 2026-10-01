# Sceau

**Responsabilité** : afficher le monogramme MK sur son rond crème, en décoration, en image nommée ou en lien.

## Props (4)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `taille` | `couverture` \| `grand` \| `moyen` \| `petit` | `moyen` | Taille, par jeton `--sceau-*`. |
| `lien` | URL \| `null` | `null` | Rend un `<a>`. |
| `libelle` | chaîne \| `null` | `null` | Nom accessible (du dictionnaire). Sans lui, le sceau est `aria-hidden`. |
| `anime` | booléen | `false` | Ouverture animée de l'expérience d'accueil. |

## États

- Survol : légère rotation, pour la taille `couverture` et pour le sceau en lien.
- Focus clavier : visible sur le lien.
- Animation désactivée par la réduction des animations.

## Accessibilité

- Décoratif par défaut.
- En lien : le lien porte le nom accessible et le SVG est masqué des lecteurs d'écran.

## Contraintes

- Le symbole `#logo-mk-seal` vient du sprite unique `assets/logos-sprite.svg`, inséré une seule fois par page par le gabarit de page.
- Les couleurs des lettres ne suivent jamais le thème.

## Dépendances

`fondations/rendu.js`.
