'use client';

import { useState } from 'react';
import { useErp } from '@/context/erp-store';
import { derivedInvoiceStatus, invoiceBalance, paymentAllocated, paymentUnallocated } from '@/lib/erp/calculations';
import { formatDateTime, formatMoney } from '@/lib/erp/format';
import { PAYMENT_METHOD, PAYMENT_STATUS } from '@/lib/erp/labels';
import type { Payment, PaymentMethod } from '@/lib/erp/types';
import { Badge, Button, Card, DemoNotice, Field, inputClass, PageHeader } from '@/components/erp/ui';
import { DataTable, type Column } from '@/components/erp/data-table';
import { Modal } from '@/components/ui/modal/modal';

function NewPaymentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useErp();
  const [form, setForm] = useState({ contactId: '', amount: 0, method: 'VIREMENT' as PaymentMethod, account: 'Banque principale', invoiceId: '', allocAmount: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clientInvoices = s.invoices.filter(
    (f) => f.contactId === form.contactId && (derivedInvoiceStatus(f, s.payments) === 'EMISE' || derivedInvoiceStatus(f, s.payments) === 'PARTIELLEMENT_PAYEE'),
  );
  const selectedInvoice = s.invoices.find((f) => f.id === form.invoiceId);

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!form.contactId) errs.contactId = 'Sélectionnez le payeur.';
    if (form.amount <= 0) errs.amount = 'Le montant doit être positif.';
    if (form.invoiceId) {
      if (form.allocAmount <= 0) errs.allocAmount = 'Précisez le montant alloué.';
      if (form.allocAmount > form.amount) errs.allocAmount = 'L’allocation dépasse le montant du paiement.';
      if (selectedInvoice && form.allocAmount > invoiceBalance(selectedInvoice, s.payments))
        errs.allocAmount = `Solde restant de la facture : ${formatMoney(invoiceBalance(selectedInvoice, s.payments), 'XOF')}.`;
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    s.addPayment({
      contactId: form.contactId,
      amount: form.amount,
      method: form.method,
      account: form.account,
      allocations: form.invoiceId && form.allocAmount > 0 ? [{ invoiceId: form.invoiceId, amount: form.allocAmount }] : [],
    });
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Enregistrer un paiement" description="Simulation locale — aucune transaction financière réelle n’est effectuée." className={{ modal: 'sm:w-[560px] sm:p-8 rounded-2xl' }}>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Payeur" required error={errors.contactId}>
          <select className={inputClass} value={form.contactId} onChange={(e) => setForm((f) => ({ ...f, contactId: e.target.value, invoiceId: '' }))}>
            <option value="">— Sélectionner —</option>
            {s.contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Montant reçu (XOF)" required error={errors.amount}>
          <input type="number" min={1} className={inputClass} value={form.amount || ''} onChange={(e) => setForm((f) => ({ ...f, amount: parseInt(e.target.value) || 0 }))} />
        </Field>
        <Field label="Mode de paiement" required>
          <select className={inputClass} value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value as PaymentMethod }))}>
            {Object.entries(PAYMENT_METHOD).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Compte de réception" required>
          <select className={inputClass} value={form.account} onChange={(e) => setForm((f) => ({ ...f, account: e.target.value }))}>
            {['Banque principale', 'Mobile money société', 'Caisse Abidjan'].map((a) => <option key={a}>{a}</option>)}
          </select>
        </Field>
      </div>
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/60 p-3">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Affectation immédiate (facultative)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Facture à solder">
            <select className={inputClass} value={form.invoiceId} onChange={(e) => {
              const inv = s.invoices.find((f) => f.id === e.target.value);
              setForm((f) => ({ ...f, invoiceId: e.target.value, allocAmount: inv ? Math.min(invoiceBalance(inv, s.payments), f.amount || invoiceBalance(inv, s.payments)) : 0 }));
            }}>
              <option value="">— Aucune —</option>
              {clientInvoices.map((f) => (
                <option key={f.id} value={f.id}>{f.reference} — solde {formatMoney(invoiceBalance(f, s.payments), f.currency)}</option>
              ))}
            </select>
          </Field>
          <Field label="Montant alloué" error={errors.allocAmount}>
            <input type="number" min={0} className={inputClass} disabled={!form.invoiceId} value={form.allocAmount || ''} onChange={(e) => setForm((f) => ({ ...f, allocAmount: parseInt(e.target.value) || 0 }))} />
          </Field>
        </div>
        {form.invoiceId && (
          <p className="text-xs text-gray-500">
            Solde non affecté restant : {formatMoney(Math.max(0, form.amount - form.allocAmount), 'XOF')}.
          </p>
        )}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button onClick={submit}>Enregistrer le paiement</Button>
      </div>
    </Modal>
  );
}

function AllocateModal({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  const s = useErp();
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState(0);
  if (!payment) return null;

  const unallocated = paymentUnallocated(payment);
  const eligible = s.invoices.filter(
    (f) => f.contactId === payment.contactId && invoiceBalance(f, s.payments) > 0 && f.status !== 'BROUILLON',
  );

  return (
    <Modal isOpen onClose={onClose} title={`Affecter — ${payment.reference}`} description={`Solde non affecté : ${formatMoney(unallocated, payment.currency)}.`} className={{ modal: 'sm:w-[520px] sm:p-8 rounded-2xl' }}>
      <div className="mt-5 space-y-4">
        <Field label="Facture" required>
          <select className={inputClass} value={invoiceId} onChange={(e) => {
            setInvoiceId(e.target.value);
            const inv = s.invoices.find((f) => f.id === e.target.value);
            if (inv) setAmount(Math.min(unallocated, invoiceBalance(inv, s.payments)));
          }}>
            <option value="">— Sélectionner —</option>
            {eligible.map((f) => (
              <option key={f.id} value={f.id}>{f.reference} — solde {formatMoney(invoiceBalance(f, s.payments), f.currency)}</option>
            ))}
          </select>
        </Field>
        <Field label="Montant à allouer">
          <input type="number" min={1} max={unallocated} className={inputClass} value={amount || ''} onChange={(e) => setAmount(parseInt(e.target.value) || 0)} />
        </Field>
        {eligible.length === 0 && <p className="text-sm text-gray-500">Aucune facture avec solde restant pour ce payeur.</p>}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button
          disabled={!invoiceId || amount <= 0}
          onClick={() => {
            s.allocatePayment(payment.id, invoiceId, amount);
            onClose();
          }}
        >
          Affecter
        </Button>
      </div>
    </Modal>
  );
}

export default function PaymentsPage() {
  const s = useErp();
  const [modalOpen, setModalOpen] = useState(false);
  const [allocating, setAllocating] = useState<Payment | null>(null);

  const contactName = (id: string) => s.contacts.find((c) => c.id === id)?.name ?? '—';
  const invoiceRef = (id: string) => s.invoices.find((f) => f.id === id)?.reference ?? id;

  const columns: Column<Payment>[] = [
    { key: 'ref', header: 'Référence', render: (p) => <span className="font-medium text-cyan-800">{p.reference}</span>, sortValue: (p) => p.reference },
    { key: 'payeur', header: 'Payeur', render: (p) => contactName(p.contactId), sortValue: (p) => contactName(p.contactId) },
    { key: 'amount', header: 'Montant', render: (p) => <span className="font-semibold text-emerald-700">{formatMoney(p.amount, p.currency)}</span>, sortValue: (p) => p.amount },
    { key: 'date', header: 'Reçu le', render: (p) => formatDateTime(p.receivedAt), sortValue: (p) => p.receivedAt, hideOnMobile: true },
    { key: 'method', header: 'Mode', render: (p) => PAYMENT_METHOD[p.method], hideOnMobile: true },
    { key: 'account', header: 'Compte', render: (p) => p.account, hideOnMobile: true },
    { key: 'status', header: 'Statut', render: (p) => <Badge tone={PAYMENT_STATUS[p.status].tone}>{PAYMENT_STATUS[p.status].label}</Badge> },
    {
      key: 'alloc',
      header: 'Factures associées',
      render: (p) =>
        p.allocations.length === 0 ? (
          <span className="text-gray-400">—</span>
        ) : (
          <span className="text-xs">{p.allocations.map((a) => `${invoiceRef(a.invoiceId)} (${formatMoney(a.amount, p.currency)})`).join(', ')}</span>
        ),
      hideOnMobile: true,
    },
    {
      key: 'unalloc',
      header: 'Non affecté',
      render: (p) => {
        const u = paymentUnallocated(p);
        return u > 0 ? (
          <Button variant="secondary" className="px-2.5 py-1 text-xs" onClick={() => setAllocating(p)}>
            {formatMoney(u, p.currency)} à affecter
          </Button>
        ) : (
          <span className="text-gray-400">0</span>
        );
      },
    },
  ];

  const totalAllocated = s.payments.reduce((t, p) => t + paymentAllocated(p), 0);
  const totalUnallocated = s.payments.reduce((t, p) => t + paymentUnallocated(p), 0);

  return (
    <div>
      <PageHeader
        title="Paiements"
        subtitle="Les paiements sont alloués aux factures — pas de simple bouton « marquer payé »."
        action={<Button onClick={() => setModalOpen(true)}>+ Enregistrer un paiement</Button>}
      />
      <DemoNotice>Modes de paiement = options d’interface, aucune intégration de paiement réelle.</DemoNotice>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card><p className="text-xs text-gray-500">Total encaissé</p><p className="mt-1 text-lg font-bold text-gray-900">{formatMoney(totalAllocated + totalUnallocated, 'XOF')}</p></Card>
        <Card><p className="text-xs text-gray-500">Alloué aux factures</p><p className="mt-1 text-lg font-bold text-emerald-700">{formatMoney(totalAllocated, 'XOF')}</p></Card>
        <Card><p className="text-xs text-gray-500">Non affecté</p><p className={`mt-1 text-lg font-bold ${totalUnallocated > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{formatMoney(totalUnallocated, 'XOF')}</p></Card>
      </div>
      <DataTable
        rows={s.payments}
        columns={columns}
        searchKeys={(p) => `${p.reference} ${contactName(p.contactId)} ${PAYMENT_METHOD[p.method]}`}
        filters={[
          {
            key: 'method',
            label: 'Mode',
            options: Object.entries(PAYMENT_METHOD).map(([v, l]) => ({ value: v, label: l })),
            predicate: (p, v) => p.method === v,
          },
        ]}
      />
      <NewPaymentModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <AllocateModal payment={allocating} onClose={() => setAllocating(null)} />
    </div>
  );
}
