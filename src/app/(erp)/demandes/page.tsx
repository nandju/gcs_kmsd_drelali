'use client';

// Demandes reçues — soumissions des formulaires publics, filtrées par
// organisation, formulaire, statut et date.

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useErp } from '@/context/erp-store';
import { useForms } from '@/context/forms-store';
import { ORGANIZATIONS, ORG_LIST } from '@/config/organizations';
import type { SubmissionStatus } from '@/modules/forms/types';
import { SUBMISSION_STATUS_LABELS } from '@/modules/forms/types';
import { formatDateTime } from '@/lib/erp/format';
import {
  Badge,
  Card,
  DemoNotice,
  EmptyState,
  inputClass,
  PageHeader,
  Tabs,
} from '@/components/erp/ui';
import type { Tone } from '@/lib/erp/labels';

const STATUS_TONE: Record<SubmissionStatus, Tone> = {
  NOUVELLE: 'blue',
  EN_TRAITEMENT: 'amber',
  TRAITEE: 'green',
  ARCHIVEE: 'gray',
};

export default function SubmissionsPage() {
  const { org, setOrg } = useErp();
  const { submissions, forms, hydrated } = useForms();
  const [formId, setFormId] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const orgForms = useMemo(() => forms.filter((f) => f.org === org), [forms, org]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (s.org !== org) return false;
      if (formId && s.formId !== formId) return false;
      if (status && s.status !== status) return false;
      if (from && s.submittedAt < from) return false;
      if (to && s.submittedAt > `${to}T23:59:59`) return false;
      return true;
    });
  }, [submissions, org, formId, status, from, to]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of submissions) c[s.org] = (c[s.org] ?? 0) + 1;
    return c;
  }, [submissions]);

  return (
    <div>
      <PageHeader
        title="Demandes reçues"
        subtitle="Soumissions des formulaires publics de chaque organisation."
      />
      <DemoNotice>
        Données de démonstration stockées localement (localStorage) — elles ne sont
        ni partagées, ni persistées sur un serveur.
      </DemoNotice>

      <Tabs
        tabs={ORG_LIST.map((o) => ({
          id: o.code,
          label: o.displayName,
          count: counts[o.code] ?? 0,
        }))}
        active={org}
        onChange={(id) => {
          setOrg(id as typeof org);
          setFormId('');
        }}
      />

      {/* Filtres */}
      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Formulaire</span>
            <select className={inputClass} value={formId} onChange={(e) => setFormId(e.target.value)}>
              <option value="">Tous</option>
              {orgForms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Statut</span>
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tous</option>
              {(Object.keys(SUBMISSION_STATUS_LABELS) as SubmissionStatus[]).map((s) => (
                <option key={s} value={s}>{SUBMISSION_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Du</span>
            <input type="date" className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Au</span>
            <input type="date" className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      </Card>

      {!hydrated || filtered.length === 0 ? (
        <EmptyState
          title={`Aucune demande pour ${ORGANIZATIONS[org].code}`}
          description="Les soumissions des formulaires publics publiés apparaîtront ici."
        />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3 font-medium">Référence</th>
                  <th className="px-4 py-3 font-medium">Formulaire</th>
                  <th className="px-4 py-3 font-medium">Version</th>
                  <th className="px-4 py-3 font-medium">Reçue le</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <Link href={`/demandes/${s.id}`} className="font-semibold text-cyan-800 hover:underline">
                        {s.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{s.formName}</td>
                    <td className="px-4 py-3 text-gray-500">v{s.formVersion}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(s.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[s.status]}>{SUBMISSION_STATUS_LABELS[s.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
