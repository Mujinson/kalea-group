import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Tipi ────────────────────────────────────────────────────────────────────

export type TipoModulo =
  | "fornitura_posa"
  | "solo_fornitura"
  | "levigatura"
  | "verniciatura_pulizia"
  | "subappalto";

export type RigaContabilita = {
  id: string;
  desc: string;
  badge: string;
  badgeColor: string;
  um: string;
  qt: number;
  listino: number;
  sconto: number;
  ricarico: number;
  note?: string;
};

export type ModuloFornituraConf = {
  mqRiferimento: number;
  sfrido: number;
};

export type ModuloLevigatura = {
  mq: number;
  tipo: "rustica" | "fine" | "superfine";
  passate: number;
  costoInternoMq: number;
  ricarico: number;
};

export type ModuloVerniciatura = {
  mq: number;
  tipoProdotto: string;
  mani: number;
  includePulizia: boolean;
  costoInternoMq: number;
  ricarico: number;
  costoInternoPuliziaMq: number;
  ricaricoPulizia: number;
};

export type ModuloSubappalto = {
  modalita: "ore" | "forfait";
  ore: number;
  persone: number;
  tariffaOra: number;
  forfait: number;
  ricarico: number;
  desc: string;
};

export type Modulo = {
  id: string;
  tipo: TipoModulo;
  titolo: string;
  collapsed: boolean;
  righe: RigaContabilita[];
  confFornitura?: ModuloFornituraConf;
  confLevigatura?: ModuloLevigatura;
  confVerniciatura?: ModuloVerniciatura;
  confSubappalto?: ModuloSubappalto;
};

export type ServiziComuni = RigaContabilita[];

export type ClienteSnap = {
  nome: string;
  indirizzo: string;
  citta: string;
  telefono: string;
  email: string;
};

export type CrmLink = {
  id: string;
  source: "customer" | "lead";
  label: string;
} | null;

const emptyCliente = (): ClienteSnap => ({
  nome: "", indirizzo: "", citta: "", telefono: "", email: "",
});

// ─── Costanti ────────────────────────────────────────────────────────────────

const COSTO_POSA_INTERNO = 9.0;
const COSTO_LEVIGATURA: Record<string, number> = {
  rustica: 4.5, fine: 6.0, superfine: 8.0,
};
const COSTO_VERNICIATURA_INTERNO = 3.5;
const COSTO_PULIZIA_INTERNO = 1.5;

// ─── Helpers calcolo ─────────────────────────────────────────────────────────

export function costoNettoRiga(r: RigaContabilita): number {
  return r.listino * (1 - r.sconto / 100);
}
export function prezzoClienteRiga(r: RigaContabilita): number {
  return costoNettoRiga(r) * (1 + r.ricarico / 100);
}
export function speseTotRiga(r: RigaContabilita): number {
  return costoNettoRiga(r) * r.qt;
}
export function totalClienteRiga(r: RigaContabilita): number {
  return prezzoClienteRiga(r) * r.qt;
}
export function totaliModulo(modulo: Modulo): { costo: number; ricavi: number } {
  if (modulo.tipo === "fornitura_posa" || modulo.tipo === "solo_fornitura") {
    const costo = modulo.righe.reduce((s, r) => s + speseTotRiga(r), 0);
    const ricavi = modulo.righe.reduce((s, r) => s + totalClienteRiga(r), 0);
    return { costo, ricavi };
  }
  if (modulo.tipo === "levigatura" && modulo.confLevigatura) {
    const c = modulo.confLevigatura;
    const costo = c.costoInternoMq * c.mq;
    const ricavi = c.costoInternoMq * (1 + c.ricarico / 100) * c.mq;
    return { costo, ricavi };
  }
  if (modulo.tipo === "verniciatura_pulizia" && modulo.confVerniciatura) {
    const c = modulo.confVerniciatura;
    const costoV = c.costoInternoMq * c.mq;
    const ricaviV = c.costoInternoMq * (1 + c.ricarico / 100) * c.mq;
    const costoP = c.includePulizia ? c.costoInternoPuliziaMq * c.mq : 0;
    const ricaviP = c.includePulizia ? c.costoInternoPuliziaMq * (1 + c.ricaricoPulizia / 100) * c.mq : 0;
    return { costo: costoV + costoP, ricavi: ricaviV + ricaviP };
  }
  if (modulo.tipo === "subappalto" && modulo.confSubappalto) {
    const c = modulo.confSubappalto;
    const base = c.modalita === "ore" ? c.ore * c.persone * c.tariffaOra : c.forfait;
    const ricavi = base * (1 + c.ricarico / 100);
    return { costo: base, ricavi };
  }
  return { costo: 0, ricavi: 0 };
}

// ─── ID generator ─────────────────────────────────────────────────────────────
let _idCounter = 0;
const genId = () => `id_${Date.now()}_${++_idCounter}`;

// ─── Default moduli ───────────────────────────────────────────────────────────

function defaultModulo(tipo: TipoModulo): Modulo {
  const base = { id: genId(), tipo, collapsed: false, righe: [] as RigaContabilita[] };
  switch (tipo) {
    case "fornitura_posa":
      return {
        ...base,
        titolo: "Fornitura e Posa",
        confFornitura: { mqRiferimento: 0, sfrido: 5 },
        righe: [
          { id: genId(), desc: "Posa", badge: "Interno", badgeColor: "green", um: "Mq", qt: 0, listino: COSTO_POSA_INTERNO, sconto: 0, ricarico: 122 },
        ],
      };
    case "solo_fornitura":
      return { ...base, titolo: "Solo Fornitura", righe: [] };
    case "levigatura":
      return {
        ...base,
        titolo: "Levigatura",
        confLevigatura: { mq: 0, tipo: "fine", passate: 3, costoInternoMq: COSTO_LEVIGATURA["fine"], ricarico: 80 },
      };
    case "verniciatura_pulizia":
      return {
        ...base,
        titolo: "Verniciatura / Pulizia",
        confVerniciatura: {
          mq: 0, tipoProdotto: "Olio naturale", mani: 2, includePulizia: false,
          costoInternoMq: COSTO_VERNICIATURA_INTERNO, ricarico: 100,
          costoInternoPuliziaMq: COSTO_PULIZIA_INTERNO, ricaricoPulizia: 100,
        },
      };
    case "subappalto":
      return {
        ...base,
        titolo: "Subappalto manodopera",
        confSubappalto: { modalita: "ore", ore: 0, persone: 1, tariffaOra: 35, forfait: 0, ricarico: 30, desc: "" },
      };
  }
}

// ─── Selettore card definition ────────────────────────────────────────────────

const TIPI_INFO: { tipo: TipoModulo; titolo: string; desc: string; icona: string }[] = [
  { tipo: "fornitura_posa", titolo: "Fornitura e Posa", desc: "Materiali dal catalogo + accessori + manodopera. Calcola l'incidenza €/mq.", icona: "🏗️" },
  { tipo: "solo_fornitura", titolo: "Solo Fornitura", desc: "Solo materiali e accessori, senza posa.", icona: "📦" },
  { tipo: "levigatura", titolo: "Levigatura", desc: "Levigatura di pavimento esistente (rustica / fine / superfine).", icona: "⚙️" },
  { tipo: "verniciatura_pulizia", titolo: "Verniciatura / Pulizia", desc: "Verniciatura (olio, lacca, cera) e/o pulizia fine cantiere.", icona: "🎨" },
  { tipo: "subappalto", titolo: "Subappalto manodopera", desc: "Solo prestazione di manodopera (ore × persone × tariffa, oppure forfait).", icona: "👷" },
];

const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(Number.isFinite(n) ? n : 0);

// ─── Catalogo ─────────────────────────────────────────────────────────────────

export type CatalogProdotto = {
  product_code: string;
  name: string;
  collection: string;
  format: string;
  list_price: number;
  supplier_discount_percentage: number;
  brand_name: string;
};

const BADGE_STYLES: Record<string, { bg: string; fg: string }> = {
  "Flow": { bg: "#E6F1FB", fg: "#0C447C" },
  "Kronos": { bg: "#FCE4EC", fg: "#880E4F" },
  "Kronos Ceramiche": { bg: "#FCE4EC", fg: "#880E4F" },
  "BerryAlloc": { bg: "#FAEEDA", fg: "#633806" },
  "WoodCo": { bg: "#FFF3E0", fg: "#7B3A10" },
  "Parquet Woodco": { bg: "#FFF3E0", fg: "#7B3A10" },
  "Interno": { bg: "#EAF3DE", fg: "#27500A" },
  "Manuale": { bg: "#F1EFE8", fg: "#444441" },
};
const badgeStyle = (badge: string) =>
  BADGE_STYLES[badge] ?? { bg: "#F1EFE8", fg: "#444441" };


// ─── Componente ──────────────────────────────────────────────────────────────

export default function CreaContabilita() {
  const [fase, setFase] = useState<"selettore" | "lavoro">("selettore");
  const [tipiSelezionati, setTipiSelezionati] = useState<TipoModulo[]>([]);

  const [preventivoId, setPreventivoId] = useState<string | null>(null);
  const [numPrev, setNumPrev] = useState("");
  const [stato, setStato] = useState<"bozza" | "inviato" | "accettato" | "rifiutato">("bozza");
  const [cantiere, setCantiere] = useState("");
  const [ivaRate, setIvaRate] = useState(22);
  const [sconto, setSconto] = useState(0);
  const [acconto, setAcconto] = useState(0);
  const [noteCliente, setNoteCliente] = useState("");
  const [noteInterne, setNoteInterne] = useState("");

  const [cliente, setCliente] = useState<ClienteSnap>(emptyCliente());
  const [crmLink, setCrmLink] = useState<CrmLink>(null);

  const [moduli, setModuli] = useState<Modulo[]>([]);
  const [serviziComuni, setServiziComuni] = useState<ServiziComuni>([]);

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"contabilita" | "preventivo">("contabilita");
  const [catalogProdotti, setCatalogProdotti] = useState<CatalogProdotto[]>([]);

  useEffect(() => {
    supabase
      .from("catalog_products")
      .select("product_code, name, collection, format, list_price, supplier_discount_percentage, is_active, catalog_brands(name)")
      .eq("is_active", true)
      .gt("list_price", 0)
      .order("name")
      .then(({ data }) => {
        if (data) {
          setCatalogProdotti(data.map((p: any) => ({
            product_code: p.product_code,
            name: p.name,
            collection: p.collection ?? "",
            format: p.format ?? "",
            list_price: Number(p.list_price) || 0,
            supplier_discount_percentage: Number(p.supplier_discount_percentage) || 0,
            brand_name: (p.catalog_brands as any)?.name ?? "Altro",
          })));
        }
      });
  }, []);

  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const navigate = useNavigate();

  const totaliGlobali = useMemo(() => {
    let costoTot = 0;
    let ricaviLordi = 0;
    moduli.forEach(m => {
      const t = totaliModulo(m);
      costoTot += t.costo;
      ricaviLordi += t.ricavi;
    });
    serviziComuni.forEach(r => {
      costoTot += speseTotRiga(r);
      ricaviLordi += totalClienteRiga(r);
    });
    const scontoAmt = ricaviLordi * (sconto / 100);
    const imponibile = ricaviLordi - scontoAmt;
    const iva = imponibile * (ivaRate / 100);
    const totaleIva = imponibile + iva;
    const margineE = imponibile - costoTot;
    const marginePct = imponibile > 0 ? (margineE / imponibile) * 100 : 0;
    const residuo = totaleIva - acconto;
    return { costoTot, ricaviLordi, imponibile, iva, totaleIva, margineE, marginePct, residuo };
  }, [moduli, serviziComuni, sconto, ivaRate, acconto]);

  const toggleTipo = (t: TipoModulo) => {
    setTipiSelezionati(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const creaPreventivo = () => {
    if (tipiSelezionati.length === 0) return;
    setModuli(tipiSelezionati.map(t => defaultModulo(t)));
    setFase("lavoro");
  };

  const aggiungiModulo = (t: TipoModulo) => {
    setModuli(prev => [...prev, defaultModulo(t)]);
  };

  const marginColor =
    totaliGlobali.marginePct > 25 ? "text-green-600" :
    totaliGlobali.marginePct >= 10 ? "text-amber-600" :
    "text-red-600";

  // ─── FASE SELETTORE ─────────────────────────────────────────────────────────
  if (fase === "selettore") {
    return (
      <div className="min-h-screen bg-[#F7F1E7] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl mb-2" style={{ color: "#3B2314" }}>
              Kalēa — Nuovo Preventivo
            </h1>
            <p className="text-sm" style={{ color: "#8A7060" }}>
              Seleziona i tipi di lavoro da includere
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {TIPI_INFO.map((info, idx) => {
              const selected = tipiSelezionati.includes(info.tipo);
              const isSecondRow = idx >= 3;
              return (
                <button
                  key={info.tipo}
                  onClick={() => toggleTipo(info.tipo)}
                  className={`relative text-left rounded-lg p-5 bg-white transition-all border-2 ${
                    selected ? "border-blue-500 shadow-md" : "border-transparent hover:border-gray-200"
                  } ${isSecondRow && idx === 3 ? "md:col-start-1" : ""}`}
                >
                  {selected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                      ✓
                    </div>
                  )}
                  <div className="text-3xl mb-3">{info.icona}</div>
                  <h3 className="font-heading text-lg mb-1" style={{ color: "#3B2314" }}>
                    {info.titolo}
                  </h3>
                  <p className="text-xs" style={{ color: "#8A7060" }}>{info.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "#8A7060" }}>
                Cantiere / Riferimento
              </label>
              <input
                type="text"
                value={cantiere}
                onChange={(e) => setCantiere(e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                placeholder="Es. Villa Rossi — Assisi"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "#8A7060" }}>
                Nome cliente
              </label>
              <input
                type="text"
                value={cliente.nome}
                onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                placeholder="Es. Mario Rossi"
              />
            </div>
            <button
              onClick={creaPreventivo}
              disabled={tipiSelezionati.length === 0}
              className="w-full bg-blue-600 text-white rounded py-3 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              Crea preventivo →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── FASE LAVORO ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F1E7] pb-32">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => setFase("selettore")}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Nuovo preventivo
        </button>
        <div className="flex-1 flex items-center gap-2 justify-center">
          <input
            type="text"
            value={numPrev}
            onChange={(e) => setNumPrev(e.target.value)}
            placeholder="N° preventivo"
            className="border border-gray-200 rounded px-2 py-1 text-sm w-40"
          />
          <select
            value={stato}
            onChange={(e) => setStato(e.target.value as any)}
            className="border border-gray-200 rounded px-2 py-1 text-sm"
          >
            <option value="bozza">Bozza</option>
            <option value="inviato">Inviato</option>
            <option value="accettato">Accettato</option>
            <option value="rifiutato">Rifiutato</option>
          </select>
        </div>
        <button
          disabled={saving}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
        >
          Salva
        </button>
      </div>

      {/* BARRA CLIENTE */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          value={cantiere}
          onChange={(e) => setCantiere(e.target.value)}
          placeholder="Cantiere"
          className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
        />
        <input
          type="text"
          value={cliente.nome}
          onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
          placeholder="Cliente"
          className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">IVA %</label>
          <input
            type="number"
            value={ivaRate}
            onChange={(e) => setIvaRate(Number(e.target.value) || 0)}
            className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-white flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Sconto %</label>
          <input
            type="number"
            value={sconto}
            onChange={(e) => setSconto(Number(e.target.value) || 0)}
            className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-white flex-1"
          />
        </div>
      </div>

      {/* TAB BAR */}
      <div className="bg-white border-b border-gray-200 px-4 flex gap-1">
        {[
          { k: "contabilita", label: "Contabilità interna" },
          { k: "preventivo", label: "Preventivo cliente" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setActiveTab(t.k as any)}
            className={`px-4 py-3 text-sm border-b-2 transition ${
              activeTab === t.k
                ? "border-blue-600 text-blue-600 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CORPO */}
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {activeTab === "contabilita" ? (
          <>
            {moduli.map((modulo, idx) => {
              const updateModulo = (updated: Modulo) =>
                setModuli(prev => prev.map((m, i) => i === idx ? updated : m));
              const deleteModulo = () =>
                setModuli(prev => prev.filter((_, i) => i !== idx));

              if (modulo.tipo === "fornitura_posa" || modulo.tipo === "solo_fornitura") {
                return (
                  <ModuloFornituraSection
                    key={modulo.id}
                    modulo={modulo}
                    catalogProdotti={catalogProdotti}
                    onChange={updateModulo}
                    onDelete={deleteModulo}
                  />
                );
              }
              if (modulo.tipo === "levigatura") {
                return <ModuloLevigaturaSection key={modulo.id} modulo={modulo} onChange={updateModulo} onDelete={deleteModulo} />;
              }
              if (modulo.tipo === "verniciatura_pulizia") {
                return <ModuloVerniciaturaPuliziaSection key={modulo.id} modulo={modulo} onChange={updateModulo} onDelete={deleteModulo} />;
              }
              if (modulo.tipo === "subappalto") {
                return <ModuloSubappaltoSection key={modulo.id} modulo={modulo} onChange={updateModulo} onDelete={deleteModulo} />;
              }
              return null;
            })}

            <ServiziComuniSection
              righe={serviziComuni}
              onChange={setServiziComuni}
              catalogProdotti={catalogProdotti}
            />

            <AggiungiModuloButton onAdd={aggiungiModulo} />

          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
            Vista preventivo cliente — implementata nei prompt successivi.
          </div>
        )}
      </div>

      {/* BARRA TOTALI FISSA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-4 py-3 z-30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
          <Metric label="Spese Kalēa" value={eur(totaliGlobali.costoTot)} />
          <Metric label="Totale cliente" value={eur(totaliGlobali.imponibile)} />
          <Metric
            label="Utile lordo"
            value={eur(totaliGlobali.margineE)}
            valueClass={totaliGlobali.margineE > 0 ? "text-green-600" : "text-gray-700"}
          />
          <Metric
            label="Margine %"
            value={`${totaliGlobali.marginePct.toFixed(1)}%`}
            valueClass={marginColor}
          />
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Acconto ricevuto</label>
            <input
              type="number"
              value={acconto}
              onChange={(e) => setAcconto(Number(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded px-2 py-1 text-sm"
              placeholder="0"
            />
          </div>
          <Metric label="Residuo" value={eur(totaliGlobali.residuo)} valueClass="text-blue-600" />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, valueClass = "text-gray-900" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className={`font-heading text-lg tabular-nums ${valueClass}`}>{value}</div>
    </div>
  );
}

// ─── ModuloFornituraSection ──────────────────────────────────────────────────

type ModuloFornituraProps = {
  modulo: Modulo;
  onChange: (updated: Modulo) => void;
  onDelete: () => void;
  catalogProdotti: CatalogProdotto[];
};

function ModuloFornituraSection({ modulo, onChange, onDelete, catalogProdotti }: ModuloFornituraProps) {
  const isFP = modulo.tipo === "fornitura_posa";
  const conf = modulo.confFornitura ?? { mqRiferimento: 0, sfrido: 5 };

  const updateRiga = (idx: number, patch: Partial<RigaContabilita>) => {
    onChange({
      ...modulo,
      righe: modulo.righe.map((r, i) => i === idx ? { ...r, ...patch } : r),
    });
  };
  const deleteRiga = (idx: number) => {
    onChange({ ...modulo, righe: modulo.righe.filter((_, i) => i !== idx) });
  };
  const addRiga = (r: Omit<RigaContabilita, "id">) => {
    onChange({ ...modulo, righe: [...modulo.righe, { id: genId(), ...r }] });
  };

  const totaleClienteRighe = modulo.righe.reduce((s, r) => s + totalClienteRiga(r), 0);
  const incidenza = isFP && conf.mqRiferimento > 0 ? totaleClienteRighe / conf.mqRiferimento : 0;

  const handleDelete = () => {
    if (confirm(`Eliminare il modulo "${modulo.titolo}"?`)) onDelete();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-visible">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: isFP ? "#3B82F6" : "#9CA3AF" }}
        />
        <input
          type="text"
          value={modulo.titolo}
          onChange={(e) => onChange({ ...modulo, titolo: e.target.value })}
          className="flex-1 min-w-[200px] border-0 border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none text-base font-medium py-1 bg-transparent"
          style={{ color: "#3B2314" }}
        />
        {isFP && (
          <>
            <label className="text-xs text-gray-500 flex items-center gap-1">
              mq
              <input
                type="number"
                value={conf.mqRiferimento || ""}
                onChange={(e) => onChange({ ...modulo, confFornitura: { ...conf, mqRiferimento: Number(e.target.value) || 0 } })}
                className="w-20 border border-gray-200 rounded px-2 py-1 text-sm"
                placeholder="0"
                step="0.1"
              />
            </label>
            <label className="text-xs text-gray-500 flex items-center gap-1">
              sfrido %
              <input
                type="number"
                value={conf.sfrido}
                onChange={(e) => onChange({ ...modulo, confFornitura: { ...conf, sfrido: Number(e.target.value) || 0 } })}
                className="w-16 border border-gray-200 rounded px-2 py-1 text-sm"
              />
            </label>
          </>
        )}
        {isFP && conf.mqRiferimento > 0 && (
          <span className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-1 font-medium">
            Incidenza: {eur(incidenza)}/mq
          </span>
        )}
        <button
          onClick={() => onChange({ ...modulo, collapsed: !modulo.collapsed })}
          className="text-gray-500 hover:text-gray-800 px-2"
          title={modulo.collapsed ? "Espandi" : "Riduci"}
        >
          {modulo.collapsed ? "▸" : "▾"}
        </button>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 px-2"
          title="Elimina modulo"
        >
          ×
        </button>
      </div>

      {!modulo.collapsed && (
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "24%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "4%" }} />
              </colgroup>
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="text-left pb-2 pr-2">Descrizione</th>
                  <th className="text-right pb-2 px-1">UM</th>
                  <th className="text-right pb-2 px-1">Qt</th>
                  <th className="text-right pb-2 px-1">Listino €</th>
                  <th className="text-right pb-2 px-1">Sc%</th>
                  <th className="text-right pb-2 px-1">C. netto</th>
                  <th className="text-right pb-2 px-1">Spese Kalēa</th>
                  <th className="text-right pb-2 px-1">Ric%</th>
                  <th className="text-right pb-2 px-1">Pr.cliente</th>
                  <th className="text-right pb-2 px-1">Tot.cliente</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {modulo.righe.map((r, idx) => {
                  const bs = badgeStyle(r.badge);
                  const cn = costoNettoRiga(r);
                  const sp = speseTotRiga(r);
                  const pc = prezzoClienteRiga(r);
                  const tc = totalClienteRiga(r);
                  return (
                    <tr key={r.id} className="border-t border-gray-100">
                      <td className="py-1 pr-2">
                        <div className="flex items-center gap-1">
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                            style={{ background: bs.bg, color: bs.fg }}
                          >
                            {r.badge}
                          </span>
                          <input
                            type="text"
                            value={r.desc}
                            onChange={(e) => updateRiga(idx, { desc: e.target.value })}
                            className="flex-1 min-w-0 border border-gray-200 rounded px-2 py-1 text-xs"
                          />
                        </div>
                      </td>
                      <td className="py-1 px-1">
                        <select
                          value={r.um}
                          onChange={(e) => updateRiga(idx, { um: e.target.value })}
                          className="w-full border border-gray-200 rounded px-1 py-1 text-xs"
                        >
                          {["Mq", "Ml", "Kg", "N", "Km", "Ora", "Giorno"].map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1 px-1">
                        <input
                          type="number"
                          value={r.qt}
                          min={0}
                          step={0.1}
                          onChange={(e) => updateRiga(idx, { qt: Number(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-right"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <input
                          type="number"
                          value={r.listino}
                          min={0}
                          step={0.01}
                          onChange={(e) => updateRiga(idx, { listino: Number(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-right"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <input
                          type="number"
                          value={r.sconto}
                          min={0}
                          max={100}
                          onChange={(e) => updateRiga(idx, { sconto: Number(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-right"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <div className="bg-gray-50 border border-gray-200 rounded px-1 py-1 text-xs text-right tabular-nums text-gray-700">
                          {cn.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-1 px-1">
                        <div className="bg-gray-50 border border-gray-200 rounded px-1 py-1 text-xs text-right tabular-nums text-gray-700">
                          {sp.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-1 px-1">
                        <input
                          type="number"
                          value={r.ricarico}
                          onChange={(e) => updateRiga(idx, { ricarico: Number(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-right"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <div className="bg-gray-50 border border-gray-200 rounded px-1 py-1 text-xs text-right tabular-nums text-gray-700">
                          {pc.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-1 px-1">
                        <div className="bg-gray-50 border border-gray-200 rounded px-1 py-1 text-xs text-right tabular-nums font-semibold text-gray-900">
                          {tc.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-1 text-center">
                        <button
                          onClick={() => deleteRiga(idx)}
                          className="text-gray-300 hover:text-red-600 text-sm"
                          title="Elimina riga"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {modulo.righe.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center text-xs text-gray-400 py-4">
                      Nessuna riga. Aggiungi dal catalogo o manualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pulsanti aggiungi riga */}
          <div className="flex flex-wrap gap-2 mt-3">
            <CatalogPickerButton
              catalogProdotti={catalogProdotti}
              onPick={(p) => addRiga({
                desc: p.name + (p.format ? ` ${p.format}` : ""),
                badge: p.brand_name,
                badgeColor: "auto",
                um: "Mq",
                qt: isFP ? (conf.mqRiferimento * (1 + conf.sfrido / 100) || 1) : 1,
                listino: p.list_price,
                sconto: p.supplier_discount_percentage,
                ricarico: 100,
              })}
            />
            <AddRowBtn onClick={() => addRiga({ desc: "", badge: "Manuale", badgeColor: "gray", um: "Mq", qt: 1, listino: 0, sconto: 0, ricarico: 30 })}>
              + Riga manuale
            </AddRowBtn>
            {isFP && (
              <>
                <AddRowBtn onClick={() => addRiga({ desc: "Posa", badge: "Interno", badgeColor: "green", um: "Mq", qt: conf.mqRiferimento || 1, listino: 9, sconto: 0, ricarico: 122 })}>
                  + Posa
                </AddRowBtn>
                <AddRowBtn onClick={() => addRiga({ desc: "Tappetino", badge: "Interno", badgeColor: "green", um: "Mq", qt: conf.mqRiferimento || 1, listino: 1.5, sconto: 0, ricarico: 100 })}>
                  + Tappetino
                </AddRowBtn>
              </>
            )}
            <AddRowBtn onClick={() => addRiga({ desc: "Collante", badge: "Manuale", badgeColor: "gray", um: "Kg", qt: 1, listino: 2.3, sconto: 55, ricarico: 30 })}>
              + Collante
            </AddRowBtn>
            <AddRowBtn onClick={() => addRiga({ desc: "Battiscopa", badge: "Manuale", badgeColor: "gray", um: "Ml", qt: 1, listino: 6.3, sconto: 55, ricarico: 30 })}>
              + Battiscopa
            </AddRowBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function AddRowBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs border border-dashed border-gray-300 rounded px-3 py-1.5 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
    >
      {children}
    </button>
  );
}

// ─── CatalogPicker ────────────────────────────────────────────────────────────

function CatalogPickerButton({
  catalogProdotti,
  onPick,
}: {
  catalogProdotti: CatalogProdotto[];
  onPick: (p: CatalogProdotto) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return catalogProdotti.slice(0, 50);
    return catalogProdotti.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.collection.toLowerCase().includes(s) ||
      p.brand_name.toLowerCase().includes(s)
    ).slice(0, 80);
  }, [q, catalogProdotti]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="text-xs border border-dashed border-blue-300 rounded px-3 py-1.5 text-blue-700 hover:bg-blue-50 transition"
      >
        + Dal catalogo…
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-[420px] max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca prodotto, collezione o brand…"
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-xs text-gray-400 text-center">Nessun prodotto trovato</div>
            ) : (
              filtered.map((p, i) => {
                const bs = badgeStyle(p.brand_name);
                return (
                  <button
                    key={`${p.product_code}-${i}`}
                    onClick={() => { onPick(p); setOpen(false); setQ(""); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: bs.bg, color: bs.fg }}
                      >
                        {p.brand_name}
                      </span>
                      <span className="text-sm font-medium truncate flex-1" style={{ color: "#3B2314" }}>
                        {p.name}
                      </span>
                      <span className="text-xs text-gray-600 tabular-nums">
                        {eur(p.list_price)}/mq
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {[p.collection, p.format].filter(Boolean).join(" · ")}
                      {p.supplier_discount_percentage > 0 && ` · sc ${p.supplier_discount_percentage}%`}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ServiziComuniSection ────────────────────────────────────────────────────

function ServiziComuniSection({
  righe,
  onChange,
  catalogProdotti,
}: {
  righe: RigaContabilita[];
  onChange: (r: RigaContabilita[]) => void;
  catalogProdotti: CatalogProdotto[];
}) {
  const updateRiga = (idx: number, patch: Partial<RigaContabilita>) =>
    onChange(righe.map((r, i) => i === idx ? { ...r, ...patch } : r));
  const deleteRiga = (idx: number) => onChange(righe.filter((_, i) => i !== idx));
  const addRiga = (r: Omit<RigaContabilita, "id">) =>
    onChange([...righe, { id: genId(), ...r }]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-3 h-3 rounded-full" style={{ background: "#8A7060" }} />
        <h3 className="font-medium" style={{ color: "#3B2314" }}>Servizi comuni</h3>
        <span className="text-xs text-gray-500">Trasporto, sopralluogo, smaltimento…</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "24%" }} />
            <col style={{ width: "5%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "5%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "5%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "4%" }} />
          </colgroup>
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-500">
              <th className="text-left pb-2 pr-2">Descrizione</th>
              <th className="text-right pb-2 px-1">UM</th>
              <th className="text-right pb-2 px-1">Qt</th>
              <th className="text-right pb-2 px-1">Listino €</th>
              <th className="text-right pb-2 px-1">Sc%</th>
              <th className="text-right pb-2 px-1">C. netto</th>
              <th className="text-right pb-2 px-1">Spese Kalēa</th>
              <th className="text-right pb-2 px-1">Ric%</th>
              <th className="text-right pb-2 px-1">Pr.cliente</th>
              <th className="text-right pb-2 px-1">Tot.cliente</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {righe.map((r, idx) => {
              const bs = badgeStyle(r.badge);
              return (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="py-1 pr-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{ background: bs.bg, color: bs.fg }}>{r.badge}</span>
                      <input type="text" value={r.desc} onChange={(e) => updateRiga(idx, { desc: e.target.value })} className="flex-1 min-w-0 border border-gray-200 rounded px-2 py-1 text-xs" />
                    </div>
                  </td>
                  <td className="py-1 px-1">
                    <select value={r.um} onChange={(e) => updateRiga(idx, { um: e.target.value })} className="w-full border border-gray-200 rounded px-1 py-1 text-xs">
                      {["Mq", "Ml", "Kg", "N", "Km", "Ora", "Giorno"].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="py-1 px-1"><input type="number" value={r.qt} min={0} step={0.1} onChange={(e) => updateRiga(idx, { qt: Number(e.target.value) || 0 })} className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-right" /></td>
                  <td className="py-1 px-1"><input type="number" value={r.listino} min={0} step={0.01} onChange={(e) => updateRiga(idx, { listino: Number(e.target.value) || 0 })} className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-right" /></td>
                  <td className="py-1 px-1"><input type="number" value={r.sconto} min={0} max={100} onChange={(e) => updateRiga(idx, { sconto: Number(e.target.value) || 0 })} className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-right" /></td>
                  <td className="py-1 px-1"><div className="bg-gray-50 border border-gray-200 rounded px-1 py-1 text-xs text-right tabular-nums text-gray-700">{costoNettoRiga(r).toFixed(2)}</div></td>
                  <td className="py-1 px-1"><div className="bg-gray-50 border border-gray-200 rounded px-1 py-1 text-xs text-right tabular-nums text-gray-700">{speseTotRiga(r).toFixed(2)}</div></td>
                  <td className="py-1 px-1"><input type="number" value={r.ricarico} onChange={(e) => updateRiga(idx, { ricarico: Number(e.target.value) || 0 })} className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-right" /></td>
                  <td className="py-1 px-1"><div className="bg-gray-50 border border-gray-200 rounded px-1 py-1 text-xs text-right tabular-nums text-gray-700">{prezzoClienteRiga(r).toFixed(2)}</div></td>
                  <td className="py-1 px-1"><div className="bg-gray-50 border border-gray-200 rounded px-1 py-1 text-xs text-right tabular-nums font-semibold text-gray-900">{totalClienteRiga(r).toFixed(2)}</div></td>
                  <td className="py-1 text-center">
                    <button onClick={() => deleteRiga(idx)} className="text-gray-300 hover:text-red-600 text-sm">×</button>
                  </td>
                </tr>
              );
            })}
            {righe.length === 0 && (
              <tr><td colSpan={11} className="text-center text-xs text-gray-400 py-3">Nessun servizio comune.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <CatalogPickerButton
          catalogProdotti={catalogProdotti}
          onPick={(p) => addRiga({
            desc: p.name + (p.format ? ` ${p.format}` : ""),
            badge: p.brand_name,
            badgeColor: "auto",
            um: "Mq",
            qt: 1,
            listino: p.list_price,
            sconto: p.supplier_discount_percentage,
            ricarico: 100,
          })}
        />
        <AddRowBtn onClick={() => addRiga({ desc: "", badge: "Manuale", badgeColor: "gray", um: "N", qt: 1, listino: 0, sconto: 0, ricarico: 30 })}>
          + Riga manuale
        </AddRowBtn>
      </div>
    </div>
  );
}


// ─── Header condiviso moduli specialistici ───────────────────────────────────

function SpecialHeader({
  color, titolo, onTitleChange, badge, collapsed, onToggleCollapse, onDelete,
}: {
  color: string;
  titolo: string;
  onTitleChange: (v: string) => void;
  badge?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
      <input
        type="text"
        value={titolo}
        onChange={(e) => onTitleChange(e.target.value)}
        className="flex-1 min-w-[200px] border-0 border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none text-base font-medium py-1 bg-transparent"
        style={{ color: "#3B2314" }}
      />
      {badge && (
        <span className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-1 font-medium">{badge}</span>
      )}
      <button onClick={onToggleCollapse} className="text-gray-500 hover:text-gray-800 px-2">
        {collapsed ? "▸" : "▾"}
      </button>
      <button
        onClick={() => { if (confirm(`Eliminare "${titolo}"?`)) onDelete(); }}
        className="text-gray-400 hover:text-red-600 px-2"
      >
        ×
      </button>
    </div>
  );
}

function ReadonlyCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm tabular-nums text-gray-800">
        {value}
      </div>
    </div>
  );
}

function LabeledInput({
  label, type = "number", value, onChange, step, min, max, placeholder,
}: {
  label: string;
  type?: string;
  value: string | number;
  onChange: (v: string) => void;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
      />
    </div>
  );
}

// ─── ModuloLevigaturaSection ─────────────────────────────────────────────────

function ModuloLevigaturaSection({
  modulo, onChange, onDelete,
}: { modulo: Modulo; onChange: (m: Modulo) => void; onDelete: () => void }) {
  const c = modulo.confLevigatura ?? { mq: 0, tipo: "fine" as const, passate: 3, costoInternoMq: COSTO_LEVIGATURA["fine"], ricarico: 80 };
  const update = (patch: Partial<ModuloLevigatura>) =>
    onChange({ ...modulo, confLevigatura: { ...c, ...patch } });

  const prezzoMq = c.costoInternoMq * (1 + c.ricarico / 100);
  const totale = prezzoMq * c.mq;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <SpecialHeader
        color="#F59E0B"
        titolo={modulo.titolo}
        onTitleChange={(v) => onChange({ ...modulo, titolo: v })}
        badge={c.mq > 0 ? `${eur(prezzoMq)}/mq` : undefined}
        collapsed={modulo.collapsed}
        onToggleCollapse={() => onChange({ ...modulo, collapsed: !modulo.collapsed })}
        onDelete={onDelete}
      />
      {!modulo.collapsed && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <LabeledInput label="mq da levigare" value={c.mq || ""} onChange={(v) => update({ mq: Number(v) || 0 })} step={0.1} min={0} />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Tipo levigatura</div>
              <select
                value={c.tipo}
                onChange={(e) => {
                  const t = e.target.value as ModuloLevigatura["tipo"];
                  update({ tipo: t, costoInternoMq: COSTO_LEVIGATURA[t] });
                }}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
              >
                <option value="rustica">Rustica</option>
                <option value="fine">Fine</option>
                <option value="superfine">Superfine</option>
              </select>
            </div>
            <LabeledInput label="N. passate" value={c.passate} onChange={(v) => update({ passate: Number(v) || 0 })} min={1} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
            <ReadonlyCell label="Costo interno" value={`${eur(c.costoInternoMq)}/mq`} />
            <LabeledInput label="Ricarico %" value={c.ricarico} onChange={(v) => update({ ricarico: Number(v) || 0 })} />
            <ReadonlyCell label="Prezzo cliente/mq" value={eur(prezzoMq)} />
            <ReadonlyCell label="Totale cliente" value={eur(totale)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ModuloVerniciaturaPuliziaSection ────────────────────────────────────────

const TIPI_PRODOTTO_VERNICE = [
  "Olio naturale", "Olio colorato", "Lacca satinata", "Lacca opaca", "Cera", "Prodotto cliente",
];

function ModuloVerniciaturaPuliziaSection({
  modulo, onChange, onDelete,
}: { modulo: Modulo; onChange: (m: Modulo) => void; onDelete: () => void }) {
  const c = modulo.confVerniciatura ?? {
    mq: 0, tipoProdotto: "Olio naturale", mani: 2, includePulizia: false,
    costoInternoMq: COSTO_VERNICIATURA_INTERNO, ricarico: 100,
    costoInternoPuliziaMq: COSTO_PULIZIA_INTERNO, ricaricoPulizia: 100,
  };
  const update = (patch: Partial<ModuloVerniciatura>) =>
    onChange({ ...modulo, confVerniciatura: { ...c, ...patch } });

  const prezzoVernMq = c.costoInternoMq * (1 + c.ricarico / 100);
  const totVern = prezzoVernMq * c.mq;
  const prezzoPulMq = c.costoInternoPuliziaMq * (1 + c.ricaricoPulizia / 100);
  const totPul = c.includePulizia ? prezzoPulMq * c.mq : 0;
  const totale = totVern + totPul;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <SpecialHeader
        color="#A855F7"
        titolo={modulo.titolo}
        onTitleChange={(v) => onChange({ ...modulo, titolo: v })}
        badge={c.mq > 0 ? `Tot ${eur(totale)}` : undefined}
        collapsed={modulo.collapsed}
        onToggleCollapse={() => onChange({ ...modulo, collapsed: !modulo.collapsed })}
        onDelete={onDelete}
      />
      {!modulo.collapsed && (
        <div className="p-5 space-y-5">
          {/* Blocco A — verniciatura */}
          <div>
            <div className="text-xs uppercase tracking-wider text-purple-700 mb-2 font-medium">Verniciatura</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <LabeledInput label="mq" value={c.mq || ""} onChange={(v) => update({ mq: Number(v) || 0 })} step={0.1} min={0} />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Tipo prodotto</div>
                <select
                  value={c.tipoProdotto}
                  onChange={(e) => update({ tipoProdotto: e.target.value })}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                >
                  {TIPI_PRODOTTO_VERNICE.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <LabeledInput label="N. mani" value={c.mani} onChange={(v) => update({ mani: Number(v) || 0 })} min={1} />
              <LabeledInput label="Ricarico %" value={c.ricarico} onChange={(v) => update({ ricarico: Number(v) || 0 })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <ReadonlyCell label="Costo interno/mq" value={eur(c.costoInternoMq)} />
              <ReadonlyCell label="Prezzo cliente/mq" value={eur(prezzoVernMq)} />
              <ReadonlyCell label="Totale cliente" value={eur(totVern)} />
            </div>
          </div>

          {/* Blocco B — pulizia */}
          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={c.includePulizia}
                onChange={(e) => update({ includePulizia: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-xs uppercase tracking-wider text-purple-700 font-medium">
                Pulizia fine cantiere
              </span>
            </label>
            {c.includePulizia && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <ReadonlyCell label="mq (=verniciatura)" value={c.mq.toString()} />
                <LabeledInput label="Ricarico %" value={c.ricaricoPulizia} onChange={(v) => update({ ricaricoPulizia: Number(v) || 0 })} />
                <ReadonlyCell label="Prezzo cliente/mq" value={eur(prezzoPulMq)} />
                <ReadonlyCell label="Totale pulizia" value={eur(totPul)} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ModuloSubappaltoSection ─────────────────────────────────────────────────

function ModuloSubappaltoSection({
  modulo, onChange, onDelete,
}: { modulo: Modulo; onChange: (m: Modulo) => void; onDelete: () => void }) {
  const c = modulo.confSubappalto ?? {
    modalita: "ore" as const, ore: 0, persone: 1, tariffaOra: 35, forfait: 0, ricarico: 30, desc: "",
  };
  const update = (patch: Partial<ModuloSubappalto>) =>
    onChange({ ...modulo, confSubappalto: { ...c, ...patch } });

  const costo = c.modalita === "ore" ? c.ore * c.persone * c.tariffaOra : c.forfait;
  const ricaricoE = costo * (c.ricarico / 100);
  const totale = costo + ricaricoE;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <SpecialHeader
        color="#991B1B"
        titolo={modulo.titolo}
        onTitleChange={(v) => onChange({ ...modulo, titolo: v })}
        badge={totale > 0 ? `Tot ${eur(totale)}` : undefined}
        collapsed={modulo.collapsed}
        onToggleCollapse={() => onChange({ ...modulo, collapsed: !modulo.collapsed })}
        onDelete={onDelete}
      />
      {!modulo.collapsed && (
        <div className="p-5 space-y-4">
          {/* Toggle modalità */}
          <div className="flex gap-1 bg-gray-100 rounded p-1 w-fit">
            {[
              { k: "ore", label: "Ore × Persone × Tariffa" },
              { k: "forfait", label: "Forfait" },
            ].map(m => (
              <button
                key={m.k}
                onClick={() => update({ modalita: m.k as "ore" | "forfait" })}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                  c.modalita === m.k ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Descrizione lavoro</div>
            <input
              type="text"
              value={c.desc}
              onChange={(e) => update({ desc: e.target.value })}
              placeholder="Es. Rimozione vecchio pavimento e preparazione fondo"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            />
          </div>

          {c.modalita === "ore" ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <LabeledInput label="Ore tot" value={c.ore || ""} onChange={(v) => update({ ore: Number(v) || 0 })} step={0.5} min={0} />
                <LabeledInput label="Persone" value={c.persone} onChange={(v) => update({ persone: Number(v) || 0 })} min={1} />
                <LabeledInput label="€/ora" value={c.tariffaOra} onChange={(v) => update({ tariffaOra: Number(v) || 0 })} step={0.5} min={0} />
                <LabeledInput label="Ricarico %" value={c.ricarico} onChange={(v) => update({ ricarico: Number(v) || 0 })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                <ReadonlyCell label="Costo manodopera" value={eur(costo)} />
                <ReadonlyCell label="Ricarico €" value={eur(ricaricoE)} />
                <ReadonlyCell label="Totale cliente" value={eur(totale)} />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <LabeledInput label="Forfait €" value={c.forfait || ""} onChange={(v) => update({ forfait: Number(v) || 0 })} step={10} min={0} />
                <LabeledInput label="Ricarico %" value={c.ricarico} onChange={(v) => update({ ricarico: Number(v) || 0 })} />
              </div>
              <div className="pt-2 border-t border-gray-100">
                <ReadonlyCell label="Totale cliente" value={eur(totale)} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AggiungiModuloButton (popup) ────────────────────────────────────────────

function AggiungiModuloButton({ onAdd }: { onAdd: (t: TipoModulo) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative pt-2" ref={wrapRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="bg-white border-2 border-dashed border-blue-300 text-blue-700 rounded-lg px-4 py-3 text-sm font-medium hover:bg-blue-50 transition w-full md:w-auto"
      >
        + Aggiungi modulo
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-[360px] max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {TIPI_INFO.map(info => (
            <button
              key={info.tipo}
              onClick={() => { onAdd(info.tipo); setOpen(false); }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-start gap-3"
            >
              <span className="text-xl">{info.icona}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium" style={{ color: "#3B2314" }}>{info.titolo}</div>
                <div className="text-[11px] text-gray-500 leading-snug">{info.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
