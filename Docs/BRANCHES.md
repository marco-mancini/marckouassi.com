# Inventaire des branches

Établi le 1er octobre 2026 à partir de `main` au commit `cec4810`, mis à
jour le 2 octobre 2026 à partir de `main` au commit `f9ba1d0` (PM-054, #54).
Aucune branche n'a été supprimée : toute suppression reste une décision de
Marc (PM-012, PM-013). « Commits absents de `main` » à 0 signifie que le
dernier commit de la branche fait partie de l'historique de `main` : la
supprimer ne ferait perdre aucun commit.

| Branche | Dernier commit | Date | Commits absents de `main` | Proposition |
|---|---|---|---|---|
| `main` | `f9ba1d0` | 2 oct. 2026 | — | branche de production |
| `marco-mancini-patch-1` | `253aa0f` | 23 sept. 2026 | **15** | **conserver** (décision de Marc) |
| `version-finale/portfolio-bo` | `f4cdf80` | 1er oct. 2026 | 0 | supprimable |
| `refonte/editorial-final-v2` | `71cfb9d` | 29 sept. 2026 | 0 | supprimable ; ancienne référence de `npm run comparer-reference`, remplacée par `9d51394` (voir plus bas) |
| `refonte/editorial-final` | `d5407b9` | 29 sept. 2026 | 0 | supprimable |
| `refonte/kittl` | `3a6a903` | 29 sept. 2026 | 0 | supprimable |
| `refonte/storytelling-01-04` | `1d44c40` | 29 sept. 2026 | 0 | supprimable |
| `refonte/storytelling-01-04-v2` | `440cd35` | 29 sept. 2026 | 0 | supprimable |
| `refonte/storytelling-01-07` | `b1e2655` | 29 sept. 2026 | 0 | supprimable |
| `design/olive-editorial-identity` | `3276af7` | 24 sept. 2026 | 0 | supprimable |
| `pm-05-index-issues` | `1225506` | 1er oct. 2026 | **1** | PR #36 fermée sans fusion ; ancienne numérotation PM, remplacée par l'index de `main` |
| `pm-008-index-issues` | `c98110c` | 1er oct. 2026 | **1** | PR #37 fermée sans fusion ; son index a été repris puis complété sur `main` (PR #41) |
| `pm-033-content-checklist` | `6fdd715` | 1er oct. 2026 | 0 | fusionnée (PR #42) ; supprimable |
| `pm-038-agents-md` | `cdfb5a1` | 1er oct. 2026 | 0 | fusionnée (PR #39) ; suppression laissée à Marc |
| `pm-039-index-issues` | `8d656b0` | 1er oct. 2026 | 0 | fusionnée (PR #41) ; laissée à Marc |
| `pm-042-index-issues` | `c848039` | 1er oct. 2026 | 0 | fusionnée (PR #43) ; supprimable |
| `pm-017-images-fragiles` | `a2768ba` | 1er oct. 2026 | 0 | fusionnée (PR #44) ; supprimable |
| `pm-020-jetons-14px` | `07b2752` | 1er oct. 2026 | 0 | fusionnée (PR #47) ; supprimable |
| `pm-046-reference` | `1aca7ac` | 2 oct. 2026 | 0 | fusionnée (PR #48) ; supprimable |
| `pm-048-marcos-documentation` | `34c6ded` | 2 oct. 2026 | 0 | fusionnée (PR #50) ; supprimable |
| `pm-045-jetons-valeurs-restantes` | `c71881e` | 2 oct. 2026 | 0 | fusionnée (PR #51) ; supprimable |
| `pm-052-couleurs-brutes` | `94bd2b0` | 2 oct. 2026 | 0 | fusionnée (PR #55) ; supprimable |
| `pm-053-dette-technique` | `7748a3c` | 2 oct. 2026 | 0 | fusionnée (PR #56) ; supprimable |

La branche `pm-054-inventaire-branches`, qui porte cette mise à jour, n'est
pas dans le tableau : elle sera fusionnée par sa propre PR.

La branche `claude/bonjour-zogd1l` (`0c40d58`) a disparu de GitHub le
1er octobre 2026, avant cet inventaire ; son dernier commit est dans
l'historique de `main`.

## `marco-mancini-patch-1`

Pull request n° 1, fermée sans fusion. Ses 15 commits datent de l'ancienne
architecture : ils modifient `AGENTS.md`, `README.md`,
`Design_System/styles/` (Layout, Responsive, Theme, Tokens, Typography) et
`Frontend/index.html`, un fichier qui n'existe plus sur `main`. Conservée.

## `refonte/editorial-final-v2` et la comparaison visuelle

`tools/comparer-reference.mjs` reconstruit un commit avec `git archive` :
il lit le commit, pas la branche. Depuis PM-046 (#46), la référence par
défaut est `9d51394`, sur `main` ; `71cfb9d` reste comparable en le
passant en argument (`npm run comparer-reference -- 71cfb9d`). Supprimer
la branche ne casse pas la comparaison tant que le commit reste
accessible, ce qui est le cas puisqu'il est dans l'historique de `main`.

## Étiquettes d'archive

Les étiquettes n'ont pas pu être publiées depuis la session de travail : le
proxy de la session refuse la création d'étiquettes sur GitHub (HTTP 403).
Pour les poser depuis un poste où le dépôt est cloné, avant toute
suppression :

```sh
git fetch origin
for b in design/olive-editorial-identity refonte/editorial-final refonte/editorial-final-v2 \
         refonte/kittl refonte/storytelling-01-04 refonte/storytelling-01-04-v2 \
         refonte/storytelling-01-07 version-finale/portfolio-bo; do
  git tag -a "archive/$b" "origin/$b" -m "Archive de la branche $b, contenue dans main"
done
git push origin --tags
```

Supprimer ensuite une branche, une par une, après confirmation :
`git push origin --delete <branche>`. Une branche supprimée se recrée depuis
son étiquette : `git push origin archive/<branche>^{commit}:refs/heads/<branche>`.
