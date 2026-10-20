import { CrmKpiTile, CrmKpiRow } from '@/components/admin/CrmShell';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { fmtEur } from '@/lib/finance';
import CustomerDetailSheet from '@/components/admin/CustomerDetailSheet';
import { Wallet, Receipt, Hourglass, FileText, XCircle, ThumbsUp, ThumbsDown, Check, RotateCcw, ChevronRight, User } from 'lucide-react';

const RT_TABLES: any = ['payment_schedules', 'customer_invoices', 'quotes', 'sales'];
const WON = ['accepted', 'converted', 'invoiced'];
type Kind = 'incassato' | 'fatturato' | 'da_ricevere' | 'scaduto' | 'preventivato' | 'perso' | 'vinti';
const today = () => new Date().toISOString().split('T')[0];
const r2 = (n: number) => Math.round(n * 100) / 100;
const fd = (d?: string | null) => (d ? format(new Date(d), 'd MMM yyyy', { locale: it }) : '—');
const n = (v: any) => Number(v || 0);

export default function RevenueFunnelBlock({ variant = 'dashboard', lead }: { variant?: 'dashboard' | 'billing'; lead?: ReactNode } = {}) {
  const qc = useQueryClient();
  const [period, setPeriod] = useState<'year' | 'all'>(variant === 'billing' ? 'all' : 'year');
  const [open, setOpen] = useState<Kind | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['revenue-funnel'],
    queryFn: async () => {
      const [ps, inv, q] = await Promise.all([
        supabase.from('payment_schedules').select('id, amount, is_paid, paid_date, due_date, payment_type, notes, sale_id, is_invoiced, invoice_id, invoice_number, invoiced_amount, sales(customer_id, customer_name)'),
        supabase.from('customer_invoices').select('id, invoice_number, total, paid_amount, invoice_date, due_date, status, customer_id, customers(company_name, first_name, last_name)'),
        supabase.from('quotes').select('id, quote_number, client_name, project_name, status, total_amount, created_at, customer_id'),
      ]);
      return { ps: (ps.data || []) as any[], inv: (inv.data || []) as any[], q: (q.data || []) as any[] };
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  useRealtimeSubscription({ tables: RT_TABLES, onDataChange: useCallback(() => qc.invalidateQueries({ queryKey: ['revenue-funnel'] }), [qc]) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['revenue-funnel'] }); qc.invalidateQueries({ queryKey: ['finance-overview'] }); };

  const c = useMemo(() => {
    const y = new Date().getFullYear();
    const ok = (d?: string | null) => period === 'all' || (!!d && new Date(d).getFullYear() === y);
    const d = data || { ps: [], inv: [], q: [] };
    const custName = (r: any) => r.customers?.company_name || `${r.customers?.first_name || ''} ${r.customers?.last_name || ''}`.trim() || '—';
    // Anti doppio conteggio: le rate già coperte da una fattura (invoice_id) vivono sulla fattura
    const invWithPs = new Set(d.ps.filter((r) => r.invoice_id).map((r) => r.invoice_id));
    const direct = d.ps.filter((r) => !r.invoice_id);
    const paidPs = direct.filter((r) => r.is_paid && ok(r.paid_date || r.due_date));
    const unpaidPs = direct.filter((r) => !r.is_paid);
    // Fatture senza rate collegate: contano da sole (incassato = paid_amount, da ricevere = residuo)
    const standalone = d.inv.filter((r) => r.status !== 'annullata' && !invWithPs.has(r.id));
    const invAsPaid = standalone.filter((r) => n(r.paid_amount) > 0 && ok(r.invoice_date)).map((r) => ({
      id: 'inv-' + r.id, isInvoice: true, invoice_id: r.id, amount: n(r.paid_amount), is_paid: true,
      paid_date: r.invoice_date, due_date: r.due_date, notes: `Fattura ${r.invoice_number || ''}`,
      sales: { customer_id: r.customer_id, customer_name: custName(r) },
    }));
    const invAsOpen = standalone.filter((r) => n(r.total) - n(r.paid_amount) > 0.01 && ok(r.invoice_date)).map((r) => ({
      id: 'inv-' + r.id, isInvoice: true, invoice_id: r.id, amount: r2(n(r.total) - n(r.paid_amount)), is_paid: false,
      due_date: r.due_date || r.invoice_date, notes: `Fattura ${r.invoice_number || ''}`,
      sales: { customer_id: r.customer_id, customer_name: custName(r) },
    }));
    const paid = [...paidPs, ...invAsPaid].sort((a, b) => (b.paid_date || '').localeCompare(a.paid_date || ''));
    const unpaid = [...unpaidPs, ...invAsOpen].sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));
    // incassato = fatturato: le rate incassate senza fattura collegata contano come fatturate
    const fromPaid = paidPs.filter((r) => r.is_invoiced).map((r) => ({
      id: 'ps-' + r.id, invoice_number: r.invoice_number || 'Da incasso', total: n(r.invoiced_amount ?? r.amount), paid_amount: n(r.invoiced_amount ?? r.amount),
      invoice_date: r.paid_date || r.due_date, customer_id: r.sales?.customer_id, customers: { company_name: r.sales?.customer_name },
    }));
    const inv = [...d.inv.filter((r) => r.status !== 'annullata' && ok(r.invoice_date)), ...fromPaid].sort((a, b) => (b.invoice_date || '').localeCompare(a.invoice_date || ''));
    const qs = d.q.filter((r) => ok(r.created_at) && r.status !== 'draft').sort((a, b) => b.created_at.localeCompare(a.created_at));
    const won = qs.filter((r) => WON.includes(r.status));
    const lost = qs.filter((r) => r.status === 'rejected');
    const sum = (a: any[], k: string) => a.reduce((s, r) => s + n(r[k]), 0);
    const vinto = sum(won, 'total_amount'), perso = sum(lost, 'total_amount');
    const closed = won.length + lost.length;
    const overdue = unpaid.filter((r) => r.due_date && r.due_date < today());
    return {
      paid, unpaid, inv, qs, won, lost, vinto, perso, closed, overdue,
      incassato: sum(paid, 'amount'), daRicevere: sum(unpaid, 'amount'), scaduto: sum(overdue, 'amount'),
      fatturato: sum(inv, 'total'), preventivato: sum(qs, 'total_amount'),
      pWon: closed ? (won.length / closed) * 100 : 0,
      pVal: vinto + perso ? (vinto / (vinto + perso)) * 100 : 0,
    };
  }, [data, period]);

  const tiles: { k: Kind; label: string; value: string; hint: string; icon: ReactNode; tone: string }[] = [
    { k: 'incassato', label: 'Incassato', value: fmtEur(c.incassato), hint: `${c.paid.length} pagamenti ricevuti`, icon: <Wallet />, tone: 'text-emerald-600 bg-emerald-50' },
    { k: 'fatturato', label: 'Fatturato', value: fmtEur(c.fatturato), hint: `${c.inv.length} fatture emesse`, icon: <Receipt />, tone: 'text-indigo-600 bg-indigo-50' },
    { k: 'da_ricevere', label: 'Da ricevere', value: fmtEur(c.daRicevere), hint: c.scaduto > 0 ? `di cui scaduto ${fmtEur(c.scaduto)}` : `${c.unpaid.length} rate in attesa`, icon: <Hourglass />, tone: 'text-amber-600 bg-amber-50' },
    { k: 'preventivato', label: 'Preventivato', value: fmtEur(c.preventivato), hint: `${c.qs.length} preventivi · ${c.qs.length - c.closed} aperti`, icon: <FileText />, tone: 'text-blue-600 bg-blue-50' },
    { k: 'perso', label: 'Perso', value: fmtEur(c.perso), hint: `${c.lost.length} preventivi persi`, icon: <XCircle />, tone: 'text-red-600 bg-red-50' },
    { k: 'vinti', label: 'Chiusura positiva', value: `${c.pWon.toFixed(0)}%`, hint: `${c.won.length} vinti su ${c.closed} · ${c.pVal.toFixed(0)}% del valore`, icon: <ThumbsUp />, tone: 'text-emerald-600 bg-emerald-50' },
    { k: 'perso', label: 'Chiusura negativa', value: `${c.closed ? (100 - c.pWon).toFixed(0) : 0}%`, hint: `${c.lost.length} persi su ${c.closed} · ${c.closed ? (100 - c.pVal).toFixed(0) : 0}% del valore`, icon: <ThumbsDown />, tone: 'text-red-600 bg-red-50' },
  ];

  const sheet = (
    <>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader><SheetTitle>{open === 'scaduto' ? 'Scaduto' : tiles.find((t) => t.k === open)?.label}</SheetTitle></SheetHeader>
          <div className="mt-4">
            {open === 'da_ricevere' && <PaymentsList rows={c.unpaid} onChanged={refresh} onCustomer={setCustomerId} />}
            {open === 'scaduto' && <PaymentsList rows={c.overdue} onChanged={refresh} onCustomer={setCustomerId} />}
            {open === 'incassato' && <PaymentsList rows={c.paid} onChanged={refresh} onCustomer={setCustomerId} />}
            {open === 'fatturato' && <InvoicesList rows={c.inv} onCustomer={setCustomerId} />}
            {open === 'preventivato' && <QuotesList rows={c.qs} />}
            {open === 'perso' && <QuotesList rows={c.lost} />}
            {open === 'vinti' && <QuotesList rows={c.won} />}
          </div>
        </SheetContent>
      </Sheet>
      <CustomerDetailSheet customerId={customerId} open={!!customerId} onClose={() => setCustomerId(null)} onUpdate={refresh} />
    </>
  );

  if (variant === 'billing') {
    return (
      <>
        <CrmKpiRow cols={5}>
          {lead}
          <CrmKpiTile label="Fatturato" value={fmtEur(c.fatturato)} color="blue" icon={<Receipt className="w-4 h-4" />} hint={`${c.inv.length} fatture + rate incassate`} onClick={() => setOpen('fatturato')} />
          <CrmKpiTile label="Incassato" value={fmtEur(c.incassato)} color="green" icon={<Wallet className="w-4 h-4" />} hint={`${c.paid.length} pagamenti ricevuti`} onClick={() => setOpen('incassato')} />
          <CrmKpiTile label="Da incassare" value={fmtEur(c.daRicevere)} color="amber" icon={<Hourglass className="w-4 h-4" />} hint={`${c.unpaid.length} rate in attesa`} onClick={() => setOpen('da_ricevere')} />
          <CrmKpiTile label="Scaduto" value={fmtEur(c.scaduto)} color="red" icon={<XCircle className="w-4 h-4" />} hint={`${c.overdue.length} rate oltre scadenza`} onClick={() => setOpen('scaduto')} />
        </CrmKpiRow>
        {sheet}
      </>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Soldi e preventivi</h2>
        <div className="flex rounded-md border overflow-hidden text-[12px]">
          {(['year', 'all'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 ${period === p ? 'bg-crm-primary text-primary-foreground' : 'bg-card'}`}>
              {p === 'year' ? `Anno ${new Date().getFullYear()}` : 'Sempre'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
        {tiles.map((t, i) => (
          <button key={i} onClick={() => setOpen(t.k)}
            className="group text-left rounded-xl border bg-card p-3 h-[112px] flex flex-col justify-between min-w-0 hover:shadow-md hover:border-crm-primary/40 transition">
            <div className="flex items-start justify-between gap-2 min-w-0">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold leading-tight truncate">{t.label}</span>
              <span className={`shrink-0 w-7 h-7 rounded-lg grid place-items-center [&>svg]:w-4 [&>svg]:h-4 ${t.tone}`}>{t.icon}</span>
            </div>
            <div className="text-[clamp(15px,1.5vw,20px)] font-bold tabular-nums truncate">{t.value}</div>
            <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground min-w-0">
              <span className="truncate">{t.hint}</span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>

      {sheet}
    </div>
  );
}

function Total({ label, value }: { label: string; value: number }) {
  return <div className="flex justify-between text-sm font-semibold border-b pb-2 mb-2"><span>{label}</span><span>{fmtEur(value)}</span></div>;
}

function PaymentsList({ rows, onChanged, onCustomer }: { rows: any[]; onChanged: () => void; onCustomer: (id: string) => void }) {
  const [partial, setPartial] = useState<{ id: string; v: string } | null>(null);
  if (!rows.length) return <p className="text-sm text-muted-foreground text-center py-8">Nessun pagamento.</p>;

  const setPaid = async (r: any, paid: boolean) => {
    // Fatture senza rata: l'incasso si registra come pagamento sulla fattura (il trigger aggiorna paid_amount)
    if (r.isInvoice) {
      if (!paid) return;
      const { error } = await supabase.from('customer_payments').insert({ invoice_id: r.invoice_id, payment_date: today(), amount: r.amount, method: 'bonifico', notes: 'Incasso registrato da dashboard' });
      if (error) return toast.error(error.message);
      toast.success(`Incassati ${fmtEur(r.amount)}`);
      onChanged();
      return;
    }
    const { error } = await supabase.from('payment_schedules').update({ is_paid: paid, paid_date: paid ? today() : null }).eq('id', r.id);
    if (error) return toast.error(error.message);
    toast.success(paid ? `Incassati ${fmtEur(r.amount)}` : 'Rimesso tra i da ricevere');
    onChanged();
  };
  const payPartial = async (r: any) => {
    const v = r2(Number(partial?.v));
    if (!v || v <= 0) return toast.error('Inserisci un importo');
    if (v >= n(r.amount)) return setPaid(r, true).then(() => setPartial(null));
    const rest = r2(n(r.amount) - v);
    const { error } = await supabase.from('payment_schedules').update({ amount: v, is_paid: true, paid_date: today() }).eq('id', r.id);
    if (error) return toast.error(error.message);
    await supabase.from('payment_schedules').insert({ sale_id: r.sale_id, amount: rest, due_date: r.due_date, payment_type: r.payment_type, is_paid: false, notes: 'Resto di un pagamento parziale' });
    toast.success(`Incassati ${fmtEur(v)}, restano ${fmtEur(rest)}`);
    setPartial(null); onChanged();
  };

  // raggruppa per cliente
  const groups = new Map<string, { name: string; cid: string | null; items: any[] }>();
  rows.forEach((r) => {
    const key = r.sales?.customer_id || r.sales?.customer_name || '—';
    if (!groups.has(key)) groups.set(key, { name: r.sales?.customer_name || 'Senza cliente', cid: r.sales?.customer_id || null, items: [] });
    groups.get(key)!.items.push(r);
  });

  return (
    <div className="space-y-4">
      <Total label={`${rows.length} pagamenti`} value={rows.reduce((s, r) => s + n(r.amount), 0)} />
      {[...groups.values()].map((g) => (
        <div key={g.name} className="rounded-lg border">
          <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b">
            <span className="font-medium text-sm truncate">{g.name} · {fmtEur(g.items.reduce((s, r) => s + n(r.amount), 0))}</span>
            {g.cid && <Button size="sm" variant="ghost" onClick={() => onCustomer(g.cid!)}><User className="w-3.5 h-3.5 mr-1" />Scheda cliente</Button>}
          </div>
          <div className="divide-y">
            {g.items.map((r) => {
              const late = !r.is_paid && r.due_date < today();
              return (
                <div key={r.id} className="px-3 py-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{fmtEur(r.amount)}</div>
                      <div className={`text-[11px] ${late ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {r.is_paid ? `Incassato il ${fd(r.paid_date)}` : `${late ? 'Scaduto il' : 'Previsto il'} ${fd(r.due_date)}`}
                      </div>
                    </div>
                    {r.is_paid ? (
                      <Button size="sm" variant="ghost" onClick={() => setPaid(r, false)}><RotateCcw className="w-3.5 h-3.5 mr-1" />Annulla</Button>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setPartial({ id: r.id, v: '' })}>In parte</Button>
                        <Button size="sm" onClick={() => setPaid(r, true)}><Check className="w-3.5 h-3.5 mr-1" />Ricevuto tutto</Button>
                      </>
                    )}
                  </div>
                  {partial?.id === r.id && (
                    <div className="flex gap-2">
                      <Input autoFocus type="number" step="0.01" placeholder="Quanto hai ricevuto? €" value={partial.v} onChange={(e) => setPartial({ id: r.id, v: e.target.value })} />
                      <Button size="sm" onClick={() => payPartial(r)}>Conferma</Button>
                      <Button size="sm" variant="ghost" onClick={() => setPartial(null)}>Annulla</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function InvoicesList({ rows, onCustomer }: { rows: any[]; onCustomer: (id: string) => void }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground text-center py-8">Nessuna fattura.</p>;
  return (
    <div>
      <Total label={`${rows.length} fatture`} value={rows.reduce((s, r) => s + n(r.total), 0)} />
      <div className="divide-y border rounded-lg">
        {rows.map((r) => {
          const name = r.customers?.company_name || `${r.customers?.first_name || ''} ${r.customers?.last_name || ''}`.trim() || '—';
          const rest = Math.max(0, n(r.total) - n(r.paid_amount));
          return (
            <button key={r.id} onClick={() => r.customer_id && onCustomer(r.customer_id)} className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-muted/40">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.invoice_number || 'Fattura'} · {name}</div>
                <div className="text-[11px] text-muted-foreground">{fd(r.invoice_date)} · {rest > 0 ? `da incassare ${fmtEur(rest)}` : 'pagata'}</div>
              </div>
              <span className="text-sm font-semibold">{fmtEur(r.total)}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const STATUS: Record<string, string> = { sent: 'Inviato', in_trattativa: 'In trattativa', accepted: 'Accettato', converted: 'Vinto', invoiced: 'Fatturato', rejected: 'Perso' };

function QuotesList({ rows }: { rows: any[] }) {
  const navigate = useNavigate();
  if (!rows.length) return <p className="text-sm text-muted-foreground text-center py-8">Nessun preventivo.</p>;
  return (
    <div>
      <Total label={`${rows.length} preventivi`} value={rows.reduce((s, r) => s + n(r.total_amount), 0)} />
      <div className="divide-y border rounded-lg">
        {rows.map((r) => (
          <button key={r.id} onClick={() => navigate(`/admin/preventivi/modifica?edit=${r.id}`)} className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-muted/40">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{r.quote_number} · {r.client_name || '—'}</div>
              <div className="text-[11px] text-muted-foreground truncate">{fd(r.created_at)} · {STATUS[r.status] || r.status}{r.project_name ? ` · ${r.project_name}` : ''}</div>
            </div>
            <span className="text-sm font-semibold">{fmtEur(r.total_amount)}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
