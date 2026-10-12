'use client';

import { useErp } from '@/context/erp-store';
import { paymentUnallocated } from '@/lib/erp/calculations';
import { formatDateTime, formatMoney } from '@/lib/erp/format';
import { PAYMENT_METHOD } from '@/lib/erp/labels';
import { Card, DemoNotice, PageHeader } from '@/components/erp/ui';

export default function CaissePage() {
  const s = useErp();

  const accounts = ['Banque principale', 'Mobile money société', 'Caisse Abidjan'] as const;
  const byAccount = accounts.map((acc) => {
    const payments = s.payments.filter((p) => p.account === acc);
    const received = payments.reduce((t, p) => t + p.amount, 0);
    const expenses = s.expenses.filter((e) => e.status === 'VALIDEE' && acc === 'Caisse Abidjan');
    const spent = expenses.reduce((t, e) => t + e.amount, 0);
    return { acc, payments, received, spent, balance: received - spent };
  });

  return (
    <div>
      <PageHeader
        title="Caisse et comptes"
        subtitle="Positions de trésorerie de démonstration — aucun relevé réel n’est connecté."
      />
      <DemoNotice>Soldes calculés sur les données fictives : encaissements moins dépenses validées de caisse.</DemoNotice>
      <div className="grid gap-4 lg:grid-cols-3">
        {byAccount.map((a) => (
          <Card key={a.acc} title={a.acc}>
            <p className={`text-2xl font-bold ${a.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>{formatMoney(a.balance, 'XOF')}</p>
            <div className="mt-3 space-y-1 text-sm">
              <p className="flex justify-between text-gray-500"><span>Encaissements</span><span className="text-emerald-700">+{formatMoney(a.received, 'XOF')}</span></p>
              <p className="flex justify-between text-gray-500"><span>Dépenses validées</span><span className="text-red-500">−{formatMoney(a.spent, 'XOF')}</span></p>
            </div>
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="mb-1 text-xs font-medium uppercase text-gray-400">Derniers mouvements</p>
              {a.payments.slice(0, 3).map((p) => (
                <p key={p.id} className="flex justify-between text-xs text-gray-500">
                  <span>{p.reference} · {PAYMENT_METHOD[p.method]}</span>
                  <span>{formatDateTime(p.receivedAt)}</span>
                </p>
              ))}
              {a.payments.length === 0 && <p className="text-xs text-gray-400">Aucun mouvement.</p>}
            </div>
          </Card>
        ))}
      </div>
      <Card title="Paiements en attente d’affectation" className="mt-4" padded={false}>
        {s.payments.filter((p) => paymentUnallocated(p) > 0).length === 0 ? (
          <p className="p-4 text-sm text-gray-400">Tous les encaissements sont affectés.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {s.payments.filter((p) => paymentUnallocated(p) > 0).map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium text-gray-800">{p.reference} — {s.contacts.find((c) => c.id === p.contactId)?.name}</span>
                <span className="text-amber-600">{formatMoney(paymentUnallocated(p), p.currency)} non affecté</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
