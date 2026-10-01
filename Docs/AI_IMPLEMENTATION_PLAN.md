# Assistant — plan d'implémentation

Rédigé le 1er octobre 2026. L'architecture est fixée dans
[AI_ARCHITECTURE.md](AI_ARCHITECTURE.md) ; ce plan ne la rediscute pas.

Branche de travail : `version-finale/portfolio-bo`. Chaque phase se termine par
`npm test`, `npm run build`, `npm run test:navigateur`,
`npm run comparer-reference` (aucune dérive du site), puis commit et push
(autorisation de sauvegarde déjà donnée). Jamais de fusion vers `main` sans
Preview Ready.

## Prérequis

| Élément | Fourni par | Nécessaire à partir de |
|---|---|---|
| Décisions D-1 à D-11 | Marc | IA-01 (D-3, D-8), IA-04 (D-4, D-9), IA-07 (D-1, D-2), IA-08 (D-5, D-6), IA-12 (D-7, D-10, D-11) |
| Compte Cloudflare + jeton d'API Wrangler + identifiant de compte | Marc | IA-12 (déploiement) ; le développement local n'en a pas besoin |
| Clé API Mistral (espace de travail dédié, plafond de dépense posé) | Marc | IA-05 |
| Clé API Gemini (projet avec facturation, D-2) | Marc | IA-07 |
| URL Supabase + clé **publique** | Marc (déjà prévues pour le back-office) | IA-06 |
| Zone DNS marckouassi.com chez Cloudflare | Marc | IA-12 |

Aucune clé secrète Supabase n'est demandée.

## Phases

### IA-01 — Base de connaissance (sans clé)
- Module pur `Design_System/gabarits/connaissance.js` : publication → base
  réduite par liste blanche ([AI_DATA.md](AI_DATA.md)), FR et EN, liens
  internes calculés avec `pages.js`.
- Tests : aucun champ hors liste blanche ; téléphone, adresse et date de
  naissance absents (D-3) ; taille mesurée et bornée ; 12 projets, projet
  supprimé, EN absent (mêmes cas que `resistance.test.mjs`).

### IA-02 — Squelette du Worker (sans clé)
- `worker/assistant/` : `wrangler.jsonc` (recommandé par Cloudflare pour les
  nouveaux projets), environnements `preview` et `production`, `vars`,
  `secrets.required`, binding Rate Limiting déclaré, `observability.enabled`.
- `.gitignore` : `.dev.vars*`, `.env*`.
- Endpoint `POST /api/assistant` : méthode, `Origin`, CORS, taille, schéma,
  longueurs, codes d'erreur stables ([architecture](AI_ARCHITECTURE.md#flux-dune-requête)).
- Fournisseurs **simulés** (même interface que les vrais) pour développer et
  tester sans réseau.
- Tests unitaires du Worker sous Node (même technique que l'Edge Function
  `publier`) : chaque refus, chaque code, aucun appel fournisseur avant validation.
- Dépendance : `wrangler` en dépendance de développement seulement.

### IA-03 — Prompt et assemblage (sans clé)
- `worker/assistant/prompt/systeme.fr.md` validé par Marc ([AI_SYSTEM_PROMPT.md](AI_SYSTEM_PROMPT.md)).
- Assemblage des messages, neutralisation des balises du visiteur, historique borné.
- Conversion `[[page:id]]` → liens internes validés ; toute autre URL retirée.
- Tests : injection de balises, identifiant inconnu, URL externe dans la réponse.

### IA-04 — Interface (sans clé, avec le Worker simulé)
- Composant `Conversation` (CSS, JS, contrat `.md`) et gabarit `Assistant`
  ([AI_UX.md](AI_UX.md)).
- Dictionnaires : clé `assistant` dans `fr.json` et `en.json` (mêmes clés,
  test existant) ; libellés des nouveaux champs dans `admin.fr.json` et `admin.en.json`.
- Contenu : `content/site.json` → `assistant` (`active: false` tant que Marc n'a
  pas écrit l'accueil) ; éditable dans Paramètres via `Gabarit_Bo`.
- Build : `ASSISTANT_URL` optionnelle ; sans elle, rien n'est rendu.
- Tests : rien en dur (tests existants étendus), rendu sans JS, `comparer-reference`
  inchangé quand l'assistant est désactivé.

### IA-05 — Mistral (clé Mistral)
- Vérifier l'identifiant exact avec `GET /v1/models` ; l'écrire **une seule fois**
  dans `wrangler.jsonc` (`MISTRAL_MODELE`).
- Appel `chat/completions` (15 s, `max_tokens` 400, `temperature` 0,2,
  `prompt_cache_key`, `guardrails` de modération d'entrée).
- Constater et consigner : corps d'un vrai `429`, présence de `Retry-After` et
  `X-RateLimit-Remaining`, statut renvoyé quand les crédits ou le plafond sont
  épuisés ; effet de `reasoning_effort: "none"` sur Small 4.
- Mettre à jour la table de repli de l'architecture avec ces constats.

### IA-06 — Supabase (URL et clé publique)
- Lecture de la version `en_ligne`, puis de son instantané ; cache par version
  ([AI_DATA.md](AI_DATA.md#cache--options-comparées)).
- Mode `SOURCE_CONTEXTE=statique` pour le développement et les previews sans Supabase.
- Tests : publication absente, Supabase en panne avec et sans cache, nouvelle version.

### IA-07 — Repli Gemini (clé Gemini, facturation active)
- Appel `generateContent` v1beta, en-tête `x-goog-api-key`, `systemInstruction`,
  `maxOutputTokens` 400, `thinkingLevel` minimal.
- Avant de coder : relire l'état de `generateContent` (classée « Legacy » par
  Google, au profit de l'Interactions API) et confirmer l'identifiant du modèle.
- Matrice de repli **testée cas par cas** ([architecture](AI_ARCHITECTURE.md#flux-en-cas-de-quota-mistral)),
  disjoncteur, `REPLI_SUR_INDISPONIBILITE` selon D-1.

### IA-08 — Protection contre les abus
- Binding Rate Limiting (session, IP), budget journalier, règle WAF si la zone
  est chez Cloudflare, plafonds de dépense dans les deux consoles.
- Turnstile seulement si D-5 l'accepte.

### IA-09 — Accessibilité et responsive
- Tests navigateur : clavier, focus, `role="log"`, annonces, `aria-invalid`,
  320 → 1440 px, clair et sombre, axe-core sans violation grave.

### IA-10 — Tests d'abus et de sécurité
- Corpus : réponses types de [AI_SYSTEM_PROMPT.md](AI_SYSTEM_PROMPT.md#réponses-types-attendues-tests),
  injection, extraction du prompt, données personnelles, messages géants,
  rafales, origine étrangère, JSON malformé.
- Recherche de secrets dans le dépôt et dans les journaux.

### IA-11 — Performance
- Mesure de latence (Mistral, Gemini, cache froid et chaud).
- Option : réponse en flux (SSE relayé par le Worker), uniquement si la latence
  le justifie et sans dégrader l'annonce accessible.

### IA-12 — Production
- DNS (D-7), route `marckouassi.com/api/*` ou sous-domaine, secrets de production,
  `wrangler deploy --env production`.
- Refus d'entraînement Mistral activé (D-11), journaux sans contenu (D-10).
- Activation : `assistant.active: true` dans Paramètres, publication.
- Vérification sur le Preview, puis production.

## Ce qui peut être fait sans clé

IA-01, IA-02, IA-03, IA-04, les tests de IA-09 et IA-10 contre le Worker simulé.

## Ce qui demande des clés ou des comptes

IA-05 (Mistral), IA-06 (URL et clé publique Supabase), IA-07 (Gemini et
facturation), IA-08 (compte Cloudflare), IA-12 (Cloudflare, DNS).

## Ce qu'il ne faut pas faire

- Mettre une clé dans le navigateur, le dépôt, une URL, un journal ou `vars`.
- Appeler Mistral, Gemini ou Supabase depuis le navigateur pour l'assistant.
- Utiliser une clé secrète Supabase ou le rôle `service_role`.
- Basculer vers Gemini sur n'importe quelle erreur (requête invalide, clé
  invalide, blocage de modération).
- Utiliser un alias `-latest` en production ou répéter un nom de modèle dans le code.
- Copier du contenu du portfolio dans le prompt, le Worker ou un composant.
- Écrire un message d'accueil, des exemples ou une traduction à la place de Marc.
- Ajouter une bulle flottante, un avatar, un dégradé, une lueur, un effet de
  frappe ou toute forme absente du Design System.
- Insérer la réponse du modèle comme HTML ou suivre une URL qu'il a produite.
- Conserver les conversations côté serveur ou les écrire dans les journaux.
- Fusionner vers `main` sans Preview Ready.
