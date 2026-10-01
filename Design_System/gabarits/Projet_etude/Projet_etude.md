# Projet_etude (gabarit)

**Responsabilité** : l'étude complète d'un projet. C'est un assemblage de `Titre`, `Champ` (méta), `Bouton` (document) et `Galerie` (détail).

## Deux usages, un seul rendu

1. **Page du projet** (`projets/<id>/` et `en/projets/<id>/`) : lisible sans JavaScript, indexable, partageable. Titre de niveau 1.
2. **Modale partagée du sommaire** (`ModaleEtude`) : `activerEtudes` charge l'étude depuis la page du projet, rend ses adresses absolues, abaisse le titre au niveau 2, remplit le compteur et ouvre la modale. En cas d'échec, la navigation normale reprend.

## Données

Titre, catégorie, contexte, rôle, disciplines, années ou période, intention, valeur, document, médias : tout vient de l'enregistrement du projet.

- Les libellés (« Mon rôle », « L'intention créative »…) viennent du dictionnaire.
- Le compteur « Projet 03 / 11 » est calculé.

## Accessibilité

- La modale est nommée par le titre de l'étude chargée (`aria-labelledby`).
- Le focus revient à la carte d'où l'on vient.
- Chaque texte affiché en langue de repli porte son `lang`.
