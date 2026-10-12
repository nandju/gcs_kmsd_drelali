'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useErp } from '@/context/erp-store';
import { formatDateTime, formatMoney } from '@/lib/erp/format';
import { CONTROL_STATUS, EXPENSE_STATUS, PROOF_RESULT } from '@/lib/erp/labels';
import { Badge, Button, Card, ConfirmButton, DemoNotice, EmptyState, Field, inputClass, PageHeader } from '@/components/erp/ui';
import { Modal } from '@/components/ui/modal/modal';
import { toast } from 'sonner';

export default function ControlPage() {
  const s = useErp();
  const [correctionFor, setCorrectionFor] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const toControl = s.missions.filter((m) => m.status === 'A_CONTROLER');

  return (
    <div>
      <PageHeader
        title="Missions à contrôler"
        subtitle="Vérification des preuves, incidents et dépenses avant facturation. Une mission contrôlée n’est ni payée, ni facturée, ni clôturée automatiquement."
      />
      <DemoNotice />
      {toControl.length === 0 ? (
        <EmptyState title="Aucune mission en attente de contrôle" description="Les missions terminées par le terrain apparaîtront ici." />
      ) : (
        <div className="space-y-4">
          {toControl.map((m) => {
            const contact = s.contacts.find((c) => c.id === m.contactId);
            const proofs = s.proofs.filter((p) => p.missionId === m.id);
            const incidents = s.incidents.filter((i) => i.missionId === m.id);
            const expenses = s.expenses.filter((e) => e.missionId === m.id);
            return (
              <Card key={m.id} padded={false}>
                <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <Link href={`/missions/${m.id}`} className="text-sm font-bold text-cyan-800 hover:underline">{m.reference}</Link>
                  <span className="text-sm text-gray-600">{contact?.name} · {m.service}</span>
                  <Badge tone={CONTROL_STATUS[m.control].tone}>{CONTROL_STATUS[m.control].label}</Badge>
                </div>
                <div className="grid gap-4 px-4 py-4 md:grid-cols-3">
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Preuves ({proofs.length})</p>
                    {proofs.length === 0 ? <p className="text-sm text-amber-600">Aucune preuve remontée.</p> : proofs.map((p) => (
                      <p key={p.id} className="text-sm text-gray-600">
                        <Badge tone={PROOF_RESULT[p.result].tone}>{PROOF_RESULT[p.result].label}</Badge>{' '}
                        {p.receiverName ?? '—'} · <span className="text-xs text-gray-400">{formatDateTime(p.at)}</span>
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Incidents ({incidents.length})</p>
                    {incidents.length === 0 ? <p className="text-sm text-gray-400">Aucun incident.</p> : incidents.map((i) => (
                      <p key={i.id} className="text-sm text-gray-600">{i.reference} — {i.type}</p>
                    ))}
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Dépenses soumises</p>
                    {expenses.length === 0 ? <p className="text-sm text-gray-400">Aucune dépense.</p> : expenses.map((e) => (
                      <p key={e.id} className="flex items-center justify-between gap-2 text-sm text-gray-600">
                        <span>{e.category}</span>
                        <span className="flex items-center gap-1.5">
                          {formatMoney(e.amount, e.currency)}
                          <Badge tone={EXPENSE_STATUS[e.status].tone}>{EXPENSE_STATUS[e.status].label}</Badge>
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 px-4 py-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      s.controlAction(m.id, 'VERIFIER');
                      toast.info(`Preuves de ${m.reference} passées en revue (démonstration).`);
                    }}
                  >
                    Vérifier les preuves
                  </Button>
                  <Button variant="secondary" onClick={() => { setCorrectionFor(m.id); setNote(''); }}>
                    Demander une correction
                  </Button>
                  <ConfirmButton
                    label="Bloquer le contrôle"
                    variant="danger"
                    title="Bloquer le contrôle"
                    description="Le contrôle sera bloqué en attente d’une résolution (simulation)."
                    onConfirm={() => s.controlAction(m.id, 'BLOQUER')}
                  />
                  <ConfirmButton
                    label="Confirmer le contrôle"
                    title="Confirmer le contrôle"
                    description="La mission passera au statut Contrôlée. Elle ne sera ni facturée ni clôturée automatiquement (simulation)."
                    onConfirm={() => s.controlAction(m.id, 'CONFIRMER')}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!correctionFor} onClose={() => setCorrectionFor(null)} title="Demander une correction" description="Précisez ce que le terrain doit corriger ou compléter." className={{ modal: 'sm:w-[480px] sm:p-8 rounded-2xl' }}>
        <div className="mt-5">
          <Field label="Détail de la correction demandée" required>
            <textarea className={inputClass} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCorrectionFor(null)}>Annuler</Button>
          <Button
            disabled={!note.trim()}
            onClick={() => {
              if (correctionFor) s.controlAction(correctionFor, 'CORRECTION', note.trim());
              setCorrectionFor(null);
            }}
          >
            Envoyer la demande
          </Button>
        </div>
      </Modal>
    </div>
  );
}
