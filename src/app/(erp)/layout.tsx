import { redirect } from 'next/navigation';
import { ErpShell } from '@/components/erp/shell/shell';
import { RequireOrg } from '@/components/auth/require-org';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { ReactNode } from 'react';

// Garde serveur centralisée pour tout le groupe (erp) : toutes les
// sous-routes (/tableau-de-bord, /prospects, /demandes, /formulaires…)
// exigent une session Supabase valide. Le middleware fait de même ;
// ce contrôle couvre aussi les accès directs et le rafraîchissement.
export default async function ErpLayout({ children }: { children: ReactNode }) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/signin');
  }
  return (
    <ErpShell>
      <RequireOrg>{children}</RequireOrg>
    </ErpShell>
  );
}
