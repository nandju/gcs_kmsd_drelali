// Client Supabase côté serveur (Server Components, Server Actions,
// Route Handlers). À créer PAR REQUÊTE — ne jamais le mettre en cache
// dans une variable de module.
//
// Conforme aux recommandations @supabase/ssr : lecture/écriture de la
// session via les cookies Next.js (pattern getAll/setAll).

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseEnv();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appel depuis un Server Component : l'écriture de cookies y est
          // interdite par Next.js. Sans objet tant qu'un middleware de
          // rafraîchissement de session n'est pas en place (phase Auth).
        }
      },
    },
  });
}
