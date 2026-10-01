# Apparition

**Responsabilité** : l'entrée animée d'un élément (direction, décalage par rang), déclenchée au défilement ou à une étape d'une séquence.

## API

| Fonction | Rôle |
|---|---|
| `attributsApparition({direction, indice, declenchement})` | Attributs à poser sur un élément existant, sans conteneur ajouté. |
| `Apparition({contenu, direction, indice, declenchement, balise})` | Version avec conteneur. |
| `activerApparitions(racine, {reduit})` | Navigateur : observe le défilement. |
| `reveler(element)` | Révèle un élément tout de suite (étapes de l'accueil). |

**Directions** : `bas`, `haut`, `gauche`, `droite`, `fondu`, `douce` (planches, jamais masquées), `rideau`.

## Principe de visibilité

- Le HTML est visible par défaut.
- Le masquage en attente n'existe que sous `html.js-anime`, classe posée **à la fin** de l'initialisation du script.
- JavaScript désactivé, bloqué ou en échec : tout reste visible.

## Préférences

- Avec la réduction des animations, tout est révélé immédiatement et les durées sont nulles.
- Le réglage visiteur `data-animations="reduites"` a le même effet.

## Décalage

Le délai vaut `--apparition-base + --i × --apparition-pas`. Un conteneur peut resserrer le pas avec `--apparition-pas: var(--apparition-pas-serre)`.
