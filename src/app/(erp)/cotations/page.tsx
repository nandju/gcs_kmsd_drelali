'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useErp } from '@/context/erp-store';
import { currentVersion } from '@/lib/erp/calculations';
import { formatDate, formatMoney } from '@/lib/erp/format';
import { QUOTE_STATUS } from '@/lib/erp/labels';
import type { Quote, QuoteLine } from '@/lib/erp/types';
import { Badge, Button, DemoNotice, Field, inputClass, PageHeader } from '@/components/erp/ui';
import { DataTable, type Column } from '@/components/erp/data-table';
import { Modal } from '@/components/ui/modal/modal';
import { newQuoteLine, QuoteLinesEditor } from '@/components/erp/quote-lines-editor';

function NewQuoteModal({ open, onClose, leadId }: { open: boolean; onClose: () => void; leadId?: string | null }) {
  const s = useErp();
  const router = useRouter();
  const lead = s.leads.find((l) => l.id === leadId);
  const [form, setForm] = useState({
    contactId: '', service: '', origin: '', destination: '',
    validityDays: 30, conditions: 'Validité 30 jours. Paiement à 15 jours (démonstration).',
    internalNotes: '', estimatedCost: 0, floorPrice: 0, commercialPrice: 0, owner: 'A. Koné',
  });
  const [lines, setLines] = useState<QuoteLine[]>([newQuoteLine()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (lead) {
      setForm((f) => ({
        ...f,
        contactId: lead.contactId,
        service: lead.service,
        origin: lead.origin ?? '',
        destination: lead.destination ?? '',
        owner: lead.owner,
      }));
    }
  }, [lead]);

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!form.contactId) errs.contactId = 'Sélectionnez un prospect ou un client.';
    if (!form.service.trim()) errs.service = 'Le service est obligatoire.';
    if (lines.some((l) => !l.label.trim() || l.unitPrice <= 0)) errs.lines = 'Chaque ligne doit avoir une désignation et un prix unitaire positif.';
    const total = lines.reduce((x, l) => x + l.quantity * l.unitPrice, 0);
    if (form.floorPrice > 0 && total < form.floorPrice) {
      errs.floor = `Le prix proposé (${formatMoney(total, 'XOF')}) est sous le prix plancher — une autorisation de la direction serait requise (règle de démonstration).`;
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const quote = s.createQuote({
      contactId: form.contactId,
      leadId: lead?.id,
      service: form.service,
      origin: form.origin || undefined,
      destination: form.destination || undefined,
      lines,
      validityDate: new Date(Date.now() + form.validityDays * 86400000).toISOString(),
      conditions: form.conditions,
      internalNotes: form.internalNotes || undefined,
      estimatedCost: form.estimatedCost,
      floorPrice: form.floorPrice,
      commercialPrice: form.commercialPrice,
      owner: form.owner,
    });
    onClose();
    router.push(`/cotations/${quote.id}`);
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Nouvelle cotation" description="Les valeurs internes (coût estimé, prix plancher, prix commercial) n’apparaissent jamais dans l’aperçu client." className={{ modal: 'sm:w-[760px] sm:p-8 rounded-2xl max-h-[90vh] overflow-y-auto' }}>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Prospect / client" required error={errors.contactId}>
          <select className={inputClass} value={form.contactId} onChange={(e) => setForm((f) => ({ ...f, contactId: e.target.value }))}>
            <option value="">— Sélectionner —</option>
            {s.contacts.map((c) => <option key={c.id} value={c.id}>{c.name}{c.isClient ? ' (client)' : ''}</option>)}
          </select>
        </Field>
        <Field label="Service" required error={errors.service}>
          <input className={inputClass} value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))} />
        </Field>
        <Field label="Origine">
          <input className={inputClass} value={form.origin} onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))} />
        </Field>
        <Field label="Destination">
          <input className={inputClass} value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} />
        </Field>
      </div>

      <h4 className="mb-2 mt-5 text-sm font-semibold text-gray-700">Lignes de cotation</h4>
      {errors.lines && <p className="mb-2 text-xs text-red-600">{errors.lines}</p>}
      <QuoteLinesEditor lines={lines} onChange={setLines} />
      {errors.floor && <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">{errors.floor}</p>}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field label="Coût estimé (interne)" hint="Visible en interne uniquement">
          <input type="number" min={0} className={inputClass} value={form.estimatedCost} onChange={(e) => setForm((f) => ({ ...f, estimatedCost: parseInt(e.target.value) || 0 }))} />
        </Field>
        <Field label="Prix plancher (interne)">
          <input type="number" min={0} className={inputClass} value={form.floorPrice} onChange={(e) => setForm((f) => ({ ...f, floorPrice: parseInt(e.target.value) || 0 }))} />
        </Field>
        <Field label="Prix commercial (interne)">
          <input type="number" min={0} className={inputClass} value={form.commercialPrice} onChange={(e) => setForm((f) => ({ ...f, commercialPrice: parseInt(e.target.value) || 0 }))} />
        </Field>
        <Field label="Validité (jours)">
          <input type="number" min={1} className={inputClass} value={form.validityDays} onChange={(e) => setForm((f) => ({ ...f, validityDays: Math.max(1, parseInt(e.target.value) || 30) }))} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Conditions commerciales (visibles par le client)">
            <input className={inputClass} value={form.conditions} onChange={(e) => setForm((f) => ({ ...f, conditions: e.target.value }))} />
          </Field>
        </div>
        <div className="sm:col-span-3">
          <Field label="Notes internes (jamais visibles par le client)">
            <textarea className={inputClass} rows={2} value={form.internalNotes} onChange={(e) => setForm((f) => ({ ...f, internalNotes: e.target.value }))} />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button onClick={submit}>Créer la cotation</Button>
      </div>
    </Modal>
  );
}

function QuotesContent() {
  const s = useErp();
  const router = useRouter();
  const params = useSearchParams();
  const leadParam = params.get('nouveau');
  const statut = params.get('statut');
  const [modalOpen, setModalOpen] = useState(!!leadParam);

  const contactName = (id: string) => s.contacts.find((c) => c.id === id)?.name ?? '—';

  const columns: Column<Quote>[] = [
    { key: 'ref', header: 'Référence', render: (q) => <span className="font-medium text-cyan-800">{q.reference}</span>, sortValue: (q) => q.reference },
    { key: 'version', header: 'Version', render: (q) => <Badge tone="gray">V{currentVersion(q).version}</Badge> },
    { key: 'client', header: 'Client', render: (q) => contactName(q.contactId), sortValue: (q) => contactName(q.contactId) },
    { key: 'service', header: 'Service', render: (q) => q.service, hideOnMobile: true },
    { key: 'amount', header: 'Montant proposé', render: (q) => <span className="font-medium">{formatMoney(currentVersion(q).proposedPrice, q.currency)}</span>, sortValue: (q) => currentVersion(q).proposedPrice },
    { key: 'currency', header: 'Devise', render: (q) => q.currency, hideOnMobile: true },
    { key: 'issued', header: 'Émise le', render: (q) => formatDate(q.issuedAt), sortValue: (q) => q.issuedAt, hideOnMobile: true },
    { key: 'validity', header: 'Validité', render: (q) => formatDate(currentVersion(q).validityDate), hideOnMobile: true },
    { key: 'status', header: 'Statut', render: (q) => <Badge tone={QUOTE_STATUS[q.status].tone}>{QUOTE_STATUS[q.status].label}</Badge> },
    { key: 'owner', header: 'Commercial', render: (q) => q.owner, hideOnMobile: true },
  ];

  return (
    <div>
      <PageHeader
        title="Cotations"
        subtitle="Gestion des cotations commerciales avec versionnement."
        action={<Button onClick={() => setModalOpen(true)}>+ Nouvelle cotation</Button>}
      />
      <DemoNotice />
      <DataTable
        rows={s.quotes}
        columns={columns}
        searchKeys={(q) => `${q.reference} ${contactName(q.contactId)} ${q.service} ${q.owner}`}
        filters={[
          {
            key: 'statut',
            label: 'Statut',
            options: Object.entries(QUOTE_STATUS).map(([v, d]) => ({ value: v, label: d.label })),
            predicate: (q, v) => q.status === v,
          },
        ]}
        initialFilter={statut ? { statut } : undefined}
        onRowClick={(q) => router.push(`/cotations/${q.id}`)}
      />
      <NewQuoteModal open={modalOpen} onClose={() => setModalOpen(false)} leadId={leadParam} />
    </div>
  );
}

export default function QuotesPage() {
  return (
    <Suspense>
      <QuotesContent />
    </Suspense>
  );
}
