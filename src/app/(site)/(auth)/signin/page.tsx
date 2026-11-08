import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import SignInForm from './signin-form';

export default function SignInPage() {
  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à votre espace avec votre adresse email et votre mot de passe."
      footer={
        <>
          <Link
            href="/reset-password"
            className="font-medium text-cyan-300 hover:text-cyan-200"
          >
            Mot de passe oublié ?
          </Link>
          <br />
          Pas encore de compte ?{' '}
          <Link
            href="/signup"
            className="font-medium text-cyan-300 hover:text-cyan-200"
          >
            Inscription sur invitation
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  );
}
