# MarcoS — spécification des fichiers de l'avatar

Rédigée le 2 octobre 2026 · issue [#76](https://github.com/marco-mancini/marckouassi.com/issues/76) (PM-076) · rattachée à [#49](https://github.com/marco-mancini/marckouassi.com/issues/49) (PM-049, Avatar 3D de MarcoS).

Ce document dit **ce que le site attend de recevoir** pour animer les 8 états de MarcoS décrits dans [MARCOS.md](MARCOS.md) §4. Marc réalise l'avatar lui-même. Rien n'est produit ni implémenté ici.

Ce qui est dit de l'avatar lui-même (ressemblance, style, absence de costume, angles) reste dans [MARCOS.md](MARCOS.md) §3. Ce document ne le répète pas.

---

> **Statut au 4 octobre 2026.** **D-38 a supprimé la V2** : ce document ne
> décrit plus une version future, mais ce qui reste à faire sur la version en
> cours. L'avatar n'est pas rendu aujourd'hui — MarcoS a son entrée dans la
> section Contact et dans le menu — et ce qui l'en empêche est nommé plus bas :
> le format, et le pipeline à transparence du §7.
>
> Sur les cinq décisions que
> [#49](https://github.com/marco-mancini/marckouassi.com/issues/49) réservait à
> Marc, **quatre sont prises** le 4 octobre 2026 :
>
> | Décision | Choix de Marc |
> |---|---|
> | Photo de référence | la photo de Marc fournie comme référence |
> | Référence de style 3D | le style 3D de la référence visuelle retenue, sans copier-coller l'avatar de référence |
> | Angles et poses | les dix expressions livrées ([MARCOS_AVATAR_EXPRESSIONS.md](MARCOS_AVATAR_EXPRESSIONS.md) §3 et §7) |
> | Outil ou prestataire | aucune documentation demandée |
>
> **La cinquième reste ouverte** : la validation du format. Les dix expressions
> livrées sont en 783 × 667 px, là où le §3 ci-dessous impose un carré
> 512 × 512. L'écart est décrit dans
> [MARCOS_AVATAR_EXPRESSIONS.md](MARCOS_AVATAR_EXPRESSIONS.md) §7.
>
> Le reste de ce document — format de séquence, cadence, transitions,
> manifeste, pipeline — demeure une **proposition technique non validée**. Lire
> « retenu » comme « retenu parmi les options comparées », pas comme « arrêté ».

## 1. Format retenu : séquences d'images à transparence

**Ce qu'il faut livrer :** pour chaque état, une **séquence d'images PNG à transparence**, une image par fichier, numérotées.

**Ce que le build en tire :** pour chaque état, une planche d'images (*sprite*) WebP qui garde la transparence. Le navigateur fait défiler les images de la planche. Aucune bibliothèque n'est ajoutée.

### Pourquoi ce format

| Option | Verdict | Raison |
|---|---|---|
| **Séquence PNG → planche WebP** | **retenu** | contrôle image par image : on démarre, on boucle, on s'arrête sur n'importe quelle image et on enchaîne les états au bon moment (§5) ; transparence dans les deux thèmes ; fonctionne partout ; aucune dépendance ; poids maîtrisé par le build |
| Modèle 3D temps réel (glTF + three.js) | écarté pour l'instant | ajoute une bibliothèque (AGENTS.md §3.3 et §5.4), WebGL, un modèle de plusieurs Mo et une charge processeur permanente pour une présence « discrète en bas à droite » ; c'est une évolution possible (§9) |
| Vidéo à transparence (WebM VP9 et HEVC) | écarté | deux encodages, car Safari et Chrome ne lisent pas la même transparence ; pas d'arrêt fiable sur une image précise ; le build copie aujourd'hui les vidéos telles quelles, sans les compresser |
| WebP ou APNG animés | écarté | impossible de mettre en pause, d'enchaîner ou de synchroniser avec l'état de l'IA ; `prefers-reduced-motion` ne peut pas les figer |
| Images séparées sans planche | écarté pour la publication | une requête par image (plus de 200) ; utile seulement comme format de livraison, ce que la séquence PNG est déjà |

---

## 2. Vues et images par état

### Une seule vue animée par état

Chaque état est animé dans **une seule vue** : la face, MarcoS regardant le visiteur.

Pour l'état Navigation, l'orientation vers l'action fait partie du mouvement lui-même : MarcoS tourne le regard ou le buste vers le **haut gauche**, là où se trouve le contenu, puisqu'il est placé en bas à droite (MARCOS.md §5).

### Vues de référence, livrées une seule fois

Les cinq vues de MARCOS.md §3 sont livrées une seule fois, en images fixes. Elles servent de base de travail et de contrôle de ressemblance. Elles ne sont pas publiées sur le site.

### Cadence et nombre d'images

- **Cadence :** 12 images par seconde. Les mouvements voulus sont lents et discrets (MARCOS.md §15). 12 i/s suffisent et divisent le poids par deux par rapport à 24 i/s.
- **Limites :** les nombres ci-dessous sont des **maximums**. Moins, c'est mieux.
- **Aller-retour :** une boucle « aller-retour » (respiration, attente) peut être livrée en aller seul. Le site la rejoue à l'envers. Il faut alors l'indiquer dans le manifeste (§8).

| # | État (MARCOS.md §4) | Nom de fichier | Type | Durée | Images max | Entrée / sortie | Image fixe |
|---|---|---|---|---|---|---|---|
| 1 | Repos | `Repos` | boucle | 4 s | 48 (ou 24 en aller-retour) | — | oui |
| 2 | Accueil | `Accueil` | une fois, finit sur la pose pivot | 2 s | 24 | — | oui |
| 3 | Écoute | `Ecoute` | boucle | 2 s | 24 | si la pose s'écarte du pivot | oui |
| 4 | Réflexion | `Reflexion` | boucle | 3 s | 36 (ou 18 en aller-retour) | entrée et sortie ≤ 6 images chacune | oui |
| 5 | Écriture | `Ecriture` | boucle | 2 s | 24 | si la pose s'écarte du pivot | oui |
| 6 | Réponse | `Reponse` | boucle | 3 s | 36 (ou 18 en aller-retour) | — | oui |
| 7 | Navigation | `Navigation` | une fois, tient la dernière image | 1,5 s | 18 | sortie ≤ 6 images | oui |
| 8 | Erreur / incompréhension | `Erreur` | une fois, finit sur la pose pivot | 1,5 s | 18 | — | oui |

**Total maximal :** environ 230 images d'animation, plus 8 images fixes et 5 vues de référence.

---

## 3. Dimensions, densité, poids

### Dimensions de livraison

- **Format :** carré **512 × 512 px**, toutes les images, tous les états, sans exception.
- **Cadrage :** buste. Caméra fixe, même focale, même éclairage. Le personnage est ancré au même endroit d'une image à l'autre, avec une marge d'au moins 8 % sur chaque bord.
- **Pas de recadrage :** ne pas rogner image par image. Le site superpose les images au pixel près.

### Densité

- La présence en bas à droite s'affichera entre **96 et 128 px CSS** environ (taille exacte à fixer par jeton à l'implémentation).
- À densité 2 (écrans Retina), il faut donc **256 px** réels.
- Le build publie des planches en 256 px.
- Les masters en 512 px servent pour une vue agrandie éventuelle (jusqu'à 256 px CSS en densité 2), ou pour régénérer sans repasser par le logiciel 3D.

### Poids : budget au regard des 9 Mo actuels

Mesure du 2 octobre 2026 : les médias publiés pèsent **9,38 Mo** (110 images WebP, médiane 62 Ko, maximum 312 Ko).

| Élément | Plafond | Moment du chargement |
|---|---|---|
| Image fixe publiée, 256 px | 25 Ko | après le chargement de la page, jamais avant le contenu |
| Planche publiée d'un état, 256 px | 150 Ko | Repos et Accueil quand la page est inactive ; les autres à l'ouverture de l'interface MarcoS |
| **Total publié de l'avatar** | **1,2 Mo** (+13 % sur les médias actuels) | jamais sur le chemin critique ; rien pour un visiteur qui n'ouvre pas MarcoS, hormis Repos et Accueil |
| Master PNG livré, une image 512 px | 400 Ko | non publié tel quel |

Si les plafonds sont dépassés, on réduit dans cet ordre :

1. le nombre d'images (aller-retour, boucles plus courtes) ;
2. la qualité WebP, réglée par le build ;
3. en dernier recours, la cadence (10 i/s).

**Poids du dépôt :** environ 230 masters de 150 à 400 Ko ajoutent 35 à 90 Mo au dépôt, déjà lourd (325 Mo, PM-027, [#27](https://github.com/marco-mancini/marckouassi.com/issues/27)). La façon de les stocker (dépôt, Git LFS, stockage externe) est une décision de Marc, à prendre avant la livraison.

---

## 4. Nommage

Les noms suivent la convention de `Public/images/` :

- segments en casse mixte séparés par `_` ;
- numéros à zéros initiaux (`Projet_FIFA26_01.png`) ;
- un sous-dossier par ensemble (`Charte_Graphique/01.png`).

Pas d'accents ni d'espaces dans les noms. La graphie **MarcoS** est respectée (MARCOS.md §1).

```text
Public/images/MarcoS/
├── MarcoS_Manifeste.json                  description des états (§8)
├── Vues/
│   ├── MarcoS_Vue_Face.png
│   ├── MarcoS_Vue_TroisQuartsGauche.png
│   ├── MarcoS_Vue_TroisQuartsDroite.png
│   ├── MarcoS_Vue_Profil.png
│   └── MarcoS_Vue_Complementaire.png      facultative (MARCOS.md §3)
├── Fixes/
│   ├── MarcoS_Repos_Fixe.png
│   ├── MarcoS_Accueil_Fixe.png
│   └── …                                   une par état, 8 au total
└── Sequences/
    ├── Repos/
    │   ├── MarcoS_Repos_001.png
    │   └── …                               numérotation continue depuis 001, sans trou
    ├── Reflexion/
    │   ├── MarcoS_Reflexion_001.png …
    │   ├── MarcoS_Reflexion_Entree_001.png …
    │   └── MarcoS_Reflexion_Sortie_001.png …
    └── …                                   un dossier par état
```

Les 8 noms d'état sont exactement : `Repos`, `Accueil`, `Ecoute`, `Reflexion`, `Ecriture`, `Reponse`, `Navigation`, `Erreur`.

---

## 5. Transitions entre états

Il n'y a **pas une animation par couple d'états** : 8 × 7 = 56 transitions, c'est trop lourd à produire et à charger. Toutes les transitions passent par une **pose pivot** commune.

1. **Pose pivot.**
   - C'est la première image de `Repos` : MarcoS de face, posture neutre, yeux ouverts, bouche fermée.
   - Toute séquence commence sur cette pose et finit sur cette pose.
   - Exception : `Navigation`, qui tient sa dernière image puis rejoint le pivot par sa sortie.
2. **Retour au pivot au moins une fois par seconde.**
   - Dans une boucle, la pose pivot (ou une pose identique au pixel près) revient au moins toutes les 12 images.
   - Les numéros de ces images sont listés dans le manifeste (`pivots`).
   - Le site change d'état au prochain pivot. MarcoS réagit donc en moins d'une seconde.
3. **Entrée et sortie, seulement si nécessaire.**
   - Quand la pose typique d'un état s'écarte trop du pivot (tête inclinée pour Réflexion, regard tourné pour Navigation), livrer une courte séquence `_Entree` (pivot → pose de l'état) et/ou `_Sortie` (pose de l'état → pivot).
   - 6 images au plus chacune, soit 0,5 s.
4. **Interruption urgente.**
   - Pour `Erreur`, ou une fermeture de l'interface, le site peut couper hors pivot par un fondu enchaîné de 150 ms au plus.
   - Aucun fichier n'est à fournir pour cela.

---

## 6. `prefers-reduced-motion`

À fournir : **une image fixe par état** (dossier `Fixes/`, 8 images), au même cadrage et à la même taille que les séquences.

- Choisir l'image la plus parlante de l'état : la pose clé, pas forcément le pivot.
- Ce sont les seules images montrées quand le visiteur a demandé moins d'animations :
  - changement d'état instantané ;
  - aucun clignement ;
  - aucune respiration.
- Elles servent aussi d'affiche pendant le chargement des planches, et de secours si JavaScript échoue.
- Le sens de l'état n'est jamais porté par l'image seule. L'interface l'annonce aussi par un texte (par exemple « MarcoS rédige sa réponse »), lu par les lecteurs d'écran. Ce texte relève de l'implémentation, pas des fichiers.

---

## 7. Ce dont le build a besoin pour compresser sans abîmer

### À respecter dans les fichiers livrés

| Exigence | Pourquoi |
|---|---|
| PNG RGBA 8 bits par canal, profil sRGB | format lu sans perte par Sharp ; couleurs identiques sur tous les navigateurs |
| Transparence **droite** (non prémultipliée), fond entièrement transparent | sinon un liseré blanc ou noir apparaît sur les bords, visible sur un des deux thèmes |
| Bords lisibles sur les deux fonds du site : `--clair-surface-page` et `--sombre-surface-page` (`Design_System/fondations/Tokens.css`) | le site a un thème clair et un thème sombre ; à vérifier par Marc avant livraison |
| Aucune ombre portée au sol ni décor | une ombre semi-transparente pèse lourd et se lit mal sur l'un des deux fonds |
| Rendu débruité, sans grain ni tramage | le grain et le bruit font exploser le poids WebP et « grouillent » d'une image à l'autre |
| Masters non compressés au préalable (pas de JPEG, pas de WebP) | toute recompression dégrade ; le build ne compresse qu'une fois |
| Dimensions identiques, cadrage fixe, numérotation continue | le build assemble les planches sans recadrer |

### Ce que le build fait déjà — vérifié le 5 octobre 2026

**Le pipeline à transparence n'est pas à écrire : il existe.** `tools/medias.mjs`
mesure la part de pixels non opaques (`partTransparente`) et n'aplatit que sous
`SEUIL_TRANSPARENCE`, fixé à **5 %**. Les dix expressions sont entre 49,5 % et
66,8 % : leur alpha est conservé tel quel.

Mesure après `npm run build`, sur les sept expressions publiées (D-39) :

| Contrôle | Résultat |
|---|---|
| Format publié | WebP, 4 canaux, `hasAlpha: true` |
| Dimensions | 783 × 667, inchangées (sous `largeurMax` de 1600) |
| Poids | **264 Ko** au total, contre 4,25 Mo de PNG sources |
| Fond en thème sombre | transparent — aucun carré crème |

Les documents antérieurs annonçaient l'inverse ; cette section les corrige.

## 8. Manifeste à joindre

Un seul fichier, `MarcoS_Manifeste.json`. Il décrit ce que les noms de fichiers ne disent pas. Le nombre d'images n'y figure pas : il se compte dans les dossiers (une information, une source).

```json
{
  "version": "2026-10-02",
  "cadence": 12,
  "taille": 512,
  "etats": {
    "Repos":      { "type": "boucle", "allerRetour": true,  "pivots": [1, 13] },
    "Accueil":    { "type": "une-fois" },
    "Ecoute":     { "type": "boucle", "pivots": [1, 13] },
    "Reflexion":  { "type": "boucle", "allerRetour": true, "pivots": [1], "entree": true, "sortie": true },
    "Ecriture":   { "type": "boucle", "pivots": [1, 13] },
    "Reponse":    { "type": "boucle", "pivots": [1, 13, 25] },
    "Navigation": { "type": "une-fois", "tientLaFin": true, "sortie": true },
    "Erreur":     { "type": "une-fois" }
  }
}
```

Les valeurs ci-dessus sont des exemples de forme, pas des choix faits à la place de Marc.

---

## 9. Livraison

- **Contenu :** un seul dossier `MarcoS_avatar_AAAA-MM-JJ/`, organisé comme au §4, avec un court `LISEZMOI.txt` :
  - logiciel utilisé ;
  - réglages de rendu ;
  - écarts éventuels par rapport à ce document.
- **Lieu de dépôt :** au choix de Marc (Drive, archive jointe à une issue). Le lieu de stockage dans le dépôt est à trancher d'abord (§3, PM-027). *Les dix expressions de référence, elles, sont déjà dans le dépôt : `Public/Avatar_MarcoS/`, 4,25 Mo ([MARCOS_AVATAR_EXPRESSIONS.md](MARCOS_AVATAR_EXPRESSIONS.md) §7). La question reste entière pour les ~230 masters d'animation, 35 à 90 Mo.*
- **Source 3D :** fichier `.blend`, `.glb` ou autre. Marc la conserve de son côté. Elle n'est pas requise par le site. Elle permettra plus tard, si Marc le décide, de passer au modèle 3D temps réel (§1) sans tout refaire.
- **Après réception :** l'intégration fera l'objet de ses propres issues :
  - pipeline du §7 ;
  - composant ;
  - états ;
  - tests ;
  - vérification sur 7 largeurs, en clair et en sombre.
