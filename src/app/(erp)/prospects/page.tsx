'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useErp } from '@/context/erp-store';
import { formatDate } from '@/lib/erp/format';
import { LEAD_STATUS } from '@/lib/erp/labels';
import type { Lead } from '@/lib/erp/types';
import { Badge, Button, DemoNotice, Field, inputClass, PageHeader } from '@/components/erp/ui';
import { DataTable, type Column } from '@/components/erp/data-table';
import { Modal } from '@/components/ui/modal/modal';

const SERVICES = [
  'Transport de marchandises',
  'Déménagement résidentiel',
  'Distribution quotidienne',
  'Location de véhicule avec chauffeur',
  'Entreposage',
  'Transport agroalimentaire',
  'Autre service',
];

function NewLeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addLead } = useErp();
  const [form, setForm] = useState({
    name: '', phone: '', whatsapp: '', email: '', service: SERVICES[0],
    origin: '', destination: '', source: 'Appel entrant', referrer: '',
    owner: 'A. Koné', description: '', nextAction: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Le nom du prospect est obligatoire.';
    if (!form.phone.trim()) errs.phone = 'Le téléphone est obligatoire.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Adresse e-mail invalide.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    addLead({
      contact: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || undefined,
        email: form.email.trim() || undefined,
      },
      service: form.service,
      origin: form.origin || undefined,
      destination: form.destination || undefined,
      source: form.source,
      referrer: form.referrer || undefined,
      owner: form.owner,
      description: form.description || undefined,
      nextAction: form.nextAction || undefined,
    });
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Nouveau prospect" description="Création en mode démonstration — aucune donnée n’est enregistrée sur un serveur." className={{ modal: 'sm:w-[640px] sm:p-8 rounded-2xl' }}>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Nom du prospect" required error={errors.name}>
          <input className={inputClass} value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Téléphone" required error={errors.phone}>
          <input className={inputClass} value={form.phone} onChange={set('phone')} placeholder="+225 …" />
        </Field>
        <Field label="WhatsApp">
          <input className={inputClass} value={form.whatsapp} onChange={set('whatsapp')} />
        </Field>
        <Field label="E-mail" error={errors.email}>
          <input className={inputClass} value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Service demandé" required>
          <select className={inputClass} value={form.service} onChange={set('service')}>
            {SERVICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Origine commerciale" required>
          <select className={inputClass} value={form.source} onChange={set('source')}>
            {['Appel entrant', 'Formulaire web', 'Recommandation', 'Prospection terrain', 'Salon professionnel', 'Client existant'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Origine (lieu)">
          <input className={inputClass} value={form.origin} onChange={set('origin')} />
        </Field>
        <Field label="Destination">
          <input className={inputClass} value={form.destination} onChange={set('destination')} />
        </Field>
        <Field label="Apporteur">
          <input className={inputClass} value={form.referrer} onChange={set('referrer')} />
        </Field>
        <Field label="Commercial responsable" required>
          <select className={inputClass} value={form.owner} onChange={set('owner')}>
            {['A. Koné', 'B. N’Guessan'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Prochaine action">
            <input className={inputClass} value={form.nextAction} onChange={set('nextAction')} placeholder="Ex. : appel de qualification" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description de la demande">
            <textarea className={inputClass} rows={3} value={form.description} onChange={set('description')} />
          </Field>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button onClick={submit}>Créer le prospect</Button>
      </div>
    </Modal>
  );
}

function ProspectsContent() {
  const s = useErp();
  const router = useRouter();
  const params = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);

  const vue = params.get('vue');
  const statut = params.get('statut');
  const rows = vue === 'a-qualifier'
    ? s.leads.filter((l) => l.status === 'NOUVEAU' || l.status === 'A_QUALIFIER')
    : s.leads;

  const contactName = (id: string) => s.contacts.find((c) => c.id === id)?.name ?? '—';
  const contactPhone = (id: string) => s.contacts.find((c) => c.id === id)?.phone ?? '—';
  const contactWhatsapp = (id: string) => s.contacts.find((c) => c.id === id)?.whatsapp ?? '—';

  const columns: Column<Lead>[] = [
    { key: 'ref', header: 'Référence', render: (l) => <span className="font-medium text-cyan-800">{l.reference}</span>, sortValue: (l) => l.reference },
    { key: 'name', header: 'Prospect', render: (l) => contactName(l.contactId), sortValue: (l) => contactName(l.contactId) },
    { key: 'phone', header: 'Téléphone', render: (l) => contactPhone(l.contactId), hideOnMobile: true },
    { key: 'whatsapp', header: 'WhatsApp', render: (l) => contactWhatsapp(l.contactId), hideOnMobile: true },
    { key: 'service', header: 'Service demandé', render: (l) => l.service, hideOnMobile: true },
    { key: 'source', header: 'Origine', render: (l) => l.source, hideOnMobile: true },
    { key: 'referrer', header: 'Apporteur', render: (l) => l.referrer ?? '—', hideOnMobile: true },
    { key: 'owner', header: 'Commercial', render: (l) => l.owner, hideOnMobile: true },
    { key: 'status', header: 'Statut', render: (l) => <Badge tone={LEAD_STATUS[l.status].tone}>{LEAD_STATUS[l.status].label}</Badge> },
    { key: 'next', header: 'Prochaine action', render: (l) => l.nextAction ?? '—', hideOnMobile: true },
    { key: 'created', header: 'Créé le', render: (l) => formatDate(l.createdAt), sortValue: (l) => l.createdAt },
  ];

  return (
    <div>
      <PageHeader
        title="Prospects"
        subtitle={vue === 'a-qualifier' ? 'Vue filtrée : prospects à qualifier (nouveaux et à qualifier).' : 'Toutes les demandes commerciales entrantes.'}
        action={<Button onClick={() => setModalOpen(true)}>+ Nouveau prospect</Button>}
      />
      <DemoNotice />
      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(l) => `${l.reference} ${contactName(l.contactId)} ${l.service} ${l.source} ${l.owner}`}
        filters={[
          {
            key: 'statut',
            label: 'Statut',
            options: Object.entries(LEAD_STATUS).map(([v, d]) => ({ value: v, label: d.label })),
            predicate: (l, v) => l.status === v,
          },
          {
            key: 'owner',
            label: 'Commercial',
            options: [...new Set(s.leads.map((l) => l.owner))].map((o) => ({ value: o, label: o })),
            predicate: (l, v) => l.owner === v,
          },
        ]}
        initialFilter={statut ? { statut } : undefined}
        onRowClick={(l) => router.push(`/prospects/${l.id}`)}
        emptyTitle="Aucun prospect"
        emptyDescription="Créez un prospect ou modifiez vos filtres."
      />
      <NewLeadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default function ProspectsPage() {
  return (
    <Suspense>
      <ProspectsContent />
    </Suspense>
  );
}
