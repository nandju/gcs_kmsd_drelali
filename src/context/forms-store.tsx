'use client';

// Store de démonstration du système de formulaires.
// L'état transite par un FormsRepository (adaptateur localStorage) —
// remplaçable par une implémentation Supabase en phase ultérieure.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { OrgCode } from '@/config/organizations';
import type { AuditEvent, AuditEventType } from '@/modules/core/types';
import type {
  Form,
  FormKind,
  FormSchema,
  FormStatus,
  FormSubmission,
  SubmissionAttachment,
  SubmissionStatus,
} from '@/modules/forms/types';
import {
  SEED_AUDIT_EVENTS,
  SEED_FORMS,
  SEED_SUBMISSIONS,
} from '@/lib/mock-data/forms-seed';
import { createLocalFormsRepository } from '@/lib/repositories/local-forms-repository';
import type { FormsData, FormsRepository } from '@/lib/repositories/forms-repository';
import { publishedVersion } from '@/modules/forms/logic';

const ACTOR = 'Direction (démo)';
const EMPTY_SCHEMA: FormSchema = { sections: [{ id: 's-1', fields: [] }] };

let idCounter = 1;
function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${idCounter++}`;
}

function nextSubmissionRef(existing: FormSubmission[]): string {
  const max = existing
    .map((s) => parseInt(s.reference.replace('DEM-', ''), 10))
    .filter((n) => !Number.isNaN(n))
    .reduce((a, b) => Math.max(a, b), 0);
  return `DEM-${String(max + 1).padStart(6, '0')}`;
}

interface FormsActions {
  createForm: (data: {
    org: OrgCode;
    name: string;
    slug: string;
    kind: FormKind;
    purpose?: string;
  }) => Form;
  updateFormMeta: (
    id: string,
    patch: Partial<Pick<Form, 'name' | 'slug' | 'purpose' | 'kind'>>,
  ) => void;
  updateDraft: (id: string, schema: FormSchema) => void;
  publishForm: (id: string) => void;
  setFormStatus: (id: string, status: Exclude<FormStatus, 'PUBLIE'>) => void;
  addSubmission: (data: {
    org: OrgCode;
    formId: string;
    answers: Record<string, string | string[]>;
    attachments?: SubmissionAttachment[];
  }) => FormSubmission | undefined;
  setSubmissionStatus: (id: string, status: SubmissionStatus) => void;
  /** Indique si l'état localStorage a été chargé (évite les flashs). */
  hydrated: boolean;
}

const initialData: FormsData = {
  forms: SEED_FORMS,
  submissions: SEED_SUBMISSIONS,
  auditEvents: SEED_AUDIT_EVENTS,
};

const FormsContext = createContext<(FormsData & FormsActions) | null>(null);

export function FormsProvider({ children }: { children: ReactNode }) {
  const repositoryRef = useRef<FormsRepository | null>(null);
  if (!repositoryRef.current) repositoryRef.current = createLocalFormsRepository();

  const [data, setData] = useState<FormsData>(initialData);
  const [hydrated, setHydrated] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    setData(repositoryRef.current!.load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) repositoryRef.current!.save(data);
  }, [data, hydrated]);

  const audit = useCallback((entry: Omit<AuditEvent, 'id' | 'at'>) => {
    const evt: AuditEvent = {
      ...entry,
      id: uid('evt'),
      at: new Date().toISOString(),
    };
    setData((d) => ({ ...d, auditEvents: [evt, ...d.auditEvents] }));
  }, []);

  const createForm: FormsActions['createForm'] = useCallback(
    (input) => {
      const now = new Date().toISOString();
      const form: Form = {
        id: uid('form'),
        org: input.org,
        name: input.name,
        slug: input.slug,
        kind: input.kind,
        purpose: input.purpose,
        status: 'BROUILLON',
        draft: EMPTY_SCHEMA,
        versions: [],
        createdAt: now,
        updatedAt: now,
      };
      setData((d) => ({ ...d, forms: [form, ...d.forms] }));
      audit({
        org: input.org,
        actor: ACTOR,
        type: 'FORM_CREATED',
        entityKind: 'form',
        entityId: form.id,
        label: `Formulaire « ${input.name} » créé`,
      });
      return form;
    },
    [audit],
  );

  const touchForm = useCallback(
    (id: string, fn: (form: Form) => Form, auditType?: AuditEventType, auditLabel?: string) => {
      setData((d) => ({
        ...d,
        forms: d.forms.map((f) =>
          f.id === id ? { ...fn(f), updatedAt: new Date().toISOString() } : f,
        ),
      }));
      if (auditType) {
        const form = dataRef.current.forms.find((f) => f.id === id);
        audit({
          org: form?.org ?? 'GCS',
          actor: ACTOR,
          type: auditType,
          entityKind: 'form',
          entityId: id,
          label: auditLabel ?? '',
        });
      }
    },
    [audit],
  );

  const updateFormMeta: FormsActions['updateFormMeta'] = useCallback(
    (id, patch) => {
      touchForm(id, (f) => ({ ...f, ...patch }), 'FORM_UPDATED', `Formulaire « ${patch.name ?? ''} » modifié`);
    },
    [touchForm],
  );

  const updateDraft: FormsActions['updateDraft'] = useCallback(
    (id, schema) => {
      touchForm(id, (f) => ({ ...f, draft: schema }));
    },
    [touchForm],
  );

  const publishForm: FormsActions['publishForm'] = useCallback(
    (id) => {
      const form = dataRef.current.forms.find((f) => f.id === id);
      const nextVersion = (form?.versions.length ?? 0) + 1;
      touchForm(
        id,
        (f) => ({
          ...f,
          status: 'PUBLIE',
          versions: [
            ...f.versions,
            {
              version: nextVersion,
              schema: f.draft,
              publishedAt: new Date().toISOString(),
              publishedBy: ACTOR,
            },
          ],
        }),
        'FORM_VERSION_PUBLISHED',
        `Version ${nextVersion} publiée — ${form?.name ?? 'formulaire'}`,
      );
    },
    [touchForm],
  );

  const setFormStatus: FormsActions['setFormStatus'] = useCallback(
    (id, status) => {
      const form = dataRef.current.forms.find((f) => f.id === id);
      const type: AuditEventType =
        status === 'ARCHIVE' ? 'FORM_ARCHIVED' : status === 'DESACTIVE' ? 'FORM_DISABLED' : 'FORM_UPDATED';
      touchForm(
        id,
        (f) => ({ ...f, status }),
        type,
        `Formulaire « ${form?.name ?? ''} » : statut ${status}`,
      );
    },
    [touchForm],
  );

  const addSubmission: FormsActions['addSubmission'] = useCallback(
    (input) => {
      const form = dataRef.current.forms.find((f) => f.id === input.formId);
      const version = form ? publishedVersion(form) : undefined;
      if (!form || !version || form.status !== 'PUBLIE') return undefined;
      const now = new Date().toISOString();
      const submission: FormSubmission = {
        id: uid('sub'),
        reference: nextSubmissionRef(dataRef.current.submissions),
        org: form.org,
        formId: form.id,
        formName: form.name,
        formSlug: form.slug,
        formVersion: version.version,
        schema: version.schema,
        answers: input.answers,
        attachments: input.attachments ?? [],
        status: 'NOUVELLE',
        submittedAt: now,
        history: [{ at: now, label: 'Soumission reçue', by: 'Site public' }],
      };
      setData((d) => ({ ...d, submissions: [submission, ...d.submissions] }));
      audit({
        org: form.org,
        actor: 'Site public',
        type: 'SUBMISSION_RECEIVED',
        entityKind: 'submission',
        entityId: submission.id,
        label: `Soumission ${submission.reference} reçue — ${form.name}`,
      });
      return submission;
    },
    [audit],
  );

  const setSubmissionStatus: FormsActions['setSubmissionStatus'] = useCallback(
    (id, status) => {
      const sub = dataRef.current.submissions.find((s) => s.id === id);
      const now = new Date().toISOString();
      setData((d) => ({
        ...d,
        submissions: d.submissions.map((s) =>
          s.id === id
            ? {
                ...s,
                status,
                history: [
                  { at: now, label: `Statut : ${status}`, by: ACTOR },
                  ...s.history,
                ],
              }
            : s,
        ),
      }));
      audit({
        org: sub?.org ?? 'GCS',
        actor: ACTOR,
        type: 'SUBMISSION_STATUS_CHANGED',
        entityKind: 'submission',
        entityId: id,
        label: `Soumission ${sub?.reference ?? ''} : statut ${status}`,
      });
    },
    [audit],
  );

  const value = useMemo(
    () => ({
      ...data,
      hydrated,
      createForm,
      updateFormMeta,
      updateDraft,
      publishForm,
      setFormStatus,
      addSubmission,
      setSubmissionStatus,
    }),
    [
      data,
      hydrated,
      createForm,
      updateFormMeta,
      updateDraft,
      publishForm,
      setFormStatus,
      addSubmission,
      setSubmissionStatus,
    ],
  );

  return <FormsContext.Provider value={value}>{children}</FormsContext.Provider>;
}

export function useForms() {
  const ctx = useContext(FormsContext);
  if (!ctx) throw new Error('useForms doit être utilisé dans <FormsProvider>.');
  return ctx;
}
