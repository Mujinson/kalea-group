import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { toast } from "sonner";
import { computeCrew, CrewSettings, CrewTrip, DEFAULT_CREW_SETTINGS } from "@/lib/crewCosts";
import { clearZeroOnFocus } from "@/lib/numericInput";

const eur = (v: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(v || 0);

const n0 = (v: unknown) => Number(v) || 0;

export function useCrewSettings() {
  const [s, setS] = useState<CrewSettings>(DEFAULT_CREW_SETTINGS);
  useEffect(() => {
    supabase.from("crew_cost_settings").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) setS({ ...DEFAULT_CREW_SETTINGS, ...(data as any) });
    });
  }, []);
  return s;
}

export default function CrewCostsBlock({ trip, onChange, settings, defaultDestination, defaultMq }: {
  trip: CrewTrip; onChange: (t: CrewTrip) => void; settings: CrewSettings; defaultDestination?: string; defaultMq?: number;
}) {
  const [loading, setLoading] = useState(false);
  const t: CrewTrip = {
    mode: "operai", days: 1, workers: 1, vans: 1, trasferta: "auto",
    artisanCount: 4, artisanRateMq: 16, mqPerWorkerDay: 22,
    artisanIncludeLunch: true, artisanIncludeDinner: true, artisanIncludeHotel: true, artisanIncludeTravel: false,
    ...trip,
    ...(trip.mq == null && defaultMq ? { mq: defaultMq } : {}),
  };
  const isArtisans = t.mode === "artigiani";
  const c = computeCrew(t, settings);
  const set = (p: Partial<CrewTrip>) => onChange({ ...t, ...p });
  const dest = t.destination ?? defaultDestination ?? "";

  const calcRoute = async () => {
    if (!dest.trim()) return toast.error("Inserisci l'indirizzo del cantiere");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("route-cost", { body: { origin: settings.origin, destination: dest, tollEurKm: settings.toll_eur_km } });
    setLoading(false);
    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) { try { msg = (await error.context.json()).error || msg; } catch { /* */ } }
      return toast.error(msg);
    }
    set({ destination: dest, kmOneWay: data.kmOneWay, minutesOneWay: data.minutesOneWay, ...(data.tollKnown ? { tollOneWay: data.tollOneWay } : {}) });
    if (data.tollKnown) toast.success(`${data.kmOneWay} km · ${data.minutesOneWay} min · pedaggio ${eur(data.tollOneWay)} sola andata${data.tollSource === 'stima_km' ? ` (stima: ${data.tollKm} km di autostrada × ${settings.toll_eur_km} €/km)` : ''}`);
    else toast.warning(`${data.kmOneWay} km · ${data.minutesOneWay} min. Percorso senza autostrade a pedaggio.`);
  };

  const inp: React.CSSProperties = { width: 80, padding: "4px 6px", border: "1px solid #E6E9F0", borderRadius: 6, fontSize: 12, textAlign: "right" };
  const lab: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "#64748B" };
  const num = (k: keyof CrewTrip, step = "1") => (
    <input type="number" onFocus={clearZeroOnFocus} step={step} style={inp} value={(t[k] as number) ?? 0} onChange={(e) => set({ [k]: Number(e.target.value) } as any)} />
  );
  const diff = c.perWorkerDay - settings.reference_daily;
  const home = computeCrew({ ...t, mode: "operai", trasferta: "off" }, settings);
  const away = computeCrew({ ...t, mode: "operai", trasferta: "on" }, settings);
  const cheaper = home.total <= away.total ? "off" : "on";
  const cmpOperai = computeCrew({ ...t, mode: "operai" }, settings);
  const cmpArtigiani = computeCrew({ ...t, mode: "artigiani" }, settings);
  const hasCompare = cmpOperai.total > 0 && cmpArtigiani.total > 0;
  const cheaperMode = cmpOperai.total <= cmpArtigiani.total ? "operai" : "artigiani";
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
    border: active ? "1.5px solid #1A1A2E" : "1px solid #CBD5E1",
    background: active ? "#1A1A2E" : "#fff", color: active ? "#fff" : "#334155",
  });
  const chk: React.CSSProperties = { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#334155", cursor: "pointer" };

  return (
    <div style={{ marginTop: 16, padding: 12, background: "#F0F7FF", borderRadius: 8, display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B", textTransform: "uppercase" }}>
          <input type="checkbox" checked={!!t.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
          Costi squadra e trasferta (operai interni o artigiani)
        </label>
        {t.enabled && (
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" style={tabBtn(!isArtisans)} onClick={() => set({ mode: "operai" })}>Operai interni</button>
            <button type="button" style={tabBtn(isArtisans)} onClick={() => set({ mode: "artigiani" })}>Artigiani a mq</button>
          </div>
        )}
      </div>
      {t.enabled && <>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={lab}>Partenza<b style={{ color: "#1A1A2E", fontSize: 13 }}>{settings.origin}</b></div>
          <label style={{ ...lab, flex: 1, minWidth: 220 }}>Arrivo (cantiere)
            <input style={{ ...inp, width: "100%", textAlign: "left" }} value={dest} onChange={(e) => set({ destination: e.target.value })} placeholder="Via, CAP, città" />
          </label>
          <button type="button" onClick={calcRoute} disabled={loading} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#1A1A2E", color: "#fff", cursor: "pointer", fontSize: 12 }}>
            {loading ? "Calcolo…" : "Calcola percorso"}
          </button>
        </div>
        {isArtisans ? (
          <>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <label style={lab}>Mq totali
                <input type="number" step="0.1" onFocus={clearZeroOnFocus} style={inp} value={t.mq ?? 0} onChange={(e) => set({ mq: Number(e.target.value), artisanDays: null, artisanNights: null })} />
              </label>
              <label style={lab}>€/mq artigiani
                <input type="number" step="0.5" onFocus={clearZeroOnFocus} style={inp} value={t.artisanRateMq ?? 0} onChange={(e) => set({ artisanRateMq: Number(e.target.value) })} />
              </label>
              <label style={lab}>Artigiani
                <input type="number" onFocus={clearZeroOnFocus} style={inp} value={t.artisanCount ?? 1} onChange={(e) => set({ artisanCount: Number(e.target.value), artisanDays: null, artisanNights: null })} />
              </label>
              <label style={lab}>Mq/giorno cad.
                <input type="number" step="0.5" onFocus={clearZeroOnFocus} style={inp} value={t.mqPerWorkerDay ?? 0} onChange={(e) => set({ mqPerWorkerDay: Number(e.target.value), artisanDays: null, artisanNights: null })} />
              </label>
              <label style={lab}>Giorni di lavoro
                <input type="number" onFocus={clearZeroOnFocus} style={inp} value={t.artisanDays ?? c.suggestedDays} onChange={(e) => set({ artisanDays: Number(e.target.value), artisanNights: null })} />
              </label>
              <label style={lab}>Trasferta
                <select style={{ ...inp, width: 110, textAlign: "left" }} value={t.trasferta} onChange={(e) => set({ trasferta: e.target.value as any })}>
                  <option value="auto">Auto (≥ {settings.trasferta_km} km)</option><option value="on">Sì</option><option value="off">No</option>
                </select>
              </label>
              {c.isTrasferta && <label style={lab}>Notti
                <input type="number" onFocus={clearZeroOnFocus} style={inp} value={t.artisanNights ?? c.nights} onChange={(e) => set({ artisanNights: Number(e.target.value) })} />
              </label>}
              <label style={lab}>Pranzo €/g
                <input type="number" step="0.5" onFocus={clearZeroOnFocus} style={inp} value={t.lunchCost ?? settings.lunch} onChange={(e) => set({ lunchCost: Number(e.target.value) })} />
              </label>
              {c.isTrasferta && <label style={lab}>Cena €/notte
                <input type="number" step="0.5" onFocus={clearZeroOnFocus} style={inp} value={t.dinnerCost ?? settings.dinner} onChange={(e) => set({ dinnerCost: Number(e.target.value) })} />
              </label>}
              {c.isTrasferta && <label style={lab}>Albergo €/notte
                <input type="number" step="1" onFocus={clearZeroOnFocus} style={inp} value={t.hotelCost ?? settings.hotel} onChange={(e) => set({ hotelCost: Number(e.target.value) })} />
              </label>}
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase" }}>A carico Kalēa:</span>
              <label style={chk}><input type="checkbox" checked={t.artisanIncludeLunch ?? true} onChange={(e) => set({ artisanIncludeLunch: e.target.checked })} />Pranzi</label>
              <label style={chk}><input type="checkbox" checked={t.artisanIncludeDinner ?? true} onChange={(e) => set({ artisanIncludeDinner: e.target.checked })} />Cene</label>
              <label style={chk}><input type="checkbox" checked={t.artisanIncludeHotel ?? true} onChange={(e) => set({ artisanIncludeHotel: e.target.checked })} />Albergo</label>
              <label style={chk}><input type="checkbox" checked={!!t.artisanIncludeTravel} onChange={(e) => set({ artisanIncludeTravel: e.target.checked })} />Viaggio / Furgone</label>
            </div>
            {t.artisanIncludeTravel && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <label style={lab}>Km sola andata{num("kmOneWay", "0.1")}</label>
                <label style={lab}>Pedaggio andata €{num("tollOneWay", "0.01")}</label>
                <label style={lab}>Furgoni{num("vans")}</label>
                {c.isTrasferta && <label style={lab}>Viaggi A/R
                  <input type="number" onFocus={clearZeroOnFocus} style={inp} value={t.tripsOverride ?? c.trips} onChange={(e) => set({ tripsOverride: Number(e.target.value) })} />
                </label>}
                <label style={lab}>Furgone €/km
                  <input type="number" step="0.01" onFocus={clearZeroOnFocus} style={inp} value={t.vanEurKm ?? settings.van_eur_km ?? 0.3} onChange={(e) => set({ vanEurKm: Number(e.target.value) })} />
                </label>
                {c.isTrasferta && <label style={lab}>Km/giorno sul posto
                  <input type="number" onFocus={clearZeroOnFocus} style={inp} value={t.localKmDay ?? 20} onChange={(e) => set({ localKmDay: Number(e.target.value) })} />
                </label>}
              </div>
            )}
            {c.mq > 0 && c.mqPerDay > 0 && (
              <div style={{ fontSize: 12, color: "#334155" }}>
                Resa squadra: <b>{c.workers} artigiani × {t.mqPerWorkerDay} mq/g = {c.mqPerDay} mq/giorno</b> · {c.mq} mq ÷ {c.mqPerDay} = <b>{c.daysExact.toLocaleString("it-IT", { maximumFractionDigits: 2 })} giorni</b> → <b>{c.suggestedDays} giorni lavorativi</b>{c.isTrasferta ? ` (${c.nights} notti)` : ""}
              </div>
            )}
          </>
        ) : (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={lab}>Km sola andata{num("kmOneWay", "0.1")}</label>
          <label style={lab}>Pedaggio andata €{num("tollOneWay", "0.01")}</label>
          <label style={lab}>Giorni di lavoro{num("days")}</label>
          <label style={lab}>Operai{num("workers")}</label>
          <label style={lab}>Furgoni{num("vans")}</label>
          <label style={lab}>Costo operaio/giorno
            <input type="number" onFocus={clearZeroOnFocus} style={inp} value={t.workerDayOverride ?? Math.round(c.workerDay * 100) / 100} onChange={(e) => set({ workerDayOverride: Number(e.target.value) })} />
          </label>
          <label style={lab}>Trasferta
            <select style={{ ...inp, width: 110, textAlign: "left" }} value={t.trasferta} onChange={(e) => set({ trasferta: e.target.value as any })}>
              <option value="auto">Auto (≥ {settings.trasferta_km} km)</option><option value="on">Sì</option><option value="off">No</option>
            </select>
          </label>
          {c.isTrasferta && <label style={lab}>Notti
            <input type="number" onFocus={clearZeroOnFocus} style={inp} value={t.nights ?? c.nights} onChange={(e) => set({ nights: Number(e.target.value) })} />
          </label>}
          {c.isTrasferta && <label style={lab}>Viaggi A/R
            <input type="number" onFocus={clearZeroOnFocus} style={inp} value={t.tripsOverride ?? c.trips} onChange={(e) => set({ tripsOverride: Number(e.target.value) })} />
          </label>}
          <label style={lab}>Inizio lavori
            <input type="date" style={inp} value={t.startDate ?? ""} onChange={(e) => set({ startDate: e.target.value || null })} />
          </label>
          <label style={lab}>Furgone €/km
            <input type="number" step="0.01" onFocus={clearZeroOnFocus} style={inp} value={t.vanEurKm ?? settings.van_eur_km ?? 0.3} onChange={(e) => set({ vanEurKm: Number(e.target.value) })} />
          </label>
          {c.isTrasferta && <label style={lab}>Km/giorno sul posto
            <input type="number" onFocus={clearZeroOnFocus} style={inp} value={t.localKmDay ?? 20} onChange={(e) => set({ localKmDay: Number(e.target.value) })} />
          </label>}
          <label style={lab}>Pranzo €/g
            <input type="number" step="0.5" onFocus={clearZeroOnFocus} style={inp} value={t.lunchCost ?? settings.lunch} onChange={(e) => set({ lunchCost: Number(e.target.value) })} />
          </label>
          {c.isTrasferta && <label style={lab}>Cena €/notte
            <input type="number" step="0.5" onFocus={clearZeroOnFocus} style={inp} value={t.dinnerCost ?? settings.dinner} onChange={(e) => set({ dinnerCost: Number(e.target.value) })} />
          </label>}
          {c.isTrasferta && <label style={lab}>Albergo €/notte
            <input type="number" step="1" onFocus={clearZeroOnFocus} style={inp} value={t.hotelCost ?? settings.hotel} onChange={(e) => set({ hotelCost: Number(e.target.value) })} />
          </label>}
        </div>
        )}
        {!isArtisans && t.minutesOneWay ? <div style={{ fontSize: 12, color: "#64748B" }}>Viaggio: {t.minutesOneWay} min sola andata · {c.kmAR} km A/R · {c.trips} viaggi A/R{c.isTrasferta ? ` + ${c.localKm} km sul posto (in trasferta si dorme lì: il viaggio lungo si paga solo all'andata e al ritorno)` : ""}</div> : null}
        {!isArtisans && <div style={{ fontSize: 12, color: "#64748B" }}>Operaio: {eur(c.workerDay)}/giorno {t.startDate ? `(costo mensile diviso per i giorni lavorativi reali del mese, festività escluse)` : `(media ${settings.work_days_month} giorni/mese: inserisci l'inizio lavori per il calcolo sul mese reale)`}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
          {(isArtisans
            ? [
                [`Posa (${c.mq} mq × ${n0(t.artisanRateMq)} €)`, c.labor],
                ["Pranzi", c.lunchTotal],
                ["Cene", c.dinnerTotal],
                ["Albergo", c.hotel],
                ...(t.artisanIncludeTravel ? [["Gasolio", c.fuel], [`Furgone (${c.totalKm} km)`, c.van], ["Telepass", c.tolls]] : []),
                ["Totale artigiani", c.total],
                ["Al giorno", c.perDay],
                ...(c.mq > 0 ? [["Costo reale / mq", c.perMq]] : []),
              ]
            : [["Operai", c.labor], ["Gasolio", c.fuel], [`Furgone (${c.totalKm} km × ${c.vanEurKm.toFixed(2)} €)`, c.van], ["Telepass", c.tolls], ["Pasti", c.meals], ["Albergo", c.hotel], ["Totale squadra", c.total], ["Al giorno", c.perDay], ...(c.mq > 0 ? [["Costo reale / mq", c.perMq]] : [])]
          ).map(([k, v]) => (
            <div key={k as string} style={{ padding: 8, background: "#fff", borderRadius: 6, border: "1px solid #E6E9F0" }}>
              <div style={{ fontSize: 11, color: "#64748B" }}>{k}</div><div style={{ fontWeight: 600, fontSize: 14 }}>{eur(v as number)}</div>
            </div>
          ))}
        </div>
        {!isArtisans && n0(t.kmOneWay) > 0 && n0(t.days) > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {([["off", "Torna a casa ogni giorno", home], ["on", "Resta in albergo", away]] as const).map(([k, l, r]) => {
              const sel = c.isTrasferta === (k === "on");
              return (
                <button type="button" key={k} onClick={() => set({ trasferta: k })} style={{ textAlign: "left", padding: 10, borderRadius: 8, cursor: "pointer", background: "#fff", border: sel ? "2px solid #1A1A2E" : "1px solid #E6E9F0" }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{l} {cheaper === k && <span style={{ color: "#15803D" }}>· conviene</span>}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{eur(r.total)}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>Gasolio {eur(r.fuel)} · Furgone {eur(r.van)} · Telepass {eur(r.tolls)} · Pasti {eur(r.meals)} · Albergo {eur(r.hotel)}</div>
                  {k === "off" && t.minutesOneWay ? <div style={{ fontSize: 11, color: "#64748B" }}>{Math.round(t.minutesOneWay * 2 * n0(t.days) / 60)} ore di viaggio totali per operaio</div> : null}
                </button>
              );
            })}
          </div>
        )}
        {hasCompare && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {([["operai", `Operai interni (${cmpOperai.workers} × ${cmpOperai.days} gg)`, cmpOperai], ["artigiani", `Artigiani (${cmpArtigiani.workers} × ${cmpArtigiani.days} gg)`, cmpArtigiani]] as const).map(([k, l, r]) => {
              const sel = t.mode === k;
              return (
                <button type="button" key={k} onClick={() => set({ mode: k })} style={{ textAlign: "left", padding: 10, borderRadius: 8, cursor: "pointer", background: "#fff", border: sel ? "2px solid #1A1A2E" : "1px solid #E6E9F0" }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{l} {cheaperMode === k && <span style={{ color: "#15803D" }}>· conviene ({eur(Math.abs(cmpOperai.total - cmpArtigiani.total))} in meno)</span>}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{eur(r.total)}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>
                    {r.mq > 0 ? `${eur(r.perMq)}/mq · ` : ""}Posa {eur(r.labor)} · Pasti {eur(r.meals)} · Albergo {eur(r.hotel)}{r.fuel + r.van + r.tolls > 0 ? ` · Viaggio ${eur(r.fuel + r.van + r.tolls)}` : ""}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {!isArtisans && (
          <div style={{ fontSize: 12, color: diff > 0 ? "#B45309" : "#15803D" }}>
            Costo per operaio al giorno {eur(c.perWorkerDay)} · media di riferimento {eur(settings.reference_daily)} ({diff >= 0 ? "+" : ""}{eur(diff)})
          </div>
        )}
      </>}
    </div>
  );
}
