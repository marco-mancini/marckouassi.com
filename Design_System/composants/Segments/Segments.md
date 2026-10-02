# Segments

**Responsabilité** : choisir entre quelques options, dont une seule est active.

Sert au sélecteur de langue public (FR/EN), au choix de langue de l'accueil, à la langue d'édition du back-office et à la taille de l'aperçu.

## Props (4)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `options` | `[{libelle, href?, valeur?, actif?, lang?, nom?}]` | — | `nom` : intitulé complet lu par les lecteurs d'écran (« English » pour « EN »). |
| `etiquette` | chaîne | — | Nom accessible du groupe (dictionnaire). |
| `mode` | `liens` \| `boutons` | `liens` | Navigation, ou bascule d'interface. |
| `cle` | chaîne \| `null` | `null` | Identifiant transmis aux écouteurs. |

## Accessibilité

| Mode | Sémantique |
|---|---|
| `liens` | `<nav>`, `aria-current="true"` sur la langue affichée, `hreflang` et `lang` sur chaque lien |
| `boutons` | `role="group"`, `aria-pressed` |

Chaque option reçoit le clic sur au moins 44 × 44 px (`--cible-tactile`). Elle est dessinée moins haute (`--segments-option-retrait`) pour tenir dans la pilule ; un pseudo-élément transparent rend à sa zone cliquable toute la hauteur de la cible, sans changer le dessin. Test : « sélecteur de langue : chaque option reçoit le clic sur 44 × 44 px » (`tests/navigateur/site.test.mjs`).

## Règle FR/EN

Le sélecteur de langue public est **toujours** en mode liens vers `/` et `/en/`. Il n'y a jamais de bascule JavaScript sur une même page.
