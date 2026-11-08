import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import ResetRequestForm from './reset-request-form';

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Entrez votre adresse email : nous vous enverrons un lien de réinitialisation."
      footer={
        <>
          Vous vous souvenez de votre mot de passe ?{' '}
          <Link href="/signin" className="font-medium text-cyan-300 hover:text-cyan-200">
            Se connecter
          </Link>
        </>
      }
    >
      <ResetRequestForm />
    </AuthShell>
  );
}
