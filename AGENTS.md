# Plateforme opérationnelle GCS · KIMEXDI · DRELALI

Template AI SaaS Starter Kit (Next.js 15, App Router, React 19, TypeScript, Tailwind CSS 4)
transformé en prototype frontend de gestion opérationnelle multi-entreprises.

## Lancer le projet

```bash
npm install
npm run dev   # http://localhost:3000 → redirigé vers /tableau-de-bord
npm run build # build de production
```

## Architecture

- `src/config/organizations.ts` — configuration centrale des 3 organisations
  (code, nom, pays, devise, fuseau, couleur, modules).
- `src/data/demo-gcs.ts` — jeu de données de démonstration GCS (fictif, cohérent).
- `src/context/erp-store.tsx` — store client centralisé (état en mémoire, pas de backend).
  Toutes les transitions métier y passent (prospects, cotations, missions, paiements, dépenses).
- `src/lib/erp/` — types, libellés FR des statuts, formatage (argent/dates), calculs
  (soldes factures, marges réelles = revenu − coûts validés).
- `src/components/erp/` — UI partagée : `ui.tsx` (Card, Badge, Button, Modal helpers),
  `data-table.tsx` (recherche/tri/filtres/pagination), `charts.tsx` (SVG), `shell/` (layout).
- `src/app/(erp)/` — espace de gestion avec sidebar/header.
- `src/app/chauffeur/` — interface mobile terrain (hors shell, sans données financières).
- `src/app/gcs/` — site public GCS (identité du vitrine : accent #e8552d, navy
  #12314e, police Outfit, images `public/images/gcs/`). `/gcs/devis` =
  formulaire publié DEVIS, `/gcs/demande/[slug]` = tout formulaire publié.
  Les anciennes routes `/demande*` redirigent vers `/gcs/*` (next.config).
- `src/app/kimexdi/` — site public KIMEXDI (accueil, services, fonctionnement,
  à propos, contact, `/kimexdi/devis`, `/kimexdi/demande/[slug]`). Visuels :
  photothèque logistique partagée avec GCS, copiée dans
  `public/images/kimexdi/` et mappée dans `src/config/kimexdi.ts`.
- Tableau de bord KIMEXDI : `src/app/(erp)/tableau-de-bord/kimexdi-dashboard.tsx`
  (KPI demandes/formulaires, dernières demandes, donut par statut, activité
  audit, accès rapides au site public, modules futurs) — rendu quand
  l'org active est KIMEXDI.
- `src/app/(site)/` — pages du template d'origine conservées (/pricing, /signin…).

## Déploiement par plateforme (NEXT_PUBLIC_PLATFORM)

Le même code peut servir une seule plateforme publique via la variable
d'environnement `NEXT_PUBLIC_PLATFORM`, **figée au moment du build**
(`next.config.ts` + `src/middleware.ts`) :

- absente ou `all` → hub : `/` redirige vers `/tableau-de-bord`.
- `NEXT_PUBLIC_PLATFORM=gcs npm run build` → `/` sert `/gcs` ;
  les routes `/kimexdi*` redirigent vers `/gcs`.
- `NEXT_PUBLIC_PLATFORM=kimexdi npm run build` → `/` sert `/kimexdi` ;
  les routes `/gcs*` redirigent vers `/kimexdi`.

L'espace de gestion reste accessible dans tous les modes (à restreindre
côté serveur lors de l'intégration Supabase/auth).

## Système de formulaires configurables

- `src/modules/forms/types.ts` — Form, FormSection, FormField, FormCondition,
  FormVersion, FormSubmission, SubmissionAttachment (17 types de champs,
  conditions d'affichage, statuts BROUILLON/PUBLIE/DESACTIVE/ARCHIVE).
- `src/modules/forms/logic.ts` — évaluation des conditions, validation,
  helpers (slugify, publishedVersion, getPublishedBySlug/Kind).
- `src/modules/forms/renderer/form-renderer.tsx` — moteur de rendu public
  (thèmes `gcs` / `kimexdi`) et `src/modules/forms/builder/field-editor.tsx`.
  Rendu en **étapes** : chaque section = une étape avec indicateur de
  progression, validation par étape, boutons Précédent/Suivant ; les sections
  entièrement masquées par les conditions sont sautées.
- `src/modules/core/types.ts` — Platform, User, Membership, Role, Permission,
  OrgFunction, Process, Task, AuditEvent (préparés pour Supabase).
- `src/context/forms-store.tsx` — store client des formulaires/soumissions,
  adossé à `src/lib/repositories/` (contrat `FormsRepository`, implémentation
  localStorage `gcs-forms-v1` remplaçable par Supabase). Seeds :
  `src/lib/mock-data/forms-seed.ts`.
- Dashboard : `/formulaires` (liste par org), `/formulaires/[id]`
  (constructeur : sections, champs, options, validation, conditions,
  glisser-déposer, aperçu desktop/mobile, brouillon, publication versionnée),
  `/demandes` + `/demandes/[id]` (soumissions filtrées, statuts, journal).
- Chaque soumission conserve la copie du schéma publié utilisé (traçabilité).

## Conventions

- Interface en français ; statuts stockés en constantes typées, affichés en FR.
- Montants en entiers (XOF sans décimales) — pas de calculs flottants.
- Les actions sont simulées et identifiées comme telles ; aucune donnée n'est
  envoyée à un serveur. Persistance locale : `erp-org` (org active) et
  `gcs-forms-v1` (formulaires/soumissions) en localStorage — ni partagées,
  ni centralisées ; adaptateur remplaçable par Supabase.
- Site KIMEXDI : palette bleue/grise (`--kimexdi-*` dans `globals.css`),
  police Poppins, contenu dans `src/config/kimexdi.ts` (coordonnées « à
  compléter » — ne pas inventer de coordonnées, tarifs ou capacités).
- Aucune messagerie interne : les demandes publiques sont gérées comme des
  soumissions structurées dans `/demandes`.
- Pages du template d'origine supprimées (phase 2) : site marketing
  (/, /contact, /pricing, /privacy), /text-generator, /api/chat, lib/ai,
  /signup, /reset-password, components/layout, components/generator,
  components/sections. `/signin` = split-screen (visuels GCS/KIMEXDI,
  panneau marine #12314e, accent cyan) + vrai signInWithPassword.
- Supabase Auth (phase 2 — branchement réel) : `src/context/auth-store.tsx`
  (AuthProvider/useAuth : session, profil, memberships+rôles+permissions
  lus via RLS, org active `erp-active-org` revalidée, `hasPermission`,
  `signOut`). `src/middleware.ts` : refresh de session @supabase/ssr +
  garde des routes (tout ce qui n'est pas public exige une session ;
  `/signup` redirige vers `/signin`). `(erp)/layout.tsx` : double garde
  serveur (`getUser` → redirect) + `RequireOrg` (page « aucune
  organisation » si compte sans membership). `/signin` = vrai
  `signInWithPassword`. NextAuth reste installé mais inutilisé.
- Supabase (phase 0 — clients) : `src/lib/supabase/` (`client.ts`
  navigateur singleton, `server.ts` par requête via cookies, `env.ts`
  validation). Variables : `NEXT_PUBLIC_SUPABASE_URL` +
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (.env.local). Aucune clé
  secrète côté frontend.
- Références métier : LEAD-2026-XXXX, COT-XXXXX, MT-XXXXX, FAC-XXXXXX, PAY-XXXXXX,
  INC-XXXXXX, DEP-XXXXXX.
- Le template d'origine n'a pas de shadcn/ui — ne pas l'ajouter ; utiliser les
  composants de `src/components/erp/` et `src/components/ui/`.
