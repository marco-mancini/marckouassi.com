# Journal des décisions

Ce journal garde le **pourquoi** des décisions (AGENTS.md §6.5). L'état de chaque tâche vit dans les issues GitHub ([ISSUES.md](ISSUES.md)), pas ici.

Règles :

- une entrée par décision, la plus récente en haut ;
- format : Problème · Options · Choix · Motif · Impact · Réversibilité ;
- une décision provisoire porte la mention **provisoire** ;
- une décision plus récente sur le même sujet remplace l'ancienne. L'ancienne reste dans le journal, marquée « remplacée par » ;
- le journal commence le 2 octobre 2026. Les décisions antérieures sont consignées dans leur document : [HEBERGEMENT.md](HEBERGEMENT.md) (Vercel Hobby, 1er octobre 2026), [ADMIN_EN_SOMMEIL.md](ADMIN_EN_SOMMEIL.md), [RETIRES.md](RETIRES.md).

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
