import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, ArrowRight, CheckCircle2, AlertTriangle, Sparkles, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { CrmPageHeader } from '@/components/admin/CrmShell';

// --- Field definitions ------------------------------------------------------
type FieldKey =
  | 'product_code' | 'name' | 'description' | 'list_price' | 'purchase_price'
  | 'supplier_discount_percentage' | 'markup_percentage' | 'vat_percentage'
  | 'unit_of_measure' | 'collection' | 'category' | 'format' | 'thickness'
  | 'color' | 'finish' | 'barcode' | 'supplier_name' | 'stock_quantity'
  | 'ignore';

const FIELD_LABELS: Record<FieldKey, string> = {
  product_code: 'Codice / SKU *',
  name: 'Nome prodotto',
  description: 'Descrizione',
  list_price: 'Prezzo listino',
  purchase_price: 'Prezzo acquisto',
  supplier_discount_percentage: 'Sconto fornitore %',
  markup_percentage: 'Ricarico %',
  vat_percentage: 'IVA %',
  unit_of_measure: 'Unità di misura',
  collection: 'Collezione',
  category: 'Categoria',
  format: 'Formato',
  thickness: 'Spessore',
  color: 'Colore',
  finish: 'Finitura',
  barcode: 'Barcode / EAN',
  supplier_name: 'Fornitore',
  stock_quantity: 'Giacenza',
  ignore: '— Ignora —',
};

// Heuristic: normalized column name → field
const AUTO_MAP: Array<[RegExp, FieldKey]> = [
  [/^(codice|cod|sku|code|articolo|art\.?)/i, 'product_code'],
  [/^(ean|barcode|gtin)/i, 'barcode'],
  [/^(nome|descrizione\s?breve|denominazione|prodotto|name|item)/i, 'name'],
  [/^(descrizione|description|desc)/i, 'description'],
  [/^(prezzo\s?listino|listino|list\s?price|prezzo\s?ivato|prezzo\b)/i, 'list_price'],
  [/^(prezzo\s?acquisto|costo\s?acquisto|costo\b|cost\b|purchase)/i, 'purchase_price'],
  [/^(sconto\s?fornitore|sconto\b|discount)/i, 'supplier_discount_percentage'],
  [/^(ricarico|markup|margine)/i, 'markup_percentage'],
  [/^(iva|vat|tax)/i, 'vat_percentage'],
  [/^(um|u\.?m\.?|unit|unità)/i, 'unit_of_measure'],
  [/^(collezione|serie|linea|collection)/i, 'collection'],
  [/^(categoria|category|famiglia|tipologia)/i, 'category'],
  [/^(formato|misura|dimensione|size|format)/i, 'format'],
  [/^(spessore|thickness|sp\.?)/i, 'thickness'],
  [/^(colore|color|tinta)/i, 'color'],
  [/^(finitura|finish|effetto)/i, 'finish'],
  [/^(fornitore|supplier|produttore|brand)/i, 'supplier_name'],
  [/^(giacenza|stock|scorta|qta|quantità)/i, 'stock_quantity'],
];

// --- Types ------------------------------------------------------------------
type Row = Record<string, any>;
type Brand = { id: string; name: string };
type ExistingProduct = {
  id: string;
  product_code: string;
  name: string | null;
  list_price: number | null;
  supplier_discount_percentage: number | null;
  purchase_price: number | null;
};
type DiffType = 'new' | 'updated' | 'price_changed' | 'unchanged' | 'deleted';
type DiffRow = {
  code: string;
  parsed: Record<string, any>;
  existing?: ExistingProduct;
  diff: DiffType;
  changes: Array<{ field: string; old: any; new: any }>;
};

// --- Utils ------------------------------------------------------------------
const parseNumber = (v: any): number | null => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/[€\s]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
};
const NUMERIC_FIELDS = new Set<FieldKey>([
  'list_price', 'purchase_price', 'supplier_discount_percentage',
  'markup_percentage', 'vat_percentage', 'stock_quantity',
]);

// --- Component --------------------------------------------------------------
export default function CatalogImport() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState<string>('');
  const [priceListName, setPriceListName] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [mapping, setMapping] = useState<Record<string, FieldKey>>({});
  const [existing, setExisting] = useState<ExistingProduct[]>([]);
  const [diff, setDiff] = useState<DiffRow[] | null>(null);
  const [applying, setApplying] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    supabase.from('catalog_brands').select('id,name').order('name').then(({ data }) => {
      setBrands((data as Brand[]) ?? []);
    });
  }, []);

  // --- Step 1: parse file ---------------------------------------------------
  const handleFile = async (f: File) => {
    setFile(f);
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<Row>(ws, { defval: null, raw: true });
    if (!raw.length) { toast.error('File vuoto o non leggibile'); return; }
    const hdrs = Object.keys(raw[0]);
    setHeaders(hdrs);
    setRows(raw);
    // auto-map
    const m: Record<string, FieldKey> = {};
    for (const h of hdrs) {
      const norm = String(h).trim();
      const hit = AUTO_MAP.find(([re]) => re.test(norm));
      m[h] = hit ? hit[1] : 'ignore';
    }
    setMapping(m);
    if (!priceListName) setPriceListName(f.name.replace(/\.[^.]+$/, ''));
    setStep(2);
  };

  // --- Step 2 → 3: compute diff --------------------------------------------
  const mappedFields = useMemo(() =>
    new Set(Object.values(mapping).filter(v => v !== 'ignore')), [mapping]);

  const buildParsedRow = (r: Row) => {
    const out: Record<string, any> = {};
    for (const [col, field] of Object.entries(mapping)) {
      if (field === 'ignore') continue;
      let v = r[col];
      if (NUMERIC_FIELDS.has(field)) v = parseNumber(v);
      else if (v !== null && v !== undefined) v = String(v).trim();
      if (v !== null && v !== '' && v !== undefined) out[field] = v;
    }
    return out;
  };

  const computeDiff = async () => {
    if (!mappedFields.has('product_code')) {
      toast.error('Devi mappare almeno il campo "Codice / SKU"');
      return;
    }
    // fetch existing catalog scoped to brand if any
    let q = supabase.from('catalog_products')
      .select('id, product_code, name, list_price, supplier_discount_percentage, purchase_price');
    if (brandId) q = q.eq('brand_id', brandId);
    const { data, error } = await q;
    if (error) { toast.error(error.message); return; }
    const existingArr = (data as ExistingProduct[]) ?? [];
    setExisting(existingArr);
    const byCode = new Map(existingArr.map(p => [p.product_code?.toLowerCase(), p]));

    const seen = new Set<string>();
    const out: DiffRow[] = [];
    for (const r of rows) {
      const parsed = buildParsedRow(r);
      const code = parsed.product_code;
      if (!code) continue;
      const key = String(code).toLowerCase();
      seen.add(key);
      const ex = byCode.get(key);
      if (!ex) {
        out.push({ code, parsed, diff: 'new', changes: [] });
        continue;
      }
      const changes: DiffRow['changes'] = [];
      const check = (field: string, oldV: any, newV: any) => {
        if (newV === undefined) return;
        const o = oldV ?? null;
        const n = newV ?? null;
        if (typeof o === 'number' && typeof n === 'number') {
          if (Math.abs(o - n) > 0.001) changes.push({ field, old: o, new: n });
        } else if (String(o ?? '') !== String(n ?? '')) {
          changes.push({ field, old: o, new: n });
        }
      };
      check('name', ex.name, parsed.name);
      check('list_price', ex.list_price, parsed.list_price);
      check('purchase_price', ex.purchase_price, parsed.purchase_price);
      check('supplier_discount_percentage', ex.supplier_discount_percentage, parsed.supplier_discount_percentage);
      const priceChanged = changes.some(c => c.field === 'list_price' || c.field === 'purchase_price');
      if (!changes.length) out.push({ code, parsed, existing: ex, diff: 'unchanged', changes });
      else if (priceChanged && changes.length <= 2) out.push({ code, parsed, existing: ex, diff: 'price_changed', changes });
      else out.push({ code, parsed, existing: ex, diff: 'updated', changes });
    }
    // deleted = existing not in import (only if brand scoped, to be safe)
    if (brandId) {
      for (const ex of existingArr) {
        if (!seen.has(ex.product_code?.toLowerCase())) {
          out.push({ code: ex.product_code, parsed: {}, existing: ex, diff: 'deleted', changes: [] });
        }
      }
    }
    setDiff(out);
    setStep(3);
  };

  // --- Step 3 → 4: apply ----------------------------------------------------
  const apply = async () => {
    if (!diff) return;
    setApplying(true);
    try {
      // Next version for brand (or global)
      let vq = supabase.from('catalog_price_lists').select('version').order('version', { ascending: false }).limit(1);
      if (brandId) vq = vq.eq('brand_id', brandId); else vq = vq.is('brand_id', null);
      const { data: prev } = await vq;
      const version = ((prev?.[0]?.version as number) ?? 0) + 1;

      const totals = {
        new: diff.filter(d => d.diff === 'new').length,
        updated: diff.filter(d => d.diff === 'updated').length,
        price_changed: diff.filter(d => d.diff === 'price_changed').length,
        unchanged: diff.filter(d => d.diff === 'unchanged').length,
        deleted: diff.filter(d => d.diff === 'deleted').length,
      };
      const { data: user } = await supabase.auth.getUser();
      const { data: pl, error: plErr } = await supabase.from('catalog_price_lists').insert({
        name: priceListName || (file?.name ?? 'Listino'),
        version,
        brand_id: brandId || null,
        source_file: file?.name ?? null,
        notes: notes || null,
        status: 'applied',
        totals,
        applied_at: new Date().toISOString(),
        created_by: user?.user?.id ?? null,
      }).select('id').single();
      if (plErr) throw plErr;
      const plId = pl!.id;

      // Prepare items + upserts
      const items: any[] = [];
      const upserts: any[] = [];
      for (const d of diff) {
        if (d.diff === 'deleted') {
          items.push({
            price_list_id: plId,
            product_code: d.code,
            product_id: d.existing?.id ?? null,
            diff_type: 'deleted',
            snapshot: d.existing as any,
            old_snapshot: d.existing as any,
            name: d.existing?.name ?? null,
            list_price: d.existing?.list_price ?? null,
          });
          continue;
        }
        items.push({
          price_list_id: plId,
          product_code: String(d.code),
          product_id: d.existing?.id ?? null,
          diff_type: d.diff,
          snapshot: d.parsed,
          old_snapshot: d.existing ?? null,
          name: d.parsed.name ?? null,
          list_price: d.parsed.list_price ?? null,
          supplier_discount_percentage: d.parsed.supplier_discount_percentage ?? null,
          unit_of_measure: d.parsed.unit_of_measure ?? null,
          vat_percentage: d.parsed.vat_percentage ?? null,
        });
        if (d.diff === 'unchanged') continue;
        const row: any = {
          product_code: String(d.code),
          ...d.parsed,
          brand_id: brandId || null,
          is_active: true,
        };
        if (d.existing?.id) row.id = d.existing.id;
        upserts.push(row);
      }

      // Insert diff items in chunks
      for (let i = 0; i < items.length; i += 500) {
        const chunk = items.slice(i, i + 500);
        const { error } = await supabase.from('catalog_price_list_items').insert(chunk);
        if (error) throw error;
      }
      // Upsert products in chunks by product_code
      for (let i = 0; i < upserts.length; i += 200) {
        const chunk = upserts.slice(i, i + 200);
        const { error } = await supabase.from('catalog_products').upsert(chunk, { onConflict: 'product_code' });
        if (error) throw error;
      }

      toast.success(`Listino v${version} applicato: ${totals.new} nuovi, ${totals.updated + totals.price_changed} aggiornati`);
      setStep(4);
    } catch (e: any) {
      console.error(e);
      toast.error('Errore durante l\'import: ' + (e.message ?? e));
    } finally {
      setApplying(false);
    }
  };

  const reset = () => {
    setFile(null); setHeaders([]); setRows([]); setMapping({});
    setDiff(null); setExisting([]); setStep(1); setPriceListName(''); setNotes('');
  };

  const totals = diff && {
    new: diff.filter(d => d.diff === 'new').length,
    updated: diff.filter(d => d.diff === 'updated').length,
    price_changed: diff.filter(d => d.diff === 'price_changed').length,
    unchanged: diff.filter(d => d.diff === 'unchanged').length,
    deleted: diff.filter(d => d.diff === 'deleted').length,
  };

  return (
    <div className="space-y-4">
      <CrmPageHeader
        breadcrumb={['CRM', 'Catalogo', 'Importa']}
        title="Importa listino"
        subtitle="Carica XLSX / CSV, mappa le colonne e applica la nuova versione con anteprima delle differenze"
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {[
          [1, 'Upload'], [2, 'Mappatura'], [3, 'Anteprima'], [4, 'Fatto'],
        ].map(([n, label], i, arr) => (
          <div key={n as number} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              step >= (n as number) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>{n}</div>
            <span className={step >= (n as number) ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
            {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" />Carica file</CardTitle>
            <CardDescription>Formati supportati: .xlsx, .xls, .csv</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca (opzionale — restringe il confronto e abilita "eliminati")</Label>
                <Select value={brandId} onValueChange={setBrandId}>
                  <SelectTrigger><SelectValue placeholder="Tutte le marche" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Nessuna (globale) —</SelectItem>
                    {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome listino</Label>
                <Input value={priceListName} onChange={e => setPriceListName(e.target.value)} placeholder="Es. Listino Kronos 2026" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Note sulla versione del listino" />
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <Input type="file" accept=".xlsx,.xls,.csv" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} className="max-w-sm mx-auto cursor-pointer" />
              <p className="text-xs text-muted-foreground mt-2">Il file verrà analizzato in locale — nessuna scrittura fino alla conferma</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Mapping */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" />Mappatura colonne</CardTitle>
            <CardDescription>{rows.length} righe trovate — associa ogni colonna a un campo del catalogo. Almeno il codice è obbligatorio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {headers.map(h => (
                <div key={h} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                  <div className="text-xs text-muted-foreground truncate" title={h}>{h}</div>
                  <div className="text-xs font-mono text-muted-foreground truncate">
                    es: {String(rows[0]?.[h] ?? '—').slice(0, 40)}
                  </div>
                  <Select value={mapping[h]} onValueChange={v => setMapping(m => ({ ...m, [h]: v as FieldKey }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(FIELD_LABELS) as FieldKey[]).map(k => (
                        <SelectItem key={k} value={k}>{FIELD_LABELS[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={reset}>Annulla</Button>
              <Button onClick={computeDiff}>Anteprima differenze <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Diff preview */}
      {step === 3 && diff && totals && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard label="Nuovi" value={totals.new} icon={<Sparkles className="w-4 h-4" />} color="text-emerald-600" />
            <StatCard label="Aggiornati" value={totals.updated} icon={<CheckCircle2 className="w-4 h-4" />} color="text-blue-600" />
            <StatCard label="Prezzo cambiato" value={totals.price_changed} icon={<TrendingUp className="w-4 h-4" />} color="text-amber-600" />
            <StatCard label="Invariati" value={totals.unchanged} icon={<CheckCircle2 className="w-4 h-4" />} color="text-muted-foreground" />
            <StatCard label="Eliminati" value={totals.deleted} icon={<Trash2 className="w-4 h-4" />} color="text-red-600" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Anteprima differenze</CardTitle>
              <CardDescription>Nessuna modifica al database finché non premi "Applica"</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="new">
                <TabsList>
                  <TabsTrigger value="new">Nuovi ({totals.new})</TabsTrigger>
                  <TabsTrigger value="price_changed">Prezzi ({totals.price_changed})</TabsTrigger>
                  <TabsTrigger value="updated">Aggiornati ({totals.updated})</TabsTrigger>
                  <TabsTrigger value="deleted">Eliminati ({totals.deleted})</TabsTrigger>
                </TabsList>
                {(['new', 'price_changed', 'updated', 'deleted'] as DiffType[]).map(t => (
                  <TabsContent key={t} value={t}>
                    <DiffTable rows={diff.filter(d => d.diff === t)} type={t} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setStep(2)}>Modifica mappatura</Button>
            <Button variant="outline" onClick={reset}>Annulla</Button>
            <Button onClick={apply} disabled={applying}>
              {applying ? 'Applicazione…' : `Applica listino (v. next)`}
            </Button>
          </div>
        </>
      )}

      {/* STEP 4: Done */}
      {step === 4 && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-600" />
            <div>
              <h3 className="text-lg font-semibold">Listino importato con successo</h3>
              <p className="text-sm text-muted-foreground">La nuova versione è ora attiva. Consulta lo storico in "Listini & versioni".</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={reset}>Importa un altro listino</Button>
              <Button onClick={() => (window.location.href = '/admin/catalogo/listini')}>Vai a Listini</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Small components -------------------------------------------------------
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`flex items-center gap-2 text-sm ${color}`}>{icon}<span>{label}</span></div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function DiffTable({ rows, type }: { rows: DiffRow[]; type: DiffType }) {
  if (!rows.length) return <div className="py-8 text-center text-sm text-muted-foreground">Nessun elemento</div>;
  return (
    <div className="max-h-[500px] overflow-auto border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow>
            <TableHead>Codice</TableHead>
            <TableHead>Nome</TableHead>
            {type === 'new' && <><TableHead>Prezzo</TableHead><TableHead>Sconto %</TableHead></>}
            {(type === 'updated' || type === 'price_changed') && <TableHead>Modifiche</TableHead>}
            {type === 'deleted' && <TableHead>Prezzo attuale</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.slice(0, 500).map((d, i) => (
            <TableRow key={i}>
              <TableCell className="font-mono text-xs">{d.code}</TableCell>
              <TableCell className="text-sm">{d.parsed.name ?? d.existing?.name ?? '—'}</TableCell>
              {type === 'new' && <>
                <TableCell>{d.parsed.list_price != null ? `€ ${d.parsed.list_price}` : '—'}</TableCell>
                <TableCell>{d.parsed.supplier_discount_percentage != null ? `${d.parsed.supplier_discount_percentage}%` : '—'}</TableCell>
              </>}
              {(type === 'updated' || type === 'price_changed') && (
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {d.changes.map((c, k) => {
                      const up = typeof c.old === 'number' && typeof c.new === 'number' && c.new > c.old;
                      const down = typeof c.old === 'number' && typeof c.new === 'number' && c.new < c.old;
                      return (
                        <Badge key={k} variant="outline" className="text-xs font-normal">
                          {c.field}: <span className="line-through opacity-60 mx-1">{String(c.old ?? '—')}</span>
                          → <span className={up ? 'text-red-600 ml-1' : down ? 'text-emerald-600 ml-1' : 'ml-1'}>{String(c.new ?? '—')}</span>
                          {up && <TrendingUp className="w-3 h-3 ml-1 text-red-600" />}
                          {down && <TrendingDown className="w-3 h-3 ml-1 text-emerald-600" />}
                        </Badge>
                      );
                    })}
                  </div>
                </TableCell>
              )}
              {type === 'deleted' && <TableCell>{d.existing?.list_price != null ? `€ ${d.existing.list_price}` : '—'}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length > 500 && (
        <div className="p-2 text-center text-xs text-muted-foreground border-t">
          Mostrati 500 di {rows.length}. L'import applicherà tutti gli elementi.
        </div>
      )}
    </div>
  );
}
