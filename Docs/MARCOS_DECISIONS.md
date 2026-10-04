# MarcoS — dossier d'arbitrage

**RÉPONDU PAR MARC LE 2 OCTOBRE 2026.** Ce dossier rassemblait toutes les
décisions qui bloquaient le démarrage de MarcoS ; elles sont **toutes prises**.
La colonne « Décision de Marc » du [récapitulatif](#8-récapitulatif-rempli) est
remplie, et les documents d'architecture, de données, de sécurité, d'interface,
de prompt et d'implémentation ont été mis à jour en conséquence.

**L'implémentation n'est pas autorisée pour autant** : c'est une décision
distincte, et Marc ne l'a pas donnée.

## Les deux contraintes directrices

Elles **priment sur toute recommandation de ce dossier**, y compris les miennes.

1. **Budget 0 €.** Aucun compte payant, aucune carte bancaire, aucun abonnement.
   Toute option qui implique une dépense, même minime, est refusée au profit de
   sa variante gratuite. S'il n'existe pas de variante gratuite, on **signale**
   au lieu de choisir. Deux recommandations de ce dossier ont été refusées à ce
   titre : **D-2** (facturation Gemini) et **D-6** (Workers Paid).
2. **Verbosité minimale.** MarcoS répond en **deux à trois phrases**, pas cinq.
   Son contexte est tenu au plus petit. C'est un critère de conception, pas un
   réglage d'après-coup. Conséquences chiffrées en
   [section 9](#9-réduction-de-la-base-de-connaissance-mesurée).

Rédigé le 2 octobre 2026, à partir de `main` au commit `b616544`, **mis à jour le
même jour sur `main` au commit `abd9924`** (chaîne du CMS éprouvée, version
anglaise vérifiée en production). Il traite
[#23](https://github.com/marco-mancini/marckouassi.com/issues/23) (source des
données), [#24](https://github.com/marco-mancini/marckouassi.com/issues/24)
(hébergement de l'endpoint),
[#25](https://github.com/marco-mancini/marckouassi.com/issues/25) (décisions D-1
à D-11), et les décisions que la documentation suppose sans les avoir tranchées
(D-12 à D-19).

**Ce dossier se lit d'un bout à l'autre sans ouvrir aucun autre fichier.** Tout
ce qu'il faut savoir est recopié ici. Les renvois sont là pour vérifier, pas
pour comprendre.

**Aucune ligne de MarcoS ne sera écrite avant que la colonne « Décision de
Marc » du récapitulatif final soit remplie.**

---

## Comment lire ce dossier

Les sections 3 à 6 sont conservées **telles qu'elles ont été soumises** :
question, options, conséquence de chaque option, recommandation motivée. Elles
gardent la trace de ce qui a été pesé, y compris les options écartées — c'est
le **pourquoi**, et il ne se reconstruit pas après coup.

Ce qui a été **décidé** est dans le [récapitulatif](#8-récapitulatif-rempli),
dernière colonne. En cas d'écart entre une recommandation du corps du dossier et
la colonne, **la colonne gagne** : c'est la décision de Marc.

Deux recommandations ont été **refusées**, toutes deux au titre du budget 0 € :
**D-2** (facturation Gemini → pas de Gemini du tout) et **D-6** (Workers Paid →
offre gratuite seulement). Trois ont été **modifiées** : D-9, D-14, D-18.

La [section 9](#9-réduction-de-la-base-de-connaissance-mesurée) répond à la
demande chiffrée de D-12, et la
[section 10](#10-les-points-à-lever--un-seul-subsiste)
signale les deux points qui peuvent encore revenir à Marc.

---

## 1. Ce que MarcoS doit faire, en cinq lignes

Un visiteur du portfolio pose une question sur Marc, son parcours, ses projets,
ses compétences ou ses prestations. MarcoS répond **en 2 à 5 phrases**,
**uniquement** à partir du contenu déjà publié sur le site, et renvoie vers la
page qui en parle. S'il ne sait pas, il le dit. Il n'invente jamais rien. Il ne
se fait jamais passer pour Marc.

Techniquement : le navigateur envoie la question à un **endpoint** (un petit
serveur), qui ajoute le contenu du portfolio à la question et interroge un
**modèle de langage** (Mistral, et Gemini en secours). Les clés d'API vivent
uniquement dans cet endpoint — jamais dans le navigateur, jamais dans le dépôt.

---

## 2. L'état réel aujourd'hui, mesuré

Rien n'est codé. Mesuré sur `main` au commit `b616544`, le 2 octobre 2026 :

| Élément | État |
|---|---|
| Dossier `worker/` | **n'existe pas** |
| `Design_System/gabarits/connaissance.js` (liste blanche) | **n'existe pas** |
| Composant `Conversation`, gabarit `Assistant` | **n'existent pas** |
| Clé `assistant` dans `content/site.json` | **absente** (les clés présentes sont `langueParDefaut`, `url`, `identite`, `seo`, `contact`, `navigation`, `intro`, `langues`) |
| Projet Supabase | **n'a jamais été créé** ; le back-office n'a jamais servi |
| Schéma Supabase | écrit mais jamais appliqué : `supabase/migrations/20261001000000_back_office.sql` |
| Compte Cloudflare, clé Mistral, clé Gemini | aucun |
| Domaine `marckouassi.com` | non acheté, achat **suspendu** (ta décision du 2 octobre) |
| Adresse du site | `https://marckouassi-com.vercel.app`, Vercel offre **Hobby** |
| CMS Git (`/admin/`) | **éprouvé de bout en bout le 2 octobre 2026** : jeton créé, connexion faite, contenu modifié, publié, vérifié en ligne (commit `f951375`). PM-004 et PM-005 fermées. |
| Version anglaise du site | **vérifiée en production par Marc** le 2 octobre 2026 |

Et une mesure qui change deux chiffres de la documentation :

| Mesure du 2 octobre 2026 | Valeur | Ce que disait la doc |
|---|---|---|
| Champs retenus par la liste blanche | 589 valeurs de texte | — |
| Dont champs bilingues | 282 | — |
| Champs **sans** version anglaise | **0** | « 296 champs n'ont pas encore de version anglaise » |
| Base de connaissance, français seul | 17 928 caractères | ≈ 17 000 |
| Base de connaissance, **français + anglais** | **34 323 caractères**, soit **≈ 9 800 jetons** | « ≈ 17 000 caractères, ≈ 5 000 jetons » |

**Pourquoi c'est important :** la traduction anglaise a été terminée le 2 octobre
(PM-030). La base que MarcoS enverrait au modèle à chaque question a donc
**doublé** : ≈ 9 800 jetons au lieu de ≈ 5 000. Tous les coûts de ce dossier sont
recalculés sur le chiffre mesuré, pas sur l'ancien. Cela ouvre aussi une décision
nouvelle, **D-12** : n'envoyer qu'une seule langue à la fois.

---

## 3. Arbitrage A — #23 : où MarcoS lit-il le contenu du portfolio ?

### La question en une phrase

MarcoS doit connaître le contenu publié du site : va-t-il le lire dans une base
de données **Supabase**, ou dans un **fichier JSON produit à chaque build** et
publié avec le site ?

### Ce qu'il faut savoir d'abord

L'architecture a été écrite le 1er octobre en supposant Supabase. Le même jour,
Supabase a été **écarté** pour le back-office : le contenu vit dans `content/`,
édité par un CMS Git (Sveltia) qui commite directement dans le dépôt, et Vercel
reconstruit le site. **Aucun projet Supabase n'a jamais été créé.**

La table que MarcoS devrait lire s'appelle `publications`, colonne `instantane`.
Elle est remplie par le back-office Supabase — celui qui est en sommeil et n'a
jamais servi. **Personne ne remplit cette table aujourd'hui, et rien ne la
remplira tant que le back-office n'est pas réveillé.**

### Option 1 — Réveiller Supabase

| Critère | Conséquence |
|---|---|
| **Coût** | Offre Free : 0 $ (500 Mo de base, 5 Go de sortie). Largement suffisant. Mais un projet Free est **mis en pause après 7 jours de faible activité** ; il faut donc un appel automatique quotidien pour le tenir éveillé — le flux qui le faisait (`publier.yml`) a été retiré le 1er octobre, il faudrait le rétablir. |
| **Maintenance** | La plus lourde des deux options. Il faut : créer le projet, appliquer la migration, réveiller le back-office (**c'est exactement #32**), produire des lignes `publications`, maintenir une clé publique dans les secrets du Worker, surveiller la mise en pause, et garder deux chemins d'édition du contenu (le CMS Git **et** le back-office) qui peuvent diverger. |
| **Latence** | Une requête réseau supplémentaire à la première question après chaque publication. Mise en cache ensuite : numéro de version 60 s, base 24 h. Négligeable en régime normal. |
| **Si le service tombe** | Le Worker sert la dernière base en cache si elle existe, sinon il répond `503 indisponible` : **MarcoS tombe alors que le site, lui, fonctionne.** Même chose à chaque mise en pause du projet. |
| **Conséquence sur #32** | **Décisive.** Cette option impose de réveiller l'ancien back-office Supabase, donc de trancher #32 dans le sens « réveiller » : garder `Admin/`, `supabase/`, `tools/admin.mjs`, la dépendance `@supabase/supabase-js`, et remettre en service les 22 tests endormis de #22. Trois issues basculent d'un coup. |

### Option 2 — JSON produit au build

Le build (`tools/build.mjs`) calcule déjà tout le site depuis `content/`. Il
produirait en plus un fichier — par exemple `_site/connaissance.json` — avec la
base réduite par la même liste blanche. Le Worker le lit par HTTP, comme
n'importe quel visiteur.

| Critère | Conséquence |
|---|---|
| **Coût** | **0 $**, et aucun compte de plus. Le fichier est publié avec le site, sur l'hébergement déjà payé (ou gratuit). |
| **Maintenance** | La plus légère. Aucune base, aucune clé Supabase, aucune mise en pause à surveiller, aucun second chemin d'édition. La liste blanche est un module testé du dépôt ; si elle change, le build suit au commit suivant. **Un seul chemin : CMS Git → `content/` → build → site et base de MarcoS ensemble.** |
| **Latence** | Une requête HTTP vers un fichier statique servi par le CDN, mise en cache ensuite. **Plus rapide** qu'une requête de base de données. |
| **Si le service tombe** | Le fichier est servi par le même hébergement que le site : s'il tombe, le site est déjà tombé, et la question ne se pose plus. Il n'y a **pas de point de panne supplémentaire** — c'est la différence de fond avec l'option 1. |
| **Conséquence sur #32** | **Aucune.** #32 reste libre : garder en sommeil, supprimer ou réveiller, sans rapport avec MarcoS. |
| **Fraîcheur** | La base suit chaque déploiement Vercel, donc chaque publication du CMS. C'est exactement le rythme du site. |
| **Le fichier est public** | Oui. Il contient un extrait du contenu **déjà public** sur le site, et la liste blanche exclut déjà téléphone, adresse précise et date de naissance (D-3). Rien de nouveau n'est exposé. Point à accepter consciemment : on publie une version lisible par machine de ce qui est déjà lisible par un humain. |

### Ma recommandation : option 2, le JSON produit au build

**Motif, en quatre points.**

1. **Supabase n'a pas de données à donner.** La table `publications` n'existe
   pas, n'a jamais été remplie, et rien ne la remplira sans réveiller un
   back-office que tu as mis en sommeil. L'option 1 ne consiste pas à « lire une
   base existante » : elle consiste à **reconstruire toute une chaîne de
   publication** pour alimenter MarcoS.
2. **La simplicité est un critère explicite du projet**, et l'écart est net :
   l'option 2 n'ajoute ni compte, ni clé, ni base, ni surveillance de mise en
   pause, ni second chemin d'édition.
3. **Elle supprime un point de panne au lieu d'en ajouter un.** Avec Supabase,
   MarcoS peut tomber alors que le site va bien. Avec le JSON, les deux vivent
   et meurent ensemble.
4. **Elle ne préempte aucune autre décision.** #32 et #22 restent à toi, sans
   lien avec MarcoS. L'option 1, elle, les tranche par effet de bord — ce qui est
   la plus mauvaise façon de décider.

**Et si tu veux revenir à Supabase plus tard ?** C'est prévu et peu coûteux :
l'architecture a déjà un réglage `SOURCE_CONTEXTE` (`statique` ou `supabase`).
Le Worker lit la base par ce réglage, la liste blanche est la **même** dans les
deux cas. Changer d'avis, c'est changer une variable et ajouter une clé.

---

## 4. Arbitrage B — #24 : où vit l'endpoint de MarcoS ?

### La question en une phrase

Le domaine `marckouassi.com` n'est pas acheté : sur quelle adresse publier
l'endpoint que le navigateur appellera ?

### Ce qu'il faut savoir d'abord

L'architecture prévoyait de router `marckouassi.com/api/*` vers un Cloudflare
Worker, ce qui mettait l'endpoint **sur la même origine** que le site : pas de
CORS, un seul nom de domaine. Cela suppose une zone DNS `marckouassi.com` chez
Cloudflare. Sans le domaine, cette ligne ne s'applique pas.

« Même origine » veut dire : même protocole, même domaine, même port. Quand
l'endpoint est sur une autre origine que le site, le navigateur impose le
mécanisme **CORS** — l'endpoint doit déclarer explicitement quelles origines ont
le droit de l'appeler. Ce n'est pas un obstacle, c'est une ligne de
configuration ; mais c'est une pièce de plus à tenir juste.

### Option 1 — Cloudflare Worker sur `workers.dev`

L'adresse serait du type `assistant.<compte>.workers.dev`.

**Est-ce viable ? Oui, techniquement.** Avec deux réserves à connaître :

| Point | Ce que ça implique |
|---|---|
| **CORS obligatoire** | L'endpoint est sur une autre origine que le site. Il faut déclarer `https://marckouassi-com.vercel.app` dans `ORIGINES_AUTORISEES`, répondre aux requêtes `OPTIONS`, renvoyer `Access-Control-Allow-Origin` avec l'origine reçue et `Vary: Origin` — jamais `*`. C'est écrit dans l'architecture, c'est testable. |
| **La Cache API sur `workers.dev`** | La documentation du projet note que le comportement de la Cache API **n'est pas publié** pour `workers.dev` : elle est garantie sur un domaine personnalisé. Si elle ne fonctionne pas, le Worker relit la base à chaque question au lieu d'une fois par version. Conséquence réelle : plus de latence et, avec Supabase, plus de requêtes. **Avec le JSON statique (recommandation A), l'impact est faible** : c'est un fichier de CDN, pas une base. |
| **Cloudflare traite `workers.dev` comme un usage gratuit** | La documentation du projet relève que Cloudflare ne le présente pas comme destiné à la production. Ce n'est pas une interdiction constatée, c'est un signal : à revérifier dans les conditions avant la mise en ligne. |
| **L'adresse est laide et visible** | Elle apparaîtra dans l'onglet Réseau du navigateur. Aucune conséquence fonctionnelle. |

**Coût : 0 $.** Offre Workers Free : 100 000 requêtes par jour, 10 ms de CPU par
requête. À 500 questions par jour au maximum, on est à 0,5 % du quota. Le temps
d'attente réseau ne compte pas comme temps CPU. **Une seule réserve de coût :**
le binding Rate Limiting, qui sert à freiner les rafales, n'est **pas documenté
comme disponible sur Free** — c'est l'objet de D-6, et si la réponse est non,
l'offre Workers Paid coûte 5 $/mois.

### Option 2 — Fonction Vercel, sur la même origine que le site

**Cette option n'est pas dans la documentation existante, je la soulève ici
parce qu'elle règle le problème de #24 sans acheter de domaine.**

Le site est déjà déployé par Vercel. Un dossier `api/` à la racine du dépôt
donnerait, en principe, un endpoint `https://marckouassi-com.vercel.app/api/assistant`
**sur la même origine que le site**, dès aujourd'hui. À vérifier avant de s'y
engager : la configuration actuelle de `vercel.json` déclare `framework: null` et
`outputDirectory: "_site"`, et je n'ai pas vérifié que Vercel détecte bien un
dossier `api/` dans ce réglage précis.

| Avantage | Inconvénient |
|---|---|
| **Même origine immédiatement** : plus de CORS du tout, la pièce la plus facile à rater disparaît. | **Elle aggrave le risque Vercel Hobby déjà accepté.** Les conditions réservent Hobby à un usage « personal or non-commercial », et le site annonce des prestations « Sur devis ». Y ajouter un backend augmente l'usage de la plateforme et la visibilité du projet. Tu as accepté ce risque le 1er octobre pour un site statique ; l'étendre à un service applicatif est une **nouvelle** prise de risque. |
| Aucun compte de plus : pas de Cloudflare, pas de Wrangler. | **Pas d'équivalent du binding Rate Limiting.** Il faudrait une autre protection contre les rafales, à concevoir. |
| Un seul endroit à déployer : `git push` suffit. | Les limites de durée d'exécution et de nombre d'appels sur Hobby sont **à vérifier** : le budget de 25 s par requête doit y tenir. |
| Si le site tombe, MarcoS tombe aussi — c'est cohérent. | Toute la documentation de MarcoS est écrite pour Cloudflare : il faudrait la réécrire. |

### Option 3 — Attendre l'achat du domaine

Coût : 0 $ et MarcoS n'existe pas. Tu as **suspendu** l'achat le 2 octobre : cette
option revient à suspendre MarcoS avec lui, sans date.

### Ma recommandation : option 1, Cloudflare Worker sur `workers.dev`

**Motif.**

1. **C'est viable aujourd'hui, et ça ne dépend d'aucune décision en attente** —
   ni du domaine, ni de Vercel Pro.
2. **Le CORS est un coût connu et testable**, pas un risque. Il est déjà écrit
   dans l'architecture, avec sa liste d'origines et ses tests.
3. **Elle n'augmente pas le risque Hobby.** C'est l'argument décisif contre
   l'option 2 : tu as accepté un risque mesuré sur un site **statique**. Mettre
   un service applicatif sur le même plan gratuit change la nature de l'usage,
   et la sanction prévue est une résiliation sous dix jours — elle emporterait
   le site, pas seulement MarcoS.
4. **Elle garde la protection contre les abus** (binding Rate Limiting, règle
   WAF possible), que Vercel n'offre pas en équivalent direct.
5. **La réserve sur la Cache API devient mineure** si tu retiens la
   recommandation A : un fichier statique de CDN se relit sans douleur.

### Ce qui changerait le jour où le domaine est acheté

Rien d'urgent, et rien de cassant :

1. Ajouter la zone `marckouassi.com` chez Cloudflare, puis une **route**
   `marckouassi.com/api/*` vers le même Worker — le code ne change pas.
2. L'appel devient **de même origine** : CORS n'intervient plus. Le contrôle de
   `Origin` reste, c'est une protection distincte.
3. La Cache API est alors garantie : la réserve de l'option 1 disparaît.
4. Une **règle WAF** par IP devient disponible sur le plan gratuit de Cloudflare.
5. Côté dépôt : changer `url` dans `content/site.json`, et `ASSISTANT_URL` au
   build. Deux valeurs.

L'adresse `workers.dev` resterait utilisable en parallèle pour les previews.

### Ce que ça coûte, en résumé

| Poste | Option 1 (`workers.dev`) | Option 2 (Vercel) |
|---|---|---|
| Hébergement de l'endpoint | 0 $ (Workers Free) | 0 $ (Hobby) ou 20 $/mois (Pro, si tu veux lever le risque) |
| Compte à créer | Cloudflare | aucun |
| Risque de résiliation | aucun nouveau | **augmente** le risque Hobby déjà accepté |
| Protection anti-rafale | binding Rate Limiting (voir D-6) | à concevoir |
| Si Rate Limiting absent de Free | 5 $/mois (Workers Paid) | — |

---

## 5. Arbitrage C — #25 : les onze décisions D-1 à D-11

Chaque décision est reprise ici **en entier** : la question, les options, la
conséquence de chaque option, la recommandation et son motif. Le récapitulatif
de la fin les reprend avec la colonne à remplir.

### D-1 — Faut-il basculer sur Gemini quand Mistral est en **panne** ?

**La question.** Le secours Gemini est prévu quand la **capacité** Mistral est
épuisée (quota) ; faut-il aussi y aller quand Mistral répond une erreur serveur
(500, 502, 503, 504) ou dépasse le délai de 15 secondes ?

| Option | Conséquence |
|---|---|
| **a. Non** (`REPLI_SUR_INDISPONIBILITE=false`) | Une panne Mistral donne un message « indisponible » au visiteur, après une nouvelle tentative. MarcoS est muet pendant la panne. En échange : le secours reste réservé à ce pour quoi il a été prévu, le comportement est prévisible, et une panne ne se transforme pas en facture Gemini surprise. |
| **b. Oui** | Une panne Mistral devient invisible pour le visiteur. En échange : deux fournisseurs peuvent être appelés pour une seule question (latence doublée dans le pire cas, dans un budget de 25 s), et une panne longue déplace tout le trafic — et tout le coût — sur Gemini, qui coûte environ **deux fois plus cher** par question. |

**Recommandation : a, non.** **Motif :** sur un portfolio, une indisponibilité de
quelques minutes est sans gravité — le visiteur a le site et l'adresse e-mail. En
face, l'option b crée le scénario le plus désagréable : une panne qui coûte de
l'argent sans qu'on l'ait décidé. C'est réversible par une variable, sans
redéploiement de code. À revoir si une panne réelle se produit et te gêne.

### D-2 — Faut-il activer la **facturation** chez Gemini ?

**La question.** Gemini a une offre gratuite ; faut-il quand même y attacher une
carte bancaire ?

| Option | Conséquence |
|---|---|
| **a. Oui, facturation active** | Conformité : d'après les conditions relevées le 1er octobre, l'offre gratuite de Gemini n'autorise pas à servir des visiteurs de l'**EEE, de Suisse et du Royaume-Uni** — un portfolio public en reçoit forcément. L'offre payante **n'entraîne pas** sur les données envoyées, ce qui est aussi un gain de confidentialité. Coût réel : seulement ce qui est consommé, soit ≈ 0 $ tant que Mistral tient. |
| **b. Non, rester gratuit** | Zéro carte bancaire, mais usage non conforme aux conditions dès qu'un visiteur européen pose une question, **et** les données peuvent servir à l'entraînement. |
| **c. Pas de Gemini du tout** | Aucune carte, aucun second fournisseur. Quand la capacité Mistral est épuisée, MarcoS répond « indisponible ». Architecture plus simple : un fournisseur, pas de matrice de repli, pas de disjoncteur. |

**Recommandation : a, oui — et garde c en tête.** **Motif :** si tu veux un
secours, il doit être conforme, et b ne l'est pas. L'option a ne coûte
pratiquement rien, puisque Gemini ne sert que quand Mistral est à bout. Cela
dit, **c est un choix défendable** si tu préfères zéro carte bancaire et zéro
compte Google : le prix à payer est qu'une question posée après épuisement du
quota Mistral reçoit un message d'indisponibilité. C'est le seul endroit de ce
dossier où je te présente une simplification volontaire que je ne recommande pas
en premier : tranche selon ton goût du risque administratif.

### D-3 — Faut-il exclure téléphone, adresse précise et date de naissance ?

**La question.** Ces trois informations sont dans `cv.informations` et donc
publiques sur la page `/cv/` : MarcoS doit-il pouvoir les énoncer ?

| Option | Conséquence |
|---|---|
| **a. Exclure** | Elles ne sont **jamais** dans le contexte envoyé au modèle : il ne peut pas les dire, même sous la pression. À qui les demande, MarcoS renvoie vers la page CV. L'information reste accessible, elle n'est simplement pas récitée par une machine. |
| **b. Inclure** | MarcoS récite un numéro de téléphone à la demande. Un extracteur automatisé n'a plus qu'à poser la question. |

**Recommandation : a, exclure.** **Motif :** la différence entre « public sur une
page » et « récité par un assistant » est réelle : la seconde forme est
industrialisable. Le coût de a est nul — l'information reste à un clic. Note que
cette exclusion est **structurelle**, pas une consigne de prompt : les champs ne
sont pas dans les données transmises, donc aucune injection ne peut les faire
sortir. C'est la seule façon fiable de tenir cette promesse.

### D-4 — Où se trouve l'entrée de MarcoS dans le site ?

**La question.** Par où le visiteur ouvre-t-il MarcoS ?

**Attention, il y a une contradiction dans la documentation du projet, et il
faut la trancher.** `Docs/MARCOS.md` §5, qui porte ta vision, dit : « MarcoS
apparaît en priorité sous forme de **présence discrète en bas à droite** […] La
figurine est le point d'entrée de l'expérience. » `Docs/AI_UX.md` dit l'inverse :
« ni bulle flottante, ni avatar », entrée dans la section Contact et le menu. Les
deux documents sont dans le dépôt, les deux sont à toi.

| Option | Conséquence |
|---|---|
| **a. Section Contact + lien du menu** | Aucun élément flottant, aucun nouveau langage visuel, rien ne couvre le contenu sur téléphone. MarcoS se découvre en bas de page ou par le menu : **moins visible**, donc moins utilisé. |
| **b. Présence flottante en bas à droite** (ta vision de MARCOS.md §5) | Visible tout de suite, taux d'usage bien plus élevé. En échange : un élément fixe par-dessus le contenu, qui ressemble par position à une bulle de support client — ce que MARCOS.md §5 veut précisément éviter — et qui demande de résoudre le chevauchement sur mobile, la cible de 44 px, et le comportement en mouvement réduit. C'est aussi ce qui donne un sens à l'avatar 3D (#49). |
| **c. Les deux : Contact et menu maintenant, présence flottante quand l'avatar existe** | MarcoS peut être lancé tout de suite sans attendre l'avatar, et la présence flottante devient une seconde étape, décidée sur pièces. |

**Recommandation : c.** **Motif :** a et b ne s'opposent pas dans le temps. La
présence flottante n'a d'intérêt que si elle porte **quelque chose** — la
figurine — et l'avatar est bloqué par #49, qui attend cinq décisions de ta part.
Attendre l'avatar pour lancer MarcoS reviendrait à retarder une fonction qui
marche pour un habillage qui n'existe pas encore. En revanche, **b ne doit pas
être abandonné par défaut** parce qu'un autre document l'a écarté : c'est ta
vision, elle a sa raison d'être, et elle reste ouverte. Cette contradiction est
reprise en **D-13**.

### D-5 — Faut-il ajouter Turnstile (anti-robot de Cloudflare) ?

**La question.** Faut-il faire valider au visiteur un contrôle anti-robot avant
de poser sa question ?

| Option | Conséquence |
|---|---|
| **a. Pas au lancement** | Aucune ressource distante de plus — ce qu'AGENTS.md §3.3 interdit sans accord explicite. La protection repose sur les limites de débit et le budget journalier, qui suffisent au volume attendu. Risque résiduel : un script déterminé peut consommer le budget du jour, ce qui coûte **au plus** ce que le budget autorise. |
| **b. Dès le lancement** | Un script distant de Cloudflare se charge sur le site, donc une dépendance extérieure, un point de suivi vie privée possible, et une friction pour tous les visiteurs — pour un risque qui n'est pas constaté. |

**Recommandation : a, pas au lancement.** **Motif :** on ne paie pas une friction
et une dépendance extérieure contre un abus hypothétique. Le garde-fou qui compte
est le **budget journalier plafonné** : même abusé, MarcoS ne peut pas coûter plus
que ce plafond. À rouvrir si un abus réel est constaté dans les journaux.

### D-6 — Faut-il l'offre Workers Paid à 5 $/mois ?

**La question.** Le mécanisme qui freine les rafales (binding Rate Limiting)
n'est pas documenté comme disponible sur l'offre gratuite : faut-il payer
5 $/mois pour en être sûr ?

| Option | Conséquence |
|---|---|
| **a. Essayer Free d'abord, décider sur le constat** | 0 $ tant que ça marche. Il faut **vérifier** à l'implémentation (phase IA-08) si le binding est accepté sur Free. S'il ne l'est pas, deux voies : passer à Paid, ou se contenter du budget journalier plus une règle WAF — qui exige une zone Cloudflare, donc le domaine. |
| **b. Payer tout de suite** | 5 $/mois (60 $/an) pour une certitude, avant même d'avoir constaté le besoin. Inclut 10 millions de requêtes. |

**Recommandation : a.** **Motif :** c'est une question de **fait**, pas de
préférence : la réponse se lit en une commande au moment de l'implémentation, et
elle est gratuite à obtenir. Payer d'abord, c'est payer pour ne pas vérifier. Si
le constat est négatif, 5 $/mois est un petit prix et la décision se reprendra
avec le fait en main.

### D-7 — DNS et hébergement de production

**La question.** C'est #24, traité en détail dans l'**arbitrage B** ci-dessus.
D-7 était écrite en supposant une zone Cloudflare pour `marckouassi.com`.

| Option | Conséquence |
|---|---|
| **a. Worker sur `workers.dev`** | Voir arbitrage B, option 1. CORS à déclarer, Cache API non garantie, 0 $, disponible aujourd'hui. |
| **b. Fonction Vercel, même origine** | Voir arbitrage B, option 2. Pas de CORS, mais aggrave le risque Hobby et perd le Rate Limiting. |
| **c. Attendre le domaine** | MarcoS suspendu sans date. |

**Recommandation : a**, et bascule vers une route `marckouassi.com/api/*` le jour
où le domaine est acheté — le code ne change pas. Motif complet dans l'arbitrage B.

### D-8 — Comment MarcoS répond-il en anglais ?

**La question.** Quand un visiteur écrit en anglais, sur quels faits MarcoS
s'appuie-t-il ?

**La prémisse de cette décision a changé le 2 octobre.** Elle était écrite ainsi :
« réponses en anglais à partir de faits rédigés en français », parce que
296 champs n'avaient pas de version anglaise. **Mesuré aujourd'hui : 0 champ sans
version anglaise**, sur les 282 champs bilingues du périmètre. MarcoS peut donc
répondre en anglais **depuis des faits écrits en anglais**, validés et publiés.

| Option | Conséquence |
|---|---|
| **a. Répondre en anglais depuis les faits anglais** (possible depuis le 2 octobre) | Le modèle n'a plus à traduire : il reprend des phrases déjà relues, publiées, et **vérifiées en production par Marc le 2 octobre**. Moins de risque de dérive de sens, meilleure qualité. Si un champ perdait un jour sa version anglaise, repli sur le français. |
| **b. Reformuler les faits français en anglais** (la proposition d'origine) | Le modèle traduit à la volée, à chaque question, un texte qui existe déjà en anglais à côté. Travail inutile et risque de traduction approximative. |

**Recommandation : a.** **Motif :** la traduction est faite, relue et en ligne ; la
reprendre à chaque requête serait payer deux fois et dégrader le résultat. Dans
les deux cas la règle reste : **ne rien ajouter aux faits**. Voir aussi **D-12**,
sur le fait de n'envoyer qu'une langue à la fois.

### D-9 — Les textes de MarcoS, à écrire par toi

**La question.** Trois textes doivent exister avant que MarcoS soit visible, et
aucun ne peut être écrit par une IA ni par moi.

| Texte | Où il vivra | Ce qu'il doit faire |
|---|---|---|
| **Message d'accueil** (FR + EN) | `content/site.json` → `assistant.accueil` | Dire en une à deux phrases qui est MarcoS et ce qu'on peut lui demander. Il ne doit **pas** laisser croire que c'est Marc. |
| **Exemples de questions** (FR + EN) | `assistant.exemples[]` | Trois à quatre questions cliquables, envoyées telles quelles. Elles apprennent au visiteur ce que MarcoS sait faire. Sans elles, la zone n'apparaît pas. |
| **Mention de confidentialité** (FR + EN) | `assistant.confidentialite` | Dire ce qu'il advient de la question : pas de conservation côté serveur, pas de texte dans les journaux. |

**Conséquence si ce n'est pas écrit :** `assistant.active` reste `false` et MarcoS
**n'est pas rendu du tout**. C'est le seul verrou de ce dossier qui ne peut pas
être levé par une décision : il demande de l'écriture.

**Bonne nouvelle depuis le 2 octobre : tu pourras les écrire toi-même, sans
moi.** La chaîne du CMS est éprouvée de bout en bout (PM-005, commit `f951375`).
Ces trois textes vivent dans `content/site.json`, clé `assistant`, et
`tools/cms.mjs` génère la configuration du CMS à partir de la forme des données :
le jour où le champ existe, il **apparaît de lui-même** dans l'écran
« Paramètres » de `/admin/`, en français et en anglais, sans qu'une ligne de
configuration soit écrite à la main. Tu enregistres, le site se reconstruit. Pas
de branche, pas de pull request, pas d'intermédiaire.

**Recommandation : à toi, et tu peux l'écrire après.** **Motif :** tout le reste de
MarcoS — base de connaissance, endpoint, interface, tests — se construit et se
vérifie sans ces textes, avec `active: false`. Ne bloque pas le démarrage pour
ça : écris-les quand tu veux, avant l'activation. Si tu préfères partir d'une
base, je peux te proposer des **brouillons clairement marqués comme brouillons**,
que tu réécris ou jettes — mais rien ne partira en ligne sans ta version.

### D-10 — Que garde-t-on dans les journaux ?

**La question.** Le Worker écrit des journaux techniques : contiennent-ils le
texte des questions ?

| Option | Conséquence |
|---|---|
| **a. Métadonnées seulement** | Journaux : horodatage, environnement, version du contenu, fournisseur, code de sortie, latence, jetons consommés, empreinte de session. **Jamais** le texte des questions ni des réponses, jamais l'IP en clair, jamais les en-têtes d'authentification. On peut diagnostiquer une panne et suivre les coûts ; on ne peut pas relire ce qu'un visiteur a écrit. |
| **b. Journaliser aussi les questions** | Diagnostic plus confortable, et possibilité de voir ce que les visiteurs demandent. En échange : tu conserves des textes rédigés par des tiers, ce qui t'oblige à une information et à une durée de conservation, et la mention de confidentialité de D-9 doit le dire. |

**Recommandation : a.** **Motif :** b transforme un portfolio en traitement de
données personnelles pour un confort de mise au point dont on peut se passer. Les
métadonnées suffisent à savoir **qu'une** requête a échoué, ce qui est ce qu'on
cherche. Si tu veux un jour connaître les questions posées, ce sera une décision
distincte, avec sa mention et sa durée.

### D-11 — Refuser l'usage des données pour l'entraînement chez Mistral

**La question.** Faut-il désactiver, dans la console Mistral, l'autorisation
d'utiliser les données envoyées pour entraîner leurs modèles ?

| Option | Conséquence |
|---|---|
| **a. Refuser** (console Mistral → Admin › Privacy) | Les questions des visiteurs et le contenu du portfolio ne servent pas à l'entraînement. Un réglage à faire une fois, **avant** la mise en ligne. Peut, selon l'offre, impliquer une formule payante plutôt que les crédits gratuits — à vérifier dans la console. |
| **b. Laisser tel quel** | Les contenus envoyés peuvent servir à l'entraînement. La mention de confidentialité de D-9 devrait alors le dire honnêtement. |

**Recommandation : a, refuser.** **Motif :** ce que tu envoies contient les
questions de tes visiteurs. Promettre la discrétion dans la mention de
confidentialité tout en laissant l'option ouverte serait inexact. C'est une case
à décocher, pas un chantier — mais elle doit être faite **avant** la première
question réelle, car ce qui est parti est parti.

---

## 6. Arbitrage D — ce que la documentation suppose sans l'avoir tranché

Huit points que la documentation tient pour acquis ou laisse en suspens. Ils
sont numérotés à la suite pour entrer dans le même récapitulatif.

### D-12 — Envoyer une seule langue à la fois, ou les deux ?

**Nouveau, conséquence de la traduction terminée.** La base de connaissance fait
désormais 34 323 caractères FR + EN (≈ 9 800 jetons) contre ≈ 5 000 prévus.

| Option | Conséquence |
|---|---|
| **a. Envoyer les deux langues** | Comme prévu à l'origine. Le modèle peut citer indifféremment le FR et l'EN, et répondre dans une langue à partir de l'autre. Coût : contexte deux fois plus gros, donc **environ deux fois plus cher** par question, et davantage de latence. |
| **b. Envoyer la seule langue de la question** | Contexte ramené à ≈ 5 100 jetons (FR) ou ≈ 4 700 (EN). Coût par question **divisé par environ deux**, latence moindre, et le modèle n'a sous les yeux que des faits dans la langue où il doit répondre — moins de risque de panachage. En échange : deux clés de cache de prompt au lieu d'une, et si un champ perdait sa version anglaise il faudrait un repli explicite sur le français. |

**Recommandation : b.** **Motif :** c'est le seul levier de ce dossier qui réduit
de moitié le coût courant sans rien retirer à MarcoS, et il va dans le même sens
que D-8 : répondre en anglais depuis l'anglais. Le repli sur le français quand
une traduction manque est trois lignes dans la liste blanche, et il est testable.

### D-13 — La figurine 3D et la présence flottante : contradiction à trancher

**Deux documents du dépôt se contredisent, et aucun ne l'emporte sur l'autre.**

`Docs/MARCOS.md`, qui porte ta vision, demande une figurine 3D (§3), des états
d'animation (§4) et une « présence discrète en bas à droite » dont « la figurine
est le point d'entrée » (§5).

`Docs/AI_UX.md` et le plan d'implémentation interdisent « ni bulle flottante, ni
avatar, ni robot » et rangent l'avatar parmi les choses à **ne pas faire**.

| Option | Conséquence |
|---|---|
| **a. MARCOS.md fait foi** | La figurine est l'entrée de MarcoS. Conséquence : MarcoS ne peut pas être lancé avant l'avatar, donc avant que #49 soit tranchée (photo de référence, style, angles, outil, format). AI_UX.md doit être réécrit. |
| **b. AI_UX.md fait foi** | MarcoS se lance sans avatar, entrée dans Contact et le menu. Conséquence : ta vision d'une présence vivante est abandonnée, et #49 perd son objet. |
| **c. Deux étapes** (cohérent avec ma recommandation D-4) | V1 sans avatar, entrée dans Contact et le menu. V2 : présence flottante portant la figurine, quand #49 est tranchée et les fichiers produits. Les deux documents sont alignés sur cette lecture, avec la V1 et la V2 nommées. |

**Recommandation : c.** **Motif :** c'est la seule option qui ne jette rien. Elle
ne sacrifie pas ta vision à un document technique, et elle ne retarde pas une
fonction qui marche pour un habillage qui n'existe pas. Elle demande en revanche
une chose précise : **que AI_UX.md cesse d'écrire « jamais d'avatar » et écrive
« pas en V1 »**. Tant que les deux documents se contredisent, le prochain
intervenant appliquera celui qu'il aura lu en premier.

### D-14 — Le profil comportemental et personnel de Marc : MarcoS le connaît-il ?

**C'est le plus gros angle mort de la documentation.**

`Docs/MARCOS.md` consacre ses sections 18 à 25 à un profil détaillé : identité
professionnelle, méthode de réflexion, rapport au résultat créatif, à la
contrainte, à l'échec, définition personnelle de la réussite, valeur
fondamentale (« ne jamais cesser de vouloir progresser »), signature
philosophique (« Soyons insatiable, soyons fou »), règles de réponse « comme
Marc ». Le document précise que ce sont des informations que **tu as
volontairement transmises** et qu'il compte « 47 réponses collectées ».

Or **rien de tout cela n'est dans la liste blanche** de `Docs/AI_DATA.md`, qui ne
retient que `content/` : identité, présentation, savoir-faire, parcours, projets,
prestations, CV, références, contact, pages. Et le brouillon de prompt système
ne mentionne pas une ligne de ce profil : il dit même « Parle de Marc à la
troisième personne ».

**Conséquence si personne ne tranche :** MarcoS sera implémenté **sans** ce
profil. À la question « comment Marc travaille-t-il ? », il répondra qu'il ne
sait pas, alors que tu as passé du temps à l'écrire.

| Option | Conséquence |
|---|---|
| **a. Hors base** | MarcoS parle du travail publié, pas de la façon de penser de Marc. Le plus simple et le plus sûr ; les sections 18 à 25 restent un document de conception interne. Ce que tu as écrit ne sert alors pas à MarcoS. |
| **b. Dans la base, via `content/`** | Les éléments retenus deviennent du **contenu éditorial**, dans un champ de `content/site.json`, donc versionné, relu, éditable au CMS, traduit, et soumis aux mêmes règles que le reste. MarcoS peut dire « d'après ce que Marc m'a partagé, il a tendance à… », comme MARCOS.md §22 le prévoit. En échange : ce texte devient **public**, comme tout `content/` — et il parle de loyauté, de rapport à l'échec, de définition de la réussite. À relire avec ça en tête. |
| **c. Dans le prompt système, pas dans la base** | Le profil est une consigne de comportement, pas une donnée citable. MarcoS adopte un ton juste sans pouvoir réciter le profil. Mais : un prompt système n'est pas un secret, il peut fuiter ; et cela contourne la règle « le contenu ne vit que dans `content/` ». |
| **d. Un tri : une partie en b, le reste hors base** | Par exemple : méthode de travail et rapport à la contrainte en b (utiles à un client qui veut savoir comment Marc travaille) ; vie personnelle, relations, loyauté, définition de la réussite hors base. |

**Recommandation : d, et c'est à toi de faire le tri.** **Motif :** il y a deux
natures de choses mélangées dans les sections 18 à 25. « Marc préfère partir
d'une base concrète » est une information **professionnelle** qu'un client a
intérêt à connaître, et elle a sa place dans le contenu public. « Le mensonge et
le manque de loyauté détériorent la confiance qu'il accorde » est une confidence
que tu as faite à un document de conception, et qu'un assistant public n'a pas à
réciter à un inconnu. Je ne peux pas faire ce tri à ta place : tu es le seul à
savoir ce que tu acceptes de rendre public. Dis-moi quelles sections passent en
contenu, et je prépare le champ et les tests.

### D-15 — MarcoS parle-t-il de Marc à la troisième personne, ou en « je » ?

**Contradiction interne de la documentation.**

Le brouillon de prompt système dit : « Parle de Marc à la **troisième
personne** ». `Docs/MARCOS.md` §11 confirme le principe : MarcoS ne doit jamais
se faire passer pour Marc.

Mais les exemples de MARCOS.md écrivent l'inverse : « Que souhaites-**tu**
découvrir ? », « Découvrir **mon** travail », « Voir **mon** parcours », « Tu veux
voir le projet BNI Finance ? », « Je peux t'expliquer **mon** rôle, le concept ou
le processus créatif » (§6, §7, §8). Ces phrases sont écrites à la première
personne **de Marc**, et tutoient le visiteur.

| Option | Conséquence |
|---|---|
| **a. Troisième personne, vouvoiement** | « Marc a réalisé… », « vous pouvez consulter… ». Aucune ambiguïté sur la nature de MarcoS, ton cohérent avec un portfolio professionnel qui s'adresse à des clients et des recruteurs. Plus distant. |
| **b. Première personne de Marc, tutoiement** (les exemples de MARCOS.md) | Plus chaleureux, plus immersif. Mais MarcoS dit « mon travail » en n'étant pas Marc : cela contredit directement §11 et la règle « ne jamais laisser entendre qu'il est une personne réelle ». Le tutoiement, en plus, cadre mal avec un public de recruteurs et d'entreprises. |
| **c. Troisième personne, tutoiement** | « Marc a réalisé… », « tu peux voir… ». Transparent sur la nature de MarcoS, et proche de ton. |
| **d. Troisième personne, vouvoiement en français, « you » en anglais** | Comme a, en notant que l'anglais ne fait pas la différence : la question du tutoiement ne se pose qu'en français. |

**Recommandation : a.** **Motif :** le public du site est « clients, entreprises,
agences, recruteurs, partenaires » — le vouvoiement y est la norme, et le reste
du site l'emploie. Surtout, b fait dire à MarcoS « mon parcours » alors que la
règle la plus forte de MARCOS.md est qu'il ne doit jamais laisser croire qu'il est
Marc : les deux ne peuvent pas tenir ensemble. Si tu préfères le tutoiement pour
le ton, prends **c**, qui garde la transparence. Dans tous les cas, **les exemples
de MARCOS.md §6 à §8 doivent être réécrits** dans la personne retenue, sinon ils
serviront de modèle au prochain intervenant.

### D-16 — MarcoS se souvient-il de la navigation du visiteur ?

`Docs/MARCOS.md` §10 envisage une mémoire de session capable de dire : « Tu as
déjà consulté plusieurs projets orientés branding. Tu veux voir mes projets en
direction artistique ? » `Docs/AI_UX.md` ne prévoit que la conservation de la
**conversation** dans `sessionStorage`, rien sur les pages visitées.

| Option | Conséquence |
|---|---|
| **a. Conversation seule** | MarcoS se souvient de ce qui a été dit dans l'onglet courant, rien d'autre. Aucun suivi de navigation, donc aucune question de vie privée. |
| **b. Conversation + pages visitées dans l'onglet** | Permet les suggestions de §10. L'historique reste dans `sessionStorage` (onglet courant, effacé à la fermeture), n'est jamais envoyé au serveur sauf la page courante. À documenter dans la mention de confidentialité (D-9). |
| **c. Page courante seulement** | MarcoS sait quelle page tu regardes — ce que prévoit déjà l'architecture, qui envoie `page` dans la requête — sans garder la liste des précédentes. Permet « vous regardez le projet Orange, je peux… » sans suivi. |

**Recommandation : c pour la V1, b à rouvrir ensuite.** **Motif :** c donne déjà
l'essentiel de la conscience du contexte voulue par MARCOS.md §8, et c'est
**déjà dans l'architecture** — rien à ajouter. b apporte les suggestions de §10,
mais c'est la première fonction de MarcoS qui constitue un profil de
comportement, même local : elle mérite sa propre décision, avec sa mention, pas
d'être embarquée par défaut.

### D-17 — Les trois actions de la première interaction

`Docs/MARCOS.md` §6 prévoit un accueil avec trois actions : « Découvrir mon
travail », « Voir mon parcours », « Me poser une question ». `Docs/AI_UX.md`
prévoit des « exemples de questions » issus de `assistant.exemples[]`.

| Option | Conséquence |
|---|---|
| **a. Les exemples de questions suffisent** | Un seul mécanisme, déjà prévu, alimenté par toi en D-9. « Découvrir mon travail » devient par exemple la question « Quels sont tes projets d'identité visuelle ? ». |
| **b. Trois actions distinctes en plus des exemples** | Deux mécanismes à concevoir, tester et traduire, pour un gain faible : les trois actions sont des questions déguisées. |

**Recommandation : a.** **Motif :** les trois actions de §6 **sont** des exemples
de questions. Les traiter comme un composant à part ajouterait du code et des
textes pour le même résultat. Il suffit que tu écrives tes exemples (D-9) en
reprenant tes trois intentions — reformulées à la personne retenue en D-15.

### D-18 — Qui paie, et avec quel plafond ?

La documentation chiffre les coûts mais ne dit jamais **qui ouvre les comptes ni
quel plafond est accepté**. C'est une décision, pas un détail.

Comptes nécessaires selon mes recommandations : **Cloudflare** (gratuit, pour le
Worker), **Mistral** (clé d'API, plafond de dépense à poser), **Google Cloud**
(si tu retiens Gemini en D-2 ; carte bancaire). Aucun n'existe aujourd'hui, et
aucun ne peut être créé par moi.

Coûts recalculés avec la base **mesurée** du 2 octobre, aux prix unitaires
relevés le 1er octobre dans la documentation du projet :

| Hypothèse | Jetons en entrée | Coût par question | À 500 questions/jour |
|---|---|---|---|
| Mistral, deux langues (D-12 a) | 11 606 | 0,0019 $ | 0,96 $/jour, ≈ 29 $/mois |
| Mistral, une langue (D-12 b) | 6 922 | 0,0012 $ | 0,61 $/jour, ≈ 18 $/mois |
| Mistral, une langue + cache de prompt | 6 922 | 0,0004 $ | 0,22 $/jour, ≈ 6 $/mois |
| Gemini en secours, une langue | 6 922 | 0,0028 $ | 1,41 $/jour **si Mistral est épuisé toute la journée** |
| Cloudflare Workers Free | — | 0 $ | 500 questions = 0,5 % du quota de 100 000/jour |

Détail du calcul, pour que tu puisses le refaire : entrée = base mesurée
(9 806 jetons en deux langues, 5 122 en français seul) + prompt système et liste
des pages (≈ 700) + historique borné (≈ 1 100) ; sortie plafonnée à 300 jetons
(`max_tokens` 400). Prix unitaires : Mistral 0,15 $ en entrée et 0,60 $ en sortie
par million, entrée en cache 0,015 $ ; Gemini 0,30 $ et 2,50 $ par million.
**Gemini coûte environ 2,3 fois plus cher que Mistral par question** : c'est
l'argument chiffré de D-1.

Ces chiffres sont le **pire cas autorisé**, pas une prévision : 500 questions par
jour sur un portfolio serait un très grand succès. Le vrai garde-fou n'est pas la
prévision, c'est le plafond.

| Option | Conséquence |
|---|---|
| **a. Budget serré** : 100 questions/jour, plafond Mistral 5 $/mois | Dépense bornée à quelques dollars. Si le site a du succès un jour, MarcoS répond « quota atteint » et renvoie vers l'e-mail. |
| **b. Budget prévu** : 500 questions/jour, plafond Mistral 20 $/mois | Marge confortable. Dépense réelle probablement très inférieure. |
| **c. Pas de plafond** | **À ne pas faire.** Un abus ou une boucle se paie sans limite. |

**Recommandation : a pour commencer.** **Motif :** on ne connaît pas le volume
réel, et le plafond est la seule protection qui ne dépende d'aucun code. 100
questions par jour est largement au-dessus du trafic d'un portfolio, et le chiffre
se relève en une minute dans la console le jour où le journal montre qu'on le
touche. Commencer serré et desserrer sur mesure coûte moins cher que l'inverse.

### D-19 — Les identifiants de modèles doivent être revérifiés

L'architecture épingle `mistral-small-2603` et `gemini-3.5-flash-lite`, relevés
le 1er octobre 2026, avec la consigne explicite de ne pas utiliser d'alias
`-latest` pour éviter les changements silencieux de comportement et de prix.

**Ce n'est pas une décision mais une obligation**, et je la relève parce qu'un
identifiant retiré donne un `404` et un MarcoS muet, sans que rien d'autre ne le
signale. À faire au moment de l'implémentation, avant d'écrire la valeur :
`GET https://api.mistral.ai/v1/models` pour Mistral, page des modèles pour
Gemini. La documentation note aussi que `generateContent`, l'appel Gemini prévu,
est classé « Legacy » par Google au profit d'une autre API : à vérifier avant de
coder le secours.

**Recommandation : vérifier à l'implémentation, consigner les valeurs réellement
constatées, et ne jamais écrire un identifiant de modèle à deux endroits.**

---

## 7. Ce qu'il faut revérifier avant la mise en ligne

Aucun chiffre de prix de ce dossier n'a été vérifié : ils viennent tous de la
documentation du projet, **relevés le 1er octobre 2026**. Mes calculs recomposent
ces prix unitaires avec la taille de base **mesurée le 2 octobre**.

**Depuis les décisions, cette liste a fondu** : Gemini et Supabase n'y figurent
plus, et il n'y a plus rien à « engager » puisque le budget est de 0 € et
qu'aucun moyen de paiement ne sera enregistré. Restent des **faits à constater**,
dont deux peuvent revenir à Marc
([section 10](#10-les-points-à-lever--un-seul-subsiste)) :

| À vérifier | Où | Pourquoi |
|---|---|---|
| Prix de Mistral Small (0,15 $ / 0,60 $ par million, cache 10 %) | tarifs Mistral | tous les coûts en dépendent |
| Identifiant exact du modèle Mistral | `GET /v1/models` | un identifiant retiré = `404` et MarcoS muet (D-19) |
| **Qu'aucun moyen de paiement n'est enregistré** chez Mistral | console Mistral | c'est la traduction opérationnelle du budget 0 € |
| Binding Rate Limiting disponible sur Workers Free | documentation et console Cloudflare | décide D-6, donc 0 ou 5 $/mois |
| Quotas Workers Free (100 000 req/jour, 10 ms CPU) | limites Cloudflare | dimensionnement |
| Comportement de la Cache API sur `workers.dev` | documentation Cloudflare | réserve de l'arbitrage B |
| ~~Le refus d'entraînement est-il gratuit ?~~ | — | **vérifié le 2 octobre : oui, et gratuit.** Reste à l'activer dans Admin → Privacy ([section 10](#10-les-points-à-lever--un-seul-subsiste)) |
| Crédits gratuits réellement disponibles (« 10 $/mo » annoncés) | console Mistral | marge réelle face au plafond de 100 questions/jour |

---

## 8. Récapitulatif rempli

Réponses de Marc du 2 octobre 2026. **A** = recommandation acceptée,
**R** = refusée, **M** = modifiée.

| # | La question, en une ligne | Ma recommandation | Décision de Marc |
|---|---|---|---|
| **A (#23)** | Où MarcoS lit-il le contenu : Supabase ou JSON produit au build ? | **JSON au build** — Supabase n'a aucune donnée, impose de réveiller #32, et ajoute un point de panne |  **A — accepté.** JSON produit au build. **Pas de Supabase.** |
| **B (#24)** | Sur quelle adresse publier l'endpoint sans domaine ? | **Cloudflare Worker sur `workers.dev`** — viable aujourd'hui, 0 $, n'aggrave pas le risque Vercel Hobby |  **A — accepté.** Cloudflare Worker sur `workers.dev`, **offre gratuite**. |
| **D-1** | Basculer sur Gemini aussi en cas de **panne** Mistral, pas seulement de quota ? | **Non** — une panne ne doit pas se transformer en facture non décidée |  **A — accepté.** Non. |
| **D-2** | Activer la facturation Gemini ? | **Oui** si tu veux un secours (l'offre gratuite ne couvre pas les visiteurs de l'EEE) ; **sinon renonce à Gemini**, c'est défendable |  **R — REFUSÉ. Option c : pas de Gemini du tout.** Aucune carte bancaire. Mistral seul, sur ses crédits gratuits. Quota atteint → « indisponible » + e-mail. Toute la matière Gemini est retirée de l'architecture : matrice de repli, disjoncteur, secours, clé, coûts. **Simplification voulue.** |
| **D-3** | Exclure téléphone, adresse précise et date de naissance de la base ? | **Oui, exclure** — exclusion structurelle, aucune injection ne peut les faire sortir |  **A — accepté.** Exclure. |
| **D-4** | Où est l'entrée de MarcoS dans le site ? | **Contact + menu en V1, présence flottante en V2** quand l'avatar existe |  **A — accepté.** Contact et menu en V1. |
| **D-5** | Ajouter Turnstile (anti-robot) dès le lancement ? | **Non** — pas de script distant contre un abus non constaté ; le plafond protège |  **A — accepté.** Pas au lancement. |
| **D-6** | Payer Workers Paid (5 $/mois) pour la limitation de débit ? | **Non, vérifier Free d'abord** — c'est un fait à constater, pas une préférence |  **R — REFUSÉ par principe.** Offre gratuite uniquement. Si le binding Rate Limiting n'est pas disponible sur Free : **ne pas payer**, se rabattre sur le budget journalier plafonné, **et me le signaler**. |
| **D-7** | DNS et hébergement de production (= #24) | **`workers.dev`**, bascule sur une route du domaine le jour de l'achat, sans changer le code |  **A — accepté.** `workers.dev`. |
| **D-8** | MarcoS répond-il en anglais depuis les faits anglais ou français ? | **Depuis l'anglais** — la traduction est faite, mesurée complète le 2 octobre |  **A — accepté.** Depuis les faits anglais. |
| **D-9** | Accueil, exemples de questions, mention de confidentialité | **À écrire par toi**, directement dans `/admin/` → Paramètres dès que le champ existe ; ne bloque pas le développement (`active: false`). Brouillons possibles sur demande |  **M — je les écrirai moi-même dans `/admin/`.** Préparer le champ, laisser `assistant.active` à `false`. Brouillons marqués comme tels acceptés ; je tranche. |
| **D-10** | Les journaux contiennent-ils le texte des questions ? | **Non, métadonnées seulement** |  **A — accepté.** Métadonnées seulement. |
| **D-11** | Refuser l'usage des données pour l'entraînement chez Mistral ? | **Oui**, avant la première question réelle |  **A — accepté, puis vérifié.** Marc avait d'abord accepté l'usage éventuel si le refus était payant (budget 0 € prime, questions de nature publique). **Vérification du 2 octobre : le refus est GRATUIT** et distinct de la rétention zéro, qui est payante. **Blocage levé** : on l'active. Reste à faire par Marc dans Admin → Privacy. |
| **D-12** | Envoyer une ou deux langues dans le contexte ? | **Une seule** — divise le coût par deux sans rien retirer |  **A — accepté, et élargi.** Une seule langue à la fois. **Et réduire la base au strict nécessaire** — proposition mesurée demandée, rendue en [section 9](#9-réduction-de-la-base-de-connaissance-mesurée). |
| **D-13** | Figurine 3D et présence flottante : MARCOS.md ou AI_UX.md ? | **Deux étapes**, et AI_UX.md doit écrire « pas en V1 » au lieu de « jamais » |  **A — accepté.** V1 sans avatar, V2 avec. `AI_UX.md` réécrit : « pas en V1 », plus « jamais ». |
| **D-14** | MarcoS connaît-il ton profil comportemental et personnel (MARCOS.md §18-25) ? | **Un tri, par toi** : méthode de travail en contenu public, confidences hors base |  **M — option a pour l'instant : hors base.** Les sections 18 à 25 de `MARCOS.md` restent un document de conception interne. Le tri sera tranché plus tard, une fois MarcoS en service. |
| **D-15** | Troisième personne ou « je » de Marc ? Tutoiement ou vouvoiement ? | **Troisième personne, vouvoiement** ; les exemples de MARCOS.md §6-8 sont à réécrire |  **A — accepté.** Troisième personne, vouvoiement. Exemples de `MARCOS.md` §6 à §8 réécrits. |
| **D-16** | MarcoS se souvient-il des pages visitées ? | **Page courante seulement en V1** ; l'historique est une décision à part |  **A — accepté.** Page courante seulement. |
| **D-17** | Trois actions d'accueil distinctes, ou exemples de questions ? | **Exemples de questions seuls** — les trois actions sont des questions déguisées |  **A — accepté.** Les exemples suffisent. |
| **D-18** | Quels plafonds de dépense, et qui ouvre les comptes ? | **100 questions/jour, plafond Mistral 5 $/mois** pour commencer ; comptes à ouvrir par toi |  **M — plafond le plus bas possible.** 100 questions/jour, et **plafond de dépense Mistral à 0 $** tant que les crédits gratuits suffisent. **MarcoS ne doit jamais pouvoir générer une facture.** |
| **D-19** | Les identifiants de modèles sont-ils encore valides ? | **À revérifier à l'implémentation**, jamais écrits à deux endroits |  **A — accepté.** Vérifier à l'implémentation. |

### Ce que ces réponses ont débloqué, et ce qu'elles ont retiré

| Effet | Détail |
|---|---|
| **Les phases sans clé sont prêtes** | liste blanche, squelette de l'endpoint, prompt, interface, tests. C'est l'essentiel du travail — il attend seulement l'ordre de démarrer |
| **La liste blanche a sa forme définitive** | D-14 la ferme : profil personnel hors base. D-12 la réduit : trois champs retirés |
| **Une phase entière disparaît** | l'ancienne IA-07, « Repli Gemini ». Plus de matrice de repli, plus de disjoncteur, plus de `REPLI_SUR_INDISPONIBILITE`, plus de second compte |
| **Une phase change de nature** | l'ancienne IA-06, « Supabase », devient « lecture d'un fichier publié » : plus de clé, plus de base, plus de mise en pause à surveiller |
| **Une phase est reportée sans date** | l'ancienne IA-11, réponse en flux : elle n'a pas de sens pour deux à trois phrases |
| **Un seul secret dans tout le projet** | `MISTRAL_CLE`. Ni Supabase, ni Gemini |
| **Il reste un verrou, et il n'est pas technique** | les trois textes de D-9. Marc les écrira dans `/admin/` ; `assistant.active` reste `false` d'ici là |

---

## 9. Réduction de la base de connaissance, mesurée

Demandé par Marc avec D-12 : « réduis la base de connaissance au strict
nécessaire. Propose-moi, mesures à l'appui, ce qu'on peut retirer de la liste
blanche sans appauvrir les réponses. »

Mesuré champ par champ sur `content/` le 2 octobre 2026, en français seul. La
liste blanche telle qu'elle était documentée pesait **15 950 caractères, soit
4 557 jetons**. Les projets en représentaient à eux seuls 62 %.

### Ce que je propose de retirer — et c'est fait

| Retiré | Caractères | Jetons | Pourquoi c'est sans perte |
|---|---|---|---|
| `projets[].valeur` | 2 602 | **−743** | Ce champ **reformule** l'enjeu que `contexte` pose et que `idee` résout. Exemple réel : « L'enjeu était de faire exister le rôle de sponsor dans l'imaginaire des supporters… ». Une réponse de deux à trois phrases n'a pas la place de le citer |
| `projets[].contexte` | 2 539 | **−725** | Le client et la nature du projet sont **déjà** dans `titre` (« Orange Sénégal · FIFA 26 ») et `categorie` (« Campagne publicitaire · sport »). Le reste est du cadrage narratif |
| `sections[parcours].etapes` | 861 | **−246** | **Doublon.** `cv.experience` décrit le même parcours en plus factuel : employeur nommé, dates, lieu, points. On garde le CV, on retire le récit |
| **Total** | **6 002** | **−1 715** | **−38 % de la base** |

Il reste, par projet : **titre, catégorie, période, rôle, disciplines, idée,
lien**. C'est exactement ce qu'il faut pour deux à trois phrases suivies d'un
renvoi vers la page — le comportement voulu, pas une dégradation. La page du
projet, elle, garde tout son texte : rien n'est retiré du **site**, seulement du
contexte envoyé au modèle.

### Un palier de plus, mesuré puis écarté

| Candidat | Jetons | Pourquoi je ne le propose pas |
|---|---|---|
| `cv.formation` | −170 | C'est ce qu'un recruteur demande en premier |
| `cv.ia` | −64 | Compétences IA : un différenciateur du profil |
| `cv.forces` | −54 | Question directe et fréquente |
| `cv.references` | −53 | « Avec quelles marques a-t-il travaillé ? » est la question la plus probable du lot |
| `couverture.faits` | −22 | Négligeable |
| **Total** | **−363** | **8 % de gain pour cinq questions légitimes rendues sans réponse.** Mauvais rapport |

**Marc a répondu le 2 octobre 2026 : non, garder le palier actuel.** Son motif,
mot pour mot : « cinq questions légitimes sans réponse pour 363 jetons, c'est un
mauvais échange. » Le palier est donc **définitivement écarté**, il n'est pas
simplement « non recommandé » : la liste blanche reste celle du tableau
ci-dessus.

### La base retenue

| Domaine | Caractères | Jetons |
|---|---|---|
| Projets (titre, catégorie, rôle, disciplines, idée) | 4 713 | 1 347 |
| CV (résumé, expériences, compétences, formation, IA, forces, références) | 3 391 | 969 |
| Sections (hors `parcours.etapes`) | 1 763 | 504 |
| Identité et contact | 81 | 23 |
| **Total** | **9 948** | **2 842** |

### Le contexte complet, avant et après

> **Chiffres corrigés le 2 octobre 2026, après l'implémentation (phase IA-01).**
> Les valeurs annoncées plus tôt dans la journée étaient calculées sur le **texte
> brut** du contenu, ce qui sous-estimait le contexte réel : la structure coûte
> aussi — noms de champs, lignes, en-têtes. Les deux colonnes ci-dessous sont
> mesurées **sur le même rendu**, seul le périmètre change. L'écart est de +8 %
> sur la base ; il ne change aucune décision, mais un chiffre faux ne reste pas.

| Poste | Avant | Après | Comment |
|---|---|---|---|
| Base de connaissance | 9 911 | **3 302** | trois champs retirés, **et une seule langue** au lieu de deux (D-12) |
| Prompt système | 698 | **396** | réécrit court, version 0.2 : habillage verbeux retiré, consignes redondantes fondues |
| Historique borné | 1 143 | **571** | 4 échanges et 2 000 caractères, au lieu de 6 et 4 000 |
| **Entrée totale** | **11 752** | **4 269** | **−7 483 jetons, soit −64 %** |
| **Sortie (`max_tokens`)** | 400 | **180** | voir ci-dessous |

La liste des pages citables est désormais **dans** la base, elle n'est plus
comptée à part.

### `max_tokens` : la valeur retenue est **180**

Tu as demandé la valeur et son motif. Une phrase française de dix-huit mots pèse
25 à 30 jetons ; trois phrases en font environ 90. **180 laisse le double de la
marge nécessaire** — pour les références `[[page:id]]` et une formulation plus
ample — tout en coupant net une réponse qui partirait en dissertation. Au-delà,
la réponse est **tronquée**, et c'est voulu : la contrainte vit dans le modèle,
pas dans une relecture humaine.

Le plafond n'est pas la seule garantie : le prompt dit « deux à trois phrases,
jamais plus », la liste est **interdite** (elle allonge sans informer), et un
test de la phase IA-09 pose la question « Raconte-moi tout sur FIFA 26 » et
**échoue** si la réponse dépasse trois phrases.

### Ce que coûte le résultat

| | Par question | À 100 questions/jour |
|---|---|---|
| Avant | 0,00194 $ | 5,83 $/mois |
| **Après** | **0,00073 $** | **2,19 $/mois** |
| **Après, avec le cache de prompt** | **0,00023 $** | **0,69 $/mois** |

L'offre gratuite de Mistral affiche « 10 $/mo in API credits ». **Le plafond de
D-18 tient dans les crédits gratuits**, et comme aucun moyen de paiement n'est
enregistré, le pire cas est l'indisponibilité — jamais la dépense.

---

## 10. Les points à lever — un seul subsiste

Tu avais demandé qu'on te signale toute option sans variante gratuite. Il y en
avait deux. **Le 2 octobre 2026, l'une est levée** (D-11 : le refus
d'entraînement est gratuit) ; l'autre se constatera à l'implémentation sans rien
te demander (D-6).

### D-6 — le binding Rate Limiting est-il gratuit ?

La disponibilité du binding Rate Limiting sur l'offre Workers Free **n'est pas
publiée**. Ta décision est claire : **on ne paie pas**. Le repli est donc arrêté
d'avance, écrit dans [AI_SECURITY.md](AI_SECURITY.md), et il ne te demandera
rien :

1. le **budget journalier de 100 questions** reste la protection principale —
   c'est lui qui borne la dépense, et il ne dépend d'aucun plan payant ;
2. la limitation par IP attendra une **règle WAF** gratuite, disponible le jour
   où une zone DNS existera, donc le jour où le domaine sera acheté ;
3. le constat te sera **signalé**, pas contourné en silence.

**Conséquence acceptée :** entre-temps, un script déterminé peut consommer le
budget du jour. Il ne peut pas coûter plus que ce budget, et le budget ne peut
pas coûter d'argent. Le risque est une indisponibilité de quelques heures, pas
une facture.

### D-11 — le refus d'entraînement est **gratuit**. Blocage levé le 2 octobre 2026

Ce point était signalé comme potentiellement bloquant. **Il ne l'est plus**, et
la documentation du projet se trompait.

Marc a d'abord tranché : « on accepte l'usage éventuel des données, et on le dit
honnêtement », motif que le budget 0 € prime et que les questions posées à un
assistant de portfolio sont de nature publique. Puis il a demandé de vérifier,
en précisant que **si le refus était gratuit, on l'activerait et cette décision
deviendrait sans objet**. C'est le cas.

**Ce que la documentation publique de Mistral établit, relevé le 2 octobre 2026 :**

| Contrôle | Disponibilité |
|---|---|
| **Rétention zéro (ZDR)** | **payante** — « ZDR is available on paid plans » |
| **Refus d'entraînement** | **gratuit, et c'est un contrôle distinct** — « ZDR and training opt-out are **separate controls** […] **You do not need ZDR to opt out of model training** » |

En mode gratuit, les données sont utilisées **par défaut**, mais le refus est
ouvert : « You have the right to opt out of this program at any time ». Procédure
pour l'API : panneau **Admin → Privacy → section `Anonymous improvement data` →
désactiver la bascule**. Aucune mention de plan payant.

**Où était l'erreur.** `AI_SECURITY.md` renvoyait à la page « rétention zéro »
pour parler du refus d'entraînement. Les deux ont été confondus, d'où un faux
blocage. Corrigé.

**Ce qu'il reste à faire, et c'est à Marc :** créer le compte, puis désactiver la
bascule. Le pas à pas est dans [AI_SECURITY.md](AI_SECURITY.md).

**Attention à l'ordre des choses.** Tant que la bascule n'est pas désactivée,
l'état honnête est « usage possible », pas « refus actif » : la variante de la
mention de confidentialité se choisit sur un **réglage effectivement appliqué**,
jamais sur une intention. Les deux variantes sont prêtes
([section 11](#11-brouillons-de-la-mention-de-confidentialité-d-9)).

La décision de Marc reste consignée dans [DECISIONS.md](DECISIONS.md) : elle
décrit ce qu'on aurait fait si le refus avait été payant, et elle sert de
position de repli si Mistral changeait ses conditions.

---

## 11. Brouillons de la mention de confidentialité (D-9)

**Ce sont des BROUILLONS.** D-9 réserve ces textes à Marc : rien ici ne part en
ligne sans sa version. Trois phrases au plus, comme demandé, en français et en
anglais. La variante se choisit sur le **réglage réellement appliqué** dans la
console Mistral, pas sur l'intention.

### Variante A — « refus actif » : la bascule est désactivée

À utiliser **après** avoir désactivé `Anonymous improvement data` dans Admin →
Privacy.

**Français**

> Votre question est transmise à Mistral, qui produit la réponse. Elle n'est
> conservée ni sur ce site ni dans ses journaux, et Mistral ne l'utilise pas pour
> entraîner ses modèles. La conversation reste dans cet onglet et disparaît
> lorsque vous le fermez.

**Anglais**

> Your question is sent to Mistral, which produces the answer. It is kept neither
> on this site nor in its logs, and Mistral does not use it to train its models.
> The conversation stays in this tab and disappears when you close it.

### Variante B — « usage possible » : la bascule est encore active

C'est l'état **par défaut** d'un compte gratuit, donc l'état honnête tant que
rien n'a été changé.

**Français**

> Votre question est transmise à Mistral, qui produit la réponse. Elle n'est
> conservée ni sur ce site ni dans ses journaux, mais Mistral peut l'utiliser pour
> améliorer ses modèles. La conversation reste dans cet onglet et disparaît
> lorsque vous le fermez.

**Anglais**

> Your question is sent to Mistral, which produces the answer. It is kept neither
> on this site nor in its logs, but Mistral may use it to improve its models. The
> conversation stays in this tab and disappears when you close it.

### Ce que ces trois phrases disent, et pourquoi dans cet ordre

| Phrase | Ce qu'elle règle |
|---|---|
| 1. « transmise à Mistral » | **le fait principal** : la question quitte le site. Le visiteur doit l'apprendre en premier, pas en dernier |
| 2. « ni conservée, ni dans les journaux » **+** le sort chez Mistral | ce que **nous** garantissons (D-10 : métadonnées seulement) et ce que **nous ne garantissons pas**. C'est la seule phrase qui change entre les deux variantes |
| 3. « reste dans cet onglet » | `sessionStorage`, effacé à la fermeture. Répond à « est-ce que ça me suit ? » sans jargon |

Ce qui est **volontairement absent** : le nom du modèle, la géographie des
serveurs, et toute promesse de conformité. Trois phrases ne peuvent pas les
porter honnêtement, et une approximation vaut moins que le silence.

**Les deux autres textes de D-9** — message d'accueil et exemples de questions —
ne sont pas brouillonnés ici : tu ne les as pas demandés, et ils portent le ton
de MarcoS plus que des faits. Dis-le si tu veux des propositions.

### Ce qui reste hors de ce dossier

- **#26** (implémenter MarcoS) n'attend plus que **ton ordre de démarrer** : les
  décisions sont prises, l'autorisation est une autre affaire. Aucune ligne ne
  s'écrit avant.
- **#49** (avatar 3D) attend cinq décisions distinctes : photo de référence,
  référence de style 3D, angles et poses, outil ou prestataire, validation du
  format proposé. Le format de fichiers attendu est déjà spécifié ; les cinq
  choix sont à toi. D-13 dit seulement si MarcoS peut démarrer sans attendre.
  **Mise à jour du 4 octobre 2026 :** les quatre premières sont tranchées et les
  dix expressions sont livrées dans `Public/Avatar_MarcoS/` ; seule la validation
  du format reste ouverte. Voir
  [MARCOS_AVATAR_EXPRESSIONS.md](MARCOS_AVATAR_EXPRESSIONS.md) §7.
- **#32** (sort du back-office Supabase) et **#22** (tests endormis) **sont
  redevenues indépendantes de MarcoS**, puisque la décision #23 écarte Supabase.
  Elles restent entières et à toi.
- Les **trois textes de D-9** : à écrire dans `/admin/` → Paramètres, quand tu
  veux. Rien ne les attend pour avancer, et rien ne se publie sans eux.

## D-20 — Resend ajoute un service d'envoi transactionnel (3 octobre 2026)

À la demande de Marc (issue #114), le Worker pourra envoyer à M. Kouassi un
brief confirmé, uniquement après accord explicite de recontact et coordonnées
volontairement fournies. Resend est un service de livraison, pas un second
fournisseur IA : D-2 continue de limiter le modèle à Mistral.

La clé d'envoi `RESEND_CLE` est un secret distinct, conservé uniquement dans les
secrets du Worker. Le destinataire est dérivé de `content/site.json` ; l'adresse
expéditeur doit appartenir à un domaine vérifié et n'est pas encore configurée.
Le contenu ne va pas dans les journaux ni dans un stockage du Worker ; les
données d'un envoi accepté sont toutefois traitées par Resend, ce qui devra être
indiqué dans la mention de confidentialité avant activation.

Cette décision remplace la phrase « un seul secret dans tout le projet » de D-2
sur le nombre de clés ; elle ne change pas la règle d'un seul fournisseur IA.
L'idempotence de Resend évite les doublons d'une même session pendant 24 heures
([documentation officielle](https://resend.com/docs/dashboard/emails/idempotency-keys)).
