// =====================================================================
// DONNÉES DE DÉMONSTRATION — fictives, destinées à la présentation.
// Elles seront remplacées par de vraies réponses API ultérieurement.
// =====================================================================
import type {
  Activity,
  AppNotification,
  Contact,
  Driver,
  Expense,
  Incident,
  Invoice,
  Lead,
  Mission,
  Payment,
  Proof,
  Quote,
  Vehicle,
} from '@/lib/erp/types';

// Dates relatives au jour courant pour une démonstration toujours vivante.
function d(offsetDays: number, hour = 9, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

/* ------------------------------ Contacts ------------------------------ */

export const CONTACTS: Contact[] = [
  { id: 'c1', name: 'SODICI', company: 'SODICI SA', phone: '+225 07 07 11 22 33', whatsapp: '+225 07 07 11 22 33', email: 'logistique@sodici.ci', city: 'Abidjan — Zone 4', isClient: true, createdAt: d(-120), notes: 'Client régulier, distribution de produits de grande consommation.' },
  { id: 'c2', name: 'Ets Kouamé & Fils', company: 'Ets Kouamé & Fils', phone: '+225 05 44 55 66 77', whatsapp: '+225 05 44 55 66 77', email: 'kouame.fils@exemple.ci', city: 'Bouaké', isClient: true, createdAt: d(-95) },
  { id: 'c3', name: 'Pharmacie du Plateau', company: 'Pharmacie du Plateau', phone: '+225 27 20 30 40 50', email: 'contact@pharmaplateau.ci', city: 'Abidjan — Plateau', isClient: true, createdAt: d(-80), notes: 'Livraisons sensibles, créneaux horaires stricts.' },
  { id: 'c4', name: 'Agro Ivoire Distribution', company: 'Agro Ivoire Distribution', phone: '+225 01 02 03 04 05', whatsapp: '+225 01 02 03 04 05', city: 'Yamoussoukro', isClient: false, createdAt: d(-30) },
  { id: 'c5', name: 'Mme Diabaté Awa', phone: '+225 07 89 65 43 21', whatsapp: '+225 07 89 65 43 21', city: 'Abidjan — Cocody', isClient: false, createdAt: d(-18) },
  { id: 'c6', name: 'TransAfrique SARL', company: 'TransAfrique SARL', phone: '+225 25 21 00 11 22', email: 'ops@transafrique.ci', city: 'San-Pédro', isClient: false, createdAt: d(-60) },
  { id: 'c7', name: 'Boulangerie La Baguette d’Or', company: 'La Baguette d’Or', phone: '+225 05 55 12 12 12', city: 'Abidjan — Marcory', isClient: false, createdAt: d(-10) },
  { id: 'c8', name: 'M. Yao Bertin', phone: '+225 07 10 20 30 40', whatsapp: '+225 07 10 20 30 40', city: 'Abidjan — Yopougon', isClient: false, createdAt: d(-2) },
  { id: 'c9', name: 'Marché Gros Abobo', company: 'Coopérative Marché Gros Abobo', phone: '+225 01 44 33 22 11', city: 'Abidjan — Abobo', isClient: false, createdAt: d(-4) },
  { id: 'c10', name: 'CIE Chantier Yopougon', company: 'CIE', phone: '+225 27 23 45 67 89', email: 'chantier.yop@exemple.ci', city: 'Abidjan — Yopougon', isClient: false, createdAt: d(-6) },
];

/* ------------------------------ Prospects ----------------------------- */

export const LEADS: Lead[] = [
  { id: 'l1', reference: 'LEAD-2026-0001', contactId: 'c8', service: 'Déménagement résidentiel', origin: 'Yopougon', destination: 'Cocody', source: 'Formulaire web', owner: 'A. Koné', status: 'NOUVEAU', nextAction: 'Premier appel de qualification', nextActionDate: d(1), description: 'Déménagement appartement 3 pièces, souhaite un devis rapide.', createdAt: d(-2) },
  { id: 'l2', reference: 'LEAD-2026-0002', contactId: 'c9', service: 'Transport de marchandises', origin: 'Port d’Abidjan', destination: 'Abobo', source: 'Recommandation', referrer: 'M. Diallo', owner: 'A. Koné', status: 'A_QUALIFIER', nextAction: 'Visite du site et évaluation des volumes', nextActionDate: d(2), createdAt: d(-4) },
  { id: 'l3', reference: 'LEAD-2026-0003', contactId: 'c10', service: 'Location de véhicule avec chauffeur', origin: 'Yopougon', destination: 'Yopougon', source: 'Appel entrant', owner: 'B. N’Guessan', status: 'A_QUALIFIER', nextAction: 'Préciser la durée de location', nextActionDate: d(1), createdAt: d(-6) },
  { id: 'l4', reference: 'LEAD-2026-0004', contactId: 'c7', service: 'Distribution quotidienne', origin: 'Marcory', destination: 'Points de vente Abidjan', source: 'Prospection terrain', owner: 'B. N’Guessan', status: 'BESOIN_IDENTIFIE', nextAction: 'Préparer la cotation tournée quotidienne', nextActionDate: d(3), description: 'Tournée de livraison matinale vers 12 points de vente.', createdAt: d(-10) },
  { id: 'l5', reference: 'LEAD-2026-0005', contactId: 'c5', service: 'Déménagement résidentiel', origin: 'Cocody', destination: 'Bingerville', source: 'Formulaire web', owner: 'A. Koné', status: 'COTATION', nextAction: 'Finaliser la cotation COT-00123', nextActionDate: d(1), createdAt: d(-18) },
  { id: 'l6', reference: 'LEAD-2026-0006', contactId: 'c4', service: 'Transport agroalimentaire', origin: 'Yamoussoukro', destination: 'Abidjan', source: 'Salon professionnel', owner: 'B. N’Guessan', status: 'ENVOYEE', nextAction: 'Relance téléphonique sur COT-00122', nextActionDate: d(2), createdAt: d(-30) },
  { id: 'l7', reference: 'LEAD-2026-0007', contactId: 'c2', service: 'Transport inter-villes', origin: 'Abidjan', destination: 'Bouaké', source: 'Client existant', owner: 'A. Koné', status: 'GAGNE', createdAt: d(-40) },
  { id: 'l8', reference: 'LEAD-2026-0008', contactId: 'c6', service: 'Entreposage', origin: 'San-Pédro', destination: 'San-Pédro', source: 'Appel entrant', owner: 'A. Koné', status: 'PERDU', lostReason: 'Budget insuffisant pour la prestation demandée.', createdAt: d(-55) },
];

/* ------------------------------ Cotations ----------------------------- */

export const QUOTES: Quote[] = [
  {
    id: 'q1', reference: 'COT-00121', contactId: 'c1', service: 'Distribution Zone 4 → Grand Abidjan', origin: 'Abidjan — Zone 4', destination: 'Grand Abidjan', currency: 'XOF', status: 'ACCEPTEE', owner: 'A. Koné', issuedAt: d(-45), missionId: 'm1',
    versions: [{ version: 1, createdAt: d(-45), validityDate: d(-15), conditions: 'Paiement à 15 jours. Prestation hors taxes de démonstration.', estimatedCost: 320000, floorPrice: 420000, commercialPrice: 520000, proposedPrice: 500000, internalNotes: 'Client fidèle : remise consentie sur le prix commercial.', lines: [{ id: 'q1l1', label: 'Tournée de distribution — 12 points de livraison', quantity: 1, unit: 'forfait', unitPrice: 500000 }] }],
  },
  {
    id: 'q2', reference: 'COT-00122', leadId: 'l6', contactId: 'c4', service: 'Transport agroalimentaire', origin: 'Yamoussoukro', destination: 'Abidjan', currency: 'XOF', status: 'ENVOYEE', owner: 'B. N’Guessan', issuedAt: d(-12),
    versions: [{ version: 1, createdAt: d(-12), validityDate: d(18), conditions: 'Validité 30 jours. Chargement à la charge du client.', estimatedCost: 450000, floorPrice: 600000, commercialPrice: 750000, proposedPrice: 720000, lines: [{ id: 'q2l1', label: 'Transport frigorifique Yamoussoukro → Abidjan', quantity: 2, unit: 'rotation', unitPrice: 360000 }] }],
  },
  {
    id: 'q3', reference: 'COT-00123', leadId: 'l5', contactId: 'c5', service: 'Déménagement résidentiel', origin: 'Cocody', destination: 'Bingerville', currency: 'XOF', status: 'A_VALIDER', owner: 'A. Koné', issuedAt: d(-3),
    versions: [{ version: 1, createdAt: d(-3), validityDate: d(27), conditions: 'Emballage des objets fragiles inclus.', estimatedCost: 180000, floorPrice: 240000, commercialPrice: 300000, proposedPrice: 285000, internalNotes: 'Prix proposé proche du prix commercial, à faire valider.', lines: [{ id: 'q3l1', label: 'Déménagement appartement 3 pièces', quantity: 1, unit: 'forfait', unitPrice: 230000 }, { id: 'q3l2', label: 'Emballage et protection objets fragiles', quantity: 1, unit: 'forfait', unitPrice: 55000 }] }],
  },
  {
    id: 'q4', reference: 'COT-00124', leadId: 'l8', contactId: 'c6', service: 'Entreposage mensuel', origin: 'San-Pédro', destination: 'San-Pédro', currency: 'XOF', status: 'REFUSEE', owner: 'A. Koné', issuedAt: d(-50),
    versions: [{ version: 1, createdAt: d(-50), validityDate: d(-20), conditions: 'Engagement minimum de 3 mois.', estimatedCost: 500000, floorPrice: 700000, commercialPrice: 900000, proposedPrice: 850000, lines: [{ id: 'q4l1', label: 'Entreposage 200 m² — 3 mois', quantity: 3, unit: 'mois', unitPrice: 283334 }] }],
  },
  {
    id: 'q5', reference: 'COT-00125', leadId: 'l7', contactId: 'c2', service: 'Transport inter-villes Abidjan → Bouaké', origin: 'Abidjan', destination: 'Bouaké', currency: 'XOF', status: 'ACCEPTEE', owner: 'A. Koné', issuedAt: d(-38), missionId: 'm6',
    versions: [
      { version: 1, createdAt: d(-38), validityDate: d(-8), conditions: 'Validité 30 jours.', estimatedCost: 700000, floorPrice: 950000, commercialPrice: 1250000, proposedPrice: 1250000, note: 'Proposition initiale.', lines: [{ id: 'q5v1l1', label: 'Transport lot complet Abidjan → Bouaké', quantity: 2, unit: 'rotation', unitPrice: 625000 }] },
      { version: 2, createdAt: d(-25), validityDate: d(5), conditions: 'Validité 30 jours. Remise volume appliquée.', estimatedCost: 700000, floorPrice: 950000, commercialPrice: 1250000, proposedPrice: 1150000, note: 'Négociation : remise volume demandée par le client.', internalNotes: 'Remise acceptée par la direction commerciale.', lines: [{ id: 'q5v2l1', label: 'Transport lot complet Abidjan → Bouaké', quantity: 2, unit: 'rotation', unitPrice: 575000 }] },
      { version: 3, createdAt: d(-15), validityDate: d(15), conditions: 'Validité 30 jours. Remise volume et assurance incluses.', estimatedCost: 720000, floorPrice: 950000, commercialPrice: 1250000, proposedPrice: 1100000, note: 'Version finale acceptée par le client.', lines: [{ id: 'q5v3l1', label: 'Transport lot complet Abidjan → Bouaké', quantity: 2, unit: 'rotation', unitPrice: 525000 }, { id: 'q5v3l2', label: 'Assurance marchandises', quantity: 1, unit: 'forfait', unitPrice: 50000 }] },
    ],
  },
  {
    id: 'q6', reference: 'COT-00126', contactId: 'c7', service: 'Tournée de distribution quotidienne', origin: 'Marcory', destination: 'Points de vente Abidjan', currency: 'XOF', status: 'BROUILLON', owner: 'B. N’Guessan', issuedAt: d(-1),
    versions: [{ version: 1, createdAt: d(-1), validityDate: d(29), conditions: 'Tarification mensuelle, départ 5h00.', estimatedCost: 900000, floorPrice: 1200000, commercialPrice: 1500000, proposedPrice: 1450000, internalNotes: 'En attente des volumes définitifs du client.', lines: [{ id: 'q6l1', label: 'Tournée quotidienne — 12 points de vente (mensuel)', quantity: 1, unit: 'mois', unitPrice: 1450000 }] }],
  },
];

/* ----------------------------- Ressources ----------------------------- */

export const VEHICLES: Vehicle[] = [
  { id: 'v1', name: 'Hino 195', type: 'Camion porteur', owner: 'GCS', status: 'EN_MISSION', note: 'Affecté à la mission MT-00003.' },
  { id: 'v2', name: 'Ford Transit 250', type: 'Fourgon', owner: 'GCS', status: 'DISPONIBLE' },
  { id: 'v3', name: 'Tricycle cargo (démo)', type: 'Tricycle', owner: 'GCS', status: 'DISPONIBLE', note: 'Véhicule de démonstration.' },
  { id: 'v4', name: 'Camion 10T (démo)', type: 'Camion', owner: 'GCS', status: 'IMMOBILISE', note: 'Maintenance préventive — indisponible pour affectation.' },
];

export const DRIVERS: Driver[] = [
  { id: 'd1', name: 'Koffi Jean', phone: '+225 07 55 44 33 22', status: 'EN_MISSION', license: 'Permis C' },
  { id: 'd2', name: 'Traoré Issouf', phone: '+225 05 66 77 88 99', status: 'DISPONIBLE', license: 'Permis BE' },
  { id: 'd3', name: 'Soro Adama', phone: '+225 01 23 45 67 89', status: 'ABSENT', license: 'Permis C' },
];

/* ------------------------------ Missions ------------------------------ */

export const MISSIONS: Mission[] = [
  {
    id: 'm1', reference: 'MT-00001', contactId: 'c1', quoteId: 'q1', quoteVersion: 1, service: 'Tournée de distribution — 12 points', origin: 'Abidjan — Zone 4', destination: 'Grand Abidjan', plannedDate: d(-20, 6), vehicleId: 'v2', driverId: 'd2', supervisor: 'K. Assi', status: 'CLOTUREE', control: 'CONFIRME', invoiceId: 'f1', revenue: 500000, estimatedCost: 320000, createdAt: d(-30),
    instructions: 'Respecter l’ordre de tournée transmis par le client.',
    steps: [
      { id: 'm1s1', label: 'Chargement dépôt', location: 'Zone 4', plannedAt: d(-20, 6), done: true },
      { id: 'm1s2', label: 'Tournée points de vente', location: 'Grand Abidjan', plannedAt: d(-20, 8), done: true },
      { id: 'm1s3', label: 'Retour dépôt', location: 'Zone 4', plannedAt: d(-20, 16), done: true },
    ],
    events: [
      { id: 'm1e1', at: d(-20, 6, 5), label: 'Mission démarrée', by: 'Traoré Issouf' },
      { id: 'm1e2', at: d(-20, 6, 40), label: 'Chargement confirmé', by: 'Traoré Issouf' },
      { id: 'm1e3', at: d(-20, 16, 30), label: 'Dernière livraison enregistrée', by: 'Traoré Issouf' },
      { id: 'm1e4', at: d(-18, 10), label: 'Contrôle confirmé', by: 'K. Assi' },
      { id: 'm1e5', at: d(-17, 9), label: 'Facture FAC-000001 émise', by: 'Service finances' },
    ],
  },
  {
    id: 'm2', reference: 'MT-00002', contactId: 'c3', service: 'Livraison produits pharmaceutiques', origin: 'Abidjan — Plateau', destination: 'Abidjan — Riviera', plannedDate: d(-2, 7), vehicleId: 'v3', driverId: 'd2', supervisor: 'K. Assi', status: 'A_CONTROLER', control: 'EN_ATTENTE', revenue: 650000, estimatedCost: 150000, createdAt: d(-8),
    instructions: 'Chaîne du froid à respecter. Livraison avant 10h.',
    steps: [
      { id: 'm2s1', label: 'Enlèvement pharmacie', location: 'Plateau', plannedAt: d(-2, 7), done: true },
      { id: 'm2s2', label: 'Livraison clinique Riviera', location: 'Riviera', plannedAt: d(-2, 9), done: true },
    ],
    events: [
      { id: 'm2e1', at: d(-2, 7, 10), label: 'Mission démarrée', by: 'Traoré Issouf' },
      { id: 'm2e2', at: d(-2, 9, 20), label: 'Livraison enregistrée avec preuve', by: 'Traoré Issouf' },
      { id: 'm2e3', at: d(-2, 9, 25), label: 'Mission passée à contrôler', by: 'Système (démo)' },
    ],
  },
  {
    id: 'm3', reference: 'MT-00003', contactId: 'c1', service: 'Distribution hebdomadaire Zone 4', origin: 'Abidjan — Zone 4', destination: 'Grand Abidjan', plannedDate: d(0, 6), vehicleId: 'v1', driverId: 'd1', supervisor: 'K. Assi', status: 'EN_COURS', control: 'NON_REQUIS', revenue: 500000, estimatedCost: 300000, createdAt: d(-5),
    instructions: 'Tournée habituelle, 12 points de vente.',
    steps: [
      { id: 'm3s1', label: 'Chargement dépôt', location: 'Zone 4', plannedAt: d(0, 6), done: true },
      { id: 'm3s2', label: 'Tournée points de vente', location: 'Grand Abidjan', plannedAt: d(0, 8), done: false },
      { id: 'm3s3', label: 'Retour dépôt', location: 'Zone 4', plannedAt: d(0, 16), done: false },
    ],
    events: [
      { id: 'm3e1', at: d(0, 6, 10), label: 'Mission démarrée', by: 'Koffi Jean' },
      { id: 'm3e2', at: d(0, 6, 45), label: 'Chargement confirmé', by: 'Koffi Jean' },
    ],
  },
  {
    id: 'm4', reference: 'MT-00004', contactId: 'c3', service: 'Livraison urgente médicaments', origin: 'Abidjan — Plateau', destination: 'Abidjan — Cocody', plannedDate: d(0, 14), supervisor: 'K. Assi', status: 'PLANIFIEE', control: 'NON_REQUIS', revenue: 120000, estimatedCost: 40000, createdAt: d(-1),
    instructions: 'Affecter un véhicule léger. Livraison avant 16h.',
    steps: [{ id: 'm4s1', label: 'Enlèvement', location: 'Plateau', plannedAt: d(0, 14), done: false }, { id: 'm4s2', label: 'Livraison', location: 'Cocody', plannedAt: d(0, 15), done: false }],
    events: [{ id: 'm4e1', at: d(-1, 11), label: 'Mission planifiée', by: 'K. Assi' }],
  },
  {
    id: 'm5', reference: 'MT-00005', contactId: 'c2', service: 'Transport mobilier bureau', origin: 'Abidjan', destination: 'Bouaké', plannedDate: d(1, 7), vehicleId: 'v2', driverId: 'd2', supervisor: 'K. Assi', status: 'AFFECTEE', control: 'NON_REQUIS', revenue: 480000, estimatedCost: 260000, createdAt: d(-3),
    steps: [{ id: 'm5s1', label: 'Chargement', location: 'Abidjan', plannedAt: d(1, 7), done: false }, { id: 'm5s2', label: 'Livraison', location: 'Bouaké', plannedAt: d(1, 14), done: false }],
    events: [{ id: 'm5e1', at: d(-3, 15), label: 'Mission créée', by: 'K. Assi' }, { id: 'm5e2', at: d(-2, 9), label: 'Ressources affectées (Ford Transit 250, Traoré Issouf)', by: 'K. Assi' }],
  },
  {
    id: 'm6', reference: 'MT-00006', contactId: 'c2', quoteId: 'q5', quoteVersion: 3, service: 'Transport lot complet Abidjan → Bouaké', origin: 'Abidjan', destination: 'Bouaké', plannedDate: d(4, 6), supervisor: 'K. Assi', status: 'A_PLANIFIER', control: 'NON_REQUIS', revenue: 1100000, estimatedCost: 720000, createdAt: d(-14),
    instructions: 'Issue de la cotation COT-00125 V3 acceptée.',
    steps: [{ id: 'm6s1', label: 'Chargement', location: 'Abidjan', done: false }, { id: 'm6s2', label: 'Livraison', location: 'Bouaké', done: false }],
    events: [{ id: 'm6e1', at: d(-14, 10), label: 'Mission créée depuis la cotation COT-00125 (V3)', by: 'A. Koné' }],
  },
  {
    id: 'm7', reference: 'MT-00007', contactId: 'c2', service: 'Entreposage et redistribution', origin: 'Bouaké', destination: 'Bouaké', plannedDate: d(-15, 8), vehicleId: 'v3', driverId: 'd3', supervisor: 'K. Assi', status: 'CONTROLEE', control: 'CONFIRME', invoiceId: 'f2', revenue: 1200000, estimatedCost: 800000, createdAt: d(-25),
    steps: [{ id: 'm7s1', label: 'Réception marchandises', location: 'Bouaké', plannedAt: d(-15, 8), done: true }, { id: 'm7s2', label: 'Redistribution', location: 'Bouaké', plannedAt: d(-14, 8), done: true }],
    events: [
      { id: 'm7e1', at: d(-15, 8, 15), label: 'Mission démarrée', by: 'Soro Adama' },
      { id: 'm7e2', at: d(-14, 17), label: 'Mission terminée, en attente de contrôle', by: 'Soro Adama' },
      { id: 'm7e3', at: d(-12, 10), label: 'Contrôle confirmé', by: 'K. Assi' },
      { id: 'm7e4', at: d(-12, 11), label: 'Facture FAC-000002 émise', by: 'Service finances' },
    ],
  },
  {
    id: 'm8', reference: 'MT-00008', contactId: 'c4', service: 'Transport agroalimentaire (essai)', origin: 'Yamoussoukro', destination: 'Abidjan', plannedDate: d(-1, 5), vehicleId: 'v4', driverId: 'd1', supervisor: 'K. Assi', status: 'BLOQUEE', control: 'NON_REQUIS', revenue: 360000, estimatedCost: 220000, createdAt: d(-7),
    instructions: 'Mission d’essai avant contractualisation.',
    steps: [{ id: 'm8s1', label: 'Chargement', location: 'Yamoussoukro', plannedAt: d(-1, 5), done: false }],
    events: [
      { id: 'm8e1', at: d(-1, 5, 30), label: 'Panne véhicule signalée — incident INC-000001 ouvert', by: 'Koffi Jean' },
      { id: 'm8e2', at: d(-1, 6), label: 'Mission bloquée dans l’attente d’un véhicule de remplacement', by: 'K. Assi' },
    ],
  },
];

/* ------------------------------- Preuves ------------------------------ */

export const PROOFS: Proof[] = [
  { id: 'pr1', missionId: 'm1', type: 'PHOTO', receiverName: 'Gérant point de vente n°12', at: d(-20, 16, 20), comment: 'Dernier point de la tournée livré complet.', fileName: 'livraison-pv12.jpg', result: 'LIVRE' },
  { id: 'pr2', missionId: 'm1', type: 'SIGNATURE', receiverName: 'Chef dépôt SODICI', at: d(-20, 17), comment: 'Retour dépôt validé.', result: 'LIVRE' },
  { id: 'pr3', missionId: 'm2', type: 'PHOTO', receiverName: 'Mme Koffi — Clinique Riviera', at: d(-2, 9, 20), comment: 'Colis remis en mains propres, chaîne du froid respectée.', fileName: 'preuve-clinique.jpg', result: 'LIVRE' },
  { id: 'pr4', missionId: 'm7', type: 'DOCUMENT', receiverName: 'Magasinier Ets Kouamé', at: d(-14, 16, 45), comment: 'Bordereau de redistribution signé.', fileName: 'bordereau-mt7.pdf', result: 'LIVRE_AVEC_RESERVE' },
];

/* ------------------------------ Incidents ----------------------------- */

export const INCIDENTS: Incident[] = [
  {
    id: 'i1', reference: 'INC-000001', missionId: 'm8', type: 'Panne véhicule', priority: 'HAUTE', description: 'Panne moteur du Camion 10T (démo) au départ de Yamoussoukro. Mission bloquée.', status: 'OUVERT', openedAt: d(-1, 5, 30), openedBy: 'Koffi Jean',
    history: [{ at: d(-1, 5, 30), label: 'Incident ouvert par le chauffeur', by: 'Koffi Jean' }, { at: d(-1, 6), label: 'Véhicule déclaré immobilisé', by: 'K. Assi' }],
  },
  {
    id: 'i2', reference: 'INC-000002', missionId: 'm2', type: 'Retard de chargement', priority: 'MOYENNE', description: 'Attente de 45 minutes au chargement, documents client incomplets.', status: 'RESOLU', openedAt: d(-2, 7, 30), openedBy: 'Traoré Issouf',
    history: [{ at: d(-2, 7, 30), label: 'Incident ouvert', by: 'Traoré Issouf' }, { at: d(-2, 8, 15), label: 'Documents régularisés, incident résolu', by: 'K. Assi' }],
  },
  {
    id: 'i3', reference: 'INC-000003', missionId: 'm7', type: 'Réserve à la livraison', priority: 'BASSE', description: 'Un carton endommagé constaté à la redistribution (réserve portée au bordereau).', status: 'EN_TRAITEMENT', openedAt: d(-14, 17), openedBy: 'Soro Adama',
    history: [{ at: d(-14, 17), label: 'Incident ouvert avec réserve', by: 'Soro Adama' }, { at: d(-13, 9), label: 'Demande d’avoir en cours d’analyse', by: 'Service finances' }],
  },
];

/* ------------------------------ Factures ------------------------------ */

export const INVOICES: Invoice[] = [
  { id: 'f1', reference: 'FAC-000001', contactId: 'c1', missionId: 'm1', currency: 'XOF', status: 'EMISE', issuedAt: d(-17), dueDate: d(-2), lines: [{ id: 'f1l1', label: 'Tournée de distribution — 12 points (MT-00001)', quantity: 1, unit: 'forfait', unitPrice: 500000 }] },
  { id: 'f2', reference: 'FAC-000002', contactId: 'c2', missionId: 'm7', currency: 'XOF', status: 'EMISE', issuedAt: d(-12), dueDate: d(-4), lines: [{ id: 'f2l1', label: 'Entreposage et redistribution (MT-00007)', quantity: 1, unit: 'forfait', unitPrice: 1200000 }] },
  { id: 'f3', reference: 'FAC-000003', contactId: 'c2', currency: 'XOF', status: 'EMISE', issuedAt: d(-9), dueDate: d(6), lines: [{ id: 'f3l1', label: 'Prestations logistiques — période précédente', quantity: 1, unit: 'forfait', unitPrice: 800000 }] },
  { id: 'f4', reference: 'FAC-000004', contactId: 'c3', missionId: 'm2', currency: 'XOF', status: 'BROUILLON', lines: [{ id: 'f4l1', label: 'Livraison produits pharmaceutiques (MT-00002)', quantity: 1, unit: 'forfait', unitPrice: 650000 }], notes: 'À émettre après confirmation du contrôle de la mission MT-00002.' },
  { id: 'f5', reference: 'FAC-000005', contactId: 'c3', currency: 'XOF', status: 'EMISE', issuedAt: d(-20), dueDate: d(-5), lines: [{ id: 'f5l1', label: 'Livraisons sensibles — abonnement mensuel', quantity: 1, unit: 'mois', unitPrice: 450000 }] },
  { id: 'f6', reference: 'FAC-000006', contactId: 'c1', currency: 'XOF', status: 'EMISE', issuedAt: d(-5), dueDate: d(13), lines: [{ id: 'f6l1', label: 'Distribution hebdomadaire — semaine précédente', quantity: 1, unit: 'forfait', unitPrice: 950000 }] },
];

/* ------------------------------ Paiements ----------------------------- */
// Cas de démonstration obligatoire : FAC-000001 de 500 000 XOF payée en
// deux fois (300 000 puis 200 000).

export const PAYMENTS: Payment[] = [
  { id: 'p1', reference: 'PAY-000001', contactId: 'c1', amount: 300000, currency: 'XOF', receivedAt: d(-10), method: 'VIREMENT', account: 'Banque principale', status: 'RECU', allocations: [{ invoiceId: 'f1', amount: 300000 }] },
  { id: 'p2', reference: 'PAY-000002', contactId: 'c1', amount: 200000, currency: 'XOF', receivedAt: d(-3), method: 'MOBILE_MONEY', account: 'Mobile money société', status: 'RECU', allocations: [{ invoiceId: 'f1', amount: 200000 }] },
  { id: 'p3', reference: 'PAY-000003', contactId: 'c2', amount: 500000, currency: 'XOF', receivedAt: d(-6), method: 'VIREMENT', account: 'Banque principale', status: 'RECU', allocations: [{ invoiceId: 'f3', amount: 500000 }] },
  { id: 'p4', reference: 'PAY-000004', contactId: 'c3', amount: 450000, currency: 'XOF', receivedAt: d(-8), method: 'ESPECES', account: 'Caisse Abidjan', status: 'RECU', allocations: [{ invoiceId: 'f5', amount: 450000 }] },
  { id: 'p5', reference: 'PAY-000005', contactId: 'c2', amount: 150000, currency: 'XOF', receivedAt: d(-1), method: 'ESPECES', account: 'Caisse Abidjan', status: 'RECU', allocations: [] },
];

/* ------------------------------ Dépenses ------------------------------ */

export const EXPENSES: Expense[] = [
  { id: 'e1', reference: 'DEP-000001', missionId: 'm1', category: 'Carburant', description: 'Plein gasoil tournée MT-00001', amount: 180000, currency: 'XOF', agent: 'Traoré Issouf', date: d(-20), receiptName: 'recu-carburant-mt1.jpg', status: 'VALIDEE' },
  { id: 'e2', reference: 'DEP-000002', missionId: 'm1', category: 'Péage', description: 'Péages tournée Grand Abidjan', amount: 40000, currency: 'XOF', agent: 'Traoré Issouf', date: d(-20), status: 'VALIDEE' },
  { id: 'e3', reference: 'DEP-000003', missionId: 'm1', category: 'Manutention', description: 'Équipe de manutention — 12 points', amount: 100000, currency: 'XOF', agent: 'K. Assi', date: d(-19), receiptName: 'facture-manutention.pdf', status: 'VALIDEE' },
  { id: 'e4', reference: 'DEP-000004', missionId: 'm2', category: 'Carburant', description: 'Carburant livraison Plateau → Riviera', amount: 90000, currency: 'XOF', agent: 'Traoré Issouf', date: d(-2), receiptName: 'recu-carburant-mt2.jpg', status: 'SOUMISE' },
  { id: 'e5', reference: 'DEP-000005', missionId: 'm2', category: 'Manutention', description: 'Manutention colis sensibles', amount: 60000, currency: 'XOF', agent: 'Traoré Issouf', date: d(-2), status: 'SOUMISE' },
  { id: 'e6', reference: 'DEP-000006', missionId: 'm3', category: 'Carburant', description: 'Avance carburant tournée du jour', amount: 70000, currency: 'XOF', agent: 'Koffi Jean', date: d(0, 6), status: 'SOUMISE' },
  { id: 'e7', reference: 'DEP-000007', missionId: 'm7', category: 'Divers', description: 'Frais de stationnement non justifiés', amount: 25000, currency: 'XOF', agent: 'Soro Adama', date: d(-14), status: 'REJETEE' },
  { id: 'e8', reference: 'DEP-000008', missionId: 'm7', category: 'Manutention', description: 'Équipe réception et redistribution', amount: 350000, currency: 'XOF', agent: 'K. Assi', date: d(-14), receiptName: 'facture-equipe.pdf', status: 'VALIDEE' },
];

/* ------------------------------ Activités ----------------------------- */

export const ACTIVITIES: Activity[] = [
  { id: 'a1', at: d(0, 6, 10), label: 'Mission MT-00003 démarrée par Koffi Jean', by: 'Koffi Jean', entity: { kind: 'mission', id: 'm3' } },
  { id: 'a2', at: d(-1, 5, 30), label: 'Incident INC-000001 ouvert (panne véhicule) sur MT-00008', by: 'Koffi Jean', entity: { kind: 'incident', id: 'i1' } },
  { id: 'a3', at: d(-1, 11), label: 'Mission MT-00004 planifiée pour aujourd’hui', by: 'K. Assi', entity: { kind: 'mission', id: 'm4' } },
  { id: 'a4', at: d(-1, 14), label: 'Paiement PAY-000005 reçu (150 000 F CFA, non affecté)', by: 'Service finances', entity: { kind: 'payment', id: 'p5' } },
  { id: 'a5', at: d(-2, 9, 25), label: 'Mission MT-00002 terminée, en attente de contrôle', by: 'Traoré Issouf', entity: { kind: 'mission', id: 'm2' } },
  { id: 'a6', at: d(-2, 16), label: 'Prospect LEAD-2026-0001 créé depuis le formulaire web', by: 'Système (démo)', entity: { kind: 'lead', id: 'l1' } },
  { id: 'a7', at: d(-3, 10), label: 'Paiement PAY-000002 affecté à FAC-000001 (solde à zéro)', by: 'Service finances', entity: { kind: 'payment', id: 'p2' } },
  { id: 'a8', at: d(-3, 11), label: 'Cotation COT-00123 soumise à validation', by: 'A. Koné', entity: { kind: 'quote', id: 'q3' } },
  { id: 'a9', at: d(-12, 11), label: 'Facture FAC-000002 émise pour MT-00007', by: 'Service finances', entity: { kind: 'invoice', id: 'f2' } },
  { id: 'a10', at: d(-15, 10), label: 'Nouvelle version V3 créée pour la cotation COT-00125', by: 'A. Koné', entity: { kind: 'quote', id: 'q5' } },
];

/* ---------------------------- Notifications --------------------------- */

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', at: d(0, 6, 15), category: 'OPERATIONS', label: 'Mission MT-00003 démarrée — tournée Zone 4 en cours.', href: '/missions/m3', read: false },
  { id: 'n2', at: d(-1, 5, 35), category: 'OPERATIONS', label: 'Incident critique : panne véhicule sur MT-00008 (INC-000001).', href: '/incidents', read: false },
  { id: 'n3', at: d(-1, 14, 5), category: 'FINANCES', label: 'Paiement de 150 000 F CFA reçu, en attente d’affectation (PAY-000005).', href: '/paiements', read: false },
  { id: 'n4', at: d(-2, 9, 30), category: 'OPERATIONS', label: 'Mission MT-00002 terminée : contrôle requis avant facturation.', href: '/controle', read: false },
  { id: 'n5', at: d(-3, 11, 5), category: 'COMMERCIAL', label: 'Cotation COT-00123 en attente de validation.', href: '/cotations/q3', read: true },
  { id: 'n6', at: d(-4, 9), category: 'FINANCES', label: 'Facture FAC-000002 arrivée à échéance avec solde impayé.', href: '/factures/f2', read: true },
];
