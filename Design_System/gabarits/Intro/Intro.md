# Intro (gabarit)

**Responsabilité** : l'expérience d'entrée du site public, de l'accueil à la couverture (page 1). C'est une **composition**, pas un composant : `Modale` plein écran, `Sceau` (variante construction), `Segments` (langue), `Bouton`, et la séquence d'ouverture (`Sequence.js`). Décisions : #40, D-35, D-37.

## Parcours

1. **Accueil** : le sceau seul, grand et centré, se construit en 3 s (Sceau, `anime: "construction"`, jetons `--construction-*`, `--intro-sceau-taille`).
2. **Entrée par la langue** : deux liens fins (Segments nus). La langue courante fait entrer ; l'autre mène à `/` ou `/en/`, où la séquence se joue à l'arrivée. Un seul geste, pas de bouton.
3. **Séquence d'ouverture** (`Sequence.js`, 7,9 s) :
   - le sceau de l'accueil, relevé au pixel, se charge de lumière puis se désintègre de gauche à droite en particules ;
   - les particules tourbillonnent en galaxie et s'abattent sur la grille de la page, avec une onde d'impact ;
   - les visuels des réalisations arrivent sur le temps pendant que les catégories défilent ; ils se fendent en bandes et sont aspirés au centre ;
   - le nom se recompose en bandes, puis le métier ;
   - le sceau de la couverture se construit à sa place exacte ; le champ se rétracte sur la carte de la couverture, du même vert ; **à la même image**, le vrai sceau prend le relais et le contenu de la couverture se révèle.
4. Le focus passe au contenu (`#contenu`), en haut de la page 1.

## Données — rien n'est écrit dans le code

| Affiché | Source |
|---|---|
| Le nom | `sections` → couverture → `signature.salutation` |
| Le métier | `sections` → couverture → `role` |
| Les catégories | `sections` → sommaire → `categories[].libelle`, toutes, dans l'ordre |
| Les visuels (6) | premier média de chaque réalisation, une par catégorie à tour de rôle dans l'ordre du catalogue (`visuelsDeSequence`) |
| Leurs légendes | `projets[].titre`, partie avant « · » (le nom du projet) |
| « Passer » | dictionnaire `intro.passer` |

`content/site.json` → `intro` : `active` (l'accueil existe ou non) et `frequence` (`session` par défaut, `une-fois` ou `toujours`). Les champs `signature`, `transition` et `mots` n'ont plus d'usage depuis le 7 octobre 2026 : le sceau seul ouvre le portfolio et la séquence remplace l'ancien texte et ses mots. Ils restent dans le contenu tant que Marc ne décide pas de les retirer.

## Relais au pixel

Les deux bascules sont mesurées dans le navigateur (tests `séquence : …`, écart moyen < 1/255) :

- **accueil → séquence** : le sceau de l'accueil est cloné à sa position, posé par `left/top` (une translation fractionnaire serait lissée autrement) ; ses animations sont achevées avant le clonage ;
- **séquence → couverture** : le sceau de la séquence est dessiné dans un calque de même origine que la carte de la couverture (`.sequence__ancre`), sa construction est achevée juste avant la bascule, et les traits finissent à l'épaisseur du sceau fixe (affinage).

## Robustesse et accessibilité

- Sans JavaScript, ni l'accueil ni la séquence n'existent (`<template>`) : le portfolio s'affiche directement.
- Mouvement réduit : ni construction ni séquence ; le choix de langue ferme l'accueil.
- « Passer l'introduction » est toujours disponible, puis le bouton « Passer » de la séquence, qui reçoit le focus ; Échap ferme aussi. Les deux rendent immédiatement la couverture complète.
- Le défilement reste verrouillé pendant la séquence (verrou compté partagé avec `Modale`) et rendu à la fin.
- La séquence est décorative (`aria-hidden`) : les mêmes informations sont dans la couverture.
- Son synthétisé, sans fichier, seulement après le geste d'entrée ; à l'arrivée par l'autre langue, le navigateur interdit le son sans geste : la séquence y est muette.
- Choisir l'autre langue enregistre l'accueil comme vu **avant** de changer de page : il ne se rejoue pas.
- Aucune redirection automatique selon la langue du navigateur.
