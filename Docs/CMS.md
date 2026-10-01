# CMS Git (Sveltia CMS)

Mis en place le 1er octobre 2026. Adresse : https://marckouassi-com.vercel.app/admin/
(non indexée, interdite aux robots).

## La chaîne

```text
Marc modifie dans /admin/ ──► « Save » = un commit sur main (content/*.json, Public/images/)
        ──► Vercel reconstruit le site (environ une minute)
        ──► build.mjs compresse les images (WebP, 1600 px au plus)
        ──► le site est à jour
```

- Le CMS écrit **dans `content/`**, la seule source du site : aucune copie,
  aucune base de données, aucune mise en veille.
- Une image téléversée est déposée **telle quelle** dans `Public/images/` ;
  c'est le build qui la compresse. Vérifié le 1er octobre 2026 : un PNG de
  15 035 384 octets (3596 × 2024) déposé par le CMS est publié en WebP de
  312 238 octets (1600 × 901).
- Chaque enregistrement produit un commit, donc un déploiement Vercel.

## Se connecter : jeton GitHub, sans serveur

Sur l'écran d'accueil du CMS : **Sign In Using Access Token**. Le CMS
propose un lien vers la page de création du jeton sur GitHub.

Créer un jeton à portée fine (GitHub → Settings → Developer settings →
Personal access tokens → **Fine-grained tokens** → Generate new token,
https://github.com/settings/personal-access-tokens/new) :

| Réglage | Valeur |
|---|---|
| Repository access | **Only select repositories** → `marco-mancini/marckouassi.com` seulement |
| Permissions → Repository → Contents | **Read and write** |
| Autres permissions | aucune (Metadata en lecture est ajouté d'office) |
| Expiration | une date, par exemple 90 jours ; un nouveau jeton se crée à l'échéance |

Le jeton est gardé dans le navigateur où il a été saisi (stockage local),
jamais dans le dépôt. Le test `tests/secrets.test.mjs` échoue si un jeton
GitHub apparaît dans un fichier suivi.

### Révoquer le jeton

- **Sur GitHub** (effet immédiat, sur tous les appareils) : GitHub →
  Settings → Developer settings → Personal access tokens → Fine-grained
  tokens (https://github.com/settings/personal-access-tokens) → le jeton →
  **Delete**.
- **Dans un navigateur** : menu du compte du CMS → **Sign Out** efface le
  jeton de ce navigateur. À faire sur un ordinateur partagé.

En cas de doute (ordinateur perdu, jeton copié par erreur) : le supprimer sur
GitHub, puis en créer un nouveau.

## Ce que le CMS édite

Les quatre fichiers de `content/`, tous éditables : Paramètres du site
(`site.json`), Sections (`sections.json`), Projets (`projets.json`), CV
(`cv.json`).

La configuration (`/admin/config.json`) **n'est écrite nulle part à la
main** : `tools/cms.mjs` la génère à chaque build à partir de la forme des
données, comme le faisait l'éditeur de l'ancien back-office. Les libellés
et les aides viennent de `Design_System/i18n/admin.fr.json` (« champs »,
« editeur », « medias »).

- Toutes les clés sont déclarées, `_role` et `_origine` comprises (champs
  cachés, conservés). `tests/cms.test.mjs` échoue si une clé de `content/`
  manque dans la configuration.
- Un champ ajouté au contenu apparaît de lui-même dans le CMS au build
  suivant.
- Champs facultatifs proposés même vides : image de partage (`seo.image`),
  CV à télécharger (`site.contact.cv`), document joint d'un projet, image
  d'attente d'une vidéo.
- `content/` a été réécrit une fois, le 1er octobre 2026, dans l'ordre de
  clés qu'utilise le CMS : données identiques, site publié identique à
  l'octet. Depuis, un enregistrement ne modifie que les lignes changées
  (vérifié par `tests/navigateur/cms.test.mjs`).

### Chemin des images

Le CMS écrit `/Public/images/nom.png` (avec une barre oblique initiale) ; le
contenu d'origine utilise `Public/images/nom.png`. Les deux désignent le même
fichier : le build retire la barre oblique au chargement
(`normaliserChemins`, `tools/contenu.mjs`, testée). Les noms de fichiers
envoyés sont mis en minuscules, sans espace.

## Limites connues

- **Formats d'image** : PNG, JPEG ou WebP (ceux que compresse le build), 50 Mo
  au plus. Un HEIC d'iPhone n'est pas optimisé : l'exporter d'abord en JPEG.
- **Vidéos** : le champ « Fichier » d'un média est un champ image ; une
  vidéo se dépose par Git.
- **Sveltia CMS est en version 0.x** (0.227.1, figée dans `package.json`).
  Une mise à jour se fait à la main : changer la version, `npm install`,
  vérifier que `npm test` et `npm run test:navigateur` passent (le test des
  polices signale si les adresses de polices de Sveltia ont changé).
- **Appels extérieurs du CMS** (page `/admin/` seulement, jamais le site
  public) : vérification de version (`unpkg.com`) et état de GitHub
  (`githubstatus.com`). Les polices et icônes de l'interface sont servies
  par le site (paquets Fontsource, licence OFL), aucune police distante.
- **Pas d'aperçu aux couleurs du site, pas d'état « À traduire », pas
  d'historique des publications** : voir [ADMIN_EN_SOMMEIL.md](ADMIN_EN_SOMMEIL.md).
- L'anglais est facultatif dans chaque champ : un texte sans anglais
  s'affiche en français sur le site anglais, balisé comme tel.

## Vérifications automatiques

| Test | Ce qu'il garantit |
|---|---|
| `tests/cms.test.mjs` | toutes les clés déclarées ; dépôt, branche, dossier des images ; chemin normalisé ; image déposée → WebP compressé ; polices locales |
| `tests/navigateur/cms.test.mjs` | le vrai Sveltia CMS, en mode « dépôt local » : quatre fichiers chargés ; un enregistrement ne change que la ligne modifiée ; image téléversée déposée telle quelle avec le chemin `/Public/images/…` ; ni police ni icône distante |
| `tests/secrets.test.mjs` | aucun jeton ni clé dans les fichiers suivis |
