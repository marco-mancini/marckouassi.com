# Partage (gabarit)

**Responsabilité** : la carte de partage (`og:image`), 1200 × 630, une par langue. Décision de Marc du 11 octobre 2026, issue [#184](https://github.com/marco-mancini/marckouassi.com/issues/184).

## Composition

Fond crème. À gauche, le sceau complet sur fond vert (`Sceau`, taille `partage`, agrandi de 10 % le 11 octobre) et, devant lui, le portrait détouré de « À propos ». À droite, en grand, les deux mots de la signature de la couverture (`Signature`, échelle `partage`, **sans salutation**) : PORTFOLIO / DESIGN., et le rôle dessous.

Retirés à la demande de Marc (11 octobre, après essai dans WhatsApp) : l'édition, le nom manuscrit et la promesse, illisibles en vignette et redits par le titre et la description du partage. Pas d'adresse du site.

## Données — rien n'est écrit dans le code

| Affiché | Source |
|---|---|
| Accent, mot, rôle | section `couverture` de `content/sections.json` |
| Portrait et son texte alternatif | `portrait` de la section `apropos` |

`textesPartage({ contenu, ctx })` résout ces valeurs ; sans couverture ou sans portrait, elle renvoie `null` et la carte n'est pas rendue.

## Production

La carte n'est jamais servie comme page. `npm run partage` (`tools/partage.mjs`) la rend dans Chromium avec les vrais jetons et polices, la capture en JPEG dans `Public/images/Partage/Carte_<langue>.jpg`, et écrit `empreinte.json` (les textes dont elle dérive).

Pourquoi pas au build : Vercel n'a pas de navigateur, et Sharp ne sait pas dessiner les polices WOFF2 du site.

**À relancer après toute modification de la couverture ou du portrait.** Une carte périmée est signalée par le build (avertissement) et refusée par `tests/seo.test.mjs`.

## Publication (build)

`publierPartage` (`tools/partage.mjs`) publie, en JPEG 1200 × 630 :

| Page | Image |
|---|---|
| Accueil, 404, maintenance | `site.seo.image` si choisie dans le CMS, sinon la carte de la langue |
| CV | `cv.seo.image` si choisie, sinon celle du site |
| Projet | `seo.image` du projet si choisie, sinon sa première image (recadrage centré sur la zone d'intérêt) |

Les pages déclarent `og:image` (adresse absolue, jamais préfixée par la langue), ses dimensions, son texte alternatif, et `twitter:card` = `summary_large_image`.

**Pas de `og:description`** (décision de Marc, 11 octobre) : un partage n'affiche que l'image et le titre, « Portfolio • Marc Kouassi » sur l'accueil (`site.seo.titre`). La `meta description` reste pour les moteurs de recherche ; une application qui s'en servirait à défaut afficherait encore ce texte.
