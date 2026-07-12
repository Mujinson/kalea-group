import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/fetchAllRows';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Undo2, Loader2 } from 'lucide-react';

type Product = {
  id: string;
  product_code: string | null;
  name: string;
  brand: string | null;
  category_id: string | null;
  category?: string | null;
  product_type: string | null;
  list_price: number | null;
  supplier_discount_percentage: number | null;
  markup_percentage: number | null;
  is_active: boolean;
  unit_of_measure: string | null;
};

const euro = (n: number | null | undefined) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);

// Sale price: list * (1 - supplier_discount%) * (1 + markup%)
const salePrice = (p: Product) => {
  const list = Number(p.list_price) || 0;
  const disc = Number(p.supplier_discount_percentage) || 0;
  const mk = Number(p.markup_percentage) || 0;
  return list * (1 - disc / 100) * (1 + mk / 100);
};

const PAGE_SIZE = 50;

export default function CatalogPrices() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [missingPrice, setMissingPrice] = useState(false);
  const [missingMargin, setMissingMargin] = useState(false);
  const [page, setPage] = useState(1);
  const [bulkOp, setBulkOp] = useState<'variation' | 'discount' | 'markup' | 'active'>('variation');
  const [bulkValue, setBulkValue] = useState<string>('');
  const [bulkActive, setBulkActive] = useState<'true' | 'false'>('true');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [undoStack, setUndoStack] = useState<Array<{ id: string; patch: Partial<Product> }[]>>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [data, catsRes] = await Promise.all([
        fetchAllRows<Product>(
          supabase
            .from('catalog_products')
            .select('id,product_code,name,brand,category_id,product_type,list_price,supplier_discount_percentage,markup_percentage,is_active,unit_of_measure')
            .order('brand', { ascending: true })
            .order('name', { ascending: true }),
        ),
        supabase.from('product_categories').select('id,name'),
      ]);
      const catMap = new Map<string, string>();
      (catsRes.data || []).forEach((c: any) => catMap.set(c.id, c.name));
      setRows(data.map(r => ({ ...r, category: r.category_id ? (catMap.get(r.category_id) || null) : null })));
    } catch (e: any) {
      toast.error('Errore caricamento: ' + (e?.message || 'sconosciuto'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const brands = useMemo(
    () => Array.from(new Set(rows.map(r => r.brand).filter(Boolean) as string[])).sort(),
    [rows],
  );
  const categories = useMemo(
    () => Array.from(new Set(rows.map(r => r.category).filter(Boolean) as string[])).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      if (brandFilter !== 'all' && r.brand !== brandFilter) return false;
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        (r.name || '').toLowerCase().includes(q) ||
        (r.product_code || '').toLowerCase().includes(q) ||
        (r.brand || '').toLowerCase().includes(q)
      );
    });
  }, [rows, query, brandFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [query, brandFilter, categoryFilter]);

  const patchLocal = (id: string, patch: Partial<Product>) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };

  const saveField = async (id: string, patch: Partial<Product>, original: Partial<Product>) => {
    // no-op if identical
    const changedKeys = Object.keys(patch) as (keyof Product)[];
    const isSame = changedKeys.every(k => (patch as any)[k] === (original as any)[k]);
    if (isSame) return;

    setSaving(s => ({ ...s, [id]: true }));
    const { error } = await supabase.from('catalog_products').update(patch).eq('id', id);
    setSaving(s => { const n = { ...s }; delete n[id]; return n; });
    if (error) {
      toast.error('Salvataggio fallito: ' + error.message);
      patchLocal(id, original); // revert
    } else {
      toast.success('Salvato');
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const toggleSelectAllPage = (checked: boolean) => {
    setSelected(prev => {
      const n = new Set(prev);
      paged.forEach(r => { if (checked) n.add(r.id); else n.delete(r.id); });
      return n;
    });
  };
  const allPageSelected = paged.length > 0 && paged.every(r => selected.has(r.id));

  const runBulk = async () => {
    if (selected.size === 0) { toast.error('Nessun prodotto selezionato'); return; }
    const ids = Array.from(selected);
    const affected = rows.filter(r => selected.has(r.id));

    // snapshot for undo
    const snapshot = affected.map(r => ({
      id: r.id,
      patch: {
        list_price: r.list_price,
        supplier_discount_percentage: r.supplier_discount_percentage,
        markup_percentage: r.markup_percentage,
        is_active: r.is_active,
      } as Partial<Product>,
    }));

    setBulkBusy(true);
    try {
      if (bulkOp === 'variation') {
        const pct = Number(bulkValue);
        if (!isFinite(pct)) throw new Error('Variazione non valida');
        // per-row update (values differ). Batch in parallel chunks of 20.
        const updates = affected.map(r => ({
          id: r.id,
          list_price: Number(((Number(r.list_price) || 0) * (1 + pct / 100)).toFixed(4)),
        }));
        for (let i = 0; i < updates.length; i += 20) {
          const chunk = updates.slice(i, i + 20);
          await Promise.all(chunk.map(u =>
            supabase.from('catalog_products').update({ list_price: u.list_price }).eq('id', u.id)
          ));
        }
        setRows(prev => prev.map(r => {
          const u = updates.find(x => x.id === r.id);
          return u ? { ...r, list_price: u.list_price } : r;
        }));
      } else if (bulkOp === 'discount') {
        const v = Number(bulkValue);
        if (!isFinite(v)) throw new Error('Valore non valido');
        const { error } = await supabase
          .from('catalog_products')
          .update({ supplier_discount_percentage: v })
          .in('id', ids);
        if (error) throw error;
        setRows(prev => prev.map(r => selected.has(r.id) ? { ...r, supplier_discount_percentage: v } : r));
      } else if (bulkOp === 'markup') {
        const v = Number(bulkValue);
        if (!isFinite(v)) throw new Error('Valore non valido');
        const { error } = await supabase
          .from('catalog_products')
          .update({ markup_percentage: v })
          .in('id', ids);
        if (error) throw error;
        setRows(prev => prev.map(r => selected.has(r.id) ? { ...r, markup_percentage: v } : r));
      } else if (bulkOp === 'active') {
        const v = bulkActive === 'true';
        const { error } = await supabase
          .from('catalog_products')
          .update({ is_active: v })
          .in('id', ids);
        if (error) throw error;
        setRows(prev => prev.map(r => selected.has(r.id) ? { ...r, is_active: v } : r));
      }
      setUndoStack(prev => [...prev, snapshot]);
      toast.success(`Bulk applicato a ${ids.length} prodotti`);
    } catch (e: any) {
      toast.error('Bulk fallito: ' + (e?.message || 'errore'));
    } finally {
      setBulkBusy(false);
    }
  };

  const undoLast = async () => {
    const last = undoStack[undoStack.length - 1];
    if (!last) return;
    setBulkBusy(true);
    try {
      for (let i = 0; i < last.length; i += 20) {
        const chunk = last.slice(i, i + 20);
        await Promise.all(chunk.map(u =>
          supabase.from('catalog_products').update(u.patch).eq('id', u.id)
        ));
      }
      setRows(prev => prev.map(r => {
        const u = last.find(x => x.id === r.id);
        return u ? { ...r, ...u.patch } as Product : r;
      }));
      setUndoStack(prev => prev.slice(0, -1));
      toast.success('Ultima azione annullata');
    } catch (e: any) {
      toast.error('Undo fallito: ' + (e?.message || 'errore'));
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1008]">Prezzi & Margini</h1>
        <p className="text-sm text-[#8A7060]">
          Modifica i prezzi uno per uno (click sulla cella) o applica variazioni in bulk.
          Ogni modifica viene registrata automaticamente nello storico.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-lg border p-3" style={{ borderColor: 'rgba(59,35,20,0.10)' }}>
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#B0998A]" />
          <Input placeholder="Cerca per codice, nome, brand…" value={query} onChange={e => setQuery(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="Brand" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i brand</SelectItem>
            {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="text-xs text-[#8A7060] ml-auto">
          {filtered.length} risultati · {selected.size} selezionati
        </div>
      </div>

      {/* Bulk bar */}
      <div className="flex flex-wrap gap-2 items-center bg-[#FEFCF6] border border-dashed border-[#C8A96E] rounded-lg p-3">
        <span className="text-xs font-semibold text-[#1A1008]">Azioni bulk sui selezionati:</span>
        <Select value={bulkOp} onValueChange={(v: any) => setBulkOp(v)}>
          <SelectTrigger className="h-9 w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="variation">Variazione % prezzo listino</SelectItem>
            <SelectItem value="discount">Imposta sconto fornitore %</SelectItem>
            <SelectItem value="markup">Imposta markup %</SelectItem>
            <SelectItem value="active">Attiva / Disattiva</SelectItem>
          </SelectContent>
        </Select>
        {bulkOp === 'active' ? (
          <Select value={bulkActive} onValueChange={(v: any) => setBulkActive(v)}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Attiva</SelectItem>
              <SelectItem value="false">Disattiva</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Input
            type="number"
            step="0.01"
            placeholder={bulkOp === 'variation' ? 'es. +5 o -10' : 'es. 30'}
            value={bulkValue}
            onChange={e => setBulkValue(e.target.value)}
            className="h-9 w-[140px]"
          />
        )}
        <Button onClick={runBulk} disabled={bulkBusy || selected.size === 0} size="sm">
          {bulkBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Applica'}
        </Button>
        <Button variant="outline" size="sm" onClick={undoLast} disabled={bulkBusy || undoStack.length === 0}>
          <Undo2 className="w-4 h-4 mr-1" /> Annulla ultima
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(59,35,20,0.10)' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allPageSelected} onCheckedChange={(c) => toggleSelectAllPage(!!c)} />
              </TableHead>
              <TableHead>Codice</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Listino €</TableHead>
              <TableHead className="text-right">Sconto forn. %</TableHead>
              <TableHead className="text-right">Markup %</TableHead>
              <TableHead className="text-right">Prezzo vendita</TableHead>
              <TableHead className="text-center">Attivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={10}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
              ))
            ) : paged.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="text-center py-10 text-[#8A7060]">Nessun prodotto</TableCell></TableRow>
            ) : paged.map(r => (
              <PriceRow
                key={r.id}
                row={r}
                selected={selected.has(r.id)}
                saving={!!saving[r.id]}
                onToggle={() => toggleSelect(r.id)}
                onSave={(patch, original) => saveField(r.id, patch, original)}
                onLocalPatch={(patch) => patchLocal(r.id, patch)}
              />
            ))}
          </TableBody>
        </Table>

        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'rgba(59,35,20,0.08)' }}>
            <span className="text-xs text-[#8A7060]">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} di {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={safePage === 1} onClick={() => setPage(p => p - 1)}>Prec</Button>
              <span className="text-xs text-[#8A7060]">{safePage} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}>Succ</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PriceRow({
  row, selected, saving, onToggle, onSave, onLocalPatch,
}: {
  row: Product;
  selected: boolean;
  saving: boolean;
  onToggle: () => void;
  onSave: (patch: Partial<Product>, original: Partial<Product>) => void;
  onLocalPatch: (patch: Partial<Product>) => void;
}) {
  const numField = (
    key: 'list_price' | 'supplier_discount_percentage' | 'markup_percentage',
    step = '0.01',
  ) => (
    <input
      type="number"
      step={step}
      value={row[key] ?? ''}
      onChange={(e) => onLocalPatch({ [key]: e.target.value === '' ? null : Number(e.target.value) } as any)}
      onBlur={(e) => {
        const v = e.target.value === '' ? null : Number(e.target.value);
        onSave({ [key]: v } as any, { [key]: row[key] } as any);
      }}
      className="w-24 text-right px-2 py-1 rounded border border-[rgba(59,35,20,0.12)] text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A96E]/40"
    />
  );

  return (
    <TableRow className={selected ? 'bg-[#FEFCF6]' : ''}>
      <TableCell><Checkbox checked={selected} onCheckedChange={onToggle} /></TableCell>
      <TableCell className="font-mono text-xs">{row.product_code || '—'}</TableCell>
      <TableCell className="text-[13px] max-w-[280px] truncate" title={row.name}>
        {row.name}
        {saving && <Loader2 className="w-3 h-3 animate-spin inline ml-2 text-[#C8A96E]" />}
      </TableCell>
      <TableCell className="text-[13px]">{row.brand || '—'}</TableCell>
      <TableCell className="text-[13px]">{row.category || '—'}</TableCell>
      <TableCell className="text-right">{numField('list_price')}</TableCell>
      <TableCell className="text-right">{numField('supplier_discount_percentage', '0.1')}</TableCell>
      <TableCell className="text-right">{numField('markup_percentage', '0.1')}</TableCell>
      <TableCell className="text-right text-[13px] font-semibold text-[#1A1008]">{euro(salePrice(row))}</TableCell>
      <TableCell className="text-center">
        <Checkbox
          checked={row.is_active}
          onCheckedChange={async (c) => {
            const v = !!c;
            onLocalPatch({ is_active: v });
            const { error } = await supabase.from('catalog_products').update({ is_active: v }).eq('id', row.id);
            if (error) {
              toast.error('Errore: ' + error.message);
              onLocalPatch({ is_active: !v });
            }
          }}
        />
      </TableCell>
    </TableRow>
  );
}
