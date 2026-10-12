'use client';

import { useRouter } from 'next/navigation';
import { useErp } from '@/context/erp-store';
import { formatDate } from '@/lib/erp/format';
import type { Contact } from '@/lib/erp/types';
import { Badge, PageHeader } from '@/components/erp/ui';
import { DataTable, type Column } from '@/components/erp/data-table';

export default function ContactsPage() {
  const s = useErp();
  const router = useRouter();

  const columns: Column<Contact>[] = [
    { key: 'name', header: 'Nom', render: (c) => <span className="font-medium text-gray-800">{c.name}</span>, sortValue: (c) => c.name },
    { key: 'company', header: 'Entreprise', render: (c) => c.company ?? '—', hideOnMobile: true },
    { key: 'phone', header: 'Téléphone', render: (c) => c.phone },
    { key: 'email', header: 'E-mail', render: (c) => c.email ?? '—', hideOnMobile: true },
    { key: 'city', header: 'Ville', render: (c) => c.city ?? '—', hideOnMobile: true },
    { key: 'type', header: 'Relation', render: (c) => (c.isClient ? <Badge tone="green">Client</Badge> : <Badge tone="blue">Prospect / contact</Badge>) },
    { key: 'created', header: 'Créé le', render: (c) => formatDate(c.createdAt), sortValue: (c) => c.createdAt, hideOnMobile: true },
  ];

  return (
    <div>
      <PageHeader
        title="Clients et contacts"
        subtitle="Une même identité peut porter plusieurs relations métier (prospect, client, payeur) sans duplication."
      />
      <DataTable
        rows={s.contacts}
        columns={columns}
        searchKeys={(c) => `${c.name} ${c.company ?? ''} ${c.phone} ${c.email ?? ''} ${c.city ?? ''}`}
        filters={[
          {
            key: 'type',
            label: 'Relation',
            options: [
              { value: 'client', label: 'Clients' },
              { value: 'autre', label: 'Prospects / contacts' },
            ],
            predicate: (c, v) => (v === 'client' ? c.isClient : !c.isClient),
          },
        ]}
        onRowClick={(c) => router.push(`/contacts/${c.id}`)}
      />
    </div>
  );
}
