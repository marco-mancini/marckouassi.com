# Sceau

**Responsabilité** : afficher le monogramme MK sur son rond crème, en décoration, en image nommée ou en lien.

## Props (4)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `taille` | `couverture` \| `grand` \| `moyen` \| `petit` \| `document` | `moyen` | Taille, par jeton `--sceau-*` ; `document` : en-tête du CV. |
| `lien` | URL \| `null` | `null` | Rend un `<a>`. |
| `libelle` | chaîne \| `null` | `null` | Nom accessible (du dictionnaire). Sans lui, le sceau est `aria-hidden`. |
| `anime` | booléen \| `"construction"` | `false` | Expérience d'accueil : le sceau apparaît, son contour et son monogramme se tracent (`--duration-trace`), puis se remplissent. Hors animation, l'épaisseur du tracé vaut 0 : les autres sceaux sont inchangés. Mouvement réduit : pas de tracé. `"construction"` : le sceau se construit forme par forme — cercle, lignes de construction, M, K, puis remplissage — une fois `construireSceau(element)` appelé (jetons `--construction-*`). |

## Construction (`construireSceau`)

Navigateur uniquement. `construireSceau(element, { rejouer })` copie les formes du symbole `#logo-mk-seal` déjà présent dans la page, leur donne un contour normalisé et lance la construction. Rien n'est recopié dans le code : la source reste le sprite. Sans sprite ou sans script, le sceau reste statique. `rejouer: true` relance la construction.

## États

- Survol : légère rotation, pour la taille `couverture` et pour le sceau en lien.
- Focus clavier : visible sur le lien.
- Animation désactivée par la réduction des animations.

## Accessibilité

- Décoratif par défaut.
- En lien : le lien porte le nom accessible et le SVG est masqué des lecteurs d'écran.

## Contraintes

- Le symbole `#logo-mk-seal` vient du sprite unique `assets/logos-sprite.svg`, inséré une seule fois par page par le gabarit de page.
- Les couleurs des lettres ne suivent jamais le thème.

## Dépendances

`fondations/rendu.js`.

## Humeurs — les états du site (#162, D-39)

`anime` accepte aussi une humeur (`HUMEURS`), utilisée par `Message` en mode sceau ; `auto: true` ajoute `data-sceau-auto`, que `activerSceaux(racine)` construit. Sur l'olive, tout contour se trace en **crème** : jamais de vert sur vert.

| Humeur | Animation | Jetons |
|---|---|---|
| `bati` | construction ; contour crème jusqu'au remplissage, puis couleurs | `--construction-*` |
| `chargement` | tracé, remplissage, effacement, en boucle | `--humeur-chargement-*` |
| `chantier` | cercle, lignes de construction, puis le MK ; tout s'éteint et recommence | `--humeur-chantier-duree` |
| `vide` | cercle et lignes de construction, qui respirent | `--humeur-vide-trace`, `--humeur-respire-duree` |
| `panne` | `bati`, puis le K grésille et reste éteint | `--humeur-panne-duree`, `--humeur-eteint` |
| `perdu` | `bati`, puis le K se décroche et reste penché | `--humeur-decroche*` |

Mouvement réduit (`prefers-reduced-motion` ou `data-animations="reduites"`) : aucune animation, l'état final immobile (sceau complet ; lignes et MK crème pour `chantier` ; K éteint ou penché).
