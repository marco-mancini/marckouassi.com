# Partie serveur

> **Ce dossier est EN SOMMEIL.** Il décrit la partie serveur de l'ancien
> back-office Supabase, qui n'est ni branchée ni utilisée. Lire
> [`Docs/ADMIN_EN_SOMMEIL.md`](../Docs/ADMIN_EN_SOMMEIL.md) avant toute
> intervention.

Le portfolio publié est un site statique : son affichage n'appelle aucun
serveur. **La seule partie serveur active du projet est ailleurs** : le Worker
Cloudflare de MarcoS, dans [`worker/assistant/`](../worker/assistant), décrit
par [`Docs/AI_ARCHITECTURE.md`](../Docs/AI_ARCHITECTURE.md). Il n'est sollicité
que si un visiteur ouvre l'assistant.

La partie serveur décrite ci-dessous est celle du back-office endormi, hébergée
chez Supabase et décrite dans le dossier [`supabase/`](../supabase) :

- `migrations/` : tables du brouillon, des publications et des médias,
  règles d'accès (administrateurs uniquement), seau de stockage ;
- `functions/publier/` : l'Edge Function qui fige une publication et
  déclenche la construction du site.

Mise en service : [Deploy/README.md](../Deploy/README.md).
