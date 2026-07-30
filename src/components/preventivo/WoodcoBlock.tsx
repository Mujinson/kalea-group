import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fonte unica: catalog_products (brand Woodco).
 * Le righe migrate dalle vecchie tabelle wc_* hanno attributes.wc_source:
 *  - 'wc_prices'      → combinazione collezione / essenza / finitura / formato
 *  - 'wc_accessories' → accessori coordinati
 */

type WcProduct = {
  id: string;
  product_code: string;
  list_price: number;
  supplier_discount_percentage: number | null;
  unit_of_measure: string | null;
  attributes: any;
};

type Accessory = {
  id: string;
  category: string;
  name: string;
  unit: string;
  list_price: number;
  supplier_discount_pct: number;
  sort: number;
};

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

/** Estrae opzioni uniche (code+name) ordinate da una lista di prodotti. */
function uniqueBy(rows: WcProduct[], codeKey: string, nameKey: string, sortKey: string, extra?: string) {
  const map = new Map<string, { code: string; name: string; extra: string | null; sort: number }>();
  for (const r of rows) {
    const code = r.attributes?.[codeKey];
    if (!code || map.has(code)) continue;
    map.set(code, {
      code,
      name: r.attributes?.[nameKey] || code,
      extra: extra ? r.attributes?.[extra] ?? null : null,
      sort: Number(r.attributes?.[sortKey] ?? 0),
    });
  }
  return Array.from(map.values()).sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
}

export default function WoodcoBlock({
  value,
  onChange,
}: {
  value: WoodcoSelection;
  onChange: (v: WoodcoSelection) => void;
}) {
  const [products, setProducts] = useState<WcProduct[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = supabase as any;
      const [p, a] = await Promise.all([
        db.from("catalog_products")
          .select("id,product_code,list_price,supplier_discount_percentage,unit_of_measure,attributes")
          .eq("brand", "Woodco").eq("is_active", true)
          .contains("attributes", { wc_source: "wc_prices" }),
        db.from("catalog_products")
          .select("id,name,unit_of_measure,list_price,supplier_discount_percentage,attributes")
          .eq("brand", "Woodco").eq("is_active", true)
          .contains("attributes", { wc_source: "wc_accessories" }),
      ]);
      setProducts(((p.data as WcProduct[]) || []).filter((r) => r.attributes?.collection_code));
      setAccessories(
        ((a.data as any[]) || []).map((r) => ({
          id: r.id,
          category: r.attributes?.category || "Accessori",
          name: r.name,
          unit: r.unit_of_measure || "pz",
          list_price: Number(r.list_price || 0),
          supplier_discount_pct: Number(r.supplier_discount_percentage || 0),
          sort: Number(r.attributes?.sort_order ?? 0),
        })).sort((x, y) => x.sort - y.sort),
      );
      setLoading(false);
    })();
  }, []);

  const collections = useMemo(() => uniqueBy(products, "collection_code", "collection_name", "sort_collection"), [products]);

  const byCollection = useMemo(
    () => products.filter((p) => p.attributes?.collection_code === value.collectionCode),
    [products, value.collectionCode],
  );
  const availableEssences = useMemo(
    () => uniqueBy(byCollection, "essence_code", "essence_name", "sort_essence", "surface_treatment"),
    [byCollection],
  );

  const byEssence = useMemo(
    () => byCollection.filter((p) => p.attributes?.essence_code === value.essenceCode),
    [byCollection, value.essenceCode],
  );
  const availableFinishes = useMemo(
    () => uniqueBy(byEssence, "finish_code", "finish_name", "sort_finish"),
    [byEssence],
  );

  const byFinish = useMemo(
    () => byEssence.filter((p) => p.attributes?.finish_code === value.finishCode),
    [byEssence, value.finishCode],
  );
  const availableFormats = useMemo(
    () => uniqueBy(byFinish, "format_code", "format_name", "sort_format", "format_dimensions"),
    [byFinish],
  );

  const current = useMemo(
    () => byFinish.find((p) => p.attributes?.format_code === value.formatCode) || null,
    [byFinish, value.formatCode],
  );

  const collection = collections.find((c) => c.code === value.collectionCode) || null;
  const essence = availableEssences.find((e) => e.code === value.essenceCode) || null;
  const finish = availableFinishes.find((f) => f.code === value.finishCode) || null;
  const format = availableFormats.find((f) => f.code === value.formatCode) || null;

  // Quando cambia la combinazione selezionata, aggiorno il valore esposto al parent
  useEffect(() => {
    onChange({
      ...value,
      collectionName: collection?.name || null,
      essenceName: essence ? `${essence.name}${essence.extra ? " — " + essence.extra : ""}` : null,
      finishName: finish?.name || null,
      formatName: format?.name || null,
      formatDims: format?.extra || null,
      listPrice: current ? Number(current.list_price) : null,
      supplierDiscountPct: current ? Number(current.supplier_discount_percentage || 0) : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, value.collectionCode, value.essenceCode, value.finishCode, value.formatCode]);

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

  const accCategories = useMemo(() => Array.from(new Set(accessories.map(a => a.category))), [accessories]);

  const [openCat, setOpenCat] = useState<string | null>(null);

  if (loading) return <div style={{ fontSize: 13, color: "#9A9890", padding: 12 }}>Caricamento catalogo Woodco…</div>;

  const fullSelection = !!(current && collection && essence && finish && format);

  return (
    <div>
      {/* Step selettori */}
      <div style={styles.grid}>
        <div>
          <label style={styles.label}>Collezione</label>
          <select style={styles.select} value={value.collectionCode || ""} onChange={e => setCollection(e.target.value)}>
            <option value="">— Seleziona —</option>
            {collections.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Essenza / Tonalità</label>
          <select style={styles.select} value={value.essenceCode || ""} onChange={e => setEssence(e.target.value)} disabled={!collection || availableEssences.length === 0}>
            <option value="">{!collection ? "Scegli prima collezione" : availableEssences.length ? "— Seleziona —" : "Nessuna essenza in catalogo"}</option>
            {availableEssences.map(e => (
              <option key={e.code} value={e.code}>{e.name}{e.extra ? ` — ${e.extra}` : ""}</option>
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
              <option key={f.code} value={f.code}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Formato</label>
          <select style={styles.select} value={value.formatCode || ""} onChange={e => setFormat(e.target.value)} disabled={!finish}>
            <option value="">{!finish ? "Scegli prima finitura" : "— Seleziona —"}</option>
            {availableFormats.map(f => (
              <option key={f.code} value={f.code}>{f.name}{f.extra ? ` · ${f.extra}` : ""}</option>
            ))}
          </select>
        </div>
      </div>

      {fullSelection && (
        <div style={styles.pillBox}>
          <b>{collection!.name}</b> — {essence!.name}{essence!.extra ? ` (${essence!.extra})` : ""} · {finish!.name} · {format!.name}
          <div style={{ marginTop: 4, fontSize: 12, color: "#6B6860" }}>
            Listino: <b>€ {Number(current!.list_price).toFixed(2)}/{current!.unit_of_measure || "mq"}</b> · sconto fornitore {Number(current!.supplier_discount_percentage || 0)}%
            <span style={{ marginLeft: 8, fontSize: 11, color: "#9A9890" }}>cod. {current!.product_code}</span>
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
