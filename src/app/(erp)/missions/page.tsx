'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useErp } from '@/context/erp-store';
import { derivedInvoiceStatus } from '@/lib/erp/calculations';
import { formatDate } from '@/lib/erp/format';
import { CONTROL_STATUS, INVOICE_STATUS, MISSION_STATUS } from '@/lib/erp/labels';
import type { Mission } from '@/lib/erp/types';
import { Badge, DemoNotice, PageHeader } from '@/components/erp/ui';
import { DataTable, type Column } from '@/components/erp/data-table';

function isToday(iso: string) {
  const a = new Date(iso);
  const b = new Date();
  return a.toDateString() === b.toDateString();
}

function MissionsContent() {
  const s = useErp();
  const router = useRouter();
  const params = useSearchParams();
  const vue = params.get('vue');
  const statut = params.get('statut');

  const contactName = (id: string) => s.contacts.find((c) => c.id === id)?.name ?? '—';
  const vehicleName = (id?: string) => s.vehicles.find((v) => v.id === id)?.name ?? '—';
  const driverName = (id?: string) => s.drivers.find((d) => d.id === id)?.name ?? '—';

  const rows = vue === 'jour'
    ? s.missions.filter((m) => isToday(m.plannedDate) && !['ANNULEE', 'CLOTUREE'].includes(m.status))
    : s.missions;

  const billingBadge = (m: Mission) => {
    if (!m.invoiceId) return <Badge tone="gray">Non facturée</Badge>;
    const inv = s.invoices.find((f) => f.id === m.invoiceId);
    if (!inv) return <Badge tone="gray">—</Badge>;
    const st = derivedInvoiceStatus(inv, s.payments);
    return <Badge tone={INVOICE_STATUS[st].tone}>{INVOICE_STATUS[st].label}</Badge>;
  };

  const columns: Column<Mission>[] = [
    { key: 'ref', header: 'Référence', render: (m) => <span className="font-medium text-cyan-800">{m.reference}</span>, sortValue: (m) => m.reference },
    { key: 'client', header: 'Client', render: (m) => contactName(m.contactId), sortValue: (m) => contactName(m.contactId) },
    { key: 'service', header: 'Prestation', render: (m) => m.service, hideOnMobile: true },
    { key: 'route', header: 'Origine → Destination', render: (m) => `${m.origin} → ${m.destination}`, hideOnMobile: true },
    { key: 'date', header: 'Date prévue', render: (m) => formatDate(m.plannedDate), sortValue: (m) => m.plannedDate },
    { key: 'vehicle', header: 'Véhicule', render: (m) => vehicleName(m.vehicleId), hideOnMobile: true },
    { key: 'driver', header: 'Chauffeur', render: (m) => driverName(m.driverId), hideOnMobile: true },
    { key: 'supervisor', header: 'Responsable', render: (m) => m.supervisor, hideOnMobile: true },
    { key: 'status', header: 'Statut', render: (m) => <Badge tone={MISSION_STATUS[m.status].tone}>{MISSION_STATUS[m.status].label}</Badge> },
    { key: 'control', header: 'Contrôle', render: (m) => <Badge tone={CONTROL_STATUS[m.control].tone}>{CONTROL_STATUS[m.control].label}</Badge>, hideOnMobile: true },
    { key: 'billing', header: 'Facturation', render: billingBadge, hideOnMobile: true },
  ];

  return (
    <div>
      <PageHeader
        title="Missions"
        subtitle={vue === 'jour' ? 'Vue filtrée : missions prévues aujourd’hui.' : 'Cœur des opérations GCS — de la planification à la clôture.'}
      />
      <DemoNotice />
      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(m) => `${m.reference} ${contactName(m.contactId)} ${m.service} ${m.origin} ${m.destination}`}
        filters={[
          {
            key: 'statut',
            label: 'Statut',
            options: Object.entries(MISSION_STATUS).map(([v, d]) => ({ value: v, label: d.label })),
            predicate: (m, v) => m.status === v,
          },
          {
            key: 'controle',
            label: 'Contrôle',
            options: Object.entries(CONTROL_STATUS).map(([v, d]) => ({ value: v, label: d.label })),
            predicate: (m, v) => m.control === v,
          },
        ]}
        initialFilter={statut ? { statut } : undefined}
        onRowClick={(m) => router.push(`/missions/${m.id}`)}
      />
    </div>
  );
}

export default function MissionsPage() {
  return (
    <Suspense>
      <MissionsContent />
    </Suspense>
  );
}
