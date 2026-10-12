'use client';

// Fiche contact 360° : demandes, cotations, missions, factures, paiements.
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useErp } from '@/context/erp-store';
import {
  currentVersion,
  derivedInvoiceStatus,
  invoiceBalance,
  invoiceTotal,
} from '@/lib/erp/calculations';
import { formatDate, formatDateTime, formatMoney } from '@/lib/erp/format';
import {
  INVOICE_STATUS,
  LEAD_STATUS,
  MISSION_STATUS,
  PAYMENT_METHOD,
  QUOTE_STATUS,
} from '@/lib/erp/labels';
import { Badge, Card, EmptyState, LinkButton, PageHeader } from '@/components/erp/ui';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const s = useErp();
  const contact = s.contacts.find((c) => c.id === id);

  if (!contact) {
    return <EmptyState title="Contact introuvable" action={<LinkButton href="/contacts">Retour à la liste</LinkButton>} />;
  }

  const leads = s.leads.filter((l) => l.contactId === id);
  const quotes = s.quotes.filter((q) => q.contactId === id);
  const missions = s.missions.filter((m) => m.contactId === id);
  const invoices = s.invoices.filter((f) => f.contactId === id);
  const payments = s.payments.filter((p) => p.contactId === id);
  const activities = s.activities.filter((a) =>
    [...leads, ...quotes, ...missions, ...invoices, ...payments].some(
      (e) => a.entity?.id === e.id,
    ),
  );

  return (
    <div>
      <PageHeader
        title={contact.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {contact.isClient ? <Badge tone="green">Client</Badge> : <Badge tone="blue">Prospect / contact</Badge>}
            {contact.company && <span className="text-gray-500">{contact.company}</span>}
          </span>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Coordonnées">
          <dl className="space-y-2.5 text-sm">
            <div><dt className="text-gray-400">Téléphone</dt><dd className="font-medium text-gray-800">{contact.phone}</dd></div>
            <div><dt className="text-gray-400">WhatsApp</dt><dd className="font-medium text-gray-800">{contact.whatsapp ?? '—'}</dd></div>
            <div><dt className="text-gray-400">E-mail</dt><dd className="font-medium text-gray-800">{contact.email ?? '—'}</dd></div>
            <div><dt className="text-gray-400">Ville</dt><dd className="font-medium text-gray-800">{contact.city ?? '—'}</dd></div>
            <div><dt className="text-gray-400">Créé le</dt><dd className="font-medium text-gray-800">{formatDate(contact.createdAt)}</dd></div>
          </dl>
          {contact.notes && <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{contact.notes}</p>}
          <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500">
            Pièces jointes de démonstration : <span className="font-medium">contrat-cadre.pdf</span>,{' '}
            <span className="font-medium">plan-acces.jpg</span> (fichiers fictifs, non stockés).
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card title={`Demandes commerciales (${leads.length})`} padded={false}>
            {leads.length === 0 ? <p className="p-4 text-sm text-gray-400">Aucune demande.</p> : (
              <ul className="divide-y divide-gray-100">
                {leads.map((l) => (
                  <li key={l.id}>
                    <Link href={`/prospects/${l.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 hover:bg-gray-50">
                      <span className="text-sm font-medium text-cyan-800">{l.reference}</span>
                      <span className="flex-1 truncate text-sm text-gray-600">{l.service}</span>
                      <Badge tone={LEAD_STATUS[l.status].tone}>{LEAD_STATUS[l.status].label}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={`Cotations (${quotes.length})`} padded={false}>
            {quotes.length === 0 ? <p className="p-4 text-sm text-gray-400">Aucune cotation.</p> : (
              <ul className="divide-y divide-gray-100">
                {quotes.map((q) => (
                  <li key={q.id}>
                    <Link href={`/cotations/${q.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 hover:bg-gray-50">
                      <span className="text-sm font-medium text-cyan-800">{q.reference} · V{currentVersion(q).version}</span>
                      <span className="text-sm text-gray-600">{formatMoney(currentVersion(q).proposedPrice, q.currency)}</span>
                      <Badge tone={QUOTE_STATUS[q.status].tone}>{QUOTE_STATUS[q.status].label}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={`Missions (${missions.length})`} padded={false}>
            {missions.length === 0 ? <p className="p-4 text-sm text-gray-400">Aucune mission.</p> : (
              <ul className="divide-y divide-gray-100">
                {missions.map((m) => (
                  <li key={m.id}>
                    <Link href={`/missions/${m.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 hover:bg-gray-50">
                      <span className="text-sm font-medium text-cyan-800">{m.reference}</span>
                      <span className="flex-1 truncate text-sm text-gray-600">{m.origin} → {m.destination}</span>
                      <Badge tone={MISSION_STATUS[m.status].tone}>{MISSION_STATUS[m.status].label}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card title={`Factures (${invoices.length})`} padded={false}>
              {invoices.length === 0 ? <p className="p-4 text-sm text-gray-400">Aucune facture.</p> : (
                <ul className="divide-y divide-gray-100">
                  {invoices.map((f) => {
                    const st = derivedInvoiceStatus(f, s.payments);
                    return (
                      <li key={f.id}>
                        <Link href={`/factures/${f.id}`} className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-gray-50">
                          <span className="text-sm font-medium text-cyan-800">{f.reference}</span>
                          <span className="text-xs text-gray-500">
                            {formatMoney(invoiceTotal(f), f.currency)} · solde {formatMoney(invoiceBalance(f, s.payments), f.currency)}
                          </span>
                          <Badge tone={INVOICE_STATUS[st].tone}>{INVOICE_STATUS[st].label}</Badge>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
            <Card title={`Paiements (${payments.length})`} padded={false}>
              {payments.length === 0 ? <p className="p-4 text-sm text-gray-400">Aucun paiement.</p> : (
                <ul className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                      <span className="text-sm font-medium text-gray-800">{p.reference}</span>
                      <span className="text-xs text-gray-500">{PAYMENT_METHOD[p.method]}</span>
                      <span className="text-sm font-semibold text-emerald-700">{formatMoney(p.amount, p.currency)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card title="Historique des activités" padded={false}>
            {activities.length === 0 ? <p className="p-4 text-sm text-gray-400">Aucune activité tracée pour ce contact.</p> : (
              <ul className="divide-y divide-gray-100">
                {activities.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                    <span className="text-sm text-gray-700">{a.label}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(a.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
