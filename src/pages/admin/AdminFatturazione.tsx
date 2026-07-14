import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CrmPageHeader, CrmKpiRow, CrmKpiTile } from '@/components/admin/CrmShell';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Euro, FileText, Wallet, AlertTriangle, TrendingUp } from 'lucide-react';

const eur = (n: number) => `€${Math.round(Number(n) || 0).toLocaleString('it-IT')}`;

const TRANCHE_SCHEMES: { value: string; label: string; splits: { type: string; pct: number }[] }[] = [
  { value: '100_anticipo', label: '100% Anticipato', splits: [{ type: 'unico', pct: 100 }] },
  { value: '50_50', label: 'Anticipo + Saldo (50/50)', splits: [{ type: 'anticipo', pct: 50 }, { type: 'saldo', pct: 50 }] },
  { value: '30_40_30', label: 'Anticipo + SAL + Saldo (30/40/30)', splits: [{ type: 'anticipo', pct: 30 }, { type: 'sal', pct: 40 }, { type: 'saldo', pct: 30 }] },
  { value: 'custom', label: 'Personalizzato', splits: [] },
];

const STATUS_COLORS: Record<string, string> = {
  bozza: 'bg-slate-100 text-slate-700',
  emessa: 'bg-blue-100 text-blue-700',
  parziale: 'bg-amber-100 text-amber-700',
  pagata: 'bg-green-100 text-green-700',
  scaduta: 'bg-red-100 text-red-700',
  annullata: 'bg-slate-100 text-slate-500 line-through',
};

export default function AdminFatturazione() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState('da-fatturare');
  const [invoiceDialog, setInvoiceDialog] = useState<{ open: boolean; quote?: any }>({ open: false });
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; invoice?: any }>({ open: false });

  const { data: invoices = [] } = useQuery({
    queryKey: ['customer_invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_invoices' as any)
        .select('*, customer:customers(id, first_name, last_name, company_name), quote:quotes(id, quote_number, total_amount)')
        .order('invoice_date', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['customer_payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_payments' as any)
        .select('*, invoice:customer_invoices(invoice_number, customer_id, customer:customers(first_name, last_name, company_name))')
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: acceptedQuotes = [] } = useQuery({
    queryKey: ['accepted_quotes_for_invoicing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('id, quote_number, project_name, total_amount, vat_amount, vat_rate, status, customer_id, client_name, lead_id, customer:customers(id, first_name, last_name, company_name), lead:leads(id, name, company_name), created_at')
        .in('status', ['accettato', 'accepted', 'approved', 'approvato'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  // KPI: venduto vs fatturato vs incassato vs da incassare
  const kpi = useMemo(() => {
    const venduto = acceptedQuotes.reduce((s, q) => s + Number(q.total_amount || 0), 0);
    const fatturato = invoices.filter((i) => i.status !== 'annullata').reduce((s, i) => s + Number(i.total || 0), 0);
    const incassato = invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
    const daIncassare = invoices
      .filter((i) => ['emessa', 'parziale', 'scaduta'].includes(i.status))
      .reduce((s, i) => s + (Number(i.total || 0) - Number(i.paid_amount || 0)), 0);
    const scaduto = invoices
      .filter((i) => i.status === 'scaduta')
      .reduce((s, i) => s + (Number(i.total || 0) - Number(i.paid_amount || 0)), 0);
    return { venduto, fatturato, incassato, daIncassare, scaduto };
  }, [invoices, acceptedQuotes]);

  // Preventivi da fatturare (accettati con residuo da fatturare)
  const daFatturare = useMemo(() => {
    return acceptedQuotes.map((q) => {
      const invoicedTotal = invoices
        .filter((i) => i.quote_id === q.id && i.status !== 'annullata')
        .reduce((s, i) => s + Number(i.total || 0), 0);
      const residuo = Number(q.total_amount || 0) - invoicedTotal;
      return { ...q, invoicedTotal, residuo };
    }).filter((q) => q.residuo > 0.01);
  }, [acceptedQuotes, invoices]);

  const customerName = (c: any) => c?.company_name || `${c?.first_name || ''} ${c?.last_name || ''}`.trim() || '—';
  const quoteCustomerName = (q: any) => customerName(q?.customer) !== '—'
    ? customerName(q.customer)
    : (q?.lead?.company_name || q?.lead?.name || q?.client_name || '—');

  return (
    <div className="space-y-4">
      <CrmPageHeader
        breadcrumb={['Admin', 'Finanza']}
        title="Fatturazione & Incassi"
        subtitle="Gestisci fatture, tranche e incassi separati dal venduto"
      />

      <CrmKpiRow cols={5}>
        <CrmKpiTile label="Venduto" value={eur(kpi.venduto)} color="indigo" icon={<TrendingUp className="w-4 h-4" />} hint="Preventivi accettati" />
        <CrmKpiTile label="Fatturato" value={eur(kpi.fatturato)} color="blue" icon={<FileText className="w-4 h-4" />} hint="Totale fatture emesse" />
        <CrmKpiTile label="Incassato" value={eur(kpi.incassato)} color="green" icon={<Wallet className="w-4 h-4" />} hint="Pagamenti ricevuti" />
        <CrmKpiTile label="Da incassare" value={eur(kpi.daIncassare)} color="amber" icon={<Euro className="w-4 h-4" />} hint="Fatture aperte" />
        <CrmKpiTile label="Scaduto" value={eur(kpi.scaduto)} color="red" icon={<AlertTriangle className="w-4 h-4" />} hint="Oltre scadenza" />
      </CrmKpiRow>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="da-fatturare">Da fatturare ({daFatturare.length})</TabsTrigger>
          <TabsTrigger value="fatture">Fatture ({invoices.length})</TabsTrigger>
          <TabsTrigger value="incassi">Incassi ({payments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="da-fatturare" className="mt-4">
          <Card><CardContent className="p-0">
            {daFatturare.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nessun preventivo accettato da fatturare</div>}
            {daFatturare.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-3">Preventivo</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3 text-right">Valore</th>
                    <th className="p-3 text-right">Fatturato</th>
                    <th className="p-3 text-right">Residuo</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {daFatturare.map((q) => (
                    <tr
                      key={q.id}
                      className="border-t hover:bg-muted/20 cursor-pointer"
                      onClick={() => navigate(`/admin/preventivi/modifica?edit=${q.id}`)}
                    >
                      <td className="p-3 font-medium">{q.quote_number || '—'}<div className="text-xs text-muted-foreground">{q.project_name}</div></td>
                      <td className="p-3">{quoteCustomerName(q)}</td>
                      <td className="p-3 text-right tabular-nums">{eur(q.total_amount)}</td>
                      <td className="p-3 text-right tabular-nums text-muted-foreground">{eur(q.invoicedTotal)}</td>
                      <td className="p-3 text-right tabular-nums font-semibold">{eur(q.residuo)}</td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" onClick={() => setInvoiceDialog({ open: true, quote: q })}>
                          <Plus className="w-3 h-3 mr-1" /> Emetti fattura
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="fatture" className="mt-4">
          <Card><CardContent className="p-0">
            {invoices.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nessuna fattura ancora emessa</div>}
            {invoices.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-3">N°</th>
                    <th className="p-3">Data</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Descrizione</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3 text-right">Totale</th>
                    <th className="p-3 text-right">Incassato</th>
                    <th className="p-3">Stato</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((i) => (
                    <tr key={i.id} className="border-t hover:bg-muted/20">
                      <td className="p-3 font-mono font-medium">{i.invoice_number}</td>
                      <td className="p-3">{i.invoice_date ? format(new Date(i.invoice_date), 'dd/MM/yyyy') : '—'}</td>
                      <td className="p-3">{customerName(i.customer)}</td>
                      <td className="p-3 max-w-[220px] truncate text-muted-foreground">{i.description || '—'}</td>
                      <td className="p-3 text-xs">{i.tranche_type || '—'}</td>
                      <td className="p-3 text-right tabular-nums font-semibold">{eur(i.total)}</td>
                      <td className="p-3 text-right tabular-nums">{eur(i.paid_amount)}</td>
                      <td className="p-3"><Badge className={STATUS_COLORS[i.status] || ''}>{i.status}</Badge></td>
                      <td className="p-3 text-right">
                        {['emessa', 'parziale', 'scaduta', 'bozza'].includes(i.status) && (
                          <Button size="sm" variant="outline" onClick={() => setPaymentDialog({ open: true, invoice: i })}>
                            Registra incasso
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="incassi" className="mt-4">
          <Card><CardContent className="p-0">
            {payments.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nessun incasso registrato</div>}
            {payments.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Fattura</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Metodo</th>
                    <th className="p-3">Tranche</th>
                    <th className="p-3">Riferimento</th>
                    <th className="p-3 text-right">Importo</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-muted/20">
                      <td className="p-3">{format(new Date(p.payment_date), 'dd/MM/yyyy')}</td>
                      <td className="p-3 font-mono">{p.invoice?.invoice_number}</td>
                      <td className="p-3">{customerName(p.invoice?.customer)}</td>
                      <td className="p-3">{p.method}</td>
                      <td className="p-3 text-xs">{p.tranche_type || '—'}</td>
                      <td className="p-3 text-xs text-muted-foreground">{p.reference || '—'}</td>
                      <td className="p-3 text-right tabular-nums font-semibold text-green-700">{eur(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <InvoiceDialog
        open={invoiceDialog.open}
        quote={invoiceDialog.quote}
        onClose={() => setInvoiceDialog({ open: false })}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ['customer_invoices'] });
          qc.invalidateQueries({ queryKey: ['customer_payments'] });
          qc.invalidateQueries({ queryKey: ['accepted_quotes_for_invoicing'] });
        }}
      />
      <PaymentDialog
        open={paymentDialog.open}
        invoice={paymentDialog.invoice}
        onClose={() => setPaymentDialog({ open: false })}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ['customer_invoices'] });
          qc.invalidateQueries({ queryKey: ['customer_payments'] });
          qc.invalidateQueries({ queryKey: ['accepted_quotes_for_invoicing'] });
        }}
      />
    </div>
  );
}

// ============================================
// Invoice creation dialog
// ============================================
function InvoiceDialog({ open, quote, onClose, onSaved }: any) {
  const [scheme, setScheme] = useState('100_anticipo');
  const [trancheType, setTrancheType] = useState('unico');
  const [pct, setPct] = useState(100);
  const [description, setDescription] = useState('');
  const [vatRate, setVatRate] = useState(22);
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !quote) return;
    const rawRate = Number(quote.vat_rate);
    const derivedRate = Number(quote.total_amount) > 0 && Number(quote.vat_amount) > 0
      ? (Number(quote.vat_amount) / (Number(quote.total_amount) - Number(quote.vat_amount))) * 100
      : 22;
    setVatRate(Number.isFinite(rawRate) && rawRate > 0 ? (rawRate <= 1 ? rawRate * 100 : rawRate) : derivedRate);
    setScheme('100_anticipo');
    setTrancheType('unico');
    setPct(100);
    setDescription('');
    setDueDate('');
  }, [open, quote?.id]);

  const baseAmount = Number(quote?.total_amount || 0);
  const subtotal = Math.round(((baseAmount / (1 + (Number(vatRate) || 0) / 100)) * pct) / 100 * 100) / 100;
  const vatAmount = Math.round((subtotal * vatRate) / 100 * 100) / 100;
  const total = subtotal + vatAmount;

  const handleSchemeChange = (v: string) => {
    setScheme(v);
    const preset = TRANCHE_SCHEMES.find((s) => s.value === v);
    if (preset && preset.splits.length > 0) {
      setTrancheType(preset.splits[0].type);
      setPct(preset.splits[0].pct);
    }
  };

  const save = async () => {
    if (!quote) return;
    if (!quote.customer_id) { toast.error('Preventivo senza cliente CRM collegato'); return; }
    setSaving(true);
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from('customer_invoices' as any).insert({
      customer_id: quote.customer_id,
      quote_id: quote.id,
      description: description || `${quote.project_name || quote.quote_number} — ${trancheType}`,
      subtotal,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total,
      tranche_scheme: scheme,
      tranche_type: trancheType,
      tranche_percentage: pct,
      due_date: dueDate || null,
      status: 'emessa',
      created_by: user.user?.id,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Fattura creata');
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Emetti fattura</DialogTitle>
        </DialogHeader>
        {quote && (
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <div className="font-medium">{quote.quote_number} · {quote.project_name}</div>
              <div className="text-muted-foreground">Valore preventivo: <span className="font-semibold">{eur(baseAmount)}</span></div>
            </div>

            <div>
              <Label>Schema pagamento</Label>
              <Select value={scheme} onValueChange={handleSchemeChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRANCHE_SCHEMES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo tranche</Label>
                <Select value={trancheType} onValueChange={setTrancheType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unico">Unico</SelectItem>
                    <SelectItem value="anticipo">Anticipo</SelectItem>
                    <SelectItem value="sal">SAL (metà lavori)</SelectItem>
                    <SelectItem value="saldo">Saldo</SelectItem>
                    <SelectItem value="custom">Personalizzato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>% del preventivo</Label>
                <Input type="number" min={0} max={100} step={0.01} value={pct} onChange={(e) => setPct(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label>Descrizione</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Es. Anticipo lavori posa parquet…" rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>IVA %</Label>
                <Input type="number" min={0} max={100} value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))} />
              </div>
              <div>
                <Label>Scadenza</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            <div className="rounded-lg border p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Imponibile</span><span className="tabular-nums">{eur(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">IVA {vatRate}%</span><span className="tabular-nums">{eur(vatAmount)}</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Totale fattura</span><span className="tabular-nums">{eur(total)}</span></div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={save} disabled={saving || !quote}>{saving ? 'Salvataggio…' : 'Emetti fattura'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Payment registration dialog
// ============================================
function PaymentDialog({ open, invoice, onClose, onSaved }: any) {
  const residuo = invoice ? Number(invoice.total || 0) - Number(invoice.paid_amount || 0) : 0;
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [method, setMethod] = useState('bonifico');
  const [trancheType, setTrancheType] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset when a new invoice opens
  useMemo(() => {
    if (invoice) {
      setAmount(Number(invoice.total || 0) - Number(invoice.paid_amount || 0));
      setTrancheType(invoice.tranche_type || '');
    }
  }, [invoice?.id]);

  const save = async () => {
    if (!invoice || amount <= 0) { toast.error('Importo non valido'); return; }
    setSaving(true);
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from('customer_payments' as any).insert({
      invoice_id: invoice.id,
      payment_date: date,
      amount,
      method,
      tranche_type: trancheType || null,
      reference: reference || null,
      notes: notes || null,
      recorded_by: user.user?.id,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Incasso registrato');
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Registra incasso</DialogTitle></DialogHeader>
        {invoice && (
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <div className="font-mono font-medium">{invoice.invoice_number}</div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Totale fattura</span>
                <span className="tabular-nums">{eur(invoice.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Già incassato</span>
                <span className="tabular-nums">{eur(invoice.paid_amount)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Residuo</span>
                <span className="tabular-nums">{eur(residuo)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Importo €</Label>
                <Input type="number" min={0.01} step={0.01} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Metodo</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bonifico">Bonifico</SelectItem>
                    <SelectItem value="assegno">Assegno</SelectItem>
                    <SelectItem value="carta">Carta</SelectItem>
                    <SelectItem value="contanti">Contanti</SelectItem>
                    <SelectItem value="altro">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo tranche</Label>
                <Select value={trancheType || 'unico'} onValueChange={setTrancheType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unico">Unico</SelectItem>
                    <SelectItem value="anticipo">Anticipo</SelectItem>
                    <SelectItem value="sal">SAL</SelectItem>
                    <SelectItem value="saldo">Saldo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Riferimento (CRO / n. assegno)</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>

            <div>
              <Label>Note</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Salvataggio…' : 'Registra'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
