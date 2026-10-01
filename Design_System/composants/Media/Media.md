# Media

**Responsabilité** : afficher une image ou une vidéo, avec ses dimensions réelles et son texte alternatif issus des données. Tient sa place même si le fichier manque.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `media` | `{type, src, largeur, hauteur, alt, poster, lang, pistes, mime}` | `{}` | L'objet de données, identique à l'enregistrement du back-office. |
| `ajustement` | `recadrer` \| `contenir` | `recadrer` | `object-fit`. |
| `cadre` | `aucun` \| `arrondi` \| `vignette` \| `detail` \| `passe-partout` | `aucun` | Rayon et bordure. |
| `zoom` | booléen | `false` | Agrandissement au survol. |
| `priorite` | booléen | `false` | Chargement immédiat (image visible au premier écran). |

## États

| État | Comportement |
|---|---|
| Absent | Emplacement conservé, fond neutre, décrit par `aria-label` si un texte existe. |
| En échec | Fond neutre visible, texte alternatif affiché par le navigateur. |
| Chargement | `loading="lazy"` sauf priorité ; `width` et `height` réservent la place. |

## Accessibilité

- `alt` obligatoire côté données ; `alt=""` seulement pour une image décorative.
- `lang` sur le texte alternatif quand il est affiché en langue de repli.
- Vidéo : `controls`, jamais de lecture automatique, sous-titres par `pistes`.

## Dépendances

`rendu.js`.
