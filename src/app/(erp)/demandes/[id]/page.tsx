'use client';

// Détail d'une demande : réponses, pièces jointes simulées, version du
// formulaire utilisée et journal de traitement.

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useErp } from '@/context/erp-store';
import { useForms } from '@/context/forms-store';
import { ORGANIZATIONS } from '@/config/organizations';
import {
  DISPLAY_FIELD_TYPES,
  findField,
} from '@/modules/forms/logic';
import type { SubmissionStatus } from '@/modules/forms/types';
import { FIELD_TYPE_LABELS, SUBMISSION_STATUS_LABELS } from '@/modules/forms/types';
import { formatDateTime } from '@/lib/erp/format';
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
} from '@/components/erp/ui';
import type { Tone } from '@/lib/erp/labels';

const STATUS_TONE: Record<SubmissionStatus, Tone> = {
  NOUVELLE: 'blue',
  EN_TRAITEMENT: 'amber',
  TRAITEE: 'green',
  ARCHIVEE: 'gray',
};

const NEXT_STATUS: Partial<Record<SubmissionStatus, { to: SubmissionStatus; label: string }[]>> = {
  NOUVELLE: [
    { to: 'EN_TRAITEMENT', label: 'Prendre en charge' },
    { to: 'ARCHIVEE', label: 'Archiver' },
  ],
  EN_TRAITEMENT: [
    { to: 'TRAITEE', label: 'Marquer traitée' },
    { to: 'ARCHIVEE', label: 'Archiver' },
  ],
  TRAITEE: [{ to: 'ARCHIVEE', label: 'Archiver' }],
  ARCHIVEE: [{ to: 'NOUVELLE', label: 'Remettre en nouvelle' }],
};

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const { submissions, setSubmissionStatus, hydrated } = useForms();
  const { setOrg } = useErp();
  const sub = submissions.find((s) => s.id === params.id);

  if (!hydrated) return <p className="text-sm text-gray-500">Chargement…</p>;

  if (!sub) {
    return (
      <EmptyState
        title="Demande introuvable"
        action={
          <Link href="/demandes" className="text-sm font-medium text-cyan-800 hover:underline">
            Retour aux demandes
          </Link>
        }
      />
    );
  }

  const org = ORGANIZATIONS[sub.org];

  const renderAnswer = (fieldId: string) => {
    const field = findField(sub.schema, fieldId);
    const v = sub.answers[fieldId];
    const display = Array.isArray(v) ? v.join(', ') : v;
    return (
      <div key={fieldId} className="rounded-lg bg-gray-50 px-3 py-2.5">
        <dt className="text-xs font-medium text-gray-500">
          {field?.label ?? fieldId}
          {field && (
            <span className="ml-1.5 font-normal text-gray-400">
              ({FIELD_TYPE_LABELS[field.type]})
            </span>
          )}
        </dt>
        <dd className="mt-0.5 whitespace-pre-wrap text-sm text-gray-800">{display}</dd>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {sub.reference}
            <Badge tone={STATUS_TONE[sub.status]}>{SUBMISSION_STATUS_LABELS[sub.status]}</Badge>
          </span>
        }
        subtitle={
          <>
            <button onClick={() => setOrg(sub.org)} className="text-cyan-800 hover:underline">
              {org.displayName}
            </button>
            {' · '}{sub.formName} · version {sub.formVersion} · reçue le {formatDateTime(sub.submittedAt)}
            {' · '}
            <Link href="/demandes" className="text-cyan-800 hover:underline">
              ← Demandes
            </Link>
          </>
        }
        action={
          <>
            {(NEXT_STATUS[sub.status] ?? []).map((a) => (
              <button
                key={a.to}
                onClick={() => setSubmissionStatus(sub.id, a.to)}
                className="rounded-lg bg-cyan-800 px-3.5 py-2 text-sm font-medium text-white hover:bg-cyan-900"
              >
                {a.label}
              </button>
            ))}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {sub.schema.sections.map((section) => {
            const answered = section.fields.filter(
              (f) =>
                !DISPLAY_FIELD_TYPES.includes(f.type) &&
                sub.answers[f.id] !== undefined,
            );
            if (answered.length === 0) return null;
            return (
              <Card key={section.id} title={section.title ?? 'Réponses'}>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {answered.map((f) => renderAnswer(f.id))}
                </dl>
              </Card>
            );
          })}

          {sub.attachments.length > 0 && (
            <Card title="Pièces jointes (simulées)">
              <ul className="space-y-2">
                {sub.attachments.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="text-gray-400">
                      <path d="M21.4 11.05 12.35 20.1a5.5 5.5 0 0 1-7.78-7.78l8.49-8.49a3.67 3.67 0 0 1 5.19 5.19l-8.49 8.48a1.83 1.83 0 0 1-2.59-2.59l7.78-7.78" />
                    </svg>
                    {a.fileName}
                    <span className="text-xs text-gray-400">
                      — {findField(sub.schema, a.fieldId)?.label ?? 'fichier'}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <p className="text-xs text-gray-400">
            Réponses restituées selon la structure du formulaire version {sub.formVersion},
            telle qu’au moment de la soumission.
          </p>
        </div>

        <Card title="Journal" className="self-start">
          <ul className="space-y-3">
            {sub.history.map((h, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-cyan-700" />
                <div>
                  <p className="text-sm text-gray-800">{h.label}</p>
                  <p className="text-xs text-gray-400">
                    {formatDateTime(h.at)} · {h.by}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
