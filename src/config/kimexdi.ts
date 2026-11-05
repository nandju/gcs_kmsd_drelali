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
  /** Visuels partagés avec GCS (photothèque logistique commune). */
  images: {
    hero: '/images/kimexdi/2151989598.jpg',
    heroAlt: 'Chaîne logistique multimodale : camion, avion et porte-conteneurs',
    about: '/images/kimexdi/129640.jpg',
    aboutAlt: 'Responsable logistique consultant une tablette dans un entrepôt',
    groupage: '/images/kimexdi/77653.jpg',
    groupageAlt: 'Opérateurs contrôlant des colis sur des rayonnages',
  },
  services: [
    {
      id: 'logistique',
      title: 'Logistique',
      image: '/images/kimexdi/14238.jpg',
      alt: 'Responsable vérifiant un stock dans un entrepôt',
      description:
        'Organisation et coordination de vos flux de marchandises, de la réception à l’expédition.',
    },
    {
      id: 'import-export',
      title: 'Import-export',
      image: '/images/kimexdi/735.jpg',
      alt: 'Porte-conteneurs chargé, vu du ciel en pleine mer',
      description:
        'Accompagnement de vos opérations d’importation et d’exportation depuis et vers le Canada.',
    },
    {
      id: 'transport',
      title: 'Transport',
      image: '/images/kimexdi/1380.jpg',
      alt: 'Porte-conteneurs amarré au port avec ses grues',
      description:
        'Solutions de transport de marchandises adaptées à vos volumes et à vos échéances.',
    },
    {
      id: 'entreposage',
      title: 'Entreposage',
      image: '/images/kimexdi/77653.jpg',
      alt: 'Opérateurs contrôlant des colis sur des rayonnages',
      description:
        'Solutions d’entreposage pour la conservation de vos marchandises entre deux opérations.',
    },
    {
      id: 'groupage',
      title: 'Groupage',
      image: '/images/kimexdi/1242.jpg',
      alt: 'Livreuse déposant des colis à domicile',
      description:
        'Regroupement de marchandises de plusieurs expéditeurs dans un même départ pour optimiser les coûts.',
    },
    {
      id: 'services-locaux',
      title: 'Services logistiques locaux',
      image: '/images/kimexdi/71414.jpg',
      alt: 'Équipe préparant des colis en entrepôt',
      description:
        'Prestations logistiques de proximité au Canada : manutention, préparation et coordination locale.',
    },
  ],
} as const;
