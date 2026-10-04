# Projet_etude (gabarit)

**Responsabilité** : la **disposition** de l'étude complète d'un projet — un assemblage de `Titre`, `Champ` (méta), `Bouton` (document) et `Galerie` (détail). Elle porte aussi le réceptacle `ModaleEtude` et le chargement de l'étude dans ce réceptacle.

Comme la carte, elle ne lit plus l'enregistrement du projet : elle reçoit la **vue** résolue par [`Gabarit_Projet`](../Gabarit_Projet/Gabarit_Projet.md).

## Deux usages, un seul rendu

1. **Page du projet** (`projets/<id>/` et `en/projets/<id>/`) : lisible sans JavaScript, indexable, partageable. Titre de niveau 1.
2. **Modale partagée du sommaire** (`ModaleEtude`) : `activerEtudes`, branché par `activerProjets`, charge l'étude depuis la page du projet, rend ses adresses absolues, abaisse le titre au niveau 2, remplit le compteur et ouvre la modale. En cas d'échec, la navigation normale reprend.

## Données

Rien n'est lu dans `projets.json` ici. Titre, catégorie, contexte, rôle, disciplines, période, intention, valeur, document et médias viennent tous de `vue` — donc des mêmes résolutions que la carte et la page.

- Les libellés (« Mon rôle », « L'intention créative »…) viennent du dictionnaire.
- Le compteur « Projet 03 / 11 » est calculé.

## Accessibilité

- La modale est nommée par le titre de l'étude chargée (`aria-labelledby`).
- Le focus revient à la carte d'où l'on vient.
- Chaque texte affiché en langue de repli porte son `lang`.
