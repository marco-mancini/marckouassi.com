# MarcoS — Avatar 3D & interface flottante

**Statut : DÉCISION VALIDÉE — conception à implémenter**

Ce document constitue la référence de conception de la représentation visuelle de MarcoS et de son interface conversationnelle flottante.

## 1. Rôle de l’avatar

MarcoS ne doit pas être présenté comme un chatbot classique occupant une grande fenêtre.

Il doit être une **présence digitale discrète intégrée au portfolio**, visible sans être intrusive, qui devient plus présente lorsque le visiteur interagit avec lui.

## 2. Position

MarcoS est positionné **en bas à droite de l’interface**.

À l’état repos :

- buste 3D au-dessus ;
- barre conversationnelle compacte sous le personnage ;
- emprise minimale sur le contenu ;
- présence suffisamment lisible pour être identifiable.

## 3. Asset principal

Le turnaround full-body est une **référence maître de cohérence**, pas l’asset UI principal.

L’asset UI prioritaire est un **portrait/buste 3D** :

- tête + épaules / haut du torse ;
- visage très lisible ;
- regard caméra ou très légèrement 3/4 ;
- expression naturelle et chaleureuse ;
- fond transparent ;
- aucun décor ni texte ;
- aucune main nécessaire ;
- haute résolution ;
- identifiable autour de **80–150 px de hauteur**.

Le visage est prioritaire sur le corps.

## 4. Cohérence du personnage

Toutes les variantes doivent représenter exactement le même MarcoS :

- identité faciale ;
- proportions du visage ;
- coiffure ;
- texture des cheveux ;
- carnation ;
- barbe ;
- proportions générales ;
- style de modélisation 3D.

Les changements d’expression, de tenue ou de pose ne doivent jamais produire un nouveau personnage.

## 5. Expressions

Prévoir une bibliothèque :

1. repos / accueil ;
2. sourire ;
3. écoute ;
4. réflexion ;
5. parole ;
6. complicité / humour.

Les expressions restent naturelles, sobres et cohérentes avec la personnalité définie dans `MARCOS.md` et `MARCOS_DECISIONS.md`.

## 6. Tenues

Des variantes de tenues peuvent accompagner les expressions :

- veste de directeur artistique gris anthracite + t-shirt noir ;
- surchemise bleu marine ;
- col roulé noir ;
- veste contemporaine beige/crème ;
- chemise sombre minimaliste ;
- tenue casual créative sophistiquée.

Aucun logo inutile, aucune tenue extravagante. Le visage reste dominant.

## 7. Barre conversationnelle

La barre sous MarcoS est l’interface conversationnelle principale.

### État initial

La barre est **petite, discrète et peu animée**. Elle ne doit pas attirer artificiellement l’attention avant interaction.

### Première interaction

Au clic ou à l’activation clavier :

- ouverture progressive ;
- apparition du champ de saisie ;
- MarcoS devient légèrement plus expressif ;
- transition courte et naturelle.

### Conversation courte

L’interface reste compacte autant que possible. L’historique visible reste limité afin de préserver le portfolio.

### Conversation longue

La conversation **ne doit jamais faire grandir indéfiniment la barre**.

À partir d’une hauteur maximale définie par l’interface :

- le panneau conserve une hauteur bornée ;
- l’historique possède un scroll interne ;
- le champ de saisie reste accessible ;
- MarcoS reste visuellement présent au-dessus ;
- le reste du portfolio n’est pas déplacé ou masqué de façon permanente ;
- aucune transformation automatique en page chatbot plein écran.

L’utilisateur peut réduire le panneau à tout moment pour retrouver l’état compact.

## 8. États et animations coordonnées

MarcoS et la barre doivent être pilotés par un **même état conversationnel**.

### Repos

- MarcoS immobile ou micro-animation de respiration ;
- barre minimale et calme.

### Survol

- micro-réaction de MarcoS ;
- animation légère de la barre ;
- aucun mouvement brutal.

### Ouverture

- barre qui s’ouvre progressivement ;
- expression légèrement plus active ;
- aucun déplacement brutal du portfolio.

### Saisie / écoute

- indication subtile que MarcoS écoute ;
- animation légère de la barre ;
- mouvement limité.

### Réflexion / traitement

- état visuel distinct mais discret ;
- animation cohérente avec une attente courte ;
- ne jamais simuler artificiellement une activité inexistante.

### Réponse

- animation de parole / waveform dans la barre ;
- expression adaptée ;
- micro-mouvements cohérents.

### Fin de réponse

- retour progressif vers l’état repos ou conversation active ;
- aucune disparition brutale.

## 9. Gestion des conversations longues — principe inspiré de Codex

L’interface et la gestion du contexte sont deux problèmes distincts.

### Côté interface

La fenêtre visible doit rester compacte :

- hauteur maximale ;
- scroll interne ;
- champ de saisie persistant ;
- bouton de réduction toujours disponible ;
- jamais d’agrandissement vertical illimité.

### Côté contexte IA

La longueur de l’historique ne doit pas conduire à une perte brutale du contexte utile.

MarcoS doit prévoir une stratégie de **compaction du contexte** lorsque l’historique devient trop volumineux :

- conserver les informations nécessaires à la continuité ;
- conserver les décisions et éléments confirmés utiles à la conversation ;
- résumer les échanges anciens lorsque leur détail n’est plus nécessaire ;
- éviter d’envoyer inutilement tout l’historique brut au modèle ;
- poursuivre la conversation sans rupture visible pour le visiteur.

La compaction concerne le **contexte envoyé au modèle**, pas nécessairement l’historique affiché ou stocké.

### Séparation recommandée

**Historique utilisateur → stockage de conversation → contexte compacté → prompt système + contexte pertinent → modèle.**

Le système doit distinguer :

- historique complet ;
- résumé/état conversationnel ;
- informations persistantes réellement autorisées ;
- contexte temporaire de la conversation ;
- prompt système et règles MarcoS.

Aucune donnée ne doit être supprimée uniquement pour résoudre une limite de contexte si elle doit être conservée pour la traçabilité ou les règles de conservation du projet.

## 10. Philosophie UX

Principe directeur :

**discret au repos → réactif à l’interaction → présent pendant la conversation → discret à nouveau.**

Même après une conversation très longue, MarcoS doit rester une présence du portfolio et non devenir un chatbot qui prend possession de la page.

## 11. Responsive

Desktop et mobile doivent conserver la même logique.

Sur petit écran :

- réduire l’encombrement ;
- préserver la lisibilité du visage ;
- éviter de masquer le contenu important ;
- conserver une zone d’interaction confortable ;
- adapter les dimensions sans changer le comportement conceptuel.

Les dimensions exactes seront définies après test sur le rendu réel.

## 12. Accessibilité

Prévoir :

- `prefers-reduced-motion` ;
- contrôles accessibles au clavier ;
- focus visible ;
- libellés accessibles ;
- contraste suffisant ;
- aucune information transmise uniquement par animation ;
- réduction des animations sans désactiver les fonctions essentielles.

## 13. Assets

### Référence maître

- turnaround front ;
- front 3/4 gauche ;
- front 3/4 droit ;
- profils ;
- dos / 3/4 dos.

### UI

- buste frontal ;
- buste 3/4 gauche ;
- buste 3/4 droit ;
- expressions ;
- variantes de tenues si nécessaires.

### Format maître

**PNG avec transparence alpha**, haute résolution, idéalement 4K pour les assets sources.

Le WebP pourra être produit ensuite pour le web lorsque cela réduit le poids sans dégrader le rendu.

## 14. Rejets explicites

- full-body comme asset UI principal ;
- grosse fenêtre chatbot classique ;
- barre qui grandit indéfiniment ;
- interface plein écran automatique ;
- avatar générique ;
- personnage cartoon sans rapport avec le modèle validé ;
- animations excessives ;
- interface masquant le portfolio ;
- identité changeante entre variantes ;
- expressions caricaturales ;
- tenue dominante ;
- perte brutale du contexte lors d’une conversation longue ;
- envoi systématique de tout l’historique brut au modèle lorsque la compaction est suffisante.

## 15. Décision de conception

> **Modèle 3D maître → buste UI prioritaire → expressions → poses secondaires.**
>
> MarcoS est placé au-dessus d’une barre de conversation compacte en bas à droite. Les deux éléments sont animés de manière coordonnée selon l’état de la conversation. La barre reste compacte et devient un panneau borné avec scroll interne lorsque la conversation s’allonge. Le contexte IA est compacté automatiquement lorsque nécessaire afin de préserver la continuité sans augmenter indéfiniment l’interface.

## 16. Avant implémentation

1. finaliser les assets buste/expressions ;
2. vérifier la lisibilité à petite taille ;
3. définir les états d’interface ;
4. définir les transitions ;
5. définir la stratégie de stockage/historique ;
6. définir la stratégie de compaction du contexte ;
7. intégrer la décision à l’architecture existante ;
8. écrire les tests de comportement ;
9. tester desktop/mobile et reduced-motion ;
10. implémenter uniquement après validation de ces contrats.
