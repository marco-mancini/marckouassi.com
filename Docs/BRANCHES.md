# Inventaire des branches

Établi le 1er octobre 2026 à partir de `main` au commit `cec4810`. Aucune
branche n'a été supprimée. « Contenue dans `main` » signifie que le dernier
commit de la branche fait partie de l'historique de `main` : la supprimer ne
ferait perdre aucun commit.

| Branche | Dernier commit | Date | Commits absents de `main` | Proposition |
|---|---|---|---|---|
| `main` | `cec4810` | 1er oct. 2026 | — | branche de production |
| `marco-mancini-patch-1` | `253aa0f` | 23 sept. 2026 | **15** | **conserver** (décision de Marc) |
| `version-finale/portfolio-bo` | `f4cdf80` | 1er oct. 2026 | 0 | supprimable |
| `refonte/editorial-final-v2` | `71cfb9d` | 29 sept. 2026 | 0 | supprimable ; ancienne référence de `npm run comparer-reference`, remplacée par `9d51394` (voir plus bas) |
| `refonte/editorial-final` | `d5407b9` | 29 sept. 2026 | 0 | supprimable |
| `refonte/kittl` | `3a6a903` | 29 sept. 2026 | 0 | supprimable |
| `refonte/storytelling-01-04` | `1d44c40` | 29 sept. 2026 | 0 | supprimable |
| `refonte/storytelling-01-04-v2` | `440cd35` | 29 sept. 2026 | 0 | supprimable |
| `refonte/storytelling-01-07` | `b1e2655` | 29 sept. 2026 | 0 | supprimable |
| `design/olive-editorial-identity` | `3276af7` | 24 sept. 2026 | 0 | supprimable |

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
