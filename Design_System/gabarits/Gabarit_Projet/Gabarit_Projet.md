# Gabarit_Projet (gabarit)

**Responsabilité** : le système de référence d'un projet. Il définit **comment un projet est représenté et comment il se comporte**, partout où il apparaît.

Changer le comportement général des projets se fait ici, et nulle part ailleurs.

## Pourquoi cette couche existe

Avant elle, un projet était rendu à trois endroits qui ne se parlaient pas — la carte du sommaire, l'étude, la page dédiée. Chacun recalculait le chemin de données, le titre et la liste des médias ; la même expression de résolution des médias était écrite **deux fois, mot pour mot**.

Plus grave : le contrat qui relie la carte à la modale était éparpillé sur trois fichiers.

| Membre du contrat | Écrit par | Lu par |
|---|---|---|
| `data-etude="<id>"` | la carte | `activerEtudes` |
| `data-compteur` | la carte | `activerEtudes` |
| `aria-haspopup="dialog"` | la carte | les technologies d'assistance |
| `id="etude-<id>"` sur le titre | l'étude | `aria-labelledby` de la modale et de la page |

En changer un seul membre cassait l'ouverture **sans qu'aucun fichier ne le dise**. Ce contrat vit désormais dans `vueProjet`, en un seul endroit, et les trois vues le reçoivent.

## API

```js
import { Gabarit_Projet, vueProjet, parcours, activerProjets, MODES } from "…/gabarits/Gabarit_Projet/Gabarit_Projet.js";
```

### `Gabarit_Projet({ projet, ctx, mode, options })`

Point d'entrée unique du rendu.

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `projet` | objet \| `null` | `null` | Enregistrement de `content/projets.json`. Requis sauf en mode `modale`. |
| `ctx` | contexte | — | Langue et page. |
| `mode` | `carte` \| `etude` \| `modale` \| `page` | `carte` | Voir ci-dessous. |
| `options` | objet | `{}` | `rang`, `total` (carte) · `niveau` (étude) · `retour` (page). |

Un mode inconnu lève une erreur : une faute de frappe ne doit pas rendre une page vide en silence.

### `vueProjet({ projet, ctx, rang, total })`

**La vue résolue d'un projet.** Chaque mode la lit et n'interroge plus `projet` directement — c'est ce qui garantit qu'un titre, un média ou un identifiant est calculé de la même façon partout.

`id` · `chemin` · `titre` · `titreHtml` · `categorie` · `categorieHtml` · `description` · `contexteHtml` · `ideeHtml` · `valeurHtml` · `periode` · `disciplines` · `lien` · `idEtude` · `numero` · `compteur` · `medias` · `document` · `champs` · `ouverture`

Deux formes coexistent pour certaines valeurs — `titre` / `titreHtml` — et ce n'est pas une redondance : le texte brut entre dans un modèle du dictionnaire ou dans une métadonnée, le HTML porte le balisage `lang="…"` quand la traduction manque et qu'on retombe sur le français.

`ouverture` est **le contrat d'ouverture** : les attributs à étaler sur le lien d'entrée d'un projet.

### `parcours(projets, id)`

Fonction pure : `{ rang, total, precedent, suivant }`. C'est elle qui tient l'ordre de lecture. Elle alimente le compteur « Projet 07 / 11 » et constitue le siège d'une navigation précédent / suivant, sans qu'aucun autre fichier n'ait à connaître l'ordre des projets.

### `activerProjets(racine)`

**Un seul branchement** pour tout ce qui concerne les projets : le filtrage du catalogue, puis l'ouverture des études. `Frontend/site.js` ne connaît que cette fonction.

## Les modes

| Mode | Rend | Délègue à |
|---|---|---|
| `carte` | le projet dans le catalogue | `Projet_carte` |
| `etude` | l'étude complète, texte et galerie | `Projet_etude` |
| `modale` | le réceptacle partagé, vide | `ModaleEtude` |
| `page` | la planche de `/projets/<id>/`, retour compris | `Projet_etude` + `Bouton` |

`modale` est le seul mode **sans projet** : elle est le réceptacle, pas le contenu. L'étude y est chargée à la demande, depuis la page du projet.

## Qui fait quoi

| Élément | Responsabilité | Ne fait jamais |
|---|---|---|
| `content/projets.json` | **les données** : titre, textes, médias, années, disciplines | aucun comportement |
| `content/sections.json` → `categories` | **le catalogue** des disciplines : identifiants et libellés FR/EN | aucun rattachement |
| `Segments` | **la sélection** : dessine les options, tient l'état pressé, annonce le choix | ne connaît pas les projets |
| **`Gabarit_Projet`** | **le comportement et la vue** : résolution, modes, ouverture, filtrage, parcours | ne contient aucune donnée |
| `Projet_carte` | la **disposition** d'une carte | ne lit plus l'enregistrement |
| `Projet_etude` | la **disposition** d'une étude, et le chargement dans la modale | ne lit plus l'enregistrement |
| `PageProjet` | l'**enveloppe** de la page : document, en-tête, menu, métadonnées | ne rend plus le projet lui-même |
| `sections/Projets.js` | la **section** du sommaire : titre, modèle du filtre, grille | ne porte plus de comportement |

## Ajouter un mode

1. ajouter son nom à `MODES` ;
2. ajouter sa branche dans `Gabarit_Projet` ;
3. lui faire lire la **vue**, jamais `projet` ;
4. si le mode a un dessin propre, lui donner son gabarit spécialisé plutôt que d'écrire du HTML ici.

Ne jamais créer un second chemin de rendu en dehors de cette fonction : c'est exactement ce que cette couche existe pour empêcher.

## Éviter le hard-code

Ce fichier ne contient — et ne doit jamais contenir :

- aucune liste de projets ;
- aucune liste de catégories ;
- aucun titre, aucune image, aucun libellé ;
- aucune relation projet / catégorie.

Les libellés d'interface viennent du dictionnaire (`ctx.t`), les textes éditoriaux du contenu (`ctx.c`, `ctx.l`). Si un mode a besoin d'une information qui n'existe pas, elle s'ajoute **au modèle de contenu**, pas au composant.

Le contrôle est automatique : `tests/projets-filtres.test.mjs` cherche les 51 identifiants et libellés réels dans tous les fichiers de présentation, et `tests/riendur.test.mjs` refuse tout texte littéral dans un gabarit.

## Robustesse et accessibilité

- L'entrée d'un projet est un **vrai lien** : sans JavaScript, on navigue vers sa page.
- Le filtre dort dans un `<template>` : sans JavaScript, aucun bouton de filtre n'est posé — un bouton qui ne filtre rien vaut moins que pas de bouton.
- Une carte masquée par le filtre porte `hidden` : elle sort de la mise en page **et** de l'arbre d'accessibilité au même instant.
- Le numéro affiché est la position du projet dans l'**ensemble** : « Projet 07 / 11 » veut dire la même chose quel que soit le filtre actif.
- `Escape` ferme la modale et rend le focus au lien déclencheur (`Modale`).
- Le titre de l'étude est abaissé au niveau 2 quand elle entre dans la modale : une page n'a qu'un seul `h1`.
