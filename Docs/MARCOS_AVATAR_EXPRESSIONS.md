# MarcoS — planche d'expressions de référence

**Version : 1.0 · 3 octobre 2026.**

Ce document complète `MARCOS_AVATAR.md`. Il formalise la planche d'expressions visuelles demandée pour la production de l'avatar 3D. Ces expressions sont une **bibliothèque visuelle**, pas dix états runtime supplémentaires.

## 1. Référence du personnage

- La **photo d'identité fournie** sert de référence principale pour l'identité et la ressemblance du personnage.
- La **référence 3D déjà fournie** sert de référence pour le style de modélisation et de rendu.
- Le personnage doit être un véritable personnage 3D modélisé, pas une photo filtrée, une illustration 2D ou un simple effet 3D.
- Conserver fidèlement le visage, les proportions, la carnation, la coiffure et les éléments identitaires de la référence.
- La tenue finale doit être **différente de celle de la photo de référence**.
- Tenue : sobre, neutre, contemporaine, passe-partout, sans logo ni motif distrayant.
- La même tenue doit être conservée sur toute la planche.
- Fond : **blanc uni**, sans décor ni objet parasite.

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
