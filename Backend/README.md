# Partie serveur

Le portfolio publié reste un site statique : il n'appelle aucun serveur à
l'affichage. La seule partie serveur est celle du back-office, hébergée
chez Supabase et décrite dans le dossier [`supabase/`](../supabase) :

- `migrations/` : tables du brouillon, des publications et des médias,
  règles d'accès (administrateurs uniquement), seau de stockage ;
- `functions/publier/` : l'Edge Function qui fige une publication et
  déclenche la construction du site.

Mise en service : [Deploy/README.md](../Deploy/README.md).
