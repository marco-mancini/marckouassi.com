# Carte

**Responsabilité** : un jalon numéroté (point, libellé, note optionnelle, rang en filigrane). Utilisé pour les temps de la méthode, les domaines de savoir-faire et les tuiles du tableau de bord du back-office.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `rang` | chaîne | — | **Calculé** par le gabarit (indice + 1, sur deux chiffres). |
| `libelle` | chaîne | — | Depuis le contenu. |
| `note` | chaîne \| `null` | `null` | Phrase d'explication, optionnelle. |
| `balise` | `article` \| `li` \| `div` | `article` | Balise racine. |
| `options` | objet | `{}` | `baliseLibelle`, `href`, `liee`, `indice`. |

## Contexte

Posée dans un `.ilot-olive`, la carte prend automatiquement la surface creusée. Il n'y a pas de variante « sur olive ».

## États

- Survol : soulèvement.
- Focus (carte en lien) : même retour que le survol.
- Apparition : décalée d'après l'indice.
- Animations décoratives : limitées à `--cycles-decoratifs`, désactivées par la réduction des animations.

## Accessibilité

- Le rang en filigrane est un pseudo-élément : il n'est pas lu.
- Le point et le reflet sont `aria-hidden`.
- **La carte est visible sans JavaScript** : aucun masquage si `html.js-anime` est absent.

## Dépendances

`rendu.js`. Son apparition est gérée par `Apparition`.
