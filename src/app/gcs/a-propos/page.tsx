import type { Metadata } from 'next';
import Image from 'next/image';
import { GCS_SITE } from '@/config/gcs-site';
import { GcsEyebrow, GcsLead, GcsTitle } from '@/components/gcs/ui';

export const metadata: Metadata = { title: 'À propos' };

export default function GcsAboutPage() {
  return (
    <main>
      <section className="border-b border-[var(--gcs-line)] bg-[var(--gcs-surface)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <GcsEyebrow>À propos</GcsEyebrow>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--gcs-navy-950)] sm:text-[2.6rem]">
            GCS — {GCS_SITE.country}
          </h1>
          <GcsLead>{GCS_SITE.description}</GcsLead>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[1.75rem] shadow-xl shadow-[var(--gcs-navy-950)]/15">
            <Image
              src="/images/gcs/71414.jpg"
              alt="Équipe GCS préparant des colis en entrepôt"
              width={800}
              height={534}
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
          <div>
            <GcsTitle className="text-2xl sm:text-3xl">Une plateforme opérationnelle</GcsTitle>
            <p className="mt-5 leading-relaxed text-[var(--gcs-ink-soft)]">
              GCS fait partie d’un ensemble d’organisations gérées de manière
              centralisée : chaque demande reçue sur ce site est traitée dans le
              même espace de pilotage que les opérations, de la cotation à la
              preuve de livraison.
            </p>
            <p className="mt-4 leading-relaxed text-[var(--gcs-ink-soft)]">
              Notre approche : une seule chaîne de responsabilité, un
              interlocuteur unique, et une visibilité complète sur chaque étape.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--gcs-surface)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <GcsTitle className="text-2xl sm:text-3xl">Nos valeurs</GcsTitle>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {['Rigueur', 'Transparence', 'Réactivité', 'Responsabilité'].map((v) => (
              <div key={v} className="rounded-2xl border border-[var(--gcs-line)] bg-white p-6 text-center">
                <p className="text-base font-extrabold text-[var(--gcs-navy-950)]">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
