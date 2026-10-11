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

## La fiche

Une réalisation n'a ni identifiant, ni page dédiée : sa fiche ne peut pas être
chargée depuis une page comme l'est une étude de projet. Elle est **rendue avec
la carte, dans le flux**, par `Projet_etude` — le gabarit des études, dont
`periode`, `ideeHtml` et `medias` sont devenus facultatifs.

Sans JavaScript, la fiche reste visible sous la carte : le texte n'est jamais
perdu, et aucune flèche n'annonce une ouverture qui n'aurait pas lieu. Dès que
le script a démarré, `activerRealisations` replie la fiche, découvre le signe,
fait de la carte une commande (`role="button"`, clavier, `aria-haspopup`) et
ouvre la fiche dans la **modale partagée des études**.

La carte entière est la seule commande : ses visuels ne sont pas cliquables
séparément — un bouton dans un bouton n'a pas de sens. Ils s'agrandissent
depuis la fiche, où la galerie `detail` les reprend.

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
| `categorie` | rubrique de la fiche ; à défaut, `description` la tient |
| `contexte` | premier paragraphe de la fiche |
| `idee` | l'intention, sous son intitulé |
| `role` | champ méta de la fiche |

Tous les champs de texte sont **facultatifs** : ce que la donnée ne porte pas
ne s'affiche pas. Sans `contexte` ni `idee`, la fiche se réduit à sa rubrique,
son titre et ses visuels.

Le numéro vient du rang dans la catégorie, par `formats.numeroProjet`.

## Ce qu'elle ne fait pas

Elle n'ouvre pas d'étude : une réalisation isolée n'a pas de page dédiée.
Pour un projet complet, c'est `Gabarit_Projet` en mode `carte`.
