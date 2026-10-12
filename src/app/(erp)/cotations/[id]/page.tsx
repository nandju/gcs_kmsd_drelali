'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useErp } from '@/context/erp-store';
import { currentVersion, quoteLinesTotal } from '@/lib/erp/calculations';
import { formatDate, formatDateTime, formatMoney } from '@/lib/erp/format';
import { QUOTE_STATUS } from '@/lib/erp/labels';
import type { QuoteLine, QuoteVersion } from '@/lib/erp/types';
import { ORGANIZATIONS } from '@/config/organizations';
import { Badge, Button, Card, ConfirmButton, DemoNotice, EmptyState, Field, inputClass, LinkButton, PageHeader } from '@/components/erp/ui';
import { Modal } from '@/components/ui/modal/modal';
import { QuoteLinesEditor } from '@/components/erp/quote-lines-editor';

function ClientPreview({ open, onClose, version, quoteRef, contactName }: {
  open: boolean; onClose: () => void; version: QuoteVersion; quoteRef: string; contactName: string;
}) {
  const org = ORGANIZATIONS.GCS;
  return (
    <Modal isOpen={open} onClose={onClose} title="Aperçu client" description="Présentation imprimable — les valeurs internes n’apparaissent pas. Aucun PDF officiel n’est généré en mode démonstration." className={{ modal: 'sm:w-[720px] sm:p-8 rounded-2xl max-h-[90vh] overflow-y-auto' }}>
      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-6 print:border-0" id="quote-preview">
        <div className="flex items-start justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="flex size-12 items-center justify-center rounded-lg text-lg font-bold text-white" style={{ backgroundColor: org.accentColor }}>GC</div>
            <p className="mt-2 text-sm font-bold text-gray-900">GCS — Côte d’Ivoire</p>
            <p className="text-xs text-gray-500">Logistique · Transport · Distribution</p>
            <p className="text-xs text-gray-400">Abidjan, Côte d’Ivoire (coordonnées à compléter)</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">COTATION</p>
            <p className="text-sm text-gray-600">{quoteRef} — Version {version.version}</p>
            <p className="text-xs text-gray-400">Émise le {formatDate(version.createdAt)}</p>
            <p className="text-xs text-gray-400">Valable jusqu’au {formatDate(version.validityDate)}</p>
          </div>
        </div>
        <div className="py-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Client</p>
          <p className="text-sm font-semibold text-gray-800">{contactName}</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-3 py-2 text-left font-medium">Désignation</th>
              <th className="px-3 py-2 text-right font-medium">Qté</th>
              <th className="px-3 py-2 text-left font-medium">Unité</th>
              <th className="px-3 py-2 text-right font-medium">P.U.</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {version.lines.map((l: QuoteLine) => (
              <tr key={l.id} className="border-b border-gray-100">
                <td className="px-3 py-2 text-gray-700">{l.label}</td>
                <td className="px-3 py-2 text-right">{l.quantity}</td>
                <td className="px-3 py-2">{l.unit}</td>
                <td className="px-3 py-2 text-right">{formatMoney(l.unitPrice, 'XOF')}</td>
                <td className="px-3 py-2 text-right font-medium">{formatMoney(l.quantity * l.unitPrice, 'XOF')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="px-3 py-3 text-right font-semibold text-gray-700">Total proposé</td>
              <td className="px-3 py-3 text-right text-base font-bold text-gray-900">{formatMoney(quoteLinesTotal(version), 'XOF')}</td>
            </tr>
          </tfoot>
        </table>
        <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600"><span className="font-semibold">Conditions : </span>{version.conditions}</p>
        <p className="mt-4 text-center text-[10px] text-gray-400">Document de démonstration — sans valeur contractuelle.</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Fermer</Button>
        <Button onClick={() => window.print()}>Imprimer l’aperçu</Button>
      </div>
    </Modal>
  );
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const s = useErp();
  const quote = s.quotes.find((q) => q.id === id);
  const [previewVersion, setPreviewVersion] = useState<QuoteVersion | null>(null);
  const [newVersionOpen, setNewVersionOpen] = useState(false);
  const [nvLines, setNvLines] = useState<QuoteLine[]>([]);
  const [nvNote, setNvNote] = useState('');
  const [nvConditions, setNvConditions] = useState('');

  if (!quote) {
    return <EmptyState title="Cotation introuvable" action={<LinkButton href="/cotations">Retour à la liste</LinkButton>} />;
  }

  const contact = s.contacts.find((c) => c.id === quote.contactId);
  const version = currentVersion(quote);
  const mission = quote.missionId ? s.missions.find((m) => m.id === quote.missionId) : undefined;

  const openNewVersion = () => {
    setNvLines(version.lines.map((l) => ({ ...l, id: `nv-${l.id}` })));
    setNvConditions(version.conditions);
    setNvNote('');
    setNewVersionOpen(true);
  };

  return (
    <div>
      <PageHeader
        title={`${quote.reference} — V${version.version}`}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={QUOTE_STATUS[quote.status].tone}>{QUOTE_STATUS[quote.status].label}</Badge>
            <span className="text-gray-500">{contact?.name} · {quote.service}</span>
          </span>
        }
        action={
          <>
            <Button variant="secondary" onClick={() => setPreviewVersion(version)}>Aperçu client</Button>
            {quote.status === 'BROUILLON' && (
              <ConfirmButton label="Soumettre à validation" title="Soumettre la cotation" description="La cotation sera transmise pour validation interne (simulation)." onConfirm={() => s.quoteAction(quote.id, 'SOUMETTRE')} />
            )}
            {quote.status === 'A_VALIDER' && (
              <ConfirmButton label="Valider" title="Valider la cotation" description="Validation interne de la cotation (simulation). Les règles de prix plancher sont des paramètres de démonstration." onConfirm={() => s.quoteAction(quote.id, 'VALIDER')} />
            )}
            {quote.status === 'VALIDEE' && (
              <ConfirmButton label="Simuler l’envoi" title="Envoyer la cotation" description="Aucun e-mail réel n’est envoyé : l’envoi est simulé pour la démonstration." onConfirm={() => s.quoteAction(quote.id, 'ENVOYER')} />
            )}
            {quote.status === 'ENVOYEE' && (
              <>
                <ConfirmButton label="Acceptation client" title="Simuler l’acceptation" description="L’acceptation déclenchera la création simulée d’une mission à planifier." onConfirm={() => s.quoteAction(quote.id, 'ACCEPTER')} />
                <ConfirmButton label="Refus client" variant="danger" title="Simuler le refus" description="La cotation passera au statut Refusée (simulation)." onConfirm={() => s.quoteAction(quote.id, 'REFUSER')} />
              </>
            )}
            {quote.status !== 'ACCEPTEE' && (
              <Button variant="secondary" onClick={openNewVersion}>+ Nouvelle version</Button>
            )}
          </>
        }
      />
      <DemoNotice>Les actions ci-dessus sont simulées : aucun envoi réel, aucun document officiel n’est émis.</DemoNotice>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title={`Contenu — Version ${version.version} (courante)`} className="lg:col-span-2" padded={false}>
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
              {version.lines.map((l) => (
                <tr key={l.id} className="border-b border-gray-100">
                  <td className="px-4 py-2.5 text-gray-700">{l.label}</td>
                  <td className="px-4 py-2.5 text-right">{l.quantity}</td>
                  <td className="px-4 py-2.5">{l.unit}</td>
                  <td className="px-4 py-2.5 text-right">{formatMoney(l.unitPrice, quote.currency)}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{formatMoney(l.quantity * l.unitPrice, quote.currency)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right font-semibold">Prix proposé (visible client)</td>
                <td className="px-4 py-3 text-right text-base font-bold text-gray-900">{formatMoney(version.proposedPrice, quote.currency)}</td>
              </tr>
            </tfoot>
          </table>
          <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
            <p><span className="font-medium">Conditions (client) : </span>{version.conditions}</p>
            <p className="mt-1 text-xs text-gray-400">Validité : {formatDate(version.validityDate)}</p>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Valeurs internes (jamais visibles client)">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">Coût estimé</dt><dd className="font-medium">{formatMoney(version.estimatedCost, quote.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Prix plancher</dt><dd className="font-medium">{formatMoney(version.floorPrice, quote.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Prix commercial</dt><dd className="font-medium">{formatMoney(version.commercialPrice, quote.currency)}</dd></div>
              <div className="flex justify-between border-t border-gray-100 pt-2"><dt className="text-gray-400">Prix proposé</dt><dd className="font-bold text-gray-900">{formatMoney(version.proposedPrice, quote.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Marge estimée</dt><dd className={version.proposedPrice - version.estimatedCost >= 0 ? 'font-medium text-emerald-700' : 'font-medium text-red-600'}>{formatMoney(version.proposedPrice - version.estimatedCost, quote.currency)}</dd></div>
            </dl>
            {version.proposedPrice < version.floorPrice && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                Prix proposé inférieur au prix plancher : autorisation de la direction requise (règle paramétrable de démonstration).
              </p>
            )}
            {version.internalNotes && (
              <p className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600"><span className="font-semibold">Notes internes : </span>{version.internalNotes}</p>
            )}
          </Card>

          <Card title="Informations">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">Client</dt><dd><Link href={`/contacts/${quote.contactId}`} className="font-medium text-cyan-800 hover:underline">{contact?.name}</Link></dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Origine</dt><dd className="font-medium">{quote.origin ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Destination</dt><dd className="font-medium">{quote.destination ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Commercial</dt><dd className="font-medium">{quote.owner}</dd></div>
              {quote.leadId && (
                <div className="flex justify-between"><dt className="text-gray-400">Prospect lié</dt><dd><Link href={`/prospects/${quote.leadId}`} className="font-medium text-cyan-800 hover:underline">Voir la fiche</Link></dd></div>
              )}
              {mission && (
                <div className="flex justify-between"><dt className="text-gray-400">Mission créée</dt><dd><Link href={`/missions/${mission.id}`} className="font-medium text-cyan-800 hover:underline">{mission.reference}</Link></dd></div>
              )}
            </dl>
          </Card>
        </div>
      </div>

      <div className="mt-4">
        <Card title={`Historique des versions (${quote.versions.length})`} padded={false}>
          <ul className="divide-y divide-gray-100">
            {[...quote.versions].reverse().map((v) => (
              <li key={v.version} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Badge tone={v.version === version.version ? 'cyan' : 'gray'}>V{v.version}{v.version === version.version ? ' — courante' : ''}</Badge>
                <span className="text-sm text-gray-600">{formatDateTime(v.createdAt)}</span>
                <span className="text-sm font-medium text-gray-800">{formatMoney(v.proposedPrice, quote.currency)}</span>
                {v.note && <span className="flex-1 truncate text-xs text-gray-400">{v.note}</span>}
                <Button variant="secondary" className="ml-auto px-2.5 py-1 text-xs" onClick={() => setPreviewVersion(v)}>
                  Consulter l’aperçu
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {previewVersion && (
        <ClientPreview open={!!previewVersion} onClose={() => setPreviewVersion(null)} version={previewVersion} quoteRef={quote.reference} contactName={contact?.name ?? ''} />
      )}

      <Modal isOpen={newVersionOpen} onClose={() => setNewVersionOpen(false)} title={`Nouvelle version — V${version.version + 1}`} description="L’ancienne version restera consultable dans l’historique ; son contenu n’est jamais réécrit." className={{ modal: 'sm:w-[760px] sm:p-8 rounded-2xl max-h-[90vh] overflow-y-auto' }}>
        <div className="mt-5 space-y-4">
          <QuoteLinesEditor lines={nvLines} onChange={setNvLines} />
          <Field label="Conditions commerciales">
            <input className={inputClass} value={nvConditions} onChange={(e) => setNvConditions(e.target.value)} />
          </Field>
          <Field label="Motif de la nouvelle version">
            <input className={inputClass} value={nvNote} onChange={(e) => setNvNote(e.target.value)} placeholder="Ex. : remise négociée avec le client" />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setNewVersionOpen(false)}>Annuler</Button>
          <Button
            disabled={nvLines.some((l) => !l.label.trim() || l.unitPrice <= 0)}
            onClick={() => {
              s.newQuoteVersion(quote.id, {
                lines: nvLines,
                validityDate: new Date(Date.now() + 30 * 86400000).toISOString(),
                conditions: nvConditions,
                proposedNote: nvNote || undefined,
              });
              setNewVersionOpen(false);
            }}
          >
            Créer la version V{version.version + 1}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
