/* ============================================================================
   PHASE 1B — SOCLE MULTI-ORGANISATIONS (v5.1 — durcissement final)
   Tables : organizations, profiles, roles, permissions,
            role_permissions, memberships
   Sécurité : RLS total, fonctions SECURITY DEFINER en schéma privé
              (search_path = '' + références qualifiées),
              FK composite org/rôle, privilèges de colonne,
              gardes anti-auto-promotion / auto-suppression,
              protections des rôles système (nom, permissions).
   Inclut le seed initial — idempotent.
   Exécutée UNE SEULE FOIS via `supabase db push`.
   Aucun DROP, aucune réinitialisation, aucune table métier.
   ============================================================================ */

create schema if not exists private;

/* ------------------------------ TABLES ----------------------------- */

create table public.organizations (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique check (code ~ '^[A-Z_]+$'),
  display_name  text not null,
  country       text not null,
  currency      text not null check (currency in ('XOF','CAD')),
  timezone      text not null,
  accent_color  text,
  legal_note    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text not null default '',
  email          text not null default '',
  phone          text,
  is_super_admin boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index profiles_email_idx on public.profiles (email);

create table public.roles (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name            text not null,
  description     text,
  is_system       boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (organization_id, name),
  unique (id, organization_id)   -- requis par la FK composite
);
create index roles_org_idx on public.roles (organization_id);

create table public.permissions (
  id     text primary key,
  label  text not null,
  module text not null
);

create table public.role_permissions (
  role_id       uuid not null references public.roles(id) on delete cascade,
  permission_id text not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);
create index role_permissions_perm_idx on public.role_permissions (permission_id);

create table public.memberships (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role_id         uuid not null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (user_id, organization_id),
  -- GARANTIE NATIVE : le rôle appartient à la même organisation.
  foreign key (role_id, organization_id)
    references public.roles (id, organization_id)
    on update cascade on delete no action
);
create index memberships_user_idx on public.memberships (user_id);
create index memberships_org_idx  on public.memberships (organization_id);

/* ------------------ FONCTIONS SECURITY DEFINER ---------------------- */
/* search_path = '' : aucune résolution implicite. Tous les objets sont */
/* référencés avec leur schéma (public., private., auth.).             */
/* pg_catalog (coalesce, exists…) reste toujours implicitement cherché.*/

create or replace function private.is_member_of(org uuid)
returns boolean language sql security definer stable
set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid()
      and m.organization_id = org
      and m.is_active
  );
$$;

create or replace function private.has_permission(org uuid, perm text)
returns boolean language sql security definer stable
set search_path = '' as $$
  select exists (
    select 1
    from public.memberships m
    join public.role_permissions rp on rp.role_id = m.role_id
    where m.user_id = auth.uid()
      and m.organization_id = org
      and m.is_active
      and rp.permission_id = perm
  );
$$;

create or replace function private.is_super_admin()
returns boolean language sql security definer stable
set search_path = '' as $$
  select coalesce(
    (select p.is_super_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create or replace function private.shares_org_with(profile_id uuid)
returns boolean language sql security definer stable
set search_path = '' as $$
  select exists (
    select 1
    from public.memberships mine
    join public.memberships theirs
      on theirs.organization_id = mine.organization_id
    where mine.user_id = auth.uid() and mine.is_active
      and theirs.user_id = profile_id and theirs.is_active
  );
$$;

create or replace function private.is_role_admin(rid uuid)
returns boolean language sql security definer stable
set search_path = '' as $$
  select coalesce(
    (select private.has_permission(r.organization_id, 'organisation.administrer')
     from public.roles r where r.id = rid),
    false
  );
$$;

/* --------------------- TRIGGER : PROFIL À L'INSCRIPTION ------------- */

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer
set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''),
          coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end; $$;

/* --------------------------- TRIGGERS ----------------------------- */

create or replace function private.set_updated_at()
returns trigger language plpgsql
set search_path = '' as $$
begin new.updated_at = pg_catalog.now(); return new; end; $$;

create trigger organizations_touch before update on public.organizations
  for each row execute function private.set_updated_at();
create trigger profiles_touch before update on public.profiles
  for each row execute function private.set_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Synchronisation email : auth.users → profiles.
-- profiles.email n'est plus modifiable par les clients (colonne exclue
-- du GRANT UPDATE) : la source de vérité reste Supabase Auth.
create or replace function private.handle_user_email_update()
returns trigger language plpgsql security definer
set search_path = '' as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end; $$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function private.handle_user_email_update();

/* ---- Garde : identité du membership immuable (user_id, org_id) ---- */
/* auth.uid() IS NULL = contexte de confiance (migration, SQL Editor,  */
/* service_role) : les réparations manuelles restent possibles.        */
create or replace function private.prevent_membership_identity_change()
returns trigger language plpgsql
set search_path = '' as $$
begin
  if auth.uid() is null then return new; end if;
  if new.user_id <> old.user_id or new.organization_id <> old.organization_id then
    raise exception 'Les liens user_id / organization_id d''un membership sont immuables.';
  end if;
  return new;
end; $$;
create trigger membership_identity_guard
  before update on public.memberships
  for each row execute function private.prevent_membership_identity_change();

/* ---- Garde : pas de modification de SON PROPRE membership -------- */
/* (rôle ou statut actif) — sauf super admin. Couvre UPDATE.          */
create or replace function private.prevent_self_membership_write()
returns trigger language plpgsql security definer
set search_path = '' as $$
begin
  if new.user_id = auth.uid()
     and not private.is_super_admin()
     and (new.role_id <> old.role_id or new.is_active <> old.is_active) then
    raise exception 'Vous ne pouvez pas modifier votre propre appartenance.';
  end if;
  return new;
end; $$;
create trigger membership_self_guard
  before update on public.memberships
  for each row execute function private.prevent_self_membership_write();

/* ---- Garde : pas d'auto-suppression de SON PROPRE membership ------ */
/* Un admin peut être retiré par un autre admin ou le super admin,     */
/* mais ne peut pas supprimer sa propre ligne (évite le lockout).     */
create or replace function private.prevent_self_membership_delete()
returns trigger language plpgsql security definer
set search_path = '' as $$
begin
  if old.user_id = auth.uid()
     and not private.is_super_admin() then
    raise exception 'Vous ne pouvez pas supprimer votre propre appartenance.';
  end if;
  return old;
end; $$;
create trigger membership_self_delete_guard
  before delete on public.memberships
  for each row execute function private.prevent_self_membership_delete();

/* ---- Garde : rôles — org, nom système et flag is_system immuables - */
create or replace function private.prevent_role_protected_change()
returns trigger language plpgsql
set search_path = '' as $$
begin
  if auth.uid() is null then return new; end if;
  if new.organization_id <> old.organization_id then
    raise exception 'Le rattachement d''un rôle à une organisation est immuable.';
  end if;
  if old.is_system then
    if not new.is_system then
      raise exception 'Un rôle système ne peut pas perdre son statut système.';
    end if;
    if new.name <> old.name then
      raise exception 'Le nom d''un rôle système est immuable.';
    end if;
  end if;
  return new;
end; $$;
create trigger role_protected_guard
  before update on public.roles
  for each row execute function private.prevent_role_protected_change();

/* ---- Garde : permissions des rôles SYSTÈME ------------------------ */
/* AUCUNE modification (INSERT, UPDATE, DELETE) des permissions d'un    */
/* rôle système par un administrateur d'organisation : ajouter une      */
/* permission de manière additive permettrait d'élever indirectement    */
/* les droits des membres de ce rôle. Seuls le super administrateur     */
/* et les contextes sans JWT (migration, SQL Editor, service_role)     */
/* peuvent ajuster les rôles seed. Les rôles personnalisés             */
/* (is_system = false) restent entièrement gérables par l'admin de     */
/* l'organisation.                                                     */
create or replace function private.prevent_system_role_perm_change()
returns trigger language plpgsql
set search_path = '' as $$
declare v_is_system boolean;
begin
  if auth.uid() is null or private.is_super_admin() then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;
  if tg_op in ('INSERT','UPDATE') then
    select r.is_system into v_is_system
      from public.roles r where r.id = new.role_id;
    if v_is_system then
      raise exception 'Les permissions d''un rôle système ne peuvent être modifiées que par le super administrateur.';
    end if;
  end if;
  if tg_op in ('UPDATE','DELETE') then
    select r.is_system into v_is_system
      from public.roles r where r.id = old.role_id;
    if v_is_system then
      raise exception 'Les permissions d''un rôle système ne peuvent être modifiées que par le super administrateur.';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end; $$;
create trigger role_permissions_system_guard
  before insert or update or delete on public.role_permissions
  for each row execute function private.prevent_system_role_perm_change();

/* ---------------- DROITS SUR LE SCHÉMA PRIVÉ ---------------------- */

revoke usage on schema private from public, anon;
grant  usage on schema private to authenticated;

-- Aucune fonction du schéma privé n'est exécutable par anon ni public.
revoke all on all functions in schema private from public, anon, authenticated;

-- EXECUTE accordé UNIQUEMENT aux fonctions appelées par les policies RLS
-- ou par les triggers appelés dans un contexte utilisateur.
grant execute on function private.is_member_of(uuid)        to authenticated;
grant execute on function private.has_permission(uuid,text) to authenticated;
grant execute on function private.is_super_admin()          to authenticated;
grant execute on function private.shares_org_with(uuid)     to authenticated;
grant execute on function private.is_role_admin(uuid)       to authenticated;

-- Par défaut, les futures fonctions du schéma private restent sans EXECUTE.
alter default privileges in schema private
  revoke execute on functions from public, anon, authenticated;

/* ------------------------- RLS (6 tables) -------------------------- */

alter table public.organizations    enable row level security;
alter table public.profiles         enable row level security;
alter table public.roles            enable row level security;
alter table public.permissions      enable row level security;
alter table public.role_permissions enable row level security;
alter table public.memberships      enable row level security;

create policy org_select on public.organizations for select to authenticated
  using (private.is_member_of(id) or private.is_super_admin());
create policy org_admin_all on public.organizations for all to authenticated
  using (private.is_super_admin()) with check (private.is_super_admin());

create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or private.is_super_admin() or private.shares_org_with(id));
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and is_super_admin = private.is_super_admin()
  );

create policy roles_select on public.roles for select to authenticated
  using (private.is_member_of(organization_id) or private.is_super_admin());
create policy roles_insert on public.roles for insert to authenticated
  with check (private.has_permission(organization_id, 'organisation.administrer')
              or private.is_super_admin());
create policy roles_update on public.roles for update to authenticated
  using (private.has_permission(organization_id, 'organisation.administrer')
         or private.is_super_admin())
  with check (private.has_permission(organization_id, 'organisation.administrer')
              or private.is_super_admin());
create policy roles_delete on public.roles for delete to authenticated
  using ((private.has_permission(organization_id, 'organisation.administrer')
          or private.is_super_admin()) and not is_system);

create policy permissions_select on public.permissions for select to authenticated
  using (true);

create policy rp_select on public.role_permissions for select to authenticated
  using (private.is_super_admin() or exists (
    select 1 from public.roles r
    where r.id = role_id and private.is_member_of(r.organization_id)
  ));
create policy rp_write on public.role_permissions for all to authenticated
  using (private.is_role_admin(role_id) or private.is_super_admin())
  with check (private.is_role_admin(role_id) or private.is_super_admin());

create policy memberships_select on public.memberships for select to authenticated
  using (user_id = auth.uid() or private.is_member_of(organization_id)
         or private.is_super_admin());
create policy memberships_write on public.memberships for all to authenticated
  using (private.has_permission(organization_id, 'organisation.administrer')
         or private.is_super_admin())
  with check (private.has_permission(organization_id, 'organisation.administrer')
              or private.is_super_admin());

/* ------------- PRIVILÈGES SQL (1ʳᵉ barrière) ------------------------- */

revoke all on public.organizations    from anon, authenticated;
revoke all on public.profiles         from anon, authenticated;
revoke all on public.roles            from anon, authenticated;
revoke all on public.permissions      from anon, authenticated;
revoke all on public.role_permissions from anon, authenticated;
revoke all on public.memberships      from anon, authenticated;

grant select, insert, update, delete on public.organizations    to authenticated;
grant select, update                 on public.profiles         to authenticated;
grant select, insert, update, delete on public.roles            to authenticated;
grant select                          on public.permissions      to authenticated;
grant select, insert, delete          on public.role_permissions to authenticated;
grant select, insert, update, delete on public.memberships      to authenticated;

-- profiles : ni is_super_admin ni email modifiables par un client.
-- email est synchronisé depuis auth.users par le trigger
-- on_auth_user_email_updated (source de vérité = Supabase Auth).
revoke update on public.profiles from authenticated;
grant  update (full_name, phone) on public.profiles to authenticated;

/* ============================ SEED (idempotent) ===================== */
/* Valeurs issues de src/config/organizations.ts (aucune invention).    */
/* Les INSERT utilisent les codes/noms métier, jamais les UUID.         */

insert into public.organizations
  (code, display_name, country, currency, timezone, accent_color, legal_note)
values
  ('GCS',     'GCS — Côte d’Ivoire', 'Côte d’Ivoire', 'XOF', 'Africa/Abidjan',  '#0e7490', null),
  ('KIMEXDI', 'KIMEXDI — Canada',     'Canada',          'CAD', 'America/Toronto', '#1769aa',
   'Dénomination juridique exacte (KMSD / KIMEXDI) à confirmer.')
on conflict (code) do nothing;
-- DRELALI : volontairement absente.

insert into public.permissions (id, label, module) values
  ('formulaires.lire',         'Consulter les formulaires',         'formulaires'),
  ('formulaires.ecrire',       'Créer et modifier les formulaires', 'formulaires'),
  ('formulaires.publier',      'Publier une version de formulaire', 'formulaires'),
  ('demandes.lire',            'Consulter les demandes reçues',     'demandes'),
  ('demandes.traiter',         'Traiter les demandes reçues',       'demandes'),
  ('organisation.administrer', 'Administrer l''organisation',       'organisation')
on conflict (id) do nothing;

-- 4 rôles système par organisation (retrouvés par code + nom, pas par UUID)
insert into public.roles (organization_id, name, description, is_system)
select o.id, v.name, v.descr, true
from public.organizations o
join (values
  ('administrateur',           'Accès complet à l''organisation'),
  ('gestionnaire-formulaires', 'Gestion des formulaires et des demandes'),
  ('agent-demandes',           'Traitement des demandes reçues'),
  ('lecteur',                  'Consultation seule')
) as v(name, descr) on true
where o.code in ('GCS', 'KIMEXDI')
on conflict (organization_id, name) do nothing;

-- Attributions permissions ↔ rôles (idempotent)
insert into public.role_permissions (role_id, permission_id)
select r.id, m.perm
from public.roles r
join public.organizations o on o.id = r.organization_id and o.code in ('GCS','KIMEXDI')
join (values
  ('administrateur',           'formulaires.lire'),
  ('administrateur',           'formulaires.ecrire'),
  ('administrateur',           'formulaires.publier'),
  ('administrateur',           'demandes.lire'),
  ('administrateur',           'demandes.traiter'),
  ('administrateur',           'organisation.administrer'),
  ('gestionnaire-formulaires', 'formulaires.lire'),
  ('gestionnaire-formulaires', 'formulaires.ecrire'),
  ('gestionnaire-formulaires', 'formulaires.publier'),
  ('gestionnaire-formulaires', 'demandes.lire'),
  ('gestionnaire-formulaires', 'demandes.traiter'),
  ('agent-demandes',           'demandes.lire'),
  ('agent-demandes',           'demandes.traiter'),
  ('lecteur',                  'formulaires.lire'),
  ('lecteur',                  'demandes.lire')
) as m(role_name, perm) on m.role_name = r.name
on conflict do nothing;
