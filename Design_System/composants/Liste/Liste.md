# Liste

**Responsabilité** : des lignes avec leurs actions, réordonnables en option. Projets, médias, étapes du parcours, cartes, prestations, historique.

## Props (5)

| Prop | Type | Rôle |
|---|---|---|
| `elements` | `[{id, nom, contenu, actions?}]` | `nom` sert aux libellés accessibles. |
| `etiquette` | chaîne | Nom de la liste (dictionnaire). |
| `ordonnable` | booléen | Active le glisser-déposer et les boutons Monter et Descendre. |
| `libelles` | `{monter, descendre, supprimer, annonce}` | Modèles du dictionnaire, avec `{nom}`, `{position}`, `{total}`. |
| `vide` | HTML | Un `Message` de type `vide`, affiché quand la liste est vide. |

## Comportement

`activerListe(liste, { surReordonner, surSupprimer })`.

## États

| État | Mise en œuvre |
|---|---|
| Vide | Message passé en `vide` |
| Survol | Bordure plus marquée |
| Glissement | `est-glisse` : bordure pointillée, opacité réduite |
| Premier ou dernier élément | Monter ou Descendre désactivé |

## Accessibilité

- **Le glisser n'est jamais le seul moyen** (critère 2.5.7) : chaque ligne a des boutons Monter et Descendre, nommés d'après l'élément.
- Chaque déplacement est annoncé dans une région vivante (« FIFA 26 : position 2 sur 11 »).
- Après un déplacement, le focus reste sur le bouton utilisé, ou passe à son voisin s'il vient d'être désactivé.
