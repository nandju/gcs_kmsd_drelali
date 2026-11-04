'use client';

// Affiche un formulaire public publié : recherche par slug ou par type,
// rendu dynamique depuis la configuration, enregistrement de la soumission
// (démonstration locale — aucun envoi serveur).

import { useForms } from '@/context/forms-store';
import type { OrgCode } from '@/config/organizations';
import type { FormKind } from '@/modules/forms/types';
import {
  getPublishedByKind,
  getPublishedBySlug,
} from '@/modules/forms/logic';
import { FormRenderer, type RendererTheme } from '@/modules/forms/renderer/form-renderer';

export function PublicForm({
  org,
  slug,
  kind,
  theme = 'gcs',
  submitLabel,
  fallback,
}: {
  org: OrgCode;
  /** Cherche un formulaire publié par slug (prioritaire sur kind). */
  slug?: string;
  /** Sinon, premier formulaire publié de ce type. */
  kind?: FormKind;
  theme?: RendererTheme;
  submitLabel?: string;
  fallback?: React.ReactNode;
}) {
  const { forms, hydrated, addSubmission } = useForms();

  const found = slug
    ? getPublishedBySlug(forms, org, slug)
    : kind
      ? getPublishedByKind(forms, org, kind)
      : null;

  if (!hydrated) {
    return <p className="py-8 text-center text-sm text-gray-400">Chargement…</p>;
  }

  if (!found) {
    return (
      fallback ?? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
          <p className="text-sm font-semibold text-gray-700">
            Formulaire temporairement indisponible
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Aucun formulaire publié ne correspond actuellement. Revenez
            ultérieurement ou contactez-nous.
          </p>
        </div>
      )
    );
  }

  return (
    <FormRenderer
      schema={found.version}
      theme={theme}
      submitLabel={submitLabel}
      onSubmit={(answers, attachments) =>
        addSubmission({ org, formId: found.form.id, answers, attachments })
      }
    />
  );
}
