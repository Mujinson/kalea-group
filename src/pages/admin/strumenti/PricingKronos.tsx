import { useState, useMemo } from "react";
import { useToolSettings } from "@/hooks/useToolSettings";

// ─── HELPERS ─────────────────────────────────────────────────
const fmt2 = (n: number) =>
  "€ " + n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = (n: number) => "€ " + Math.round(n).toLocaleString("it-IT");
const fmtP = (n: number) => n.toFixed(1) + "%";

// ─── DATI KRONOS 2026 ─────────────────────────────────────────
const PRODOTTI = [
  { id:"PV001", nome:"Pierre Vive Noble MAXI",       fmt:"120×280 rett.", col:"Pierre Vive", tipo:"Gres Fine",       listino:132 },
  { id:"PV006", nome:"Pierre Vive Noble MAXI",        fmt:"120×120 rett.", col:"Pierre Vive", tipo:"Gres Fine",       listino:95  },
  { id:"PV206", nome:"Pierre Vive Noble MAXI Grip",   fmt:"120×120 rett.", col:"Pierre Vive", tipo:"Gres Fine Grip",  listino:97  },
  { id:"PV011", nome:"Pierre Vive Noble",             fmt:"60×120 rett.",  col:"Pierre Vive", tipo:"Gres Fine",       listino:87  },
  { id:"PV176", nome:"Pierre Vive Noble Grip",        fmt:"60×120 rett.",  col:"Pierre Vive", tipo:"Gres Fine Grip",  listino:90  },
  { id:"PV016", nome:"Pierre Vive Trace",             fmt:"60×120 rett.",  col:"Pierre Vive", tipo:"Gres Fine",       listino:90  },
  { id:"PV211", nome:"Pierre Vive Noble",             fmt:"60×60 rett.",   col:"Pierre Vive", tipo:"Gres Fine",       listino:70  },
  { id:"PV021", nome:"Pierre Vive Ancienne",          fmt:"60×120 rett.",  col:"Pierre Vive", tipo:"Gres Fine",       listino:87  },
  { id:"PV031", nome:"Pierre Vive Ancienne",          fmt:"80×80 rett.",   col:"Pierre Vive", tipo:"Gres Fine",       listino:87  },
  { id:"MA001", nome:"Materia MAXI",                  fmt:"120×280 rett.", col:"Materia",     tipo:"Gres Fine",       listino:132 },
  { id:"MA016", nome:"Materia",                       fmt:"120×120 rett.", col:"Materia",     tipo:"Gres Fine",       listino:105 },
  { id:"MA193", nome:"Materia",                       fmt:"60×120 rett.",  col:"Materia",     tipo:"Gres Fine",       listino:105 },
  { id:"PS001", nome:"Piasentina Stone",              fmt:"60×120 rett.",  col:"Piasentina",  tipo:"Gres Fine",       listino:87  },
  { id:"PS010", nome:"Piasentina Stone Grip",         fmt:"60×120 rett.",  col:"Piasentina",  tipo:"Gres Fine Grip",  listino:90  },
  { id:"PS020", nome:"Piasentina Stone",              fmt:"30×60",         col:"Piasentina",  tipo:"Gres Fine",       listino:55  },
  { id:"PS030", nome:"Piasentina Stone",              fmt:"80×80 rett.",   col:"Piasentina",  tipo:"Gres Fine",       listino:87  },
  { id:"NA001", nome:"Nativa Vena",                   fmt:"60×120 rett.",  col:"Nativa",      tipo:"Gres Fine",       listino:95  },
  { id:"NA010", nome:"Nativa Falda",                  fmt:"60×120 rett.",  col:"Nativa",      tipo:"Gres Fine",       listino:95  },
  { id:"NA020", nome:"Nativa Armis",                  fmt:"60×120 rett.",  col:"Nativa",      tipo:"Gres Fine",       listino:98  },
  { id:"NA030", nome:"Nativa",                        fmt:"30×60",         col:"Nativa",      tipo:"Gres Fine",       listino:60  },
  { id:"ME001", nome:"Metallique MAXI",               fmt:"120×280 rett.", col:"Metallique",  tipo:"Gres Fine",       listino:132 },
  { id:"ME020", nome:"Metallique",                    fmt:"60×120 rett.",  col:"Metallique",  tipo:"Gres Fine",       listino:87  },
  { id:"ME030", nome:"Metallique Battiscopa",         fmt:"4,6×60",        col:"Metallique",  tipo:"Battiscopa",      listino:18  },
  { id:"LR001", nome:"Le Reverse Chevron",            fmt:"varie",         col:"Le Reverse",  tipo:"Decorato",        listino:150 },
  { id:"LR010", nome:"Le Reverse Versailles",         fmt:"varie",         col:"Le Reverse",  tipo:"Decorato",        listino:165 },
  { id:"LR020", nome:"Le Reverse Esagono",            fmt:"varie",         col:"Le Reverse",  tipo:"Decorato",        listino:180 },
  { id:"LR030", nome:"Le Reverse Lappato",            fmt:"60×120",        col:"Le Reverse",  tipo:"Decorato Lappato",listino:200 },
  { id:"WS001", nome:"Wood Side Mosaico Chalet",      fmt:"29×120",        col:"Les Bois",    tipo:"Effetto Legno",   listino:240 },
  { id:"WS010", nome:"Wood Side Listellato",          fmt:"25×120",        col:"Les Bois",    tipo:"Effetto Legno",   listino:266 },
  { id:"WS020", nome:"Wood Side Mosaico Tessera",     fmt:"30×30",         col:"Les Bois",    tipo:"Effetto Legno",   listino:204 },
  { id:"WS030", nome:"Wood Side Mosaico Sticks",      fmt:"30×30",         col:"Les Bois",    tipo:"Effetto Legno",   listino:177 },
  { id:"OUT001",nome:"Outdoor SKE 2.0",               fmt:"60×120×2cm",    col:"Outdoor",     tipo:"Outdoor 20mm",    listino:95  },
  { id:"OUT010",nome:"Outdoor SKE 2.0 MAXI",          fmt:"80×80×2cm",     col:"Outdoor",     tipo:"Outdoor 20mm",    listino:87  },
  { id:"OUT020",nome:"Outdoor SKE 2.0",               fmt:"40×80×2cm",     col:"Outdoor",     tipo:"Outdoor 20mm",    listino:72  },
  { id:"OUT030",nome:"Outdoor SKE 2.0 Grip",          fmt:"60×60×2cm",     col:"Outdoor",     tipo:"Outdoor 20mm Grip",listino:80 },
  { id:"RK001", nome:"Rocks",                         fmt:"60×120 rett.",  col:"Rocks",       tipo:"Gres Fine",       listino:102 },
  { id:"PM001", nome:"Prima Materia",                 fmt:"60×120 rett.",  col:"Rocks",       tipo:"Gres Fine",       listino:98  },
  { id:"TL001", nome:"Talco",                         fmt:"60×120 rett.",  col:"Rocks",       tipo:"Gres Fine",       listino:96  },
];

const BATT_LISTINO = 18;

const SCONTI = [
  { label: "50%",      coeff: 0.50 },
  { label: "50+10",    coeff: 0.50 * 0.90 },
  { label: "50+20",    coeff: 0.50 * 0.80 },
  { label: "50+20+10", coeff: 0.50 * 0.80 * 0.90 },
  { label: "50+25+10", coeff: 0.50 * 0.75 * 0.90 },
];

const COLLEZIONI = ["Tutte", "Pierre Vive", "Materia", "Piasentina", "Nativa", "Metallique", "Le Reverse", "Les Bois", "Outdoor", "Rocks"];

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
  const map: Record<string, { bg: string; color: string }> = {
    "Gres Fine":        { bg: "#E6F1FB", color: "#0C447C" },
    "Gres Fine Grip":   { bg: "#E1F5EE", color: "#085041" },
    "Outdoor 20mm":     { bg: "#FAEEDA", color: "#633806" },
    "Outdoor 20mm Grip":{ bg: "#FAEEDA", color: "#633806" },
    "Decorato":         { bg: "#EEEDFE", color: "#3C3489" },
    "Decorato Lappato": { bg: "#EEEDFE", color: "#3C3489" },
    "Effetto Legno":    { bg: "#FFF3E0", color: "#7B3A10" },
    "Battiscopa":       { bg: "#F0EDE8", color: "#5F5E5A" },
  };
  const s = map[tipo] || { bg: "#E6F1FB", color: "#0C447C" };
  return <span style={{ display: "inline-block", fontSize: 10, padding: "2px 6px", borderRadius: 3, fontWeight: 500, background: s.bg, color: s.color }}>{tipo}</span>;
}

function MargineChip({ pct }: { pct: number }) {
  const bg    = pct > 40 ? "#EAF3DE" : pct > 28 ? "#FAEEDA" : "#FCEBEB";
  const color = pct > 40 ? "#27500A" : pct > 28 ? "#633806" : "#A32D2D";
  return <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 5, fontWeight: 500, fontSize: 12, background: bg, color }}>{fmtP(pct)}</span>;
}

interface S { scontoIdx: number; markup: number; markupPrem: number; }
const defaults: S = { scontoIdx: 3, markup: 70, markupPrem: 90 };

export default function PricingKronos() {
  const { settings, update } = useToolSettings<S>("pricing_kronos", defaults);
  const { scontoIdx, markup, markupPrem } = settings;

  const [colFilter,     setColFilter]     = useState("Tutte");
  const [search,        setSearch]        = useState("");
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [mqPrev,        setMqPrev]        = useState(60);
  const [sfrido,        setSfrido]        = useState(10);
  const [battML,        setBattML]        = useState(20);
  const [scontoCliente, setScontoCliente] = useState(0);
  const [usePrem,       setUsePrem]       = useState(false);

  const coeff   = SCONTI[scontoIdx].coeff;
  const mkCoeff = (usePrem ? markupPrem : markup) / 100;

  const calcP = (listino: number, mk?: number) => {
    const c = mk !== undefined ? mk : mkCoeff;
    const costo   = listino * coeff;
    const prezzo  = costo * (1 + c);
    const margPct = ((prezzo - costo) / prezzo) * 100;
    return { costo, prezzo, margPct, scontoMax: margPct };
  };

  const filtered = useMemo(() => PRODOTTI.filter(p => {
    const colMatch = colFilter === "Tutte" || p.col.toLowerCase().includes(colFilter.toLowerCase());
    const searchMatch = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.fmt.toLowerCase().includes(search.toLowerCase());
    return colMatch && searchMatch;
  }), [colFilter, search]);

  const selected = PRODOTTI.find(p => p.id === selectedId);

  let prev: any = null;
  if (selected) {
    const { costo, prezzo, scontoMax } = calcP(selected.listino);
    const mqOrd      = mqPrev * (1 + sfrido / 100);
    const costoAcq   = mqOrd * costo;
    const battCosto  = battML * (BATT_LISTINO * coeff);
    const battVend   = battML * (BATT_LISTINO * coeff * (1 + mkCoeff));
    const prezzoList = mqOrd * prezzo;
    const prezzoFin  = prezzoList * (1 - scontoCliente / 100);
    const totFin     = prezzoFin + battVend;
    const totAcq     = costoAcq + battCosto;
    const margineE   = totFin - totAcq;
    const marginePct = (margineE / totFin) * 100;
    const inPericolo = scontoCliente > scontoMax * 0.85;
    prev = { costo, prezzo, mqOrd, costoAcq, battCosto, battVend, prezzoList, prezzoFin, totFin, totAcq, margineE, marginePct, scontoMax, inPericolo };
  }

  const avgListino = PRODOTTI.reduce((a,p)=>a+p.listino,0)/PRODOTTI.length;
  const avgCosto   = avgListino * coeff;
  const avgPrezzo  = avgCosto * (1 + mkCoeff);
  const avgMarg    = ((avgPrezzo - avgCosto)/avgPrezzo)*100;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif", color: "#1A1A1A", maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 400, color: "#1A1A2E", marginBottom: 4 }}>Pricing Kronos 2026</h1>
        <p style={{ fontSize: 13, color: "#9A9890" }}>Kronos Ceramiche · Listino 2026 · 16 collezioni · Calcolo prezzi e margini in tempo reale</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
          Configurazione sconto & markup
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: "#6B6860", marginBottom: 10 }}>Sconto fornitore Kronos</div>
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
            <div style={{ background: "#F0EDE8", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#6B6860", lineHeight: 1.7 }}>
              <strong style={{ color: "#1A1A1A" }}>{SCONTI[scontoIdx].label}</strong> · Coefficiente: <strong>{coeff.toFixed(3)}</strong><br />
              Acquisti al <strong>{(coeff * 100).toFixed(1)}%</strong> del listino Kronos<br />
              Esempio 100€/mq listino → tuo costo <strong>{fmt2(100 * coeff)}</strong>
            </div>
          </div>
          <div>
            <Slider label="Markup standard" min={20} max={150} value={markup} step={5} onChange={(v: number) => update({ markup: v })} format={(v: number) => v + "%"} />
            <Slider label="Markup premium"  min={30} max={200} value={markupPrem} step={5} onChange={(v: number) => update({ markupPrem: v })} format={(v: number) => v + "%"} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <span style={{ fontSize: 13, color: "#6B6860" }}>Usa markup premium nel preventivo</span>
              <button onClick={() => setUsePrem(!usePrem)}
                style={{ padding: "4px 14px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 12,
                  background: usePrem ? "#1A1A2E" : "transparent",
                  color: usePrem ? "#fff" : "#6B6860",
                  borderColor: usePrem ? "#1A1A2E" : "#E0DDD8" }}>
                {usePrem ? "Sì — Premium" : "No — Standard"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Listino medio Kronos", value: fmt2(avgListino)+"/mq", color: "#1A1A1A" },
          { label: "Tuo costo medio",      value: fmt2(avgCosto)+"/mq",   color: "#0C447C" },
          { label: "Tuo prezzo medio",     value: fmt2(avgPrezzo)+"/mq",  color: "#27500A" },
          { label: "Margine medio",        value: fmtP(avgMarg),          color: "#27500A" },
        ].map(k => (
          <div key={k.label} style={{ background: "#F0EDE8", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#6B6860", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 19, fontWeight: 300, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
          Listino Kronos 2026 — clicca un prodotto per il preventivo
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca articolo..."
            style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid #E0DDD8", fontSize: 13, outline: "none", width: 200, background: "#F7F6F3" }} />
          {COLLEZIONI.map(c => (
            <button key={c} onClick={() => setColFilter(c)}
              style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 12, whiteSpace: "nowrap",
                background: colFilter === c ? "#1A1A2E" : "transparent",
                color: colFilter === c ? "#fff" : "#6B6860",
                borderColor: colFilter === c ? "#1A1A2E" : "#E0DDD8" }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ maxHeight: 440, overflowY: "auto", borderRadius: 8, border: "1px solid #E0DDD8" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <tr>
                {["Collezione", "Articolo", "Formato", "Tipo", "Listino", "Tuo costo", "Prezzo std", "Prezzo prem.", "Margine std", "Sconto max", ""].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".05em", padding: "8px 10px", borderBottom: "1px solid #E0DDD8", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const { costo, prezzo, margPct, scontoMax } = calcP(p.listino, markup/100);
                const { prezzo: prezPrem } = calcP(p.listino, markupPrem/100);
                const isSel = p.id === selectedId;
                return (
                  <tr key={p.id} onClick={() => setSelectedId(p.id)}
                    style={{ background: isSel ? "#E6F1FB" : "transparent", cursor: "pointer" }}
                    onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = "#F7F6F3"; }}
                    onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = isSel ? "#E6F1FB" : "transparent"; }}>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontSize: 11, color: "#9A9890", whiteSpace: "nowrap" }}>{p.col}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontWeight: 500, whiteSpace: "nowrap" }}>{p.nome}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontSize: 12, color: "#6B6860", whiteSpace: "nowrap" }}>{p.fmt}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8" }}><TipoBadge tipo={p.tipo} /></td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontWeight: 500, whiteSpace: "nowrap" }}>{fmt2(p.listino)}/mq</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", color: "#0C447C", fontWeight: 500, whiteSpace: "nowrap" }}>{fmt2(costo)}/mq</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", color: "#1A1A2E", fontWeight: 500, whiteSpace: "nowrap" }}>{fmt2(prezzo)}/mq</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", color: "#534AB7", fontWeight: 500, whiteSpace: "nowrap" }}>{fmt2(prezPrem)}/mq</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8" }}><MargineChip pct={margPct} /></td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontSize: 12, color: "#A32D2D", fontWeight: 500, whiteSpace: "nowrap" }}>max {fmtP(scontoMax)}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8" }}>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedId(p.id); }}
                        style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid", cursor: "pointer", fontSize: 12,
                          background: isSel ? "#1A1A2E" : "transparent",
                          color: isSel ? "#fff" : "#1A1A2E",
                          borderColor: isSel ? "#1A1A2E" : "#E0DDD8" }}>
                        {isSel ? "✓" : "Seleziona"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: "#9A9890", marginTop: 8 }}>
          {filtered.length} articoli visualizzati · Prezzi IVA esclusa · Listino Kronos 2026
        </div>
      </div>

      {selected && prev && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "#E0DDD8" }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".08em", whiteSpace: "nowrap" }}>Calcolatore preventivo ceramiche</span>
            <div style={{ flex: 1, height: 1, background: "#E0DDD8" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: "#1A1A2E", marginBottom: 2 }}>{selected.nome} — {selected.col}</div>
              <div style={{ fontSize: 12, color: "#9A9890", marginBottom: 20 }}>{selected.fmt} · Listino Kronos: {fmt2(selected.listino)}/mq</div>
              <Slider label="mq da posare"            min={5}   max={500} value={mqPrev}        step={5}  onChange={setMqPrev}        format={(v: number) => v + " mq"} />
              <Slider label="Sfrido / sovrappiù (%)"  min={5}   max={25}  value={sfrido}        step={1}  onChange={setSfrido}        format={(v: number) => v + "%"} />
              <Slider label="Battiscopa (ml stimati)"  min={0}   max={150} value={battML}        step={5}  onChange={setBattML}        format={(v: number) => v + " ml"} />
              <Slider label="Sconto al cliente (%)"   min={0}   max={45}  value={scontoCliente} step={1}  onChange={setScontoCliente} format={(v: number) => v + "%"} />
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
                Riepilogo preventivo
              </div>
              {[
                { label: "mq netti",                        value: mqPrev + " mq" },
                { label: "mq da ordinare (con sfrido)",     value: prev.mqOrd.toFixed(1) + " mq" },
                { label: "Costo acquisto ceramiche",        value: fmt0(prev.costoAcq),    color: "#A32D2D" },
                { label: "Costo acquisto battiscopa",       value: battML > 0 ? fmt0(prev.battCosto) + ` (${battML}ml)` : "–" },
                { label: "Totale costo acquisto",          value: fmt0(prev.totAcq),      color: "#A32D2D" },
              ].map((r: any) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #E0DDD8", fontSize: 13 }}>
                  <span style={{ color: "#6B6860" }}>{r.label}</span>
                  <span style={{ fontWeight: 500, color: r.color || "#1A1A1A" }}>{r.value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: "#E0DDD8", margin: "8px 0" }} />
              {[
                { label: "Prezzo ceramiche a listino Kalēa", value: fmt0(prev.prezzoList) },
                { label: "Sconto cliente",                   value: scontoCliente > 0 ? `− ${fmt0(prev.prezzoList - prev.prezzoFin)} (−${scontoCliente}%)` : "nessuno" },
                { label: "Prezzo ceramiche al cliente",      value: fmt0(prev.prezzoFin),   color: "#0C447C", big: true },
                { label: "+ Battiscopa al cliente",          value: battML > 0 ? fmt0(prev.battVend) : "–" },
                { label: "Totale preventivo materiali",     value: fmt0(prev.totFin),      color: "#0C447C", big: true },
              ].map((r: any) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #E0DDD8", fontSize: 13 }}>
                  <span style={{ color: "#6B6860" }}>{r.label}</span>
                  <span style={{ fontWeight: 500, fontSize: r.big ? 16 : 13, color: r.color || "#1A1A1A" }}>{r.value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: "#E0DDD8", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #E0DDD8", fontSize: 13 }}>
                <span style={{ color: "#6B6860" }}>Margine lordo €</span>
                <span style={{ fontWeight: 500, color: "#27500A" }}>{fmt0(prev.margineE)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #E0DDD8", fontSize: 13 }}>
                <span style={{ color: "#6B6860" }}>Margine lordo %</span>
                <span style={{ fontWeight: 500, color: "#27500A" }}>{fmtP(prev.marginePct)}</span>
              </div>
              <div style={{ height: 1, background: "#E0DDD8", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                <span style={{ color: "#6B6860" }}>Break-even (prezzo min totale)</span>
                <span style={{ fontWeight: 500, color: "#A32D2D" }}>{fmt0(prev.totAcq)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {!selected && (
        <div style={{ background: "#F0EDE8", borderRadius: 12, padding: "24px", textAlign: "center", color: "#9A9890", fontSize: 13, marginTop: 8 }}>
          ↑ Clicca un prodotto nella tabella per aprire il calcolatore preventivo
        </div>
      )}
    </div>
  );
}
