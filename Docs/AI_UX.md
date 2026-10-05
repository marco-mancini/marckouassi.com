# MarcoS — interface et accessibilité

Arrêté le 2 octobre 2026 par les décisions de Marc
([MARCOS_DECISIONS.md](MARCOS_DECISIONS.md)). Voir
l'[architecture](AI_ARCHITECTURE.md).

Les décisions actives commandent ce document : **D-35** (présence flottante et
avatar en V1), **D-15** (troisième personne, vouvoiement) et **D-17** (exemples
de questions seuls). D-4 et D-13 restent dans le journal comme décisions
historiques, mais sont supersédées par D-35 pour le mode d'entrée V1.

## Intention

Répondre **en deux à trois phrases** à une question sur Marc, ses projets, son
parcours, ses compétences ou ses prestations, puis renvoyer vers la page qui en
parle. MarcoS **appartient au portfolio** : mêmes polices, couleurs, filets,
rayons et boutons.

**En V1, MarcoS possède une présence graphique validée par D-35** : l'avatar 3D
flottant en bas à droite est son entrée visuelle primaire. Aucun nouvel élément
graphique parallèle n'est introduit : on réutilise l'asset officiel #49 et le
Design System existant.

### Présence V1 — décision D-35 du 5 octobre 2026

| Élément | V1 actif |
|---|---|
| Entrée primaire | présence flottante en bas à droite |
| Avatar | expression neutre officielle #49 |
| Conversation | Modale centrée existante, journal borné et formulaire existant |
| Accès secondaires | Contact et menu conservés sans être l'entrée principale |

D-35 supersède D-13 pour le calendrier V1/V2 et D-4 pour le mode d'entrée primaire.
Les dix expressions de `MARCOS_AVATAR_EXPRESSIONS.md` restent une bibliothèque
visuelle : elles ne deviennent pas dix états runtime.

Ce qui reste interdit : dégradé, glassmorphism, lueur, néon, effet de frappe,
carte générique de SaaS, couleur ou typographie étrangère au Design System.

## Réutilisation du Design System

Tous les éléments existent déjà, sauf la liste des échanges.

| Besoin | Composant existant | Variante |
|---|---|---|
| Ouvrir MarcoS | `Bouton` | présence flottante en bas à droite ; Contact et menu restent des accès secondaires |
| Fenêtre | `Modale` | `centre`, comme l'étude de projet (focus piégé, Échap, retour du focus déjà gérés) |
| Message d'accueil, aide | paragraphe `texte-corps` | — |
| Exemples de questions | `Bouton` dans une `Pile` | `filet`, `direction: "ligne"` |
| Champ de question | `Champ` + `Saisie` | `formulaire` + `long` (3 lignes) ; aide = caractères restants |
| Envoyer | `Bouton` | `principal`, `type="submit"`, état `chargement` pendant l'envoi |
| Attente | `Message` | `chargement` (`role="status"`, `aria-busy`) |
| Erreur, limite, indisponible | `Message` | `erreur` ou `attention`, action « Réessayer » (`Bouton`) |
| Effacer la conversation | `Bouton` | `texte`, dans l'en-tête de la Modale |
| Liens vers les pages | `Bouton` | `texte` (lien souligné dans le flux) |

### Nouveau composant nécessaire : `Conversation`

Aucun composant existant ne porte la sémantique d'un **journal d'échanges**
(`role="log"`). `Message` sert aux retours de l'interface (statut, alerte) ;
l'utiliser pour chaque réponse ferait annoncer chaque tour comme une alerte.

Contrat (≤ 5 props, sans texte en dur) :

| Prop | Type | Rôle |
|---|---|---|
| `echanges` | `Array<{role: "visiteur"\|"assistant", texte: string, liens?: Array<{libelle, href}>, lang?: string}>` | contenu affiché, en texte |
| `etiquette` | chaîne | nom accessible du journal (dictionnaire) |
| `libelles` | `{visiteur, assistant}` | étiquettes de chaque tour (dictionnaire) |
| `vide` | HTML | contenu quand il n'y a encore aucun échange (accueil) |

Rendu : une liste `<ol role="log" aria-live="polite" aria-relevant="additions">`.
Chaque tour = une étiquette en `texte-etiquette` (police mono, comme les
étiquettes de `Champ`) et un paragraphe `texte-corps`. Les tours sont séparés
par le filet existant (`--filet`), comme les listes séparées du CV. Pas de
bulles, pas de couleurs de fond par rôle. Jetons uniquement ; aucune règle
dépendant d'une page.

### Gabarit `Assistant`

Assemblage pur (`Design_System/gabarits/Assistant/`) : Modale + Conversation +
formulaire + messages. Comportement séparé (`activerAssistant`), comme les
études de projet. Il ne redéfinit l'intérieur d'aucun composant.

Aucun écran d'administration propre : les textes éditoriaux de MarcoS vivent
dans `content/site.json` (`assistant`) et s'éditent dans **Paramètres**, au
**CMS Git (Sveltia) de `/admin/`**. `tools/cms.mjs` génère la configuration du
CMS à partir de la forme des données : le champ apparaît de lui-même au build
suivant, sans configuration écrite à la main.

> **Corrigé le 2 octobre 2026.** Ce paragraphe renvoyait à « l'éditeur généré de
> `Gabarit_Bo` », c'est-à-dire à l'ancien back-office Supabase — **en sommeil
> depuis le 1er octobre, et qui n'a jamais servi**
> ([ADMIN_EN_SOMMEIL.md](ADMIN_EN_SOMMEIL.md)). Suivre cette indication aurait
> conduit à préparer un écran dans un back-office éteint. Le CMS en service est
> Sveltia, et sa chaîne est éprouvée de bout en bout (PM-005).

## Contenu et textes

| Texte | Source | Qui l'écrit |
|---|---|---|
| Message d'accueil | `content/site.json` → `assistant.accueil` (FR/EN) | Marc (D-9) |
| Exemples de questions | `assistant.exemples[]` (FR/EN) | Marc (D-9) |
| Mention de confidentialité | `assistant.confidentialite` (FR/EN) | Marc (D-9) |
| Activation | `assistant.active` (booléen) | Marc, dans Paramètres |
| Libellés (Envoyer, Fermer, Vous, MarcoS, erreurs…) | `Design_System/i18n/fr.json` et `en.json`, clé `assistant` | interface |

Aucun de ces textes n'est rédigé par une IA. Tant que l'accueil n'est pas
écrit, `assistant.active` reste `false` et MarcoS n'est pas rendu. Sans
exemples, la zone d'exemples n'apparaît pas.

**Décision D-9 :** Marc écrit ces trois textes **lui-même, dans `/admin/` →
Paramètres**. Le champ `assistant` apparaîtra de lui-même dans l'éditeur dès
qu'il existera dans `content/site.json` : `tools/cms.mjs` génère la
configuration du CMS à partir de la forme des données. La chaîne est éprouvée
depuis le 2 octobre (PM-005). Ni branche, ni pull request, ni intermédiaire.

**Décision D-17 : les exemples de questions suffisent.** `MARCOS.md` §6
prévoyait trois actions d'accueil distinctes — « Découvrir mon travail », « Voir
mon parcours », « Me poser une question ». Elles **sont** des questions
déguisées : un second mécanisme à concevoir, tester et traduire pour le même
résultat. Les trois intentions se réécrivent en exemples, à la troisième
personne et au vouvoiement (D-15).

**Décision D-15 : MarcoS parle de Marc à la troisième personne et vouvoie le
visiteur.** Les libellés du dictionnaire et les textes de Marc suivent cette
règle. MarcoS ne dit jamais « mon travail » : il n'est pas Marc.

## Parcours

1. **Ouverture** : la présence flottante en bas à droite ouvre la Modale ; le focus
   va dans le champ de question. Contact et menu peuvent aussi ouvrir la même Modale.
2. **Accueil** : message d'accueil, exemples de questions, mention de
   confidentialité.
3. **Question** : saisie (500 caractères au plus, compteur dans l'aide) ;
   `Entrée` envoie, `Maj + Entrée` passe à la ligne ; un exemple cliqué est
   envoyé tel quel.
4. **Attente** : le tour du visiteur s'ajoute au journal ; `Message chargement`
   sous le journal ; le bouton Envoyer passe à l'état `chargement` ; le champ
   reste modifiable.
5. **Réponse** : le tour de MarcoS s'ajoute au journal (une seule annonce) ;
   les liens internes s'affichent sous la réponse. **Deux à trois phrases, pas
   plus** : la réponse tient dans un paragraphe court, et le renvoi vers la page
   porte le reste. C'est un critère de conception, pas une préférence de mise en
   page — `max_tokens` vaut 180.
6. **Erreur** : `Message erreur` avec « Réessayer » qui renvoie la même question ;
   la question n'est pas perdue.
7. **Fermeture** : Échap, bouton Fermer ou clic hors de la fenêtre ; le focus
   revient au bouton d'ouverture. La conversation est gardée dans
   `sessionStorage` (onglet courant seulement) ; « Effacer la conversation »
   la supprime. Jamais `localStorage`, jamais de stockage serveur.

**Décision D-16 : aucune mémoire de navigation.** Seule la **page courante** est
transmise au Worker, dans le champ `page`. MarcoS peut donc dire « vous regardez
le projet Orange, je peux… », mais il ne garde pas la liste des pages visitées et
ne propose pas de suggestions fondées sur elle. La mémoire de navigation
envisagée par `MARCOS.md` §10 est une décision à part, à rouvrir une fois MarcoS
en service : c'est la première fonction qui constituerait un profil de
comportement, même local.

## États

| État | Rendu | Accessibilité |
|---|---|---|
| vide | accueil + exemples | — |
| saisie invalide (vide ou trop longue) | Envoyer désactivé ; erreur du `Champ` si trop long | `aria-invalid`, `aria-describedby` |
| chargement | `Message chargement` | `role="status"`, `aria-busy="true"` sur le journal |
| succès | nouveau tour | `role="log"`, annonce polie |
| `trop_de_demandes` | `Message attention` avec le délai | `role="status"` |
| `quota_journalier`, `indisponible`, `delai_depasse` | `Message erreur` + e-mail de contact (`Bouton nu`) | `role="alert"` |
| `requete_invalide`, `trop_long` | erreur du `Champ` | `aria-invalid` |
| hors ligne | `Message erreur` | `role="alert"` |

Les textes de chaque état viennent du dictionnaire (`assistant.erreurs.<code>`) :
le Worker ne renvoie que le code.

## Clavier, focus, lecteurs d'écran

- Tout est atteignable au clavier ; cibles de 44 px (Bouton, Saisie).
- Ordre : fermer, effacer, journal, exemples, champ, envoyer.
- Le focus ne quitte pas le champ après un envoi ; la réponse est annoncée par
  le journal, sans voler le focus.
- Les réponses sont annoncées **une fois, complètes** (pas de diffusion mot à mot
  en V1 : un flux ferait lire des fragments).
- Langue : chaque tour porte `lang` si sa langue diffère de celle de la page.

## Mobile et bureau

- Une seule Modale `centre`, qui occupe la largeur moins la marge d'écran sur
  téléphone (comportement actuel de l'étude de projet). La présence flottante
  reste en bas à droite et utilise uniquement les tokens du Design System.
- Le champ reste visible au-dessus du clavier virtuel (`max-height` en `dvh`,
  déjà utilisé par la Modale).
- Testé à 320, 375, 768, 850, 1024 et 1440 px, en clair et en sombre.

## Animations

Seules les animations existantes de la Modale. Aucun effet de frappe, aucune
pulsation, aucun indicateur décoratif. `prefers-reduced-motion` et
`data-animations="reduites"` sont déjà gérés par la Modale.

## Sans JavaScript, ou si MarcoS est indisponible

- Sans JavaScript : MarcoS n'est pas rendu (gabarit dans un `<template>`,
  comme l'accueil animé) ; le lien d'ouverture est masqué hors `html.js-anime`.
  La section Contact garde ses liens habituels.
- Sans adresse d'endpoint au build (`ASSISTANT_URL` absente) ou si
  `assistant.active` vaut `false` : rien n'est rendu.
- Worker indisponible : message d'erreur et lien e-mail ; le reste du site
  n'est pas touché.

## Sécurité côté interface

- Réponses insérées comme **texte** (`textContent` ou gabarit `html` qui échappe).
- Liens : seulement ceux renvoyés dans `liens`, déjà validés par le Worker
  (adresses internes) ; le navigateur vérifie encore qu'ils commencent par `/`.
- Aucune clé, aucun nom de modèle dans le navigateur.
