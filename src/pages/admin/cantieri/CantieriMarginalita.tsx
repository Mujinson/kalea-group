import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CrmPageHeader, CrmKpiTile, CrmKpiRow } from '@/components/admin/CrmShell';
import { DataTable } from '@/components/admin/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fmtEur } from '@/lib/finance';
import { marginColor } from '@/components/admin/cantieri/SiteEconomics';
import { fetchAllRows } from '@/lib/fetchAllRows';
import { computeAllSitesEconomics, OUTCOME_META, type AttendanceOverrideRow } from '@/lib/siteEconomics';
import { Percent, TrendingDown, TrendingUp } from 'lucide-react';
import { fixedMonthlyTotal } from '@/lib/fixedCosts';

const CantieriMarginalita = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['cantieri-marginalita'],
    queryFn: async () => {
      const [sites, cInv, ps, mats, exp, workers, overrides, settings, fixed, timeEntries] = await Promise.all([
        supabase.from('construction_sites').select('id, title, city, status, budget_amount, sale_id, quote_id, latitude, longitude, travel_mode'),
        supabase.from('customer_invoices').select('id, site_id, quote_id, subtotal, total, status, paid_amount, invoice_date, due_date, created_at'),
        supabase.from('payment_schedules').select('sale_id, invoice_id, amount, is_paid, paid_date, due_date, is_invoiced, invoiced_amount'),
        supabase.from('site_materials').select('site_id, total_cost, quantity, unit_cost'),
        supabase.from('site_expenses').select('site_id, amount, notes, expense_type'),
        supabase.from('workers').select('id, user_id, first_name, last_name, hourly_cost'),
        supabase.from('site_attendance_overrides').select('site_id, worker_id, work_date, decision, note'),
        supabase.from('crew_cost_settings').select('trasferta_km').limit(1).maybeSingle(),
        supabase.from('fixed_costs').select('amount, frequency'),
        fetchAllRows(
          supabase
            .from('worker_time_entries')
            .select('id, user_id, worker_id, event_type, event_at, event_date, latitude, longitude, accuracy_m, site_id, distance_from_site_m, is_at_site, notes')
            .order('event_at', { ascending: true })
        ),
      ]);
      if (sites.error) throw sites.error;

      const ecoMap = computeAllSitesEconomics({
        sites: (sites.data || []) as any[],
        invoices: (cInv.data || []) as any[],
        schedules: (ps.data || []) as any[],
        materials: (mats.data || []) as any[],
        expenses: (exp.data || []) as any[],
        timeEntries: (timeEntries || []) as any[],
        workers: (workers.data || []) as any[],
        overrides: (overrides.data || []) as AttendanceOverrideRow[],
        trasfertaKm: Number(settings.data?.trasferta_km || 150),
      });

      const rows = (sites.data || []).map((s: any) => {
        const eco = ecoMap.get(s.id)!;
        return {
          ...s,
          revenue: eco.revenue,
          materialsCost: eco.materialsCost,
          laborCost: eco.laborCost,
          sustainedExpenses: eco.sustainedExpenses,
          plannedExpenses: eco.plannedExpenses,
          costs: eco.totalCost,
          margin: eco.margin,
          marginPct: eco.marginPct,
          outcome: eco.outcome,
          marginWithPlanned: eco.marginWithPlanned,
          outcomeWithPlanned: eco.outcomeWithPlanned,
        };
      });
      const generalMonthly = fixedMonthlyTotal((fixed.data || []) as any[]);
      return { rows, generalMonthly };
    },
  });

  const rows = useMemo(
    () => [...(data?.rows || [])].filter((r: any) => r.revenue > 0 || r.costs > 0 || r.plannedExpenses > 0).sort((a: any, b: any) => b.margin - a.margin),
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
        subtitle="Economia completa per commessa: ricavo netto, materiali, manodopera, spese sostenute e previste"
      />

      <CrmKpiRow>
        <CrmKpiTile label="Ricavi (imponibile)" value={fmtEur(totRev)} color="green" icon={<TrendingUp className="w-4 h-4" />} />
        <CrmKpiTile label="Costi sostenuti (netto)" value={fmtEur(totCost)} color="orange" icon={<TrendingDown className="w-4 h-4" />} />
        <CrmKpiTile label="Margine attuale" value={fmtEur(totMargin)} color={totMargin >= 0 ? 'green' : 'red'} icon={<Percent className="w-4 h-4" />} />
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
          { key: 'revenue', header: 'Ricavo netto', sortable: true, className: 'text-right', accessor: (r) => r.revenue, cell: (r) => fmtEur(r.revenue) },
          { key: 'materialsCost', header: 'Materiali', sortable: true, className: 'text-right', accessor: (r) => r.materialsCost, cell: (r) => fmtEur(r.materialsCost) },
          { key: 'laborCost', header: 'Manodopera', sortable: true, className: 'text-right', accessor: (r) => r.laborCost, cell: (r) => fmtEur(r.laborCost) },
          { key: 'sustainedExpenses', header: 'Spese', sortable: true, className: 'text-right', accessor: (r) => r.sustainedExpenses, cell: (r) => fmtEur(r.sustainedExpenses) },
          { key: 'plannedExpenses', header: 'Previste', sortable: true, className: 'text-right text-muted-foreground', accessor: (r) => r.plannedExpenses, cell: (r) => (r.plannedExpenses > 0 ? fmtEur(r.plannedExpenses) : '—') },
          {
            key: 'margin', header: 'Margine attuale', sortable: true, className: 'text-right font-semibold', accessor: (r) => r.margin,
            cell: (r) => <span className={OUTCOME_META[r.outcome].textClass}>{fmtEur(r.margin)}</span>,
          },
          {
            key: 'marginWithPlanned', header: 'Margine previsto', sortable: true, className: 'text-right font-semibold', accessor: (r) => r.marginWithPlanned,
            cell: (r) => <span className={OUTCOME_META[r.outcomeWithPlanned].textClass}>{fmtEur(r.marginWithPlanned)}</span>,
          },
          {
            key: 'outcome', header: 'Esito', sortable: true, accessor: (r) => r.outcome,
            cell: (r) => (
              <div className="flex items-center gap-2">
                <Badge className={OUTCOME_META[r.outcome].badgeClass}>{OUTCOME_META[r.outcome].label}</Badge>
                <span className={`inline-block w-2 h-2 rounded-full ${marginColor(r.marginPct)}`} title={`${r.marginPct.toFixed(1)}%`} />
              </div>
            ),
          },
        ]}
      />

      <Card className="bg-white">
        <CardContent className="p-4 text-xs text-muted-foreground">
          Tutti i valori usano il motore economico unico di commessa (imponibile netto, materiali + spese materiali, manodopera entro 3 km, spese sostenute; le spese <strong>PREVISTO</strong> incidono solo sul margine previsto). I costi generali restano fuori e valgono
          <span className="font-semibold text-foreground"> {fmtEur(data?.generalMonthly || 0)}/mese</span>.
        </CardContent>
      </Card>
    </div>
  );
};

export default CantieriMarginalita;
