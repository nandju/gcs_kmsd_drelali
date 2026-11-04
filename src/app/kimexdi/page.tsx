import Link from 'next/link';
import { KIMEXDI } from '@/config/kimexdi';
import { CtaButton, Eyebrow, Lead, Section, SectionTitle } from '@/components/kimexdi/ui';

const ETAPES = [
  {
    n: '01',
    title: 'Soumission de la demande',
    text: 'Décrivez votre besoin via notre formulaire de demande de devis : nature des marchandises, volumes, échéances.',
  },
  {
    n: '02',
    title: 'Étude de votre dossier',
    text: 'Notre équipe analyse votre demande et vous recontacte pour préciser les modalités.',
  },
  {
    n: '03',
    title: 'Proposition',
    text: 'Vous recevez une proposition adaptée à votre besoin logistique.',
  },
  {
    n: '04',
    title: 'Suivi opérationnel',
    text: 'Après validation, vos opérations sont coordonnées et suivies par nos équipes.',
  },
];

const ENGAGEMENTS = [
  {
    title: 'Approche rigoureuse',
    text: 'Chaque demande est étudiée individuellement, sans promesse commerciale excessive.',
  },
  {
    title: 'Interlocuteur dédié',
    text: 'Un point de contact unique pour le suivi de vos opérations.',
  },
  {
    title: 'Transparence',
    text: 'Des informations claires sur les étapes, les modalités et les limites de chaque prestation.',
  },
  {
    title: 'Ancrage canadien',
    text: 'Une implantation au Canada pour coordonner vos flux locaux et internationaux.',
  },
];

const FAQ = [
  {
    q: 'Quels services propose KIMEXDI ?',
    a: 'KIMEXDI intervient dans la logistique, l’import-export, le transport, l’entreposage, le groupage et les services logistiques locaux au Canada.',
  },
  {
    q: 'Comment demander un devis ?',
    a: 'Utilisez le formulaire « Demander un devis » : décrivez votre besoin, la nature et le volume de vos marchandises. Notre équipe vous recontacte pour étudier votre demande.',
  },
  {
    q: 'Qu’est-ce que le groupage ?',
    a: 'Le groupage consiste à regrouper les marchandises de plusieurs expéditeurs dans un même départ afin de mutualiser les coûts de transport.',
  },
  {
    q: 'Dans quelles zones intervenez-vous ?',
    a: 'Nos services locaux sont basés au Canada. Les destinations desservies sont précisées lors de l’étude de votre demande.',
  },
];

export default function KimexdiHomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-[var(--kimexdi-border)] bg-[var(--kimexdi-navy)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
            KIMEXDI · KMSD Canada
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Vos opérations logistiques au Canada, coordonnées avec rigueur.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            Logistique, import-export, transport, entreposage et groupage :
            KIMEXDI organise vos flux de marchandises avec une approche
            professionnelle et transparente.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/kimexdi/devis"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[var(--kimexdi-navy)] transition hover:bg-[var(--kimexdi-blue-light)]"
            >
              Demander un devis
            </Link>
            <Link
              href="/kimexdi/services"
              className="rounded-lg border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Découvrir nos services
            </Link>
          </div>
        </div>
      </section>

      {/* Présentation */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Qui sommes-nous</Eyebrow>
            <SectionTitle>
              Une entité dédiée à la logistique et au commerce international
            </SectionTitle>
            <Lead>
              KIMEXDI / KMSD Canada est une plateforme orientée logistique et
              import-export. Basée au Canada, elle coordonne le transport,
              l’entreposage et le groupage de marchandises, ainsi que des
              services logistiques de proximité.
            </Lead>
            <div className="mt-6">
              <CtaButton href="/kimexdi/a-propos" secondary>
                En savoir plus sur KIMEXDI
              </CtaButton>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {KIMEXDI.services.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-[var(--kimexdi-border)] bg-white p-5"
              >
                <h3 className="text-sm font-semibold text-[var(--kimexdi-navy)]">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--kimexdi-gray)]">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Fonctionnement */}
      <Section surface>
        <Eyebrow>Comment ça marche</Eyebrow>
        <SectionTitle>De votre demande au suivi opérationnel</SectionTitle>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map((e) => (
            <div
              key={e.n}
              className="rounded-xl border border-[var(--kimexdi-border)] bg-white p-6"
            >
              <span className="text-2xl font-bold text-[var(--kimexdi-blue)]/30">
                {e.n}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-[var(--kimexdi-navy)]">
                {e.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--kimexdi-gray)]">
                {e.text}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/kimexdi/fonctionnement"
            className="text-sm font-semibold text-[var(--kimexdi-blue)] hover:underline"
          >
            Voir le détail du fonctionnement →
          </Link>
        </div>
      </Section>

      {/* Groupage */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="rounded-2xl bg-[var(--kimexdi-blue-light)] p-8 sm:p-10">
            <Eyebrow>Service phare</Eyebrow>
            <SectionTitle>Le groupage</SectionTitle>
            <Lead>
              Le groupage permet de regrouper les marchandises de plusieurs
              expéditeurs dans un même départ. Vous ne payez que pour l’espace
              réellement utilisé, tout en bénéficiant d’un départ coordonné.
            </Lead>
            <ul className="mt-5 space-y-2 text-sm text-[var(--kimexdi-slate)]">
              <li className="flex gap-2">
                <span className="text-[var(--kimexdi-blue)]">✓</span>
                Mutualisation des coûts de transport
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--kimexdi-blue)]">✓</span>
                Adapté aux volumes partiels et effets personnels
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--kimexdi-blue)]">✓</span>
                Départs coordonnés depuis le Canada
              </li>
            </ul>
            <div className="mt-6">
              <CtaButton href="/kimexdi/devis">Demander un devis groupage</CtaButton>
            </div>
          </div>
          <div>
            <Eyebrow>Nos engagements</Eyebrow>
            <SectionTitle>Une approche professionnelle et mesurée</SectionTitle>
            <div className="mt-8 space-y-5">
              {ENGAGEMENTS.map((e) => (
                <div key={e.title} className="flex gap-4">
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--kimexdi-blue-light)] text-[var(--kimexdi-blue)]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--kimexdi-navy)]">
                      {e.title}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--kimexdi-gray)]">{e.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-[var(--kimexdi-navy)] py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 sm:px-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Un projet de transport, d’import-export ou de groupage ?
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Décrivez votre besoin en quelques minutes — notre équipe l’étudie
              et vous recontacte.
            </p>
          </div>
          <Link
            href="/kimexdi/devis"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[var(--kimexdi-navy)] transition hover:bg-[var(--kimexdi-blue-light)]"
          >
            Demander un devis
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <Section>
        <Eyebrow>Questions fréquentes</Eyebrow>
        <SectionTitle>FAQ</SectionTitle>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-[var(--kimexdi-border)] bg-white p-5"
            >
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-[var(--kimexdi-navy)]">
                {f.q}
                <span className="ml-3 text-[var(--kimexdi-gray)] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--kimexdi-slate)]">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </Section>
    </main>
  );
}
