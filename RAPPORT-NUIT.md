# Rapport de la nuit du 29 septembre 2026

Branche de travail de la refonte. Douze commits poussés. `main` n'a pas été touchée,
aucune fusion tentée.

État final de la batterie, sur `_site` construit par `npm run build` :
sept largeurs — 320, 375, 390, 768, 1024, 1280, 1440 — par deux modes,
soit **14 relevés**.

| Contrôle | Résultat |
|---|---|
| Débordement horizontal | 0 px sur 14 relevés |
| Chevauchements d'éléments | 0 sur 14 relevés |
| Contrastes en échec | 0 sur 14 relevés |
| Images cassées | 0 sur 63 images rendues |
| Images sans dimensions déclarées | 0 |
| Projets affichés | 11 sur 14 relevés |
| Erreurs et avertissements console | 0, après parcours complet de la page |
| Dialogue de projet | ouvre, ferme par la croix et par Échap, rend le focus |

---

## Défaut 1 — Chevauchement du sceau MK

**Avant.** `.cover-mark` recouvrait `.cover-fact` et `.cover-bottom` de
**54 × 38 px**, mesuré par collision de rectangles. Le brief citait 320, 390
et 768 px ; **375 px était touché aussi**, donc quatre largeurs sur les sept.

**La cause, et elle n'était pas celle qu'on pouvait deviner.** Sous 850 px,
le sceau passait en `position: absolute` calé, dans l'intention, sur
`.cover-layout`. Mais `Motion.css` pose un `transform` sur
`.cover-mark-block` pour l'animation d'entrée, et **un `transform` crée un
bloc conteneur**. Le sceau prenait donc pour référence ce bloc-là — haut de
0 px, situé tout en bas du layout — et retombait sur le pied de planche.

**Après.** Le sceau reste dans le flux : la grille à deux colonnes de la
version large sert aussi en compact, avec une gouttière réduite et la taille
compacte du monogramme. Une grille ne peut pas dériver ainsi.

Mesure : **0 collision** aux sept largeurs, dans les deux modes. Le sceau
rend 42 × 50 px à 390 px, en haut à droite. La composition en version large
ne change pas.

---

## Défaut 2 — Contraste de `.board-label`

**Avant.** `var(--accent)`, `#7a8e5a`, sur le crème : **3,57:1** à 12 px,
pour un seuil de 4,5:1.

**Après.** Nouvelle paire de sources `--clair-accent-label` / `--sombre-accent-label`,
aliasée en `--accent-label`. Valeur claire `#5f7040` : le même vert olive,
assombri jusqu'au seuil.

`--accent` n'est pas touché : il sert **aussi de surface**, à la barre de
progression et à la sélection de texte. L'assombrir aurait changé deux aplats
validés.

Mesure sur les six étiquettes du site :

| | Avant | Après |
|---|---|---|
| Thème clair, planche claire | 3,57:1 | **5,37:1** |
| Thème clair, planche olive | — | **5,51:1** |
| Thème sombre | — | **8,20:1** et **9,06:1** |

**Piège évité.** L'alias est posé dans les **quatre** blocs qui déclarent les
alias : le bloc clair, le `@media prefers-color-scheme`, et les deux blocs
`data-theme`. Un jeton posé dans trois blocs sur quatre se serait tu dans le
quatrième, sans rien signaler.

---

## Défaut 3 — Sept zones tactiles sous 44 px

Nouveau jeton `--cible-tactile`. Il était écrit huit fois en clair dans
`Layout.css`.

**Les six entrées du menu mobile** passent de 276 × 35 à **276 × 44**, par
`min-height` et un `padding-block` de 4 px qui recentre le texte. Elles
gardent leur alignement sur la ligne de base entre le libellé et son numéro,
que `align-items: center` aurait cassé.

**« Le portfolio ↓ »** mesurait 118 × 19 dans un pied de planche dense, où
grandir la boîte aurait déplacé la ligne de base de trois colonnes
justifiées. Sa zone cliquable est étendue par un pseudo-élément haut de
44 px : **la boîte visuelle ne bouge pas d'un pixel**.

Sondage par `elementFromPoint` à 320 px : le lien est atteint à ±21 px en
vertical et aux deux coins. Cible effective **118 × 44**.

> **À savoir pour la relecture.** Un contrôle qui ne lit que le rectangle du
> lien continuera de signaler « Le portfolio ↓ » comme trop petit. C'est le
> prix de ce choix : ici la zone se mesure au point, pas au rectangle.

---

## Défaut 4 — Dimensions calculées avant redimensionnement

**Avant.** Sur les 8 images dont les dimensions étaient déclarées en clair,
4 annonçaient une taille différente du fichier servi, et **une annonçait un
ratio faux de 6,1 %** : `Projet_ANACADI_01`, déclarée 3066 × 2170 pour un
fichier réel de 1600 × 1202.

C'est ce ratio-là qui fait sauter la mise en page. Une taille fausse à ratio
juste réserve la bonne boîte — le redimensionnement préserve le rapport.
**Le brief supposait le problème plus large qu'il ne l'est ; une seule image
faisait réellement sauter la page.**

**Après.** `compresserImage` rend aussi les dimensions du WebP écrit, via
`toBuffer({ resolveWithObject: true })`. Le build en construit une table et
s'en sert de deux façons : les attributs `width` / `height` du HTML sont
alignés dessus, et la table est injectée en tête de `_site/script.js` sous le
nom `DIMENSIONS_SERVIES`, que `addImage` consulte au moment de fabriquer
l'élément.

Ni les données des projets ni `visuels()`, `visuelsTP()`, `visuelsCEELI()` ne
sont touchées. `Frontend/` reste intact : le diff sur ce dossier est vide.

L'ordre des étapes du build est inversé — images d'abord, page ensuite —
parce que la table est indexée sur des chemins `.webp` qui n'existent qu'après
la réécriture des références.

Mesures : **5 balises `<img>` sur 5 conformes** au fichier, contrôlées par
`sharp` ; au navigateur, galerie ouverte, **76 images sur 76 conformes**,
zéro écart.

Le point d'insertion dans `script.js` est gardé : si les deux lignes
`image.width` / `image.height` disparaissent, **le build échoue** au lieu de
publier des tailles fausses en silence.

---

## Défaut 5 — Valeurs en dur

### Ce qui a été fait

Neuf jetons créés, tous dans des familles existantes : `--radius-pill`,
`--cible-tactile`, `--outline-focus`, `--outline-focus-offset`,
`--barre-progression-hauteur`, `--dialogue-largeur-max`,
`--dialogue-hauteur-max`, `--dialogue-marge-ecran`,
`--dialogue-entete-hauteur`, `--contact-hauteur-min`, `--contact-degagement`,
`--mesure-copie`. Plus `--accent-label` et ses deux sources.

| Fichier | Avant | Après |
|---|---|---|
| `Layout.css` | 63 | **43**, dont 16 à l'intérieur de `clamp()` |
| `Responsive.css` | 46 | 48 au total, dont **41 hors requêtes de media** |
| `Motion.css` | 10 | **7** |
| `Typography.css` | 4 | **0** |
| `Theme.css` | 2 | **1** |
| `Tailwind.css` | 2 | **0** |

Couleurs hors `Tokens.css` : **0**, comme avant.

Les deux requêtes de media de `Typography.css` sont parties dans
`Responsive.css` : les points de rupture vivent là et nulle part ailleurs.
Bornes et valeurs recopiées telles quelles. Bascules vérifiées de part et
d'autre : 360 et 390 px → 1rem ; 391 et 760 px → 1.0625rem ; 761 et 1280 px →
1.125rem. Rendu identique.

`Responsive.css` monte de 46 à 48 lignes parce qu'un bloc y est **arrivé**
depuis `Typography.css` et qu'un autre y a été ajouté pour le doré de
l'accroche. Hors requêtes de media, il en porte 41.

### Une régression introduite, trouvée, réparée

Le remplacement automatique de `1000px` par `var(--radius-pill)` avait frappé
deux lignes où 1000 px n'était pas un rayon mais **la hauteur maximale du
dialogue de projet** :

```css
max-height: min(92vh, var(--radius-pill))
max-height: calc(min(92vh, var(--radius-pill)) - 58px)
```

Le rendu ne bougeait que d'un pixel, 999 au lieu de 1000. **Aucune mesure du
banc ne pouvait le voir** : ni le débordement, ni les collisions, ni le
contraste. C'est la relecture du fichier qui l'a attrapé.

> **Leçon à garder.** Un remplacement par *valeur* confond deux rôles qui
> partagent un nombre. Il se relit toujours.

Après réparation, dialogue ouvert à 1684 px : largeur 1320 px, hauteur
1000 px — et non 999 —, corps à 942 px, ouverture et fermeture
fonctionnelles.

### Valeurs laissées littérales, et pourquoi

**`Theme.css`, la classe de masquage accessible** — `width: 1px`,
`height: 1px`, `margin: -1px`. C'est une **technique** connue pour retirer un
élément de l'écran sans le retirer aux lecteurs d'écran, pas une valeur de
design. La tokeniser la déguiserait.

**`Motion.css`, sept valeurs de géométrie d'animation** — le décalage du
soulignement de menu, les deux positions des barres du burger, les distances
et échelles des images-clés. **Aucune famille de jetons ne couvre une distance
de mouvement**, et le cadrage interdit d'en ouvrir une sans arbitrage.
*Décision attendue : ouvrir une famille `--motion-*`, ou les laisser.*

**Les 27 valeurs de `Layout.css` hors `clamp()`** — ce sont des positions,
des hauteurs de composant et des largeurs maximales à usage unique. La plus
fréquente est **`14px`, huit fois**, et elle n'est dans l'échelle
d'espacement ni de près ni de loin : l'échelle va de 4 à 32 par pas de 4.
Les aligner **changerait le rendu**, ce que la nuit n'a pas mandat de faire.
*Décision attendue : étendre l'échelle pour absorber 14, 26, 42, 54 et 58, ou
aligner ces valeurs sur l'échelle actuelle en acceptant le déplacement.*

**Les 16 valeurs à l'intérieur des `clamp()` de `Layout.css`** — chaque
`clamp()` est déjà une valeur nommée par son usage dans le sélecteur qui le
porte. Les sortir en jetons créerait un jeton par déclaration, ce qui renomme
sans ranger.

---

## Les deux points à vérifier, pas à corriger

### `vercel.json` — confirmé, rien à corriger

Le fichier porte bien :

```json
{ "buildCommand": "npm run build", "outputDirectory": "_site", "framework": null }
```

`package.json` expose `"build": "node tools/build.mjs"`. Le couple est
cohérent avec un build depuis la racine. **L'audit externe qui attribuait un
404 à un répertoire racine réglé sur `Frontend` ne trouve aucun appui dans le
dépôt.** Rien n'a été touché.

### Le « & » de la planche Prestations en mode sombre — lisible, rien à corriger

Sa couleur calculée est bien `rgba(0, 0, 0, 0)`, mais **ce n'est pas un
dégradé** : `background-image` vaut `none`. C'est un `-webkit-text-stroke` de
2 px en `rgb(255, 255, 242)` — un contour crème, à 10,02:1 sur l'olive.
Vérifié à l'œil en mode sombre : le contour est net et l'esperluette se
détache franchement. Rien touché.

---

## Trouvé en chemin, hors du brief

### Corrigé

**1. Onze sous-titres de carte projet à 1,12:1.** `.project-card-name p`
prenait `--muted`, jeton pensé pour un fond clair, alors que la planche
« Mon travail » est olive. Il prend `--paper-on-dark`, comme le reste de la
planche. Ce n'était **pas** un faux positif : le fond opaque le plus proche
est bien l'olive, sans dégradé ni image entre les deux.

**2. Le point de titre de la planche 06 à 1,58:1 en thème clair.**
`Universal_pointtitre` choisit entre deux dorés **par énumération de
planches**, et la planche 06, créée la veille, n'y figurait pas : elle
recevait le doré profond, prévu pour le crème, sur son fond olive. Les sept
autres points rendent 3,54:1 ou 3,84:1. L'énumération porte désormais un
avertissement écrit : **elle est à tenir à jour à chaque planche olive
ajoutée, et rien ne le rappelle.**

**3. L'accroche dorée de la planche 02 sous 1270 px.** Elle est en `clamp()`
et n'atteint 24 px — donc le statut de grand texte — qu'à partir de cette
largeur, mesurée par balayage de dix en dix. En dessous, son seuil est 4,5:1
et `--accent-gold` ne rend que 3,54:1 en clair, 4,13:1 en sombre. Elle passe
à `--accent-gold-soft`, le jeton prévu pour le petit texte sur olive :
4,73:1 et 7,78:1. Au-delà de la borne elle retrouve le doré validé à l'œil.

**4. Le focus ne revenait pas après fermeture du dialogue.** Il retombait sur
`<body>` : un visiteur au clavier repartait du haut de la page à chaque
projet consulté. Le déclencheur est mémorisé à l'ouverture et refocalisé à la
fermeture, quelle qu'elle soit — croix, Échap ou clic sur le fond. Vérifié
sur les deux chemins.

**5. Aucune icône de site déclarée.** Le navigateur réclamait `/favicon.ico`
et récoltait un 404 à chaque visite. Le sceau existait déjà dans le dépôt :
il est déclaré, servi en 200. Rien n'a été inventé.

### Relevé, non corrigé — arbitrage attendu

**6. `scroll-margin-top` à 68 px contre un en-tête à 62 px en compact.** Sous
850 px, `.site-header` descend à 62 px alors que le dégagement de défilement
en vaut 68 : un titre s'arrête six pixels trop bas après un saut d'ancre.
Aligner les deux nombres **changerait le rendu**.

**7. Des astérisques sur cinq années de projet, sans aucune note qui les
explique.** `2024*`, `2023*`, `2024–2025*`. Un appel de note sans note. Je ne
rédige pas la légende : c'est un texte destiné aux visiteurs, et son sens
n'est pas devinable — « en cours », « date estimée », « non publié » ne se
valent pas.

**8. `Public/images` contient un fichier HTML de 1 Mo**, une page Behance
enregistrée. Il est déjà exclu du dépôt par `.gitignore` mais reste sur le
disque et fait partie des 114 fichiers parcourus au build. Sans effet sur le
site publié.

---

## Défauts de mesure trouvés dans mon propre banc

Quatre relevés faux ont été produits puis corrigés. Ils sont ici parce qu'un
contrôle faux accuse aussi bien qu'il disculpe.

**1. Le fond partait du parent, pas de l'élément.** Les en-têtes de cartes
Prestations, qui portent leur propre aplat doré, sortaient à 2,17:1 en clair
et 1,32:1 en sombre — mesurés contre le fond de la planche. Le thème sombre
est passé de « 4 échecs » à **0** une fois la pile de fonds corrigée.

**2. Les paires parent-enfant comptaient comme collisions.**
`.introduction-mark` vit *dans* `.introduction-title` : un élément contenu
recouvre toujours le rectangle de son conteneur. Trois fausses collisions à
1024, 1280 et 1440 px.

**3. Un `KeyboardEvent` Escape fabriqué en JavaScript ne ferme pas un
`<dialog>` modal.** La fermeture par Échap est un comportement natif du
navigateur, pas un écouteur. Le test rendait un faux échec ; seule une vraie
touche envoyée par le protocole prouve quelque chose.

**4. Ma propre sonde fabriquait le défaut qu'elle mesurait.** Un relevé
semblait montrer que le 404 sur `/favicon.ico` persistait après correction —
il venait du `fetch` de contrôle que je lançais dans la même page.

---

## Commits poussés

| SHA | Objet |
|---|---|
| `5eb5a0e` | Défaut 1 — le sceau MK ne chevauche plus le pied de couverture |
| `03715bf` | Défaut 2 — jeton d'étiquette lisible sur fond clair |
| `297d47e` | Défaut 3 — les sept zones tactiles atteignent 44 px |
| `d947b1c` | Défaut 4 — les dimensions publiées sont celles du fichier servi |
| `bb6cd51` | Défaut 5, 1ʳᵉ passe — bordures, rayons et espacements |
| `7a2a68f` | Défaut 5, 2ᵉ passe — réparation d'une régression, jetons de structure |
| `e895250` | Défaut 5, 3ᵉ passe — `Responsive.css` hors requêtes de media |
| `aa7a7b9` | Défaut 5, 4ᵉ passe — Motion, Theme, Tailwind, Typography, Bouton |
| `9a7df06` | Trois défauts de contraste hors brief — plus aucun échec mesuré |
| `cbab3f9` | Accessibilité — le focus revient à la carte d'où l'on vient |
| `96f718f` | Le site déclare son icône — plus de 404 sur `/favicon.ico` |

---

## Ce qui n'a pas été fait, et pourquoi

**Aucune fusion vers `main`.** Interdit par le brief, et le motif tient : les
deux branches n'ont aucun ancêtre commun.

**Aucun fichier créé dans `content/`**, rien touché à Sveltia, `PROJECTS` non
migré, `visuels()` / `visuelsTP()` / `visuelsCEELI()` intactes.

**`.github/workflows/pages.yml` et `AGENTS.md` non modifiés.**

**Aucune couleur, composition, hiérarchie ou parti pris de design changé.**
Les trois corrections de contraste changent une couleur de texte là où elle
échouait à son seuil ; aucune ne touche un aplat, une composition ou une
hiérarchie.

**Les montants des quatre cartes de Prestations** restent « Sur devis ». Ce
n'est pas une donnée que je peux inventer.

**La licence de diffusion web de la fonte Reey** reste à vérifier avant mise
en ligne. C'est une fonte commerciale, c'est écrit au jeton.
