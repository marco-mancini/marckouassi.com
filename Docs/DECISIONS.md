# Journal des décisions

Ce journal garde le **pourquoi** des décisions (AGENTS.md §6.5). L'état de chaque tâche vit dans les issues GitHub ([ISSUES.md](ISSUES.md)), pas ici.

Règles :

- une entrée par décision, la plus récente en haut ;
- format : Problème · Options · Choix · Motif · Impact · Réversibilité ;
- une décision provisoire porte la mention **provisoire** ;
- une décision plus récente sur le même sujet remplace l'ancienne. L'ancienne reste dans le journal, marquée « remplacée par » ;
- le journal commence le 2 octobre 2026. Les décisions antérieures sont consignées dans leur document : [HEBERGEMENT.md](HEBERGEMENT.md) (Vercel Hobby, 1er octobre 2026), [ADMIN_EN_SOMMEIL.md](ADMIN_EN_SOMMEIL.md), [RETIRES.md](RETIRES.md).

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
