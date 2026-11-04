import type { Metadata } from 'next';
import { KIMEXDI } from '@/config/kimexdi';
import { PublicForm } from '@/components/forms/public-form';
import { Eyebrow, Lead } from '@/components/kimexdi/ui';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <main className="bg-[var(--kimexdi-surface)] py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <header className="mb-10 text-center">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--kimexdi-navy)] sm:text-3xl">
            Nous écrire
          </h1>
          <Lead>
            Une question, un projet ? Utilisez le formulaire ci-dessous ou
            consultez nos coordonnées.
          </Lead>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-[var(--kimexdi-border)] bg-white p-6 lg:col-span-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--kimexdi-navy)]">
              Coordonnées
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium text-[var(--kimexdi-gray)]">E-mail</dt>
                <dd className="mt-0.5 text-[var(--kimexdi-slate)]">
                  {KIMEXDI.contact.email || 'À compléter'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--kimexdi-gray)]">Téléphone</dt>
                <dd className="mt-0.5 text-[var(--kimexdi-slate)]">
                  {KIMEXDI.contact.phone || 'À compléter'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--kimexdi-gray)]">Adresse</dt>
                <dd className="mt-0.5 text-[var(--kimexdi-slate)]">
                  {KIMEXDI.contact.address || 'À compléter'}
                </dd>
              </div>
            </dl>
            <p className="mt-5 rounded-lg bg-[var(--kimexdi-surface)] p-3 text-xs text-[var(--kimexdi-slate)]">
              {KIMEXDI.contact.note}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--kimexdi-border)] bg-white p-6 sm:p-8 lg:col-span-2">
            <h2 className="mb-5 text-base font-semibold text-[var(--kimexdi-navy)]">
              Formulaire de contact
            </h2>
            <PublicForm
              org="KIMEXDI"
              kind="CONTACT"
              theme="kimexdi"
              submitLabel="Envoyer le message"
              fallback={
                <div className="rounded-xl border border-dashed border-[var(--kimexdi-border)] bg-[var(--kimexdi-surface)] px-6 py-10 text-center">
                  <p className="text-sm font-semibold text-[var(--kimexdi-navy)]">
                    Formulaire de contact en préparation
                  </p>
                  <p className="mt-1 text-sm text-[var(--kimexdi-slate)]">
                    En attendant sa publication, utilisez la page « Demande de
                    devis » pour nous transmettre votre besoin.
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
