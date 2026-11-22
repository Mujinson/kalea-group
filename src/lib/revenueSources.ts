type Schedule = {
  invoice_id?: string | null;
  is_paid: boolean;
  paid_date?: string | null;
  due_date?: string | null;
  amount?: number | string | null;
  is_invoiced?: boolean | null;
  invoiced_amount?: number | string | null;
};

type Invoice = {
  id: string;
  status?: string | null;
  total?: number | string | null;
  subtotal?: number | string | null;
  paid_amount?: number | string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  created_at?: string | null;
};

const num = (v: number | string | null | undefined) => Number(v || 0);
const round2 = (v: number) => Math.round(v * 100) / 100;

/** Cash belongs to every installment; only invoices without installments add cash separately. */
export function revenueSources<S extends Schedule, I extends Invoice>(
  schedules: S[],
  invoices: I[],
  inPeriod: (date?: string | null) => boolean,
) {
  const invoiceIds = new Set(schedules.map((row) => row.invoice_id).filter(Boolean));
  const paidPs = schedules.filter((row) => row.is_paid && inPeriod(row.paid_date || row.due_date));
  return {
    paidPs,
    unpaidPs: schedules.filter((row) => !row.is_paid),
    standalone: invoices.filter((row) => row.status !== 'annullata' && !invoiceIds.has(row.id)),
    // Linked invoices already contribute to billed totals through the invoice record.
    unlinkedPaidPs: paidPs.filter((row) => !row.invoice_id),
  };
}

export type RevenueSummaryOptions = {
  today?: string;
  /** 'gross' (default) uses invoice.total; 'net' uses invoice.subtotal ?? invoice.total. */
  basis?: 'gross' | 'net';
};

/**
 * Single source of truth for CRM revenue totals:
 * - fatturato: non-cancelled invoices in period + paid installments marked is_invoiced without a linked invoice
 * - incassato: paid installments in period + paid_amount of standalone invoices in period
 * - daIncassare: unpaid installments + open balance of standalone invoices in period
 * - scaduto: overdue subset (due_date < today) of daIncassare
 */
export function computeRevenueSummary<S extends Schedule, I extends Invoice>(
  schedules: S[],
  invoices: I[],
  inPeriod: (date?: string | null) => boolean = () => true,
  options: RevenueSummaryOptions = {},
) {
  const todayStr = options.today ?? new Date().toISOString().slice(0, 10);
  const basis = options.basis ?? 'gross';
  const invAmount = (inv: I) => (basis === 'net' ? num(inv.subtotal ?? inv.total) : num(inv.total));
  const invDate = (inv: I) => inv.invoice_date || inv.created_at;

  const { paidPs, unpaidPs, standalone, unlinkedPaidPs } = revenueSources(schedules, invoices, inPeriod);

  const billedInvoices = invoices.filter((inv) => inv.status !== 'annullata' && inPeriod(invDate(inv)));
  const unlinkedInvoicedPs = unlinkedPaidPs.filter((row) => Boolean(row.is_invoiced));

  const standalonePaid = standalone.filter((inv) => num(inv.paid_amount) > 0 && inPeriod(invDate(inv)));
  const standaloneOpen = standalone.filter((inv) => num(inv.total) - num(inv.paid_amount) > 0.01 && inPeriod(invDate(inv)));

  const overduePs = unpaidPs.filter((row) => Boolean(row.due_date && row.due_date < todayStr));
  const overdueStandalone = standaloneOpen.filter((inv) => {
    const d = inv.due_date || invDate(inv);
    return Boolean(d && d < todayStr);
  });

  const fatturato = round2(
    billedInvoices.reduce((s, inv) => s + invAmount(inv), 0) +
    unlinkedInvoicedPs.reduce((s, row) => s + num(row.invoiced_amount ?? row.amount), 0),
  );
  const incassato = round2(
    paidPs.reduce((s, row) => s + num(row.amount), 0) +
    standalonePaid.reduce((s, inv) => s + num(inv.paid_amount), 0),
  );
  const daIncassare = round2(
    unpaidPs.reduce((s, row) => s + num(row.amount), 0) +
    standaloneOpen.reduce((s, inv) => s + round2(num(inv.total) - num(inv.paid_amount)), 0),
  );
  const scaduto = round2(
    overduePs.reduce((s, row) => s + num(row.amount), 0) +
    overdueStandalone.reduce((s, inv) => s + round2(num(inv.total) - num(inv.paid_amount)), 0),
  );

  return {
    fatturato,
    incassato,
    daIncassare,
    scaduto,
    billedInvoices,
    unlinkedInvoicedPs,
    paidPs,
    unpaidPs,
    standalone,
    standalonePaid,
    standaloneOpen,
    unlinkedPaidPs,
    overduePs,
    overdueStandalone,
  };
}