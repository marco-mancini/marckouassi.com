# MarcoS — décisions du 7 octobre 2026

Ce document complète `MARCOS_DECISIONS.md` (D-1 à D-20, D-35) et
`MARCOS_DECISIONS_20261003.md` (D-21 à D-34). Il porte les décisions du
7 octobre 2026.

> **Attention aux numéros.** Deux séries « D-xx » coexistent dans ce dépôt et ne
> désignent pas les mêmes décisions : celle de **MarcoS**, continuée ici, et
> celle du **site**, tenue dans [DECISIONS.md](DECISIONS.md). « D-36 » ne veut
> donc rien dire sans son document. Trois numéros de la série du site ont par
> ailleurs été attribués deux fois le même jour ; l'écart est consigné dans
> [#167](https://github.com/marco-mancini/marckouassi.com/issues/167) et n'est
> pas tranché.

---

## D-36 — L'expression de l'avatar est choisie par le modèle

**Statut : décidée, NON IMPLÉMENTÉE.** Suivi dans
[#169](https://github.com/marco-mancini/marckouassi.com/issues/169).

**Problème.** D-32 (3 octobre) a fixé dix expressions visuelles en précisant
qu'elles ne sont pas dix états d'exécution supplémentaires. Restait à dire
**qui** choisit l'expression affichée : l'interface, ou le modèle.

**Choix de Marc.** Le modèle. Deux nomenclatures distinctes coexistent, et
c'est voulu :

- **états d'exécution de l'interface** — `rest`, `hover`, `open`, `listening`,
  `thinking`, `responding`, `end` : pilotés par l'interface ;
- **expressions visuelles** — les dix de D-32 : pilotées par le modèle.

Mistral renvoie avec chaque réponse une expression parmi : `bienvenue`,
`neutre`, `reflexion`, `analyse`, `ecoute`, `question`, `idee`, `enthousiasme`,
`prise_de_notes`, `succes`. Le Worker la valide contre cette liste et replie sur
`neutre` si elle est absente ou inconnue. **Aucune règle heuristique.**

Les dix étiquettes restent en français sans accent quelle que soit la langue de
la réponse (D-8, D-12) : ce sont des identifiants techniques, jamais du texte
affiché.

**Priorité.** L'interface commande `rest`, `hover`, `listening` et `thinking` ;
le modèle commande le moment de la réponse et la fin.

**Cette décision amende D-32**, qui disait que les dix expressions ne sont pas
des états d'exécution. Elle ne la contredit pas sur le fond : les dix
expressions ne deviennent toujours pas dix états d'*interface*. Elles
deviennent un champ de la réponse.

**État réel au 7 octobre 2026, mesuré.** L'expression est choisie par
l'**interface**, pas par le modèle. `content/site.json` porte
`site.assistant.avatar.etats` : une expression fixée par état d'interface. Le
Worker ne renvoie aucun champ `expression`, le prompt système ne contient aucun
bloc EXPRESSION, et **trois des dix expressions ne servent à aucun état** —
Analyse, Question, Prise de notes. L'écart est décrit en entier dans #169.

**Ce que l'implémentation demanderait.** Un bloc EXPRESSION dans le prompt
système, le champ `expression` au contrat de réponse du Worker, la validation
contre la liste des dix, et la correspondance nom d'expression → balise dans
l'interface. Le navigateur ne reçoit **qu'un nom d'expression, jamais un chemin
de fichier**. Marge disponible dans le contexte : le fichier de connaissance
mesure 3 842 jetons en français et 3 655 en anglais, pour un plafond de 4 200 —
soit **358 jetons de marge en français**.

---

## D-37 — MarcoS est mis en pause

**Décision de Marc, 7 octobre 2026, 20 h 07. Statut : ACTIVE.**

### Problème

L'API Mistral exige un **moyen de paiement** pour activer Pay-As-You-Go, y
compris pour obtenir le forfait gratuit de 10 $/mois inclus dans l'abonnement
Gratuit. Marc n'a pas de carte bancaire.

Deux décisions arrêtées l'interdisent, et il faut citer leur formulation exacte
plutôt que de la résumer :

- **D-18** (`MARCOS_DECISIONS.md` §8) : « plafond de dépense Mistral **à 0 $**
  tant que les crédits gratuits suffisent. **MarcoS ne doit jamais pouvoir
  générer une facture.** »
- **D-2** (même source) : « Option c : pas de Gemini du tout. **Aucune carte
  bancaire.** Mistral seul, sur ses crédits gratuits. »

### Ce qui est prouvé, et jusqu'où

La chaîne est **complète et vérifiée jusqu'à l'appel au fournisseur**. Ce n'est
pas une estimation : chaque maillon a été constaté.

| Maillon | État | Preuve |
|---|---|---|
| Worker déployé | ✅ | version `98095a40` |
| Secret `MISTRAL_CLE` | ✅ | lu par le Worker |
| Base de connaissance | ✅ | contexte chargé |
| Requête vers Mistral | ✅ | bien formée |
| Réponse de Mistral | ❌ | **429**, en-tête `x-ratelimit-limit-req-minute: 0` |

Le modèle `mistral-small-2603` est **bien autorisé** côté organisation —
20 000 jetons/minute, 1 requête/seconde. Ce n'est donc ni un problème de
modèle (D-19 est confirmée), ni de clé, ni de code. **Seul l'interrupteur
Pay-As-You-Go manque**, et une limite de débit à zéro requête par minute est
exactement ce que renvoie un compte qui ne l'a pas activé.

### Décision

**MarcoS est mis en pause.** `site.assistant.active` reste à `false`. Rien n'est
retiré, rien n'est démonté : le Worker, le secret, l'interface, les textes de
D-9 et les tests restent en place. La reprise ne demandera que l'activation.

### Question ouverte, que Marc ne tranche pas aujourd'hui

> **Une carte bancaire assortie d'une limite de dépenses à 0 respecte-t-elle
> l'esprit du budget 0 € ?**

Cette décision **amende D-18** en posant cette question, et elle touche aussi
D-2, dont la formulation est « aucune carte bancaire » — plus stricte qu'un
plafond à zéro.

Les deux lectures sont défendables, et c'est pourquoi la question reste ouverte :

- la **lettre** de D-2 interdit la carte, quel que soit le plafond ;
- l'**esprit** de D-18 interdit la *facture*, pas l'instrument de paiement — et
  un plafond à 0 rend la facture impossible.

Rien ne sera fait dans un sens ou dans l'autre sans décision explicite de Marc.
Un agent qui trancherait seul enfreindrait D-18 ou D-2 selon la lecture choisie.

### Les deux alternatives étudiées

**1. Changer de fournisseur.** Groq et Google AI Studio offrent un accès gratuit
**sans carte bancaire**.

| Pour | Contre |
|---|---|
| Lève le blocage sans toucher au budget ni au moyen de paiement | **Contredit D-2**, qui a arrêté « Mistral seul » et retiré du projet toute la matière d'un second fournisseur : matrice de repli, disjoncteur, secours, clé, coûts |
| | Demande de **réécrire `worker/assistant/src/mistral.js`** — 220 lignes : contrat d'appel, matrice de reprise, budget à deux horloges, clé de cache de prompt |
| | Ses 16 tests dédiés et le garde-fou « aucune clé dans le dépôt » sont écrits contre le contrat Mistral |

À noter : l'architecture **n'y est pas hostile**. `creerFournisseur` rend un
objet à interface unique — `{ appels, repondre({ systeme, messages, maxJetons,
langue, signal }) }` — et le Worker ne sait rien du service. Le coût n'est pas
architectural, il est contractuel : c'est D-2 qu'il faudrait rouvrir, pas le
code.

**2. Reporter.** Ne rien changer, attendre. Coût nul, aucune décision à rouvrir,
aucun code à réécrire. C'est ce que fait cette décision en attendant que la
question ouverte soit tranchée.

### Impact

Aucun sur le site publié : `assistant.active` vaut `false`, donc MarcoS n'est
rendu sur aucune page, et l'absence d'endpoint suffirait de toute façon à l'en
empêcher (`Design_System/gabarits/sections/commun.js`).

Les corrections d'interface en cours **valent indépendamment de Mistral** et ne
sont pas suspendues : retrait de l'effet de frappe, champ de trois lignes,
durée de l'état `responding`
([#170](https://github.com/marco-mancini/marckouassi.com/pull/170)).

### Réversibilité

Totale. Aucun fichier n'est supprimé, aucune décision antérieure n'est annulée.
La reprise part de l'état décrit dans
[#26](https://github.com/marco-mancini/marckouassi.com/issues/26), pas de zéro.
