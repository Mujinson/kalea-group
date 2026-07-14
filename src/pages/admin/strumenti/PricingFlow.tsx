import { useState } from "react";
import { useToolSettings } from "@/hooks/useToolSettings";

// ─── HELPERS ─────────────────────────────────────────────────
const fmt2 = (n: number) =>
  "€ " + n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = (n: number) => "€ " + Math.round(n).toLocaleString("it-IT");
const fmtP = (n: number) => n.toFixed(1) + "%";

// ─── DATI LISTINO FLOW 2025 ───────────────────────────────────
const PRODOTTI = [
  { id: "flow40",   nome: "FLOW 40",              dims: "1524×228,6×4+1 mm",   listino: 43.80, tipo: "Standard",   note: "Pronta consegna" },
  { id: "flow55w",  nome: "FLOW 55 WOOD",         dims: "1524×228,6×4,5+1 mm", listino: 49.00, tipo: "Standard",   note: "Pronta consegna" },
  { id: "flow55c",  nome: "FLOW 55 CEMENT",       dims: "920×460×5,5+1 mm",    listino: 52.70, tipo: "Standard",   note: "Pronta consegna" },
  { id: "flowxl",   nome: "FLOW XL",              dims: "1800×228,6×5+1 mm",   listino: 53.00, tipo: "Standard",   note: "Pronta consegna" },
  { id: "flowspina",nome: "FLOW SPINA ANDE",      dims: "640×128×4,5+1 mm",    listino: 51.20, tipo: "Standard",   note: "Pronta consegna" },
  { id: "flow55gdw",nome: "FLOW 55 GD WOOD",      dims: "1500×230×2,5 mm",     listino: 32.10, tipo: "Da incollare",note: "Pronta consegna" },
  { id: "flow55gdc",nome: "FLOW 55 GD CEMENT",    dims: "914,4×457,2×2,5 mm",  listino: 31.40, tipo: "Da incollare",note: "Pronta consegna" },
  { id: "flowpxlw", nome: "FLOW+ XL WOOD",        dims: "1800×228,6×5,5+1 mm", listino: 54.10, tipo: "Premium",    note: "Novità 2025" },
  { id: "flowpxlt", nome: "FLOW+ XL TILE",        dims: "1200×600×5,5+1 mm",   listino: 55.30, tipo: "Premium",    note: "Novità 2025" },
  { id: "flowpspi", nome: "FLOW+ SPINA ITALIANA", dims: "640×128×5,5+1 mm",    listino: 54.40, tipo: "Premium",    note: "Novità 2025" },
  { id: "flowpspf", nome: "FLOW+ SPINA FRANCESE", dims: "625×127×5,5+1 mm",    listino: 61.80, tipo: "Premium",    note: "Novità 2025" },
];

const ACCESSORI = [
  { nome: "Battiscopa PVC coordinato",   unita: "ml",  listino: 6.20  },
  { nome: "Giunto a T coordinato",       unita: "ml",  listino: 16.20 },
  { nome: "Profilo raccordo coordinato", unita: "ml",  listino: 16.20 },
  { nome: "Profilo finitura coordinato", unita: "ml",  listino: 16.20 },
  { nome: "Giunto a T alluminio 32mm",   unita: "ml",  listino: 9.90  },
  { nome: "Profilo raccordo alu 31mm",   unita: "ml",  listino: 9.90  },
  { nome: "Profilo finitura alu 25mm",   unita: "ml",  listino: 9.90  },
  { nome: "Paragradino rigato",          unita: "ml",  listino: 14.10 },
  { nome: "Nylon barriera vapore",       unita: "mq",  listino: 1.80  },
  { nome: "Isoldrum LVT Plus",           unita: "mq",  listino: 10.20 },
  { nome: "Ardex Fix livellante",        unita: "kg",  listino: 19.10 },
  { nome: "Flow Care LVT Cleaner",       unita: "lt",  listino: 12.80 },
];

const SCONTI = [
  { label: "50%",   coeff: 0.50 },
  { label: "50+10", coeff: 0.50 * 0.90 },
  { label: "50+15", coeff: 0.50 * 0.85 },
  { label: "50+20", coeff: 0.50 * 0.80 },
];

function Slider({ label, min, max, value, step, onChange, format }: any) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "#6B6860" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#1A1A2E", cursor: "pointer" }} />
    </div>
  );
}

function TipoBadge({ tipo }: { tipo: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    "Standard":     { bg: "#E6F1FB", color: "#0C447C" },
    "Da incollare": { bg: "#EAF3DE", color: "#27500A" },
    "Premium":      { bg: "#FAEEDA", color: "#633806" },
  };
  const s = styles[tipo] || styles["Standard"];
  return (
    <span style={{ display: "inline-block", fontSize: 10, padding: "2px 7px", borderRadius: 4, fontWeight: 500, background: s.bg, color: s.color }}>
      {tipo}
    </span>
  );
}

function MargineChip({ pct }: { pct: number }) {
  const bg    = pct > 38 ? "#EAF3DE" : pct > 25 ? "#FAEEDA" : "#FCEBEB";
  const color = pct > 38 ? "#27500A" : pct > 25 ? "#633806" : "#A32D2D";
  return (
    <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 5, fontWeight: 500, fontSize: 12, background: bg, color }}>
      {fmtP(pct)}
    </span>
  );
}

interface S { scontoIdx: number; markup: number; }
const defaults: S = { scontoIdx: 1, markup: 60 };

export default function PricingFlow() {
  const { settings, update } = useToolSettings<S>("pricing_flow", defaults);
  const scontoIdx = settings.scontoIdx;
  const markup = settings.markup;

  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [mqPrev,       setMqPrev]       = useState(60);
  const [sfrido,       setSfrido]       = useState(10);
  const [scontoCliente,setScontoCliente]= useState(0);

  const coeff  = SCONTI[scontoIdx].coeff;
  const mkCoeff = markup / 100;

  const calcP = (listino: number) => {
    const costo   = listino * coeff;
    const prezzo  = costo * (1 + mkCoeff);
    const margE   = prezzo - costo;
    const margPct = (margE / prezzo) * 100;
    return { costo, prezzo, margE, margPct, scontoMax: margPct };
  };

  const selected = PRODOTTI.find(p => p.id === selectedId);

  let prev: any = null;
  if (selected) {
    const { costo, prezzo, scontoMax } = calcP(selected.listino);
    const mqOrd      = mqPrev * (1 + sfrido / 100);
    const costoAcq   = mqOrd * costo;
    const prezzoList = mqOrd * prezzo;
    const prezzoFin  = prezzoList * (1 - scontoCliente / 100);
    const margineE   = prezzoFin - costoAcq;
    const marginePct = (margineE / prezzoFin) * 100;
    const inPericolo = scontoCliente > scontoMax * 0.85;
    prev = { costo, prezzo, mqOrd, costoAcq, prezzoList, prezzoFin, margineE, marginePct, scontoMax, inPericolo };
  }

  const avgListino = PRODOTTI.reduce((a, p) => a + p.listino, 0) / PRODOTTI.length;
  const avgCosto   = avgListino * coeff;
  const avgPrezzo  = avgCosto * (1 + mkCoeff);
  const avgMargine = ((avgPrezzo - avgCosto) / avgPrezzo) * 100;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif", color: "#1A1A1A", maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 400, color: "#1A1A2E", marginBottom: 4 }}>Pricing Flow 2025</h1>
        <p style={{ fontSize: 13, color: "#9A9890" }}>Listino Flow by Woodco · Calcolo prezzi di vendita e margini in tempo reale</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
          Configurazione sconto & markup
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: "#6B6860", marginBottom: 10 }}>Sconto fornitore Flow</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {SCONTI.map((s, i) => (
                <button key={s.label} onClick={() => update({ scontoIdx: i })}
                  style={{ padding: "5px 16px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 500,
                    background: scontoIdx === i ? "#1A1A2E" : "transparent",
                    color: scontoIdx === i ? "#fff" : "#6B6860",
                    borderColor: scontoIdx === i ? "#1A1A2E" : "#E0DDD8" }}>
                  {s.label}
                </button>
              ))}
            </div>
            <div style={{ background: "#F1F5F9", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#6B6860", lineHeight: 1.7 }}>
              Sconto attivo: <strong style={{ color: "#1A1A1A" }}>{SCONTI[scontoIdx].label}</strong> · Coefficiente: <strong>{coeff.toFixed(3)}</strong><br />
              Acquisti al <strong>{(coeff * 100).toFixed(1)}%</strong> del listino Flow
            </div>
          </div>
          <div>
            <Slider label="Markup Kalēa sul tuo costo" min={20} max={130} value={markup} step={5} onChange={(v: number) => update({ markup: v })} format={(v: number) => v + "%"} />
            <div style={{ background: "#F1F5F9", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#6B6860", lineHeight: 1.7 }}>
              Esempio: Flow 55 Wood (49€ listino) → costi <strong>{fmt2(49 * coeff)}</strong> → vendi a <strong>{fmt2(49 * coeff * (1 + mkCoeff))}</strong><br />
              Margine sul venduto: <strong>{fmtP(((49 * coeff * mkCoeff) / (49 * coeff * (1 + mkCoeff))) * 100)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Listino medio Flow",    value: fmt2(avgListino) + "/mq", color: "#1A1A1A" },
          { label: "Tuo costo medio",       value: fmt2(avgCosto)   + "/mq", color: "#0C447C" },
          { label: "Tuo prezzo medio",      value: fmt2(avgPrezzo)  + "/mq", color: "#27500A" },
          { label: "Margine medio",         value: fmtP(avgMargine),         color: "#27500A" },
        ].map(k => (
          <div key={k.label} style={{ background: "#F1F5F9", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#6B6860", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 19, fontWeight: 300, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
          Listino Flow 2025 — clicca un prodotto per il preventivo
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Articolo", "Formato", "Tipo", "Listino Flow", "Tuo costo", "Tuo prezzo", "Margine %", "Sconto max cliente", ""].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".05em", padding: "8px 10px", borderBottom: "1px solid #E0DDD8", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODOTTI.map(p => {
                const { costo, prezzo, margPct, scontoMax } = calcP(p.listino);
                const isSel = p.id === selectedId;
                return (
                  <tr key={p.id} onClick={() => setSelectedId(p.id)}
                    style={{ background: isSel ? "#E6F1FB" : "transparent", cursor: "pointer" }}
                    onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = "#F7F6F3"; }}
                    onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <td style={{ padding: "10px 10px", borderBottom: "0.5px solid #E0DDD8" }}>
                      <strong>{p.nome}</strong>
                      {p.note.includes("Novità") && <span style={{ display: "inline-block", marginLeft: 6, fontSize: 10, padding: "1px 5px", borderRadius: 3, background: "#FAEEDA", color: "#633806", fontWeight: 500 }}>Novità</span>}
                    </td>
                    <td style={{ padding: "10px 10px", borderBottom: "0.5px solid #E0DDD8", fontSize: 12, color: "#6B6860" }}>{p.dims}</td>
                    <td style={{ padding: "10px 10px", borderBottom: "0.5px solid #E0DDD8" }}><TipoBadge tipo={p.tipo} /></td>
                    <td style={{ padding: "10px 10px", borderBottom: "0.5px solid #E0DDD8", fontWeight: 500 }}>{fmt2(p.listino)}/mq</td>
                    <td style={{ padding: "10px 10px", borderBottom: "0.5px solid #E0DDD8", color: "#0C447C", fontWeight: 500 }}>{fmt2(costo)}/mq</td>
                    <td style={{ padding: "10px 10px", borderBottom: "0.5px solid #E0DDD8", color: "#1A1A2E", fontWeight: 500 }}>{fmt2(prezzo)}/mq</td>
                    <td style={{ padding: "10px 10px", borderBottom: "0.5px solid #E0DDD8" }}><MargineChip pct={margPct} /></td>
                    <td style={{ padding: "10px 10px", borderBottom: "0.5px solid #E0DDD8", fontSize: 12, color: "#A32D2D", fontWeight: 500 }}>max {fmtP(scontoMax)}</td>
                    <td style={{ padding: "10px 10px", borderBottom: "0.5px solid #E0DDD8" }}>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedId(p.id); }}
                        style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid", cursor: "pointer", fontSize: 12,
                          background: isSel ? "#1A1A2E" : "transparent",
                          color: isSel ? "#fff" : "#1A1A2E",
                          borderColor: isSel ? "#1A1A2E" : "#E0DDD8" }}>
                        {isSel ? "Selezionato" : "Seleziona"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
          Accessori coordinati
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Articolo", "Unità", "Listino Flow", "Tuo costo", "Tuo prezzo", "Margine %"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".05em", padding: "8px 10px", borderBottom: "1px solid #E0DDD8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACCESSORI.map(a => {
                const { costo, prezzo, margPct } = calcP(a.listino);
                return (
                  <tr key={a.nome}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F7F6F3"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontWeight: 500 }}>{a.nome}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", color: "#9A9890" }}>{a.unita}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8" }}>{fmt2(a.listino)}/{a.unita}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", color: "#0C447C", fontWeight: 500 }}>{fmt2(costo)}/{a.unita}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", color: "#1A1A2E", fontWeight: 500 }}>{fmt2(prezzo)}/{a.unita}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8" }}><MargineChip pct={margPct} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && prev && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "#E0DDD8" }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".08em", whiteSpace: "nowrap" }}>Calcolatore preventivo</span>
            <div style={{ flex: 1, height: 1, background: "#E0DDD8" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: "#1A1A2E", marginBottom: 4 }}>{selected.nome}</div>
              <div style={{ fontSize: 12, color: "#9A9890", marginBottom: 20 }}>{selected.dims} · Listino Flow: {fmt2(selected.listino)}/mq</div>
              <Slider label="mq da posare"            min={5}  max={400} value={mqPrev}        step={5}  onChange={setMqPrev}        format={(v: number) => v + " mq"} />
              <Slider label="Sfrido / sovrappiù (%)"  min={5}  max={25}  value={sfrido}        step={1}  onChange={setSfrido}        format={(v: number) => v + "%"} />
              <Slider label="Sconto al cliente (%)"   min={0}  max={45}  value={scontoCliente} step={1}  onChange={setScontoCliente} format={(v: number) => v + "%"} />
              {prev.inPericolo ? (
                <div style={{ background: "#FAEEDA", border: "1px solid #EF9F27", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#633806", lineHeight: 1.6, marginTop: 12 }}>
                  ⚠ Sconto {scontoCliente}% elevato — margine residuo: <strong>{fmtP(prev.marginePct)}</strong>. Sconto max: {fmtP(prev.scontoMax)}
                </div>
              ) : (
                <div style={{ background: "#EAF3DE", border: "1px solid #639922", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#27500A", lineHeight: 1.6, marginTop: 12 }}>
                  ✓ Sconto sostenibile. Margine: <strong>{fmtP(prev.marginePct)}</strong> · Puoi offrire fino a <strong>{fmtP(prev.scontoMax - scontoCliente)}</strong> aggiuntivo
                </div>
              )}
            </div>
            <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
                Riepilogo preventivo materiali
              </div>
              {[
                { label: "mq netti richiesti",          value: mqPrev + " mq" },
                { label: "mq da ordinare (con sfrido)", value: prev.mqOrd.toFixed(1) + " mq" },
                { label: "Tuo costo acquisto totale",   value: fmt0(prev.costoAcq), color: "#A32D2D" },
              ].map((r: any) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #E0DDD8", fontSize: 13 }}>
                  <span style={{ color: "#6B6860" }}>{r.label}</span>
                  <span style={{ fontWeight: 500, color: r.color || "#1A1A1A" }}>{r.value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: "#E0DDD8", margin: "8px 0" }} />
              {[
                { label: "Prezzo a listino Kalēa",     value: fmt0(prev.prezzoList) },
                { label: "Sconto applicato",           value: scontoCliente > 0 ? `− ${fmt0(prev.prezzoList - prev.prezzoFin)} (−${scontoCliente}%)` : "nessuno" },
                { label: "Prezzo finale al cliente",   value: fmt0(prev.prezzoFin), color: "#0C447C", big: true },
              ].map((r: any) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #E0DDD8", fontSize: 13 }}>
                  <span style={{ color: "#6B6860" }}>{r.label}</span>
                  <span style={{ fontWeight: 500, fontSize: r.big ? 16 : 13, color: r.color || "#1A1A1A" }}>{r.value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: "#E0DDD8", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #E0DDD8", fontSize: 13 }}>
                <span style={{ color: "#6B6860" }}>Margine lordo €</span>
                <span style={{ fontWeight: 500, color: "#27500A" }}>{fmt0(prev.margineE)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #E0DDD8", fontSize: 13 }}>
                <span style={{ color: "#6B6860" }}>Margine lordo %</span>
                <span style={{ fontWeight: 500, color: "#27500A" }}>{fmtP(prev.marginePct)}</span>
              </div>
              <div style={{ height: 1, background: "#E0DDD8", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13 }}>
                <span style={{ color: "#6B6860" }}>Break-even (prezzo min)</span>
                <span style={{ fontWeight: 500, color: "#A32D2D" }}>{fmt0(prev.costoAcq)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13 }}>
                <span style={{ color: "#6B6860" }}>Break-even €/mq</span>
                <span style={{ fontWeight: 500, color: "#A32D2D" }}>{fmt2(calcP(selected.listino).costo)}/mq</span>
              </div>
            </div>
          </div>
        </>
      )}

      {!selected && (
        <div style={{ background: "#F1F5F9", borderRadius: 12, padding: "24px", textAlign: "center", color: "#9A9890", fontSize: 13, marginTop: 8 }}>
          ↑ Clicca un prodotto nella tabella per aprire il calcolatore preventivo
        </div>
      )}
    </div>
  );
}
