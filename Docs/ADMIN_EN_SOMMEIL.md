# Ancien back-office Supabase : en sommeil

Mis en sommeil le 1er octobre 2026, sur décision de Marc : le CMS Git
([CMS.md](CMS.md)) le remplace à `/admin/`. **Rien n'est supprimé** ; ce
document dit ce qui reste, ce qui n'est plus vérifié, ce qui est perdu, et
comment le réveiller.

## Pourquoi

- Il publiait par `publier.yml` vers Cloudflare, alors que le site est sur
  Vercel : même configuré, il n'aurait jamais modifié le site visité.
- Un projet Supabase gratuit est mis en pause après 7 jours sans activité :
  un back-office ouvert quelques fois par an serait endormi à chaque fois.
- Aucun projet Supabase n'a jamais été créé ; le back-office n'a jamais servi.

## Ce qui reste dans le dépôt

| Élément | Contenu |
|---|---|
| `Admin/` | application (`app.js`) et services (Supabase, démonstration) |
| `supabase/` | schéma et règles d'accès (migration), Edge Function `publier` |
| `Design_System/gabarits/Admin/`, `Gabarit_Bo/`, `composants/CadreAdmin/` | écrans du back-office aux couleurs du site, éditeur piloté par les données |
| `tools/admin.mjs` | assemblage de l'ancien `/admin/` (plus appelé par le build) |
| `Deploy/README.md` | mise en service Supabase et Cloudflare |
| `@supabase/supabase-js` (`package.json`) | client Supabase, conservé pour un réveil |

**Repris par le CMS** : les libellés et aides FR/EN de
`Design_System/i18n/admin.fr.json` et `admin.en.json` (champs, documents,
médias, éditeur, fréquences) étiquettent les champs du CMS.

## Ce qui n'est plus vérifié, et pourquoi

Les tests suivants ont été déplacés dans `tests/en-sommeil/`, hors de
`npm test` et `npm run test:navigateur`, donc hors du workflow « Vérifier ».
Motif : ils vérifient un back-office qui n'est plus construit ; l'adresse
`/admin/` est désormais celle du CMS Git.

| Fichier | Tests | Ce qu'ils vérifiaient |
|---|---|---|
| `tests/en-sommeil/admin.test.mjs` | 10 | éditeur (libellés, valeurs techniques, éléments vides, « À traduire »), validation, coquille `Gabarit_Bo`, écrans, refus d'une clé secrète Supabase, aucun texte en dur dans le script et les services |
| `tests/en-sommeil/navigateur-admin.test.mjs` | 8 | message sans configuration ; édition FR/EN ; réordonner, ajouter, supprimer des projets ; envoi de médias ; aperçu ; menu sous 850 px ; interface en anglais ; accessibilité axe-core |
| `tests/en-sommeil/publier.test.mjs` | 4 | Edge Function `publier` : refus (401, 403, 400), instantané numéroté, brouillon incomplet (422), retour du flux |

Toujours vérifiés, sortis de l'ancien fichier :

- parité des clés FR/EN des dictionnaires admin et régression de
  `estTraduisible` → `tests/cms.test.mjs` ;
- absence de clé ou de jeton dans les fichiers suivis →
  `tests/secrets.test.mjs` (tous les fichiers, plus seulement six).

Les tests en sommeil passent encore si on les lance à la main (le 1er
octobre 2026 : 14 sur 14 pour les deux fichiers unitaires) :

```sh
node --experimental-strip-types --no-warnings --test tests/en-sommeil/admin.test.mjs tests/en-sommeil/publier.test.mjs
```

Le test navigateur demande l'ancien `/admin/` construit : il ne peut pas
passer tant que le back-office n'est pas réveillé.

## Pertes assumées (choix de Marc, 1er octobre 2026)

Ce que Sveltia CMS ne reproduit pas, pour y revenir en connaissance de cause :

| Perte | Ce que faisait l'ancien back-office |
|---|---|
| Interface aux couleurs du site | écrans construits avec le Design System (`Gabarit_Bo`), clair et sombre |
| Aperçu fidèle | page d'accueil rendue par les vrais gabarits avec les modifications en cours |
| État « À traduire » | pastille sur chaque texte sans anglais, compteur au tableau de bord |
| Historique des publications | publications numérotées, statut (en ligne, échec, remplacée) |

Restent possibles autrement : l'historique de chaque modification est celui
des commits Git ; les textes sans anglais figurent dans le rapport du build
(`à traduire : N champ(s)`).

## Réveiller l'ancien back-office

1. `tools/build.mjs` : rappeler `construireAdmin` (de `tools/admin.mjs`) au
   lieu de `construireCms`, ou le publier à une autre adresse.
2. Remettre les tests : `git mv tests/en-sommeil/*.test.mjs` vers `tests/`
   et `tests/navigateur/` (chemins d'import à rétablir : `../` au lieu de `../../`).
3. Rétablir `publier.yml` et ses réglages : [RETIRES.md](RETIRES.md).
4. Mise en service Supabase : [Deploy/README.md](../Deploy/README.md).
5. Point bloquant d'origine, à régler d'abord : la publication vise
   Cloudflare, pas Vercel.
