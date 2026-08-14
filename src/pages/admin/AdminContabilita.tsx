import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CrmPageHeader } from '@/components/admin/CrmShell';
import { StatusSelectPill, PAID_OPTIONS } from '@/components/admin/crm-ui';
import { toast } from 'sonner';
import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { format, differenceInDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Receipt, Wallet } from 'lucide-react';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

const eur = (n: number) => `€${Math.round(n || 0).toLocaleString('it-IT')}`;

type Rata = {
  id: string;
  invoice_number: string;
  origin: string;
  customer: string;
  amount: number;
  due_date: string | null;
  is_paid: boolean;
  paid_date: string | null;
};


type CashRow = { month: string; entrate: number; uscite: number; netto: number };

type CommissionRow = {
  id: string; user: string; customer: string | null;
  base: number; pct: number; amount: number; status: string; paid_at: string | null;
};

export default function AdminContabilita() {
  const [loading, setLoading] = useState(true);
  const [rate, setRate] = useState<Rata[]>([]);
  const [cashRows, setCashRows] = useState<CashRow[]>([]);
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, schedRes, payRes, supRes, fcRes, vcRes, comRes] = await Promise.all([
        supabase.from('customer_invoices').select('id, invoice_number, customer_id, total, paid_amount, status, due_date').neq('status', 'annullata'),
        supabase.from('payment_schedules').select('id, invoice_id, sale_id, amount, due_date, is_paid, paid_date, payment_type').order('due_date', { ascending: true, nullsFirst: false }),
        supabase.from('customer_payments').select('id, payment_date, amount'),
        supabase.from('supplier_payments').select('id, payment_date, payment_amount'),
        supabase.from('fixed_costs').select('id, amount, frequency, created_at'),
        supabase.from('variable_costs').select('id, amount, cost_date, created_at'),
        supabase.from('commissions').select('id, user_id, customer_id, customer_name, base_amount, percentage, amount, status, paid_at').order('created_at', { ascending: false }),
      ]);

      // Vendite collegate alle rate senza fattura
      const saleIds = Array.from(new Set((schedRes.data || []).map((s: any) => s.sale_id).filter(Boolean)));
      const salesRes = saleIds.length
        ? await supabase.from('sales').select('id, customer_id, sale_date, total_amount').in('id', saleIds)
        : { data: [] as any[] };
      const saleById = new Map((salesRes.data || []).map((s: any) => [s.id, s]));

      const invById = new Map((invRes.data || []).map((i: any) => [i.id, i]));
      const customerIds = Array.from(new Set([
        ...((invRes.data || []).map((i: any) => i.customer_id)),
        ...((comRes.data || []).map((c: any) => c.customer_id)),
        ...((salesRes.data || []).map((s: any) => s.customer_id)),
      ].filter(Boolean)));

      const [custRes, spRes] = await Promise.all([
        customerIds.length ? supabase.from('customers').select('id, first_name, last_name, company_name').in('id', customerIds) : Promise.resolve({ data: [] as any[] }),
        supabase.from('salespeople').select('id, full_name, user_id'),
      ]);
      const custMap = new Map((custRes.data || []).map((c: any) => [c.id, c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim()]));
      const spByUser = new Map((spRes.data || []).map((s: any) => [s.user_id, s.full_name]));

      // Tutte le rate: da fattura oppure da vendita (conversione preventivo)
      const rataRows: Rata[] = (schedRes.data || []).map((s: any) => {
        const inv: any = s.invoice_id ? invById.get(s.invoice_id) : null;
        const sale: any = !inv && s.sale_id ? saleById.get(s.sale_id) : null;
        const origin = inv
          ? `Fattura ${inv.invoice_number || '—'}`
          : sale
            ? `Vendita del ${sale.sale_date ? format(new Date(sale.sale_date), 'dd/MM/yyyy', { locale: it }) : '—'}`
            : 'Rata manuale';
        return {
          id: s.id,
          invoice_number: s.payment_type || inv?.invoice_number || '—',
          origin,
          customer: custMap.get(inv?.customer_id) || custMap.get(sale?.customer_id) || '—',
          amount: Number(s.amount || 0),
          due_date: s.due_date,
          is_paid: !!s.is_paid,
          paid_date: s.paid_date,
        };
      });


      // Cash flow ultimi 6 mesi
      const months: CashRow[] = [];
      for (let i = 5; i >= 0; i--) {
        const ref = subMonths(new Date(), i);
        const start = startOfMonth(ref);
        const end = endOfMonth(ref);
        const inRange = (d: string | null | undefined) => {
          if (!d) return false;
          const dt = new Date(d);
          return dt >= start && dt <= end;
        };
        const entrate = (payRes.data || []).filter((p: any) => inRange(p.payment_date)).reduce((s, p: any) => s + Number(p.amount || 0), 0);
        const uSup = (supRes.data || []).filter((p: any) => inRange(p.payment_date)).reduce((s, p: any) => s + Number(p.payment_amount || 0), 0);
        const uFc = (fcRes.data || []).filter((f: any) => f.frequency === 'mensile' || inRange(f.created_at)).reduce((s, f: any) => s + (f.frequency === 'mensile' ? Number(f.amount || 0) : (inRange(f.created_at) ? Number(f.amount || 0) : 0)), 0);
        const uVc = (vcRes.data || []).filter((v: any) => inRange(v.cost_date || v.created_at)).reduce((s, v: any) => s + Number(v.amount || 0), 0);
        const uscite = uSup + uFc + uVc;
        months.push({ month: format(ref, 'MMM yy', { locale: it }), entrate, uscite, netto: entrate - uscite });
      }
      setCashRows(months);

      const comRows: CommissionRow[] = (comRes.data || []).map((c: any) => ({
        id: c.id,
        user: spByUser.get(c.user_id) || '—',
        customer: c.customer_name || custMap.get(c.customer_id) || null,
        base: Number(c.base_amount || 0),
        pct: Number(c.percentage || 0),
        amount: Number(c.amount || 0),
        status: c.status || 'da_liquidare',
        paid_at: c.paid_at,
      }));

      setRate(rataRows);
      setCommissions(comRows);
    } finally {
      setLoading(false);
    }
  }, []);

  useRealtimeSubscription({
    tables: ['customer_invoices', 'customer_payments', 'payment_schedules', 'supplier_payments', 'fixed_costs', 'variable_costs', 'commissions', 'sales'],
    onDataChange: load,
  });

  useEffect(() => { load(); }, [load]);

  const toggleRata = async (r: Rata, isPaid: boolean) => {
    const { error } = await supabase
      .from('payment_schedules')
      .update({ is_paid: isPaid, paid_date: isPaid ? new Date().toISOString().split('T')[0] : null })
      .eq('id', r.id);
    if (error) { toast.error(error.message); return; }
    toast.success(isPaid ? 'Rata segnata come pagata' : 'Rata segnata come da incassare');
    load();
  };

  const toggleCommission = async (c: CommissionRow, status: string) => {
    const { error } = await supabase
      .from('commissions')
      .update({ status, paid_at: status === 'pagata' ? new Date().toISOString() : null })
      .eq('id', c.id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === 'pagata' ? 'Provvigione liquidata' : 'Provvigione da liquidare');
    load();
  };

  const today = new Date();
  const insoluti = useMemo(() => rate.filter(r => !r.is_paid && r.due_date && new Date(r.due_date) < today), [rate]);
  const totRateOpen = rate.filter(r => !r.is_paid).reduce((s, r) => s + r.amount, 0);
  const totInsoluti = insoluti.reduce((s, r) => s + r.amount, 0);
  const totEntrateMese = cashRows[cashRows.length - 1]?.entrate || 0;
  const totUsciteMese = cashRows[cashRows.length - 1]?.uscite || 0;
  const totComOpen = commissions.filter(c => c.status !== 'pagata' && c.status !== 'paid').reduce((s, c) => s + c.amount, 0);

  const rataCols: DataTableColumn<Rata>[] = [
    { key: 'origin', header: 'Origine' },
    { key: 'invoice_number', header: 'Rata', cell: (r) => r.invoice_number || '—' },

    { key: 'customer', header: 'Cliente' },
    { key: 'amount', header: 'Importo', cell: (r) => <span className="font-semibold">{eur(r.amount)}</span> },
    { key: 'due_date', header: 'Scadenza', cell: (r) => r.due_date ? format(new Date(r.due_date), 'dd/MM/yyyy', { locale: it }) : '—' },
    {
      key: 'is_paid', header: 'Stato', cell: (r) => {
        const late = !r.is_paid && r.due_date && new Date(r.due_date) < today;
        const lateDays = late ? differenceInDays(today, new Date(r.due_date!)) : 0;
        return (
          <StatusSelectPill
            value={r.is_paid ? 'paid' : 'unpaid'}
            options={[
              { value: 'unpaid', label: late ? `Scaduta ${lateDays}g` : 'In scadenza', tone: late ? 'danger' : 'warning' },
              { value: 'paid', label: 'Pagata', tone: 'success' },
            ]}
            onChange={(v) => toggleRata(r, v === 'paid')}
          />
        );
      }
    },
  ];

  const cashCols: DataTableColumn<CashRow>[] = [
    { key: 'month', header: 'Mese' },
    { key: 'entrate', header: 'Entrate', cell: (r) => <span className="text-green-700 font-semibold">{eur(r.entrate)}</span> },
    { key: 'uscite', header: 'Uscite', cell: (r) => <span className="text-red-700 font-semibold">{eur(r.uscite)}</span> },
    { key: 'netto', header: 'Netto', cell: (r) => <span className={`font-bold ${r.netto >= 0 ? 'text-green-700' : 'text-red-700'}`}>{eur(r.netto)}</span> },
  ];

  const comCols: DataTableColumn<CommissionRow>[] = [
    { key: 'user', header: 'Commerciale' },
    { key: 'customer', header: 'Cliente', cell: (c) => c.customer || '—' },
    { key: 'base', header: 'Base', cell: (c) => eur(c.base) },
    { key: 'pct', header: '%', cell: (c) => `${c.pct}%` },
    { key: 'amount', header: 'Provvigione', cell: (c) => <span className="font-semibold">{eur(c.amount)}</span> },
    {
      key: 'status', header: 'Stato', cell: (c) => (
        <StatusSelectPill
          value={c.status === 'pagata' || c.status === 'paid' ? 'pagata' : 'da_liquidare'}
          options={[
            { value: 'da_liquidare', label: 'Da liquidare', tone: 'warning' },
            { value: 'pagata', label: 'Pagata', tone: 'success' },
          ]}
          onChange={(v) => toggleCommission(c, v)}
        />
      )
    },
  ];

  return (
    <div className="space-y-6">
      <CrmPageHeader
        title="Contabilità"
        subtitle="Scadenzario, insoluti, cash flow e commissioni — sistema unificato"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard icon={TrendingUp} label="Rate aperte" value={eur(totRateOpen)} color="#0EA5E9" />
        <KpiCard icon={AlertTriangle} label={`Insoluti (${insoluti.length})`} value={eur(totInsoluti)} color="#DC2626" />
        <KpiCard icon={Wallet} label="Entrate (mese)" value={eur(totEntrateMese)} color="#16A34A" />
        <KpiCard icon={TrendingDown} label="Uscite (mese)" value={eur(totUsciteMese)} color="#F59E0B" />
        <KpiCard icon={DollarSign} label="Commissioni da liquidare" value={eur(totComOpen)} color="#A855F7" />
      </div>

      <Tabs defaultValue="scadenzario" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scadenzario">Scadenzario ({rate.length})</TabsTrigger>
          <TabsTrigger value="insoluti">Insoluti ({insoluti.length})</TabsTrigger>
          <TabsTrigger value="cashflow">Cash flow</TabsTrigger>
          <TabsTrigger value="commissioni">Commissioni ({commissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="scadenzario">
          <Card>
            <CardHeader><CardTitle>Scadenzario rate</CardTitle></CardHeader>
            <CardContent>
              <DataTable data={rate} columns={rataCols} loading={loading} emptyTitle="Nessuna rata pianificata" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insoluti">
          <Card>
            <CardHeader><CardTitle>Rate scadute non pagate</CardTitle></CardHeader>
            <CardContent>
              <DataTable data={insoluti} columns={rataCols} loading={loading} emptyTitle="Nessun insoluto — tutto in regola" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader><CardTitle>Cash flow — ultimi 6 mesi</CardTitle></CardHeader>
            <CardContent>
              <DataTable data={cashRows} columns={cashCols} loading={loading} emptyTitle="Nessun movimento" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissioni">
          <Card>
            <CardHeader><CardTitle>Commissioni commerciali</CardTitle></CardHeader>
            <CardContent>
              <DataTable data={commissions} columns={comCols} loading={loading} emptyTitle="Nessuna commissione generata" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}1A` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-lg font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
