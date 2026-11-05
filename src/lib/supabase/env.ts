/* ------------------------------------------------------------------ */
/* Variables d'environnement Supabase (publiques uniquement).          */
/* La clé « publishable » est conçue pour être exposée au navigateur ; */
/* aucune clé secrète (service_role) ne doit jamais transiter ici.     */
/* ------------------------------------------------------------------ */

export function getSupabaseEnv(): { url: string; publishableKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      'Configuration Supabase manquante : définissez NEXT_PUBLIC_SUPABASE_URL ' +
        'et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY dans .env.local.',
    );
  }
  return { url, publishableKey };
}
