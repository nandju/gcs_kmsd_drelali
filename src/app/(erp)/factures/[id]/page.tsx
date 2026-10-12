'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useErp } from '@/context/erp-store';
import { derivedInvoiceStatus, invoiceBalance, invoicePaidAmount, invoiceTotal, isOverdue } from '@/lib/erp/calculations';
import { formatDate, formatDateTime, formatMoney } from '@/lib/erp/format';
import { INVOICE_STATUS, PAYMENT_METHOD } from '@/lib/erp/labels';
import { ORGANIZATIONS } from '@/config/organizations';
import { Badge, Button, Card, ConfirmButton, DemoNotice, EmptyState, LinkButton, PageHeader } from '@/components/erp/ui';
import { Modal } from '@/components/ui/modal/modal';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const s = useErp();
  const [previewOpen, setPreviewOpen] = useState(false);

  const invoice = s.invoices.find((f) => f.id === id);
  if (!invoice) {
    return <EmptyState title="Facture introuvable" action={<LinkButton href="/factures">Retour à la liste</LinkButton>} />;
  }

  const contact = s.contacts.find((c) => c.id === invoice.contactId);
  const mission = invoice.missionId ? s.missions.find((m) => m.id === invoice.missionId) : undefined;
  const st = derivedInvoiceStatus(invoice, s.payments);
  const total = invoiceTotal(invoice);
  const paid = invoicePaidAmount(invoice, s.payments);
  const balance = invoiceBalance(invoice, s.payments);
  const overdue = isOverdue(invoice, s.payments);
  const allocations = s.payments
    .flatMap((p) => p.allocations.filter((a) => a.invoiceId === invoice.id).map((a) => ({ payment: p, amount: a.amount })))
    .sort((a, b) => a.payment.receivedAt.localeCompare(b.payment.receivedAt));
  const frozen = st !== 'BROUILLON' && st !== 'A_VALIDER';
  const org = ORGANIZATIONS.GCS;

  return (
    <div>
      <PageHeader
        title={invoice.reference}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={INVOICE_STATUS[st].tone}>{INVOICE_STATUS[st].label}</Badge>
            {overdue && <Badge tone="red">Échue</Badge>}
            <span className="text-gray-500">{contact?.name}</span>
          </span>
        }
        action={
          <>
            <Button variant="secondary" onClick={() => setPreviewOpen(true)}>Aperçu imprimable</Button>
            {!frozen && (
              <ConfirmButton
                label="Émettre la facture"
                title="Émettre la facture"
                description="Une fois émise, la facture est figée : toute correction passera par une action dédiée et tracée (simulation, échéance à 15 jours)."
                onConfirm={() => s.issueInvoice(invoice.id, new Date(Date.now() + 15 * 86400000).toISOString())}
              />
            )}
          </>
        }
      />
      {frozen && (
        <DemoNotice>
          Facture émise et figée en démonstration. Les corrections nécessiteraient une action dédiée et tracée (avoir, annulation) reliée à un backend.
        </DemoNotice>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Lignes de facturation" className="lg:col-span-2" padded={false}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-4 py-2.5 text-left font-medium">Désignation</th>
                <th className="px-4 py-2.5 text-right font-medium">Qté</th>
                <th className="px-4 py-2.5 text-left font-medium">Unité</th>
                <th className="px-4 py-2.5 text-right font-medium">P.U.</th>
                <th className="px-4 py-2.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((l) => (
                <tr key={l.id} className="border-b border-gray-100">
                  <td className="px-4 py-2.5 text-gray-700">{l.label}</td>
                  <td className="px-4 py-2.5 text-right">{l.quantity}</td>
                  <td className="px-4 py-2.5">{l.unit}</td>
                  <td className="px-4 py-2.5 text-right">{formatMoney(l.unitPrice, invoice.currency)}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{formatMoney(l.quantity * l.unitPrice, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200">
                <td colSpan={4} className="px-4 py-2.5 text-right font-semibold">Total</td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-900">{formatMoney(total, invoice.currency)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-1.5 text-right text-gray-500">Montant payé</td>
                <td className="px-4 py-1.5 text-right font-medium text-emerald-700">{formatMoney(paid, invoice.currency)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 pb-3 pt-1.5 text-right text-gray-500">Solde restant dû</td>
                <td className={`px-4 pb-3 pt-1.5 text-right font-bold ${balance > 0 ? 'text-red-600' : 'text-emerald-700'}`}>{formatMoney(balance, invoice.currency)}</td>
              </tr>
            </tfoot>
          </table>
          {invoice.notes && <p className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">{invoice.notes}</p>}
        </Card>

        <div className="space-y-4">
          <Card title="Informations">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">Client</dt><dd><Link href={`/contacts/${invoice.contactId}`} className="font-medium text-cyan-800 hover:underline">{contact?.name}</Link></dd></div>
              {mission && <div className="flex justify-between"><dt className="text-gray-400">Mission</dt><dd><Link href={`/missions/${mission.id}`} className="font-medium text-cyan-800 hover:underline">{mission.reference}</Link></dd></div>}
              <div className="flex justify-between"><dt className="text-gray-400">Devise</dt><dd className="font-medium">{invoice.currency}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Émise le</dt><dd className="font-medium">{formatDate(invoice.issuedAt)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Échéance</dt><dd className={`font-medium ${overdue ? 'text-red-600' : ''}`}>{formatDate(invoice.dueDate)}</dd></div>
            </dl>
          </Card>

          <Card title="Historique des paiements alloués" padded={false}>
            {allocations.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">Aucun paiement alloué à cette facture.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {allocations.map((a, i) => (
                  <li key={i} className="px-4 py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{a.payment.reference}</span>
                      <span className="font-semibold text-emerald-700">{formatMoney(a.amount, invoice.currency)}</span>
                    </div>
                    <p className="text-xs text-gray-400">{formatDateTime(a.payment.receivedAt)} · {PAYMENT_METHOD[a.payment.method]} · {a.payment.account}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Aperçu imprimable */}
      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Aperçu imprimable" description="Document de démonstration — aucun document officiel n’est émis." className={{ modal: 'sm:w-[720px] sm:p-8 rounded-2xl max-h-[90vh] overflow-y-auto' }}>
        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between border-b border-gray-200 pb-4">
            <div>
              <div className="flex size-12 items-center justify-center rounded-lg text-lg font-bold text-white" style={{ backgroundColor: org.accentColor }}>GC</div>
              <p className="mt-2 text-sm font-bold text-gray-900">GCS — Côte d’Ivoire</p>
              <p className="text-xs text-gray-400">Abidjan, Côte d’Ivoire (coordonnées à compléter)</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">FACTURE</p>
              <p className="text-sm text-gray-600">{invoice.reference}</p>
              <p className="text-xs text-gray-400">Émise le {formatDate(invoice.issuedAt)}</p>
              <p className="text-xs text-gray-400">Échéance : {formatDate(invoice.dueDate)}</p>
            </div>
          </div>
          <p className="py-3 text-sm"><span className="text-xs uppercase text-gray-400">Client : </span><span className="font-semibold">{contact?.name}</span></p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-3 py-2 text-left font-medium">Désignation</th>
                <th className="px-3 py-2 text-right font-medium">Qté</th>
                <th className="px-3 py-2 text-right font-medium">P.U.</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((l) => (
                <tr key={l.id} className="border-b border-gray-100">
                  <td className="px-3 py-2">{l.label}</td>
                  <td className="px-3 py-2 text-right">{l.quantity}</td>
                  <td className="px-3 py-2 text-right">{formatMoney(l.unitPrice, invoice.currency)}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatMoney(l.quantity * l.unitPrice, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={3} className="px-3 py-3 text-right font-semibold">Total à payer</td><td className="px-3 py-3 text-right text-base font-bold">{formatMoney(total, invoice.currency)}</td></tr>
            </tfoot>
          </table>
          <p className="mt-4 text-center text-[10px] text-gray-400">Document de démonstration — sans valeur comptable ni fiscale.</p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPreviewOpen(false)}>Fermer</Button>
          <Button onClick={() => window.print()}>Imprimer l’aperçu</Button>
        </div>
      </Modal>
    </div>
  );
}
