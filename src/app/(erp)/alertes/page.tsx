'use client';

import Link from 'next/link';
import { useErp } from '@/context/erp-store';
import { invoiceBalance, isOverdue, paymentUnallocated } from '@/lib/erp/calculations';
import { formatMoney } from '@/lib/erp/format';
import type { Tone } from '@/lib/erp/labels';
import { Badge, Card, PageHeader } from '@/components/erp/ui';

export default function AlertsPage() {
  const s = useErp();

  const alerts: { id: string; tone: Tone; category: string; label: string; detail: string; href: string }[] = [
    ...s.incidents
      .filter((i) => i.status === 'OUVERT' || i.status === 'EN_TRAITEMENT')
      .map((i) => ({
        id: i.id,
        tone: (i.priority === 'CRITIQUE' ? 'red' : i.priority === 'HAUTE' ? 'red' : 'amber') as Tone,
        category: 'Incident',
        label: `${i.reference} — ${i.type} (${i.priority.toLowerCase()})`,
        detail: i.description,
        href: '/incidents',
      })),
    ...s.invoices.filter((f) => isOverdue(f, s.payments)).map((f) => ({
      id: f.id,
      tone: 'red' as Tone,
      category: 'Facture échue',
      label: `${f.reference} — solde ${formatMoney(invoiceBalance(f, s.payments), f.currency)}`,
      detail: `Échéance dépassée, solde restant dû.`,
      href: `/factures/${f.id}`,
    })),
    ...s.vehicles.filter((v) => v.status === 'IMMOBILISE').map((v) => ({
      id: v.id,
      tone: 'amber' as Tone,
      category: 'Ressource',
      label: `${v.name} immobilisé`,
      detail: v.note ?? 'Indisponible pour affectation.',
      href: '/ressources',
    })),
    ...s.payments.filter((p) => paymentUnallocated(p) > 0).map((p) => ({
      id: p.id,
      tone: 'amber' as Tone,
      category: 'Paiement',
      label: `${p.reference} — ${formatMoney(paymentUnallocated(p), p.currency)} non affectés`,
      detail: 'Encaissement reçu sans affectation à une facture.',
      href: '/paiements',
    })),
    ...s.missions.filter((m) => m.status === 'BLOQUEE').map((m) => ({
      id: m.id,
      tone: 'red' as Tone,
      category: 'Mission bloquée',
      label: `${m.reference} bloquée`,
      detail: `${m.origin} → ${m.destination}`,
      href: `/missions/${m.id}`,
    })),
    ...s.quotes.filter((q) => q.status === 'ENVOYEE' && q.versions.at(-1)?.validityDate && new Date(q.versions.at(-1)!.validityDate).getTime() < Date.now() + 7 * 86400000).map((q) => ({
      id: q.id,
      tone: 'blue' as Tone,
      category: 'Cotation',
      label: `${q.reference} — validité proche de l’échéance`,
      detail: 'Relance à prévoir avant expiration.',
      href: `/cotations/${q.id}`,
    })),
  ];

  return (
    <div>
      <PageHeader title="Alertes" subtitle="Alertes générées automatiquement à partir des données de démonstration." />
      {alerts.length === 0 ? (
        <Card><p className="text-sm text-gray-400">Aucune alerte active.</p></Card>
      ) : (
        <div className="space-y-2.5">
          {alerts.map((a) => (
            <Card key={a.id} padded={false}>
              <Link href={a.href} className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50">
                <Badge tone={a.tone} className="mt-0.5">{a.category}</Badge>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-gray-800">{a.label}</span>
                  <span className="block text-xs text-gray-500">{a.detail}</span>
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
