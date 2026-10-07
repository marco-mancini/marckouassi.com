# États (gabarit)

**Responsabilité** : les états du site qui ne vivent dans aucune section — page introuvable (404), perte et retour du réseau, média qui ne se charge pas. Décision : D-39, #162.

Tous les états du site, sans exception, utilisent **un seul gabarit** : `Message` en mode sceau (le sceau animé, un titre bicolore, une phrase, ses actions ; mêmes tailles, même place). Ce gabarit-ci ne fait que les disposer et les déclencher.

| État | Humeur du sceau | Où | Textes |
|---|---|---|---|
| Chargement | `chargement` | MarcoS (Assistant) | `etats.assistant.titre`, `assistant.chargement` |
| Hors connexion | `chantier` | bas d'écran (`offline`) ; MarcoS | `etats.horsConnexion.titre`, `assistant.erreurs.hors_ligne` |
| Connexion rétablie | `bati` | bas d'écran (`online`), 3 s | `etats.retablie` |
| Indisponible | `panne` | MarcoS (erreurs) | `etats.indisponible.titre`, `assistant.erreurs.*` |
| Page introuvable | `perdu` | `_site/404.html` | `etats.introuvable` |
| Vide | `vide` | catégorie sans réalisation (Projets) | `projet.categories.numero`, `projet.categories.vide` |
| Média indisponible | `chantier` | cadre d'un média en échec | `etats.media` |
| Maintenance | `bati` | gabarit Maintenance | `etats.maintenance.titre`, `maintenance.texte` |

## Page introuvable

Vercel sert `404.html` à toute adresse inconnue : la page est rendue avec une **racine absolue** (`/`), un message par langue. Le script montre celui de l'adresse (`/en/…` : anglais) ; sans script, la langue par défaut. `noindex`. Bouton : l'accueil de la langue.

## Messages du navigateur

`EtatsDuNavigateur` (dans chaque page, par `Document`) rend la zone vivante `.messages` et un `<template data-etats>` : hors connexion, connexion rétablie, média indisponible, dans la langue de la page. `activerEtats` les clone :

- réseau : « Hors connexion » tant que le réseau manque ; au retour, « Connexion rétablie » pendant `--etats-retablie-duree`, puis rien ;
- média : une image ou une vidéo en échec laisse place au message, à la taille du média (rapport largeur/hauteur conservé).

Une page plein écran hors connexion demanderait un service worker : hors périmètre.
