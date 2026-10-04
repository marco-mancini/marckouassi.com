# MarcoS — plan d'implémentation

Mis à jour le 3 octobre 2026 après les décisions de Marc
([MARCOS_DECISIONS.md](MARCOS_DECISIONS.md)). L'architecture est fixée dans
[AI_ARCHITECTURE.md](AI_ARCHITECTURE.md) ; ce plan ne la rediscute pas.

**Autorisation donnée le 3 octobre 2026** pour traiter PM-109 à PM-114, dans
l'ordre de leurs dépendances, jusqu'à réalisation et validation. Cette portée
reste soumise aux contraintes et prérequis de ce plan.

Ce que les décisions ont changé dans ce plan :

- **une phase disparaît** — il n'y a plus de repli à coder (D-2) ;
- **une phase change de nature** — la source est un fichier produit au build,
  pas une base de données (#23) ;
- **aucune clé Supabase, aucune clé Gemini, aucun compte payant** : `MISTRAL_CLE`
  reste l'unique clé IA ; l'issue #114 ajoute séparément la clé d'envoi Resend ;
- la **brièveté devient un critère testé**, pas une consigne de style.
- la **qualification commerciale** est cadrée dans
  [MARCOS_QUALIFICATION.md](MARCOS_QUALIFICATION.md) et suivra les issues
  PM-110 à PM-114 ; aucune catégorie métier ne sera codée en dur.

Chaque issue est traitée sur une branche créée depuis `main`. Chaque phase se
termine par `npm test`, `npm run build`,
`npm run test:navigateur`, `npm run comparer-reference` (aucune dérive du site),
puis commit, push et pull request. Jamais de fusion vers `main` sans déploiement
d'aperçu Vercel « Ready ».

## Prérequis

| Élément | Fourni par | Nécessaire à partir de | État |
|---|---|---|---|
| Décisions D-1 à D-19 | Marc | IA-01 | **acquis le 2 octobre 2026** |
| Les trois textes de D-9 (accueil, exemples, confidentialité) | Marc, dans `/admin/` | **activation seulement** | à écrire quand il veut ; `assistant.active` reste `false` d'ici là |
| Compte Cloudflare **gratuit** + jeton d'API Wrangler | Marc | IA-10 (déploiement) ; le développement local n'en a pas besoin | à créer |
| Clé API Mistral, **sur crédits gratuits, sans moyen de paiement** | Marc | IA-05 | à créer |
| Clé Resend en permission d'envoi et adresse expéditeur d'un domaine vérifié | Marc | PM-112 (email du brief) | à créer/configurer, sans formule payante |
| Refus d'entraînement activé chez Mistral (D-11) | Marc | IA-05 | **bloquant s'il exige une formule payante** |
| Autorisation de démarrer | Marc | IA-01 | **pas encore donnée** |

**Aucune clé Supabase, aucune clé Gemini, aucun compte payant.** Si une étape
réclame une dépense, elle s'arrête et le signale : contrainte budget 0 €.

## Phases

### IA-01 — Base de connaissance réduite (sans clé)
- Module pur `Design_System/gabarits/connaissance.js` : contenu → base réduite
  par liste blanche ([AI_DATA.md](AI_DATA.md)), **une langue à la fois** (D-12),
  liens internes calculés avec `pages.js`.
- Le build écrit le fichier publié (`_site/connaissance.fr.json`,
  `connaissance.en.json`) : c'est la **source** de MarcoS (#23).
- Tests : aucun champ hors liste blanche ; `projets[].contexte`,
  `projets[].valeur` et `sections[parcours].etapes` **absents** (retraits de
  D-12) ; téléphone, adresse et date de naissance absents (D-3) ; profil
  personnel de MARCOS.md §18-25 absent (D-14) ; **taille mesurée et bornée**
  — le test échoue si la base dépasse 3 000 jetons dans une langue ; 12 projets,
  projet supprimé, champ anglais absent (repli français).

### IA-02 — Squelette du Worker (sans clé)
- `worker/assistant/` : `wrangler.jsonc`, environnements `preview` et
  `production`, `vars`, secrets d'environnement (`MISTRAL_CLE` et `RESEND_CLE`), binding
  Rate Limiting déclaré, `observability.enabled`.
- `.gitignore` : `.dev.vars*`, `.env*`.
- Endpoint `POST /api/assistant` : méthode, `Origin`, CORS, taille, schéma,
  longueurs, codes d'erreur stables
  ([architecture](AI_ARCHITECTURE.md#flux-dune-requête)).
- Fournisseur **simulé** (même interface que le vrai) pour développer et tester
  sans réseau. **Un seul** : il n'y a plus de second à simuler.
- Tests unitaires du Worker sous Node : chaque refus, chaque code, aucun appel
  fournisseur avant validation.
- Dépendance : `wrangler` en dépendance de développement seulement.

### IA-03 — Prompt court et assemblage (sans clé)
- `worker/assistant/prompt/systeme.fr.md` : la version **0.4**, le comportement
  conversationnel validé par Marc
  ([AI_SYSTEM_PROMPT.md](AI_SYSTEM_PROMPT.md)), qui remplace la 0.3.
- Le **texte intégral** de 0.4 n'est pas adoptable tel quel : mesuré à 1 271
  jetons, il porte l'entrée assemblée à 4 582, au-dessus du plafond de 4 400 qui
  protège la latence et la facture sur un budget de 0 €. Le prompt porte donc sa
  **substance** au plus court — 747 jetons, entrée assemblée à 4 058, marge 342.
  Le plafond de verbosité du prompt seul est à 760.
- Assemblage des messages, neutralisation des balises du visiteur, historique
  borné à **4 échanges et 2 000 caractères** — deux bornes indépendantes,
  éprouvées chacune de part et d'autre de son seuil.
- Conversion `[[page:id]]` → liens internes validés ; toute autre URL retirée.
- Tests : injection de balises, identifiant inconnu, URL externe dans la
  réponse, **et taille du prompt assemblé** — le test échoue si l'entrée
  dépasse 4 200 jetons.

#### Contrat conversationnel : où il est tenu

Les décisions **D-21 à D-28** ne sont pas recopiées dans les tests : la liste
est **lue** dans [MARCOS_DECISIONS_20261003.md](MARCOS_DECISIONS_20261003.md),
et `tests/prompt.test.mjs` exige qu'un scénario de
`tests/fixtures/marcos-conversations.json` exerce chacune. Une formulation que
le contrat impose « exactement » — aujourd'hui la dernière option de D-28 — est
relevée dans le document et réclamée au mot près. Ajouter une décision
conversationnelle fait donc échouer les tests tant qu'aucun scénario ne la
couvre.

Les quinze points de [#129](https://github.com/marco-mancini/marckouassi.com/issues/129)
sont tenus sans clé ni appel réseau, répartis selon leur nature :

| Point du contrat | Où il est éprouvé |
|---|---|
| identité, initiative, ton, hors périmètre, information inconnue ou privée | `tests/prompt.test.mjs` |
| option d'arbitrage de M. Kouassi, au mot près | `tests/prompt.test.mjs` |
| absence d'invention | `tests/connaissance.test.mjs` |
| propositions créatives, qualification progressive, consentement, coordonnées volontaires, FR/EN | `tests/qualification.test.mjs` |
| brief transmis, idempotence | `tests/email.test.mjs` |
| conversations longues | `tests/worker.test.mjs` |

### IA-04 — Interface (sans clé, avec le Worker simulé)
- Composant `Conversation` (CSS, JS, contrat `.md`) et gabarit `Assistant`
  ([AI_UX.md](AI_UX.md)).
- **Entrée dans la section Contact et le menu** (D-4). **Aucune présence
  flottante, aucun avatar en V1** (D-13) — et rien dans le code qui empêche de
  les ajouter en V2.
- Dictionnaires : clé `assistant` dans `fr.json` et `en.json` (mêmes clés, test
  existant), à la **troisième personne et au vouvoiement** (D-15).
- Contenu : **rien n'est écrit dans `content/site.json`.** Le bloc `assistant`
  est déclaré **facultatif** dans `tools/cms.mjs` (`FACULTATIFS.site`), donc
  proposé dans Paramètres alors même qu'il est absent des données. C'était le
  blocage de #104 : Sveltia enregistre avec `omit_empty_optional_fields`, et un
  bloc amorcé à vide aurait perdu `accueil`, `exemples` et `confidentialite` au
  premier enregistrement — après quoi la configuration, déduite de la forme des
  données, ne les aurait plus proposés. Les trois textes restent ceux de Marc
  (D-9) ; `active` n'existe qu'une fois qu'il les écrit.
- Build : `ASSISTANT_URL` optionnelle ; sans elle, rien n'est rendu.
- Tests : rien en dur, rendu sans JS, `comparer-reference` inchangé quand
  MarcoS est désactivé.
- **État au 4 octobre 2026 : livré.** Composant, gabarit, dictionnaires,
  configuration du CMS, entrées de D-4 dans Contact et le menu, branchement
  dans `Frontend/site.js`. Le site publié est identique — aucune occurrence de
  `id="assistant"` dans `_site/` — puisque ni le champ ni l'adresse n'existent.

### IA-05 — Mistral (clé Mistral, crédits gratuits)

> **État au 4 octobre 2026 : l'adaptateur est écrit, testé et branché. Il
> n'attend que `MISTRAL_CLE`.**
>
> `worker/assistant/src/mistral.js` implémente exactement la même interface que
> le fournisseur simulé. `src/worker.js` — nouveau point d'entrée du déploiement
> — importe le prompt comme module texte (règle `Text` de `wrangler.jsonc`) et
> assemble la chaîne réelle : connaissance → prompt → fournisseur.
>
> **Sans la clé, rien ne casse et rien ne part** : `creerFournisseur` rend
> `null`, la chaîne reste incomplète, l'endpoint répond `indisponible`, et
> **aucun appel réseau n'est tenté**. Seize tests le vérifient sans clé et sans
> réseau, `fetcher` injecté.
>
> Reste à faire par Marc, dans l'ordre : vérifier dans la console qu'aucun moyen
> de paiement n'est enregistré et activer le refus d'entraînement (D-11), poser
> le secret — `wrangler secret put MISTRAL_CLE` —, puis confirmer l'identifiant
> du modèle avec `verifierModele()` (D-19). `MISTRAL_MODELE` vaut aujourd'hui
> `mistral-small-2603` dans les trois environnements ; **cette valeur n'a jamais
> été confirmée contre `/v1/models`**, faute de clé.
- **Avant tout appel** : vérifier dans la console qu'**aucun moyen de paiement
  n'est enregistré**, et activer le **refus d'usage des données pour
  l'entraînement** (D-11). Si ce refus exige une formule payante, **arrêter** et
  le signaler à Marc : le point est bloquant.
- Vérifier l'identifiant exact avec `GET /v1/models` (D-19) ; l'écrire **une
  seule fois** dans `wrangler.jsonc` (`MISTRAL_MODELE`).
- Appel `chat/completions` (15 s, **`max_tokens` 180**, `temperature` 0,2,
  `prompt_cache_key` avec la langue, `guardrails` de modération d'entrée).
- Constater et consigner : corps d'un vrai `429`, présence de `Retry-After`,
  statut renvoyé quand les **crédits gratuits** sont épuisés ; effet de
  `reasoning_effort: "none"` sur Small 4.
- Mettre à jour l'architecture avec ces constats.

### IA-06 — Lecture de la base publiée (sans clé)

> **État au 4 octobre 2026 : fait.** `connaissance.js` lit `version.json`
> (cache 60 s) puis `connaissance.{langue}.json` (cache 24 h), sous la clé
> `connaissance:{origine}:{version}:{langue}`. Une publication change la
> version, donc la clé : **aucune invalidation à gérer**. Si le fichier devient
> illisible, la dernière base connue de la même origine est servie plutôt que le
> silence ; sans cache, l'erreur remonte. Treize tests couvrent cache froid,
> cache chaud, expiration, nouvelle version, FR/EN, fichier absent, illisible,
> tronqué, version illisible, adresse non chiffrée et absence de configuration.
>
> L'origine fait partie de la clé : sans elle, une adresse invalide aurait été
> servie depuis une entrée remplie par une adresse saine.
- Lecture de `connaissance.{langue}.json` par HTTP, cache par empreinte de
  version ([AI_DATA.md](AI_DATA.md#cache)).
- Tests : fichier absent, fichier illisible, nouvelle version, cache froid et
  chaud. Aucun identifiant, aucune clé : c'est un fichier public.

> **L'ancienne phase IA-07, « Repli Gemini », est supprimée.** Décision D-2 :
> pas de second fournisseur, pas de carte bancaire. Il n'y a plus de matrice de
> repli, plus de disjoncteur, plus de `REPLI_SUR_INDISPONIBILITE`. Quand Mistral
> ne répond pas, MarcoS répond `indisponible` ; quand le quota est épuisé,
> `quota_journalier` et l'adresse e-mail. **Moins de code, moins de tests, un
> compte en moins** : c'est l'effet voulu.

### IA-07 — Protection contre les abus (anciennement IA-08)
- Budget journalier de **100 questions** (D-18).
- Binding Rate Limiting (session, IP) **si l'offre Free l'accepte**. Sinon :
  **on ne paie pas** (D-6) — repli sur le budget journalier seul, règle WAF
  remise au jour où le domaine existera, et **constat signalé à Marc**.
- Turnstile : **non** (D-5).
- Aucun plafond de dépense à poser : il n'y a aucun moyen de paiement.

### IA-08 — Accessibilité et responsive (anciennement IA-09)
- Tests navigateur : clavier, focus, `role="log"`, annonces, `aria-invalid`,
  320 → 1440 px, clair et sombre, axe-core sans violation grave.

### IA-09 — Tests d'abus, de sécurité et de brièveté (anciennement IA-10)
- Corpus : réponses types de
  [AI_SYSTEM_PROMPT.md](AI_SYSTEM_PROMPT.md#réponses-types-attendues-tests),
  injection, extraction du prompt, données personnelles, messages géants,
  rafales, origine étrangère, JSON malformé.
- **Brièveté testée** : « Raconte-moi tout sur FIFA 26 » doit rendre **trois
  phrases au plus**. Une réponse plus longue est un échec, pas un détail.
- Recherche de secrets dans le dépôt et dans les journaux.

### IA-10 — Production (anciennement IA-12)
- Endpoint sur `*.workers.dev`, offre **Free** (#24, D-7) ; secrets de
  production ; `wrangler deploy --env production`.
- Refus d'entraînement vérifié (D-11), journaux sans contenu (D-10).
- Route email `POST /api/assistant/brief` : clé `RESEND_CLE` côté Worker,
  expéditeur vérifié, destinataire issu du contenu, transfert explicite et
  opt-in ; mention de confidentialité mise à jour avant activation.
- Activation : Marc écrit ses trois textes dans `/admin/` (D-9), puis passe
  `assistant.active` à `true` et enregistre.
- Vérification sur le Preview, puis en production.

> **L'ancienne phase IA-11, « Performance et réponse en flux », est reportée
> sans date.** La diffusion en flux n'a pas de sens pour une réponse de deux à
> trois phrases : elle ferait lire des fragments aux lecteurs d'écran pour
> gagner une fraction de seconde. La mesure de latence reste utile et se fait
> dans IA-09.

## Ce qui peut être fait sans clé ni compte

IA-01, IA-02, IA-03, IA-04, IA-06, et les tests de IA-08 et IA-09 contre le
Worker simulé. **C'est l'essentiel du travail.**

## Ce qui demande une clé ou un compte — tous gratuits

IA-05 (clé Mistral, crédits gratuits), IA-07 et IA-10 (compte Cloudflare
gratuit).

## Ce qu'il ne faut pas faire

- Mettre une clé dans le navigateur, le dépôt, une URL, un journal ou `vars`.
- Appeler Mistral depuis le navigateur.
- **Enregistrer un moyen de paiement**, souscrire un abonnement, ou activer une
  option payante — chez Mistral, Cloudflare, ou ailleurs. Budget 0 €.
- **Ajouter un second fournisseur** : la décision D-2 l'exclut.
- Utiliser Supabase comme source : la décision #23 l'exclut.
- Utiliser un alias `-latest` en production, ou répéter un nom de modèle dans
  le code.
- Copier du contenu du portfolio dans le prompt, le Worker ou un composant.
- Écrire un message d'accueil, des exemples ou une traduction à la place de Marc.
- **Laisser MarcoS répondre en plus de trois phrases**, ou relever `max_tokens`
  au-dessus de 180 sans décision de Marc.
- Ajouter la présence flottante ou l'avatar **en V1** (D-13) — ni les rendre
  impossibles pour la V2.
- Transmettre la liste des pages visitées (D-16), ou le profil personnel de
  MARCOS.md §18-25 (D-14).
- Insérer la réponse du modèle comme HTML, ou suivre une URL qu'il a produite.
- Conserver les conversations côté serveur ou les écrire dans les journaux.
- Fusionner vers `main` sans Preview Ready.
- **Étendre le travail au-delà des issues PM-109 à PM-114 sans nouvel ordre de Marc.**

---

## MarcoS — prêt pour la clé Mistral (4 octobre 2026)

Ce qui suit répond à une seule question : **que reste-t-il à faire avant le
premier appel réel ?** Réponse : fournir la clé.

### Ce qui fonctionne déjà, sans aucune clé

| Élément | État |
|---|---|
| Composant `Conversation`, gabarit `Assistant` | livrés, et branchés au rendu |
| Entrées dans Contact et dans le menu (D-4) | livrées ; aucune présence flottante, aucun avatar (D-13) |
| Dictionnaires FR/EN | livrés, clés identiques des deux côtés |
| Champ de contenu `assistant` | proposé par le CMS sans rien écrire dans `content/site.json` |
| Base de connaissance | publiée au build, lue et mise en cache par le Worker |
| Validation, limites, budget journalier | livrés |
| Fournisseur simulé | livré, compte ses appels |
| **Fournisseur Mistral** | **livré**, même interface, éprouvé sans clé |
| Fenêtre de chat | éprouvée au navigateur : clavier, focus, `role="log"`, erreurs, 5 largeurs, 2 thèmes, axe-core |

### Comment travailler sans clé

```sh
npm test                 # tout, y compris le fournisseur Mistral (fetcher injecté)
npm run test:navigateur  # la fenêtre de chat, réponses interceptées
```

Les tests n'appellent **jamais** le réseau. Le fournisseur simulé reste
l'outil de développement ; il n'y a pas de troisième fournisseur, et il n'y en
aura pas (D-2).

### Comment injecter la clé, le moment venu

En local, un fichier **`.dev.vars`** à la racine de `worker/assistant/` — il est
déjà couvert par `.gitignore` (`.dev.vars*`) :

```
MISTRAL_CLE=…
```

En préproduction et en production, un secret, jamais une variable :

```sh
cd worker/assistant
wrangler secret put MISTRAL_CLE --env preview
wrangler secret put MISTRAL_CLE --env production
```

`MISTRAL_CLE` n'apparaît dans aucun bloc `vars` : un test du dépôt le vérifie.

### Passer du fournisseur simulé au fournisseur réel

Il n'y a rien à changer dans le code. `creerFournisseur({ env })` rend `null`
tant que `MISTRAL_CLE` est absente, et le vrai fournisseur dès qu'elle existe.
Le fournisseur simulé n'est utilisé que par les tests, qui l'injectent.

### Confirmer l'identifiant du modèle (D-19)

`MISTRAL_MODELE` vaut `mistral-small-2603`. **Cette valeur n'a jamais été
confirmée** contre l'API, faute de clé. Le jour où elle existe :

```js
import { verifierModele } from "./src/mistral.js";
await verifierModele({ env }); // { modele, present, connus }
```

Sans clé, cette fonction refuse avant tout réseau. Elle **dit** si le modèle
existe ; elle n'en choisit jamais un autre à notre place.

### Ce qui attend autre chose que la clé

| Attend | Pour quoi | Bloquant pour le développement local ? |
|---|---|---|
| **`MISTRAL_CLE`** | le premier appel réel | **oui**, et c'est le seul |
| Les trois textes de D-9 | activer MarcoS pour les visiteurs | non — la fenêtre est éprouvée avec des textes d'essai |
| Compte Cloudflare | déployer le Worker, binding de débit | non — le Worker tourne sous Node dans les tests |
| `RESEND_CLE` | la transmission du brief par e-mail | non — route séparée, elle ne rappelle pas le modèle |

Le binding de limitation de débit suit **D-6** : s'il est absent, le module le
constate, le journalise et continue avec le budget journalier seul. Il ne fait
jamais semblant d'avoir une protection qu'il n'a pas, et aucune option payante
n'est utilisée.
