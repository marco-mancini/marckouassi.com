# MarcoS — planche d'expressions de référence

**Version : 1.1 · 4 octobre 2026.** La version 1.0 décrivait ce qui était *demandé* ; celle-ci décrit en plus ce qui a été *livré*.

Ce document complète `MARCOS_AVATAR.md`. Il formalise la planche d'expressions visuelles demandée pour la production de l'avatar 3D. Ces expressions sont une **bibliothèque visuelle**, pas dix états runtime supplémentaires.

> **Livré et validé par Marc le 4 octobre 2026** ([#49](https://github.com/marco-mancini/marckouassi.com/issues/49)).
> Les dix expressions existent. Elles sont la **source officielle** des visuels
> de MarcoS : `Public/Avatar_MarcoS/`. Voir §7.

## 1. Référence du personnage

- La **photo d'identité fournie** sert de référence principale pour l'identité et la ressemblance du personnage.
- La **référence 3D déjà fournie** sert de référence pour le style de modélisation et de rendu.
- Le personnage doit être un véritable personnage 3D modélisé, pas une photo filtrée, une illustration 2D ou un simple effet 3D.
- Conserver fidèlement le visage, les proportions, la carnation, la coiffure et les éléments identitaires de la référence.
- La tenue finale doit être **différente de celle de la photo de référence**.
- Tenue : sobre, neutre, contemporaine, passe-partout, sans logo ni motif distrayant.
- La même tenue doit être conservée sur toute la planche.
- Fond : **transparent**, sans décor ni objet parasite. *(Décision de Marc du
  4 octobre 2026. La version 1.0 demandait un blanc uni ; les fichiers livrés
  sont à transparence droite, et c'est ce dont le site a besoin pour ses deux
  thèmes — `MARCOS_AVATAR.md` §7.)*

## 2. Planche de production

Une seule image contenant exactement **10 expressions**, en grille **2 colonnes × 5 lignes**.

Chaque case :

- plan buste ;
- tête, épaules, haut du torse et bras visibles ;
- mains visibles lorsque le geste en utilise ;
- marge suffisante tout autour ;
- aucun élément du personnage coupé, rogné ou hors cadre ;
- même caméra, même focale, même distance et même hauteur ;
- identité 3D strictement cohérente entre les dix cases.

La planche sert de référence de production et de validation, pas directement de sprite final.

**Ce qui a été livré.** Non pas une planche 2 × 5, mais **dix fichiers séparés**,
un par expression (§7). Le découpage est donc déjà fait. Les exigences de
cadrage ci-dessus restent la règle de production pour toute expression ajoutée
plus tard.

## 3. Les dix expressions

### 01 — 👋 Bienvenue
Sourire léger et naturel, posture ouverte, une main légèrement levée pour saluer.

### 02 — 🙂 Neutre / disponible
Expression calme, naturelle et attentive, posture ouverte et prête à écouter.

### 03 — 🤔 Réflexion
Regard légèrement décalé, attitude réfléchie, geste discret si utile.

### 04 — 🧐 Analyse
Expression concentrée et professionnelle, regard attentif, posture analytique.

### 05 — 👂 À l'écoute
Tête légèrement inclinée, regard attentif, posture réceptive et ouverte.

### 06 — 🤨 Question
Sourcil légèrement relevé, expression interrogative subtile, geste naturel possible avec une main.

### 07 — 💡 Idée / suggestion
Expression inspirée et positive, regard vivant, geste naturel pouvant suggérer une idée.

### 08 — 🙌 Enthousiasme
Expression positive et énergique mais maîtrisée, sourire naturel, geste des mains exprimant l'enthousiasme sans caricature.

### 09 — 📝 Prise de notes
Expression concentrée et professionnelle, mains visibles en situation de prise de notes. Carnet ou tablette seulement si cela reste sobre et nécessaire à la compréhension du geste.

### 10 — 😌 Succès / félicité
Expression satisfaite, rassurante et calme, sourire subtil, posture détendue indiquant que le besoin est compris.

## 4. Style de rendu

- véritable modélisation 3D haut de gamme ;
- volumes et proportions réalistes ;
- matériaux 3D réalistes ;
- peau, cheveux et barbe modélisés ;
- éclairage studio doux ;
- expressions naturelles ;
- aucun style cartoon ou caricatural ;
- aucun changement d'identité entre les cases ;
- rendu 4K ou suffisamment détaillé pour produire les masters nécessaires.

## 5. Relation avec `MARCOS_AVATAR.md`

`MARCOS_AVATAR.md` définit le format technique final destiné au site : séquences PNG, planches WebP, transparence, dimensions, poids et transitions.

Cette planche 2×5 est une **étape de référence artistique** : elle permet de valider les expressions et la cohérence du personnage avant de produire les séquences d'animation.

Les dix expressions se mappent aux états runtime existants sans créer dix nouveaux états techniques. Une expression peut servir de pose clé d'un état, puis être animée selon le manifeste final.

## 6. Contraintes absolues

- ne pas copier la tenue de la photo d'identité ;
- ne pas changer le visage d'une case à l'autre ;
- ne pas mélanger plusieurs styles 3D ;
- ne pas recadrer différemment les cases ;
- ne couper ni tête, ni mains, ni bras, ni épaules ;
- ne pas ajouter de décor ;
- ne pas mettre de texte dans les cases ;
- ne pas transformer une expression en caricature ;
- ne pas utiliser la planche comme format de publication final sans passer par le pipeline défini dans `MARCOS_AVATAR.md`.

## 7. Source officielle des assets

**`Public/Avatar_MarcoS/`** — décision de Marc du 4 octobre 2026. Ces dix
fichiers remplacent toute image d'avatar antérieure : il n'existe plus d'autre
source. Aucun traitement ni modélisation supplémentaire n'est demandé sur eux.

| # | Fichier | Expression (§3) |
|---|---|---|
| 01 | `Avatar_01_BIENVENUE.png` | Bienvenue |
| 02 | `Avatar_02_NEUTRE_DISPONIBLE.png` | Neutre / disponible |
| 03 | `Avatar_03_REFLEXION.png` | Réflexion |
| 04 | `Avatar_04_ANALYSE.png` | Analyse |
| 05 | `Avatar_05_ECOUTE.png` | À l'écoute |
| 06 | `Avatar_06_QUESTION.png` | Question |
| 07 | `Avatar_07_IDEE_SUGGESTION.png` | Idée / suggestion |
| 08 | `Avatar_08_ENTHOUSIASME.png` | Enthousiasme |
| 09 | `Avatar_09_PRISE_DE_NOTES.png` | Prise de notes |
| 10 | `Avatar_10_SUCCES_FELICITE.png` | Succès / félicité |

### Caractéristiques mesurées le 4 octobre 2026

| Mesure | Valeur |
|---|---|
| Dimensions | 783 × 667 px, identiques sur les dix |
| Format | PNG RGBA 8 bits, espace sRGB |
| Transparence | droite, fond entièrement transparent (alpha nul dans les angles) ; 49,5 % à 66,8 % de pixels non opaques |
| Poids unitaire | 356 à 561 Ko |
| Poids total | 4,25 Mo |

### Ce que ces mesures satisfont déjà

Quatre des exigences de `MARCOS_AVATAR.md` §7 sont remplies sans rien toucher :
PNG RGBA 8 bits sRGB, transparence droite sur fond entièrement transparent,
dimensions identiques d'un fichier à l'autre, masters non précompressés.

### Le seul écart avec `MARCOS_AVATAR.md`

`MARCOS_AVATAR.md` §3 impose un **carré 512 × 512** à toutes les images. Les dix
expressions sont en **783 × 667**, un rectangle. L'écart est réel et il n'est pas
tranché :

- ces dix fichiers sont des **expressions de référence**, pas les ~230 images
  des séquences d'animation auxquelles le §3 s'adresse ;
- mais le §5 prévoit qu'une expression serve de **pose clé** d'un état, et une
  pose clé passe par le pipeline, donc par le carré.

Les recadrer supposerait de choisir un cadrage, c'est-à-dire une décision
artistique ; et Marc a écrit « aucun traitement supplémentaire » sur les fichiers
validés. Rien n'est donc modifié. Ce point est consigné dans
[#49](https://github.com/marco-mancini/marckouassi.com/issues/49).

### Ce que ces fichiers ne sont pas

Ils ne sont **pas publiés** : D-13 place l'avatar en V2, et le site n'en rend
aucun aujourd'hui. `tools/medias.mjs` aplatirait leur transparence sur le crème
du site (`MARCOS_AVATAR.md` §7) ; le pipeline à transparence reste à écrire,
avec ses tests, le jour de l'implémentation.
