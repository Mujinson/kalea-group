import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CrmPageHeader } from '@/components/admin/CrmShell';
import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Wallet, Receipt } from 'lucide-react';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

const eur = (n: number) =>
  `€${Math.round(n || 0).toLocaleString('it-IT')}`;

type Receivable = {
  id: string;
  source: 'fattura' | 'rata';
  customer: string;
  amount: number;
  due_date: string | null;
  paid: boolean;
  status: string;
};

type Payable = {
  id: string;
  source: 'pagamento' | 'accordo';
  supplier: string;
  amount: number;
  date: string | null;
  notes: string | null;
};

type CommissionRow = {
  id: string;
  user: string;
  customer: string | null;
  base: number;
  pct: number;
  amount: number;
  status: string;
  paid_at: string | null;
};

export default function AdminContabilita() {
  const [loading, setLoading] = useState(true);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, schedRes, payRes, agrRes, comRes] = await Promise.all([
        supabase.from('commercial_invoices').select('id, invoice_number, total_amount, status, due_date, paid_date, salesperson_id').order('due_date', { ascending: true, nullsFirst: false }),
        supabase.from('payment_schedules').select('id, amount, due_date, is_paid, paid_date, payment_type, sale_id').order('due_date', { ascending: true, nullsFirst: false }),
        supabase.from('supplier_payments').select('*').order('payment_date', { ascending: false }),
        supabase.from('payment_agreements').select('*'),
        supabase.from('commissions').select('id, user_id, customer_id, customer_name, base_amount, percentage, amount, status, paid_at').order('created_at', { ascending: false }),
      ]);

      // Map salesperson + customer names lazily
      const salespeopleIds = Array.from(new Set((invRes.data || []).map((i: any) => i.salesperson_id).filter(Boolean)));
      const customerIds = Array.from(new Set((comRes.data || []).map((c: any) => c.customer_id).filter(Boolean)));
      const saleIds = Array.from(new Set((schedRes.data || []).map((s: any) => s.sale_id).filter(Boolean)));

      const [spRes, custRes, salesRes, usersRes] = await Promise.all([
        salespeopleIds.length ? supabase.from('salespeople').select('id, full_name, user_id').in('id', salespeopleIds) : Promise.resolve({ data: [] as any[] }),
        customerIds.length ? supabase.from('customers').select('id, first_name, last_name, company_name').in('id', customerIds) : Promise.resolve({ data: [] as any[] }),
        saleIds.length ? supabase.from('sales').select('id, customer_id').in('id', saleIds) : Promise.resolve({ data: [] as any[] }),
        supabase.from('salespeople').select('id, full_name, user_id'),
      ]);

      const spByUser = new Map((usersRes.data || []).map((s: any) => [s.user_id, s.full_name]));
      const custMap = new Map((custRes.data || []).map((c: any) => [c.id, c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim()]));
      const saleCustomerMap = new Map((salesRes.data || []).map((s: any) => [s.id, s.customer_id]));

      // Need to also resolve sale → customer name
      const extraCustIds = Array.from(new Set(Array.from(saleCustomerMap.values()).filter(Boolean))).filter((id: any) => !custMap.has(id));
      if (extraCustIds.length) {
        const { data: extraCust } = await supabase.from('customers').select('id, first_name, last_name, company_name').in('id', extraCustIds as string[]);
        (extraCust || []).forEach((c: any) => custMap.set(c.id, c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim()));
      }

      const recRows: Receivable[] = [
        ...(invRes.data || []).map((i: any) => ({
          id: i.id,
          source: 'fattura' as const,
          customer: i.invoice_number || '—',
          amount: Number(i.total_amount || 0),
          due_date: i.due_date,
          paid: !!i.paid_date,
          status: i.status || (i.paid_date ? 'pagata' : 'da incassare'),
        })),
        ...(schedRes.data || []).map((s: any) => ({
          id: s.id,
          source: 'rata' as const,
          customer: custMap.get(saleCustomerMap.get(s.sale_id)) || '—',
          amount: Number(s.amount || 0),
          due_date: s.due_date,
          paid: !!s.is_paid,
          status: s.is_paid ? 'pagata' : s.payment_type || 'in scadenza',
        })),
      ];

      const payRows: Payable[] = [
        ...(payRes.data || []).map((p: any) => ({
          id: p.id,
          source: 'pagamento' as const,
          supplier: p.supplier_name || '—',
          amount: Number(p.payment_amount || 0),
          date: p.payment_date,
          notes: p.notes,
        })),
        ...(agrRes.data || []).map((a: any) => ({
          id: a.id,
          source: 'accordo' as const,
          supplier: a.supplier_name || '—',
          amount: Number(a.total_amount || 0),
          date: a.end_date,
          notes: a.notes,
        })),
      ];

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

      setReceivables(recRows);
      setPayables(payRows);
      setCommissions(comRows);
    } finally {
      setLoading(false);
    }
  }, []);

  useRealtimeSubscription({
    tables: ['commercial_invoices', 'payment_schedules', 'supplier_payments', 'payment_agreements', 'commissions'],
    onDataChange: load,
  });

  useEffect(() => { load(); }, [load]);

  const today = new Date();
  const totRecOpen = receivables.filter(r => !r.paid).reduce((s, r) => s + r.amount, 0);
  const totRecOverdue = receivables.filter(r => !r.paid && r.due_date && new Date(r.due_date) < today).reduce((s, r) => s + r.amount, 0);
  const totPay = payables.reduce((s, p) => s + p.amount, 0);
  const totComOpen = commissions.filter(c => c.status !== 'pagata' && c.status !== 'paid').reduce((s, c) => s + c.amount, 0);
  const totComPaid = commissions.filter(c => c.status === 'pagata' || c.status === 'paid').reduce((s, c) => s + c.amount, 0);

  const recCols: DataTableColumn<Receivable>[] = [
    { key: 'source', header: 'Tipo', cell: (r) => <Badge variant="outline">{r.source}</Badge> },
    { key: 'customer', header: 'Cliente / Rif.' },
    { key: 'amount', header: 'Importo', cell: (r) => <span className="font-semibold">{eur(r.amount)}</span> },
    { key: 'due_date', header: 'Scadenza', cell: (r) => r.due_date ? format(new Date(r.due_date), 'dd/MM/yyyy', { locale: it }) : '—' },
    {
      key: 'status', header: 'Stato', cell: (r) => {
        if (r.paid) return <Badge className="bg-green-100 text-green-800">pagata</Badge>;
        if (r.due_date && new Date(r.due_date) < today) {
          const d = differenceInDays(today, new Date(r.due_date));
          return <Badge className="bg-red-100 text-red-800">scaduta {d}g</Badge>;
        }
        return <Badge variant="outline">{r.status}</Badge>;
      }
    },
  ];

  const payCols: DataTableColumn<Payable>[] = [
    { key: 'source', header: 'Tipo', cell: (p) => <Badge variant="outline">{p.source}</Badge> },
    { key: 'supplier', header: 'Fornitore' },
    { key: 'amount', header: 'Importo', cell: (p) => <span className="font-semibold">{eur(p.amount)}</span> },
    { key: 'date', header: 'Data', cell: (p) => p.date ? format(new Date(p.date), 'dd/MM/yyyy', { locale: it }) : '—' },
    { key: 'notes', header: 'Note', cell: (p) => p.notes || '—' },
  ];

  const comCols: DataTableColumn<CommissionRow>[] = [
    { key: 'user', header: 'Commerciale' },
    { key: 'customer', header: 'Cliente', cell: (c) => c.customer || '—' },
    { key: 'base', header: 'Base', cell: (c) => eur(c.base) },
    { key: 'pct', header: '%', cell: (c) => `${c.pct}%` },
    { key: 'amount', header: 'Provvigione', cell: (c) => <span className="font-semibold">{eur(c.amount)}</span> },
    {
      key: 'status', header: 'Stato', cell: (c) =>
        c.status === 'pagata' || c.status === 'paid'
          ? <Badge className="bg-green-100 text-green-800">pagata</Badge>
          : <Badge className="bg-amber-100 text-amber-800">da liquidare</Badge>
    },
  ];

  return (
    <div className="space-y-6">
      <CrmPageHeader
        title="Contabilità"
        subtitle="Crediti, debiti e commissioni in un'unica vista"
        
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard icon={TrendingUp} label="Crediti aperti" value={eur(totRecOpen)} color="#0EA5E9" />
        <KpiCard icon={AlertTriangle} label="Crediti scaduti" value={eur(totRecOverdue)} color="#DC2626" />
        <KpiCard icon={TrendingDown} label="Debiti fornitori" value={eur(totPay)} color="#F59E0B" />
        <KpiCard icon={DollarSign} label="Commissioni da liquidare" value={eur(totComOpen)} color="#A855F7" />
        <KpiCard icon={Receipt} label="Commissioni pagate" value={eur(totComPaid)} color="#16A34A" />
      </div>

      <Tabs defaultValue="crediti" className="space-y-4">
        <TabsList>
          <TabsTrigger value="crediti">Crediti ({receivables.length})</TabsTrigger>
          <TabsTrigger value="debiti">Debiti ({payables.length})</TabsTrigger>
          <TabsTrigger value="commissioni">Commissioni ({commissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="crediti">
          <Card>
            <CardHeader><CardTitle>Crediti — fatture clienti e rate</CardTitle></CardHeader>
            <CardContent>
              <DataTable data={receivables} columns={recCols} loading={loading} emptyTitle="Nessun credito registrato" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debiti">
          <Card>
            <CardHeader><CardTitle>Debiti — pagamenti fornitori e accordi</CardTitle></CardHeader>
            <CardContent>
              <DataTable data={payables} columns={payCols} loading={loading} emptyTitle="Nessun debito registrato" />
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

function KpiCard({ icon: Icon, label, value, color }: { icon: any; header: string; value: string; color: string }) {
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
