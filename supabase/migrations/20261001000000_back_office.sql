-- =====================================================================
-- BACK-OFFICE DU PORTFOLIO
--   documents      : le brouillon (4 documents : site, sections, projets, cv)
--   publications   : instantanés publiés, lus par le build du site
--   medias         : inventaire des fichiers déposés
--   administrateurs: comptes autorisés (ajoutés à la main, voir Deploy/README.md)
--   seau « medias »: fichiers publics, écriture réservée aux administrateurs
--
-- Principe : la clé publique (côté navigateur et build) ne donne AUCUN
-- droit d'écriture. Tout passe par les règles ci-dessous ; la création
-- d'une publication passe par l'Edge Function « publier » (clé secrète,
-- côté serveur uniquement).
-- =====================================================================

-- Administrateurs ------------------------------------------------------
create table public.administrateurs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  ajoute_le timestamptz not null default now()
);
alter table public.administrateurs enable row level security;
create policy "administrateur : se voir" on public.administrateurs
  for select to authenticated using (user_id = (select auth.uid()));

create function public.est_admin() returns boolean
  language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.administrateurs where user_id = (select auth.uid()));
$$;
revoke execute on function public.est_admin() from public, anon;
grant execute on function public.est_admin() to authenticated;

-- Brouillon --------------------------------------------------------------
create table public.documents (
  cle text primary key check (cle in ('site', 'sections', 'projets', 'cv')),
  contenu jsonb not null,
  revision integer not null default 1 check (revision > 0),
  modifie_le timestamptz not null default now(),
  modifie_par uuid references auth.users (id) on delete set null
);
alter table public.documents enable row level security;
create policy "documents : lecture admin" on public.documents
  for select to authenticated using ((select public.est_admin()));
create policy "documents : création admin" on public.documents
  for insert to authenticated with check ((select public.est_admin()));
create policy "documents : modification admin" on public.documents
  for update to authenticated using ((select public.est_admin())) with check ((select public.est_admin()));

-- Horodatage et auteur posés par la base, jamais par le navigateur.
create function public.documents_horodater() returns trigger
  language plpgsql set search_path = ''
as $$
begin
  new.modifie_le := now();
  new.modifie_par := auth.uid();
  return new;
end;
$$;
create trigger documents_horodater before insert or update on public.documents
  for each row execute function public.documents_horodater();

-- Publications ----------------------------------------------------------
create table public.publications (
  id bigint generated always as identity primary key,
  version integer not null unique,
  instantane jsonb not null,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'en_ligne', 'echec', 'remplacee')),
  message text,
  cree_le timestamptz not null default now(),
  cree_par uuid references auth.users (id) on delete set null,
  termine_le timestamptz
);
create index publications_statut_version on public.publications (statut, version desc);
alter table public.publications enable row level security;
-- Le contenu publié (ou en cours de publication) est public par nature :
-- le build le lit avec la clé publique.
create policy "publications : lecture publique du publié" on public.publications
  for select to anon, authenticated using (statut in ('en_attente', 'en_ligne'));
create policy "publications : historique admin" on public.publications
  for select to authenticated using ((select public.est_admin()));
-- Aucune règle d'écriture : seule l'Edge Function (clé secrète) écrit.

-- Médias ------------------------------------------------------------------
create table public.medias (
  id uuid primary key default gen_random_uuid(),
  chemin text not null unique,
  nom_original text,
  type text,
  taille bigint,
  cree_le timestamptz not null default now(),
  cree_par uuid references auth.users (id) on delete set null default auth.uid()
);
alter table public.medias enable row level security;
create policy "medias : lecture admin" on public.medias
  for select to authenticated using ((select public.est_admin()));
create policy "medias : ajout admin" on public.medias
  for insert to authenticated with check ((select public.est_admin()));

-- Seau de stockage ------------------------------------------------------
-- Lecture publique (les fichiers sont publiés sur le site) ; SVG exclu
-- (il peut porter du script) ; 50 Mo au plus (limite de l'offre gratuite).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('medias', 'medias', true, 52428800,
        array['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'])
on conflict (id) do nothing;

create policy "medias : dépôt admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'medias' and (select public.est_admin()));
create policy "medias : remplacement admin" on storage.objects
  for update to authenticated using (bucket_id = 'medias' and (select public.est_admin()));
create policy "medias : suppression admin" on storage.objects
  for delete to authenticated using (bucket_id = 'medias' and (select public.est_admin()));
