# Journal des sessions

Ce fichier contient un **instantané par fin de session**, écrit à la main au moment de la clôture.

- **Ce n'est pas une source de vérité.** L'état réel du projet est dans les issues GitHub ([ISSUES.md](ISSUES.md)), et le pourquoi des décisions est dans [DECISIONS.md](DECISIONS.md).
- Un instantané décrit le dépôt au SHA indiqué. Il n'est jamais mis à jour ensuite : la session suivante ajoute le sien au-dessus.

---

## 2 octobre 2026 — fin de session (issue [#81](https://github.com/marco-mancini/marckouassi.com/issues/81))

### Point de référence

- **`main` au début de cette clôture : `2fc62ada8234f3d385ccc87877606c00e57a690e`** (fusion de la PR #80). SHA distant et SHA local identiques.
- La PR qui ajoute ce fichier fait avancer `main` d'un commit de fusion. Son SHA est donné dans la PR #82 et dans le rapport de clôture.
- **Déploiement Vercel de production :** en succès sur `2fc62ad` (déploiement 6805333838, 2 octobre 2026 à 09:23:37 UTC).
- **Site en production :** NON TESTÉ depuis cet environnement (le proxy refuse `marckouassi-com.vercel.app`).

### Sauvegarde vérifiée

| Contrôle | Résultat |
|---|---|
| `git status` sur `main` | « nothing to commit, working tree clean » |
| `git stash list` | vide |
| Branches locales | toutes identiques à leur branche distante, sauf deux :<br>• `claude/bonjour-zogd1l` n'existe pas sur le distant, mais son dernier commit (`0c40d58`) fait partie de `main` : aucun commit n'est en jeu ;<br>• `version-finale/portfolio-bo` est en retard sur le distant : rien à pousser |
| PR ouvertes | 0 |
| Branches distantes avec des commits absents de `main` | 3, toutes documentées dans [BRANCHES.md](BRANCHES.md) :<br>• `marco-mancini-patch-1` (15 commits) : à conserver, décision de Marc ;<br>• `pm-05-index-issues` (1 commit) : PR #36 fermée sans fusion ;<br>• `pm-008-index-issues` (1 commit) : PR #37 fermée sans fusion |
| Branches de la session (`pm-058` à `pm-076`) | 0 commit absent de `main` : entièrement fusionnées, conservées (aucune suppression) |
| Index des issues comparé à GitHub | 0 écart |
| Worktree temporaire | aucun |

### Issues fermées pendant la session (24)

| Thème | Issues |
|---|---|
| Méthode et index | PM-008 (#8), PM-034 (#34), PM-035 (#35), PM-038 (#38, AGENTS.md) |
| Documentation | PM-033 (#33), PM-053 (#53), PM-054 (#54) |
| Images | PM-017 (#17) |
| Jetons du Design System | PM-020 (#20), PM-045 (#45), PM-052 (#52), PM-058 (#58) |
| Référence de comparaison | PM-046 (#46) |
| Version anglaise | PM-060 (#60, diagnostic), PM-062 à PM-066 (#62 à #66, 5 lots, 296 champs), PM-072 (#72, diagnostic du toggle), PM-073 (#73, guillemets) |
| Accessibilité | PM-074 (#74, zone cliquable du sélecteur de langue) |
| Domaine | PM-075 (#75, adresse officielle) |
| MarcoS | PM-076 (#76, spécification de l'avatar) |

La présente issue, PM-081 (#81), se ferme avec la PR qui ajoute ce fichier.

### Issues ouvertes restantes (29)

- **27 portent l'étiquette `decision-marc`**, elles relèvent de Marc seul : PM-004, 005, 006, 007, 009, 010, 011, 012, 013, 014, 015, 016, 018, 019, 023, 024, 025, 026, 027, 028, 029, 030, 031, 032, 040, 049, 061.
- **2 sans `decision-marc`, toutes deux conditionnelles :**
  - PM-021 (#21, durée d'installation de Chromium) : à ouvrir seulement si la lenteur devient la règle (3 runs sur les 10 derniers au-dessus de 3 minutes) ;
  - PM-022 (#22, tests du back-office en sommeil) : dépend de la décision de Marc sur PM-032 (#32).

### Décisions prises pendant la session

**Décisions de Marc :**

| Date | Décision | Où elle est consignée |
|---|---|---|
| 1er oct. | Méthode : une issue, une branche `pm-0xx`, une PR, « Vérifier » vert, fusion ; aucun push direct sur `main` ; `git ls-remote` après chaque push | [AGENTS.md](../AGENTS.md) §5.5 et §5.6 |
| 2 oct. | Graphie obligatoire **MarcoS** ; NéO renommé MarcoS | [MARCOS.md](MARCOS.md) §1 |
| 2 oct. | Autonomie de l'agent, hors issues `decision-marc` ; aucune suppression | consigne de session |
| 2 oct. | Autorisation exceptionnelle d'écrire dans `content/`, uniquement dans les champs `en` | consigne de session ; respectée : français identique à l'octet |
| 2 oct. | `https://marckouassi-com.vercel.app/` adresse officielle ; achat du domaine (PM-009) suspendu | [DECISIONS.md](DECISIONS.md) |

**Décisions techniques de l'agent, réversibles :**

| Décision | Où elle est consignée |
|---|---|
| Anglais américain ; intitulés de postes, noms propres, Icône Solution et MarcoS non traduits ; guillemets “…” | [GLOSSAIRE_EN.md](GLOSSAIRE_EN.md) |
| Référence de comparaison visuelle fixée à `9d51394` | PM-046 |
| Zone cliquable de 44 × 44 du sélecteur de langue obtenue par un pseudo-élément, sans changer le dessin | `Design_System/composants/Segments/Segments.md` |
| Format proposé pour l'avatar : séquences PNG assemblées en planches WebP. **Provisoire** jusqu'à validation par Marc | [MARCOS_AVATAR.md](MARCOS_AVATAR.md) |
| Création du journal des décisions et de ce journal des sessions | [DECISIONS.md](DECISIONS.md), ce fichier |

### Points en attente de Marc

1. **Vérifier la version anglaise en production**, en rechargeant sans cache : `https://marckouassi-com.vercel.app/en/`. Cet environnement ne peut pas l'atteindre.
2. **Fermer PM-016 (#16) et PM-030 (#30)** si la traduction te convient : elles sont couvertes par les PR #67 à #71, mais portent `decision-marc`.
3. **Fautes du texte français** relevées pendant la traduction : PM-061 (#61).
4. **Avatar de MarcoS** (PM-049, #49) :
   - où stocker les masters (au regard de PM-027, #27) ;
   - taille d'affichage de la présence, entre 96 et 128 px CSS ;
   - validation du format proposé.
5. **Actions urgentes déjà ouvertes :**
   - jeton du CMS : PM-004 (#4), puis PM-005 (#5) ;
   - suppression des anciens déploiements Vercel qui contiennent le PDF du CV : PM-006 (#6).
6. **Branches :** étiquettes d'archive et suppression, PM-012 (#12) et PM-013 (#13). Les branches `pm-0xx` fusionnées pendant cette session s'ajoutent à la liste des branches supprimables sans perte.
7. **Domaine :** PM-009 (#9) suspendue jusqu'à nouvel ordre ; l'hébergement de l'endpoint de MarcoS en dépend (PM-024, #24).
