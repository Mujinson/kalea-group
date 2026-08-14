import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusPill } from '@/components/admin/crm-ui';
import { DataTable } from '@/components/admin/DataTable';
import { fmtEur, fmtDateIt, dueTone, SUPPLIER_INVOICE_STATUS_LABEL, PAYMENT_METHODS } from '@/lib/finance';
import { Plus, Save, Paperclip } from 'lucide-react';
import { getInvoiceAttachmentUrl } from '@/lib/costInvoiceImport';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SupplierInvoiceDialog from './SupplierInvoiceDialog';

interface Props {
  supplierId: string | null;
  onOpenChange: (o: boolean) => void;
}

export function SupplierDetailSheet({ supplierId, onOpenChange }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>({});
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [payFor, setPayFor] = useState<any | null>(null);
  const [payForm, setPayForm] = useState({ payment_amount: '', payment_date: new Date().toISOString().split('T')[0], notes: '' });

  const { data: supplier } = useQuery({
    queryKey: ['supplier', supplierId],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await supabase.from('suppliers').select('*').eq('id', supplierId!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['supplier-invoices', supplierId],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_invoices')
        .select('*')
        .eq('supplier_id', supplierId!)
        .order('invoice_date', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  useEffect(() => { if (supplier) setForm(supplier); }, [supplier]);

  const saveSupplier = async () => {
    const { error } = await supabase.from('suppliers').update({
      name: form.name,
      vat_number: form.vat_number || null,
      contact_person: form.contact_person || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      notes: form.notes || null,
    }).eq('id', supplierId!);
    if (error) { toast({ title: 'Errore', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Fornitore aggiornato' });
    qc.invalidateQueries({ queryKey: ['suppliers-list'] });
  };

  const savePayment = async () => {
    if (!payFor) return;
    const amount = Number(payForm.payment_amount) || 0;
    if (amount <= 0) { toast({ title: 'Importo non valido', variant: 'destructive' }); return; }
    const { error } = await supabase.from('supplier_payments').insert({
      supplier_id: supplierId,
      supplier_invoice_id: payFor.id,
      supplier_name: supplier?.name || '',
      total_debt: Number(payFor.total || 0),
      payment_amount: amount,
      payment_date: payForm.payment_date,
      notes: payForm.notes || null,
    });
    if (error) { toast({ title: 'Errore', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Pagamento registrato' });
    setPayFor(null);
    setPayForm({ payment_amount: '', payment_date: new Date().toISOString().split('T')[0], notes: '' });
    qc.invalidateQueries({ queryKey: ['supplier-invoices'] });
    qc.invalidateQueries({ queryKey: ['suppliers-list'] });
    qc.invalidateQueries({ queryKey: ['scadenzario'] });
  };

  const togglePagata = async (r: any) => {
    const pagata = r.status === 'pagata';
    const { error } = await supabase.from('supplier_invoices').update({
      status: pagata ? 'da_pagare' : 'pagata',
      paid_amount: pagata ? 0 : Number(r.total || 0),
    }).eq('id', r.id);
    if (error) { toast({ title: 'Errore', description: error.message, variant: 'destructive' }); return; }
    toast({ title: pagata ? 'Segnata come non pagata' : 'Segnata come pagata' });
    qc.invalidateQueries({ queryKey: ['supplier-invoices'] });
    qc.invalidateQueries({ queryKey: ['suppliers-list'] });
    qc.invalidateQueries({ queryKey: ['scadenzario'] });
  };

  const apriAllegato = async (r: any) => {
    try {
      window.open(await getInvoiceAttachmentUrl(r.attachment_url), '_blank', 'noopener');
    } catch (e: any) {
      toast({ title: 'Allegato non disponibile', description: e?.message, variant: 'destructive' });
    }
  };

  const residuo = (invoices || []).reduce((s, i) => s + Math.max(0, Number(i.total || 0) - Number(i.paid_amount || 0)), 0);

  return (
    <>
      <Sheet open={!!supplierId} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto admin-theme">
          <SheetHeader><SheetTitle>{supplier?.name || 'Fornitore'}</SheetTitle></SheetHeader>

          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Nome</Label><Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>P.IVA</Label><Input value={form.vat_number || ''} onChange={(e) => setForm({ ...form, vat_number: e.target.value })} /></div>
              <div><Label>Contatto</Label><Input value={form.contact_person || ''} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></div>
              <div><Label>Telefono</Label><Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Indirizzo</Label><Input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Note</Label><Textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <Button onClick={saveSupplier}><Save className="w-4 h-4 mr-1" /> Salva anagrafica</Button>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Fatture</h3>
              <Button size="sm" onClick={() => { setEditingInvoice(null); setInvoiceDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Nuova fattura
              </Button>
            </div>

            <DataTable
              data={invoices || []}
              loading={isLoading}
              searchable={false}
              pageSize={15}
              emptyTitle="Nessuna fattura"
              emptyDescription="Registra la prima fattura di questo fornitore."
              onRowClick={(r) => { setEditingInvoice(r); setInvoiceDialog(true); }}
              columns={[
                { key: 'invoice_number', header: 'Numero', sortable: true },
                { key: 'invoice_date', header: 'Data', sortable: true, cell: (r) => fmtDateIt(r.invoice_date) },
                { key: 'due_date', header: 'Scadenza', sortable: true, cell: (r) => fmtDateIt(r.due_date) },
                { key: 'subtotal', header: 'Imponibile', className: 'text-right', cell: (r) => fmtEur(r.subtotal) },
                { key: 'vat_amount', header: 'IVA', className: 'text-right', cell: (r) => fmtEur(r.vat_amount) },
                { key: 'total', header: 'Totale', className: 'text-right font-semibold', cell: (r) => fmtEur(r.total) },
                { key: 'paid_amount', header: 'Pagato', className: 'text-right', cell: (r) => fmtEur(r.paid_amount) },
                {
                  key: 'status',
                  header: 'Stato',
                  cell: (r) => (
                    <button
                      type="button"
                      title={r.status === 'pagata' ? 'Segna come non pagata' : 'Segna come pagata'}
                      onClick={(e) => { e.stopPropagation(); void togglePagata(r); }}
                    >
                      <StatusPill size="sm" tone={dueTone(r.due_date, r.status === 'pagata') as any}>
                        {r.status === 'pagata' ? 'Pagata' : (SUPPLIER_INVOICE_STATUS_LABEL[r.status] || 'Non pagata')}
                      </StatusPill>
                    </button>
                  ),
                },
                {
                  key: 'attachment_url',
                  header: 'PDF',
                  cell: (r) => (r.attachment_url ? (
                    <button
                      type="button"
                      className="text-crm-primary hover:underline inline-flex items-center gap-1"
                      onClick={(e) => { e.stopPropagation(); void apriAllegato(r); }}
                    >
                      <Paperclip className="w-3.5 h-3.5" /> Apri
                    </button>
                  ) : <span className="text-muted-foreground">—</span>),
                },
                {
                  key: 'actions',
                  header: '',
                  cell: (r) => (
                    <div onClick={(e) => e.stopPropagation()} className="text-right">
                      {r.status !== 'pagata' && (
                        <Button size="sm" variant="outline" onClick={() => { setPayFor(r); setPayForm((f) => ({ ...f, payment_amount: String(Math.max(0, Number(r.total || 0) - Number(r.paid_amount || 0)).toFixed(2)) })); }}>
                          Registra pagamento
                        </Button>
                      )}
                    </div>
                  ),
                },
              ]}
            />

            <div className="flex justify-end text-sm font-semibold">
              Residuo da pagare: <span className="ml-2 text-red-600">{fmtEur(residuo)}</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <SupplierInvoiceDialog
        open={invoiceDialog}
        onOpenChange={setInvoiceDialog}
        defaultSupplierId={supplierId || undefined}
        invoice={editingInvoice}
      />

      <Dialog open={!!payFor} onOpenChange={(o) => !o && setPayFor(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Registra pagamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Importo (€)</Label><Input type="number" step="0.01" value={payForm.payment_amount} onChange={(e) => setPayForm({ ...payForm, payment_amount: e.target.value })} /></div>
            <div><Label>Data</Label><Input type="date" value={payForm.payment_date} onChange={(e) => setPayForm({ ...payForm, payment_date: e.target.value })} /></div>
            <div>
              <Label>Modalità</Label>
              <Select value={payForm.notes || 'bonifico'} onValueChange={(v) => setPayForm({ ...payForm, notes: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={savePayment}>Salva pagamento</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SupplierDetailSheet;
