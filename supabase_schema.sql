-- IMDS School Manager — synchronisation multi-appareils
-- À exécuter dans Supabase > SQL Editor.
-- IMPORTANT : utilisez uniquement la clé publishable/anon dans l'application.
-- Ne mettez JAMAIS une clé secret/service_role dans app.js.

create table if not exists public.imds_sync_snapshots (
  school_id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  device_id text,
  revision bigint not null default 1
);

alter table public.imds_sync_snapshots enable row level security;

revoke all on table public.imds_sync_snapshots from anon;
grant select, insert, update on table public.imds_sync_snapshots to authenticated;

drop policy if exists "IMDS authenticated can read snapshots" on public.imds_sync_snapshots;
drop policy if exists "IMDS authenticated can insert snapshots" on public.imds_sync_snapshots;
drop policy if exists "IMDS authenticated can update snapshots" on public.imds_sync_snapshots;

create policy "IMDS authenticated can read snapshots"
on public.imds_sync_snapshots for select
to authenticated
using (true);

create policy "IMDS authenticated can insert snapshots"
on public.imds_sync_snapshots for insert
to authenticated
with check (true);

create policy "IMDS authenticated can update snapshots"
on public.imds_sync_snapshots for update
to authenticated
using (true)
with check (true);

-- La table contient une seule école dans la version initiale.
-- Pour une architecture multi-écoles, on ajoutera ensuite une table schools/members
-- et des politiques RLS basées sur auth.uid().
