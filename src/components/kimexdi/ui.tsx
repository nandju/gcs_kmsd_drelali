import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Section({
  children,
  className,
  surface,
}: {
  children: ReactNode;
  className?: string;
  surface?: boolean;
}) {
  return (
    <section
      className={cn(surface && 'bg-[var(--kimexdi-surface)]', 'py-16 sm:py-20')}
    >
      <div className={cn('mx-auto max-w-6xl px-4 sm:px-6', className)}>
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--kimexdi-blue)]">
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        'text-2xl font-semibold tracking-tight text-[var(--kimexdi-navy)] sm:text-3xl',
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--kimexdi-slate)]">
      {children}
    </p>
  );
}

export function CtaButton({
  href,
  children,
  secondary,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition',
        secondary
          ? 'border border-[var(--kimexdi-border)] bg-white text-[var(--kimexdi-navy)] hover:bg-[var(--kimexdi-surface)]'
          : 'bg-[var(--kimexdi-blue)] text-white hover:bg-[var(--kimexdi-navy)]',
      )}
    >
      {children}
    </Link>
  );
}
