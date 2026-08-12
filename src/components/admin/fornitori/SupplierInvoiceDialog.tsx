import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fmtEur, VAT_RATES, PAYMENT_METHODS, COST_CATEGORIES } from '@/lib/finance';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultSupplierId?: string;
  invoice?: any | null;
}

const empty = {
  supplier_id: '',
  invoice_number: '',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: '',
  subtotal: '',
  vat_rate: '22',
  is_reverse_charge: false,
  site_id: '',
  category: '',
  payment_method: 'bonifico',
  attachment_url: '',
  notes: '',
};

export function SupplierInvoiceDialog({ open, onOpenChange, defaultSupplierId, invoice }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [newSupplier, setNewSupplier] = useState('');

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-select'],
    queryFn: async () => {
      const { data, error } = await supabase.from('suppliers').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: sites } = useQuery({
    queryKey: ['sites-select'],
    queryFn: async () => {
      const { data, error } = await supabase.from('construction_sites').select('id, title').order('title');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!open) return;
    if (invoice) {
      setForm({
        supplier_id: invoice.supplier_id || '',
        invoice_number: invoice.invoice_number || '',
        invoice_date: invoice.invoice_date || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date || '',
        subtotal: String(invoice.subtotal ?? ''),
        vat_rate: String(invoice.vat_rate ?? 22),
        is_reverse_charge: !!invoice.is_reverse_charge,
        site_id: invoice.site_id || '',
        category: invoice.category || '',
        payment_method: invoice.payment_method || 'bonifico',
        attachment_url: invoice.attachment_url || '',
        notes: invoice.notes || '',
      });
    } else {
      setForm({ ...empty, supplier_id: defaultSupplierId || '' });
    }
  }, [open, invoice, defaultSupplierId]);

  const subtotal = Number(form.subtotal) || 0;
  const rate = form.is_reverse_charge ? 0 : Number(form.vat_rate) || 0;
  const vatAmount = Math.round(subtotal * rate) / 100;
  const total = subtotal + vatAmount;

  const createSupplier = async () => {
    if (!newSupplier.trim()) return;
    const { data, error } = await supabase.from('suppliers').insert({ name: newSupplier.trim() }).select('id, name').single();
    if (error) { toast({ title: 'Errore', description: error.message, variant: 'destructive' }); return; }
    await qc.invalidateQueries({ queryKey: ['suppliers-select'] });
    await qc.invalidateQueries({ queryKey: ['suppliers-list'] });
    setForm((f) => ({ ...f, supplier_id: data.id }));
    setNewSupplier('');
  };

  const save = async () => {
    if (!form.supplier_id || !form.invoice_number.trim()) {
      toast({ title: 'Dati mancanti', description: 'Fornitore e numero fattura sono obbligatori.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      supplier_id: form.supplier_id,
      invoice_number: form.invoice_number.trim(),
      invoice_date: form.invoice_date,
      due_date: form.due_date || null,
      subtotal,
      vat_rate: rate,
      vat_amount: vatAmount,
      total,
      is_reverse_charge: form.is_reverse_charge,
      site_id: form.site_id || null,
      category: form.category || null,
      payment_method: form.payment_method || null,
      attachment_url: form.attachment_url || null,
      notes: form.notes || null,
    };
    const { error } = invoice
      ? await supabase.from('supplier_invoices').update(payload).eq('id', invoice.id)
      : await supabase.from('supplier_invoices').insert(payload);
    setSaving(false);
    if (error) { toast({ title: 'Errore', description: error.message, variant: 'destructive' }); return; }
    toast({ title: invoice ? 'Fattura aggiornata' : 'Fattura registrata' });
    qc.invalidateQueries({ queryKey: ['supplier-invoices'] });
    qc.invalidateQueries({ queryKey: ['suppliers-list'] });
    qc.invalidateQueries({ queryKey: ['scadenzario'] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{invoice ? 'Modifica' : 'Nuova'} fattura fornitore</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Fornitore *</Label>
            <Select value={form.supplier_id} onValueChange={(v) => setForm({ ...form, supplier_id: v })}>
              <SelectTrigger><SelectValue placeholder="Seleziona fornitore" /></SelectTrigger>
              <SelectContent>{(suppliers || []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
            <div className="flex gap-2 mt-2">
              <Input placeholder="Nuovo fornitore…" value={newSupplier} onChange={(e) => setNewSupplier(e.target.value)} />
              <Button type="button" variant="outline" onClick={createSupplier}>Crea</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label>Numero fattura *</Label><Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} placeholder="3629/2026" /></div>
            <div><Label>Data fattura</Label><Input type="date" value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label>Scadenza</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            <div><Label>Imponibile (€)</Label><Input type="number" step="0.01" value={form.subtotal} onChange={(e) => setForm({ ...form, subtotal: e.target.value })} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <Label>Aliquota IVA</Label>
              <Select value={String(rate)} disabled={form.is_reverse_charge} onValueChange={(v) => setForm({ ...form, vat_rate: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VAT_RATES.map((r) => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Checkbox id="rc" checked={form.is_reverse_charge} onCheckedChange={(c) => setForm({ ...form, is_reverse_charge: !!c, vat_rate: c ? '0' : '22' })} />
              <Label htmlFor="rc">Reverse charge</Label>
            </div>
          </div>

          {form.is_reverse_charge && (
            <p className="text-[12px] text-amber-600 font-medium">Inversione contabile — fattura senza IVA</p>
          )}

          <div className="rounded-md border border-crm-border bg-crm-bg-soft p-3 text-[13px] space-y-1">
            <div className="flex justify-between"><span>Imponibile</span><span className="font-semibold">{fmtEur(subtotal)}</span></div>
            <div className="flex justify-between"><span>IVA {rate}%</span><span className="font-semibold">{fmtEur(vatAmount)}</span></div>
            <div className="flex justify-between text-[15px]"><span>Totale</span><span className="font-bold">{fmtEur(total)}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cantiere</Label>
              <Select value={form.site_id || 'none'} onValueChange={(v) => setForm({ ...form, site_id: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Nessuno" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessun cantiere</SelectItem>
                  {(sites || []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category || 'none'} onValueChange={(v) => setForm({ ...form, category: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {COST_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Modalità pagamento</Label>
              <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Allegato PDF (URL)</Label><Input value={form.attachment_url} onChange={(e) => setForm({ ...form, attachment_url: e.target.value })} placeholder="https://…" /></div>
          </div>

          <div><Label>Note</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>

          <Button className="w-full" onClick={save} disabled={saving}>{saving ? 'Salvataggio…' : invoice ? 'Aggiorna fattura' : 'Salva fattura'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SupplierInvoiceDialog;
