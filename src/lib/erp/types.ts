import type { OrgCode } from '@/config/organizations';

export type Currency = 'XOF' | 'CAD';

/* ------------------------------- Statuts ------------------------------- */

export type LeadStatus =
  | 'NOUVEAU'
  | 'A_QUALIFIER'
  | 'BESOIN_IDENTIFIE'
  | 'COTATION'
  | 'ENVOYEE'
  | 'RELANCE'
  | 'GAGNE'
  | 'PERDU';

export type QuoteStatus =
  | 'BROUILLON'
  | 'A_VALIDER'
  | 'VALIDEE'
  | 'ENVOYEE'
  | 'ACCEPTEE'
  | 'REFUSEE';

export type MissionStatus =
  | 'BROUILLON'
  | 'A_PLANIFIER'
  | 'PLANIFIEE'
  | 'AFFECTEE'
  | 'EN_COURS'
  | 'A_CONTROLER'
  | 'CONTROLEE'
  | 'CLOTUREE'
  | 'BLOQUEE'
  | 'REPORTEE'
  | 'ANNULEE';

export type ControlStatus =
  | 'NON_REQUIS'
  | 'EN_ATTENTE'
  | 'CORRECTION_DEMANDEE'
  | 'BLOQUE'
  | 'CONFIRME';

export type InvoiceStatus =
  | 'BROUILLON'
  | 'A_VALIDER'
  | 'EMISE'
  | 'PARTIELLEMENT_PAYEE'
  | 'PAYEE';

export type PaymentMethod = 'ESPECES' | 'VIREMENT' | 'MOBILE_MONEY' | 'AUTRE';
export type PaymentStatus = 'RECU' | 'EN_ATTENTE';

export type ExpenseStatus = 'SOUMISE' | 'VALIDEE' | 'REJETEE';

export type IncidentStatus = 'OUVERT' | 'EN_TRAITEMENT' | 'RESOLU' | 'CLOTURE';
export type IncidentPriority = 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';

export type VehicleStatus = 'DISPONIBLE' | 'EN_MISSION' | 'IMMOBILISE';
export type DriverStatus = 'DISPONIBLE' | 'EN_MISSION' | 'ABSENT';

/* ------------------------------- Entités ------------------------------- */

export interface Contact {
  id: string;
  name: string;
  company?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  isClient: boolean;
  createdAt: string;
  notes?: string;
}

export interface Lead {
  id: string;
  reference: string; // LEAD-2026-0001
  contactId: string;
  service: string;
  origin?: string;
  destination?: string;
  source: string; // origine commerciale
  referrer?: string; // apporteur
  owner: string; // commercial responsable
  status: LeadStatus;
  nextAction?: string;
  nextActionDate?: string;
  description?: string;
  createdAt: string;
  lostReason?: string;
}

export interface QuoteLine {
  id: string;
  label: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface QuoteVersion {
  version: number;
  lines: QuoteLine[];
  validityDate: string;
  conditions: string;
  internalNotes?: string;
  estimatedCost: number; // interne
  floorPrice: number; // interne
  commercialPrice: number; // interne
  proposedPrice: number; // visible client (= somme lignes)
  createdAt: string;
  note?: string;
}

export interface Quote {
  id: string;
  reference: string; // COT-00125
  leadId?: string;
  contactId: string;
  service: string;
  origin?: string;
  destination?: string;
  description?: string;
  currency: Currency;
  status: QuoteStatus;
  owner: string;
  issuedAt: string;
  versions: QuoteVersion[]; // la dernière = version courante
  missionId?: string;
}

export interface MissionEvent {
  id: string;
  at: string;
  label: string;
  by: string;
}

export interface MissionStep {
  id: string;
  label: string;
  location: string;
  plannedAt?: string;
  done: boolean;
}

export interface Mission {
  id: string;
  reference: string; // MT-00001
  contactId: string;
  quoteId?: string;
  quoteVersion?: number;
  service: string;
  origin: string;
  destination: string;
  plannedDate: string;
  vehicleId?: string;
  driverId?: string;
  supervisor: string;
  status: MissionStatus;
  control: ControlStatus;
  invoiceId?: string;
  instructions?: string;
  steps: MissionStep[];
  events: MissionEvent[];
  revenue?: number; // revenu retenu pour l'analyse (hors taxes, démo)
  estimatedCost?: number;
  createdAt: string;
}

export interface Proof {
  id: string;
  missionId: string;
  type: 'PHOTO' | 'SIGNATURE' | 'DOCUMENT' | 'CODE';
  receiverName?: string;
  at: string;
  comment?: string;
  fileName?: string;
  result: 'LIVRE' | 'LIVRE_AVEC_RESERVE' | 'REFUSE';
}

export interface Incident {
  id: string;
  reference: string; // INC-000001
  missionId?: string;
  type: string;
  priority: IncidentPriority;
  description: string;
  status: IncidentStatus;
  openedAt: string;
  openedBy: string;
  history: { at: string; label: string; by: string }[];
}

export interface InvoiceLine {
  id: string;
  label: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  reference: string; // FAC-000001
  contactId: string;
  missionId?: string;
  currency: Currency;
  lines: InvoiceLine[];
  issuedAt?: string;
  dueDate?: string;
  status: InvoiceStatus;
  notes?: string;
}

export interface PaymentAllocation {
  invoiceId: string;
  amount: number;
}

export interface Payment {
  id: string;
  reference: string; // PAY-000001
  contactId: string;
  amount: number;
  currency: Currency;
  receivedAt: string;
  method: PaymentMethod;
  account: string;
  status: PaymentStatus;
  allocations: PaymentAllocation[];
}

export interface Expense {
  id: string;
  reference: string; // DEP-000001
  missionId?: string;
  category: string;
  description: string;
  amount: number;
  currency: Currency;
  agent: string;
  date: string;
  receiptName?: string;
  status: ExpenseStatus;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  owner: OrgCode;
  status: VehicleStatus;
  note?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  status: DriverStatus;
  license: string;
}

export interface Activity {
  id: string;
  at: string;
  label: string;
  by: string;
  entity?: { kind: SearchKind; id: string };
}

export interface AppNotification {
  id: string;
  at: string;
  category: 'COMMERCIAL' | 'OPERATIONS' | 'FINANCES' | 'SYSTEME';
  label: string;
  href: string;
  read: boolean;
}

export interface PublicRequest {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  service: string;
  origin?: string;
  destination?: string;
  description: string;
  volume?: string;
  wishedDate?: string;
  comment?: string;
  photoName?: string;
  at: string;
}

export type SearchKind =
  | 'lead'
  | 'contact'
  | 'quote'
  | 'mission'
  | 'invoice'
  | 'payment'
  | 'incident';
