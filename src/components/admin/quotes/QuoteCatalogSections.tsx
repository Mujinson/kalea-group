import { useState } from "react";
import CatalogProductPicker, { CatalogProduct } from "@/components/admin/cantieri/CatalogProductPicker";
import { Plus, Trash2, X, GripVertical } from "lucide-react";

export interface CatalogLine {
  id: string;
  catalog_id?: string | null;
  code?: string | null;
  name: string;
  description?: string | null;
  quantity: number;
  unit_price: number;
  unit: string;
  discount_pct: number;
}

const ARTICOLI_CATS = ["Pavimenti", "Ceramiche", "Rivestimenti parete", "Soffitti", "Sottofondi", "Outdoor"];
const ACCESSORI_CATS = ["Accessori"];
const SERVIZI_CATS = ["Servizi"];

const euro = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n || 0);

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E0DDD8",
  borderRadius: 12,
  padding: 20,
  marginBottom: 14,
};
const titleStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: "#9A9890",
  textTransform: "uppercase",
  letterSpacing: ".07em",
  marginBottom: 14,
  paddingBottom: 8,
  borderBottom: "1px solid #E0DDD8",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

function lineFromCatalog(p: CatalogProduct): CatalogLine {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    catalog_id: p.id,
    code: p.product_code,
    name: p.name,
    description: [p.brand, p.collection, p.format, p.color].filter(Boolean).join(" · ") || null,
    quantity: 1,
    unit_price: Number(p.list_price) || 0,
    unit: p.unit_of_measure || "pz",
    discount_pct: 0,
  };
}
function emptyLine(unit = "a corpo"): CatalogLine {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    catalog_id: null,
    code: null,
    name: "",
    description: null,
    quantity: 1,
    unit_price: 0,
    unit,
    discount_pct: 0,
  };
}

const GRID = "22px 90px minmax(0,2fr) 70px 80px 90px 90px 26px";

function HeaderRow() {
  const th: React.CSSProperties = { fontSize: 10, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".06em" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 6, padding: "0 12px 6px", alignItems: "center" }}>
      <span />
      <span style={th}>Codice</span>
      <span style={th}>Descrizione</span>
      <span style={th}>Unità</span>
      <span style={{ ...th, textAlign: "right" }}>Q.tà</span>
      <span style={{ ...th, textAlign: "right" }}>Prezzo</span>
      <span style={{ ...th, textAlign: "right" }}>Sconto %</span>
      <span />
    </div>
  );
}

function LineRow({
  line,
  onChange,
  onDelete,
  ivaRate,
  dragging,
  dragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  line: CatalogLine;
  onChange: (patch: Partial<CatalogLine>) => void;
  onDelete: () => void;
  ivaRate: number;
  dragging?: boolean;
  dragOver?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
}) {
  const lordo = (Number(line.quantity) || 0) * (Number(line.unit_price) || 0);
  const imponibile = lordo * (1 - (Number(line.discount_pct) || 0) / 100);
  const iva = imponibile * ((Number(ivaRate) || 0) / 100);
  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => { e.preventDefault(); onDrop?.(); }}
      style={{
        padding: "10px 12px",
        borderRadius: 8,
        border: dragOver ? "1px solid #C8A96E" : "1px solid #E0DDD8",
        boxShadow: dragOver ? "0 -2px 0 #C8A96E inset" : undefined,
        background: "#FBFAF7",
        marginBottom: 10,
        opacity: dragging ? 0.45 : 1,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 6, alignItems: "center" }}>
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          title="Trascina per riordinare"
          style={{ cursor: "grab", color: "#9A9890", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <input
          value={line.code || ""}
          onChange={(e) => onChange({ code: e.target.value })}
          placeholder="Codice"
          style={{ padding: "7px 8px", borderRadius: 6, border: "1px solid #E0DDD8", fontSize: 12, minWidth: 0 }}
        />

        <div style={{ minWidth: 0 }}>
          <input
            value={line.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Descrizione"
            style={{ width: "100%", padding: "7px 8px", borderRadius: 6, border: "1px solid #E0DDD8", fontSize: 12, minWidth: 0, boxSizing: "border-box", fontWeight: 500 }}
          />
          {line.description && <div style={{ fontSize: 10, color: "#9A9890", marginTop: 3 }}>{line.description}</div>}
        </div>
        <input
          value={line.unit}
          onChange={(e) => onChange({ unit: e.target.value })}
          placeholder="Unità"
          style={{ padding: "7px 8px", borderRadius: 6, border: "1px solid #E0DDD8", fontSize: 12, minWidth: 0 }}
        />
        <input
          type="number"
          step="0.01"
          value={line.quantity}
          onChange={(e) => onChange({ quantity: Number(e.target.value) })}
          style={{ padding: "7px 8px", borderRadius: 6, border: "1px solid #E0DDD8", fontSize: 12, textAlign: "right", minWidth: 0 }}
        />
        <div style={{ position: "relative" }}>
          <input
            type="number"
            step="0.01"
            value={line.unit_price}
            onChange={(e) => onChange({ unit_price: Number(e.target.value) })}
            style={{ width: "100%", padding: "7px 20px 7px 8px", borderRadius: 6, border: "1px solid #E0DDD8", fontSize: 12, textAlign: "right", boxSizing: "border-box" }}
          />
          <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#9A9890" }}>€</span>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type="number"
            step="0.1"
            title="Sconto sulla riga (non è l'IVA)"
            value={line.discount_pct}
            onChange={(e) => onChange({ discount_pct: Number(e.target.value) })}
            style={{ width: "100%", padding: "7px 20px 7px 8px", borderRadius: 6, border: "1px solid #E0DDD8", fontSize: 12, textAlign: "right", boxSizing: "border-box" }}
          />
          <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#9A9890" }}>%</span>
        </div>
        <button onClick={onDelete} title="Elimina" style={{ background: "none", border: "none", cursor: "pointer", color: "#A32D2D", padding: 0 }}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div style={{ marginTop: 6, textAlign: "right", fontSize: 11, color: "#6B6860" }}>
        Imponibile <b style={{ color: "#1A1A2E" }}>{euro(imponibile)}</b> · IVA {ivaRate}% <b style={{ color: "#1A1A2E" }}>{euro(iva)}</b> · Totale <b style={{ color: "#1A1A2E" }}>{euro(imponibile + iva)}</b>
      </div>
    </div>
  );
}


function Section({
  title,
  lines,
  setLines,
  categoryNames,
  defaultUnit,
  allowManual = true,
  ivaRate,
}: {
  title: string;
  lines: CatalogLine[];
  setLines: (next: CatalogLine[]) => void;
  categoryNames: string[];
  defaultUnit?: string;
  allowManual?: boolean;
  ivaRate: number;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSel, setPickerSel] = useState<CatalogProduct | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const moveLine = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const from = lines.findIndex((l) => l.id === fromId);
    const to = lines.findIndex((l) => l.id === toId);
    if (from < 0 || to < 0) return;
    const next = [...lines];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLines(next);
  };

  const total = lines.reduce((s, l) => {
    const lordo = (Number(l.quantity) || 0) * (Number(l.unit_price) || 0);
    return s + lordo * (1 - (Number(l.discount_pct) || 0) / 100);
  }, 0);
  const totalIva = total * (1 + (Number(ivaRate) || 0) / 100);

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>
        <span>
          {title} <span style={{ color: "#6B6860", marginLeft: 6 }}>({lines.length})</span>
        </span>
        <span style={{ fontSize: 12, color: "#1A1A2E", textTransform: "none", letterSpacing: 0, fontWeight: 600 }}>
          Imponibile {euro(total)} · IVA {ivaRate}% → {euro(totalIva)}
        </span>
      </div>

      {lines.length === 0 && (
        <div style={{ fontSize: 12, color: "#9A9890", fontStyle: "italic", padding: "6px 0 12px" }}>
          Nessun {title.toLowerCase().replace(/[aeiou]$/, "")} aggiunto. Usa i pulsanti sotto.
        </div>
      )}

      {lines.length > 0 && <HeaderRow />}

      {lines.map((l) => (
        <LineRow
          key={l.id}
          line={l}
          ivaRate={ivaRate}
          dragging={dragId === l.id}
          dragOver={overId === l.id && dragId !== l.id}
          onDragStart={() => setDragId(l.id)}
          onDragOver={(e) => { e.preventDefault(); setOverId(l.id); }}
          onDrop={() => { if (dragId) moveLine(dragId, l.id); setDragId(null); setOverId(null); }}
          onDragEnd={() => { setDragId(null); setOverId(null); }}
          onChange={(patch) => setLines(lines.map((x) => (x.id === l.id ? { ...x, ...patch } : x)))}
          onDelete={() => setLines(lines.filter((x) => x.id !== l.id))}
        />
      ))}



      {pickerOpen && (
        <div style={{ padding: 12, border: "1px dashed #C8A96E", borderRadius: 8, marginBottom: 10, background: "#FEFCF6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1A2E" }}>Seleziona dal catalogo</div>
            <button onClick={() => { setPickerOpen(false); setPickerSel(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B6860" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <CatalogProductPicker value={pickerSel} onChange={setPickerSel} categoryNames={categoryNames} />
          {pickerSel && (
            <div style={{ marginTop: 8, display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setLines([...lines, lineFromCatalog(pickerSel)]);
                  setPickerSel(null);
                }}
                style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #E0DDD8", background: "#fff", cursor: "pointer", fontSize: 12, color: "#1A1A2E" }}
              >
                Aggiungi e continua
              </button>
              <button
                onClick={() => {
                  setLines([...lines, lineFromCatalog(pickerSel)]);
                  setPickerSel(null);
                  setPickerOpen(false);
                }}
                style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "#1A1A2E", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500 }}
              >
                Aggiungi e chiudi
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={() => setPickerOpen(true)}
          style={{ padding: "8px 14px", borderRadius: 7, border: "1px solid #1A1A2E", background: "#1A1A2E", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <Plus className="w-3.5 h-3.5" /> Seleziona dal catalogo
        </button>
        {allowManual && (
          <button
            onClick={() => setLines([...lines, emptyLine(defaultUnit)])}
            style={{ padding: "8px 14px", borderRadius: 7, border: "1px solid #E0DDD8", background: "#fff", color: "#1A1A2E", cursor: "pointer", fontSize: 12 }}
          >
            + Riga manuale
          </button>
        )}
      </div>
    </div>
  );
}

export default function QuoteCatalogSections({
  articoli,
  setArticoli,
  accessori,
  setAccessori,
  servizi,
  setServizi,
  ivaRate = 22,
}: {
  articoli: CatalogLine[];
  setArticoli: (v: CatalogLine[]) => void;
  accessori: CatalogLine[];
  setAccessori: (v: CatalogLine[]) => void;
  servizi: CatalogLine[];
  setServizi: (v: CatalogLine[]) => void;
  ivaRate?: number;
}) {
  return (
    <div>
      <Section title="Articoli" lines={articoli} setLines={setArticoli} categoryNames={ARTICOLI_CATS} defaultUnit="mq" ivaRate={ivaRate} />
      <Section title="Accessori" lines={accessori} setLines={setAccessori} categoryNames={ACCESSORI_CATS} defaultUnit="pz" ivaRate={ivaRate} />
      <Section title="Servizi" lines={servizi} setLines={setServizi} categoryNames={SERVIZI_CATS} defaultUnit="a corpo" ivaRate={ivaRate} />
    </div>
  );
}


export function catalogLinesTotal(lines: CatalogLine[]): number {
  return lines.reduce((s, l) => {
    const lordo = (Number(l.quantity) || 0) * (Number(l.unit_price) || 0);
    return s + lordo * (1 - (Number(l.discount_pct) || 0) / 100);
  }, 0);
}
