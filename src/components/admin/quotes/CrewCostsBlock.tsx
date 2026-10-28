import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { toast } from "sonner";
import { computeCrew, CrewSettings, CrewTrip, DEFAULT_CREW_SETTINGS } from "@/lib/crewCosts";

const eur = (v: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(v || 0);

export function useCrewSettings() {
  const [s, setS] = useState<CrewSettings>(DEFAULT_CREW_SETTINGS);
  useEffect(() => {
    supabase.from("crew_cost_settings").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) setS({ ...DEFAULT_CREW_SETTINGS, ...(data as any) });
    });
  }, []);
  return s;
}

export default function CrewCostsBlock({ trip, onChange, settings, defaultDestination }: {
  trip: CrewTrip; onChange: (t: CrewTrip) => void; settings: CrewSettings; defaultDestination?: string;
}) {
  const [loading, setLoading] = useState(false);
  const t: CrewTrip = { days: 1, workers: 1, vans: 1, trasferta: "auto", ...trip };
  const c = computeCrew(t, settings);
  const set = (p: Partial<CrewTrip>) => onChange({ ...t, ...p });
  const dest = t.destination ?? defaultDestination ?? "";

  const calcRoute = async () => {
    if (!dest.trim()) return toast.error("Inserisci l'indirizzo del cantiere");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("route-cost", { body: { origin: settings.origin, destination: dest } });
    setLoading(false);
    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) { try { msg = (await error.context.json()).error || msg; } catch { /* */ } }
      return toast.error(msg);
    }
    set({ destination: dest, kmOneWay: data.kmOneWay, minutesOneWay: data.minutesOneWay, tollOneWay: data.tollOneWay });
    toast.success(`${data.kmOneWay} km · ${data.minutesOneWay} min · pedaggio ${eur(data.tollOneWay)} (sola andata)`);
  };

  const inp: React.CSSProperties = { width: 80, padding: "4px 6px", border: "1px solid #E6E9F0", borderRadius: 6, fontSize: 12, textAlign: "right" };
  const lab: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "#64748B" };
  const num = (k: keyof CrewTrip, step = "1") => (
    <input type="number" step={step} style={inp} value={(t[k] as number) ?? 0} onChange={(e) => set({ [k]: Number(e.target.value) } as any)} />
  );
  const diff = c.perWorkerDay - settings.reference_daily;

  return (
    <div style={{ marginTop: 16, padding: 12, background: "#F0F7FF", borderRadius: 8, display: "grid", gap: 10 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B", textTransform: "uppercase" }}>
        <input type="checkbox" checked={!!t.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
        Costi squadra e trasferta (operai, gasolio, Telepass, pasti, albergo)
      </label>
      {t.enabled && <>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={lab}>Partenza<b style={{ color: "#1A1A2E", fontSize: 13 }}>{settings.origin}</b></div>
          <label style={{ ...lab, flex: 1, minWidth: 220 }}>Arrivo (cantiere)
            <input style={{ ...inp, width: "100%", textAlign: "left" }} value={dest} onChange={(e) => set({ destination: e.target.value })} placeholder="Via, CAP, città" />
          </label>
          <button onClick={calcRoute} disabled={loading} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#1A1A2E", color: "#fff", cursor: "pointer", fontSize: 12 }}>
            {loading ? "Calcolo…" : "Calcola percorso"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={lab}>Km sola andata{num("kmOneWay", "0.1")}</label>
          <label style={lab}>Pedaggio andata €{num("tollOneWay", "0.01")}</label>
          <label style={lab}>Giorni di lavoro{num("days")}</label>
          <label style={lab}>Operai{num("workers")}</label>
          <label style={lab}>Furgoni{num("vans")}</label>
          <label style={lab}>Costo operaio/giorno
            <input type="number" style={inp} value={t.workerDayOverride ?? Math.round(c.workerDay * 100) / 100} onChange={(e) => set({ workerDayOverride: Number(e.target.value) })} />
          </label>
          <label style={lab}>Trasferta
            <select style={{ ...inp, width: 110, textAlign: "left" }} value={t.trasferta} onChange={(e) => set({ trasferta: e.target.value as any })}>
              <option value="auto">Auto (≥ {settings.trasferta_km} km)</option><option value="on">Sì</option><option value="off">No</option>
            </select>
          </label>
          {c.isTrasferta && <label style={lab}>Notti
            <input type="number" style={inp} value={t.nights ?? c.nights} onChange={(e) => set({ nights: Number(e.target.value) })} />
          </label>}
        </div>
        {t.minutesOneWay ? <div style={{ fontSize: 12, color: "#64748B" }}>Viaggio: {t.minutesOneWay} min sola andata · {c.kmAR} km A/R · {c.trips} viaggi A/R</div> : null}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
          {[["Operai", c.labor], ["Gasolio", c.fuel], ["Telepass", c.tolls], ["Pasti", c.meals], ["Albergo", c.hotel], ["Totale squadra", c.total], ["Al giorno", c.perDay]].map(([k, v]) => (
            <div key={k as string} style={{ padding: 8, background: "#fff", borderRadius: 6, border: "1px solid #E6E9F0" }}>
              <div style={{ fontSize: 11, color: "#64748B" }}>{k}</div><div style={{ fontWeight: 600, fontSize: 14 }}>{eur(v as number)}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: diff > 0 ? "#B45309" : "#15803D" }}>
          Costo per operaio al giorno {eur(c.perWorkerDay)} · media di riferimento {eur(settings.reference_daily)} ({diff >= 0 ? "+" : ""}{eur(diff)})
        </div>
      </>}
    </div>
  );
}
