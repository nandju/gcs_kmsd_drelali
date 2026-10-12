'use client';

import Link from 'next/link';
import { useErp } from '@/context/erp-store';
import { currentVersion, invoiceBalance } from '@/lib/erp/calculations';
import { formatMoney } from '@/lib/erp/format';
import { Card, DemoNotice, PageHeader } from '@/components/erp/ui';

export default function DecisionsPage() {
  const s = useErp();

  const decisions = [
    ...s.quotes.filter((q) => q.status === 'A_VALIDER').map((q) => ({
      id: q.id,
      title: `Cotation ${q.reference} à valider`,
      detail: `${formatMoney(currentVersion(q).proposedPrice, q.currency)} — prix plancher : ${formatMoney(currentVersion(q).floorPrice, q.currency)}`,
      href: `/cotations/${q.id}`,
      type: 'Validation commerciale',
    })),
    ...s.expenses.filter((e) => e.status === 'SOUMISE').map((e) => ({
      id: e.id,
      title: `Dépense ${e.reference} à valider`,
      detail: `${e.category} — ${formatMoney(e.amount, e.currency)} par ${e.agent}`,
      href: '/depenses?statut=SOUMISE',
      type: 'Validation de dépense',
    })),
    ...s.missions.filter((m) => m.status === 'A_CONTROLER').map((m) => ({
      id: m.id,
      title: `Contrôle de la mission ${m.reference}`,
      detail: 'Terminée par le terrain — vérifier preuves, incidents et dépenses.',
      href: '/controle',
      type: 'Contrôle opérationnel',
    })),
    ...s.missions.filter((m) => m.status === 'BLOQUEE').map((m) => ({
      id: m.id,
      title: `Mission ${m.reference} bloquée`,
      detail: 'Décision requise : véhicule de remplacement, report ou annulation.',
      href: `/missions/${m.id}`,
      type: 'Décision opérationnelle',
    })),
    ...s.invoices
      .filter((f) => invoiceBalance(f, s.payments) > 0 && f.status !== 'BROUILLON' && f.dueDate && new Date(f.dueDate).getTime() < Date.now())
      .map((f) => ({
        id: f.id,
        title: `Relance ${f.reference} (échue)`,
        detail: `Solde restant : ${formatMoney(invoiceBalance(f, s.payments), f.currency)}`,
        href: `/factures/${f.id}`,
        type: 'Relance financière',
      })),
  ];

  return (
    <div>
      <PageHeader title="Mes décisions" subtitle={`${decisions.length} décision${decisions.length > 1 ? 's' : ''} en attente de votre arbitrage.`} />
      <DemoNotice />
      {decisions.length === 0 ? (
        <Card><p className="text-sm text-gray-400">Aucune décision en attente.</p></Card>
      ) : (
        <div className="space-y-2.5">
          {decisions.map((d) => (
            <Card key={`${d.type}-${d.id}`} padded={false}>
              <Link href={d.href} className="flex flex-wrap items-center gap-3 px-4 py-3.5 hover:bg-gray-50">
                <span className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800">{d.type}</span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-gray-800">{d.title}</span>
                  <span className="block text-xs text-gray-500">{d.detail}</span>
                </span>
                <span className="text-cyan-700">→</span>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
