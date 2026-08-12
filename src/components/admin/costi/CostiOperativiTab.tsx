import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/admin/DataTable';
import { StatusPill } from '@/components/admin/crm-ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fmtEur, fmtDateIt, categoryLabel } from '@/lib/finance';

interface Row {
  id: string;
  date: string | null;
  description: string;
  category: string;
  amount: number;
  source: 'Costo variabile' | 'Spesa cantiere';
  siteId?: string | null;
  siteName?: string | null;
  isPaid: boolean;
}

export function CostiOperativiTab() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('all');
  const [site, setSite] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['costi-operativi'],
    queryFn: async (): Promise<Row[]> => {
      const [v, e] = await Promise.all([
        supabase.from('variable_costs').select('id, description, category, amount, cost_date, is_paid'),
        supabase.from('site_expenses').select('id, description, expense_type, amount, expense_date, is_paid, site_id, construction_sites(title)'),
      ]);
      if (v.error) throw v.error;
      if (e.error) throw e.error;
      const rows: Row[] = [];
      (v.data || []).forEach((r: any) => rows.push({
        id: `v-${r.id}`, date: r.cost_date, description: r.description, category: r.category,
        amount: Number(r.amount || 0), source: 'Costo variabile', isPaid: !!r.is_paid,
      }));
      (e.data || []).forEach((r: any) => rows.push({
        id: `e-${r.id}`, date: r.expense_date, description: r.description, category: r.expense_type,
        amount: Number(r.amount || 0), source: 'Spesa cantiere', isPaid: !!r.is_paid,
        siteId: r.site_id, siteName: r.construction_sites?.title || null,
      }));
      return rows.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    },
  });

  const categories = useMemo(() => Array.from(new Set((data || []).map((r) => r.category).filter(Boolean))), [data]);
  const sites = useMemo(() => {
    const m = new Map<string, string>();
    (data || []).forEach((r) => { if (r.siteId) m.set(r.siteId, r.siteName || r.siteId); });
    return Array.from(m.entries());
  }, [data]);

  const rows = useMemo(() => (data || []).filter((r) => {
    if (from && (r.date || '') < from) return false;
    if (to && (r.date || '') > to) return false;
    if (category !== 'all' && r.category !== category) return false;
    if (site !== 'all' && r.siteId !== site) return false;
    return true;
  }), [data, from, to, category, site]);

  const total = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div><Label>Dal</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><Label>Al</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div>
          <Label>Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{categoryLabel(c)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Cantiere</Label>
          <Select value={site} onValueChange={setSite}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              {sites.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={rows}
        loading={isLoading}
        searchPlaceholder="Cerca costo…"
        searchKeys={['description', 'category', 'siteName']}
        emptyTitle="Nessun costo"
        emptyDescription="Non ci sono costi variabili o spese di cantiere nel periodo."
        columns={[
          { key: 'date', header: 'Data', sortable: true, cell: (r) => fmtDateIt(r.date) },
          { key: 'description', header: 'Descrizione', sortable: true, cell: (r) => <span className="font-medium">{r.description}</span> },
          { key: 'category', header: 'Categoria', sortable: true, cell: (r) => categoryLabel(r.category) },
          {
            key: 'source', header: 'Origine',
            cell: (r) => <StatusPill size="sm" tone={r.source === 'Spesa cantiere' ? 'teal' : 'slate'}>{r.source}</StatusPill>,
          },
          {
            key: 'siteName', header: 'Cantiere',
            cell: (r) => r.siteId
              ? <Link to={`/admin/cantieri/${r.siteId}`} className="text-crm-primary hover:underline" onClick={(e) => e.stopPropagation()}>{r.siteName}</Link>
              : '—',
          },
          {
            key: 'isPaid', header: 'Stato',
            cell: (r) => <StatusPill size="sm" tone={r.isPaid ? 'success' : 'warning'}>{r.isPaid ? 'Pagato' : 'Da pagare'}</StatusPill>,
          },
          { key: 'amount', header: 'Importo', sortable: true, className: 'text-right font-semibold', accessor: (r) => r.amount, cell: (r) => fmtEur(r.amount) },
        ]}
      />

      <div className="text-right text-sm font-semibold">Totale periodo: {fmtEur(total)}</div>
    </div>
  );
}

export default CostiOperativiTab;
