# Intro (gabarit)

**Responsabilité** : l'expérience d'entrée du site public. C'est une **composition**, pas un composant : `Modale` plein écran, `Sceau` animé, `Signature`, `Segments` (langue), `TexteProgressif`, `Apparition` et `Bouton`.

## Séquence

1. Sceau animé.
2. Bienvenue : Signature en fondu (Apparition, déclenchée par étape).
3. Choix FR/EN : Segments en liens vers `/` et `/en/`, ou « Entrer » pour rester dans la langue courante.
4. Texte de transition qui s'écrit (TexteProgressif).
5. Mots qui arrivent de quatre côtés (Apparition multidirectionnelle).
6. Rideau : la modale remonte et se ferme.
7. Le focus passe au contenu (`#contenu`) : navigation normale.

## Données (`content/site.json` → `intro`)

| Clé | Rôle |
|---|---|
| `active` | L'accueil existe ou non. |
| `frequence` | `session` (défaut), `une-fois` ou `toujours`. |
| `signature` | `{salutation, accent, mot}`, traduisibles. |
| `transition` | Texte qui s'écrit, traduisible. |
| `mots` | Liste de mots, traduisibles. |

**Aucun texte n'est inventé** : les valeurs initiales reprennent des textes existants du site (signature de couverture, promesse, temps de la méthode). Elles sont modifiables dans le back-office.

## Robustesse et accessibilité

- Sans JavaScript, l'accueil n'existe pas : il est dans un `<template>`. Le portfolio, déjà dans le HTML, s'affiche directement.
- « Passer l'introduction » est toujours visible ; Échap ferme aussi (comportement natif du `<dialog>`).
- Avec la réduction des animations : aucune animation, on arrive directement au choix de langue, et le choix ferme l'accueil.
- Choisir l'autre langue enregistre l'accueil comme vu **avant** de changer de page : il ne se rejoue pas.
- Aucune redirection automatique selon la langue du navigateur.
- Le focus reste piégé dans l'accueil pendant qu'il est ouvert (`showModal`), puis revient au contenu.
