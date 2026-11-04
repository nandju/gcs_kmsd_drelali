import type { Metadata } from 'next';
import { GCS_SITE } from '@/config/gcs-site';
import { PublicForm } from '@/components/forms/public-form';
import { GcsEyebrow, GcsLead } from '@/components/gcs/ui';

export const metadata: Metadata = { title: 'Contact' };

export default function GcsContactPage() {
  return (
    <main className="bg-[var(--gcs-surface)] py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <header className="mb-10 text-center">
          <GcsEyebrow>Contact</GcsEyebrow>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--gcs-navy-950)] sm:text-4xl">
            Nous écrire
          </h1>
          <GcsLead>
            Une question, un projet d’expédition ? Utilisez le formulaire
            ci-dessous ou consultez nos coordonnées.
          </GcsLead>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-[var(--gcs-line)] bg-white p-6 lg:col-span-1">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-[var(--gcs-navy-950)]">
              Coordonnées
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium text-[var(--gcs-ink-soft)]">E-mail</dt>
                <dd className="mt-0.5 text-[var(--gcs-ink)]">{GCS_SITE.contact.email || 'À compléter'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--gcs-ink-soft)]">Téléphone</dt>
                <dd className="mt-0.5 text-[var(--gcs-ink)]">{GCS_SITE.contact.phone || 'À compléter'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--gcs-ink-soft)]">Adresse</dt>
                <dd className="mt-0.5 text-[var(--gcs-ink)]">{GCS_SITE.contact.address || 'À compléter'}</dd>
              </div>
            </dl>
            <p className="mt-5 rounded-lg bg-[var(--gcs-surface)] p-3 text-xs text-[var(--gcs-ink-soft)]">
              {GCS_SITE.contact.note}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--gcs-line)] bg-white p-6 sm:p-8 lg:col-span-2">
            <h2 className="mb-5 text-base font-extrabold text-[var(--gcs-navy-950)]">
              Formulaire de contact
            </h2>
            <PublicForm
              org="GCS"
              kind="CONTACT"
              theme="gcs"
              submitLabel="Envoyer le message"
              fallback={
                <div className="rounded-xl border border-dashed border-[var(--gcs-line)] bg-[var(--gcs-surface)] px-6 py-10 text-center">
                  <p className="text-sm font-bold text-[var(--gcs-navy-950)]">
                    Formulaire de contact en préparation
                  </p>
                  <p className="mt-1 text-sm text-[var(--gcs-ink-soft)]">
                    En attendant sa publication, utilisez la page « Demande de
                    devis » pour nous transmettre votre besoin.
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
