# Dette technique

Trois points repris de `RAPPORT-NUIT.md` (nuit du 29 septembre 2026, supprimé
le 1er octobre 2026), revérifiés sur le code de `main` le 1er octobre 2026.
Aucun n'est corrigé : chacun attend une décision de Marc. Ce document dit
lesquels changent le rendu.

## 1. Décalage des ancres — change le rendu

Un saut vers une section (menu, lien « Le portfolio ↓ ») additionne deux
dégagements :

- `html { scroll-padding-top: var(--header-offset) }` (`fondations/Theme.css`) :
  76 px sur ordinateur, 62 px sous 850 px (`fondations/Responsive.css`) ;
- `.planche-scene { scroll-margin-top: … }` (`composants/Planche/Planche.css`) :
  82 px écrits en dur sur ordinateur, `var(--header-height)` (68 px) sous 850 px.

Mesuré le 1er octobre 2026 dans Chromium, de l'en-tête au haut de la
section : **90 px sur ordinateur (1440 px), 68 px sur téléphone (375 px)**.
Les « six pixels » relevés la nuit du 29 septembre (82 − 76) sont une partie
de cet écart.

Décision attendue : l'espace voulu entre l'en-tête et le titre d'une
section. Corriger déplace le point d'arrivée de chaque ancre.

## 2. Sept valeurs de géométrie d'animation — ne change pas le rendu

`Design_System/fondations/Motion.css`, images-clés :

| Animation | Valeurs écrites en dur |
|---|---|
| `planche-entree` | `translateY(14px)`, `scale(.995)` |
| `couverture-revelation` | `translateY(22px)` |
| `etape-entree` | `scale(.97)` |
| `point-battement` | `scale(1.18)`, ombre `6px` |
| `sceau-ouverture` | `scale(.85)`, `rotate(-12deg)` |

Aucune famille de jetons ne couvre une distance ou une échelle de mouvement.
Décision attendue : ouvrir une famille `--motion-*` dans `Tokens.css` (à
valeurs identiques, aucun changement visible) ou les laisser.

## 3. La valeur `14px` répétée — ne change le rendu que si on l'aligne

Elle n'appartient pas à l'échelle d'espacement (4 à 32 par pas de 4).
Occurrences hors `Tokens.css` :

| Fichier | Usage |
|---|---|
| `composants/Galerie/Galerie.css` | position de la superposition (`top`, `right`) |
| `composants/Bouton/Bouton.css` | hauteur des barres du menu |
| `composants/Modale/Modale.css` | rayon de la modale centrée (le jeton `--radius-lg: 14px` existe déjà) |
| `composants/Planche/Planche.css` | espacement de grille ; marge intérieure sous 850 px |
| `gabarits/sections/sections.css` | pied du contact (marge haute, espacement) |
| `gabarits/Projet_carte/Projet_carte.css` | marge haute de l'en-tête de carte |
| `gabarits/Jalon/Jalon.css` | espacement de grille |
| `fondations/Responsive.css` | `--page-gutter` sous 850 px |
| `fondations/Motion.css` | voir point 2 |

Deux voies :

- **remplacer par des jetons de même valeur** : aucun changement visible ;
- **aligner sur l'échelle** (12 ou 16 px) : le rendu bouge.

Leçon de la nuit du 29 septembre : un remplacement **par valeur** confond
deux rôles qui partagent un nombre (1000 px y était à la fois un rayon et une
hauteur). Chaque remplacement se relit.
