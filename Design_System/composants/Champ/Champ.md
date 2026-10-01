# Champ

**Responsabilité** : une étiquette et son contenu. En lecture, c'est une information ; en formulaire, un libellé relié à son contrôle, avec aide et erreur.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `etiquette` | chaîne | — | Du dictionnaire ou du contenu. |
| `contenu` | HTML | — | Valeur, ou contrôle `Saisie`. |
| `variante` | `simple` \| `fait` \| `meta` \| `formulaire` | `simple` | Présentation. |
| `id` | chaîne | `null` | Id du contrôle : `<label for>`, `id-aide`, `id-erreur`. |
| `messages` | `{aide?, erreur?}` | `{}` | Textes du dictionnaire. |

## États

- Erreur : la classe `champ--erreur` et le message `id-erreur`, que la `Saisie` référence par `aria-describedby`, avec `aria-invalid`.
- Aide : `id-aide`, également référencée.

## Accessibilité

- En formulaire, le libellé est un vrai `<label for>`.
- L'aide et l'erreur sont reliées au contrôle.

## Dépendances

`rendu.js`.
