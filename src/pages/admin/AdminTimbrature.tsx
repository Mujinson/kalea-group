import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, MapPin, AlertTriangle, Loader2, CheckCircle2, HelpCircle, FileText, Pencil, Trash2, Plus } from 'lucide-react';
import { EVENT_LABELS, summarizeDay, formatHM, dayStages, formatTime, STAGE_ORDER, type TimeEntry, type TimbratureEventType } from '@/lib/timbrature';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { reverseGeocode } from '@/lib/geo';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<null | {
    id?: string;
    user_id: string;
    event_date: string;
    event_type: TimbratureEventType;
    time: string;
  }>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const eventAt = new Date(`${editing.event_date}T${editing.time}:00`).toISOString();
      if (editing.id) {
        const { error } = await supabase
          .from('worker_time_entries' as any)
          .update({ event_type: editing.event_type, event_at: eventAt })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const worker = workers.find((w) => w.user_id === editing.user_id);
        const { error } = await supabase.from('worker_time_entries' as any).insert({
          user_id: editing.user_id,
          worker_id: worker?.id ?? null,
          event_type: editing.event_type,
          event_at: eventAt,
          event_date: editing.event_date,
        });
        if (error) throw error;
      }
      toast.success('Timbratura salvata');
      setEditing(null);
      setReloadKey((k) => k + 1);
    } catch (e: any) {
      toast.error('Errore: ' + (e?.message || 'salvataggio non riuscito'));
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Eliminare questa timbratura?')) return;
    const { error } = await supabase.from('worker_time_entries' as any).delete().eq('id', id);
    if (error) return toast.error('Errore: ' + error.message);
    toast.success('Timbratura eliminata');
    setEditing(null);
    setReloadKey((k) => k + 1);
  };


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
      let start: string;
      let end: string;
      if (fromDate && toDate) {
        start = fromDate;
        end = toDate;
      } else {
        const [year, m] = month.split('-').map(Number);
        start = `${year}-${String(m).padStart(2, '0')}-01`;
        const endDate = new Date(year, m, 0);
        end = `${year}-${String(m).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      }

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
      const rows = (data as unknown as TimeEntry[]) || [];
      setEntries(rows);
      setLoading(false);

      rows.forEach(async (e) => {
        if (e.latitude == null || e.longitude == null) return;
        const address = await reverseGeocode(e.latitude, e.longitude);
        if (address) {
          setAddresses((prev) => ({ ...prev, [e.id]: address }));
        }
      });
    })();
  }, [workerId, month, fromDate, toDate, workers, reloadKey]);

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
      return { userId: uid, date, entries: ev, summary: summarizeDay(ev), stages: dayStages(ev) };
    }).sort((a, b) => (a.date === b.date ? a.userId.localeCompare(b.userId) : b.date.localeCompare(a.date)));
  }, [entries]);

  const periodLabel = () => {
    if (fromDate && toDate) return `${fromDate} → ${toDate}`;
    return month;
  };

  const completedCount = grouped.filter((g) => g.stages.isComplete).length;

  const buildRows = () =>
    grouped.map((g) => {
      const w = workerByUserId.get(g.userId);
      const name = w ? `${w.first_name} ${w.last_name}` : g.userId;
      const first = g.summary.firstAt ? new Date(g.summary.firstAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
      const last = g.summary.lastAt ? new Date(g.summary.lastAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
      const alerts = g.entries.filter((e) => e.site_id && e.is_at_site === false).length;
      return {
        date: g.date,
        name,
        status: g.stages.isComplete ? 'Completato' : 'Incompleto',
        stageTimes: STAGE_ORDER.map((t) => formatTime(g.stages.stages[t].firstAt)),
        first,
        last,
        pause: String(g.summary.pauseMinutes),
        work: (g.summary.workMinutes / 60).toFixed(2),
        site: (g.summary.siteMinutes / 60).toFixed(2),
        alerts: alerts > 0 ? String(alerts) : '',
      };
    });

  const totalWorkHours = grouped.reduce((s, g) => s + g.summary.workMinutes / 60, 0);

  const stageHeaders = STAGE_ORDER.map((t) => EVENT_LABELS[t].short);

  const exportCSV = () => {
    const header = ['Data', 'Posatore', 'Stato', ...stageHeaders, 'Pausa (min)', 'Ore lavorate', 'Ore cantiere', 'Alert fuori-cantiere'];
    const lines = [header.join(';')];
    buildRows().forEach((r) => {
      lines.push([r.date, r.name, r.status, ...r.stageTimes, r.pause, r.work, r.site, r.alerts].join(';'));
    });
    lines.push(['TOTALE', '', '', ...stageHeaders.map(() => ''), '', totalWorkHours.toFixed(2), '', ''].join(';'));
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timbrature-${periodLabel()}${workerId !== 'all' ? '-' + workerId : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('Report Timbrature Posatori', 14, 15);
    doc.setFontSize(10);
    const wName = workerId === 'all' ? 'Tutti i posatori' : (() => {
      const w = workers.find((x) => x.id === workerId);
      return w ? `${w.first_name} ${w.last_name}` : '';
    })();
    doc.text(`Periodo: ${periodLabel()}  ·  ${wName}  ·  Completati ${completedCount}/${grouped.length}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Data', 'Posatore', 'Stato', ...stageHeaders, 'Pausa', 'Ore lav.', 'Ore cant.', 'Alert']],
      body: buildRows().map((r) => [r.date, r.name, r.status, ...r.stageTimes, r.pause, r.work, r.site, r.alerts]),
      foot: [['TOTALE', '', '', ...stageHeaders.map(() => ''), '', totalWorkHours.toFixed(2), '', '']],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 27, 75] },
      footStyles: { fillColor: [245, 240, 232], textColor: 30 },
    });

    doc.save(`timbrature-${periodLabel()}${workerId !== 'all' ? '-' + workerId : ''}.pdf`);
  };

  const clearRange = () => { setFromDate(''); setToDate(''); };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Timbrature Posatori</h1>
          <p className="text-sm text-muted-foreground">Ore giornaliere con verifica GPS · export per studio paghe</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={grouped.length === 0}>
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button onClick={exportPDF} disabled={grouped.length === 0}>
            <FileText className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 p-3 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC]">
        <div>
          <Label className="text-xs text-muted-foreground">Posatore</Label>
          <Select value={workerId} onValueChange={setWorkerId}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i posatori</SelectItem>
              {workers.map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.first_name} {w.last_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Mese</Label>
          <Select value={month} onValueChange={(v) => { setMonth(v); clearRange(); }}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {monthOptions().map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Da</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-[160px]" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">A</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-[160px]" />
          </div>
          {(fromDate || toDate) && (
            <Button variant="ghost" size="sm" onClick={clearRange}>Reset</Button>
          )}
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          Giornate complete: <b className="text-[#0F172A]">{completedCount}/{grouped.length}</b>
          {' · '}Totale periodo: <b className="text-[#0F172A]">{totalWorkHours.toFixed(2)}h</b>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="inline w-5 h-5 animate-spin" /></div>
      ) : grouped.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nessuna timbratura nel periodo selezionato.</CardContent></Card>
      ) : (
      <Tabs defaultValue="riepilogo" className="space-y-3">
        <TabsList>
          <TabsTrigger value="riepilogo">Riepilogo giornaliero</TabsTrigger>
          <TabsTrigger value="dettaglio">Dettaglio timbrature</TabsTrigger>
        </TabsList>

        <TabsContent value="riepilogo">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Dipendente</TableHead>
                    <TableHead>Stato</TableHead>
                    {STAGE_ORDER.map((t) => (
                      <TableHead key={t} className="text-center whitespace-nowrap">
                        {EVENT_LABELS[t].icon} {EVENT_LABELS[t].short}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Ore lav.</TableHead>
                    <TableHead className="text-right">Pausa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grouped.map((g) => {
                    const w = workerByUserId.get(g.userId);
                    const name = w ? `${w.first_name} ${w.last_name}` : 'Utente';
                    const dateLabel = new Date(g.date).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' });
                    return (
                      <TableRow key={'sum' + g.userId + g.date} className={g.stages.isComplete ? '' : 'bg-amber-50/60'}>
                        <TableCell className="whitespace-nowrap">{dateLabel}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{name}</TableCell>
                        <TableCell>
                          {g.stages.isComplete ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Completato
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded"
                              title={`Mancano: ${g.stages.missing.map((t) => EVENT_LABELS[t].short).join(', ')}`}
                            >
                              <AlertTriangle className="w-3 h-3" /> Incompleto
                            </span>
                          )}
                        </TableCell>
                        {STAGE_ORDER.map((t) => {
                          const s = g.stages.stages[t];
                          const required = ['start_home', 'arrive_site', 'leave_site', 'arrive_home'].includes(t);
                          return (
                            <TableCell
                              key={t}
                              className={`text-center text-xs whitespace-nowrap ${s.count === 0 ? (required ? 'text-red-600' : 'text-muted-foreground') : ''}`}
                            >
                              {formatTime(s.firstAt)}
                              {s.count > 1 && <span className="text-[10px] text-muted-foreground"> ×{s.count}</span>}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right whitespace-nowrap">{formatHM(g.summary.workMinutes)}</TableCell>
                        <TableCell className="text-right whitespace-nowrap text-muted-foreground">{formatHM(g.summary.pauseMinutes)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dettaglio">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {g.entries.map((e) => {
                      const meta = EVENT_LABELS[e.event_type];
                      const t = new Date(e.event_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                      const gmap = e.latitude != null ? `https://www.google.com/maps/search/?api=1&query=${e.latitude},${e.longitude}` : null;
                      const address = addresses[e.id];
                      const isOpen = !!openMap[e.id];

                      let confirmBadge: { icon: JSX.Element; text: string; cls: string } | null = null;
                      if (e.site_id && e.is_at_site === true) {
                        confirmBadge = { icon: <CheckCircle2 className="w-3 h-3" />, text: `Vicino cantiere${e.distance_from_site_m != null ? ` (${e.distance_from_site_m}m)` : ''}`, cls: 'text-green-700 bg-green-50 border-green-200' };
                      } else if (e.site_id && e.is_at_site === false) {
                        confirmBadge = { icon: <AlertTriangle className="w-3 h-3" />, text: `Fuori cantiere${e.distance_from_site_m != null ? ` (${e.distance_from_site_m}m)` : ''}`, cls: 'text-red-700 bg-red-50 border-red-200' };
                      } else if (e.latitude == null) {
                        confirmBadge = { icon: <HelpCircle className="w-3 h-3" />, text: 'GPS non disponibile', cls: 'text-amber-700 bg-amber-50 border-amber-200' };
                      }

                      const bad = e.site_id && e.is_at_site === false;
                      const bbox = e.latitude != null && e.longitude != null
                        ? `${e.longitude - 0.003},${e.latitude - 0.002},${e.longitude + 0.003},${e.latitude + 0.002}`
                        : null;

                      return (
                        <div key={e.id} className={`text-xs p-2 rounded border ${bad ? 'border-red-300 bg-red-50' : 'border-[#E5E7EB] bg-[#F8FAFC]'}`}>
                          <div className="flex items-center gap-1">
                            <span>{meta.icon}</span>
                            <span className="font-medium">{meta.short}</span>
                            <span className="text-muted-foreground">{t}</span>
                            {gmap && (
                              <a href={gmap} target="_blank" rel="noreferrer" className="text-[#8B6F4E] ml-auto" title="Apri in Google Maps">
                                <MapPin className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {address && (
                            <div className="text-[11px] text-[#64748B] mt-1 leading-tight line-clamp-2">
                              {address}
                            </div>
                          )}
                          {confirmBadge && (
                            <div className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded border text-[10px] ${confirmBadge.cls}`}>
                              {confirmBadge.icon}
                              <span>{confirmBadge.text}</span>
                            </div>
                          )}
                          {bbox && (
                            <>
                              <button
                                onClick={() => setOpenMap((p) => ({ ...p, [e.id]: !p[e.id] }))}
                                className="text-[10px] text-[#8B6F4E] hover:underline mt-1 block"
                              >
                                {isOpen ? '▲ Nascondi mappa' : '▼ Mostra mappa'}
                              </button>
                              {isOpen && (
                                <iframe
                                  loading="lazy"
                                  title={`map-${e.id}`}
                                  className="w-full h-32 mt-1 rounded border border-[#E5E7EB]"
                                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${e.latitude},${e.longitude}`}
                                />
                              )}
                            </>
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
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
};

export default AdminTimbrature;
