# Realisation_carte

La carte d'une **réalisation isolée** — une marque, une affiche, une planche —
dans n'importe quelle catégorie de « Mes réalisations ».

## Pourquoi

Une catégorie peut porter des réalisations plutôt que des projets complets.
Leur carte était composée dans la section « Réalisations » : chaque catégorie
y aurait eu, tôt ou tard, sa propre mise en page. Elle vit ici, une seule
fois. Une catégorie fournit des **données**, jamais une composition.

## La composition

La même que celle d'un projet : la galerie prend toute la largeur de la carte,
le premier visuel sur deux colonnes et deux rangées, les deux autres empilés à
droite. Seule différence, la variante `vitrine` au lieu d'`apercu` : les
visuels sont **contenus**, pas recadrés, et le fond papier de chaque case tient
la place autour d'eux. Une planche de marque porte du texte et des codes
couleur — la rogner la mutile.

## Emploi

```js
import { Realisation_carte, vueRealisation } from "../Realisation_carte/Realisation_carte.js";

const vue = vueRealisation({ realisation, ctx, chemin, rang });
Realisation_carte({ vue });
```

| Donnée lue | Rôle |
|---|---|
| `libelle` | titre de la carte |
| `description` | sous-titre |
| `medias` (ou `media`) | jusqu'à trois visuels, le premier mis en avant |
| `altImages` | motif de texte alternatif quand un média n'a pas le sien |

Le numéro vient du rang dans la catégorie, par `formats.numeroProjet`.

## Ce qu'elle ne fait pas

Elle n'ouvre pas d'étude : une réalisation isolée n'a pas de page dédiée.
Pour un projet complet, c'est `Gabarit_Projet` en mode `carte`.
