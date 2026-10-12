import type {
  Expense,
  Invoice,
  InvoiceStatus,
  Mission,
  Payment,
  Quote,
  QuoteVersion,
} from './types';
import { isPast } from './format';

/* --------------------------- Cotations --------------------------- */

export function currentVersion(quote: Quote): QuoteVersion {
  return quote.versions[quote.versions.length - 1];
}

export function quoteLinesTotal(version: QuoteVersion): number {
  return version.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
}

/* ---------------------------- Factures --------------------------- */

export function invoiceTotal(invoice: Invoice): number {
  return invoice.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
}

export function invoicePaidAmount(
  invoice: Invoice,
  payments: Payment[],
): number {
  return payments.reduce(
    (s, p) =>
      s +
      p.allocations
        .filter((a) => a.invoiceId === invoice.id)
        .reduce((x, a) => x + a.amount, 0),
    0,
  );
}

export function invoiceBalance(invoice: Invoice, payments: Payment[]): number {
  return invoiceTotal(invoice) - invoicePaidAmount(invoice, payments);
}

export function derivedInvoiceStatus(
  invoice: Invoice,
  payments: Payment[],
): InvoiceStatus {
  if (invoice.status === 'BROUILLON' || invoice.status === 'A_VALIDER') {
    return invoice.status;
  }
  const paid = invoicePaidAmount(invoice, payments);
  const total = invoiceTotal(invoice);
  if (paid <= 0) return 'EMISE';
  if (paid < total) return 'PARTIELLEMENT_PAYEE';
  return 'PAYEE';
}

// ÉCHUE est une condition calculée, pas un statut stocké.
export function isOverdue(invoice: Invoice, payments: Payment[]): boolean {
  const st = derivedInvoiceStatus(invoice, payments);
  return (
    (st === 'EMISE' || st === 'PARTIELLEMENT_PAYEE') &&
    isPast(invoice.dueDate) &&
    invoiceBalance(invoice, payments) > 0
  );
}

/* ---------------------------- Paiements -------------------------- */

export function paymentAllocated(payment: Payment): number {
  return payment.allocations.reduce((s, a) => s + a.amount, 0);
}

export function paymentUnallocated(payment: Payment): number {
  return payment.amount - paymentAllocated(payment);
}

/* ------------------------------ Marges --------------------------- */

export interface MarginResult {
  computable: boolean;
  reason?: string;
  revenue: number;
  validatedCosts: number;
  submittedCosts: number;
  estimatedCost: number;
  realMargin: number; // revenu retenu − coûts directs validés
  estimatedMargin: number;
}

export function missionMargin(
  mission: Mission,
  expenses: Expense[],
): MarginResult {
  const missionExpenses = expenses.filter((e) => e.missionId === mission.id);
  const validatedCosts = missionExpenses
    .filter((e) => e.status === 'VALIDEE')
    .reduce((s, e) => s + e.amount, 0);
  const submittedCosts = missionExpenses
    .filter((e) => e.status === 'SOUMISE')
    .reduce((s, e) => s + e.amount, 0);
  const revenue = mission.revenue ?? 0;
  const estimatedCost = mission.estimatedCost ?? 0;

  if (mission.revenue === undefined) {
    return {
      computable: false,
      reason: 'Revenu non renseigné — marge non calculable.',
      revenue: 0,
      validatedCosts,
      submittedCosts,
      estimatedCost,
      realMargin: 0,
      estimatedMargin: 0,
    };
  }

  return {
    computable: true,
    revenue,
    validatedCosts,
    submittedCosts,
    estimatedCost,
    realMargin: revenue - validatedCosts,
    estimatedMargin: revenue - estimatedCost,
  };
}
