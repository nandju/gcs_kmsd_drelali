import { PublicForm } from '@/components/forms/public-form';

// Route générique : tout formulaire GCS publié est accessible
// publiquement via /gcs/demande/<slug>.

export default async function GcsDynamicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="bg-[var(--gcs-surface)] py-14">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-[var(--gcs-line)] bg-white p-6 shadow-theme-xs sm:p-8">
          <PublicForm org="GCS" slug={slug} theme="gcs" />
        </div>
      </div>
    </main>
  );
}
