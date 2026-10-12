'use client';

import Link from 'next/link';
import { useErp } from '@/context/erp-store';
import { derivedInvoiceStatus, invoiceBalance, paymentUnallocated } from '@/lib/erp/calculations';
import { formatDate, formatMoney } from '@/lib/erp/format';
import { Card, PageHeader } from '@/components/erp/ui';

export default function ToDoPage() {
  const s = useErp();

  const groups = [
    {
      title: 'Commercial',
      items: [
        ...s.leads.filter((l) => l.status === 'NOUVEAU').map((l) => ({
          id: `l1-${l.id}`,
          label: `${l.reference} — nouveau prospect à traiter`,
          href: `/prospects/${l.id}`,
          urgency: true,
        })),
        ...s.leads.filter((l) => l.status === 'A_QUALIFIER').map((l) => ({
          id: `l2-${l.id}`,
          label: `${l.reference} — qualification en cours${l.nextAction ? ` (${l.nextAction})` : ''}`,
          href: `/prospects/${l.id}`,
          urgency: false,
        })),
        ...s.leads.filter((l) => l.status === 'ENVOYEE' || l.status === 'RELANCE').map((l) => ({
          id: `l3-${l.id}`,
          label: `${l.reference} — relance à effectuer`,
          href: `/prospects/${l.id}`,
          urgency: false,
        })),
        ...s.quotes.filter((q) => q.status === 'ENVOYEE').map((q) => ({
          id: `q-${q.id}`,
          label: `${q.reference} — cotation envoyée, en attente de réponse`,
          href: `/cotations/${q.id}`,
          urgency: false,
        })),
      ],
    },
    {
      title: 'Opérations',
      items: [
        ...s.missions.filter((m) => m.status === 'A_CONTROLER').map((m) => ({
          id: `m1-${m.id}`,
          label: `${m.reference} — terminée, contrôle requis`,
          href: '/controle',
          urgency: true,
        })),
        ...s.missions.filter((m) => m.status === 'A_PLANIFIER').map((m) => ({
          id: `m2-${m.id}`,
          label: `${m.reference} — à planifier (date ${formatDate(m.plannedDate)})`,
          href: `/missions/${m.id}`,
          urgency: false,
        })),
        ...s.missions.filter((m) => m.status === 'PLANIFIEE' && (!m.vehicleId || !m.driverId)).map((m) => ({
          id: `m3-${m.id}`,
          label: `${m.reference} — ressources à affecter`,
          href: `/missions/${m.id}`,
          urgency: true,
        })),
        ...s.missions.filter((m) => m.status === 'BLOQUEE').map((m) => ({
          id: `m4-${m.id}`,
          label: `${m.reference} — bloquée, action requise`,
          href: `/missions/${m.id}`,
          urgency: true,
        })),
      ],
    },
    {
      title: 'Finances',
      items: [
        ...s.invoices.filter((f) => derivedInvoiceStatus(f, s.payments) === 'BROUILLON').map((f) => ({
          id: `f1-${f.id}`,
          label: `${f.reference} — brouillon à émettre`,
          href: `/factures/${f.id}`,
          urgency: false,
        })),
        ...s.payments.filter((p) => paymentUnallocated(p) > 0).map((p) => ({
          id: `p-${p.id}`,
          label: `${p.reference} — ${formatMoney(paymentUnallocated(p), p.currency)} à affecter`,
          href: '/paiements',
          urgency: true,
        })),
        ...s.expenses.filter((e) => e.status === 'SOUMISE').map((e) => ({
          id: `e-${e.id}`,
          label: `${e.reference} — ${formatMoney(e.amount, e.currency)} à valider`,
          href: '/depenses?statut=SOUMISE',
          urgency: false,
        })),
      ],
    },
  ];

  const total = groups.reduce((t, g) => t + g.items.length, 0);

  return (
    <div>
      <PageHeader title="À traiter" subtitle={`${total} élément${total > 1 ? 's' : ''} nécessitant une action.`} />
      <div className="grid gap-4 lg:grid-cols-3">
        {groups.map((g) => (
          <Card key={g.title} title={`${g.title} (${g.items.length})`} padded={false}>
            {g.items.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">Rien à traiter.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {g.items.map((i) => (
                  <li key={i.id}>
                    <Link href={i.href} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      {i.urgency && <span className="size-2 shrink-0 rounded-full bg-red-500" />}
                      <span>{i.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-400">
        Montant impayé global : {formatMoney(s.invoices.reduce((t, f) => t + Math.max(0, invoiceBalance(f, s.payments)), 0), 'XOF')}.
      </p>
    </div>
  );
}
