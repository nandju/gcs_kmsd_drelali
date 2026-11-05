import type { Metadata } from 'next';
import Image from 'next/image';
import { KIMEXDI } from '@/config/kimexdi';
import { Eyebrow, Lead, Section, SectionTitle } from '@/components/kimexdi/ui';

export const metadata: Metadata = { title: 'À propos' };

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-[var(--kimexdi-border)] bg-[var(--kimexdi-surface)] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Eyebrow>À propos</Eyebrow>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--kimexdi-navy)] sm:text-4xl">
            KIMEXDI / KMSD Canada
          </h1>
          <Lead>
            Une entité dédiée à la logistique, à l’import-export et au groupage,
            implantée au Canada.
          </Lead>
        </div>
      </section>

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-[var(--kimexdi-border)] shadow-theme-sm">
            <Image
              src={KIMEXDI.images.about}
              alt={KIMEXDI.images.aboutAlt}
              width={800}
              height={1000}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <SectionTitle>Présentation</SectionTitle>
            <Lead>
              KIMEXDI est une plateforme opérationnelle orientée logistique et
              commerce international. Elle fait partie d’un ensemble
              d’organisations gérées de manière centralisée, chacune avec sa
              propre identité et son périmètre d’activité.
            </Lead>
            <p className="mt-4 rounded-lg border border-[var(--kimexdi-border)] bg-[var(--kimexdi-surface)] p-4 text-xs text-[var(--kimexdi-slate)]">
              {KIMEXDI.legalNote}
            </p>
            <h3 className="mt-8 text-lg font-semibold text-[var(--kimexdi-navy)]">
              Notre mission
            </h3>
            <p className="mt-2 text-base leading-relaxed text-[var(--kimexdi-slate)]">
              Coordonner les flux de marchandises de nos clients — transport,
              entreposage, import-export et groupage — avec une approche claire,
              mesurée et fiable.
            </p>
          </div>
        </div>
      </Section>

      <Section surface>
        <SectionTitle>Notre approche opérationnelle</SectionTitle>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: 'Étude avant promesse',
              text: 'Chaque demande est analysée avant toute proposition : nous ne communiquons que des modalités réellement réalisables.',
            },
            {
              title: 'Coordination centralisée',
              text: 'Vos demandes sont traitées dans un système de gestion unique, assurant suivi et traçabilité.',
            },
            {
              title: 'Communication directe',
              text: 'Un interlocuteur vous recontacte personnellement pour préciser et suivre votre dossier.',
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-[var(--kimexdi-border)] bg-white p-6"
            >
              <h3 className="text-sm font-semibold text-[var(--kimexdi-navy)]">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--kimexdi-gray)]">
                {v.text}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionTitle>Nos valeurs</SectionTitle>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {['Rigueur', 'Transparence', 'Fiabilité', 'Proximité'].map((v) => (
            <div
              key={v}
              className="rounded-xl border border-[var(--kimexdi-border)] bg-white p-6 text-center"
            >
              <p className="text-base font-semibold text-[var(--kimexdi-navy)]">{v}</p>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
