import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { fetchAllRows } from '@/lib/fetchAllRows';
import {
  TrendingUp, FileText, HardHat, Target, Users, Wallet,
  AlertTriangle, Package, ChevronRight, ArrowUp, ArrowDown,
  Calendar as CalIcon, Activity, CreditCard, UserPlus, Briefcase,
} from 'lucide-react';
import {
  Area, AreaChart, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';
import {
  format, startOfMonth, endOfMonth, startOfYear, endOfYear,
  startOfQuarter, endOfQuarter, subMonths, subDays, differenceInDays,
  startOfWeek, addDays, isSameDay,
} from 'date-fns';
import { it } from 'date-fns/locale';

// ─── Helpers ──────────────────────────────────────────────────
const eur = (v: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v || 0);
const eurShort = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `€${(v / 1_000).toFixed(0)}k`;
  return `€${Math.round(v)}`;
};
const pct = (v: number) => `${(v || 0).toFixed(1)}%`;

type PeriodKey = 'month' | 'lastMonth' | 'quarter' | 'ytd' | 'last30' | 'all';
type TabKey = 'overview' | 'commerciale' | 'cantieri' | 'finanza' | 'magazzino';

function getPeriodRange(p: PeriodKey) {
  const now = new Date();
  switch (p) {
    case 'month': {
      const s = startOfMonth(now), e = endOfMonth(now);
      return { start: s, end: e, prevStart: startOfMonth(subMonths(now, 1)), prevEnd: endOfMonth(subMonths(now, 1)), label: format(s, 'MMMM yyyy', { locale: it }) };
    }
    case 'lastMonth': {
      const s = startOfMonth(subMonths(now, 1)), e = endOfMonth(subMonths(now, 1));
      return { start: s, end: e, prevStart: startOfMonth(subMonths(now, 2)), prevEnd: endOfMonth(subMonths(now, 2)), label: format(s, 'MMMM yyyy', { locale: it }) };
    }
    case 'quarter': {
      const s = startOfQuarter(now), e = endOfQuarter(now);
      return { start: s, end: e, prevStart: startOfQuarter(subMonths(s, 3)), prevEnd: endOfQuarter(subMonths(s, 3)), label: `Q ${format(s, 'yyyy')}` };
    }
    case 'ytd': {
      const s = startOfYear(now), e = endOfYear(now);
      return { start: s, end: e, prevStart: startOfYear(subMonths(s, 12)), prevEnd: endOfYear(subMonths(s, 12)), label: `YTD ${format(s, 'yyyy')}` };
    }
    case 'all': {
      const s = new Date(2000, 0, 1);
      const e = new Date(2100, 11, 31);
      return { start: s, end: e, prevStart: s, prevEnd: s, label: 'Tutto il periodo' };
    }
    default: {
      const s = subDays(now, 30);
      return { start: s, end: now, prevStart: subDays(s, 30), prevEnd: s, label: 'Ultimi 30 giorni' };
    }
  }
}
const inRange = (d: any, start: Date, end: Date) => {
  if (!d) return false;
  const t = new Date(d).getTime();
  return t >= start.getTime() && t <= end.getTime();
};

// ─── Count-up ─────────────────────────────────────────────────
function useCountUp(value: number, durationMs = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(value * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);
  return v;
}

// ─── Big KPI (dense, big number) ──────────────────────────────
type Variant = 'light' | 'dark' | 'gold' | 'semaphore' | 'danger';
function BigKPI({
  label, value, format: fmt = 'int', sub, delta, icon: Icon, variant = 'light',
  semaphore, onClick, children,
}: {
  label: string; value: number; format?: 'eur' | 'pct' | 'int';
  sub?: string; delta?: number | null; icon?: any;
  variant?: Variant; semaphore?: 'green' | 'amber' | 'red';
  onClick?: () => void; children?: React.ReactNode;
}) {
  const animated = useCountUp(value);
  const display =
    fmt === 'eur' ? eur(animated) :
    fmt === 'pct' ? pct(animated) :
    Math.round(animated).toLocaleString('it-IT');

  const styles: Record<Variant, React.CSSProperties> = {
    light: { background: '#FFFFFF', color: '#1A1A2E', border: '1px solid rgba(26,26,46,0.08)' },
    dark: { background: '#1A1A2E', color: '#FFFFFF', border: '1px solid #1A1A2E' },
    gold: { background: '#FFFFFF', color: '#1A1A2E', borderLeft: '4px solid #C4A882', border: '1px solid rgba(196,168,130,0.30)', borderLeftWidth: 4 },
    semaphore: {
      background: semaphore === 'green' ? '#EAF5EE' : semaphore === 'amber' ? '#FDF4E3' : '#FBEAEA',
      color: '#1A1A2E',
      border: `1px solid ${semaphore === 'green' ? '#A8D5B5' : semaphore === 'amber' ? '#E8C97A' : '#E5A5A5'}`,
    },
    danger: { background: '#FFF0F0', color: '#1A1A2E', borderLeft: '4px solid #C0392B', border: '1px solid #F5C5C5', borderLeftWidth: 4 },
  };
  const labelColor = variant === 'dark' ? '#C8B8A0' : '#9A9890';
  const subColor = variant === 'dark' ? 'rgba(255,255,255,0.65)' : '#6B6760';

  return (
    <div
      onClick={onClick}
      className={`relative px-4 py-3 transition-all ${onClick ? 'cursor-pointer hover:translate-y-[-1px]' : ''}`}
      style={{ ...styles[variant], borderRadius: 4 }}
    >
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: labelColor }}>
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 opacity-60" />}
      </div>
      <div className="flex items-baseline gap-2 leading-none">
        <span className="tabular-nums" style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em' }}>{display}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 min-h-[16px]">
        {delta !== null && delta !== undefined && (
          <span className="inline-flex items-center gap-0.5 text-[13px] font-semibold tabular-nums" style={{ color: delta >= 0 ? '#16a34a' : '#dc2626' }}>
            {delta >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {sub && <span style={{ fontSize: 11, color: subColor }}>{sub}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Circular gauge ───────────────────────────────────────────
function Gauge({ value, max = 100, label, sub, color = '#16a34a', size = 130 }: {
  value: number; max?: number; label: string; sub?: string; color?: string; size?: number;
}) {
  const animated = useCountUp(value);
  const pctVal = Math.max(0, Math.min(100, (animated / max) * 100));
  const r = (size - 18) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pctVal / 100) * c;
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="#EEEAE2" strokeWidth={10} fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={10} fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.4s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', lineHeight: 1 }}>
            {pctVal.toFixed(0)}%
          </span>
          {sub && <span className="mt-0.5" style={{ fontSize: 9, color: '#9A9890', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{sub}</span>}
        </div>
      </div>
      <div className="mt-2 text-center" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B6760', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

// ─── Panel wrapper ────────────────────────────────────────────
function Panel({ title, right, children, className = '' }: { title?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white ${className}`} style={{ border: '1px solid rgba(26,26,46,0.08)', borderRadius: 4 }}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'rgba(26,26,46,0.06)' }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1A1A2E' }}>{title}</h3>
          {right}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

const Empty = ({ msg = 'Nessun dato per il periodo' }: { msg?: string }) => (
  <div className="flex items-center justify-center h-32 text-xs italic" style={{ color: '#B0998A' }}>{msg}</div>
);

// ─── Main ─────────────────────────────────────────────────────
const PERIOD_LABELS: Record<PeriodKey, string> = {
  month: 'Mese', lastMonth: 'Mese scorso', quarter: 'Trimestre', ytd: 'YTD', all: 'All time', last30: '30 giorni',
};
const TAB_LABELS: Record<TabKey, string> = {
  overview: 'Overview', commerciale: 'Commerciale', cantieri: 'Cantieri', finanza: 'Finanza', magazzino: 'Magazzino',
};

const PIPELINE_STAGES = ['nuovo', 'contattato', 'in_trattativa', 'preventivo_inviato', 'cliente', 'perso'];
const STAGE_LABEL: Record<string, string> = {
  nuovo: 'Nuovo', contattato: 'Contattato', in_trattativa: 'Trattativa',
  preventivo_inviato: 'Prev. inviato', cliente: 'Cliente', perso: 'Perso',
};
const STAGE_COLORS = ['#E5E1DA', '#CFC7BA', '#A89A82', '#8C7B6B', '#5E8A4D', '#C0392B'];

const AdminOverview = () => {
  const navigate = useNavigate();
  const { role } = useAdminAuth();
  const isAdmin = role === 'admin';

  const [period, setPeriod] = useState<PeriodKey>('all');
  const [tab, setTab] = useState<TabKey>('overview');
  const range = useMemo(() => getPeriodRange(period), [period]);
  const [lastSync, setLastSync] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Data
  const [preventivi] = useState<any[]>([]); // legacy — non più usata, tenuta per compat
  const [quotes, setQuotes] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [supplierPayments, setSupplierPayments] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [salespeople, setSalespeople] = useState<any[]>([]);
  const [paymentSchedules, setPaymentSchedules] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [fixedCosts, setFixedCosts] = useState<any[]>([]);
  const [variableCosts, setVariableCosts] = useState<any[]>([]);
  const [staticCosts, setStaticCosts] = useState<any[]>([]);
  const [commercialInvoices, setCommercialInvoices] = useState<any[]>([]);
  const [paymentAgreements, setPaymentAgreements] = useState<any[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [customerPayments, setCustomerPayments] = useState<any[]>([]);
  const [goal, setGoal] = useState<number>(400000);

  const fetchAll = useCallback(async () => {
    try {
      const [q, s, c, l, sp, pa, inv, sps, ps, ap, rem, cu, fc, vc, sc, ci, ciNew, cpNew, gs] = await Promise.all([
        fetchAllRows(supabase.from('quotes').select('*')),
        fetchAllRows(supabase.from('sales').select('*')),
        fetchAllRows(supabase.from('construction_sites').select('*')),
        fetchAllRows(supabase.from('leads').select('*')),
        fetchAllRows(supabase.from('supplier_payments').select('*')),
        fetchAllRows(supabase.from('payment_agreements').select('*')),
        fetchAllRows(supabase.from('inventory').select('*')),
        fetchAllRows(supabase.from('salespeople').select('*')),
        fetchAllRows(supabase.from('payment_schedules').select('*')),
        fetchAllRows(supabase.from('appointments').select('*')),
        fetchAllRows(supabase.from('customer_reminders').select('*')),
        fetchAllRows(supabase.from('customers').select('*')),
        fetchAllRows(supabase.from('fixed_costs').select('*')),
        fetchAllRows(supabase.from('variable_costs').select('*')),
        fetchAllRows(supabase.from('static_costs').select('*')),
        fetchAllRows(supabase.from('commercial_invoices').select('*')),
        fetchAllRows(supabase.from('customer_invoices' as any).select('*')),
        fetchAllRows(supabase.from('customer_payments' as any).select('*')),
        supabase.from('app_settings').select('value').eq('key', 'yearly_revenue_goal').maybeSingle(),
      ]);
      setQuotes(q || []); setSales(s || []);
      setSites(c || []); setLeads(l || []); setSupplierPayments(sp || []); setPaymentAgreements(pa || []);
      setInventory(inv || []); setSalespeople(sps || []);
      setPaymentSchedules(ps || []); setAppointments(ap || []); setReminders(rem || []);
      setCustomers(cu || []); setFixedCosts(fc || []); setVariableCosts(vc || []);
      setStaticCosts(sc || []); setCommercialInvoices(ci || []);
      setCustomerInvoices(ciNew || []); setCustomerPayments(cpNew || []);
      const goalVal = (gs as any)?.data?.value?.amount;
      if (typeof goalVal === 'number') setGoal(goalVal);
      setLastSync(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useRealtimeSubscription({
    tables: ['quotes', 'sales', 'construction_sites', 'leads', 'supplier_payments', 'payment_agreements', 'inventory', 'app_settings', 'payment_schedules', 'appointments', 'customer_reminders', 'customers', 'fixed_costs', 'variable_costs', 'static_costs', 'commercial_invoices', 'customer_invoices' as any, 'customer_payments' as any],
    onDataChange: fetchAll,
  });

  // ─── Derived ──────────────────────────────────────────────
  const sumRevenue = (s: Date, e: Date) =>
    preventivi.filter(x => ['accettato','fatturato'].includes(x.stato) && inRange(x.data || x.created_at, s, e))
      .reduce((a, x) => a + Number(x.importo_totale || 0), 0) +
    quotes.filter(x => ['accepted','accettato','fatturato'].includes(x.status) && inRange(x.accepted_date || x.created_at, s, e))
      .reduce((a, x) => a + Number(x.total_amount || 0), 0) +
    sales.filter(x => inRange(x.sale_date || x.created_at, s, e))
      .reduce((a, x) => a + Number(x.total_amount || 0), 0);

  const revenuePeriod = useMemo(() => sumRevenue(range.start, range.end), [preventivi, quotes, sales, range]);
  const revenuePrev = useMemo(() => sumRevenue(range.prevStart, range.prevEnd), [preventivi, quotes, sales, range]);
  const revenueDelta = revenuePrev > 0 ? ((revenuePeriod - revenuePrev) / revenuePrev) * 100 : null;
  const revenueYTD = useMemo(() => sumRevenue(startOfYear(new Date()), endOfYear(new Date())), [preventivi, quotes, sales]);
  const goalPct = goal > 0 ? (revenueYTD / goal) * 100 : 0;

  const preventiviPeriod = useMemo(() => {
    const all = [
      ...preventivi.filter(x => inRange(x.data || x.created_at, range.start, range.end)).map(x => x.stato),
      ...quotes.filter(x => inRange(x.created_at, range.start, range.end))
        .map(x => x.status === 'accepted' ? 'accettato' : x.status === 'rejected' ? 'rifiutato' : x.status === 'sent' ? 'inviato' : 'bozza'),
    ];
    return {
      tot: all.length,
      acc: all.filter(s => s === 'accettato' || s === 'fatturato').length,
      rif: all.filter(s => s === 'rifiutato').length,
      att: all.filter(s => s === 'inviato').length,
    };
  }, [preventivi, quotes, range]);

  const convRate = useMemo(() => {
    const totLeads = leads.filter(l => inRange(l.created_at, range.start, range.end)).length || leads.length;
    const won = leads.filter(l => ['cliente','won','converted'].includes((l.pipeline_stage || l.status || '').toLowerCase())).length;
    return totLeads > 0 ? (won / totLeads) * 100 : 0;
  }, [leads, range]);

  const cantieriAttivi = useMemo(() => {
    const attivi = sites.filter(s => s.status === 'attivo' || s.status === 'in_corso');
    const today = new Date();
    return {
      count: attivi.length,
      inPartenza: attivi.filter(s => s.start_date && new Date(s.start_date) > today).length,
      inRitardo: attivi.filter(s => s.end_date && new Date(s.end_date) < today).length,
    };
  }, [sites]);

  const margine = useMemo(() => {
    const completed = sales.filter(s => inRange(s.sale_date, range.start, range.end) && Number(s.margin_percentage) > 0);
    if (!completed.length) return { avg: 0, count: 0 };
    return { avg: completed.reduce((s, x) => s + Number(x.margin_percentage || 0), 0) / completed.length, count: completed.length };
  }, [sales, range]);
  const margineSem: 'green' | 'amber' | 'red' = margine.avg >= 30 ? 'green' : margine.avg >= 15 ? 'amber' : 'red';
  const margineColor = margineSem === 'green' ? '#16a34a' : margineSem === 'amber' ? '#d97706' : '#dc2626';

  const leadPipeline = useMemo(() => {
    const counts: Record<string, number> = {};
    PIPELINE_STAGES.forEach(s => counts[s] = 0);
    leads.forEach(l => {
      const raw = (l.pipeline_stage || l.status || 'nuovo').toLowerCase();
      const mapped = PIPELINE_STAGES.includes(raw) ? raw :
        raw === 'cold' ? 'nuovo' : raw === 'warm' ? 'contattato' :
        raw === 'hot' ? 'in_trattativa' : raw === 'qualified' ? 'preventivo_inviato' :
        raw === 'won' || raw === 'converted' ? 'cliente' :
        raw === 'lost' ? 'perso' : 'nuovo';
      counts[mapped]++;
    });
    return { counts, total: leads.length };
  }, [leads]);

  const debiti = useMemo(() => {
    const bySupplier: Record<string, { total: number; paid: number; lastDate?: string }> = {};
    paymentAgreements.forEach(a => {
      const k = (a.supplier_name || 'Fornitore').trim() || 'Fornitore';
      if (!bySupplier[k]) bySupplier[k] = { total: 0, paid: 0 };
      bySupplier[k].total += Number(a.total_amount || 0);
      if (a.end_date && (!bySupplier[k].lastDate || a.end_date > bySupplier[k].lastDate)) bySupplier[k].lastDate = a.end_date;
    });
    supplierPayments.forEach(p => {
      const k = (p.supplier_name || 'Fornitore').trim() || 'Fornitore';
      if (!bySupplier[k]) bySupplier[k] = { total: 0, paid: 0 };
      bySupplier[k].paid += Number(p.payment_amount || 0);
      bySupplier[k].total = Math.max(bySupplier[k].total, Number(p.total_debt || 0));
      if (!bySupplier[k].lastDate || p.payment_date > bySupplier[k].lastDate) bySupplier[k].lastDate = p.payment_date;
    });
    const open = Object.entries(bySupplier)
      .map(([name, v]) => ({ name, residuo: Math.max(0, v.total - v.paid), lastDate: v.lastDate }))
      .filter(x => x.residuo > 0).sort((a, b) => b.residuo - a.residuo);
    return { open, total: open.reduce((s, x) => s + x.residuo, 0) };
  }, [supplierPayments, paymentAgreements]);

  const lowStock = useMemo(() => {
    const byProd: Record<string, number> = {};
    inventory.forEach(i => {
      const k = `${i.product_type}-${i.color || ''}`;
      const q = Number(i.quantity_sqm || 0);
      byProd[k] = (byProd[k] || 0) + (i.movement_type === 'IN' ? q : -q);
    });
    return { low: Object.values(byProd).filter(v => v > 0 && v < 100).length, total: Object.values(byProd).reduce((a, b) => a + Math.max(0, b), 0) };
  }, [inventory]);

  const pagScaduti = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return paymentSchedules.filter(p => !p.is_paid && p.due_date < today).length;
  }, [paymentSchedules]);

  // 12 months area chart data
  const months12 = useMemo(() => {
    const arr: { month: string; fatturato: number; margine: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const ms = startOfMonth(subMonths(now, i)), me = endOfMonth(ms);
      const rev = sumRevenue(ms, me);
      const mSales = sales.filter(s => inRange(s.sale_date, ms, me) && Number(s.margin_percentage) > 0);
      const mgn = mSales.length ? mSales.reduce((s, x) => s + Number(x.margin_percentage || 0), 0) / mSales.length : 0;
      arr.push({ month: format(ms, 'MMM', { locale: it }), fatturato: rev, margine: Number(mgn.toFixed(1)) });
    }
    return arr;
  }, [preventivi, quotes, sales]);

  const stato6 = useMemo(() => {
    const arr: { month: string; accettati: number; attesa: number; rifiutati: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const ms = startOfMonth(subMonths(now, i)), me = endOfMonth(ms);
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

  // Activity feed
  const activityFeed = useMemo(() => {
    const items: { type: 'preventivo'|'cantiere'|'pagamento'|'lead'; title: string; sub: string; date: Date; onClick?: () => void }[] = [];
    preventivi.slice(0, 20).forEach(p => items.push({
      type: 'preventivo', title: `${p.numero_preventivo} · ${eurShort(Number(p.importo_totale || 0))}`,
      sub: p.cliente_nome || 'Cliente', date: new Date(p.created_at),
      onClick: () => navigate(`/admin/strumenti/crea-preventivo?id=${p.id}`),
    }));
    sites.slice(0, 20).forEach(c => items.push({
      type: 'cantiere', title: c.title, sub: c.city || c.status,
      date: new Date(c.updated_at || c.created_at), onClick: () => navigate(`/admin/cantieri/${c.id}`),
    }));
    supplierPayments.slice(0, 10).forEach(p => items.push({
      type: 'pagamento', title: `${p.supplier_name} · ${eurShort(Number(p.payment_amount || 0))}`,
      sub: 'Pagamento fornitore', date: new Date(p.payment_date),
    }));
    leads.slice(0, 15).forEach(l => items.push({
      type: 'lead', title: l.name, sub: l.city || l.source || 'Lead',
      date: new Date(l.created_at), onClick: () => navigate(`/admin/leads`),
    }));
    return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
  }, [preventivi, sites, supplierPayments, leads, navigate]);

  // Week calendar events
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, []);

  const calendarEvents = useMemo(() => {
    const byDay: Record<string, { type: 'cantiere'|'pagamento'|'lead'|'appuntamento'; label: string; color: string }[]> = {};
    const key = (d: Date) => format(d, 'yyyy-MM-dd');
    weekDays.forEach(d => byDay[key(d)] = []);
    sites.forEach(c => {
      if (c.start_date) {
        const d = new Date(c.start_date);
        if (byDay[key(d)]) byDay[key(d)].push({ type: 'cantiere', label: `▶ ${c.title}`, color: '#C4A882' });
      }
    });
    paymentSchedules.forEach(p => {
      if (!p.is_paid && p.due_date) {
        const d = new Date(p.due_date);
        if (byDay[key(d)]) byDay[key(d)].push({ type: 'pagamento', label: `€ ${eurShort(Number(p.amount || 0))}`, color: '#C0392B' });
      }
    });
    appointments.forEach(a => {
      if (a.appointment_date) {
        const d = new Date(a.appointment_date);
        if (byDay[key(d)]) byDay[key(d)].push({ type: 'appuntamento', label: a.title || 'Appuntamento', color: '#3b82f6' });
      }
    });
    reminders.forEach(r => {
      if (!r.is_completed && r.reminder_date) {
        const d = new Date(r.reminder_date);
        if (byDay[key(d)]) byDay[key(d)].push({ type: 'lead', label: r.title || 'Follow-up', color: '#16a34a' });
      }
    });
    return byDay;
  }, [sites, paymentSchedules, appointments, reminders, weekDays]);

  // Performance commerciali
  const performanceAgenti = useMemo(() => salespeople.map(sp => {
    const lAss = leads.filter(l => l.assigned_salesperson_id === sp.id).length;
    const lWon = leads.filter(l => l.assigned_salesperson_id === sp.id && ['cliente','won','converted'].includes((l.pipeline_stage || l.status || '').toLowerCase())).length;
    const pInv = preventivi.filter(p => {
      const lead = leads.find(l => l.id === p.lead_id);
      return lead?.assigned_salesperson_id === sp.id && inRange(p.created_at, range.start, range.end);
    });
    const val = pInv.filter(p => ['accettato','fatturato'].includes(p.stato)).reduce((s, x) => s + Number(x.importo_totale || 0), 0);
    return { id: sp.id, nome: `${sp.first_name || ''} ${sp.last_name || ''}`.trim() || 'N/D', lAss, pInv: pInv.length, val, conv: lAss > 0 ? (lWon / lAss) * 100 : 0 };
  }).sort((a, b) => b.val - a.val), [salespeople, leads, preventivi, range]);

  // ─── Render ───────────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-xs">CARICAMENTO DASHBOARD...</div>;

  const showOverview = tab === 'overview';
  const showCom = tab === 'overview' || tab === 'commerciale';
  const showCan = tab === 'overview' || tab === 'cantieri';
  const showFin = tab === 'overview' || tab === 'finanza';
  const showMag = tab === 'overview' || tab === 'magazzino';

  return (
    <div className="space-y-3 pb-12" style={{ fontFamily: 'inherit' }}>
      {/* TOP BAR */}
      <div className="sticky top-0 z-20 -mx-6 px-6 py-2.5 bg-[#F5F4F1]/95 backdrop-blur border-b" style={{ borderColor: 'rgba(26,26,46,0.10)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.01em' }}>Kalēa Terminal</h1>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9A9890', fontWeight: 600 }}>
              {range.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex" style={{ border: '1px solid rgba(26,26,46,0.10)', borderRadius: 4 }}>
              {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map(k => (
                <button key={k} onClick={() => setPeriod(k)}
                  style={{
                    padding: '5px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                    background: period === k ? '#1A1A2E' : '#FFFFFF',
                    color: period === k ? '#FFFFFF' : '#6B6760',
                  }}>
                  {PERIOD_LABELS[k]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 10, color: '#6B6760', fontWeight: 600, letterSpacing: '0.05em' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              LIVE · {format(lastSync, 'HH:mm:ss')}
            </div>
          </div>
        </div>

        {/* TAB BAR */}
        <div className="flex gap-0 mt-2 -mb-2.5">
          {(Object.keys(TAB_LABELS) as TabKey[]).map(k => (
            <button key={k} onClick={() => setTab(k)}
              style={{
                padding: '8px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
                color: tab === k ? '#1A1A2E' : '#9A9890',
                borderBottom: tab === k ? '2px solid #C4A882' : '2px solid transparent',
              }}>
              {TAB_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI ROW 1 — main */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {showCom && (
          <BigKPI
            label="Fatturato" value={revenuePeriod} format="eur" variant="dark"
            delta={revenueDelta} sub={`vs ${eurShort(revenuePrev)}`}
            icon={TrendingUp} onClick={() => navigate('/admin/pagamenti')}
          />
        )}
        {showCom && (
          <BigKPI
            label="Preventivi" value={preventiviPeriod.tot} variant="light"
            sub={`${preventiviPeriod.acc} acc · ${preventiviPeriod.rif} rif · ${preventiviPeriod.att} att`}
            icon={FileText} onClick={() => navigate('/admin/preventivi')}
          />
        )}
        {showCan && (
          <BigKPI
            label="Cantieri Attivi" value={cantieriAttivi.count} variant="gold"
            sub={`${cantieriAttivi.inPartenza} in partenza · ${cantieriAttivi.inRitardo} in ritardo`}
            icon={HardHat} onClick={() => navigate('/admin/cantieri')}
          />
        )}
        {showCom && (
          <BigKPI
            label="Margine Medio" value={margine.avg} format="pct" variant="semaphore" semaphore={margineSem}
            sub={`Su ${margine.count} vendite`} icon={Target}
            onClick={() => navigate('/admin/analytics')}
          />
        )}
      </div>

      {/* CHART + GAUGES (above the fold) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <Panel title="Fatturato · 12 mesi" right={<span className="text-[10px] tabular-nums" style={{ color: '#9A9890' }}>{eur(months12.reduce((s, x) => s + x.fatturato, 0))} totale</span>} className="lg:col-span-2">
          {months12.some(m => m.fatturato > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={months12} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gradFatt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C4A882" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#C4A882" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#EEEAE2" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9A9890' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9A9890' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip
                  contentStyle={{ background: '#1A1A2E', border: 'none', borderRadius: 4, fontSize: 11, color: '#fff' }}
                  labelStyle={{ color: '#C4A882', fontWeight: 700 }}
                  formatter={(v: any) => eur(v)}
                />
                <Area type="monotone" dataKey="fatturato" stroke="#C4A882" strokeWidth={2} fill="url(#gradFatt)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Panel>

        <Panel title="Performance">
          <div className="grid grid-cols-3 gap-2">
            <Gauge value={convRate} label="Conversione" sub="Lead→Cliente" color="#3b82f6" size={108} />
            <Gauge value={margine.avg} label="Margine" sub="Medio %" color={margineColor} size={108} />
            <Gauge value={goalPct} max={100} label="Obiettivo" sub={`/${eurShort(goal)}`} color="#C4A882" size={108} />
          </div>
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(26,26,46,0.06)' }}>
            <div className="flex justify-between" style={{ fontSize: 10, color: '#6B6760', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span>YTD</span>
              <span className="tabular-nums" style={{ color: '#1A1A2E', fontWeight: 700 }}>{eur(revenueYTD)}</span>
            </div>
            <div className="flex justify-between mt-1" style={{ fontSize: 10, color: '#6B6760', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span>Mancano</span>
              <span className="tabular-nums" style={{ color: '#1A1A2E', fontWeight: 700 }}>{eur(Math.max(0, goal - revenueYTD))}</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* KPI ROW 2 — secondary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {showCom && (
          <BigKPI label="Lead Pipeline" value={leadPipeline.total} variant="light"
            sub={`${leadPipeline.counts.in_trattativa || 0} in trattativa`}
            icon={Users} onClick={() => navigate('/admin/leads')}>
            <div className="mt-2 flex h-1.5 rounded-full overflow-hidden bg-[#EEEAE2]">
              {PIPELINE_STAGES.map((s, i) => {
                const v = leadPipeline.counts[s] || 0;
                const w = leadPipeline.total > 0 ? (v / leadPipeline.total) * 100 : 0;
                if (!w) return null;
                return <div key={s} style={{ width: `${w}%`, background: STAGE_COLORS[i] }} title={`${STAGE_LABEL[s]}: ${v}`} />;
              })}
            </div>
          </BigKPI>
        )}
        {showFin && (
          <BigKPI label="Fatturato YTD" value={revenueYTD} format="eur" variant="light"
            sub={`${goalPct.toFixed(0)}% obiettivo`} icon={TrendingUp}>
            <div className="mt-2 h-1.5 rounded-full bg-[#EEEAE2] overflow-hidden">
              <div className="h-full" style={{ width: `${Math.min(100, goalPct)}%`, background: '#C4A882', transition: 'width 1s ease-out' }} />
            </div>
          </BigKPI>
        )}
        {showFin && (
          <BigKPI label="Debiti Fornitori" value={debiti.total} format="eur"
            variant={debiti.total > 0 ? 'danger' : 'light'}
            sub={`${debiti.open.length} fornitori aperti`} icon={Wallet}
            onClick={() => navigate('/admin/pagamenti')} />
        )}
        {showMag && (
          <BigKPI label="Stock Sotto Scorta" value={lowStock.low} variant={lowStock.low > 0 ? 'semaphore' : 'light'}
            semaphore={lowStock.low > 5 ? 'red' : 'amber'}
            sub={`Stock totale ${Math.round(lowStock.total)} mq`} icon={Package}
            onClick={() => navigate('/admin/magazzino')} />
        )}
      </div>

      {/* SECONDARY CHARTS */}
      {(showCom || showOverview) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <Panel title="Preventivi · stato 6 mesi">
            {stato6.some(m => m.accettati + m.attesa + m.rifiutati > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stato6} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#EEEAE2" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9A9890' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9A9890' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1A1A2E', border: 'none', borderRadius: 4, fontSize: 11, color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
                  <Bar dataKey="accettati" stackId="a" fill="#16a34a" />
                  <Bar dataKey="attesa" stackId="a" fill="#eab308" />
                  <Bar dataKey="rifiutati" stackId="a" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </Panel>

          <Panel title="Pipeline lead">
            {leadPipeline.total > 0 ? (
              <div className="space-y-1.5">
                {PIPELINE_STAGES.map((s, i) => {
                  const v = leadPipeline.counts[s] || 0;
                  const w = leadPipeline.total > 0 ? (v / leadPipeline.total) * 100 : 0;
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <span style={{ fontSize: 10, width: 90, color: '#6B6760', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{STAGE_LABEL[s]}</span>
                      <div className="flex-1 h-5 bg-[#F5F4F1] overflow-hidden" style={{ borderRadius: 2 }}>
                        <div className="h-full flex items-center justify-end pr-2" style={{ width: `${Math.max(w, 6)}%`, background: STAGE_COLORS[i], transition: 'width 1s ease-out' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: i >= 3 ? '#fff' : '#1A1A2E' }}>{v}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <Empty />}
          </Panel>
        </div>
      )}

      {/* LIVE TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {showCom && (
          <Panel title="Ultimi preventivi" right={<button onClick={() => navigate('/admin/preventivi')} className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#C4A882' }}>Tutti →</button>}>
            {preventivi.length ? (
              <div className="divide-y" style={{ borderColor: 'rgba(26,26,46,0.04)' }}>
                {preventivi.slice(0, 5).map(p => (
                  <button key={p.id} onClick={() => navigate(`/admin/strumenti/crea-preventivo?id=${p.id}`)}
                    className="w-full text-left py-2 hover:bg-[#F5F4F1] flex justify-between items-center gap-2 px-1">
                    <div className="min-w-0">
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1A2E' }} className="truncate">{p.numero_preventivo}</div>
                      <div style={{ fontSize: 10, color: '#9A9890' }} className="truncate">{p.cliente_nome || '—'}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="tabular-nums" style={{ fontSize: 12, fontWeight: 700, color: '#1A1A2E' }}>{eurShort(Number(p.importo_totale || 0))}</div>
                      <StatoBadge stato={p.stato} />
                    </div>
                  </button>
                ))}
              </div>
            ) : <Empty msg="Nessun preventivo" />}
          </Panel>
        )}

        {showCan && (
          <Panel title="Cantieri in corso" right={<button onClick={() => navigate('/admin/cantieri')} className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#C4A882' }}>Tutti →</button>}>
            {sites.filter(s => s.status === 'attivo' || s.status === 'in_corso').length ? (
              <div className="space-y-2.5">
                {sites.filter(s => s.status === 'attivo' || s.status === 'in_corso').slice(0, 5).map(c => {
                  const today = new Date();
                  const start = c.start_date ? new Date(c.start_date) : null;
                  const end = c.end_date ? new Date(c.end_date) : null;
                  let p = 0;
                  if (start && end) {
                    const tot = differenceInDays(end, start);
                    const done = differenceInDays(today, start);
                    p = tot > 0 ? Math.max(0, Math.min(100, (done / tot) * 100)) : 0;
                  }
                  const ritardo = end && end < today;
                  return (
                    <button key={c.id} onClick={() => navigate(`/admin/cantieri/${c.id}`)} className="w-full text-left">
                      <div className="flex justify-between mb-1">
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1A2E' }} className="truncate">{c.title}</span>
                        {ritardo && <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: '#C0392B', padding: '1px 5px', borderRadius: 2 }}>RITARDO</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-[#EEEAE2] overflow-hidden" style={{ borderRadius: 1 }}>
                          <div className="h-full" style={{ width: `${p}%`, background: ritardo ? '#C0392B' : '#C4A882', transition: 'width 1s ease-out' }} />
                        </div>
                        <span className="tabular-nums" style={{ fontSize: 10, color: '#9A9890', width: 28, textAlign: 'right' }}>{Math.round(p)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : <Empty msg="Nessun cantiere attivo" />}
          </Panel>
        )}

        {showFin && (
          <Panel title="Debiti fornitori" right={<button onClick={() => navigate('/admin/pagamenti')} className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#C0392B' }}>Gestisci →</button>}>
            {debiti.open.length ? (
              <div className="divide-y" style={{ borderColor: 'rgba(26,26,46,0.04)' }}>
                {debiti.open.slice(0, 6).map((d, i) => (
                  <div key={i} className="flex justify-between items-center py-2 px-1">
                    <div className="min-w-0">
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1A2E' }} className="truncate">{d.name}</div>
                      {d.lastDate && <div style={{ fontSize: 10, color: '#9A9890' }}>Ultimo: {format(new Date(d.lastDate), 'dd MMM', { locale: it })}</div>}
                    </div>
                    <div className="tabular-nums shrink-0" style={{ fontSize: 12, fontWeight: 800, color: '#C0392B' }}>{eurShort(d.residuo)}</div>
                  </div>
                ))}
              </div>
            ) : <Empty msg="Nessun debito aperto" />}
          </Panel>
        )}
      </div>

      {/* ACTIVITY + CALENDAR */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
        <Panel title="Attività recente" className="lg:col-span-2">
          {activityFeed.length ? (
            <div className="space-y-2">
              {activityFeed.map((a, i) => {
                const cfg = {
                  preventivo: { icon: FileText, color: '#3b82f6', bg: '#dbeafe' },
                  cantiere: { icon: HardHat, color: '#C4A882', bg: '#F5EFE3' },
                  pagamento: { icon: CreditCard, color: '#C0392B', bg: '#FBEAEA' },
                  lead: { icon: UserPlus, color: '#16a34a', bg: '#EAF5EE' },
                }[a.type];
                const Icon = cfg.icon;
                return (
                  <button key={i} onClick={a.onClick} className="w-full text-left flex items-center gap-2.5 py-1 hover:bg-[#F5F4F1] px-1 rounded">
                    <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: cfg.bg }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1A2E' }} className="truncate">{a.title}</div>
                      <div style={{ fontSize: 10, color: '#9A9890' }} className="truncate">{a.sub}</div>
                    </div>
                    <div className="shrink-0 tabular-nums" style={{ fontSize: 9, color: '#B0998A' }}>{format(a.date, 'dd/MM HH:mm')}</div>
                  </button>
                );
              })}
            </div>
          ) : <Empty msg="Nessuna attività" />}
        </Panel>

        <Panel title={`Settimana · ${format(weekDays[0], 'd MMM', { locale: it })} → ${format(weekDays[6], 'd MMM', { locale: it })}`}
          right={
            <button onClick={() => navigate('/admin/planner')} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded hover:bg-muted/50 flex items-center gap-1" style={{ color: '#3B82F6' }}>
              <CalIcon className="w-3 h-3" /> Apri Planner Operativo →
            </button>
          } className="lg:col-span-3">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(d => {
              const key = format(d, 'yyyy-MM-dd');
              const events = calendarEvents[key] || [];
              const isToday = isSameDay(d, new Date());
              return (
                <div key={key} className="flex flex-col" style={{ border: isToday ? '1px solid #C4A882' : '1px solid rgba(26,26,46,0.05)', borderRadius: 2, background: isToday ? '#FBF7EE' : '#fff', minHeight: 130 }}>
                  <div className="px-1.5 py-1 border-b" style={{ borderColor: 'rgba(26,26,46,0.05)' }}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9A9890', fontWeight: 600 }}>{format(d, 'EEE', { locale: it })}</div>
                    <div className="tabular-nums" style={{ fontSize: 14, fontWeight: 800, color: isToday ? '#C4A882' : '#1A1A2E' }}>{format(d, 'd')}</div>
                  </div>
                  <div className="p-1 space-y-0.5 flex-1 overflow-hidden">
                    {events.slice(0, 4).map((ev, i) => (
                      <div key={i} className="truncate" style={{ fontSize: 9, padding: '2px 4px', borderLeft: `2px solid ${ev.color}`, background: `${ev.color}10`, color: '#1A1A2E', fontWeight: 600 }} title={ev.label}>
                        {ev.label}
                      </div>
                    ))}
                    {events.length > 4 && <div style={{ fontSize: 9, color: '#9A9890' }} className="px-1">+{events.length - 4}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* ADMIN ONLY */}
      {isAdmin && (
        <Panel title="Performance commerciali" right={<Briefcase className="w-3.5 h-3.5" style={{ color: '#9A9890' }} />}>
          {performanceAgenti.length ? (
            <table className="w-full" style={{ fontSize: 11 }}>
              <thead>
                <tr style={{ color: '#9A9890', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 9 }}>
                  <th className="text-left py-1.5 px-1 font-bold">Nome</th>
                  <th className="text-right py-1.5 px-1 font-bold">Lead</th>
                  <th className="text-right py-1.5 px-1 font-bold">Preventivi</th>
                  <th className="text-right py-1.5 px-1 font-bold">Conv.</th>
                  <th className="text-right py-1.5 px-1 font-bold">Valore</th>
                </tr>
              </thead>
              <tbody>
                {performanceAgenti.map((a, i) => (
                  <tr key={a.id} className={i % 2 ? 'bg-[#FAF9F6]' : ''} style={{ borderTop: '1px solid rgba(26,26,46,0.04)' }}>
                    <td className="py-1.5 px-1 font-semibold">{a.nome}</td>
                    <td className="py-1.5 px-1 text-right tabular-nums">{a.lAss}</td>
                    <td className="py-1.5 px-1 text-right tabular-nums">{a.pInv}</td>
                    <td className="py-1.5 px-1 text-right tabular-nums">{pct(a.conv)}</td>
                    <td className="py-1.5 px-1 text-right tabular-nums font-bold">{eur(a.val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <Empty msg="Nessun commerciale" />}
        </Panel>
      )}
    </div>
  );
};

function StatoBadge({ stato }: { stato: string }) {
  const m: Record<string, { bg: string; c: string; l: string }> = {
    accettato: { bg: '#dcfce7', c: '#15803d', l: 'ACC' },
    fatturato: { bg: '#dcfce7', c: '#15803d', l: 'FAT' },
    inviato: { bg: '#fef9c3', c: '#854d0e', l: 'ATT' },
    rifiutato: { bg: '#fee2e2', c: '#b91c1c', l: 'RIF' },
    bozza: { bg: '#f3f4f6', c: '#4b5563', l: 'BOZ' },
  };
  const s = m[stato] || m.bozza;
  return <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 2, background: s.bg, color: s.c, fontWeight: 800, letterSpacing: '0.05em' }}>{s.l}</span>;
}

export default AdminOverview;
