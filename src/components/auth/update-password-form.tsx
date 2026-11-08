'use client';

// Formulaire partagé de définition / réinitialisation de mot de passe.
// Utilisé par :
//   - /set-password        (activation après invitation — succès → dashboard)
//   - /reset-password/update (lien de récupération — succès → /signin)
// Exige une session de récupération/invitation valide (établie par
// /auth/callback après échange du code PKCE). Le simple paramètre d'URL
// n'est JAMAIS une preuve : on vérifie supabase.auth.getSession().

import { EyeCloseIcon, EyeIcon } from '@/icons/icons';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z
  .object({
    password: z
      .string({ required_error: 'Mot de passe requis' })
      .min(8, '8 caractères minimum'),
    confirm: z.string({ required_error: 'Confirmation requise' }),
  })
  .refine((v) => v.password === v.confirm, {
    path: ['confirm'],
    message: 'Les mots de passe ne correspondent pas.',
  });
type Inputs = z.infer<typeof schema>;

const inputClass =
  'w-full rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-cyan-400 focus:bg-white/15 focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50';

export default function UpdatePasswordForm({
  successRedirect = '/signin',
  successText = 'Mot de passe mis à jour. Redirection vers la connexion…',
}: {
  successRedirect?: string;
  successText?: string;
}) {
  const router = useRouter();
  const form = useForm<Inputs>({ resolver: zodResolver(schema) });
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // L'utilisateur doit arriver avec une session valide (invite/recovery).
  // Trois formats possibles selon la configuration Supabase :
  //  1. Session déjà posée en cookies par /auth/callback (code / token_hash).
  //  2. Tokens dans le fragment URL (#access_token=…) — flux implicite :
  //     le client PKCE de @supabase/ssr NE les traite PAS automatiquement,
  //     on appelle donc setSession() explicitement (tokens jamais loggés).
  //  3. Session établie de façon asynchrone → couverte par onAuthStateChange.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (session) {
        setHasSession(true);
        setSessionChecked(true);
      }
    });

    (async () => {
      // 2) Fragment implicite → établir la session explicitement.
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : '';
      if (hash) {
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          // Nettoie le fragment (ne laisse pas les tokens dans l'URL).
          window.history.replaceState(null, '', window.location.pathname);
          if (!cancelled) {
            setHasSession(!error);
            setSessionChecked(true);
          }
          return;
        }
      }
      // 1) Session déjà en cookies.
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        if (data.session) {
          setHasSession(true);
          setSessionChecked(true);
        } else {
          // 3) Laisse une courte fenêtre à onAuthStateChange avant de
          // conclure que le lien est invalide.
          setTimeout(() => {
            if (!cancelled) setSessionChecked(true);
          }, 1500);
        }
      }
    })();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(data: Inputs) {
    setIsLoading(true);
    setServerError(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setServerError(
        'Le lien a peut-être expiré ou a déjà été utilisé. Recommencez la procédure.',
      );
      setIsLoading(false);
      return;
    }
    setDone(true);
    setIsLoading(false);
    setTimeout(() => {
      router.push(successRedirect);
      router.refresh();
    }, 2000);
  }

  if (!sessionChecked) {
    return <p className="text-sm text-gray-300">Vérification du lien…</p>;
  }

  if (!hasSession) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-500/15 px-5 py-4 text-sm leading-relaxed text-red-200">
        Ce lien est invalide ou a expiré.{' '}
        <Link
          href="/reset-password"
          className="font-medium text-cyan-300 hover:text-cyan-200"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-5 py-4 text-sm leading-relaxed text-cyan-100">
        {successText}
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <div>
          <div className="relative">
            <input
              type={isShowPassword ? 'text' : 'password'}
              placeholder="Nouveau mot de passe (8 caractères minimum)"
              autoComplete="new-password"
              disabled={isLoading}
              className={`${inputClass} pr-12`}
              {...form.register('password')}
            />
            <button
              type="button"
              title={isShowPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              aria-label={isShowPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              onClick={() => setIsShowPassword((s) => !s)}
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

        <div>
          <input
            type={isShowPassword ? 'text' : 'password'}
            placeholder="Confirmer le mot de passe"
            autoComplete="new-password"
            disabled={isLoading}
            className={inputClass}
            {...form.register('confirm')}
          />
          {form.formState.errors.confirm && (
            <p className="mt-1.5 pl-4 text-xs text-red-300">
              {form.formState.errors.confirm.message}
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
          {isLoading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
        </button>
      </div>
    </form>
  );
}
