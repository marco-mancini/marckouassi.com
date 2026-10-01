# Saisie

**Responsabilité** : le contrôle de formulaire. Un seul composant pour le texte court, le texte long, le nombre, le courriel, l'adresse, le mot de passe, le code, le choix dans une liste et la case à cocher.

Toujours posée dans un `Champ` (variante `formulaire`), qui porte le libellé, l'aide et l'erreur.

## Props (4)

| Prop | Type | Rôle |
|---|---|---|
| `id` | chaîne | Relie la saisie au `<label for>` du Champ, et à `id-aide` / `id-erreur`. |
| `type` | `texte` \| `long` \| `nombre` \| `courriel` \| `url` \| `motdepasse` \| `code` \| `choix` \| `case` | Nature du contrôle. |
| `valeur` | quelconque | Valeur courante. |
| `options` | `{nom, choix, requis, desactive, lang, lignes, etat, complement}` | Réglages. |

## États

| État | Mise en œuvre |
|---|---|
| Focus | Anneau global et bordure accentuée |
| Invalide | `aria-invalid="true"`, bordure d'erreur, message relié par `aria-describedby` |
| Désactivé | `disabled` |
| Requis | `required` et `aria-required` |

## Texte enrichi

Le type `long` accepte la seule syntaxe du contenu : `**fragment**` pour un accent, un saut de ligne pour un retour à la ligne. Aucun éditeur riche, aucune dépendance.

## FR/EN

Un champ anglais porte `lang="en"` pour la correction orthographique et les lecteurs d'écran.
