# MarcoS — Avatar 3D & interface flottante

**Statut : DÉCISION VALIDÉE — conception à implémenter**

Ce document consigne la décision prise concernant la représentation visuelle de MarcoS dans le portfolio et son interaction avec la barre de conversation.

## 1. Rôle de l'avatar

MarcoS ne doit pas être présenté comme un chatbot classique occupant une grande fenêtre.

Il doit être une **présence digitale discrète intégrée au portfolio**, visible en permanence mais peu intrusive, qui devient plus présente lorsque le visiteur interagit avec lui.

## 2. Position dans le portfolio

MarcoS est positionné **en bas à droite de l'interface**.

La composition de repos comprend :

- le buste 3D de MarcoS au-dessus ;
- une barre de conversation compacte située sous le personnage ;
- un espace suffisamment réduit pour ne pas masquer le contenu du portfolio ;
- une présence visuelle suffisamment forte pour rester identifiable sans devenir dominante.

## 3. Asset principal

L'asset principal n'est **pas** le turnaround full-body.

Le modèle full-body reste une **référence maître de cohérence du personnage**, mais l'asset destiné à l'interface est un **portrait/buste 3D**.

Contraintes :

- tête + épaules / haut du torse ;
- visage très lisible ;
- regard caméra ou très légèrement 3/4 ;
- expression naturelle et chaleureuse ;
- fond transparent ;
- aucun élément décoratif inutile ;
- aucun texte ;
- aucun décor ;
- aucune main nécessaire ;
- haute résolution ;
- optimisation pour rester identifiable même autour de **80–150 px de hauteur**.

Le visage est prioritaire sur le corps, car MarcoS sera souvent affiché en petite taille.

## 4. Référence du personnage

Le modèle 3D maître doit rester cohérent avec la référence validée :

- même identité faciale ;
- mêmes proportions du visage ;
- même coiffure ;
- même texture de cheveux ;
- même carnation ;
- même barbe ;
- même style de modélisation 3D ;
- mêmes proportions générales.

Les variantes d'expressions et de vêtements doivent toujours représenter **le même MarcoS**.

## 5. Expressions

Prévoir une bibliothèque d'expressions permettant à MarcoS de réagir au contexte :

1. **Repos / accueil** — expression calme, légèrement chaleureuse.
2. **Sourire** — sourire naturel et accessible.
3. **Écoute** — expression attentive, sourcils légèrement réactifs.
4. **Réflexion** — expression subtilement réfléchie.
5. **Parole** — expression naturelle de conversation.
6. **Complicité / humour** — sourire léger et maîtrisé, sans caricature.

Les expressions doivent rester naturelles et cohérentes avec la personnalité définie dans `MARCOS.md` et `MARCOS_DECISIONS.md`.

## 6. Variations de tenue

Les expressions peuvent être associées à des tenues différentes afin de créer une présence moins figée.

Direction validée :

- veste de directeur artistique gris anthracite + t-shirt noir ;
- surchemise bleu marine élégante ;
- col roulé noir premium ;
- veste contemporaine beige/crème ;
- chemise sombre minimaliste ;
- tenue casual créative sophistiquée.

Principes :

- aucune marque ou logo non nécessaire ;
- aucune tenue extravagante ;
- esthétique premium, contemporaine et créative ;
- la tenue ne doit jamais prendre le dessus sur le visage.

## 7. Barre de conversation

La barre située sous MarcoS est **l'interface conversationnelle principale**.

Elle doit rester compacte à l'état initial.

Elle doit pouvoir :

- s'ouvrir au clic ;
- se contracter après interaction ;
- réagir au survol ;
- afficher un état d'écoute ;
- afficher un état de réflexion ;
- afficher une animation de réponse / parole ;
- accueillir la saisie lorsque la conversation est ouverte.

## 8. Animation coordonnée

MarcoS et la barre ne doivent pas fonctionner comme deux éléments indépendants.

### État repos

- MarcoS immobile ou animé très subtilement ;
- respiration légère possible ;
- barre minimale et calme.

### Survol

- micro-réaction de MarcoS ;
- mouvement ou animation légère de la barre ;
- aucun changement brutal.

### Ouverture

- la barre s'ouvre progressivement ;
- MarcoS devient légèrement plus expressif ;
- l'interface reste intégrée au portfolio.

### Saisie utilisateur

- MarcoS indique subtilement qu'il écoute ;
- animation légère de l'interface ;
- aucun mouvement excessif.

### Réponse de MarcoS

- animation de parole / waveform dans la barre ;
- expression adaptée de MarcoS ;
- micro-mouvements cohérents avec la parole.

### Fin de réponse

- retour progressif vers l'état repos ;
- pas de disparition brutale.

## 9. Philosophie UX

MarcoS doit rester une **présence**, pas devenir une fenêtre de support client classique.

Le principe est :

**discret au repos → réactif à l'interaction → présent pendant la conversation → discret à nouveau après la conversation.**

## 10. Contraintes responsive

Le composant doit être pensé pour desktop et mobile.

Sur petit écran :

- réduire l'encombrement ;
- préserver la lisibilité du visage ;
- éviter que MarcoS masque le contenu ;
- conserver une zone d'interaction confortable ;
- adapter la taille de la barre et du buste sans changer leur logique.

La taille exacte sera définie pendant l'implémentation après vérification du rendu réel.

## 11. Accessibilité

Les animations doivent rester fonctionnelles sans dépendre exclusivement du mouvement.

Prévoir notamment :

- réduction/absence d'animations lorsque `prefers-reduced-motion` est actif ;
- zones interactives accessibles ;
- focus clavier visible ;
- libellés accessibles pour les contrôles ;
- contraste suffisant ;
- aucune information transmise uniquement par l'animation.

## 12. Assets à produire

### Référence maître

- turnaround du personnage ;
- vues front, 3/4, profils et dos.

### Assets UI prioritaires

- buste frontal ;
- buste 3/4 gauche ;
- buste 3/4 droit ;
- variantes d'expressions ;
- variantes de tenues si nécessaires.

### Format maître

**PNG avec transparence alpha**, haute résolution.

Le WebP pourra être produit ensuite pour les usages web lorsque cela améliore le poids sans dégrader le rendu.

## 13. Ce qui est explicitement rejeté

- avatar full-body utilisé comme asset principal de l'interface ;
- grosse fenêtre chatbot classique ;
- avatar générique sans identité de Marc ;
- personnage cartoon sans rapport avec le modèle 3D validé ;
- animations excessives ;
- interface qui masque le portfolio ;
- variations qui changent l'identité du personnage ;
- expressions caricaturales ;
- tenue ou accessoires qui prennent visuellement le dessus ;
- génération de nouvelles variantes sans besoin fonctionnel identifié.

## 14. Décision de conception

La direction validée est donc :

> **Modèle 3D maître → buste UI prioritaire → expressions → poses secondaires.**
>
> MarcoS est placé au-dessus d'une barre de conversation compacte en bas à droite. Les deux éléments sont animés de manière coordonnée selon l'état de la conversation.

## 15. Prochaine étape

Ne pas implémenter immédiatement.

Avant le code :

1. finaliser les assets buste/expressions ;
2. vérifier leur lisibilité à petite taille ;
3. définir précisément les états d'interface ;
4. définir les transitions d'animation ;
5. intégrer la décision dans l'architecture existante ;
6. écrire les tests de comportement avant l'implémentation.
