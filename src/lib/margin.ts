import { computeRevenueSummary } from './revenueSources';

/**
 * Single margin function for the CRM.
 * Revenue = fatturato imponibile (computeRevenueSummary, basis 'net'); costs are net of VAT.
 * margin = revenue − sum(costs); marginPct = margin / revenue × 100 (0 when there is no revenue).
 */
export type MarginCosts = { materials?: number; labor?: number; expenses?: number; other?: number };

const n = (v: unknown) => Number(v || 0);
const r2 = (v: number) => Math.round(v * 100) / 100;

export function computeMargin(revenue: number, costs: MarginCosts | number) {
  const c = typeof costs === 'number' ? { other: costs } : costs;
  const totalCost = r2(n(c.materials) + n(c.labor) + n(c.expenses) + n(c.other));
  const rev = r2(n(revenue));
  const margin = r2(rev - totalCost);
  return { revenue: rev, totalCost, margin, marginPct: rev > 0 ? (margin / rev) * 100 : 0 };
}

type Inv = { id: string; site_id?: string | null; quote_id?: string | null; status?: string | null; total?: any; subtotal?: any; paid_amount?: any; invoice_date?: string | null; created_at?: string | null; due_date?: string | null };
type Sch = { sale_id?: string | null; invoice_id?: string | null; is_paid: boolean; amount?: any; is_invoiced?: boolean | null; invoiced_amount?: any; paid_date?: string | null; due_date?: string | null };
export type JobRef = { siteId?: string | null; saleId?: string | null; quoteId?: string | null };

/** Invoices/installments of one job: invoice.site_id, invoice.quote_id, or installments of the job's sale. */
export function jobDocuments<I extends Inv, S extends Sch>(job: JobRef, invoices: I[], schedules: S[]) {
  const sch = job.saleId ? schedules.filter((s) => s.sale_id === job.saleId) : [];
  const viaSchedule = new Set(sch.map((s) => s.invoice_id).filter(Boolean));
  const inv = invoices.filter((i) =>
    (job.siteId && i.site_id === job.siteId) ||
    (job.quoteId && i.quote_id === job.quoteId) ||
    viaSchedule.has(i.id));
  return { invoices: inv, schedules: sch };
}

/** Fatturato imponibile of one job (same rule as every revenue KPI). */
export function jobRevenue(job: JobRef, invoices: Inv[], schedules: Sch[], inPeriod: (d?: string | null) => boolean = () => true) {
  const d = jobDocuments(job, invoices, schedules);
  return computeRevenueSummary(d.schedules as any[], d.invoices as any[], inPeriod, { basis: 'net' }).fatturato;
}
