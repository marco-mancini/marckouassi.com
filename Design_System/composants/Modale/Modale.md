# Modale

**Responsabilité** : toute boîte de dialogue, sur un seul mécanisme, le `<dialog>` natif. Étude de projet, menu mobile du site, navigation du back-office sous 850 px, confirmation de suppression, aperçu, panneau de MarcoS.

## Props (5)

| Prop | Type | Rôle |
|---|---|---|
| `id` | chaîne | Cible de `data-modale-ouvrir`. |
| `etiquette` | `{id}` \| chaîne | `aria-labelledby` (titre dans le contenu) ou `aria-label`. |
| `contenu` | HTML | Corps. |
| `entete` | HTML | En-tête (compteur « 03 / 11 », libellé…). |
| `options` | `{variante, libelleFermer, fermeture, modal, iconeFermer}` | `centre`, `plein-ecran` ou `ancre` ; `modal: false` ouvre avec `show()` ; libellé du bouton de fermeture, depuis le dictionnaire ; `fermeture: "texte"` rend ce libellé visible ; `fermeture: "aucune"` ne rend aucune commande, et `libelleFermer` devient inutile — c'est le cas de l'accueil animé, dont la sortie est son propre bouton d'entrée, le choix de langue, ou Échap. |

## Comportement (navigateur)

- `activerModales(racine)` : délégation d'événements.
  - `[data-modale-ouvrir="id"]` ouvre la modale ;
  - `[data-modale-fermer]` la ferme, y compris depuis un lien de menu ;
  - un clic sur le fond la ferme ;
  - Échap la ferme (comportement natif).
- `ouvrirModale(dialogue, declencheur)` et `fermerModale(dialogue)`.

## Accessibilité

- `showModal()` : le reste de la page devient inerte et le focus reste piégé dans la modale (comportement natif).
- À la fermeture, par n'importe quel chemin, le focus revient au déclencheur.
- Le déclencheur porte `aria-expanded`.
- Le défilement de la page est verrouillé par un compteur partagé.
- Le verrou est posé **et rendu** par `ouvrirModale()` : elle attache elle-même
  l'écouteur de fermeture, en `{ once: true }`. Une modale injectée après
  `activerModales()` — l'accueil animé vit dans un `<template>` — rend donc son
  verrou comme les autres. Le déverrouillage ne doit pas être dupliqué dans
  `activerModales()`, sous peine de décrémenter deux fois pour une modale
  rendue par le serveur ; et le retour du focus ne vit qu'à un seul endroit.

## Variantes

- `centre`.
- `plein-ecran` : fond olive profond, contexte `.ilot-olive`, ouverture en rideau.
- `ancre` : panneau de MarcoS. Ce composant ne lui donne que le `<dialog>`, son
  en-tête et son corps ; sa composition appartient au gabarit `Assistant`, qui
  transpose la maquette d'interaction (D-40). La seule règle commune ici est de
  neutraliser la boîte du dialogue natif, qui sinon se centre et se dimensionne
  seul.

## Non modal

`options.modal: false` pose `data-modal="false"` sur le `<dialog>`, et
`ouvrirModale` ouvre alors avec `show()` au lieu de `showModal()`.

Ce que cela change, et ce qu'il faut assumer :

- le reste de la page **reste actif** : le visiteur continue de parcourir le
  portfolio pendant la conversation. C'est le bon comportement pour un
  assistant persistant, et ce que décrit la maquette (`aria-modal="false"`) ;
- le focus n'est **pas** piégé, ce qui est correct pour un dialogue non modal ;
- le défilement de la page n'est **pas** verrouillé, donc rien n'est à rendre
  à la fermeture ;
- Échap ne ferme pas tout seul — l'évènement `cancel` n'existe que pour une
  modale. `activerModales` pose donc un écouteur clavier qui ferme la dernière
  non modale ouverte ;
- un clic sur le fond ne ferme pas : une non modale n'a pas de fond, et la zone
  cliquée appartient à la page.

## Dépendances

`Bouton`.
