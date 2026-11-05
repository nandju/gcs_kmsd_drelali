import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { KIMEXDI } from '@/config/kimexdi';
import { CtaButton, Eyebrow, Lead, Section } from '@/components/kimexdi/ui';

export const metadata: Metadata = { title: 'Services' };

const DETAILS: Record<string, { points: string[]; cta: string }> = {
  logistique: {
    points: [
      'Coordination des flux de marchandises',
      'Réception, préparation et expédition',
      'Suivi des opérations',
    ],
    cta: 'Décrire mon besoin logistique',
  },
  'import-export': {
    points: [
      'Opérations d’importation depuis l’étranger',
      'Opérations d’exportation depuis le Canada',
      'Accompagnement documentaire',
    ],
    cta: 'Demander un accompagnement',
  },
  transport: {
    points: [
      'Transport de marchandises',
      'Solutions adaptées aux volumes et échéances',
      'Coordination des départs',
    ],
    cta: 'Demander un transport',
  },
  entreposage: {
    points: [
      'Conservation de marchandises',
      'Entreposage entre deux opérations',
      'Accès coordonné à vos biens',
    ],
    cta: 'Demander un entreposage',
  },
  groupage: {
    points: [
      'Regroupement de marchandises de plusieurs expéditeurs',
      'Mutualisation des coûts de transport',
      'Adapté aux volumes partiels et effets personnels',
    ],
    cta: 'Demander un devis groupage',
  },
  'services-locaux': {
    points: [
      'Prestations logistiques de proximité au Canada',
      'Manutention et préparation',
      'Coordination locale de vos opérations',
    ],
    cta: 'Décrire mon besoin local',
  },
};

export default function ServicesPage() {
  return (
    <main>
      <section className="border-b border-[var(--kimexdi-border)] bg-[var(--kimexdi-surface)] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Eyebrow>Nos activités</Eyebrow>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--kimexdi-navy)] sm:text-4xl">
            Services logistiques au Canada
          </h1>
          <Lead>
            KIMEXDI couvre la chaîne logistique de bout en bout : transport,
            entreposage, import-export, groupage et services de proximité.
          </Lead>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {KIMEXDI.services.map((s) => {
            const d = DETAILS[s.id];
            return (
              <article
                key={s.id}
                className="flex flex-col overflow-hidden rounded-xl border border-[var(--kimexdi-border)] bg-white"
              >
                <div className="relative aspect-[16/8] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                <h2 className="text-lg font-semibold text-[var(--kimexdi-navy)]">
                  {s.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--kimexdi-slate)]">
                  {s.description}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {d?.points.map((p) => (
                    <li key={p} className="flex gap-2 text-sm text-[var(--kimexdi-gray)]">
                      <span className="text-[var(--kimexdi-blue)]">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  <Link
                    href="/kimexdi/devis"
                    className="text-sm font-semibold text-[var(--kimexdi-blue)] hover:underline"
                  >
                    {d?.cta ?? 'Demander un devis'} →
                  </Link>
                </div>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <section className="bg-[var(--kimexdi-navy)] py-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 sm:px-6">
          <h2 className="text-xl font-semibold">
            Un besoin qui ne rentre pas dans ces catégories ?
          </h2>
          <CtaButton href="/kimexdi/contact" secondary>
            Nous contacter
          </CtaButton>
        </div>
      </section>
    </main>
  );
}
