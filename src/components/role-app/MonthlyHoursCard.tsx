import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Loader2 } from 'lucide-react';
import { summarizeDay, formatHM, type TimeEntry } from '@/lib/timbrature';

const monthRange = (d = new Date()) => {
  const y = d.getFullYear();
  const m = d.getMonth();
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    start: `${y}-${pad(m + 1)}-01`,
    end: `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`,
    label: d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
  };
};

const MonthlyHoursCard = () => {
  const { user } = useAdminAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { start, end, label } = useMemo(() => monthRange(), []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('worker_time_entries' as any)
        .select('*')
        .eq('user_id', user.id)
        .gte('event_date', start)
        .lte('event_date', end)
        .order('event_at', { ascending: true });
      setEntries((data as unknown as TimeEntry[]) || []);
      setLoading(false);
    })();
  }, [user, start, end]);

  const days = useMemo(() => {
    const map = new Map<string, TimeEntry[]>();
    entries.forEach((e) => {
      if (!map.has(e.event_date)) map.set(e.event_date, []);
      map.get(e.event_date)!.push(e);
    });
    return Array.from(map.entries())
      .map(([date, ev]) => ({ date, summary: summarizeDay(ev) }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries]);

  const totals = days.reduce(
    (acc, d) => {
      const site = d.summary.siteMinutes;
      const travel = d.summary.travelMinutes;
      return { site: acc.site + site, travel: acc.travel + travel, work: acc.work + d.summary.workMinutes };
    },
    { site: 0, travel: 0, work: 0 }
  );

  return (
    <div className="bg-white rounded-xl border border-[#E5E2DD] p-5 space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[16px] font-semibold text-[#1E1B4B]">Le mie ore</h3>
        <span className="text-[12px] text-[#8C7B6B] capitalize">{label}</span>
      </div>

      {loading ? (
        <div className="text-center py-3 text-[13px] text-[#8C7B6B]">
          <Loader2 className="w-4 h-4 inline animate-spin mr-1" /> Caricamento…
        </div>
      ) : days.length === 0 ? (
        <div className="text-[13px] text-[#8C7B6B]">Nessuna timbratura questo mese.</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-[#F0EDE7] p-3 text-center">
              <div className="text-[18px] font-semibold text-[#1E1B4B] leading-none">{formatHM(totals.site)}</div>
              <div className="text-[11px] text-[#6B6258] mt-1">Cantiere</div>
            </div>
            <div className="rounded-lg bg-[#F0EDE7] p-3 text-center">
              <div className="text-[18px] font-semibold text-[#1E1B4B] leading-none">{formatHM(totals.travel)}</div>
              <div className="text-[11px] text-[#6B6258] mt-1">Viaggio</div>
            </div>
            <div className="rounded-lg bg-[#1E1B4B] p-3 text-center">
              <div className="text-[18px] font-semibold text-white leading-none">{formatHM(totals.work)}</div>
              <div className="text-[11px] text-white/70 mt-1">Totale mese</div>
            </div>
          </div>

          <div className="divide-y divide-[#EFEBE4]">
            {days.map((d) => {
              const dl = new Date(d.date).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' });
              return (
                <div key={d.date} className="flex items-center justify-between py-2 text-[13px]">
                  <span className="text-[#1E1B4B] capitalize">{dl}</span>
                  <span className="text-[#6B6258]">
                    🏗️ {formatHM(d.summary.siteMinutes)} · 🚐 {formatHM(d.summary.travelMinutes)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyHoursCard;
