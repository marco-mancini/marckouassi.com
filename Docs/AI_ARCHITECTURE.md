# MarcoS, assistant du portfolio — architecture

Statut : **architecture arrêtée, interface V1 alignée sur D-35 ; clé et activation restent séparées.** Toutes les décisions sont
prises : Marc a répondu le 2 octobre 2026, décision par décision, dans
[MARCOS_DECISIONS.md](MARCOS_DECISIONS.md). Les deux questions ouvertes Q-1 et
Q-2 sont tranchées, et les onze décisions D-1 à D-11 plus les huit relevées
ensuite (D-12 à D-19) ont leur réponse.

Aucune clé, aucun identifiant de compte n'existe dans le dépôt.

**Deux contraintes directrices de Marc priment sur tout le reste :**

1. **Budget 0 €.** Aucun compte payant, aucune carte bancaire, aucun
   abonnement. Toute option qui implique une dépense, même minime, est refusée
   au profit de sa variante gratuite. S'il n'existe pas de variante gratuite,
   on s'arrête et on le signale.
2. **Verbosité minimale.** MarcoS répond en **deux à trois phrases**, et le
   contexte envoyé au modèle est tenu au plus petit. C'est un critère de
   conception, pas un réglage d'après-coup.

Documents liés :
[décisions de Marc](MARCOS_DECISIONS.md) · [données](AI_DATA.md) ·
[sécurité](AI_SECURITY.md) · [interface](AI_UX.md) ·
[prompt système](AI_SYSTEM_PROMPT.md) · [plan d'implémentation](AI_IMPLEMENTATION_PLAN.md) ·
[déploiement Vercel](DEPLOY_VERCEL.md)

Le contrat de qualification commerciale est défini dans
[MARCOS_QUALIFICATION.md](MARCOS_QUALIFICATION.md) ; il s'appuie sur les
prestations éditoriales et sera implémenté dans les issues PM-110 à PM-114.

## Objectif

Permettre à un visiteur de poser des questions sur Marc Kouassi, son parcours,
ses projets, ses compétences et ses prestations, et d'obtenir des réponses
**courtes, exactes et uniquement fondées sur le contenu publié du portfolio**.
MarcoS est une fonction du portfolio, pas un widget ajouté : il réutilise le
Design System et ne crée aucun langage graphique.

## Nom officiel

L'assistant s'appelle **MarcoS** : M majuscule, S majuscule. Aucune autre
graphie n'est un nom officiel. Ce nom est un texte affiché : il vient du contenu
(`content/site.json`, clé `assistant`) et des dictionnaires, jamais du code. Les
identifiants techniques restent neutres et en ASCII (`assistant`,
`/api/assistant`, `worker/assistant/`, `ASSISTANT_URL`, gabarit `Assistant`) ;
ce ne sont pas des noms.

MarcoS **n'est pas Marc** : il parle de lui à la **troisième personne** et
**vouvoie** le visiteur (décision D-15).

## Schéma

```text
 [Visiteur]
     │  présence flottante en bas à droite
     ▼
 [MarcoS, dans le portfolio]  présence + Modale + Conversation + Champ/Saisie + Bouton + Message
     │  HTTPS  POST /api/assistant   (JSON, sans clé, Origin contrôlée)
     ▼
 [Cloudflare Worker « assistant », sur workers.dev, offre Free]
     ├─ POST /api/assistant : sécurité, limites, contexte → Mistral → réponse courte
     └─ POST /api/assistant/brief : brief confirmé + accord de contact
          → Resend → destinataire éditorial du site
     ▼
 [MarcoS, dans le portfolio]  affiche le texte (jamais en HTML), liens internes uniquement
```

Le navigateur ne parle **jamais** directement à Mistral ou à Resend. Les deux
clés vivent dans les secrets du Worker ; la clé Resend n'est utilisée que par
`POST /api/assistant/brief` après validation du consentement.

## Décisions arrêtées

| Sujet | Décision | Raison |
|---|---|---|
| **Fournisseur** | **Mistral seul**, modèle `mistral-small-2603` (Mistral Small 4), sur ses **crédits gratuits** | Décision D-2 de Marc : budget 0 €, aucune carte bancaire. Un seul fournisseur, pas de secours |
| Identifiant du modèle | **épinglé**, pas d'alias `-latest` | Mistral avertit que les alias exposent à des « silent updates in model behavior and pricing ». À revérifier à l'implémentation (D-19) |
| **Quota épuisé** | `429 quota_journalier` : message du dictionnaire + e-mail de contact | Décision D-2 : il n'y a pas de second fournisseur. MarcoS se taira plutôt que de coûter |
| **Panne du fournisseur** | **pas de repli** — il n'y a rien vers quoi se replier | Décision D-1 |
| **Source des données** | **`connaissance.json`, produit au build** depuis `content/`, publié avec le site | Décision #23 : pas de Supabase. Aucun compte, aucune clé, aucune base, aucun point de panne supplémentaire |
| Base de connaissance | contenu publié **réduit**, envoyé en entier, **dans une seule langue** | Décision D-12 et sa suite : contexte au plus petit. Mesures ci-dessous |
| **Hébergement** | **Cloudflare Worker sur `workers.dev`**, offre **Free** | Décisions #24 et D-7 : viable aujourd'hui, 0 $, sans domaine, et sans étendre le risque Vercel Hobby |
| Cache | Cache API du Worker, clé = empreinte de version du fichier | Évite de relire le fichier à chaque question. Comportement non publié sur `workers.dev` : impact faible, c'est un fichier de CDN |
| **Longueur des réponses** | **2 à 3 phrases**, `max_tokens` **180** | Contrainte de verbosité minimale. Valeur justifiée ci-dessous |
| Réponse | **non diffusée en flux** | Réponses courtes ; une seule annonce accessible |
| Langue | français par défaut, anglais si la question ou la page est en anglais ; **faits anglais pour une réponse anglaise** | Décision D-8 : la traduction est faite, relue et vérifiée en production |
| Configuration | **un seul endroit** : `wrangler.jsonc` du Worker (`vars` par environnement) | Modèle, limites, délais, origines : jamais répétés dans le code |

## Taille du contexte, mesurée

Relevé le 2 octobre 2026 sur `content/`, liste blanche appliquée champ par
champ. Le détail des retraits est dans
[MARCOS_DECISIONS.md](MARCOS_DECISIONS.md#9-réduction-de-la-base-de-connaissance-mesurée).

> **Chiffres corrigés le 2 octobre 2026, après l'implémentation (IA-01).** Les
> premières valeurs de la journée étaient calculées sur le **texte brut** du
> contenu, ce qui sous-estimait le contexte réel : la structure coûte aussi. Les
> valeurs ci-dessous sont mesurées sur ce que le code produit, et l'avant comme
> l'après sont mesurés **sur la même méthode** — seul le périmètre change.

| Poste | Avant | Après |
|---|---|---|
| Base de connaissance (une langue, liste blanche réduite) | 9 911 jetons (deux langues, trois champs de plus) | **3 302** |
| Prompt système | 698 jetons | **396** |
| Historique borné | 1 143 jetons (6 échanges, 4 000 car.) | **571** (4 échanges, 2 000 car.) |
| **Entrée totale** | **11 752 jetons** | **4 269** |
| Sortie (`max_tokens`) | 400 | **180** |

**Réduction de l'entrée : 7 483 jetons, soit 64 %.**

La liste des pages citables est désormais **dans** la base, elle n'est plus
comptée à part. Le **fichier publié** pèse davantage que ce qui est envoyé — 3 834
jetons en français — parce que le JSON porte son enveloppe ; le Worker rend la
base en lignes « clé: valeur », ce qui économise 532 jetons mesurés (phase IA-03).

Un **plafond** est défendu par le build (`PLAFOND_JETONS = 4200` sur le fichier) :
un contenu qui gonfle casse la construction au lieu de dégrader en silence la
latence et la facture.

**Pourquoi `max_tokens` = 180.** Une phrase française de dix-huit mots pèse
environ 25 à 30 jetons. Trois phrases en font 90. 180 laisse le double de marge
pour les références `[[page:id]]` et une formulation plus longue, tout en
coupant net une réponse qui partirait en dissertation. Au-delà de 180, la
réponse est tronquée — ce qui est voulu : la contrainte est dans le modèle, pas
dans une relecture humaine.

## Flux d'une requête

1. Le visiteur ouvre MarcoS depuis la **présence flottante en bas à droite** ;
   Contact et menu restent des accès secondaires. Le navigateur affiche le
   message d'accueil tiré de `site.assistant` (voir [AI_UX.md](AI_UX.md)).
2. Il envoie une question (500 caractères au plus). Le navigateur envoie :

   ```json
   POST /api/assistant
   { "version": 1, "langue": "fr", "page": "/projets/aurex/",
     "session": "<identifiant aléatoire de l'onglet>",
     "messages": [ { "role": "user", "contenu": "…" } ] }
   ```

   `page` est la **page courante seulement** : MarcoS ne reçoit jamais la liste
   des pages visitées (décision D-16). L'historique est borné aux **4 derniers
   échanges** et à **2 000 caractères**.
3. Le Worker vérifie, dans l'ordre : méthode `POST`, `Origin` autorisée,
   `Content-Type: application/json`, corps ≤ 16 Ko, schéma exact, longueurs.
   Toute violation → `400` ou `413`, **sans appel au fournisseur**.
4. Limitation : session et IP (binding Rate Limiting **si disponible sur
   l'offre Free**, voir D-6), et budget journalier de **100 questions**.
   Dépassement → `429` + `Retry-After`, sans appel au fournisseur.
5. Contexte : le Worker lit `connaissance.json` publié avec le site, dans la
   **langue de la question seulement**, et le met en cache par empreinte de
   version. Il n'y a ni base de données, ni clé à présenter.
6. Prompt : prompt système court ([AI_SYSTEM_PROMPT.md](AI_SYSTEM_PROMPT.md))
   + base de connaissance entre balises + historique + question.
7. Appel Mistral (`POST https://api.mistral.ai/v1/chat/completions`,
   `Authorization: Bearer <secret>`, `max_tokens` **180**, `temperature` 0,2,
   délai 15 s).
8. Réponse : le Worker extrait le texte, transforme les références internes
   `[[page:id]]` en liens **seulement si l'identifiant existe** dans la base,
   retire toute autre URL, puis renvoie :

   ```json
   200 { "texte": "…", "liens": [ { "id": "aurex", "href": "/projets/aurex/" } ],
         "version_contenu": "a1b2c3" }
   ```

   Il n'y a plus de champ `fournisseur` : il n'y en a qu'un.
9. Le navigateur affiche le texte comme **texte** (jamais `innerHTML`), annonce
   la réponse une seule fois aux lecteurs d'écran.

Erreurs renvoyées par le Worker : codes stables, **sans texte** ; le texte
affiché vient du dictionnaire de l'interface.

| Code HTTP | `erreur` | Sens |
|---|---|---|
| 400 | `requete_invalide` | schéma, type ou champ incorrect |
| 403 | `origine_refusee` | Origin non autorisée |
| 413 | `trop_long` | message ou historique trop long |
| 429 | `trop_de_demandes` | limite par session ou IP (`Retry-After`) |
| 429 | `quota_journalier` | budget du jour atteint, **ou crédits Mistral épuisés** |
| 503 | `indisponible` | fournisseur en panne, ou contexte illisible |
| 504 | `delai_depasse` | délai global dépassé |

## Comportement quand Mistral ne répond pas

Il n'y a **pas de second fournisseur** (décision D-2). La matrice de repli, le
disjoncteur et la bascule vers un service de secours **n'existent plus**. C'est
une simplification voulue : moins de code, moins de tests, un compte en moins,
aucune carte bancaire.

| Réponse Mistral | Nouvelle tentative | Réponse au visiteur |
|---|---|---|
| 200 | — | la réponse |
| 429, `Retry-After` ≤ 2 s et budget de temps restant ≥ 10 s | une, après `Retry-After` | la réponse, ou `quota_journalier` si le second essai échoue |
| 429 autrement (quota ou crédits épuisés) | non | `quota_journalier` + e-mail de contact |
| 500, 502, 503, 504, délai de 15 s dépassé | une, après 1 s | `indisponible` |
| 400, 422 (requête mal formée) | non | `indisponible` + journal d'erreur : c'est un défaut du Worker |
| 401 (clé absente ou invalide), 403 (permissions) | non | `indisponible` + alerte de configuration |
| 403 « blocked by guardrail » | non | refus poli (dictionnaire) |
| 404 (modèle inconnu ou retiré) | non | `indisponible` + alerte (voir D-19) |

Délais : 15 s par appel ; **budget total 20 s** par requête — il n'y a plus de
second appel à prévoir ; le navigateur abandonne à 30 s. Le temps d'attente
réseau ne compte pas comme temps CPU d'un Worker.

## Composants

| Brique | Emplacement prévu | Rôle |
|---|---|---|
| Worker | `worker/assistant/` (`wrangler.jsonc`, `src/`) | `/api/assistant` et `/api/assistant/brief` |
| Base de connaissance | module pur partagé `Design_System/gabarits/connaissance.js` | liste blanche réduite ; utilisé par le **build** et par les tests |
| Fichier publié | `_site/connaissance.json`, produit au build | ce que lit le Worker |
| Prompt système | `worker/assistant/prompt/systeme.fr.md` | versionné, relu comme du contenu |
| Interface | composant `Conversation` + gabarit `Assistant` | voir [AI_UX.md](AI_UX.md) |
| Textes d'interface | `Design_System/i18n/fr.json` et `en.json`, clé `assistant` | aucun texte dans les composants |
| Textes éditoriaux | `content/site.json`, clé `assistant` (accueil, exemples, confidentialité, activation) | écrits par Marc dans `/admin/` (décision D-9) |

## Environnements

| Environnement | Worker | Origines autorisées | Fournisseur |
|---|---|---|---|
| local | `wrangler dev`, secret dans `.dev.vars` (ignoré par Git) | `http://localhost:*` | fournisseur simulé par défaut ; vraie clé possible |
| preview | `wrangler deploy --env preview` | URL de Preview Vercel | Mistral, budget bas |
| production | `wrangler deploy --env production` | adresse publique de `content/site.json` (aujourd'hui `https://marckouassi-com.vercel.app`) | Mistral |

`vars`, secrets et bindings sont **redéclarés dans chaque environnement**
(Wrangler ne les hérite pas). Avant chaque déploiement, vérifier les noms des
secrets propres à cet environnement ; les valeurs ne sont jamais dans les
fichiers suivis.

Variables (`vars`) : `MISTRAL_MODELE`, `ORIGINES_AUTORISEES`, `CONNAISSANCE_URL`,
`DELAI_CONTEXTE_MS`, `RESEND_EXPEDITEUR`, `DELAI_RESEND_MS`, `LIMITE_MESSAGE`,
`LIMITE_HISTORIQUE`, `MAX_JETONS_REPONSE` (180),
`DELAI_FOURNISSEUR_MS`, `BUDGET_TEMPS_MS`, `BUDGET_JOURNALIER` (100).
Secrets : **`MISTRAL_CLE`** pour le modèle et **`RESEND_CLE`** pour l'envoi
transactionnel. `RESEND_EXPEDITEUR` est une variable publique de configuration,
à renseigner uniquement avec un expéditeur sur un domaine vérifié. Le
destinataire vient de `site.contact.email` dans le contenu publié.

Le site connaît seulement l'**adresse** de l'endpoint, injectée au build
(`ASSISTANT_URL`). Sans elle, MarcoS n'est pas rendu.

## Hébergement de l'endpoint

**Retenu : `*.workers.dev`, offre Workers Free** (décisions #24 et D-7).

| Point | Conséquence |
|---|---|
| CORS obligatoire | L'endpoint est sur une autre origine que le site. `ORIGINES_AUTORISEES` déclare l'adresse publique de `content/site.json` ; réponse à `OPTIONS` ; `Access-Control-Allow-Origin` = l'origine reçue, `Vary: Origin`, **jamais `*`** |
| Cache API | Comportement non publié sur `workers.dev`. Impact faible : la source est un fichier statique de CDN, pas une base de données |
| Coût | **0 $** — 100 000 requêtes/jour et 10 ms de CPU sur Free. À 100 questions/jour, 0,1 % du quota |

Le site est publié par Vercel à `https://marckouassi-com.vercel.app`, adresse
officielle jusqu'à nouvel ordre ; l'achat de `marckouassi.com` est **suspendu**
(décision du 2 octobre 2026, [DECISIONS.md](DECISIONS.md)).

**Le jour où le domaine est acheté**, sans changer une ligne de code : zone
Cloudflare, puis une route `marckouassi.com/api/*` vers le même Worker.
L'appel devient de même origine (CORS n'intervient plus, le contrôle de `Origin`
reste), la Cache API est garantie, et une règle WAF par IP devient disponible
sur le plan gratuit. Côté dépôt : `url` dans `content/site.json` et
`ASSISTANT_URL` au build. Deux valeurs.

## Coûts, recalculés sur le contexte réduit

Prix unitaires relevés le 1er octobre 2026 ; **à revérifier avant tout
engagement** ([MARCOS_DECISIONS.md](MARCOS_DECISIONS.md#7-ce-quil-faut-revérifier-avant-la-mise-en-ligne)).
Entrée **4 269 jetons mesurés**, sortie 150 jetons en pratique (plafond 180).

| Poste | Prix officiel | Coût d'une question |
|---|---|---|
| Mistral Small 4 | 0,15 $ entrée / 0,60 $ sortie par million ; entrée en cache 0,015 $ | **0,00073 $**, ou **0,00023 $** avec le cache de prompt |
| Cloudflare Workers Free | 100 000 requêtes/jour, 10 ms CPU | **0 $** |
| Base de connaissance | fichier publié avec le site | **0 $** |

**À 100 questions par jour, plafond de D-18 : ≈ 2,19 $ par mois, ou ≈ 0,69 $
avec le cache de prompt.** Pour mémoire, sans les décisions de réduction, le même
volume aurait coûté ≈ 5,83 $ par mois. L'offre gratuite de Mistral affiche « 10 $/mo in API
credits » : le plafond de Marc tient dans les crédits gratuits, et **aucun moyen
de paiement n'est enregistré**. Si les crédits sont épuisés, MarcoS répond
`quota_journalier` — il ne peut pas générer de facture.

## Les décisions de Marc, pour mémoire

Le tableau complet, avec options, conséquences et motifs, est dans
[MARCOS_DECISIONS.md](MARCOS_DECISIONS.md#8-récapitulatif-rempli). En résumé :

| # | Décision de Marc |
|---|---|
| #23 | JSON produit au build, pas de Supabase |
| #24 / D-7 | Cloudflare Worker sur `workers.dev`, offre gratuite |
| D-1 | pas de repli sur indisponibilité |
| **D-2** | **pas de Gemini du tout**, Mistral seul sur crédits gratuits |
| D-3 | téléphone, adresse précise et date de naissance exclus de la base |
| D-4 | historique : entrée Contact + menu en V1, supersédée par D-35 pour l'entrée primaire |
| D-5 | pas de Turnstile au lancement |
| **D-6** | **pas de Workers Paid** : offre gratuite seulement |
| D-8 | réponses anglaises depuis les faits anglais |
| D-9 | les quatre textes **écrits le 4 octobre 2026** (D-37), dans `content/site.json` → `assistant` et éditables dans `/admin/` ; `assistant.active` reste `false` |
| D-10 | journaux : métadonnées seulement |
| D-11 | refus d'entraînement activé chez Mistral — **gratuit, vérifié le 2 octobre** ; reste à faire dans la console |
| D-12 | une seule langue par requête, et base réduite |
| D-13 | avatar reporté en V2 — **remplacée** : D-38 a supprimé la V2, D-35 a placé l'avatar et la présence flottante dans la version en cours, D-40 les a implémentés d'après la maquette d'interaction |
| D-14 | profil personnel de MARCOS.md §18-25 : **hors base** pour l'instant |
| D-15 | troisième personne, vouvoiement |
| D-16 | page courante seulement, pas d'historique de navigation |
| D-17 | exemples de questions seuls, pas d'actions d'accueil distinctes |
| D-18 | 100 questions/jour, aucune dépense possible |
| D-19 | identifiant de modèle revérifié à l'implémentation |

## Points à lever avant la mise en ligne

Ils découlaient de la contrainte « budget 0 € ». **Le second est levé** ; le
premier se constatera à l'implémentation sans rien demander à Marc :

1. **D-6, limitation de débit.** La disponibilité du binding Rate Limiting sur
   l'offre Workers Free n'est pas publiée. Si elle manque, **on ne paie pas** :
   on se replie sur le budget journalier plafonné, et la protection par IP est
   assurée plus tard par une règle WAF, le jour où le domaine arrive.
2. **D-11, refus d'entraînement chez Mistral : levé le 2 octobre 2026.** Le refus
   est **gratuit** et distinct de la rétention zéro, qui est payante — la
   documentation du projet confondait les deux. Il reste à Marc de désactiver la
   bascule `Anonymous improvement data` dans Admin → Privacy ; le pas à pas est
   dans [AI_SECURITY.md](AI_SECURITY.md#d-11--refus-dentraînement--gratuit-et-à-faire-par-marc).
   Tant que ce n'est pas fait, la mention de confidentialité affichée doit dire
   « usage possible ».

## Sources (consultées le 1er octobre 2026)

Mistral : [API chat](https://docs.mistral.ai/api/) ·
[modèles](https://docs.mistral.ai/models) ·
[Mistral Small 4](https://docs.mistral.ai/models/mistral-small-4-0-26-03) ·
[cycle de vie et alias](https://docs.mistral.ai/inference/model-lifecycle) ·
[tarifs](https://docs.mistral.ai/inference/pricing) ·
[erreurs](https://docs.mistral.ai/resources/error-glossary) ·
[limites connues](https://docs.mistral.ai/resources/known-limitations) ·
[limites d'usage](https://docs.mistral.ai/admin/billing-usage/usage-limits) ·
[abonnements](https://docs.mistral.ai/admin/billing-usage/subscriptions) ·
[sécurité et modération](https://docs.mistral.ai/studio/safety-moderation) ·
[rétention zéro](https://docs.mistral.ai/admin/monitor-comply/zero-data-retention) ·
[mistral.ai/pricing](https://mistral.ai/pricing)

Cloudflare : [limites](https://developers.cloudflare.com/workers/platform/limits/) ·
[tarifs](https://developers.cloudflare.com/workers/platform/pricing/) ·
[Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) ·
[secrets](https://developers.cloudflare.com/workers/configuration/secrets/) ·
[environnements](https://developers.cloudflare.com/workers/wrangler/environments/) ·
[configuration](https://developers.cloudflare.com/workers/wrangler/configuration/) ·
[Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/) ·
[domaines](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) ·
[journaux](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)

Points **non publiés** à constater lors de l'implémentation : statut exact
renvoyé par Mistral quand les crédits sont épuisés ; présence de `Retry-After`
sur un vrai `429` ; limites chiffrées du compte (visibles seulement dans la
console) ; disponibilité du binding Rate Limiting sur Workers Free ; conditions
du refus d'entraînement selon l'offre Mistral.

La matière Gemini et Supabase de cette architecture a été retirée le 2 octobre
2026 en application des décisions D-2 et #23. Son contenu reste dans
l'historique Git, et le **pourquoi** du retrait est consigné dans
[DECISIONS.md](DECISIONS.md).
