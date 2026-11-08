'use client';

import { EyeCloseIcon, EyeIcon } from '@/icons/icons';
import { authValidation } from '@/lib/zod/auth.schema';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

type Inputs = z.infer<typeof authValidation.login>;

const inputClass =
  'w-full rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-cyan-400 focus:bg-white/15 focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50';

function errorMessage(error: { message?: string; code?: string }): string {
  const msg = error.message ?? '';
  if (
    msg.toLowerCase().includes('invalid login') ||
    msg.toLowerCase().includes('invalid credentials')
  ) {
    return 'Email ou mot de passe incorrect.';
  }
  if (msg.toLowerCase().includes('email not confirmed')) {
    return 'Votre adresse email n’est pas encore confirmée. Contactez votre administrateur.';
  }
  if (error.code === 'over_request_rate_limit' || msg.toLowerCase().includes('rate limit')) {
    return 'Trop de tentatives. Réessayez dans quelques instants.';
  }
  return 'Connexion impossible pour le moment. Réessayez ou contactez le support.';
}

function SignInFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<Inputs>({
    resolver: zodResolver(authValidation.login),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  async function onSubmit(data: Inputs) {
    setIsLoading(true);
    setServerError(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(errorMessage(error));
      setIsLoading(false);
      return;
    }

    // next= est sanitized côté middleware ; on revérifie ici (même règle).
    const next = searchParams.get('next');
    const target =
      next && next.startsWith('/') && !next.startsWith('//')
        ? next
        : '/tableau-de-bord';
    router.push(target);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <div>
          <Controller
            control={form.control}
            name="email"
            render={({ field }) => (
              <input
                type="email"
                placeholder="Adresse email"
                disabled={isLoading}
                autoComplete="email"
                className={inputClass}
                {...field}
              />
            )}
          />
          {form.formState.errors.email && (
            <p className="mt-1.5 pl-4 text-xs text-red-300">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="relative">
            <input
              type={isShowPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              id="password"
              disabled={isLoading}
              autoComplete="current-password"
              className={`${inputClass} pr-12`}
              {...form.register('password')}
            />
            <button
              type="button"
              title={isShowPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              aria-label={isShowPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              onClick={handleShowPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {isShowPassword ? <EyeIcon /> : <EyeCloseIcon />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="mt-1.5 pl-4 text-xs text-red-300">
              {form.formState.errors.password.message}
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
          {isLoading ? 'Connexion…' : 'Se connecter'}
        </button>
      </div>
    </form>
  );
}

export default function SignInForm() {
  // useSearchParams exige une frontière Suspense en App Router.
  return (
    <Suspense>
      <SignInFormInner />
    </Suspense>
  );
}
