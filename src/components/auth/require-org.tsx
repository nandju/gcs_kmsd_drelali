'use client';

// Garde « organisation active » pour les espaces privés.
// - En cours de chargement : spinner sobre.
// - Utilisateur connecté SANS aucun membership actif et NON super admin :
//   page explicative, aucun accès aux données d'organisation.
// - Super admin : accès conservé même sans membership (espace central).
// NB : l'autorisation réelle reste assurée par la RLS côté Supabase ;
// ce composant ne fait qu'adapter l'interface.

import type { ReactNode } from 'react';
import { useAuth } from '@/context/auth-store';

export function RequireOrg({ children }: { children: ReactNode }) {
  const { status, activeOrg, profile, orgs } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-gray-400">Chargement de votre espace…</p>
      </div>
    );
  }

  const noOrg = !activeOrg && orgs.length === 0 && !profile?.isSuperAdmin;
  if (noOrg) {
    return (
      <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">
          Aucune organisation associée
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Votre compte est actif mais n’est rattaché à aucune organisation.
          Contactez votre administrateur pour obtenir un accès.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
