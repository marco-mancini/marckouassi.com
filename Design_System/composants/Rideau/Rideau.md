# Rideau

**Responsabilité** : une carte d'entrée animée, toujours un lien. Elle porte un libellé, une note, le rang en filigrane et un signe d'ouverture. Elle sert aux huit choix de catégorie de « Mes réalisations ». Décision de Marc : #191, maquette validée le 11 octobre 2026.

Ce n'est pas une variante de `Carte`. `Carte` est un jalon calme, dont les animations s'arrêtent après `--cycles-decoratifs`. `Rideau` doit au contraire montrer sans cesse qu'elle s'ouvre, y compris sur téléphone, où il n'y a pas de survol.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `rang` | chaîne | — | **Calculé** par le gabarit (`"01"`…). Il est affiché en filigrane et n'est pas lu. |
| `libelle` | chaîne | — | Depuis le contenu. C'est le nom accessible du lien, avec la note. |
| `note` | chaîne \| `null` | `null` | Phrase courte, depuis le contenu. |
| `href` | chaîne | — | Cible du lien (ancre de la catégorie). |
| `indice` | nombre | `0` | Rang d'apparition. Il décale aussi la vague du reflet et de l'onde. |

## Comportement : `activerRideaux(racine, { reduit })`

À appeler dans le navigateur, une fois. Les cartes d'un même parent forment un groupe.

- **Vedette** : toutes les `--rideau-vedette-pas`, une carte du groupe reçoit `.est-vedette`. Elle prend alors exactement l'état du survol : soulevée et remplie de crème. Le cycle démarre `--rideau-vedette-attente` après l'entrée du groupe à l'écran.
- La vedette **s'efface** dès qu'un pointeur, un doigt ou le focus clavier entre dans le groupe. Le cycle reprend ensuite.
- **Aucune vedette** si :
  - le groupe est hors de l'écran ou masqué (une catégorie est ouverte) ;
  - l'onglet est caché ;
  - le mouvement est réduit (`prefers-reduced-motion` ou `html[data-animations="reduites"]`, relus à chaque pas).
- Les durées sont lues dans les jetons. Un jeton absent lève une erreur explicite.

## États

| État | Effet |
|---|---|
| Repos | Surface `--carte-surface` (creusée par `.ilot-olive`), libellé papier, note `--accent-gold-soft`, rang en creux or. |
| Entrée | Apparition `rideau` (ouverture par le haut), décalée par rang. Le rang monte ensuite. |
| Continu | Le reflet traverse la carte, en vague d'une carte à l'autre. Le signe d'ouverture pousse vers l'extérieur avec une onde or. |
| Survol, focus, vedette | Crème `--rideau-creme`, encre `--rideau-encre`, soulèvement et ombre, signe tourné et plein. |
| Appui | Léger enfoncement (`--rideau-presse`). |
| Mouvement réduit | Tout est figé par `Motion.css`. La carte reste lisible et cliquable, et aucune vedette n'est désignée. |

## Accessibilité

- Lien natif. Le rang et le signe d'ouverture sont `aria-hidden`.
- Cible tactile : la carte entière, dont la hauteur minimale dépasse 44 px.
- Focus visible : le même retour que le survol, plus l'anneau du thème.
- **Visible sans JavaScript** : l'entrée ne masque rien tant que `html.js-anime` est absent. Sans script, il n'y a pas de vedette.
- Le mouvement continu respecte les deux réductions des animations. Le réglage visiteur du site sert de moyen de l'arrêter.

## Dépendances

`rendu.js`. L'entrée passe par `Apparition` (direction `rideau`). Les mouvements (`reflet-balayage`, `chevron-ouverture`, `rideau-monte`, `rideau-onde`) vivent dans `Motion.css`.
