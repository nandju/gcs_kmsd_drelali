import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// Point d'arrivée des liens Supabase Auth (confirmation, invitation,
// réinitialisation de mot de passe).
//
// Deux formats de liens peuvent arriver selon la config du projet :
//   - PKCE   : ?code=…          → exchangeCodeForSession()
//   - OTP    : ?token_hash=…&type=… → verifyOtp()
// On traite le format réellement reçu (les deux ne sont jamais mélangés
// dans un même lien). L'établissement de la session se fait côté serveur
// via les cookies @supabase/ssr — jamais par un paramètre d'URL.
//
// Redirections après validation :
//   - type=invite   → /set-password         (activation invitation)
//   - type=recovery → /reset-password/update (réinitialisation)
//   - `next` sanité  → destination demandée (ex. passée par resetPasswordForEmail)
//   - sinon         → /tableau-de-bord
// Échec → /signin?error=lien_invalide (message explicite côté page).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next');

  // --- Diagnostic temporaire (à retirer après résolution) ---
  // Journalise uniquement des MÉTADONNÉES : jamais les valeurs de
  // code/token, jamais les cookies, jamais les mots de passe.
  const mechanism = code ? 'pkce' : tokenHash && type ? 'otp' : 'none';
  console.log(
    '[auth/callback] params:',
    JSON.stringify({
      hasCode: Boolean(code),
      hasTokenHash: Boolean(tokenHash),
      type: type ?? null,
      next: next ?? null,
      mechanism,
    }),
  );

  // --- Cas implicite : aucun code/token_hash en query ---
  // Le lien /auth/v1/verify peut renvoyer la session dans le FRAGMENT
  // (#access_token=…&type=recovery) — invisible pour le serveur. On sert
  // une micro-page qui relit le fragment côté navigateur : elle route
  // selon `type` et conserve le fragment ; le client @supabase/ssr
  // (detectSessionInUrl) établit alors la session sur la page cible.
  if (!code && !(tokenHash && type)) {
    const errParam = searchParams.get('error');
    if (errParam) {
      console.log(
        '[auth/callback] result:',
        JSON.stringify({ ok: false, mechanism: 'none', error: { name: errParam } }),
      );
      return NextResponse.redirect(
        new URL('/signin?error=lien_invalide', origin),
      );
    }
    console.log(
      '[auth/callback] result:',
      JSON.stringify({ ok: 'fragment-fallback', mechanism: 'none' }),
    );
    const html = `<!doctype html><html><body><script>
(function () {
  var h = location.hash ? location.hash.substring(1) : '';
  var p = new URLSearchParams(h);
  if (p.get('error')) { location.replace('/signin?error=lien_invalide'); return; }
  var t = p.get('type') || '';
  var target = t === 'recovery' ? '/reset-password/update'
             : t === 'invite'   ? '/set-password'
             : '/tableau-de-bord';
  var keep = t === 'recovery' || t === 'invite';
  location.replace(keep ? target + '#' + h : target);
})();
</script></body></html>`;
    return new NextResponse(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  const supabase = await getSupabaseServerClient();

  let ok = false;
  let authError: { name?: string; message?: string; status?: number } | null =
    null;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
    if (error)
      authError = {
        name: error.name,
        message: error.message,
        status: (error as { status?: number }).status,
      };
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    ok = !error;
    if (error)
      authError = {
        name: error.name,
        message: error.message,
        status: (error as { status?: number }).status,
      };
  }

  console.log(
    '[auth/callback] result:',
    JSON.stringify({ ok, mechanism, error: authError }),
  );

  if (!ok) {
    return NextResponse.redirect(
      new URL('/signin?error=lien_invalide', origin),
    );
  }

  let target: string;
  if (type === 'invite') {
    target = '/set-password';
  } else if (type === 'recovery') {
    target = '/reset-password/update';
  } else if (next && next.startsWith('/') && !next.startsWith('//')) {
    target = next;
  } else {
    target = '/tableau-de-bord';
  }

  return NextResponse.redirect(new URL(target, origin));
}
