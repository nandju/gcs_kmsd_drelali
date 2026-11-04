'use client';

// Gestion centralisée des formulaires, par organisation.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useErp } from '@/context/erp-store';
import { useForms } from '@/context/forms-store';
import { ORGANIZATIONS, ORG_LIST } from '@/config/organizations';
import type { FormKind, FormStatus } from '@/modules/forms/types';
import { FORM_KIND_LABELS, FORM_STATUS_LABELS } from '@/modules/forms/types';
import { publishedVersion, slugify } from '@/modules/forms/logic';
import { formatDateTime } from '@/lib/erp/format';
import {
  Badge,
  Button,
  Card,
  DemoNotice,
  EmptyState,
  Field,
  inputClass,
  PageHeader,
  Tabs,
} from '@/components/erp/ui';
import { Modal } from '@/components/ui/modal/modal';
import type { Tone } from '@/lib/erp/labels';

const STATUS_TONE: Record<FormStatus, Tone> = {
  BROUILLON: 'amber',
  PUBLIE: 'green',
  DESACTIVE: 'gray',
  ARCHIVE: 'gray',
};

export default function FormsListPage() {
  const { org, setOrg } = useErp();
  const { forms, hydrated, createForm, setFormStatus } = useForms();
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [kind, setKind] = useState<FormKind>('GENERIQUE');

  const orgForms = useMemo(
    () => forms.filter((f) => f.org === org),
    [forms, org],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of forms) c[f.org] = (c[f.org] ?? 0) + 1;
    return c;
  }, [forms]);

  const create = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const form = createForm({
      org,
      name: trimmed,
      slug: slugify(trimmed) || 'formulaire',
      kind,
      purpose: purpose.trim() || undefined,
    });
    setModal(false);
    setName('');
    setPurpose('');
    router.push(`/formulaires/${form.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Gestion des formulaires"
        subtitle="Créez et publiez les formulaires publics de chaque organisation."
        action={
          <Button onClick={() => setModal(true)}>+ Nouveau formulaire</Button>
        }
      />
      <DemoNotice>
        Configuration stockée localement dans ce navigateur (localStorage) — les
        données ne sont ni partagées ni centralisées. L’adaptateur sera remplacé
        par Supabase en phase ultérieure.
      </DemoNotice>

      <Tabs
        tabs={ORG_LIST.map((o) => ({
          id: o.code,
          label: o.displayName,
          count: counts[o.code] ?? 0,
        }))}
        active={org}
        onChange={(id) => setOrg(id as typeof org)}
      />

      {!hydrated || orgForms.length === 0 ? (
        <EmptyState
          title={`Aucun formulaire pour ${ORGANIZATIONS[org].code}`}
          description="Créez un premier formulaire : il pourra ensuite être publié sur la plateforme publique de l’organisation."
          action={<Button onClick={() => setModal(true)}>Créer un formulaire</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orgForms.map((form) => {
            const v = publishedVersion(form);
            return (
              <Card key={form.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/formulaires/${form.id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-cyan-800"
                    >
                      {form.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {FORM_KIND_LABELS[form.kind]} · /{form.slug}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[form.status]}>
                    {FORM_STATUS_LABELS[form.status]}
                  </Badge>
                </div>
                {form.purpose && (
                  <p className="mt-2 line-clamp-2 text-xs text-gray-500">{form.purpose}</p>
                )}
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-gray-50 py-2">
                    <dt className="text-[10px] uppercase text-gray-400">Champs</dt>
                    <dd className="text-sm font-semibold text-gray-800">
                      {form.draft.sections.reduce((n, s) => n + s.fields.length, 0)}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-gray-50 py-2">
                    <dt className="text-[10px] uppercase text-gray-400">Version</dt>
                    <dd className="text-sm font-semibold text-gray-800">
                      {v ? `v${v.version}` : '—'}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-gray-50 py-2">
                    <dt className="text-[10px] uppercase text-gray-400">Modifié</dt>
                    <dd className="text-[11px] font-medium text-gray-600">
                      {formatDateTime(form.updatedAt)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/formulaires/${form.id}`}
                    className="rounded-lg bg-cyan-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-900"
                  >
                    Ouvrir le constructeur
                  </Link>
                  {form.status === 'PUBLIE' ? (
                    <button
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onClick={() => setFormStatus(form.id, 'DESACTIVE')}
                    >
                      Désactiver
                    </button>
                  ) : form.status !== 'ARCHIVE' ? (
                    <button
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onClick={() => setFormStatus(form.id, 'ARCHIVE')}
                    >
                      Archiver
                    </button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={`Nouveau formulaire — ${ORGANIZATIONS[org].code}`}
        description="Le formulaire sera créé en brouillon, puis configurable dans le constructeur."
        className={{ modal: 'sm:w-[480px] sm:p-8 rounded-2xl' }}
      >
        <div className="mt-4 space-y-4">
          <Field label="Nom du formulaire" required>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Demande de groupage"
            />
          </Field>
          <Field label="Objectif">
            <input
              className={inputClass}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="ex. Collecter les demandes de devis groupage"
            />
          </Field>
          <Field label="Type de formulaire" required>
            <select
              className={inputClass}
              value={kind}
              onChange={(e) => setKind(e.target.value as FormKind)}
            >
              {(Object.keys(FORM_KIND_LABELS) as FormKind[]).map((k) => (
                <option key={k} value={k}>
                  {FORM_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>
              Annuler
            </Button>
            <Button onClick={create} disabled={!name.trim()}>
              Créer le brouillon
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
