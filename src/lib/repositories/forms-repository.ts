import type { AuditEvent } from '@/modules/core/types';
import type { Form, FormSubmission } from '@/modules/forms/types';

/* ------------------------------------------------------------------ */
/* Contrat d'accès aux données du système de formulaires.              */
/* L'implémentation actuelle (localStorage) est un adaptateur de       */
/* démonstration : elle sera remplacée par une implémentation          */
/* Supabase sans modification des composants.                          */
/* ------------------------------------------------------------------ */

export interface FormsData {
  forms: Form[];
  submissions: FormSubmission[];
  auditEvents: AuditEvent[];
}

export interface FormsRepository {
  /** Charge l'état complet (ou les données seed si rien n'est stocké). */
  load(): FormsData;
  /** Persiste l'état complet. */
  save(data: FormsData): void;
}
