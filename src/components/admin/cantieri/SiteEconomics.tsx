import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtEur } from '@/lib/finance';
import { TrendingUp } from 'lucide-react';

export const marginColor = (pct: number) => (pct >= 20 ? 'bg-green-500' : pct >= 0 ? 'bg-amber-500' : 'bg-red-500');

export function SiteEconomics({ siteId, budget }: { siteId: string; budget?: number | null }) {
  const { data } = useQuery({
    queryKey: ['site-economics', siteId],
    queryFn: async () => {
      const [inv, sup, exp] = await Promise.all([
        supabase.from('customer_invoices').select('subtotal,total').eq('site_id', siteId),
        supabase.from('supplier_invoices').select('subtotal,total').eq('site_id', siteId),
        supabase.from('site_expenses').select('amount').eq('site_id', siteId),
      ]);
      if (inv.error) throw inv.error;
      if (sup.error) throw sup.error;
      if (exp.error) throw exp.error;
      // Imponibile contro imponibile: l'IVA non è né ricavo né costo.
      const net = (r: any) => Number(r.subtotal ?? r.total ?? 0);
      const revenue = (inv.data || []).reduce((s: number, r: any) => s + net(r), 0);
      const costs =
        (sup.data || []).reduce((s: number, r: any) => s + net(r), 0) +
        (exp.data || []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
      return { revenue, costs };
    },
  });

  const revenue = data?.revenue || 0;
  const costs = data?.costs || 0;
  const margin = revenue - costs;
  const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;
  const ratio = revenue > 0 ? Math.min(100, (costs / revenue) * 100) : 0;
  const budgetVal = Number(budget || 0);

  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Economics commessa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Ricavi (imponibile)</p>
            <p className="text-lg font-bold">{fmtEur(revenue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Costi materiali (imponibile)</p>
            <p className="text-lg font-bold text-orange-600">{fmtEur(costs)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Margine materiali</p>
            <p className={`text-lg font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmtEur(margin)} <span className="text-xs">({marginPct.toFixed(1)}%)</span>
            </p>
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div className={`h-full ${marginColor(marginPct)}`} style={{ width: `${ratio || (revenue === 0 && costs > 0 ? 100 : 0)}%` }} />
        </div>
        <p className="text-[11px] text-muted-foreground">Costi su ricavi: {revenue > 0 ? `${((costs / revenue) * 100).toFixed(1)}%` : '—'}</p>

        {budgetVal > 0 && (
          <p className="text-xs text-muted-foreground">
            Budget preventivato {fmtEur(budgetVal)} —{' '}
            <span className={costs <= budgetVal ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {costs <= budgetVal ? `sotto di ${fmtEur(budgetVal - costs)}` : `sopra di ${fmtEur(costs - budgetVal)}`}
            </span>
          </p>
        )}

        <p className="text-[11px] text-muted-foreground italic">
          I costi generali (stipendi, furgone, commercialista) non sono imputati alla commessa: questo è margine di commessa, non utile netto.
        </p>
      </CardContent>
    </Card>
  );
}

export default SiteEconomics;
