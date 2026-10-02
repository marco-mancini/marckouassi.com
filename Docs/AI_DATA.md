# MarcoS — données, Supabase et cache

Vérifié le 1er octobre 2026. Voir l'[architecture](AI_ARCHITECTURE.md).

## Principe

MarcoS répond **uniquement** à partir du contenu déjà publié sur le site,
réduit par une **liste blanche** de champs. Il ne lit ni le brouillon, ni les
tables d'administration, ni le stockage des médias, ni les comptes.

Il n'existe **aucune copie** du contenu dans le code de MarcoS : la base de
connaissance est calculée à partir de la même publication que celle qui a
produit le site.

## Ce qui existe déjà dans Supabase

> **Question ouverte (1er octobre 2026)** : Supabase a été écarté pour le
> back-office et aucun projet n'existe. La source des données de MarcoS —
> Supabase ou JSON statique produit au build — est à trancher le jour de
> l'implémentation : voir [Q-1](AI_ARCHITECTURE.md#q-1--source-des-données--supabase-ou-fichier-json-produit-au-build).

Schéma : `supabase/migrations/20261001000000_back_office.sql`.

| Table | Lecture publique (clé publique, rôle `anon`) | Utilité pour MarcoS |
|---|---|---|
| `publications` | **oui**, uniquement les lignes `statut in ('en_attente','en_ligne')` | **source** : colonne `instantane` (site, sections, projets, cv) |
| `documents` | non (administrateurs) | aucune : c'est le brouillon |
| `medias` | non (administrateurs) | aucune |
| `administrateurs` | non | aucune |
| seau `medias` | fichiers publics | aucune (MarcoS ne lit pas d'images) |

Conséquence : le Worker lit la publication **avec la clé publique**, comme le
build. Aucune clé secrète Supabase (`sb_secret_…`, rôle `service_role`, qui
contourne la RLS) n'est nécessaire, ni dans le Worker ni ailleurs.

Le Worker filtre sur `statut=eq.en_ligne` : une version `en_attente` n'est pas
encore sur le site, MarcoS ne doit pas en parler avant elle.

Lectures (API REST, sans dépendance) :

```text
GET {SUPABASE_URL}/rest/v1/publications?select=version&statut=eq.en_ligne&order=version.desc&limit=1
GET {SUPABASE_URL}/rest/v1/publications?select=version,instantane&version=eq.{version}
En-tête : apikey: {SUPABASE_CLE_PUBLIQUE}
```

Les nouvelles clés publiques (`sb_publishable_…`) se passent **seulement** dans
l'en-tête `apikey` ; ce ne sont pas des JWT (documentation Supabase).

### Durcissement possible (sans urgence)

La publication contient aussi le CV complet, qui est déjà public sur `/cv/`.
Si l'on veut que Supabase lui-même ne serve que les champs utiles, on peut
ajouter une vue `security_invoker` ou une fonction SQL qui renvoie la base
réduite, avec `grant select` au rôle `anon`. Ce n'est pas nécessaire au départ :
la liste blanche du Worker suffit et elle est testée.

## Liste blanche : ce que MarcoS connaît

Construite par un module pur partagé, `Design_System/gabarits/connaissance.js`
(même principe que `donnees.js`) : entrée = publication, sortie = base réduite,
en français et, quand elle existe, en anglais.

| Domaine | Champs retenus | Origine dans le contenu |
|---|---|---|
| Identité | nom, titre professionnel | `site.identite`, `cv.titre` |
| Présentation | introduction, à propos (accroche, affirmation, détail) | `sections[type=introduction]`, `sections[type=apropos]` |
| Savoir-faire | promesse, domaines, méthode | `sections[type=savoirfaire]`, `sections[type=introduction].methode` |
| Parcours | étapes (années, titre, texte, lieu) | `sections[type=parcours].etapes` |
| Projets | id, titre, catégorie, période (calculée), contexte, rôle, disciplines, idée, valeur, **lien de la page** | `projets[]` |
| Prestations | titres, points, prix affiché | `sections[type=prestations].offres` |
| CV | résumé, expériences (titre, lieu, points), compétences, formation, compétences IA, forces | `cv` |
| Références | clients et structures cités | `cv.references` |
| Contact professionnel | e-mail, LinkedIn, lien du CV PDF | `site.contact` |
| Pages | adresses internes (`/`, `/cv/`, `/projets/{id}/`, ancres de section) | calculées comme le build (`pages.js`) |

Les valeurs calculées (période d'un projet, nombre de projets, plage d'années)
viennent des **mêmes fonctions** que le site (`outils.js`) : MarcoS ne
recompte rien lui-même.

## Ce que MarcoS ne connaît pas

- Toute clé, secret, jeton, identifiant de compte, adresse de projet Supabase.
- Le brouillon (`documents`), les publications non en ligne, l'historique.
- Les tables `medias`, `administrateurs`, `auth.users`.
- Les chemins de fichiers, les noms d'origine des médias, les textes alternatifs.
- Les métadonnées internes (`_role`, `_origine`, `_statut`).
- **Par défaut (décision D-3)** : téléphone, adresse précise, date de naissance
  (`cv.informations`). Ils sont publics sur le CV, mais un assistant n'a pas à
  les diffuser ; il renvoie vers la page CV.
- Ce qui n'est écrit nulle part : chiffres, résultats, clients, dates, avis.
  MarcoS dit qu'il ne sait pas.

## Langues

Le contenu de référence est en français. 296 champs n'ont pas encore de version
anglaise. La base transmet, pour chaque champ, le français et l'anglais quand il
existe. Une question en anglais reçoit une réponse en anglais **reformulant les
faits français, sans rien ajouter** (décision D-8) ; aucune traduction n'est
enregistrée dans le contenu.

## Taille

Mesure faite sur `content/` le 1er octobre 2026, liste blanche appliquée :
≈ 17 000 caractères (projets 10 000, sections 3 100, CV 3 700, identité 200),
soit **≈ 5 000 jetons**. La base est envoyée **en entier** à chaque requête :
pas de recherche vectorielle, pas de découpage. Si elle dépasse un jour
30 000 jetons, on passera à une sélection par projet (voir plan, phase IA-11).

## Cache : options comparées

| Option | Fraîcheur | Charge Supabase | Complexité | Verdict |
|---|---|---|---|---|
| Lire Supabase à chaque question | immédiate | 1 à 2 requêtes par question | faible | à éviter : latence, quota, dépendance |
| KV (Workers) | jusqu'à 60 s de propagation | faible | moyenne | inutile : 1 000 écritures/jour en Free, cohérence lente |
| **Cache API, clé = version publiée** | ≤ 60 s après une publication | 1 petite requête/min par centre de données + 1 lecture par version | faible | **retenue** |
| JSON statique produit au build | à chaque build | nulle | faible | **mode de secours et de développement** (`SOURCE_CONTEXTE=statique`) |

Fonctionnement retenu :

1. Numéro de version `en_ligne` : mis en cache **60 s**.
2. Base de connaissance de cette version : mise en cache **24 h** sous la clé
   `connaissance:{version}`. Une nouvelle publication change la clé : pas
   d'invalidation à gérer.
3. Si Supabase ne répond pas : dernière base en cache si elle existe, sinon
   `503 indisponible`.

La Cache API est locale à chaque centre de données et fonctionne sur un
domaine personnalisé ; sur `workers.dev`, son comportement n'est pas publié
(voir [architecture](AI_ARCHITECTURE.md#hébergement-de-lendpoint)).

Le cache de prompt de Mistral (`prompt_cache_key`, entrée facturée 10 %) est
utilisé avec la clé `connaissance-{version}` : le prompt système et la base
restent identiques d'une question à l'autre.

## Supabase gratuit : rester actif

Un projet Free est mis en pause après une faible activité sur 7 jours ;
restauration possible pendant 90 jours. Le flux `publier.yml`, qui lisait une
ligne chaque jour pour l'éviter, a été retiré le 1er octobre 2026 (voir
[RETIRES.md](RETIRES.md)). Si Q-1 retient Supabase, ce maintien est à prévoir.
