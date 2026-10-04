# Dette technique

Trois points repris de `RAPPORT-NUIT.md` (nuit du 29 septembre 2026, supprimé
le 1er octobre 2026), revérifiés sur le code de `main` le 1er octobre 2026,
plus un constat sur la vérification continue. Ce document dit lesquels
changent le rendu. Chaque point est suivi par une issue (voir
[ISSUES.md](ISSUES.md)).

Mis à jour le 2 octobre 2026 : les points 2 et 3 sont réglés (PM-019 ;
PM-020 et PM-045) ; le point 4 est en veille, son critère d'ouverture mesuré
non atteint.

Mis à jour le 4 octobre 2026 : le **point 1 est réglé** (PM-018,
[#18](https://github.com/marco-mancini/marckouassi.com/issues/18), fermée ;
PR #145, `a8fdb6a`). Le point 5 ouvre les constats du ménage architectural du
4 octobre.

## 1. Décalage des ancres — réglé

Suivi : PM-018 ([#18](https://github.com/marco-mancini/marckouassi.com/issues/18)),
**réglé le 4 octobre 2026** par la PR #145 (`a8fdb6a`). Décision de Marc :
24 px sur ordinateur, 16 px sous 850 px.

Un seul mécanisme porte désormais le dégagement —
`html { scroll-padding-top: calc(var(--header-height) + var(--ancre-degagement)) }`
dans `fondations/Theme.css`. Le `scroll-margin-top` de `.planche-scene` est
retiré, et les deux jetons qui doublonnaient la hauteur d'en-tête
(`--header-offset`, `--en-tete-hauteur-compact`) n'existent plus. Deux tests
navigateur mesurent l'écart réel et gardent la valeur.

Le constat d'origine, pour mémoire. Un saut vers une section (menu, lien « Le portfolio ↓ ») additionne deux
dégagements :

- `html { scroll-padding-top: var(--header-offset) }` (`fondations/Theme.css`) :
  76 px sur ordinateur, 62 px sous 850 px (`fondations/Responsive.css`) ;
- `.planche-scene { scroll-margin-top: … }` (`composants/Planche/Planche.css`) :
  82 px écrits en dur sur ordinateur, `var(--header-height)` (68 px) sous 850 px.

Mesuré le 1er octobre 2026 dans Chromium, de l'en-tête au haut de la
section : **90 px sur ordinateur (1440 px), 68 px sur téléphone (375 px)**.
Les « six pixels » relevés la nuit du 29 septembre (82 − 76) sont une partie
de cet écart.

Décision attendue : l'espace voulu entre l'en-tête et le titre d'une
section. Corriger déplace le point d'arrivée de chaque ancre.

## 2. Sept valeurs de géométrie d'animation — réglé

**Réglé le 2 octobre 2026** par PM-019 (#19, PR #84), sur autorisation
explicite de Marc malgré l'étiquette `decision-marc`. Une famille
`--motion-*` est ouverte dans `Tokens.css`, nommée par rôle, aux valeurs
reprises au caractère :

| Animation | Avant, en dur | Après |
|---|---|---|
| `planche-entree` | `translateY(14px)`, `scale(.995)` | `--motion-planche-montee`, `--motion-planche-echelle` |
| `couverture-revelation` | `translateY(22px)` | `--motion-couverture-montee` |
| `etape-entree` | `scale(.97)` | `--motion-etape-echelle` |
| `point-battement` | `scale(1.18)`, ombre `6px` | `--motion-point-echelle`, `--motion-point-halo` |
| `sceau-ouverture` | `scale(.85)`, `rotate(-12deg)` | `--motion-sceau-echelle`, `--motion-sceau-rotation` |

Aucun changement de rendu, mesuré et non estimé : keyframes résolues
(`effect.getKeyframes()`, `var()` substituées) et interpolation figée à 0 %,
50 % et 100 %, sur 7 largeurs × 2 modes, au repos, en survol, en focus et
menu ouvert — **0 différence** sur 1216 animations. `sceau-ouverture` a été
reprise avec l'animation d'accueil jouée, et `etape-entree` sur un élément
injecté : 14 contextes chacune, 0 différence. `comparer-reference` sans
dérive, 58/58 et 21/21 tests verts.

Restent en dur dans `Motion.css`, volontairement : les états d'arrivée
`translateY(0)` et `scale(1)`, valeurs neutres de la propriété, et
`rotate(360deg)` de l'indicateur de chargement, un tour entier.

**Reste de la même famille, non traité :** `translateY(-3px)` au survol dans
`gabarits/Projet_carte/Projet_carte.css`. Ce n'est pas une image-clé et ce
n'était pas dans le périmètre de PM-019 ; sans suivi dédié à ce jour.

**Code mort relevé au passage :** `etape-entree` n'est référencée par aucune
règle de `Design_System`, `Frontend` ni `tools`. La mettre en jetons ne la
réveille pas. Rien n'a été supprimé ; son sort est une décision de Marc.

## 3. La valeur `14px` répétée — réglé

**Réglé le 2 octobre 2026** par PM-020 (#20, PR #47) : chaque `14px` a été
remplacé **à valeur égale** par un jeton nommé selon son rôle, déclaré dans
`Tokens.css` (`--radius-lg` pour le rayon de la Modale), sans changement de
rendu (`getComputedStyle` identique avant et après, 7 largeurs, clair et
sombre). Les valeurs en dur voisines (barres du menu, marges et ombre de la
Planche, carte de projet) ont suivi par PM-045 (#45, PR #51).

Restent en dur, volontairement :

- `fondations/Responsive.css` : `--page-gutter: 14px` sous 850 px. Ce
  fichier est une couche de redéfinition de jetons ; décision de Marc du
  2 octobre 2026 ;
- `fondations/Motion.css` : plus rien depuis PM-019 (point 2) ;
- `gabarits/Projet_carte/Projet_carte.css` : `translateY(-3px)` au survol,
  géométrie de mouvement de la même famille que le point 2.

Elle n'appartenait pas à l'échelle d'espacement (4 à 32 par pas de 4).
Occurrences relevées le 1er octobre 2026, hors `Tokens.css` :

| Fichier | Usage |
|---|---|
| `composants/Galerie/Galerie.css` | position de la superposition (`top`, `right`) |
| `composants/Bouton/Bouton.css` | hauteur des barres du menu |
| `composants/Modale/Modale.css` | rayon de la modale centrée (le jeton `--radius-lg: 14px` existe déjà) |
| `composants/Planche/Planche.css` | espacement de grille ; marge intérieure sous 850 px |
| `gabarits/sections/sections.css` | pied du contact (marge haute, espacement) |
| `gabarits/Projet_carte/Projet_carte.css` | marge haute de l'en-tête de carte |
| `gabarits/Jalon/Jalon.css` | espacement de grille |
| `fondations/Responsive.css` | `--page-gutter` sous 850 px |
| `fondations/Motion.css` | réglé par PM-019 (point 2) |

Deux voies étaient possibles :

- **remplacer par des jetons de même valeur** : aucun changement visible ;
  c'est la voie retenue ;
- **aligner sur l'échelle** (12 ou 16 px) : le rendu bouge.

Leçon de la nuit du 29 septembre : un remplacement **par valeur** confond
deux rôles qui partagent un nombre (1000 px y était à la fois un rayon et une
hauteur). Chaque remplacement se relit.

## 4. Installation de Chromium dans « Vérifier » — lenteur intermittente, rien modifié

Suivi : PM-021 (#21). En veille : critère d'ouverture (3 runs sur les 10
derniers au-dessus de 3 minutes) non atteint. Mesuré le 2 octobre 2026 sur
les 10 derniers runs : de 21 à 30 s, aucun au-dessus de 3 minutes.

Constat du 1er octobre 2026, journaux de GitHub Actions à l'appui. L'étape
« Installer Chromium » a duré 20 s (run 1), 4 min 41 s (run 3), 22 s (run 5)
et 10 min 01 s (run 6).

- Chromium lui-même se télécharge en quelques secondes (run 6 : 8 s, depuis
  `cdn.playwright.dev`).
- Le temps part dans `--with-deps`, qui installe des paquets Ubuntu (polices,
  Mesa) depuis le miroir `azure.archive.ubuntu.com` : au run 6,
  « Fetched 32.1 MB in 10min 0s (53.5 kB/s) », alors que le même miroir
  avait servi l'index à 9 168 kB/s une seconde plus tôt.
- `verifier.yml` ne met pas Chromium en cache. Un cache de
  `~/.cache/ms-playwright` n'y changerait rien : la partie lente est
  l'installation des paquets système, que ce cache ne couvre pas.

Consigne de Marc pour un incident passager : le noter, ne pas toucher au
workflow. La cause est extérieure (miroir Ubuntu), `verifier.yml` reste tel
quel. Le délai
maximal du job (30 min) laisse de la marge. Si la lenteur devient la règle,
pistes à évaluer : n'installer que Chromium sans `--with-deps` (vérifier que
les tests passent sur l'image GitHub), ou lancer le job dans l'image
officielle de Playwright.

## 5. Ménage architectural du 4 octobre 2026 — constats à décider

Relevés par un inventaire exhaustif du dépôt : 388 fichiers suivis, 349 imports
relatifs, 71 documents markdown. **Rien n'a été supprimé.** Ce point rassemble
ce qui demande une décision de Marc, et ce qui ne doit surtout pas bouger.

### 5.1 Six fichiers d'assets que rien ne référence — audités le 4 octobre 2026

Recherche sur tout le dépôt (nom complet et nom de base), historique Git complet,
mesure des dimensions et du poids, comparaison perceptuelle et **examen visuel**
de chaque image. Deux fichiers supprimés, quatre conservés.

| Fichier | Dimensions | Poids | Classe | Suite |
|---|---|---|---|---|
| `Image_01.jpg` | 1181 × 787 | 351 Ko | **F — à décider** | conservé |
| `Image_02.jpg` | 1181 × 807 | 175 Ko | **F — à décider** | conservé |
| `Image_03.jpg` | 1181 × 1181 | 346 Ko | **F — à décider** | conservé |
| `Photo_Marc.jpg` | 900 × 1600 | 596 Ko | **C — source d'un asset utilisé** | conservé |
| `Projet_CEELI_couverture.jpg` | 900 × 640 | 27 Ko | **D — doublon prouvé** | **supprimé** |
| `Public/images/.gitkeep` | — | 0 | **E — sans objet** | **supprimé** |

**`Image_01` à `03` — conservés, décision de Marc attendue.** L'historique est
formel : ils étaient affichés, avec pour texte alternatif « Visuel fourni pour le
portfolio, **projet à identifier** », et la référence a été retirée le
28 septembre 2026 par `7e0b8a4` « Refonte Kittl : contenu reel des projets ».
Ce sont donc des visuels d'illustration posés avant l'arrivée du contenu réel.
Examinés : un portrait d'enfant en double exposition, une photographie d'un
designer à son bureau — **ce n'est pas Marc** — et une illustration à plat d'un
poste de travail. Aucun ne montre une réalisation de Marc. Rien ne prouve pour
autant qu'ils soient jetables : ils ont été *fournis*. **Un mot de Marc**, et ils
partent en une commande.

**`Photo_Marc.jpg` — conservé, et ce n'est pas un doublon.** C'est la **même
photographie** que `Photo_Marc.png`, celui qu'affiche la section « À propos » :
même pose, même costume, même cadrage. Mais le `.png` en est la version
**détourée** (fond retiré, transparence, 1600 × 2857), tandis que le `.jpg` garde
son **fond de studio** (900 × 1600). Le `.jpg` est donc la source d'où le détourage
a été fait. On ne jette pas la source derrière un asset dérivé, et
[#49](https://github.com/marco-mancini/marckouassi.com/issues/49) réserve
explicitement cette décision à Marc.

**`Projet_CEELI_couverture.jpg` — supprimé, doublon prouvé.** C'est la couverture
« Charte Graphique » du projet CEELI, identique à
`Public/images/Charte_Graphique/01.png`, que le contenu utilise réellement.
Prouvé deux fois : comparaison perceptuelle contre **les 30 planches** de la
charte — écart de **1,8 / 255** avec `01.png`, la suivante à 16,6 — et examen
visuel des deux images. Le JPEG est strictement inférieur : 900 × 640 contre
2796 × 1986. Le build produit lui-même les dérivés WebP depuis le PNG, ce qui rend
une petite copie à la main redondante par construction. L'original est conservé et
utilisé ; le fichier reste joignable dans l'historique (`7e0b8a4`).

**`Public/images/.gitkeep` — supprimé, sans objet.** Un gardien de dossier vide
posé par les premiers commits du dépôt (« Prepare static site for GitHub Pages »).
Le dossier compte aujourd'hui 122 fichiers suivis : Git suit des fichiers, pas des
dossiers, et celui-ci ne peut plus disparaître.

### 5.2 `Admin/config.js` : référencé, jamais commité

`Admin/app.js:13` fait `import { CONFIG } from "./config.js"`. Ce fichier
**n'a jamais existé dans le dépôt** : aucun commit ne le contient, il n'est pas
dans `.gitignore`, et aucun document ne le mentionne. C'est le **seul import
relatif cassé** du dépôt (1 sur 349).

Conséquence : l'ancien back-office ne peut pas démarrer en l'état, même réveillé.
Cohérent avec `ADMIN_EN_SOMMEIL.md` — « aucun projet Supabase n'a jamais été
créé ; le back-office n'a jamais servi » — mais la procédure de réveil de ce
document ne le dit pas. Si le réveil est un jour décidé, c'est le premier
fichier à écrire.

### 5.3 Deux incohérences de nommage — à décider, pas corrigées

**`Public/Avatar_MarcoS/` contre la spécification.** `MARCOS_AVATAR.md` §4
décrit l'arborescence attendue comme `Public/images/MarcoS/`, avec `Vues/`,
`Fixes/` et `Sequences/`. Mais la décision de Marc du 4 octobre nomme
explicitement `/Public/Avatar_MarcoS` comme source officielle. **La décision
prime sur la spécification** : le dossier n'est pas déplacé. À trancher le jour
où les séquences d'animation arriveront, puisque les deux chemins coexisteraient.

**Casse des dossiers racine.** `Design_System/`, `Public/`, `Docs/`, `Admin/`,
`Backend/`, `Deploy/`, `Frontend/` portent une majuscule ; `content/`, `tools/`,
`tests/`, `worker/`, `supabase/` n'en portent pas. Renommer coûterait des
centaines de références pour un gain de cohérence seul, sur un système de
fichiers insensible à la casse où un renommage partiel passe inaperçu en local
et casse en intégration continue. **Non corrigé volontairement.** La casse est
en revanche cohérente *dans les références* : aucune n'écrit `docs/` en
minuscule.

### 5.4 Trois documents de `Docs/` sont lus par la machine — ne pas déplacer

C'est la raison pour laquelle `Docs/` reste **plat**, malgré ses 27 fichiers qui
mélangent spécifications actives, journaux de décision et documents historiques :

| Document | Lu par | Effet d'un déplacement |
|---|---|---|
| `Docs/MARCOS_DECISIONS_20261003.md` | `tests/prompt.test.mjs:22` | le contrat D-21 à D-28 est **dérivé** de ce document, pas recopié : le test tombe |
| `Docs/ISSUES.md` | `tools/comparer-issues.mjs` | `npm run comparer-issues` tombe |
| `Docs/suivi/ETAT_MOBILE.md` | `tools/etat-mobile.mjs` | le miroir s'écrit ailleurs et §6.4 n'est plus tenu |

Toute réorganisation de `Docs/` doit donc commencer par ces trois chemins.
