import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { EVENT_LABELS, summarizeDay, formatHM, type TimeEntry } from '@/lib/timbrature';
import { reverseGeocode } from '@/lib/geo';

interface Worker {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
}

const monthOptions = () => {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ value: v, label: d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }) });
  }
  return out;
};

const AdminTimbrature = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerId, setWorkerId] = useState<string>('all');
  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('workers')
        .select('id,user_id,first_name,last_name')
        .not('user_id', 'is', null)
        .order('last_name');
      setWorkers((data as Worker[]) || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [year, m] = month.split('-').map(Number);
      const start = `${year}-${String(m).padStart(2, '0')}-01`;
      const endDate = new Date(year, m, 0);
      const end = `${year}-${String(m).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

      let q = supabase
        .from('worker_time_entries' as any)
        .select('*')
        .gte('event_date', start)
        .lte('event_date', end)
        .order('event_at', { ascending: true });

      if (workerId !== 'all') {
        const w = workers.find((x) => x.id === workerId);
        if (w?.user_id) q = q.eq('user_id', w.user_id);
      }

      const { data } = await q;
      setEntries((data as unknown as TimeEntry[]) || []);
      setLoading(false);
    })();
  }, [workerId, month, workers]);

  const workerByUserId = useMemo(() => {
    const m = new Map<string, Worker>();
    workers.forEach((w) => m.set(w.user_id, w));
    return m;
  }, [workers]);

  const grouped = useMemo(() => {
    const map = new Map<string, TimeEntry[]>();
    entries.forEach((e) => {
      const key = `${e.user_id}|${e.event_date}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return Array.from(map.entries()).map(([key, ev]) => {
      const [uid, date] = key.split('|');
      return { userId: uid, date, entries: ev, summary: summarizeDay(ev) };
    }).sort((a, b) => (a.date === b.date ? a.userId.localeCompare(b.userId) : b.date.localeCompare(a.date)));
  }, [entries]);

  const exportCSV = () => {
    const rows: string[] = [
      ['Data', 'Posatore', 'Prima timbratura', 'Ultima timbratura', 'Pausa (min)', 'Ore lavorate', 'Ore cantiere', 'Alert fuori-cantiere'].join(';'),
    ];
    grouped.forEach((g) => {
      const w = workerByUserId.get(g.userId);
      const name = w ? `${w.first_name} ${w.last_name}` : g.userId;
      const first = g.summary.firstAt ? new Date(g.summary.firstAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
      const last = g.summary.lastAt ? new Date(g.summary.lastAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
      const alerts = g.entries.filter((e) => e.site_id && e.is_at_site === false).length;
      rows.push([
        g.date,
        name,
        first,
        last,
        String(g.summary.pauseMinutes),
        (g.summary.workMinutes / 60).toFixed(2),
        (g.summary.siteMinutes / 60).toFixed(2),
        alerts > 0 ? `${alerts}` : '',
      ].join(';'));
    });
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timbrature-${month}${workerId !== 'all' ? '-' + workerId : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#1E1B4B]">Timbrature Posatori</h1>
          <p className="text-sm text-muted-foreground">Ore giornaliere con verifica GPS · export mensile per studio paghe</p>
        </div>
        <Button onClick={exportCSV} disabled={grouped.length === 0}>
          <Download className="w-4 h-4 mr-2" /> Esporta CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={workerId} onValueChange={setWorkerId}>
          <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i posatori</SelectItem>
            {workers.map((w) => (
              <SelectItem key={w.id} value={w.id}>{w.first_name} {w.last_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {monthOptions().map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="inline w-5 h-5 animate-spin" /></div>
      ) : grouped.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nessuna timbratura nel periodo selezionato.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {grouped.map((g) => {
            const w = workerByUserId.get(g.userId);
            const name = w ? `${w.first_name} ${w.last_name}` : 'Utente';
            const alerts = g.entries.filter((e) => e.site_id && e.is_at_site === false).length;
            const dateLabel = new Date(g.date).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' });
            return (
              <Card key={g.userId + g.date}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{name} <span className="text-muted-foreground font-normal">· {dateLabel}</span></span>
                    <div className="flex items-center gap-3 text-sm font-normal">
                      <span><b>{formatHM(g.summary.workMinutes)}</b> lavorate</span>
                      <span className="text-muted-foreground">Pausa {formatHM(g.summary.pauseMinutes)}</span>
                      {g.summary.siteMinutes > 0 && <span className="text-muted-foreground">Cantiere {formatHM(g.summary.siteMinutes)}</span>}
                      {alerts > 0 && (
                        <span className="inline-flex items-center gap-1 text-red-600 text-xs bg-red-50 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" /> {alerts} fuori cantiere
                        </span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {g.entries.map((e) => {
                      const meta = EVENT_LABELS[e.event_type];
                      const t = new Date(e.event_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                      const bad = e.site_id && e.is_at_site === false;
                      const gmap = e.latitude != null ? `https://www.google.com/maps/search/?api=1&query=${e.latitude},${e.longitude}` : null;
                      return (
                        <div key={e.id} className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${bad ? 'border-red-300 bg-red-50 text-red-700' : 'border-[#E5E2DD] bg-[#FAF7F2]'}`}>
                          <span>{meta.icon}</span>
                          <span>{meta.short}</span>
                          <span className="text-muted-foreground">{t}</span>
                          {gmap && (
                            <a href={gmap} target="_blank" rel="noreferrer" className="text-[#8B6F4E]"><MapPin className="w-3 h-3" /></a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminTimbrature;
