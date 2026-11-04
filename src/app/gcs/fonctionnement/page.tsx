import type { Metadata } from 'next';
import { GCS_SITE } from '@/config/gcs-site';
import { GcsCta, GcsEyebrow, GcsLead } from '@/components/gcs/ui';

export const metadata: Metadata = { title: 'Fonctionnement' };

export default function GcsProcessPage() {
  return (
    <main>
      <section className="border-b border-[var(--gcs-line)] bg-[var(--gcs-surface)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <GcsEyebrow>Comment ça marche</GcsEyebrow>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--gcs-navy-950)] sm:text-[2.6rem]">
            De la demande à la marge : une chaîne unique
          </h1>
          <GcsLead>
            Chaque expédition suit le même parcours dans notre système de
            gestion centralisé — vous gardez la visibilité à chaque étape.
          </GcsLead>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <ol className="relative space-y-8 border-l-2 border-[var(--gcs-line)] pl-8">
            {GCS_SITE.process.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="absolute -left-[41px] flex size-8 items-center justify-center rounded-full bg-[var(--gcs-accent)] text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <h2 className="text-base font-extrabold text-[var(--gcs-navy-950)]">{step.title}</h2>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--gcs-ink-soft)]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-12 rounded-2xl border border-[var(--gcs-line)] bg-[var(--gcs-accent-light)] p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-[var(--gcs-navy-950)]">Prêt à démarrer ?</h2>
            <p className="mt-2 text-sm text-[var(--gcs-ink-soft)]">
              Décrivez votre expédition : notre équipe étudie votre demande et
              vous recontacte avec une cotation.
            </p>
            <div className="mt-5">
              <GcsCta href={GCS_SITE.quoteHref}>Demander un devis</GcsCta>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
