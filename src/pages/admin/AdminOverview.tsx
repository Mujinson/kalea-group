import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { fetchAllRows } from '@/lib/fetchAllRows';
import {
  TrendingUp, FileText, HardHat, Target, Users, Wallet,
  AlertTriangle, Package, ChevronRight, ArrowUp, ArrowDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Line, ComposedChart, Cell, Legend,
} from 'recharts';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear,
  startOfQuarter, endOfQuarter, subMonths, subDays, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const eur = (v: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v || 0);
const pct = (v: number) => `${(v || 0).toFixed(1)}%`;

type PeriodKey = 'month' | 'lastMonth' | 'quarter' | 'ytd' | 'last30';

function getPeriodRange(p: PeriodKey): { start: Date; end: Date; prevStart: Date; prevEnd: Date; label: string } {
  const now = new Date();
  switch (p) {
    case 'month': {
      const s = startOfMonth(now), e = endOfMonth(now);
      const ps = startOfMonth(subMonths(now, 1)), pe = endOfMonth(subMonths(now, 1));
      return { start: s, end: e, prevStart: ps, prevEnd: pe, label: format(s, 'MMMM yyyy', { locale: it }) };
    }
    case 'lastMonth': {
      const s = startOfMonth(subMonths(now, 1)), e = endOfMonth(subMonths(now, 1));
      const ps = startOfMonth(subMonths(now, 2)), pe = endOfMonth(subMonths(now, 2));
      return { start: s, end: e, prevStart: ps, prevEnd: pe, label: format(s, 'MMMM yyyy', { locale: it }) };
    }
    case 'quarter': {
      const s = startOfQuarter(now), e = endOfQuarter(now);
      const ps = startOfQuarter(subMonths(s, 3)), pe = endOfQuarter(subMonths(s, 3));
      return { start: s, end: e, prevStart: ps, prevEnd: pe, label: `Q ${format(s, 'yyyy')}` };
    }
    case 'ytd': {
      const s = startOfYear(now), e = endOfYear(now);
      const ps = startOfYear(subMonths(s, 12)), pe = endOfYear(subMonths(s, 12));
      return { start: s, end: e, prevStart: ps, prevEnd: pe, label: `YTD ${format(s, 'yyyy')}` };
    }
    case 'last30':
    default: {
      const s = subDays(now, 30), e = now;
      const ps = subDays(s, 30), pe = s;
      return { start: s, end: e, prevStart: ps, prevEnd: pe, label: 'Ultimi 30 giorni' };
    }
  }
}

const inRange = (d: string | Date | null | undefined, start: Date, end: Date) => {
  if (!d) return false;
  const t = new Date(d).getTime();
  return t >= start.getTime() && t <= end.getTime();
};

// ─────────────────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────────────────
function useCountUp(value: number, durationMs = 900) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0, to = value;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);
  return display;
}

// ─────────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────────
interface KPIProps {
  title: string;
  value: string;
  rawNumeric?: number;
  format?: 'eur' | 'pct' | 'int';
  subtitle?: string;
  delta?: number | null;
  icon: any;
  iconColor?: string;
  semaphore?: 'green' | 'amber' | 'red' | null;
  alert?: boolean;
  badge?: string | number;
  onClick?: () => void;
  period?: string;
  children?: React.ReactNode;
}
function KPICard({ title, value, rawNumeric, format: fmt, subtitle, delta, icon: Icon, iconColor, semaphore, alert, badge, onClick, period, children }: KPIProps) {
  const animated = useCountUp(rawNumeric ?? 0);
  const display = rawNumeric !== undefined
    ? fmt === 'eur' ? eur(animated)
    : fmt === 'pct' ? pct(animated)
    : Math.round(animated).toLocaleString('it-IT')
    : value;

  const semColor = semaphore === 'green' ? '#16a34a' : semaphore === 'amber' ? '#d97706' : semaphore === 'red' ? '#dc2626' : null;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-xl p-5 transition-all ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${alert ? 'ring-1 ring-red-400' : ''}`}
      style={{ border: '1px solid rgba(59,35,20,0.10)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {alert && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">URGENTE</span>
      )}
      {badge !== undefined && !alert && (
        <span className="absolute top-3 right-3 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-orange-500 text-white rounded-full">{badge}</span>
      )}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8A7060' }}>{title}</p>
        <Icon className={`w-4 h-4 ${iconColor || 'text-[#C8A96E]'}`} />
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-semibold tabular-nums" style={{ color: '#1A1008' }}>{display}</div>
        {semColor && <span className="w-2 h-2 rounded-full" style={{ background: semColor }} />}
      </div>
      {delta !== null && delta !== undefined && (
        <div className={`mt-1 flex items-center gap-1 text-xs ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {delta >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(delta).toFixed(1)}%
        </div>
      )}
      {subtitle && <p className="mt-1 text-xs" style={{ color: '#8A7060' }}>{subtitle}</p>}
      {children}
      {period && <p className="mt-2 text-[10px] uppercase tracking-wider text-gray-400">{period}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────
const Empty = ({ msg = 'Nessun dato per questo periodo' }: { msg?: string }) => (
  <div className="flex items-center justify-center h-48 text-sm text-gray-400 italic">{msg}</div>
);

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
const PERIOD_LABELS: Record<PeriodKey, string> = {
  month: 'Questo mese', lastMonth: 'Mese scorso', quarter: 'Trimestre', ytd: 'YTD', last30: 'Ultimi 30gg',
};

const PIPELINE_STAGES = ['nuovo', 'contattato', 'in_trattativa', 'preventivo_inviato', 'cliente', 'perso'];
const STAGE_LABEL: Record<string, string> = {
  nuovo: 'Nuovo', contattato: 'Contattato', in_trattativa: 'In trattativa',
  preventivo_inviato: 'Prev. inviato', cliente: 'Cliente', perso: 'Perso',
};
const STAGE_COLORS = ['#E5E1DA', '#CFC7BA', '#A89A82', '#8C7B6B', '#5E8A4D', '#C0392B'];

const AdminOverview = () => {
  const navigate = useNavigate();
  const { role } = useAdminAuth();
  const isAdmin = role === 'admin';
  const [period, setPeriod] = useState<PeriodKey>('month');
  const range = useMemo(() => getPeriodRange(period), [period]);

  const [lastSync, setLastSync] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Raw data
  const [preventivi, setPreventivi] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [supplierPayments, setSupplierPayments] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [salespeople, setSalespeople] = useState<any[]>([]);
  const [goal, setGoal] = useState<number>(400000);

  const fetchAll = useCallback(async () => {
    try {
      const [p, q, s, c, l, sp, inv, sps, gs] = await Promise.all([
        fetchAllRows(supabase.from('preventivi').select('*')),
        fetchAllRows(supabase.from('quotes').select('*')),
        fetchAllRows(supabase.from('sales').select('*')),
        fetchAllRows(supabase.from('construction_sites').select('*')),
        fetchAllRows(supabase.from('leads').select('*')),
        fetchAllRows(supabase.from('supplier_payments').select('*')),
        fetchAllRows(supabase.from('inventory').select('*')),
        fetchAllRows(supabase.from('salespeople').select('*')),
        supabase.from('app_settings').select('value').eq('key', 'yearly_revenue_goal').maybeSingle(),
      ]);
      setPreventivi(p || []); setQuotes(q || []); setSales(s || []);
      setSites(c || []); setLeads(l || []); setSupplierPayments(sp || []);
      setInventory(inv || []); setSalespeople(sps || []);
      const goalVal = (gs as any)?.data?.value?.amount;
      if (typeof goalVal === 'number') setGoal(goalVal);
      setLastSync(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useRealtimeSubscription({
    tables: ['preventivi', 'quotes', 'sales', 'construction_sites', 'leads', 'supplier_payments', 'inventory', 'app_settings'],
    onDataChange: fetchAll,
  });

  // ─── Derived KPIs ──────────────────────────────────────────
  const revenuePeriod = useMemo(() => {
    const p = preventivi.filter(x => ['accettato','fatturato'].includes(x.stato) && inRange(x.data, range.start, range.end))
      .reduce((s, x) => s + Number(x.importo_totale || 0), 0);
    const q = quotes.filter(x => x.status === 'accepted' && inRange(x.accepted_date || x.created_at, range.start, range.end))
      .reduce((s, x) => s + Number(x.total_amount || 0), 0);
    return p + q;
  }, [preventivi, quotes, range]);

  const revenuePrev = useMemo(() => {
    const p = preventivi.filter(x => ['accettato','fatturato'].includes(x.stato) && inRange(x.data, range.prevStart, range.prevEnd))
      .reduce((s, x) => s + Number(x.importo_totale || 0), 0);
    const q = quotes.filter(x => x.status === 'accepted' && inRange(x.accepted_date || x.created_at, range.prevStart, range.prevEnd))
      .reduce((s, x) => s + Number(x.total_amount || 0), 0);
    return p + q;
  }, [preventivi, quotes, range]);

  const revenueDelta = revenuePrev > 0 ? ((revenuePeriod - revenuePrev) / revenuePrev) * 100 : null;

  const preventiviPeriod = useMemo(() => {
    const all = [
      ...preventivi.filter(x => inRange(x.data || x.created_at, range.start, range.end))
        .map(x => ({ stato: x.stato })),
      ...quotes.filter(x => inRange(x.created_at, range.start, range.end))
        .map(x => ({ stato: x.status === 'accepted' ? 'accettato' : x.status === 'rejected' ? 'rifiutato' : x.status === 'sent' ? 'inviato' : x.status === 'draft' ? 'bozza' : x.status })),
    ];
    const tot = all.length;
    const acc = all.filter(x => x.stato === 'accettato' || x.stato === 'fatturato').length;
    const rif = all.filter(x => x.stato === 'rifiutato').length;
    const att = all.filter(x => x.stato === 'inviato').length;
    return { tot, acc, rif, att };
  }, [preventivi, quotes, range]);

  const cantieriAttivi = useMemo(() => {
    const attivi = sites.filter(s => s.status === 'attivo' || s.status === 'in_corso');
    const today = new Date();
    const inPartenza = attivi.filter(s => s.start_date && new Date(s.start_date) > today).length;
    const inRitardo = attivi.filter(s => s.end_date && new Date(s.end_date) < today).length;
    return { count: attivi.length, inPartenza, inRitardo };
  }, [sites]);

  const margine = useMemo(() => {
    const completed = sales.filter(s => inRange(s.sale_date, range.start, range.end) && Number(s.margin_percentage) > 0);
    if (!completed.length) return { avg: 0, count: 0 };
    const avg = completed.reduce((s, x) => s + Number(x.margin_percentage || 0), 0) / completed.length;
    return { avg, count: completed.length };
  }, [sales, range]);

  const margineSemaphore: 'green' | 'amber' | 'red' = margine.avg >= 30 ? 'green' : margine.avg >= 15 ? 'amber' : 'red';

  const leadPipeline = useMemo(() => {
    const counts: Record<string, number> = {};
    PIPELINE_STAGES.forEach(s => counts[s] = 0);
    leads.forEach(l => {
      const stage = (l.pipeline_stage || l.status || 'nuovo').toLowerCase();
      const mapped = PIPELINE_STAGES.includes(stage) ? stage :
        stage === 'cold' ? 'nuovo' :
        stage === 'warm' ? 'contattato' :
        stage === 'hot' ? 'in_trattativa' :
        stage === 'qualified' ? 'preventivo_inviato' :
        stage === 'won' || stage === 'converted' ? 'cliente' :
        stage === 'lost' ? 'perso' : 'nuovo';
      counts[mapped] = (counts[mapped] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const won = counts.cliente || 0;
    const conv = total > 0 ? (won / total) * 100 : 0;
    return { counts, total, conv };
  }, [leads]);

  const revenueYTD = useMemo(() => {
    const yStart = startOfYear(new Date());
    const p = preventivi.filter(x => ['accettato','fatturato'].includes(x.stato) && new Date(x.data) >= yStart)
      .reduce((s, x) => s + Number(x.importo_totale || 0), 0);
    const q = quotes.filter(x => x.status === 'accepted' && new Date(x.accepted_date || x.created_at) >= yStart)
      .reduce((s, x) => s + Number(x.total_amount || 0), 0);
    return p + q;
  }, [preventivi, quotes]);

  const debiti = useMemo(() => {
    // supplier_payments here represent partial payments TO suppliers. We approximate debt = sum(total_debt - sum(payments_for_supplier))
    const bySupplier: Record<string, { total: number; paid: number; lastDate?: string }> = {};
    supplierPayments.forEach(p => {
      const k = p.supplier_name || 'Fornitore';
      if (!bySupplier[k]) bySupplier[k] = { total: Number(p.total_debt || 0), paid: 0 };
      bySupplier[k].paid += Number(p.payment_amount || 0);
      bySupplier[k].total = Math.max(bySupplier[k].total, Number(p.total_debt || 0));
      if (!bySupplier[k].lastDate || p.payment_date > bySupplier[k].lastDate) bySupplier[k].lastDate = p.payment_date;
    });
    const open = Object.entries(bySupplier)
      .map(([name, v]) => ({ name, residuo: Math.max(0, v.total - v.paid), lastDate: v.lastDate }))
      .filter(x => x.residuo > 0);
    const total = open.reduce((s, x) => s + x.residuo, 0);
    return { open, total, scaduti: 0, inScadenza: open.length };
  }, [supplierPayments]);

  const lowStock = useMemo(() => {
    const byProd: Record<string, number> = {};
    inventory.forEach(i => {
      const k = `${i.product_type}-${i.color || ''}`;
      const q = Number(i.quantity_sqm || 0);
      byProd[k] = (byProd[k] || 0) + (i.movement_type === 'IN' ? q : -q);
    });
    return Object.values(byProd).filter(v => v > 0 && v < 100).length;
  }, [inventory]);

  // 12 months chart
  const months12 = useMemo(() => {
    const arr: { month: string; fatturato: number; margine: number; lavori: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const ms = startOfMonth(subMonths(now, i));
      const me = endOfMonth(ms);
      const rev =
        preventivi.filter(x => ['accettato','fatturato'].includes(x.stato) && inRange(x.data, ms, me))
          .reduce((s, x) => s + Number(x.importo_totale || 0), 0) +
        quotes.filter(x => x.status === 'accepted' && inRange(x.accepted_date || x.created_at, ms, me))
          .reduce((s, x) => s + Number(x.total_amount || 0), 0);
      const monthSales = sales.filter(s => inRange(s.sale_date, ms, me) && Number(s.margin_percentage) > 0);
      const mgn = monthSales.length ? monthSales.reduce((s, x) => s + Number(x.margin_percentage || 0), 0) / monthSales.length : 0;
      arr.push({ month: format(ms, 'MMM', { locale: it }), fatturato: rev, margine: Number(mgn.toFixed(1)), lavori: monthSales.length });
    }
    return arr;
  }, [preventivi, quotes, sales]);

  // Preventivi stato 6 mesi
  const stato6 = useMemo(() => {
    const arr: { month: string; accettati: number; attesa: number; rifiutati: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const ms = startOfMonth(subMonths(now, i));
      const me = endOfMonth(ms);
      const all = [
        ...preventivi.filter(x => inRange(x.data || x.created_at, ms, me)).map(x => x.stato),
        ...quotes.filter(x => inRange(x.created_at, ms, me)).map(x => x.status === 'accepted' ? 'accettato' : x.status === 'rejected' ? 'rifiutato' : 'inviato'),
      ];
      arr.push({
        month: format(ms, 'MMM', { locale: it }),
        accettati: all.filter(s => s === 'accettato' || s === 'fatturato').length,
        attesa: all.filter(s => s === 'inviato').length,
        rifiutati: all.filter(s => s === 'rifiutato').length,
      });
    }
    return arr;
  }, [preventivi, quotes]);

  // Margine per fornitore (raggruppato per product_type)
  const margineForn = useMemo(() => {
    const groups: Record<string, { sum: number; n: number }> = {};
    sales.filter(s => inRange(s.sale_date, range.start, range.end) && Number(s.margin_percentage) > 0).forEach(s => {
      const k = s.product_type || 'Altro';
      if (!groups[k]) groups[k] = { sum: 0, n: 0 };
      groups[k].sum += Number(s.margin_percentage || 0);
      groups[k].n += 1;
    });
    return Object.entries(groups).map(([fornitore, v]) => ({ fornitore, margine: Number((v.sum / v.n).toFixed(1)) }))
      .sort((a, b) => b.margine - a.margine).slice(0, 8);
  }, [sales, range]);

  // Tables
  const ultimiPreventivi = useMemo(() => {
    return [...preventivi]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [preventivi]);

  const cantieriInCorso = useMemo(() => {
    return sites.filter(s => s.status === 'attivo' || s.status === 'in_corso').slice(0, 5).map(s => {
      const today = new Date();
      const start = s.start_date ? new Date(s.start_date) : null;
      const end = s.end_date ? new Date(s.end_date) : null;
      let pct = 0;
      if (start && end) {
        const tot = differenceInDays(end, start);
        const done = differenceInDays(today, start);
        pct = tot > 0 ? Math.max(0, Math.min(100, (done / tot) * 100)) : 0;
      }
      const ritardo = end && end < today;
      return { ...s, pct, ritardo };
    });
  }, [sites]);

  const debitiInScadenza = useMemo(() => debiti.open.slice(0, 6), [debiti]);

  // Admin-only: performance agenti
  const performanceAgenti = useMemo(() => {
    return salespeople.map(sp => {
      const lAssegnati = leads.filter(l => l.assigned_salesperson_id === sp.id).length;
      const lChiusi = leads.filter(l => l.assigned_salesperson_id === sp.id && ['cliente','won','converted'].includes((l.pipeline_stage || l.status || '').toLowerCase())).length;
      const pInviati = preventivi.filter(p => {
        const lead = leads.find(l => l.id === p.lead_id);
        return lead?.assigned_salesperson_id === sp.id && inRange(p.created_at, range.start, range.end);
      });
      const valoreChiuso = pInviati.filter(p => ['accettato','fatturato'].includes(p.stato))
        .reduce((s, x) => s + Number(x.importo_totale || 0), 0);
      const conv = lAssegnati > 0 ? (lChiusi / lAssegnati) * 100 : 0;
      return { id: sp.id, nome: `${sp.first_name || ''} ${sp.last_name || ''}`.trim() || sp.email || 'N/D', lAssegnati, pInviati: pInviati.length, valoreChiuso, conv };
    }).sort((a, b) => b.valoreChiuso - a.valoreChiuso);
  }, [salespeople, leads, preventivi, range]);

  // ─────────────────────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Caricamento dashboard...</div>;

  const periodLabel = range.label;

  return (
    <div className="space-y-6 pb-12">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 -mx-6 px-6 py-3 bg-[#F5F4F1]/95 backdrop-blur border-b border-[rgba(59,35,20,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: '#1A1008' }}>Dashboard Kalēa</h1>
            <p className="text-xs text-gray-500">Periodo: <span className="font-medium">{periodLabel}</span></p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-[rgba(59,35,20,0.10)] bg-white">
              {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map(k => (
                <button key={k} onClick={() => setPeriod(k)}
                  className={`px-3 py-1.5 text-xs transition-colors ${period === k ? 'bg-[#1A1A2E] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {PERIOD_LABELS[k]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Aggiornato {format(lastSync, 'HH:mm:ss')}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1 — KPI principali */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Fatturato" rawNumeric={revenuePeriod} format="eur" value=""
          delta={revenueDelta} subtitle={`vs precedente: ${eur(revenuePrev)}`}
          icon={TrendingUp} iconColor="text-green-600" period={periodLabel}
          onClick={() => navigate('/admin/pagamenti')} />
        <KPICard title="Preventivi" rawNumeric={preventiviPeriod.tot} format="int" value=""
          subtitle={`Accettati: ${preventiviPeriod.acc} · Rifiutati: ${preventiviPeriod.rif} · Attesa: ${preventiviPeriod.att}`}
          icon={FileText} iconColor="text-blue-500" period={periodLabel}
          onClick={() => navigate('/admin/preventivi')} />
        <KPICard title="Cantieri Attivi" rawNumeric={cantieriAttivi.count} format="int" value=""
          subtitle={`${cantieriAttivi.inPartenza} in partenza · ${cantieriAttivi.inRitardo} in ritardo`}
          icon={HardHat} iconColor="text-amber-600" alert={cantieriAttivi.inRitardo > 0}
          onClick={() => navigate('/admin/cantieri')} />
        <KPICard title="Margine Medio" rawNumeric={margine.avg} format="pct" value=""
          subtitle={`Su ${margine.count} vendite del periodo`} semaphore={margineSemaphore}
          icon={Target} iconColor="text-purple-600" period={periodLabel}
          onClick={() => navigate('/admin/analytics')} />
      </div>

      {/* SECTION 2 — KPI secondari */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Lead Pipeline" rawNumeric={leadPipeline.total} format="int" value=""
          subtitle={`Conv. ${pct(leadPipeline.conv)}`}
          icon={Users} iconColor="text-indigo-500" onClick={() => navigate('/admin/leads')}>
          <div className="mt-3 flex h-1.5 rounded-full overflow-hidden bg-gray-100">
            {PIPELINE_STAGES.map((s, i) => {
              const v = leadPipeline.counts[s] || 0;
              const w = leadPipeline.total > 0 ? (v / leadPipeline.total) * 100 : 0;
              if (w === 0) return null;
              return <div key={s} style={{ width: `${w}%`, background: STAGE_COLORS[i] }} title={`${STAGE_LABEL[s]}: ${v}`} />;
            })}
          </div>
        </KPICard>

        <KPICard title="Fatturato YTD" rawNumeric={revenueYTD} format="eur" value=""
          subtitle={`Obiettivo ${eur(goal)} · Mancano ${eur(Math.max(0, goal - revenueYTD))}`}
          icon={TrendingUp} iconColor="text-green-700">
          <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-[#C8A96E] transition-all" style={{ width: `${Math.min(100, (revenueYTD / goal) * 100)}%` }} />
          </div>
        </KPICard>

        <KPICard title="Debiti Fornitori" rawNumeric={debiti.total} format="eur" value=""
          subtitle={`${debiti.open.length} aperti`}
          icon={Wallet} iconColor={debiti.total > 0 ? 'text-red-600' : 'text-gray-400'}
          alert={debiti.scaduti > 0}
          onClick={() => navigate('/admin/pagamenti')} />

        <KPICard title="Stock Magazzino" rawNumeric={lowStock} format="int" value=""
          subtitle={lowStock > 0 ? 'Articoli sotto scorta' : 'Tutto ok'}
          icon={Package} iconColor={lowStock > 0 ? 'text-orange-500' : 'text-green-500'}
          badge={lowStock > 0 ? lowStock : undefined}
          onClick={() => navigate('/admin/magazzino')} />
      </div>

      {/* SECTION 3 — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-xl p-5" style={{ border: '1px solid rgba(59,35,20,0.10)' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold" style={{ color: '#1A1008' }}>Fatturato 12 mesi</h3>
            <span className="text-[10px] uppercase tracking-wider text-gray-400">vs margine %</span>
          </div>
          {months12.some(m => m.fatturato > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={months12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: any, n: string) => n === 'margine' ? `${v}%` : eur(v)} />
                <Bar yAxisId="left" dataKey="fatturato" radius={[4, 4, 0, 0]}>
                  {months12.map((_, i) => <Cell key={i} fill={i === months12.length - 1 ? '#C8A96E' : '#1A1A2E'} />)}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="margine" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-5" style={{ border: '1px solid rgba(59,35,20,0.10)' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold" style={{ color: '#1A1008' }}>Pipeline Lead</h3>
            <span className="text-xs text-gray-500">Conv. {pct(leadPipeline.conv)}</span>
          </div>
          {leadPipeline.total > 0 ? (
            <div className="space-y-2 mt-3">
              {PIPELINE_STAGES.map((s, i) => {
                const v = leadPipeline.counts[s] || 0;
                const w = leadPipeline.total > 0 ? (v / leadPipeline.total) * 100 : 0;
                return (
                  <div key={s}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span style={{ color: '#5A4A3F' }}>{STAGE_LABEL[s]}</span>
                      <span className="tabular-nums text-gray-500">{v}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full transition-all" style={{ width: `${w}%`, background: STAGE_COLORS[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <Empty />}
        </div>
      </div>

      {/* SECTION 4 — Second charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid rgba(59,35,20,0.10)' }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: '#1A1008' }}>Preventivi per stato (6 mesi)</h3>
          {stato6.some(m => m.accettati + m.attesa + m.rifiutati > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stato6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="accettati" stackId="a" fill="#16a34a" />
                <Bar dataKey="attesa" stackId="a" fill="#eab308" />
                <Bar dataKey="rifiutati" stackId="a" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </div>

        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid rgba(59,35,20,0.10)' }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: '#1A1008' }}>Margine % per categoria prodotto</h3>
          {margineForn.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={margineForn} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="fornitore" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Bar dataKey="margine" fill="#C8A96E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </div>
      </div>

      {/* SECTION 5 — Live tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ultimi preventivi */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid rgba(59,35,20,0.10)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: '#1A1008' }}>Ultimi preventivi</h3>
            <button onClick={() => navigate('/admin/preventivi')} className="text-xs text-[#C8A96E] hover:underline flex items-center gap-0.5">
              Vedi tutti <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {ultimiPreventivi.length ? (
            <div className="space-y-1">
              {ultimiPreventivi.map(p => (
                <button key={p.id}
                  onClick={() => navigate(`/admin/strumenti/crea-preventivo?id=${p.id}`)}
                  className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate" style={{ color: '#1A1008' }}>{p.numero_preventivo}</div>
                      <div className="text-[10px] text-gray-500 truncate">{p.cliente_nome || 'Cliente'}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold tabular-nums">{eur(Number(p.importo_totale || 0))}</div>
                      <StatoBadge stato={p.stato} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : <Empty msg="Nessun preventivo" />}
        </div>

        {/* Cantieri */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid rgba(59,35,20,0.10)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: '#1A1008' }}>Cantieri in corso</h3>
            <button onClick={() => navigate('/admin/cantieri')} className="text-xs text-[#C8A96E] hover:underline flex items-center gap-0.5">
              Vedi tutti <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {cantieriInCorso.length ? (
            <div className="space-y-3">
              {cantieriInCorso.map(c => (
                <button key={c.id} onClick={() => navigate(`/admin/cantieri/${c.id}`)} className="w-full text-left">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="text-xs font-medium truncate" style={{ color: '#1A1008' }}>{c.title}</div>
                    {c.ritardo && <span className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold">IN RITARDO</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full ${c.ritardo ? 'bg-red-500' : 'bg-[#C8A96E]'}`} style={{ width: `${c.pct}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 tabular-nums w-8 text-right">{Math.round(c.pct)}%</span>
                  </div>
                  {c.end_date && (
                    <div className="text-[10px] text-gray-400 mt-0.5">Fine: {format(new Date(c.end_date), 'dd MMM yyyy', { locale: it })}</div>
                  )}
                </button>
              ))}
            </div>
          ) : <Empty msg="Nessun cantiere attivo" />}
        </div>

        {/* Debiti */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid rgba(59,35,20,0.10)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: '#1A1008' }}>Debiti fornitori</h3>
            <button onClick={() => navigate('/admin/pagamenti')} className="text-xs text-[#C8A96E] hover:underline flex items-center gap-0.5">
              Gestisci <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {debitiInScadenza.length ? (
            <div className="space-y-1">
              {debitiInScadenza.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded">
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: '#1A1008' }}>{d.name}</div>
                    {d.lastDate && <div className="text-[10px] text-gray-400">Ultimo pag.: {format(new Date(d.lastDate), 'dd MMM', { locale: it })}</div>}
                  </div>
                  <div className="text-xs font-semibold tabular-nums text-red-700">{eur(d.residuo)}</div>
                </div>
              ))}
            </div>
          ) : <Empty msg="Nessun debito aperto" />}
        </div>
      </div>

      {/* SECTION 6 — Admin only */}
      {isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#8A7060' }}>Sezione Admin</h2>
            <div className="flex-1 h-px bg-[rgba(59,35,20,0.10)]" />
          </div>

          <div className="bg-white rounded-xl p-5" style={{ border: '1px solid rgba(59,35,20,0.10)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#1A1008' }}>Performance commerciali — {periodLabel}</h3>
            {performanceAgenti.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-500 uppercase text-[10px] tracking-wider">
                      <th className="py-2 px-2">Nome</th>
                      <th className="py-2 px-2 text-right">Lead</th>
                      <th className="py-2 px-2 text-right">Preventivi</th>
                      <th className="py-2 px-2 text-right">Valore chiuso</th>
                      <th className="py-2 px-2 text-right">Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceAgenti.map((a, i) => (
                      <tr key={a.id} className={`border-t border-gray-100 ${i % 2 ? 'bg-gray-50/50' : ''} hover:bg-[#C8A96E]/5`}>
                        <td className="py-2 px-2 font-medium">{a.nome}</td>
                        <td className="py-2 px-2 text-right tabular-nums">{a.lAssegnati}</td>
                        <td className="py-2 px-2 text-right tabular-nums">{a.pInviati}</td>
                        <td className="py-2 px-2 text-right tabular-nums font-semibold">{eur(a.valoreChiuso)}</td>
                        <td className="py-2 px-2 text-right tabular-nums">{pct(a.conv)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty msg="Nessun commerciale configurato" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5" style={{ border: '1px solid rgba(59,35,20,0.10)' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#1A1008' }}>Cashflow previsto 30gg</h3>
              <CashflowPanel preventivi={preventivi} sites={sites} debiti={debiti.total} />
            </div>
            <div className="bg-white rounded-xl p-5" style={{ border: '1px solid rgba(59,35,20,0.10)' }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#1A1008' }}>
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Da incassare questa settimana
              </h3>
              <Empty msg="Nessun acconto in scadenza" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function CashflowPanel({ preventivi, sites, debiti }: { preventivi: any[]; sites: any[]; debiti: number }) {
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 86400000);
  const expectedIn = preventivi
    .filter(p => p.stato === 'accettato' && p.data && new Date(p.data) >= now && new Date(p.data) <= in30)
    .reduce((s, p) => s + Number(p.importo_totale || 0), 0);
  const net = expectedIn - debiti;
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between"><span className="text-gray-500">Entrate previste</span><span className="font-semibold text-green-600 tabular-nums">+{eur(expectedIn)}</span></div>
      <div className="flex justify-between"><span className="text-gray-500">Uscite previste</span><span className="font-semibold text-red-600 tabular-nums">−{eur(debiti)}</span></div>
      <div className="h-px bg-gray-100 my-1" />
      <div className="flex justify-between text-base">
        <span className="font-medium">Saldo netto</span>
        <span className={`font-bold tabular-nums ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>{eur(net)}</span>
      </div>
    </div>
  );
}

function StatoBadge({ stato }: { stato: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    accettato: { bg: '#dcfce7', color: '#15803d', label: 'Accettato' },
    fatturato: { bg: '#dcfce7', color: '#15803d', label: 'Fatturato' },
    inviato: { bg: '#fef9c3', color: '#854d0e', label: 'In attesa' },
    rifiutato: { bg: '#fee2e2', color: '#b91c1c', label: 'Rifiutato' },
    bozza: { bg: '#f3f4f6', color: '#4b5563', label: 'Bozza' },
  };
  const s = map[stato] || map.bozza;
  return <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}

export default AdminOverview;
