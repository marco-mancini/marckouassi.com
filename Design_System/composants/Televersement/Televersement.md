# Televersement

**Responsabilité** : l'action sur un fichier. Déposer, choisir, prévisualiser, suivre l'envoi, remplacer, signaler l'erreur ou le succès. `Media` reste responsable de l'affichage.

## Props (5)

| Prop | Type | Rôle |
|---|---|---|
| `id` | chaîne | Relie le libellé au champ fichier. |
| `accepte` | `image` \| `video` \| `document` | Types MIME acceptés. **Le SVG est exclu.** |
| `media` | objet média \| `null` | Aperçu du fichier actuel. |
| `etat` | `{progression, erreur, succes}` | État courant, calculé par le service des médias. |
| `libelles` | `{choisir, remplacer, deposer, aide, progression}` | Textes du dictionnaire. |

## Comportement

`activerTeleversement(racine, surFichier)` : choix au clic ou au clavier, dépôt par glisser.

## États

Survol, dépôt en cours (`est-survole`), envoi (`<progress>` et `aria-busy`), erreur, succès.

## Accessibilité

- Le champ fichier natif reste dans le document et au clavier ; le focus se voit sur la zone de dépôt.
- La progression a un nom accessible.
- L'erreur utilise `role="alert"` (Message) ; le succès, `role="status"`.

## Sécurité

La validation définitive (type, taille) est faite par le service `medias` et par les règles du stockage, jamais par la seule interface.
