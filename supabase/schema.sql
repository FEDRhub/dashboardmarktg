-- Table unique qui stocke toutes les données du dashboard
-- (config des canaux, données mensuelles, fichiers importés),
-- exactement comme le stockage de l'artifact Claude, mais dans une vraie base Postgres.

create table if not exists dashboard_store (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- Active la sécurité au niveau des lignes (RLS)
alter table dashboard_store enable row level security;

-- Toute personne connectée (via le lien magique par email) peut lire...
create policy "authenticated can read dashboard_store"
  on dashboard_store for select
  using (auth.role() = 'authenticated');

-- ...et écrire les données partagées.
create policy "authenticated can insert dashboard_store"
  on dashboard_store for insert
  with check (auth.role() = 'authenticated');

create policy "authenticated can update dashboard_store"
  on dashboard_store for update
  using (auth.role() = 'authenticated');

create policy "authenticated can delete dashboard_store"
  on dashboard_store for delete
  using (auth.role() = 'authenticated');
