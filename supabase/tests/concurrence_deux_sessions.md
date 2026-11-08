# Tests de concurrence — dernier administrateur (v5.3)

Ces tests nécessitent **deux sessions PostgreSQL indépendantes**. Le SQL
Editor de Supabase n'en offre qu'une seule : utilisez `psql`, `pgcli`, un
client SQL quelconque, ou deux onglets SQL Editor ne fonctionnent PAS
(chacun a sa propre transaction mais pas de vraie simultanéité garantie).
Recommandé : `psql` ou `supabase db` en local, ou deux connexions vers la
base de test.

## Fixture commune (à exécuter UNE fois, session admin/postgres)

```sql
-- Org de test dédiée (ne pas utiliser GCS/KIMEXDI pour ne pas polluer)
insert into public.organizations (code, display_name, country, currency, timezone)
values ('TESTC','Test Concurrence','Test','XOF','UTC')
on conflict (code) do nothing;

-- 2 rôles custom admin + 1 rôle lecteur
insert into public.roles (organization_id, name, is_system)
select o.id, v.n, false from public.organizations o,
  (values ('c-admin-a'),('c-admin-b'),('c-lecteur')) v(n)
where o.code='TESTC' on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.perm from public.roles r
join public.organizations o on o.id=r.organization_id and o.code='TESTC'
join (values ('c-admin-a','organisation.administrer'),
             ('c-admin-b','organisation.administrer'),
             ('c-lecteur','demandes.lire')) p(rn,perm)
  on p.rn = r.name
on conflict do nothing;

-- Récupérer les UUID utiles :
select o.id as org, r.id as role, r.name
  from public.roles r join public.organizations o on o.id=r.organization_id
 where o.code='TESTC';
-- Noter : <ORG_C>, <RA_C> (c-admin-a), <RB_C> (c-admin-b)

-- 2 utilisateurs de test (comptes Supabase Auth créés manuellement,
-- profils créés par trigger). Chacun reçoit un membership admin :
insert into public.memberships (user_id, organization_id, role_id)
values ('<U_A>', '<ORG_C>', '<RA_C>'),
       ('<U_B>', '<ORG_C>', '<RB_C>');
```

## Protocole générique

Pour chaque scénario : ouvrir **deux sessions** (`psql` session A et B).
La session A démarre sa transaction et dort (`pg_sleep`) APRÈS son
opération pour laisser la session B entrer en concurrence sur le verrou.

> Astuce : pour simuler le JWT d'un utilisateur dans une session de test,
> exécutez `set role authenticated; set "request.jwt.claims" =
> '{"sub":"<UUID>","role":"authenticated"}';` en début de transaction.
> Alternative plus simple : exécuter les DELETE en tant que postgres —
> `auth.uid() IS NULL` bypass les gardes. Pour tester les gardes, il faut
> donc les claims JWT ci-dessus (plan B : PostgREST + vrais JWT).

---

## C1 — Deux retraits simultanés des 2 sources admin (role_permissions)

**Session A** (JWT = admin de TESTC, ou super admin) :
```sql
begin;
delete from public.role_permissions
 where role_id='<RA_C>' and permission_id='organisation.administrer';
select pg_sleep(5);   -- maintient le verrou advisory jusqu'au COMMIT
commit;
```

**Session B** (démarrer ~1 s après A) :
```sql
begin;
delete from public.role_permissions
 where role_id='<RB_C>' and permission_id='organisation.administrer';
-- B se BLOQUE sur pg_advisory_xact_lock jusqu'au COMMIT de A (~4 s)
commit;  -- ou rollback si exception
```

**Attendu** : A réussit (admin-b subsiste au moment de son comptage).
B attend le verrou, puis son comptage post-verrou voit admin-a déjà
privé → **exception** `dernière source de droits administrateur` →
ROLLBACK de B. Résultat final : TESTC conserve admin-b. ✔

## C2 — Deux suppressions simultanées de memberships admin

**Session A** :
```sql
begin;
delete from public.memberships
 where user_id='<U_A>' and organization_id='<ORG_C>';
select pg_sleep(5);
commit;
```

**Session B** (démarrer ~1 s après) :
```sql
begin;
delete from public.memberships
 where user_id='<U_B>' and organization_id='<ORG_C>';
commit;
```

**Attendu** : A réussit (B encore présent lors de son comptage).
B bloqué sur le verrou, puis comptage = 0 admin restant →
**exception** → ROLLBACK. TESTC conserve le membership de B. ✔

## C3 — Chemins mixtes : membership vs role_permissions

**Session A** : DELETE du membership de `<U_A>` (comme C2) + sleep.
**Session B** : DELETE du grant `organisation.administrer` de `<RB_C>`.

**Attendu** : les deux chemins prennent **le même verrou**
(`socle_admin_guard:<ORG_C>`) → sérialisés. Le second voit l'état
post-commit du premier → au moins un admin subsiste ou exception.
Aucune perte totale. ✔

## C4 — Deux organisations différentes

Fixture : dupliquer TESTC en `TESTD` (rôles `d-admin-a/b`, memberships
`<U_C>`,`<U_D>`). Lancer C1 en parallèle sur TESTC et TESTD.

**Attendu** : clés advisory différentes → **aucun blocage mutuel** ;
les deux opérations progressent ensemble. ✔

## C5 — Super administrateur

**Session unique**, JWT super admin (ou postgres) : DELETE du grant
restant sur TESTC après C1.

**Attendu** : bypass avant verrou → succès immédiat, aucun blocage.
L'org peut être volontairement laissée sans admin (exception légitime). ✔

## C6 — Libération du verrou après échec

**Session A** :
```sql
begin;
-- provoquer une erreur APRÈS acquisition du verrou :
-- par ex. DELETE grant admin-a alors qu'il n'y a pas d'autre source
-- → l'exception 'dernière source' est levée, transaction avortée
delete from public.role_permissions
 where role_id='<RA_C>' and permission_id='organisation.administrer';
rollback;  -- ou laisser la transaction avorter
```

**Session B** (pendant que A est ouverte) : DELETE grant admin-b.

**Attendu** : B attend ; dès que A rollback/abort, le verrou est
libéré (`xact` lock) → B acquiert, compte, réussit ou échoue selon
l'état réel — jamais de blocage définitif. ✔

---

## Limites connues

- `pg_advisory_xact_lock` + `hashtextextended` : collision 64 bits
  improbable ; une collision ne causerait qu'une sérialisation
  inutile entre deux orgs (jamais une faille).
- Sous `REPEATABLE READ`/`SERIALIZABLE`, le snapshot figé peut masquer
  le commit concurrent : Supabase/Postgres utilisent `READ COMMITTED`
  par défaut — si le niveau change, ajouter `FOR UPDATE` sur la ligne
  organization ou passer en `SERIALIZABLE` avec retry.
- Les tests n'ont PAS été exécutés : ils nécessitent une vraie instance
  avec 2 sessions. À exécuter lors de la Phase de validation sur
  Supabase de test.
