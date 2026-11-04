import { PublicForm } from '@/components/forms/public-form';

// Route générique : tout formulaire KIMEXDI publié est accessible
// publiquement via /kimexdi/demande/<slug>.

export default async function KimexdiDynamicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="bg-[var(--kimexdi-surface)] py-14">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-[var(--kimexdi-border)] bg-white p-6 shadow-theme-xs sm:p-8">
          <PublicForm org="KIMEXDI" slug={slug} theme="kimexdi" />
        </div>
      </div>
    </main>
  );
}
