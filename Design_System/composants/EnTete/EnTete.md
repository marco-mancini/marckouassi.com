# EnTete

**Responsabilité** : la barre haute, avec la marque, la navigation et les actions, sur le site comme dans le back-office.

## Props (4)

| Prop | Type | Rôle |
|---|---|---|
| `marque` | `{href, libelle}` | Lien de la marque ; `libelle` est son nom accessible, issu du contenu. |
| `navigation` | HTML | Une `Navigation` horizontale. |
| `actions` | `{large, compact}` | `large` : visible au-dessus de 1000 px. `compact` : en dessous (bouton de menu, sélecteur de langue). |
| `variante` | `site` \| `admin` | `site` : fond olive jusqu'au premier défilement. |

## Comportement

`activerEnTete(element)` : au défilement, l'en-tête quitte le contexte `.ilot-olive`. Couleurs, logo et boutons suivent, sans sélecteur parent.

## Sans JavaScript

- Sous 1000 px, le bouton de menu n'apparaît que si le script a démarré (`html.js-anime`).
- Sinon, la navigation reste disponible dans une rangée qui défile horizontalement, à la même hauteur : la page ne saute pas.

## Accessibilité

- La marque est un lien nommé ; le logo est `aria-hidden`.
- Les zones tactiles font au moins 44 px.
