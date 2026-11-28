import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fmtEur } from '@/lib/finance';
import { TrendingUp } from 'lucide-react';
import { jobRevenue } from '@/lib/margin';
import { fetchAllRows } from '@/lib/fetchAllRows';
import {
  computeSiteEconomics,
  NORMAL_DAILY_RATE,
  resolveIsTravel,
  TRAVEL_DAILY_RATE,
  type AttendanceOverrideRow,
  type EconomicsOutcome,
  type TravelMode,
} from '@/lib/siteEconomics';
import { SiteAttendancePanel } from './SiteAttendancePanel';
import { toast } from 'sonner';

export const marginColor = (pct: number) => (pct >= 20 ? 'bg-green-500' : pct >= 0 ? 'bg-amber-500' : 'bg-red-500');

const OUTCOME_BADGE: Record<EconomicsOutcome, { label: string; className: string }> = {
  utile: { label: 'In utile', className: 'bg-green-600 text-white hover:bg-green-600' },
  perdita: { label: 'In perdita', className: 'bg-red-600 text-white hover:bg-red-600' },
  pari: { label: 'In pari', className: 'bg-slate-500 text-white hover:bg-slate-500' },
};

const OUTCOME_TEXT: Record<EconomicsOutcome, string> = {
  utile: 'text-green-600',
  perdita: 'text-red-600',
  pari: 'text-slate-600',
};

function addDaysIso(iso: string, delta: number): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function SiteEconomics({ siteId, budget }: { siteId: string; budget?: number | null }) {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['site-economics', siteId],
    queryFn: async () => {
      const [siteRes, invRes, psRes, matRes, expRes, workersRes, settingsRes, ovRes] = await Promise.all([
        supabase
          .from('construction_sites')
          .select('sale_id,quote_id,latitude,longitude,start_date,end_date,planned_start_date,planned_end_date,created_at,travel_mode')
          .eq('id', siteId)
          .maybeSingle(),
        supabase.from('customer_invoices').select('id,site_id,quote_id,subtotal,total,status,paid_amount,invoice_date,due_date,created_at'),
        supabase.from('payment_schedules').select('sale_id,invoice_id,amount,is_paid,paid_date,due_date,is_invoiced,invoiced_amount'),
        supabase.from('site_materials').select('total_cost,quantity,unit_cost').eq('site_id', siteId),
        supabase.from('site_expenses').select('amount,notes').eq('site_id', siteId),
        supabase.from('workers').select('id,user_id,first_name,last_name,hourly_cost'),
        supabase.from('crew_cost_settings').select('trasferta_km').limit(1).maybeSingle(),
        supabase.from('site_attendance_overrides').select('worker_id,work_date,decision,note').eq('site_id', siteId),
      ]);
      if (siteRes.error) throw siteRes.error;
      if (invRes.error) throw invRes.error;
      if (matRes.error) throw matRes.error;
      if (expRes.error) throw expRes.error;
      if (workersRes.error) throw workersRes.error;
      if (ovRes.error) throw ovRes.error;

      const site = siteRes.data;
      const todayIso = new Date().toISOString().slice(0, 10);
      const candidateStarts = [site?.start_date, site?.planned_start_date, site?.created_at?.slice(0, 10)].filter(Boolean) as string[];
      const earliest = candidateStarts.length > 0 ? candidateStarts.sort()[0]! : addDaysIso(todayIso, -180);
      const fromDate = addDaysIso(earliest, -30);
      const candidateEnds = [site?.end_date, site?.planned_end_date, todayIso].filter(Boolean) as string[];
      const latest = candidateEnds.sort().slice(-1)[0] || todayIso;
      const toDate = addDaysIso(latest, 14);

      const timeEntries = await fetchAllRows(
        supabase
          .from('worker_time_entries')
          .select('id,user_id,worker_id,event_type,event_at,event_date,latitude,longitude,accuracy_m,site_id,distance_from_site_m,is_at_site,notes')
          .gte('event_date', fromDate)
          .lte('event_date', toDate)
          .order('event_date', { ascending: false })
          .order('event_at', { ascending: true })
      );

      const revenue = jobRevenue(
        { siteId, saleId: site?.sale_id, quoteId: site?.quote_id },
        (invRes.data || []) as any[],
        (psRes.data || []) as any[]
      );

      const travelMode = ((site as any)?.travel_mode || 'auto') as TravelMode;
      const thresholdKm = Number(settingsRes.data?.trasferta_km || 150);
      const siteCoords = { lat: site?.latitude ?? null, lng: site?.longitude ?? null };
      const { isTravel, distanceFromOriginKm } = resolveIsTravel(travelMode, siteCoords, thresholdKm);

      const economics = computeSiteEconomics({
        siteId,
        revenue,
        materials: (matRes.data || []) as any[],
        expenses: (expRes.data || []) as any[],
        timeEntries: timeEntries as any[],
        workers: (workersRes.data || []) as any[],
        siteCoords,
        overrides: (ovRes.data || []) as AttendanceOverrideRow[],
        isTravel,
      });

      return {
        economics,
        travelMode,
        isTravel,
        distanceFromOriginKm,
        hasSiteCoords: site?.latitude != null && site?.longitude != null,
      };
    },
  });

  const updateTravelMode = useMutation({
    mutationFn: async (mode: TravelMode) => {
      const { error } = await supabase
        .from('construction_sites')
        .update({ travel_mode: mode })
        .eq('id', siteId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-economics', siteId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Errore aggiornamento trasferta');
    },
  });

  const eco = data?.economics;
  const revenue = eco?.revenue ?? 0;
  const totalCost = eco?.totalCost ?? 0;
  const margin = eco?.margin ?? 0;
  const marginPct = eco?.marginPct ?? 0;
  const outcome = eco?.outcome ?? 'pari';
  const outcomePlanned = eco?.outcomeWithPlanned ?? 'pari';
  const ratio = revenue > 0 ? Math.min(100, (totalCost / revenue) * 100) : 0;
  const budgetVal = Number(budget || 0);
  const travelMode = data?.travelMode ?? 'auto';
  const isTravel = data?.isTravel ?? false;
  const activeDailyRate = isTravel ? TRAVEL_DAILY_RATE : NORMAL_DAILY_RATE;

  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Economics commessa
            </CardTitle>
            {eco && <Badge className={OUTCOME_BADGE[outcome].className}>{OUTCOME_BADGE[outcome].label}</Badge>}
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground mr-1 hidden sm:inline">Tariffa:</span>
            {(['auto', 'off', 'on'] as TravelMode[]).map((mode) => {
              const label =
                mode === 'auto'
                  ? `Auto (${isTravel ? '350 €' : '260 €'})`
                  : mode === 'off'
                    ? 'Normale 260 €'
                    : 'Trasferta 350 €';
              return (
                <Button
                  key={mode}
                  type="button"
                  size="sm"
                  variant={travelMode === mode ? 'default' : 'outline'}
                  className="h-6 px-2 text-[11px]"
                  disabled={updateTravelMode.isPending}
                  onClick={() => updateTravelMode.mutate(mode)}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Ricavo netto</p>
            <p className="text-lg font-bold">{fmtEur(revenue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Materiali</p>
            <p className="text-lg font-bold text-orange-600">{fmtEur(eco?.materialsCost ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Manodopera ({activeDailyRate} €/g)</p>
            <p className="text-lg font-bold text-orange-600">{fmtEur(eco?.laborCost ?? 0)}</p>
            <p className="text-[11px] text-muted-foreground">
              {eco?.laborDaysCount ?? 0} gg · {eco?.regularHours ?? 0}h
              {(eco?.overtimeHours ?? 0) > 0 ? ` + ${eco?.overtimeHours}h str.` : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Spese sostenute</p>
            <p className="text-lg font-bold text-orange-600">{fmtEur(eco?.sustainedExpenses ?? 0)}</p>
            <p className="text-[11px] text-muted-foreground">{eco?.sustainedExpensesCount ?? 0} voci</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Spese previste</p>
            <p className="text-lg font-bold text-slate-600">{fmtEur(eco?.plannedExpenses ?? 0)}</p>
            <p className="text-[11px] text-muted-foreground">{eco?.plannedExpensesCount ?? 0} voci PREVISTO</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-md border bg-slate-50/70 p-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Margine attuale (senza previste)</p>
              <p className={`text-lg font-bold ${OUTCOME_TEXT[outcome]}`}>
                {fmtEur(margin)} <span className="text-xs font-medium">({marginPct.toFixed(1)}%)</span>
              </p>
            </div>
            <Badge className={OUTCOME_BADGE[outcome].className}>{OUTCOME_BADGE[outcome].label}</Badge>
          </div>
          <div className="flex items-center justify-between gap-2 sm:border-l sm:pl-3">
            <div>
              <p className="text-xs text-muted-foreground">Margine con spese previste incluse</p>
              <p className={`text-lg font-bold ${OUTCOME_TEXT[outcomePlanned]}`}>
                {fmtEur(eco?.marginWithPlanned ?? 0)}{' '}
                <span className="text-xs font-medium">({(eco?.marginWithPlannedPct ?? 0).toFixed(1)}%)</span>
              </p>
            </div>
            <Badge className={OUTCOME_BADGE[outcomePlanned].className}>{OUTCOME_BADGE[outcomePlanned].label}</Badge>
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div className={`h-full ${marginColor(marginPct)}`} style={{ width: `${ratio || (revenue === 0 && totalCost > 0 ? 100 : 0)}%` }} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>Costi sostenuti su ricavi: {revenue > 0 ? `${((totalCost / revenue) * 100).toFixed(1)}%` : '—'}</span>
          {data?.distanceFromOriginKm != null && (
            <span>Distanza da sede: {data.distanceFromOriginKm} km</span>
          )}
        </div>

        {budgetVal > 0 && (
          <p className="text-xs text-muted-foreground">
            Prezzo netto cantiere {fmtEur(budgetVal)} —{' '}
            <span className={totalCost <= budgetVal ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {totalCost <= budgetVal ? `sotto di ${fmtEur(budgetVal - totalCost)}` : `sopra di ${fmtEur(totalCost - budgetVal)}`}
            </span>
          </p>
        )}

        {eco && (
          <SiteAttendancePanel
            siteId={siteId}
            days={eco.days}
            allWorkerDays={eco.allWorkerDays}
            hasSiteCoords={data?.hasSiteCoords ?? false}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default SiteEconomics;
