# Composants du Design System

Chaque composant est un dossier de trois fichiers portant son nom :

```text
Nom/
├── Nom.css   présentation : ne lit que les jetons des fondations
├── Nom.js    rendu : fonction pure, données → HTML
└── Nom.md    contrat : responsabilité, props, variantes, états, accessibilité
```

Il n'y a **ni React, ni TypeScript, ni étape de compilation**.

## Rendu : une fonction pure

```js
import { Titre } from "../composants/Titre/Titre.js";
Titre({ niveau: 2, echelle: "section", texte: donnees.titre, id: "titre-apropos" });
```

- La fonction reçoit des **données** et retourne du HTML, sous forme de fragment `Html` de `fondations/rendu.js`.
- Elle ne touche ni au DOM, ni au réseau, ni à Supabase, et ne contient aucun texte.
- Toute valeur interpolée est **échappée** par le gabarit `html`.

Cette même fonction tourne :

| Où | Pour quoi |
|---|---|
| Dans le **build Node** | Générer les pages publiques `/` et `/en/`. |
| Dans le **navigateur** | L'aperçu du back-office, rendu avec les mêmes fonctions : identique au site. |

Les composants interactifs exportent en plus une fonction `activer…()` (ou `ouvrir…`, `ecrire`…), réservée au navigateur, qui branche le comportement sur le HTML déjà rendu. Le rendu et le comportement restent séparés.

## Règles

1. **Cinq props au plus.** Au-delà, les informations sont regroupées dans un objet cohérent : `media`, `options`, `libelles`.
2. **Aucun texte en dur.** Libellés, textes d'accessibilité et messages arrivent par les props : depuis le contenu (`content/`) ou depuis le dictionnaire (`i18n/`). Le test `tests/composants.test.mjs` le vérifie.
3. **Aucune couleur brute.** Seuls les jetons de `fondations/Tokens.css` sont lus.
4. **Contexte par les jetons.** Un composant lit des rôles (`--fond`, `--texte`, `--texte-titre`, `--texte-discret`, `--texte-etiquette`, `--filet`, `--point-titre`, `--accent-texte`, `--carte-surface`…). Une surface olive pose `.ilot-olive`, qui redéfinit ces rôles ; tout composant posé dedans suit. **Aucun sélecteur parent** du type `.planche-x .composant-y`.
5. **Un composant ne connaît pas sa page.** Pas de nom de section ni d'identifiant de planche. Un gabarit peut disposer un composant (grille, marge d'un conteneur), jamais réécrire son intérieur.
6. **Accessibilité intégrée**, et non ajoutée après coup : noms accessibles, `aria-current`, `aria-pressed`, `aria-busy`, `aria-invalid`, `aria-describedby`, régions vivantes, focus visible, cibles de 44 px, réduction des animations.
7. **HTML visible par défaut.** Une animation n'est jamais une condition de visibilité : le masquage en attente n'existe que sous `html.js-anime`, classe posée à la fin de l'initialisation du script.

## Inventaire (25)

| Famille | Composants |
|---|---|
| Structure | Planche, Encart, Grille, Pile, CadreAdmin |
| Navigation | EnTete, Navigation, Segments |
| Texte | Titre, Signature, Accent, Champ, Pastille |
| Actions et formulaires | Bouton, Saisie, Liste, Televersement |
| Médias | Media, Galerie, Sceau, Carte |
| Surcouches | Modale, Message |
| Mouvement | Apparition, TexteProgressif |

**Ne sont pas des composants**, et s'obtiennent par assemblage :
- **État** : un `Message`.
- **Aperçu** : une `Modale` plein écran, des `Segments` et le moteur de rendu.
- **Barre de publication** : la zone `barre` du `CadreAdmin`.
- **Progression** : l'élément `<progress>`.
- **Séquence** : le gabarit `Intro`.
- **Prestation** : un `Encart`, une liste et une `Pastille`.

## Vérifier

```sh
npm test                                   # rendu, contrat, texte en dur, sélecteurs
node tests/catalogue.mjs _site/catalogue.html   # catalogue visuel (données d'essai)
```
