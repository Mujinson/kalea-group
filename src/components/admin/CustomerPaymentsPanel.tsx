import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, addMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { Check, Plus, Trash2, CalendarRange, RotateCcw, Pencil } from 'lucide-react';
import { fmtEur } from '@/lib/finance';

interface Props { customerId: string; customerName: string; quotes?: any[]; }

const r2 = (n: number) => Math.round(n * 100) / 100;
const today = () => new Date().toISOString().split('T')[0];

export default function CustomerPaymentsPanel({ customerId, customerName, quotes = [] }: Props) {
  const [sales, setSales] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [planOpen, setPlanOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: s } = await supabase.from('sales').select('id, total_amount, sale_price, sale_date, notes, product_type').eq('customer_id', customerId).order('sale_date');
    const ids = (s || []).map((x) => x.id);
    const { data: p } = ids.length
      ? await supabase.from('payment_schedules').select('*').in('sale_id', ids).order('due_date')
      : { data: [] as any[] };
    setSales(s || []); setRows(p || []); setLoading(false);
  };
  useEffect(() => { load(); }, [customerId]);

  const sum = useMemo(() => {
    const total = sales.reduce((a, s) => a + Number(s.total_amount || s.sale_price || 0), 0);
    const paid = rows.filter((r) => r.is_paid).reduce((a, r) => a + Number(r.amount || 0), 0);
    const planned = rows.reduce((a, r) => a + Number(r.amount || 0), 0);
    const overdue = rows.filter((r) => !r.is_paid && r.due_date && r.due_date < today()).reduce((a, r) => a + Number(r.amount || 0), 0);
    const next = rows.find((r) => !r.is_paid);
    return { total, paid, residual: Math.max(0, total - paid), unplanned: r2(total - planned), overdue, next };
  }, [sales, rows]);

  const togglePaid = async (r: any) => {
    const paid = !r.is_paid;
    const { error } = await supabase.from('payment_schedules').update({ is_paid: paid, paid_date: paid ? today() : null }).eq('id', r.id);
    if (error) return toast.error(error.message);
    toast.success(paid ? `Incassati ${fmtEur(Number(r.amount))}` : 'Segnato come non incassato');
    load();
  };
  const remove = async (r: any) => {
    if (!confirm('Eliminare questa rata?')) return;
    const { error } = await supabase.from('payment_schedules').delete().eq('id', r.id);
    if (error) return toast.error(error.message);
    load();
  };
  const saveRow = async () => {
    if (!editRow) return;
    const payload = { amount: Number(editRow.amount), due_date: editRow.due_date, notes: editRow.notes || null };
    const { error } = editRow.id
      ? await supabase.from('payment_schedules').update(payload).eq('id', editRow.id)
      : await supabase.from('payment_schedules').insert({ ...payload, sale_id: editRow.sale_id, payment_type: 'rata', is_paid: false });
    if (error) return toast.error(error.message);
    setEditRow(null); load();
  };

  const pct = sum.total > 0 ? Math.min(100, (sum.paid / sum.total) * 100) : 0;
  const status = (r: any) => r.is_paid ? { l: 'Incassato', c: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    : r.due_date < today() ? { l: 'Scaduto', c: 'bg-red-50 text-red-700 border-red-200' }
    : { l: 'Da ricevere', c: 'bg-amber-50 text-amber-700 border-amber-200' };

  if (loading) return <p className="text-sm text-muted-foreground py-6 text-center">Caricamento…</p>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Box label="Totale da pagare" value={fmtEur(sum.total)} />
        <Box label="Incassato" value={fmtEur(sum.paid)} tone="text-emerald-700" />
        <Box label="Ancora da ricevere" value={fmtEur(sum.residual)} tone="text-amber-700" />
        <Box label="Scaduto" value={fmtEur(sum.overdue)} tone={sum.overdue > 0 ? 'text-red-700' : ''} />
      </div>
      <div>
        <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
        <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
          <span>{pct.toFixed(0)}% pagato</span>
          {sum.next && <span>Prossima rata: <b>{fmtEur(Number(sum.next.amount))}</b> il {format(new Date(sum.next.due_date), 'd MMM yyyy', { locale: it })}</span>}
        </div>
      </div>
      {Math.abs(sum.unplanned) > 0.5 && sales.length > 0 && (
        <p className="text-[12px] rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2">
          {sum.unplanned > 0 ? `${fmtEur(sum.unplanned)} non ancora inseriti nel piano rate.` : `Le rate superano il totale di ${fmtEur(-sum.unplanned)}.`}
        </p>
      )}

      <div className="flex gap-2">
        <Button size="sm" onClick={() => setPlanOpen(true)}><CalendarRange className="w-4 h-4 mr-1" />{rows.length ? 'Rifai piano rate' : 'Crea piano rate'}</Button>
        {sales.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => setEditRow({ sale_id: sales[sales.length - 1].id, amount: sum.unplanned > 0 ? sum.unplanned : '', due_date: today() })}>
            <Plus className="w-4 h-4 mr-1" />Aggiungi rata
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Nessuna rata. Crea un piano per sapere quando e quanto incassi.</p>
      ) : (
        <div className="border rounded-lg divide-y">
          {rows.map((r, i) => {
            const st = status(r);
            return (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2">
                <span className="text-[11px] text-muted-foreground w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{fmtEur(Number(r.amount))}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {format(new Date(r.due_date), 'EEEE d MMM yyyy', { locale: it })}
                    {r.paid_date && r.is_paid && ` · incassato il ${format(new Date(r.paid_date), 'd/MM')}`}
                    {r.notes && ` · ${r.notes}`}
                  </div>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${st.c}`}>{st.l}</span>
                <Button size="sm" variant={r.is_paid ? 'ghost' : 'outline'} onClick={() => togglePaid(r)}>
                  {r.is_paid ? <RotateCcw className="w-3.5 h-3.5" /> : <><Check className="w-3.5 h-3.5 mr-1" />Incassato</>}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditRow({ ...r })}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => remove(r)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editRow?.id ? 'Modifica rata' : 'Nuova rata'}</DialogTitle></DialogHeader>
          {editRow && (
            <div className="space-y-3">
              <div><Label>Importo €</Label><Input type="number" step="0.01" value={editRow.amount} onChange={(e) => setEditRow({ ...editRow, amount: e.target.value })} /></div>
              <div><Label>Data</Label><Input type="date" value={editRow.due_date} onChange={(e) => setEditRow({ ...editRow, due_date: e.target.value })} /></div>
              <div><Label>Nota</Label><Input value={editRow.notes || ''} onChange={(e) => setEditRow({ ...editRow, notes: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={saveRow}>Salva</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <PlanDialog open={planOpen} onClose={() => setPlanOpen(false)} customerId={customerId} customerName={customerName}
        sales={sales} rows={rows} quotes={quotes} onDone={() => { setPlanOpen(false); load(); }} />
    </div>
  );
}

function Box({ label, value, tone = '' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`font-semibold text-sm ${tone}`}>{value}</div>
    </div>
  );
}

function PlanDialog({ open, onClose, customerId, customerName, sales, rows, quotes, onDone }: any) {
  const wonQuote = quotes.find((q: any) => ['accepted', 'converted', 'invoiced'].includes(q.status));
  const paidSum = rows.filter((r: any) => r.is_paid).reduce((a: number, r: any) => a + Number(r.amount), 0);
  const saleTotal = sales.reduce((a: number, s: any) => a + Number(s.total_amount || s.sale_price || 0), 0);
  const [total, setTotal] = useState('');
  const [first, setFirst] = useState<{ amount: string; date: string }[]>([]);
  const [monthly, setMonthly] = useState('500');
  const [day, setDay] = useState('16');

  useEffect(() => {
    if (!open) return;
    setTotal(String(saleTotal || wonQuote?.total_amount || ''));
    setFirst([{ amount: '', date: today() }]);
  }, [open]);

  const preview = useMemo(() => {
    const tot = Number(total) || 0;
    let left = r2(tot - paidSum);
    const out: { amount: number; date: string }[] = [];
    for (const f of first) {
      const a = Number(f.amount);
      if (!a || !f.date || left <= 0) continue;
      const v = Math.min(a, left); out.push({ amount: r2(v), date: f.date }); left = r2(left - v);
    }
    const m = Number(monthly);
    if (m > 0 && left > 0) {
      const lastDate = out.length ? new Date(out[out.length - 1].date) : new Date();
      let d = addMonths(new Date(lastDate.getFullYear(), lastDate.getMonth(), Math.min(28, Number(day) || 1)), 1);
      let guard = 0;
      while (left > 0.009 && guard++ < 120) {
        const v = Math.min(m, left); out.push({ amount: r2(v), date: format(d, 'yyyy-MM-dd') }); left = r2(left - v); d = addMonths(d, 1);
      }
    }
    return { out, left };
  }, [total, first, monthly, day, paidSum]);

  const save = async () => {
    const tot = Number(total);
    if (!tot) return toast.error('Inserisci il totale');
    let saleId = sales[sales.length - 1]?.id;
    if (!saleId) {
      const { data, error } = await supabase.from('sales').insert({
        customer_id: customerId, customer_name: customerName, product_type: wonQuote ? `Preventivo ${wonQuote.quote_number}` : 'Vendita',
        quantity_sqm: 0, sale_price: tot, total_amount: tot, sale_date: today(), payment_terms: 'Piano rateale personalizzato',
      }).select('id').single();
      if (error) return toast.error(error.message);
      saleId = data.id;
    } else if (sales.length === 1 && tot !== saleTotal) {
      await supabase.from('sales').update({ total_amount: tot, sale_price: tot }).eq('id', saleId);
    }
    const unpaid = rows.filter((r: any) => !r.is_paid).map((r: any) => r.id);
    if (unpaid.length) await supabase.from('payment_schedules').delete().in('id', unpaid);
    if (preview.out.length) {
      const { error } = await supabase.from('payment_schedules').insert(preview.out.map((p, i) => ({
        sale_id: saleId, amount: p.amount, due_date: p.date, is_paid: false,
        payment_type: i === preview.out.length - 1 ? 'saldo' : 'rata',
      })));
      if (error) return toast.error(error.message);
    }
    toast.success(`Piano salvato: ${preview.out.length} rate`);
    onDone();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Piano rate · {customerName}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Totale da pagare €</Label>
            <Input type="number" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} />
            {paidSum > 0 && <p className="text-[11px] text-muted-foreground mt-1">Già incassati {fmtEur(paidSum)}: le rate già pagate restano.</p>}
          </div>
          <div>
            <Label>1. Primi pagamenti (importi diversi)</Label>
            <div className="space-y-2 mt-1">
              {first.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <Input type="number" placeholder="€" value={f.amount} onChange={(e) => setFirst(first.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))} />
                  <Input type="date" value={f.date} onChange={(e) => setFirst(first.map((x, j) => j === i ? { ...x, date: e.target.value } : x))} />
                  <Button size="icon" variant="ghost" onClick={() => setFirst(first.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => {
                const last = first[first.length - 1]?.date;
                setFirst([...first, { amount: '', date: last ? format(addMonths(new Date(last), 1), 'yyyy-MM-dd') : today() }]);
              }}><Plus className="w-4 h-4 mr-1" />Aggiungi pagamento</Button>
            </div>
          </div>
          <div>
            <Label>2. Poi ogni mese, fino al saldo</Label>
            <div className="flex gap-2 mt-1 items-center">
              <Input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} className="w-32" />
              <span className="text-sm text-muted-foreground">€ al mese, il giorno</span>
              <Input type="number" min={1} max={28} value={day} onChange={(e) => setDay(e.target.value)} className="w-20" />
            </div>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="text-[12px] font-semibold mb-2">Anteprima: {preview.out.length} rate</div>
            <div className="max-h-48 overflow-y-auto text-[12px] space-y-0.5">
              {preview.out.map((p, i) => (
                <div key={i} className="flex justify-between"><span>{format(new Date(p.date), 'd MMM yyyy', { locale: it })}</span><b>{fmtEur(p.amount)}</b></div>
              ))}
            </div>
            {preview.left > 0.009 && <p className="text-[11px] text-red-600 mt-2">Restano {fmtEur(preview.left)} non pianificati: aggiungi una rata mensile.</p>}
          </div>
        </div>
        <DialogFooter><Button onClick={save}>Salva piano</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
