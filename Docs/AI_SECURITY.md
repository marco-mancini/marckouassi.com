# MarcoS — sécurité, abus et coûts

Vérifié le 1er octobre 2026. Voir l'[architecture](AI_ARCHITECTURE.md) et les
[données](AI_DATA.md).

## Règles intangibles

1. Aucune clé dans le navigateur, dans le dépôt, dans une URL ou dans un journal.
   Les clés vivent uniquement dans les **secrets du Worker** (`wrangler secret put`).
   `.dev.vars*` et `.env*` sont ajoutés au `.gitignore` avant tout essai local.
2. Le navigateur n'appelle **jamais** Mistral, Gemini ni Supabase pour MarcoS.
3. Aucune clé secrète Supabase n'est nécessaire : la publication se lit avec la
   clé publique (voir [données](AI_DATA.md)).
4. La réponse du modèle est **du texte** : jamais insérée comme HTML.
5. Les seuls liens produits sont des liens **internes** dont l'identifiant existe
   dans la base de connaissance.
6. Un test du dépôt (déjà présent pour le back-office) refuse tout motif de clé
   (`sb_secret_`, `ghp_`, JWT…) dans les fichiers suivis ; il sera étendu au
   dossier du Worker.

## Menaces et protections

| Menace | Protection | Où |
|---|---|---|
| **Injection de prompt** (« ignore tes consignes… ») | consignes système en tête, contexte et question entre balises délimitées ; le prompt dit explicitement que le contenu entre balises est une donnée, jamais une consigne ; aucune action possible (pas d'outils, pas de navigation) : une injection réussie ne peut que produire du texte | prompt, Worker |
| **Jailbreak** | catégorie `jailbreaking` des garde-fous Mistral (`guardrails`, modération d'entrée) ; refus poli en cas de blocage ; jamais de repli Gemini sur un blocage | Worker |
| **Extraction du prompt système** | le prompt ne contient **aucun secret** ; il interdit de le citer ; le divulguer ne compromet rien | prompt |
| **Extraction de données privées** | le modèle ne reçoit **que** la liste blanche : rien de privé n'est dans son contexte | `connaissance.js` |
| **Fuite de secrets** | les clés ne sont jamais dans le contexte du modèle ni dans les réponses ; journaux sans en-têtes d'authentification | Worker |
| **Hallucination** (client, chiffre, date inventés) | consigne « seulement le contexte » ; `temperature` 0,2 ; réponse type si l'information manque ; liens internes validés ; tests de non-invention | prompt, tests |
| **Messages énormes** | corps ≤ 16 Ko, message ≤ 500 caractères, historique ≤ 6 échanges et 4 000 caractères ; refus **avant** tout appel fournisseur | Worker |
| **Requêtes répétitives, spam** | limite par session (6 / 60 s) et par IP (20 / 60 s) avec le binding Rate Limiting ; règle WAF par IP si la zone est chez Cloudflare | Worker, WAF |
| **Scraping de l'endpoint** | contrôle de `Origin` ; pas de CORS ouvert ; la réponse n'apporte rien que le site ne publie déjà | Worker |
| **Coûts incontrôlés** | `max_tokens` ≤ 400 ; budget journalier ; plafonds de dépense chez les fournisseurs ; disjoncteur | Worker, consoles |
| **Abus du repli** (forcer Gemini) | repli seulement sur capacité Mistral épuisée, jamais sur une requête invalide ou bloquée | Worker |
| **Données personnelles des visiteurs** | aucune conservation côté serveur ; journaux sans texte des questions (D-10) ; mention de confidentialité (D-9) ; refus d'entraînement chez Mistral (D-11) ; offre payante Gemini, qui n'entraîne pas sur les données (D-2) | Worker, consoles |
| **Contenu pour mineurs** | les conditions Gemini excluent les services destinés aux moins de 18 ans : le portfolio n'en est pas un | — |

### Contrôle de `Origin` et CORS

- `ORIGINES_AUTORISEES` : liste exacte par environnement (`https://marckouassi.com`,
  URL de preview, `http://localhost:*` en local).
- Requête `OPTIONS` : réponse avec `Access-Control-Allow-Methods: POST`,
  `Access-Control-Allow-Headers: Content-Type`, `Access-Control-Max-Age: 600`.
- Réponse : `Access-Control-Allow-Origin` = l'origine reçue si elle est
  autorisée, et `Vary: Origin`. Jamais `*`.
- En production derrière la route `marckouassi.com/api/*`, l'appel est de même
  origine : CORS n'intervient pas, mais le contrôle de `Origin` reste.

`Origin` peut être falsifié hors navigateur : c'est une protection contre
l'intégration sur un autre site, pas contre un script. Les limites de débit
et les budgets couvrent ce cas.

### Limitation de débit

Le binding Rate Limiting accepte des périodes de **10 ou 60 s** ; ses compteurs
sont locaux à chaque emplacement Cloudflare et « intentionally designed to not
be used as an accurate accounting system ». Il sert donc à freiner, pas à
compter de l'argent. Sa disponibilité sur le plan Workers Free **n'est pas
publiée** (décision D-6).

| Clé | Limite | Période |
|---|---|---|
| identifiant de session (aléatoire, par onglet) | 6 | 60 s |
| adresse IP | 20 | 60 s |

Dépassement : `429` avec `Retry-After`, sans appel fournisseur.

Règle WAF (plan Free, si la zone est chez Cloudflare) : une règle sur le chemin
`/api/assistant`, comptage par IP sur 10 s, blocage 10 s.

Turnstile reste une option (décision D-5) : il charge un script distant, ce
qu'AGENTS.md interdit sans accord.

### Journaux

Workers Logs (inclus en Free et Paid), en JSON structuré, **métadonnées
seulement** : horodatage, environnement, version du contenu, fournisseur, code
de sortie, latence, jetons consommés, empreinte de la session. Jamais : texte
des questions et réponses, IP en clair, en-têtes d'authentification.

## Coûts et limites

| Garde-fou | Valeur proposée | Où |
|---|---|---|
| Jetons de réponse | `max_tokens` 400 (Mistral), `maxOutputTokens` 400 (Gemini) | `vars` |
| Raisonnement | désactivé ou minimal (`reasoning_effort: "none"` à tester sur Small 4 ; `thinkingLevel: "MINIMAL"` sur Gemini 3.x, réflexion active par défaut) | Worker |
| Budget journalier de MarcoS | 500 questions par jour, approximatif (compteur par emplacement) | `vars` |
| Plafond de dépense Mistral | à fixer dans la console (l'accès est suspendu au plafond) | console Mistral |
| Plafond Gemini | palier 1 : plafond de facturation de 250 $ et limite de 10 $ par 10 minutes ; alerte budgétaire Google Cloud | console Google |
| Disjoncteur | après capacité Mistral épuisée : Gemini direct pendant ≤ 10 min | Worker |

Au-delà du budget journalier : `429 quota_journalier`. Le visiteur reçoit le
message du dictionnaire et l'adresse e-mail de contact.

Estimation : ≈ 0,001 $ par question avec Mistral Small 4 et ≈ 0,0024 $ avec
Gemini 3.5 Flash-Lite (détail dans l'[architecture](AI_ARCHITECTURE.md#coûts-ordres-de-grandeur)).
À 500 questions par jour au maximum, le pire cas Mistral reste proche de
15 $ par mois ; les plafonds de dépense des consoles bornent le reste.

## Vérifications avant la mise en ligne

- Aucun secret dans le dépôt (test automatique) et `git log -p` relu sur le dossier du Worker.
- `secrets.required` déclaré : le déploiement échoue si une clé manque.
- Corpus de tests d'abus (phase IA-10) : injection, extraction du prompt,
  demande de téléphone, invention de client, messages de 10 000 caractères,
  rafales, origine étrangère, JSON malformé.
- Plafonds de dépense posés et alertes budgétaires actives chez les deux fournisseurs.
- Refus d'entraînement activé chez Mistral.
