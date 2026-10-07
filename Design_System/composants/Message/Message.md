# Message

**Responsabilité** : tout retour d'interface, sous forme d'encart dans la page ou de toast. Couvre les états « chargement », « vide », « erreur » et « succès » : il n'existe **pas** de composant « État » séparé.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `type` | `info` \| `succes` \| `erreur` \| `attention` \| `chargement` \| `vide` | `info` | Nature. |
| `titre` | chaîne \| `null` | `null` | Depuis le dictionnaire. |
| `texte` | chaîne | — | Depuis le dictionnaire, ou calculé (ex. « 3 champs à traduire »). |
| `action` | HTML | `null` | Bouton, par exemple « Ajouter un projet » pour un état vide. |
| `mode` | `encart` \| `toast` \| objet | `encart` | Affichage. Objet `{ sceau, compact?, toast?, niveau?, nu? }` : **mode sceau**, ci-dessous. |

## Mode sceau — les états du site (#162, D-39)

Un seul gabarit pour tous les états, sans exception : le sceau animé (humeur `sceau`, voir `Sceau`), un **titre bicolore**, une phrase, ses actions. Mêmes tailles et même place partout (jetons `--message-sceau-*`, `--message-compact-*`). Posé sur l'îlot olive.

### `nu` — le même gabarit sans son îlot

`{ sceau: "chargement", nu: true }` retire le fond olive **et sa classe** : le sceau, le titre et la phrase se posent directement sur le fond qui les accueille, et comme `ilot-olive` n'est plus là, les couleurs ne sont pas redéfinies — le contenu lit celles du thème, clair comme sombre.

C'est ce dont MarcoS a besoin : son panneau est déjà une surface à lui, et un second fond plein à l'intérieur ferait une boîte dans une boîte.

Rien d'autre ne change : mêmes tailles, même animation, même titre bicolore. Le défaut reste l'îlot — aucun état existant du site n'est touché.

- **Titre bicolore** (`titreBicolore`) : la partie entre astérisques en or (`*Char*gement`), à défaut le premier mot ; le reste en crème ; un point doré (caché aux lecteurs d'écran). Le texte est échappé. `titreSimple` retire les marques (onglet, nom accessible).
- `compact` : en petit (conversation, média, bas d'écran) ; `toast` : filet et ombre pour se détacher d'une planche ; `niveau` : le titre devient un titre hN (page entière : 1).
- `.message__adresse` : une adresse à copier, sous les actions.
- Le sceau porte `data-sceau-auto` : `activerSceaux` (Sceau) le construit.

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

`rendu.js`, `Sceau` (mode sceau).
