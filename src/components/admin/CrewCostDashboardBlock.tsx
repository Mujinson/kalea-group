import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, startOfYear } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DEFAULT_CREW_SETTINGS, workerDailyCost, workerMonthlyCost, type CrewSettings } from "@/lib/crewCosts";

const eur = (v: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v || 0);
const tot = (r: any) => ["labor", "fuel", "tolls", "meals", "hotel", "other"].reduce((s, k) => s + (Number(r[k]) || 0), 0);

const SETTINGS_FIELDS: [keyof CrewSettings, string][] = [
  ["origin", "Partenza furgone"], ["net_salary", "Netto operaio €/mese"], ["taxes", "Tasse €/mese"], ["cape", "Cape €/mese"],
  ["other_f24", "Altro F24 €/mese"], ["work_days_month", "Giorni lavorativi/mese"], ["fuel_l_100km", "Consumo furgone l/100km"],
  ["fuel_price", "Prezzo gasolio €/l"], ["lunch", "Pranzo €/persona"], ["dinner", "Cena €/persona"], ["hotel", "Albergo €/notte"],
  ["trasferta_km", "Trasferta da km (sola andata)"], ["reference_daily", "Media riferimento €/giorno"],
];

export default function CrewCostDashboardBlock() {
  const qc = useQueryClient();
  const [range, setRange] = useState<"month" | "year">("month");
  const [open, setOpen] = useState(false);
  const { data: settings } = useQuery({
    queryKey: ["crew-settings"],
    queryFn: async () => (await supabase.from("crew_cost_settings").select("*").limit(1).maybeSingle()).data as any,
  });
  const s: CrewSettings = { ...DEFAULT_CREW_SETTINGS, ...(settings || {}) };
  const [edit, setEdit] = useState<any>(null);

  const from = format(range === "month" ? startOfMonth(new Date()) : startOfYear(new Date()), "yyyy-MM-dd");
  const { data: rows = [] } = useQuery({
    queryKey: ["crew-daily", from],
    queryFn: async () => (await supabase.from("site_daily_costs").select("*, construction_sites(name)").eq("is_estimate", false).gte("work_date", from).order("work_date")).data || [],
  });

  const stats = useMemo(() => {
    const byDay = new Map<string, { day: string; costo: number; operai: number }>();
    rows.forEach((r: any) => {
      const d = byDay.get(r.work_date) || { day: r.work_date, costo: 0, operai: 0 };
      d.costo += tot(r); d.operai += Number(r.workers_count) || 0; byDay.set(r.work_date, d);
    });
    const days = [...byDay.values()];
    const total = days.reduce((a, d) => a + d.costo, 0);
    const wd = days.reduce((a, d) => a + d.operai, 0);
    return { days: days.map((d) => ({ ...d, label: format(new Date(d.day), "dd/MM") })), total, perCrewDay: days.length ? total / days.length : 0, perWorkerDay: wd ? total / wd : 0 };
  }, [rows]);

  const save = async () => {
    const payload = { ...edit }; delete payload.id;
    const { error } = settings?.id
      ? await supabase.from("crew_cost_settings").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", settings.id)
      : await supabase.from("crew_cost_settings").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Impostazioni salvate"); setOpen(false); qc.invalidateQueries({ queryKey: ["crew-settings"] });
  };

  const card = "p-4 rounded-xl border bg-card min-w-0";
  return (
    <div className="rounded-2xl border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm font-semibold">Costo squadra</div>
        <div className="flex gap-2">
          <Button size="sm" variant={range === "month" ? "default" : "outline"} onClick={() => setRange("month")}>Mese</Button>
          <Button size="sm" variant={range === "year" ? "default" : "outline"} onClick={() => setRange("year")}>Anno</Button>
          <Button size="sm" variant="outline" onClick={() => { setEdit({ ...s, id: settings?.id }); setOpen(true); }}>Impostazioni costi</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className={card}><div className="text-xs text-muted-foreground">Costo fisso operaio</div><div className="text-lg font-semibold">{eur(workerMonthlyCost(s))}/mese</div><div className="text-xs text-muted-foreground">{eur(workerDailyCost(s))} al giorno</div></div>
        <div className={card}><div className="text-xs text-muted-foreground">Media per operaio/giorno</div><div className="text-lg font-semibold">{eur(stats.perWorkerDay)}</div><div className="text-xs text-muted-foreground">riferimento {eur(s.reference_daily)}</div></div>
        <div className={card}><div className="text-xs text-muted-foreground">Media squadra/giorno</div><div className="text-lg font-semibold">{eur(stats.perCrewDay)}</div></div>
        <div className={card}><div className="text-xs text-muted-foreground">Giorni registrati</div><div className="text-lg font-semibold">{stats.days.length}</div></div>
        <div className={card}><div className="text-xs text-muted-foreground">Totale periodo</div><div className="text-lg font-semibold">{eur(stats.total)}</div></div>
      </div>
      {stats.days.length ? (
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.days}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" fontSize={11} /><YAxis fontSize={11} />
              <Tooltip formatter={(v: number) => eur(v)} /><Bar dataKey="costo" name="Costo giorno" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      ) : <div className="text-sm text-muted-foreground">Nessun costo reale registrato nel periodo. Si inseriscono dal cantiere, scheda "Costi squadra".</div>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Impostazioni costi squadra</DialogTitle></DialogHeader>
          {edit && <div className="grid grid-cols-2 gap-3">
            {SETTINGS_FIELDS.map(([k, l]) => (
              <label key={k} className="text-xs text-muted-foreground space-y-1">{l}
                <Input type={k === "origin" ? "text" : "number"} step="0.01" value={edit[k] ?? ""} onChange={(e) => setEdit({ ...edit, [k]: k === "origin" ? e.target.value : Number(e.target.value) })} />
              </label>
            ))}
          </div>}
          <Button onClick={save}>Salva</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
