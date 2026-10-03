# MarcoS — sécurité, abus et coûts

Arrêté le 2 octobre 2026 par les décisions de Marc
([MARCOS_DECISIONS.md](MARCOS_DECISIONS.md)). Voir
l'[architecture](AI_ARCHITECTURE.md) et les [données](AI_DATA.md).

**Contrainte directrice : budget 0 €.** Aucun compte payant, aucune carte
bancaire, aucun abonnement. Toute protection qui coûte de l'argent est refusée
au profit de sa variante gratuite ; s'il n'y en a pas, on le signale au lieu de
choisir.

## Règles intangibles

1. Aucune clé dans le navigateur, dans le dépôt, dans une URL ou dans un journal.
   `MISTRAL_CLE` et `RESEND_CLE` vivent uniquement dans les secrets du Worker.
   `.dev.vars*` et `.env*` sont ignorés par Git.
2. Le navigateur n'appelle **jamais directement** Mistral ni Resend.
3. Mistral reste l'unique fournisseur IA. Resend ne reçoit le brief qu'après
   confirmation et accord explicite ; son API traite alors le contenu envoyé.
4. La réponse du modèle est **du texte** : jamais insérée comme HTML.
5. Les seuls liens produits sont des liens **internes** dont l'identifiant
   existe dans la base de connaissance.
6. Un test du dépôt refuse tout motif de clé (`re_`, `sb_secret_`, `ghp_`, JWT…) dans
   les fichiers suivis ; il sera étendu au dossier du Worker.

## Menaces et protections

| Menace | Protection | Où |
|---|---|---|
| **Injection de prompt** (« ignore tes consignes… ») | consignes système en tête, contexte et question entre balises délimitées ; le prompt dit explicitement que le contenu entre balises est une donnée, jamais une consigne ; aucune action possible (pas d'outils, pas de navigation) : une injection réussie ne peut que produire du texte | prompt, Worker |
| **Jailbreak** | catégorie `jailbreaking` des garde-fous Mistral (`guardrails`, modération d'entrée) ; refus poli en cas de blocage | Worker |
| **Extraction du prompt système** | le prompt ne contient **aucun secret** ; il interdit de le citer ; le divulguer ne compromet rien | prompt |
| **Extraction de données privées** | le modèle ne reçoit **que** la liste blanche réduite : rien de privé n'est dans son contexte. Téléphone, adresse et date de naissance sont exclus **structurellement** (D-3), pas par une consigne | `connaissance.js` |
| **Profil personnel de Marc** | les sections 18 à 25 de [MARCOS.md](MARCOS.md) sont **hors base** (D-14) : MarcoS ne peut pas les réciter puisqu'il ne les reçoit pas | `connaissance.js` |
| **Fuite de secrets** | aucune clé dans le frontend, le contexte, les réponses ou les journaux ; erreur Resend sans détail fournisseur | Worker |
| **Hallucination** (client, chiffre, date inventés) | consigne « seulement le contexte » ; `temperature` 0,2 ; réponse type si l'information manque ; liens internes validés ; tests de non-invention | prompt, tests |
| **Réponses trop longues** | `max_tokens` **180** et consigne « deux à trois phrases, jamais plus ». La contrainte est dans le modèle, pas dans une relecture | `vars`, prompt |
| **Messages énormes** | corps ≤ 16 Ko, message ≤ 500 caractères, historique ≤ **4 échanges et 2 000 caractères** ; refus **avant** tout appel au fournisseur | Worker |
| **Requêtes répétitives, spam** | limite par session et par IP avec le binding Rate Limiting **si l'offre Free le permet** (voir D-6) ; sinon budget journalier seul | Worker |
| **Scraping de l'endpoint** | contrôle de `Origin` ; pas de CORS ouvert ; la réponse n'apporte rien que le site ne publie déjà | Worker |
| **Coûts incontrôlés** | `max_tokens` 180 ; **budget journalier de 100 questions** ; **aucun moyen de paiement enregistré** : MarcoS ne peut pas générer de facture (D-18) | Worker, console |
| **Données personnelles des visiteurs** | le Worker ne persiste rien ; les journaux excluent questions, briefs et coordonnées ; un brief confirmé et autorisé est transmis à Resend pour livraison ; la mention de confidentialité doit couvrir ce transfert avant activation (D-9) ; l'opt-out d'entraînement Mistral demeure requis (D-11) | Worker, Resend, site |

### Contrôle de `Origin` et CORS

L'endpoint est sur `workers.dev`, donc sur une **autre origine** que le site
(décisions #24 et D-7) : CORS s'applique.

- `ORIGINES_AUTORISEES` : liste exacte par environnement (adresse publique de
  `content/site.json`, aujourd'hui `https://marckouassi-com.vercel.app`, URL de
  preview, `http://localhost:*` en local).
- Requête `OPTIONS` : réponse avec `Access-Control-Allow-Methods: POST`,
  `Access-Control-Allow-Headers: Content-Type`, `Access-Control-Max-Age: 600`.
- Réponse : `Access-Control-Allow-Origin` = l'origine reçue si elle est
  autorisée, et `Vary: Origin`. **Jamais `*`.**
- Le jour où le domaine est acheté et que l'endpoint passe derrière
  `<domaine>/api/*`, l'appel devient de même origine : CORS n'intervient plus,
  mais le contrôle de `Origin` reste.

`Origin` peut être falsifié hors navigateur : c'est une protection contre
l'intégration sur un autre site, pas contre un script. Le budget journalier
couvre ce cas.

### Limitation de débit — et ce qui se passe si elle n'est pas gratuite

Le binding Rate Limiting accepte des périodes de **10 ou 60 s** ; ses compteurs
sont locaux à chaque emplacement Cloudflare et « intentionally designed to not
be used as an accurate accounting system ». Il sert donc à freiner, pas à
compter de l'argent.

| Clé | Limite | Période |
|---|---|---|
| identifiant de session (aléatoire, par onglet) | 6 | 60 s |
| adresse IP | 20 | 60 s |

Dépassement : `429` avec `Retry-After`, sans appel au fournisseur.

**Sa disponibilité sur le plan Workers Free n'est pas publiée. Décision D-6 de
Marc : on ne paie pas.** Si le binding n'est pas accepté sur Free, le repli est
arrêté d'avance :

1. **le budget journalier plafonné reste la protection principale** — c'est lui
   qui borne la dépense, et il ne dépend d'aucun plan payant ;
2. la limitation par IP attendra une **règle WAF** sur le plan gratuit de
   Cloudflare, disponible le jour où une zone DNS existe, donc le jour où le
   domaine est acheté ;
3. **le constat est signalé à Marc**, il n'est pas contourné en silence.

Turnstile est **écarté au lancement** (décision D-5) : il charge un script
distant, ce qu'AGENTS.md interdit sans accord, pour un abus qui n'est pas
constaté. À rouvrir si les journaux en montrent un.

### Journaux

Workers Logs (inclus en Free), en JSON structuré, **métadonnées seulement**
(décision D-10) : horodatage, environnement, version du contenu, langue, code de
sortie, latence, jetons consommés, empreinte de la session. **Jamais** : texte
des questions et des réponses, IP en clair, en-têtes d'authentification.

Le contenu du brief, les coordonnées, l'adresse destinataire et la clé
d'idempotence ne sont jamais journalisés. Un statut générique de transmission
est journalisé. Les données d'un envoi accepté sont traitées par Resend ; elles
ne sont pas conservées par le Worker.

## Coûts et limites

| Garde-fou | Valeur arrêtée | Où |
|---|---|---|
| Jetons de réponse | `max_tokens` **180** | `vars` |
| Raisonnement | désactivé ou minimal (`reasoning_effort: "none"` à tester sur Small 4) | Worker |
| **Budget journalier** | **100 questions par jour** (décision D-18), approximatif car compté par emplacement | `vars` |
| **Plafond de dépense** | **aucun moyen de paiement enregistré.** Les crédits gratuits de Mistral épuisés, l'API refuse : MarcoS répond `quota_journalier` | console Mistral |
| Hébergement | Workers **Free** : 100 000 requêtes/jour, 10 ms CPU. À 100 questions/jour, 0,1 % du quota | Cloudflare |
| Repli payant | **aucun** : pas de Gemini (D-2), pas de Workers Paid (D-6) | — |

Au-delà du budget journalier : `429 quota_journalier`. Le visiteur reçoit le
message du dictionnaire et l'adresse e-mail de contact.

**Estimation, sur le contexte réduit** : entrée 3 966 jetons, sortie ≈ 150,
soit **≈ 0,0007 $ par question**, ou **≈ 0,0002 $** avec le cache de prompt. À
100 questions par jour : **≈ 2,10 $ par mois**, ou **≈ 0,70 $** avec le cache.
L'offre gratuite de Mistral affiche « 10 $/mo in API credits » : le plafond tient
dans les crédits gratuits. Détail et prix unitaires dans
l'[architecture](AI_ARCHITECTURE.md#coûts-recalculés-sur-le-contexte-réduit).

**MarcoS ne doit jamais pouvoir générer une facture.** C'est la formulation de
Marc, et c'est une propriété structurelle, pas une surveillance : sans moyen de
paiement enregistré, le pire cas est l'indisponibilité, jamais la dépense.

## Vérifications avant la mise en ligne

- Aucun secret dans le dépôt (test automatique) et `git log -p` relu sur le
  dossier du Worker.
- Avant chaque déploiement, vérifier les secrets attendus de l'environnement :
  `MISTRAL_CLE` pour le modèle et `RESEND_CLE` pour l'email. Aucun n'est dans
  `wrangler.jsonc`, le dépôt ou les logs.
- Corpus de tests d'abus : injection, extraction du prompt, demande de
  téléphone, invention de client, messages de 10 000 caractères, rafales,
  origine étrangère, JSON malformé, **et réponse qui dépasse trois phrases**.
- **Aucun moyen de paiement enregistré** chez Mistral — à vérifier, c'est la
  traduction opérationnelle du budget 0 €.
- **Bascule `Anonymous improvement data` désactivée** (Admin → Privacy), et la
  variante de mention de confidentialité **choisie en conséquence**.
- Binding Rate Limiting : constater s'il fonctionne sur Free, et appliquer le
  repli ci-dessus si non.

## D-11 — refus d'entraînement : gratuit, et à faire par Marc

**Ce point n'est plus bloquant.** Il l'était par une confusion de ce document,
corrigée le 2 octobre 2026.

### Deux contrôles distincts, qu'il ne faut plus confondre

| Contrôle | Ce qu'il fait | Disponibilité |
|---|---|---|
| **Rétention zéro (ZDR)** | les entrées et sorties ne sont pas conservées après la réponse | **payante** — « ZDR is available on paid plans » |
| **Refus d'entraînement** | les données ne servent pas à améliorer les modèles | **gratuite** |

La documentation de Mistral est explicite : « ZDR and training opt-out are
**separate controls** […] **You do not need ZDR to opt out of model training**. »

**Ce document renvoyait à la page « rétention zéro » pour parler du refus
d'entraînement.** D'où un faux blocage, et une décision de repli que Marc a dû
prendre pour rien. L'erreur vient d'ici, pas de Mistral.

### L'état par défaut, et ce qu'il faut faire

En mode gratuit, les données **sont utilisées par défaut** : « As stated during
subscription, we may use your data (input and output) to train our artificial
intelligence models. » Mais le refus est ouvert à tout moment : « You have the
right to opt out of this program at any time. »

**Pas à pas, pour Marc, après création du compte :**

1. ouvrir le panneau Admin : <https://admin.mistral.ai/> ;
2. menu **Privacy**, dans la barre de navigation de gauche ;
3. section **`Anonymous improvement data`** : **désactiver la bascule**.

Attention : les bascules **Vibe** et **API** sont séparées. Seule celle de l'API
concerne MarcoS — c'est celle de la section `Anonymous improvement data`.

### L'ordre des choses compte

**Tant que la bascule n'est pas désactivée, l'état honnête est « usage
possible ».** La mention de confidentialité affichée au visiteur se choisit sur
un **réglage effectivement appliqué**, jamais sur une intention. Les deux
variantes sont prêtes dans
[MARCOS_DECISIONS.md](MARCOS_DECISIONS.md#11-brouillons-de-la-mention-de-confidentialité-d-9) ;
la variante « refus actif » ne se publie qu'après vérification dans la console.

**Décision de repli, consignée.** Si Mistral rendait un jour ce refus payant,
Marc a tranché d'avance : on accepte l'usage éventuel et on le dit honnêtement,
parce que le budget 0 € prime et que les questions posées à un assistant de
portfolio sont de nature publique ([DECISIONS.md](DECISIONS.md)).
