import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { computeCrew, DEFAULT_CREW_SETTINGS, splitDaily } from "@/lib/crewCosts";

const eur = (v: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(v || 0);
const FIELDS = [["labor", "Operai"], ["fuel", "Gasolio"], ["tolls", "Telepass"], ["meals", "Pasti"], ["hotel", "Albergo"], ["other", "Altro"]] as const;
const rowTotal = (r: any) => FIELDS.reduce((s, [k]) => s + (Number(r[k]) || 0), 0);

export default function SiteDailyCostsPanel({ siteId, quoteId, startDate }: { siteId: string; quoteId?: string | null; startDate?: string | null }) {
  const qc = useQueryClient();
  const empty = { work_date: format(new Date(), "yyyy-MM-dd"), workers_count: 1, labor: 0, fuel: 0, tolls: 0, meals: 0, hotel: 0, other: 0, notes: "" };
  const [f, setF] = useState<any>(empty);
  const key = ["site-daily-costs", siteId];
  const { data: rows = [] } = useQuery({
    queryKey: key,
    queryFn: async () => (await supabase.from("site_daily_costs").select("*").eq("site_id", siteId).order("work_date")).data || [],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: key });

  const add = async () => {
    const { error } = await supabase.from("site_daily_costs").insert({ ...f, site_id: siteId, is_estimate: false });
    if (error) return toast.error(error.message);
    setF({ ...empty, work_date: f.work_date }); refresh();
  };

  const importEstimate = async () => {
    if (!quoteId) return toast.error("Cantiere senza preventivo collegato");
    const [{ data: q }, { data: s }] = await Promise.all([
      supabase.from("quotes").select("quote_data").eq("id", quoteId).maybeSingle(),
      supabase.from("crew_cost_settings").select("*").limit(1).maybeSingle(),
    ]);
    const trip = (q?.quote_data as any)?.contabilita?.crewTrip;
    if (!trip?.enabled) return toast.error("Nel preventivo non ci sono costi squadra");
    const c = computeCrew({ days: 1, workers: 1, vans: 1, ...trip }, { ...DEFAULT_CREW_SETTINGS, ...(s as any) });
    const d = splitDaily(c);
    await supabase.from("site_daily_costs").delete().eq("site_id", siteId).eq("is_estimate", true);
    const base = startDate ? new Date(startDate) : new Date();
    const ins = Array.from({ length: c.days }, (_, i) => ({
      site_id: siteId, work_date: format(addDays(base, i), "yyyy-MM-dd"), workers_count: c.workers,
      labor: d.labor, fuel: d.fuel, tolls: d.tolls, meals: d.meals, hotel: d.hotel, other: 0, is_estimate: true, notes: "Stima dal preventivo",
    }));
    const { error } = await supabase.from("site_daily_costs").insert(ins);
    if (error) return toast.error(error.message);
    toast.success(`Importati ${c.days} giorni stimati (${eur(c.total)})`); refresh();
  };

  const del = async (id: string) => { await supabase.from("site_daily_costs").delete().eq("id", id); refresh(); };
  const est = rows.filter((r: any) => r.is_estimate), real = rows.filter((r: any) => !r.is_estimate);
  const sum = (rs: any[]) => rs.reduce((s, r) => s + rowTotal(r), 0);
  const realWd = real.reduce((s: number, r: any) => s + (Number(r.workers_count) || 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <CardTitle className="text-base">Costi squadra giorno per giorno</CardTitle>
        <Button size="sm" variant="outline" onClick={importEstimate}>Importa stima dal preventivo</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-3 border rounded-lg"><div className="text-xs text-muted-foreground">Stimato</div><b>{eur(sum(est))}</b></div>
          <div className="p-3 border rounded-lg"><div className="text-xs text-muted-foreground">Reale</div><b>{eur(sum(real))}</b></div>
          <div className="p-3 border rounded-lg"><div className="text-xs text-muted-foreground">Giorni reali</div><b>{real.length}</b></div>
          <div className="p-3 border rounded-lg"><div className="text-xs text-muted-foreground">Reale per operaio/giorno</div><b>{eur(realWd ? sum(real) / realWd : 0)}</b></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-9 gap-2 items-end">
          <Input type="date" value={f.work_date} onChange={(e) => setF({ ...f, work_date: e.target.value })} />
          <Input type="number" placeholder="Operai" value={f.workers_count} onChange={(e) => setF({ ...f, workers_count: Number(e.target.value) })} />
          {FIELDS.map(([k, l]) => <Input key={k} type="number" placeholder={l} title={l} value={f[k] || ""} onChange={(e) => setF({ ...f, [k]: Number(e.target.value) })} />)}
          <Button onClick={add}>Aggiungi</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground"><th className="p-2">Data</th><th>Operai</th>{FIELDS.map(([k, l]) => <th key={k}>{l}</th>)}<th>Totale</th><th></th></tr></thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{format(new Date(r.work_date), "dd/MM/yyyy")} {r.is_estimate && <Badge variant="outline" className="ml-1">stima</Badge>}</td>
                  <td>{r.workers_count}</td>
                  {FIELDS.map(([k]) => <td key={k}>{eur(Number(r[k]))}</td>)}
                  <td className="font-semibold">{eur(rowTotal(r))}</td>
                  <td><Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="w-4 h-4" /></Button></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={10} className="p-4 text-center text-muted-foreground">Nessun costo registrato</td></tr>}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
