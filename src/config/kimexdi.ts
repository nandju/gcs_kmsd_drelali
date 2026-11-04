/* ------------------------------------------------------------------ */
/* Configuration du site public KIMEXDI / KMSD Canada.                 */
/* Toutes les informations non encore validées sont centralisées ici   */
/* et marquées « à compléter » — rien n'est inventé.                   */
/* ------------------------------------------------------------------ */

export const KIMEXDI = {
  name: 'KIMEXDI',
  legalNote: 'KIMEXDI / KMSD Canada — dénomination juridique à confirmer.',
  baseline:
    'Logistique, import-export, transport, entreposage et groupage au Canada.',
  /** Coordonnées à valider avant publication. */
  contact: {
    email: '',
    phone: '',
    address: '',
    note: 'Coordonnées à compléter — en attente de validation.',
  },
  nav: [
    { label: 'Accueil', href: '/kimexdi' },
    { label: 'Services', href: '/kimexdi/services' },
    { label: 'Fonctionnement', href: '/kimexdi/fonctionnement' },
    { label: 'À propos', href: '/kimexdi/a-propos' },
    { label: 'Contact', href: '/kimexdi/contact' },
  ],
  services: [
    {
      id: 'logistique',
      title: 'Logistique',
      description:
        'Organisation et coordination de vos flux de marchandises, de la réception à l’expédition.',
    },
    {
      id: 'import-export',
      title: 'Import-export',
      description:
        'Accompagnement de vos opérations d’importation et d’exportation depuis et vers le Canada.',
    },
    {
      id: 'transport',
      title: 'Transport',
      description:
        'Solutions de transport de marchandises adaptées à vos volumes et à vos échéances.',
    },
    {
      id: 'entreposage',
      title: 'Entreposage',
      description:
        'Solutions d’entreposage pour la conservation de vos marchandises entre deux opérations.',
    },
    {
      id: 'groupage',
      title: 'Groupage',
      description:
        'Regroupement de marchandises de plusieurs expéditeurs dans un même départ pour optimiser les coûts.',
    },
    {
      id: 'services-locaux',
      title: 'Services logistiques locaux',
      description:
        'Prestations logistiques de proximité au Canada : manutention, préparation et coordination locale.',
    },
  ],
} as const;
