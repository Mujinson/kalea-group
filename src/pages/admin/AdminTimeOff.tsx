import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, Loader2, CalendarOff } from 'lucide-react';

interface Row {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  kind: string;
  note: string | null;
  status: string;
  decision_note: string | null;
  created_at: string;
  user_name?: string;
}

const statusColor = (s: string) =>
  s === 'approved' ? '#16A34A' : s === 'rejected' ? '#DC2626' : '#EAB308';

const AdminTimeOff = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from('time_off_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (filter === 'pending') q = q.eq('status', 'pending');
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
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    const decision_note = status === 'rejected' ? (prompt('Motivo del rifiuto (opzionale):') || null) : null;
    const { error } = await supabase
      .from('time_off_requests')
      .update({ status, decided_at: new Date().toISOString(), decision_note })
      .eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === 'approved' ? 'Approvata' : 'Rifiutata');
    load();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarOff className="w-5 h-5 text-foreground/70" />
          <h1 className="text-xl font-semibold">Richieste ferie / indisponibilità</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 h-9 rounded-md text-sm ${filter === 'pending' ? 'bg-foreground text-background' : 'border border-border'}`}
          >
            Da approvare
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 h-9 rounded-md text-sm ${filter === 'all' ? 'bg-foreground text-background' : 'border border-border'}`}
          >
            Tutte
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <div className="border border-border rounded-xl p-8 text-center text-muted-foreground">
          Nessuna richiesta
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Utente</th>
                <th className="text-left px-4 py-2">Tipo</th>
                <th className="text-left px-4 py-2">Periodo</th>
                <th className="text-left px-4 py-2">Note</th>
                <th className="text-left px-4 py-2">Stato</th>
                <th className="text-right px-4 py-2">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{r.user_name}</td>
                  <td className="px-4 py-3 capitalize">{r.kind}</td>
                  <td className="px-4 py-3">
                    {new Date(r.start_date).toLocaleDateString('it-IT')} → {new Date(r.end_date).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-4 py-3 max-w-[260px] truncate text-muted-foreground">{r.note || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                      style={{ background: statusColor(r.status) }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === 'pending' ? (
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => decide(r.id, 'approved')}
                          className="inline-flex items-center gap-1 px-2 h-8 rounded-md bg-emerald-600 text-white text-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Approva
                        </button>
                        <button
                          onClick={() => decide(r.id, 'rejected')}
                          className="inline-flex items-center gap-1 px-2 h-8 rounded-md bg-red-600 text-white text-xs"
                        >
                          <X className="w-3.5 h-3.5" /> Rifiuta
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTimeOff;
