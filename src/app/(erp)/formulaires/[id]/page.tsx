'use client';

// Constructeur visuel de formulaires : configuration à gauche,
// aperçu temps réel à droite (ordinateur / mobile).

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useForms } from '@/context/forms-store';
import { ORGANIZATIONS } from '@/config/organizations';
import type {
  FieldType,
  FormField,
  FormKind,
  FormSchema,
  FormStatus,
} from '@/modules/forms/types';
import {
  FIELD_TYPE_LABELS,
  FORM_KIND_LABELS,
  FORM_STATUS_LABELS,
} from '@/modules/forms/types';
import {
  createField,
  createSection,
  publishedVersion,
} from '@/modules/forms/logic';
import { FormRenderer } from '@/modules/forms/renderer/form-renderer';
import { FieldEditor } from '@/modules/forms/builder/field-editor';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  inputClass,
  PageHeader,
} from '@/components/erp/ui';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/erp/format';
import type { Tone } from '@/lib/erp/labels';

const STATUS_TONE: Record<FormStatus, Tone> = {
  BROUILLON: 'amber',
  PUBLIE: 'green',
  DESACTIVE: 'gray',
  ARCHIVE: 'gray',
};

const ADDABLE_TYPES: FieldType[] = [
  'text', 'textarea', 'email', 'phone', 'number', 'decimal',
  'select', 'radio', 'checkbox', 'date', 'time', 'datetime',
  'address', 'file', 'image', 'separator', 'info',
];

interface Pos {
  section: number;
  field: number;
}

function moveField(schema: FormSchema, from: Pos, to: Pos): FormSchema {
  const sections = schema.sections.map((s) => ({ ...s, fields: [...s.fields] }));
  const [moved] = sections[from.section].fields.splice(from.field, 1);
  if (!moved) return schema;
  const target = sections[to.section];
  const idx = Math.min(to.field, target.fields.length);
  target.fields.splice(idx, 0, moved);
  return { sections };
}

function publicPathFor(org: string, slug: string, kind: FormKind): string {
  if (org === 'GCS')
    return kind === 'DEVIS' ? '/gcs/devis' : `/gcs/demande/${slug}`;
  if (org === 'KIMEXDI')
    return kind === 'DEVIS' ? '/kimexdi/devis' : `/kimexdi/demande/${slug}`;
  return '#';
}

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>();
  const {
    forms,
    hydrated,
    updateDraft,
    updateFormMeta,
    publishForm,
    setFormStatus,
  } = useForms();
  const form = forms.find((f) => f.id === params.id);

  const [meta, setMeta] = useState({ name: '', slug: '', purpose: '', kind: 'GENERIQUE' as FormKind });
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [drag, setDrag] = useState<Pos | null>(null);
  const dirtyRef = useRef(false);
  const [dirty, setDirty] = useState(false);

  // Initialisation locale depuis le brouillon persisté.
  useEffect(() => {
    if (form && !dirtyRef.current) {
      setSchema(form.draft);
      setMeta({
        name: form.name,
        slug: form.slug,
        purpose: form.purpose ?? '',
        kind: form.kind,
      });
    }
  }, [form]);

  const mutate = (fn: (s: FormSchema) => FormSchema) => {
    setSchema((s) => {
      if (!s) return s;
      dirtyRef.current = true;
      setDirty(true);
      return fn(s);
    });
  };

  const patchField = (si: number, fi: number, patch: Partial<FormField>) =>
    mutate((s) => ({
      sections: s.sections.map((sec, i) =>
        i === si
          ? { ...sec, fields: sec.fields.map((f, j) => (j === fi ? { ...f, ...patch } : f)) }
          : sec,
      ),
    }));

  const selectedPos = useMemo<Pos | null>(() => {
    if (!schema || !selected) return null;
    for (let si = 0; si < schema.sections.length; si++) {
      const fi = schema.sections[si].fields.findIndex((f) => f.id === selected);
      if (fi >= 0) return { section: si, field: fi };
    }
    return null;
  }, [schema, selected]);

  const selectedField =
    selectedPos && schema ? schema.sections[selectedPos.section].fields[selectedPos.field] : null;

  if (!hydrated) {
    return <p className="text-sm text-gray-500">Chargement…</p>;
  }

  if (!form || !schema) {
    return (
      <EmptyState
        title="Formulaire introuvable"
        description="Ce formulaire n'existe pas ou a été supprimé."
        action={
          <Link href="/formulaires" className="text-sm font-medium text-cyan-800 hover:underline">
            Retour à la liste
          </Link>
        }
      />
    );
  }

  const version = publishedVersion(form);
  const editable = form.status !== 'ARCHIVE';
  const org = ORGANIZATIONS[form.org];

  const saveDraft = (silent = false) => {
    updateFormMeta(form.id, {
      name: meta.name.trim() || form.name,
      slug: meta.slug.trim() || form.slug,
      purpose: meta.purpose.trim() || undefined,
      kind: meta.kind,
    });
    updateDraft(form.id, schema);
    dirtyRef.current = false;
    setDirty(false);
    if (!silent) toast.success('Brouillon enregistré (local, démonstration).');
  };

  const publish = () => {
    saveDraft(true);
    publishForm(form.id);
    toast.success(`Version publiée — le formulaire public utilise désormais cette structure.`);
  };

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {meta.name || form.name}
            <Badge tone={STATUS_TONE[form.status]}>{FORM_STATUS_LABELS[form.status]}</Badge>
            {dirty && <Badge tone="blue">Non enregistré</Badge>}
          </span>
        }
        subtitle={
          <>
            {org.displayName} · {version ? `Version publiée : v${version.version} (${formatDateTime(version.publishedAt)})` : 'Jamais publié'}
            {' · '}
            <Link href="/formulaires" className="text-cyan-800 hover:underline">
              ← Liste des formulaires
            </Link>
            {form.status === 'PUBLIE' && (
              <>
                {' · '}
                <a
                  href={publicPathFor(form.org, form.slug, form.kind)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-800 hover:underline"
                >
                  Voir sur le site public ↗
                </a>
              </>
            )}
          </>
        }
        action={
          <>
            {editable && (
              <Button variant="secondary" onClick={() => saveDraft()} disabled={!dirty}>
                Enregistrer le brouillon
              </Button>
            )}
            {editable && (
              <Button
                onClick={publish}
                disabled={schema.sections.every((s) => s.fields.length === 0)}
              >
                Publier une version
              </Button>
            )}
            {form.status === 'PUBLIE' && (
              <Button variant="secondary" onClick={() => setFormStatus(form.id, 'DESACTIVE')}>
                Désactiver
              </Button>
            )}
            {form.status === 'DESACTIVE' && (
              <Button variant="secondary" onClick={() => setFormStatus(form.id, 'BROUILLON')}>
                Repasser en brouillon
              </Button>
            )}
          </>
        }
      />

      {/* Métadonnées */}
      <Card className="mb-5" title="Informations générales">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Nom" required>
            <input className={inputClass} value={meta.name} disabled={!editable}
              onChange={(e) => { dirtyRef.current = true; setDirty(true); setMeta((m) => ({ ...m, name: e.target.value })); }} />
          </Field>
          <Field label="Slug public" hint="Chemin d'accès du formulaire.">
            <input className={inputClass} value={meta.slug} disabled={!editable}
              onChange={(e) => { dirtyRef.current = true; setDirty(true); setMeta((m) => ({ ...m, slug: e.target.value })); }} />
          </Field>
          <Field label="Type">
            <select className={inputClass} value={meta.kind} disabled={!editable}
              onChange={(e) => { dirtyRef.current = true; setDirty(true); setMeta((m) => ({ ...m, kind: e.target.value as FormKind })); }}>
              {(Object.keys(FORM_KIND_LABELS) as FormKind[]).map((k) => (
                <option key={k} value={k}>{FORM_KIND_LABELS[k]}</option>
              ))}
            </select>
          </Field>
          <Field label="Objectif">
            <input className={inputClass} value={meta.purpose} disabled={!editable}
              onChange={(e) => { dirtyRef.current = true; setDirty(true); setMeta((m) => ({ ...m, purpose: e.target.value })); }} />
          </Field>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* -------------------------- Configuration ------------------------ */}
        <div className="space-y-4">
          {schema.sections.map((section, si) => (
            <Card
              key={section.id}
              title={
                <input
                  className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-gray-800 hover:border-gray-200 focus:border-cyan-600 focus:outline-none"
                  value={section.title ?? ''}
                  placeholder="Titre de section (facultatif)"
                  disabled={!editable}
                  onChange={(e) =>
                    mutate((s) => ({
                      sections: s.sections.map((sec, i) =>
                        i === si ? { ...sec, title: e.target.value } : sec,
                      ),
                    }))
                  }
                />
              }
              action={
                editable && schema.sections.length > 1 ? (
                  <button
                    className="text-xs text-red-600 hover:underline"
                    onClick={() =>
                      mutate((s) => ({ sections: s.sections.filter((_, i) => i !== si) }))
                    }
                  >
                    Supprimer
                  </button>
                ) : undefined
              }
            >
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (drag && editable) {
                    mutate((s) => moveField(s, drag, { section: si, field: schema.sections[si].fields.length }));
                    setDrag(null);
                  }
                }}
                className="space-y-1.5"
              >
                {section.fields.length === 0 && (
                  <p className="rounded-lg border border-dashed border-gray-300 py-4 text-center text-xs text-gray-400">
                    Aucun champ — ajoutez-en un ci-dessous.
                  </p>
                )}
                {section.fields.map((field, fi) => (
                  <div
                    key={field.id}
                    draggable={editable}
                    onDragStart={() => setDrag({ section: si, field: fi })}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.stopPropagation();
                      if (drag && editable) {
                        mutate((s) => moveField(s, drag, { section: si, field: fi }));
                        setDrag(null);
                      }
                    }}
                    onClick={() => setSelected(field.id === selected ? null : field.id)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition',
                      selected === field.id
                        ? 'border-cyan-600 bg-cyan-50/60'
                        : 'border-gray-200 bg-white hover:border-gray-300',
                      !field.enabled && 'opacity-50',
                      editable && 'cursor-grab',
                    )}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-gray-300" aria-hidden>
                      <circle cx="8" cy="5" r="1.6" /><circle cx="16" cy="5" r="1.6" />
                      <circle cx="8" cy="12" r="1.6" /><circle cx="16" cy="12" r="1.6" />
                      <circle cx="8" cy="19" r="1.6" /><circle cx="16" cy="19" r="1.6" />
                    </svg>
                    <span className="min-w-0 flex-1 truncate font-medium text-gray-800">
                      {field.label}
                      {field.required && <span className="text-red-500"> *</span>}
                    </span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {FIELD_TYPE_LABELS[field.type]}
                    </span>
                    {(field.conditions?.length ?? 0) > 0 && (
                      <span title="Champ conditionnel" className="shrink-0 text-violet-500">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
                        </svg>
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {editable && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="mb-2 text-xs font-medium text-gray-500">Ajouter un champ</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ADDABLE_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 hover:border-cyan-600 hover:text-cyan-800"
                        onClick={() => {
                          const nf = createField(t);
                          mutate((s) => ({
                            sections: s.sections.map((sec, i) =>
                              i === si ? { ...sec, fields: [...sec.fields, nf] } : sec,
                            ),
                          }));
                          setSelected(nf.id);
                        }}
                      >
                        + {FIELD_TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}

          {editable && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => mutate((s) => ({ sections: [...s.sections, createSection()] }))}
            >
              + Ajouter une section
            </Button>
          )}

          {/* Éditeur du champ sélectionné */}
          {selectedField && selectedPos && (
            <Card title={`Champ : ${selectedField.label}`}>
              <FieldEditor
                field={selectedField}
                schema={schema}
                onChange={(patch) => patchField(selectedPos.section, selectedPos.field, patch)}
                onDelete={() => {
                  mutate((s) => ({
                    sections: s.sections.map((sec, i) =>
                      i === selectedPos.section
                        ? { ...sec, fields: sec.fields.filter((_, j) => j !== selectedPos.field) }
                        : sec,
                    ),
                  }));
                  setSelected(null);
                }}
              />
            </Card>
          )}
        </div>

        {/* ----------------------------- Aperçu ---------------------------- */}
        <div className="xl:sticky xl:top-24 xl:self-start">
          <Card
            title="Aperçu visiteur"
            action={
              <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5">
                {(['desktop', 'mobile'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPreviewMode(m)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium',
                      previewMode === m ? 'bg-white shadow-theme-xs text-gray-900' : 'text-gray-500',
                    )}
                  >
                    {m === 'desktop' ? 'Ordinateur' : 'Mobile'}
                  </button>
                ))}
              </div>
            }
          >
            <div
              className={cn(
                'mx-auto rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all',
                previewMode === 'mobile' ? 'max-w-sm' : 'max-w-none',
              )}
            >
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <FormRenderer
                  key={JSON.stringify(schema)}
                  schema={schema}
                  theme={form.org === 'KIMEXDI' ? 'kimexdi' : 'gcs'}
                  preview
                />
              </div>
              <p className="mt-3 text-center text-[11px] text-gray-400">
                L’aperçu reflète le brouillon, y compris les conditions d’affichage.
                Les visiteurs ne voient que la dernière version publiée.
              </p>
            </div>
          </Card>

          {form.versions.length > 0 && (
            <Card title="Historique des versions" className="mt-4">
              <ul className="space-y-2">
                {[...form.versions].reverse().map((v) => (
                  <li key={v.version} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <span className="font-medium text-gray-800">Version {v.version}</span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(v.publishedAt)} · {v.publishedBy}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
