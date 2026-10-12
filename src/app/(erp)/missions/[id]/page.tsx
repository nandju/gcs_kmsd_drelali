'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useErp } from '@/context/erp-store';
import { derivedInvoiceStatus, invoiceBalance, invoiceTotal, missionMargin } from '@/lib/erp/calculations';
import { formatDate, formatDateTime, formatMoney } from '@/lib/erp/format';
import { CONTROL_STATUS, DRIVER_STATUS, EXPENSE_STATUS, INCIDENT_PRIORITY, INCIDENT_STATUS, INVOICE_STATUS, MISSION_STATUS, PROOF_RESULT, VEHICLE_STATUS } from '@/lib/erp/labels';
import { Badge, Button, Card, ConfirmButton, DemoNotice, EmptyState, Field, inputClass, LinkButton, PageHeader, Tabs } from '@/components/erp/ui';
import { Modal } from '@/components/ui/modal/modal';

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const s = useErp();
  const [tab, setTab] = useState('resume');
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignVehicle, setAssignVehicle] = useState('');
  const [assignDriver, setAssignDriver] = useState('');

  const mission = s.missions.find((m) => m.id === id);
  if (!mission) {
    return <EmptyState title="Mission introuvable" action={<LinkButton href="/missions">Retour à la liste</LinkButton>} />;
  }

  const contact = s.contacts.find((c) => c.id === mission.contactId);
  const vehicle = s.vehicles.find((v) => v.id === mission.vehicleId);
  const driver = s.drivers.find((d) => d.id === mission.driverId);
  const quote = mission.quoteId ? s.quotes.find((q) => q.id === mission.quoteId) : undefined;
  const quoteVersion = quote?.versions.find((v) => v.version === mission.quoteVersion);
  const proofs = s.proofs.filter((p) => p.missionId === mission.id);
  const incidents = s.incidents.filter((i) => i.missionId === mission.id);
  const expenses = s.expenses.filter((e) => e.missionId === mission.id);
  const invoice = mission.invoiceId ? s.invoices.find((f) => f.id === mission.invoiceId) : undefined;
  const margin = missionMargin(mission, s.expenses);

  const canAssign = ['BROUILLON', 'A_PLANIFIER', 'PLANIFIEE', 'AFFECTEE'].includes(mission.status);

  return (
    <div>
      <PageHeader
        title={`${mission.reference} — ${mission.service}`}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={MISSION_STATUS[mission.status].tone}>{MISSION_STATUS[mission.status].label}</Badge>
            <Badge tone={CONTROL_STATUS[mission.control].tone}>{CONTROL_STATUS[mission.control].label}</Badge>
            <span className="text-gray-500">{contact?.name} · {mission.origin} → {mission.destination}</span>
          </span>
        }
        action={
          <>
            {canAssign && (
              <Button onClick={() => { setAssignVehicle(mission.vehicleId ?? ''); setAssignDriver(mission.driverId ?? ''); setAssignOpen(true); }}>
                Affecter les ressources
              </Button>
            )}
            {(mission.status === 'AFFECTEE' || mission.status === 'PLANIFIEE') && (
              <ConfirmButton label="Démarrer (simulation)" title="Démarrer la mission" description="Une mission ne peut démarrer que si véhicule et chauffeur sont affectés." onConfirm={() => s.missionAction(mission.id, 'DEMARRER')} />
            )}
            {mission.status === 'EN_COURS' && (
              <ConfirmButton label="Terminer (simulation)" title="Terminer la mission" description="La mission passera en attente de contrôle avant toute facturation." onConfirm={() => s.missionAction(mission.id, 'TERMINER')} />
            )}
            {mission.status === 'A_CONTROLER' && <LinkButton href="/controle" variant="primary">Ouvrir le contrôle</LinkButton>}
            {mission.status === 'CONTROLEE' && !mission.invoiceId && (
              <ConfirmButton label="Créer la facture" title="Créer la facture" description="Une facture brouillon reprendra les informations de la chaîne commerciale (simulation)." onConfirm={() => s.createInvoiceFromMission(mission.id)} />
            )}
            {mission.status === 'CONTROLEE' && (
              <ConfirmButton label="Clôturer" variant="secondary" title="Clôturer la mission" description="Clôture administrative de la mission (simulation)." onConfirm={() => s.missionAction(mission.id, 'CLOTURER')} />
            )}
          </>
        }
      />

      <Tabs
        tabs={[
          { id: 'resume', label: 'Résumé' },
          { id: 'itineraire', label: 'Itinéraire et étapes', count: mission.steps.length },
          { id: 'ressources', label: 'Ressources' },
          { id: 'execution', label: 'Exécution', count: mission.events.length },
          { id: 'preuves', label: 'Preuves', count: proofs.length },
          { id: 'incidents', label: 'Incidents', count: incidents.length },
          { id: 'depenses', label: 'Dépenses', count: expenses.length },
          { id: 'facturation', label: 'Facturation' },
          { id: 'historique', label: 'Historique' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'resume' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card title="Informations générales" className="lg:col-span-2">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
              <div><dt className="text-gray-400">Client</dt><dd><Link href={`/contacts/${mission.contactId}`} className="font-medium text-cyan-800 hover:underline">{contact?.name}</Link></dd></div>
              <div><dt className="text-gray-400">Prestation</dt><dd className="font-medium">{mission.service}</dd></div>
              <div><dt className="text-gray-400">Date prévue</dt><dd className="font-medium">{formatDateTime(mission.plannedDate)}</dd></div>
              <div><dt className="text-gray-400">Origine</dt><dd className="font-medium">{mission.origin}</dd></div>
              <div><dt className="text-gray-400">Destination</dt><dd className="font-medium">{mission.destination}</dd></div>
              <div><dt className="text-gray-400">Responsable</dt><dd className="font-medium">{mission.supervisor}</dd></div>
            </dl>
            {mission.instructions && <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600"><span className="font-medium">Consignes : </span>{mission.instructions}</p>}
            {quote && quoteVersion && (
              <div className="mt-4 rounded-lg border border-cyan-100 bg-cyan-50/50 p-3 text-sm">
                <p className="font-medium text-cyan-900">Chaîne commerciale</p>
                <p className="mt-1 text-gray-600">
                  Issue de la cotation{' '}
                  <Link href={`/cotations/${quote.id}`} className="font-medium text-cyan-800 hover:underline">{quote.reference} (V{quoteVersion.version})</Link>{' '}
                  acceptée — prix retenu : <span className="font-semibold">{formatMoney(quoteVersion.proposedPrice, quote.currency)}</span>.
                </p>
              </div>
            )}
          </Card>
          <Card title="Synthèse financière (démo)">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">Revenu retenu</dt><dd className="font-medium">{mission.revenue !== undefined ? formatMoney(mission.revenue, 'XOF') : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Coût estimé</dt><dd className="font-medium">{mission.estimatedCost !== undefined ? formatMoney(mission.estimatedCost, 'XOF') : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Dépenses soumises</dt><dd className="font-medium text-amber-700">{formatMoney(margin.submittedCosts, 'XOF')}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Coûts validés</dt><dd className="font-medium">{formatMoney(margin.validatedCosts, 'XOF')}</dd></div>
              {margin.computable ? (
                <>
                  <div className="flex justify-between border-t border-gray-100 pt-2"><dt className="text-gray-400">Marge estimée</dt><dd className="font-medium">{formatMoney(margin.estimatedMargin, 'XOF')}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-400">Marge réelle</dt><dd className={margin.realMargin >= 0 ? 'font-bold text-emerald-700' : 'font-bold text-red-600'}>{formatMoney(margin.realMargin, 'XOF')}</dd></div>
                </>
              ) : (
                <p className="rounded-lg bg-gray-50 p-2 text-xs text-gray-500">{margin.reason}</p>
              )}
            </dl>
            <p className="mt-3 text-[11px] text-gray-400">Marge réelle = revenu retenu − coûts directs validés. Les dépenses soumises n’y entrent pas tant qu’elles ne sont pas validées.</p>
          </Card>
        </div>
      )}

      {tab === 'itineraire' && (
        <Card title="Itinéraire et étapes" padded={false}>
          <ul className="divide-y divide-gray-100">
            {mission.steps.map((st, i) => (
              <li key={st.id} className="flex items-center gap-3 px-4 py-3">
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${st.done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                  {st.done ? '✓' : i + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-gray-800">{st.label}</span>
                  <span className="block text-xs text-gray-500">{st.location}{st.plannedAt ? ` · prévu ${formatDateTime(st.plannedAt)}` : ''}</span>
                </span>
                <Badge tone={st.done ? 'green' : 'gray'}>{st.done ? 'Réalisée' : 'À venir'}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'ressources' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Véhicule affecté">
            {vehicle ? (
              <div className="text-sm">
                <p className="font-semibold text-gray-800">{vehicle.name}</p>
                <p className="text-gray-500">{vehicle.type} · propriétaire : {vehicle.owner}</p>
                <div className="mt-2"><Badge tone={VEHICLE_STATUS[vehicle.status].tone}>{VEHICLE_STATUS[vehicle.status].label}</Badge></div>
                {vehicle.note && <p className="mt-2 text-xs text-gray-400">{vehicle.note}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucun véhicule affecté. {canAssign && 'Utilisez « Affecter les ressources ».'}</p>
            )}
          </Card>
          <Card title="Chauffeur affecté">
            {driver ? (
              <div className="text-sm">
                <p className="font-semibold text-gray-800">{driver.name}</p>
                <p className="text-gray-500">{driver.phone} · {driver.license}</p>
                <div className="mt-2"><Badge tone={DRIVER_STATUS[driver.status].tone}>{DRIVER_STATUS[driver.status].label}</Badge></div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucun chauffeur affecté.</p>
            )}
          </Card>
        </div>
      )}

      {tab === 'execution' && (
        <Card title="Timeline d’exécution (démonstration)" padded={false}>
          <ul className="divide-y divide-gray-100">
            {[...mission.events].reverse().map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span className="text-sm text-gray-700">{e.label}</span>
                <span className="text-xs text-gray-400">{formatDateTime(e.at)} · {e.by}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'preuves' && (
        <Card title="Preuves de livraison" padded={false}>
          {proofs.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">Aucune preuve enregistrée. Les preuves sont ajoutées depuis l’interface chauffeur.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {proofs.map((p) => (
                <li key={p.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="cyan">{p.type === 'PHOTO' ? 'Photo' : p.type === 'SIGNATURE' ? 'Signature' : p.type === 'CODE' ? 'Code' : 'Document'}</Badge>
                    <Badge tone={PROOF_RESULT[p.result].tone}>{PROOF_RESULT[p.result].label}</Badge>
                    <span className="text-xs text-gray-400">{formatDateTime(p.at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">
                    {p.receiverName && <span className="font-medium">{p.receiverName} — </span>}
                    {p.comment}
                  </p>
                  {p.fileName && <p className="mt-0.5 text-xs text-gray-400">Pièce jointe (fictive) : {p.fileName}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'incidents' && (
        <Card title="Incidents liés" padded={false}>
          {incidents.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">Aucun incident sur cette mission.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {incidents.map((i) => (
                <li key={i.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-cyan-800">{i.reference}</span>
                    <Badge tone={INCIDENT_PRIORITY[i.priority].tone}>{INCIDENT_PRIORITY[i.priority].label}</Badge>
                    <Badge tone={INCIDENT_STATUS[i.status].tone}>{INCIDENT_STATUS[i.status].label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{i.type} — {i.description}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'depenses' && (
        <Card title="Dépenses de mission" padded={false}>
          {expenses.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">Aucune dépense enregistrée.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {expenses.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <span className="text-sm text-gray-700"><span className="font-medium text-cyan-800">{e.reference}</span> · {e.category} — {e.description}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatMoney(e.amount, e.currency)}</span>
                    <Badge tone={EXPENSE_STATUS[e.status].tone}>{EXPENSE_STATUS[e.status].label}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'facturation' && (
        <Card title="Facturation">
          {invoice ? (
            <div className="text-sm">
              <p>
                Facture <Link href={`/factures/${invoice.id}`} className="font-medium text-cyan-800 hover:underline">{invoice.reference}</Link>{' '}
                <Badge tone={INVOICE_STATUS[derivedInvoiceStatus(invoice, s.payments)].tone}>
                  {INVOICE_STATUS[derivedInvoiceStatus(invoice, s.payments)].label}
                </Badge>
              </p>
              <dl className="mt-3 space-y-2">
                <div className="flex justify-between"><dt className="text-gray-400">Montant total</dt><dd className="font-medium">{formatMoney(invoiceTotal(invoice), invoice.currency)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-400">Solde restant</dt><dd className="font-medium">{formatMoney(invoiceBalance(invoice, s.payments), invoice.currency)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-400">Échéance</dt><dd className="font-medium">{formatDate(invoice.dueDate)}</dd></div>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Aucune facture. {mission.status === 'CONTROLEE' ? 'La mission est contrôlée : vous pouvez créer la facture.' : 'La facturation intervient après le contrôle de la mission.'}
            </p>
          )}
        </Card>
      )}

      {tab === 'historique' && (
        <Card title="Historique complet" padded={false}>
          <ul className="divide-y divide-gray-100">
            {[...mission.events].reverse().map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-sm text-gray-700">{e.label}</span>
                <span className="text-xs text-gray-400">{formatDateTime(e.at)} · {e.by}</span>
              </li>
            ))}
            <li className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
              <span className="text-sm text-gray-700">Mission créée</span>
              <span className="text-xs text-gray-400">{formatDateTime(mission.createdAt)}</span>
            </li>
          </ul>
        </Card>
      )}

      {/* Modale d'affectation */}
      <Modal isOpen={assignOpen} onClose={() => setAssignOpen(false)} title="Affecter les ressources" description="Un véhicule immobilisé ou un chauffeur absent ne peut pas être sélectionné pour une affectation normale." className={{ modal: 'sm:w-[520px] sm:p-8 rounded-2xl' }}>
        <div className="mt-5 space-y-4">
          <Field label="Véhicule" required>
            <select className={inputClass} value={assignVehicle} onChange={(e) => setAssignVehicle(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {s.vehicles.map((v) => (
                <option key={v.id} value={v.id} disabled={v.status === 'IMMOBILISE'}>
                  {v.name} ({VEHICLE_STATUS[v.status].label}){v.status === 'IMMOBILISE' ? ' — indisponible' : ''}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Chauffeur" required>
            <select className={inputClass} value={assignDriver} onChange={(e) => setAssignDriver(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {s.drivers.map((d) => (
                <option key={d.id} value={d.id} disabled={d.status === 'ABSENT'}>
                  {d.name} ({DRIVER_STATUS[d.status].label}){d.status === 'ABSENT' ? ' — indisponible' : ''}
                </option>
              ))}
            </select>
          </Field>
          <DemoNotice>Affectation simulée localement, sans réservation réelle des ressources.</DemoNotice>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setAssignOpen(false)}>Annuler</Button>
          <Button
            disabled={!assignVehicle || !assignDriver}
            onClick={() => {
              s.assignMission(mission.id, assignVehicle, assignDriver);
              setAssignOpen(false);
            }}
          >
            Affecter
          </Button>
        </div>
      </Modal>
    </div>
  );
}
