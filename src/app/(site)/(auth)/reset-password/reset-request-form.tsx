'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z
    .string({ required_error: 'Email requis' })
    .email('Adresse email invalide')
    .trim(),
});
type Inputs = z.infer<typeof schema>;

const inputClass =
  'w-full rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-cyan-400 focus:bg-white/15 focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50';

export default function ResetRequestForm() {
  const form = useForm<Inputs>({ resolver: zodResolver(schema) });
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(data: Inputs) {
    setIsLoading(true);
    setServerError(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password/update`,
    });

    if (error) {
      setServerError(
        'Envoi impossible pour le moment. Réessayez dans quelques instants.',
      );
      setIsLoading(false);
      return;
    }
    setDone(true);
    setIsLoading(false);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-5 py-4 text-sm leading-relaxed text-cyan-100">
        Si un compte existe avec cette adresse, un lien de réinitialisation
        vient d’être envoyé. Vérifiez votre boîte de réception (et les
        indésirables).
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <div>
          <input
            type="email"
            placeholder="Adresse email"
            autoComplete="email"
            disabled={isLoading}
            className={inputClass}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="mt-1.5 pl-4 text-xs text-red-300">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {serverError && (
          <p
            role="alert"
            className="rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-2.5 text-sm text-red-200"
          >
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 w-full rounded-full bg-cyan-600 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60"
        >
          {isLoading ? 'Envoi…' : 'Envoyer le lien'}
        </button>
      </div>
    </form>
  );
}
