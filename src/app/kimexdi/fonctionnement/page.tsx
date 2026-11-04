import type { Metadata } from 'next';
import { CtaButton, Eyebrow, Lead, Section, SectionTitle } from '@/components/kimexdi/ui';

export const metadata: Metadata = { title: 'Fonctionnement' };

const ETAPES = [
  {
    n: '1',
    title: 'Soumission de votre demande',
    text: 'Vous décrivez votre besoin via le formulaire de demande de devis : type de service, nature des marchandises, quantités, poids, volume et date souhaitée. Le formulaire s’adapte au service choisi (groupage, transport, etc.).',
  },
  {
    n: '2',
    title: 'Réception et enregistrement',
    text: 'Votre demande est enregistrée dans notre système de gestion centralisé avec une référence unique. Vous recevez une confirmation de bonne réception.',
  },
  {
    n: '3',
    title: 'Étude par notre équipe',
    text: 'Un membre de l’équipe analyse votre demande et vous recontacte si des précisions sont nécessaires (documents, emballage, contraintes particulières).',
  },
  {
    n: '4',
    title: 'Proposition',
    text: 'Vous recevez une proposition adaptée à votre besoin. Aucun engagement n’est pris sans validation de votre part.',
  },
  {
    n: '5',
    title: 'Suivi opérationnel',
    text: 'Après acceptation, votre opération est coordonnée et suivie par nos équipes jusqu’à son terme, avec un interlocuteur dédié.',
  },
];

export default function FonctionnementPage() {
  return (
    <main>
      <section className="border-b border-[var(--kimexdi-border)] bg-[var(--kimexdi-surface)] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Eyebrow>Fonctionnement</Eyebrow>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--kimexdi-navy)] sm:text-4xl">
            De la soumission au suivi opérationnel
          </h1>
          <Lead>
            Voici les grandes étapes de la prise en charge d’une demande chez
            KIMEXDI.
          </Lead>
        </div>
      </section>

      <Section>
        <ol className="relative space-y-8 border-l-2 border-[var(--kimexdi-border)] pl-8">
          {ETAPES.map((e) => (
            <li key={e.n} className="relative">
              <span className="absolute -left-[41px] flex size-8 items-center justify-center rounded-full bg-[var(--kimexdi-blue)] text-sm font-bold text-white">
                {e.n}
              </span>
              <h2 className="text-base font-semibold text-[var(--kimexdi-navy)]">
                {e.title}
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--kimexdi-slate)]">
                {e.text}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-xl border border-[var(--kimexdi-border)] bg-[var(--kimexdi-blue-light)] p-6">
          <SectionTitle className="text-lg">Prêt à démarrer ?</SectionTitle>
          <p className="mt-2 text-sm text-[var(--kimexdi-slate)]">
            La première étape prend quelques minutes : décrivez votre besoin
            dans notre formulaire de demande de devis.
          </p>
          <div className="mt-4">
            <CtaButton href="/kimexdi/devis">Demander un devis</CtaButton>
          </div>
        </div>
      </Section>
    </main>
  );
}
