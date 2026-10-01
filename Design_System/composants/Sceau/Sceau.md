# Sceau

**Responsabilité** : afficher le monogramme MK sur son rond crème, en décoration, en image nommée ou en lien.

## Props (4)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `taille` | `couverture` \| `grand` \| `moyen` \| `petit` \| `document` | `moyen` | Taille, par jeton `--sceau-*` ; `document` : en-tête du CV. |
| `lien` | URL \| `null` | `null` | Rend un `<a>`. |
| `libelle` | chaîne \| `null` | `null` | Nom accessible (du dictionnaire). Sans lui, le sceau est `aria-hidden`. |
| `anime` | booléen | `false` | Expérience d'accueil : le sceau apparaît, son contour et son monogramme se tracent (`--duration-trace`), puis se remplissent. Hors animation, l'épaisseur du tracé vaut 0 : les autres sceaux sont inchangés. Mouvement réduit : pas de tracé. |

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
