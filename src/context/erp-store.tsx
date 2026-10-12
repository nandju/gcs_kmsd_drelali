'use client';

// Store de démonstration centralisé (frontend uniquement).
// Les données vivent en mémoire : aucune persistance serveur n'est simulée.
// Seule l'organisation active est mémorisée localement.

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
import { toast } from 'sonner';
import { ORGANIZATIONS, type OrgCode } from '@/config/organizations';
import * as demo from '@/data/demo-gcs';
import type {
  Activity,
  AppNotification,
  Contact,
  Driver,
  Expense,
  Incident,
  Invoice,
  Lead,
  LeadStatus,
  Mission,
  MissionStatus,
  Payment,
  PaymentMethod,
  Proof,
  PublicRequest,
  Quote,
  QuoteLine,
  Vehicle,
} from '@/lib/erp/types';
import { currentVersion, invoiceBalance } from '@/lib/erp/calculations';

/* ----------------------------- État global ---------------------------- */

export interface ErpState {
  org: OrgCode;
  contacts: Contact[];
  leads: Lead[];
  quotes: Quote[];
  missions: Mission[];
  vehicles: Vehicle[];
  drivers: Driver[];
  proofs: Proof[];
  incidents: Incident[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  activities: Activity[];
  notifications: AppNotification[];
  publicRequests: PublicRequest[];
}

const CURRENT_USER = 'Direction (démo)';

function nextRef(existing: string[], prefix: string, width: number): string {
  const max = existing
    .filter((r) => r.startsWith(prefix))
    .map((r) => parseInt(r.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n))
    .reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${String(max + 1).padStart(width, '0')}`;
}

let idCounter = 1;
function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${idCounter++}`;
}

/* ------------------------- Transitions autorisées ---------------------- */

export const LEAD_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NOUVEAU: ['A_QUALIFIER', 'PERDU'],
  A_QUALIFIER: ['BESOIN_IDENTIFIE', 'PERDU'],
  BESOIN_IDENTIFIE: ['COTATION', 'PERDU'],
  COTATION: ['ENVOYEE', 'PERDU'],
  ENVOYEE: ['RELANCE', 'GAGNE', 'PERDU'],
  RELANCE: ['GAGNE', 'PERDU'],
  GAGNE: [],
  PERDU: ['A_QUALIFIER'],
};

interface ErpActions {
  setOrg: (org: OrgCode) => void;
  /* CRM */
  addLead: (data: {
    contact: Omit<Contact, 'id' | 'isClient' | 'createdAt'>;
    service: string;
    origin?: string;
    destination?: string;
    source: string;
    referrer?: string;
    owner: string;
    description?: string;
    nextAction?: string;
  }) => Lead;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  moveLeadStatus: (id: string, to: LeadStatus, reason?: string) => void;
  /* Cotations */
  createQuote: (data: {
    contactId: string;
    leadId?: string;
    service: string;
    origin?: string;
    destination?: string;
    lines: QuoteLine[];
    validityDate: string;
    conditions: string;
    internalNotes?: string;
    estimatedCost: number;
    floorPrice: number;
    commercialPrice: number;
    owner: string;
  }) => Quote;
  quoteAction: (
    id: string,
    action: 'SOUMETTRE' | 'VALIDER' | 'ENVOYER' | 'ACCEPTER' | 'REFUSER',
  ) => void;
  newQuoteVersion: (
    id: string,
    data: {
      lines: QuoteLine[];
      validityDate: string;
      conditions: string;
      internalNotes?: string;
      proposedNote?: string;
    },
  ) => void;
  /* Missions */
  assignMission: (id: string, vehicleId: string, driverId: string) => void;
  missionAction: (
    id: string,
    action:
      | 'DEMARRER'
      | 'ARRIVEE'
      | 'CHARGEMENT'
      | 'DEPART'
      | 'TERMINER'
      | 'BLOQUER'
      | 'REPORTER'
      | 'ANNULER'
      | 'CLOTURER',
  ) => void;
  addProof: (proof: Omit<Proof, 'id'>) => void;
  controlAction: (
    missionId: string,
    action: 'VERIFIER' | 'CORRECTION' | 'BLOQUER' | 'CONFIRMER',
    note?: string,
  ) => void;
  addIncident: (
    data: Omit<Incident, 'id' | 'reference' | 'history' | 'openedAt'>,
  ) => void;
  incidentAction: (id: string, action: 'TRAITER' | 'RESOUDRE' | 'CLOTURER') => void;
  /* Finance */
  createInvoiceFromMission: (missionId: string) => void;
  issueInvoice: (id: string, dueDate: string) => void;
  addPayment: (data: {
    contactId: string;
    amount: number;
    method: PaymentMethod;
    account: string;
    allocations: { invoiceId: string; amount: number }[];
  }) => void;
  allocatePayment: (paymentId: string, invoiceId: string, amount: number) => void;
  addExpense: (data: Omit<Expense, 'id' | 'reference' | 'status'>) => void;
  expenseAction: (id: string, action: 'VALIDER' | 'REJETER') => void;
  /* Divers */
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  submitPublicRequest: (data: Omit<PublicRequest, 'id' | 'at'>) => void;
}

const initialState: ErpState = {
  org: 'GCS',
  contacts: demo.CONTACTS,
  leads: demo.LEADS,
  quotes: demo.QUOTES,
  missions: demo.MISSIONS,
  vehicles: demo.VEHICLES,
  drivers: demo.DRIVERS,
  proofs: demo.PROOFS,
  incidents: demo.INCIDENTS,
  invoices: demo.INVOICES,
  payments: demo.PAYMENTS,
  expenses: demo.EXPENSES,
  activities: demo.ACTIVITIES,
  notifications: demo.NOTIFICATIONS,
  publicRequests: [],
};

const ErpContext = createContext<(ErpState & ErpActions) | null>(null);

export function ErpProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ErpState>(initialState);
  // Référence stable vers l'état courant pour les callbacks.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const saved = window.localStorage.getItem('erp-org');
    if (saved && saved in ORGANIZATIONS) {
      setState((s) => ({ ...s, org: saved as OrgCode }));
    }
  }, []);

  const log = useCallback((label: string, entity?: Activity['entity']) => {
    setState((s) => ({
      ...s,
      activities: [
        { id: uid('a'), at: new Date().toISOString(), label, by: CURRENT_USER, entity },
        ...s.activities,
      ],
    }));
  }, []);

  const setOrg = useCallback((org: OrgCode) => {
    window.localStorage.setItem('erp-org', org);
    setState((s) => ({ ...s, org }));
    toast.info(`Espace actif : ${ORGANIZATIONS[org].displayName}`);
  }, []);

  /* ------------------------------- CRM ------------------------------- */

  const addLead: ErpActions['addLead'] = useCallback(
    (data) => {
      const contactId = uid('c');
      const lead: Lead = {
        id: uid('l'),
        reference: nextRef(
          stateRef.current.leads.map((l) => l.reference),
          'LEAD-2026-',
          4,
        ),
        contactId,
        service: data.service,
        origin: data.origin,
        destination: data.destination,
        source: data.source,
        referrer: data.referrer,
        owner: data.owner,
        status: 'NOUVEAU',
        nextAction: data.nextAction,
        description: data.description,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        contacts: [
          { id: contactId, isClient: false, createdAt: new Date().toISOString(), ...data.contact },
          ...s.contacts,
        ],
        leads: [lead, ...s.leads],
      }));
      log(`Prospect ${lead.reference} créé`, { kind: 'lead', id: lead.id });
      toast.success(`Prospect ${lead.reference} créé (démonstration).`);
      return lead;
    },
    [log],
  );

  const updateLead: ErpActions['updateLead'] = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
    toast.success('Prospect mis à jour (démonstration).');
  }, []);

  const moveLeadStatus: ErpActions['moveLeadStatus'] = useCallback(
    (id, to, reason) => {
      const lead = stateRef.current.leads.find((l) => l.id === id);
      if (!lead) return;
      if (!LEAD_TRANSITIONS[lead.status].includes(to)) {
        toast.error('Transition non autorisée pour ce prospect.');
        return;
      }
      setState((s) => ({
        ...s,
        leads: s.leads.map((l) =>
          l.id === id ? { ...l, status: to, lostReason: reason ?? l.lostReason } : l,
        ),
      }));
      log(`Prospect ${lead.reference} déplacé vers un nouveau statut`, {
        kind: 'lead',
        id,
      });
      toast.success('Statut du prospect mis à jour (démonstration).');
    },
    [log],
  );

  /* ----------------------------- Cotations ---------------------------- */

  const createQuote: ErpActions['createQuote'] = useCallback(
    (data) => {
      const proposedPrice = data.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
      const quote: Quote = {
        id: uid('q'),
        reference: nextRef(
          stateRef.current.quotes.map((q) => q.reference),
          'COT-',
          5,
        ),
        contactId: data.contactId,
        leadId: data.leadId,
        service: data.service,
        origin: data.origin,
        destination: data.destination,
        currency: 'XOF',
        status: 'BROUILLON',
        owner: data.owner,
        issuedAt: new Date().toISOString(),
        versions: [
          {
            version: 1,
            lines: data.lines,
            validityDate: data.validityDate,
            conditions: data.conditions,
            internalNotes: data.internalNotes,
            estimatedCost: data.estimatedCost,
            floorPrice: data.floorPrice,
            commercialPrice: data.commercialPrice,
            proposedPrice,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      setState((s) => ({ ...s, quotes: [quote, ...s.quotes] }));
      if (data.leadId) {
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) =>
            l.id === data.leadId && (l.status === 'BESOIN_IDENTIFIE' || l.status === 'A_QUALIFIER')
              ? { ...l, status: 'COTATION' }
              : l,
          ),
        }));
      }
      log(`Cotation ${quote.reference} créée`, { kind: 'quote', id: quote.id });
      toast.success(`Cotation ${quote.reference} créée (démonstration).`);
      return quote;
    },
    [log],
  );

  const quoteAction: ErpActions['quoteAction'] = useCallback(
    (id, action) => {
      const quote = stateRef.current.quotes.find((q) => q.id === id);
      if (!quote) return;
      const allowed: Record<string, string[]> = {
        SOUMETTRE: ['BROUILLON'],
        VALIDER: ['A_VALIDER'],
        ENVOYER: ['VALIDEE'],
        ACCEPTER: ['ENVOYEE'],
        REFUSER: ['ENVOYEE'],
      };
      if (!allowed[action].includes(quote.status)) {
        toast.error('Action non autorisée dans le statut actuel de la cotation.');
        return;
      }
      const next = {
        SOUMETTRE: 'A_VALIDER',
        VALIDER: 'VALIDEE',
        ENVOYER: 'ENVOYEE',
        ACCEPTER: 'ACCEPTEE',
        REFUSER: 'REFUSEE',
      }[action] as Quote['status'];

      if (action === 'ACCEPTER') {
        // Création simulée d'une mission depuis la cotation acceptée.
        const version = currentVersion(quote);
        const missionId = uid('m');
        const missionRef = nextRef(
          stateRef.current.missions.map((m) => m.reference),
          'MT-',
          5,
        );
        const mission: Mission = {
          id: missionId,
          reference: missionRef,
          contactId: quote.contactId,
          quoteId: quote.id,
          quoteVersion: version.version,
          service: quote.service,
          origin: quote.origin ?? '—',
          destination: quote.destination ?? '—',
          plannedDate: new Date(Date.now() + 3 * 86400000).toISOString(),
          supervisor: 'K. Assi',
          status: 'A_PLANIFIER',
          control: 'NON_REQUIS',
          revenue: version.proposedPrice,
          estimatedCost: version.estimatedCost,
          instructions: `Issue de la cotation ${quote.reference} V${version.version} acceptée.`,
          steps: [
            { id: uid('s'), label: 'Chargement', location: quote.origin ?? '—', done: false },
            { id: uid('s'), label: 'Livraison', location: quote.destination ?? '—', done: false },
          ],
          events: [
            {
              id: uid('e'),
              at: new Date().toISOString(),
              label: `Mission créée depuis la cotation ${quote.reference} (V${version.version})`,
              by: CURRENT_USER,
            },
          ],
          createdAt: new Date().toISOString(),
        };
        setState((s) => ({
          ...s,
          missions: [mission, ...s.missions],
          quotes: s.quotes.map((q) =>
            q.id === id ? { ...q, status: next, missionId } : q,
          ),
          contacts: s.contacts.map((c) =>
            c.id === quote.contactId ? { ...c, isClient: true } : c,
          ),
          leads: s.leads.map((l) =>
            l.id === quote.leadId ? { ...l, status: 'GAGNE' } : l,
          ),
        }));
        log(`Cotation ${quote.reference} acceptée — mission ${missionRef} créée`, {
          kind: 'mission',
          id: missionId,
        });
        toast.success(
          `Cotation acceptée : mission ${missionRef} créée (simulation).`,
        );
        return;
      }

      setState((s) => ({
        ...s,
        quotes: s.quotes.map((q) => (q.id === id ? { ...q, status: next } : q)),
        leads:
          action === 'ENVOYER'
            ? s.leads.map((l) =>
                l.id === quote.leadId && l.status === 'COTATION'
                  ? { ...l, status: 'ENVOYEE' }
                  : l,
              )
            : action === 'REFUSER'
              ? s.leads.map((l) =>
                  l.id === quote.leadId ? { ...l, status: 'PERDU' } : l,
                )
              : s.leads,
      }));
      log(`Cotation ${quote.reference} : action « ${action.toLowerCase()} » simulée`, {
        kind: 'quote',
        id,
      });
      toast.success('Action simulée sur la cotation (démonstration).');
    },
    [log],
  );

  const newQuoteVersion: ErpActions['newQuoteVersion'] = useCallback(
    (id, data) => {
      const quote = stateRef.current.quotes.find((q) => q.id === id);
      if (!quote) return;
      const prev = currentVersion(quote);
      const proposedPrice = data.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
      setState((s) => ({
        ...s,
        quotes: s.quotes.map((q) =>
          q.id === id
            ? {
                ...q,
                status: 'BROUILLON',
                versions: [
                  ...q.versions,
                  {
                    version: prev.version + 1,
                    lines: data.lines,
                    validityDate: data.validityDate,
                    conditions: data.conditions,
                    internalNotes: data.internalNotes,
                    estimatedCost: prev.estimatedCost,
                    floorPrice: prev.floorPrice,
                    commercialPrice: prev.commercialPrice,
                    proposedPrice,
                    createdAt: new Date().toISOString(),
                    note: data.proposedNote,
                  },
                ],
              }
            : q,
        ),
      }));
      log(`Nouvelle version V${prev.version + 1} créée pour ${quote.reference}`, {
        kind: 'quote',
        id,
      });
      toast.success(
        `Version V${prev.version + 1} créée — l'ancienne version reste consultable.`,
      );
    },
    [log],
  );

  /* ----------------------------- Missions ----------------------------- */

  const assignMission: ErpActions['assignMission'] = useCallback(
    (id, vehicleId, driverId) => {
      const { vehicles, drivers, missions } = stateRef.current;
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      const driver = drivers.find((dr) => dr.id === driverId);
      const mission = missions.find((m) => m.id === id);
      if (!mission || !vehicle || !driver) return;
      if (vehicle.status === 'IMMOBILISE') {
        toast.error('Ce véhicule est immobilisé et ne peut pas être affecté.');
        return;
      }
      if (driver.status === 'ABSENT') {
        toast.error('Ce chauffeur est absent et ne peut pas être affecté.');
        return;
      }
      setState((s) => ({
        ...s,
        missions: s.missions.map((m) =>
          m.id === id
            ? {
                ...m,
                vehicleId,
                driverId,
                status:
                  m.status === 'A_PLANIFIER' || m.status === 'PLANIFIEE' || m.status === 'BROUILLON'
                    ? 'AFFECTEE'
                    : m.status,
                events: [
                  ...m.events,
                  {
                    id: uid('e'),
                    at: new Date().toISOString(),
                    label: `Ressources affectées (${vehicle.name}, ${driver.name})`,
                    by: CURRENT_USER,
                  },
                ],
              }
            : m,
        ),
      }));
      log(`Ressources affectées à la mission ${mission.reference}`, {
        kind: 'mission',
        id,
      });
      toast.success('Affectation enregistrée (démonstration).');
    },
    [log],
  );

  const missionAction: ErpActions['missionAction'] = useCallback(
    (id, action) => {
      const mission = stateRef.current.missions.find((m) => m.id === id);
      if (!mission) return;
      const defs: Record<
        string,
        { from: MissionStatus[]; to?: MissionStatus; label: string; needsResources?: boolean }
      > = {
        DEMARRER: { from: ['AFFECTEE', 'PLANIFIEE'], to: 'EN_COURS', label: 'Mission démarrée', needsResources: true },
        ARRIVEE: { from: ['EN_COURS'], label: 'Arrivée sur site signalée' },
        CHARGEMENT: { from: ['EN_COURS'], label: 'Chargement confirmé' },
        DEPART: { from: ['EN_COURS'], label: 'Départ signalé' },
        TERMINER: { from: ['EN_COURS'], to: 'A_CONTROLER', label: 'Mission terminée — en attente de contrôle' },
        BLOQUER: { from: ['EN_COURS', 'AFFECTEE', 'PLANIFIEE'], to: 'BLOQUEE', label: 'Mission bloquée' },
        REPORTER: { from: ['PLANIFIEE', 'AFFECTEE', 'A_PLANIFIER'], to: 'REPORTEE', label: 'Mission reportée' },
        ANNULER: { from: ['BROUILLON', 'A_PLANIFIER', 'PLANIFIEE', 'AFFECTEE', 'REPORTEE'], to: 'ANNULEE', label: 'Mission annulée' },
        CLOTURER: { from: ['CONTROLEE'], to: 'CLOTUREE', label: 'Mission clôturée' },
      };
      const def = defs[action];
      if (!def.from.includes(mission.status)) {
        toast.error('Action non disponible dans le statut actuel de la mission.');
        return;
      }
      if (def.needsResources && (!mission.vehicleId || !mission.driverId)) {
        toast.error(
          'Impossible de démarrer : les ressources obligatoires ne sont pas affectées.',
        );
        return;
      }
      setState((s) => ({
        ...s,
        missions: s.missions.map((m) =>
          m.id === id
            ? {
                ...m,
                status: def.to ?? m.status,
                control:
                  action === 'TERMINER' ? 'EN_ATTENTE' : m.control,
                events: [
                  ...m.events,
                  { id: uid('e'), at: new Date().toISOString(), label: def.label, by: CURRENT_USER },
                ],
              }
            : m,
        ),
      }));
      log(`${def.label} — ${mission.reference}`, { kind: 'mission', id });
      toast.success(`${def.label} (démonstration).`);
    },
    [log],
  );

  const addProof: ErpActions['addProof'] = useCallback(
    (proof) => {
      setState((s) => ({ ...s, proofs: [...s.proofs, { id: uid('pr'), ...proof }] }));
      const mission = stateRef.current.missions.find((m) => m.id === proof.missionId);
      log(`Preuve ajoutée sur la mission ${mission?.reference ?? ''}`, {
        kind: 'mission',
        id: proof.missionId,
      });
      toast.success('Preuve enregistrée localement (démonstration, sans stockage serveur).');
    },
    [log],
  );

  const controlAction: ErpActions['controlAction'] = useCallback(
    (missionId, action, note) => {
      const mission = stateRef.current.missions.find((m) => m.id === missionId);
      if (!mission) return;
      if (mission.status !== 'A_CONTROLER' && action !== 'VERIFIER') {
        toast.error('Cette mission n’est pas en attente de contrôle.');
        return;
      }
      const map = {
        VERIFIER: { control: mission.control, label: 'Preuves vérifiées' },
        CORRECTION: { control: 'CORRECTION_DEMANDEE', label: 'Correction demandée au terrain' },
        BLOQUER: { control: 'BLOQUE', label: 'Contrôle bloqué' },
        CONFIRMER: { control: 'CONFIRME', label: 'Contrôle confirmé' },
      } as const;
      const def = map[action];
      setState((s) => ({
        ...s,
        missions: s.missions.map((m) =>
          m.id === missionId
            ? {
                ...m,
                control: def.control,
                status: action === 'CONFIRMER' ? 'CONTROLEE' : m.status,
                events: [
                  ...m.events,
                  {
                    id: uid('e'),
                    at: new Date().toISOString(),
                    label: note ? `${def.label} — ${note}` : def.label,
                    by: CURRENT_USER,
                  },
                ],
              }
            : m,
        ),
      }));
      log(`${def.label} — ${mission.reference}`, { kind: 'mission', id: missionId });
      toast.success(`${def.label} (démonstration).`);
    },
    [log],
  );

  const addIncident: ErpActions['addIncident'] = useCallback(
    (data) => {
      const reference = nextRef(
        stateRef.current.incidents.map((i) => i.reference),
        'INC-',
        6,
      );
      setState((s) => ({
        ...s,
        incidents: [
          {
            ...data,
            id: uid('i'),
            reference,
            openedAt: new Date().toISOString(),
            history: [
              { at: new Date().toISOString(), label: 'Incident ouvert', by: data.openedBy },
            ],
          },
          ...s.incidents,
        ],
      }));
      log(`Incident ${reference} ouvert`);
      toast.success(`Incident ${reference} enregistré (démonstration).`);
    },
    [log],
  );

  const incidentAction: ErpActions['incidentAction'] = useCallback((id, action) => {
    const map = {
      TRAITER: { status: 'EN_TRAITEMENT', label: 'Prise en charge de l’incident' },
      RESOUDRE: { status: 'RESOLU', label: 'Incident résolu' },
      CLOTURER: { status: 'CLOTURE', label: 'Incident clôturé' },
    } as const;
    const def = map[action];
    setState((s) => ({
      ...s,
      incidents: s.incidents.map((i) =>
        i.id === id
          ? {
              ...i,
              status: def.status,
              history: [
                ...i.history,
                { at: new Date().toISOString(), label: def.label, by: CURRENT_USER },
              ],
            }
          : i,
      ),
    }));
    toast.success(`${def.label} (démonstration).`);
  }, []);

  /* ------------------------------ Finance ------------------------------ */

  const createInvoiceFromMission: ErpActions['createInvoiceFromMission'] = useCallback(
    (missionId) => {
      const mission = stateRef.current.missions.find((m) => m.id === missionId);
      if (!mission) return;
      if (mission.status !== 'CONTROLEE' && mission.status !== 'CLOTUREE') {
        toast.error('La mission doit être contrôlée avant facturation.');
        return;
      }
      if (mission.invoiceId) {
        toast.error('Une facture existe déjà pour cette mission.');
        return;
      }
      const reference = nextRef(
        stateRef.current.invoices.map((f) => f.reference),
        'FAC-',
        6,
      );
      const invoiceId = uid('f');
      setState((s) => ({
        ...s,
        invoices: [
          {
            id: invoiceId,
            reference,
            contactId: mission.contactId,
            missionId,
            currency: 'XOF',
            status: 'BROUILLON',
            lines: [
              {
                id: uid('fl'),
                label: `${mission.service} (${mission.reference})`,
                quantity: 1,
                unit: 'forfait',
                unitPrice: mission.revenue ?? 0,
              },
            ],
          },
          ...s.invoices,
        ],
        missions: s.missions.map((m) =>
          m.id === missionId ? { ...m, invoiceId } : m,
        ),
      }));
      log(`Facture ${reference} créée en brouillon pour ${mission.reference}`, {
        kind: 'invoice',
        id: invoiceId,
      });
      toast.success(`Facture ${reference} créée en brouillon (démonstration).`);
    },
    [log],
  );

  const issueInvoice: ErpActions['issueInvoice'] = useCallback(
    (id, dueDate) => {
      const invoice = stateRef.current.invoices.find((f) => f.id === id);
      if (!invoice) return;
      if (invoice.status !== 'BROUILLON' && invoice.status !== 'A_VALIDER') {
        toast.error('Cette facture est déjà émise et figée.');
        return;
      }
      setState((s) => ({
        ...s,
        invoices: s.invoices.map((f) =>
          f.id === id
            ? { ...f, status: 'EMISE', issuedAt: new Date().toISOString(), dueDate }
            : f,
        ),
      }));
      log(`Facture ${invoice.reference} émise`, { kind: 'invoice', id });
      toast.success('Facture émise : elle est désormais figée (démonstration).');
    },
    [log],
  );

  const addPayment: ErpActions['addPayment'] = useCallback(
    (data) => {
      const { invoices, payments } = stateRef.current;
      const allocated = data.allocations.reduce((s, a) => s + a.amount, 0);
      if (allocated > data.amount) {
        toast.error('Le total alloué dépasse le montant du paiement.');
        return;
      }
      for (const a of data.allocations) {
        const inv = invoices.find((f) => f.id === a.invoiceId);
        if (!inv) continue;
        if (a.amount > invoiceBalance(inv, payments)) {
          toast.error(`Allocation supérieure au solde de la facture ${inv.reference}.`);
          return;
        }
      }
      const reference = nextRef(
        payments.map((p) => p.reference),
        'PAY-',
        6,
      );
      setState((s) => ({
        ...s,
        payments: [
          {
            id: uid('p'),
            reference,
            contactId: data.contactId,
            amount: data.amount,
            currency: 'XOF',
            receivedAt: new Date().toISOString(),
            method: data.method,
            account: data.account,
            status: 'RECU',
            allocations: data.allocations,
          },
          ...s.payments,
        ],
      }));
      log(`Paiement ${reference} enregistré`);
      toast.success(`Paiement ${reference} enregistré (démonstration).`);
    },
    [log],
  );

  const allocatePayment: ErpActions['allocatePayment'] = useCallback(
    (paymentId, invoiceId, amount) => {
      const { payments, invoices } = stateRef.current;
      const payment = payments.find((p) => p.id === paymentId);
      const invoice = invoices.find((f) => f.id === invoiceId);
      if (!payment || !invoice) return;
      const unallocated =
        payment.amount - payment.allocations.reduce((s, a) => s + a.amount, 0);
      if (amount <= 0 || amount > unallocated) {
        toast.error('Montant supérieur au solde non affecté du paiement.');
        return;
      }
      if (amount > invoiceBalance(invoice, payments)) {
        toast.error('Montant supérieur au solde restant de la facture.');
        return;
      }
      setState((s) => ({
        ...s,
        payments: s.payments.map((p) =>
          p.id === paymentId
            ? { ...p, allocations: [...p.allocations, { invoiceId, amount }] }
            : p,
        ),
      }));
      log(`Paiement ${payment.reference} affecté à ${invoice.reference}`, {
        kind: 'invoice',
        id: invoiceId,
      });
      toast.success('Allocation enregistrée (démonstration).');
    },
    [log],
  );

  const addExpense: ErpActions['addExpense'] = useCallback(
    (data) => {
      const reference = nextRef(
        stateRef.current.expenses.map((e) => e.reference),
        'DEP-',
        6,
      );
      setState((s) => ({
        ...s,
        expenses: [{ ...data, id: uid('e'), reference, status: 'SOUMISE' }, ...s.expenses],
      }));
      log(`Dépense ${reference} soumise`);
      toast.success(`Dépense ${reference} soumise pour validation (démonstration).`);
    },
    [log],
  );

  const expenseAction: ErpActions['expenseAction'] = useCallback(
    (id, action) => {
      const expense = stateRef.current.expenses.find((e) => e.id === id);
      if (!expense || expense.status !== 'SOUMISE') {
        toast.error('Seule une dépense soumise peut être validée ou rejetée.');
        return;
      }
      setState((s) => ({
        ...s,
        expenses: s.expenses.map((e) =>
          e.id === id ? { ...e, status: action === 'VALIDER' ? 'VALIDEE' : 'REJETEE' } : e,
        ),
      }));
      log(
        `Dépense ${expense.reference} ${action === 'VALIDER' ? 'validée' : 'rejetée'}`,
      );
      toast.success(
        action === 'VALIDER'
          ? 'Dépense validée : elle entre dans la marge réelle (démonstration).'
          : 'Dépense rejetée (démonstration).',
      );
    },
    [log],
  );

  /* ------------------------------ Divers ------------------------------ */

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const submitPublicRequest: ErpActions['submitPublicRequest'] = useCallback(
    (data) => {
      const contactId = uid('c');
      const reference = nextRef(
        stateRef.current.leads.map((l) => l.reference),
        'LEAD-2026-',
        4,
      );
      setState((s) => ({
        ...s,
        publicRequests: [
          { ...data, id: uid('req'), at: new Date().toISOString() },
          ...s.publicRequests,
        ],
        contacts: [
          {
            id: contactId,
            name: data.name,
            phone: data.phone,
            whatsapp: data.whatsapp,
            email: data.email,
            isClient: false,
            createdAt: new Date().toISOString(),
          },
          ...s.contacts,
        ],
        leads: [
          {
            id: uid('l'),
            reference,
            contactId,
            service: data.service,
            origin: data.origin,
            destination: data.destination,
            source: 'Formulaire web',
            owner: 'À attribuer',
            status: 'NOUVEAU',
            description: data.description,
            createdAt: new Date().toISOString(),
          },
          ...s.leads,
        ],
      }));
      log(`Demande publique reçue — prospect ${reference} créé`);
    },
    [log],
  );

  const value = useMemo(
    () => ({
      ...state,
      setOrg,
      addLead,
      updateLead,
      moveLeadStatus,
      createQuote,
      quoteAction,
      newQuoteVersion,
      assignMission,
      missionAction,
      addProof,
      controlAction,
      addIncident,
      incidentAction,
      createInvoiceFromMission,
      issueInvoice,
      addPayment,
      allocatePayment,
      addExpense,
      expenseAction,
      markNotificationRead,
      markAllNotificationsRead,
      submitPublicRequest,
    }),
    [
      state,
      setOrg,
      addLead,
      updateLead,
      moveLeadStatus,
      createQuote,
      quoteAction,
      newQuoteVersion,
      assignMission,
      missionAction,
      addProof,
      controlAction,
      addIncident,
      incidentAction,
      createInvoiceFromMission,
      issueInvoice,
      addPayment,
      allocatePayment,
      addExpense,
      expenseAction,
      markNotificationRead,
      markAllNotificationsRead,
      submitPublicRequest,
    ],
  );

  return <ErpContext.Provider value={value}>{children}</ErpContext.Provider>;
}

export function useErp() {
  const ctx = useContext(ErpContext);
  if (!ctx) throw new Error('useErp doit être utilisé dans <ErpProvider>.');
  return ctx;
}
