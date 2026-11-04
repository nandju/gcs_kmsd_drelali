import type { Metadata } from 'next';
import { PublicForm } from '@/components/forms/public-form';
import { Eyebrow } from '@/components/kimexdi/ui';

export const metadata: Metadata = { title: 'Demande de devis' };

export default function DevisPage() {
  return (
    <main className="bg-[var(--kimexdi-surface)] py-14">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <header className="mb-8 text-center">
          <Eyebrow>Demande de devis</Eyebrow>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--kimexdi-navy)] sm:text-3xl">
            Décrivez votre besoin logistique
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--kimexdi-slate)]">
            Renseignez les informations ci-dessous. Notre équipe étudie chaque
            demande et vous recontacte personnellement.
          </p>
        </header>

        <div className="rounded-2xl border border-[var(--kimexdi-border)] bg-white p-6 shadow-theme-xs sm:p-8">
          <PublicForm org="KIMEXDI" kind="DEVIS" theme="kimexdi" />
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--kimexdi-gray)]">
          Ce formulaire est configurable par nos équipes — les champs affichés
          correspondent à la version publiée la plus récente.
        </p>
      </div>
    </main>
  );
}
