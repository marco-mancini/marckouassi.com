# Accent

**Responsabilité** : mettre en valeur un fragment dans un texte courant, avec un doré qui respecte le contraste du fond.

## API

- `Accent({ texte, grand })` : un fragment.
- `texteEnrichi(texte, { grand })` : interprète la seule syntaxe autorisée dans le contenu.
  - `**fragment**` devient un Accent.
  - Un saut de ligne devient `<br>`.
  - Tout le reste est échappé.

## Props (2)

| Prop | Type | Rôle |
|---|---|---|
| `texte` | chaîne | Le fragment. |
| `grand` | booléen | Texte de 24 px ou plus : le doré de grand texte est accepté (seuil 3:1). |

## Accessibilité

- `<b>` : mise en valeur stylistique, sans emphase ajoutée à la lecture.
- Couleurs choisies par contexte pour tenir 4,5:1 (petit texte) ou 3:1 (grand texte).

## Contraintes

Aucun sélecteur parent : c'est le contexte qui redéfinit `--accent-texte` et `--accent-texte-grand`.
