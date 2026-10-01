# TexteProgressif

**Responsabilité** : un texte qui s'écrit progressivement, sans jamais être inaccessible.

## API

- `TexteProgressif({ texte, balise, lang })` : rendu.
- `ecrire(element, { reduit })` : navigateur ; promesse résolue à la fin de l'écriture.

## Accessibilité

- Deux copies du texte :
  - une copie `visually-hidden`, lue d'emblée et en entier par les lecteurs d'écran ;
  - la copie visible, `aria-hidden`, seule à être animée.
- Sans JavaScript, la copie visible affiche le texte entier.
- Avec la réduction des animations, aucune écriture : le texte est affiché tout de suite.
- Le curseur clignote uniquement pendant l'écriture, quelques secondes au plus.

## Jetons

`--texte-progressif-pas` (délai par caractère), `--texte-progressif-curseur`.
