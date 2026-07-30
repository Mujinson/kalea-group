import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface QuoteItem {
  id?: string;
  product_type: string;
  color?: string;
  quantity_sqm: number;
  unit_price: number;
  total_price: number;
}

interface QuoteForConvert {
  id: string;
  quote_number: string | null;
  customer_id: string | null;
  total_amount: number;
  vat_amount: number;
  vat_included: boolean;
  items: QuoteItem[];
  notes: string | null;
  site_address?: string | null;
  site_city?: string | null;
  site_province?: string | null;
  site_postal_code?: string | null;
  site_country?: string | null;
  project_name?: string | null;
  subject?: string | null;
  lead_id?: string | null;
  quote_data?: any;
}

/** Riga materiale normalizzata dal payload del preventivo */
interface MatLine {
  name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  product_code?: string | null;
  catalog_id?: string | null;
}

/** Estrae le righe materiale dal payload items/quote_data del preventivo. */
export const extractMaterialLines = (quote: QuoteForConvert): MatLine[] => {
  const items: any[] = Array.isArray(quote.items) ? quote.items : [];
  const qd = quote.quote_data || {};
  const prodCode: string | null = qd?.prodotto?.id || null;
  const costoMatMq = Number(qd?.calc?.costoMatMq) || 0;
  const out: MatLine[] = [];

  for (const it of items) {
    const type = String(it?.type || '');
    if (type === 'prodotto') {
      const unitCost = costoMatMq || Number(it.prezzo_mq) || 0;
      const tonalita: any[] = Array.isArray(it.tonalita) ? it.tonalita : [];
      if (tonalita.length > 0) {
        for (const t of tonalita) {
          const mq = Number(t?.mq) || 0;
          if (mq <= 0) continue;
          out.push({
            name: [it.descrizione, t?.nome].filter(Boolean).join(' — '),
            quantity: mq,
            unit: 'mq',
            unit_cost: unitCost,
            product_code: prodCode,
          });
        }
      } else {
        const mq = Number(it.mq) || Number(it.quantity_sqm) || 0;
        if (mq > 0) {
          out.push({ name: it.descrizione || 'Materiale', quantity: mq, unit: 'mq', unit_cost: unitCost, product_code: prodCode });
        }
      }
    } else if (type === 'extra' || type === 'articolo' || type === 'accessorio') {
      const qty = Number(it.qta) || 0;
      if (qty <= 0) continue;
      out.push({
        name: it.descrizione || 'Voce',
        quantity: qty,
        unit: it.unita || 'pz',
        unit_cost: Number(it.prezzo_un) || 0,
        catalog_id: it.catalog_id || null,
        product_code: it.codice || null,
      });
    } else if (!type && Number(it?.quantity_sqm) > 0) {
      // formato legacy
      out.push({
        name: [it.product_type, it.color].filter(Boolean).join(' — ') || 'Materiale',
        quantity: Number(it.quantity_sqm) || 0,
        unit: 'mq',
        unit_cost: Number(it.unit_price) || 0,
      });
    }
  }
  return out;
};


interface Rate {
  key: string;
  label: string;
  percentage: number;
  due_date: string;
}

interface Props {
  open: boolean;
  quote: QuoteForConvert | null;
  onOpenChange: (open: boolean) => void;
  onConverted: () => void;
}

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return format(d, 'yyyy-MM-dd');
};

const defaultRates = (): Rate[] => ([
  { key: '1', label: 'Acconto', percentage: 30, due_date: addDays(0) },
  { key: '2', label: 'Consegna', percentage: 40, due_date: addDays(30) },
  { key: '3', label: 'Fine lavori', percentage: 30, due_date: addDays(60) },
]);

export const ConvertQuoteToSaleDialog = ({ open, quote, onOpenChange, onConverted }: Props) => {
  const [rates, setRates] = useState<Rate[]>(defaultRates());
  const [createSite, setCreateSite] = useState(true);
  const [salespersonId, setSalespersonId] = useState<string>('');
  const [salespeople, setSalespeople] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(() => {
    if (!quote) return 0;
    return Number(quote.total_amount || 0) - Number(quote.vat_amount || 0);
  }, [quote]);

  const matPreview = useMemo(() => (quote ? extractMaterialLines(quote) : []), [quote]);



  useEffect(() => {
    if (!open) return;
    setRates(defaultRates());
    setCreateSite(true);
    (async () => {
      const { data: sps } = await supabase.from('salespeople').select('id, user_id, first_name, last_name, commission_rate, is_commission_earner').eq('is_active', true).order('first_name');
      setSalespeople(sps || []);
      // Precompile from customer
      if (quote?.customer_id) {
        const { data: cust } = await supabase.from('customers').select('assigned_salesperson_id').eq('id', quote.customer_id).maybeSingle();
        if (cust?.assigned_salesperson_id) setSalespersonId(cust.assigned_salesperson_id);
      }
    })();
  }, [open, quote?.customer_id]);

  const totalPct = rates.reduce((s, r) => s + (Number(r.percentage) || 0), 0);

  const addRate = () => setRates([...rates, { key: Date.now().toString(), label: `Rata ${rates.length + 1}`, percentage: 0, due_date: addDays(90) }]);
  const removeRate = (k: string) => setRates(rates.filter(r => r.key !== k));
  const updateRate = (k: string, patch: Partial<Rate>) => setRates(rates.map(r => r.key === k ? { ...r, ...patch } : r));

  const handleConfirm = async () => {
    if (!quote) return;
    if (!quote.customer_id) { toast.error('Preventivo senza cliente'); return; }
    if (Math.round(totalPct) !== 100) { toast.error(`Le percentuali delle rate devono sommare a 100% (attuale ${totalPct}%)`); return; }

    setSubmitting(true);
    const created = {
      sale_id: null as string | null,
      schedule_ids: [] as string[],
      commission_id: null as string | null,
      site_id: null as string | null,
      site_material_ids: [] as string[],
    };

    const rollback = async () => {
      // reverse order
      if (created.site_material_ids.length) await supabase.from('site_materials').delete().in('id', created.site_material_ids);
      if (created.site_id) await supabase.from('construction_sites').delete().eq('id', created.site_id);
      if (created.commission_id) await supabase.from('commissions').delete().eq('id', created.commission_id);
      if (created.schedule_ids.length) await supabase.from('payment_schedules').delete().in('id', created.schedule_ids);
      if (created.sale_id) await supabase.from('sales').delete().eq('id', created.sale_id);
    };

    try {
      const items: any[] = Array.isArray(quote.items) ? quote.items : [];
      const matLines = extractMaterialLines(quote);
      const firstItem: any = items[0];
      const totalQty = matLines.filter(m => m.unit === 'mq').reduce((s, m) => s + m.quantity, 0)
        || items.reduce((s: number, i: any) => s + (Number(i.quantity_sqm) || 0), 0);
      const totalAmount = Number(quote.total_amount) || 0;
      const vatAmount = Number(quote.vat_amount) || 0;
      const sub = totalAmount - vatAmount;
      const unitPrice = totalQty > 0 ? sub / totalQty : 0;
      const vatRate = quote.vat_included ? 0 : 0.22;


      // a) Sale
      const { data: sale, error: saleErr } = await supabase.from('sales').insert({
        customer_id: quote.customer_id,
        product_type: firstItem?.product_type || quote.quote_data?.prodotto?.nome || quote.subject || 'MgO',
        color: firstItem?.color || quote.quote_data?.tonalita?.[0]?.nome || null,

        quantity_sqm: totalQty,
        sale_price: unitPrice,
        vat_included: quote.vat_included,
        vat_amount: vatAmount,
        vat_rate: vatRate,
        subtotal_amount: sub,
        total_amount: totalAmount,
        notes: `Convertito da preventivo ${quote.quote_number || ''}`.trim(),
      }).select().single();
      if (saleErr) throw saleErr;
      created.sale_id = sale.id;

      // b) payment_schedules
      const schedRows = rates.map(r => ({
        sale_id: sale.id,
        amount: Math.round(((sub * r.percentage) / 100) * 100) / 100,
        due_date: r.due_date,
        is_paid: false,
        payment_type: r.label,
      }));
      if (schedRows.length) {
        const { data: schedIns, error: schedErr } = await supabase.from('payment_schedules').insert(schedRows).select('id');
        if (schedErr) throw schedErr;
        created.schedule_ids = (schedIns || []).map(s => s.id);
      }

      // c) commission
      if (salespersonId) {
        const sp = salespeople.find(s => s.id === salespersonId);
        const pct = Number(sp?.commission_rate) || 0;
        if (sp?.user_id && pct > 0) {
          // avoid duplicate if trigger already created one from quote acceptance
          const { data: existing } = await supabase.from('commissions').select('id').eq('quote_id', quote.id).maybeSingle();
          if (!existing) {
            const { data: comm, error: commErr } = await supabase.from('commissions').insert({
              user_id: sp.user_id,
              quote_id: quote.id,
              sale_id: sale.id,
              customer_id: quote.customer_id,
              base_amount: sub,
              percentage: pct,
              amount: Math.round((sub * pct / 100) * 100) / 100,
              status: 'da_liquidare',
            }).select('id').single();
            if (commErr) throw commErr;
            created.commission_id = comm.id;
          } else {
            // patch existing to link sale_id
            await supabase.from('commissions').update({ sale_id: sale.id }).eq('id', existing.id);
          }
        }
      }

      // d) construction_site
      if (createSite) {
        // dedup: if a site already exists for this quote, link it
        const { data: existingSite } = await supabase.from('construction_sites').select('id').eq('quote_id', quote.id).maybeSingle();
        let siteId = existingSite?.id as string | undefined;
        if (siteId) {
          await supabase.from('construction_sites').update({ sale_id: sale.id, budget_amount: sub }).eq('id', siteId);
        } else {
          const { data: cust } = await supabase.from('customers').select('address, city, province, postal_code, country, company_name, first_name, last_name').eq('id', quote.customer_id).maybeSingle();
          const title = quote.project_name || quote.subject || `Cantiere ${quote.quote_number || ''}`.trim() || 'Cantiere';
          const { data: siteIns, error: siteErr } = await supabase.from('construction_sites').insert({
            title,
            project_name: quote.project_name || null,
            customer_id: quote.customer_id,
            lead_id: quote.lead_id || null,
            quote_id: quote.id,
            sale_id: sale.id,
            salesperson_id: salespersonId || null,
            budget_amount: sub,
            address: quote.site_address || cust?.address || null,
            city: quote.site_city || cust?.city || null,
            province: quote.site_province || cust?.province || null,
            postal_code: quote.site_postal_code || cust?.postal_code || null,
            country: quote.site_country || cust?.country || null,
            status: 'pianificato',
            priority: 'media',
            planned_start_date: format(new Date(), 'yyyy-MM-dd'),
            notes: quote.notes || null,
          }).select('id').single();
          if (siteErr) throw siteErr;
          siteId = siteIns.id;
          created.site_id = siteId;
        }

        // e) site_materials dalle righe del preventivo (con risoluzione product_id sul catalogo)
        const codes = Array.from(new Set(matLines.map(m => m.product_code).filter(Boolean))) as string[];
        const codeToId = new Map<string, string>();
        if (codes.length) {
          const { data: prods } = await supabase.from('catalog_products').select('id, product_code').in('product_code', codes);
          (prods || []).forEach((p: any) => codeToId.set(p.product_code, p.id));
        }
        const matRows = matLines.map(m => ({
          site_id: siteId!,
          product_id: m.catalog_id || (m.product_code ? codeToId.get(m.product_code) || null : null),
          material_name: m.name,
          quantity: m.quantity,
          unit: m.unit,
          unit_cost: m.unit_cost,
          total_cost: Math.round(m.quantity * m.unit_cost * 100) / 100,
          notes: `Da preventivo ${quote.quote_number || ''}`.trim(),
        }));
        if (matRows.length) {
          const { data: matIns, error: matErr } = await supabase.from('site_materials').insert(matRows).select('id');
          if (matErr) throw matErr;
          created.site_material_ids = (matIns || []).map(m => m.id);
        }

      }

      // Mark quote as converted
      const { error: qErr } = await supabase.from('quotes').update({
        status: 'converted',
        converted_sale_id: sale.id,
        accepted_date: new Date().toISOString(),
      }).eq('id', quote.id);
      if (qErr) throw qErr;

      // Update customer totals
      const { data: cust2 } = await supabase.from('customers').select('total_value').eq('id', quote.customer_id).maybeSingle();
      await supabase.from('customers').update({
        status: 'working' as const,
        total_value: (Number(cust2?.total_value) || 0) + sub,
      }).eq('id', quote.customer_id);

      toast.success('Preventivo convertito in vendita');
      onOpenChange(false);
      onConverted();
    } catch (e: any) {
      console.error('Conversion failed:', e);
      await rollback();
      toast.error(`Conversione annullata: ${e?.message || 'errore sconosciuto'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conversione preventivo {quote.quote_number || ''}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="rounded-lg border p-3 text-sm bg-muted/30">
            Totale imponibile: <strong>€{subtotal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</strong>
          </div>

          <div className="space-y-2">
            <Label>Venditore (per provvigione)</Label>
            <Select value={salespersonId} onValueChange={setSalespersonId}>
              <SelectTrigger><SelectValue placeholder="Nessuno" /></SelectTrigger>
              <SelectContent>
                {salespeople.map(sp => (
                  <SelectItem key={sp.id} value={sp.id}>
                    {sp.first_name} {sp.last_name} — {Number(sp.commission_rate) || 0}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Piano rate</Label>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${Math.round(totalPct) === 100 ? 'text-muted-foreground' : 'text-destructive font-medium'}`}>Totale: {totalPct}%</span>
                <Button type="button" size="sm" variant="outline" onClick={addRate}><Plus className="w-3 h-3 mr-1" />Rata</Button>
              </div>
            </div>
            {rates.map(r => (
              <div key={r.key} className="grid grid-cols-12 gap-2 items-center">
                <Input className="col-span-4" value={r.label} onChange={e => updateRate(r.key, { label: e.target.value })} placeholder="Descrizione" />
                <div className="col-span-3 flex items-center gap-1">
                  <Input type="number" step="0.01" value={r.percentage} onChange={e => updateRate(r.key, { percentage: parseFloat(e.target.value) || 0 })} />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <Input className="col-span-4" type="date" value={r.due_date} onChange={e => updateRate(r.key, { due_date: e.target.value })} />
                <Button type="button" size="icon" variant="ghost" className="col-span-1" onClick={() => removeRate(r.key)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            {Math.round(totalPct) !== 100 && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" /> Le percentuali devono sommare a 100%
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="create-site" checked={createSite} onCheckedChange={(v) => setCreateSite(!!v)} />
            <Label htmlFor="create-site" className="cursor-pointer">
              Crea cantiere da questa vendita ({matPreview.length} righe materiale dal preventivo)
            </Label>

          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Annulla</Button>
          <Button onClick={handleConfirm} disabled={submitting}>{submitting ? 'Conversione…' : 'Converti'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertQuoteToSaleDialog;
