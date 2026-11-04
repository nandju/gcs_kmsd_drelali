'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ORGANIZATIONS, ORG_LIST } from '@/config/organizations';
import { useErp } from '@/context/erp-store';
import { useClickOutside } from '@/hooks/use-click-outside';
import { formatDateTime } from '@/lib/erp/format';
import type { SearchKind } from '@/lib/erp/types';
import { navForOrg, PAGE_TITLES } from './nav-config';
import { Badge } from '../ui';

/* ----------------------------- Recherche ------------------------------ */

interface SearchResult {
  kind: SearchKind;
  kindLabel: string;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

function useGlobalSearch(query: string): SearchResult[] {
  const s = useErp();
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const match = (...parts: (string | undefined)[]) =>
      parts.some((p) => p?.toLowerCase().includes(q));
    const results: SearchResult[] = [];
    const contactName = (id: string) => s.contacts.find((c) => c.id === id)?.name ?? '';

    for (const c of s.contacts) {
      if (match(c.name, c.company, c.phone, c.email))
        results.push({ kind: 'contact', kindLabel: 'Contact', id: c.id, title: c.name, subtitle: c.phone, href: `/contacts/${c.id}` });
    }
    for (const l of s.leads) {
      if (match(l.reference, l.service, contactName(l.contactId)))
        results.push({ kind: 'lead', kindLabel: 'Prospect', id: l.id, title: l.reference, subtitle: `${contactName(l.contactId)} — ${l.service}`, href: `/prospects/${l.id}` });
    }
    for (const qt of s.quotes) {
      if (match(qt.reference, qt.service, contactName(qt.contactId)))
        results.push({ kind: 'quote', kindLabel: 'Cotation', id: qt.id, title: qt.reference, subtitle: `${contactName(qt.contactId)} — ${qt.service}`, href: `/cotations/${qt.id}` });
    }
    for (const m of s.missions) {
      if (match(m.reference, m.service, contactName(m.contactId), m.origin, m.destination))
        results.push({ kind: 'mission', kindLabel: 'Mission', id: m.id, title: m.reference, subtitle: `${contactName(m.contactId)} — ${m.service}`, href: `/missions/${m.id}` });
    }
    for (const f of s.invoices) {
      if (match(f.reference, contactName(f.contactId)))
        results.push({ kind: 'invoice', kindLabel: 'Facture', id: f.id, title: f.reference, subtitle: contactName(f.contactId), href: `/factures/${f.id}` });
    }
    for (const p of s.payments) {
      if (match(p.reference, contactName(p.contactId)))
        results.push({ kind: 'payment', kindLabel: 'Paiement', id: p.id, title: p.reference, subtitle: contactName(p.contactId), href: '/paiements' });
    }
    for (const i of s.incidents) {
      if (match(i.reference, i.type, i.description))
        results.push({ kind: 'incident', kindLabel: 'Incident', id: i.id, title: i.reference, subtitle: i.type, href: '/incidents' });
    }
    return results.slice(0, 8);
  }, [query, s]);
}

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const results = useGlobalSearch(query);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside<HTMLDivElement>(close);

  return (
    <div ref={ref} className="relative hidden flex-1 max-w-md md:block">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Recherche globale (prospects, missions, factures…)"
        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-cyan-700 focus:bg-white focus:outline-none"
        aria-label="Recherche globale"
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">Aucun résultat pour « {query} ».</p>
          ) : (
            <ul>
              {results.map((r) => (
                <li key={`${r.kind}-${r.id}`}>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
                    onClick={() => {
                      setOpen(false);
                      setQuery('');
                      router.push(r.href);
                    }}
                  >
                    <Badge tone="cyan">{r.kindLabel}</Badge>
                    <span className="text-sm font-medium text-gray-800">{r.title}</span>
                    <span className="truncate text-xs text-gray-500">{r.subtitle}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------- Notifications ---------------------------- */

const NOTIF_CATEGORY: Record<string, string> = {
  COMMERCIAL: 'Commercial',
  OPERATIONS: 'Opérations',
  FINANCES: 'Finances',
  SYSTEME: 'Système',
};

function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useErp();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside<HTMLDivElement>(close);
  const router = useRouter();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
        aria-label={`Notifications (${unread} non lues)`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg sm:w-96">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <span className="text-sm font-semibold text-gray-800">Notifications</span>
            <button className="text-xs text-cyan-700 hover:underline" onClick={markAllNotificationsRead}>
              Tout marquer comme lu
            </button>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.id} className="border-b border-gray-50 last:border-0">
                <button
                  className={cn(
                    'flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-gray-50',
                    !n.read && 'bg-cyan-50/40',
                  )}
                  onClick={() => {
                    markNotificationRead(n.id);
                    setOpen(false);
                    router.push(n.href);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Badge tone={n.category === 'FINANCES' ? 'green' : n.category === 'OPERATIONS' ? 'blue' : 'violet'}>
                      {NOTIF_CATEGORY[n.category]}
                    </Badge>
                    <span className="text-xs text-gray-400">{formatDateTime(n.at)}</span>
                  </span>
                  <span className={cn('text-sm', n.read ? 'text-gray-500' : 'font-medium text-gray-800')}>
                    {n.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* --------------------------- Org switcher ----------------------------- */

function OrgSwitcher() {
  const { org, setOrg } = useErp();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside<HTMLDivElement>(close);
  const current = ORGANIZATIONS[org];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="size-2.5 rounded-full" style={{ backgroundColor: current.accentColor }} />
        <span className="hidden sm:inline">{current.displayName}</span>
        <span className="sm:hidden">{current.code}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-1 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg">
          {ORG_LIST.map((o) => (
            <button
              key={o.code}
              className={cn(
                'flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50',
                o.code === org && 'bg-cyan-50/50',
              )}
              onClick={() => {
                setOrg(o.code);
                setOpen(false);
              }}
            >
              <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: o.accentColor }} />
              <span>
                <span className="block text-sm font-medium text-gray-800">{o.displayName}</span>
                <span className="block text-xs text-gray-500">
                  {o.country} · {o.currency}
                  {o.code !== 'GCS' && ' · Espace de démonstration'}
                </span>
              </span>
            </button>
          ))}
          <p className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-[11px] text-gray-400">
            Changement d’espace local à la démonstration — aucune autorisation serveur n’est simulée.
          </p>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Profil --------------------------------- */

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside<HTMLDivElement>(close);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full hover:bg-gray-100 p-1"
        aria-label="Menu du profil"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-cyan-800 text-xs font-bold text-white">
          DG
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-800">Direction (démo)</p>
            <p className="text-xs text-gray-500">direction@exemple.ci</p>
          </div>
          <Link href="/parametres" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50" onClick={close}>
            Paramètres
          </Link>
          <Link href="/utilisateurs" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50" onClick={close}>
            Utilisateurs et rôles
          </Link>
          <Link href="/chauffeur" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50" onClick={close}>
            Vue chauffeur (mobile)
          </Link>
          <Link href="/gcs" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50" onClick={close}>
            Site public GCS
          </Link>
          <Link href="/kimexdi" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50" onClick={close}>
            Site public KIMEXDI
          </Link>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Sidebar -------------------------------- */

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { org } = useErp();
  const pathname = usePathname();
  const sections = navForOrg(org);
  const current = ORGANIZATIONS[org];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-4">
        {/* Emplacement logo — charte graphique à fournir */}
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: current.accentColor }}
        >
          {current.code.slice(0, 2)}
        </span>
        {!collapsed && (
          <span>
            <span className="block text-sm font-bold text-gray-900">{current.code}</span>
            <span className="block text-[11px] text-gray-400">Plateforme opérationnelle</span>
          </span>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {sections.map((section) => (
          <div key={section.title} className="mt-3">
            {!collapsed && (
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onNavigate}
                  title={item.label}
                  className={cn(
                    'mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition',
                    active
                      ? 'bg-cyan-800 font-medium text-white'
                      : 'text-gray-600 hover:bg-gray-100',
                    collapsed && 'justify-center',
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.comingSoon && (
                    <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium uppercase text-gray-400">
                      À venir
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      {!collapsed && (
        <p className="border-t border-gray-100 px-4 py-3 text-[10px] leading-relaxed text-gray-400">
          Prototype de démonstration — données fictives, sans backend.
        </p>
      )}
    </div>
  );
}

/* ------------------------------- Shell --------------------------------- */

export function ErpShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const title = PAGE_TITLES[`/${segments[0] ?? ''}`] ?? 'Détail';
  const isDetail = segments.length > 1;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 border-r border-gray-200 bg-white transition-all lg:block',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-theme-lg">
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
            <button
              className="flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <button
              className="hidden size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:flex"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Déplier la navigation' : 'Replier la navigation'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h12M3 18h18" />
              </svg>
            </button>

            <OrgSwitcher />
            <GlobalSearch />

            <div className="ml-auto flex items-center gap-1.5">
              <Notifications />
              <ProfileMenu />
            </div>
          </div>
          {/* Fil d'Ariane */}
          <div className="flex items-center gap-1.5 px-4 pb-2 text-xs text-gray-400 sm:px-6">
            <Link href="/tableau-de-bord" className="hover:text-gray-600">
              Accueil
            </Link>
            <span aria-hidden>/</span>
            <Link href={`/${segments[0] ?? ''}`} className={cn(!isDetail && 'font-medium text-gray-600')}>
              {title}
            </Link>
            {isDetail && (
              <>
                <span aria-hidden>/</span>
                <span className="font-medium text-gray-600">Fiche détaillée</span>
              </>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
