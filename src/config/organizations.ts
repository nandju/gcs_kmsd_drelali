export type OrgCode = 'GCS' | 'KIMEXDI' | 'DRELALI';

export interface OrganizationConfig {
  code: OrgCode;
  displayName: string;
  legalNote?: string;
  country: string;
  currency: 'XOF' | 'CAD';
  timezone: string;
  logo?: string;
  accentColor: string;
  modules: string[];
  demo: boolean;
  description: string;
}

export const ORGANIZATIONS: Record<OrgCode, OrganizationConfig> = {
  GCS: {
    code: 'GCS',
    displayName: 'GCS — Côte d’Ivoire',
    country: 'Côte d’Ivoire',
    currency: 'XOF',
    timezone: 'Africa/Abidjan',
    accentColor: '#0e7490',
    modules: [
      'pilotage',
      'commercial',
      'operations',
      'finances',
      'donnees',
      'administration',
    ],
    demo: true,
    description:
      'Logistique, transport, distribution, entreposage et services opérationnels en Côte d’Ivoire.',
  },
  KIMEXDI: {
    code: 'KIMEXDI',
    displayName: 'KIMEXDI — Canada',
    legalNote: 'Dénomination juridique exacte (KMSD / KIMEXDI) à confirmer.',
    country: 'Canada',
    currency: 'CAD',
    timezone: 'America/Toronto',
    accentColor: '#1769aa',
    modules: ['pilotage'],
    demo: true,
    description:
      'Logistique, transport, entreposage, import-export et groupage international.',
  },
  DRELALI: {
    code: 'DRELALI',
    displayName: 'DRELALI — Agro-Alimentaire',
    legalNote:
      'Pendant le pilote, les documents juridiquement engageants relèvent de GCS.',
    country: 'Côte d’Ivoire',
    currency: 'XOF',
    timezone: 'Africa/Abidjan',
    accentColor: '#15803d',
    modules: ['pilotage'],
    demo: true,
    description:
      'Agriculture, aviculture, pisciculture, transformation et commercialisation de produits agroalimentaires.',
  },
};

export const ORG_LIST = Object.values(ORGANIZATIONS);

export const FUTURE_MODULES: Record<Exclude<OrgCode, 'GCS'>, string[]> = {
  KIMEXDI: [
    'Campagnes maritimes',
    'Groupage',
    'Commandes',
    'Colis',
    'Réception',
    'Chargement',
    'Transit',
    'Dépotage',
    'Entreposage',
    'Documents de transport',
    'Livraisons',
    'Ressources canadiennes',
  ],
  DRELALI: [
    'Sites agricoles',
    'Zones et parcelles',
    'Cycles culturaux',
    'Travaux',
    'Consommation d’intrants',
    'Récoltes',
    'Bâtiments et lots avicoles',
    'Collecte des œufs',
    'Pisciculture',
    'Transformation',
    'Formules versionnées',
    'Ordres de fabrication',
    'Lots de produits',
    'Stocks',
    'Achats',
    'Budgets',
  ],
};
