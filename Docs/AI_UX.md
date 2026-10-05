# MarcoS — interface et accessibilité

Arrêté le 2 octobre 2026 par les décisions de Marc
([MARCOS_DECISIONS.md](MARCOS_DECISIONS.md)). Voir
l'[architecture](AI_ARCHITECTURE.md).

Quatre décisions commandent ce document : **D-4** (entrée dans Contact et le
menu), **D-13** (avatar, **remplacée par D-38** : plus de V2), **D-15** (troisième
personne, vouvoiement) et **D-17** (exemples de questions seuls).

## Intention

Répondre **en deux à trois phrases** à une question sur Marc, ses projets, son
parcours, ses compétences ou ses prestations, puis renvoyer vers la page qui en
parle. MarcoS **appartient au portfolio** : mêmes polices, couleurs, filets,
rayons et boutons.

**En V1, il n'apporte aucun élément graphique nouveau** : pas de présence
flottante, pas d'avatar, pas de robot, pas de dégradé, pas de lueur, pas d'effet
de frappe.

### « Pas en V1 », et non « jamais » — décision D-13

Ce document interdisait l'avatar et la présence flottante sans réserve, alors
que [MARCOS.md](MARCOS.md) §3 et §5 les demandent : une figurine 3D et une
« présence discrète en bas à droite » dont « la figurine est le point d'entrée ».
Les deux documents se contredisaient.

**Décision D-38 (4 octobre 2026) : il n'y a plus de V2.** Le découpage en deux
paliers — une première version sans figurine, une seconde avec — est abandonné.
Tout relève de la version en cours.

| Élément | État |
|---|---|
| Entrée dans la section Contact (`Bouton nu`) et dans le menu | **en place** |
| Présence flottante en bas à droite | **en place** (D-39) : buste posé sur une barre compacte, `position: fixed`, troisième point d'entrée vers le même panneau |
| Figurine 3D | **rendue** : sept des dix expressions validées, une par état, publiées en WebP à transparence conservée |
| Cadrage du buste | **ouvert** : les fichiers montrent le personnage aux trois quarts en 783 × 667, là où un buste carré est demandé ([#49](https://github.com/marco-mancini/marckouassi.com/issues/49)) |

Rien de tout cela n'est publié tant que `site.assistant.active` reste à `false`.

Ce qui reste interdit **sans réserve et dans toutes les versions** : dégradé,
glassmorphism, lueur, néon, effet de frappe, carte générique de SaaS, couleur ou
typographie étrangère au Design System.

## La présence flottante et ses états (D-39, D-40)

L'interface est celle de la maquette d'interaction fournie par Marc le 5 octobre
2026. Les écarts assumés avec elle sont listés dans
[DECISIONS.md](DECISIONS.md) → D-40 ; il n'en existe pas d'autre.

### Structure : deux socles

`.marcos` est fixe en bas à droite et contient deux socles. Le buste est
`position: absolute; bottom: 100 %` de son socle : il est **posé** sur son
porteur, jamais devant ni derrière. Comme le porteur change — la barre quand
c'est fermé, le panneau quand c'est ouvert — il y a un buste par socle, et un
seul est visible. Une ombre de contact elliptique au ras du bord fait qu'il
repose sur quelque chose au lieu de flotter.

À l'ouverture : le buste passe sur le panneau, centré aux trois quarts de sa
largeur ; la barre se rétracte à 75 % et se centre dessous.

### La barre

Trois commandes — ouvrir, activité, effacer — séparées par deux filets, sur un
fond d'encre dans les deux thèmes. L'onde de cinq barreaux est décorative
(`role="img"` avec un nom depuis le dictionnaire) ; son amplitude et son rythme
suivent l'état. « Effacer » est **désactivé** tant que rien n'a été dit : la
barre garde ses trois emplacements et ne change pas de largeur.

### Le panneau

`Modale` variante `ancre`, avec `modal: false` : ouvert par `show()`, donc **le
portfolio reste parcourable**, le défilement n'est pas verrouillé et le focus
n'est pas piégé — ce qui est le bon comportement pour un assistant persistant.
Échap est rendu à la main, puisque l'évènement natif `cancel` n'existe que pour
une modale. Le focus revient à la barre à la fermeture.

Hauteur bornée, défilement interne, `overscroll-behavior: contain`. Jamais de
plein écran, jamais de croissance infinie.

### Les sept états

Sept états d'exécution, pas dix. Les dix fichiers de `Public/Avatar_MarcoS/`
sont une **bibliothèque d'expressions** : six états en déclarent une, `hover`
retombe sur celle du repos, et trois expressions ne servent à aucun état.

| État | Déclencheur | Expression | Barre |
|---|---|---|---|
| `rest` | au chargement, à la fermeture | Neutre / disponible | onde vivante, le buste respire |
| `hover` | le pointeur entre sur MarcoS | celle du repos | la barre se soulève, le buste aussi, l'ombre se resserre |
| `open` | le panneau s'ouvre | Bienvenue | l'onde se met en veille |
| `listening` | le visiteur écrit | À l'écoute | l'onde s'accélère |
| `thinking` | la demande part | Réflexion | **mouvement différent** : le buste se balance, l'onde ralentit et change de teinte. Une bulle de trois points tient la place de la réponse |
| `responding` | la réponse arrive | Idée / suggestion | micro-mouvement du buste, onde pleine ; le texte s'écrit lettre à lettre, curseur compris |
| `end` | la réponse est écrite, 1,4 s | Succès / félicité | tout ralentit, puis retour à `open` |

Un seul `data-etat`, sur `.marcos`, pilote le buste, la barre et le panneau.
Aucune animation ne tourne sans rapport avec l'état réel.

### Le mouvement

Rien n'est statique. L'ouverture est une cascade — en-tête, fil, saisie,
mention — sur moins d'un tiers de seconde, avec un léger dépassement d'échelle.
Chaque bulle arrive de **son** côté. Les suggestions se posent l'une après
l'autre. Le bouton d'envoi se contracte au départ d'une question, le compteur
bat quand il passe sous son seuil, les commandes de la barre prennent un halo
au survol.

### Téléphone

Sous 520 px : `.marcos` prend la largeur utile moins les gouttières, le panneau
avec, et sa hauteur maximale tient compte des safe areas. Mesuré : aucun
débordement du viewport, champ de saisie toujours atteignable.

### Accessibilité

- le buste et l'onde sont `aria-hidden`, l'image porte `alt=""` : **aucune
  information ne passe par l'avatar seul** ;
- le champ a une étiquette invisible mais reliée, en plus de son invite ;
- le compteur visible est `aria-hidden` ; la phrase complète du dictionnaire
  l'accompagne, invisible, en `aria-live` ;
- `aria-expanded`, `aria-haspopup="dialog"`, `aria-controls` sur les trois
  entrées ; Échap ferme ; le focus revient à la barre ;
- `prefers-reduced-motion` coupe **toutes** les boucles et toutes les entrées
  animées, et la frappe progressive est désactivée côté script : le texte
  arrive d'un coup. Les éléments restent à leur place, visibles.

### Performance

Une seule expression par socle est demandée au premier affichage. Les autres
portent `hidden` et `loading="lazy"` : le navigateur ne les réclame qu'à leur
état. Sept expressions publiées en WebP à transparence conservée.

## Réutilisation du Design System

Tous les éléments existent déjà, sauf la liste des échanges.

| Besoin | Composant existant | Variante |
|---|---|---|
| Ouvrir MarcoS | `Bouton` | `nu` dans la section Contact (même ligne que les autres liens) ; lien du menu ; et la barre du lanceur, qui est elle-même le bouton |
| Présence flottante | `LanceurAssistant` | le seul élément neuf : buste + barre. Aucun composant existant ne faisait cela |
| Panneau | `Modale` | `ancre` (D-39) : `<dialog>` natif — focus piégé, Échap, retour du focus inchangés — mais posé au-dessus du lanceur, borné, fond transparent |
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

> **Mise à jour du 4 octobre 2026 — D-37.** Les quatre textes sont écrits et vivent dans `content/site.json` → `assistant`. Ils restent éditables dans `/admin/` → Paramètres. `assistant.active` reste `false` : l'activation est un geste de Marc, et elle demande en outre `ASSISTANT_URL`. Voir [DECISIONS.md](DECISIONS.md) → D-37.

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

1. **Ouverture** : le lien « Contact » de MarcoS ouvre la Modale ; le focus
   va dans le champ de question.
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
  téléphone (comportement actuel de l'étude de projet). Aucun nouveau point de
  rupture.
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
