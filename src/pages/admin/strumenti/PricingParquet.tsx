import { useMemo, useState } from "react";
import { useToolSettings } from "@/hooks/useToolSettings";
import {
  usePricingCatalog,
  useCreaPreventivoLink,
  PricingLoadingState,
  PricingEmptyState,
} from "./_shared";

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

const inferCatParq = (nome: string, collection: string): string => {
  const s = `${nome} ${collection}`.toLowerCase();
  if (s.includes("slim")) return "Slim";
  if (s.includes("sense") || s.includes("element")) return "Sense/Element";
  if (s.includes("ground") || s.includes("impression")) return "Ground/Impression";
  if (s.includes("star") || s.includes(" her") || s.includes(" him") || s.includes("spina")) return "Star/Her/Him";
  if (s.includes("olmo") || s.includes("castagno")) return "Dream Olmo/Castagno";
  if (s.includes("noce")) return "Dream Noce";
  if (s.includes("oliato") || s.includes("olio") || s.includes("osmo")) return "Dream Rovere Oliato";
  return "Dream Rovere Verniciato";
};


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
    <div style={{ fontFamily: "'new-order', sans-serif", color: "#1A1A1A", maxWidth: 1200, margin: "0 auto", padding: "8px 4px" }}>
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
