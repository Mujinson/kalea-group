import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Wallet, Check, Download, Square, CheckSquare } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const eur = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n || 0);

interface Row {
  id: string;
  user_id: string;
  customer_name: string | null;
  base_amount: number;
  percentage: number;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  user_name?: string;
}

const AdminCommissions = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'paid' | 'all'>('pending');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [working, setWorking] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('commissions').select('*').order('created_at', { ascending: false }).limit(500);
    if (filter === 'pending') q = q.eq('status', 'da_liquidare');
    else if (filter === 'paid') q = q.eq('status', 'liquidata');
    const { data } = await q;
    const list = (data || []) as Row[];

    const ids = Array.from(new Set(list.map((r) => r.user_id)));
    if (ids.length) {
      const [{ data: sp }, { data: wk }] = await Promise.all([
        supabase.from('salespeople').select('user_id, first_name, last_name').in('user_id', ids),
        supabase.from('workers').select('user_id, first_name, last_name').in('user_id', ids),
      ]);
      const m = new Map<string, string>();
      (sp || []).forEach((s: any) => m.set(s.user_id, `${s.first_name} ${s.last_name}`));
      (wk || []).forEach((w: any) => { if (!m.has(w.user_id)) m.set(w.user_id, `${w.first_name} ${w.last_name}`); });
      list.forEach((r) => { r.user_name = m.get(r.user_id) || r.user_id.slice(0, 8); });
    }
    setRows(list);
    setSelected(new Set());
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const grouped = useMemo(() => {
    const m = new Map<string, { name: string; rows: Row[]; pending: number; paid: number }>();
    rows.forEach((r) => {
      const key = r.user_id;
      if (!m.has(key)) m.set(key, { name: r.user_name || '—', rows: [], pending: 0, paid: 0 });
      const g = m.get(key)!;
      g.rows.push(r);
      const amt = Number(r.amount || 0);
      if (r.status === 'liquidata') g.paid += amt;
      else g.pending += amt;
    });
    return Array.from(m.values()).sort((a, b) => b.pending - a.pending);
  }, [rows]);

  const totalPending = rows.filter((r) => r.status === 'da_liquidare').reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalSelected = rows.filter((r) => selected.has(r.id)).reduce((s, r) => s + Number(r.amount || 0), 0);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleGroup = (g: { rows: Row[] }) => {
    const next = new Set(selected);
    const pendingIds = g.rows.filter((r) => r.status === 'da_liquidare').map((r) => r.id);
    const allSelected = pendingIds.every((id) => next.has(id));
    if (allSelected) pendingIds.forEach((id) => next.delete(id));
    else pendingIds.forEach((id) => next.add(id));
    setSelected(next);
  };

  const liquidate = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Liquidare ${selected.size} commissioni per ${eur(totalSelected)}?`)) return;
    setWorking(true);
    const { error } = await supabase
      .from('commissions')
      .update({ status: 'liquidata', paid_at: new Date().toISOString().slice(0, 10) })
      .in('id', Array.from(selected));
    setWorking(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${selected.size} commissioni liquidate`);
    load();
  };

  const exportGroupPdf = (g: { name: string; rows: Row[]; pending: number; paid: number }) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Commissioni — ${g.name}`, 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generato il ${new Date().toLocaleDateString('it-IT')}`, 14, 25);
    doc.setTextColor(0);
    autoTable(doc, {
      startY: 32,
      head: [['Data', 'Cliente', 'Base', '%', 'Importo', 'Stato', 'Pagata il']],
      body: g.rows.map((r) => [
        new Date(r.created_at).toLocaleDateString('it-IT'),
        r.customer_name || '—',
        eur(Number(r.base_amount || 0)),
        `${Number(r.percentage || 0)}%`,
        eur(Number(r.amount || 0)),
        r.status,
        r.paid_at ? new Date(r.paid_at).toLocaleDateString('it-IT') : '—',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 27, 75] },
    });
    const y = (doc as any).lastAutoTable.finalY + 8;
    doc.text(`Da liquidare: ${eur(g.pending)}`, 14, y);
    doc.text(`Liquidate: ${eur(g.paid)}`, 14, y + 6);
    doc.save(`commissioni-${g.name.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-foreground/70" />
          <h1 className="text-xl font-semibold">Commissioni</h1>
        </div>
        <div className="flex gap-2">
          {(['pending', 'paid', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 h-9 rounded-md text-sm ${filter === f ? 'bg-foreground text-background' : 'border border-border'}`}
            >
              {f === 'pending' ? 'Da liquidare' : f === 'paid' ? 'Liquidate' : 'Tutte'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="border border-border rounded-xl p-4 bg-card">
          <div className="text-xs uppercase text-muted-foreground">Totale da liquidare</div>
          <div className="text-2xl font-semibold mt-1 text-amber-600">{eur(totalPending)}</div>
        </div>
        <div className="border border-border rounded-xl p-4 bg-card">
          <div className="text-xs uppercase text-muted-foreground">Selezionato</div>
          <div className="text-2xl font-semibold mt-1">{eur(totalSelected)}</div>
        </div>
        <div className="border border-border rounded-xl p-4 bg-card flex items-center">
          <button
            onClick={liquidate}
            disabled={selected.size === 0 || working}
            className="w-full h-10 rounded-md bg-emerald-600 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Liquida selezionate ({selected.size})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : grouped.length === 0 ? (
        <div className="border border-border rounded-xl p-8 text-center text-muted-foreground">Nessuna commissione</div>
      ) : (
        <div className="space-y-4">
          {grouped.map((g) => {
            const pendingIds = g.rows.filter((r) => r.status === 'da_liquidare').map((r) => r.id);
            const allSelected = pendingIds.length > 0 && pendingIds.every((id) => selected.has(id));
            return (
              <div key={g.name} className="border border-border rounded-xl bg-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-3">
                    {pendingIds.length > 0 && (
                      <button onClick={() => toggleGroup(g)} className="text-foreground/70">
                        {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    )}
                    <div>
                      <div className="font-semibold">{g.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {g.rows.length} righe · Da liquidare {eur(g.pending)} · Liquidate {eur(g.paid)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => exportGroupPdf(g)}
                    className="text-xs inline-flex items-center gap-1 px-2 h-8 border border-border rounded-md"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="w-8"></th>
                      <th className="text-left px-4 py-2">Data</th>
                      <th className="text-left px-4 py-2">Cliente</th>
                      <th className="text-right px-4 py-2">Base</th>
                      <th className="text-right px-4 py-2">%</th>
                      <th className="text-right px-4 py-2">Importo</th>
                      <th className="text-left px-4 py-2">Stato</th>
                      <th className="text-left px-4 py-2">Pagata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r) => {
                      const pend = r.status === 'da_liquidare';
                      return (
                        <tr key={r.id} className="border-t border-border">
                          <td className="px-3">
                            {pend && (
                              <button onClick={() => toggle(r.id)} className="text-foreground/70">
                                {selected.has(r.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-2">{new Date(r.created_at).toLocaleDateString('it-IT')}</td>
                          <td className="px-4 py-2">{r.customer_name || '—'}</td>
                          <td className="px-4 py-2 text-right">{eur(Number(r.base_amount || 0))}</td>
                          <td className="px-4 py-2 text-right">{Number(r.percentage || 0)}%</td>
                          <td className="px-4 py-2 text-right font-semibold">{eur(Number(r.amount || 0))}</td>
                          <td className="px-4 py-2">
                            <span
                              className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                              style={{ background: pend ? '#F59E0B' : '#16A34A' }}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {r.paid_at ? new Date(r.paid_at).toLocaleDateString('it-IT') : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCommissions;
