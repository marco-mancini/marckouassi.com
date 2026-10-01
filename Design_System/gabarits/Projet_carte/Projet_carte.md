# Projet_carte (gabarit)

**Responsabilité** : la carte d'un projet dans le sommaire. C'est un assemblage de `Galerie` (aperçu), `Bouton` (entrée) et `Pastille` (numéro).

## Données

Tout vient de l'enregistrement du projet : titre, catégorie, années (ou période explicite), médias, motif du texte alternatif.

**Calculé, jamais stocké** :
- le numéro (rang + 1) ;
- le compteur « Projet 03 / 11 » (dictionnaire, rang et total) ;
- la période affichée ;
- le texte alternatif de chaque image : le motif du projet, rempli avec le rang de l'image.

## Robustesse

- L'entrée est un **vrai lien** vers `projets/<id>/` : sans JavaScript, on navigue vers la page du projet.
- Avec JavaScript, `activerEtudes` (dans Projet_etude) ouvre l'étude dans la modale partagée.
- Un projet ajouté, retiré ou déplacé renumérote tout, sans toucher au code.
