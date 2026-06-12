import { useState } from "react";
import { useToolSettings } from "@/hooks/useToolSettings";

const fmt2 = (n: number) => "€ " + n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = (n: number) => "€ " + Math.round(n).toLocaleString("it-IT");
const fmtP = (n: number) => n.toFixed(1) + "%";

const SCONTI = [
  { label: "50%", coeff: 0.50 },
  { label: "50+10", coeff: 0.45 },
  { label: "50+15", coeff: 0.425 },
  { label: "50+20", coeff: 0.40 },
];

const PAVIMENTI = [
  { id: "skudo", nome: "Externo SKUDO", dims: "2000×138×23 mm", tipo: "Premium antimacchia", listino: 94.40, note: "Ipe, Teak, Antique, Golden, Sand — Spazzolata/Levigata" },
  { id: "trad", nome: "Externo TRADITIONAL", dims: "2000×140×25 mm", tipo: "Composito standard", listino: 79.70, note: "Light Brown, Dark Grey — Zigrinata/Levigata" },
];

const STRUTTURA = [
  { nome: "Costo medio struttura completa con SKUDO", unita: "mq", listino: 156.80, note: "Magatello 40×20 + giunzioni + clip + viti" },
  { nome: "Costo medio struttura completa con TRADITIONAL", unita: "mq", listino: 142.00, note: "Magatello 40×20 + giunzioni + clip + viti" },
  { nome: "Magatello alluminio 50×30×2000 mm", unita: "ml", listino: 15.60, note: "Inc. media 3,5 ml/mq" },
  { nome: "Magatello alluminio 40×20×2000 mm", unita: "ml", listino: 12.40, note: "Inc. media 3,5 ml/mq" },
  { nome: "Elemento giunzione 40×25×150 mm", unita: "pz", listino: 4.60, note: "Per magatelli 50×30 — inc. 1,5 pz/mq" },
  { nome: "Elemento giunzione 30×15×150 mm", unita: "pz", listino: 3.80, note: "Per magatelli 40×20 — inc. 1,5 pz/mq" },
];

const ACCESSORI = [
  { nome: "Fascia perimetrale SKUDO 115×9×2000", unita: "ml", listino: 7.30 },
  { nome: "Fascia perimetrale TRADITIONAL 140×12×2000", unita: "ml", listino: 9.40 },
  { nome: "Profilo a L 50×50×2000 (SKUDO)", unita: "ml", listino: 6.40 },
  { nome: "Profilo a L 53×41×2000 (TRADITIONAL)", unita: "ml", listino: 4.90 },
  { nome: "Tavola partenza bordata 138×23×2000 (SKUDO)", unita: "ml", listino: 19.70 },
  { nome: "Tavola partenza bordata 150×25×2000 (TRADITIONAL)", unita: "ml", listino: 20.20 },
  { nome: "Tappi di chiusura coordinati", unita: "pz", listino: 0.80 },
  { nome: "Clip bloccaggio acciaio (inc. 6 pz/mq)", unita: "pz", listino: 0.35 },
  { nome: "Clip espansione plastica (inc. 22 pz/mq)", unita: "pz", listino: 0.20 },
  { nome: "Vite autoforante acc. zincato 3,9×25mm", unita: "pz", listino: 0.18 },
  { nome: "Clip aggancio acciaio 3 fori (inc. 28 pz/mq)", unita: "pz", listino: 0.35 },
  { nome: "Externo Cleaner 1 lt", unita: "pz", listino: 26.70 },
];

const SUPPORTI = [
  { nome: "Primeup H.10-15mm", unita: "pz", listino: 2.60, note: "Inc. 10 pz/mq" },
  { nome: "Piedino H.25-40mm", unita: "pz", listino: 4.90, note: "Inc. 10 pz/mq" },
  { nome: "Piedino H.40-60mm", unita: "pz", listino: 5.40, note: "Inc. 10 pz/mq" },
  { nome: "Piedino H.60-100mm", unita: "pz", listino: 5.70, note: "Inc. 10 pz/mq" },
  { nome: "Piedino H.100-180mm", unita: "pz", listino: 6.30, note: "Inc. 10 pz/mq" },
  { nome: "Livellatore gomma antishock", unita: "pz", listino: 0.60 },
];

function SliderRow({ label, min, max, value, step, onChange, format }: any) {
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

function MargineChip({ pct }: { pct: number }) {
  const bg = pct > 38 ? "#EAF3DE" : pct > 25 ? "#FAEEDA" : "#FCEBEB";
  const color = pct > 38 ? "#27500A" : pct > 25 ? "#633806" : "#A32D2D";
  return <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 5, fontWeight: 500, fontSize: 12, background: bg, color }}>{fmtP(pct)}</span>;
}

function ProdTable({ items, coeff, markup }: { items: any[]; coeff: number; markup: number }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Articolo", "Unità", "Listino", "Tuo costo", "Tuo prezzo", "Margine %"].map(h => (
              <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".05em", padding: "8px 10px", borderBottom: "1px solid #E0DDD8" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((a, i) => {
            const costo = a.listino * coeff;
            const prezzo = costo * (1 + markup / 100);
            const margPct = ((prezzo - costo) / prezzo) * 100;
            return (
              <tr key={i}>
                <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontWeight: 500 }}>{a.nome}{a.note && <div style={{ fontSize: 11, color: "#9A9890", fontWeight: 400 }}>{a.note}</div>}</td>
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
  );
}

type S = { scontoIdx: number; markup: number };
const defaults: S = { scontoIdx: 1, markup: 60 };

export default function PricingExterno() {
  const { settings, update } = useToolSettings<S>("pricing_externo", defaults);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mqPrev, setMqPrev] = useState(30);
  const [sfrido, setSfrido] = useState(10);
  const [conStruttura, setConStruttura] = useState(true);
  const [scCliente, setScCliente] = useState(0);

  const coeff = SCONTI[settings.scontoIdx].coeff;
  const markup = settings.markup;
  const selected = PAVIMENTI.find(p => p.id === selectedId);

  let prev: any = null;
  if (selected) {
    const costo = selected.listino * coeff;
    const prezzo = costo * (1 + markup / 100);
    const mqOrd = mqPrev * (1 + sfrido / 100);
    const strutturaCosto = conStruttura ? (selected.id === "skudo" ? 156.80 : 142.00) * coeff * mqPrev : 0;
    const strutturaVendita = conStruttura ? (selected.id === "skudo" ? 156.80 : 142.00) * coeff * (1 + markup / 100) * mqPrev : 0;
    const costoAcq = mqOrd * costo + strutturaCosto;
    const prezzoList = mqOrd * prezzo + strutturaVendita;
    const prezzoFin = prezzoList * (1 - scCliente / 100);
    const margE = prezzoFin - costoAcq;
    const margPct = (margE / prezzoFin) * 100;
    prev = { costo, prezzo, mqOrd, costoAcq, prezzoList, prezzoFin, margE, margPct, strutturaCosto, strutturaVendita };
  }

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif", color: "#1A1A1A", maxWidth: 1200, margin: "0 auto", padding: "8px 4px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 400, color: "#1A1A2E", marginBottom: 4 }}>Pricing Externo 2026 — WPC Outdoor</h1>
        <p style={{ fontSize: 13, color: "#9A9890" }}>Woodco · Decking in composito per esterni · Listino 2026</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>Configurazione</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: "#6B6860", marginBottom: 10 }}>Sconto fornitore Woodco/Externo</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {SCONTI.map((s, i) => (
                <button key={s.label} onClick={() => update({ scontoIdx: i })}
                  style={{ padding: "5px 16px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 500,
                    background: settings.scontoIdx === i ? "#1A1A2E" : "transparent",
                    color: settings.scontoIdx === i ? "#fff" : "#6B6860",
                    borderColor: settings.scontoIdx === i ? "#1A1A2E" : "#E0DDD8" }}>
                  {s.label}
                </button>
              ))}
            </div>
            <div style={{ background: "#F0EDE8", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#6B6860" }}>
              Coeff. <strong>{coeff.toFixed(3)}</strong> · Acquisti al <strong>{(coeff * 100).toFixed(1)}%</strong> del listino
            </div>
          </div>
          <div>
            <SliderRow label="Markup Kalēa sul tuo costo" min={20} max={130} value={markup} step={5} onChange={(v: number) => update({ markup: v })} format={(v: number) => v + "%"} />
            <div style={{ background: "#F0EDE8", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#6B6860" }}>
              SKUDO (94,40€ listino) → costo <strong>{fmt2(94.40 * coeff)}</strong> → vendi <strong>{fmt2(94.40 * coeff * (1 + markup / 100))}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "SKUDO — tuo costo", value: fmt2(94.40 * coeff) + "/mq", color: "#0C447C" },
          { label: "SKUDO — tuo prezzo", value: fmt2(94.40 * coeff * (1 + markup / 100)) + "/mq", color: "#27500A" },
          { label: "TRADITIONAL — tuo costo", value: fmt2(79.70 * coeff) + "/mq", color: "#0C447C" },
          { label: "TRADITIONAL — tuo prezzo", value: fmt2(79.70 * coeff * (1 + markup / 100)) + "/mq", color: "#27500A" },
        ].map(k => (
          <div key={k.label} style={{ background: "#F0EDE8", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#6B6860", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 300, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
          Pavimenti WPC — clicca per preventivo
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {PAVIMENTI.map(p => {
            const costo = p.listino * coeff;
            const prezzo = costo * (1 + markup / 100);
            const margPct = ((prezzo - costo) / prezzo) * 100;
            const isSel = p.id === selectedId;
            return (
              <div key={p.id} onClick={() => setSelectedId(p.id)} style={{
                border: `1px solid ${isSel ? "#1A1A2E" : "#E0DDD8"}`,
                borderRadius: 10, padding: "16px 18px", cursor: "pointer",
                background: isSel ? "#E6F1FB" : "#fff"
              }}>
                <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{p.nome}</div>
                <div style={{ fontSize: 12, color: "#9A9890", marginBottom: 12 }}>{p.dims} · {p.note}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div style={{ background: "#F0EDE8", borderRadius: 6, padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#9A9890" }}>Listino</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{fmt2(p.listino)}</div>
                  </div>
                  <div style={{ background: "#E6F1FB", borderRadius: 6, padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#9A9890" }}>Tuo costo</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#0C447C" }}>{fmt2(costo)}</div>
                  </div>
                  <div style={{ background: "#EAF3DE", borderRadius: 6, padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#9A9890" }}>Tuo prezzo</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#27500A" }}>{fmt2(prezzo)}</div>
                  </div>
                </div>
                <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#6B6860" }}>Margine: <MargineChip pct={margPct} /></span>
                  <span style={{ color: "#A32D2D" }}>Max sconto: {fmtP(margPct)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
          Struttura (magatelli, clip, viti) · Costi e prezzi
        </div>
        <ProdTable items={STRUTTURA} coeff={coeff} markup={markup} />
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
          Accessori di finitura & manutenzione
        </div>
        <ProdTable items={ACCESSORI} coeff={coeff} markup={markup} />
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
          Supporti regolabili (piedini, prolunga)
        </div>
        <ProdTable items={SUPPORTI} coeff={coeff} markup={markup} />
      </div>

      {selected && prev && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#1A1A2E", marginBottom: 16 }}>{selected.nome}</div>
            <SliderRow label="mq da posare" min={5} max={300} value={mqPrev} step={5} onChange={setMqPrev} format={(v: number) => v + " mq"} />
            <SliderRow label="Sfrido / sovrappiù (%)" min={5} max={20} value={sfrido} step={1} onChange={setSfrido} format={(v: number) => v + "%"} />
            <SliderRow label="Sconto al cliente (%)" min={0} max={40} value={scCliente} step={1} onChange={setScCliente} format={(v: number) => v + "%"} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <span style={{ fontSize: 13, color: "#6B6860" }}>Includi struttura nel preventivo?</span>
              <button onClick={() => setConStruttura(!conStruttura)}
                style={{ padding: "4px 14px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 12,
                  background: conStruttura ? "#1A1A2E" : "transparent",
                  color: conStruttura ? "#fff" : "#6B6860",
                  borderColor: conStruttura ? "#1A1A2E" : "#E0DDD8" }}>
                {conStruttura ? "Sì — con struttura" : "No — solo pavimento"}
              </button>
            </div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
              Riepilogo preventivo
            </div>
            {[
              { label: "mq da ordinare (con sfrido)", value: prev.mqOrd.toFixed(1) + " mq" },
              { label: "Costo acquisto pavimento", value: fmt0(prev.mqOrd * prev.costo), color: "#A32D2D" },
              conStruttura && { label: "Costo acquisto struttura", value: fmt0(prev.strutturaCosto), color: "#A32D2D" },
              { label: "Totale costo acquisto", value: fmt0(prev.costoAcq), color: "#A32D2D" },
            ].filter(Boolean).map((r: any, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #E0DDD8", fontSize: 13 }}>
                <span style={{ color: "#6B6860" }}>{r.label}</span>
                <span style={{ fontWeight: 500, color: r.color || "#1A1A1A" }}>{r.value}</span>
              </div>
            ))}
            <div style={{ height: 1, background: "#E0DDD8", margin: "8px 0" }} />
            {[
              { label: "Prezzo a listino Kalēa", value: fmt0(prev.prezzoList) },
              { label: "Sconto cliente", value: scCliente > 0 ? `-${fmt0(prev.prezzoList - prev.prezzoFin)} (-${scCliente}%)` : "nessuno" },
              { label: "Prezzo finale al cliente", value: fmt0(prev.prezzoFin), big: true, color: "#0C447C" },
            ].map((r: any, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #E0DDD8", fontSize: 13 }}>
                <span style={{ color: "#6B6860" }}>{r.label}</span>
                <span style={{ fontWeight: 500, fontSize: r.big ? 16 : 13, color: r.color || "#1A1A1A" }}>{r.value}</span>
              </div>
            ))}
            <div style={{ height: 1, background: "#E0DDD8", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13 }}>
              <span style={{ color: "#6B6860" }}>Margine lordo €</span>
              <span style={{ fontWeight: 500, color: prev.margE > 0 ? "#27500A" : "#A32D2D" }}>{fmt0(prev.margE)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13 }}>
              <span style={{ color: "#6B6860" }}>Margine lordo %</span>
              <span style={{ fontWeight: 500, color: prev.margPct > 25 ? "#27500A" : "#A32D2D" }}>{fmtP(prev.margPct)}</span>
            </div>
          </div>
        </div>
      )}
      {!selected && (
        <div style={{ background: "#F0EDE8", borderRadius: 12, padding: "24px", textAlign: "center", color: "#9A9890", fontSize: 13 }}>
          ↑ Clicca un pavimento per aprire il calcolatore preventivo
        </div>
      )}
    </div>
  );
}
