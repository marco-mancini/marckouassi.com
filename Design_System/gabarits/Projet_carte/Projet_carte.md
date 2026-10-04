# Projet_carte (gabarit)

**Responsabilité** : la **disposition** d'une carte de projet dans le sommaire — un assemblage de `Galerie` (aperçu), `Bouton` (entrée) et `Pastille` (numéro).

Elle ne lit plus l'enregistrement du projet : elle reçoit la **vue** résolue par [`Gabarit_Projet`](../Gabarit_Projet/Gabarit_Projet.md). Même titre, mêmes médias, même contrat d'ouverture que l'étude et la page.

## Données

Rien n'est lu dans `projets.json` ici. Tout vient de `vue` : `titre`, `titreHtml`, `categorie`, `periode`, `numero`, `medias`, `lien`, `disciplines`, `ouverture`.

**Calculé par `Gabarit_Projet`, jamais stocké** :
- le numéro (rang + 1) ;
- le compteur « Projet 03 / 11 » (dictionnaire, rang et total) ;
- la période affichée ;
- le texte alternatif de chaque image : le motif du projet, rempli avec le rang de l'image.

Les **disciplines** (`projets[].categories`) sont une liste d'identifiants du catalogue déclaré dans la section du sommaire. La carte les pose en attribut `data-disciplines`, séparées par une espace. C'est ce que lit le filtre : aucune liste de projets n'existe côté script, chaque carte dit elle-même à quoi elle appartient.

## Robustesse

- L'entrée est un **vrai lien** vers `projets/<id>/` : sans JavaScript, on navigue vers la page du projet.
- Avec JavaScript, `activerProjets` (dans Gabarit_Projet) ouvre l'étude dans la modale partagée.
- Un projet ajouté, retiré ou déplacé renumérote tout, sans toucher au code.
- Le filtre ne renumérote pas : le numéro affiché reste la position du projet dans l'ensemble, pour que « Projet 07 / 11 » veuille dire la même chose quel que soit le filtre actif.
- Une carte masquée par le filtre porte `hidden` : elle sort de la mise en page **et** de l'arbre d'accessibilité en même temps.
