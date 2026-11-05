/* ============================================================================
   TESTS DE SÉCURITÉ RLS — Phase 1B v5.1 (socle multi-organisations)
   ----------------------------------------------------------------------------
   À exécuter dans le SQL Editor Supabase (compte postgres) APRÈS :
     1. `supabase db push` (migration v5 appliquée)
     2. Amorçage des utilisateurs et memberships de test (README §4)

   Chaque scénario tourne dans sa propre transaction et se termine par
   ROLLBACK : aucune donnée de test ne persiste.

   ⚠ EXÉCUTION : coller le fichier ENTIER dans le SQL Editor et lancer en
   une fois. Les `notice` OK/ÉCHOUÉ apparaissent dans les Messages.
   Tout ÉCHOUÉ = échec de sécurité à investiguer avant de continuer.

   ----------------------------------------------------------------------------
   FIXTURES À RENSEIGNER (remplacer les <...> avant exécution)
   Récupération en SQL Editor (compte postgres) :
     select id, email, is_super_admin from public.profiles;
     select id, code from public.organizations;
     select r.id, r.name, o.code as org
       from public.roles r join public.organizations o on o.id = r.organization_id;

   Utilisateurs (5 comptes de test distincts) :
     <U_ADMIN_GCS>    : membership GCS / rôle administrateur
     <U_LECTEUR_GCS>  : membership GCS / rôle lecteur
     <U_ADMIN_KIM>    : membership KIMEXDI / rôle administrateur
     <U_SUPER>        : is_super_admin = true (peut n'avoir aucun membership)
     <U_SANS_ORG>     : compte invité, AUCUN membership (sert aux INSERT réels)

   Organisations :
     <O_GCS>          : uuid de l'org GCS
     <O_KIM>          : uuid de l'org KIMEXDI

   Rôles :
     <R_GCS_LEC>      : rôle lecteur de GCS
     <R_GCS_AGENT>    : rôle agent-demandes de GCS
     <R_GCS_ADMIN>    : rôle administrateur de GCS
     <R_KIM_LEC>      : rôle lecteur de KIMEXDI
   ============================================================================ */

/* ================= T0 — ANONYME : aucun accès ======================= */
/* Les erreurs attendues sont capturées en DO pour ne pas interrompre  */
/* la suite du script (chacune dans sa propre transaction).            */

begin;
set local role anon;
do $$
begin
  perform 1 from public.organizations limit 1;
  raise exception 'T0a ÉCHOUÉ : anon a pu lire organizations';
exception
  when insufficient_privilege then
    raise notice 'T0a OK : anon refusé sur organizations (privilège SQL)';
end $$;
rollback;

begin;
set local role anon;
do $$
begin
  perform 1 from public.memberships limit 1;
  raise exception 'T0b ÉCHOUÉ : anon a pu lire memberships';
exception
  when insufficient_privilege then
    raise notice 'T0b OK : anon refusé sur memberships (privilège SQL)';
end $$;
rollback;

begin;
set local role anon;
do $$
begin
  insert into public.organizations (code, display_name, country, currency, timezone)
  values ('HACK', 'Hack', 'X', 'XOF', 'UTC');
  raise exception 'T0c ÉCHOUÉ : anon a pu insérer une organisation';
exception
  when insufficient_privilege then
    raise notice 'T0c OK : anon refusé sur INSERT organizations';
end $$;
rollback;

/* ================= T1 — LECTEUR GCS : isolation ===================== */
begin;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"<U_LECTEUR_GCS>","role":"authenticated"}';

do $$
declare n int; codes text;
begin
  -- T1a : il voit UNIQUEMENT son organisation
  select count(*), string_agg(code, ',') into n, codes
    from public.organizations;
  assert n = 1 and codes = 'GCS',
    'T1a ÉCHOUÉ : organisations visibles = ' || coalesce(codes,'(aucune)');
  raise notice 'T1a OK : 1 organisation visible (GCS)';

  -- T1b : 4 rôles visibles, tous GCS ; 0 rôle KIMEXDI (UUID littéral)
  select count(*) into n from public.roles;
  assert n = 4, 'T1b ÉCHOUÉ : roles visibles = ' || n;
  select count(*) into n from public.roles
   where organization_id = '<O_KIM>';
  assert n = 0, 'T1b ÉCHOUÉ : rôles KIMEXDI visibles';
  raise notice 'T1b OK : 4 rôles GCS, 0 rôle KIMEXDI';

  -- T1c : aucun membership KIMEXDI (UUID littéral, indépendant de la
  -- visibilité de la table organizations)
  select count(*) into n from public.memberships
   where organization_id = '<O_KIM>';
  assert n = 0, 'T1c ÉCHOUÉ : memberships KIMEXDI visibles';
  raise notice 'T1c OK : aucun membership KIMEXDI visible';

  -- T1d : catalogue permissions lisible (6 lignes)
  select count(*) into n from public.permissions;
  assert n = 6, 'T1d ÉCHOUÉ : permissions visibles = ' || n;
  raise notice 'T1d OK : catalogue permissions lisible';
end $$;
rollback;

/* ---- T1e : is_super_admin NON modifiable (3 barrières cumulées) ---- */
begin;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"<U_LECTEUR_GCS>","role":"authenticated"}';

do $$
declare denied boolean := false; v boolean;
begin
  begin
    update public.profiles set is_super_admin = true
     where id = auth.uid();
  exception
    when insufficient_privilege then denied := true;  -- privilège colonne / RLS
  end;
  -- Si l'UPDATE est passé sans erreur, vérifier que la valeur n'a PAS bougé
  select p.is_super_admin into v from public.profiles p where p.id = auth.uid();
  if denied or v = false then
    raise notice 'T1e OK : is_super_admin non modifiable (refus=%)', denied;
  else
    raise exception 'T1e ÉCHOUÉ : auto-promotion super admin réussie';
  end if;
end $$;
rollback;

/* ---- T1f : profil propre modifiable sur les colonnes autorisées ----- */
begin;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"<U_LECTEUR_GCS>","role":"authenticated"}';

do $$
declare n int;
begin
  update public.profiles set full_name = full_name
   where id = auth.uid();
  get diagnostics n = row_count;
  assert n = 1, 'T1f ÉCHOUÉ : profil propre non modifiable';
  raise notice 'T1f OK : profil propre modifiable (colonnes autorisées)';
end $$;
rollback;

/* ---- T1h : email NON modifiable (synchronisé depuis auth.users) ----- */
begin;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"<U_LECTEUR_GCS>","role":"authenticated"}';

do $$
declare denied boolean := false;
begin
  begin
    update public.profiles set email = 'pirate@example.com'
     where id = auth.uid();
  exception
    when insufficient_privilege then denied := true;
  end;
  assert denied, 'T1h ÉCHOUÉ : email modifiable par le client';
  raise notice 'T1h OK : email non modifiable (colonne + trigger sync)';
end $$;
rollback;

/* ---- T1g : le lecteur ne peut RIEN écrire dans memberships ---------- */
begin;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"<U_LECTEUR_GCS>","role":"authenticated"}';

do $$
declare n int; denied boolean;
begin
  -- T1g1 : INSERT membership (KIMEXDI, rôle KIMEXDI, user sans org)
  --        → refus RLS attendu (pas de permission sur KIMEXDI)
  denied := false;
  begin
    insert into public.memberships (user_id, organization_id, role_id)
    values ('<U_SANS_ORG>', '<O_KIM>', '<R_KIM_LEC>');
  exception
    when insufficient_privilege then denied := true;
  end;
  assert denied, 'T1g1 ÉCHOUÉ : INSERT membership KIMEXDI accepté au lecteur';
  raise notice 'T1g1 OK : INSERT membership refusé (RLS, privilège)';

  -- T1g2 : UPDATE memberships KIMEXDI → 0 ligne (USING filtre)
  update public.memberships set is_active = false
   where organization_id = '<O_KIM>';
  get diagnostics n = row_count;
  assert n = 0, 'T1g2 ÉCHOUÉ : UPDATE KIMEXDI a touché ' || n || ' ligne(s)';
  raise notice 'T1g2 OK : UPDATE memberships KIMEXDI = 0 ligne';

  -- T1g3 : DELETE memberships KIMEXDI → 0 ligne
  delete from public.memberships
   where organization_id = '<O_KIM>';
  get diagnostics n = row_count;
  assert n = 0, 'T1g3 ÉCHOUÉ : DELETE KIMEXDI a touché ' || n || ' ligne(s)';
  raise notice 'T1g3 OK : DELETE memberships KIMEXDI = 0 ligne';

  -- T1g4 : UPDATE de SON PROPRE membership → 0 ligne
  --        (USING exige organisation.administrer : le lecteur ne l'a pas,
  --         donc même sa propre ligne est invisible à l'UPDATE)
  update public.memberships set is_active = false
   where user_id = auth.uid();
  get diagnostics n = row_count;
  assert n = 0, 'T1g4 ÉCHOUÉ : lecteur a modifié son propre membership';
  raise notice 'T1g4 OK : UPDATE propre membership = 0 ligne (RLS)';
end $$;
rollback;

/* ---- T2 : ADMIN GCS — auto-modification et cross-org --------------- */
begin;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"<U_ADMIN_GCS>","role":"authenticated"}';

do $$
declare n int; v_role uuid; v_active boolean;
begin
  -- T2a : ne peut pas changer SON PROPRE rôle (trigger membership_self_guard)
  begin
    update public.memberships
       set role_id = '<R_GCS_LEC>'
     where user_id = auth.uid()
       and organization_id = '<O_GCS>';
    raise exception 'T2a ÉCHOUÉ : changement de son propre rôle autorisé';
  exception
    when raise_exception then
      if sqlerrm not like '%propre appartenance%' then raise; end if;
      raise notice 'T2a OK : changement de son propre rôle refusé (trigger)';
  end;
  -- Vérification : le rôle n'a pas changé
  select m.role_id into v_role from public.memberships m
   where m.user_id = auth.uid() and m.organization_id = '<O_GCS>';
  assert v_role = '<R_GCS_ADMIN>', 'T2a ÉCHOUÉ : rôle modifié malgré le refus';

  -- T2b : ne peut pas se désactiver lui-même
  begin
    update public.memberships set is_active = false
     where user_id = auth.uid() and organization_id = '<O_GCS>';
    raise exception 'T2b ÉCHOUÉ : auto-désactivation autorisée';
  exception
    when raise_exception then
      if sqlerrm not like '%propre appartenance%' then raise; end if;
      raise notice 'T2b OK : auto-désactivation refusée (trigger)';
  end;
  select m.is_active into v_active from public.memberships m
   where m.user_id = auth.uid() and m.organization_id = '<O_GCS>';
  assert v_active, 'T2b ÉCHOUÉ : is_active passé à false malgré le refus';

  -- T2c : ne peut pas supprimer SON PROPRE membership
  begin
    delete from public.memberships
     where user_id = auth.uid() and organization_id = '<O_GCS>';
    raise exception 'T2c ÉCHOUÉ : auto-suppression autorisée';
  exception
    when raise_exception then
      if sqlerrm not like '%supprimer votre propre appartenance%' then raise; end if;
      raise notice 'T2c OK : auto-suppression refusée (trigger)';
  end;
  select count(*) into n from public.memberships
   where user_id = auth.uid() and organization_id = '<O_GCS>';
  assert n = 1, 'T2c ÉCHOUÉ : membership supprimé malgré le refus';

  -- T2d : ne peut PAS associer un rôle KIMEXDI à une org GCS.
  --      U_ADMIN_KIM n'a PAS de membership GCS → pas de risque de
  --      unique_violation : on teste bien la FK composite.
  --      Attendu : foreign_key_violation (ou RLS en second recours).
  begin
    insert into public.memberships (user_id, organization_id, role_id)
    values ('<U_ADMIN_KIM>', '<O_GCS>', '<R_KIM_LEC>');
    raise exception 'T2d ÉCHOUÉ : rôle KIMEXDI accepté dans membership GCS';
  exception
    when foreign_key_violation then
      raise notice 'T2d OK : rôle cross-org refusé (FK composite)';
    when unique_violation then
      raise exception 'T2d ÉCHOUÉ : unique_violation au lieu de la FK composite';
    when insufficient_privilege then
      raise notice 'T2d OK : rôle cross-org refusé (RLS)';
  end;

  -- T2e : ne peut PAS créer de membership dans KIMEXDI
  --      → refus RLS attendu (WITH CHECK sur has_permission KIMEXDI)
  begin
    insert into public.memberships (user_id, organization_id, role_id)
    values ('<U_ADMIN_GCS>', '<O_KIM>', '<R_KIM_LEC>');
    raise exception 'T2e ÉCHOUÉ : membership KIMEXDI créé par admin GCS';
  exception
    when insufficient_privilege then
      raise notice 'T2e OK : INSERT membership KIMEXDI refusé (RLS)';
    when foreign_key_violation then
      raise notice 'T2e OK : INSERT membership KIMEXDI refusé (FK)';
  end;

  -- T2f : UPDATE memberships KIMEXDI → 0 ligne (UUID littéral)
  update public.memberships set is_active = false
   where organization_id = '<O_KIM>';
  get diagnostics n = row_count;
  assert n = 0, 'T2f ÉCHOUÉ : UPDATE KIMEXDI a touché ' || n || ' ligne(s)';
  raise notice 'T2f OK : UPDATE memberships KIMEXDI = 0 ligne';

  -- T2g : DELETE rôle SYSTÈME → 0 ligne (filtré par RLS, pas d'erreur)
  delete from public.roles where id = '<R_GCS_LEC>';
  get diagnostics n = row_count;
  assert n = 0, 'T2g ÉCHOUÉ : rôle système supprimable (' || n || ' ligne)';
  select count(*) into n from public.roles where id = '<R_GCS_LEC>';
  assert n = 1, 'T2g ÉCHOUÉ : rôle lecteur GCS disparu';
  raise notice 'T2g OK : suppression rôle système = 0 ligne (RLS)';

  -- T2h : ne peut PAS retirer une permission d'un rôle SYSTÈME
  --      (trigger prevent_system_role_perm_change)
  begin
    delete from public.role_permissions
     where role_id = '<R_GCS_ADMIN>'
       and permission_id = 'organisation.administrer';
    raise exception 'T2h ÉCHOUÉ : permission retirée d''un rôle système';
  exception
    when raise_exception then
      if sqlerrm not like '%rôle système%' then raise; end if;
      raise notice 'T2h OK : retrait permission rôle système refusé (trigger)';
  end;
  select count(*) into n from public.role_permissions
   where role_id = '<R_GCS_ADMIN>'
     and permission_id = 'organisation.administrer';
  assert n = 1, 'T2h ÉCHOUÉ : organisation.administrer disparu du rôle admin';

  -- T2i : ne peut PAS renommer un rôle SYSTÈME
  begin
    update public.roles set name = 'pirate' where id = '<R_GCS_LEC>';
    raise exception 'T2i ÉCHOUÉ : nom de rôle système modifié';
  exception
    when raise_exception then
      if sqlerrm not like '%nom d''un rôle système%' then raise; end if;
      raise notice 'T2i OK : renommage rôle système refusé (trigger)';
  end;

  -- T2k : ne peut PAS AJOUTER une permission à un rôle SYSTÈME
  --      (additif aussi interdit : élévation indirecte de privilèges)
  begin
    insert into public.role_permissions (role_id, permission_id)
    values ('<R_GCS_LEC>', 'demandes.traiter');
    raise exception 'T2k ÉCHOUÉ : permission ajoutée à un rôle système';
  exception
    when raise_exception then
      if sqlerrm not like '%rôle système%' then raise; end if;
      raise notice 'T2k OK : ajout permission rôle système refusé (trigger)';
  end;
  select count(*) into n from public.role_permissions
   where role_id = '<R_GCS_LEC>'
     and permission_id = 'demandes.traiter';
  assert n = 0, 'T2k ÉCHOUÉ : demandes.traiter présent sur lecteur GCS';
end $$;
rollback;

/* ---- T2j : ADMIN GCS — rôles PERSONNALISÉS gérables ----------------- */
/* Vérifie que les protections rôles système ne bloquent pas le cas     */
/* normal : création + suppression d'un rôle custom dans SA propre org. */
begin;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"<U_ADMIN_GCS>","role":"authenticated"}';

do $$
declare v_role uuid; n int;
begin
  insert into public.roles (organization_id, name, description, is_system)
  values ('<O_GCS>', 'role-test-temp', 'Test', false)
  returning id into v_role;
  assert v_role is not null, 'T2j ÉCHOUÉ : création rôle custom impossible';

  -- permissions du rôle custom : librement gérables
  insert into public.role_permissions (role_id, permission_id)
  values (v_role, 'demandes.lire');
  delete from public.role_permissions
   where role_id = v_role and permission_id = 'demandes.lire';

  delete from public.roles where id = v_role;
  get diagnostics n = row_count;
  assert n = 1, 'T2j ÉCHOUÉ : suppression rôle custom impossible';
  raise notice 'T2j OK : rôle personnalisé créé/géré/supprimé par l''admin';
end $$;
rollback;

/* ---- T3 : ADMIN GCS — ce qu'il PEUT faire dans SON org ------------- */
begin;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"<U_ADMIN_GCS>","role":"authenticated"}';

do $$
declare n int;
begin
  -- T3a : aucun membership KIMEXDI visible (UUID littéral)
  select count(*) into n from public.memberships
   where organization_id = '<O_KIM>';
  assert n = 0, 'T3a ÉCHOUÉ : memberships KIMEXDI visibles pour admin GCS';
  raise notice 'T3a OK : aucun membership KIMEXDI visible';

  -- T3b : peut créer un VRAI membership GCS pour un utilisateur tiers
  --       (U_ADMIN_KIM n'a pas de membership GCS → pas de conflit)
  insert into public.memberships (user_id, organization_id, role_id)
  values ('<U_ADMIN_KIM>', '<O_GCS>', '<R_GCS_LEC>');
  get diagnostics n = row_count;
  assert n = 1, 'T3b ÉCHOUÉ : INSERT membership GCS a touché ' || n || ' ligne(s)';
  raise notice 'T3b OK : membership GCS réellement créé (1 ligne)';
end $$;
rollback;

/* ================= T4 : SUPER ADMIN — droits réels ================== */
begin;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"<U_SUPER>","role":"authenticated"}';

do $$
declare n int; codes text;
begin
  -- T4a : voit les 2 organisations
  select count(*), string_agg(code, ',') into n, codes
    from public.organizations;
  assert n = 2, 'T4a ÉCHOUÉ : super admin voit ' || n || ' org(s)';
  raise notice 'T4a OK : super admin voit GCS + KIMEXDI';

  -- T4b : voit les rôles des DEUX organisations (policy corrigée v5)
  select count(*) into n from public.roles
   where organization_id in ('<O_GCS>', '<O_KIM>');
  assert n = 8, 'T4b ÉCHOUÉ : rôles visibles = ' || n || ' (attendu 8)';
  raise notice 'T4b OK : super admin voit les 8 rôles (2 orgs)';

  -- T4c : voit toutes les associations rôles/permissions (30 seedées)
  select count(*) into n from public.role_permissions;
  assert n >= 30, 'T4c ÉCHOUÉ : role_permissions visibles = ' || n;
  raise notice 'T4c OK : role_permissions visibles = ' || n;

  -- T4d : peut créer un VRAI membership KIMEXDI pour U_SANS_ORG
  insert into public.memberships (user_id, organization_id, role_id)
  values ('<U_SANS_ORG>', '<O_KIM>', '<R_KIM_LEC>');
  get diagnostics n = row_count;
  assert n = 1, 'T4d ÉCHOUÉ : INSERT membership KIMEXDI = ' || n || ' ligne(s)';
  raise notice 'T4d OK : membership KIMEXDI réellement créé (1 ligne)';

  -- T4e : peut créer/supprimer une organisation (action centrale)
  insert into public.organizations (code, display_name, country, currency, timezone)
  values ('TESTORG', 'Test Org', 'Test', 'XOF', 'UTC');
  get diagnostics n = row_count;
  assert n = 1, 'T4e ÉCHOUÉ : INSERT organisation = ' || n || ' ligne(s)';
  delete from public.organizations where code = 'TESTORG';
  raise notice 'T4e OK : super admin gère les organisations';

  -- T4f : peut retirer une permission d'un rôle SYSTÈME (override)
  delete from public.role_permissions
   where role_id = '<R_GCS_ADMIN>'
     and permission_id = 'organisation.administrer';
  get diagnostics n = row_count;
  assert n = 1, 'T4f ÉCHOUÉ : super admin ne peut pas ajuster rôle système';
  raise notice 'T4f OK : super admin peut retirer une permission (rôle système)';

  -- T4g : peut aussi AJOUTER une permission à un rôle SYSTÈME
  insert into public.role_permissions (role_id, permission_id)
  values ('<R_GCS_LEC>', 'demandes.traiter');
  get diagnostics n = row_count;
  assert n = 1, 'T4g ÉCHOUÉ : super admin ne peut pas ajouter (rôle système)';
  raise notice 'T4g OK : super admin peut ajouter une permission (rôle système)';
end $$;
rollback;

/* ================= T5 : trigger profil (amorçage) =================== */
-- Vérification MANUELLE (hors transaction) : après invitation d'un nouvel
-- utilisateur, vérifier qu'une ligne profiles existe :
--   select id, email, is_super_admin from public.profiles
--    where email = '<email-invité>';
-- ATTENDU : 1 ligne, is_super_admin = false.
-- ATTENDU pour un profil inexistant : auth.uid() = null → toutes les
-- fonctions de sécurité retournent false → aucun accès (fail closed).
