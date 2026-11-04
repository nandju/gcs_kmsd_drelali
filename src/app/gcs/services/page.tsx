import type { Metadata } from 'next';
import Image from 'next/image';
import { GCS_SITE } from '@/config/gcs-site';
import { GcsCta, GcsEyebrow, GcsLead } from '@/components/gcs/ui';

export const metadata: Metadata = { title: 'Nos services' };

export default function GcsServicesPage() {
  return (
    <main>
      <section className="border-b border-[var(--gcs-line)] bg-[var(--gcs-surface)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <GcsEyebrow>Nos services</GcsEyebrow>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--gcs-navy-950)] sm:text-[2.6rem]">
            Des solutions adaptées à vos besoins d’expédition
          </h1>
          <GcsLead>
            Transport, gestion des colis, livraison à domicile et suivi des
            opérations : GCS couvre la chaîne complète de vos expéditions.
          </GcsLead>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
          {GCS_SITE.services.map((s, i) => (
            <article
              key={s.id}
              className={`grid items-center gap-8 overflow-hidden rounded-2xl border border-[var(--gcs-line)] bg-white md:grid-cols-2 ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6 sm:p-10">
                <p className="text-sm font-extrabold text-[var(--gcs-accent)]">{s.index}</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--gcs-navy-950)]">
                  {s.title}
                </h2>
                <p className="mt-3 leading-relaxed text-[var(--gcs-ink-soft)]">{s.description}</p>
                <div className="mt-6">
                  <GcsCta href={GCS_SITE.quoteHref} outline>
                    Demander un devis
                  </GcsCta>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
