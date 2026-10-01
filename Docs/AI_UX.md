# Assistant — interface et accessibilité

Vérifié le 1er octobre 2026. Voir l'[architecture](AI_ARCHITECTURE.md).

## Intention

Répondre vite à une question sur Marc, ses projets, son parcours, ses
compétences ou ses prestations, puis renvoyer vers la page qui en parle.
L'assistant **appartient au portfolio** : mêmes polices, couleurs, filets,
rayons et boutons. Il n'apporte aucun élément graphique nouveau : ni bulle
flottante, ni avatar, ni robot, ni dégradé, ni lueur, ni effet de frappe.

## Réutilisation du Design System

Tous les éléments existent déjà, sauf la liste des échanges.

| Besoin | Composant existant | Variante |
|---|---|---|
| Ouvrir l'assistant | `Bouton` | `nu` dans la section Contact (même ligne que les autres liens) ; lien du menu |
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

Le back-office n'a pas d'écran propre : les textes éditoriaux de l'assistant
vivent dans `content/site.json` (`assistant`) et s'éditent dans **Paramètres**,
par l'éditeur généré de `Gabarit_Bo`. Seuls des libellés de champs sont à ajouter
au dictionnaire admin.

## Contenu et textes

| Texte | Source | Qui l'écrit |
|---|---|---|
| Message d'accueil | `content/site.json` → `assistant.accueil` (FR/EN) | Marc (D-9) |
| Exemples de questions | `assistant.exemples[]` (FR/EN) | Marc (D-9) |
| Mention de confidentialité | `assistant.confidentialite` (FR/EN) | Marc (D-9) |
| Activation | `assistant.active` (booléen) | Marc, dans Paramètres |
| Libellés (Envoyer, Fermer, Vous, Assistant, erreurs…) | `Design_System/i18n/fr.json` et `en.json`, clé `assistant` | interface |

Aucun de ces textes n'est rédigé par une IA. Tant que l'accueil n'est pas
écrit, `assistant.active` reste `false` et l'assistant n'est pas rendu. Sans
exemples, la zone d'exemples n'apparaît pas.

## Parcours

1. **Ouverture** : le lien « Contact » de l'assistant ouvre la Modale ; le focus
   va dans le champ de question.
2. **Accueil** : message d'accueil, exemples de questions, mention de
   confidentialité.
3. **Question** : saisie (500 caractères au plus, compteur dans l'aide) ;
   `Entrée` envoie, `Maj + Entrée` passe à la ligne ; un exemple cliqué est
   envoyé tel quel.
4. **Attente** : le tour du visiteur s'ajoute au journal ; `Message chargement`
   sous le journal ; le bouton Envoyer passe à l'état `chargement` ; le champ
   reste modifiable.
5. **Réponse** : le tour de l'assistant s'ajoute au journal (une seule annonce) ;
   les liens internes s'affichent sous la réponse.
6. **Erreur** : `Message erreur` avec « Réessayer » qui renvoie la même question ;
   la question n'est pas perdue.
7. **Fermeture** : Échap, bouton Fermer ou clic hors de la fenêtre ; le focus
   revient au bouton d'ouverture. La conversation est gardée dans
   `sessionStorage` (onglet courant seulement) ; « Effacer la conversation »
   la supprime. Jamais `localStorage`, jamais de stockage serveur.

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
  téléphone (comportement actuel de l'étude de projet). Aucun nouveau point de
  rupture.
- Le champ reste visible au-dessus du clavier virtuel (`max-height` en `dvh`,
  déjà utilisé par la Modale).
- Testé à 320, 375, 768, 850, 1024 et 1440 px, en clair et en sombre.

## Animations

Seules les animations existantes de la Modale. Aucun effet de frappe, aucune
pulsation, aucun indicateur décoratif. `prefers-reduced-motion` et
`data-animations="reduites"` sont déjà gérés par la Modale.

## Sans JavaScript, ou si l'assistant est indisponible

- Sans JavaScript : l'assistant n'est pas rendu (gabarit dans un `<template>`,
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
