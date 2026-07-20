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

const CATEGORIE = ["Tutte", "Spine Verniciato", "Spine Oliato", "Spine Noce/Essenze", "Quadrotte Verniciato", "Quadrotte Oliato", "Arrow", "Rovere Recupero"];

const PRODOTTI = [
  { id:"s45-nat-n",  nome:"Spina 45 Larga — Rovere Naturale Natural", dims:"180×620 mm 14mm 4mm nobile", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca", listino:223.00 },
  { id:"s45-nat-sp", nome:"Spina 45 Larga — Rovere Naturale Spirit", dims:"180×620 mm 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca", listino:203.80 },
  { id:"s45-crema",  nome:"Spina 45 Larga — Rovere Crema", dims:"180×620 mm 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca Natural", listino:242.30 },
  { id:"s45-bianco", nome:"Spina 45 Larga — Rovere Bianco", dims:"180×620 mm 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca Natural", listino:244.20 },
  { id:"s45-alpaca", nome:"Spina 45 Larga — Rovere Alpaca", dims:"180×620 mm 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca Natural", listino:250.00 },
  { id:"s45-cognac", nome:"Spina 45 Larga — Rovere Cognac", dims:"180×620 mm 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca Spirit", listino:223.00 },
  { id:"s52-nat-n",  nome:"Spina 52 Larga — Rovere Naturale Natural", dims:"180×590 mm 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca", listino:223.00 },
  { id:"s52-crema",  nome:"Spina 52 Larga — Rovere Crema", dims:"180×590 mm 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca Natural", listino:242.30 },
  { id:"sc-nat-n",   nome:"Spina Corta — Rovere Naturale Natural", dims:"180×415 mm 60° 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca", listino:225.90 },
  { id:"sc-crema",   nome:"Spina Corta — Rovere Crema", dims:"180×415 mm 60° 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca Natural", listino:245.40 },
  { id:"es-nat-n",   nome:"Esagono — Rovere Naturale Natural", dims:"200×231 mm 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca", listino:281.10 },
  { id:"es-crema",   nome:"Esagono — Rovere Crema", dims:"200×231 mm 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca Natural", listino:300.80 },
  { id:"lst-nat-n",  nome:"Listello — Rovere Naturale Natural", dims:"70×800/1200 mm 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca", listino:134.50 },
  { id:"lst-crema",  nome:"Listello — Rovere Crema", dims:"70×800/1200 mm 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca Natural", listino:153.50 },
  { id:"p180-nat-n", nome:"Pattern 180 — Rovere Naturale Natural", dims:"180×180/360/540 mm 14mm", cat:"Spine Verniciato", tipo:"Spazzolata Vernice Extra Opaca", listino:190.20 },
  { id:"so45-nat",   nome:"Spina 45 — Rovere Naturale Oliato", dims:"180×620 mm", cat:"Spine Oliato", tipo:"Olio-Cera OSMO Spirit", listino:215.40 },
  { id:"so45-avorio",nome:"Spina 45 — Rovere Avorio", dims:"180×620 mm", cat:"Spine Oliato", tipo:"Olio-Cera OSMO Natural", listino:250.00 },
  { id:"so45-canapa",nome:"Spina 45 — Rovere Canapa", dims:"180×620 mm", cat:"Spine Oliato", tipo:"Olio-Cera OSMO Spirit", listino:230.70 },
  { id:"so45-ciocco",nome:"Spina 45 — Rovere Cioccolato Fumé", dims:"180×620 mm", cat:"Spine Oliato", tipo:"Olio-Cera OSMO Spirit", listino:230.70 },
  { id:"so45-spez",  nome:"Spina 45 — Rovere Speziato", dims:"180×620 mm", cat:"Spine Oliato", tipo:"Olio-Cera OSMO Wild", listino:211.50 },
  { id:"sn45-nat",   nome:"Spina 45 — Noce Naturale", dims:"180×620 mm", cat:"Spine Noce/Essenze", tipo:"Vernice Extra Opaca Natural", listino:305.70 },
  { id:"sn45-camm",  nome:"Spina 45 — Noce Cammello", dims:"180×620 mm", cat:"Spine Noce/Essenze", tipo:"Vernice Extra Opaca Spirit", listino:338.40 },
  { id:"sn45-eleg",  nome:"Spina 45 — Noce Elegante", dims:"180×620 mm", cat:"Spine Noce/Essenze", tipo:"Olio-Cera OSMO Natural", listino:321.10 },
  { id:"solmo45",    nome:"Spina 45 — Olmo Naturale", dims:"170×620 mm", cat:"Spine Noce/Essenze", tipo:"Olio-Cera OSMO Unica", listino:300.70 },
  { id:"scast45",    nome:"Spina 45 — Castagno Naturale", dims:"170×620 mm", cat:"Spine Noce/Essenze", tipo:"Vernice Extra Opaca Unica", listino:295.70 },
  { id:"q1-nat-n",   nome:"Q1 Quadrotta — Rovere Naturale Natural", dims:"600×600 mm", cat:"Quadrotte Verniciato", tipo:"Spazzolata Vernice Extra Opaca", listino:316.40 },
  { id:"q1-nat-sp",  nome:"Q1 Quadrotta — Rovere Naturale Spirit", dims:"600×600 mm", cat:"Quadrotte Verniciato", tipo:"Spazzolata Vernice Extra Opaca", listino:297.00 },
  { id:"q1-crema",   nome:"Q1 Quadrotta — Rovere Crema", dims:"600×600 mm", cat:"Quadrotte Verniciato", tipo:"Spazzolata Vernice Extra Opaca Natural", listino:335.80 },
  { id:"q3-nat-n",   nome:"Q3 con Cornice — Rovere Naturale Natural", dims:"782×782 mm", cat:"Quadrotte Verniciato", tipo:"Spazzolata Vernice Extra Opaca", listino:355.20 },
  { id:"q6vers",     nome:"Q8 Versailles — Rovere Naturale Natural", dims:"980×980 mm", cat:"Quadrotte Verniciato", tipo:"Spazzolata Vernice Extra Opaca", listino:355.20 },
  { id:"qn-nat",     nome:"Quadrotta — Noce Naturale", dims:"600×600 mm", cat:"Quadrotte Verniciato", tipo:"Vernice Extra Opaca Natural", listino:355.20 },
  { id:"qn-camm",    nome:"Quadrotta — Noce Cammello", dims:"600×600 mm", cat:"Quadrotte Verniciato", tipo:"Vernice Extra Opaca Spirit", listino:388.30 },
  { id:"qo1-nat",    nome:"Q1 Quadrotta Oliata — Rovere Naturale", dims:"600×600 mm", cat:"Quadrotte Oliato", tipo:"Olio-Cera OSMO Spirit", listino:308.70 },
  { id:"qo1-avorio", nome:"Q1 Quadrotta Oliata — Rovere Avorio", dims:"600×600 mm", cat:"Quadrotte Oliato", tipo:"Olio-Cera OSMO Natural", listino:343.60 },
  { id:"qo1-canapa", nome:"Q1 Quadrotta Oliata — Rovere Canapa", dims:"600×600 mm", cat:"Quadrotte Oliato", tipo:"Olio-Cera OSMO Spirit", listino:324.20 },
  { id:"qon-nat",    nome:"Quadrotta Oliata — Noce Naturale", dims:"600×600 mm", cat:"Quadrotte Oliato", tipo:"Vernice Extra Opaca Natural", listino:355.20 },
  { id:"qon-camm",   nome:"Quadrotta Oliata — Noce Cammello", dims:"600×600 mm", cat:"Quadrotte Oliato", tipo:"Vernice Extra Opaca Spirit", listino:388.30 },
  { id:"arr-nat",    nome:"Arrow — Rovere Naturale Natural", dims:"45×450 mm 14mm", cat:"Arrow", tipo:"Spazzolata Vernice Extra Opaca", listino:153.20 },
  { id:"arr-conch",  nome:"Arrow — Rovere Conchiglia", dims:"45×450 mm 14mm", cat:"Arrow", tipo:"Spazzolata Vernice Extra Opaca", listino:172.60 },
  { id:"arr-tan",    nome:"Arrow — Rovere Tan Fumé", dims:"45×450 mm 14mm", cat:"Arrow", tipo:"Spazzolata Olio-Cera", listino:180.30 },
  { id:"arr-plat",   nome:"Arrow — Rovere Platino", dims:"45×450 mm 14mm", cat:"Arrow", tipo:"Spazzolata Vernice Extra Opaca", listino:172.60 },
  { id:"rec-foss",   nome:"Rovere Fossile — Prima Patina", dims:"120/240×800/2500 14mm", cat:"Rovere Recupero", tipo:"Spazzolata Olio-Cera OSMO Wild", listino:315.80 },
  { id:"rec-sec",    nome:"Rovere Secolare — Seconda Patina", dims:"120/240×800/2500 14mm", cat:"Rovere Recupero", tipo:"Spazzolata Olio-Cera OSMO Wild", listino:315.80 },
];

const BATT_SIGN = 12.10;

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

function CatBadge({ cat }: { cat: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "Spine Verniciato":   { bg: "#FFF3E0", color: "#7B3A10" },
    "Spine Oliato":       { bg: "#FAEEDA", color: "#633806" },
    "Spine Noce/Essenze": { bg: "#EEEDFE", color: "#3C3489" },
    "Quadrotte Verniciato":{ bg: "#E1F5EE", color: "#085041" },
    "Quadrotte Oliato":   { bg: "#EAF3DE", color: "#27500A" },
    "Arrow":              { bg: "#E6F1FB", color: "#0C447C" },
    "Rovere Recupero":    { bg: "#F3E5F5", color: "#6A1B9A" },
  };
  const s = map[cat] || { bg: "#F1F5F9", color: "#5F5E5A" };
  return <span style={{ display: "inline-block", fontSize: 10, padding: "2px 6px", borderRadius: 3, fontWeight: 500, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{cat}</span>;
}

type S = { scontoIdx: number; markup: number };
const defaults: S = { scontoIdx: 1, markup: 60 };

export default function PricingSignature() {
  const { settings, update } = useToolSettings<S>("pricing_signature", defaults);
  const [catFilter, setCatFilter] = useState("Tutte");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mqPrev, setMqPrev] = useState(30);
  const [sfrido, setSfrido] = useState(15);
  const [battML, setBattML] = useState(20);
  const [scCliente, setScCliente] = useState(0);

  const coeff = SCONTI[settings.scontoIdx].coeff;
  const mkCoeff = settings.markup / 100;

  const filtered = PRODOTTI.filter(p => {
    const cm = catFilter === "Tutte" || p.cat === catFilter;
    const sm = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.cat.toLowerCase().includes(search.toLowerCase());
    return cm && sm;
  });

  const selected = PRODOTTI.find(p => p.id === selectedId);

  let prev: any = null;
  if (selected) {
    const costo = selected.listino * coeff;
    const prezzo = costo * (1 + mkCoeff);
    const mqOrd = mqPrev * (1 + sfrido / 100);
    const battCosto = battML * BATT_SIGN * coeff;
    const battVend = battML * BATT_SIGN * coeff * (1 + mkCoeff);
    const costoAcq = mqOrd * costo + battCosto;
    const prezzoList = mqOrd * prezzo + battVend;
    const prezzoFin = prezzoList * (1 - scCliente / 100);
    const margE = prezzoFin - costoAcq;
    const margPct = (margE / prezzoFin) * 100;
    prev = { costo, prezzo, mqOrd, costoAcq, prezzoList, prezzoFin, margE, margPct };
  }

  const avgListino = PRODOTTI.reduce((a, p) => a + p.listino, 0) / PRODOTTI.length;
  const minListino = Math.min(...PRODOTTI.map(p => p.listino));
  const maxListino = Math.max(...PRODOTTI.map(p => p.listino));

  return (
    <div style={{ fontFamily: "'new-order', sans-serif", color: "#1A1A1A", maxWidth: 1200, margin: "0 auto", padding: "8px 4px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 400, color: "#1A1A2E", marginBottom: 4 }}>Pricing Signature Woodco 2026</h1>
        <p style={{ fontSize: 13, color: "#9A9890" }}>Woodco · Parquet premium · Spine 45/52/Corta · Esagono · Pattern · Listello · Quadrotte · Arrow · Rovere Recupero · Listino Aprile 2026</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Fascia listino min", value: fmt2(minListino) + "/mq", color: "#27500A" },
          { label: "Fascia listino max", value: fmt2(maxListino) + "/mq", color: "#633806" },
          { label: "Tuo costo medio", value: fmt2(avgListino * coeff) + "/mq", color: "#0C447C" },
          { label: "Tuo prezzo medio", value: fmt2(avgListino * coeff * (1 + mkCoeff)) + "/mq", color: "#7B3A10" },
        ].map(k => (
          <div key={k.label} style={{ background: "#F1F5F9", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#6B6860", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 300, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>Configurazione</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: "#6B6860", marginBottom: 10 }}>Sconto fornitore Woodco Signature</div>
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
            <div style={{ background: "#F1F5F9", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#6B6860" }}>
              Coeff. <strong>{coeff.toFixed(3)}</strong> · Acquisti al <strong>{(coeff * 100).toFixed(1)}%</strong> del listino<br />
              Attenzione: Signature ha consegne 7–8 settimane — verificare disponibilità
            </div>
          </div>
          <div>
            <SliderRow label="Markup Kalēa sul tuo costo" min={20} max={130} value={settings.markup} step={5} onChange={(v: number) => update({ markup: v })} format={(v: number) => v + "%"} />
            <div style={{ background: "#FAEEDA", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#633806" }}>
              ⚠ Signature è parquet premium su misura. Lo sfrido consigliato è 12–18%. Comunicare sempre i tempi di consegna al cliente (7–8 settimane).
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
          Listino Signature 2026 — clicca per preventivo
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca..."
            style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid #E0DDD8", fontSize: 13, outline: "none", width: 180, background: "#F7F6F3" }} />
          {CATEGORIE.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 11, whiteSpace: "nowrap",
                background: catFilter === c ? "#1A1A2E" : "transparent",
                color: catFilter === c ? "#fff" : "#6B6860",
                borderColor: catFilter === c ? "#1A1A2E" : "#E0DDD8" }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ maxHeight: 460, overflowY: "auto", borderRadius: 8, border: "1px solid #E0DDD8" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <tr>
                {["Categoria", "Articolo", "Formato", "Listino", "Tuo costo", "Tuo prezzo", "Margine %", "Sconto max", ""].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".05em", padding: "8px 10px", borderBottom: "1px solid #E0DDD8", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const costo = p.listino * coeff;
                const prezzo = costo * (1 + mkCoeff);
                const margPct = ((prezzo - costo) / prezzo) * 100;
                const isSel = p.id === selectedId;
                return (
                  <tr key={p.id} onClick={() => setSelectedId(p.id)}
                    style={{ background: isSel ? "#FFF3E0" : "transparent", cursor: "pointer" }}>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8" }}><CatBadge cat={p.cat} /></td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontWeight: 500, maxWidth: 200 }}>{p.nome}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontSize: 11, color: "#9A9890", whiteSpace: "nowrap" }}>{p.dims}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontWeight: 500, whiteSpace: "nowrap" }}>{fmt2(p.listino)}/mq</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", color: "#0C447C", fontWeight: 500, whiteSpace: "nowrap" }}>{fmt2(costo)}/mq</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", color: "#7B3A10", fontWeight: 500, whiteSpace: "nowrap" }}>{fmt2(prezzo)}/mq</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8" }}><MargineChip pct={margPct} /></td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontSize: 12, color: "#A32D2D", fontWeight: 500, whiteSpace: "nowrap" }}>max {fmtP(margPct)}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8" }}>
                      <button onClick={e => { e.stopPropagation(); setSelectedId(p.id); }}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid", cursor: "pointer", fontSize: 11,
                          background: isSel ? "#7B3A10" : "transparent", color: isSel ? "#fff" : "#7B3A10", borderColor: isSel ? "#7B3A10" : "#E0DDD8" }}>
                        {isSel ? "✓" : "Usa"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: "#9A9890", marginTop: 8 }}>{filtered.length} articoli · Prezzi IVA esclusa · Listino Signature Aprile 2026</div>
      </div>

      {selected && prev && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#1A1A2E", marginBottom: 2 }}>{selected.nome}</div>
            <div style={{ fontSize: 12, color: "#9A9890", marginBottom: 16 }}>{selected.dims} · {selected.tipo}</div>
            <SliderRow label="mq da posare" min={5} max={200} value={mqPrev} step={5} onChange={setMqPrev} format={(v: number) => v + " mq"} />
            <SliderRow label="Sfrido (%)" min={10} max={25} value={sfrido} step={1} onChange={setSfrido} format={(v: number) => v + "%"} />
            <SliderRow label="Battiscopa (ml — 12,10€/ml listino)" min={0} max={100} value={battML} step={5} onChange={setBattML} format={(v: number) => v + " ml"} />
            <SliderRow label="Sconto al cliente (%)" min={0} max={40} value={scCliente} step={1} onChange={setScCliente} format={(v: number) => v + "%"} />
            <div style={{ background: "#FAEEDA", border: "1px solid #EF9F27", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#633806", marginTop: 10 }}>
              ⚠ Consegna Signature: 7–8 settimane. Su misura — no reso. Comunicare sempre al cliente prima dell'ordine.
            </div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>Preventivo</div>
            {[
              { label: "mq da ordinare (sfrido incluso)", value: prev.mqOrd.toFixed(1) + " mq" },
              { label: "Tuo costo acquisto", value: fmt0(prev.costoAcq), color: "#A32D2D" },
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
            <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13 }}>
              <span style={{ color: "#6B6860" }}>Break-even (costo acquisto)</span>
              <span style={{ fontWeight: 500, color: "#A32D2D" }}>{fmt0(prev.costoAcq)}</span>
            </div>
          </div>
        </div>
      )}
      {!selected && (
        <div style={{ background: "#F1F5F9", borderRadius: 12, padding: "24px", textAlign: "center", color: "#9A9890", fontSize: 13 }}>
          ↑ Clicca un articolo nella tabella per aprire il calcolatore preventivo
        </div>
      )}
    </div>
  );
}
