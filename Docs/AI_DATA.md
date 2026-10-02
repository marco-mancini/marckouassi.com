# MarcoS — données, base de connaissance et cache

Arrêté le 2 octobre 2026 par les décisions de Marc
([MARCOS_DECISIONS.md](MARCOS_DECISIONS.md)). Mesures faites sur `content/` le
même jour. Voir l'[architecture](AI_ARCHITECTURE.md).

Trois décisions commandent tout ce document :

- **#23** : la source est un **fichier JSON produit au build**, pas Supabase ;
- **D-12** : **une seule langue** par requête, et la base est **réduite au
  strict nécessaire** ;
- **D-3** : téléphone, adresse précise et date de naissance sont **exclus**.

## Principe

MarcoS répond **uniquement** à partir du contenu déjà publié sur le site,
réduit par une **liste blanche** de champs. Il ne lit ni le brouillon, ni les
médias, ni un quelconque compte.

Il n'existe **aucune copie** du contenu dans le code de MarcoS : la base est
calculée par le build, depuis `content/`, par les mêmes fonctions que le site.

## La source : un fichier produit au build

```text
CMS Git (/admin/) ──► content/*.json ──► npm run build
                                          ├─► _site/ (le site)
                                          └─► _site/connaissance.json (la base de MarcoS)
                                                      │
                                                      ▼  HTTPS, fichier statique
                                            [Worker] lit, met en cache par version
```

| Propriété | Conséquence |
|---|---|
| Coût | **0 $**, aucun compte, aucune clé |
| Fraîcheur | suit chaque déploiement Vercel, donc chaque enregistrement du CMS |
| Panne | le fichier est servi par l'hébergement du site : s'il tombe, le site est déjà tombé. **Aucun point de panne supplémentaire** |
| Lecture | une requête HTTP vers un fichier de CDN, mise en cache ensuite — plus rapide qu'une base de données |
| Visibilité | le fichier est **public**, comme le contenu dont il est extrait. La liste blanche exclut déjà les données personnelles (D-3). Point accepté en connaissance de cause : on publie une version lisible par machine de ce qui est déjà lisible par un humain |

Le fichier est produit **par langue** (`connaissance.fr.json`,
`connaissance.en.json`) ou avec une clé de langue, pour que le Worker n'envoie
que celle de la question (D-12).

### Supabase a été écarté

L'architecture du 1er octobre lisait la table `publications` d'un projet
Supabase. **Décision #23 du 2 octobre : non.** Motifs, en bref :

- **aucun projet Supabase n'a jamais été créé** et la table n'a jamais été
  remplie : rien ne l'alimenterait sans réveiller l'ancien back-office ;
- un projet gratuit est **mis en pause après 7 jours** de faible activité ;
- cela aurait tranché [#32](https://github.com/marco-mancini/marckouassi.com/issues/32)
  et [#22](https://github.com/marco-mancini/marckouassi.com/issues/22) par effet
  de bord, ce qui n'était pas la question posée ;
- cela aurait ajouté un point de panne : MarcoS tombe alors que le site va bien.

Le schéma existe toujours dans le dépôt
(`supabase/migrations/20261001000000_back_office.sql`) et rien n'a été supprimé ;
il n'a simplement plus de rôle pour MarcoS. Voir
[ADMIN_EN_SOMMEIL.md](ADMIN_EN_SOMMEIL.md) et le **pourquoi** dans
[DECISIONS.md](DECISIONS.md).

Si la décision changeait un jour, le réglage `SOURCE_CONTEXTE`
(`statique` / `supabase`) est prévu et la liste blanche est la **même** dans les
deux cas : une variable et une clé.

## Liste blanche : ce que MarcoS connaît

Construite par un module pur partagé, `Design_System/gabarits/connaissance.js`
(même principe que `donnees.js`) : entrée = contenu, sortie = base réduite, dans
une langue.

| Domaine | Champs retenus | Origine |
|---|---|---|
| Identité | nom, titre professionnel | `site.identite`, `cv.titre` |
| Présentation | introduction, à propos (accroche, affirmation, détail) | `sections[type=introduction]`, `sections[type=apropos]` |
| Savoir-faire | promesse, domaines, méthode | `sections[type=savoirfaire]`, `sections[type=introduction].methode` |
| Projets | id, titre, catégorie, période (calculée), **rôle, disciplines, idée**, lien de la page | `projets[]` |
| Prestations | titres, points, prix affiché | `sections[type=prestations].offres` |
| CV | résumé, **expériences** (titre, lieu, points), compétences, formation, compétences IA, forces | `cv` |
| Références | clients et structures cités | `cv.references` |
| Contact professionnel | e-mail, LinkedIn, lien du CV PDF | `site.contact` |
| Pages | adresses internes (`/`, `/cv/`, `/projets/{id}/`, ancres de section) | calculées comme le build (`pages.js`) |

Les valeurs calculées (période d'un projet, nombre de projets, plage d'années)
viennent des **mêmes fonctions** que le site (`outils.js`) : MarcoS ne recompte
rien lui-même.

### Ce qui a été retiré de la liste blanche le 2 octobre

Décision D-12, « réduis la base au strict nécessaire ». Mesuré champ par champ,
en français :

| Retiré | Gain | Pourquoi c'est sans perte |
|---|---|---|
| `projets[].valeur` | **−743 jetons** | Ce champ reformule l'enjeu que `contexte` posait et que `idee` résout. Une réponse de deux à trois phrases n'a pas la place de le citer |
| `projets[].contexte` | **−725 jetons** | Le client et la nature du projet sont **déjà** dans `titre` (« Orange Sénégal · FIFA 26 ») et `categorie` (« Campagne publicitaire · sport ») |
| `sections[type=parcours].etapes` | **−246 jetons** | **Doublon** de `cv.experience`, qui décrit le même parcours en plus factuel : employeur, dates, lieu, points. On garde le CV, on retire le récit |
| **Total** | **−1 715 jetons, soit −38 %** | |

Ce qui reste par projet : **titre, catégorie, période, rôle, disciplines, idée,
lien**. C'est exactement ce qu'il faut pour deux à trois phrases suivies d'un
renvoi vers la page du projet — le comportement voulu, pas une dégradation.

Un palier supplémentaire a été mesuré puis **écarté** : retirer
`cv.formation` (−170), `cv.ia` (−64), `cv.forces` (−54), `cv.references` (−53)
et `couverture.faits` (−22) n'économiserait que **363 jetons** tout en rendant
MarcoS muet sur des questions légitimes — la formation et les références sont ce
qu'un recruteur demande en premier. Mauvais rapport, refusé.

## Ce que MarcoS ne connaît pas

- Toute clé, secret, jeton, identifiant de compte.
- Les médias : chemins de fichiers, noms d'origine, textes alternatifs.
- Les métadonnées internes (`_role`, `_origine`, `_statut`).
- **Décision D-3** : téléphone, adresse précise, date de naissance
  (`cv.informations`). Ils sont publics sur le CV, mais un assistant n'a pas à
  les réciter ; il renvoie vers la page CV. L'exclusion est **structurelle** —
  les champs ne sont pas dans les données transmises — donc aucune injection ne
  peut les faire sortir.
- **Décision D-14** : le profil comportemental et personnel de
  [MARCOS.md](MARCOS.md) §18 à §25. Il reste un **document de conception
  interne**, hors base. Le tri entre ce qui pourrait devenir du contenu public
  et ce qui doit rester privé sera fait plus tard, une fois MarcoS en service.
- Les pages visitées par le visiteur (**D-16**) : seule la **page courante** est
  transmise, dans le champ `page` de la requête.
- Ce qui n'est écrit nulle part : chiffres, résultats, clients, dates, avis.
  MarcoS dit qu'il ne sait pas.

## Langues

**Mesuré le 2 octobre 2026 : les 282 champs bilingues du périmètre ont tous
leur version anglaise, 0 manquant** — la traduction a été terminée par PM-030
(#30), et Marc l'a vérifiée en production.

**Décision D-12 : une seule langue par requête.** La base n'est plus envoyée en
deux langues : le Worker transmet celle de la question. Conséquences :

- contexte divisé par deux, latence et coût avec lui ;
- le modèle n'a sous les yeux que des faits dans la langue où il doit répondre,
  donc pas de panachage ;
- la clé de cache de prompt porte la langue
  (`connaissance-{version}-{langue}`) ;
- si un champ perdait un jour sa version anglaise, **repli explicite sur le
  français** pour ce champ, et le rapport du build le signale déjà.

**Décision D-8 : une réponse anglaise se fonde sur les faits anglais**, pas sur
une traduction à la volée du français. Aucune traduction n'est produite ni
enregistrée par MarcoS.

## Taille, mesurée

Relevé sur `content/` le 2 octobre 2026, liste blanche appliquée champ par
champ.

> **Correction du 2 octobre 2026, après l'implémentation (IA-01).** Les chiffres
> publiés plus haut dans la journée étaient calculés sur le **texte brut** du
> contenu, ce qui sous-estime le contexte réel : la structure coûte aussi
> (noms de champs, lignes, en-têtes). Les valeurs ci-dessous sont **mesurées sur
> ce que le module produit vraiment**. L'écart est de +8 % sur la base, il ne
> change aucune décision, mais un chiffre faux ne reste pas dans un document.

| Périmètre | Mesure |
|---|---|
| **Fichier publié** (`connaissance.fr.json`) | 13 911 car. · **3 834 jetons** |
| **Fichier publié** (`connaissance.en.json`) | 12 918 car. · **3 644 jetons** |
| Base envoyée au modèle, français (rendu texte, IA-03) | **3 302 jetons** |
| Base envoyée au modèle, anglais | **3 114 jetons** |
| Texte brut du contenu retenu, pour mémoire | 9 948 car. · 2 842 jetons |

Le **fichier** est du JSON : il se versionne, se teste et se compare. Ce que le
**modèle** reçoit sera plus léger — le Worker rendra la base en lignes
« clé: valeur » plutôt qu'en JSON, ce qui économise l'enveloppe : **532 jetons**
en français, mesurés. Ce rendu appartient au Worker et arrive en phase IA-03.

### Avant et après, sur la même méthode de mesure

Comparer un « avant » en texte brut et un « après » en rendu réel ne voudrait
rien dire. Les deux colonnes ci-dessous sont mesurées **sur le même rendu**,
seul le périmètre change : deux langues et trois champs de plus à gauche, une
langue et la liste blanche réduite à droite.

| Poste | Avant | Après |
|---|---|---|
| Base de connaissance | 9 911 | **3 302** |
| Prompt système | 698 | **396** |
| Historique borné | 1 143 | **571** |
| **Entrée totale** | **11 752** | **4 269** |

**Réduction : 7 483 jetons, soit 64 %.**

Détail de la base retenue, en français :

| Domaine | Caractères | Jetons |
|---|---|---|
| Projets (titre, catégorie, rôle, disciplines, idée) | 4 713 | **1 347** |
| CV (résumé, expériences, compétences, formation, IA, forces, références) | 3 391 | **969** |
| Sections (hors `parcours.etapes`, retiré) | 1 763 | **504** |
| Identité et contact | 81 | **23** |
| **Total** | **9 948** | **2 842** |

La liste des pages citables est **dans** la base (section « pages ») : elle
n'est plus comptée à part. Sortie plafonnée à **180 jetons**. Détail dans
l'[architecture](AI_ARCHITECTURE.md#taille-du-contexte-mesurée).

Le **plafond est défendu par le build** : `PLAFOND_JETONS = 4200` sur le fichier
publié. Un contenu qui gonfle casse la construction au lieu de dégrader en
silence la latence et le coût. Relever ce plafond est une décision, pas un
ajustement.

La base est envoyée **en entier** : pas de recherche vectorielle, pas de
découpage. Si elle dépassait un jour 30 000 jetons — on en est loin — on
passerait à une sélection par projet.

## Cache

| Étape | Durée | Clé |
|---|---|---|
| Base de connaissance | 24 h | `connaissance:{version}:{langue}` |
| Version publiée | 60 s | lecture de l'empreinte du fichier |

Une nouvelle publication change la version, donc la clé : **pas d'invalidation à
gérer**. Si le fichier est illisible, le Worker sert la dernière base en cache
si elle existe, sinon `503 indisponible`.

La Cache API est locale à chaque centre de données ; son comportement sur
`workers.dev` n'est pas publié. L'impact est faible : la source est un fichier
statique de CDN, pas une base de données — c'est l'une des raisons pour
lesquelles la décision #23 et la décision #24 vont bien ensemble.

Le cache de prompt de Mistral (`prompt_cache_key`, entrée facturée 10 %) est
utilisé avec la clé `connaissance-{version}-{langue}` : le prompt système et la
base restent identiques d'une question à l'autre.
