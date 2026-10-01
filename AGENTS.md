# Consignes du projet

Applique ces règles à chaque modification de ce portfolio.

## Structure et réutilisation
- Conserve le portfolio publié sous forme de site statique, sauf demande explicite de migration vers un framework. N'ajoute pas de dépendances React uniquement pour utiliser le composant de départ.
- `content/` (site, sections, projets, cv) est la seule source du contenu. Le site est généré par `npm run build` dans `_site/`, puis publié par Vercel à chaque push sur `main`. Un CMS Git, installé à /admin/ (voir Docs/CMS.md), écrit dans `content/` : ne crée aucune copie du contenu ailleurs.
- Réutilise les structures de page et les styles du système de design. Évite les pages HTML en double dans `Design_System/styles/`.
- Place les modules CSS dans `Design_System/styles/`. `Index.css` est leur point d'entrée unique.
- Centralise les valeurs visuelles partagées dans `Design_System/styles/Tokens.css`. Déclare chaque couleur et chaque jeton de design une seule fois ; ne redéfinis pas la palette dans `Theme.css` ni dans les styles des composants.
- `Tailwind.css` est une petite couche d'utilitaires propre au projet, pas le framework Tailwind. Ne la présente pas comme Tailwind sans ajouter et configurer l'outil de compilation correspondant.

## Qualité visuelle et adaptation
- Commence par les petits écrans et préserve l'usage à 320 px, sur tablette et sur ordinateur.
- Réutilise les points de rupture de `Responsive.css`, sauf si une requête de conteneur convient mieux à un composant.
- Prévois des zones interactives d'au moins 44 × 44 px. Utilise des liens et boutons sémantiques, un indicateur de focus clavier et un nom accessible pour chaque commande représentée uniquement par une icône.
- Fournis un texte alternatif pertinent ainsi que les attributs de largeur et de hauteur pour les images.
- Place les adaptations pour la réduction des animations dans la feuille de style de l'animation concernée.
- Utilise les jetons de design pour les couleurs. Les valeurs de couleur brutes et les couleurs fondées sur l'opacité doivent apparaître uniquement dans `Tokens.css`.
- N'ajoute ni polices distantes, ni CDN d'icônes, ni nouvelles ressources distantes. Privilégie les fichiers locaux de `Public/` et `Design_System/assets/`. Les images Unsplash distantes existantes sont des exemples provisoires ; remplace-les par des images locales approuvées avant le lancement.
> Les polices distantes de la maquette ont été retirées. En attendant des fichiers de polices approuvés dans Design_System/assets/, le site utilise des piles de polices système.
- Préserve un contraste lisible entre le texte et son arrière-plan.

## Contenus et vérifications
- N'invente pas d'expérience professionnelle, de faits sur les projets ni de coordonnées. Signale clairement les informations non confirmées comme provisoires.
- Rédige et relis en français tous les textes destinés aux visiteurs et les documents du dépôt.
- Avant d'intégrer une modification visuelle, vérifie le véritable point d'entrée publié et les chemins des ressources produits par `npm run build` dans `_site/`, le dossier que publie Vercel, pas uniquement un aperçu local ou une page en double.
- Examine la page à 320 px, sur tablette et sur ordinateur. Vérifie que les images et les feuilles de style se chargent depuis `_site/`, puis sur le déploiement Vercel.

## Méthode de travail
- Aucune action Git (commit, push, création ou fusion de pull request) sans accord explicite. Un brief qui autorise clairement le commit et le push vaut accord pour ces deux gestes, et seulement pour eux.
- Dès qu'une session reçoit plus d'une tâche, liste-les avant de commencer et tiens la liste à jour à chaque changement d'état.

## Run nocturne
Ce mot-clé, écrit tel quel, bascule la session en travail autonome et prolongé : plus de question intermédiaire, plus d'attente de confirmation entre les tâches. Le brief qui déclenche la nuit dit ce qui est autorisé au-delà du commit et du push sur la branche de travail ; sans mention explicite, la création de pull request est permise mais sa fusion vers `main` ne l'est pas, puisque `main` publie directement en production sur Vercel (https://marckouassi-com.vercel.app).

**Ce qui ne justifie pas de s'arrêter** : une tâche plus longue que prévu se borne, se commite jusqu'où elle est allée, et le point d'arrêt est noté. Une tâche qui appelle un choix de contenu, de police ou de couleur non reçu se consigne comme décision en attente, sans être devinée, et la session passe à la suivante. Une approche qui ne fonctionne pas s'abandonne pour une autre. Un visuel ou un texte manquant se remplace par un espace réservé signalé comme provisoire, jamais par une invention.

**Ce qui arrête la nuit**, et seulement cela : un identifiant, une clé ou un lien d'édition exposé par erreur dans un fichier suivi par Git ; une action Git destructrice devenue nécessaire (réécriture d'historique, suppression de branche, `push --force`) sans autorisation explicite ; une fusion vers `main` non prévue par le brief ; une perte de repère sur l'état réel du dépôt, au point de ne plus savoir si la branche de travail part d'une base saine ; un fait biographique ou une coordonnée qu'il faudrait publier sans confirmation.

Toute décision prise seule pendant la nuit reste provisoire, jamais acquise : elle attend la validation du matin.

**Le rapport du matin** est court : ce qui a été fait, les décisions prises seul avec leur motif, ce qui est bloqué et ce qu'il manque pour continuer, l'état de la branche.

**Une nuit ne modifie jamais** ce fichier `AGENTS.md`, ni `vercel.json`, ni le workflow `.github/workflows/verifier.yml`.
