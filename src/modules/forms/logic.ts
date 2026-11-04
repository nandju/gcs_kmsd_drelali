import type { OrgCode } from '@/config/organizations';
import type {
  Form,
  FormCondition,
  FormField,
  FormSchema,
  FormSection,
} from './types';
import {
  DISPLAY_FIELD_TYPES,
  INPUT_FIELD_TYPES,
  OPTION_FIELD_TYPES,
} from './types';
import type { FormVersion } from './types';

export { DISPLAY_FIELD_TYPES, INPUT_FIELD_TYPES, OPTION_FIELD_TYPES };

/** Dernière version publiée d'un formulaire. */
export function publishedVersion(form: Form): FormVersion | undefined {
  return form.versions[form.versions.length - 1];
}

export type FieldValue = string | string[] | undefined;

/* --------------------------- Conditions ----------------------------- */

function singleValue(v: FieldValue): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

function evalCondition(
  cond: FormCondition,
  answers: Record<string, FieldValue>,
): boolean {
  const raw = answers[cond.fieldId];
  const value = singleValue(raw);
  const target = (cond.value ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  switch (cond.operator) {
    case 'equals':
      return Array.isArray(raw)
        ? raw.includes(cond.value ?? '')
        : value === (cond.value ?? '');
    case 'not_equals':
      return Array.isArray(raw)
        ? !raw.includes(cond.value ?? '')
        : value !== (cond.value ?? '');
    case 'in':
      return target.includes(value) || (Array.isArray(raw) && raw.some((r) => target.includes(r)));
    case 'not_empty':
      return Array.isArray(raw) ? raw.length > 0 : value.trim() !== '';
    case 'empty':
      return Array.isArray(raw) ? raw.length === 0 : value.trim() === '';
    default:
      return true;
  }
}

/** Un champ est visible si activé et si toutes ses conditions passent. */
export function isFieldVisible(
  field: FormField,
  answers: Record<string, FieldValue>,
): boolean {
  if (!field.enabled) return false;
  if (!field.conditions || field.conditions.length === 0) return true;
  return field.conditions.every((c) => evalCondition(c, answers));
}

/* ----------------------------- Helpers ------------------------------ */

export function allFields(schema: FormSchema): FormField[] {
  return schema.sections.flatMap((s) => s.fields);
}

export function findField(schema: FormSchema, fieldId: string): FormField | undefined {
  return allFields(schema).find((f) => f.id === fieldId);
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function createField(type: FormField['type']): FormField {
  const base: FormField = {
    id: `fld-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    label:
      type === 'separator'
        ? 'Séparateur'
        : type === 'info'
          ? 'Information'
          : 'Nouveau champ',
    required: false,
    enabled: true,
  };
  if (OPTION_FIELD_TYPES.includes(type)) base.options = ['Option 1', 'Option 2'];
  return base;
}

export function createSection(): FormSection {
  return {
    id: `sec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: 'Nouvelle section',
    fields: [],
  };
}

/* ---------------------------- Validation ---------------------------- */

export function validateField(field: FormField, value: FieldValue): string | undefined {
  const v = singleValue(value).trim();
  const empty = Array.isArray(value) ? value.length === 0 : v === '';
  const custom = field.validation?.errorMessage;

  if (field.required && empty) {
    return custom ?? 'Ce champ est obligatoire.';
  }
  if (empty) return undefined;

  const val = field.validation;
  if (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(v)) {
    return custom ?? 'Adresse e-mail invalide.';
  }
  if (
    (field.type === 'text' ||
      field.type === 'textarea' ||
      field.type === 'address' ||
      field.type === 'phone') &&
    val
  ) {
    if (val.minLength !== undefined && v.length < val.minLength) {
      return custom ?? `Minimum ${val.minLength} caractères.`;
    }
    if (val.maxLength !== undefined && v.length > val.maxLength) {
      return custom ?? `Maximum ${val.maxLength} caractères.`;
    }
  }
  if ((field.type === 'number' || field.type === 'decimal') && val) {
    const n = Number(v);
    if (Number.isNaN(n)) return custom ?? 'Nombre invalide.';
    if (val.min !== undefined && n < val.min) return custom ?? `Minimum ${val.min}.`;
    if (val.max !== undefined && n > val.max) return custom ?? `Maximum ${val.max}.`;
  }
  return undefined;
}

/** Valide l'ensemble du formulaire ; retourne les erreurs par champ. */
export function validateSchema(
  schema: FormSchema,
  answers: Record<string, FieldValue>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of allFields(schema)) {
    if (DISPLAY_FIELD_TYPES.includes(field.type)) continue;
    if (!isFieldVisible(field, answers)) continue;
    const err = validateField(field, answers[field.id]);
    if (err) errors[field.id] = err;
  }
  return errors;
}

/** Valide uniquement les champs visibles d'une section (étape). */
export function validateSection(
  section: FormSection,
  answers: Record<string, FieldValue>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of section.fields) {
    if (DISPLAY_FIELD_TYPES.includes(field.type)) continue;
    if (!isFieldVisible(field, answers)) continue;
    const err = validateField(field, answers[field.id]);
    if (err) errors[field.id] = err;
  }
  return errors;
}

/* ------------------------- Formulaires publics ----------------------- */

/** Formulaire publié + version publiée, ou null. */
export function getPublishedForm(
  forms: Form[],
  org: OrgCode,
  predicate: (f: Form) => boolean,
): { form: Form; version: FormSchema; versionNumber: number } | null {
  const form = forms.find(
    (f) => f.org === org && f.status === 'PUBLIE' && publishedVersion(f) && predicate(f),
  );
  if (!form) return null;
  const v = publishedVersion(form)!;
  return { form, version: v.schema, versionNumber: v.version };
}

export function getPublishedBySlug(forms: Form[], org: OrgCode, slug: string) {
  return getPublishedForm(forms, org, (f) => f.slug === slug);
}

export function getPublishedByKind(forms: Form[], org: OrgCode, kind: Form['kind']) {
  return getPublishedForm(forms, org, (f) => f.kind === kind);
}
