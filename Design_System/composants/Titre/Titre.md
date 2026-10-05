# Titre

**Responsabilité** : tout titre de planche ou d'écran, avec son point doré et, en option, le sceau aligné à l'opposé.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `niveau` | 1 \| 2 \| 3 | 2 | Niveau réel du titre dans la page. |
| `echelle` | `section` \| `compacte` \| `appel` \| `affiche` \| `etude` \| `document` \| `interface` | `section` | Taille et traitement. |
| `texte` | chaîne \| HTML | — | Texte du contenu. Un saut de ligne devient `<br>`. |
| `id` | chaîne | `null` | Cible d'`aria-labelledby` (voir `idTitre` dans Planche). |
| `sceau` | `false` \| `moyen` \| `petit` | `false` | Sceau à droite, masqué sous 850 px. |

## Variantes

- `affiche` : doré et centré, contour crème, esperluette évidée.
- `interface` : pour le back-office, sans point.

## Accessibilité

- Le point est `aria-hidden` : il ferme le titre visuellement sans s'ajouter à ce qui est lu.
- Le sceau est décoratif.

## Contraintes

- Aucun texte en dur.
- La couleur passe par `--texte-titre`, le point par `--point-titre`.

## Dépendances

`rendu.js`, `Sceau`.
