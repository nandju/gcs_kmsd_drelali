import type { OrgCode } from '@/config/organizations';
import type { ReactNode } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  comingSoon?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

function I({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const icons = {
  dashboard: <I d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-18v6h8V3h-8Z" />,
  inbox: <I d="M22 12h-6l-2 3h-4l-2-3H2M5 5h14l3 7v7H2v-7l3-7Z" />,
  check: <I d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  alert: <I d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />,
  users: <I d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
  contact: <I d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m1-2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />,
  pipeline: <I d="M4 4h16M7 9h10M10 14h4M11 19h2" />,
  quote: <I d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M9 13h6M9 17h6" />,
  truck: <I d="M1 3h15v13H1V3Zm15 5h4l3 4v4h-7V8ZM5.5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm13 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
  calendar: <I d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />,
  wrench: <I d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3 3.7-3.7Z" />,
  driver: <I d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5Z" />,
  proof: <I d="M9 12l2 2 4-4m5 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  incident: <I d="M12 8v4m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />,
  control: <I d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-5 9 2 2 4-4" />,
  invoice: <I d="M9 7h6m-6 4h6m-6 4h4M5 3h14a1 1 0 0 1 1 1v17l-3-2-2 2-3-2-3 2-2-2-3 2V4a1 1 0 0 1 1-1Z" />,
  payment: <I d="M2 8h20M2 12h20M6 16h4M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />,
  expense: <I d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  cash: <I d="M12 2v4m0 12v4M4 7h16v10H4V7Zm8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
  margin: <I d="M3 3v18h18M7 14l4-4 3 3 5-6" />,
  import: <I d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  history: <I d="M3 12a9 9 0 1 0 2.6-6.4L3 8m0-5v5h5M12 7v5l3 3" />,
  doc: <I d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6" />,
  org: <I d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1M9 13h1m4 0h1M9 17h1m4 0h1" />,
  settings: <I d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-1.7-1L14.8 3h-4l-.4 2.6a7.5 7.5 0 0 0-1.7 1l-2.4-1-2 3.4L6.7 11a7.4 7.4 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.5 7.5 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.06-.33.1-.66.1-1Z" />,
  globe: <I d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0 0c2.5-2.5 4-6 4-10S14.5 4.5 12 2m0 20c-2.5-2.5-4-6-4-10s1.5-7.5 4-10M2 12h20" />,
};

const GCS_NAV: NavSection[] = [
  {
    title: 'Pilotage',
    items: [
      { label: 'Tableau de bord', href: '/tableau-de-bord', icon: icons.dashboard },
      { label: 'À traiter', href: '/a-traiter', icon: icons.inbox },
      { label: 'Mes décisions', href: '/decisions', icon: icons.check },
      { label: 'Alertes', href: '/alertes', icon: icons.alert },
    ],
  },
  {
    title: 'Commercial',
    items: [
      { label: 'Prospects', href: '/prospects', icon: icons.users },
      { label: 'Clients et contacts', href: '/contacts', icon: icons.contact },
      { label: 'Pipeline commercial', href: '/pipeline', icon: icons.pipeline },
      { label: 'Cotations', href: '/cotations', icon: icons.quote },
      { label: 'Demandes reçues', href: '/demandes', icon: icons.inbox },
      { label: 'Formulaires', href: '/formulaires', icon: icons.control },
    ],
  },
  {
    title: 'Opérations',
    items: [
      { label: 'Missions', href: '/missions', icon: icons.truck },
      { label: 'Planning', href: '/planning', icon: icons.calendar },
      { label: 'Ressources et véhicules', href: '/ressources', icon: icons.wrench },
      { label: 'Chauffeurs', href: '/chauffeurs', icon: icons.driver },
      { label: 'Livraisons et preuves', href: '/preuves', icon: icons.proof },
      { label: 'Incidents', href: '/incidents', icon: icons.incident },
      { label: 'Missions à contrôler', href: '/controle', icon: icons.control },
    ],
  },
  {
    title: 'Finances',
    items: [
      { label: 'Factures', href: '/factures', icon: icons.invoice },
      { label: 'Paiements', href: '/paiements', icon: icons.payment },
      { label: 'Dépenses', href: '/depenses', icon: icons.expense },
      { label: 'Caisse et comptes', href: '/caisse', icon: icons.cash },
      { label: 'Rentabilité et marges', href: '/rentabilite', icon: icons.margin },
    ],
  },
  {
    title: 'Données',
    items: [
      { label: 'Import de contacts', href: '/import', icon: icons.import, comingSoon: true },
      { label: 'Historique des activités', href: '/historique', icon: icons.history },
      { label: 'Documents', href: '/documents', icon: icons.doc, comingSoon: true },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Utilisateurs et rôles', href: '/utilisateurs', icon: icons.users },
      { label: 'Organisation', href: '/organisation', icon: icons.org },
      { label: 'Paramètres', href: '/parametres', icon: icons.settings },
    ],
  },
];

const KIMEXDI_NAV: NavSection[] = [
  {
    title: 'Pilotage',
    items: [{ label: 'Tableau de bord', href: '/tableau-de-bord', icon: icons.dashboard }],
  },
  {
    title: 'Plateforme publique',
    items: [
      { label: 'Formulaires', href: '/formulaires', icon: icons.control },
      { label: 'Demandes reçues', href: '/demandes', icon: icons.inbox },
      { label: 'Site public', href: '/kimexdi', icon: icons.globe },
    ],
  },
  {
    title: 'Logistique internationale',
    items: [
      { label: 'Modules à venir', href: '/tableau-de-bord', icon: icons.globe, comingSoon: true },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Organisation', href: '/organisation', icon: icons.org },
      { label: 'Paramètres', href: '/parametres', icon: icons.settings },
    ],
  },
];

const DRELALI_NAV: NavSection[] = [
  {
    title: 'Pilotage',
    items: [{ label: 'Tableau de bord', href: '/tableau-de-bord', icon: icons.dashboard }],
  },
  {
    title: 'Agro-alimentaire',
    items: [
      { label: 'Modules à venir', href: '/tableau-de-bord', icon: icons.globe, comingSoon: true },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Organisation', href: '/organisation', icon: icons.org },
      { label: 'Paramètres', href: '/parametres', icon: icons.settings },
    ],
  },
];

export function navForOrg(org: OrgCode): NavSection[] {
  if (org === 'GCS') return GCS_NAV;
  if (org === 'KIMEXDI') return KIMEXDI_NAV;
  return DRELALI_NAV;
}

export const PAGE_TITLES: Record<string, string> = {
  '/tableau-de-bord': 'Tableau de bord',
  '/a-traiter': 'À traiter',
  '/decisions': 'Mes décisions',
  '/alertes': 'Alertes',
  '/prospects': 'Prospects',
  '/contacts': 'Clients et contacts',
  '/pipeline': 'Pipeline commercial',
  '/cotations': 'Cotations',
  '/formulaires': 'Gestion des formulaires',
  '/demandes': 'Demandes reçues',
  '/missions': 'Missions',
  '/planning': 'Planning',
  '/ressources': 'Ressources et véhicules',
  '/chauffeurs': 'Chauffeurs',
  '/preuves': 'Livraisons et preuves',
  '/incidents': 'Incidents',
  '/controle': 'Missions à contrôler',
  '/factures': 'Factures',
  '/paiements': 'Paiements',
  '/depenses': 'Dépenses',
  '/caisse': 'Caisse et comptes',
  '/rentabilite': 'Rentabilité et marges',
  '/import': 'Import de contacts',
  '/historique': 'Historique des activités',
  '/documents': 'Documents',
  '/utilisateurs': 'Utilisateurs et rôles',
  '/organisation': 'Organisation',
  '/parametres': 'Paramètres',
  '/chauffeur': 'Espace chauffeur',
};
