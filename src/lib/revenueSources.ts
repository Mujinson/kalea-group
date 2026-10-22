type Schedule = {
  invoice_id?: string | null;
  is_paid: boolean;
  paid_date?: string | null;
  due_date?: string | null;
};

type Invoice = { id: string; status?: string | null };

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