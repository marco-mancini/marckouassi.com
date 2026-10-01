# Galerie

**Responsabilité** : disposer une série de médias, le premier mis en avant.

## Props (4)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `medias` | objet média[] | `[]` | L'ordre des données est l'ordre d'affichage. |
| `variante` | `apercu` \| `detail` \| `bande` | `apercu` | Disposition. |
| `etiquette` | chaîne \| `null` | `null` | Nom du groupe (`role="group"`). |
| `superposition` | HTML | `null` | Action posée sur la galerie, par exemple le bouton d'ouverture. |

## Règles calculées

- `apercu` montre au plus 6 médias et s'adapte au nombre réel (`data-nombre`, de 1 à 6).
- Le premier média est toujours mis en avant.

## Accessibilité

Chaque image garde son propre texte alternatif. La galerie n'ajoute aucun texte.

## Dépendances

`Media`.
