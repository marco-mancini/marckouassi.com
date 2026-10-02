# Hébergement : choix de Vercel Hobby

## Décision

**Le 1er octobre 2026, Marc choisit de rester sur l'offre gratuite Vercel
Hobby, en connaissance de cause, et d'en assumer le risque.** La section
Prestations du site n'est pas modifiée.

## Adresse officielle

**Le 2 octobre 2026, Marc décide que `https://marckouassi-com.vercel.app/`
reste l'adresse officielle du site jusqu'à nouvel ordre.** L'achat du domaine
`marckouassi.com` (PM-009, [#9](https://github.com/marco-mancini/marckouassi.com/issues/9))
est **suspendu, pas abandonné**. Motif et impact :
[DECISIONS.md](DECISIONS.md#2026-10-02--adresse-officielle--marckouassi-comvercelapp).

L'adresse se lit à un seul endroit : `url` dans `content/site.json`.

## Le texte en cause (relevé le 1er octobre 2026)

Conditions d'utilisation de Vercel (https://vercel.com/legal/terms) :

> We offer a free Hobby plan at our sole discretion. You shall only use the
> Services under a Hobby plan for your personal or non-commercial use.

Règles d'usage équitable
(https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage) :

> Hobby teams are restricted to non-commercial personal use only. All
> commercial usage of the platform requires either a Pro or Enterprise plan.
>
> Commercial usage is defined as any Deployment that is used for the purpose
> of financial gain of anyone involved in any part of the production of the
> project, including a paid employee or consultant writing the code.

En cas de manquement, les conditions prévoient une résiliation avec dix
jours de préavis :

> Vercel may also terminate this Agreement upon ten (10) days' notice […] if
> you breach any of the terms or conditions of this Agreement.

## Ce qui pose question

- Les deux textes divergent : « personal **or** non-commercial » dans les
  conditions, « non-commercial personal use only » dans les règles d'usage.
- Le portfolio est personnel, mais la section Prestations annonce des
  prestations « Sur devis » : elle vise un gain financier.

## Les cinq options (pour y revenir vite si Vercel envoie une notification)

| Option | Coût | Ce qu'il faut faire | Remarque |
|---|---|---|---|
| a. Rester sur Hobby | 0 | rien | **choix actuel** ; risque : notification, puis résiliation sous 10 jours |
| b. Retirer ou reformuler la section Prestations | 0 | modifier `content/sections.json` (section `prestations`) | choix de contenu, à faire par Marc |
| c. Vercel Pro | 20 $/mois (page Pricing, 1er oct. 2026) | Vercel → Settings → Billing | aucun changement dans le dépôt |
| d. Cloudflare Pages, offre gratuite | 0 | créer un projet Pages relié au dépôt ; build `npm run build`, dossier `_site` | usage commercial affirmé sur le forum communautaire de Cloudflare ; texte officiel non trouvé |
| e. GitHub Pages | 0 | dépôt public, puis rétablir `pages.yml` (voir [RETIRES.md](RETIRES.md)) | exige un dépôt public sur un compte gratuit |

Dans tous les cas, l'adresse publique se change à un seul endroit :
`url` dans `content/site.json`. Pour d et e, l'adresse officielle changerait :
c'est une nouvelle décision de Marc, à inscrire au journal des décisions.

## Si Vercel envoie une notification

1. Lire le délai donné (dix jours d'après les conditions).
2. Choisir b, c, d ou e ci-dessus.
3. Pour d ou e : changer `url` dans `content/site.json`, vérifier le site sur
   la nouvelle adresse, puis seulement fermer le projet Vercel.
