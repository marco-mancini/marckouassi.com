# Maintenance (gabarit)

**Responsabilité** : la page unique du site en maintenance. Composition : `Sceau` (variante construction), `Titre` (`appel`, niveau 1), `Segments` (langues, liens), `Bouton` « écrire ». Décision : D-38, #160.

## Déclenchement

`content/site.json` → `maintenance.active`, case du CMS (Paramètres du site → Mode maintenance). Cochée : `rendrePage` (`gabarits/pages.js`) rend cette page à **chaque adresse publique**, dans chaque langue ; une adresse inconnue reste une erreur. Décochée ou absente : le site normal. `/admin/` n'est jamais concerné.

## Données — rien n'est écrit dans le code

| Affiché | Source |
|---|---|
| Le nom (étiquette) | `site.identite.nom` |
| Titre, texte | dictionnaire `maintenance.titre`, `maintenance.texte` |
| « Écrire à Marc » | `site.navigation.ecrire`, `site.contact.email` (absent : pas de bouton) |
| Langues | `optionsLangues(ctx)` |

## Comportement

- `noindex` : les moteurs gardent les vraies pages.
- Le sceau se construit (`activerMaintenance`) ; mouvement réduit ou sans script : sceau statique.
- Mesure d'audience active comme sur les autres pages.
- Jetons : `--maintenance-sceau-taille`, `--maintenance-largeur-max`, `--maintenance-texte-largeur`.
