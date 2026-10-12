'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LEAD_TRANSITIONS, useErp } from '@/context/erp-store';
import { formatDate, formatDateTime } from '@/lib/erp/format';
import { LEAD_STATUS, QUOTE_STATUS } from '@/lib/erp/labels';
import type { LeadStatus } from '@/lib/erp/types';
import { Badge, Button, Card, ConfirmButton, EmptyState, Field, inputClass, LinkButton, PageHeader } from '@/components/erp/ui';
import { Modal } from '@/components/ui/modal/modal';
import { currentVersion } from '@/lib/erp/calculations';
import { formatMoney } from '@/lib/erp/format';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const s = useErp();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');

  const lead = s.leads.find((l) => l.id === id);
  const contact = lead && s.contacts.find((c) => c.id === lead.contactId);
  const [editForm, setEditForm] = useState({ nextAction: '', owner: '', description: '' });

  if (!lead || !contact) {
    return <EmptyState title="Prospect introuvable" description="Ce prospect n’existe pas dans les données de démonstration." action={<LinkButton href="/prospects">Retour à la liste</LinkButton>} />;
  }

  const quotes = s.quotes.filter((q) => q.leadId === lead.id);
  const transitions = LEAD_TRANSITIONS[lead.status].filter((t) => t !== 'PERDU');

  return (
    <div>
      <PageHeader
        title={`${lead.reference} — ${contact.name}`}
        subtitle={<Badge tone={LEAD_STATUS[lead.status].tone}>{LEAD_STATUS[lead.status].label}</Badge>}
        action={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setEditForm({ nextAction: lead.nextAction ?? '', owner: lead.owner, description: lead.description ?? '' });
                setEditOpen(true);
              }}
            >
              Modifier
            </Button>
            {transitions.map((t) => (
              <ConfirmButton
                key={t}
                label={`→ ${LEAD_STATUS[t as LeadStatus].label}`}
                title="Changer le statut du prospect"
                description={`Passer ${lead.reference} au statut « ${LEAD_STATUS[t as LeadStatus].label} » ? Action simulée en mode démonstration.`}
                onConfirm={() => s.moveLeadStatus(lead.id, t as LeadStatus)}
              />
            ))}
            {LEAD_TRANSITIONS[lead.status].includes('PERDU') && (
              <Button variant="danger" onClick={() => setLostOpen(true)}>Marquer perdu</Button>
            )}
            {(lead.status === 'BESOIN_IDENTIFIE' || lead.status === 'COTATION') && (
              <LinkButton href={`/cotations?nouveau=${lead.id}`} variant="primary">Créer une cotation</LinkButton>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Demande commerciale" className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            <div><dt className="text-gray-400">Service</dt><dd className="font-medium text-gray-800">{lead.service}</dd></div>
            <div><dt className="text-gray-400">Origine</dt><dd className="font-medium text-gray-800">{lead.origin ?? '—'}</dd></div>
            <div><dt className="text-gray-400">Destination</dt><dd className="font-medium text-gray-800">{lead.destination ?? '—'}</dd></div>
            <div><dt className="text-gray-400">Origine commerciale</dt><dd className="font-medium text-gray-800">{lead.source}</dd></div>
            <div><dt className="text-gray-400">Apporteur</dt><dd className="font-medium text-gray-800">{lead.referrer ?? '—'}</dd></div>
            <div><dt className="text-gray-400">Commercial</dt><dd className="font-medium text-gray-800">{lead.owner}</dd></div>
            <div><dt className="text-gray-400">Créé le</dt><dd className="font-medium text-gray-800">{formatDate(lead.createdAt)}</dd></div>
            <div><dt className="text-gray-400">Prochaine action</dt><dd className="font-medium text-gray-800">{lead.nextAction ?? '—'}</dd></div>
            <div><dt className="text-gray-400">Échéance action</dt><dd className="font-medium text-gray-800">{formatDate(lead.nextActionDate)}</dd></div>
          </dl>
          {lead.description && <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{lead.description}</p>}
          {lead.status === 'PERDU' && lead.lostReason && (
            <p className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              Motif de perte : {lead.lostReason}
            </p>
          )}
        </Card>

        <Card title="Contact">
          <dl className="space-y-2.5 text-sm">
            <div><dt className="text-gray-400">Nom</dt><dd className="font-medium text-gray-800"><Link href={`/contacts/${contact.id}`} className="text-cyan-800 hover:underline">{contact.name}</Link></dd></div>
            {contact.company && <div><dt className="text-gray-400">Entreprise</dt><dd className="font-medium text-gray-800">{contact.company}</dd></div>}
            <div><dt className="text-gray-400">Téléphone</dt><dd className="font-medium text-gray-800">{contact.phone}</dd></div>
            <div><dt className="text-gray-400">WhatsApp</dt><dd className="font-medium text-gray-800">{contact.whatsapp ?? '—'}</dd></div>
            <div><dt className="text-gray-400">E-mail</dt><dd className="font-medium text-gray-800">{contact.email ?? '—'}</dd></div>
            <div><dt className="text-gray-400">Ville</dt><dd className="font-medium text-gray-800">{contact.city ?? '—'}</dd></div>
          </dl>
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Cotations liées" padded={false}>
          {quotes.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">Aucune cotation liée à ce prospect.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {quotes.map((q) => (
                <li key={q.id}>
                  <button className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50" onClick={() => router.push(`/cotations/${q.id}`)}>
                    <span className="text-sm font-medium text-cyan-800">{q.reference} — V{currentVersion(q).version}</span>
                    <span className="text-sm text-gray-500">{formatMoney(currentVersion(q).proposedPrice, q.currency)}</span>
                    <Badge tone={QUOTE_STATUS[q.status].tone}>{QUOTE_STATUS[q.status].label}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Modale de modification */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Modifier le prospect" className={{ modal: 'sm:w-[520px] sm:p-8 rounded-2xl' }}>
        <div className="mt-5 space-y-4">
          <Field label="Commercial responsable">
            <select className={inputClass} value={editForm.owner} onChange={(e) => setEditForm((f) => ({ ...f, owner: e.target.value }))}>
              {['A. Koné', 'B. N’Guessan'].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Prochaine action">
            <input className={inputClass} value={editForm.nextAction} onChange={(e) => setEditForm((f) => ({ ...f, nextAction: e.target.value }))} />
          </Field>
          <Field label="Description">
            <textarea className={inputClass} rows={3} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(false)}>Annuler</Button>
          <Button onClick={() => { s.updateLead(lead.id, editForm); setEditOpen(false); }}>Enregistrer</Button>
        </div>
      </Modal>

      {/* Modale perte */}
      <Modal isOpen={lostOpen} onClose={() => setLostOpen(false)} title="Marquer le prospect comme perdu" description="Indiquez le motif de perte pour l’historique commercial." className={{ modal: 'sm:w-[480px] sm:p-8 rounded-2xl' }}>
        <div className="mt-5">
          <Field label="Motif de perte" required>
            <textarea className={inputClass} rows={3} value={lostReason} onChange={(e) => setLostReason(e.target.value)} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setLostOpen(false)}>Annuler</Button>
          <Button
            variant="danger"
            disabled={!lostReason.trim()}
            onClick={() => {
              s.moveLeadStatus(lead.id, 'PERDU', lostReason.trim());
              setLostOpen(false);
            }}
          >
            Confirmer la perte
          </Button>
        </div>
      </Modal>

      <p className="mt-4 text-xs text-gray-400">Dernière consultation : {formatDateTime(new Date().toISOString())} — données de démonstration.</p>
    </div>
  );
}
