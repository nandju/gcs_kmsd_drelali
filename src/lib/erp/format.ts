import type { Currency } from './types';

// Les montants sont stockés en unités entières (XOF sans décimales,
// CAD en dollars entiers dans la démonstration) afin d'éviter les
// erreurs d'arrondi des nombres flottants.

export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(
    new Date(iso),
  );
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function isPast(iso?: string): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function todayIso(): string {
  return new Date().toISOString();
}
