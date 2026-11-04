'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { KIMEXDI } from '@/config/kimexdi';

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/kimexdi' ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--kimexdi-border)] bg-[var(--kimexdi-white)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3.5 sm:px-6">
        <Link href="/kimexdi" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--kimexdi-navy)] text-sm font-bold tracking-wide text-white">
            KX
          </span>
          <span>
            <span className="block text-sm font-bold tracking-wide text-[var(--kimexdi-navy)]">
              KIMEXDI
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-[var(--kimexdi-slate)]">
              KMSD Canada
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {KIMEXDI.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive(item.href)
                  ? 'text-[var(--kimexdi-blue)]'
                  : 'text-[var(--kimexdi-slate)] hover:bg-[var(--kimexdi-surface)] hover:text-[var(--kimexdi-navy)]',
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/kimexdi/devis"
            className="ml-2 rounded-lg bg-[var(--kimexdi-blue)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--kimexdi-navy)]"
          >
            Demander un devis
          </Link>
        </nav>

        <button
          className="ml-auto flex size-10 items-center justify-center rounded-lg text-[var(--kimexdi-slate)] hover:bg-[var(--kimexdi-surface)] lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-[var(--kimexdi-border)] px-4 py-3 lg:hidden" aria-label="Navigation mobile">
          <ul className="space-y-1">
            {KIMEXDI.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block rounded-lg px-3 py-2.5 text-sm font-medium',
                    isActive(item.href)
                      ? 'bg-[var(--kimexdi-blue-light)] text-[var(--kimexdi-blue)]'
                      : 'text-[var(--kimexdi-slate)]',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/kimexdi/devis"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-lg bg-[var(--kimexdi-blue)] px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Demander un devis
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
