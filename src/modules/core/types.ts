import type { OrgCode } from '@/config/organizations';

/* ------------------------------------------------------------------ */
/* Types de gouvernance multi-organisations.                           */
/* Préparés pour une future persistance Supabase : identifiants        */
/* stables, dates ISO, rattachement systématique à une organisation.   */
/* ------------------------------------------------------------------ */

/** Plateforme publique rattachée à une organisation. */
export interface Platform {
  id: string;
  org: OrgCode;
  name: string;
  /** Chemin public racine, ex. /kimexdi */
  basePath: string;
  status: 'ACTIVE' | 'EN_PREPARATION';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export type Permission =
  | 'formulaires.lire'
  | 'formulaires.ecrire'
  | 'formulaires.publier'
  | 'demandes.lire'
  | 'demandes.traiter'
  | 'organisation.administrer';

export interface Role {
  id: string;
  org: OrgCode;
  name: string;
  permissions: Permission[];
}

/** Lien utilisateur ↔ organisation avec un rôle. */
export interface Membership {
  id: string;
  userId: string;
  org: OrgCode;
  roleId: string;
  createdAt: string;
}

/** Fonction organisationnelle (ex. « Exploitation »). */
export interface OrgFunction {
  id: string;
  org: OrgCode;
  name: string;
  description?: string;
}

export interface Process {
  id: string;
  org: OrgCode;
  functionId: string;
  name: string;
  description?: string;
}

export interface Task {
  id: string;
  org: OrgCode;
  processId: string;
  title: string;
  assigneeMembershipId?: string;
  status: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';
  dueDate?: string;
}

/* ------------------------------ Audit ------------------------------ */

export type AuditEventType =
  | 'FORM_CREATED'
  | 'FORM_UPDATED'
  | 'FORM_VERSION_PUBLISHED'
  | 'FORM_DISABLED'
  | 'FORM_ARCHIVED'
  | 'SUBMISSION_RECEIVED'
  | 'SUBMISSION_STATUS_CHANGED';

export interface AuditEvent {
  id: string;
  at: string;
  org: OrgCode;
  actor: string;
  type: AuditEventType;
  entityKind: 'form' | 'submission';
  entityId: string;
  label: string;
}
