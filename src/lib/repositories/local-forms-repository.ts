import {
  SEED_AUDIT_EVENTS,
  SEED_FORMS,
  SEED_SUBMISSIONS,
} from '@/lib/mock-data/forms-seed';
import type { FormsData, FormsRepository } from './forms-repository';

/* ------------------------------------------------------------------ */
/* Adaptateur de démonstration — localStorage du navigateur.           */
/* Limites (affichées dans l'interface) : les données ne sont ni       */
/* partagées entre utilisateurs, ni centralisées, et peuvent être      */
/* perdues selon le navigateur. Ce n'est PAS une base de production.   */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'gcs-forms-v1';

function seed(): FormsData {
  return {
    forms: SEED_FORMS,
    submissions: SEED_SUBMISSIONS,
    auditEvents: SEED_AUDIT_EVENTS,
  };
}

export function createLocalFormsRepository(): FormsRepository {
  return {
    load() {
      if (typeof window === 'undefined') return seed();
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return seed();
        const parsed = JSON.parse(raw) as FormsData;
        if (!Array.isArray(parsed.forms) || !Array.isArray(parsed.submissions)) {
          return seed();
        }
        return {
          forms: parsed.forms,
          submissions: parsed.submissions,
          auditEvents: Array.isArray(parsed.auditEvents) ? parsed.auditEvents : [],
        };
      } catch {
        return seed();
      }
    },
    save(data) {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Quota dépassé ou stockage indisponible : la démo continue en mémoire.
      }
    },
  };
}
