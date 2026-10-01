# Index des issues

Référence du projet : chaque issue porte `[PM-xx]` en tête de titre. GitHub attribue ses propres numéros (les numéros 1 à 3 sont d'anciennes pull requests) : ce tableau fait le lien.

Règles :

- numérotation PM continue, dans l'ordre de création, sans trou ; un numéro n'est jamais réutilisé, même si l'issue est fermée sans suite ;
- ce fichier est mis à jour à chaque création, fermeture ou changement d'étiquettes d'une issue, par la même pull request quand c'est possible ;
- format d'une issue : Contexte · Ce qui est attendu · Comment vérifier · Ce qui bloque ;
- `decision-marc` : ce que Marc seul peut trancher ou exécuter.

Projet GitHub « Portfolio Marc Kouassi » : à créer par Marc (PM-04).

État au 1er octobre 2026 : 32 issues ouvertes, 0 fermée.

| PM | GitHub | Titre | Étiquettes | Bloquée par | État |
|---|---|---|---|---|---|
| PM-01 | [#4](https://github.com/marco-mancini/marckouassi.com/issues/4) | Créer le jeton GitHub et se connecter à /admin/ | decision-marc, cms, urgent | — | ouverte |
| PM-02 | [#5](https://github.com/marco-mancini/marckouassi.com/issues/5) | Faire une première modification réelle depuis /admin/ | decision-marc, cms, urgent, blocage | PM-01 | ouverte |
| PM-03 | [#6](https://github.com/marco-mancini/marckouassi.com/issues/6) | Supprimer les anciens déploiements Vercel qui contiennent le PDF du CV | decision-marc, securite, urgent | — | ouverte |
| PM-04 | [#7](https://github.com/marco-mancini/marckouassi.com/issues/7) | Créer le GitHub Project « Portfolio Marc Kouassi » et y rattacher les issues | decision-marc, infrastructure, blocage | — | ouverte |
| PM-05 | [#8](https://github.com/marco-mancini/marckouassi.com/issues/8) | Créer et tenir l'index Docs/ISSUES.md | documentation | — | ouverte |
| PM-06 | [#9](https://github.com/marco-mancini/marckouassi.com/issues/9) | Acheter marckouassi.com puis changer url dans site.json | decision-marc, infrastructure | — | ouverte |
| PM-07 | [#10](https://github.com/marco-mancini/marckouassi.com/issues/10) | Refaire le PDF du CV sans données personnelles | decision-marc, contenu | — | ouverte |
| PM-08 | [#11](https://github.com/marco-mancini/marckouassi.com/issues/11) | Réécrire le résumé du CV | decision-marc, contenu | — | ouverte |
| PM-09 | [#12](https://github.com/marco-mancini/marckouassi.com/issues/12) | Poser les étiquettes d'archive des 8 branches obsolètes | decision-marc, infrastructure | — | ouverte |
| PM-10 | [#13](https://github.com/marco-mancini/marckouassi.com/issues/13) | Supprimer les 8 branches obsolètes | decision-marc, infrastructure | PM-09 | ouverte |
| PM-11 | [#14](https://github.com/marco-mancini/marckouassi.com/issues/14) | Envoyer le lien du site à l'auteur de la police Reey | decision-marc | — | ouverte |
| PM-12 | [#15](https://github.com/marco-mancini/marckouassi.com/issues/15) | Vérifier l'orthographe des 20 noms de référence du CV | decision-marc, contenu | — | ouverte |
| PM-13 | [#16](https://github.com/marco-mancini/marckouassi.com/issues/16) | Traduire en anglais la phrase « depuis 13 ans » de l'accueil | contenu | — | ouverte |
| PM-14 | [#17](https://github.com/marco-mancini/marckouassi.com/issues/17) | Renommer les fichiers d'images fragiles (espace, « WoldCola ») | dette, contenu | — | ouverte |
| PM-15 | [#18](https://github.com/marco-mancini/marckouassi.com/issues/18) | Corriger le décalage des ancres sous l'en-tête | dette, decision-marc | — | ouverte |
| PM-16 | [#19](https://github.com/marco-mancini/marckouassi.com/issues/19) | Passer en jetons les 7 valeurs d'animation de Motion.css | dette | — | ouverte |
| PM-17 | [#20](https://github.com/marco-mancini/marckouassi.com/issues/20) | Remplacer les 14px en dur par des jetons | dette | — | ouverte |
| PM-18 | [#21](https://github.com/marco-mancini/marckouassi.com/issues/21) | Stabiliser la durée d'installation de Chromium dans « Vérifier » | infrastructure, dette | — | ouverte |
| PM-19 | [#22](https://github.com/marco-mancini/marckouassi.com/issues/22) | Statuer sur les 22 tests de l'ancien back-office retirés de la vérification | dette | PM-29 | ouverte |
| PM-20 | [#23](https://github.com/marco-mancini/marckouassi.com/issues/23) | Trancher la source des données de NéO : Supabase ou JSON produit au build | decision-marc | — | ouverte |
| PM-21 | [#24](https://github.com/marco-mancini/marckouassi.com/issues/24) | Trancher l'hébergement de l'endpoint de NéO sans domaine | decision-marc, infrastructure | PM-06 (selon l'option) | ouverte |
| PM-22 | [#25](https://github.com/marco-mancini/marckouassi.com/issues/25) | Trancher les décisions D-1 à D-11 de NéO | decision-marc | PM-21 (pour D-7) | ouverte |
| PM-23 | [#26](https://github.com/marco-mancini/marckouassi.com/issues/26) | Implémenter NéO | decision-marc | PM-20, PM-21, PM-22 | ouverte |
| PM-24 | [#27](https://github.com/marco-mancini/marckouassi.com/issues/27) | Décider du poids du dépôt (325 Mo) et du PDF resté dans l'historique | decision-marc, infrastructure, securite | — | ouverte |
| PM-25 | [#28](https://github.com/marco-mancini/marckouassi.com/issues/28) | Définir le brief de l'animation d'entrée en motion design et son générique | decision-marc, contenu | — | ouverte |
| PM-26 | [#29](https://github.com/marco-mancini/marckouassi.com/issues/29) | Confirmer les périodes des projets | decision-marc, contenu | — | ouverte |
| PM-27 | [#30](https://github.com/marco-mancini/marckouassi.com/issues/30) | Traduire les 296 champs de contenu sans version anglaise | decision-marc, contenu | PM-13 | ouverte |
| PM-28 | [#31](https://github.com/marco-mancini/marckouassi.com/issues/31) | Décider des deux appels extérieurs de la page du CMS | decision-marc, cms, securite | — | ouverte |
| PM-29 | [#32](https://github.com/marco-mancini/marckouassi.com/issues/32) | Décider du sort de l'ancien back-office Supabase | decision-marc, dette | — | ouverte |
| PM-30 | [#33](https://github.com/marco-mancini/marckouassi.com/issues/33) | Mettre à jour Docs/CONTENT_CHECKLIST.md, périmé depuis le CMS | documentation | — | ouverte |
| PM-31 | [#34](https://github.com/marco-mancini/marckouassi.com/issues/34) | Corriger la note périmée d'AGENTS.md sur les polices système | documentation, decision-marc | — | ouverte |
| PM-32 | [#35](https://github.com/marco-mancini/marckouassi.com/issues/35) | Inscrire la méthode issues, branches et pull requests dans AGENTS.md | documentation, decision-marc | — | ouverte |
