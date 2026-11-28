import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fmtEur } from '@/lib/finance';
import type { AttendanceDecision, SiteAttendanceDay } from '@/lib/siteEconomics';
import { Check, ChevronUp, MapPin, Plus, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';

interface SiteAttendancePanelProps {
  siteId: string;
  days: SiteAttendanceDay[];
  allWorkerDays: SiteAttendanceDay[];
  hasSiteCoords: boolean;
}

const fmtDateIt = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

const fmtDistance = (m: number | null) => {
  if (m === null) return 'Nessun GPS';
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
};

export function SiteAttendancePanel({ siteId, days, allWorkerDays, hasSiteCoords }: SiteAttendancePanelProps) {
  const qc = useQueryClient();
  const [showOther, setShowOther] = useState(false);

  const setDecision = useMutation({
    mutationFn: async ({ workerId, workDate, decision }: { workerId: string; workDate: string; decision: AttendanceDecision | null }) => {
      if (decision === null) {
        const { error } = await supabase
          .from('site_attendance_overrides')
          .delete()
          .eq('site_id', siteId)
          .eq('worker_id', workerId)
          .eq('work_date', workDate);
        if (error) throw error;
        return;
      }
      const { data: authData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('site_attendance_overrides')
        .upsert(
          {
            site_id: siteId,
            worker_id: workerId,
            work_date: workDate,
            decision,
            decided_by: authData.user?.id ?? null,
          },
          { onConflict: 'site_id,worker_id,work_date' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-economics', siteId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Errore nel salvataggio della spunta');
    },
  });

  const relevantKeys = new Set(days.map((d) => d.key));
  const otherDays = allWorkerDays.filter((d) => !relevantKeys.has(d.key) && d.workerId);
  const includedCount = days.filter((d) => d.included).length;
  const excludedCount = days.filter((d) => d.status === 'esclusa').length;

  return (
    <div className="border-t pt-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Giornate operai (entro 3 km)</span>
          <span className="text-muted-foreground font-normal">
            {includedCount} incluse{excludedCount > 0 ? `, ${excludedCount} escluse` : ''}
          </span>
        </div>
        {otherDays.length > 0 && (
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setShowOther((v) => !v)}>
            {showOther ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
            {showOther ? 'Chiudi altre giornate' : `Ammetti giornata fuori raggio (${otherDays.length})`}
          </Button>
        )}
      </div>

      {!hasSiteCoords && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
          Il cantiere non ha coordinate GPS: le giornate non possono essere rilevate automaticamente entro 3 km, puoi ammetterle manualmente.
        </p>
      )}

      {days.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nessuna presenza rilevata entro 3 km nelle timbrature del periodo.</p>
      ) : (
        <div className="divide-y rounded-md border bg-slate-50/50">
          {days.map((d) => (
            <div key={d.key} className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-2 text-xs">
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`font-medium ${d.included ? 'text-foreground' : 'line-through text-muted-foreground'}`}>
                    {d.workerName}
                  </span>
                  <span className="text-muted-foreground">· {fmtDateIt(d.workDate)}</span>
                  {d.status === 'gps' && <Badge variant="secondary" className="text-[10px] py-0">GPS</Badge>}
                  {d.status === 'ammessa' && <Badge className="text-[10px] py-0 bg-green-600 text-white hover:bg-green-600">Ammessa</Badge>}
                  {d.status === 'esclusa' && <Badge variant="destructive" className="text-[10px] py-0">Esclusa</Badge>}
                  {d.status === 'fuori_raggio' && <Badge variant="outline" className="text-[10px] py-0">Fuori 3 km</Badge>}
                </div>
                <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>
                    {d.hours}h{d.overtimeHours > 0 ? ` (${d.regularHours}h + ${d.overtimeHours}h str.)` : ''}
                  </span>
                  <span>{fmtDistance(d.minDistanceM)}</span>
                  <span className={d.included ? 'font-medium text-foreground' : 'line-through'}>
                    {fmtEur(d.cost)}
                  </span>
                </div>
              </div>

              {d.workerId && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant={d.overrideDecision === 'ammessa' ? 'default' : 'outline'}
                    className="h-7 px-2 text-[11px]"
                    disabled={setDecision.isPending}
                    onClick={() =>
                      setDecision.mutate({
                        workerId: d.workerId!,
                        workDate: d.workDate,
                        decision: d.overrideDecision === 'ammessa' ? null : 'ammessa',
                      })
                    }
                  >
                    <Check className="w-3 h-3 mr-1" /> Ammetti
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={d.overrideDecision === 'esclusa' ? 'destructive' : 'outline'}
                    className="h-7 px-2 text-[11px]"
                    disabled={setDecision.isPending}
                    onClick={() =>
                      setDecision.mutate({
                        workerId: d.workerId!,
                        workDate: d.workDate,
                        decision: d.overrideDecision === 'esclusa' ? null : 'esclusa',
                      })
                    }
                  >
                    <X className="w-3 h-3 mr-1" /> Escludi
                  </Button>
                  {d.overrideDecision !== null && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-1.5 text-[11px]"
                      title="Ripristina regola GPS"
                      disabled={setDecision.isPending}
                      onClick={() =>
                        setDecision.mutate({ workerId: d.workerId!, workDate: d.workDate, decision: null })
                      }
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showOther && otherDays.length > 0 && (
        <div className="rounded-md border bg-white p-2 space-y-1.5">
          <p className="text-[11px] font-medium text-muted-foreground">
            Altre timbrature del periodo (fuori 3 km o senza GPS) — clicca Ammetti per includerle in questo cantiere:
          </p>
          <div className="max-h-48 overflow-y-auto divide-y">
            {otherDays.slice(0, 40).map((d) => (
              <div key={d.key} className="flex items-center justify-between gap-2 py-1.5 text-xs">
                <div className="min-w-0">
                  <span className="font-medium">{d.workerName}</span>
                  <span className="text-muted-foreground">
                    {' '}· {fmtDateIt(d.workDate)} · {d.hours}h · {fmtDistance(d.minDistanceM)}
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-[11px] shrink-0"
                  disabled={setDecision.isPending}
                  onClick={() =>
                    setDecision.mutate({ workerId: d.workerId!, workDate: d.workDate, decision: 'ammessa' })
                  }
                >
                  <Plus className="w-3 h-3 mr-1" /> Ammetti
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}