# NéO, assistant du portfolio — architecture

Statut : **architecture validée, non implémentée** ; deux questions ouvertes (Q-1, Q-2, en fin de document). Rédigé et vérifié le
1er octobre 2026. Aucune clé, aucun identifiant de compte n'existe dans le dépôt.

Documents liés :
[données](AI_DATA.md) · [sécurité](AI_SECURITY.md) · [interface](AI_UX.md) ·
[prompt système](AI_SYSTEM_PROMPT.md) · [plan d'implémentation](AI_IMPLEMENTATION_PLAN.md) ·
[déploiement Vercel](DEPLOY_VERCEL.md)

## Objectif

Permettre à un visiteur de poser des questions sur Marc Kouassi, son parcours,
ses projets, ses compétences et ses prestations, et d'obtenir des réponses
courtes, exactes et **uniquement fondées sur le contenu publié du portfolio**.
NéO est une fonction du portfolio, pas un widget ajouté : il réutilise
le Design System et ne crée aucun langage graphique.

## Nom officiel

L'assistant s'appelle **NéO** : N majuscule, é accentué, O majuscule. Aucune
autre graphie n'est un nom officiel. Ce nom est un texte affiché : il vient du
contenu (`content/site.json`, clé `assistant`) et des dictionnaires, jamais du
code. Les identifiants techniques restent neutres et en ASCII (`assistant`,
`/api/assistant`, `worker/assistant/`, `ASSISTANT_URL`, gabarit `Assistant`) ;
ce ne sont pas des noms.

## Schéma

```text
 [Visiteur]
     │  navigateur : pages statiques (_site), aucune clé
     ▼
 [NéO, dans le portfolio]  gabarit Assistant = Modale + Conversation + Champ/Saisie + Bouton + Message
     │  HTTPS  POST /api/assistant   (JSON, sans clé, Origin contrôlée)
     ▼
 [Cloudflare Worker « assistant »]
     ├─ 1. sécurité : méthode, Origin (CORS), taille, schéma de la requête
     ├─ 2. limitation : par session et par IP, budget journalier
     ├─ 3. contexte : base de connaissance publiée (cache par version) ──► [Supabase]
     │                                                                     publications (lecture publique, statut en_ligne)
     ├─ 4. orchestration : prompt système versionné + historique borné
     ├─ 5. fournisseur principal ──────────────────────────────────────► [Mistral]  chat/completions
     │        └─ seulement si la capacité Mistral est épuisée (429 persistant, crédits)
     │           ───────────────────────────────────────────────────► [Gemini]   generateContent (repli)
     └─ 6. réponse normalisée : { texte, liens internes validés, fournisseur }
     ▼
 [NéO, dans le portfolio]  affiche le texte (jamais en HTML), liens internes uniquement
```

Le navigateur ne parle **jamais** à Mistral, à Gemini ni, pour NéO, à
Supabase. Toutes les clés vivent dans les secrets du Worker.

## Décisions

| Sujet | Décision | Raison |
|---|---|---|
| Fournisseur principal | **Mistral**, modèle **`mistral-small-2603`** (Mistral Small 4) | Recommandé par Mistral « for cost-sensitive projects » ; GA, contexte 256k ; 0,15 $ / 0,60 $ par million de jetons ; servi par défaut depuis l'UE |
| Identifiant du modèle | **épinglé** (pas d'alias `-latest`) | Mistral avertit que les alias exposent à des « silent updates in model behavior and pricing » |
| Repli | **Gemini**, modèle **`gemini-3.5-flash-lite`** | Stable depuis le 21/07/2026, sans date d'arrêt annoncée ; « fastest, most cost-effective 3.5 model » |
| Bascule vers Gemini | uniquement si la capacité Mistral est épuisée (voir [flux de repli](#flux-en-cas-de-quota-mistral)) | Gemini n'est pas un second fournisseur « à tout faire » |
| Base de connaissance | tout le contenu **publié et autorisé**, envoyé en entier (≈ 5 000 jetons) | Le contenu actuel fait ≈ 17 000 caractères : pas besoin de recherche vectorielle |
| Source des données | dernière publication `en_ligne` de Supabase, lue avec la **clé publique** | La table `publications` est déjà lisible publiquement pour le contenu publié ; aucune clé secrète Supabase dans le Worker |
| Cache | Cache API du Worker, clé = numéro de version de la publication | Évite un appel Supabase par question ; KV inutile (écritures limitées) |
| Réponse | **non diffusée en flux** en V1 | Réponses courtes ; une seule annonce accessible ; décision de repli prise avant tout envoi. Le flux reste possible plus tard (phase IA-11) |
| Langue | français par défaut, anglais si la question ou la page est en anglais | Le site est FR/EN |
| Configuration | **un seul endroit** : `wrangler.jsonc` du Worker (`vars` par environnement) | Modèles, limites, délais, origines : jamais répétés dans le code |

Les identifiants de modèles sont des **valeurs de configuration**, pas du code :
ils seront vérifiés par `GET /v1/models` (Mistral) et la page des modèles Gemini
au moment de l'implémentation (phase IA-05 et IA-07).

## Flux d'une requête

1. Le visiteur ouvre NéO (bouton du portfolio) ; le navigateur affiche le
   message d'accueil, tiré du contenu `site.assistant` (voir [AI_UX.md](AI_UX.md)).
2. Il envoie une question (500 caractères au plus). Le navigateur envoie :

   ```json
   POST /api/assistant
   { "version": 1, "langue": "fr", "page": "/projets/aurex/",
     "session": "<identifiant aléatoire de l'onglet>",
     "messages": [ { "role": "user", "contenu": "…" } ] }
   ```

   L'historique est borné aux **6 derniers échanges** et à 4 000 caractères.
3. Le Worker vérifie, dans l'ordre : méthode `POST`, `Origin` autorisée,
   `Content-Type: application/json`, corps ≤ 16 Ko, schéma exact, longueurs.
   Toute violation → `400` ou `413`, **sans appel à un fournisseur**.
4. Limitation : session et IP (binding Rate Limiting), budget journalier.
   Dépassement → `429` + `Retry-After`, sans appel à un fournisseur.
5. Contexte : le Worker lit le numéro de la dernière publication `en_ligne`
   (cache 60 s), puis la base de connaissance de cette version (cache 24 h,
   clé = version). Il construit la base par **liste blanche** (voir
   [AI_DATA.md](AI_DATA.md)).
6. Prompt : prompt système versionné ([AI_SYSTEM_PROMPT.md](AI_SYSTEM_PROMPT.md))
   + base de connaissance entre balises + historique + question.
7. Appel Mistral (`POST https://api.mistral.ai/v1/chat/completions`,
   `Authorization: Bearer <secret>`, `max_tokens` ≤ 400, `temperature` 0,2,
   délai 15 s).
8. Réponse : le Worker extrait le texte, transforme les références internes
   `[[projet:id]]` en liens **seulement si l'identifiant existe** dans la base,
   retire toute autre URL, puis renvoie :

   ```json
   200 { "texte": "…", "liens": [ { "id": "aurex", "href": "/projets/aurex/" } ],
         "fournisseur": "mistral", "version_contenu": 12 }
   ```

9. Le navigateur affiche le texte comme **texte** (jamais `innerHTML`),
   annonce la réponse une seule fois aux lecteurs d'écran.

Erreurs renvoyées par le Worker : codes stables, **sans texte** ; le texte
affiché vient du dictionnaire de l'interface.

| Code HTTP | `erreur` | Sens |
|---|---|---|
| 400 | `requete_invalide` | schéma, type ou champ incorrect |
| 403 | `origine_refusee` | Origin non autorisée |
| 413 | `trop_long` | message ou historique trop long |
| 429 | `trop_de_demandes` | limite par session ou IP (`Retry-After`) |
| 429 | `quota_journalier` | budget du jour atteint |
| 503 | `indisponible` | aucun fournisseur disponible, ou contexte illisible |
| 504 | `delai_depasse` | délai global dépassé |

## Flux en cas de quota Mistral

La documentation Mistral **ne publie aucun code** permettant de distinguer une
limite par seconde d'un quota mensuel épuisé : les deux arrivent en `429`
(`type: rate_limit_error`), avec un en-tête `Retry-After` à consulter. D'où une
règle en deux temps :

```text
Mistral répond 429
  ├─ Retry-After ≤ 2 s et budget de temps restant ≥ 10 s ?
  │     └─ oui : une seule nouvelle tentative après Retry-After
  │            ├─ 200 → réponse Mistral
  │            └─ 429 → capacité Mistral épuisée ─► Gemini
  └─ non (Retry-After absent ou long) → capacité Mistral épuisée ─► Gemini

Capacité épuisée ⇒ disjoncteur « mistral_epuise » posé pour min(Retry-After, 10 min) :
les requêtes suivantes vont directement à Gemini pendant ce temps.
```

| Réponse Mistral | Nouvelle tentative | Gemini ? | Réponse au visiteur |
|---|---|---|---|
| 200 | — | non | réponse |
| 429 (capacité, voir ci-dessus) | une, si `Retry-After` ≤ 2 s | **oui** | réponse Gemini |
| statut de crédits épuisés ou de plafond de dépense (non documenté ; à constater en phase IA-05) | non | **oui** | réponse Gemini |
| 500, 502, 503, 504, délai de 15 s dépassé | une, après 1 s | **non par défaut** (décision D-1) | `indisponible` |
| 400, 422 (requête mal formée) | non | **non** : c'est un défaut du Worker | `indisponible` + journal d'erreur |
| 401 (clé absente ou invalide), 403 (permissions) | non | **non** : cacherait une configuration cassée | `indisponible` + alerte |
| 403 « blocked by guardrail » | non | **non** : contournerait la modération | refus poli (dictionnaire) |
| 404 (modèle inconnu ou retiré) | non | **non** | `indisponible` + alerte |

Côté Gemini (`POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent`,
en-tête `x-goog-api-key`) :

| Réponse Gemini | Traitement |
|---|---|
| 200 | réponse, `fournisseur: "gemini"` |
| 429 `RESOURCE_EXHAUSTED`, 402 | `quota_journalier` (les deux fournisseurs sont épuisés) |
| 500, 503, 504 | une nouvelle tentative si le budget de temps le permet, sinon `indisponible` |
| 400 `FAILED_PRECONDITION` (facturation, pays) | `indisponible` + alerte de configuration |
| 400, 403, 404 | `indisponible` + alerte |

Délais : Mistral 15 s par appel ; Gemini 15 s ; **budget total 25 s** par
requête ; le navigateur abandonne à 30 s. Le temps d'attente réseau ne compte
pas comme temps CPU d'un Worker (documentation Cloudflare).

## Composants

| Brique | Emplacement prévu | Rôle |
|---|---|---|
| Worker | `worker/assistant/` (`wrangler.jsonc`, `src/`) | point d'entrée unique `/api/assistant` |
| Base de connaissance | module pur partagé `Design_System/gabarits/connaissance.js` | liste blanche des champs ; utilisé par le Worker et par les tests |
| Prompt système | `worker/assistant/prompt/systeme.fr.md` | versionné, relu comme du contenu |
| Interface | composant `Conversation` + gabarit `Assistant` | voir [AI_UX.md](AI_UX.md) |
| Textes d'interface | `Design_System/i18n/fr.json` et `en.json`, clé `assistant` | aucun texte dans les composants |
| Textes éditoriaux | `content/site.json`, clé `assistant` (accueil, exemples, activation) | éditables dans le back-office (Paramètres) |

## Environnements

| Environnement | Worker | Origines autorisées | Fournisseurs |
|---|---|---|---|
| local | `wrangler dev`, secrets dans `.dev.vars` (ignoré par Git) | `http://localhost:*` | fournisseurs simulés par défaut ; vraies clés possibles |
| preview | `wrangler deploy --env preview` | URL de Preview (Vercel ou Pages) | Mistral et Gemini, budgets bas |
| production | `wrangler deploy --env production` | `https://marckouassi.com` | Mistral et Gemini |

`vars`, secrets et bindings sont **redéclarés dans chaque environnement**
(Wrangler ne les hérite pas). Les secrets attendus sont listés dans
`secrets.required` : le déploiement échoue si l'un manque.

Variables (`vars`) : `MISTRAL_MODELE`, `GEMINI_MODELE`, `ORIGINES_AUTORISEES`,
`SUPABASE_URL`, `LIMITE_MESSAGE`, `LIMITE_HISTORIQUE`, `MAX_JETONS_REPONSE`,
`DELAI_FOURNISSEUR_MS`, `BUDGET_TEMPS_MS`, `REPLI_SUR_INDISPONIBILITE` (`false`).
Secrets : `MISTRAL_CLE`, `GEMINI_CLE`, `SUPABASE_CLE_PUBLIQUE`.

Le site connaît seulement l'**adresse** de l'endpoint, injectée au build
(`ASSISTANT_URL`). Sans elle, NéO n'est pas rendu.

## Hébergement de l'endpoint

| Option | Conditions | Usage |
|---|---|---|
| Route `marckouassi.com/api/*` | zone DNS gérée par Cloudflare, enregistrement **proxifié** | production (même origine : pas de CORS) |
| Domaine `assistant.marckouassi.com` | zone Cloudflare ; impossible sur un nom qui a déjà un CNAME | production si le site reste ailleurs |
| `*.workers.dev` | aucune | preview et essais (Cloudflare le traite comme un site Free, pas pour la production) |

Le site est aujourd'hui publié par GitHub Pages ; l'état du DNS de
marckouassi.com chez Cloudflare n'est pas vérifié (décision D-7).

## Coûts (ordres de grandeur)

Calcul à partir des prix officiels relevés le 1er octobre 2026, pour une question
type : ≈ 5 500 jetons en entrée (prompt + contexte + historique), ≈ 300 en sortie.

| Poste | Prix officiel | Coût d'une question |
|---|---|---|
| Mistral Small 4 | 0,15 $ entrée / 0,60 $ sortie par million ; entrée en cache 0,015 $ | ≈ 0,001 $ (≈ 0,0003 $ si le contexte est servi depuis le cache de prompt) |
| Gemini 3.5 Flash-Lite (payant) | 0,30 $ / 2,50 $ par million | ≈ 0,0024 $ |
| Cloudflare Workers | Free : 100 000 requêtes/jour, 10 ms CPU ; Paid : 5 $/mois, 10 M requêtes incluses | 0 $ sur Free à ce volume |
| Supabase | Free : 500 Mo de base, 5 Go d'egress | ≈ 0 $ (une lecture par version, mise en cache) |

Soit environ **1 $ pour 1 000 questions** avec Mistral. L'offre Free de Mistral
affiche « 10 $/mo in API credits ». Limites et budgets : voir
[AI_SECURITY.md](AI_SECURITY.md#coûts-et-limites).

## Décisions qui demandent l'accord de Marc

| # | Décision | Proposition |
|---|---|---|
| D-1 | Basculer vers Gemini aussi en cas de **panne** Mistral (5xx, délai) | Non par défaut (`REPLI_SUR_INDISPONIBILITE=false`), pour respecter « repli sur quota uniquement » |
| D-2 | Activer la **facturation** Gemini | Obligatoire : les conditions Gemini n'autorisent que les services payants pour servir des visiteurs de l'EEE, de Suisse et du Royaume-Uni |
| D-3 | Exclure de la base téléphone, adresse précise et date de naissance | Oui (voir [AI_DATA.md](AI_DATA.md)) |
| D-4 | Emplacement de l'entrée de NéO | Section Contact et menu ; pas de bulle flottante (voir [AI_UX.md](AI_UX.md)) |
| D-5 | Turnstile (script distant de Cloudflare) | Pas au lancement : AGENTS.md interdit les nouvelles ressources distantes ; à décider si un abus est constaté |
| D-6 | Plan Workers Paid (5 $/mois) | Si le binding Rate Limiting n'est pas disponible sur Free (non publié) |
| D-7 | DNS et hébergement de production | Zone Cloudflare pour router `/api/*` |
| D-8 | Réponses en anglais à partir de faits rédigés en français | Oui, sans rien ajouter ; signalé dans le prompt |
| D-9 | Message d'accueil, exemples de questions, mention de confidentialité | À rédiger par Marc (contenu), jamais par l'IA |
| D-10 | Journaux | Métadonnées seulement, jamais le texte des questions |
| D-11 | Refus d'usage des données pour l'entraînement chez Mistral | À désactiver dans la console (Admin › Privacy) avant la mise en ligne |

## Questions ouvertes, à trancher le jour de l'implémentation

Notées le 1er octobre 2026. Rien n'a été changé dans l'architecture
ci-dessus : ces points se décident au démarrage de l'implémentation.

### Q-1 — Source des données : Supabase ou fichier JSON produit au build

L'architecture actée lit la dernière publication `en_ligne` dans Supabase.
Depuis, Supabase a été écarté pour le back-office : le contenu vit dans
`content/`, édité par un CMS Git, et le projet Supabase n'existe pas. Un
projet gratuit est en outre mis en pause après 7 jours sans activité.

Option déjà prévue dans [AI_DATA.md](AI_DATA.md) : un JSON statique produit
au build (`SOURCE_CONTEXTE=statique`), calculé par la même liste blanche
(`connaissance.js`), publié avec le site et lu par le Worker. Conséquences à
examiner : aucune base, aucune clé Supabase, aucune mise en veille ; la base
de NéO suit chaque déploiement Vercel ; le fichier serait public, comme le
contenu du site dont il est extrait (la liste blanche exclut déjà les
données personnelles).

### Q-2 — Hébergement de l'endpoint sans domaine

D-7 suppose une zone DNS `marckouassi.com` chez Cloudflare pour router
`/api/*` sur le même domaine que le site. Le domaine n'est pas acheté et le
site est servi par Vercel : l'endpoint serait sur `workers.dev`, donc sur
une autre origine que le site (CORS à autoriser pour l'adresse publique de
`content/site.json`). Voir [Hébergement de l'endpoint](#hébergement-de-lendpoint).

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

Gemini : [generateContent](https://ai.google.dev/api/generate-content) ·
[modèles](https://ai.google.dev/gemini-api/docs/models) ·
[3.5 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite) ·
[dépréciations](https://ai.google.dev/gemini-api/docs/deprecations) ·
[limites](https://ai.google.dev/gemini-api/docs/rate-limits) ·
[tarifs](https://ai.google.dev/gemini-api/docs/pricing) ·
[erreurs](https://ai.google.dev/gemini-api/docs/generate-content/api-errors) ·
[dépannage](https://ai.google.dev/gemini-api/docs/troubleshooting) ·
[conditions](https://ai.google.dev/gemini-api/terms) ·
[régions](https://ai.google.dev/gemini-api/docs/available-regions) ·
[clés](https://ai.google.dev/gemini-api/docs/api-key)

Cloudflare : [limites](https://developers.cloudflare.com/workers/platform/limits/) ·
[tarifs](https://developers.cloudflare.com/workers/platform/pricing/) ·
[Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) ·
[secrets](https://developers.cloudflare.com/workers/configuration/secrets/) ·
[environnements](https://developers.cloudflare.com/workers/wrangler/environments/) ·
[configuration](https://developers.cloudflare.com/workers/wrangler/configuration/) ·
[Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/) ·
[domaines](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) ·
[journaux](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)

Supabase : [clés d'API](https://supabase.com/docs/guides/getting-started/api-keys) ·
[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) ·
[sécuriser l'API](https://supabase.com/docs/guides/api/securing-your-api) ·
[mise en pause](https://supabase.com/docs/guides/platform/free-project-pausing) ·
[facturation](https://supabase.com/docs/guides/platform/billing-on-supabase)

Points **non publiés** à constater lors de l'implémentation : statut exact
renvoyé par Mistral quand les crédits ou le plafond de dépense sont épuisés ;
présence de `Retry-After` sur un vrai `429` ; limites chiffrées des comptes
(visibles seulement dans les consoles) ; disponibilité du binding Rate Limiting
sur le plan Workers Free.
