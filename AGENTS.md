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
- `src/app/demande/` — formulaire public de demande GCS.
- `src/app/(site)/` — pages du template d'origine conservées (/pricing, /signin…).

## Conventions

- Interface en français ; statuts stockés en constantes typées, affichés en FR.
- Montants en entiers (XOF sans décimales) — pas de calculs flottants.
- Les actions sont simulées et identifiées comme telles ; aucune donnée n'est
  envoyée à un serveur. Seule l'org active est mémorisée (localStorage `erp-org`).
- Références métier : LEAD-2026-XXXX, COT-XXXXX, MT-XXXXX, FAC-XXXXXX, PAY-XXXXXX,
  INC-XXXXXX, DEP-XXXXXX.
- Le template d'origine n'a pas de shadcn/ui — ne pas l'ajouter ; utiliser les
  composants de `src/components/erp/` et `src/components/ui/`.
