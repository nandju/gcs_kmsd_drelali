'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LEAD_TRANSITIONS, useErp } from '@/context/erp-store';
import { formatDate } from '@/lib/erp/format';
import { LEAD_STATUS } from '@/lib/erp/labels';
import type { Lead, LeadStatus } from '@/lib/erp/types';
import { Badge, Button, PageHeader, Tabs } from '@/components/erp/ui';
import { DataTable, type Column } from '@/components/erp/data-table';
import { Modal } from '@/components/ui/modal/modal';

const STAGES: LeadStatus[] = [
  'NOUVEAU',
  'A_QUALIFIER',
  'BESOIN_IDENTIFIE',
  'COTATION',
  'ENVOYEE',
  'RELANCE',
  'GAGNE',
  'PERDU',
];

function MoveModal({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const { moveLeadStatus, contacts } = useErp();
  if (!lead) return null;
  const options = LEAD_TRANSITIONS[lead.status];
  const contact = contacts.find((c) => c.id === lead.contactId);
  return (
    <Modal
      isOpen={!!lead}
      onClose={onClose}
      title={`Déplacer ${lead.reference}`}
      description={`${contact?.name ?? ''} — seules les transitions métier autorisées sont proposées.`}
      className={{ modal: 'sm:w-[480px] sm:p-8 rounded-2xl' }}
    >
      <div className="mt-5 space-y-2">
        {options.length === 0 && (
          <p className="text-sm text-gray-500">Aucune transition disponible depuis ce statut.</p>
        )}
        {options.map((t) => (
          <Button
            key={t}
            variant={t === 'PERDU' ? 'danger' : 'secondary'}
            className="w-full justify-start"
            onClick={() => {
              moveLeadStatus(lead.id, t, t === 'PERDU' ? 'Perte déclarée depuis le pipeline (démo).' : undefined);
              onClose();
            }}
          >
            → {LEAD_STATUS[t].label}
          </Button>
        ))}
      </div>
    </Modal>
  );
}

export default function PipelinePage() {
  const s = useErp();
  const router = useRouter();
  const [view, setView] = useState('kanban');
  const [moving, setMoving] = useState<Lead | null>(null);

  const contactName = (id: string) => s.contacts.find((c) => c.id === id)?.name ?? '—';

  const columns: Column<Lead>[] = [
    { key: 'ref', header: 'Référence', render: (l) => <span className="font-medium text-cyan-800">{l.reference}</span>, sortValue: (l) => l.reference },
    { key: 'name', header: 'Prospect', render: (l) => contactName(l.contactId) },
    { key: 'service', header: 'Service', render: (l) => l.service, hideOnMobile: true },
    { key: 'status', header: 'Étape', render: (l) => <Badge tone={LEAD_STATUS[l.status].tone}>{LEAD_STATUS[l.status].label}</Badge> },
    { key: 'owner', header: 'Commercial', render: (l) => l.owner, hideOnMobile: true },
    { key: 'created', header: 'Créé le', render: (l) => formatDate(l.createdAt), sortValue: (l) => l.createdAt, hideOnMobile: true },
    {
      key: 'actions',
      header: 'Actions',
      render: (l) => (
        <Button variant="secondary" className="px-2.5 py-1 text-xs" onClick={() => setMoving(l)}>
          Déplacer
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Pipeline commercial"
        subtitle="NOUVEAU → À QUALIFIER → BESOIN IDENTIFIÉ → COTATION → ENVOYÉE → RELANCE → GAGNÉ / PERDU"
      />
      <Tabs
        tabs={[
          { id: 'kanban', label: 'Vue Kanban' },
          { id: 'table', label: 'Vue tableau', count: s.leads.length },
        ]}
        active={view}
        onChange={setView}
      />

      {view === 'kanban' ? (
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3">
            {STAGES.map((stage) => {
              const items = s.leads.filter((l) => l.status === stage);
              return (
                <div key={stage} className="w-64 shrink-0 rounded-xl bg-gray-100/80 p-2">
                  <div className="mb-2 flex items-center justify-between px-1.5 pt-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {LEAD_STATUS[stage].label}
                    </span>
                    <Badge tone={LEAD_STATUS[stage].tone}>{items.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {items.length === 0 && (
                      <p className="px-1.5 py-3 text-center text-xs text-gray-400">Vide</p>
                    )}
                    {items.map((l) => (
                      <div key={l.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-theme-xs">
                        <Link href={`/prospects/${l.id}`} className="block text-sm font-medium text-cyan-800 hover:underline">
                          {l.reference}
                        </Link>
                        <p className="mt-0.5 truncate text-sm text-gray-700">{contactName(l.contactId)}</p>
                        <p className="truncate text-xs text-gray-400">{l.service}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[11px] text-gray-400">{l.owner}</span>
                          {LEAD_TRANSITIONS[l.status].length > 0 && (
                            <button
                              className="rounded px-1.5 py-0.5 text-[11px] font-medium text-cyan-700 hover:bg-cyan-50"
                              onClick={() => setMoving(l)}
                            >
                              Déplacer →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <DataTable
          rows={s.leads}
          columns={columns}
          searchKeys={(l) => `${l.reference} ${contactName(l.contactId)} ${l.service}`}
          onRowClick={(l) => router.push(`/prospects/${l.id}`)}
        />
      )}

      <MoveModal lead={moving} onClose={() => setMoving(null)} />
    </div>
  );
}
