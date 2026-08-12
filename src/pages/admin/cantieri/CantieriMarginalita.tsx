import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CrmPageHeader, CrmKpiTile, CrmKpiRow } from '@/components/admin/CrmShell';
import { DataTable } from '@/components/admin/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { fmtEur } from '@/lib/finance';
import { marginColor } from '@/components/admin/cantieri/SiteEconomics';
import { Percent, TrendingDown, TrendingUp } from 'lucide-react';

const CantieriMarginalita = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['cantieri-marginalita'],
    queryFn: async () => {
      const [sites, cInv, sInv, exp, fixed] = await Promise.all([
        supabase.from('construction_sites').select('id, title, city, status, budget_amount'),
        supabase.from('customer_invoices').select('site_id, total'),
        supabase.from('supplier_invoices').select('site_id, total'),
        supabase.from('site_expenses').select('site_id, amount'),
        supabase.from('fixed_costs').select('amount, frequency'),
      ]);
      if (sites.error) throw sites.error;
      const rows = (sites.data || []).map((s: any) => {
        const revenue = (cInv.data || []).filter((r: any) => r.site_id === s.id).reduce((a: number, r: any) => a + Number(r.total || 0), 0);
        const costs =
          (sInv.data || []).filter((r: any) => r.site_id === s.id).reduce((a: number, r: any) => a + Number(r.total || 0), 0) +
          (exp.data || []).filter((r: any) => r.site_id === s.id).reduce((a: number, r: any) => a + Number(r.amount || 0), 0);
        const margin = revenue - costs;
        const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;
        return { ...s, revenue, costs, margin, marginPct };
      });
      const generalMonthly = (fixed.data || []).reduce((a: number, c: any) => {
        const f = c.frequency === 'mensile' ? 1 : c.frequency === 'trimestrale' ? 1 / 3 : c.frequency === 'annuale' ? 1 / 12 : 0;
        return a + Number(c.amount || 0) * f;
      }, 0);
      return { rows, generalMonthly };
    },
  });

  const rows = useMemo(
    () => [...(data?.rows || [])].filter((r: any) => r.revenue > 0 || r.costs > 0).sort((a: any, b: any) => b.marginPct - a.marginPct),
    [data],
  );

  const totRev = rows.reduce((s: number, r: any) => s + r.revenue, 0);
  const totCost = rows.reduce((s: number, r: any) => s + r.costs, 0);
  const totMargin = totRev - totCost;

  return (
    <div className="space-y-4">
      <CrmPageHeader
        breadcrumb={['CRM', 'Cantieri', 'Marginalità']}
        title="Marginalità cantieri"
        subtitle="Classifica delle commesse per margine percentuale"
      />

      <CrmKpiRow>
        <CrmKpiTile label="Ricavi commesse" value={fmtEur(totRev)} color="green" icon={<TrendingUp className="w-4 h-4" />} />
        <CrmKpiTile label="Costi commesse" value={fmtEur(totCost)} color="orange" icon={<TrendingDown className="w-4 h-4" />} />
        <CrmKpiTile label="Margine totale" value={fmtEur(totMargin)} color={totMargin >= 0 ? 'green' : 'red'} icon={<Percent className="w-4 h-4" />} />
        <CrmKpiTile label="Costi generali / mese" value={fmtEur(data?.generalMonthly || 0)} color="slate" hint="Non imputati alle commesse" />
      </CrmKpiRow>

      <DataTable
        data={rows}
        loading={isLoading}
        searchPlaceholder="Cerca cantiere…"
        searchKeys={['title', 'city']}
        emptyTitle="Nessun dato di marginalità"
        emptyDescription="Registra fatture clienti e fatture fornitori collegate ai cantieri."
        onRowClick={(r) => navigate(`/admin/cantieri/${r.id}`)}
        columns={[
          { key: 'title', header: 'Cantiere', sortable: true, cell: (r) => <span className="font-medium">{r.title}</span> },
          { key: 'city', header: 'Città' },
          { key: 'revenue', header: 'Ricavi', sortable: true, className: 'text-right', accessor: (r) => r.revenue, cell: (r) => fmtEur(r.revenue) },
          { key: 'costs', header: 'Costi', sortable: true, className: 'text-right', accessor: (r) => r.costs, cell: (r) => fmtEur(r.costs) },
          {
            key: 'margin', header: 'Margine', sortable: true, className: 'text-right font-semibold', accessor: (r) => r.margin,
            cell: (r) => <span className={r.margin >= 0 ? 'text-green-600' : 'text-red-600'}>{fmtEur(r.margin)}</span>,
          },
          {
            key: 'marginPct', header: '%', sortable: true, accessor: (r) => r.marginPct,
            cell: (r) => (
              <div className="flex items-center gap-2 min-w-[120px]">
                <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
                  <div className={`h-full ${marginColor(r.marginPct)}`} style={{ width: `${Math.min(100, Math.max(0, r.marginPct))}%` }} />
                </div>
                <span className="text-[12px] tabular-nums w-12 text-right">{r.marginPct.toFixed(1)}%</span>
              </div>
            ),
          },
        ]}
      />

      <Card className="bg-white">
        <CardContent className="p-4 text-xs text-muted-foreground">
          I costi generali (stipendi, furgone, commercialista) restano fuori dal margine di commessa e sono mostrati a parte:
          <span className="font-semibold text-foreground"> {fmtEur(data?.generalMonthly || 0)}/mese</span>.
        </CardContent>
      </Card>
    </div>
  );
};

export default CantieriMarginalita;
