'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { FUTURE_MODULES, ORGANIZATIONS } from '@/config/organizations';
import { useErp } from '@/context/erp-store';
import {
  derivedInvoiceStatus,
  invoiceBalance,
  isOverdue,
  missionMargin,
  paymentUnallocated,
} from '@/lib/erp/calculations';
import { formatDateTime, formatMoney } from '@/lib/erp/format';
import { MISSION_STATUS, type Tone } from '@/lib/erp/labels';
import { Badge, Card, ComingSoon, DemoNotice, LinkButton, PageHeader } from '@/components/erp/ui';
import { BarChart, DonutChart, LineChart } from '@/components/erp/charts';
import { KimexdiDashboard } from './kimexdi-dashboard';

function isToday(iso: string) {
  const a = new Date(iso);
  const b = new Date();
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function KpiCard({
  label,
  value,
  sub,
  href,
  tone = 'cyan',
}: {
  label: string;
  value: string | number;
  sub?: string;
  href: string;
  tone?: Tone;
}) {
  const toneBar: Record<Tone, string> = {
    gray: 'bg-gray-400',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    violet: 'bg-violet-500',
    cyan: 'bg-cyan-700',
  };
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs transition hover:border-cyan-700/40 hover:shadow-theme-sm"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${toneBar[tone]}`} />
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1.5 text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>}
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cyan-700 opacity-0 transition group-hover:opacity-100">
        Voir le détail →
      </span>
    </Link>
  );
}

export default function DashboardPage() {
  const s = useErp();
  const org = ORGANIZATIONS[s.org];

  const data = useMemo(() => {
    const leadsToQualify = s.leads.filter((l) => l.status === 'NOUVEAU' || l.status === 'A_QUALIFIER');
    const quotesToValidate = s.quotes.filter((q) => q.status === 'A_VALIDER');
    const quotesSent = s.quotes.filter((q) => q.status === 'ENVOYEE');
    const missionsToday = s.missions.filter(
      (m) => isToday(m.plannedDate) && !['ANNULEE', 'CLOTUREE'].includes(m.status),
    );
    const missionsRunning = s.missions.filter((m) => m.status === 'EN_COURS');
    const missionsToControl = s.missions.filter((m) => m.status === 'A_CONTROLER');
    const unpaidInvoices = s.invoices.filter((f) => {
      const st = derivedInvoiceStatus(f, s.payments);
      return (st === 'EMISE' || st === 'PARTIELLEMENT_PAYEE') && invoiceBalance(f, s.payments) > 0;
    });
    const unpaidTotal = unpaidInvoices.reduce((t, f) => t + invoiceBalance(f, s.payments), 0);
    const received = s.payments.reduce((t, p) => t + p.amount, 0);
    const expensesToValidate = s.expenses.filter((e) => e.status === 'SOUMISE');
    const margins = s.missions
      .map((m) => missionMargin(m, s.expenses))
      .filter((m) => m.computable);
    const realMargin = margins.reduce((t, m) => t + m.realMargin, 0);
    const validatedCosts = margins.reduce((t, m) => t + m.validatedCosts, 0);
    const submittedCosts = margins.reduce((t, m) => t + m.submittedCosts, 0);
    return {
      leadsToQualify,
      quotesToValidate,
      quotesSent,
      missionsToday,
      missionsRunning,
      missionsToControl,
      unpaidInvoices,
      unpaidTotal,
      received,
      expensesToValidate,
      realMargin,
      validatedCosts,
      submittedCosts,
    };
  }, [s]);

  if (s.org === 'KIMEXDI') {
    return <KimexdiDashboard />;
  }

  if (s.org !== 'GCS') {
    return (
      <div>
        <PageHeader
          title={org.displayName}
          subtitle={org.description}
        />
        <DemoNotice>
          Espace de démonstration — {org.legalNote ?? 'données fictives.'} Devise : {org.currency}.
          Aucune conversion monétaire n’est effectuée entre les espaces.
        </DemoNotice>
        <ComingSoon
          module={`Modules ${org.code} prévus dans les prochaines versions`}
          items={FUTURE_MODULES[s.org as 'KIMEXDI' | 'DRELALI']}
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Card title="Pourquoi cet espace existe déjà ?">
            <p className="text-sm text-gray-600">
              L’architecture multi-entreprises est en place : navigation, données et composants
              sont prêts à accueillir les modules {org.code} sans réécriture de l’interface.
            </p>
          </Card>
          <Card title="Espace prioritaire">
            <p className="text-sm text-gray-600">
              Le MVP de présentation se concentre sur GCS — Côte d’Ivoire. Utilisez le sélecteur
              d’organisation dans l’en-tête pour y revenir.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const missionStatusDonut = (
    ['A_PLANIFIER', 'PLANIFIEE', 'AFFECTEE', 'EN_COURS', 'A_CONTROLER', 'BLOQUEE'] as const
  )
    .map((st) => ({
      label: MISSION_STATUS[st].label,
      value: s.missions.filter((m) => m.status === st).length,
      tone: MISSION_STATUS[st].tone,
    }))
    .filter((d) => d.value > 0);

  // Évolution commerciale : prospects créés par semaine (4 dernières semaines).
  const weeks = [3, 2, 1, 0].map((w) => {
    const start = Date.now() - (w + 1) * 7 * 86400000;
    const end = Date.now() - w * 7 * 86400000;
    return {
      label: w === 0 ? 'Cette sem.' : `S−${w}`,
      value: s.leads.filter((l) => {
        const t = new Date(l.createdAt).getTime();
        return t >= start && t < end;
      }).length,
    };
  });

  const paymentWeeks = [3, 2, 1, 0].map((w) => {
    const start = Date.now() - (w + 1) * 7 * 86400000;
    const end = Date.now() - w * 7 * 86400000;
    return {
      label: w === 0 ? 'Cette sem.' : `S−${w}`,
      value: s.payments
        .filter((p) => {
          const t = new Date(p.receivedAt).getTime();
          return t >= start && t < end;
        })
        .reduce((t, p) => t + p.amount, 0),
      tone: 'green' as Tone,
    };
  });

  const pendingDecisions = [
    ...data.quotesToValidate.map((q) => ({
      id: q.id,
      label: `Valider la cotation ${q.reference}`,
      href: `/cotations/${q.id}`,
    })),
    ...data.expensesToValidate.map((e) => ({
      id: e.id,
      label: `Valider la dépense ${e.reference} (${formatMoney(e.amount, e.currency)})`,
      href: '/depenses?statut=SOUMISE',
    })),
    ...s.payments
      .filter((p) => paymentUnallocated(p) > 0)
      .map((p) => ({
        id: p.id,
        label: `Affecter le paiement ${p.reference} (${formatMoney(paymentUnallocated(p), p.currency)} non affectés)`,
        href: '/paiements',
      })),
  ];

  const alerts = [
    ...s.incidents
      .filter((i) => i.status === 'OUVERT' || i.status === 'EN_TRAITEMENT')
      .map((i) => ({
        id: i.id,
        tone: (i.priority === 'CRITIQUE' || i.priority === 'HAUTE' ? 'red' : 'amber') as Tone,
        label: `${i.reference} — ${i.type}`,
        href: '/incidents',
      })),
    ...data.unpaidInvoices
      .filter((f) => isOverdue(f, s.payments))
      .map((f) => ({
        id: f.id,
        tone: 'red' as Tone,
        label: `Facture ${f.reference} échue — solde ${formatMoney(invoiceBalance(f, s.payments), f.currency)}`,
        href: `/factures/${f.id}`,
      })),
    ...s.vehicles
      .filter((v) => v.status === 'IMMOBILISE')
      .map((v) => ({
        id: v.id,
        tone: 'amber' as Tone,
        label: `Véhicule immobilisé : ${v.name}`,
        href: '/ressources',
      })),
  ];

  return (
    <div>
      <PageHeader
        title="Tableau de bord de direction"
        subtitle={`${org.displayName} · Données de démonstration — montants en ${org.currency}.`}
        action={
          <>
            <LinkButton href="/prospects" variant="secondary">+ Nouveau prospect</LinkButton>
            <LinkButton href="/cotations" variant="primary">+ Nouvelle cotation</LinkButton>
          </>
        }
      />

      {/* Cartes KPI — chaque carte ouvre la liste correspondante */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Prospects à qualifier" value={data.leadsToQualify.length} href="/prospects?vue=a-qualifier" tone="amber" />
        <KpiCard label="Cotations à valider" value={data.quotesToValidate.length} href="/cotations?statut=A_VALIDER" tone="amber" />
        <KpiCard label="Cotations envoyées" value={data.quotesSent.length} href="/cotations?statut=ENVOYEE" tone="blue" />
        <KpiCard label="Missions aujourd’hui" value={data.missionsToday.length} href="/missions?vue=jour" tone="cyan" />
        <KpiCard label="Missions en cours" value={data.missionsRunning.length} href="/missions?statut=EN_COURS" tone="blue" />
        <KpiCard label="Missions à contrôler" value={data.missionsToControl.length} href="/controle" tone="amber" />
        <KpiCard
          label="Factures impayées"
          value={data.unpaidInvoices.length}
          sub={`Solde dû : ${formatMoney(data.unpaidTotal, 'XOF')}`}
          href="/factures?vue=impayees"
          tone="red"
        />
        <KpiCard
          label="Encaissements (période)"
          value={formatMoney(data.received, 'XOF')}
          sub="Montants encaissés"
          href="/paiements"
          tone="green"
        />
        <KpiCard
          label="Dépenses à valider"
          value={data.expensesToValidate.length}
          sub={`Engagé (soumis) : ${formatMoney(data.submittedCosts, 'XOF')}`}
          href="/depenses?statut=SOUMISE"
          tone="amber"
        />
        <KpiCard
          label="Marge réelle validée"
          value={formatMoney(data.realMargin, 'XOF')}
          sub={`Coûts validés : ${formatMoney(data.validatedCosts, 'XOF')}`}
          href="/rentabilite"
          tone="green"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card title="Évolution commerciale — prospects créés">
          <LineChart data={weeks} />
        </Card>
        <Card title="Missions par statut">
          <DonutChart data={missionStatusDonut} />
        </Card>
        <Card title="Suivi des encaissements (XOF)">
          <BarChart data={paymentWeeks} height={160} />
        </Card>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card
          title="Missions du jour"
          action={<Link href="/missions?vue=jour" className="text-xs font-medium text-cyan-700 hover:underline">Tout voir</Link>}
          padded={false}
        >
          {data.missionsToday.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">Aucune mission prévue aujourd’hui.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.missionsToday.map((m) => (
                <li key={m.id}>
                  <Link href={`/missions/${m.id}`} className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50">
                    <span>
                      <span className="block text-sm font-medium text-gray-800">{m.reference}</span>
                      <span className="block text-xs text-gray-500">{m.origin} → {m.destination}</span>
                    </span>
                    <Badge tone={MISSION_STATUS[m.status].tone}>{MISSION_STATUS[m.status].label}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Décisions en attente"
          action={<Link href="/decisions" className="text-xs font-medium text-cyan-700 hover:underline">Tout voir</Link>}
          padded={false}
        >
          {pendingDecisions.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">Aucune décision en attente.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pendingDecisions.slice(0, 5).map((d) => (
                <li key={d.id}>
                  <Link href={d.href} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                    {d.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Alertes prioritaires"
          action={<Link href="/alertes" className="text-xs font-medium text-cyan-700 hover:underline">Tout voir</Link>}
          padded={false}
        >
          {alerts.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">Aucune alerte active.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {alerts.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link href={a.href} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                    <Badge tone={a.tone}>!</Badge>
                    <span className="truncate">{a.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-5">
        <Card
          title="Dernières activités"
          action={<Link href="/historique" className="text-xs font-medium text-cyan-700 hover:underline">Historique complet</Link>}
          padded={false}
        >
          <ul className="divide-y divide-gray-100">
            {s.activities.slice(0, 6).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-sm text-gray-700">{a.label}</span>
                <span className="text-xs text-gray-400">{formatDateTime(a.at)} · {a.by}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
