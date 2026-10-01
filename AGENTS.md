AGENTS.md — PORTFOLIO MARC KOUASSI

Ce fichier définit le cadre de travail commun à tous les agents IA intervenant sur ce projet.

Il s'applique à ce projet et à lui seul.

La documentation détaillée se trouve dans "Docs/".

---

01 — IDENTITÉ DE L'APP

1.1 Mission

Ce projet est le portfolio professionnel de Marc Kouassi.

Il présente :

- son identité professionnelle ;
- son parcours ;
- ses compétences ;
- ses réalisations ;
- son univers créatif ;
- ses expériences et références validées.

1.2 Public

- clients ;
- entreprises ;
- agences ;
- recruteurs ;
- partenaires professionnels ;
- visiteurs intéressés par son travail.

1.3 Périmètre

Le site est un portfolio professionnel.

Toute fonctionnalité ou évolution qui sort de ce périmètre doit être explicitement demandée ou documentée comme décision de projet.

1.4 Règle de contenu

Ne jamais inventer :

- expérience ;
- client ;
- projet ;
- date ;
- compétence ;
- certification ;
- résultat ;
- information biographique ;
- affirmation commerciale.

Une information inconnue reste inconnue jusqu'à validation.

---

02 — INSTRUCTIONS DE CADRAGE

2.1 Source de contexte

Avant toute modification importante, consulter la documentation du projet :

Docs/

L'agent doit lire la documentation spécialisée concernée par sa tâche avant d'intervenir.

2.2 Hiérarchie

En cas de contradiction :

1. Sécurité et règles non négociables.
2. Instruction utilisateur actuelle.
3. Décision validée et datée.
4. Règle métier ou produit documentée.
5. État réel du code.
6. Issues / tâches / suivi.
7. Hypothèse de l'agent.

Le code décrit ce qui existe.

Une décision validée décrit ce qui doit exister.

Lorsqu'une décision valide contredit le code, le code est considéré comme étant en dette.

2.3 Lire avant d'écrire

Aucune supposition.

Avant de modifier :

1. rechercher l'existant ;
2. lire les fichiers concernés ;
3. identifier les dépendances ;
4. comprendre la cause ;
5. seulement ensuite modifier.

Un nom trouvé dans une documentation ne prouve pas que le fichier ou le composant existe réellement.

2.4 Une information = une source

Un même fait ne doit pas être saisi à plusieurs endroits.

Si une information peut être dérivée d'une source existante :

«dériver, ne pas dupliquer.»

---

03 — DESIGN SYSTEM & UI/UX

3.1 Source

Le Design System existant est prioritaire.

Les valeurs visuelles communes sont centralisées dans :

Design_System/fondations/Tokens.css

Le point d'entrée des feuilles de style est :

Design_System/styles/Index.css

Avant de créer :

1. rechercher le composant ;
2. vérifier ses variantes ;
3. vérifier ses tokens ;
4. l'étendre si nécessaire ;
5. créer du nouveau uniquement si aucune solution existante ne convient.

3.2 Règle fondamentale

Réutiliser avant de créer.

Un composant existant s'étend.

Il ne se recopie pas.

Un motif visuel répété devient un composant ou une extension du composant existant.

3.3 Interdictions

Ne pas :

- créer un composant doublon ;
- redessiner un composant existant ;
- introduire une couleur arbitraire ;
- introduire une typographie arbitraire ;
- écrire une valeur en dur hors de Tokens.css ;
- créer des styles concurrents ;
- ajouter une librairie UI sans justification ;
- contourner le Design System pour aller plus vite.

Aucune couleur, taille, durée, espacement ou rayon ne s'écrit en clair ailleurs que dans Tokens.css. Si une valeur manque, créer un token.

3.4 Vérification visuelle

Toute modification UI significative doit être vérifiée dans le navigateur, sur le résultat réellement généré dans "_site/", jamais dans une vue locale isolée.

Largeurs à vérifier :

320 px
375 px
390 px
768 px
1024 px
1280 px
1440 px

Modes à vérifier :

clair
sombre

Seuils à respecter :

contraste petit texte     4,5:1
contraste grand texte     3:1
débordement horizontal    0
erreurs console           0
images cassées            0
requêtes échouées         0

Ces chiffres sont MESURÉS dans le navigateur, jamais estimés. Ils figurent dans le rapport.

Piège connu : un calcul de contraste qui ne lit que "background-color" donne un résultat faux lorsque l'élément repose sur un dégradé, une image ou un texte à contour. Vérifier visuellement avant de « corriger » un contraste qui n'est pas cassé.

Vérifier également :

- états interactifs ;
- navigation clavier et focus visible ;
- zones interactives ≥ 44 × 44 px ;
- textes alternatifs des images.

3.5 Motion

Toute animation doit respecter :

prefers-reduced-motion

Une animation sans gestion de réduction de mouvement est considérée comme incomplète.

---

04 — MODE DE TRAVAIL & WORKFLOW

4.1 Principe

Le workflow obligatoire est :

COMPRENDRE
→ DIAGNOSTIQUER
→ PLANIFIER
→ MODIFIER
→ TESTER
→ PROUVER
→ DOCUMENTER

Pour un diagnostic :

DIAGNOSTIC
→ HYPOTHÈSES
→ VERDICT
→ CORRECTION

Ne pas mélanger diagnostic et correction.

4.2 Chercher la cause

Ne jamais corriger uniquement le symptôme.

Avant une correction :

- d'où vient réellement le problème ?
- qui dépend de ce comportement ?
- quelles conséquences aura la modification ?

4.3 Vérifier l'existant

Avant toute ligne nouvelle :

1. Est-ce que cela existe ?
2. Peut-on l'étendre ?
3. Est-il réellement nécessaire de créer quelque chose ?

4.4 Autonomie

L'agent décide seul

Pour les décisions techniques locales qui ne modifient pas :

- le périmètre ;
- une donnée sensible ;
- une règle métier ;
- une promesse publique ;
- la sécurité ;
- l'architecture centrale.

L'agent consigne ses choix importants.

L'agent consigne et continue

Lorsqu'un arbitrage est nécessaire mais ne bloque pas le reste :

Problème
Options
Choix
Motif
Impact
Réversibilité

L'agent s'arrête

Arrêt obligatoire en cas de :

- perte ou risque de perte de données ;
- secret exposé ;
- écriture non autorisée en production ;
- problème de sécurité critique ;
- état Git impossible à qualifier ;
- contradiction insoluble ;
- impossibilité de prouver que l'état actuel est sûr.

4.5 Ne jamais dépasser un problème

Tout problème découvert pendant une tâche doit être :

- identifié ;
- localisé ;
- corrigé s'il est dans le périmètre ;
- sinon consigné dans une issue ou le suivi.

Un problème découvert ne doit jamais être volontairement ignoré.

---

05 — STACK, ARCHITECTURE & CODE

5.1 Source

L'architecture détaillée est documentée dans "Docs/".

L'agent doit consulter ces sources avant une modification architecturale.

5.2 Architecture

content/              → contenu source, seule source de vérité du contenu
Design_System/        → système visuel
Frontend/             → comportements du site
tools/                → génération et outils
tests/                → tests
Public/images/        → médias
Docs/                 → documentation
_site/                → résultat généré, jamais commité
.github/workflows/    → intégration continue

Respecter :

- l'organisation existante des dossiers ;
- les conventions de nommage ;
- les responsabilités des couches ;
- les dépendances ;
- les points d'entrée ;
- les scripts ;
- les outils de build et de test.

Ne pas créer une architecture parallèle.

Ne pas créer de copie concurrente du contenu.

5.3 Stack

- Node.js ≥ 22.6
- JavaScript, modules ES
- Sveltia CMS, écrivant dans content/ par Git
- Sharp
- Playwright
- axe-core
- Vercel

Le back-office Supabase est EN SOMMEIL. Il n'est pas actif, pas branché, et ne doit être ni utilisé ni étendu. Lire "Docs/ADMIN_EN_SOMMEIL.md" avant toute intervention le concernant.

Le projet ne doit pas être transformé en framework frontend sans demande explicite.

5.4 Dépendances

Avant d'ajouter une dépendance :

1. vérifier si une solution existe déjà ;
2. vérifier les dépendances installées ;
3. vérifier si l'ajout est réellement nécessaire ;
4. documenter la raison si l'ajout est justifié.

5.5 Git et méthode de travail

Toute décision prise devient une issue GitHub.

Une décision prise en conversation devient une issue dans la foulée.

Un défaut découvert devient une issue AVANT d'être corrigé.

Le cycle est :

issue
→ branche nommée pm-0xx-titre-court
→ modification
→ test
→ preuve
→ commit
→ push
→ pull request fermant l'issue
→ workflow « Vérifier » vert
→ fusion

Aucun push direct sur "main".

"main" correspond à la production.

GitHub partage un même compteur entre les issues et les pull requests : la suite des numéros PM comporte donc des trous. C'est normal.

5.6 Preuve de push

Un commit n'est pas une preuve que le travail fonctionne.

Un push n'est pas prouvé tant que le dépôt distant n'a pas été interrogé directement.

Après chaque push :

git ls-remote origin <branche>

Comparer ce SHA au SHA local, et donner LES DEUX dans le rapport.

Pourquoi : une référence locale périmée fait croire à un échec ou à une réussite qui n'existe pas. Les deux cas se sont produits sur ce projet.

Le mot « poussé » ne se prononce jamais sans cette comparaison.

Un run GitHub vert ou un déploiement réussi ne sont pas des preuves de push.

Après une fusion, vérifier que le résultat réel contient bien le changement.

---

06 — RÈGLES NON NÉGOCIABLES

6.1 Ce qui n'est pas prouvé n'est pas fait

Un :

build vert
tests verts
commit présent
message de succès

ne constitue pas à lui seul une preuve.

Une correction doit être vérifiée par son effet réel.

Preuves

- UI → navigateur réel ;
- API → requête réelle ;
- données → lecture réelle ;
- sécurité → comportement refusé ;
- build → build réel ;
- fichier → présence réelle ;
- déploiement → environnement réel ;
- push → SHA distant comparé au SHA local.

Les rapports utilisent :

PASS
FAIL
NON TESTÉ
NON APPLICABLE

"NON TESTÉ" ne devient jamais implicitement "PASS".

---

6.2 LES SUIVIS ET LEUR PRÉSÉANCE

L'état du projet est écrit à plusieurs endroits. Chacun a un rôle distinct, et un seul fait autorité.

LES ISSUES GITHUB sont la source de vérité du projet. Elles portent l'état réel de chaque tâche.

LA LISTE DE TÂCHES ne vit que le temps d'une session. Elle organise le travail en cours, elle ne décrit pas le projet.

LE JOURNAL DES DÉCISIONS garde le POURQUOI, que les issues ne gardent pas.

LE VERROU DE SESSION empêche deux sessions de s'écraser.

LE MIROIR MOBILE est une vue générée. Ce n'est jamais une source.

En cas de contradiction entre deux suivis, les issues l'emportent. L'écart est corrigé immédiatement, jamais « plus tard ».

Liste de tâches

Dès qu'une session contient plusieurs tâches :

«créer la liste avant la première écriture.»

Une entrée = une tâche réelle.

Une seule tâche peut être "En cours".

Statuts :

À FAIRE
EN COURS
BLOQUÉ
À RETESTER
TERMINÉ
RÉGRESSÉ
OBSOLETE

Une tâche n'est "TERMINÉE" que lorsque ses critères sont réellement mesurés.

Une tâche bloquée reste visible avec son motif.

La liste ne doit jamais masquer les échecs.

Le système natif de tâches de l'agent est prioritaire lorsqu'il existe.

---

6.3 AVANCEMENT

L'avancement doit être lisible à tout moment.

Le pourcentage annoncé correspond uniquement au lot en cours, jamais à une estimation arbitraire du projet entier.

La source de vérité de l'état du projet est l'ensemble des issues GitHub.

Ne jamais maintenir plusieurs pourcentages indépendants.

---

6.4 MIROIR MOBILE DE L'AVANCEMENT

Le projet peut disposer d'une vue de suivi lisible depuis un téléphone :

Docs/suivi/ETAT_MOBILE.md

Ce document est un miroir, jamais une seconde source de vérité.

Il est PRODUIT AUTOMATIQUEMENT depuis les issues GitHub.

Il n'est JAMAIS écrit ni modifié à la main.

Il porte :

sa date de génération
le SHA depuis lequel il a été généré

Il permet de voir rapidement :

PROJET
ÉTAT GLOBAL
LOT EN COURS
TÂCHE EN COURS
TÂCHES TERMINÉES
TÂCHES BLOQUÉES
PROCHAINE ACTION
DERNIÈRE PREUVE
DERNIÈRE MISE À JOUR

S'il ne peut pas être généré automatiquement, il n'est pas créé. Les issues suffisent : elles sont déjà lisibles depuis l'application GitHub sur téléphone.

Pourquoi cette règle : un document de suivi tenu à la main diverge toujours de la réalité. Un rapport de ce dépôt a affirmé « PROJECTS non migré » plusieurs jours après la migration.

---

6.5 JOURNAL DES DÉCISIONS

Toute décision importante doit être traçable.

Le journal garde le POURQUOI d'une décision, que l'issue ne garde pas.

Format :

PROBLÈME
OPTIONS
CHOIX
MOTIF
IMPACT
RÉVERSIBILITÉ

Une décision provisoire reste explicitement provisoire.

Une décision plus récente remplace une ancienne décision sur le même sujet.

---

6.6 VERROU DE SESSION

Pour les travaux concurrents ou les runs automatisés :

Docs/suivi/run_en_cours.md

Le verrou contient :

identifiant de session
processus
date/heure de démarrage
dernière activité
branche
SHA

Un ancien verrou n'est pas supprimé sans preuve que le processus associé est réellement terminé.

Avant un push, vérifier que le verrou appartient toujours à la session courante.

---

6.7 RUN NOCTURNE

Le déclencheur officiel est :

run nocturne

Lorsqu'il est déclenché :

- aucune question intermédiaire ;
- aucune demande de confirmation ;
- aucune pause volontaire ;
- exécution autonome ;
- une seule tâche en cours ;
- tâche vérifiée avant clôture ;
- commit après clôture ;
- push selon le protocole, SHA distant comparé au SHA local ;
- panneau de tâches tenu à jour.

Périmètre

Les issues portant l'étiquette "decision-marc" ne sont JAMAIS traitées pendant un run nocturne. Elles relèvent de Marc seul.

Si une tâche bloque

Trois possibilités :

1. Décider si c'est purement technique.
2. Essayer une autre approche.
3. Consigner et passer à la suivante.

Ne jamais contourner un garde-fou.

Ne jamais répéter indéfiniment la même tentative.

Après trois tentatives informatives sans résolution :

borner
→ conserver ce qui fonctionne
→ consigner
→ passer

Pendant le RUN NOCTURNE

Ne JAMAIS SUPPRIMER quoi que ce soit : ni fichier, ni branche, ni étiquette, ni issue, ni déploiement. L'agent consigne et propose.

Ne jamais :

- promouvoir en production ;
- exécuter une migration de production ;
- réaliser une action externe irréversible ;
- contourner une protection.

Cette règle lève la contradiction apparente entre « aucune demande de confirmation » et « une décision de la nuit reste provisoire » : l'agent avance seul sur tout ce qui est réversible, et ne touche jamais à ce qui ne l'est pas.

Arrêt immédiat

Le RUN NOCTURNE s'arrête uniquement en cas de :

- donnée personnelle exposée ;
- rupture de confidentialité ;
- secret exposé ;
- faille critique ;
- écriture non autorisée en production ;
- action financière réelle ;
- action externe irréversible ;
- perte ou réécriture incontrôlée de Git ;
- concurrence de sessions impossible à qualifier ;
- perte de traçabilité ;
- contradiction insoluble ;
- impossibilité de garantir que l'état est sûr.

Rapport du matin

Le rapport est très court :

État
Branches
Tâches terminées
Tâches bloquées
Preuves
Décisions prises
Points nécessitant validation
Problèmes rencontrés

Les SHA locaux et distants figurent dans les preuves.

Un arbitrage pris pendant la nuit est provisoire jusqu'à validation.

---

6.8 GESTION DES ERREURS

Un échec silencieux est interdit lorsqu'il masque un problème réel.

Un "catch" doit :

- signaler ;
- relancer ;
- retourner l'erreur ;
- ou documenter explicitement pourquoi l'échec est attendu.

Ne jamais avaler une erreur réelle.

Un état vide doit être explicite.

Un bouton sans fonction réelle ne doit pas être présenté comme fonctionnel.

---

6.9 CONTENU VISIBLE

Le texte destiné au public n'est pas une donnée technique.

L'agent peut corriger :

- faute ;
- accent ;
- ponctuation ;
- incohérence avec le comportement réel.

L'agent ne doit pas inventer une nouvelle promesse, garantie ou affirmation commerciale sans validation.

---

6.10 SÉCURITÉ

Ne jamais :

- exposer une clé ou un secret ;
- committer une donnée sensible ;
- contourner une authentification ;
- désactiver une protection pour faire fonctionner une fonctionnalité ;
- placer un secret dans le frontend.

Toute fuite potentielle de secret est bloquante.

Les données personnelles publiées sur le site se limitent à ce qui a été explicitement validé.

---

6.11 SUPPRESSION

Avant toute suppression :

1. chercher un statut permettant de conserver la trace ;
2. vérifier les dépendances ;
3. vérifier les références ;
4. vérifier les conséquences.

Une trace importante ne disparaît pas simplement parce qu'elle n'est plus active.

Aucune suppression pendant un run nocturne.

---

6.12 DOCUMENTATION

Une modification importante du code entraîne la mise à jour de la documentation concernée dans la même passe.

Jamais :

code maintenant
documentation plus tard

Le suivi doit rester cohérent avec l'état réel.

---

6.13 RÈGLE FINALE

«Lire avant d'écrire.

Comprendre avant de modifier.

Réutiliser avant de créer.

Chercher la cause avant de corriger.

Prouver avant de déclarer terminé.

Consigner avant d'oublier.

Ne jamais inventer.

Ne jamais contourner un garde-fou.»
