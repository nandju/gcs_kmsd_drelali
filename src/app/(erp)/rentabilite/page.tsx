'use client';

import Link from 'next/link';
import { useErp } from '@/context/erp-store';
import { missionMargin } from '@/lib/erp/calculations';
import { formatDate, formatMoney } from '@/lib/erp/format';
import { MISSION_STATUS } from '@/lib/erp/labels';
import { Badge, Card, DemoNotice, PageHeader } from '@/components/erp/ui';

export default function MarginsPage() {
  const s = useErp();

  const rows = s.missions
    .filter((m) => m.revenue !== undefined)
    .map((m) => ({ mission: m, margin: missionMargin(m, s.expenses) }))
    .sort((a, b) => b.margin.realMargin - a.margin.realMargin);

  const totals = rows.reduce(
    (t, r) => ({
      revenue: t.revenue + r.margin.revenue,
      validated: t.validated + r.margin.validatedCosts,
      submitted: t.submitted + r.margin.submittedCosts,
      real: t.real + r.margin.realMargin,
      estimated: t.estimated + r.margin.estimatedMargin,
    }),
    { revenue: 0, validated: 0, submitted: 0, real: 0, estimated: 0 },
  );

  const contactName = (id: string) => s.contacts.find((c) => c.id === id)?.name ?? '—';

  return (
    <div>
      <PageHeader
        title="Rentabilité et marges"
        subtitle="Marge réelle = revenu retenu pour l’analyse − coûts directs validés. Distinction entre estimé, soumis et validé."
      />
      <DemoNotice>Visible par les rôles autorisés (direction/finance) — l’interface chauffeur n’affiche jamais ces éléments.</DemoNotice>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card><p className="text-xs text-gray-500">Revenus retenus</p><p className="mt-1 text-lg font-bold text-gray-900">{formatMoney(totals.revenue, 'XOF')}</p><p className="text-[11px] text-gray-400">Montants engagés sur les missions</p></Card>
        <Card><p className="text-xs text-gray-500">Coûts directs validés</p><p className="mt-1 text-lg font-bold text-gray-900">{formatMoney(totals.validated, 'XOF')}</p><p className="text-[11px] text-gray-400">Hors dépenses soumises : {formatMoney(totals.submitted, 'XOF')}</p></Card>
        <Card><p className="text-xs text-gray-500">Marge estimée</p><p className="mt-1 text-lg font-bold text-gray-600">{formatMoney(totals.estimated, 'XOF')}</p><p className="text-[11px] text-gray-400">Sur la base des coûts estimés</p></Card>
        <Card><p className="text-xs text-gray-500">Marge réelle</p><p className={`mt-1 text-lg font-bold ${totals.real >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatMoney(totals.real, 'XOF')}</p><p className="text-[11px] text-gray-400">Revenus − coûts validés</p></Card>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-theme-xs">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 font-medium">Mission</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 text-right font-medium">Revenu</th>
              <th className="px-4 py-3 text-right font-medium">Coût estimé</th>
              <th className="px-4 py-3 text-right font-medium">Soumis</th>
              <th className="px-4 py-3 text-right font-medium">Validé</th>
              <th className="px-4 py-3 text-right font-medium">Marge estimée</th>
              <th className="px-4 py-3 text-right font-medium">Marge réelle</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ mission, margin }) => (
              <tr key={mission.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/missions/${mission.id}`} className="font-medium text-cyan-800 hover:underline">{mission.reference}</Link>
                  <span className="block text-xs text-gray-400">{formatDate(mission.plannedDate)}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{contactName(mission.contactId)}</td>
                <td className="px-4 py-3"><Badge tone={MISSION_STATUS[mission.status].tone}>{MISSION_STATUS[mission.status].label}</Badge></td>
                <td className="px-4 py-3 text-right font-medium">{formatMoney(margin.revenue, 'XOF')}</td>
                <td className="px-4 py-3 text-right text-gray-500">{formatMoney(margin.estimatedCost, 'XOF')}</td>
                <td className="px-4 py-3 text-right text-amber-600">{formatMoney(margin.submittedCosts, 'XOF')}</td>
                <td className="px-4 py-3 text-right">{formatMoney(margin.validatedCosts, 'XOF')}</td>
                <td className="px-4 py-3 text-right text-gray-500">{formatMoney(margin.estimatedMargin, 'XOF')}</td>
                <td className={`px-4 py-3 text-right font-semibold ${margin.realMargin >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {margin.computable ? formatMoney(margin.realMargin, 'XOF') : 'Non calculable'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Détail de la règle : Marge réelle = revenu retenu pour l’analyse − coûts directs validés.
        Les dépenses soumises (non validées) et les montants estimés sont affichés séparément.
        Les missions sans revenu renseigné affichent « Non calculable » plutôt qu’un chiffre inventé.
      </p>
    </div>
  );
}
