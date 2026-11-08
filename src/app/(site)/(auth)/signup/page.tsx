import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';

export const metadata: Metadata = {
  title: 'Inscription',
};

// Inscription sur invitation uniquement : les comptes sont créés par
// l'administrateur depuis Supabase Authentication (flux « Invite »).
// Pas de création de compte publique.
export default function SignUpPage() {
  return (
    <AuthShell
      title="Inscription"
      subtitle="L'inscription se fait uniquement sur invitation de votre organisation."
      footer={
        <>
          Déjà invité ?{' '}
          <Link href="/signin" className="font-medium text-cyan-300 hover:text-cyan-200">
            Se connecter
          </Link>
        </>
      }
    >
      <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-5 py-4 text-sm leading-relaxed text-cyan-100">
        <p className="font-medium">Comment accéder à la plateforme ?</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-cyan-100/90">
          <li>Votre administrateur vous invite depuis la console Supabase.</li>
          <li>Vous recevez un email d’invitation.</li>
          <li>Vous ouvrez le lien et définissez votre mot de passe.</li>
          <li>Vous accédez à votre espace selon votre organisation et votre rôle.</li>
        </ol>
      </div>
    </AuthShell>
  );
}
