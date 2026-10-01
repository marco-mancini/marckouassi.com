# Message

**Responsabilité** : tout retour d'interface, sous forme d'encart dans la page ou de toast. Couvre les états « chargement », « vide », « erreur » et « succès » : il n'existe **pas** de composant « État » séparé.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `type` | `info` \| `succes` \| `erreur` \| `attention` \| `chargement` \| `vide` | `info` | Nature. |
| `titre` | chaîne \| `null` | `null` | Depuis le dictionnaire. |
| `texte` | chaîne | — | Depuis le dictionnaire, ou calculé (ex. « 3 champs à traduire »). |
| `action` | HTML | `null` | Bouton, par exemple « Ajouter un projet » pour un état vide. |
| `mode` | `encart` \| `toast` | `encart` | Affichage. |

## Accessibilité

| Type | Rôle ARIA |
|---|---|
| erreur | `role="alert"` (annonce immédiate) |
| succès, info, attention, chargement | `role="status"` (annonce polie) |
| chargement | `aria-busy="true"` en plus |
| vide | pas de rôle vivant : c'est un contenu |

- Les toasts s'affichent dans une zone `.messages` avec `aria-live="polite"`.
- Une erreur ne disparaît jamais d'elle-même.
- Le type est toujours dans le texte, jamais porté par la seule couleur.

## Dépendances

`rendu.js`.
