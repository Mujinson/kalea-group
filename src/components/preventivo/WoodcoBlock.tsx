import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Collection = { id: string; code: string; name: string };
type Essence    = { id: string; code: string; name: string; surface_treatment: string | null };
type Finish     = { id: string; code: string; name: string };
type Format     = { id: string; code: string; name: string; dimensions: string | null; unit: string };
type Price      = { collection_id: string; essence_id: string; finish_id: string; format_id: string; list_price: number; supplier_discount_pct: number };
type Accessory  = { id: string; category: string; name: string; unit: string; list_price: number; supplier_discount_pct: number };

export type WoodcoSelection = {
  collectionCode: string | null;
  collectionName: string | null;
  essenceCode: string | null;
  essenceName: string | null;
  finishCode: string | null;
  finishName: string | null;
  formatCode: string | null;
  formatName: string | null;
  formatDims: string | null;
  listPrice: number | null;
  supplierDiscountPct: number | null;
  accessories: { accId: string; name: string; category: string; unit: string; qta: number; costoUn: number; prezzoUn: number }[];
};

const MARKUP = 1.6; // markup interno → prezzo cliente (allineato al resto del file)

const styles = {
  label: { fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase" as const, letterSpacing: ".07em", marginBottom: 6, display: "block" },
  select: { width: "100%", padding: "9px 11px", borderRadius: 7, border: "1px solid #E0DDD8", fontSize: 13, background: "#fff", boxSizing: "border-box" as const },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 },
  pillBox: { padding: "10px 12px", background: "#F7F3EC", borderRadius: 8, border: "1px solid #E8DFC8", fontSize: 13, color: "#1A1A2E" },
};

export default function WoodcoBlock({
  value,
  onChange,
}: {
  value: WoodcoSelection;
  onChange: (v: WoodcoSelection) => void;
}) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [essences,    setEssences]    = useState<Essence[]>([]);
  const [finishes,    setFinishes]    = useState<Finish[]>([]);
  const [formats,     setFormats]     = useState<Format[]>([]);
  const [prices,      setPrices]      = useState<Price[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      const [c, e, f, fm, p, a] = await Promise.all([
        supabase.from("wc_collections").select("id,code,name").eq("active", true).order("sort_order"),
        supabase.from("wc_essences").select("id,code,name,surface_treatment").eq("active", true).order("sort_order"),
        supabase.from("wc_finishes").select("id,code,name").order("sort_order"),
        supabase.from("wc_formats").select("id,code,name,dimensions,unit").eq("active", true).order("sort_order"),
        supabase.from("wc_prices").select("collection_id,essence_id,finish_id,format_id,list_price,supplier_discount_pct"),
        supabase.from("wc_accessories").select("id,category,name,unit,list_price,supplier_discount_pct").eq("active", true).order("sort_order"),
      ]);
      setCollections((c.data as any) || []);
      setEssences((e.data as any) || []);
      setFinishes((f.data as any) || []);
      setFormats((fm.data as any) || []);
      setPrices((p.data as any) || []);
      setAccessories((a.data as any) || []);
      setLoading(false);
    })();
  }, []);

  const collection = useMemo(() => collections.find(c => c.code === value.collectionCode) || null, [collections, value.collectionCode]);
  const essence    = useMemo(() => essences.find(e => e.code === value.essenceCode) || null, [essences, value.essenceCode]);
  const finish     = useMemo(() => finishes.find(f => f.code === value.finishCode) || null, [finishes, value.finishCode]);
  const format     = useMemo(() => formats.find(f => f.code === value.formatCode) || null, [formats, value.formatCode]);

  // Essenze disponibili per la collezione (solo quelle con almeno un prezzo nella collezione)
  const availableEssences = useMemo(() => {
    if (!collection) return [];
    const ids = new Set(prices.filter(p => p.collection_id === collection.id).map(p => p.essence_id));
    return essences.filter(e => ids.has(e.id));
  }, [collection, prices, essences]);

  const availableFinishes = useMemo(() => {
    if (!collection || !essence) return [];
    const ids = new Set(prices.filter(p => p.collection_id === collection.id && p.essence_id === essence.id).map(p => p.finish_id));
    return finishes.filter(f => ids.has(f.id));
  }, [collection, essence, prices, finishes]);

  const availableFormats = useMemo(() => {
    if (!collection || !essence || !finish) return [];
    const ids = new Set(prices.filter(p => p.collection_id === collection.id && p.essence_id === essence.id && p.finish_id === finish.id).map(p => p.format_id));
    return formats.filter(f => ids.has(f.id));
  }, [collection, essence, finish, prices, formats]);

  const currentPrice = useMemo(() => {
    if (!collection || !essence || !finish || !format) return null;
    return prices.find(p =>
      p.collection_id === collection.id &&
      p.essence_id === essence.id &&
      p.finish_id === finish.id &&
      p.format_id === format.id
    ) || null;
  }, [collection, essence, finish, format, prices]);

  // Quando cambia la price selezionata, aggiorno il valore esposto al parent
  useEffect(() => {
    onChange({
      ...value,
      collectionName: collection?.name || null,
      essenceName: essence ? `${essence.name}${essence.surface_treatment ? " — " + essence.surface_treatment : ""}` : null,
      finishName: finish?.name || null,
      formatName: format?.name || null,
      formatDims: format?.dimensions || null,
      listPrice: currentPrice?.list_price || null,
      supplierDiscountPct: currentPrice?.supplier_discount_pct || null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice?.list_price, collection?.id, essence?.id, finish?.id, format?.id]);

  // Reset a cascata
  const setCollection = (code: string) => onChange({ ...value, collectionCode: code || null, essenceCode: null, finishCode: null, formatCode: null });
  const setEssence    = (code: string) => onChange({ ...value, essenceCode: code || null, finishCode: null, formatCode: null });
  const setFinish     = (code: string) => onChange({ ...value, finishCode: code || null, formatCode: null });
  const setFormat     = (code: string) => onChange({ ...value, formatCode: code || null });

  // ─── Accessori ───
  const addAccessory = (a: Accessory) => {
    if (value.accessories.some(x => x.accId === a.id)) return;
    const costoUn = a.list_price * (1 - (a.supplier_discount_pct || 0) / 100);
    const prezzoUn = costoUn * MARKUP;
    onChange({
      ...value,
      accessories: [...value.accessories, { accId: a.id, name: a.name, category: a.category, unit: a.unit, qta: 1, costoUn: +costoUn.toFixed(2), prezzoUn: +prezzoUn.toFixed(2) }],
    });
  };
  const updAccQty = (accId: string, qta: number) => {
    onChange({ ...value, accessories: value.accessories.map(x => x.accId === accId ? { ...x, qta } : x) });
  };
  const delAcc = (accId: string) => {
    onChange({ ...value, accessories: value.accessories.filter(x => x.accId !== accId) });
  };

  const accCategories = useMemo(() => {
    const set = new Set(accessories.map(a => a.category));
    return Array.from(set);
  }, [accessories]);

  const [openCat, setOpenCat] = useState<string | null>(null);

  if (loading) return <div style={{ fontSize: 13, color: "#9A9890", padding: 12 }}>Caricamento catalogo Woodco…</div>;

  const fullSelection = currentPrice && collection && essence && finish && format;

  return (
    <div>
      {/* Step selettori */}
      <div style={styles.grid}>
        <div>
          <label style={styles.label}>Collezione</label>
          <select style={styles.select} value={value.collectionCode || ""} onChange={e => setCollection(e.target.value)}>
            <option value="">— Seleziona —</option>
            {collections.map(c => (
              <option key={c.id} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Essenza / Tonalità</label>
          <select style={styles.select} value={value.essenceCode || ""} onChange={e => setEssence(e.target.value)} disabled={!collection || availableEssences.length === 0}>
            <option value="">{!collection ? "Scegli prima collezione" : availableEssences.length ? "— Seleziona —" : "Nessuna essenza in DB"}</option>
            {availableEssences.map(e => (
              <option key={e.id} value={e.code}>{e.name}{e.surface_treatment ? ` — ${e.surface_treatment}` : ""}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.grid}>
        <div>
          <label style={styles.label}>Finitura</label>
          <select style={styles.select} value={value.finishCode || ""} onChange={e => setFinish(e.target.value)} disabled={!essence}>
            <option value="">{!essence ? "Scegli prima essenza" : "— Seleziona —"}</option>
            {availableFinishes.map(f => (
              <option key={f.id} value={f.code}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Formato</label>
          <select style={styles.select} value={value.formatCode || ""} onChange={e => setFormat(e.target.value)} disabled={!finish}>
            <option value="">{!finish ? "Scegli prima finitura" : "— Seleziona —"}</option>
            {availableFormats.map(f => (
              <option key={f.id} value={f.code}>{f.name}{f.dimensions ? ` · ${f.dimensions}` : ""}</option>
            ))}
          </select>
        </div>
      </div>

      {fullSelection && (
        <div style={styles.pillBox}>
          <b>{collection!.name}</b> — {essence!.name}{essence!.surface_treatment ? ` (${essence!.surface_treatment})` : ""} · {finish!.name} · {format!.name}
          <div style={{ marginTop: 4, fontSize: 12, color: "#6B6860" }}>
            Listino: <b>€ {currentPrice!.list_price.toFixed(2)}/{format!.unit}</b> · sconto fornitore {currentPrice!.supplier_discount_pct}%
          </div>
        </div>
      )}

      {/* ─── Accessori ─── */}
      {fullSelection && (
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px dashed #E0DDD8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em" }}>
              Accessori coordinati
            </div>
            <div style={{ fontSize: 11, color: "#9A9890" }}>aggiungi quanti ne servono</div>
          </div>

          {/* Categorie a tendina */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {accCategories.map(cat => {
              const open = openCat === cat;
              return (
                <button key={cat} type="button" onClick={() => setOpenCat(open ? null : cat)}
                  style={{ padding: "6px 12px", borderRadius: 7, border: open ? "1px solid #1A1A2E" : "1px solid #E0DDD8",
                    background: open ? "#1A1A2E" : "#fff", color: open ? "#fff" : "#1A1A2E", fontSize: 12, cursor: "pointer" }}>
                  {cat}
                </button>
              );
            })}
          </div>

          {openCat && (
            <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
              {accessories.filter(a => a.category === openCat).map(a => {
                const selected = value.accessories.some(x => x.accId === a.id);
                return (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 11px", borderRadius: 7, border: "1px solid #E0DDD8", background: selected ? "#F5F1E8" : "#fff" }}>
                    <div style={{ fontSize: 13, color: "#1A1A2E" }}>
                      {a.name}
                      <span style={{ fontSize: 11, color: "#9A9890", marginLeft: 8 }}>€ {a.list_price.toFixed(2)}/{a.unit}</span>
                    </div>
                    <button type="button" onClick={() => selected ? delAcc(a.id) : addAccessory(a)}
                      style={{ padding: "5px 11px", borderRadius: 6, border: "1px solid #1A1A2E", background: selected ? "#1A1A2E" : "transparent", color: selected ? "#fff" : "#1A1A2E", fontSize: 12, cursor: "pointer" }}>
                      {selected ? "✓ Aggiunto" : "+ Aggiungi"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Lista accessori aggiunti */}
          {value.accessories.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 11, color: "#9A9890", marginBottom: 6 }}>Nel preventivo</div>
              {value.accessories.map(a => (
                <div key={a.accId} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 100px 110px 28px", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: "#1A1A2E", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 10, color: "#9A9890", marginRight: 6 }}>{a.category}</span>
                    {a.name}
                  </div>
                  <div style={{ position: "relative" }}>
                    <input type="number" min={0} step={a.unit === "pz" ? 1 : 0.5} value={a.qta || ""}
                      onChange={e => updAccQty(a.accId, Number(e.target.value))}
                      style={{ width: "100%", padding: "7px 30px 7px 9px", borderRadius: 6, border: "1px solid #E0DDD8", fontSize: 12, textAlign: "right", boxSizing: "border-box" }} />
                    <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#9A9890" }}>{a.unit}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6B6860", textAlign: "right" }}>
                    € {(a.qta * a.prezzoUn).toFixed(2)}
                  </div>
                  <button type="button" onClick={() => delAcc(a.accId)} style={{ background: "none", border: "none", cursor: "pointer", color: "#A32D2D", fontSize: 18, padding: 0 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const emptyWoodcoSelection: WoodcoSelection = {
  collectionCode: null, collectionName: null,
  essenceCode: null, essenceName: null,
  finishCode: null, finishName: null,
  formatCode: null, formatName: null, formatDims: null,
  listPrice: null, supplierDiscountPct: null,
  accessories: [],
};
