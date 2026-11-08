'use client';

// Contexte d'authentification Supabase.
// - Session gérée par @supabase/ssr (cookies, renouvellement automatique).
// - Profil lu depuis public.profiles, organisations depuis
//   public.memberships (+ roles, role_permissions, permissions) — toujours
//   filtré par les politiques RLS : rien ici n'est une preuve d'autorisation,
//   uniquement une adaptation d'affichage.
// - L'organisation active est persistée dans localStorage ('erp-active-org')
//   mais TOUJOURS revalidée contre les memberships actifs au chargement.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { ORGANIZATIONS, type OrgCode } from '@/config/organizations';
import { useErp } from '@/context/erp-store';

const ACTIVE_ORG_KEY = 'erp-active-org';

export interface AuthOrg {
  code: OrgCode;
  displayName: string;
  country: string;
  currency: string;
  accentColor?: string;
  roleName: string;
  permissions: string[];
}

export interface AuthProfile {
  id: string;
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
}

interface AuthState {
  status: 'loading' | 'ready';
  user: User | null;
  profile: AuthProfile | null;
  orgs: AuthOrg[];
  activeOrg: OrgCode | null;
  setActiveOrg: (code: OrgCode) => void;
  hasPermission: (permission: string) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

interface MembershipRow {
  is_active: boolean;
  organizations: {
    code: string;
    display_name: string;
    country: string;
    currency: string;
    accent_color: string | null;
  } | null;
  roles: {
    name: string;
    role_permissions: { permissions: { id: string } | null }[] | null;
  } | null;
}

function toAuthOrgs(rows: MembershipRow[] | null): AuthOrg[] {
  if (!rows) return [];
  const orgs: AuthOrg[] = [];
  for (const m of rows) {
    if (!m.is_active || !m.organizations) continue;
    const code = m.organizations.code;
    if (!(code in ORGANIZATIONS)) continue; // org inconnue du frontend (ex. DRELALI futur)
    const cfg = ORGANIZATIONS[code as OrgCode];
    const permissions = (m.roles?.role_permissions ?? [])
      .map((rp) => rp.permissions?.id)
      .filter((p): p is string => Boolean(p));
    orgs.push({
      code: cfg.code,
      displayName: cfg.displayName,
      country: cfg.country,
      currency: cfg.currency,
      accentColor: cfg.accentColor,
      roleName: m.roles?.name ?? '',
      permissions,
    });
  }
  return orgs;
}

async function loadAuthData(userId: string) {
  const supabase = getSupabaseBrowserClient();

  const [profileRes, membershipsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name, is_super_admin')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('memberships')
      .select(
        'is_active, organizations(code, display_name, country, currency, accent_color), roles(name, role_permissions(permissions(id)))',
      )
      .eq('user_id', userId),
  ]);

  const profile: AuthProfile | null = profileRes.data
    ? {
        id: profileRes.data.id,
        email: profileRes.data.email,
        fullName: profileRes.data.full_name,
        isSuperAdmin: profileRes.data.is_super_admin,
      }
    : null;

  return {
    profile,
    orgs: toAuthOrgs(membershipsRes.data as MembershipRow[] | null),
    membershipsError: membershipsRes.error ?? profileRes.error,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const erp = useErp();
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [orgs, setOrgs] = useState<AuthOrg[]>([]);
  const [activeOrg, setActiveOrgState] = useState<OrgCode | null>(null);

  const refresh = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      setProfile(null);
      setOrgs([]);
      setActiveOrgState(null);
      setStatus('ready');
      return;
    }
    setUser(authUser);
    try {
      const { profile: p, orgs: o } = await loadAuthData(authUser.id);
      setProfile(p);
      setOrgs(o);

      // Organisation active : la valeur sauvegardée n'est conservée que si
      // le membership correspondant est toujours actif. Sinon, première org.
      const saved = window.localStorage.getItem(ACTIVE_ORG_KEY);
      const valid =
        saved && o.some((org) => org.code === saved)
          ? (saved as OrgCode)
          : (o[0]?.code ?? null);
      // Super admin sans membership : retombe sur l'org courante du store
      // de démonstration pour ne pas casser l'interface.
      const resolved =
        valid ?? (p?.isSuperAdmin ? (erp.org as OrgCode) : null);
      setActiveOrgState(resolved);
      if (resolved) window.localStorage.setItem(ACTIVE_ORG_KEY, resolved);
    } catch {
      // Erreur réseau/Supabase : on reste en « ready » sans données plutôt
      // que de laisser le spinner indéfini ; les RLS restent la référence.
      setProfile(null);
      setOrgs([]);
      setActiveOrgState(null);
    }
    setStatus('ready');
  }, [erp.org]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) void refresh(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) void refresh(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveOrg = useCallback(
    (code: OrgCode) => {
      // Garde-fou côté affichage : ne jamais activer une org sans membership
      // actif (sauf super admin). Le contrôle réel reste la RLS.
      const allowed =
        profile?.isSuperAdmin || orgs.some((o) => o.code === code);
      if (!allowed) return;
      setActiveOrgState(code);
      window.localStorage.setItem(ACTIVE_ORG_KEY, code);
    },
    [orgs, profile],
  );

  // Synchronise l'organisation de démonstration (erp-store) avec l'org
  // active authentifiée — silencieusement, sans toast à chaque chargement.
  useEffect(() => {
    if (activeOrg && erp.org !== activeOrg) {
      erp.setOrg(activeOrg, { silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrg]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      // Super admin : tous les droits côté affichage (la RLS décide toujours).
      if (profile?.isSuperAdmin) return true;
      const org = orgs.find((o) => o.code === activeOrg);
      return org?.permissions.includes(permission) ?? false;
    },
    [profile, orgs, activeOrg],
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setOrgs([]);
    setActiveOrgState(null);
    router.push('/signin');
    router.refresh();
  }, [router]);

  const value = useMemo<AuthState>(
    () => ({
      status,
      user,
      profile,
      orgs,
      activeOrg,
      setActiveOrg,
      hasPermission,
      signOut,
    }),
    [status, user, profile, orgs, activeOrg, setActiveOrg, hasPermission, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>.');
  return ctx;
}
