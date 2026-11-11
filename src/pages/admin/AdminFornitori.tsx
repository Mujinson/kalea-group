import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CrmPageHeader, CrmKpiTile, CrmKpiRow } from '@/components/admin/CrmShell';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Truck, Receipt, AlertTriangle } from 'lucide-react';
import { fmtEur } from '@/lib/finance';
import SupplierDetailSheet from '@/components/admin/fornitori/SupplierDetailSheet';
import SupplierInvoiceDialog from '@/components/admin/fornitori/SupplierInvoiceDialog';
import { SupplierForm, supplierPayload } from '@/components/admin/fornitori/SupplierForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const AdminFornitori = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [newInvoice, setNewInvoice] = useState(false);
  const [newSup, setNewSup] = useState<any | null>(null);
  const qc = useQueryClient();
  const createSupplier = async () => {
    if (!newSup?.name?.trim()) return toast.error('Inserisci la ragione sociale');
    const { data, error } = await supabase.from('suppliers').insert(supplierPayload(newSup)).select('id').single();
    if (error) return toast.error(error.message);
    toast.success('Fornitore creato');
    setNewSup(null);
    qc.invalidateQueries({ queryKey: ['suppliers-list'] });
    qc.invalidateQueries({ queryKey: ['suppliers-min'] });
    setSelected(data.id);
  };

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: async () => {
      const [s, i] = await Promise.all([
        supabase.from('suppliers').select('*').order('name'),
        supabase.from('supplier_invoices').select('supplier_id, total, paid_amount, status, invoice_date'),
      ]);
      if (s.error) throw s.error;
      if (i.error) throw i.error;
      const year = new Date().getFullYear();
      return (s.data || []).map((sup: any) => {
        const inv = (i.data || []).filter((x: any) => x.supplier_id === sup.id);
        const toPay = inv.filter((x: any) => x.status !== 'pagata')
          .reduce((acc: number, x: any) => acc + Math.max(0, Number(x.total || 0) - Number(x.paid_amount || 0)), 0);
        const spentYear = inv.filter((x: any) => new Date(x.invoice_date).getFullYear() === year)
          .reduce((acc: number, x: any) => acc + Number(x.total || 0), 0);
        return { ...sup, toPay, spentYear };
      });
    },
  });

  const totals = useMemo(() => {
    const rows = suppliers || [];
    return {
      count: rows.length,
      toPay: rows.reduce((s: number, r: any) => s + r.toPay, 0),
      spentYear: rows.reduce((s: number, r: any) => s + r.spentYear, 0),
    };
  }, [suppliers]);

  const sorted = useMemo(() => [...(suppliers || [])].sort((a: any, b: any) => b.toPay - a.toPay), [suppliers]);

  return (
    <div className="space-y-4">
      <CrmPageHeader
        breadcrumb={['CRM', 'Finanza', 'Fornitori']}
        title="Fornitori"
        subtitle="Anagrafica, fatture passive e pagamenti"
        actions={<div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setNewSup({ country: 'Italia', bank_accounts: [] })}><Plus className="w-4 h-4 mr-1" /> Nuovo fornitore</Button><Button size="sm" onClick={() => setNewInvoice(true)}><Plus className="w-4 h-4 mr-1" /> Nuova fattura</Button></div>}
      />

      <CrmKpiRow>
        <CrmKpiTile label="Fornitori" value={String(totals.count)} color="blue" icon={<Truck className="w-4 h-4" />} />
        <CrmKpiTile label="Da pagare" value={fmtEur(totals.toPay)} color="red" icon={<AlertTriangle className="w-4 h-4" />} />
        <CrmKpiTile label={`Speso ${new Date().getFullYear()}`} value={fmtEur(totals.spentYear)} color="amber" icon={<Receipt className="w-4 h-4" />} />
      </CrmKpiRow>

      <DataTable
        data={sorted}
        loading={isLoading}
        searchPlaceholder="Cerca fornitore…"
        searchKeys={['name', 'vat_number', 'contact_person', 'phone']}
        emptyTitle="Nessun fornitore"
        emptyDescription="Premi «Nuovo fornitore» per inserire il primo."
        onRowClick={(r) => setSelected(r.id)}
        columns={[
          { key: 'name', header: 'Nome', sortable: true, cell: (r) => <span className="font-medium">{r.name}</span> },
          { key: 'vat_number', header: 'P.IVA', sortable: true },
          { key: 'contact_person', header: 'Contatto' },
          { key: 'phone', header: 'Telefono' },
          {
            key: 'toPay', header: 'Da pagare', sortable: true, className: 'text-right font-semibold',
            accessor: (r) => r.toPay,
            cell: (r) => <span className={r.toPay > 0 ? 'text-red-600' : ''}>{fmtEur(r.toPay)}</span>,
          },
          {
            key: 'spentYear', header: `Speso ${new Date().getFullYear()}`, sortable: true, className: 'text-right',
            accessor: (r) => r.spentYear,
            cell: (r) => fmtEur(r.spentYear),
          },
        ]}
      />

      <SupplierDetailSheet supplierId={selected} onOpenChange={(o) => !o && setSelected(null)} />
      <SupplierInvoiceDialog open={newInvoice} onOpenChange={setNewInvoice} />
      <Dialog open={!!newSup} onOpenChange={(o) => !o && setNewSup(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto admin-theme">
          <DialogHeader><DialogTitle>Nuovo fornitore</DialogTitle></DialogHeader>
          {newSup && <SupplierForm form={newSup} setForm={setNewSup} />}
          <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setNewSup(null)}>Annulla</Button><Button onClick={createSupplier}>Crea fornitore</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFornitori;
