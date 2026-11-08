import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// 1) Isolation des plateformes publiques selon NEXT_PUBLIC_PLATFORM
//    (gcs | kimexdi | all), figée au moment du build.
// 2) Session Supabase : rafraîchissement des cookies à chaque requête
//    (pattern officiel @supabase/ssr pour middleware Next.js).
// 3) Protection des routes : tout ce qui n'est pas explicitement public
//    exige une session authentifiée, sinon redirection vers /signin.
// ---------------------------------------------------------------------------

const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM ?? 'all';

// Routes publiques : sites vitrines, pages template conservées,
// authentification et API. Tout le reste (groupe (erp), /chauffeur,
// /text-generator, routes inconnues) est privé par défaut.
const PUBLIC_PREFIXES = [
  '/gcs',
  '/kimexdi',
  '/api',
  '/reset-password',
  '/auth/callback',
];
const PUBLIC_EXACT = new Set([
  '/',
  '/signin',
  '/signup',
  '/set-password', // la page valide elle-même la session (lien invalide = message explicite)
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;

  // --- Redirections de plateforme (comportement existant, inchangé) ---
  const home = PLATFORM === 'kimexdi' ? '/kimexdi' : '/gcs';
  if (PLATFORM !== 'all' && p === '/') {
    return NextResponse.redirect(new URL(home, req.url));
  }
  if (PLATFORM === 'kimexdi' && (p === '/gcs' || p.startsWith('/gcs/'))) {
    return NextResponse.redirect(new URL('/kimexdi', req.url));
  }
  if (PLATFORM === 'gcs' && (p === '/kimexdi' || p.startsWith('/kimexdi/'))) {
    return NextResponse.redirect(new URL('/gcs', req.url));
  }

  // --- Session Supabase + garde des routes privées ---
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    // Configuration absente (ex. build sans .env.local) : on conserve le
    // comportement plateforme sans garde d'authentification.
    return NextResponse.next();
  }

  let response = NextResponse.next({ request: req });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          req.cookies.set(name, value),
        );
        response = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() valide le JWT auprès de Supabase Auth (pas de confiance
  // au simple cookie). Rafraîchit la session si nécessaire.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicPath = isPublicPath(p);

  if (!publicPath && !user) {
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('next', p);
    return NextResponse.redirect(signInUrl);
  }

  // Utilisateur déjà connecté qui visite /signin → espace privé.
  if (user && p === '/signin') {
    const next = req.nextUrl.searchParams.get('next');
    const safeNext =
      next && next.startsWith('/') && !next.startsWith('//')
        ? next
        : '/tableau-de-bord';
    return NextResponse.redirect(new URL(safeNext, req.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
