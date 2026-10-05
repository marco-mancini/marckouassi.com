# Assistant

Assemblage V1 de MarcoS : présence flottante + `Modale` + `Conversation` + formulaire + états.
Voir [AI_UX.md](../../../Docs/AI_UX.md) pour le parcours et les états.

## Props (3)

| Prop | Type | Rôle |
|---|---|---|
| `assistant` | objet | `content/site.json` → `assistant` : `active`, `accueil`, `exemples`, `confidentialite`. |
| `ctx` | contexte | `t` pour les libellés, `c` et `l` pour les textes de Marc. |
| `endpoint` | chaîne \| `null` | adresse du Worker, issue de `ASSISTANT_URL` au build. |

## Activation

Le gabarit ne rend **rien** si `assistant.active` est faux ou si `endpoint` est
absent. Tant que Marc n'a pas écrit l'accueil dans Paramètres, MarcoS n'existe
pas pour le visiteur (D-9).

Un exemple dont aucune langue n'est renseignée est ignoré : il ne doit pas
devenir un bouton sans fonction. Le cas se produit quand Marc ajoute une ligne
dans le CMS sans la remplir.

Le bloc `assistant` **n'est pas amorcé dans `content/site.json`** : il est
déclaré facultatif dans `tools/cms.mjs`, donc proposé dans Paramètres même
absent des données. Y poser des valeurs vides les ferait effacer à
l'enregistrement (`omit_empty_optional_fields`), et le champ disparaîtrait de
l'éditeur au build suivant.

## Comportement

`activerAssistant(racine)` est séparé du rendu, comme les études de projet.

Les libellés dont le navigateur a besoin voyagent dans `data-libelles`, à la
manière de `data-frequence` d'Intro et `data-compteur` de Projet_etude : aucun
texte n'est écrit dans le script. Sans ces libellés, le comportement ne
s'active pas, plutôt que d'afficher du texte en dur.

La conversation vit dans `sessionStorage`, pour l'onglet courant seulement.
Lorsque ce stockage est refusé — navigation privée, site bloqué — elle tient en
mémoire le temps de l'onglet : le refus n'interrompt jamais MarcoS. Une valeur
stockée illisible est effacée au lieu de faire échouer l'activation.

« Réessayer » renvoie la **même** question : elle n'est jamais perdue.

## Présence visuelle V1 — D-35

- la présence flottante en bas à droite est l'entrée visuelle primaire ;
- elle réutilise `Bouton` et l'asset officiel neutre `Public/Avatar_MarcoS/Avatar_02_NEUTRE_DISPONIBLE.png` ;
- l'avatar reste visible dans l'en-tête de la conversation ;
- Contact et menu restent des accès secondaires ;
- les dix expressions restent une bibliothèque visuelle, jamais dix états runtime ;
- aucun nouvel asset ni composant parallèle.

## Contraintes

- aucune présence flottante n'est créée si `assistant.active` est faux ou si l'endpoint est absent ;
- aucune clé ni nom de modèle dans le navigateur ;
- `sessionStorage` uniquement, jamais `localStorage`, jamais de stockage serveur ;
- réponses insérées comme texte ;
- liens uniquement ceux du Worker, et seulement s'ils commencent par `/` ;
- tous les textes d'interface viennent des dictionnaires (clé `assistant`) ;
- les textes éditoriaux viennent de `content/site.json` et sont écrits par Marc ;
- aucune valeur en dur : les mesures passent par les jetons.

## Dépendances

`Modale`, `Conversation`, `Champ`, `Saisie`, `Bouton`, `Message`, `rendu.js`.
