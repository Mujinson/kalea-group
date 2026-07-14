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
            {moduli.map((m) => (
              <div key={m.id} className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="font-heading text-lg mb-2" style={{ color: "#3B2314" }}>
                  {m.titolo}
                </h3>
                <p className="text-xs text-gray-500">
                  Modulo <code>{m.tipo}</code> — griglia righe implementata nei prompt successivi.
                </p>
              </div>
            ))}

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-heading text-lg mb-2" style={{ color: "#3B2314" }}>
                Servizi comuni
              </h3>
              <p className="text-xs text-gray-500">
                Trasporto, sopralluogo, smaltimento — implementati nei prompt successivi.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-sm text-gray-600 self-center">+ Aggiungi modulo:</span>
              {TIPI_INFO.map((info) => (
                <button
                  key={info.tipo}
                  onClick={() => aggiungiModulo(info.tipo)}
                  className="text-xs bg-white border border-gray-200 rounded px-3 py-1.5 hover:border-blue-400 hover:text-blue-600 transition"
                >
                  {info.icona} {info.titolo}
                </button>
              ))}
            </div>
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
