# Inventaire des branches

Établi le 1er octobre 2026 à partir de `main` au commit `cec4810`, mis à jour
le 2 octobre 2026 à partir de `main` au commit `f9ba1d0` (PM-054, #54), puis
**entièrement relevé le 2 octobre 2026 à partir de `main` au commit
`575fe38`** : l'inventaire précédent s'arrêtait à `pm-053` et ignorait
14 branches distantes.

Complété le 3 octobre 2026 à partir de `main` au commit `e5dc812` : 31
branches apparues depuis (phases de MarcoS du 2 octobre au soir, branches
`docs/*`, sauvegardes et branches de synchronisation du 3 octobre).

Cet instantané de 68 branches a été vérifié après `git fetch origin` et avant
la création de la branche `pm-115-index-inventaire`. Cette branche de travail
ajoute ensuite une 69e référence distante ; elle n'est pas dans le périmètre
temporel du tableau et aucune branche n'est supprimée.

Aucune branche n'a été supprimée. Toute suppression reste une décision de Marc
(PM-013, #13).

## Comment lire ce tableau

**« Commits absents de `main` »** est un décompte de `git rev-list --count
origin/main..origin/<branche>`. À 0, le dernier commit de la branche fait
partie de l'historique de `main` : la supprimer ne ferait perdre aucun commit.

**Attention au piège du *squash*.** Un décompte supérieur à 0 ne veut PAS dire
que le travail n'est pas dans `main` : une pull request fusionnée en *squash*
remplace les commits de la branche par un seul, et les originaux restent donc
« absents ». C'est le cas de `marco-mancini-patch-1` (voir plus bas). La
question « le contenu est-il dans `main` ? » se tranche en comparant les
arbres, pas en comptant les commits.

**« Étiquette d'archive »** : `archive/<branche>`, posée le 2 octobre 2026 par
PM-012 (#12). Les 8 branches obsolètes en ont une ; une branche supprimée se
recrée depuis la sienne.

## Branches distantes au 3 octobre 2026 — 68

| Branche | Dernier commit | Date | Commits absents de `main` | Étiquette d'archive | Proposition |
|---|---|---|---|---|---|
| `main` | `e5dc812` | 3 oct. | — | — | branche de production |
| `marco-mancini-patch-1` | `253aa0f` | 23 sept. | **15** | aucune | **conserver** (décision de Marc) ; contenu déjà dans `main` par *squash*, voir plus bas |
| `pm-05-index-issues` | `1225506` | 1er oct. | **1** | aucune | PR #36 **fermée sans fusion** ; ancienne numérotation PM, remplacée par l'index de `main` |
| `pm-008-index-issues` | `c98110c` | 1er oct. | **1** | aucune | PR #37 **fermée sans fusion** ; son index a été repris puis complété sur `main` (PR #41) |
| `design/olive-editorial-identity` | `3276af7` | 24 sept. | 0 | `archive/design/olive-editorial-identity` | fusionnée (PR #2) ; supprimable |
| `refonte/editorial-final` | `d5407b9` | 29 sept. | 0 | `archive/refonte/editorial-final` | supprimable |
| `refonte/editorial-final-v2` | `71cfb9d` | 29 sept. | 0 | `archive/refonte/editorial-final-v2` | supprimable ; ancienne référence de `npm run comparer-reference`, remplacée par `9d51394` puis `e8b729c` (voir plus bas) |
| `refonte/kittl` | `3a6a903` | 29 sept. | 0 | `archive/refonte/kittl` | fusionnée (PR #3) ; supprimable |
| `refonte/storytelling-01-04` | `1d44c40` | 29 sept. | 0 | `archive/refonte/storytelling-01-04` | supprimable |
| `refonte/storytelling-01-04-v2` | `440cd35` | 29 sept. | 0 | `archive/refonte/storytelling-01-04-v2` | supprimable |
| `refonte/storytelling-01-07` | `b1e2655` | 29 sept. | 0 | `archive/refonte/storytelling-01-07` | supprimable |
| `version-finale/portfolio-bo` | `f4cdf80` | 1er oct. | 0 | `archive/version-finale/portfolio-bo` | supprimable |
| `pm-017-images-fragiles` | `a2768ba` | 1er oct. | 0 | — | fusionnée (PR #44) ; supprimable |
| `pm-020-jetons-14px` | `07b2752` | 1er oct. | 0 | — | fusionnée (PR #47) ; supprimable |
| `pm-033-content-checklist` | `6fdd715` | 1er oct. | 0 | — | fusionnée (PR #42) ; supprimable |
| `pm-038-agents-md` | `cdfb5a1` | 1er oct. | 0 | — | fusionnée (PR #39) ; supprimable |
| `pm-039-index-issues` | `8d656b0` | 1er oct. | 0 | — | fusionnée (PR #41) ; supprimable |
| `pm-042-index-issues` | `c848039` | 1er oct. | 0 | — | fusionnée (PR #43) ; supprimable |
| `pm-045-jetons-valeurs-restantes` | `c71881e` | 2 oct. | 0 | — | fusionnée (PR #51) ; supprimable |
| `pm-046-reference` | `1aca7ac` | 2 oct. | 0 | — | fusionnée (PR #48) ; supprimable |
| `pm-048-marcos-documentation` | `34c6ded` | 2 oct. | 0 | — | fusionnée (PR #50) ; supprimable |
| `pm-052-couleurs-brutes` | `94bd2b0` | 2 oct. | 0 | — | fusionnée (PR #55) ; supprimable |
| `pm-053-dette-technique` | `7748a3c` | 2 oct. | 0 | — | fusionnée (PR #56) ; supprimable |
| `pm-054-inventaire-branches` | `c22174c` | 2 oct. | 0 | — | fusionnée (PR #57) ; supprimable |
| `pm-058-jetons-design-system` | `b0a4675` | 2 oct. | 0 | — | fusionnée (PR #59) ; supprimable |
| `pm-062-traduction-sections` | `44bb913` | 2 oct. | 0 | — | fusionnée (PR #67) ; supprimable |
| `pm-063-traduction-projets` | `2675c71` | 2 oct. | 0 | — | fusionnée (PR #68) ; supprimable |
| `pm-064-traduction-cv` | `ba34ff7` | 2 oct. | 0 | — | fusionnée (PR #69) ; supprimable |
| `pm-065-traduction-interface` | `d571bb2` | 2 oct. | 0 | — | fusionnée (PR #70) ; supprimable |
| `pm-066-traduction-seo` | `d073cfe` | 2 oct. | 0 | — | fusionnée (PR #71) ; supprimable |
| `pm-073-guillemets-en` | `59b63b5` | 2 oct. | 0 | — | fusionnée (PR #80) ; supprimable |
| `pm-074-cible-langue` | `ce348a6` | 2 oct. | 0 | — | fusionnée (PR #79) ; supprimable |
| `pm-075-domaine-officiel` | `4d19c9a` | 2 oct. | 0 | — | fusionnée (PR #77) ; supprimable |
| `pm-076-marcos-avatar` | `203a899` | 2 oct. | 0 | — | fusionnée (PR #78) ; supprimable |
| `pm-081-etat-fin-session` | `ab63e39` | 2 oct. | 0 | — | fusionnée (PR #82) ; supprimable |
| `nettoyage/index-issues` | `807d673` | 2 oct. | 0 | — | fusionnée (PR #83) ; supprimable |
| `pm-019-jetons-motion` | `b96c9cc` | 2 oct. | 0 | — | fusionnée (PR #84) ; supprimable |
| `pm-091-d11-refus-entrainement` | `a51ef18` | 2 oct. | 0 | — | fusionnée (PR #92) ; supprimable |
| `pm-093-ia01-connaissance` | `dd22062` | 2 oct. | 0 | — | fusionnée (PR #94) ; supprimable |
| `pm-095-ia02-worker` | `adf8057` | 2 oct. | 0 | — | fusionnée (PR #96) ; supprimable |
| `pm-097-portrait-detoure` | `56c7b4a` | 2 oct. | 0 | — | fusionnée (PR #98) ; supprimable |
| `pm-100-reference-portrait` | `89ac3d4` | 2 oct. | 0 | — | fusionnée (PR #101) ; supprimable |
| `pm-102-ia03-prompt` | `96cc49e` | 2 oct. | 0 | — | fusionnée (PR #103) ; supprimable |
| `pm-106-portrait-sans-cadre` | `c00f9db` | 2 oct. | **1** | — | fusionnée (PR #107, *squash*) ; supprimable — piège du *squash* : le travail est dans `main` |
| `pm-108-reference-comparaison` | `1a177a9` | 2 oct. | **1** | — | fusionnée (PR #109, *squash*) ; supprimable — piège du *squash* : le travail est dans `main` |
| `docs/cms-eprouve` | `9f9359e` | 2 oct. | 0 | — | dernier commit dans `main` ; supprimable |
| `docs/inventaire-branches` | `4d4eaaa` | 2 oct. | 0 | — | dernier commit dans `main` ; supprimable |
| `docs/journal-decisions` | `b3b68f4` | 2 oct. | 0 | — | dernier commit dans `main` ; supprimable |
| `docs/marcos-decisions-marc` | `f143088` | 2 oct. | 0 | — | dernier commit dans `main` ; supprimable |
| `docs/marcos-dossier-arbitrage` | `aeecbf8` | 2 oct. | 0 | — | dernier commit dans `main` ; supprimable |
| `docs/marcos-dossier-maj` | `7f592b0` | 2 oct. | 0 | — | dernier commit dans `main` ; supprimable |
| `docs/marcos-sync-comportement-20261003` (+ `-v2` à `-v15`) | `88db762` | 2 oct. | 0 | — | 15 branches créées le 3 octobre, aucun commit propre ; supprimables |
| `sauvegarde-complete-20261003-000540` | `b167a5d` | 3 oct. | **3** | — | sauvegarde locale du 3 octobre, 00:05 ; décision de Marc |
| `sauvegarde-docs-marcos-20261003` | `59a832a` | 3 oct. | **8** | — | porte la PR #110 (ouverte) ; à trancher avec elle |

La ligne `docs/marcos-sync-comportement-20261003` regroupe 15 branches
distinctes — la racine et `-v2` à `-v15` —, toutes au même commit `88db762`,
déjà dans l'historique de `main` : aucun commit propre, rien à perdre. Elles
comptent pour quinze dans le total de 68.

La branche `docs/inventaire-branches`, qui portait la relève du 2 octobre,
est désormais dans le tableau : son dernier commit est dans l'historique de
`main`.

La branche `claude/bonjour-zogd1l` (`0c40d58`) a disparu de GitHub le
1er octobre 2026, avant le premier inventaire ; son dernier commit est dans
l'historique de `main`.

## `marco-mancini-patch-1` — correction du 2 octobre 2026

**L'inventaire précédent écrivait « Pull request n° 1, fermée sans fusion ».
C'est faux.** Vérifié sur GitHub et dans l'historique :

- la PR #1 a été **fusionnée** le 23 septembre 2026 à 12:23 UTC ;
- elle l'a été **en *squash*** : son commit de fusion `7eb7e9a` (« Polish
  portfolio design system and responsive homepage ») n'a **qu'un seul parent**,
  et non deux ;
- l'arbre de `7eb7e9a` est **identique** à celui du sommet de la branche
  `253aa0f` — même empreinte `2dec5bd`, `git diff 253aa0f 7eb7e9a` est vide.

Autrement dit : **le contenu de cette branche est dans `main`, à l'octet.**
Les 15 commits comptés « absents » sont les commits d'origine, remplacés par
le *squash* ; ce n'est pas du travail perdu.

Conséquence pour PM-013 (#13) : supprimer cette branche ne ferait perdre
**aucun contenu**, seulement l'historique détaillé des 15 étapes. Marc a
décidé de la conserver, elle reste donc telle quelle et **sans étiquette
d'archive** : PM-012 ne portait que sur les 8 branches obsolètes. Si cette
décision changeait, poser l'étiquette **avant** la suppression :

```sh
git tag -a archive/marco-mancini-patch-1 origin/marco-mancini-patch-1 \
  -m "Archive de la branche marco-mancini-patch-1, contenu dans main par squash (7eb7e9a)"
git push origin archive/marco-mancini-patch-1
```

Ses 15 commits datent de l'ancienne architecture : ils modifient `AGENTS.md`,
`README.md`, `Design_System/styles/` (Layout, Responsive, Theme, Tokens,
Typography) et `Frontend/index.html`, un fichier qui n'existe plus sur `main`.

## `refonte/editorial-final-v2` et la comparaison visuelle

`tools/comparer-reference.mjs` reconstruit un commit avec `git archive` : il
lit le commit, pas la branche. **Toute référence passée reste comparable** en
la donnant en argument — c'est ce qui rend un changement de référence
vérifiable au lieu d'être un effacement.

| Référence | Depuis | Pourquoi la précédente a été remplacée |
|---|---|---|
| `71cfb9d` | origine | sur `refonte/editorial-final-v2` |
| `9d51394` | PM-046 (#46) | 14 écarts, tous dus à trois changements de contenu validés |
| `e8b729c` | PM-100 (#100) | portrait détouré (PM-097) : le ratio passe de 0,563 à 0,623, la section « À propos » perd 56 px à 1024 et 79 px à 1440 |

| **`f48646f`** | **PM-108 (#108)** | portrait sans cadre posé sur le bord bas du vert (PM-106) : tête alignée sur « Bonjour », `--apropos-espace` de `clamp(24px, 4vw, 60px)` à `clamp(20px, 2vw, 32px)` |

Chacune se rejoue : `npm run comparer-reference -- 9d51394` rend aujourd'hui
les mêmes 4 écarts, à l'identique. Supprimer une branche ne casse pas la
comparaison tant que le commit reste accessible, ce qui est le cas puisqu'il
est dans l'historique de `main` — et désormais aussi par l'étiquette
`archive/refonte/editorial-final-v2`.

## Étiquettes d'archive — posées le 2 octobre 2026

PM-012 (#12) est **réglée**. Les 8 étiquettes annotées sont sur le distant,
chacune relue par `git ls-remote --tags origin 'archive/*'` et chacune sur le
SHA attendu. Avant de poser chaque étiquette, l'appartenance à `main` a été
vérifiée par `git merge-base --is-ancestor origin/<branche> origin/main` :
8/8.

| Étiquette | Commit visé |
|---|---|
| `archive/design/olive-editorial-identity` | `3276af7` |
| `archive/refonte/editorial-final` | `d5407b9` |
| `archive/refonte/editorial-final-v2` | `71cfb9d` |
| `archive/refonte/kittl` | `3a6a903` |
| `archive/refonte/storytelling-01-04` | `1d44c40` |
| `archive/refonte/storytelling-01-04-v2` | `440cd35` |
| `archive/refonte/storytelling-01-07` | `b1e2655` |
| `archive/version-finale/portfolio-bo` | `f4cdf80` |

L'obstacle noté dans l'inventaire précédent — « le proxy de la session refuse
la création d'étiquettes sur GitHub (HTTP 403) » — n'était pas le proxy : le
dépôt local de cette session-là était un *worktree* dont le dépôt parent avait
disparu, et aucune commande Git n'y fonctionnait (voir
[DECISIONS.md](DECISIONS.md)). Depuis un clone sain, `git push origin --tags`
passe sans difficulté.

## Suppression — reste à Marc (PM-013, #13)

Supprimer une branche, une par une, après confirmation :

```sh
git push origin --delete <branche>
```

Une branche supprimée se recrée depuis son étiquette :

```sh
git push origin archive/<branche>^{commit}:refs/heads/<branche>
```

Les branches `pm-NNN-…` fusionnées n'ont pas d'étiquette d'archive et n'en ont
pas besoin : leur dernier commit est dans l'historique de `main`, leur
suppression ne ferait rien perdre.
