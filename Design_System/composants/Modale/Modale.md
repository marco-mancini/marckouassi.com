# Modale

**Responsabilité** : toute boîte de dialogue, sur un seul mécanisme, le `<dialog>` natif. Étude de projet, menu mobile du site, navigation du back-office sous 850 px, confirmation de suppression, aperçu.

## Props (5)

| Prop | Type | Rôle |
|---|---|---|
| `id` | chaîne | Cible de `data-modale-ouvrir`. |
| `etiquette` | `{id}` \| chaîne | `aria-labelledby` (titre dans le contenu) ou `aria-label`. |
| `contenu` | HTML | Corps. |
| `entete` | HTML | En-tête (compteur « 03 / 11 », libellé…). |
| `options` | `{variante, libelleFermer, fermeture}` | `centre` ou `plein-ecran` ; libellé du bouton de fermeture, depuis le dictionnaire ; `fermeture: "texte"` rend ce libellé visible (bouton « Passer » de l'accueil). |

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

## Variantes

- `centre`.
- `plein-ecran` : fond olive profond, contexte `.ilot-olive`, ouverture en rideau.

## Dépendances

`Bouton`.
