'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useErp } from '@/context/erp-store';
import { derivedInvoiceStatus, invoiceBalance, invoicePaidAmount, invoiceTotal, isOverdue } from '@/lib/erp/calculations';
import { formatDate, formatMoney } from '@/lib/erp/format';
import { INVOICE_STATUS } from '@/lib/erp/labels';
import type { Invoice } from '@/lib/erp/types';
import { Badge, DemoNotice, PageHeader } from '@/components/erp/ui';
import { DataTable, type Column } from '@/components/erp/data-table';

function InvoicesContent() {
  const s = useErp();
  const router = useRouter();
  const params = useSearchParams();
  const vue = params.get('vue');

  const contactName = (id: string) => s.contacts.find((c) => c.id === id)?.name ?? '—';

  const rows = vue === 'impayees'
    ? s.invoices.filter((f) => {
        const st = derivedInvoiceStatus(f, s.payments);
        return (st === 'EMISE' || st === 'PARTIELLEMENT_PAYEE') && invoiceBalance(f, s.payments) > 0;
      })
    : s.invoices;

  const columns: Column<Invoice>[] = [
    { key: 'ref', header: 'Référence', render: (f) => <span className="font-medium text-cyan-800">{f.reference}</span>, sortValue: (f) => f.reference },
    { key: 'client', header: 'Client', render: (f) => contactName(f.contactId), sortValue: (f) => contactName(f.contactId) },
    { key: 'mission', header: 'Mission', render: (f) => s.missions.find((m) => m.id === f.missionId)?.reference ?? '—', hideOnMobile: true },
    { key: 'total', header: 'Montant', render: (f) => <span className="font-medium">{formatMoney(invoiceTotal(f), f.currency)}</span>, sortValue: (f) => invoiceTotal(f) },
    { key: 'paid', header: 'Payé', render: (f) => formatMoney(invoicePaidAmount(f, s.payments), f.currency), hideOnMobile: true },
    { key: 'balance', header: 'Solde', render: (f) => <span className={invoiceBalance(f, s.payments) > 0 ? 'font-medium text-red-600' : 'text-gray-400'}>{formatMoney(invoiceBalance(f, s.payments), f.currency)}</span>, sortValue: (f) => invoiceBalance(f, s.payments) },
    { key: 'issued', header: 'Émise le', render: (f) => formatDate(f.issuedAt), sortValue: (f) => f.issuedAt ?? '', hideOnMobile: true },
    { key: 'due', header: 'Échéance', render: (f) => formatDate(f.dueDate), hideOnMobile: true },
    {
      key: 'status',
      header: 'Statut',
      render: (f) => {
        const st = derivedInvoiceStatus(f, s.payments);
        return (
          <span className="flex flex-wrap items-center gap-1">
            <Badge tone={INVOICE_STATUS[st].tone}>{INVOICE_STATUS[st].label}</Badge>
            {isOverdue(f, s.payments) && <Badge tone="red">Échue</Badge>}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Factures"
        subtitle={vue === 'impayees' ? 'Vue filtrée : factures émises avec solde restant dû.' : '« Échue » est une condition calculée (échéance dépassée + solde positif), distincte du statut.'}
      />
      <DemoNotice />
      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(f) => `${f.reference} ${contactName(f.contactId)}`}
        filters={[
          {
            key: 'statut',
            label: 'Statut',
            options: Object.entries(INVOICE_STATUS).map(([v, d]) => ({ value: v, label: d.label })),
            predicate: (f, v) => derivedInvoiceStatus(f, s.payments) === v,
          },
        ]}
        onRowClick={(f) => router.push(`/factures/${f.id}`)}
      />
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense>
      <InvoicesContent />
    </Suspense>
  );
}
