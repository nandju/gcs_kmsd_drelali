import type {
  ControlStatus,
  DriverStatus,
  ExpenseStatus,
  IncidentPriority,
  IncidentStatus,
  InvoiceStatus,
  LeadStatus,
  MissionStatus,
  PaymentMethod,
  PaymentStatus,
  QuoteStatus,
  VehicleStatus,
} from './types';

export type Tone =
  | 'gray'
  | 'blue'
  | 'amber'
  | 'green'
  | 'red'
  | 'violet'
  | 'cyan';

interface LabelDef {
  label: string;
  tone: Tone;
}

export const LEAD_STATUS: Record<LeadStatus, LabelDef> = {
  NOUVEAU: { label: 'Nouveau', tone: 'blue' },
  A_QUALIFIER: { label: 'À qualifier', tone: 'amber' },
  BESOIN_IDENTIFIE: { label: 'Besoin identifié', tone: 'cyan' },
  COTATION: { label: 'Cotation en cours', tone: 'violet' },
  ENVOYEE: { label: 'Cotation envoyée', tone: 'blue' },
  RELANCE: { label: 'Relance / négociation', tone: 'amber' },
  GAGNE: { label: 'Gagné', tone: 'green' },
  PERDU: { label: 'Perdu', tone: 'red' },
};

export const QUOTE_STATUS: Record<QuoteStatus, LabelDef> = {
  BROUILLON: { label: 'Brouillon', tone: 'gray' },
  A_VALIDER: { label: 'En attente de validation', tone: 'amber' },
  VALIDEE: { label: 'Validée', tone: 'cyan' },
  ENVOYEE: { label: 'Envoyée', tone: 'blue' },
  ACCEPTEE: { label: 'Acceptée', tone: 'green' },
  REFUSEE: { label: 'Refusée', tone: 'red' },
};

export const MISSION_STATUS: Record<MissionStatus, LabelDef> = {
  BROUILLON: { label: 'Brouillon', tone: 'gray' },
  A_PLANIFIER: { label: 'À planifier', tone: 'amber' },
  PLANIFIEE: { label: 'Planifiée', tone: 'cyan' },
  AFFECTEE: { label: 'Affectée', tone: 'violet' },
  EN_COURS: { label: 'En cours', tone: 'blue' },
  A_CONTROLER: { label: 'À contrôler', tone: 'amber' },
  CONTROLEE: { label: 'Contrôlée', tone: 'green' },
  CLOTUREE: { label: 'Clôturée', tone: 'gray' },
  BLOQUEE: { label: 'Bloquée', tone: 'red' },
  REPORTEE: { label: 'Reportée', tone: 'amber' },
  ANNULEE: { label: 'Annulée', tone: 'red' },
};

export const CONTROL_STATUS: Record<ControlStatus, LabelDef> = {
  NON_REQUIS: { label: 'Non requis', tone: 'gray' },
  EN_ATTENTE: { label: 'En attente de contrôle', tone: 'amber' },
  CORRECTION_DEMANDEE: { label: 'Correction demandée', tone: 'red' },
  BLOQUE: { label: 'Contrôle bloqué', tone: 'red' },
  CONFIRME: { label: 'Contrôle confirmé', tone: 'green' },
};

export const INVOICE_STATUS: Record<InvoiceStatus, LabelDef> = {
  BROUILLON: { label: 'Brouillon', tone: 'gray' },
  A_VALIDER: { label: 'À valider', tone: 'amber' },
  EMISE: { label: 'Émise', tone: 'blue' },
  PARTIELLEMENT_PAYEE: { label: 'Partiellement payée', tone: 'amber' },
  PAYEE: { label: 'Payée', tone: 'green' },
};

export const PAYMENT_METHOD: Record<PaymentMethod, string> = {
  ESPECES: 'Espèces',
  VIREMENT: 'Virement bancaire',
  MOBILE_MONEY: 'Mobile money',
  AUTRE: 'Autre moyen autorisé',
};

export const PAYMENT_STATUS: Record<PaymentStatus, LabelDef> = {
  RECU: { label: 'Reçu', tone: 'green' },
  EN_ATTENTE: { label: 'En attente', tone: 'amber' },
};

export const EXPENSE_STATUS: Record<ExpenseStatus, LabelDef> = {
  SOUMISE: { label: 'Soumise', tone: 'amber' },
  VALIDEE: { label: 'Validée', tone: 'green' },
  REJETEE: { label: 'Rejetée', tone: 'red' },
};

export const INCIDENT_STATUS: Record<IncidentStatus, LabelDef> = {
  OUVERT: { label: 'Ouvert', tone: 'red' },
  EN_TRAITEMENT: { label: 'En traitement', tone: 'amber' },
  RESOLU: { label: 'Résolu', tone: 'green' },
  CLOTURE: { label: 'Clôturé', tone: 'gray' },
};

export const INCIDENT_PRIORITY: Record<IncidentPriority, LabelDef> = {
  BASSE: { label: 'Basse', tone: 'gray' },
  MOYENNE: { label: 'Moyenne', tone: 'blue' },
  HAUTE: { label: 'Haute', tone: 'amber' },
  CRITIQUE: { label: 'Critique', tone: 'red' },
};

export const VEHICLE_STATUS: Record<VehicleStatus, LabelDef> = {
  DISPONIBLE: { label: 'Disponible', tone: 'green' },
  EN_MISSION: { label: 'En mission', tone: 'blue' },
  IMMOBILISE: { label: 'Immobilisé', tone: 'red' },
};

export const DRIVER_STATUS: Record<DriverStatus, LabelDef> = {
  DISPONIBLE: { label: 'Disponible', tone: 'green' },
  EN_MISSION: { label: 'En mission', tone: 'blue' },
  ABSENT: { label: 'Absent', tone: 'red' },
};

export const PROOF_RESULT: Record<string, LabelDef> = {
  LIVRE: { label: 'Livré', tone: 'green' },
  LIVRE_AVEC_RESERVE: { label: 'Livré avec réserve', tone: 'amber' },
  REFUSE: { label: 'Refusé', tone: 'red' },
};
