# Maintenance (gabarit)

**Responsabilité** : la page unique du site en maintenance. Composition : `Segments` (langues, liens) et l'état « Maintenance » (`Message`, mode sceau, humeur `bati`, titre h1), avec le bouton « écrire » et l'adresse. Décisions : D-38 (#160), D-39 (#162).

## Déclenchement

`content/site.json` → `maintenance.active`, case du CMS (Paramètres du site → Mode maintenance). Cochée : `rendrePage` (`gabarits/pages.js`) rend cette page à **chaque adresse publique**, dans chaque langue, et la page 404 devient aussi la page de maintenance ; une adresse inconnue reste une erreur du build. Décochée ou absente : le site normal. `/admin/` n'est jamais concerné.

## Données — rien n'est écrit dans le code

| Affiché | Source |
|---|---|
| Titre (bicolore) | dictionnaire `etats.maintenance.titre` (« *Main*tenance ») |
| Phrase | dictionnaire `maintenance.texte` |
| Onglet du navigateur | dictionnaire `maintenance.titre` |
| « Écrire à Marc », adresse | `site.navigation.ecrire`, `site.contact.email` (absent : ni bouton ni adresse) |
| Langues | `optionsLangues(ctx)` |

## Comportement

- `noindex` : les moteurs gardent les vraies pages.
- Le sceau se construit (contour crème, puis couleurs) ; mouvement réduit : sceau immobile et complet.
- Mesure d'audience active comme sur les autres pages.
