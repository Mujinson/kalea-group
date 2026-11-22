import { costOccurrences } from '@/lib/companyProfit';
import { yearlyFactor } from '@/lib/finance';

/** Riga minima di fixed_costs usata dai calcoli. */
export type FixedCostRow = { id?: string; amount: number | string | null; frequency?: string | null; cost_date?: string | null; created_at?: string | null; description?: string | null; category?: string | null };

/** Costo mensile equivalente di un costo ricorrente (una tantum = 0). */
export const monthlyEquivalent = (r: FixedCostRow) => (Number(r.amount || 0) * yearlyFactor(r.frequency)) / 12;

/** Media mensile dei costi fissi ricorrenti. */
export const fixedMonthlyTotal = (rows: FixedCostRow[]) => rows.reduce((s, r) => s + monthlyEquivalent(r), 0);

/**
 * Costi fissi di competenza nel periodo [from, to] (YYYY-MM-DD).
 * Regola unica (companyProfit.costOccurrences): i ricorrenti partono dal mese di cost_date
 * e sono spalmati sui mesi coperti; una tantum conta solo nella sua data.
 */
export function fixedCostsInPeriod(rows: FixedCostRow[], from: string, to: string): number {
  let total = 0;
  for (const r of rows) {
    const date = (r.cost_date || r.created_at || '').slice(0, 10);
    if (!date) continue;
    for (const o of costOccurrences({ key: r.id || '', label: '', amount: Number(r.amount || 0), date, frequency: r.frequency || undefined, category: '', verified: false }, from, to)) total += o.amount;
  }
  return Math.round(total * 100) / 100;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** Costi fissi di competenza nel mese (month 0-11). */
export const fixedCostsInMonth = (rows: FixedCostRow[], year: number, month: number) =>
  fixedCostsInPeriod(rows, iso(new Date(year, month, 1)), iso(new Date(year, month + 1, 0)));
