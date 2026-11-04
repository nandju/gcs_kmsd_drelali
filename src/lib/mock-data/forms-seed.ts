import type { Platform } from '@/modules/core/types';
import type { AuditEvent } from '@/modules/core/types';
import type {
  Form,
  FormField,
  FormSchema,
  FormSubmission,
} from '@/modules/forms/types';

/* ------------------------------------------------------------------ */
/* Données de démonstration du système de formulaires.                 */
/* Fictives — aucune donnée réelle, aucun envoi serveur.               */
/* ------------------------------------------------------------------ */

const f = (partial: Partial<FormField> & Pick<FormField, 'id' | 'type' | 'label'>): FormField => ({
  required: false,
  enabled: true,
  ...partial,
});

/* ------------------------- Formulaire GCS --------------------------- */

const GCS_SCHEMA: FormSchema = {
  sections: [
    {
      id: 'gcs-s1',
      title: 'Vos coordonnées',
      fields: [
        f({ id: 'gcs-nom', type: 'text', label: 'Nom', required: true, placeholder: 'Nom ou société', validation: { maxLength: 120 } }),
        f({ id: 'gcs-tel', type: 'phone', label: 'Téléphone', required: true, placeholder: '+225 …' }),
        f({ id: 'gcs-wa', type: 'phone', label: 'WhatsApp' }),
        f({ id: 'gcs-email', type: 'email', label: 'E-mail (facultatif)' }),
      ],
    },
    {
      id: 'gcs-s2',
      title: 'Votre besoin',
      fields: [
        f({
          id: 'gcs-service',
          type: 'select',
          label: 'Service souhaité',
          required: true,
          options: [
            'Transport de marchandises',
            'Déménagement résidentiel',
            'Distribution de produits',
            'Entreposage',
            'Transport express / urgent',
            'Autre service',
          ],
        }),
        f({ id: 'gcs-date', type: 'date', label: 'Date souhaitée' }),
        f({ id: 'gcs-origine', type: 'text', label: 'Origine', placeholder: 'ex. Abidjan — Zone 4' }),
        f({ id: 'gcs-destination', type: 'text', label: 'Destination' }),
        f({ id: 'gcs-desc', type: 'textarea', label: 'Description des marchandises ou du service', required: true, placeholder: 'Décrivez ce que vous souhaitez transporter ou le service attendu…', validation: { minLength: 10, maxLength: 2000 } }),
        f({ id: 'gcs-volume', type: 'text', label: 'Quantité ou volume (facultatif)', placeholder: 'ex. 2 palettes, 12 cartons' }),
        f({ id: 'gcs-photo', type: 'image', label: 'Photo (facultative)', description: 'Simulée en démonstration — nom de fichier uniquement.', validation: { accept: '.jpg,.jpeg,.png' } }),
        f({ id: 'gcs-comment', type: 'textarea', label: 'Commentaire' }),
      ],
    },
  ],
};

const GCS_FORM: Form = {
  id: 'form-gcs-demande',
  org: 'GCS',
  name: 'Demande de prestation GCS',
  slug: 'demande-de-prestation',
  purpose: 'Formulaire public de demande de prestation logistique.',
  kind: 'DEVIS',
  status: 'PUBLIE',
  draft: GCS_SCHEMA,
  versions: [
    {
      version: 1,
      schema: GCS_SCHEMA,
      publishedAt: '2026-10-15T09:00:00.000Z',
      publishedBy: 'Direction (démo)',
    },
  ],
  createdAt: '2026-10-10T09:00:00.000Z',
  updatedAt: '2026-10-15T09:00:00.000Z',
};

/* ------------------------ Formulaires KIMEXDI ----------------------- */

const KIMEXDI_DEVIS_SCHEMA: FormSchema = {
  sections: [
    {
      id: 'kdx-s1',
      title: 'Vos coordonnées',
      fields: [
        f({ id: 'kdx-nom', type: 'text', label: 'Nom complet', required: true, validation: { maxLength: 120 } }),
        f({ id: 'kdx-tel', type: 'phone', label: 'Téléphone', required: true }),
        f({ id: 'kdx-wa', type: 'phone', label: 'WhatsApp' }),
        f({ id: 'kdx-email', type: 'email', label: 'E-mail (facultatif)' }),
      ],
    },
    {
      id: 'kdx-s2',
      title: 'Service demandé',
      fields: [
        f({
          id: 'kdx-service',
          type: 'radio',
          label: 'Service souhaité',
          required: true,
          options: ['Groupage', 'Transport', 'Import-export', 'Entreposage', 'Autre service'],
        }),
        f({
          id: 'kdx-service-autre',
          type: 'text',
          label: 'Précisez le service',
          required: true,
          conditions: [{ fieldId: 'kdx-service', operator: 'equals', value: 'Autre service' }],
        }),
        f({
          id: 'kdx-info-groupage',
          type: 'info',
          label: 'Demande de groupage',
          description: 'Indiquez la nature, la quantité et le volume approximatif de vos marchandises afin que nous puissions étudier leur intégration dans un départ groupé.',
          conditions: [{ fieldId: 'kdx-service', operator: 'equals', value: 'Groupage' }],
        }),
        f({
          id: 'kdx-origine',
          type: 'text',
          label: 'Origine',
          placeholder: 'Ville ou adresse de départ',
          conditions: [{ fieldId: 'kdx-service', operator: 'in', value: 'Transport' }],
        }),
        f({
          id: 'kdx-destination',
          type: 'text',
          label: 'Destination',
          conditions: [{ fieldId: 'kdx-service', operator: 'in', value: 'Transport' }],
        }),
      ],
    },
    {
      id: 'kdx-s3',
      title: 'Marchandises',
      fields: [
        f({ id: 'kdx-nature', type: 'text', label: 'Nature des marchandises', required: true }),
        f({ id: 'kdx-desc', type: 'textarea', label: 'Description', required: true, validation: { minLength: 10, maxLength: 2000 } }),
        f({ id: 'kdx-quantite', type: 'number', label: 'Quantité', validation: { min: 1 } }),
        f({ id: 'kdx-poids', type: 'decimal', label: 'Poids estimé (kg)', validation: { min: 0 } }),
        f({ id: 'kdx-volume', type: 'decimal', label: 'Volume estimé (m³)', validation: { min: 0 } }),
        f({ id: 'kdx-date', type: 'date', label: 'Date souhaitée' }),
        f({ id: 'kdx-pj', type: 'file', label: 'Pièces jointes (facultatives)', description: 'Simulées en démonstration.', validation: { accept: '.pdf,.jpg,.jpeg,.png' } }),
        f({ id: 'kdx-comment', type: 'textarea', label: 'Commentaires' }),
      ],
    },
  ],
};

const KIMEXDI_DEVIS_FORM: Form = {
  id: 'form-kdx-devis',
  org: 'KIMEXDI',
  name: 'Demande de devis KIMEXDI',
  slug: 'demande-de-devis',
  purpose: 'Formulaire public de demande de devis (logistique, groupage, transport).',
  kind: 'DEVIS',
  status: 'PUBLIE',
  draft: KIMEXDI_DEVIS_SCHEMA,
  versions: [
    {
      version: 1,
      schema: KIMEXDI_DEVIS_SCHEMA,
      publishedAt: '2026-10-20T10:00:00.000Z',
      publishedBy: 'Direction (démo)',
    },
  ],
  createdAt: '2026-10-18T10:00:00.000Z',
  updatedAt: '2026-10-20T10:00:00.000Z',
};

const KIMEXDI_CONTACT_FORM: Form = {
  id: 'form-kdx-contact',
  org: 'KIMEXDI',
  name: 'Contact KIMEXDI',
  slug: 'contact',
  purpose: 'Formulaire de contact général du site public KIMEXDI.',
  kind: 'CONTACT',
  status: 'BROUILLON',
  draft: {
    sections: [
      {
        id: 'kdx-c1',
        fields: [
          f({ id: 'kdx-c-nom', type: 'text', label: 'Nom complet', required: true }),
          f({ id: 'kdx-c-email', type: 'email', label: 'E-mail', required: true }),
          f({ id: 'kdx-c-sujet', type: 'text', label: 'Sujet', required: true }),
          f({ id: 'kdx-c-msg', type: 'textarea', label: 'Message', required: true, validation: { minLength: 10 } }),
        ],
      },
    ],
  },
  versions: [],
  createdAt: '2026-10-22T10:00:00.000Z',
  updatedAt: '2026-10-22T10:00:00.000Z',
};

/* ------------------------ Soumissions de démo ----------------------- */

const SUBMISSIONS: FormSubmission[] = [
  {
    id: 'sub-demo-1',
    reference: 'DEM-000001',
    org: 'KIMEXDI',
    formId: KIMEXDI_DEVIS_FORM.id,
    formName: KIMEXDI_DEVIS_FORM.name,
    formSlug: KIMEXDI_DEVIS_FORM.slug,
    formVersion: 1,
    schema: KIMEXDI_DEVIS_SCHEMA,
    answers: {
      'kdx-nom': 'Marie-Claude Bélanger',
      'kdx-tel': '+1 514 000 0000',
      'kdx-service': 'Groupage',
      'kdx-nature': 'Effets personnels et cartons divers',
      'kdx-desc': 'Environ 15 cartons de biens personnels à expédier vers Abidjan.',
      'kdx-quantite': '15',
      'kdx-volume': '2.5',
      'kdx-date': '2026-12-01',
    },
    attachments: [],
    status: 'NOUVELLE',
    submittedAt: '2026-11-02T14:32:00.000Z',
    history: [
      { at: '2026-11-02T14:32:00.000Z', label: 'Soumission reçue', by: 'Site public' },
    ],
  },
  {
    id: 'sub-demo-2',
    reference: 'DEM-000002',
    org: 'GCS',
    formId: GCS_FORM.id,
    formName: GCS_FORM.name,
    formSlug: GCS_FORM.slug,
    formVersion: 1,
    schema: GCS_SCHEMA,
    answers: {
      'gcs-nom': 'Koffi Yao',
      'gcs-tel': '+225 07 00 00 00 00',
      'gcs-service': 'Transport de marchandises',
      'gcs-origine': 'Abidjan — Treichville',
      'gcs-destination': 'Bouaké',
      'gcs-desc': 'Transport de 30 sacs de denrées alimentaires.',
      'gcs-date': '2026-11-10',
    },
    attachments: [],
    status: 'EN_TRAITEMENT',
    submittedAt: '2026-11-03T09:12:00.000Z',
    history: [
      { at: '2026-11-03T09:12:00.000Z', label: 'Soumission reçue', by: 'Site public' },
      { at: '2026-11-03T11:05:00.000Z', label: 'Statut : En traitement', by: 'Direction (démo)' },
    ],
  },
];

const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'evt-1', at: '2026-10-15T09:00:00.000Z', org: 'GCS', actor: 'Direction (démo)', type: 'FORM_VERSION_PUBLISHED', entityKind: 'form', entityId: GCS_FORM.id, label: 'Version 1 publiée — Demande de prestation GCS' },
  { id: 'evt-2', at: '2026-10-20T10:00:00.000Z', org: 'KIMEXDI', actor: 'Direction (démo)', type: 'FORM_VERSION_PUBLISHED', entityKind: 'form', entityId: KIMEXDI_DEVIS_FORM.id, label: 'Version 1 publiée — Demande de devis KIMEXDI' },
  { id: 'evt-3', at: '2026-11-02T14:32:00.000Z', org: 'KIMEXDI', actor: 'Site public', type: 'SUBMISSION_RECEIVED', entityKind: 'submission', entityId: 'sub-demo-1', label: 'Soumission DEM-000001 reçue — Demande de devis KIMEXDI' },
  { id: 'evt-4', at: '2026-11-03T09:12:00.000Z', org: 'GCS', actor: 'Site public', type: 'SUBMISSION_RECEIVED', entityKind: 'submission', entityId: 'sub-demo-2', label: 'Soumission DEM-000002 reçue — Demande de prestation GCS' },
];

/* ------------------------------ Exports ----------------------------- */

export const PLATFORMS: Platform[] = [
  {
    id: 'plt-gcs',
    org: 'GCS',
    name: 'Site public GCS',
    basePath: '/gcs',
    status: 'ACTIVE',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'plt-kdx',
    org: 'KIMEXDI',
    name: 'Site public KIMEXDI',
    basePath: '/kimexdi',
    status: 'ACTIVE',
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  },
];

export const SEED_FORMS: Form[] = [GCS_FORM, KIMEXDI_DEVIS_FORM, KIMEXDI_CONTACT_FORM];
export const SEED_SUBMISSIONS: FormSubmission[] = SUBMISSIONS;
export const SEED_AUDIT_EVENTS: AuditEvent[] = AUDIT_EVENTS;
