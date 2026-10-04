# État du chantier « Gabarit_Projet »

**Fiche de reprise.** Écrite pour qu'une autre IA, ou une autre session, puisse
continuer ce travail **sans aucun contexte de conversation**. Tout ce qui est
nécessaire est ici ou désigné par son chemin exact.

- Dernière mise à jour : **2 octobre 2026**
- Branche : `pm-110-projets-par-discipline`
- Commit : « Créer le gabarit central des projets »
- **Non poussé.** Marc a demandé une sauvegarde locale seule.
- Référence de `npm run comparer-reference` : `f48646f`

---

## 1. Ce qui a été fait, en deux phases

**Phase A — filtre par discipline.** La section « Mes projets » est devenue une
bibliothèque filtrable : un catalogue de disciplines éditable dans le CMS, un
rattachement par projet, un filtre qui masque sans recharger.

**Phase B — gabarit central.** Un projet n'était rendu nulle part de façon
unifiée. `Gabarit_Projet` est né de ce constat.

Le design n'a pas changé. Aucune URL n'a changé. Aucun projet n'a disparu.

---

## 2. Pourquoi `Gabarit_Projet` existe

Avant lui, un projet était rendu à **trois endroits qui ne se parlaient pas** :
la carte du sommaire, l'étude, la page dédiée. Chacun recalculait le chemin de
données, le titre et la liste des médias — la même expression de résolution des
médias était écrite **deux fois, mot pour mot**.

Plus grave : le **contrat qui relie la carte à la modale** était éparpillé sur
trois fichiers.

| Membre du contrat | Était écrit par | Est lu par |
|---|---|---|
| `data-etude="<id>"` | la carte | `activerEtudes` |
| `data-compteur` | la carte | `activerEtudes` |
| `aria-haspopup="dialog"` | la carte | les technologies d'assistance |
| `id="etude-<id>"` sur le titre | l'étude | `aria-labelledby` de la modale **et** de la page |

En changer un seul membre cassait l'ouverture **sans qu'aucun fichier ne le
dise**, et sans qu'aucun test ne l'attrape. Ce contrat vit désormais dans
`vueProjet`, en un seul endroit.

**Règle à retenir** : si un comportement concerne TOUS les projets, il
appartient à `Gabarit_Projet`, jamais à une vue particulière.

---

## 3. Rôle central et architecture

```
content/projets.json ──► Gabarit_Projet
                           ├─ vueProjet()      résolution UNIQUE
                           ├─ parcours()       ordre de lecture, précédent / suivant
                           ├─ MODES            carte · etude · modale · page
                           └─ activerProjets() UN SEUL branchement navigateur
                                 ├─ activerFiltresProjets   (affichage du filtré)
                                 └─ activerEtudes           (ouverture, importé de Projet_etude)

   mode carte  ──► Projet_carte   (disposition seule, reçoit la vue)
   mode etude  ──► Projet_etude   (disposition seule, reçoit la vue)
   mode modale ──► ModaleEtude    (réceptacle vide, seul mode sans projet)
   mode page   ──► planche + bouton retour + étude

   PageProjet  ──► enveloppe du document, appelle le mode page
   Segments    ──► sélection (dessine les options, aria-pressed, annonce le choix)
```

Fichiers :

| Chemin | Rôle |
|---|---|
| `Design_System/gabarits/Gabarit_Projet/Gabarit_Projet.js` | la couche centrale |
| `Design_System/gabarits/Gabarit_Projet/Gabarit_Projet.css` | la composition du mode `page` |
| `Design_System/gabarits/Gabarit_Projet/Gabarit_Projet.md` | **contrat détaillé du gabarit — à lire avant d'y toucher** |
| `Design_System/gabarits/Projet_carte/` | vue carte (js + css + md) |
| `Design_System/gabarits/Projet_etude/` | vue étude, réceptacle modale, chargement (js + css + md) |
| `Design_System/gabarits/sections/Projets.js` | la section du sommaire : titre, modèle du filtre, grille |
| `Design_System/gabarits/sections/Pages.js` | `PageAccueil`, `PageProjet`, `PageCv` |
| `Design_System/composants/Segments/` | le contrôle de sélection (js + css + md) |
| `Frontend/site.js` | ne connaît plus qu'`activerProjets(document)` |
| `Design_System/styles/Index.css` | importe `Gabarit_Projet.css` avant les vues |

**Attention aux cycles d'import.** `activerFiltresProjets` vit dans
`Gabarit_Projet.js`, PAS dans `sections/Projets.js` : la section importe le
gabarit, le gabarit ne doit jamais réimporter la section.

---

## 4. API

```js
import { Gabarit_Projet, vueProjet, parcours, activerProjets, activerFiltresProjets, MODES }
  from "…/gabarits/Gabarit_Projet/Gabarit_Projet.js";
```

### `Gabarit_Projet({ projet, ctx, mode, options })`

Point d'entrée unique du rendu.

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `projet` | objet \| `null` | `null` | Requis sauf en mode `modale`. Sinon le gabarit **lève**. |
| `ctx` | contexte | — | Langue et page (`ctx.t`, `ctx.c`, `ctx.l`, `ctx.media`, `ctx.pageProjet`). |
| `mode` | `carte` \| `etude` \| `modale` \| `page` | `carte` | Un mode inconnu **lève**. |
| `options` | objet | `{}` | `rang`, `total` (carte) · `niveau` (étude) · `retour` (page). |

### `vueProjet({ projet, ctx, rang, total })`

La vue résolue. Champs : `id` · `chemin` · `titre` · `titreHtml` · `categorie` ·
`categorieHtml` · `description` · `contexteHtml` · `ideeHtml` · `valeurHtml` ·
`periode` · `disciplines` · `lien` · `idEtude` · `numero` · `compteur` ·
`medias` · `document` · `champs` · `ouverture`.

Deux formes coexistent pour certaines valeurs (`titre` / `titreHtml`) et ce
n'est **pas** une redondance : le texte brut entre dans un modèle du
dictionnaire ou dans une métadonnée, le HTML porte le balisage `lang="…"`
quand la traduction manque et qu'on retombe sur le français.

Sans `rang`/`total`, `numero` et `compteur` valent `null` et `ouverture` ne
porte pas `data-compteur` : la vue n'invente jamais une position.

### `parcours(projets, id)`

Fonction pure : `{ rang, total, precedent, suivant }`. Un `id` inconnu rend
`{ rang: -1, precedent: null, suivant: null }`. **Aucune UI ne la consomme
aujourd'hui** (voir arbitrage 1) : elle tient l'ordre de lecture et alimente le
compteur.

### `activerProjets(racine = document)`

Un seul branchement navigateur : filtres puis ouverture, **dans cet ordre** (le
filtre pose son groupe de boutons dans la page, l'ouverture écoute ensuite).

---

## 5. Séparation des responsabilités

| Élément | Responsabilité | Ne fait jamais |
|---|---|---|
| `content/projets.json` | les **données** : titre, textes, médias, années, `categories` | aucun comportement |
| `content/sections.json` → section `projets`, clé `categories` | le **catalogue** des disciplines : `{ id, libelle: {fr, en} }` | aucun rattachement |
| `Segments` | la **sélection** : dessine les options, tient `aria-pressed`, annonce le choix | ne connaît pas les projets |
| **`Gabarit_Projet`** | le **comportement** et la **résolution** : vue, modes, ouverture, filtrage, parcours | ne contient aucune donnée |
| `Projet_carte` | la **disposition** d'une carte | ne lit plus l'enregistrement |
| `Projet_etude` | la **disposition** d'une étude + le réceptacle modale + le chargement | ne lit plus l'enregistrement |
| `PageProjet` | l'**enveloppe** : document, en-tête, menu, métadonnées, lien de retour | ne rend plus le projet lui-même |
| `sections/Projets.js` | la **section** : titre, modèle `<template>` du filtre, grille | ne porte plus de comportement |

---

## 6. Contrats importants

1. **Contrat d'ouverture** (`vue.ouverture`) : `data-etude`, `aria-haspopup="dialog"`,
   et `data-compteur` quand la position est connue. Posé sur le lien d'entrée
   de la carte, lu par `activerEtudes`.
2. **Identifiant du titre d'étude** : `etude-<id>`, porté par le `Titre` de
   l'étude, repris en `aria-labelledby` par la planche de la page **et** par la
   modale. S'ils divergent, le dialogue s'ouvre sans nom accessible.
3. **Attribut de filtrage** : `data-disciplines="a b c"` sur chaque
   `article.projet-carte`. C'est la seule source du filtre : **aucune liste de
   projets n'existe côté script**.
4. **Le filtre dort dans un `<template data-filtres-projets>`.** Sans
   JavaScript, aucun bouton de filtre n'est posé — un bouton qui ne filtre rien
   vaut moins que pas de bouton.
5. **Carte masquée = `hidden`.** Elle sort de la mise en page **et** de l'arbre
   d'accessibilité au même instant. Rien n'est détruit ni recréé : pas de
   rechargement, images conservées.
6. **Le numéro ne bouge pas avec le filtre.** « Projet 07 / 11 » désigne la
   position dans l'ensemble des projets, pas dans le filtre actif.
7. **L'entrée d'un projet est un vrai lien** vers `projets/<id>/` : sans
   JavaScript, on y navigue.
8. **Un seul `h1` par page.** `activerEtudes` abaisse le `h1` de l'étude en `h2`
   quand elle entre dans la modale.

---

## 7. Règle ZERO HARD-CODE

Aucun fichier de présentation ne doit contenir :

- une liste de projets ;
- une liste de catégories ;
- un titre de projet ;
- une image de projet ;
- une relation projet / catégorie ;
- une donnée éditoriale.

Les libellés d'interface viennent du dictionnaire (`ctx.t`,
`Design_System/i18n/{fr,en}.json`), les textes éditoriaux du contenu (`ctx.c`,
`ctx.l`, `content/`). **Si une donnée manque, on corrige le modèle de contenu,
jamais le composant.**

Trois garde-fous automatiques :

| Contrôle | Où |
|---|---|
| 51 identifiants et libellés réels cherchés dans 97 fichiers de présentation | `tests/projets-filtres.test.mjs` (+ son témoin) |
| aucun texte littéral dans un gabarit ni dans `Frontend/site.js` | `tests/riendur.test.mjs` |
| les vues spécialisées ne lisent plus l'enregistrement du projet | `tests/gabarit-projet.test.mjs` |

Au dernier passage : **1 occurrence trouvée, et c'est un faux positif
acceptable** — le mot `aurex` apparaît dans un commentaire d'exemple de
`Design_System/i18n/langue.js`, préexistant à ce chantier.

---

## 8. Modèle de données

`content/projets.json`, chaque projet :

```json
"categories": ["identite-charte", "logotype"]
```

Des **identifiants**, jamais des libellés. Un projet peut en porter plusieurs
sans être dupliqué.

`content/sections.json`, section de type `projets` :

```json
"categories": [
  { "id": "logotype", "libelle": { "fr": "Logotype", "en": "Logotype" } }
]
```

Huit disciplines déclarées. « Tous » n'en est **pas** une : c'est un état
d'interface, son libellé vit dans `i18n/{fr,en}.json` sous `projet.filtres`
(`tous`, `etiquette`, `aucun`).

Rattachements au 2 octobre 2026 :

| Projet | Disciplines |
|---|---|
| fifa26 | campagne-publicitaire, direction-artistique |
| world-cola | campagne-publicitaire, direction-artistique |
| beninoise | campagne-publicitaire, direction-artistique |
| anacadi | campagne-publicitaire, direction-artistique, print-edition |
| ceeli | identite-charte, logotype |
| velanova | identite-charte, logotype, direction-artistique |
| aurex | identite-charte, logotype, print-edition |
| ferov | identite-charte, logotype, direction-artistique |
| voon | identite-charte, logotype |
| tp-solutions | print-edition |
| ci20-connect | digital-ui-ux |

Comptes : direction-artistique 6 · identite-charte 5 · logotype 5 ·
campagne-publicitaire 4 · print-edition 3 · digital-ui-ux 1 ·
3d-production 0 · motion-audiovisuel 0.

**Critère de rattachement à « direction artistique »**, appliqué depuis les
données et non supposé : le projet déclare la construction d'un **univers** ou
d'un **territoire visuel**, dans `role` ou dans `disciplines`. Marqueurs
cherchés : « univers visuel », « territoire visuel », « univers de campagne »,
« conception de l'univers ».

Validation au build (`Design_System/gabarits/donnees.js`) : identifiants du
catalogue uniques et conformes à `^[a-z0-9-]+$`, libellé requis dans la langue
par défaut, et tout rattachement vers une discipline inexistante est refusé.

CMS (`tools/cms.mjs`) : les disciplines d'un projet sont un **choix multiple**
alimenté par le catalogue, pas une saisie libre. L'aide du champ `id` dépend de
ce qu'il identifie (projet → adresse de page ; catégorie →
`editeur.aideIdentifiantCategorie`).

---

## 9. Comportement mobile du filtre

Sous 850 px, la rangée de filtres **défile horizontalement** au lieu de
s'empiler : sept disciplines occupaient jusqu'à six rangs à 320 px et
repoussaient le premier projet de 268 px.

| Largeur | Rangs | Coût en hauteur | Défile |
|---|---|---|---|
| 320 | 1 | 96 px | oui |
| 375 | 1 | 96 px | oui |
| 768 | 1 | 96 px | non (tout tient) |
| 1024 | 2 | 115 px | non |
| 1440 | 1 | 81 px | non |

Détails qui ne doivent pas se perdre :

- `overflow-x: auto` rend aussi l'axe vertical scrollable : une marge
  (`--projets-filtres-marge-defilement: 8px`) empêche le rognage du contour de
  focus (2 + 4 px) et de la cible tactile de 44 px ;
- la barre de défilement native est retirée — c'est la dernière option à demi
  coupée qui signale la suite ;
- toute sonde `elementFromPoint` sur ces options doit d'abord les amener dans le
  champ (`scrollIntoView`), sinon elle mesure l'absence d'écran et non la cible.

`Segments` a reçu une 5ᵉ prop `variante: "pilule" | "nue"`. « nue » retire
l'enveloppe et laisse les options passer à la ligne. Les quatre usages
existants (sélecteurs de langue) rendent exactement le même HTML qu'avant.

---

## 10. Tests existants

| Fichier | Nombre | Couvre |
|---|---|---|
| `tests/gabarit-projet.test.mjs` | 16 | les 4 modes, mode inconnu, modale sans projet, vue partagée, médias identiques carte/étude, contrat d'ouverture, identifiant du titre, parcours et ses bornes, 11 projets × FR/EN, URL inchangées, zéro hard-code, vues qui ne lisent plus l'enregistrement |
| `tests/projets-filtres.test.mjs` | 19 | catalogue sain, rattachement par identifiant, aucun orphelin, validation, « Tous », filtre exact, multi-disciplines sans doublon, discipline vide, rendu du filtre FR/EN, sans JavaScript, CMS (aide de l'`id`, choix multiple), critère de direction artistique, détecteur de hard-code + témoin |
| `tests/navigateur/site.test.mjs` | 9 sur les projets (30 au total) | clic, clavier, `aria-pressed` exclusif, carte masquée hors de l'arbre d'accessibilité, rangée horizontale 320/375/768, contour de focus non rogné, débordement 320→1440, EN, sans JavaScript |
| `tests/riendur.test.mjs` | — | aucun texte en dur dans les pages rendues ni dans les gabarits |

Commandes :

```
npm test                 138/138
npm run build            26 pages, 110 médias, 0 champ à traduire
npm run test:navigateur   30/30
npm run verifier         les trois à la suite
npm run comparer-reference   dérive attendue : la seule section « sommaire »
```

`comparer-reference` signale 12 configurations différentes de `f48646f`, toutes
sur la section `sommaire` et toutes égales à la hauteur du filtre
(95 / 95 / 95 / 77 / 114 / 81 px, en clair et en sombre). **C'est attendu** :
le filtre n'existait pas dans la référence. Le gabarit central, lui, n'a
introduit aucune dérive. Quand Marc validera, porter la référence sur le
nouveau commit de `main` — procédure décrite dans l'en-tête de
`tools/comparer-reference.mjs`.

Contrôle complémentaire exécuté une fois, non automatisé : 11 pages projet ×
FR/EN × clair/sombre (44 ouvertures, un seul `h1`, planche nommée, galerie
présente, 0 erreur console), 11 ouvertures de modale avec `Escape` et retour du
focus, chaque catégorie à 5 largeurs sans débordement. **0 échec.**

---

## 11. Décisions en attente — NE PAS TRANCHER SEUL

Ces quatre points attendent **Marc**. Les documenter, pas les décider.

### 11.1 Navigation précédent / suivant

`parcours()` existe, est testée sur ses bornes, et **aucune interface ne la
consomme**. Elle a été écrite comme siège d'une navigation entre projets dans
la modale, mais aucun bouton n'a été ajouté : la consigne était de ne pas
changer le design pour créer le composant.

Trois variantes possibles : flèches visibles dans la modale · navigation au
clavier (←/→) sans UI visible · rien pour l'instant. **Marc tranche.**

### 11.2 Résolution complète ou paresseuse

`vueProjet` résout **tous** les champs, même ceux que le mode n'utilise pas :
une carte résout aussi `ideeHtml`, `valeurHtml`, `document`, `champs`.

- C'est le prix de la garantie « carte et étude disent la même chose ».
- Coût mesuré : **nul** (build à 15 s, inchangé).
- Rendre la résolution paresseuse rouvrirait la porte à deux résultats
  différents selon le mode.

**Marc tranche.** Ne pas optimiser sans son accord.

### 11.3 World Cola → Direction artistique

`world-cola` est rattaché à `direction-artistique`, **et la donnée ne le
justifie pas franchement** :

- son `role` est **mot pour mot** celui de `fifa26`, `beninoise` et `anacadi` —
  « Direction artistique · réflexion · conception de campagne » ;
- mais c'est la seule des quatre campagnes dont les `disciplines` ne nomment ni
  univers ni territoire visuel (« Concept · création publicitaire · supports de
  campagne »).

Le rattachement actuel a été **conservé** plutôt qu'inventé, conformément à la
consigne. Le retirer, c'est une ligne dans `content/projets.json`.
**Marc tranche.**

### 11.4 Catégories sans projet

`3d-production` et `motion-audiovisuel` sont déclarées au catalogue mais
**aucun projet ne les revendique** : aucun média vidéo ni rendu 3D identifiable
dans les données.

Conséquence actuelle, voulue : `disciplinesProposees()` ne les affiche pas —
un filtre qui ne rend rien est une impasse, pas une proposition. Elles
réapparaîtront d'elles-mêmes dès qu'un projet les portera, sans toucher au
code.

Options : laisser en l'état · rattacher des projets existants · retirer du
catalogue. **Marc tranche.**

---

## 12. Reprendre le travail

1. Lire `AGENTS.md` à la racine : c'est le cadre de travail (§3.2 réutiliser
   avant de créer, §3.3 aucune valeur brute hors `Tokens.css`, §3.4 vérifier au
   navigateur à 320/375/390/768/1024/1280/1440 en clair et en sombre, §5.5
   issue → branche → PR, §6.2 les issues GitHub font foi).
2. Lire `Design_System/gabarits/Gabarit_Projet/Gabarit_Projet.md` : le contrat
   détaillé du gabarit, y compris « comment ajouter un mode ».
3. Lancer `npm run verifier` avant toute modification, pour partir d'un état
   connu.
4. **Ne pas pousser sans l'accord de Marc.** Le travail est sauvegardé
   localement sur `pm-110-projets-par-discipline`, jamais sur `main`.
5. Les quatre arbitrages du §11 restent ouverts : les documenter, ne pas les
   décider.
