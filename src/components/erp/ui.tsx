'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Tone } from '@/lib/erp/labels';
import { Modal } from '@/components/ui/modal/modal';

/* ------------------------------- Badge -------------------------------- */

const TONE_CLASSES: Record<Tone, string> = {
  gray: 'bg-gray-100 text-gray-700 ring-gray-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
};

export function Badge({
  tone = 'gray',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------- Card -------------------------------- */

export function Card({
  title,
  action,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-theme-xs',
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {action}
        </div>
      )}
      <div className={padded ? 'p-4 sm:p-5' : ''}>{children}</div>
    </div>
  );
}

/* ----------------------------- PageHeader ----------------------------- */

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

/* ------------------------------- Button ------------------------------- */

export function Button({
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}) {
  const variants = {
    primary:
      'bg-cyan-800 text-white hover:bg-cyan-900 focus-visible:outline-cyan-800 disabled:bg-gray-300',
    secondary:
      'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:text-gray-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 disabled:bg-gray-300',
    ghost: 'text-gray-600 hover:bg-gray-100 disabled:text-gray-400',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  variant = 'secondary',
  className,
  children,
}: {
  href: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition',
        variant === 'primary'
          ? 'bg-cyan-800 text-white hover:bg-cyan-900'
          : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ----------------------------- EmptyState ----------------------------- */

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-12 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* -------------------------------- Tabs -------------------------------- */

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mb-4 overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-lg bg-gray-100 p-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition whitespace-nowrap',
              active === t.id
                ? 'bg-white text-gray-900 shadow-theme-xs'
                : 'text-gray-500 hover:text-gray-800',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="ml-1.5 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- ConfirmDialog ---------------------------- */

export function ConfirmButton({
  label,
  title,
  description,
  onConfirm,
  variant = 'primary',
  confirmLabel = 'Confirmer',
  disabled,
  className,
}: {
  label: ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  confirmLabel?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} disabled={disabled} className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        className={{ modal: 'sm:w-[480px] sm:p-8 rounded-2xl' }}
      >
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </Modal>
    </>
  );
}

/* ------------------------------- Champs -------------------------------- */

export function Field({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-700/20';

/* ----------------------------- DemoNotice ------------------------------ */

export function DemoNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <span>
        {children ??
          'Mode démonstration : les données sont fictives et aucune opération réelle n’est effectuée.'}
      </span>
    </div>
  );
}

/* ------------------------------ ComingSoon ------------------------------ */

export function ComingSoon({ module, items }: { module: string; items?: string[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-theme-xs">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{module}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        Ce module est prévu dans une prochaine version. Son architecture de navigation est déjà
        anticipée pour accueillir les futures fonctionnalités sans refonte de l’interface.
      </p>
      {items && items.length > 0 && (
        <div className="mx-auto mt-5 flex max-w-xl flex-wrap justify-center gap-2">
          {items.map((i) => (
            <Badge key={i} tone="gray">
              {i}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
