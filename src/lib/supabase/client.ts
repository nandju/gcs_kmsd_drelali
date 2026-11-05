'use client';

// Client Supabase côté navigateur (composants client).
// Instance unique par onglet — la session est gérée via cookies par
// @supabase/ssr, ce qui la rend lisible côté serveur.

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const { url, publishableKey } = getSupabaseEnv();
    browserClient = createBrowserClient(url, publishableKey);
  }
  return browserClient;
}
