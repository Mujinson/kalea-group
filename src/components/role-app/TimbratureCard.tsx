import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';
import { Loader2, MapPin, AlertTriangle } from 'lucide-react';
import {
  EVENT_LABELS,
  nextEvents,
  recordTimbratura,
  summarizeDay,
  formatHM,
  todayKey,
  type TimbratureEventType,
  type TimeEntry,
} from '@/lib/timbrature';
import { reverseGeocode } from '@/lib/geo';

const TimbratureCard = () => {
  const { user } = useAdminAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<TimbratureEventType | null>(null);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [assignedSite, setAssignedSite] = useState<{ id: string; latitude: number | null; longitude: number | null; title: string } | null>(null);
  const [addresses, setAddresses] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user) return;
    const today = todayKey();
    const { data } = await supabase
      .from('worker_time_entries' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('event_date', today)
      .order('event_at', { ascending: true });
    const rows = (data as unknown as TimeEntry[]) || [];
    setEntries(rows);
    setLoading(false);

    // Resolve addresses for entries with coordinates
    rows.forEach(async (e) => {
      if (e.latitude == null || e.longitude == null) return;
      const address = await reverseGeocode(e.latitude, e.longitude);
      if (address) {
        setAddresses((prev) => ({ ...prev, [e.id]: address }));
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: w } = await supabase
        .from('workers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      setWorkerId(w?.id || null);

      const today = new Date().toISOString().slice(0, 10);
      const { data: a } = await supabase
        .from('site_workers')
        .select('site_id, construction_sites(id,title,latitude,longitude,start_date,end_date)')
        .eq('worker_user_id', user.id)
        .eq('is_active', true);
      const site = (a || [])
        .map((x: any) => x.construction_sites)
        .filter(Boolean)
        .find((s: any) =>
          (!s.start_date || s.start_date <= today) && (!s.end_date || s.end_date >= today)
        );
      if (site) {
        setAssignedSite({
          id: site.id,
          title: site.title,
          latitude: site.latitude ?? null,
          longitude: site.longitude ?? null,
        });
      }
      load();
    })();
  }, [user, load]);

  const lastType: TimbratureEventType | null = entries.length ? entries[entries.length - 1].event_type : null;
  const next = nextEvents(lastType);
  const summary = summarizeDay(entries);

  const handleClick = async (type: TimbratureEventType) => {
    if (!user) return;
    setBusy(type);
    try {
      const site = ['arrive_site', 'pause_start', 'pause_end', 'leave_site'].includes(type) ? assignedSite : null;
      const { gpsError } = await recordTimbratura({
        userId: user.id,
        eventType: type,
        workerId,
        site,
      });
      if (gpsError) toast.warning('Timbratura salvata senza GPS: ' + gpsError);
      else toast.success('Timbratura registrata');
      await load();
    } catch (e: any) {
      toast.error('Errore: ' + (e?.message || 'timbratura non salvata'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E2DD] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-[#1E1B4B]">Timbratura di oggi</h3>
          <p className="text-[12px] text-[#8C7B6B]">GPS attivo · le ore vengono calcolate in automatico</p>
        </div>
        {summary.workMinutes > 0 && (
          <div className="text-right">
            <div className="text-[20px] font-semibold text-[#1E1B4B] leading-none">{formatHM(summary.workMinutes)}</div>
            <div className="text-[11px] text-[#8C7B6B] mt-0.5">lavorate</div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4 text-[13px] text-[#8C7B6B]"><Loader2 className="w-4 h-4 inline animate-spin mr-1" /> Caricamento…</div>
      ) : (
        <>
          {/* Sequenza eventi */}
          {entries.length > 0 && (
            <div className="space-y-2 border-l-2 border-[#E5E2DD] pl-3 ml-1">
              {entries.map((e) => {
                const meta = EVENT_LABELS[e.event_type];
                const t = new Date(e.event_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                const bad = e.site_id && e.is_at_site === false;
                const address = addresses[e.id];
                return (
                  <div key={e.id}>
                    <div className="flex items-center gap-2 text-[13px]">
                      <span className="text-[15px]">{meta.icon}</span>
                      <span className="text-[#1E1B4B] font-medium">{meta.short}</span>
                      <span className="text-[#8C7B6B]">· {t}</span>
                      {e.latitude != null && (
                        <MapPin className="w-3 h-3 text-[#8B6F4E]" />
                      )}
                      {bad && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          Fuori cantiere ({Math.round(e.distance_from_site_m || 0)}m)
                        </span>
                      )}
                    </div>
                    {address && (
                      <div className="text-[11px] text-[#8C7B6B] pl-5 leading-tight mt-0.5">
                        {address}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pulsanti azione */}
          {next.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {next.map((n, idx) => {
                const meta = EVENT_LABELS[n];
                const primary = idx === 0;
                return (
                  <button
                    key={n}
                    disabled={busy !== null}
                    onClick={() => handleClick(n)}
                    className={`h-[56px] rounded-xl font-medium text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 ${
                      primary
                        ? 'bg-[#1E1B4B] text-white'
                        : 'border border-[#E5E2DD] text-[#1E1B4B] bg-[#FAF7F2]'
                    }`}
                  >
                    {busy === n ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-[18px]">{meta.icon}</span>}
                    {meta.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg bg-[#F0EDE7] p-3 text-center">
              <div className="text-[13px] text-[#1E1B4B] font-medium">✅ Giornata chiusa</div>
              <div className="text-[12px] text-[#6B6258] mt-1">
                Lavorate {formatHM(summary.workMinutes)} · Pausa {formatHM(summary.pauseMinutes)}
                {summary.siteMinutes > 0 ? ` · In cantiere ${formatHM(summary.siteMinutes)}` : ''}
              </div>
            </div>
          )}

          {!assignedSite && ['arrive_site', 'leave_site'].some((t) => next.includes(t as any)) && (
            <div className="text-[11px] text-[#8C7B6B] italic">
              Nessun cantiere assegnato oggi: la timbratura verrà salvata solo con la posizione GPS.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TimbratureCard;
