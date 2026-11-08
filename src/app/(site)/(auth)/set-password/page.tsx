import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import UpdatePasswordForm from '@/components/auth/update-password-form';

export const metadata: Metadata = {
  title: 'Définir votre mot de passe',
};

// Page d'activation : l'utilisateur arrive ici depuis le lien d'invitation
// Supabase (type=invite, échangé contre une session par /auth/callback).
export default function SetPasswordPage() {
  return (
    <AuthShell
      title="Bienvenue"
      subtitle="Pour activer votre compte, définissez votre mot de passe."
    >
      <UpdatePasswordForm
        successRedirect="/tableau-de-bord"
        successText="Mot de passe défini. Ouverture de votre espace…"
      />
    </AuthShell>
  );
}
