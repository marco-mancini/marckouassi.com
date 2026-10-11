# Volets

**Responsabilité** : présenter des éléments titrés dont un seul est ouvert à la fois. Il sert aux offres de la section Prestations. Décision de Marc : #199.

## Props (4)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `elements` | `[{id, titre, contenu}]` | — | `titre` et `contenu` viennent du gabarit, donc du contenu. |
| `etiquette` | chaîne | — | Nom accessible de l'ensemble, depuis le dictionnaire. |
| `id` | chaîne | `"volets"` | Préfixe des identifiants (onglets et volets). |
| `ouvert` | nombre | `0` | Rang ouvert au départ. |

## Dispositions

- **Une colonne** (téléphone, jusqu'à 850 px) : accordéon. Chaque titre ouvre son volet juste dessous. Un second clic referme le volet ouvert.
- **Deux colonnes** (dès 851 px) : les titres forment une liste à gauche, et le volet ouvert s'affiche à droite, collant. Il y a toujours un volet ouvert. Le survol d'un titre l'ouvre si le pointeur sait survoler.
- C'est la feuille qui décide de la disposition. Le script la lit (nombre de colonnes de la grille) et n'écrit aucun seuil.

## Comportement : `activerVolets(racine)`

Il pose `.est-actif`, ouvre le volet de départ et branche le clic, le survol et les flèches ↑ et ↓ (qui ouvrent aussi le volet en deux colonnes).

## Accessibilité

- Chaque titre est un `<button>` dans un `<h3>`, avec `aria-expanded` et `aria-controls`. Chaque volet est une `region` nommée par son titre.
- **Sans JavaScript**, tous les volets sont ouverts, empilés, et le contenu reste complet.
- Le rang et le signe sont `aria-hidden`.
- Cible tactile : chaque titre fait au moins `--cible-tactile` de haut.
- Mouvement réduit : l'apparition du volet et le filet sont figés par `Motion.css`.

## Dépendances

`rendu.js`. Il emprunte des jetons à `Rideau` (`--rideau-sortie`, `--rideau-fleche-rotation`, `--rideau-fleche-interligne`) pour garder le même geste d'ouverture.
