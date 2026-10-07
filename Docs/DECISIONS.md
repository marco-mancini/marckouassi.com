# Journal des décisions

Ce journal garde le **pourquoi** des décisions (AGENTS.md §6.5). L'état de chaque tâche vit dans les issues GitHub ([ISSUES.md](ISSUES.md)), pas ici.

Règles :

- une entrée par décision, la plus récente en haut ;
- format : Problème · Options · Choix · Motif · Impact · Réversibilité ;
- une décision provisoire porte la mention **provisoire** ;
- une décision plus récente sur le même sujet remplace l'ancienne. L'ancienne reste dans le journal, marquée « remplacée par » ;
- le journal commence le 2 octobre 2026. Les décisions antérieures sont consignées dans leur document : [HEBERGEMENT.md](HEBERGEMENT.md) (Vercel Hobby, 1er octobre 2026), [ADMIN_EN_SOMMEIL.md](ADMIN_EN_SOMMEIL.md), [RETIRES.md](RETIRES.md).

---

> **Collision de numéros, à arbitrer par Marc.** Deux branches parallèles ont
> attribué **D-37, D-38 et D-39** au même moment, à partir de D-36 du 4 octobre :
> une fois pour MarcoS les 4 et 5 octobre, une fois pour le site le 7 octobre.
> Les six entrées sont conservées telles qu'elles ont été écrites, chacune avec
> sa date, parce que les renuméroter réécrirait une trentaine de citations dans
> dix documents et deux fichiers de tests — et une décision ne se réécrit pas de
> mémoire (MARCOS_DECISIONS_20261003.md, D-34). **Lire un numéro avec sa date :**
> 7 octobre = le site ; 4 et 5 octobre = MarcoS.

---

## 2026-10-07 — L'effet de frappe de MarcoS est une régression, pas un arbitrage

Décision de Marc, en conversation · issue [#168](https://github.com/marco-mancini/marckouassi.com/issues/168).

**Problème.** Le lot de la maquette écrivait la réponse de MarcoS caractère par
caractère, à 18 ms par caractère. Signalé comme un point d'arbitrage entre D-40,
qui listait un « curseur de frappe » parmi les animations demandées, et
`AI_UX.md`, qui interdit l'effet de frappe « sans réserve ». La question posée
était : laquelle des deux l'emporte.

**Options.** 1. La maquette fait foi, et `AI_UX.md` s'aligne. 2. Garder
l'animation mais la rendre inoffensive pour un lecteur d'écran, comme le fait
déjà `TexteProgressif` (texte complet dans un nœud lu, copie animée en
`aria-hidden`). 3. Retirer l'animation.

**Choix de Marc : option 3.** « C'est une régression, pas un arbitrage. »
L'interdit d'`AI_UX.md` vaut sans réserve et dans toutes les versions.

**Motif.** La réponse vit dans le journal `role="log"` `aria-live="polite"`. Une
réponse de 200 caractères y produisait 200 mutations de la même région annoncée,
contre la promesse « annoncées une fois, complètes ». Le curseur n'était même
jamais visible : `.marcos .curseur` ne portait aucun style, seulement un
`display: none` sous mouvement réduit.

**Impact.** `ecrireProgressivement` est remplacée par une pose unique.
`DELAIS.frappe`, le jeton mort `--marcos-curseur` et la règle CSS du curseur
disparaissent. `AI_UX.md` reprend sa formulation d'origine, et D-40 est amendée
à l'endroit où elle listait le curseur. Corrigé dans la même passe, au même
contrat : `Maj + Entrée` ne passait pas à la ligne — `keydown` n'examinait pas
`shiftKey`, donc le champ de trois lignes ne pouvait jamais en recevoir un.

**Réversibilité.** Totale, mais elle demanderait une décision nouvelle. Si
l'animation revenait un jour, elle passerait par `TexteProgressif` : le texte
complet dans le nœud annoncé, la copie animée en `aria-hidden`.

---

## 2026-10-07 — D-39 : un seul gabarit pour tous les états du site, animé par le sceau

Décision de Marc, maquette validée en trois versions · issue [#162](https://github.com/marco-mancini/marckouassi.com/issues/162).

**Problème.** Le site n'avait ni page 404 (Vercel servait sa page grise), ni message hors connexion, ni repli pour un média en échec ; l'état vide et les erreurs de MarcoS étaient de simples lignes de texte.

**Options.** Un composant « État » nouveau ; étendre `Message`, qui couvre déjà chargement, vide et erreur.

**Choix.** Étendre `Message` (mode sceau) et `Sceau` (humeurs). Un seul gabarit, sans exception : le sceau animé, un titre bicolore (partie dorée choisie par Marc : *Char*gement, *In*disponible, *Main*tenance ; sinon le premier mot), une phrase, ses actions. Mêmes tailles et même place partout. La page de maintenance perd son grand titre.

**Motif.** Cohérence visuelle uniforme (demande de Marc) ; AGENTS.md 3.2 : réutiliser avant de créer, pas de composant doublon.

**Impact.** Nouvelle page `404.html` (FR/EN). Hors connexion : un message en bas d'écran, pas une page plein écran (il faudrait un service worker). Aucun chargement n'est simulé là où rien ne se charge : l'humeur `chargement` ne sert qu'à MarcoS.

**Réversibilité.** Totale : un état revient à son ancien rendu en retirant `mode: { sceau }`.

---

## 2026-10-07 — D-38 : mesure d'audience GA4 et mode maintenance

Décision de Marc, en conversation · issue [#160](https://github.com/marco-mancini/marckouassi.com/issues/160).

**Problème.** Le site n'avait ni mesure d'audience, ni moyen de le fermer le temps d'une mise à jour.

**Options.** Mesure : GA4 sans bandeau, GA4 avec bandeau de consentement, outil sans cookie. Maintenance : case dans le CMS, variable Vercel, page à la main.

**Choix.** GA4 (`G-KWQ5D3KE9R`) **sans bandeau**, choix de Marc après avertissement sur le consentement. Maintenance par une **case du CMS** (`site.maintenance.active`).

**Motif.** Tout se pilote depuis le CMS, sans toucher au code : l'identifiant vit dans `content/site.json` (`mesure.ga4`, vide = aucune mesure) et la case reconstruit le site.

**Impact.**
- La mesure ne part que depuis l'adresse publique (`site.url`) : ni aperçu Vercel, ni poste local, ni test ne la déclenchent (`Frontend/mesure.js`).
- Maintenance cochée : chaque adresse publique, en FR et EN, rend la page de maintenance (`gabarits/Maintenance`), `noindex` ; `/admin/` reste ouvert pour décocher. Plan du site et robots inchangés.

**Réversibilité.** Totale : vider `mesure.ga4` coupe la mesure ; décocher la case rouvre le site au build suivant.

---

## 2026-10-07 — D-37 : arbitrages sur #6, #7, #13, #40 et #49

Décision de Marc, en conversation, sur les recommandations de Claude · issues
[#6](https://github.com/marco-mancini/marckouassi.com/issues/6),
[#7](https://github.com/marco-mancini/marckouassi.com/issues/7),
[#13](https://github.com/marco-mancini/marckouassi.com/issues/13),
[#40](https://github.com/marco-mancini/marckouassi.com/issues/40),
[#49](https://github.com/marco-mancini/marckouassi.com/issues/49),
[#158](https://github.com/marco-mancini/marckouassi.com/issues/158).

**Problème.** Cinq issues `decision-marc` attendaient un arbitrage. La plus
grave : le dépôt est public, et l'historique Git sert encore l'ancien PDF du CV
(téléphone, date de naissance), indépendamment des anciens déploiements Vercel.

**Options pour l'historique public (#6).** Dépôt privé ; réécriture de
l'historique puis force-push ; acceptation.

**Choix.**

1. **#6** — passer le dépôt **en privé** maintenant, puis supprimer les
   déploiements Vercel antérieurs à `eb837ee`. Pas de réécriture d'historique
   pour l'instant.
2. **#7** — Marc active lui-même les workflows *Auto-add* et *Item closed →
   Fait* du Project.
3. **#13** — supprimer les **54 branches absorbées**, toutes étiquetées
   `archive/<branche>`. Le critère de #13 est restreint à ces branches ; les
   **43 branches à commits uniques** sont triées à part dans #158, sans aucune
   suppression d'ici là.
4. **#40** — le verrou reste : rien avant le domaine (#9) et le résumé du CV
   (#11).
5. **#49** — `Photo_Marc.jpg` est **conservé** ; le stockage des masters
   d'animation est **reporté** à leur production ; la mise en ligne de l'avatar
   se tranche dans #26.

**Motif.** Le dépôt privé ferme l'exposition la plus large en une commande
réversible, sans casser les 62 étiquettes ni les SHA cités. Supprimer une
branche absorbée et étiquetée ne fait rien perdre ; supprimer une branche à
commits uniques le pourrait.

**Impact.** Aucun changement de code. Vérifier, après le passage en privé, que
le déploiement Vercel et la publication par Sveltia CMS fonctionnent toujours.

**Réversibilité.** Totale : la visibilité se rebascule, chaque branche supprimée
se recrée depuis son étiquette. Seule la suppression des déploiements Vercel est
définitive, et c'est son but.

---
## 2026-10-05 — D-41 : D-9 est clos, et sa mention de confidentialité réécrite

Décision de Marc (clôture demandée) · **clôt D-9** · **tient compte de D-10 et
D-11**.

**Problème.** Les trois textes de D-9 existaient depuis le 4 octobre, mais le
projet continuait de les présenter comme du contenu à fournir, et la mention de
confidentialité n'avait jamais été confrontée au code. Marc a demandé de vérifier
avant d'écrire : « Ne rien inventer. »

**Ce que l'audit a trouvé.** Cinq comportements, chacun lu dans le code :

| Vérification | Résultat |
|---|---|
| Stockage navigateur | `sessionStorage` seulement — ni `localStorage`, ni IndexedDB, ni cookie. La conversation meurt avec l'onglet |
| Stockage serveur | **aucun**. Le Worker ne déclare ni KV, ni D1, ni R2, ni Durable Object. Son unique cache porte sur la base de connaissance, qui est publique |
| Transmission | la question **part bien** chez le fournisseur, avec le prompt système |
| Journaux (D-10) | langue, nombre d'échanges, budget restant, code de sortie, durée. **Ni question, ni réponse** |
| Resend | appelé seulement si le brief est exploitable **et** confirmé **et** que le visiteur a dit « oui » au recontact **et** qu'un contact existe |

**Le problème que cela révèle.** La mention disait « Vos échanges avec MarcoS
restent privés. » C'est plus que ce que le système tient : la question est
transmise à un tiers, et le **refus d'entraînement** (D-11), bien que gratuit et
décidé, est une bascule que Marc doit actionner dans le panneau Mistral —
inactionnable et invérifiable depuis le dépôt.

**Choix.** La mention est réécrite pour ne dire que le vérifiable :

> 🔒 Vos échanges restent dans cet onglet et ne sont conservés nulle part. Votre
> question est transmise au modèle qui y répond, et rien n'est envoyé à
> M. Kouassi sans votre accord.

**Motif.** Une promesse de confidentialité qu'on ne tient pas vaut moins que pas
de promesse du tout. Les trois membres de phrase correspondent aux trois
premières lignes du tableau ci-dessus, et un test les rattache un par un au code
qui les rend vraies. Un autre test **interdit** d'écrire que les données ne
servent pas à l'entraînement tant que D-11 n'est pas posé.

**Impact.** L'accueil anglais prend la forme validée (« I'm MarcoS, Mr. Kouassi's
assistant »). Les dix exemples sont inchangés, au mot près. Corrigé au passage :
l'interrupteur de MarcoS s'annonçait « Afficher l'accueil animé » dans le CMS —
le libellé de `site.intro.active`, pris par collision de nom. Il dit maintenant
« Activer MarcoS ».

**Réversibilité.** Les textes vivent dans `content/site.json` et restent
éditables dans `/admin/`. Rien n'est figé dans le code ; seuls les tests disent
ce qui a été validé, et ils se mettent à jour avec une décision nouvelle.

---

## 2026-10-05 — D-40 : la maquette d'interaction devient l'interface de MarcoS

Décision de Marc · **précise D-39** (qui posait la présence flottante) ·
maquette `marcos-maquette.html` fournie le 5 octobre.

**Problème.** D-39 avait posé une présence flottante, mais dessinée par nous.
Marc a fourni une maquette d'interaction complète — structure, proportions,
états, animations — et demandé qu'elle devienne la référence visuelle, le vrai
MarcoS étant branché à l'intérieur. Puis : « La maquette est juste une réponse
UI donc toi, fait ce qui est meilleur. »

**Choix.** La maquette est reprise fidèlement, sauf là où elle se trompe — et
ces écarts sont listés plus bas, aucun n'est silencieux.

**Ce qui vient de la maquette.**

| Point | Ce qui est repris |
|---|---|
| Structure | `.marcos` → deux socles. Le buste est `position: absolute; bottom: 100 %` de son socle : il est **posé** sur son porteur. Le porteur change — la barre fermée, le panneau ouvert — donc il y a un buste par socle et un seul visible |
| Ouverture | le buste passe sur le panneau (centré, 75 % de sa largeur), la barre se rétracte à 75 % et se centre dessous |
| Barre | trois commandes — ouvrir, activité, effacer — deux séparateurs, fond d'encre, icônes au trait |
| Panneau | **non modal** (`aria-modal="false"`) : le portfolio reste parcourable. Hauteur bornée, défilement interne |
| Fil | bulles à gauche pour MarcoS, à droite pour le visiteur ; suggestions en défileur horizontal dans la bulle d'accueil ; marqueur « nouvelle réponse » ; bandeau d'erreur ; saisie d'une ligne avec compteur |
| États | `rest · hover · open · listening · thinking · responding · end` — **sept états d'exécution**, pas dix. Les dix fichiers de `Public/Avatar_MarcoS/` restent une bibliothèque : six états déclarent une expression, `hover` retombe sur celle du repos |
| Mouvement | respiration au repos, soulèvement au survol, balancement en réflexion, micro-mouvement en réponse, onde dont l'amplitude et le rythme suivent l'état |

**Ce que Marc a demandé en plus, après la maquette.**

- davantage de mouvement : ouverture en cascade (en-tête, fil, saisie, mention),
  arrivée des bulles depuis leur côté, cascade des suggestions, ~~curseur de
  frappe~~, pulsation du bouton d'envoi, halo au survol des commandes ;
  *(le curseur de frappe est **retiré** par la décision du 7 octobre ci-dessus,*
  *#168 : il écrivait la réponse dans une région `aria-live`.)*
- suggestions et mention de confidentialité en corps plus petit ;
- **« MarcoS » s'écrit MarcoS.** La maquette force la capitale sur le nom dans
  l'en-tête. Déformer un nom est interdit : `text-transform` est retiré.

**Les quatre écarts assumés avec la maquette, et pourquoi.**

| Écart | Raison |
|---|---|
| `end` garde le panneau ouvert | La maquette calcule `ouvert = (open\|listening\|thinking\|responding)` : `end` en est exclu, donc le panneau se refermait à la seconde où la réponse finissait de s'écrire, avant que le visiteur ait pu la lire — et le retour à `open` prévu 1,4 s plus tard ne se déclenchait jamais, puisqu'il se garde sur `ouvert`. Ici `data-ouvert` suit l'attribut `open` du `<dialog>` : une seule source, la question ne se pose plus |
| « Effacer » est désactivé, pas masqué | La barre garde ses trois emplacements et ne change pas de largeur. Une commande indisponible le dit ; elle n'est pas un bouton mort (§6.8) |
| Le champ a une étiquette | La maquette n'a qu'un `aria-label` et un placeholder — axe-core relève `label` et `label-title-only` en « serious ». Une étiquette invisible mais reliée corrige les deux |
| Le compteur est annoncé | Le chiffre nu de la maquette est `aria-hidden` : il ne dit rien à un lecteur d'écran. La phrase complète du dictionnaire l'accompagne, invisible, en `aria-live` |

**Ce qui n'a pas été dupliqué.** `Modale` reçoit une option `modal: false`
plutôt qu'un second mécanisme de dialogue. `Conversation` garde sa structure —
`role="log"`, liste de tours, étiquette de rôle — et change seulement
d'habillage : l'étiquette devient invisible, l'alignement et la couleur la
portent. `Bouton` gagne quatre tracés SVG dans son jeu d'icônes. `Saisie` gagne
une invite. Aucun composant neuf.

**Impact.** `assistant.active` reste à `false` : rien n'est publié. Le vrai
pipeline est branché — endpoint, session, historique, codes d'erreur du Worker,
liens internes validés, textes D-9 depuis le CMS, dictionnaires FR et EN.

**Réversibilité.** Entière. La maquette d'origine n'est pas modifiée ; elle
reste la référence. Revenir à l'état d'avant demande de rendre à
`Assistant.{js,css}` leur version précédente et de retirer `modal` de `Modale`.

---

## 2026-10-05 — D-39 : MarcoS est une présence flottante, pas une boîte de dialogue

Décision de Marc · **étend D-4** (qui donnait deux entrées) · **lève le dernier
report de D-38** sur la présence en bas à droite.

**Problème.** MarcoS n'existait que comme une modale centrée, ouverte depuis un
lien dans Contact et un lien dans le menu. Le visiteur ne savait pas qu'il
existait tant qu'il n'avait pas fait défiler jusqu'au pied de page. D-38 avait
supprimé le palier qui reportait la figurine, mais rien ne l'avait implémentée :
les dix expressions validées dormaient dans `Public/Avatar_MarcoS/`.

**Options.**

1. Garder la modale centrée et ajouter un simple bouton flottant.
2. Une présence flottante en bas à droite — buste posé sur une barre compacte —
   et un panneau **ancré** à cette présence, borné, qui ne couvre pas le
   portfolio.
3. Une fenêtre de chat classique plein écran.

**Choix.** L'option 2. Les deux entrées de D-4 restent : il y a maintenant trois
points d'entrée vers le même panneau.

**Motif.** Marc : « il faut que MarcoS soit toujours flottant en bas droite avec
une barre comme ça qui s'anime », puis « l'avatar doit être toujours collé sur
le haut du cadre, jamais devant, jamais derrière mais toujours juste posé
dessus ». L'option 3 est un rejet explicite de `MARCOS_AVATAR_UI` §14 : le
portfolio reste prioritaire, MarcoS ne prend jamais la page.

**Impact.**

| Point | Ce qui est fait |
|---|---|
| Présence | `LanceurAssistant` : buste + barre, en bas à droite, `position: fixed` |
| Assise du buste | posé **à plat** sur l'arête haute de la barre, `--lanceur-assise: 0` : ni devant, ni derrière, ni décollé. Les sept fichiers n'ont aucune bande transparente en bas (mesure du 4 octobre 2026), donc le contact est exact |
| États | `repos · accueil · ecoute · reflexion · reponse · fin · erreur` — ceux de [MARCOS.md](MARCOS.md) §4. **Un seul** `data-etat`, sur `.lanceur`, pilote le buste ET la barre |
| Panneau | nouvelle variante `modale--ancre` : `<dialog>` natif, donc piège à focus et Échap inchangés, mais posé au-dessus du lanceur, borné, fond transparent — MarcoS reste visible pendant la conversation |
| Expressions | sept des dix fichiers validés, une par état, choisies dans [MARCOS_AVATAR_EXPRESSIONS.md](MARCOS_AVATAR_EXPRESSIONS.md) §3 ; les trois autres restent en bibliothèque |
| Chargement | seule l'expression du repos est demandée au premier affichage ; les autres portent `hidden` et n'arrivent qu'avec leur état |
| Données | `site.assistant.avatar.etats` dans `content/site.json` : aucun chemin de fichier en dur dans un gabarit, et le CMS laisse changer l'image d'un état |

**Ce que D-39 ne tranche pas.** Le format. `MARCOS_AVATAR.md` §3 impose un carré
512 × 512 ; les fichiers sont en 783 × 667 et montrent le personnage aux trois
quarts, là où `MARCOS_AVATAR_UI` §3 demande un **buste** — tête et épaules, le
visage prioritaire. À 124 px de haut, la tête reste petite. Recadrer, c'est
choisir un cadrage, donc une décision artistique, et Marc a écrit « aucun
traitement supplémentaire » sur les fichiers validés. Reste ouvert dans
[#49](https://github.com/marco-mancini/marckouassi.com/issues/49).

**Ce que D-38 annonçait et qui s'est révélé faux.** Le pipeline à transparence
n'était pas à écrire : `tools/medias.mjs` garde déjà l'alpha au-delà de 5 % de
pixels non opaques (`SEUIL_TRANSPARENCE`), et les avatars sont entre 49,5 % et
66,8 %. Mesure après build : WebP RGBA, alpha conservé, **264 Ko** pour les sept
expressions, contre 4,25 Mo de PNG sources.

**Réversibilité.** Entière et sans migration. `assistant.active` reste à `false`
tant que Marc ne l'active pas : rien de tout cela n'est publié aujourd'hui.
Retirer `LanceurAssistant({...})` de `PageAccueil` et repasser la variante de la
modale à `centre` rend l'état d'avant, les deux entrées de D-4 comprises.

---

## 2026-10-04 — D-38 : plus de V2, tout se fait en V1

Décision de Marc · **remplace D-13** et la seconde moitié de **D-4**
([MARCOS_DECISIONS.md](MARCOS_DECISIONS.md)).

**Problème.** Le projet portait un découpage en deux temps : une V1 sans
figurine, avec l'entrée de MarcoS dans Contact et dans le menu, puis une V2 qui
aurait ajouté l'avatar 3D et une présence discrète en bas à droite. Ce
découpage avait une raison — ne pas retarder une fonction qui marche en
attendant un habillage inexistant — mais il a produit son propre coût : neuf
documents décrivent une version future, l'issue
[#49](https://github.com/marco-mancini/marckouassi.com/issues/49) est « reportée
en V2 », et dix expressions d'avatar validées dorment dans le dépôt sans que
rien ne les lise.

**Choix de Marc.** **Il n'y a plus de V2.** Tout ce qui était prévu pour elle
relève de la version en cours. Le découpage disparaît des documents ; ce qui
reste à faire reste à faire, mais plus « plus tard par principe ».

**Motif.** Une version future est une étagère commode : on y pose ce qu'on ne
veut pas trancher. Les dix expressions sont livrées et validées depuis le
4 octobre ; les garder derrière un palier qui n'a pas de date revient à les
enterrer.

**Impact — et ce que cette décision ne fait pas.** Elle lève un **report**, pas
un **blocage**. Ce qui manquait à l'avatar manque toujours, et aucun de ces
points n'est une question de calendrier :

| Ce qui reste | Pourquoi ce n'est pas levé par D-38 |
|---|---|
| Format des fichiers | `MARCOS_AVATAR.md` §3 impose un carré **512 × 512** ; les dix expressions sont en **783 × 667**. Recadrer, c'est choisir un cadrage — une décision artistique — et Marc a écrit « aucun traitement supplémentaire » sur les fichiers validés |
| Pipeline à transparence | `tools/medias.mjs` aplatit toute transparence sur le crème du site : publié tel quel, MarcoS apparaîtrait dans un carré crème en thème sombre |
| Séquences d'animation | les ~230 masters n'existent pas, et leur stockage (dépôt, LFS, externe) n'est pas tranché |

La **présence flottante**, elle, redevient ouverte : D-4 gardait l'entrée dans
Contact et le menu « en V1 » et la présence en bas à droite « en V2 ». Les deux
entrées actuelles restent en place ; ajouter la présence flottante est désormais
une question d'implémentation, plus de palier. `MARCOS.md` §5 en garde les
contraintes — ne pas couvrir le contenu sur téléphone, cible tactile, mouvement
réduit.

**Réversibilité.** Les documents gardent la trace du découpage dans les dossiers
datés ; D-13 n'est pas effacée, elle est remplacée. Revenir à deux paliers
demanderait une nouvelle décision.

## 2026-10-04 — D-37 : les textes de MarcoS, et une formulation qui varie

Décision de Marc · **remplace la seconde moitié de D-28**
([MARCOS_DECISIONS_20261003.md](MARCOS_DECISIONS_20261003.md)) · met en œuvre
**D-9**.

**Problème.** D-9 réservait à Marc les trois textes de MarcoS : message
d'accueil, exemples de questions, mention de confidentialité. Tant qu'ils
n'existaient pas, `assistant.active` restait `false` et la fenêtre ne pouvait
pas être montrée à un visiteur. D-28, de son côté, imposait **une phrase
exacte** pour rendre la décision créative à M. Kouassi — ce qui, répété à
chaque échange, devient une formule.

**Choix de Marc.** Les quatre textes sont arrêtés, au mot près :

| Élément | Texte validé |
|---|---|
| Accueil | « Bonjour 👋 Je suis MarcoS, l'assistant de M. Kouassi. En quoi puis-je vous aider ? » |
| Exemples | dix questions, de « Qui est M. Kouassi ? » à « Quel temps fait-il aujourd'hui à Abidjan ? » |
| Confidentialité | « 🔒 Vos échanges avec MarcoS restent privés. » |
| Règle créative | MarcoS conseille sans imposer et **varie** la formulation qui rend la décision à M. Kouassi |

Les dix exemples ne sont pas qu'un décor : les sept premiers vérifient ce que
MarcoS sait réellement, les trois derniers ce qu'il refuse — une information
personnelle, une information inconnue, une demande hors périmètre.

**Motif.** Une phrase imposée se répète ; répétée, elle sonne faux et trahit le
procédé. L'intention compte plus que la lettre : conseiller sans imposer, et
reconnaître quand la décision revient à M. Kouassi. La formulation de D-28
reste **un exemple valable**, elle n'est simplement plus la seule.

**Impact.** Les textes vivent dans `content/site.json` → `assistant`, la couche
prévue par l'architecture, et restent éditables dans `/admin/` → Paramètres. Le
prompt système dit maintenant « varie la formulation, jamais deux fois la
même », et il tient dans son budget : **754 jetons sur 760**. La mention de
confidentialité reste courte et ne promet rien de technique : ni Mistral, ni
journaux, ni jetons, ni infrastructure.

**`assistant.active` reste `false`.** Les textes existent, mais l'activation est
un geste de Marc dans Paramètres, et elle demande en outre `ASSISTANT_URL` —
donc un Worker déployé, donc `MISTRAL_CLE`.

**Réversibilité.** Les textes se modifient dans `/admin/` sans toucher au code.
La règle créative est une phrase du prompt ; revenir à la formulation unique de
D-28 se fait en la réécrivant.

## 2026-10-04 — D-36 : les réalisations restent repliées derrière les huit catégories

Décision de Marc · issue [#123](https://github.com/marco-mancini/marckouassi.com/issues/123).

**Problème.** La question 5 de #123 demandait si le contenu d'une catégorie
devait apparaître « comme une vue distincte dans la page d'accueil ou sur une
URL de page dédiée ». Le chantier sauvegardé sur
`sauvegarde-complete-20261003-000540` avait commencé à construire la seconde
réponse — ses tests exigeaient des routes `realisations/<catégorie>/` et une
navigation cyclique — mais `PageCategorie` n'a jamais existé : il échouait sur
13 de ses 129 tests. Et le repli des onze réalisations derrière huit cartes
faisait tomber six tests du tronc, dont l'accessibilité.

**Choix de Marc.** Les onze réalisations restent **repliées** derrière les
**huit cartes de catégorie**, qui sont le seul point d'entrée. Le filtrage vit
**dans** la section « Mes réalisations ». **Aucune URL dédiée par catégorie.**

**Motif.** Le sommaire mesurait 12 123 px de haut à 1440 px ; il en fait 1 107.
Le visiteur choisit un univers avant de voir des images, au lieu de défiler
onze études. Et l'absence de route nouvelle évite huit pages à indexer, huit
adresses à maintenir, et un plan du site qui double.

**Impact.** Un seul bloc est ouvert à la fois, par `:target`. La tête de section
et les huit cartes s'effacent pendant la lecture d'une catégorie ; un bouton de
retour les ramène. Le repli n'est **pas** conditionné à `html.js-anime`, et il
n'a pas à l'être : `:target` est du CSS pur et les cartes sont de vraies ancres,
donc le dépliage fonctionne script absent, bloqué ou en échec — vérifié au
navigateur. C'est la seule raison qui autorise à masquer du contenu par défaut
ici, alors que la règle du projet veut l'inverse.

Trois catégories sont vides et le restent, en cartes blanches : `direction-artistique`,
`3d-production`, `explorations-personnelles`. `logotype` n'a pas de projet mais
six réalisations isolées. La répartition vient de `projets[].categoriePrincipale`,
une seule catégorie par projet.

**Dérive visuelle assumée.** `npm run comparer-reference` reste à **12
configurations** différentes de `f48646f`, comme avant, et la seule section qui
bouge est `sommaire` : 12 123 → 1 107 px à 1440 px, 3 736 → 1 468 px à 320 px.
Toutes les autres sections, et la page CV, gardent exactement les valeurs de
`main`.

**Réversibilité.** Quatre règles CSS. Retirer `display: none` sur
`.projets__groupes .categorie-projets` rend les onze réalisations visibles et
ramène le sommaire à sa hauteur d'avant.

## 2026-10-04 — D-35 : le brief Motion Design de Marc est le brief de référence

Décision de Marc · issues [#28](https://github.com/marco-mancini/marckouassi.com/issues/28)
et [#40](https://github.com/marco-mancini/marckouassi.com/issues/40), commentaires du
4 octobre 2026.

**Problème.** Marc voulait une animation d'entrée en motion design avec un
générique. Rien ne pouvait être conçu : ni durée, ni rôle, ni son, ni
technologie n'étaient arrêtés, et §1.4 interdit d'inventer un contenu public à
sa place. #40 cadrait l'animation de couverture mais restait volontairement
verrouillée.

**Choix de Marc.** Le brief ci-dessous, posté le 4 octobre sur #28 et #40,
remplace tout cadrage antérieur et devient la référence :

| Point | Décision |
|---|---|
| Type | véritable Motion Design |
| Objectif | effet WAOUH, premium, mémorable |
| Création | Opus 5.5 |
| Approche | séquence artistique complète, pas une succession d'éléments qui apparaissent |
| Mouvement | transformation, rythme, profondeur, caméra/composition et transitions travaillées |
| Rôle | introduire les Réalisations et renforcer leur storytelling |
| Responsive | ordinateur **et** mobile |
| Thèmes | clair **et** sombre |
| Accessibilité | `prefers-reduced-motion` obligatoire |
| Son | oui |
| Bouton « Passer » | oui |
| Durée | 10 secondes au maximum |
| Technologie | à déterminer selon le rendu final, sans dépendance inutile |
| Concept / storyboard | à concevoir **avant** intégration |
| Principe | aucune animation générique, aucune simple apparition |

**Motif.** Le brief fixe ce qui était ouvert, et il le fixe en termes
vérifiables : une durée plafond, deux thèmes, deux familles de largeurs, une
obligation d'accessibilité. Il laisse ouverts les deux seuls points qui
dépendent du rendu — la technologie et le storyboard — au lieu de les figer trop
tôt.

**Impact.** Les contraintes non négociables de #40 restent entières et
s'ajoutent au brief : aucune durée, couleur ou easing en dur hors de
`Tokens.css`, aucune librairie d'animation sans justification écrite,
vérification aux sept largeurs en clair et en sombre, zéro erreur console, zéro
débordement horizontal. Deux points du brief demandent une décision
supplémentaire au moment de l'implémentation, parce qu'ils touchent des règles
déjà écrites :

- le **son** n'existe nulle part sur le site : il faudra un réglage de volume,
  un état coupé mémorisé et un comportement défini sous `prefers-reduced-motion` ;
- les **10 secondes** plafonnent une séquence dont l'accueil animé actuel
  (`site.intro`, cinq étapes) occupe déjà une partie : le brief ne dit pas s'il
  le remplace ou s'y ajoute.

**Réversibilité.** Entière : rien n'est implémenté. #40 reste verrouillée et
porte l'implémentation ; son calendrier exige le domaine acheté
([#9](https://github.com/marco-mancini/marckouassi.com/issues/9)) et le contenu
du CV validé ([#11](https://github.com/marco-mancini/marckouassi.com/issues/11),
[#15](https://github.com/marco-mancini/marckouassi.com/issues/15), close). Une
version ultérieure du brief remplacerait celle-ci selon la règle du journal.

## 2026-10-03 — D-20 : Resend pour transmettre les briefs confirmés à M. Kouassi

Décision de Marc · issue [#114](https://github.com/marco-mancini/marckouassi.com/issues/114).

**Problème.** Un brief qualifié doit pouvoir parvenir à M. Kouassi sans exposer
de clé ni perdre les coordonnées fournies volontairement.

**Choix de Marc.** Utiliser Resend depuis le Worker, uniquement après
confirmation du brief et accord explicite de recontact. `RESEND_CLE` est un
secret distinct de la clé Mistral ; le destinataire est dérivé de
`content/site.json` ; l'expéditeur vient d'une adresse configurée sur un domaine
vérifié. L'API applique une clé d'idempotence liée à la session.

**Motif.** Le navigateur ne possède aucune clé. La séparation Mistral/Resend
garde chaque secret limité à son service. Resend conserve une clé d'idempotence
pendant 24 heures ; le Worker reste sans persistance du brief.

**Impact.** La règle D-2 « un seul fournisseur IA » reste applicable à Mistral ;
la phrase historique « un seul secret dans tout le projet » est remplacée par
deux secrets serveur, un par service. Aucun envoi réel n'est activé avant
l'ajout d'une clé d'envoi et d'un expéditeur vérifié, sans dépense.

**Réversibilité.** Retirer la route et le secret Resend désactive l'envoi ; les
briefs restent construits sans persistance côté Worker.

## 2026-10-02 — D-11 : accepter l'usage éventuel des données, et le dire honnêtement

Décision de Marc · issue [#91](https://github.com/marco-mancini/marckouassi.com/issues/91) · complète la décision du même jour sur [MarcoS](#2026-10-02--marcos--budget-0--un-seul-fournisseur-contexte-minimal).

**Problème.** La décision D-11 voulait refuser l'usage des questions des visiteurs
pour l'entraînement des modèles de Mistral. Le dossier d'arbitrage la signalait
comme **potentiellement bloquante** : si ce refus exigeait une formule payante,
il entrait en conflit direct avec la contrainte **budget 0 €**, qui prime sur
tout.

**Options.**

1. Accepter l'usage éventuel des données sur l'offre gratuite, et le dire dans la
   mention de confidentialité.
2. Renoncer à MarcoS tant que le refus n'est pas gratuit.
3. Payer le minimum pour obtenir le refus.

**Choix de Marc : option 1.** On accepte l'usage éventuel, **et on le dit
honnêtement** au visiteur.

**Motif de Marc.** Le budget 0 € est la contrainte qui prime. Les questions
posées à un assistant de portfolio sont **de nature publique** — « quels projets
avez-vous réalisés », « quelles sont ses compétences ». L'enjeu de
confidentialité est faible, et il ne justifie pas une dépense.

**Constat qui rend la décision sans objet.** Marc a demandé de vérifier si le
refus était disponible gratuitement, en précisant : « si oui, on l'active et
cette décision devient sans objet ». **Il l'est**, et la documentation du projet
se trompait sur ce point. Relevé dans la documentation publique de Mistral le
2 octobre 2026 :

- **la rétention zéro (ZDR) et le refus d'entraînement sont deux contrôles
  distincts.** La documentation de Mistral l'écrit : « ZDR and training opt-out
  are **separate controls** […] **You do not need ZDR to opt out of model
  training.** » La ZDR, elle, est bien réservée aux offres payantes — mais ce
  n'est pas ce que D-11 demandait ;
- en **mode gratuit**, les données sont utilisées par défaut, **et le refus est
  ouvert** : « You have the right to opt out of this program at any time » ;
- la procédure, pour l'API : panneau Admin → menu **Privacy** → section
  `Anonymous improvement data` → **désactiver la bascule**. Aucune mention de
  plan payant.

**La documentation du projet confondait les deux contrôles.** `AI_SECURITY.md`
renvoyait à la page « rétention zéro » pour parler du refus d'entraînement, ce
qui a fait naître un faux blocage. L'erreur est corrigée.

**Impact.**

- **D-11 n'est plus un point bloquant.** Le refus sera activé, gratuitement, et
  MarcoS pourra annoncer que les questions ne servent pas à l'entraînement.
- La décision de Marc **reste consignée** : elle décrit ce qu'on aurait fait si
  le refus avait été payant, et elle sert de position de repli si Mistral changeait
  ses conditions.
- **Deux variantes** de la mention de confidentialité sont préparées, FR et EN,
  dans [MARCOS_DECISIONS.md](MARCOS_DECISIONS.md#11-brouillons-de-la-mention-de-confidentialité-d-9) :
  « refus actif » et « usage possible ». Marc choisira selon le constat réel.
- **L'état honnête tant que la bascule n'est pas désactivée est « usage
  possible »**, pas « refus actif ». La variante ne se choisit pas sur une
  intention, elle se choisit sur un réglage effectivement appliqué.

**Réversibilité.** Totale, dans les deux sens : la bascule se réactive et se
désactive à tout moment dans le panneau Admin, et la mention de confidentialité
est un texte de `content/`, éditable au CMS.

**Ce qui reste à Marc.** Créer le compte Mistral, puis désactiver la bascule
`Anonymous improvement data` dans Admin → Privacy. Le pas à pas est dans
[AI_SECURITY.md](AI_SECURITY.md).

---

## 2026-10-02 — MarcoS : budget 0 €, un seul fournisseur, contexte minimal

Décisions de Marc, prises en une passe sur le
[dossier d'arbitrage](MARCOS_DECISIONS.md) · issues
[#23](https://github.com/marco-mancini/marckouassi.com/issues/23),
[#24](https://github.com/marco-mancini/marckouassi.com/issues/24),
[#25](https://github.com/marco-mancini/marckouassi.com/issues/25).

**Problème.** MarcoS était documenté mais vingt-et-une décisions le bloquaient :
source des données, hébergement, fournisseur de secours, données personnelles,
entrée dans l'interface, longueur des réponses, personne grammaticale, plafonds.
Chaque document du dossier `Docs/AI_*` en supposait certaines sans les avoir
tranchées, et deux documents se contredisaient ouvertement.

**Options.** Pour chacune des vingt-et-une, les options sont conservées en entier
dans [MARCOS_DECISIONS.md](MARCOS_DECISIONS.md), sections 3 à 6, avec la
conséquence de chaque branche et la recommandation motivée qui a été soumise.

**Choix.** Deux contraintes directrices, posées par Marc, qui **priment sur
toute recommandation** :

1. **Budget 0 €** — aucun compte payant, aucune carte bancaire, aucun
   abonnement. Une option qui coûte, même peu, est refusée au profit de sa
   variante gratuite ; sans variante gratuite, on signale au lieu de choisir.
2. **Verbosité minimale** — réponses de deux à trois phrases, contexte tenu au
   plus petit, comme critère de conception.

Deux recommandations ont été **refusées** à ce titre :

- **D-2, facturation Gemini → refusée. Pas de Gemini du tout.** Mistral seul,
  sur ses crédits gratuits. Quota atteint, MarcoS répond « indisponible ».
- **D-6, Workers Paid à 5 $/mois → refusée par principe.** Offre gratuite
  seulement ; si le binding Rate Limiting n'y est pas disponible, repli sur le
  budget journalier plafonné, sans payer.

Trois ont été **modifiées** : D-9 (Marc écrit les trois textes lui-même dans
`/admin/`), D-14 (profil personnel hors base pour l'instant), D-18 (plafond le
plus bas possible, aucun moyen de paiement enregistré).

**Motif.** Le budget 0 € n'est pas une économie de bout de chandelle : c'est ce
qui garantit que **MarcoS ne peut pas générer de facture**. Sans moyen de
paiement enregistré, le pire cas d'un abus est une indisponibilité de quelques
heures, jamais une dépense. La verbosité minimale, elle, sert la fonction : un
assistant de portfolio doit répondre court et renvoyer vers la page, pas tenir
un discours.

**Impact.**

- **Gemini disparaît du projet.** Matrice de repli, disjoncteur, secours, clé,
  coûts : retirés de `AI_ARCHITECTURE.md`, `AI_SECURITY.md`,
  `AI_IMPLEMENTATION_PLAN.md` et `MARCOS.md`. Une phase entière du plan
  (l'ancienne IA-07) est supprimée. Le contenu retiré reste dans l'historique
  Git ; ce journal garde le pourquoi.
- **Supabase n'est plus la source.** La base de connaissance est un fichier
  produit au build et publié avec le site. Il n'y a plus qu'**un seul secret
  dans tout le projet**, `MISTRAL_CLE`. #32 et #22 redeviennent indépendantes de
  MarcoS.
- **Contexte réduit de 39 %** : 6 555 → 3 966 jetons d'entrée, mesuré. Trois
  champs retirés de la liste blanche (`projets[].valeur`, `projets[].contexte`,
  `sections[parcours].etapes`, ce dernier étant un doublon de `cv.experience`),
  une seule langue par requête, prompt système réécrit court (698 → 396 jetons),
  historique ramené à 4 échanges et 2 000 caractères. `max_tokens` passe de 400
  à **180**.
- **Deux contradictions entre documents sont tranchées** : l'avatar
  (`AI_UX.md` écrivait « jamais », `MARCOS.md` le demandait → « pas en V1 »,
  prévu en V2) et la personne grammaticale (le prompt disait « troisième
  personne », les exemples de `MARCOS.md` écrivaient « mon travail » et
  tutoyaient → troisième personne et vouvoiement, exemples réécrits).
- **Deux contradictions supplémentaires ont été relevées et corrigées au
  passage** : `AI_UX.md` renvoyait les textes de MarcoS à l'éditeur de l'ancien
  back-office en sommeil au lieu du CMS en service, et `AI_ARCHITECTURE.md`
  décrivait la graphie du nom comme « N majuscule, é accentué, O majuscule » —
  un reste de l'ancien nom « NéO ».

**Réversibilité.** Variable selon les points.

- **Totale** : D-1, D-12, D-15, D-16, D-17, et les plafonds de D-18 — ce sont
  des réglages ou des textes.
- **Peu coûteuse** : #23, revenir à Supabase demanderait une variable
  (`SOURCE_CONTEXTE`) et une clé, la liste blanche étant la même ; #24, basculer
  sur une route du domaine ne change pas une ligne de code.
- **Coûteuse** : D-2. Réintroduire un second fournisseur demanderait de récrire
  la matrice de repli et le disjoncteur retirés. C'est le prix assumé de la
  simplification.
- **Suspendue à un fait extérieur** : **D-11**. Si le refus d'usage des données
  pour l'entraînement exige une formule payante chez Mistral, il entre en
  conflit direct avec le budget 0 €. Marc a posé ce point comme **bloquant** :
  rien ne sera mis en ligne avant qu'il ait répondu.

**Ce que cette décision n'autorise pas.** L'implémentation. Elle reste une
décision distincte, que Marc n'a pas donnée.

---

## 2026-10-02 — Ne pas utiliser le dépôt local `PORTOFOLIO_MARCO_KITTL`

Décision technique de l'agent, consignée pendant le nettoyage de la roadmap.

**Problème.** `~/ICONE_SOLUTION/PORTOFOLIO_MARCO_KITTL` contient bien tous les
fichiers du projet, mais **aucune commande Git n'y fonctionne** :

```
$ git status
fatal: not a git repository:
  /Users/mantchini/ICONE_SOLUTION/PORTOFOLIO_MARCO/.git/worktrees/PORTOFOLIO_MARCO_KITTL
```

C'est un *worktree* orphelin : son `.git` est un simple fichier qui renvoie au
dépôt parent `~/ICONE_SOLUTION/PORTOFOLIO_MARCO`, **lequel n'existe plus**. Le
dossier ressemble donc à un dépôt sain et n'en est pas un.

**Ce que cela avait déjà coûté.** C'est la cause réelle de l'échec attribué au
proxy dans l'inventaire des branches : « le proxy de la session refuse la
création d'étiquettes sur GitHub (HTTP 403) » (PM-012, #12). Le proxy n'y était
pour rien — c'est `git tag` qui ne pouvait pas tourner. Depuis un clone sain,
les 8 étiquettes sont passées du premier coup. Un diagnostic faux a laissé une
tâche ouverte une journée entière.

**Options.**

1. Réparer le *worktree* en recréant le dépôt parent.
2. Cloner le dépôt à neuf ailleurs et ne plus toucher au dossier orphelin.
3. Supprimer le dossier orphelin.

**Choix.** Option 2. Le travail se fait désormais dans
`~/ICONE_SOLUTION/marckouassi.com`, clone sain de
`https://github.com/marco-mancini/marckouassi.com.git`.

**Motif.** Réparer un *worktree* dont le parent a disparu demande de
reconstruire un dépôt dont on ne connaît plus l'état : on ne peut pas prouver
que le résultat est sûr, ce qui est exactement le cas d'arrêt d'AGENTS.md §4.4.
Un clone, lui, est vérifiable en une commande. L'option 3 est écartée : rien
n'est supprimé, et le dossier peut contenir du travail qu'aucune commande Git
ne permet aujourd'hui de comparer au distant.

**Impact.**

- Le dossier orphelin est **laissé intact** et ne doit plus servir. Avant de
  travailler, vérifier d'être dans un vrai dépôt : `git rev-parse --git-dir`
  doit répondre sans erreur.
- Deux copies du projet coexistent donc sur le poste. C'est voulu.
- Toute mesure Git — SHA, branches, étiquettes, `git ls-remote` — n'a de sens
  que depuis le clone.

**Réversibilité.** Totale : le clone se refait à tout moment, et rien n'a été
retiré du dossier orphelin.

---

## 2026-10-02 — Le commit `d062143`, poussé directement sur `main`, est conservé tel quel

Constat de l'agent, pas une décision de méthode. Lié à [#27](https://github.com/marco-mancini/marckouassi.com/issues/27) (PM-027).

**Problème.** Le commit `d062143` « Sauvegarde locale des images avant
synchronisation » (2 octobre 2026, 11:22 UTC) a été poussé **directement sur
`main`** : sans branche, sans pull request, sans issue. AGENTS.md §5.5 l'interdit
(« Aucun push direct sur `main` ») et `main` est la production. Il modifie
24 fichiers de `Public/images/`, en remplaçant des originaux par des versions
compressées.

Il a un second effet, celui-là mesuré : **le dépôt est passé de 324,86 à
413,78 Mio**, soit **+88,9 Mio en un jour** (`git count-objects -vH` sur un
clone neuf).

**Pourquoi le poids monte au lieu de baisser.** Remplacer un fichier
n'en supprime pas l'ancien : les 24 blobs d'origine restent dans l'historique,
et les 24 nouveaux s'y ajoutent. Les images affichées sont plus légères, le
dépôt est plus lourd. C'est exactement l'avertissement déjà écrit dans PM-027 :
« remplacer un original **ajoute** un fichier, l'ancien reste dans
l'historique ; le dépôt ne maigrit qu'avec une réécriture d'historique ».

Le gain sur le **site publié** est nul : le build compresse déjà les médias
(WebP, 1600 px au plus). Le poids du site reste de 9 Mo.

**Options.**

1. Conserver le commit tel quel.
2. Annuler le commit (`git revert`) pour revenir aux originaux.
3. Réécrire l'historique pour purger les anciens blobs, et `push --force`.

**Choix.** Option 1 : **le commit est conservé, rien n'est touché.**

**Motif.** Le commit est de Marc et son contenu peut être volontaire. L'annuler
reviendrait à défaire son travail sans son accord. L'option 3 est hors de
portée d'un agent : une réécriture d'historique avec `push --force` sur la
branche de production demande une autorisation explicite, et AGENTS.md §4.4 en
fait un cas d'arrêt.

**Impact.**

- `main` conserve un commit contraire à §5.5. Il est signalé, pas effacé.
- PM-027 (#27) reste ouverte et à Marc, avec deux questions désormais chiffrées :
  garder 413,78 Mio, ou réécrire l'historique ; et laisser ou purger
  `Design_System/assets/Cv_Marc.pdf`, toujours présent aux commits `7e0b8a4`
  (ajout) et `eb837ee` (retrait).
- La mesure est consignée en commentaire de #27 pour ne pas vivre seulement ici.

**Réversibilité.** Le constat n'engage rien. Les deux décisions de fond
appartiennent à Marc, et la purge d'historique reste possible à tout moment —
elle demande son accord écrit.

---

## 2026-10-02 — Adresse officielle : marckouassi-com.vercel.app

Décision de Marc · issue [#75](https://github.com/marco-mancini/marckouassi.com/issues/75) · suspend [#9](https://github.com/marco-mancini/marckouassi.com/issues/9) (PM-009).

**Problème.** Le site était en attente d'un domaine propre, `marckouassi.com`, jamais acheté (NXDOMAIN). Tant que la question restait ouverte, les documents et les plans (MarcoS, CORS, DNS) supposaient tantôt l'une, tantôt l'autre adresse.

**Options.**

1. Acheter `marckouassi.com` maintenant (PM-009).
2. Garder l'adresse Vercel jusqu'à nouvel ordre, et suspendre l'achat.

**Choix.** Option 2 : `https://marckouassi-com.vercel.app/` est l'adresse officielle du site jusqu'à nouvel ordre de Marc. PM-009 est **suspendue, pas abandonnée**.

**Motif.** Décision de Marc : l'adresse Vercel est en ligne et suffit pour l'instant. L'achat du domaine reste une option ouverte, à son initiative.

**Impact.**

- `content/site.json` (`url`) porte déjà cette adresse. Canonical, `og:url`, `hreflang`, plan du site et `robots.txt` en sont dérivés. Aucun changement de code.
- La documentation qui supposait `marckouassi.com` est alignée : [HEBERGEMENT.md](HEBERGEMENT.md), [DEPLOY_ETAT.md](DEPLOY_ETAT.md), [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md), [AI_SECURITY.md](AI_SECURITY.md), [AI_IMPLEMENTATION_PLAN.md](AI_IMPLEMENTATION_PLAN.md).
- Les documents du back-office en sommeil (`Deploy/README.md`, `supabase/`) ne sont pas modifiés. Ils décrivent un état abandonné (voir [ADMIN_EN_SOMMEIL.md](ADMIN_EN_SOMMEIL.md)).
- L'hébergement de l'endpoint de MarcoS reste à trancher par Marc : [#24](https://github.com/marco-mancini/marckouassi.com/issues/24) (PM-024). Sans domaine propre, l'option « même origine » (route `/api/*`) n'est pas disponible.

**Réversibilité.** Totale. À l'achat d'un domaine :

1. changer `url` dans `content/site.json` ;
2. ajouter le domaine dans Vercel (Settings → Domains) ;
3. vérifier le site sur la nouvelle adresse.

Aucun autre fichier de code ou de contenu ne porte l'adresse publique (vérifié le 2 octobre 2026 dans `tools/`, `tests/`, `Design_System/`, `Frontend/`, `content/` et `.github/`). Seuls des documents la citent, pour information.

---

## 2026-10-03 — Autorisation de traiter les demandes MarcoS PM-109 à PM-114

Instruction explicite de Marc dans cette conversation.

**Problème.** Le plan disait que l'implémentation MarcoS n'était pas autorisée,
alors que les demandes GPT liées à la qualification, au brief, aux propositions
créatives, à l'email et au plan d'implémentation doivent maintenant être
appliquées.

**Choix.** Traiter PM-109 à PM-114 dans l'ordre de leurs dépendances, une issue
à la fois, jusqu'à leur réalisation et validation. Les issues existantes font
foi ; ne pas créer de doublons.

**Motif.** Marc a demandé que les deux conversations soient réalisées à 100 %
et que le travail GPT commence après la clôture complète du volet Mistral.

**Impact.** Cette autorisation ne lève aucune contrainte de sécurité, de coût,
de confidentialité, d'architecture ou de protection de `main`. Les intégrations
requérant un compte, une clé ou un envoi réel restent soumises aux prérequis
gratuits et au contrat d'email documenté.

**Réversibilité.** L'autorisation porte sur le travail demandé ; toute décision
produit nouvelle hors du périmètre PM-109 à PM-114 reste à Marc.
