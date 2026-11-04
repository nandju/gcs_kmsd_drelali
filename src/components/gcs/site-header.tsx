'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GCS_SITE } from '@/config/gcs-site';

export function GcsHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === '/gcs' ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--gcs-line)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3.5 sm:px-6">
        <Link href="/gcs" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--gcs-accent)] text-sm font-extrabold tracking-wide text-white">
            GC
          </span>
          <span>
            <span className="block text-sm font-extrabold tracking-wide text-[var(--gcs-navy-950)]">
              GCS
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-[var(--gcs-ink-soft)]">
              {GCS_SITE.country}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {GCS_SITE.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-semibold transition',
                isActive(item.href)
                  ? 'text-[var(--gcs-accent)]'
                  : 'text-[var(--gcs-ink-soft)] hover:text-[var(--gcs-navy-950)]',
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={GCS_SITE.quoteHref}
            className="ml-2 rounded-full bg-[var(--gcs-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--gcs-accent)]/30 transition hover:bg-[var(--gcs-accent-dark)]"
          >
            Demander un devis
          </Link>
        </nav>

        <button
          className="ml-auto flex size-10 items-center justify-center rounded-lg text-[var(--gcs-ink-soft)] hover:bg-[var(--gcs-surface)] lg:hidden"
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
        <nav className="border-t border-[var(--gcs-line)] px-4 py-3 lg:hidden" aria-label="Navigation mobile">
          <ul className="space-y-1">
            {GCS_SITE.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block rounded-lg px-3 py-2.5 text-sm font-semibold',
                    isActive(item.href)
                      ? 'bg-[var(--gcs-accent-light)] text-[var(--gcs-accent)]'
                      : 'text-[var(--gcs-ink-soft)]',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={GCS_SITE.quoteHref}
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-full bg-[var(--gcs-accent)] px-3 py-2.5 text-center text-sm font-semibold text-white"
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
