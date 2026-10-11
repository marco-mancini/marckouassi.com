# Animation de la section « Mes réalisations » — maquettes

**Statut : EXPLORATION, en pause.** Rien ici n'est branché au site. Ce dossier
garde les maquettes et le fil des échanges pour reprendre le travail plus tard.

Aperçu en ligne (privé) : https://claude.ai/artifact/UjBVyQvVbdWTqpZXCjBxBQ

## La demande de Marc

Remplacer, dans « Mes réalisations », les cartes de catégories (composant
universel `Carte`, variante `carte--choix`) par une section entièrement animée
en motion design, avec des éléments qu'on fait défiler comme des bulles.
Exigence : un effet « waouh », professionnel, du niveau de la séquence
d'ouverture (`Design_System/gabarits/Intro/Sequence.js`).

## Le fil des pistes

| Version | Fichier | Contenu | Retour de Marc |
|---|---|---|---|
| v1 | non conservée | Nuage de bulles type Apple Watch : Encre, Verre, Nébuleuse | « Pas trop tout » |
| v2 | `pistes-v2.html` | A Orbite, B Index 3D, C Gravité | A retenue, mais « trop basique, trop amusant, pas assez professionnel » |
| v3 | `orbite-v3.html` | Orbite en version cinéma, sur le vocabulaire de la séquence d'ouverture | En attente de validation |

## Orbite v3, ce qu'elle fait

- **Entrée (2,9 s)** : le sceau MK se charge de lumière et libère ses particules
  de gauche à droite. Elles forment une galaxie inclinée, avec une onde d'impact,
  une légère secousse et la grille en tiers. Les 8 catégories s'allument une à
  une sur l'orbite.
- **Navigation** : on glisse à l'horizontale pour faire tourner la galaxie
  (inertie, puis aimant sur la catégorie la plus proche). Le glissement vertical
  laisse la page défiler. Les flèches du clavier marchent aussi. Sans geste,
  l'orbite avance seule toutes les 5,2 s.
- **Titre** : le nom arrive en 3 bandes (resserrement de l'interlettrage),
  une fois en plein, une fois en creux, comme les catégories de la séquence.
  Un éclair or marque chaque changement.
- **Ouverture** : trois bandes `planche-deep` balaient l'écran, avec un grand
  numéro en creux, puis le titre, la note et le récit. Les visuels n'apparaissent
  que pour Logotype, la seule catégorie qui en a.
- **Mouvement réduit** : l'état final s'affiche directement, sans entrée ni
  défilement automatique.

## Mesures relevées sur la v3 (Playwright, fichier local)

| Contrôle | Résultat |
|---|---|
| Débordement horizontal, 320 / 375 / 390 / 768 / 1024 / 1280 / 1440 px | PASS (0 px) |
| Erreurs console | PASS (0) |
| L'astre de devant ne touche jamais le titre | PASS (écart ≥ 27 px à toutes les largeurs) |
| Contrastes | NON TESTÉ |
| Vrai téléphone (tactile, performances) | NON TESTÉ |
| Rendu dans `_site/` | NON APPLICABLE (maquette autonome, pas encore intégrée) |

## Avant l'intégration (à faire à la reprise)

1. Ouvrir l'issue de la décision et la branche `pm-0xx` selon AGENTS.md §5.5.
2. Tout passer en jetons : les maquettes contiennent des valeurs en dur,
   interdites hors de `Tokens.css` (AGENTS.md §3.3).
3. Lire les catégories dans `content/sections.json`, jamais dans le code. Les
   maquettes recopient les textes pour tenir dans un seul fichier.
4. Réutiliser le symbole `#logo-mk-seal` et les courbes de `Sequence.js`
   plutôt que de les recopier.
5. Garder la navigation par ancres `#categorie-…` de `Projets.js`
   (`activerNavigationCategories`).
6. Vérifier dans `_site/` aux 7 largeurs, en clair et en sombre, puis mesurer
   les contrastes et tester sur un vrai téléphone.

## Points ouverts pour Marc

- La v3 donne-t-elle le niveau attendu ?
- Garde-t-on le défilement automatique de l'orbite ?
- Faut-il un visuel par catégorie ? Aujourd'hui, seule Logotype en a.
