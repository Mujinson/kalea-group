import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import type { CatalogLine } from "./QuoteCatalogSections";
import CrewCostsBlock, { useCrewSettings } from "./CrewCostsBlock";
import { computeCrew, type CrewTrip } from "@/lib/crewCosts";
import { AccExtras, AccRow, computeAccounting, DEFAULT_EXTRAS, marginLevel } from "@/lib/quoteAccounting";

export interface AccountingState {
  snapshot?: import('@/lib/companyProfit').Estimate;
  overrides?: Record<string, { supplierPrice?: number; supplierDiscountPct?: number }>;
  extras?: Partial<AccExtras>;
  crewTrip?: CrewTrip;
}

const eur = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n || 0);
const pct = (n: number) => `${(n || 0).toFixed(1)}%`;
const COLORS = { ok: "#15803D", warn: "#B45309", bad: "#B91C1C" } as const;

export default function QuoteAccountingPanel({ baseRows, catalogLines, globalDiscountPct, deposit, value, onChange, title, defaultDestination }: {
  defaultDestination?: string;
  baseRows: AccRow[];
  catalogLines: CatalogLine[];
  globalDiscountPct: number;
  deposit: number;
  value: AccountingState;
  onChange: (v: AccountingState) => void;
  title?: string;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [costs, setCosts] = useState<Record<string, { list: number; disc: number; net: number }>>({});

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      setIsAdmin(!!r?.some((x: any) => x.role === "admin"));
    });
  }, []);

  const ids = catalogLines.map((l) => l.catalog_id).filter(Boolean).join(",");
  useEffect(() => {
    const list = ids ? ids.split(",") : [];
    if (!list.length) return;
    supabase.from("catalog_products").select("id,list_price,supplier_discount_percentage,net_cost,purchase_price").in("id", list)
      .then(({ data }) => {
        const m: any = {};
        (data || []).forEach((p: any) => {
          const list = Number(p.list_price) || 0;
          const disc = Number(p.supplier_discount_percentage) || 0;
          const net = Number(p.net_cost) || Number(p.purchase_price) || 0;
          m[p.id] = list > 0 ? { list, disc, net } : { list: net, disc: 0, net };
        });
        setCosts(m);
      });
  }, [ids]);

  const extras: AccExtras = { ...DEFAULT_EXTRAS, ...(value.extras || {}) };
  const ov = value.overrides || {};

  const rows: AccRow[] = useMemo(() => {
    const cat: AccRow[] = catalogLines.map((l) => {
      const c = l.catalog_id ? costs[l.catalog_id] : undefined;
      return {
        key: `cat-${l.id}`, desc: l.name, qta: Number(l.quantity) || 0, unita: l.unit,
        supplierPrice: c?.list ?? 0, supplierDiscountPct: c?.disc ?? 0,
        clientUnit: (Number(l.unit_price) || 0) * (1 - (Number(l.discount_pct) || 0) / 100),
      };
    });
    return [...baseRows, ...cat].map((r) => ({ ...r, ...(ov[r.key] || {}) }));
  }, [baseRows, catalogLines, costs, ov]);

  const crewSettings = useCrewSettings();
  const crewTrip = value.crewTrip || {};
  const crewCost = crewTrip.enabled ? computeCrew({ days: 1, workers: 1, vans: 1, ...crewTrip }, crewSettings).total : 0;
  const acc = computeAccounting(rows, extras, globalDiscountPct, deposit, crewCost);
  const lvl = marginLevel(acc.marginPct);

  if (!isAdmin) return null;

  const setOv = (key: string, k: "supplierPrice" | "supplierDiscountPct", v: number) =>
    onChange({ ...value, overrides: { ...ov, [key]: { ...(ov[key] || {}), [k]: v } } });
  const setEx = (patch: Partial<AccExtras>) => onChange({ ...value, extras: { ...extras, ...patch } });

  const exportXlsx = () => {
    const h = ["Descrizione", "Q.tà", "U.M.", "Prezzo fornitore", "Sconto fornitore", "Costo netto unit.", "Spese Kalēa", "Ricarico", "Prezzo cliente unit.", "Totale cliente", "Utile €", "Incidenza"];
    const aoa: any[][] = [[title || "Contabilità preventivo"], [`Sconto globale ${globalDiscountPct}%`, "", "", "", "", "", "", "", "", "", "", ""], h];
    const start = 4;
    acc.lines.forEach((l, i) => {
      const r = start + i;
      aoa.push([l.desc, l.qta, l.unita, l.supplierPrice, l.supplierDiscountPct / 100,
        { f: `D${r}*(1-E${r})` }, { f: `F${r}*B${r}` }, { f: `IF(G${r}=0,0,(J${r}-G${r})/G${r})` },
        l.clientUnit, { f: `I${r}*B${r}*(1-${globalDiscountPct / 100})` }, { f: `J${r}-G${r}` }, null]);
    });
    const last = start + acc.lines.length - 1;
    const tot = last + 2;
    acc.lines.forEach((_, i) => { aoa[start - 1 + i][11] = { f: `IF($J$${tot}=0,0,J${start + i}/$J$${tot})` }; });
    aoa.push([]);
    aoa.push(["TOTALE VOCI", "", "", "", "", "", { f: `SUM(G${start}:G${last})` }, "", "", { f: `SUM(J${start}:J${last})` }, { f: `SUM(K${start}:K${last})` }, ""]);
    const ex = tot + 1;
    const exRows: [string, number][] = [["Trasporto (km A/R)", acc.extra.trasporto], ["Scarico con gru", acc.extra.gru], ["Smaltimento rifiuti", acc.extra.smaltimento], ["Riconoscenza / provvigione", acc.extra.riconoscenza], ["Posa interna / squadra", acc.extra.squadra], ["Squadra e trasferta (operai, gasolio, Telepass, pasti, albergo)", acc.extra.squadraTrasferta]];
    exRows.forEach(([n, v]) => aoa.push([n, "", "", "", "", "", v]));
    const exEnd = ex + exRows.length - 1;
    aoa.push(["SPESE KALĒA TOTALI", "", "", "", "", "", { f: `G${tot}+SUM(G${ex}:G${exEnd})` }]);
    const sp = exEnd + 1;
    aoa.push(["UTILE", "", "", "", "", "", { f: `J${tot}-G${sp}` }]);
    aoa.push(["MARGINE", "", "", "", "", "", { f: `IF(J${tot}=0,0,G${sp + 1}/J${tot})` }]);
    aoa.push(["Valore acconto", "", "", "", "", "", deposit]);
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 40 }, ...Array(11).fill({ wch: 14 })];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contabilità");
    XLSX.writeFile(wb, `Contabilita-${(title || "preventivo").replace(/[^\w-]+/g, "_")}.xlsx`);
  };

  const inp: React.CSSProperties = { width: 80, padding: "4px 6px", border: "1px solid #E6E9F0", borderRadius: 6, fontSize: 12, textAlign: "right" };
  const th: React.CSSProperties = { padding: "8px 6px", textAlign: "right", fontWeight: 500, whiteSpace: "nowrap" };
  const td: React.CSSProperties = { padding: "6px", textAlign: "right", whiteSpace: "nowrap", borderBottom: "1px solid #F1F3F7" };
  const exItem = (label: string, en: keyof AccExtras, field: keyof AccExtras, suffix: string, extraField?: [keyof AccExtras, string]) => (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <input type="checkbox" checked={!!extras[en]} onChange={(e) => setEx({ [en]: e.target.checked } as any)} />
      <span style={{ minWidth: 170 }}>{label}</span>
      <input type="number" style={inp} value={extras[field] as number} onChange={(e) => setEx({ [field]: Number(e.target.value) } as any)} />{suffix}
      {extraField && <><input type="number" style={inp} value={extras[extraField[0]] as number} onChange={(e) => setEx({ [extraField[0]]: Number(e.target.value) } as any)} />{extraField[1]}</>}
    </label>
  );

  return (
    <div style={{ background: "#fff", border: "1px solid #E6E9F0", borderRadius: 12, padding: 20, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1A1A2E", textTransform: "uppercase", letterSpacing: ".06em" }}>
          {open ? "▾" : "▸"} Contabilità interna (solo admin)
        </button>
        <div style={{ display: "flex", gap: 16, fontSize: 13, alignItems: "center" }}>
          <span>Spese {eur(acc.totalCost)}</span>
          <span>Utile <b>{eur(acc.profit)}</b></span>
          <span style={{ color: COLORS[lvl], fontWeight: 600 }}>Margine {pct(acc.marginPct)}</span>
          <button onClick={exportXlsx} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #1A1A2E", background: "#fff", cursor: "pointer", fontSize: 12 }}>Esporta Excel</button>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 14 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: "#1A1A2E", color: "#fff" }}>
                <th style={{ ...th, textAlign: "left" }}>Descrizione</th><th style={th}>Q.tà</th><th style={th}>U.M.</th>
                <th style={th}>Prezzo forn.</th><th style={th}>Sconto forn. %</th><th style={th}>Costo netto</th>
                <th style={th}>Spese Kalēa</th><th style={th}>Ricarico</th><th style={th}>Prezzo cliente</th>
                <th style={th}>Totale cliente</th><th style={th}>Utile €</th><th style={th}>Incidenza</th>
              </tr></thead>
              <tbody>
                {acc.lines.map((l) => (
                  <tr key={l.key}>
                    <td style={{ ...td, textAlign: "left", whiteSpace: "normal", minWidth: 180 }}>{l.desc || "—"}</td>
                    <td style={td}>{l.qta.toLocaleString("it-IT", { maximumFractionDigits: 2 })}</td>
                    <td style={td}>{l.unita}</td>
                    <td style={td}><input type="number" step="0.01" style={inp} value={l.supplierPrice} onChange={(e) => setOv(l.key, "supplierPrice", Number(e.target.value))} /></td>
                    <td style={td}><input type="number" step="0.1" style={{ ...inp, width: 60 }} value={l.supplierDiscountPct} onChange={(e) => setOv(l.key, "supplierDiscountPct", Number(e.target.value))} /></td>
                    <td style={td}>{eur(l.costUnit)}</td>
                    <td style={td}>{eur(l.cost)}</td>
                    <td style={td}>{pct(l.ricarico)}</td>
                    <td style={td}>{eur(l.clientUnit)}</td>
                    <td style={td}>{eur(l.clientTotal)}</td>
                    <td style={{ ...td, color: l.profit < 0 ? COLORS.bad : undefined }}>{eur(l.profit)}</td>
                    <td style={td}>{pct(l.incidenza)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 16, padding: 12, background: "#FFFBEB", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase" }}>Costi extra</div>
            {exItem("Trasporto (km A/R)", "kmEnabled", "km", "km ×", ["eurKm", "€/km"])}
            {exItem("Scarico con gru", "craneEnabled", "crane", "€")}
            {exItem("Smaltimento rifiuti", "wasteEnabled", "waste", "€")}
            {exItem("Riconoscenza / provvigione", "rewardEnabled", "rewardPct", "% del netto")}
            {exItem("Posa interna / squadra", "crewEnabled", "crew", "€")}
          </div>
          <CrewCostsBlock trip={crewTrip} settings={crewSettings} defaultDestination={defaultDestination} onChange={(t) => onChange({ ...value, crewTrip: t })} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginTop: 16 }}>
            {[
              ["Spese Kalēa totali", eur(acc.totalCost)],
              ["Totale cliente netto", eur(acc.clientNet)],
              ["Utile", eur(acc.profit)],
              ["Margine", pct(acc.marginPct)],
              ["Incidenza costi extra", `${eur(acc.extraTot)} · ${pct(acc.extraIncidence)}`],
              ["Valore acconto", `${eur(deposit)} · copre ${pct(acc.depositCoversPct)} spese`],
            ].map(([k, v], i) => (
              <div key={k} style={{ padding: 12, border: "1px solid #E6E9F0", borderRadius: 8, background: i === 3 ? "#F8FAFC" : "#fff" }}>
                <div style={{ fontSize: 11, color: "#64748B" }}>{k}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: i === 3 ? COLORS[lvl] : "#1A1A2E" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
