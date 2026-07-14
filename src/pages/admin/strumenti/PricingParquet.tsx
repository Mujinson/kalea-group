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

const CATEGORIE = ["Tutte", "Dream Rovere Verniciato", "Dream Rovere Oliato", "Dream Noce", "Dream Olmo/Castagno", "Slim", "Sense/Element", "Ground/Impression", "Star/Her/Him"];

const PRODOTTI = [
  { id:"dr-nat-sp",  nome:"Rovere Naturale Spazzolato", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Verniciato", tipo:"Vernice Extra Opaca Natural", listino:152.20 },
  { id:"dr-nat-lev", nome:"Rovere Naturale Levigato", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Verniciato", tipo:"Vernice Satinata Natural", listino:102.70 },
  { id:"dr-crema",   nome:"Rovere Crema", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Verniciato", tipo:"Vernice Extra Opaca Natural", listino:175.00 },
  { id:"dr-sabbia",  nome:"Rovere Sabbia", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Verniciato", tipo:"Vernice Extra Opaca Natural", listino:175.00 },
  { id:"dr-cognac",  nome:"Rovere Cognac", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Verniciato", tipo:"Vernice Extra Opaca Spirit", listino:164.90 },
  { id:"dr-bianco",  nome:"Rovere Bianco", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Verniciato", tipo:"Vernice Extra Opaca Natural", listino:176.80 },
  { id:"dr-notte",   nome:"Rovere Notte", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Verniciato", tipo:"Vernice Extra Opaca Natural", listino:176.80 },
  { id:"dr-alpaca",  nome:"Rovere Alpaca", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Verniciato", tipo:"Vernice Extra Opaca Natural", listino:182.40 },
  { id:"dr-corteccia",nome:"Rovere Corteccia", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Verniciato", tipo:"Vernice Extra Opaca Natural", listino:182.40 },
  { id:"dr-spirit",  nome:"Rovere Naturale Spirit", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Verniciato", tipo:"Vernice Extra Opaca Spirit", listino:142.40 },
  { id:"dr-wild",    nome:"Rovere Naturale Wild", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Verniciato", tipo:"Vernice Extra Opaca Wild", listino:122.30 },
  { id:"do-nat",     nome:"Rovere Naturale Oliato", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Oliato", tipo:"Olio-Cera OSMO Spirit", listino:157.40 },
  { id:"do-avorio",  nome:"Rovere Avorio", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Oliato", tipo:"Olio-Cera OSMO Natural", listino:182.40 },
  { id:"do-canapa",  nome:"Rovere Canapa", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Oliato", tipo:"Olio-Cera OSMO Spirit", listino:172.40 },
  { id:"do-ciocco",  nome:"Rovere Cioccolato Fumé", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Oliato", tipo:"Olio-Cera OSMO Spirit", listino:172.40 },
  { id:"do-speziato",nome:"Rovere Speziato", dims:"160×1200/2200 Tav.2", cat:"Dream Rovere Oliato", tipo:"Olio-Cera OSMO Wild", listino:151.80 },
  { id:"noce-nat",   nome:"Noce Naturale Levigato", dims:"160×1000/2200 Tav.2", cat:"Dream Noce", tipo:"Vernice Satinata Natural", listino:166.80 },
  { id:"noce-nat-sp",nome:"Noce Naturale Spazzolato", dims:"160×1000/2200 Tav.2", cat:"Dream Noce", tipo:"Vernice Extra Opaca Natural", listino:218.30 },
  { id:"noce-camm",  nome:"Noce Cammello", dims:"160×1000/2200 Tav.2", cat:"Dream Noce", tipo:"Vernice Extra Opaca Spirit", listino:250.60 },
  { id:"noce-eleg",  nome:"Noce Elegante", dims:"160×1000/2200 Tav.2", cat:"Dream Noce", tipo:"Olio-Cera OSMO Natural", listino:233.50 },
  { id:"olmo-nat",   nome:"Olmo Naturale", dims:"140/170/200×1000/2200", cat:"Dream Olmo/Castagno", tipo:"Olio-Cera OSMO Unica", listino:229.70 },
  { id:"cast-nat",   nome:"Castagno Naturale", dims:"140/170/200×1000/2200", cat:"Dream Olmo/Castagno", tipo:"Vernice Extra Opaca Unica", listino:225.90 },
  { id:"cast-dor",   nome:"Castagno Dorato", dims:"140/170/200×1000/2200", cat:"Dream Olmo/Castagno", tipo:"Vernice Extra Opaca Unica", listino:241.10 },
  { id:"slim120-nat",nome:"Slim 120 Rovere Naturale Natural", dims:"120×800/1200 10mm", cat:"Slim", tipo:"Vernice Extra Opaca — 2,5mm legno", listino:114.80 },
  { id:"slim120-spi",nome:"Slim 120 Rovere Naturale Spirit", dims:"120×800/1200 10mm", cat:"Slim", tipo:"Vernice Extra Opaca Spirit", listino:106.90 },
  { id:"slim180-nat",nome:"Slim 180 Rovere Naturale Natural", dims:"180×1200/2200 10mm", cat:"Slim", tipo:"Vernice Extra Opaca — 2,5mm legno", listino:144.70 },
  { id:"slim180-spi",nome:"Slim 180 Rovere Naturale Spirit", dims:"180×1200/2200 10mm", cat:"Slim", tipo:"Vernice Extra Opaca Spirit", listino:139.10 },
  { id:"slim120-olio",nome:"Slim 120 Rovere Oliato Nat.", dims:"120×800/1200 10mm", cat:"Slim", tipo:"Olio-Cera OSMO Spirit", listino:119.20 },
  { id:"sense-lana", nome:"Sense — Rovere Lana", dims:"150×1900 mm 10mm", cat:"Sense/Element", tipo:"Vernice Opaca ABCD", listino:73.80 },
  { id:"sense-twill",nome:"Sense — Rovere Twill", dims:"150×1900 mm 10mm", cat:"Sense/Element", tipo:"Vernice Opaca AB", listino:99.50 },
  { id:"sense-canvas",nome:"Sense — Rovere Canvas", dims:"150×1900 mm 10mm", cat:"Sense/Element", tipo:"Vernice Opaca CDE", listino:65.70 },
  { id:"elem-paper", nome:"Element — Rovere Paper", dims:"220×2200 mm 14mm", cat:"Sense/Element", tipo:"Olio UV DEF", listino:115.30 },
  { id:"elem-plaster",nome:"Element — Rovere Plaster", dims:"220×2200 mm 14mm", cat:"Sense/Element", tipo:"Vernice Opaca EF", listino:85.00 },
  { id:"elem-clay",  nome:"Element — Rovere Clay", dims:"220×2200 mm 14mm", cat:"Sense/Element", tipo:"Vernice Opaca fumé EF", listino:88.00 },
  { id:"grd-limo",   nome:"Ground — Rovere Limo", dims:"180/190×1800/1900", cat:"Ground/Impression", tipo:"Vernice Opaca ABC", listino:93.60 },
  { id:"grd-laguna", nome:"Ground — Rovere Laguna", dims:"180/190×1800/1900", cat:"Ground/Impression", tipo:"Vernice Opaca AB premium", listino:116.80 },
  { id:"grd-savana", nome:"Ground — Rovere Savana", dims:"180/190×1800/1900", cat:"Ground/Impression", tipo:"Vernice Opaca CD", listino:83.90 },
  { id:"grd-selva",  nome:"Ground — Rovere Selva", dims:"180/190×1800/1900", cat:"Ground/Impression", tipo:"Vernice Opaca EF", listino:77.70 },
  { id:"grd-torba",  nome:"Ground — Rovere Torba Fumé", dims:"180/190×1800/1900", cat:"Ground/Impression", tipo:"Vernice Opaca ABCD", listino:91.10 },
  { id:"grd-noce",   nome:"Ground — Noce Americano", dims:"180/190×1800/1900", cat:"Ground/Impression", tipo:"Vernice Opaca ABCD", listino:144.20 },
  { id:"imp-kalika", nome:"Impression — Rovere Kalika", dims:"189×1800/1900 15mm", cat:"Ground/Impression", tipo:"Olio-Cera OSMO CDE 15mm", listino:119.40 },
  { id:"star-nat",   nome:"Star — Rovere Naturale", dims:"90×510 spina 45°", cat:"Star/Her/Him", tipo:"Vernice Opaca ABCD", listino:98.80 },
  { id:"her-nat",    nome:"Her — Rovere Naturale", dims:"90×600 spina italiana", cat:"Star/Her/Him", tipo:"Vernice Opaca ABCD", listino:86.10 },
  { id:"him-nat-ab", nome:"Him — Rovere Naturale AB", dims:"70×490 spina italiana", cat:"Star/Her/Him", tipo:"Vernice Opaca AB", listino:83.30 },
  { id:"him-nat-abcd",nome:"Him — Rovere Naturale ABCD", dims:"70×490 spina italiana", cat:"Star/Her/Him", tipo:"Vernice Opaca ABCD", listino:77.00 },
];

const BATT_DREAM = 12.10;

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
    "Dream Rovere Verniciato": { bg: "#FFF3E0", color: "#7B3A10" },
    "Dream Rovere Oliato":     { bg: "#FAEEDA", color: "#633806" },
    "Dream Noce":              { bg: "#EEEDFE", color: "#3C3489" },
    "Dream Olmo/Castagno":     { bg: "#E1F5EE", color: "#085041" },
    "Slim":                    { bg: "#E6F1FB", color: "#0C447C" },
    "Sense/Element":           { bg: "#EAF3DE", color: "#27500A" },
    "Ground/Impression":       { bg: "#FCE4EC", color: "#880E4F" },
    "Star/Her/Him":            { bg: "#F3E5F5", color: "#6A1B9A" },
  };
  const s = map[cat] || { bg: "#F1F5F9", color: "#5F5E5A" };
  return <span style={{ display: "inline-block", fontSize: 10, padding: "2px 6px", borderRadius: 3, fontWeight: 500, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{cat}</span>;
}

type S = { scontoIdx: number; markup: number };
const defaults: S = { scontoIdx: 1, markup: 60 };

export default function PricingParquet() {
  const { settings, update } = useToolSettings<S>("pricing_parquet", defaults);
  const [catFilter, setCatFilter] = useState("Tutte");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mqPrev, setMqPrev] = useState(40);
  const [sfrido, setSfrido] = useState(12);
  const [battML, setBattML] = useState(20);
  const [scCliente, setScCliente] = useState(0);

  const coeff = SCONTI[settings.scontoIdx].coeff;
  const mkCoeff = settings.markup / 100;

  const filtered = PRODOTTI.filter(p => {
    const cm = catFilter === "Tutte" || p.cat === catFilter;
    const sm = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.tipo.toLowerCase().includes(search.toLowerCase());
    return cm && sm;
  });

  const selected = PRODOTTI.find(p => p.id === selectedId);

  let prev: any = null;
  if (selected) {
    const costo = selected.listino * coeff;
    const prezzo = costo * (1 + mkCoeff);
    const mqOrd = mqPrev * (1 + sfrido / 100);
    const battCosto = battML * BATT_DREAM * coeff;
    const battVend = battML * BATT_DREAM * coeff * (1 + mkCoeff);
    const costoAcq = mqOrd * costo + battCosto;
    const prezzoList = mqOrd * prezzo + battVend;
    const prezzoFin = prezzoList * (1 - scCliente / 100);
    const margE = prezzoFin - costoAcq;
    const margPct = (margE / prezzoFin) * 100;
    const scontoMax = ((prezzo - costo) / prezzo) * 100;
    prev = { costo, prezzo, mqOrd, costoAcq, prezzoList, prezzoFin, margE, margPct, scontoMax };
  }

  const avgListino = PRODOTTI.reduce((a, p) => a + p.listino, 0) / PRODOTTI.length;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif", color: "#1A1A1A", maxWidth: 1200, margin: "0 auto", padding: "8px 4px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 400, color: "#1A1A2E", marginBottom: 4 }}>Pricing Parquet Woodco 2026</h1>
        <p style={{ fontSize: 13, color: "#9A9890" }}>Woodco · Dream · Slim · Sense · Element · Ground · Impression · Star · Her · Him · Listino Aprile 2026</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>Configurazione</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: "#6B6860", marginBottom: 10 }}>Sconto fornitore Woodco Parquet</div>
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
              Coeff. <strong>{coeff.toFixed(3)}</strong> · Acquisti al <strong>{(coeff * 100).toFixed(1)}%</strong> del listino
            </div>
          </div>
          <div>
            <SliderRow label="Markup Kalēa sul tuo costo" min={20} max={130} value={settings.markup} step={5} onChange={(v: number) => update({ markup: v })} format={(v: number) => v + "%"} />
            <div style={{ background: "#F1F5F9", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#6B6860" }}>
              Range prezzi: Dream 73–315€/mq · Slim 91–169€/mq · Sense 65–116€/mq · Ground 77–144€/mq<br />
              Tuo costo medio: <strong>{fmt2(avgListino * coeff)}/mq</strong> · Tuo prezzo medio: <strong>{fmt2(avgListino * coeff * (1 + mkCoeff))}/mq</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>
          Listino Parquet 2026 — clicca per preventivo
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca articolo..."
            style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid #E0DDD8", fontSize: 13, outline: "none", width: 200, background: "#F7F6F3" }} />
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
                {["Linea", "Articolo", "Formato", "Tipo", "Listino", "Tuo costo", "Tuo prezzo", "Margine %", "Sconto max", ""].map(h => (
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
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontWeight: 500, whiteSpace: "nowrap" }}>{p.nome}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontSize: 12, color: "#6B6860", whiteSpace: "nowrap" }}>{p.dims}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "0.5px solid #E0DDD8", fontSize: 11, color: "#9A9890" }}>{p.tipo}</td>
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
        <div style={{ fontSize: 11, color: "#9A9890", marginTop: 8 }}>{filtered.length} articoli · Prezzi IVA esclusa · Sfrido consigliato 10–15%</div>
      </div>

      {selected && prev && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#1A1A2E", marginBottom: 2 }}>{selected.nome}</div>
            <div style={{ fontSize: 12, color: "#9A9890", marginBottom: 16 }}>{selected.dims} · {selected.tipo}</div>
            <SliderRow label="mq da posare" min={10} max={400} value={mqPrev} step={5} onChange={setMqPrev} format={(v: number) => v + " mq"} />
            <SliderRow label="Sfrido (%)" min={8} max={25} value={sfrido} step={1} onChange={setSfrido} format={(v: number) => v + "%"} />
            <SliderRow label="Battiscopa (ml — 12,10€/ml listino)" min={0} max={120} value={battML} step={5} onChange={setBattML} format={(v: number) => v + " ml"} />
            <SliderRow label="Sconto al cliente (%)" min={0} max={40} value={scCliente} step={1} onChange={setScCliente} format={(v: number) => v + "%"} />
            {prev.margPct < 10 ? (
              <div style={{ background: "#FCEBEB", border: "1px solid #E24B4A", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#A32D2D", marginTop: 10 }}>
                ✗ Margine troppo basso ({fmtP(prev.margPct)}) — riduci lo sconto
              </div>
            ) : prev.margPct < 25 ? (
              <div style={{ background: "#FAEEDA", border: "1px solid #EF9F27", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#633806", marginTop: 10 }}>
                ⚠ Margine ridotto ({fmtP(prev.margPct)}) — attenzione
              </div>
            ) : (
              <div style={{ background: "#EAF3DE", border: "1px solid #639922", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#27500A", marginTop: 10 }}>
                ✓ Margine sano ({fmtP(prev.margPct)}) · ancora {fmtP(prev.scontoMax - scCliente)} di spazio
              </div>
            )}
          </div>
          <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E0DDD8" }}>Preventivo materiali</div>
            {[
              { label: "mq da ordinare (sfrido incluso)", value: prev.mqOrd.toFixed(1) + " mq" },
              { label: "Tuo costo acquisto totale", value: fmt0(prev.costoAcq), color: "#A32D2D" },
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
              <span style={{ color: "#6B6860" }}>Break-even (prezzo min)</span>
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
