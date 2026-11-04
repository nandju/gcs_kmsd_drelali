import { NextResponse, type NextRequest } from 'next/server';

// Isolation des plateformes publiques selon NEXT_PUBLIC_PLATFORM
// (gcs | kimexdi | all), figée au moment du build. En mode « plateforme
// unique », « / » sert le site public et les routes de l'autre organisation
// redirigent vers sa page d'accueil. L'espace de gestion reste accessible —
// à restreindre côté serveur lors de l'intégration Supabase/auth.

const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM ?? 'all';

export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  const home = PLATFORM === 'kimexdi' ? '/kimexdi' : '/gcs';

  // En mode plateforme unique, « / » sert le site public (prioritaire sur la
  // redirection /tableau-de-bord de next.config).
  if (PLATFORM !== 'all' && p === '/') {
    return NextResponse.redirect(new URL(home, req.url));
  }
  if (PLATFORM === 'kimexdi' && (p === '/gcs' || p.startsWith('/gcs/'))) {
    return NextResponse.redirect(new URL('/kimexdi', req.url));
  }
  if (PLATFORM === 'gcs' && (p === '/kimexdi' || p.startsWith('/kimexdi/'))) {
    return NextResponse.redirect(new URL('/gcs', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/gcs/:path*', '/kimexdi/:path*'],
};
