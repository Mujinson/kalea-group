import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ScadenzaOrigin = 'Fattura fornitore' | 'Costo fisso' | 'Costo variabile';

export interface ScadenzaRow {
  id: string;
  date: string | null;
  who: string;
  what: string;
  amount: number;
  origin: ScadenzaOrigin;
  link?: string;
}

/**
 * Scadenzario unificato: fatture fornitori non pagate + costi fissi con
 * prossima scadenza + costi variabili non pagati.
 */
export const useScadenzario = () => {
  return useQuery({
    queryKey: ['scadenzario'],
    queryFn: async (): Promise<ScadenzaRow[]> => {
      const [inv, fixed, variable] = await Promise.all([
        supabase
          .from('supplier_invoices')
          .select('id, invoice_number, due_date, invoice_date, total, paid_amount, status, suppliers(name)')
          .neq('status', 'pagata'),
        supabase.from('fixed_costs').select('id, description, amount, next_due_date, cost_date, is_paid, person_name').eq('is_paid', false),
        supabase.from('variable_costs').select('id, description, amount, cost_date, is_paid').eq('is_paid', false),
      ]);

      if (inv.error) throw inv.error;
      if (fixed.error) throw fixed.error;
      if (variable.error) throw variable.error;

      const rows: ScadenzaRow[] = [];

      (inv.data || []).forEach((i: any) => {
        rows.push({
          id: `si-${i.id}`,
          date: i.due_date || i.invoice_date,
          who: i.suppliers?.name || 'Fornitore',
          what: `Fattura ${i.invoice_number}`,
          amount: Math.max(0, Number(i.total || 0) - Number(i.paid_amount || 0)),
          origin: 'Fattura fornitore',
          link: '/admin/fornitori',
        });
      });

      (fixed.data || []).forEach((c: any) => {
        rows.push({
          id: `fc-${c.id}`,
          date: c.next_due_date || c.cost_date,
          who: c.person_name || 'Costo fisso',
          what: c.description,
          amount: Number(c.amount || 0),
          origin: 'Costo fisso',
          link: '/admin/costi',
        });
      });

      (variable.data || []).forEach((c: any) => {
        rows.push({
          id: `vc-${c.id}`,
          date: c.cost_date,
          who: '—',
          what: c.description,
          amount: Number(c.amount || 0),
          origin: 'Costo variabile',
          link: '/admin/costi',
        });
      });

      return rows.sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
    },
  });
};
