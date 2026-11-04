'use client';

// Moteur de rendu public des formulaires configurables.
// Utilisé par les pages publiques (GCS, KIMEXDI) et par l'aperçu du
// constructeur. Les pièces jointes sont simulées : seul le nom du
// fichier est conservé, aucun téléversement n'a lieu.

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type {
  FormField,
  FormSchema,
  SubmissionAttachment,
} from '@/modules/forms/types';
import {
  DISPLAY_FIELD_TYPES,
  isFieldVisible,
  validateSchema,
  validateSection,
  type FieldValue,
} from '@/modules/forms/logic';

export type RendererTheme = 'gcs' | 'kimexdi';

const THEME: Record<
  RendererTheme,
  { input: string; button: string; info: string; radio: string; step: string }
> = {
  gcs: {
    input:
      'w-full rounded-lg border border-[var(--gcs-line)] bg-white px-3 py-2.5 text-sm text-[var(--gcs-ink)] placeholder:text-[var(--gcs-ink-soft)] focus:border-[var(--gcs-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--gcs-accent)]/15',
    button:
      'bg-[var(--gcs-accent)] text-white hover:bg-[var(--gcs-accent-dark)] rounded-full',
    info: 'border-[var(--gcs-accent)]/25 bg-[var(--gcs-accent-light)] text-[var(--gcs-navy-950)]',
    radio: 'accent-[#e8552d]',
    step: '#e8552d',
  },
  kimexdi: {
    input:
      'w-full rounded-lg border border-[var(--kimexdi-border)] bg-white px-3 py-2.5 text-sm text-[var(--kimexdi-ink)] placeholder:text-[var(--kimexdi-gray)] focus:border-[var(--kimexdi-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--kimexdi-blue)]/15',
    button: 'bg-[var(--kimexdi-blue)] text-white hover:bg-[var(--kimexdi-navy)]',
    info: 'border-[var(--kimexdi-blue)]/25 bg-[var(--kimexdi-blue-light)] text-[var(--kimexdi-navy)]',
    radio: 'accent-[var(--kimexdi-blue)]',
    step: '#1769aa',
  },
};

interface RenderProps {
  schema: FormSchema;
  theme?: RendererTheme;
  submitLabel?: string;
  /** En mode aperçu : aucune soumission réelle. */
  preview?: boolean;
  onSubmit?: (
    answers: Record<string, string | string[]>,
    attachments: SubmissionAttachment[],
  ) => void;
}

export function FormRenderer({
  schema,
  theme = 'gcs',
  submitLabel = 'Envoyer ma demande',
  preview = false,
  onSubmit,
}: RenderProps) {
  const t = THEME[theme];
  const [answers, setAnswers] = useState<Record<string, FieldValue>>(() => {
    const init: Record<string, FieldValue> = {};
    for (const s of schema.sections)
      for (const f of s.fields) if (f.defaultValue) init[f.id] = f.defaultValue;
    return init;
  });
  const [files, setFiles] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState(0);

  const set = (id: string, v: FieldValue) =>
    setAnswers((a) => ({ ...a, [id]: v }));

  const visibleFields = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const s of schema.sections)
      for (const f of s.fields) map[f.id] = isFieldVisible(f, answers);
    return map;
  }, [schema, answers]);

  // Chaque section = une étape ; les sections entièrement masquées par les
  // conditions sont sautées.
  const visibleSections = useMemo(
    () =>
      schema.sections.filter(
        (s) => s.fields.length > 0 && s.fields.some((f) => visibleFields[f.id]),
      ),
    [schema, visibleFields],
  );
  const stepCount = visibleSections.length;
  const currentStep = Math.min(step, stepCount - 1);
  const isLastStep = currentStep === stepCount - 1;
  const currentSection = visibleSections[currentStep];

  const goNext = () => {
    if (!currentSection) return;
    const errs = validateSection(currentSection, answers);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep((s) => s + 1);
  };

  const goPrev = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLastStep) {
      goNext();
      return;
    }
    const errs = validateSchema(schema, answers);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Revenir à la première étape contenant une erreur.
      const firstErr = visibleSections.findIndex((s) =>
        s.fields.some((f) => errs[f.id]),
      );
      if (firstErr >= 0) setStep(firstErr);
      return;
    }
    if (preview) {
      setSent(true);
      return;
    }
    const clean: Record<string, string | string[]> = {};
    for (const s of schema.sections)
      for (const f of s.fields) {
        if (DISPLAY_FIELD_TYPES.includes(f.type) || !visibleFields[f.id]) continue;
        const v = answers[f.id];
        if (f.type === 'file' || f.type === 'image') continue;
        if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) continue;
        clean[f.id] = v;
      }
    const attachments: SubmissionAttachment[] = Object.entries(files)
      .filter(([fid, name]) => name && visibleFields[fid])
      .map(([fid, name], i) => ({ id: `att-${i}`, fieldId: fid, fileName: name }));
    onSubmit?.(clean, attachments);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-theme-xs">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Demande bien reçue</h2>
        <p className="mt-2 text-sm text-gray-600">
          {preview
            ? 'Aperçu : la soumission serait enregistrée et visible dans le tableau de bord.'
            : 'Votre demande a été enregistrée. Notre équipe vous recontactera.'}
        </p>
        {!preview && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Démonstration : cette demande ne constitue ni une cotation acceptée, ni une
            réservation ferme, ni une preuve de prise en charge.
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setAnswers({});
            setFiles({});
            setStep(0);
          }}
          className="mt-4 text-sm font-medium text-cyan-700 hover:underline"
        >
          Soumettre une autre demande
        </button>
      </div>
    );
  }

  const section = currentSection;
  const visible = section ? section.fields.filter((f) => visibleFields[f.id]) : [];

  return (
    <form onSubmit={submit} noValidate>
      {/* Indicateur de progression */}
      {stepCount > 1 && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Étape {currentStep + 1} sur {stepCount}
              {section?.title ? ` — ${section.title}` : ''}
            </p>
          </div>
          <ol className="mt-2 flex gap-1.5" aria-label="Progression">
            {visibleSections.map((s, i) => (
              <li
                key={s.id}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  i <= currentStep ? 'bg-current' : 'bg-gray-200',
                )}
                style={i <= currentStep ? { color: t.step } : undefined}
                aria-current={i === currentStep ? 'step' : undefined}
              />
            ))}
          </ol>
        </div>
      )}

      {/* Étape courante */}
      {section && (
        <fieldset key={section.id}>
          {(section.title || section.description) && (
            <legend className="sr-only">{section.title}</legend>
          )}
          {stepCount <= 1 && section.title && (
            <h3 className="mb-1 text-base font-semibold text-gray-900">
              {section.title}
            </h3>
          )}
          {section.description && (
            <p className="mb-3 text-sm text-gray-500">{section.description}</p>
          )}
          <div className={cn('grid gap-4', visible.length > 0 && 'sm:grid-cols-2')}>
            {visible.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                theme={t}
                value={answers[field.id]}
                fileName={files[field.id]}
                error={errors[field.id]}
                onChange={(v) => set(field.id, v)}
                onFile={(name) =>
                  setFiles((f) => ({ ...f, [field.id]: name }))
                }
              />
            ))}
          </div>
        </fieldset>
      )}

      {/* Navigation par étapes */}
      <div className={cn('mt-6 flex gap-3', currentStep === 0 && 'flex-col')}>
        {currentStep > 0 && (
          <button
            type="button"
            onClick={goPrev}
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 sm:w-40"
          >
            ← Précédent
          </button>
        )}
        <button
          type="submit"
          className={cn(
            'flex-1 rounded-lg py-3 text-base font-medium transition',
            t.button,
          )}
        >
          {isLastStep ? submitLabel : 'Suivant →'}
        </button>
      </div>
    </form>
  );
}

/* ---------------------------- Champ unique --------------------------- */

function FieldInput({
  field,
  theme,
  value,
  fileName,
  error,
  onChange,
  onFile,
}: {
  field: FormField;
  theme: (typeof THEME)[RendererTheme];
  value: FieldValue;
  fileName?: string;
  error?: string;
  onChange: (v: FieldValue) => void;
  onFile: (name: string) => void;
}) {
  const wide =
    field.type === 'textarea' ||
    field.type === 'info' ||
    field.type === 'separator';

  if (field.type === 'separator') {
    return (
      <div className="sm:col-span-2" role="separator" aria-label={field.label}>
        <hr className="border-gray-200" />
        {field.description && (
          <p className="mt-1 text-xs text-gray-400">{field.description}</p>
        )}
      </div>
    );
  }

  if (field.type === 'info') {
    return (
      <div
        className={cn('rounded-lg border p-4 text-sm sm:col-span-2', theme.info)}
        role="note"
      >
        <p className="font-semibold">{field.label}</p>
        {field.description && <p className="mt-1">{field.description}</p>}
      </div>
    );
  }

  const str = typeof value === 'string' ? value : '';
  const arr = Array.isArray(value) ? value : [];

  const label = (
    <span className="mb-1.5 block text-sm font-medium text-gray-700">
      {field.label}
      {field.required && <span className="text-red-500"> *</span>}
    </span>
  );

  const hint =
    !error && field.description ? (
      <span className="mt-1 block text-xs text-gray-400">{field.description}</span>
    ) : null;
  const err = error ? (
    <span className="mt-1 block text-xs text-red-600" role="alert">
      {error}
    </span>
  ) : null;

  let control: React.ReactNode;
  switch (field.type) {
    case 'textarea':
      control = (
        <textarea
          className={theme.input}
          rows={3}
          value={str}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case 'select':
      control = (
        <select
          className={theme.input}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{field.placeholder ?? 'Sélectionner…'}</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
      break;
    case 'radio':
      control = (
        <div className="space-y-1.5 pt-1" role="radiogroup" aria-label={field.label}>
          {(field.options ?? []).map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name={field.id}
                className={theme.radio}
                checked={str === o}
                onChange={() => onChange(o)}
              />
              {o}
            </label>
          ))}
        </div>
      );
      break;
    case 'checkbox':
      control = (
        <div className="space-y-1.5 pt-1">
          {(field.options ?? []).map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className={theme.radio}
                checked={arr.includes(o)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...arr, o]
                      : arr.filter((x) => x !== o),
                  )
                }
              />
              {o}
            </label>
          ))}
        </div>
      );
      break;
    case 'number':
    case 'decimal':
      control = (
        <input
          type="number"
          className={theme.input}
          value={str}
          step={field.type === 'decimal' ? 'any' : '1'}
          min={field.validation?.min}
          max={field.validation?.max}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case 'date':
      control = (
        <input
          type="date"
          className={theme.input}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case 'time':
      control = (
        <input
          type="time"
          className={theme.input}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case 'datetime':
      control = (
        <input
          type="datetime-local"
          className={theme.input}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case 'file':
    case 'image':
      control = (
        <div>
          <input
            type="file"
            accept={field.validation?.accept}
            className={cn(theme.input, 'file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-700')}
            onChange={(e) => onFile(e.target.files?.[0]?.name ?? '')}
          />
          {fileName && (
            <span className="mt-1 block text-xs text-gray-500">
              Fichier simulé : {fileName}
            </span>
          )}
        </div>
      );
      break;
    default:
      // text, email, phone, address
      control = (
        <input
          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
          className={theme.input}
          value={str}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }

  return (
    <label className={cn('block text-sm', wide && 'sm:col-span-2')}>
      {label}
      {control}
      {hint}
      {err}
    </label>
  );
}
