import type { OrgCode } from '@/config/organizations';

/* ------------------------------------------------------------------ */
/* Système de formulaires configurables (multi-organisations).         */
/* Le schéma publié est immuable : chaque soumission conserve une      */
/* copie de la version utilisée au moment de sa création.              */
/* ------------------------------------------------------------------ */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'decimal'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'datetime'
  | 'address'
  | 'file'
  | 'image'
  | 'separator'
  | 'info';

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Texte court',
  textarea: 'Texte long',
  email: 'E-mail',
  phone: 'Téléphone',
  number: 'Nombre',
  decimal: 'Nombre décimal',
  select: 'Liste déroulante',
  radio: 'Boutons radio',
  checkbox: 'Cases à cocher',
  date: 'Date',
  time: 'Heure',
  datetime: 'Date et heure',
  address: 'Adresse',
  file: 'Fichier',
  image: 'Image',
  separator: 'Séparateur',
  info: 'Texte informatif',
};

/** Types affichés dans le formulaire (champs de saisie réels). */
export const INPUT_FIELD_TYPES: FieldType[] = [
  'text',
  'textarea',
  'email',
  'phone',
  'number',
  'decimal',
  'select',
  'radio',
  'checkbox',
  'date',
  'time',
  'datetime',
  'address',
  'file',
  'image',
];

/** Types avec liste d'options. */
export const OPTION_FIELD_TYPES: FieldType[] = ['select', 'radio', 'checkbox'];

/** Types sans saisie (présentation uniquement). */
export const DISPLAY_FIELD_TYPES: FieldType[] = ['separator', 'info'];

/* ---------------------------- Conditions ---------------------------- */

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_empty'
  | 'empty';

export const CONDITION_OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: 'est égal à',
  not_equals: 'est différent de',
  in: 'fait partie de',
  not_empty: 'est rempli',
  empty: 'est vide',
};

export interface FormCondition {
  /** Champ dont dépend l'affichage. */
  fieldId: string;
  operator: ConditionOperator;
  /** Valeur de comparaison (inutile pour not_empty / empty). */
  value?: string;
}

/* ------------------------------ Champs ------------------------------ */

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  /** Extensions acceptées pour file/image, ex. ".pdf,.jpg". */
  accept?: string;
  /** Message d'erreur personnalisé. */
  errorMessage?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  enabled: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: FieldValidation;
  /** Toutes les conditions doivent être remplies pour afficher le champ. */
  conditions?: FormCondition[];
}

export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  fields: FormField[];
}

/** Schéma de formulaire = contenu éditable / publié. */
export interface FormSchema {
  sections: FormSection[];
}

/* ----------------------------- Formulaire --------------------------- */

export type FormStatus = 'BROUILLON' | 'PUBLIE' | 'DESACTIVE' | 'ARCHIVE';

export const FORM_STATUS_LABELS: Record<FormStatus, string> = {
  BROUILLON: 'Brouillon',
  PUBLIE: 'Publié',
  DESACTIVE: 'Désactivé',
  ARCHIVE: 'Archivé',
};

/** Usage du formulaire : détermine sa page publique par défaut. */
export type FormKind = 'DEVIS' | 'CONTACT' | 'GENERIQUE';

export const FORM_KIND_LABELS: Record<FormKind, string> = {
  DEVIS: 'Demande de devis',
  CONTACT: 'Formulaire de contact',
  GENERIQUE: 'Formulaire générique',
};

export interface FormVersion {
  version: number;
  schema: FormSchema;
  publishedAt: string;
  publishedBy: string;
}

export interface Form {
  id: string;
  org: OrgCode;
  name: string;
  /** Identifiant public stable, ex. "demande-de-devis". */
  slug: string;
  purpose?: string;
  kind: FormKind;
  status: FormStatus;
  /** Copie de travail éditable (n'affecte pas le public avant publication). */
  draft: FormSchema;
  versions: FormVersion[];
  createdAt: string;
  updatedAt: string;
}

/* ----------------------------- Soumissions -------------------------- */

export type SubmissionStatus =
  | 'NOUVELLE'
  | 'EN_TRAITEMENT'
  | 'TRAITEE'
  | 'ARCHIVEE';

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  NOUVELLE: 'Nouvelle',
  EN_TRAITEMENT: 'En traitement',
  TRAITEE: 'Traitée',
  ARCHIVEE: 'Archivée',
};

export interface SubmissionAttachment {
  id: string;
  fieldId: string;
  fileName: string;
}

export interface SubmissionHistoryEntry {
  at: string;
  label: string;
  by: string;
}

export interface FormSubmission {
  id: string;
  /** Référence lisible, ex. DEM-000123. */
  reference: string;
  org: OrgCode;
  formId: string;
  formName: string;
  formSlug: string;
  /** Numéro de version publiée utilisée (0 si le formulaire était en test). */
  formVersion: number;
  /** Copie du schéma au moment de la soumission (traçabilité). */
  schema: FormSchema;
  answers: Record<string, string | string[]>;
  attachments: SubmissionAttachment[];
  status: SubmissionStatus;
  submittedAt: string;
  history: SubmissionHistoryEntry[];
}
