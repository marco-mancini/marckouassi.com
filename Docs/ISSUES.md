# Index des issues

Chaque issue porte `[PM-NNN]` en tête de titre, où **NNN est son numéro GitHub sur trois chiffres** : #11 → `[PM-011]`. Aucun décalage entre la référence PM et le numéro GitHub.

Règles :

- PM-NNN = numéro GitHub de l'issue. Issues et pull requests partagent le même compteur : les numéros pris par des pull requests (#1 à #3, #36, …) n'apparaissent pas ici, c'est normal ;
- branche d'une issue : `pm-NNN-titre-court` ; sa pull request ferme l'issue (`Closes #NNN`) ;
- ce fichier est mis à jour à chaque création, fermeture ou changement d'étiquettes d'une issue, par la même pull request quand c'est possible ;
- format d'une issue : Contexte · Ce qui est attendu · Comment vérifier · Ce qui bloque ;
- `decision-marc` : ce que Marc seul peut trancher ou exécuter.

Projet GitHub « Portfolio Marc Kouassi » : à créer par Marc (PM-007).

État au 2 octobre 2026, de PM-004 à PM-054 : 28 issues ouvertes, 12 fermées.

| PM | GitHub | Titre | Étiquettes | Bloquée par | État |
|---|---|---|---|---|---|
| PM-004 | [#4](https://github.com/marco-mancini/marckouassi.com/issues/4) | Créer le jeton GitHub et se connecter à /admin/ | decision-marc, cms, urgent | — | ouverte |
| PM-005 | [#5](https://github.com/marco-mancini/marckouassi.com/issues/5) | Faire une première modification réelle depuis /admin/ | decision-marc, cms, urgent, blocage | PM-004 | ouverte |
| PM-006 | [#6](https://github.com/marco-mancini/marckouassi.com/issues/6) | Supprimer les anciens déploiements Vercel qui contiennent le PDF du CV | decision-marc, securite, urgent | — | ouverte |
| PM-007 | [#7](https://github.com/marco-mancini/marckouassi.com/issues/7) | Créer le GitHub Project « Portfolio Marc Kouassi » et y rattacher les issues | decision-marc, infrastructure, blocage | — | ouverte |
| PM-008 | [#8](https://github.com/marco-mancini/marckouassi.com/issues/8) | Créer et tenir l'index Docs/ISSUES.md | documentation | — | fermée — index fusionné par la PR #41 |
| PM-009 | [#9](https://github.com/marco-mancini/marckouassi.com/issues/9) | Acheter marckouassi.com puis changer url dans site.json | decision-marc, infrastructure | — | ouverte |
| PM-010 | [#10](https://github.com/marco-mancini/marckouassi.com/issues/10) | Refaire le PDF du CV sans données personnelles | decision-marc, contenu | — | ouverte |
| PM-011 | [#11](https://github.com/marco-mancini/marckouassi.com/issues/11) | Réécrire le résumé du CV | decision-marc, contenu | — | ouverte |
| PM-012 | [#12](https://github.com/marco-mancini/marckouassi.com/issues/12) | Poser les étiquettes d'archive des 8 branches obsolètes | decision-marc, infrastructure | — | ouverte |
| PM-013 | [#13](https://github.com/marco-mancini/marckouassi.com/issues/13) | Supprimer les 8 branches obsolètes | decision-marc, infrastructure | PM-012 | ouverte |
| PM-014 | [#14](https://github.com/marco-mancini/marckouassi.com/issues/14) | Envoyer le lien du site à l'auteur de la police Reey | decision-marc | — | ouverte |
| PM-015 | [#15](https://github.com/marco-mancini/marckouassi.com/issues/15) | Vérifier l'orthographe des 20 noms de référence du CV | decision-marc, contenu | — | ouverte |
| PM-016 | [#16](https://github.com/marco-mancini/marckouassi.com/issues/16) | Traduire en anglais la phrase « depuis 13 ans » de l'accueil | contenu, decision-marc | — | ouverte |
| PM-017 | [#17](https://github.com/marco-mancini/marckouassi.com/issues/17) | Renommer les fichiers d'images fragiles (espace, « WoldCola ») | contenu, dette | — | fermée — réglée par la PR #44 |
| PM-018 | [#18](https://github.com/marco-mancini/marckouassi.com/issues/18) | Corriger le décalage des ancres sous l'en-tête | decision-marc, dette | — | ouverte |
| PM-019 | [#19](https://github.com/marco-mancini/marckouassi.com/issues/19) | Passer en jetons les 7 valeurs d'animation de Motion.css | dette, decision-marc | — | ouverte |
| PM-020 | [#20](https://github.com/marco-mancini/marckouassi.com/issues/20) | Remplacer les 14px en dur par des jetons | dette | — | fermée — réglée par la PR #47 |
| PM-021 | [#21](https://github.com/marco-mancini/marckouassi.com/issues/21) | Stabiliser la durée d'installation de Chromium dans « Vérifier » | infrastructure, dette | — | ouverte |
| PM-022 | [#22](https://github.com/marco-mancini/marckouassi.com/issues/22) | Statuer sur les 22 tests de l'ancien back-office retirés de la vérification | dette | PM-032 | ouverte |
| PM-023 | [#23](https://github.com/marco-mancini/marckouassi.com/issues/23) | Trancher la source des données de MarcoS : Supabase ou JSON produit au build | decision-marc | — | ouverte |
| PM-024 | [#24](https://github.com/marco-mancini/marckouassi.com/issues/24) | Trancher l'hébergement de l'endpoint de MarcoS sans domaine | decision-marc, infrastructure | PM-009 (selon l'option) | ouverte |
| PM-025 | [#25](https://github.com/marco-mancini/marckouassi.com/issues/25) | Trancher les décisions D-1 à D-11 de MarcoS | decision-marc | PM-024 (pour D-7) | ouverte |
| PM-026 | [#26](https://github.com/marco-mancini/marckouassi.com/issues/26) | Implémenter MarcoS | decision-marc | PM-023, PM-024, PM-025 | ouverte |
| PM-027 | [#27](https://github.com/marco-mancini/marckouassi.com/issues/27) | Décider du poids du dépôt (325 Mo) et du PDF resté dans l'historique | decision-marc, securite, infrastructure | — | ouverte |
| PM-028 | [#28](https://github.com/marco-mancini/marckouassi.com/issues/28) | Définir le brief de l'animation d'entrée en motion design et son générique | decision-marc, contenu | — | ouverte |
| PM-029 | [#29](https://github.com/marco-mancini/marckouassi.com/issues/29) | Confirmer les périodes des projets | decision-marc, contenu | — | ouverte |
| PM-030 | [#30](https://github.com/marco-mancini/marckouassi.com/issues/30) | Traduire les 296 champs de contenu sans version anglaise | decision-marc, contenu | PM-016 | ouverte |
| PM-031 | [#31](https://github.com/marco-mancini/marckouassi.com/issues/31) | Décider des deux appels extérieurs de la page du CMS | decision-marc, cms, securite | — | ouverte |
| PM-032 | [#32](https://github.com/marco-mancini/marckouassi.com/issues/32) | Décider du sort de l'ancien back-office Supabase | decision-marc, dette | — | ouverte |
| PM-033 | [#33](https://github.com/marco-mancini/marckouassi.com/issues/33) | Mettre à jour Docs/CONTENT_CHECKLIST.md, périmé depuis le CMS | documentation | — | fermée — réglée par la PR #42 |
| PM-034 | [#34](https://github.com/marco-mancini/marckouassi.com/issues/34) | Corriger la note périmée d'AGENTS.md sur les polices système | documentation, decision-marc | — | fermée — réglée par la PR #39 |
| PM-035 | [#35](https://github.com/marco-mancini/marckouassi.com/issues/35) | Inscrire la méthode issues, branches et pull requests dans AGENTS.md | documentation, decision-marc | — | fermée — réglée par la PR #39 |
| PM-038 | [#38](https://github.com/marco-mancini/marckouassi.com/issues/38) | Réécrire AGENTS.md | documentation | — | fermée — terminée par la PR #39 |
| PM-040 | [#40](https://github.com/marco-mancini/marckouassi.com/issues/40) | Animation Motion Design de la couverture | decision-marc, documentation | — | ouverte |
| PM-045 | [#45](https://github.com/marco-mancini/marckouassi.com/issues/45) | Passer en jetons les valeurs en dur relevées autour des 14px | dette | — | fermée — réglée par la PR #51 |
| PM-046 | [#46](https://github.com/marco-mancini/marckouassi.com/issues/46) | La référence 71cfb9d de comparer-reference est périmée (14 écarts) | dette | — | fermée — réglée par la PR #48 |
| PM-049 | [#49](https://github.com/marco-mancini/marckouassi.com/issues/49) | Avatar 3D de MarcoS | decision-marc, documentation | — | ouverte |
| PM-052 | [#52](https://github.com/marco-mancini/marckouassi.com/issues/52) | Étendre le contrôle des couleurs brutes aux composants et aux fondations | dette | — | fermée — réglée par la PR #55 |
| PM-053 | [#53](https://github.com/marco-mancini/marckouassi.com/issues/53) | Mettre à jour Docs/DETTE_TECHNIQUE.md après PM-020 et PM-045 | documentation | — | fermée — réglée par la PR #56 |
| PM-054 | [#54](https://github.com/marco-mancini/marckouassi.com/issues/54) | Mettre à jour l'inventaire des branches (Docs/BRANCHES.md) | documentation | — | fermée — réglée par la PR #57 |
