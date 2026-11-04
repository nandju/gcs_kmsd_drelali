import type { Metadata } from 'next';
import { PublicForm } from '@/components/forms/public-form';
import { GcsEyebrow } from '@/components/gcs/ui';

export const metadata: Metadata = { title: 'Demande de devis' };

export default function GcsDevisPage() {
  return (
    <main className="bg-[var(--gcs-surface)] py-14 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <header className="mb-8 text-center">
          <GcsEyebrow>Demande de devis</GcsEyebrow>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[var(--gcs-navy-950)] sm:text-3xl">
            Décrivez votre expédition
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--gcs-ink-soft)]">
            Renseignez les informations ci-dessous. Notre équipe étudie chaque
            demande et vous recontacte avec une cotation.
          </p>
        </header>

        <div className="rounded-2xl border border-[var(--gcs-line)] bg-white p-6 shadow-theme-xs sm:p-8">
          <PublicForm org="GCS" kind="DEVIS" theme="gcs" />
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--gcs-ink-soft)]">
          Ce formulaire est configurable par nos équipes — les champs affichés
          correspondent à la version publiée la plus récente.
        </p>
      </div>
    </main>
  );
}
