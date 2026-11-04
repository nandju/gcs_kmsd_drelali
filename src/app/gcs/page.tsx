import Image from 'next/image';
import Link from 'next/link';
import { GCS_SITE } from '@/config/gcs-site';
import { GcsCta, GcsEyebrow, GcsLead, GcsTitle } from '@/components/gcs/ui';

const TRUST_ITEMS = [
  'Suivi de chaque étape',
  'Devis structuré et clair',
  'Livraison à domicile',
];

const STRENGTHS = [
  { title: 'Visibilité complète', desc: "Chaque étape de l'opération est visible et documentée." },
  { title: 'Interlocuteur unique', desc: 'Un seul point de contact, de la cotation à la livraison.' },
  { title: 'Traçabilité métier', desc: 'Devis, mission, preuve, facture : une même chaîne.' },
  { title: 'Réponses concrètes', desc: 'Des demandes traitées, sans processus opaque.' },
];

const Check = () => (
  <svg className="size-4 shrink-0 text-[var(--gcs-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5.5" />
  </svg>
);

export default function GcsHomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gcs-accent)]/30 bg-[var(--gcs-accent-light)] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--gcs-accent)]">
              <span className="size-1.5 rounded-full bg-[var(--gcs-accent)]" />
              Plateforme logistique
            </span>
            <h1 className="mt-6 max-w-xl text-[2.6rem] font-extrabold leading-[1.06] tracking-tight text-[var(--gcs-navy-950)] sm:text-6xl">
              Vos expéditions,{' '}
              <span className="text-[var(--gcs-accent)]">de bout en bout.</span>
            </h1>
            <GcsLead>{GCS_SITE.description}</GcsLead>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <GcsCta href={GCS_SITE.quoteHref}>Demander un devis</GcsCta>
              <GcsCta href="/gcs/services" outline>
                Découvrir nos services
              </GcsCta>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {TRUST_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm font-medium text-[var(--gcs-ink)]">
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[1.75rem] shadow-2xl shadow-[var(--gcs-navy-950)]/20">
              <Image
                src="/images/gcs/735.jpg"
                alt="Porte-conteneurs chargé, vu du ciel en pleine mer"
                width={960}
                height={720}
                className="aspect-[4/3] w-full object-cover"
                priority
              />
            </div>
            <div className="absolute -left-4 top-8 hidden rounded-2xl border border-[var(--gcs-line)] bg-white/95 p-4 shadow-xl shadow-[var(--gcs-navy-950)]/15 backdrop-blur sm:block lg:-left-10">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-[var(--gcs-accent)] text-white">
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-medium text-[var(--gcs-ink-soft)]">Suivi en temps réel</p>
                  <p className="text-sm font-bold text-[var(--gcs-navy-950)]">Chaque étape tracée</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <GcsEyebrow>Nos services</GcsEyebrow>
              <GcsTitle className="max-w-xl">
                Des solutions adaptées à vos besoins d’expédition
              </GcsTitle>
            </div>
            <GcsCta href="/gcs/services" outline>Tous nos services</GcsCta>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GCS_SITE.services.map((s) => (
              <Link
                key={s.id}
                href="/gcs/services"
                className="group overflow-hidden rounded-2xl border border-[var(--gcs-line)] bg-white transition hover:shadow-xl hover:shadow-[var(--gcs-navy-950)]/10"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold text-[var(--gcs-accent)]">{s.index}</p>
                  <h3 className="mt-1.5 text-base font-bold text-[var(--gcs-navy-950)]">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--gcs-ink-soft)]">{s.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Processus */}
      <section className="bg-[var(--gcs-surface)] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <GcsEyebrow>Comment ça marche</GcsEyebrow>
          <GcsTitle className="max-w-2xl">Une expédition, une chaîne complète</GcsTitle>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GCS_SITE.process.slice(0, 4).map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-[var(--gcs-line)] bg-white p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-[var(--gcs-accent-light)] text-sm font-extrabold text-[var(--gcs-accent)]">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-sm font-bold text-[var(--gcs-navy-950)]">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--gcs-ink-soft)]">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/gcs/fonctionnement" className="text-sm font-bold text-[var(--gcs-primary)] hover:underline">
              Voir les 7 étapes de la chaîne →
            </Link>
          </div>
        </div>
      </section>

      {/* Pourquoi GCS */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="overflow-hidden rounded-[1.75rem] shadow-xl shadow-[var(--gcs-navy-950)]/15">
              <Image
                src="/images/gcs/129640.jpg"
                alt="Responsable logistique consultant une tablette dans un entrepôt"
                width={800}
                height={1000}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-4 hidden w-56 overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:block lg:-right-8 lg:w-64">
              <Image
                src="/images/gcs/71414.jpg"
                alt="Équipe GCS préparant des colis en entrepôt"
                width={640}
                height={427}
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
            <div className="absolute -left-4 -top-5 rounded-2xl bg-[var(--gcs-navy-950)] px-5 py-4 text-white shadow-xl lg:-left-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Notre approche</p>
              <p className="mt-1 text-sm font-bold">De bout en bout</p>
            </div>
          </div>
          <div>
            <GcsEyebrow>Pourquoi GCS</GcsEyebrow>
            <GcsTitle>Une équipe, une chaîne, une responsabilité</GcsTitle>
            <div className="mt-8 space-y-5">
              {STRENGTHS.map((s) => (
                <div key={s.title} className="flex gap-4">
                  <span className="mt-0.5"><Check /></span>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--gcs-navy-950)]">{s.title}</h3>
                    <p className="mt-1 text-sm text-[var(--gcs-ink-soft)]">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Couverture */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem]">
            <Image
              src="/images/gcs/2151989598.jpg"
              alt="Chaîne logistique multimodale : camion, avion et porte-conteneurs"
              fill
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--gcs-navy-950)]/95 via-[var(--gcs-navy-950)]/75 to-[var(--gcs-navy-950)]/30" />
            <div className="relative max-w-xl p-8 text-white sm:p-14">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--gcs-accent-soft)]">
                Une chaîne complète
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Du premier échange à la preuve de livraison
              </h2>
              <p className="mt-5 leading-relaxed text-white/75">
                Transport, gestion des colis, livraison à domicile et suivi des
                opérations : GCS relie chaque étape dans un même espace de
                travail.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {['Route', 'Mer', 'Air'].map((m) => (
                  <span key={m} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                    {m}
                  </span>
                ))}
              </div>
              <div className="mt-8">
                <GcsCta href="/gcs/contact">Nous contacter</GcsCta>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden bg-[var(--gcs-navy-950)] py-20 sm:py-24">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'repeating-linear-gradient(115deg, #ffffff 0 1px, transparent 1px 28px)' }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 text-center text-white sm:px-6">
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Prêt à lancer votre prochaine expédition ?
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-white/70">
            Décrivez votre besoin en quelques étapes : l’équipe GCS étudie votre
            demande et revient vers vous avec une cotation.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <GcsCta href={GCS_SITE.quoteHref}>Demander un devis</GcsCta>
            <GcsCta href="/gcs/contact" outline light>Nous contacter</GcsCta>
          </div>
        </div>
      </section>
    </main>
  );
}
