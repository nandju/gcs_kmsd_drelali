import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function GcsEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--gcs-accent)]">
      {children}
    </p>
  );
}

export function GcsTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        'mt-4 text-3xl font-extrabold tracking-tight text-[var(--gcs-navy-950)] sm:text-[2.6rem] sm:leading-[1.1]',
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function GcsLead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--gcs-ink-soft)] sm:text-lg">
      {children}
    </p>
  );
}

export function GcsCta({
  href,
  children,
  outline,
  light,
}: {
  href: string;
  children: ReactNode;
  outline?: boolean;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-colors',
        outline
          ? light
            ? 'border border-white/25 text-white hover:border-white/50 hover:bg-white/5'
            : 'border border-[var(--gcs-navy-950)]/15 text-[var(--gcs-navy-950)] hover:border-[var(--gcs-navy-950)]/40'
          : 'bg-[var(--gcs-accent)] text-white shadow-lg shadow-[var(--gcs-accent)]/30 hover:bg-[var(--gcs-accent-dark)]',
      )}
    >
      {children}
    </Link>
  );
}
