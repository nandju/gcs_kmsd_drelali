# Supabase — socle multi-organisations

Documentation de la Phase 1B (migration v5.3 — verrouillage concurrentiel).
**Aucune de ces commandes n'a encore été exécutée.**

## Contenu

| Fichier | Rôle |
|---|---|
| `config.toml` | Configuration CLI (project_id, schémas API). `private` volontairement non exposé. |
| `migrations/20261105000100_socle_multi_organisations.sql` | Schéma + fonctions RLS (`search_path = ''`) + triggers + policies + GRANT/REVOKE + **seed initial** (GCS, KIMEXDI, 6 permissions, 4 rôles × 2 orgs). Exécutée **une seule fois** via `supabase db push`. |
| `tests/rls_security_tests.sql` | Tests RLS à exécuter dans le SQL Editor après le push (transactions annulées, aucune persistance). |
| `seed.sql` | Volontairement sans données : le seed vit dans la migration pour être appliqué aussi au distant. Réservé à de futures données de démo locales. |

## v5.3 — verrouillage concurrentiel du dernier admin

- `private.lock_org_admin_guard(org)` : `pg_advisory_xact_lock` sur
  `hashtextextended('socle_admin_guard:' || org_id)` — verrou
  transactionnel (libéré à COMMIT/ROLLBACK), spécifique à chaque org.
- Appelé par `prevent_last_org_admin_loss` (memberships) et
  `prevent_last_admin_perm_loss` (role_permissions) **avant** le
  comptage des admins restants → les deux chemins sont sérialisés
  ensemble (scénarios C1–C3 couverts).
- Super admin et contexte sans JWT (`auth.uid() IS NULL`) bypassent
  **avant** le verrou : aucune perte de capacité exceptionnelle.
- Deadlock : un seul verrou par opération (org de la ligne) ; les ops
  multi-orgs sont réservées aux contextes bypassés.
- Isolation : READ COMMITTED (défaut) — le comptage post-verrou voit
  les commits concurrents. Sous REPEATABLE READ/SERIALIZABLE, revoir
  (snapshot figé).
- Tests de concurrence (2 sessions) : `supabase/tests/concurrence_deux_sessions.md`.

## v5.2 — audit final

- `prevent_role_protected_change` étendu à **INSERT + UPDATE** : un admin
  ne peut ni créer un rôle `is_system=true`, ni promouvoir un rôle custom,
  ni modifier `is_system` ; `organization_id` des rôles reste immuable
  pour tout JWT (super admin inclus). Super admin / contexte sans JWT :
  gestion complète conservée.
- Nouveau trigger `membership_last_admin_guard` : une organisation ne
  peut pas perdre son dernier administrateur par suppression,
  désactivation ou rétrogradation d'un membership (sauf super admin /
  maintenance). Les self-modifications restent aux gardes `self_*`.
- Nouveau trigger `role_permissions_last_admin_guard` : même invariant
  côté grants — impossible de retirer `organisation.administrer` de la
  dernière source de droit admin d'une org (couvre le DELETE groupé
  multi-lignes de façon atomique).
- Tests : T2m (is_system INSERT/UPDATE), T6 (dernier admin : self-guard,
  DELETE groupé atomique, retrait partiel autorisé, dernier refusé,
  override super admin).

## v5.1 — durcissement

- `SET search_path = ''` uniformisé sur les **8 fonctions triggers**
  (identity_change, self_write, self_delete, role_protected_change,
  system_role_perm_change avaient ou non le réglage — désormais toutes).
  Références déjà qualifiées (`auth.uid()`, `private.*`, `public.*`).
- `profiles.email` **retiré des colonnes modifiables** : `GRANT UPDATE`
  limité à `(full_name, phone)`. Synchronisation fiable via le trigger
  `on_auth_user_email_updated` (auth.users → profiles) — la source de
  vérité reste Supabase Auth, plus de divergence possible.
- Nouveau trigger `on_auth_user_email_updated` (AFTER UPDATE OF email
  ON auth.users).
- Test T2d corrigé : utilise un utilisateur sans membership GCS
  (U_ADMIN_KIM) → `unique_violation` impossible, la FK composite est
  réellement testée ; `unique_violation` = ÉCHOUÉ explicite.
- Nouveau test T1h : `email` non modifiable par le client.

## v5 — corrections de la deuxième revue

- `roles_select` et `rp_select` : le super administrateur voit désormais
  les rôles et associations permissions des **deux** organisations
  (avant : seulement les siennes).
- `prevent_role_protected_change` étendu : **nom des rôles système
  immuable** (+ `organization_id`, `is_system` comme en v4).
- Nouveau trigger `prevent_system_role_perm_change` : **aucune**
  modification (INSERT, UPDATE, DELETE) des permissions d'un rôle
  système par un admin d'organisation — l'ajout additif est aussi
  interdit (élévation indirecte de privilèges). Override réservé au
  super admin et aux contextes sans JWT (migration, SQL Editor).
  Les rôles personnalisés (`is_system = false`) restent librement gérables.
- `set_updated_at` : `search_path = ''` + `pg_catalog.now()` qualifié.
- Gardes memberships/rôles : bypass explicite `auth.uid() is null`
  (contexte de confiance : migrations, SQL Editor, service_role).
- Tests SQL **réécrits** : UUID littéraux (plus de sous-requêtes sur des
  données invisibles), distinction explicite des sqlstate
  (`insufficient_privilege` / `foreign_key_violation` / `raise_exception`),
  vérifications post-refus, INSERT réels avec `row_count` (plus de
  `ON CONFLICT DO NOTHING` masquant les échecs), T0 isolé en DO.

## v4 — corrections de la première revue

- Fonctions `SECURITY DEFINER` : `SET search_path = ''` (au lieu de `public`)
  et références entièrement qualifiées (`public.`, `private.`, `auth.`).
- EXECUTE accordé **individuellement** aux 5 fonctions utilisées par les
  policies ; les fonctions de triggers n'ont pas besoin d'EXECUTE.
- `roles_update` : ajout du `WITH CHECK` symétrique à `USING`.
- Nouvelle garde `prevent_self_membership_delete` : impossible de
  supprimer son propre membership (anti-lockout ; super admin exempté).
- Nouvelle garde `prevent_role_protected_change` : `organization_id` des
  rôles et `is_system` immuables.
- Vérification PostgREST documentée ci-dessous.

## Procédure d'exécution (à valider avant lancement)

```bash
# 1. Installer le CLI (une fois)
scoop install supabase   # ou : npm i -g supabase

# 2. Lier le projet local au projet distant
supabase link --project-ref vvnpjjhudjoupydvqjsj
#    → demande le mot de passe de la base (dashboard → Settings → Database)

# 3. VÉRIFIER PostgREST : Dashboard → Project Settings → Data API →
#    « Exposed schemas » = public, storage, graphql_public (PAS private)

# 4. Pousser la migration
supabase db push
#    → transaction par fichier, journalisée dans
#      supabase_migrations.schema_migrations. En cas d'erreur : rien
#      n'est commité, corriger puis relancer.

# 5. Lancer les tests SQL : coller tests/rls_security_tests.sql dans le
#    SQL Editor après avoir remplacé les fixtures <U_...>, <O_...>,
#    <R_...> (liste et requêtes de récupération en en-tête du fichier).

# 6. Générer les types TypeScript
supabase gen types typescript --linked > src/lib/supabase/types.ts
```

`supabase db reset` **ne doit pas** être utilisé sur le projet distant
(il efface et recrée la base). Il est réservé au développement local
(`supabase start`).

## Amorçage du premier super administrateur

1. Dashboard Supabase → **Authentication → Sign In / Sign Up** →
   désactiver **« Allow new users to sign up »** (inscriptions sur
   invitation uniquement).
2. **Authentication → Users → Invite user** → saisir l'e-mail.
3. L'utilisateur confirme son compte → le trigger `on_auth_user_created`
   crée sa ligne dans `profiles` (vérifier dans Table Editor ; test T5).
4. **SQL Editor** (compte postgres), remplacer `<VOTRE_EMAIL>` :

```sql
update public.profiles
   set is_super_admin = true
 where email = '<VOTRE_EMAIL>';

insert into public.memberships (user_id, organization_id, role_id)
select p.id, o.id, r.id
from public.profiles p
join public.organizations o on o.code in ('GCS','KIMEXDI')
join public.roles r on r.organization_id = o.id and r.name = 'administrateur'
where p.email = '<VOTRE_EMAIL>'
on conflict (user_id, organization_id) do nothing;
```

5. Vérifier : connecté, l'utilisateur voit les 2 organisations et peut
   tout administrer (permissions `organisation.administrer` + flag
   `is_super_admin` pour les actions centrales).

## Rappels sécurité

- `private` (fonctions RLS) : ni USAGE ni EXECUTE pour `anon`/`public`,
  EXECUTE sélectif pour `authenticated`, non exposé par PostgREST.
- `is_super_admin` : non modifiable par un client (privilèges de colonne
  + policy `WITH CHECK`).
- Aucun compte admin n'est créé automatiquement par la migration.
