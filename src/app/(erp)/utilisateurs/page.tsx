'use client';

import { Badge, Card, DemoNotice, PageHeader } from '@/components/erp/ui';

const DEMO_USERS = [
  { name: 'Direction (démo)', role: 'Direction', scope: 'Tous les modules, dont marges et finances', status: 'actif' },
  { name: 'K. Assi', role: 'Responsable exploitation', scope: 'Opérations, planning, contrôle, dépenses', status: 'actif' },
  { name: 'A. Koné', role: 'Commercial', scope: 'Prospects, pipeline, cotations (hors prix planchers sensibles)', status: 'actif' },
  { name: 'B. N’Guessan', role: 'Commercial', scope: 'Prospects, pipeline, cotations', status: 'actif' },
  { name: 'Service finances', role: 'Finance', scope: 'Factures, paiements, dépenses, marges', status: 'actif' },
  { name: 'Koffi Jean', role: 'Chauffeur', scope: 'Interface mobile terrain uniquement', status: 'actif' },
];

export default function UsersPage() {
  return (
    <div>
      <PageHeader title="Utilisateurs et rôles" subtitle="Utilisateurs fictifs de démonstration — aucune permission backend réelle n’est appliquée." />
      <DemoNotice>La gestion des rôles est illustrée en interface seulement ; les permissions seront appliquées par le backend lors de sa mise en place.</DemoNotice>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {DEMO_USERS.map((u) => (
          <Card key={u.name} title={u.name}>
            <div className="flex items-center gap-2">
              <Badge tone="cyan">{u.role}</Badge>
              <Badge tone="green">{u.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-gray-500">{u.scope}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
