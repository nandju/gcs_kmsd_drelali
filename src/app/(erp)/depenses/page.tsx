'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useErp } from '@/context/erp-store';
import { formatDate, formatMoney } from '@/lib/erp/format';
import { EXPENSE_STATUS } from '@/lib/erp/labels';
import type { Expense } from '@/lib/erp/types';
import { Badge, Button, ConfirmButton, DemoNotice, Field, inputClass, PageHeader } from '@/components/erp/ui';
import { DataTable, type Column } from '@/components/erp/data-table';
import { Modal } from '@/components/ui/modal/modal';

function NewExpenseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useErp();
  const [form, setForm] = useState({ missionId: '', category: 'Carburant', description: '', amount: 0, agent: 'K. Assi' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const errs: Record<string, string> = {};
    if (form.amount <= 0) errs.amount = 'Le montant doit être positif.';
    if (!form.description.trim()) errs.description = 'La description est obligatoire.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    s.addExpense({
      missionId: form.missionId || undefined,
      category: form.category,
      description: form.description.trim(),
      amount: form.amount,
      currency: 'XOF',
      agent: form.agent,
      date: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Nouvelle dépense" description="La dépense sera soumise à validation avant d’entrer dans la marge réelle." className={{ modal: 'sm:w-[520px] sm:p-8 rounded-2xl' }}>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Mission">
          <select className={inputClass} value={form.missionId} onChange={(e) => setForm((f) => ({ ...f, missionId: e.target.value }))}>
            <option value="">— Hors mission —</option>
            {s.missions.map((m) => <option key={m.id} value={m.id}>{m.reference}</option>)}
          </select>
        </Field>
        <Field label="Catégorie" required>
          <select className={inputClass} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            {['Carburant', 'Péage', 'Manutention', 'Stationnement', 'Réparation', 'Salaires journaliers', 'Divers'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Montant (XOF)" required error={errors.amount}>
          <input type="number" min={1} className={inputClass} value={form.amount || ''} onChange={(e) => setForm((f) => ({ ...f, amount: parseInt(e.target.value) || 0 }))} />
        </Field>
        <Field label="Agent" required>
          <select className={inputClass} value={form.agent} onChange={(e) => setForm((f) => ({ ...f, agent: e.target.value }))}>
            {[...s.drivers.map((d) => d.name), 'K. Assi', 'Service finances'].map((a) => <option key={a}>{a}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description" required error={errors.description}>
            <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Justificatif" hint="L’ajout de pièce jointe est simulé (nom de fichier uniquement).">
            <input className={inputClass} placeholder="ex. recu-carburant.jpg" />
          </Field>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button onClick={submit}>Soumettre la dépense</Button>
      </div>
    </Modal>
  );
}

function ExpensesContent() {
  const s = useErp();
  const params = useSearchParams();
  const statut = params.get('statut');
  const [modalOpen, setModalOpen] = useState(false);

  const missionRef = (id?: string) => s.missions.find((m) => m.id === id);

  const columns: Column<Expense>[] = [
    { key: 'ref', header: 'Référence', render: (e) => <span className="font-medium text-cyan-800">{e.reference}</span>, sortValue: (e) => e.reference },
    {
      key: 'mission',
      header: 'Mission',
      render: (e) => {
        const m = missionRef(e.missionId);
        return m ? <Link href={`/missions/${m.id}`} className="text-cyan-800 hover:underline">{m.reference}</Link> : <span className="text-gray-400">Hors mission</span>;
      },
      hideOnMobile: true,
    },
    { key: 'category', header: 'Catégorie', render: (e) => e.category },
    { key: 'desc', header: 'Description', render: (e) => e.description, hideOnMobile: true },
    { key: 'amount', header: 'Montant', render: (e) => <span className="font-medium">{formatMoney(e.amount, e.currency)}</span>, sortValue: (e) => e.amount },
    { key: 'agent', header: 'Agent', render: (e) => e.agent, hideOnMobile: true },
    { key: 'date', header: 'Date', render: (e) => formatDate(e.date), sortValue: (e) => e.date, hideOnMobile: true },
    { key: 'receipt', header: 'Justificatif', render: (e) => e.receiptName ?? <span className="text-gray-400">—</span>, hideOnMobile: true },
    { key: 'status', header: 'Validation', render: (e) => <Badge tone={EXPENSE_STATUS[e.status].tone}>{EXPENSE_STATUS[e.status].label}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (e) =>
        e.status === 'SOUMISE' ? (
          <span className="flex gap-1.5">
            <ConfirmButton
              label="Valider"
              title={`Valider ${e.reference}`}
              description="La dépense entrera dans le calcul de la marge réelle (simulation)."
              onConfirm={() => s.expenseAction(e.id, 'VALIDER')}
              className="px-2.5 py-1 text-xs"
            />
            <ConfirmButton
              label="Rejeter"
              variant="danger"
              title={`Rejeter ${e.reference}`}
              description="La dépense sera rejetée et exclue de la marge (simulation)."
              onConfirm={() => s.expenseAction(e.id, 'REJETER')}
              className="px-2.5 py-1 text-xs"
            />
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dépenses"
        subtitle="Une dépense soumise n’entre dans la marge réelle qu’après validation."
        action={<Button onClick={() => setModalOpen(true)}>+ Nouvelle dépense</Button>}
      />
      <DemoNotice />
      <DataTable
        rows={s.expenses}
        columns={columns}
        searchKeys={(e) => `${e.reference} ${e.category} ${e.description} ${e.agent} ${missionRef(e.missionId)?.reference ?? ''}`}
        filters={[
          {
            key: 'statut',
            label: 'Validation',
            options: Object.entries(EXPENSE_STATUS).map(([v, d]) => ({ value: v, label: d.label })),
            predicate: (e, v) => e.status === v,
          },
        ]}
        initialFilter={statut ? { statut } : undefined}
      />
      <NewExpenseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense>
      <ExpensesContent />
    </Suspense>
  );
}
