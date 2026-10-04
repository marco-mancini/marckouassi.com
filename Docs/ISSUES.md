# Index des issues

Chaque issue porte `[PM-NNN]` en tête de titre, où **NNN est son identifiant de tâche** : #11 → `[PM-011]`. Les issues et les pull requests partagent un compteur GitHub ; les PR #109 et #110 ont donc créé un décalage de deux numéros à partir de PM-109 (PM-109 → #111, PM-114 → #116, PM-115 → #117).

Règles :

- PM-NNN = identifiant de tâche inscrit dans le titre GitHub ; il peut différer du numéro GitHub après une pull request qui consomme le compteur commun ;
- branche d'une issue : `pm-NNN-titre-court` ; sa pull request ferme l'issue (`Closes #NNN`) ;
- ce fichier est mis à jour à chaque création, fermeture ou changement d'étiquettes d'une issue, par la même pull request quand c'est possible ;
- format d'une issue : Contexte · Ce qui est attendu · Comment vérifier · Ce qui bloque ;
- `decision-marc` : ce que Marc seul peut trancher ou exécuter.

Projet GitHub « Portfolio Marc Kouassi » : à créer par Marc (PM-007).

État au 4 octobre 2026, de PM-004 à PM-126 : 21 issues ouvertes, 62 fermées. Chiffres relevés par `npm run comparer-issues`.

Comparaison avec GitHub : `npm run comparer-issues` (voir `tools/comparer-issues.mjs`). Il vérifie, pour chaque ligne, le numéro GitHub, la référence PM du titre, le titre, les étiquettes, l'état et le comptage annoncé ci-dessus.

| PM | GitHub | Titre | Étiquettes | Bloquée par | État |
|---|---|---|---|---|---|
| PM-004 | [#4](https://github.com/marco-mancini/marckouassi.com/issues/4) | Créer le jeton GitHub et se connecter à /admin/ | decision-marc, cms, urgent | — | fermée — jeton créé et connexion faite par Marc le 2 octobre 2026 ; preuve : le commit `f951375` du CMS |
| PM-005 | [#5](https://github.com/marco-mancini/marckouassi.com/issues/5) | Faire une première modification réelle depuis /admin/ | decision-marc, cms, urgent, blocage | — | fermée — chaîne CMS → GitHub → Vercel → site prouvée de bout en bout le 2 octobre 2026 (commit `f951375`) |
| PM-006 | [#6](https://github.com/marco-mancini/marckouassi.com/issues/6) | Supprimer les anciens déploiements Vercel qui contiennent le PDF du CV | decision-marc, securite, urgent | — | ouverte |
| PM-007 | [#7](https://github.com/marco-mancini/marckouassi.com/issues/7) | Créer le GitHub Project « Portfolio Marc Kouassi » et y rattacher les issues | decision-marc, infrastructure, blocage | — | ouverte |
| PM-008 | [#8](https://github.com/marco-mancini/marckouassi.com/issues/8) | Créer et tenir l'index Docs/ISSUES.md | documentation | — | fermée — index fusionné par la PR #41 |
| PM-009 | [#9](https://github.com/marco-mancini/marckouassi.com/issues/9) | Acheter marckouassi.com puis changer url dans site.json | decision-marc, infrastructure | — | ouverte — suspendue par décision de Marc du 2 octobre 2026 (PM-075) |
| PM-010 | [#10](https://github.com/marco-mancini/marckouassi.com/issues/10) | Refaire le PDF du CV sans données personnelles | decision-marc, contenu | — | ouverte — plus de dépendance technique : le CMS est éprouvé (PM-005) |
| PM-011 | [#11](https://github.com/marco-mancini/marckouassi.com/issues/11) | Réécrire le résumé du CV | decision-marc, contenu | — | ouverte — plus de dépendance technique : le CMS est éprouvé (PM-005) |
| PM-012 | [#12](https://github.com/marco-mancini/marckouassi.com/issues/12) | Poser les étiquettes d'archive des 8 branches obsolètes | decision-marc, infrastructure | — | fermée — 8 étiquettes annotées sur le distant, 8/8 sur le SHA attendu ([BRANCHES.md](BRANCHES.md)) |
| PM-013 | [#13](https://github.com/marco-mancini/marckouassi.com/issues/13) | Supprimer les 8 branches obsolètes | decision-marc, infrastructure | — | ouverte — débloquée : les étiquettes d'archive sont posées (PM-012) ; la suppression reste à Marc |
| PM-014 | [#14](https://github.com/marco-mancini/marckouassi.com/issues/14) | Envoyer le lien du site à l'auteur de la police Reey | decision-marc | — | ouverte |
| PM-015 | [#15](https://github.com/marco-mancini/marckouassi.com/issues/15) | Vérifier l'orthographe des 20 noms de référence du CV | decision-marc, contenu | — | ouverte |
| PM-016 | [#16](https://github.com/marco-mancini/marckouassi.com/issues/16) | Traduire en anglais la phrase « depuis 13 ans » de l'accueil | contenu, decision-marc | — | fermée — réglée par la PR #67 (lot 1) ; `accroche.en` porte « **for 13 years.** » |
| PM-017 | [#17](https://github.com/marco-mancini/marckouassi.com/issues/17) | Renommer les fichiers d'images fragiles (espace, « WoldCola ») | contenu, dette | — | fermée — réglée par la PR #44 |
| PM-018 | [#18](https://github.com/marco-mancini/marckouassi.com/issues/18) | Corriger le décalage des ancres sous l'en-tête | decision-marc, dette | — | ouverte |
| PM-019 | [#19](https://github.com/marco-mancini/marckouassi.com/issues/19) | Passer en jetons les 7 valeurs d'animation de Motion.css | dette, decision-marc | — | fermée — réglée par la PR #84 ; famille `--motion-*`, 0 différence de `getComputedStyle` |
| PM-020 | [#20](https://github.com/marco-mancini/marckouassi.com/issues/20) | Remplacer les 14px en dur par des jetons | dette | — | fermée — réglée par la PR #47 |
| PM-021 | [#21](https://github.com/marco-mancini/marckouassi.com/issues/21) | Stabiliser la durée d'installation de Chromium dans « Vérifier » | infrastructure, dette | — | fermée — critère d'ouverture non atteint : relevé du 3 octobre 2026 sur les 10 derniers runs de « Vérifier », l'étape Chromium tient en 31 s au plus contre les 3 min qui l'ouvriraient. Aucun workflow modifié |
| PM-022 | [#22](https://github.com/marco-mancini/marckouassi.com/issues/22) | Statuer sur les 22 tests de l'ancien back-office retirés de la vérification | dette | PM-032 | fermée — le back-office restant en sommeil, les 14 tests unitaires entrent dans la vérification (`npm run test:sommeil`) : ils détectent qu'un changement commun les casse, ce qui était arrivé sur 22 clés de contenu sans libellé |
| PM-023 | [#23](https://github.com/marco-mancini/marckouassi.com/issues/23) | Trancher la source des données de MarcoS : Supabase ou JSON produit au build | decision-marc | — | fermée — tranchée par Marc le 2 octobre 2026 : **JSON produit au build**, pas de Supabase ([MARCOS_DECISIONS.md](MARCOS_DECISIONS.md)) |
| PM-024 | [#24](https://github.com/marco-mancini/marckouassi.com/issues/24) | Trancher l'hébergement de l'endpoint de MarcoS sans domaine | decision-marc, infrastructure | — | fermée — tranchée le 2 octobre 2026 : **Worker sur `workers.dev`**, offre gratuite ; indépendante de PM-009 |
| PM-025 | [#25](https://github.com/marco-mancini/marckouassi.com/issues/25) | Trancher les décisions D-1 à D-11 de MarcoS | decision-marc | — | fermée — les 11 décisions **et** les 8 relevées en plus (D-12 à D-19) tranchées le 2 octobre 2026 ; budget 0 €, pas de Gemini |
| PM-026 | [#26](https://github.com/marco-mancini/marckouassi.com/issues/26) | Implémenter MarcoS | decision-marc | — | ouverte — **débloquée** : PM-023, PM-024 et PM-025 sont tranchées. N'attend plus que l'ordre de démarrer de Marc. Référence corrigée le 3 octobre : la qualification commerciale vit dans #111 à #116 et la PR #110, non dans `Docs/MARCOS_QUALIFICATION.md` (fichier inexistant) |
| PM-027 | [#27](https://github.com/marco-mancini/marckouassi.com/issues/27) | Décider du poids du dépôt (325 Mo) et du PDF resté dans l'historique | decision-marc, securite, infrastructure | — | ouverte |
| PM-028 | [#28](https://github.com/marco-mancini/marckouassi.com/issues/28) | Définir le brief de l'animation d'entrée en motion design et son générique | decision-marc, contenu | — | ouverte |
| PM-029 | [#29](https://github.com/marco-mancini/marckouassi.com/issues/29) | Confirmer les périodes des projets | decision-marc, contenu | — | ouverte |
| PM-030 | [#30](https://github.com/marco-mancini/marckouassi.com/issues/30) | Traduire les 296 champs de contenu sans version anglaise | decision-marc, contenu | — | fermée — réglée par les PR #67 à #71 et #80 ; le build annonce « à traduire : 0 champ(s) » |
| PM-031 | [#31](https://github.com/marco-mancini/marckouassi.com/issues/31) | Décider des deux appels extérieurs de la page du CMS | decision-marc, cms, securite | — | ouverte |
| PM-032 | [#32](https://github.com/marco-mancini/marckouassi.com/issues/32) | Décider du sort de l'ancien back-office Supabase | decision-marc, dette | — | ouverte — redevenue indépendante de MarcoS (décision #23 : pas de Supabase) |
| PM-033 | [#33](https://github.com/marco-mancini/marckouassi.com/issues/33) | Mettre à jour Docs/CONTENT_CHECKLIST.md, périmé depuis le CMS | documentation | — | fermée — réglée par la PR #42 |
| PM-034 | [#34](https://github.com/marco-mancini/marckouassi.com/issues/34) | Corriger la note périmée d'AGENTS.md sur les polices système | documentation, decision-marc | — | fermée — réglée par la PR #39 |
| PM-035 | [#35](https://github.com/marco-mancini/marckouassi.com/issues/35) | Inscrire la méthode issues, branches et pull requests dans AGENTS.md | documentation, decision-marc | — | fermée — réglée par la PR #39 |
| PM-038 | [#38](https://github.com/marco-mancini/marckouassi.com/issues/38) | Réécrire AGENTS.md | documentation | — | fermée — terminée par la PR #39 |
| PM-040 | [#40](https://github.com/marco-mancini/marckouassi.com/issues/40) | Animation Motion Design de la couverture | decision-marc, documentation | — | ouverte |
| PM-045 | [#45](https://github.com/marco-mancini/marckouassi.com/issues/45) | Passer en jetons les valeurs en dur relevées autour des 14px | dette | — | fermée — réglée par la PR #51 |
| PM-046 | [#46](https://github.com/marco-mancini/marckouassi.com/issues/46) | La référence 71cfb9d de comparer-reference est périmée (14 écarts) | dette | — | fermée — réglée par la PR #48 |
| PM-049 | [#49](https://github.com/marco-mancini/marckouassi.com/issues/49) | Avatar 3D de MarcoS | decision-marc, documentation | — | ouverte — reportée en **V2** par la décision D-13 : MarcoS se lance sans avatar. Fichiers attendus : Docs/MARCOS_AVATAR.md (PM-076) |
| PM-052 | [#52](https://github.com/marco-mancini/marckouassi.com/issues/52) | Étendre le contrôle des couleurs brutes aux composants et aux fondations | dette | — | fermée — réglée par la PR #55 |
| PM-053 | [#53](https://github.com/marco-mancini/marckouassi.com/issues/53) | Mettre à jour Docs/DETTE_TECHNIQUE.md après PM-020 et PM-045 | documentation | — | fermée — réglée par la PR #56 |
| PM-054 | [#54](https://github.com/marco-mancini/marckouassi.com/issues/54) | Mettre à jour l'inventaire des branches (Docs/BRANCHES.md) | documentation | — | fermée — réglée par la PR #57 |
| PM-058 | [#58](https://github.com/marco-mancini/marckouassi.com/issues/58) | Passer en jetons les valeurs en dur restantes du Design System | dette | — | fermée — réglée par la PR #59 |
| PM-060 | [#60](https://github.com/marco-mancini/marckouassi.com/issues/60) | Diagnostic : la version anglaise du site reste en français | contenu | — | fermée — réglée par la PR #71 |
| PM-061 | [#61](https://github.com/marco-mancini/marckouassi.com/issues/61) | Fautes et incohérences du texte français relevées pendant la traduction | decision-marc, contenu | — | ouverte |
| PM-062 | [#62](https://github.com/marco-mancini/marckouassi.com/issues/62) | Traduction anglaise, lot 1 : sections (116 champs) et glossaire | contenu | — | fermée — réglée par la PR #67 |
| PM-063 | [#63](https://github.com/marco-mancini/marckouassi.com/issues/63) | Traduction anglaise, lot 2 : projets (91 champs) | contenu | — | fermée — réglée par la PR #68 |
| PM-064 | [#64](https://github.com/marco-mancini/marckouassi.com/issues/64) | Traduction anglaise, lot 3 : CV (75 champs) | contenu | — | fermée — réglée par la PR #69 |
| PM-065 | [#65](https://github.com/marco-mancini/marckouassi.com/issues/65) | Traduction anglaise, lot 4 : textes d'interface | contenu | — | fermée — réglée par la PR #70 |
| PM-066 | [#66](https://github.com/marco-mancini/marckouassi.com/issues/66) | Traduction anglaise, lot 5 : métadonnées et SEO, puis vérification complète | contenu | — | fermée — réglée par la PR #71 |
| PM-072 | [#72](https://github.com/marco-mancini/marckouassi.com/issues/72) | Diagnostic : « le toggle vers l'anglais ne fonctionne pas » | bug | — | fermée — mécanisme hors de cause ; garde-fous par les PR #79 et #80 |
| PM-073 | [#73](https://github.com/marco-mancini/marckouassi.com/issues/73) | Anglais : guillemets français dans deux champs en de projets.json | contenu | — | fermée — réglée par la PR #80 |
| PM-074 | [#74](https://github.com/marco-mancini/marckouassi.com/issues/74) | Sélecteur de langue : zone cliquable de 44 × 38 px, sous le minimum de 44 × 44 | accessibilite, bug | — | fermée — réglée par la PR #79 |
| PM-075 | [#75](https://github.com/marco-mancini/marckouassi.com/issues/75) | Acter marckouassi-com.vercel.app comme adresse officielle (PM-009 suspendue) | documentation, infrastructure | — | fermée — réglée par la PR #77 |
| PM-076 | [#76](https://github.com/marco-mancini/marckouassi.com/issues/76) | Spécification des fichiers de l'avatar 3D de MarcoS (Docs/MARCOS_AVATAR.md) | documentation | — | fermée — réglée par la PR #78 |
| PM-081 | [#81](https://github.com/marco-mancini/marckouassi.com/issues/81) | État de fin de session du 2 octobre 2026 | documentation | — | fermée — réglée par la PR #82 |
| PM-091 | [#91](https://github.com/marco-mancini/marckouassi.com/issues/91) | D-11 : le refus d'entraînement Mistral est gratuit, lever le blocage et préparer la mention | documentation | — | fermée — réglée par la PR #92 |
| PM-093 | [#93](https://github.com/marco-mancini/marckouassi.com/issues/93) | IA-01 : base de connaissance de MarcoS, réduite et publiée au build | documentation | — | fermée — réglée par la PR #94 |
| PM-095 | [#95](https://github.com/marco-mancini/marckouassi.com/issues/95) | IA-02 : squelette du Worker, validations et codes d'erreur | documentation | — | fermée — réglée par la PR #96 |
| PM-097 | [#97](https://github.com/marco-mancini/marckouassi.com/issues/97) | Remplacer le portrait de la section À propos par la version détourée | contenu | — | fermée — réglée par la PR #98 ; la transparence survit désormais au build |
| PM-099 | [#99](https://github.com/marco-mancini/marckouassi.com/issues/99) | Sous 850 px, le portrait de « À propos » coupe le visage | decision-marc, bug | — | fermée — réglée par la PR #107 ; le portrait se pose sur le bord bas du vert, 0 % de recadrage latéral de 1024 à 1440 px, 9 % restants à 900 px (signalés à Marc) |
| PM-100 | [#100](https://github.com/marco-mancini/marckouassi.com/issues/100) | Mettre à jour la référence de comparaison après le changement de portrait | dette | — | fermée — réglée par la PR qui porte cette ligne ; référence `9d51394` → `e8b729c` |
| PM-102 | [#102](https://github.com/marco-mancini/marckouassi.com/issues/102) | IA-03 : prompt court, assemblage et liens internes validés | documentation | — | fermée — réglée par la PR #103 |
| PM-104 | [#104](https://github.com/marco-mancini/marckouassi.com/issues/104) | IA-04 : composant Conversation, gabarit Assistant, dictionnaires et champ de contenu | documentation | — | ouverte — composant `Conversation`, gabarit `Assistant` et dictionnaires livrés par la PR #137 ; le champ de contenu `assistant` attend les trois textes de Marc (D-9), le CMS écartant les valeurs vides à l'enregistrement |
| PM-105 | [#105](https://github.com/marco-mancini/marckouassi.com/issues/105) | Miroir mobile de l'avancement, généré depuis les issues | documentation | — | fermée — réglée par la PR #137 ; `Docs/suivi/ETAT_MOBILE.md` produit par `tools/etat-mobile.mjs`, jamais écrit à la main (AGENTS.md §6.4) |
| PM-106 | [#106](https://github.com/marco-mancini/marckouassi.com/issues/106) | Le portrait détouré doit poser directement sur le vert, sans cadre | contenu | — | fermée — réglée par la PR #107 |
| PM-108 | [#108](https://github.com/marco-mancini/marckouassi.com/issues/108) | Mettre à jour la référence de comparaison après PM-106 | dette | — | fermée — réglée par la PR qui porte cette ligne ; référence `e8b729c` → `f48646f` |
| PM-109 | [#111](https://github.com/marco-mancini/marckouassi.com/issues/111) | Définir la matrice de qualification commerciale de MarcoS | documentation, decision-marc | — | fermée — réglée par la PR #119 |
| PM-110 | [#112](https://github.com/marco-mancini/marckouassi.com/issues/112) | Implémenter la collecte et le cahier des charges prospect | documentation | PM-109 | fermée — réglée par la PR #120 |
| PM-111 | [#113](https://github.com/marco-mancini/marckouassi.com/issues/113) | Permettre à MarcoS de proposer des options créatives | documentation, decision-marc | — | fermée — réglée par la PR #121 |
| PM-112 | [#114](https://github.com/marco-mancini/marckouassi.com/issues/114) | Envoyer à M. Kouassi le cahier des charges via Resend | securite, infrastructure | — | fermée — réglée par la PR #122 |
| PM-113 | [#115](https://github.com/marco-mancini/marckouassi.com/issues/115) | Formaliser les règles de comportement conversationnel de MarcoS | documentation, decision-marc | — | fermée — réglée par la PR #136 |
| PM-114 | [#116](https://github.com/marco-mancini/marckouassi.com/issues/116) | Intégrer la qualification commerciale dans le plan et les tests de MarcoS | documentation | — | fermée — réglée par la PR #137 ; les quinze points du contrat sont éprouvés sans clé ni réseau |
| PM-115 | [#117](https://github.com/marco-mancini/marckouassi.com/issues/117) | Remettre ISSUES.md et BRANCHES.md en accord avec GitHub, et corriger la référence de #26 | documentation | — | fermée — réglée par cette PR |
| PM-116 | [#123](https://github.com/marco-mancini/marckouassi.com/issues/123) | Reprendre la refonte complète des catégories de la section 05 | decision-marc | — | ouverte — décisions attendues de Marc |
| PM-117 | [#124](https://github.com/marco-mancini/marckouassi.com/issues/124) | Publier le titre et le texte de la section 05 « Mes réalisations » | design | — | fermée — réglée par la PR #125 |
| PM-118 | [#126](https://github.com/marco-mancini/marckouassi.com/issues/126) | Harmoniser les titres de section et l’en-tête des prestations | design | — | fermée — réglée par la PR #137 ; « Mes réalisations » mesuré sur une ligne de 320 à 1920 px, FR/EN, clair/sombre |
| PM-119 | [#128](https://github.com/marco-mancini/marckouassi.com/issues/128) | Repenser intégralement la section 06 — Prestations : parcours immersif interactif | enhancement | — | fermée — réglée par la PR #137 ; gabarit `Decouverte`, validé sur la Preview Vercel |
| PM-120 | [#129](https://github.com/marco-mancini/marckouassi.com/issues/129) | Tests contractuels MarcoS — comportement et qualification | documentation, tests | PM-113 | fermée — réglée par la PR #137 ; le contrat D-21 à D-28 est lu dans `MARCOS_DECISIONS_20261003.md`, pas recopié |
| PM-121 | [#130](https://github.com/marco-mancini/marckouassi.com/issues/130) | IA-04 : intégrer Conversation et Assistant au rendu du site | enhancement | PM-104 | ouverte — dépend de PM-104 : l'intégration au rendu attend le champ de contenu |
| PM-122 | [#131](https://github.com/marco-mancini/marckouassi.com/issues/131) | IA-04 : générateur de suivi mobile | enhancement, tests | PM-105 | fermée — réglée par la PR #137 ; deux défauts du générateur corrigés, pagination et étiquette de blocage |
| PM-123 | [#132](https://github.com/marco-mancini/marckouassi.com/issues/132) | 06 / Prestations — implémentation du parcours immersif | enhancement | PM-119 | fermée — réglée par la PR #137 |
| PM-124 | [#133](https://github.com/marco-mancini/marckouassi.com/issues/133) | Chromium — relevé du seuil d'ouverture | tests | PM-021 | fermée — relevé du 3 octobre 2026 : l'étape Chromium tient en 31 s au plus contre un seuil de 3 min. **Condition non atteinte**, aucun workflow modifié (PM-021 reste ouverte) |
| PM-125 | [#134](https://github.com/marco-mancini/marckouassi.com/issues/134) | Exécution autonome — lots #104 #105 #115 #116 #128 #21 | documentation | — | fermée — suivi du lot clos : PM-113, PM-105, PM-114 et PM-119 prouvés, PM-021 laissé en veille sur son propre critère ; PM-104 et PM-121 restent ouvertes, en attente des textes de Marc |
| PM-126 | [#135](https://github.com/marco-mancini/marckouassi.com/issues/135) | Placeholder | documentation | — | fermée |
