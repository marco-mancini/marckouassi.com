# MarcoS, assistant du portfolio — architecture

Statut : **architecture arrêtée, non implémentée.** Toutes les décisions sont
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
     │  navigateur : pages statiques (_site), aucune clé
     ▼
 [MarcoS, dans le portfolio]  gabarit Assistant = Modale + Conversation + Champ/Saisie + Bouton + Message
     │  HTTPS  POST /api/assistant   (JSON, sans clé, Origin contrôlée)
     ▼
 [Cloudflare Worker « assistant », sur workers.dev, offre Free]
     ├─ 1. sécurité : méthode, Origin (CORS), taille, schéma de la requête
     ├─ 2. limitation : par session et par IP si disponible, budget journalier
     ├─ 3. contexte : connaissance.json publié avec le site (cache par version)
     ├─ 4. orchestration : prompt système court + historique borné
     ├─ 5. fournisseur UNIQUE ────────────────────────────────────► [Mistral]  chat/completions
     │        quota épuisé ⇒ 429 quota_journalier, aucun autre fournisseur
     └─ 6. réponse normalisée : { texte, liens internes validés }
     ▼
 [MarcoS, dans le portfolio]  affiche le texte (jamais en HTML), liens internes uniquement
```

Le navigateur ne parle **jamais** à Mistral. La clé vit dans les secrets du
Worker.

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

| Poste | Avant les décisions | Après |
|---|---|---|
| Base de connaissance (français seul) | 4 557 jetons | **2 842** |
| Prompt système | 698 jetons | **396** |
| Liste des pages (21 entrées) | 157 jetons | 157 |
| Historique borné | 1 143 jetons (6 échanges, 4 000 car.) | **571** (4 échanges, 2 000 car.) |
| **Entrée totale** | **6 555 jetons** | **3 966** |
| Sortie (`max_tokens`) | 400 | **180** |

**Réduction de l'entrée : 2 589 jetons, soit 39 %.**

**Pourquoi `max_tokens` = 180.** Une phrase française de dix-huit mots pèse
environ 25 à 30 jetons. Trois phrases en font 90. 180 laisse le double de marge
pour les références `[[page:id]]` et une formulation plus longue, tout en
coupant net une réponse qui partirait en dissertation. Au-delà de 180, la
réponse est tronquée — ce qui est voulu : la contrainte est dans le modèle, pas
dans une relecture humaine.

## Flux d'une requête

1. Le visiteur ouvre MarcoS depuis la section Contact ou le menu (décision
   D-4) ; le navigateur affiche le message d'accueil, tiré du contenu
   `site.assistant` (voir [AI_UX.md](AI_UX.md)).
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
| Worker | `worker/assistant/` (`wrangler.jsonc`, `src/`) | point d'entrée unique `/api/assistant` |
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
(Wrangler ne les hérite pas). Les secrets attendus sont listés dans
`secrets.required` : le déploiement échoue si l'un manque.

Variables (`vars`) : `MISTRAL_MODELE`, `ORIGINES_AUTORISEES`, `CONNAISSANCE_URL`,
`LIMITE_MESSAGE`, `LIMITE_HISTORIQUE`, `MAX_JETONS_REPONSE` (180),
`DELAI_FOURNISSEUR_MS`, `BUDGET_TEMPS_MS`, `BUDGET_JOURNALIER` (100).
Secret : **`MISTRAL_CLE`**, et elle seule.

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
Entrée 3 966 jetons, sortie 150 jetons en pratique (plafond 180).

| Poste | Prix officiel | Coût d'une question |
|---|---|---|
| Mistral Small 4 | 0,15 $ entrée / 0,60 $ sortie par million ; entrée en cache 0,015 $ | **0,0007 $**, ou **0,0002 $** avec le cache de prompt |
| Cloudflare Workers Free | 100 000 requêtes/jour, 10 ms CPU | **0 $** |
| Base de connaissance | fichier publié avec le site | **0 $** |

**À 100 questions par jour, plafond de D-18 : ≈ 2,10 $ par mois, ou ≈ 0,70 $
avec le cache de prompt.** L'offre gratuite de Mistral affiche « 10 $/mo in API
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
| D-4 | entrée dans la section Contact et le menu, en V1 |
| D-5 | pas de Turnstile au lancement |
| **D-6** | **pas de Workers Paid** : offre gratuite seulement |
| D-8 | réponses anglaises depuis les faits anglais |
| D-9 | les trois textes écrits par Marc dans `/admin/` ; `assistant.active` reste `false` |
| D-10 | journaux : métadonnées seulement |
| D-11 | refus d'entraînement activé chez Mistral — **bloquant s'il exige une formule payante** |
| D-12 | une seule langue par requête, et base réduite |
| D-13 | avatar : **pas en V1**, prévu en V2 |
| D-14 | profil personnel de MARCOS.md §18-25 : **hors base** pour l'instant |
| D-15 | troisième personne, vouvoiement |
| D-16 | page courante seulement, pas d'historique de navigation |
| D-17 | exemples de questions seuls, pas d'actions d'accueil distinctes |
| D-18 | 100 questions/jour, aucune dépense possible |
| D-19 | identifiant de modèle revérifié à l'implémentation |

## Deux points à lever avant la mise en ligne

Ils découlent de la contrainte « budget 0 € » et **ne peuvent pas être tranchés
depuis le dépôt** :

1. **D-6, limitation de débit.** La disponibilité du binding Rate Limiting sur
   l'offre Workers Free n'est pas publiée. Si elle manque, **on ne paie pas** :
   on se replie sur le budget journalier plafonné, et la protection par IP est
   assurée plus tard par une règle WAF, le jour où le domaine arrive.
2. **D-11, refus d'entraînement chez Mistral.** Si ce refus exige une formule
   payante, il entre en conflit direct avec le budget 0 €. Marc a dit que ce
   point est **bloquant** : constater d'abord, décider ensuite, ne rien mettre
   en ligne entre-temps.

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
