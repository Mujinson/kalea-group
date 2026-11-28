import { useEffect, useMemo, useState } from 'react';
import { jobRevenue } from '@/lib/margin';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, KpiCard, CrmEmptyState } from '@/components/admin/crm-ui';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingUp, TrendingDown, Percent, AlertTriangle } from 'lucide-react';
import { fetchAllRows } from '@/lib/fetchAllRows';
import {
  computeAllSitesEconomics,
  computeSiteEconomics,
  OUTCOME_META,
  type AttendanceOverrideRow,
  type EconomicsOutcome,
} from '@/lib/siteEconomics';

const db = supabase as any;

const eur = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
const pct = (n: number) => `${(n || 0).toFixed(1)}%`;

interface MarginRow {
  key: string;
  label: string;
  subtitle: string;
  date: string | null;
  salespersonId: string | null;
  salespersonName: string;
  revenue: number;
  materials: number;
  labor: number;
  expenses: number;
  plannedExpenses: number;
  margin: number;
  marginPct: number;
  outcome: EconomicsOutcome;
  marginWithPlanned: number;
  outcomeWithPlanned: EconomicsOutcome;
  siteId: string | null;
  saleId: string | null;
}

export default function AdminMargini() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MarginRow[]>([]);
  const [threshold, setThreshold] = useState(25);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const [people, setPeople] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [sitesR, salesR, saleItemsR, matsR, expR, entriesR, workersR, ovR, settingsR, spR, prodR, invR, psR] = await Promise.all([
        db.from('construction_sites').select('id,title,project_name,city,budget_amount,sale_id,quote_id,salesperson_id,start_date,planned_start_date,created_at,latitude,longitude,travel_mode'),
        db.from('sales').select('id,sale_date,total_amount,sale_price,customer_name,created_at'),
        db.from('sale_items').select('sale_id,product_type,product_variant,quantity_sqm,unit_price,total_price'),
        db.from('site_materials').select('site_id,quantity,unit_cost,total_cost,product_id'),
        db.from('site_expenses').select('site_id,amount,notes,expense_type'),
        fetchAllRows(
          db
            .from('worker_time_entries')
            .select('id,user_id,worker_id,site_id,event_type,event_at,event_date,latitude,longitude,accuracy_m,distance_from_site_m,is_at_site,notes')
            .order('event_at', { ascending: true })
        ),
        db.from('workers').select('id,user_id,first_name,last_name,hourly_cost'),
        db.from('site_attendance_overrides').select('site_id,worker_id,work_date,decision,note'),
        db.from('crew_cost_settings').select('trasferta_km').limit(1).maybeSingle(),
        db.from('salespeople').select('id,first_name,last_name'),
        db.from('catalog_products').select('id,product_code,net_cost'),
        db.from('customer_invoices').select('id,site_id,quote_id,subtotal,total,status,paid_amount,invoice_date,due_date,created_at'),
        db.from('payment_schedules').select('sale_id,invoice_id,amount,is_paid,paid_date,due_date,is_invoiced,invoiced_amount'),
      ]);
      const allInvoices = invR.data || [];
      const allSchedules = psR.data || [];

      const sites = sitesR.data || [];
      const sales = salesR.data || [];
      const saleItems = saleItemsR.data || [];
      const materials = matsR.data || [];
      const expenses = expR.data || [];
      const entries: any[] = entriesR || [];
      const workers = workersR.data || [];
      const overrides: AttendanceOverrideRow[] = ovR.data || [];
      const trasfertaKm = Number(settingsR.data?.trasferta_km || 150);
      const sps = spR.data || [];
      const products = prodR.data || [];

      setPeople(sps.map((s: any) => ({ id: s.id, name: `${s.first_name || ''} ${s.last_name || ''}`.trim() })));

      const prodByCode = new Map(products.map((p: any) => [String(p.product_code || '').toUpperCase(), p]));
      const spName = new Map(sps.map((s: any) => [s.id, `${s.first_name || ''} ${s.last_name || ''}`.trim()]));

      const ecoBySite = computeAllSitesEconomics({
        sites,
        invoices: allInvoices,
        schedules: allSchedules,
        materials,
        expenses,
        timeEntries: entries,
        workers,
        overrides,
        trasfertaKm,
      });

      // --- materiali da sale_items (per vendite senza cantiere) ---
      const matBySale = new Map<string, number>();
      for (const it of saleItems) {
        const p: any =
          prodByCode.get(String(it.product_variant || '').toUpperCase()) ||
          prodByCode.get(String(it.product_type || '').toUpperCase());
        const cost = p?.net_cost != null
          ? Number(p.net_cost) * Number(it.quantity_sqm || 0)
          : 0;
        matBySale.set(it.sale_id, (matBySale.get(it.sale_id) || 0) + (cost || 0));
      }

      const saleById = new Map(sales.map((s: any) => [s.id, s]));
      const usedSales = new Set<string>();
      const out: MarginRow[] = [];

      for (const s of sites) {
        const sale: any = s.sale_id ? saleById.get(s.sale_id) : null;
        if (sale) usedSales.add(sale.id);
        const eco = ecoBySite.get(s.id)!;
        const sold = Number(sale?.total_amount ?? sale?.sale_price ?? 0);
        out.push({
          key: `site-${s.id}`,
          label: s.title || s.project_name || 'Cantiere',
          subtitle: [s.city, sale ? `venduto ${eur(sold)}` : 'senza vendita'].filter(Boolean).join(' · '),
          date: sale?.sale_date || s.start_date || s.planned_start_date || s.created_at?.slice(0, 10) || null,
          salespersonId: s.salesperson_id || null,
          salespersonName: String((s.salesperson_id && spName.get(s.salesperson_id)) || '—'),
          revenue: eco.revenue,
          materials: eco.materialsCost,
          labor: eco.laborCost,
          expenses: eco.sustainedExpenses,
          plannedExpenses: eco.plannedExpenses,
          margin: eco.margin,
          marginPct: eco.marginPct,
          outcome: eco.outcome,
          marginWithPlanned: eco.marginWithPlanned,
          outcomeWithPlanned: eco.outcomeWithPlanned,
          siteId: s.id,
          saleId: sale?.id || null,
        });
      }

      for (const sale of sales) {
        if (usedSales.has(sale.id)) continue;
        const revenue = jobRevenue({ saleId: sale.id }, allInvoices, allSchedules);
        const matCost = matBySale.get(sale.id) || 0;
        const eco = computeSiteEconomics({
          siteId: `sale-${sale.id}`,
          revenue,
          materials: matCost > 0 ? [{ total_cost: matCost }] : [],
          expenses: [],
          timeEntries: [],
          workers: [],
          siteCoords: {},
          isTravel: false,
        });
        out.push({
          key: `sale-${sale.id}`,
          label: sale.customer_name || 'Vendita',
          subtitle: `Vendita senza cantiere · venduto ${eur(Number(sale.total_amount ?? sale.sale_price ?? 0))}`,
          date: sale.sale_date || sale.created_at?.slice(0, 10) || null,
          salespersonId: null,
          salespersonName: '—',
          revenue: eco.revenue,
          materials: eco.materialsCost,
          labor: eco.laborCost,
          expenses: eco.sustainedExpenses,
          plannedExpenses: eco.plannedExpenses,
          margin: eco.margin,
          marginPct: eco.marginPct,
          outcome: eco.outcome,
          marginWithPlanned: eco.marginWithPlanned,
          outcomeWithPlanned: eco.outcomeWithPlanned,
          siteId: null,
          saleId: sale.id,
        });
      }

      out.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setRows(out);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (from && (!r.date || r.date < from)) return false;
        if (to && (!r.date || r.date > to)) return false;
        if (salesperson && r.salespersonId !== salesperson) return false;
        return true;
      }),
    [rows, from, to, salesperson],
  );

  const stats = useMemo(() => {
    const withRev = filtered.filter((r) => r.revenue > 0);
    const revenue = withRev.reduce((s, r) => s + r.revenue, 0);
    const margin = withRev.reduce((s, r) => s + r.margin, 0);
    const sorted = [...withRev].sort((a, b) => b.marginPct - a.marginPct);
    return {
      avg: revenue > 0 ? (margin / revenue) * 100 : 0,
      revenue,
      margin,
      best: sorted[0] || null,
      worst: sorted[sorted.length - 1] || null,
      below: withRev.filter((r) => r.marginPct < threshold).length,
    };
  }, [filtered, threshold]);

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={['Statistiche', 'Margini']}
        title="Margini per cantiere e vendita"
        subtitle="Fatturato imponibile, costi reali (materiali, manodopera, spese) e margine netto"
      />

      <div className="crm-card p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-crm-ink-muted">Dal</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-crm-ink-muted">Al</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-crm-ink-muted">Venditore</Label>
          <select
            className="w-full h-10 px-3 rounded-crm-sm border border-crm-border bg-white text-[13px]"
            value={salesperson}
            onChange={(e) => setSalesperson(e.target.value)}
          >
            <option value="">Tutti</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name || p.id.slice(0, 6)}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-crm-ink-muted">Soglia margine %</Label>
          <Input type="number" min={0} max={100} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiCard label="Margine medio" value={pct(stats.avg)} hint={`${eur(stats.margin)} su ${eur(stats.revenue)}`} tone="primary" icon={<Percent className="w-4 h-4" />} />
        <KpiCard label="Migliore" value={stats.best ? pct(stats.best.marginPct) : '—'} hint={stats.best?.label} tone="success" icon={<TrendingUp className="w-4 h-4" />} />
        <KpiCard label="Peggiore" value={stats.worst ? pct(stats.worst.marginPct) : '—'} hint={stats.worst?.label} tone="danger" icon={<TrendingDown className="w-4 h-4" />} />
        <KpiCard label={`Sotto ${threshold}%`} value={stats.below} hint="righe da verificare" tone="warning" icon={<AlertTriangle className="w-4 h-4" />} />
      </div>

      <div className="crm-card overflow-auto">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-crm-primary" /></div>
        ) : filtered.length === 0 ? (
          <CrmEmptyState title="Nessun dato" description="Nessun cantiere o vendita nel periodo selezionato." />
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-crm-ink-muted border-b border-crm-border">
                <th className="p-3">Cantiere / Vendita</th>
                <th className="p-3">Data</th>
                <th className="p-3">Venditore</th>
                <th className="p-3 text-right">Fatturato (imponibile)</th>
                <th className="p-3 text-right">Materiali</th>
                <th className="p-3 text-right">Manodopera</th>
                <th className="p-3 text-right">Spese</th>
                <th className="p-3 text-right">Previste</th>
                <th className="p-3 text-right">Margine attuale</th>
                <th className="p-3 text-right">Margine previsto</th>
                <th className="p-3 text-right">Margine %</th>
                <th className="p-3 text-right">Esito</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const low = r.revenue > 0 && r.marginPct < threshold;
                return (
                  <tr key={r.key} className={`border-b border-crm-border/60 ${low ? 'bg-crm-danger-soft' : ''}`}>
                    <td className="p-3">
                      <div className="font-medium text-crm-ink">{r.label}</div>
                      <div className="text-[11px] text-crm-ink-subtle">{r.subtitle}</div>
                    </td>
                    <td className="p-3 text-crm-ink-muted">{r.date || '—'}</td>
                    <td className="p-3 text-crm-ink-muted">{r.salespersonName}</td>
                    <td className="p-3 text-right">{eur(r.revenue)}</td>
                    <td className="p-3 text-right text-crm-ink-muted">{eur(r.materials)}</td>
                    <td className="p-3 text-right text-crm-ink-muted">{eur(r.labor)}</td>
                    <td className="p-3 text-right text-crm-ink-muted">{eur(r.expenses)}</td>
                    <td className="p-3 text-right text-crm-ink-muted">{r.plannedExpenses > 0 ? eur(r.plannedExpenses) : '—'}</td>
                    <td className={`p-3 text-right font-semibold ${OUTCOME_META[r.outcome].textClass}`}>{eur(r.margin)}</td>
                    <td className={`p-3 text-right font-semibold ${OUTCOME_META[r.outcomeWithPlanned].textClass}`}>{eur(r.marginWithPlanned)}</td>
                    <td className={`p-3 text-right font-semibold ${low ? 'text-crm-danger' : ''}`}>{r.revenue > 0 ? pct(r.marginPct) : '—'}</td>
                    <td className="p-3 text-right">
                      <Badge className={OUTCOME_META[r.outcome].badgeClass}>{OUTCOME_META[r.outcome].label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
