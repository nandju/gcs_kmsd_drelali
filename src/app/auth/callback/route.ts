import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// Point d'arrivée des liens Supabase Auth (confirmation d'email,
// invitation, réinitialisation). Échange le code PKCE contre une
// session, puis redirige selon le `type` du lien :
//   - invite   → /set-password   (définition initiale du mot de passe)
//   - recovery → /reset-password/update (réinitialisation)
//   - autre    → `next` (sanitizé) ou /tableau-de-bord
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next = searchParams.get('next');

  if (code) {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  let target: string;
  if (type === 'invite') {
    target = '/set-password';
  } else if (type === 'recovery') {
    target = '/reset-password/update';
  } else {
    target =
      next && next.startsWith('/') && !next.startsWith('//')
        ? next
        : '/tableau-de-bord';
  }

  return NextResponse.redirect(new URL(target, origin));
}
