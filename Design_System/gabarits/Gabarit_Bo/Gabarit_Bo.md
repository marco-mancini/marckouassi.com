# Gabarit_Bo

**Responsabilité** : la coquille unique du back-office. Tout écran, la
connexion comprise, est un contenu métier posé dans ce gabarit. Un écran
ne redéfinit jamais la structure, la navigation, les espacements entre
zones, les couleurs, la typographie, les états globaux ni le responsive.

## Structure

```text
Gabarit_Bo (variante « application »)
├── lien d'évitement
├── CadreAdmin
│   ├── EnTete (variante admin : langue de l'interface, voir le site, déconnexion ;
│   │           bouton de menu sous 850 px)
│   ├── Navigation verticale (barre latérale ; lien courant : aria-current="page")
│   ├── zone principale
│   │   ├── Message « démonstration » si le service n'est pas réel
│   │   ├── tête : retour, Titre (h1 #titre-ecran) + Pastille de statut, actions, introduction, messages
│   │   └── contenu de l'écran
│   └── zone d'action : barre de publication
└── surcouches communes : Modale menu (sous 850 px), Modale aperçu, Modale confirmation

Gabarit_Bo (variante « accueil ») : une Planche olive centrée qui reçoit le contenu
(connexion, back-office non configuré, chargement impossible).
```

## Props (5)

| Prop | Type | Rôle |
|---|---|---|
| `ctx` | contexte | textes du dictionnaire admin (`t`), langue |
| `ecran` | `string \| null` | clé du lien de navigation actif |
| `tete` | `{ titre, statut, intro, retour, actions, messages }` | tête d'écran ; sans `titre`, pas de tête |
| `contenu` | HTML | contenu métier de l'écran |
| `options` | `{ variante, liens, barre, demo }` | `liens` : `liensAdmin()` ; `barre` : `BarrePublication()` |

## Écrans (Design_System/gabarits/Admin/Ecrans.js)

Chaque écran renvoie `{ tete, contenu }` et rien d'autre :

| Écran | Assemblage |
|---|---|
| Connexion | Signature (celle du site, `site.intro.signature`), Champ/Saisie, Bouton, Message |
| Tableau de bord | Grille de Cartes (publication, traductions, accès), Encart + Liste (historique), Pastille |
| Sections, Projets | Liste réordonnable, Bouton, Pastille « à traduire » |
| Section, projet, CV, paramètres | Segments (langue d'édition), Editeur (Encart, Champ/Saisie, Liste, Televersement, Media) |
| Médias | Grille de Media, liens vers l'écran où chaque fichier se remplace |

Parcours et Prestations sont des sections : la navigation y mène
directement, trouvées par leur type.

## Accessibilité

Lien d'évitement, un seul `main#contenu`, un seul `h1` par écran, lien
courant `aria-current="page"`, région vivante des messages, focus déplacé
sur `#contenu` à chaque changement d'écran, menu, aperçu et confirmation
en `<dialog>` natifs (focus piégé, Échap, retour du focus).

## Limites

- Un nouvel écran s'ajoute dans `Ecrans.js` (fonction `{ tete, contenu }`)
  et dans le routage d'`Admin/app.js` ; aucune coquille propre.
- Une vraie nouvelle zone structurelle (commune à plusieurs écrans) se
  documente ici avant d'être ajoutée au gabarit.
- Le test `tests/admin.test.mjs` refuse tout rendu de l'application qui
  ne passe pas par `Gabarit_Bo`.
