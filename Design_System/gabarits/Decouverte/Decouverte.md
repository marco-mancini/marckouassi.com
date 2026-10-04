# Parcours

**Responsabilité** : l'expérience immersive de la section 06, Prestations
(issues [#128](https://github.com/marco-mancini/marckouassi.com/issues/128) et
[#132](https://github.com/marco-mancini/marckouassi.com/issues/132)).

Ce n'est pas une page de services : c'est une narration. Question → quatre
cartes → révélations → intention → territoire → système → réalisations → trace.

## Props (5)

| Prop | Type | Rôle |
|---|---|---|
| `parcours` | objet | `sections.prestations.parcours` du contenu. Absent : rien n'est rendu. |
| `projets` | tableau | `contenu.projets`, les données existantes du portfolio. |
| `ctx` | contexte | `t` pour les libellés d'interface, `c` pour les textes de Marc. |
| `chemin` | chaîne | chemin du parcours dans les données, pour le report « à traduire ». |
| `ancreProjets` | chaîne | identifiant de la section des projets, **lu dans les données**. |

`idSection` complète l'ensemble pour lier le bouton d'ouverture à la région.

## Visibilité, et pourquoi elle est ainsi

Toute la narration est rendue dans le document, **visible par défaut**. Le
parcours n'est replié, et ses étapes mises en attente, que sous
`html.js-anime` — la classe que le script pose une fois initialisé. Sans
JavaScript, avec un script bloqué ou en échec, la narration se lit donc de bout
en bout, dans l'ordre, sans qu'aucun texte disparaisse.

C'est le principe d'`Apparition` et de `Motion.css`, appliqué à une séquence :
rien d'essentiel ne dépend de l'animation.

## Interaction

Chaque carte est un **bouton de divulgation** : `aria-expanded` sur le bouton,
`aria-controls` vers sa révélation. Le clavier l'ouvre comme la souris, et la
réaction au survol existe aussi au `:focus-visible` — aucune information ne
dépend du pointeur.

Les autres cartes restent utilisables après une sélection : on n'en ferme
aucune. La carte juste — « Être reconnue » — ouvre la suite du parcours, comme
le veut la progression validée.

Le verdict se distingue par **son texte** et par la couleur, jamais par la
couleur seule.

## Animations réduites

Le parcours garde exactement les mêmes étapes et le même contenu. Seules les
transitions tombent, ce dont `Motion.css` se charge déjà ; les révélations sont
alors immédiates.

## Contraintes

- aucun texte métier en dur : la narration vient de `content/sections.json`, les
  libellés d'interface du dictionnaire (clé `parcours`) ;
- aucun projet recréé : `Projet_carte` rend les données existantes ;
- aucune ancre en dur : celle des projets est lue dans les données ;
- aucune valeur en clair : les mesures passent par les jetons `--decouverte-*` ;
- aucune palette parallèle : les couleurs sont celles du thème.

## Dépendances

`Titre`, `Bouton`, `Grille`, `Apparition`, `Projet_carte`, `rendu.js`.
