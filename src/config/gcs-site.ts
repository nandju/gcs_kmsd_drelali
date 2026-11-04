/* ------------------------------------------------------------------ */
/* Configuration du site public GCS (identité reprise du vitrine gcs). */
/* Informations non validées centralisées ici, marquées « à compléter » */
/* ------------------------------------------------------------------ */

export const GCS_SITE = {
  name: 'GCS',
  tagline: 'Vos expéditions, de bout en bout.',
  description:
    'GCS simplifie la gestion de vos expéditions, de la demande de devis au suivi des livraisons, avec une meilleure visibilité sur chaque étape.',
  country: 'Côte d’Ivoire',
  nav: [
    { label: 'Accueil', href: '/gcs' },
    { label: 'Nos services', href: '/gcs/services' },
    { label: 'Fonctionnement', href: '/gcs/fonctionnement' },
    { label: 'À propos', href: '/gcs/a-propos' },
    { label: 'Contact', href: '/gcs/contact' },
  ],
  quoteHref: '/gcs/devis',
  /** Coordonnées à valider avant publication. */
  contact: {
    email: '',
    phone: '',
    address: '',
    note: 'Coordonnées à compléter — en attente de validation.',
  },
  services: [
    {
      id: 'transport',
      image: '/images/gcs/1380.jpg',
      alt: 'Porte-conteneurs amarré au port avec ses grues',
      index: '01',
      title: 'Transport & expédition',
      description:
        'Organisation de vos envois et expéditions avec un pilotage centralisé de chaque opération.',
    },
    {
      id: 'colis',
      image: '/images/gcs/77653.jpg',
      alt: 'Opérateurs contrôlant des colis sur des rayonnages',
      index: '02',
      title: 'Gestion des colis',
      description:
        'Enregistrement détaillé de chaque colis : description, emballage, valeur et statut.',
    },
    {
      id: 'livraison',
      image: '/images/gcs/1242.jpg',
      alt: 'Livreuse déposant des colis à domicile',
      index: '03',
      title: 'Livraison à domicile',
      description:
        'Option de livraison directement chez le destinataire, avec adresse dédiée.',
    },
    {
      id: 'suivi',
      image: '/images/gcs/14238.jpg',
      alt: 'Responsable vérifiant un stock dans un entrepôt',
      index: '04',
      title: 'Suivi des opérations',
      description:
        'Chaque expédition est tracée dans une chaîne unique, du prospect à la marge.',
    },
  ],
  process: [
    { title: 'Prospect', description: "Prise de contact et qualification du besoin d'expédition." },
    { title: 'Cotation', description: 'Établissement du devis à partir des informations de la demande.' },
    { title: 'Mission', description: "Organisation et exécution de l'opération de transport." },
    { title: 'Preuve', description: 'Confirmation et justificatif de la livraison effectuée.' },
    { title: 'Facture', description: 'Émission de la facture correspondant à la mission réalisée.' },
    { title: 'Paiement', description: 'Encaissement et suivi du règlement de la facture.' },
    { title: 'Marge', description: 'Calcul de la rentabilité de chaque opération.' },
  ],
} as const;
