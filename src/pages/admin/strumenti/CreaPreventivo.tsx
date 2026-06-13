// @ts-nocheck
import { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KALEA_LOGO = "data:image/png;base64,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";

// ─── COSTANTI ────────────────────────────────────────────────
const COSTO_POSA_INTERNO = 9.0;
const COSTO_TAPPETINO_INTERNO = 1.5;
const MARKUP = 2.0;
const PREZZI_POSA: Record<string, number> = { semplice: 20, media: 27, complessa: 35 };
const PREZZO_TAPPETINO_CLIENTE = 3.0;
const KM_SOGLIA = 50;
const COSTO_KM = 2.0;
const SUPPL_TRASFERTA_POSA: Record<string, number> = { semplice: 3, media: 7, complessa: 10 };
const MARGINE_ALERT = 25;
const MARGINE_BLOCCO = 10;

// ─── PRODOTTI ────────────────────────────────────────────────
const PRODOTTI = [
  { id:"fl-40", nome:"Flow 40", fornitore:"Flow", categoria:"SPC a secco", dims:"1524×228×4+1mm", listino:43.80, coeff:0.45, tappetino:"mai" },
  { id:"fl-55w", nome:"Flow 55 Wood", fornitore:"Flow", categoria:"SPC a secco", dims:"1524×228×4,5+1mm", listino:49.00, coeff:0.45, tappetino:"mai" },
  { id:"fl-55c", nome:"Flow 55 Cement", fornitore:"Flow", categoria:"SPC a secco", dims:"920×460×5,5+1mm", listino:52.70, coeff:0.45, tappetino:"mai" },
  { id:"fl-xl", nome:"Flow XL", fornitore:"Flow", categoria:"SPC a secco", dims:"1800×228×5+1mm", listino:53.00, coeff:0.45, tappetino:"mai" },
  { id:"fl-spina", nome:"Flow Spina Ande", fornitore:"Flow", categoria:"SPC a secco", dims:"640×128×4,5+1mm", listino:51.20, coeff:0.45, tappetino:"mai" },
  { id:"fl-pxlw", nome:"Flow+ XL Wood", fornitore:"Flow", categoria:"SPC a secco", dims:"1800×228×5,5+1mm", listino:54.10, coeff:0.45, tappetino:"mai" },
  { id:"fl-pspfr", nome:"Flow+ Spina Francese", fornitore:"Flow", categoria:"SPC a secco", dims:"625×127×5,5+1mm", listino:61.80, coeff:0.45, tappetino:"mai" },
  { id:"fl-55gdw", nome:"Flow 55 GD Wood", fornitore:"Flow", categoria:"Vinilico colla", dims:"1500×230×2,5mm", listino:32.10, coeff:0.45, tappetino:"mai" },
  { id:"fl-55gdc", nome:"Flow 55 GD Cement", fornitore:"Flow", categoria:"Vinilico colla", dims:"914×457×2,5mm", listino:31.40, coeff:0.45, tappetino:"mai" },
  { id:"kp-pv120x280", nome:"Kronos Pierre Vive 120×280", fornitore:"Kronos", categoria:"Gres Fine", dims:"120×280 rett.", listino:132, coeff:0.36, tappetino:"mai" },
  { id:"kp-pv120x120", nome:"Kronos Pierre Vive 120×120", fornitore:"Kronos", categoria:"Gres Fine", dims:"120×120 rett.", listino:95, coeff:0.36, tappetino:"mai" },
  { id:"kp-pv60x120", nome:"Kronos Pierre Vive 60×120", fornitore:"Kronos", categoria:"Gres Fine", dims:"60×120 rett.", listino:87, coeff:0.36, tappetino:"mai" },
  { id:"kp-pv60x120g", nome:"Kronos Pierre Vive Grip 60×120", fornitore:"Kronos", categoria:"Gres Fine Grip", dims:"60×120 rett.", listino:90, coeff:0.36, tappetino:"mai" },
  { id:"kp-pv60x60", nome:"Kronos Pierre Vive 60×60", fornitore:"Kronos", categoria:"Gres Fine", dims:"60×60 rett.", listino:70, coeff:0.36, tappetino:"mai" },
  { id:"kp-ma120x280", nome:"Kronos Materia 120×280", fornitore:"Kronos", categoria:"Gres Fine", dims:"120×280 rett.", listino:132, coeff:0.36, tappetino:"mai" },
  { id:"kp-ma120x120", nome:"Kronos Materia 120×120", fornitore:"Kronos", categoria:"Gres Fine", dims:"120×120 rett.", listino:105, coeff:0.36, tappetino:"mai" },
  { id:"kp-ma60x120", nome:"Kronos Materia 60×120", fornitore:"Kronos", categoria:"Gres Fine", dims:"60×120 rett.", listino:105, coeff:0.36, tappetino:"mai" },
  { id:"kp-ps60x120", nome:"Kronos Piasentina Stone 60×120", fornitore:"Kronos", categoria:"Gres Fine", dims:"60×120 rett.", listino:87, coeff:0.36, tappetino:"mai" },
  { id:"kp-na60x120", nome:"Kronos Nativa Vena 60×120", fornitore:"Kronos", categoria:"Gres Fine", dims:"60×120 rett.", listino:95, coeff:0.36, tappetino:"mai" },
  { id:"kp-me120x280", nome:"Kronos Metallique 120×280", fornitore:"Kronos", categoria:"Gres Fine", dims:"120×280 rett.", listino:132, coeff:0.36, tappetino:"mai" },
  { id:"kp-me60x120", nome:"Kronos Metallique 60×120", fornitore:"Kronos", categoria:"Gres Fine", dims:"60×120 rett.", listino:87, coeff:0.36, tappetino:"mai" },
  { id:"kp-lr150", nome:"Kronos Le Reverse Chevron", fornitore:"Kronos", categoria:"Decorato", dims:"varie", listino:150, coeff:0.36, tappetino:"mai" },
  { id:"kp-ws240", nome:"Kronos Wood Side Mosaico", fornitore:"Kronos", categoria:"Effetto Legno", dims:"29×120", listino:240, coeff:0.36, tappetino:"mai" },
  { id:"kp-out95", nome:"Kronos Outdoor SKE 2.0 60×120", fornitore:"Kronos", categoria:"Outdoor 20mm", dims:"60×120×2cm", listino:95, coeff:0.36, tappetino:"mai" },
  { id:"kp-rk102", nome:"Kronos Rocks 60×120", fornitore:"Kronos", categoria:"Gres Fine", dims:"60×120 rett.", listino:102, coeff:0.36, tappetino:"mai" },
  { id:"ex-skudo", nome:"Externo SKUDO", fornitore:"Externo", categoria:"WPC Outdoor", dims:"2000×138×23mm", listino:94.40, coeff:0.45, tappetino:"mai" },
  { id:"ex-trad", nome:"Externo TRADITIONAL", fornitore:"Externo", categoria:"WPC Outdoor", dims:"2000×140×25mm", listino:79.70, coeff:0.45, tappetino:"mai" },
  { id:"ba-ocean8v4", nome:"BerryAlloc Ocean 8 V4", fornitore:"BerryAlloc", categoria:"Laminato DPL", dims:"1288×190×8mm", listino:34.20, coeff:0.45, tappetino:"sempre" },
  { id:"ba-ocean12v4", nome:"BerryAlloc Ocean 12 V4", fornitore:"BerryAlloc", categoria:"Laminato DPL", dims:"1288×190×12mm", listino:60.80, coeff:0.45, tappetino:"sempre" },
  { id:"ba-ocean8xl", nome:"BerryAlloc Ocean 8 XL", fornitore:"BerryAlloc", categoria:"Laminato DPL", dims:"2038×241×8mm", listino:39.90, coeff:0.45, tappetino:"sempre" },
  { id:"ba-chateau", nome:"BerryAlloc Chateau+", fornitore:"BerryAlloc", categoria:"Laminato DPL", dims:"504×84×8mm spina", listino:57.90, coeff:0.45, tappetino:"sempre" },
  { id:"ba-cadenza", nome:"BerryAlloc Cadenza", fornitore:"BerryAlloc", categoria:"Laminato DPL", dims:"1383×214×8mm", listino:30.70, coeff:0.45, tappetino:"sempre" },
  { id:"ba-origcomp", nome:"BerryAlloc Original Comfort HPF", fornitore:"BerryAlloc", categoria:"Laminato HPF", dims:"1207×198×9+2mm", listino:69.90, coeff:0.45, tappetino:"sempre" },
  { id:"ba-grandav", nome:"BerryAlloc Grand Avenue Comfort", fornitore:"BerryAlloc", categoria:"Laminato HPF", dims:"2410×241×10,3+2mm", listino:73.70, coeff:0.45, tappetino:"sempre" },
  { id:"ba-parqxl", nome:"BerryAlloc Parqwood XL", fornitore:"BerryAlloc", categoria:"Parquet Legno", dims:"1190×185×10mm", listino:75.10, coeff:0.45, tappetino:"opzionale" },
  { id:"ba-parqherr", nome:"BerryAlloc Parqwood Herringbone", fornitore:"BerryAlloc", categoria:"Parquet Legno", dims:"504×84×9,5mm", listino:111.80, coeff:0.45, tappetino:"opzionale" },
  { id:"ba-zenn55p", nome:"BerryAlloc Zenn RigidClick 55", fornitore:"BerryAlloc", categoria:"Vinilico SPC", dims:"1219×178×5+1mm", listino:57.90, coeff:0.45, tappetino:"mai" },
  { id:"ba-zenn30p", nome:"BerryAlloc Zenn RigidClick 30", fornitore:"BerryAlloc", categoria:"Vinilico SPC", dims:"1219×178×4+1mm", listino:43.80, coeff:0.45, tappetino:"mai" },
  { id:"ba-spirit55", nome:"BerryAlloc Spirit Soul 55", fornitore:"BerryAlloc", categoria:"Vinilico SPC", dims:"1524×228×5+1mm", listino:61.70, coeff:0.45, tappetino:"mai" },
  { id:"ba-zenngd55", nome:"BerryAlloc Zenn GD 55", fornitore:"BerryAlloc", categoria:"Vinilico colla", dims:"1219×178×2,5mm", listino:37.80, coeff:0.45, tappetino:"mai" },
  { id:"pq-drnat", nome:"Parquet Dream Rovere Naturale", fornitore:"Parquet Woodco", categoria:"Parquet Dream", dims:"160×1200/2200 14mm", listino:152.20, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-drcrema", nome:"Parquet Dream Rovere Crema", fornitore:"Parquet Woodco", categoria:"Parquet Dream", dims:"160×1200/2200 14mm", listino:175.00, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-drbianco", nome:"Parquet Dream Rovere Bianco", fornitore:"Parquet Woodco", categoria:"Parquet Dream", dims:"160×1200/2200 14mm", listino:176.80, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-slim120", nome:"Parquet Slim 120 Rovere Naturale", fornitore:"Parquet Woodco", categoria:"Parquet Slim", dims:"120×800/1200 10mm", listino:114.80, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-slim180", nome:"Parquet Slim 180 Rovere Naturale", fornitore:"Parquet Woodco", categoria:"Parquet Slim", dims:"180×1200/2200 10mm", listino:144.70, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-hernat", nome:"Parquet Her Rovere Naturale", fornitore:"Parquet Woodco", categoria:"Parquet Spina", dims:"90×600 spina ital.", listino:86.10, coeff:0.45, tappetino:"mai" },
  { id:"pq-starnat", nome:"Parquet Star Rovere Naturale", fornitore:"Parquet Woodco", categoria:"Parquet Spina", dims:"90×510 spina 45°", listino:98.80, coeff:0.45, tappetino:"mai" },
  { id:"sg-s45nat", nome:"Signature Spina 45 Rovere Naturale", fornitore:"Signature", categoria:"Parquet Premium", dims:"180×620mm", listino:223.00, coeff:0.45, tappetino:"mai" },
  { id:"sg-s45crema", nome:"Signature Spina 45 Rovere Crema", fornitore:"Signature", categoria:"Parquet Premium", dims:"180×620mm", listino:242.30, coeff:0.45, tappetino:"mai" },
  { id:"sg-escnat", nome:"Signature Esagono Rovere Naturale", fornitore:"Signature", categoria:"Parquet Premium", dims:"200×231mm", listino:281.10, coeff:0.45, tappetino:"mai" },
  { id:"sg-q1nat", nome:"Signature Q1 Rovere Naturale", fornitore:"Signature", categoria:"Parquet Premium", dims:"600×600mm", listino:316.40, coeff:0.45, tappetino:"mai" },
];

const FORNITORI_LIST = ["Tutti","Flow","Kronos","Externo","BerryAlloc","Parquet Woodco","Signature"];
const FORN_STYLE: Record<string, { bg: string; c: string }> = {
  "Flow":{bg:"#E6F1FB",c:"#0C447C"},"Kronos":{bg:"#FCE4EC",c:"#880E4F"},
  "Externo":{bg:"#E1F5EE",c:"#085041"},"BerryAlloc":{bg:"#FAEEDA",c:"#633806"},
  "Parquet Woodco":{bg:"#FFF3E0",c:"#7B3A10"},"Signature":{bg:"#EEEDFE",c:"#3C3489"},
};

// ─── HELPERS ─────────────────────────────────────────────────
const euro = (n: number) => "€ " + (Math.round(n*100)/100).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2});
const pct = (n: number) => n.toFixed(1)+"%";
const today = () => new Date().toLocaleDateString("it-IT");
const addDays = (d: any, n: number) => { const x=new Date(); x.setDate(x.getDate()+n); return x.toLocaleDateString("it-IT"); };
const nextNum = () => { const n=(parseInt(localStorage.getItem("kal_prev_num")||"0")+1); localStorage.setItem("kal_prev_num", String(n)); return "KAL-"+new Date().getFullYear()+"-"+String(n).padStart(3,"0"); };

function Slider({ label, min, max, value, step, onChange, format }: any) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:13,color:"#6B6860"}}>{label}</span>
        <span style={{fontSize:13,fontWeight:500}}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={{width:"100%",accentColor:"#1A1A2E",cursor:"pointer"}}/>
    </div>
  );
}

function Btn({ active, onClick, children, color }: any) {
  return (
    <button onClick={onClick} style={{
      padding:"5px 14px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:12,fontWeight:500,
      background:active?(color||"#1A1A2E"):"transparent",
      color:active?"#fff":(color||"#6B6860"),
      borderColor:active?(color||"#1A1A2E"):"#E0DDD8",
    }}>{children}</button>
  );
}

// ─── CRM SEARCH (Lead + Cliente) ─────────────────────────────
type CrmRecord = {
  source: "lead" | "customer";
  id: string;
  label: string;
  sub: string;
  nome: string;
  indirizzo: string;
  citta: string;
  telefono: string;
  email: string;
};

function ClienteSearch({ onSelect, selected, onClear }: {
  onSelect: (r: CrmRecord) => void;
  selected: CrmRecord | null;
  onClear: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CrmRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (!q || q.trim().length < 2) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const term = `%${q.trim()}%`;
        const [{ data: leads }, { data: customers }] = await Promise.all([
          supabase.from("leads")
            .select("id,name,company_name,email,phone,address,city")
            .or(`name.ilike.${term},company_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`)
            .limit(10),
          supabase.from("customers")
            .select("id,first_name,last_name,company_name,email,phone,address,city")
            .or(`first_name.ilike.${term},last_name.ilike.${term},company_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`)
            .limit(10),
        ]);
        const rl: CrmRecord[] = (leads||[]).map((l: any) => ({
          source:"lead", id:l.id,
          label: l.company_name || l.name || "—",
          sub: [l.email, l.phone, l.city].filter(Boolean).join(" · "),
          nome: l.company_name || l.name || "",
          indirizzo: l.address || "",
          citta: l.city || "",
          telefono: l.phone || "",
          email: l.email || "",
        }));
        const rc: CrmRecord[] = (customers||[]).map((c: any) => ({
          source:"customer", id:c.id,
          label: c.company_name || `${c.first_name||""} ${c.last_name||""}`.trim() || "—",
          sub: [c.email, c.phone, c.city].filter(Boolean).join(" · "),
          nome: c.company_name || `${c.first_name||""} ${c.last_name||""}`.trim(),
          indirizzo: c.address || "",
          citta: c.city || "",
          telefono: c.phone || "",
          email: c.email || "",
        }));
        setResults([...rl, ...rc]);
      } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(timer.current);
  }, [q]);

  if (selected) {
    return (
      <div style={{padding:"10px 12px",background:selected.source==="lead"?"#E6F1FB":"#EAF3DE",border:"1px solid #E0DDD8",borderRadius:8,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:"#6B6860",textTransform:"uppercase",letterSpacing:".05em"}}>
            {selected.source==="lead" ? "Lead collegato" : "Cliente collegato"}
          </div>
          <div style={{fontWeight:500,fontSize:13}}>{selected.label}</div>
          <div style={{fontSize:11,color:"#9A9890"}}>{selected.sub}</div>
        </div>
        <button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",color:"#A32D2D",fontSize:12}}>Scollega</button>
      </div>
    );
  }

  return (
    <div style={{position:"relative",marginBottom:10}}>
      <input value={q}
        onChange={e=>{setQ(e.target.value);setOpen(true);}}
        onFocus={()=>setOpen(true)}
        onBlur={()=>setTimeout(()=>setOpen(false),200)}
        placeholder="🔍 Cerca lead o cliente (nome, email, telefono)..."
        style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,outline:"none",boxSizing:"border-box",background:"#F7F6F3"}}/>
      {open && q.length >= 2 && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:"#fff",border:"1px solid #E0DDD8",borderRadius:8,maxHeight:280,overflowY:"auto",zIndex:20,boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}>
          {loading && <div style={{padding:10,fontSize:12,color:"#9A9890"}}>Ricerca…</div>}
          {!loading && results.length===0 && <div style={{padding:10,fontSize:12,color:"#9A9890"}}>Nessun risultato — compila manualmente i campi sotto.</div>}
          {results.map(r => (
            <div key={r.source+"-"+r.id} onClick={()=>{onSelect(r);setQ("");setOpen(false);}}
              style={{padding:"8px 10px",cursor:"pointer",borderBottom:"0.5px solid #E0DDD8"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background="#F7F6F3";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background="#fff";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:500}}>{r.label}</span>
                <span style={{fontSize:10,padding:"1px 6px",borderRadius:3,background:r.source==="lead"?"#E6F1FB":"#EAF3DE",color:r.source==="lead"?"#0C447C":"#27500A",textTransform:"uppercase"}}>{r.source}</span>
              </div>
              <div style={{fontSize:11,color:"#9A9890"}}>{r.sub || "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────
export default function CreaPreventivo() {
  const [step, setStep] = useState(1);

  // CALCOLO
  const [search, setSearch] = useState("");
  const [fornFilt, setFornFilt] = useState("Tutti");
  const [prodotto, setProdotto] = useState<any>(null);
  const [complessita, setComplessita] = useState<"semplice"|"media"|"complessa">("media");
  const [mqPrev, setMqPrev] = useState(50);
  const [sfrido, setSfrido] = useState(10);
  const [incPosa, setIncPosa] = useState(true);
  const [incTapp, setIncTapp] = useState(true);
  const [kmDist, setKmDist] = useState(0);
  const [incTrasporto, setIncTrasporto] = useState(false);
  const [sconto, setSconto] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [righeMat, setRigheMat] = useState<any[]>([]);

  // INTESTAZIONE
  const [lingua, setLingua] = useState("IT");
  const [numPrev, setNumPrev] = useState("");
  const [dataPrev, setDataPrev] = useState(today());
  const [cliente, setCliente] = useState({ nome:"", indirizzo:"", citta:"", telefono:"", email:"" });
  const [crmLink, setCrmLink] = useState<CrmRecord | null>(null);
  const [cantiere, setCantiere] = useState("");
  const [noteCliente, setNoteCliente] = useState("");
  const [noteInterne, setNoteInterne] = useState("");
  const [stato, setStato] = useState<"bozza"|"inviato"|"accettato"|"rifiutato">("bozza");
  const [saving, setSaving] = useState(false);
  const [preventivoId, setPreventivoId] = useState<string|null>(null);

  const [pagamenti, setPagamenti] = useState<any[]>([
    { label:"Acconto", pct:30, data:"", note:"" },
    { label:"A metà lavori", pct:40, data:"", note:"" },
    { label:"Saldo finale", pct:30, data:"", note:"" },
  ]);

  const filtered = useMemo(()=>PRODOTTI.filter(p=>{
    const fs = fornFilt==="Tutti" || p.fornitore===fornFilt;
    const ss = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.fornitore.toLowerCase().includes(search.toLowerCase()) || p.categoria.toLowerCase().includes(search.toLowerCase()) || p.dims.toLowerCase().includes(search.toLowerCase());
    return fs && ss;
  }), [search, fornFilt]);

  const calc = useMemo(()=>{
    if (!prodotto) return null;
    const costoMatMq = prodotto.listino * prodotto.coeff;
    const prezzoMatMq = costoMatMq * MARKUP;
    const mqOrd = mqPrev * (1 + sfrido/100);
    const costoMatTot = mqOrd * costoMatMq;
    const prezzoMatTot = mqOrd * prezzoMatMq;
    const prezzoPosaMq = PREZZI_POSA[complessita];
    const costoPosaTot = incPosa ? mqPrev*COSTO_POSA_INTERNO : 0;
    const prezzoPosaTot = incPosa ? mqPrev*prezzoPosaMq : 0;
    const tappNeeded = incTapp && prodotto.tappetino !== "mai";
    const costoTappTot = tappNeeded ? mqPrev*COSTO_TAPPETINO_INTERNO : 0;
    const prezzoTappTot = tappNeeded ? mqPrev*PREZZO_TAPPETINO_CLIENTE : 0;
    const kmExtra = Math.max(0, kmDist - KM_SOGLIA);
    const costoTrasporto = incTrasporto && kmExtra>0 ? kmExtra*COSTO_KM : 0;
    const prezzoTrasporto = incTrasporto && kmExtra>0 ? kmExtra*COSTO_KM*MARKUP : 0;
    const trasfertaAttiva = kmDist > KM_SOGLIA && incPosa;
    const supplMq = trasfertaAttiva ? SUPPL_TRASFERTA_POSA[complessita] : 0;
    const costoTrasfertaTot = trasfertaAttiva ? mqPrev*supplMq*0.5 : 0;
    const prezzoTrasfertaTot = trasfertaAttiva ? mqPrev*supplMq : 0;
    const costoExtraTot = righeMat.reduce((s,r)=>s+(r.costoUn||0)*(r.qta||0), 0);
    const prezzoExtraTot = righeMat.reduce((s,r)=>s+(r.prezzoUn||0)*(r.qta||0), 0);
    const costoTotale = costoMatTot+costoPosaTot+costoTappTot+costoTrasporto+costoTrasfertaTot+costoExtraTot;
    const prezzoLordoTot = prezzoMatTot+prezzoPosaTot+prezzoTappTot+prezzoTrasporto+prezzoTrasfertaTot+prezzoExtraTot;
    const scontoAmt = prezzoLordoTot*(sconto/100);
    const prezzoNetto = prezzoLordoTot - scontoAmt;
    const iva = prezzoNetto*0.22;
    const totaleIva = prezzoNetto + iva;
    const margineE = prezzoNetto - costoTotale;
    const marginePct = prezzoNetto>0 ? (margineE/prezzoNetto)*100 : 0;
    const prezzoMqTot = mqPrev>0 ? prezzoNetto/mqPrev : 0;
    const scontoMax = prezzoLordoTot>0 ? ((prezzoLordoTot-costoTotale)/prezzoLordoTot)*100 : 0;
    return { costoMatMq,prezzoMatMq,mqOrd,costoMatTot,prezzoMatTot,costoPosaTot,prezzoPosaTot,costoTappTot,prezzoTappTot,tappNeeded,costoTrasporto,prezzoTrasporto,kmExtra,trasfertaAttiva,costoTrasfertaTot,prezzoTrasfertaTot,costoExtraTot,prezzoExtraTot,costoTotale,prezzoLordoTot,scontoAmt,prezzoNetto,iva,totaleIva,margineE,marginePct,prezzoMqTot,scontoMax };
  }, [prodotto,complessita,mqPrev,sfrido,incPosa,incTapp,kmDist,incTrasporto,sconto,righeMat]);

  const addRiga = () => setRigheMat(r=>[...r,{ id:Date.now(), desc:"", qta:1, unita:"mq", costoUn:0, prezzoUn:0 }]);
  const updRiga = (id:any,k:string,v:any) => setRigheMat(r=>r.map(x=>x.id===id?{...x,[k]:v}:x));
  const delRiga = (id:any) => setRigheMat(r=>r.filter(x=>x.id!==id));

  const selectCrm = (r: CrmRecord) => {
    setCrmLink(r);
    setCliente({ nome:r.nome, indirizzo:r.indirizzo, citta:r.citta, telefono:r.telefono, email:r.email });
  };

  const salvaPreventivo = async () => {
    if (!calc) { toast.error("Configura prima il preventivo"); return; }
    setSaving(true);
    try {
      const num = numPrev || nextNum();
      if (!numPrev) setNumPrev(num);
      const { data: { user } } = await supabase.auth.getUser();
      const payload: any = {
        lead_id: crmLink?.source === "lead" ? crmLink.id : null,
        customer_id: crmLink?.source === "customer" ? crmLink.id : null,
        numero_preventivo: num,
        importo_totale: calc.totaleIva,
        stato,
        lingua,
        cliente_nome: cliente.nome || crmLink?.label || null,
        cantiere: cantiere || null,
        created_by: user?.id || null,
        json_dati: {
          cliente, cantiere, prodotto, complessita, mqPrev, sfrido, sconto,
          incPosa, incTapp, incTrasporto, kmDist, righeMat, pagamenti,
          noteCliente, noteInterne, calc,
        },
      };
      if (preventivoId) {
        const { error } = await supabase.from("preventivi").update(payload).eq("id", preventivoId);
        if (error) throw error;
        toast.success("Preventivo aggiornato");
      } else {
        const { data, error } = await supabase.from("preventivi").insert(payload).select("id").single();
        if (error) throw error;
        setPreventivoId(data.id);
        toast.success("Preventivo salvato" + (crmLink ? ` e collegato al ${crmLink.source}` : ""));
      }
    } catch (e:any) {
      console.error(e);
      toast.error("Errore salvataggio: " + (e?.message||""));
    } finally {
      setSaving(false);
    }
  };

  const generaPDF = () => {
    if (calc && calc.marginePct < MARGINE_BLOCCO) {
      alert(`⛔ BLOCCO: Margine ${pct(calc.marginePct)} sotto il ${MARGINE_BLOCCO}%. Rivedi il preventivo.`);
      return;
    }
    window.print();
  };

  const statoColor: Record<string,string> = { bozza:"#9A9890", inviato:"#0C447C", accettato:"#27500A", rifiutato:"#A32D2D" };
  const statoLabel: Record<string,string> = { bozza:"Bozza", inviato:"Inviato", accettato:"Accettato", rifiutato:"Rifiutato" };

  const card: any = { background:"#fff", border:"1px solid #E0DDD8", borderRadius:12, padding:"18px 22px", marginBottom:16 };
  const sectionTitle: any = { fontSize:11, fontWeight:500, color:"#9A9890", textTransform:"uppercase", letterSpacing:".07em", marginBottom:14, paddingBottom:8, borderBottom:"1px solid #E0DDD8" };

  return (
    <div style={{ fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif", color:"#1A1A1A", maxWidth:1300, margin:"0 auto", padding:"24px 20px" }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:400,color:"#1A1A2E",marginBottom:4}}>Crea Preventivo Kalēa</h1>
          <p style={{fontSize:13,color:"#9A9890"}}>Calcola, collega al CRM, genera, salva</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {(["bozza","inviato","accettato","rifiutato"] as const).map(s=>(
            <Btn key={s} active={stato===s} onClick={()=>setStato(s)} color={statoColor[s]}>{statoLabel[s]}</Btn>
          ))}
        </div>
      </div>

      <div style={{display:"flex",gap:2,marginBottom:20,background:"#F0EDE8",borderRadius:10,padding:4,width:"fit-content"}}>
        {[["1","Calcolo & Verifica"],["2","Intestazione & Cliente"],["3","Anteprima & PDF"]].map(([n,l])=>(
          <button key={n} onClick={()=>setStep(Number(n))}
            style={{padding:"8px 20px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:step===Number(n)?500:400,
              background:step===Number(n)?"#fff":"transparent", color:step===Number(n)?"#1A1A2E":"#9A9890",
              boxShadow:step===Number(n)?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{n}. {l}</button>
        ))}
      </div>

      {/* STEP 1 */}
      {step===1 && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={card}>
            <div style={sectionTitle}>Scegli prodotto — {PRODOTTI.length} articoli</div>
            <div style={{position:"relative",marginBottom:10}}>
              <input value={search} onChange={e=>{setSearch(e.target.value);setShowAll(false);}}
                placeholder="🔍 Cerca nome, fornitore, categoria..."
                style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid #E0DDD8",fontSize:13,outline:"none",background:"#F7F6F3",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              {FORNITORI_LIST.map(f=>{
                const fc=FORN_STYLE[f]||{bg:"#1A1A2E",c:"#fff"};
                return <button key={f} onClick={()=>{setFornFilt(f);setShowAll(false);}}
                  style={{padding:"3px 11px",borderRadius:16,border:"1px solid",cursor:"pointer",fontSize:11,fontWeight:500,
                    background:fornFilt===f?(f==="Tutti"?"#1A1A2E":fc.bg):"transparent",
                    color:fornFilt===f?(f==="Tutti"?"#fff":fc.c):"#9A9890",
                    borderColor:fornFilt===f?(f==="Tutti"?"#1A1A2E":fc.c):"#E0DDD8"}}>{f}</button>;
              })}
            </div>
            <div style={{maxHeight:420,overflowY:"auto",borderRadius:8,border:"1px solid #E0DDD8"}}>
              {(showAll?filtered:filtered.slice(0,25)).map(p=>{
                const costoMq=p.listino*p.coeff;
                const prezzoMq=costoMq*MARKUP;
                const isSel=prodotto?.id===p.id;
                const fc=FORN_STYLE[p.fornitore]||{bg:"#F0EDE8",c:"#5F5E5A"};
                return (
                  <div key={p.id} onClick={()=>setProdotto(p)}
                    style={{padding:"9px 12px",borderBottom:"0.5px solid #E0DDD8",cursor:"pointer",
                      background:isSel?"#E6F1FB":"transparent",
                      borderLeft:isSel?"3px solid #1A1A2E":"3px solid transparent"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontWeight:500,fontSize:13}}>{p.nome}</span>
                      <span style={{fontSize:14,fontWeight:600,color:"#1A1A2E"}}>{euro(prezzoMq)}<span style={{fontSize:10,color:"#9A9890"}}>/mq</span></span>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center",fontSize:11,color:"#9A9890"}}>
                      <span style={{display:"inline-block",padding:"1px 6px",borderRadius:3,fontWeight:500,background:fc.bg,color:fc.c,fontSize:10}}>{p.fornitore}</span>
                      <span>{p.categoria}</span><span>· {p.dims}</span>
                      <span style={{marginLeft:"auto",color:"#6B6860"}}>costo {euro(costoMq)}</span>
                    </div>
                  </div>
                );
              })}
              {!showAll && filtered.length>25 && (
                <div style={{padding:10,textAlign:"center"}}>
                  <button onClick={()=>setShowAll(true)} style={{padding:"5px 16px",borderRadius:8,border:"1px solid #E0DDD8",background:"#F0EDE8",cursor:"pointer",fontSize:12,color:"#6B6860"}}>Mostra tutti i {filtered.length} risultati</button>
                </div>
              )}
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {prodotto && (
              <div style={{...card,marginBottom:0}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:500}}>{prodotto.nome}</div>
                    <div style={{fontSize:12,color:"#9A9890"}}>{prodotto.dims} · {prodotto.categoria}</div>
                  </div>
                  <span style={{fontSize:10,padding:"3px 9px",borderRadius:6,fontWeight:500,background:FORN_STYLE[prodotto.fornitore]?.bg,color:FORN_STYLE[prodotto.fornitore]?.c}}>{prodotto.fornitore}</span>
                </div>
              </div>
            )}

            <div style={{...card,marginBottom:0}}>
              <div style={sectionTitle}>Parametri cantiere</div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:12,color:"#6B6860",marginBottom:8}}>Complessità posa</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {(["semplice","media","complessa"] as const).map(k=>(
                    <div key={k} onClick={()=>setComplessita(k)} style={{
                      padding:"10px 12px",borderRadius:8,cursor:"pointer",border:"1px solid",
                      background:complessita===k?"#1A1A2E":"#F0EDE8",
                      borderColor:complessita===k?"#1A1A2E":"#E0DDD8",
                      color:complessita===k?"#fff":"#1A1A1A"}}>
                      <div style={{fontWeight:500,fontSize:13,textTransform:"capitalize"}}>{k}</div>
                      <div style={{fontSize:13,fontWeight:600,marginTop:4}}>{PREZZI_POSA[k]}€/mq</div>
                    </div>
                  ))}
                </div>
              </div>
              <Slider label="mq da posare" min={5} max={600} value={mqPrev} step={5} onChange={setMqPrev} format={(v:any)=>v+" mq"}/>
              <Slider label="Sfrido (%)" min={5} max={25} value={sfrido} step={1} onChange={setSfrido} format={(v:any)=>v+"%"}/>
              <Slider label="Sconto cliente (%)" min={0} max={40} value={sconto} step={1} onChange={setSconto} format={(v:any)=>v+"%"}/>
              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                <Btn active={incPosa} onClick={()=>setIncPosa(!incPosa)}>{incPosa?"✓ ":""}Posa</Btn>
                <Btn active={incTapp} onClick={()=>setIncTapp(!incTapp)}>{incTapp?"✓ ":""}Tappetino</Btn>
                <Btn active={incTrasporto} onClick={()=>setIncTrasporto(!incTrasporto)}>{incTrasporto?"✓ ":""}Trasporto</Btn>
              </div>
              {incTrasporto && (
                <div style={{marginTop:12}}>
                  <Slider label="Distanza da Desenzano (km)" min={0} max={400} value={kmDist} step={5} onChange={setKmDist} format={(v:any)=>v+" km"}/>
                </div>
              )}
            </div>

            <div style={{...card,marginBottom:0}}>
              <div style={{...sectionTitle,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>Materiali aggiuntivi</span>
                <button onClick={addRiga} style={{padding:"3px 12px",borderRadius:6,border:"1px solid #1A1A2E",background:"transparent",cursor:"pointer",fontSize:12,color:"#1A1A2E"}}>+ Aggiungi riga</button>
              </div>
              {righeMat.map(r=>(
                <div key={r.id} style={{display:"grid",gridTemplateColumns:"2fr 60px 70px 90px 90px 30px",gap:6,marginBottom:8}}>
                  <input value={r.desc} onChange={e=>updRiga(r.id,"desc",e.target.value)} placeholder="Descrizione" style={{padding:"5px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12}}/>
                  <input value={r.qta} type="number" onChange={e=>updRiga(r.id,"qta",Number(e.target.value))} style={{padding:"5px 6px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12}}/>
                  <input value={r.unita} onChange={e=>updRiga(r.id,"unita",e.target.value)} style={{padding:"5px 6px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12}}/>
                  <input value={r.costoUn} type="number" onChange={e=>updRiga(r.id,"costoUn",Number(e.target.value))} placeholder="Costo €" style={{padding:"5px 6px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12}}/>
                  <input value={r.prezzoUn} type="number" onChange={e=>updRiga(r.id,"prezzoUn",Number(e.target.value))} placeholder="Prezzo €" style={{padding:"5px 6px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12}}/>
                  <button onClick={()=>delRiga(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#A32D2D"}}>×</button>
                </div>
              ))}
            </div>

            {calc && (
              <div style={{...card,marginBottom:0}}>
                <div style={sectionTitle}>Verifica margine</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  {[
                    {l:"Costi tuoi",v:euro(calc.costoTotale),c:"#A32D2D"},
                    {l:"Prezzo netto",v:euro(calc.prezzoNetto),c:"#0C447C"},
                    {l:"Margine €",v:euro(calc.margineE),c:calc.margineE>0?"#27500A":"#A32D2D"},
                    {l:"Margine %",v:pct(calc.marginePct),c:calc.marginePct>MARGINE_ALERT?"#27500A":calc.marginePct>MARGINE_BLOCCO?"#633806":"#A32D2D"},
                  ].map(k=>(
                    <div key={k.l} style={{background:"#F0EDE8",borderRadius:8,padding:"10px 12px"}}>
                      <div style={{fontSize:11,color:"#9A9890"}}>{k.l}</div>
                      <div style={{fontSize:16,fontWeight:600,color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setStep(2)} style={{width:"100%",padding:"11px",borderRadius:9,border:"none",cursor:"pointer",fontSize:14,fontWeight:500,background:calc.marginePct>MARGINE_BLOCCO?"#1A1A2E":"#9A9890",color:"#fff"}}>
                  {calc.marginePct>MARGINE_BLOCCO ? "Vai a Intestazione & Cliente →" : "⛔ Sblocca prima il margine"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step===2 && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <div style={card}>
              <div style={sectionTitle}>Intestazione preventivo</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div>
                  <div style={{fontSize:12,color:"#6B6860",marginBottom:4}}>N° preventivo</div>
                  <input value={numPrev} onChange={e=>setNumPrev(e.target.value)} placeholder="KAL-2026-001"
                    style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box"}}/>
                  <button onClick={()=>setNumPrev(nextNum())} style={{marginTop:4,fontSize:11,color:"#0C447C",background:"none",border:"none",cursor:"pointer",padding:0}}>Genera automatico</button>
                </div>
                <div>
                  <div style={{fontSize:12,color:"#6B6860",marginBottom:4}}>Data</div>
                  <input value={dataPrev} onChange={e=>setDataPrev(e.target.value)}
                    style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box"}}/>
                </div>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:12,color:"#6B6860",marginBottom:4}}>Descrizione cantiere</div>
                <input value={cantiere} onChange={e=>setCantiere(e.target.value)} placeholder="Es. Appartamento via Roma 12, Brescia"
                  style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box"}}/>
              </div>
              <div style={{fontSize:12,color:"#6B6860",marginBottom:8}}>Lingua documento</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["IT","EN","DE","FR","RO"].map(l=><Btn key={l} active={lingua===l} onClick={()=>setLingua(l)}>{l}</Btn>)}
              </div>
            </div>

            <div style={card}>
              <div style={sectionTitle}>Dati cliente</div>
              <div style={{fontSize:11,color:"#6B6860",marginBottom:6}}>Cerca dal CRM o compila manualmente</div>
              <ClienteSearch
                selected={crmLink}
                onSelect={selectCrm}
                onClear={()=>setCrmLink(null)}
              />
              {[["nome","Nome / Ragione sociale"],["indirizzo","Indirizzo"],["citta","Città"],["telefono","Telefono"],["email","Email"]].map(([k,pl])=>(
                <div key={k} style={{marginBottom:8}}>
                  <input value={(cliente as any)[k]} onChange={e=>setCliente(c=>({...c,[k]:e.target.value}))} placeholder={pl}
                    style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={card}>
              <div style={sectionTitle}>Condizioni di pagamento</div>
              {pagamenti.map((p,i)=>(
                <div key={i} style={{marginBottom:12,padding:"10px 12px",background:"#F0EDE8",borderRadius:8}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 70px 1fr",gap:8}}>
                    <input value={p.label} onChange={e=>{const pg=[...pagamenti];pg[i].label=e.target.value;setPagamenti(pg);}} placeholder="Descrizione" style={{padding:"5px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12}}/>
                    <input value={p.pct} type="number" onChange={e=>{const pg=[...pagamenti];pg[i].pct=Number(e.target.value);setPagamenti(pg);}} style={{padding:"5px 6px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12}}/>
                    <input value={p.data} onChange={e=>{const pg=[...pagamenti];pg[i].data=e.target.value;setPagamenti(pg);}} placeholder="Data / condizione" style={{padding:"5px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12}}/>
                  </div>
                </div>
              ))}
              <button onClick={()=>setPagamenti([...pagamenti,{label:"",pct:0,data:"",note:""}])} style={{padding:"5px 12px",borderRadius:6,border:"1px solid #E0DDD8",background:"transparent",cursor:"pointer",fontSize:12,color:"#1A1A2E"}}>+ Rata</button>
            </div>

            <div style={card}>
              <div style={sectionTitle}>Note visibili al cliente</div>
              <textarea value={noteCliente} onChange={e=>setNoteCliente(e.target.value)} rows={3} style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box"}}/>
            </div>

            <div style={card}>
              <div style={{...sectionTitle,color:"#A32D2D"}}>Note interne</div>
              <textarea value={noteInterne} onChange={e=>setNoteInterne(e.target.value)} rows={2} style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid #FAEEDA",fontSize:13,boxSizing:"border-box",background:"#FAEEDA"}}/>
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={salvaPreventivo} disabled={saving} style={{flex:1,padding:"11px",borderRadius:9,border:"1px solid #1A1A2E",cursor:"pointer",fontSize:14,fontWeight:500,background:"#fff",color:"#1A1A2E"}}>
                {saving ? "Salvataggio…" : preventivoId ? "💾 Aggiorna preventivo" : "💾 Salva preventivo"}
              </button>
              <button onClick={()=>setStep(3)} style={{flex:1,padding:"11px",borderRadius:9,border:"none",cursor:"pointer",fontSize:14,fontWeight:500,background:"#1A1A2E",color:"#fff"}}>
                Anteprima & PDF →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step===3 && calc && (
        <div>
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            <button onClick={generaPDF} style={{padding:"10px 24px",borderRadius:9,border:"none",cursor:"pointer",fontSize:14,fontWeight:500,background:calc.marginePct>MARGINE_BLOCCO?"#1A1A2E":"#9A9890",color:"#fff"}}>
              🖨 Stampa / Salva PDF
            </button>
            <button onClick={salvaPreventivo} disabled={saving} style={{padding:"10px 24px",borderRadius:9,border:"1px solid #1A1A2E",cursor:"pointer",fontSize:14,fontWeight:500,background:"#fff",color:"#1A1A2E"}}>
              {saving ? "Salvataggio…" : preventivoId ? "💾 Aggiorna" : "💾 Salva preventivo"}
            </button>
          </div>

          {/* ANTEPRIMA DOCUMENTO */}
          <div id="pdf-preview" style={{background:"#fff",border:"1px solid #E0DDD8",borderRadius:12,padding:"40px 48px",maxWidth:800,margin:"0 auto",boxShadow:"0 4px 20px rgba(0,0,0,.08)"}}>

            {/* Testata */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32,paddingBottom:24,borderBottom:"2px solid #1A1A2E"}}>
              <div>
                {KALEA_LOGO ? <img src={KALEA_LOGO} alt="Kalēa" style={{height:44,display:"block",marginBottom:4}}/> : <div style={{fontSize:24,fontWeight:600,color:"#1A1A2E"}}>Kalēa<sup>®</sup></div>}
                <div style={{fontSize:13,color:"#9A8060",letterSpacing:".08em",marginBottom:3}}>Innovate | Living | Nature</div>
                <div style={{fontSize:12,color:"#6B6860"}}>Superfici · Pavimentazioni · Posa</div>
                <div style={{fontSize:11,color:"#9A9890",marginTop:2}}>Desenzano del Garda (BS) · info@kalea.space · kalea.space</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:22,fontWeight:600,color:"#1A1A2E",letterSpacing:".05em"}}>PREVENTIVO</div>
                <div style={{fontSize:13,color:"#6B6860",marginTop:4}}>N° <strong>{numPrev||"KAL-2026-001"}</strong></div>
                <div style={{fontSize:13,color:"#6B6860"}}>Data: <strong>{dataPrev}</strong></div>
                <div style={{fontSize:13,color:"#A32D2D"}}>Valido fino al: <strong>{addDays(dataPrev,30)}</strong></div>
              </div>
            </div>

            {/* Cliente */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:28}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Cliente</div>
                <div style={{fontSize:14,fontWeight:500}}>{cliente.nome||"—"}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cliente.indirizzo}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cliente.citta}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cliente.telefono}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cliente.email}</div>
              </div>
              {cantiere && <div>
                <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Oggetto / Cantiere</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cantiere}</div>
              </div>}
            </div>

            {/* Corpo preventivo */}
            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:24}}>
              <thead>
                <tr style={{background:"#1A1A2E"}}>
                  {["Descrizione","mq","Prezzo unit.","Totale"].map(h=>(
                    <th key={h} style={{padding:"9px 12px",textAlign:h==="Descrizione"?"left":"right",fontSize:11,fontWeight:500,color:"#fff",textTransform:"uppercase",letterSpacing:".05em"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{background:"#F7F6F3"}}>
                  <td colSpan={4} style={{padding:"7px 12px",fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>Fornitura materiale</td>
                </tr>
                <tr>
                  <td style={{padding:"8px 12px",fontSize:13}}>{prodotto?.nome} — {prodotto?.dims}</td>
                  <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{calc.mqOrd.toFixed(1)}</td>
                  <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(calc.prezzoMatMq)}</td>
                  <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoMatTot)}</td>
                </tr>
                {righeMat.filter((r:any)=>r.desc).map((r:any)=>(
                  <tr key={r.id}>
                    <td style={{padding:"8px 12px",fontSize:13}}>{r.desc}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{r.qta} {r.unita}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(r.prezzoUn)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(r.prezzoUn*r.qta)}</td>
                  </tr>
                ))}
                {incPosa && <>
                  <tr style={{background:"#F7F6F3"}}>
                    <td colSpan={4} style={{padding:"7px 12px",fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>Posa in opera</td>
                  </tr>
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>Posa in opera — {complessita}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{mqPrev}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(PREZZI_POSA[complessita])}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoPosaTot)}</td>
                  </tr>
                </>}
                {calc.tappNeeded && <>
                  <tr style={{background:"#F7F6F3"}}>
                    <td colSpan={4} style={{padding:"7px 12px",fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>Tappetino / Sottofondo</td>
                  </tr>
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>Tappetino/sottofondo</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{mqPrev}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(PREZZO_TAPPETINO_CLIENTE)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoTappTot)}</td>
                  </tr>
                </>}
                {incTrasporto && calc.kmExtra>0 && (
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>Trasporto ({calc.kmExtra} km)</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{calc.kmExtra}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(COSTO_KM*MARKUP)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoTrasporto)}</td>
                  </tr>
                )}
                {calc.trasfertaAttiva && (
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>Trasferta posatori</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{mqPrev}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(SUPPL_TRASFERTA_POSA[complessita])}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoTrasfertaTot)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totali */}
            <div style={{marginLeft:"auto",width:280}}>
              {[
                {l:"Subtotale",v:euro(calc.prezzoLordoTot)},
                sconto>0 && {l:`Sconto ${sconto}%`,v:`− ${euro(calc.scontoAmt)}`,c:"#633806"},
                sconto>0 && {l:"Imponibile scontato",v:euro(calc.prezzoNetto)},
                {l:"IVA 22%",v:euro(calc.iva)},
              ].filter(Boolean).map((r:any,i:number)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"0.5px solid #E0DDD8",fontSize:13}}>
                  <span style={{color:"#6B6860"}}>{r.l}</span>
                  <span style={{color:r.c||"#1A1A1A"}}>{r.v}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontWeight:700,fontSize:16,borderTop:"2px solid #1A1A2E",marginTop:4}}>
                <span>TOTALE DOCUMENTO</span>
                <span style={{color:"#1A1A2E"}}>{euro(calc.totaleIva)}</span>
              </div>
            </div>

            {/* Pagamenti */}
            <div style={{marginTop:28,paddingTop:20,borderTop:"1px solid #E0DDD8",clear:"both"}}>
              <div style={{fontSize:12,fontWeight:600,color:"#1A1A2E",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Condizioni di pagamento</div>
              {pagamenti.map((p:any,i:number)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"0.5px solid #E0DDD8",fontSize:13}}>
                  <span>{p.label} {p.data&&`— ${p.data}`} {p.note&&<span style={{color:"#9A9890",fontSize:12}}> ({p.note})</span>}</span>
                  <span style={{fontWeight:600}}>{euro(calc.totaleIva*p.pct/100)} ({p.pct}%)</span>
                </div>
              ))}
            </div>

            {/* Note cliente */}
            {noteCliente && (
              <div style={{marginTop:20,padding:"12px 16px",background:"#F0EDE8",borderRadius:8,fontSize:13,color:"#6B6860",lineHeight:1.7}}>
                <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>Note per il cliente</div>
                {noteCliente}
              </div>
            )}

            {/* Termini */}
            <div style={{marginTop:28,paddingTop:20,borderTop:"1px solid #E0DDD8"}}>
              <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Termini e condizioni</div>
              <div style={{fontSize:11,color:"#6B6860",lineHeight:1.8,whiteSpace:"pre-line"}}>{`Premesse
1) La società committente dichiara di essere a conoscenza e di essere informata che la pavimentazione "Kalea" che il fornitore si appresta a fornire e posare con il presente contratto di posa e fornitura è esclusivamente un prodotto estetico, non ha proprietà di isolamento né di impermeabilizzazione e come tale deve essere considerato.
2) Qualsiasi onere di impermeabilizzazione del fondo è da ritenersi a carico del Committente, pertanto nessuna responsabilità potrà essere addebitata al fornitore qualora si verificassero problematiche di infiltrazioni presso l'immobile o comunque problematiche derivanti da un fondo non conforme sul quale il materiale venga posato.
3) Sarà esclusiva cura del committente: a) Garantire corrente elettrica 220V e acqua. b) Effettuare l'assistenza con proprio personale per la messa in quota del materiale fornito dal fornitore. c) Garantire il fondo di posa (fondo piano e asciutto) sul quale Kalea effettuerà il posizionamento dei suoi materiali.
4) A cura del fornitore: a) Fornire il nominativo della squadra di posa che verrà inviata sul cantiere e tutta la documentazione necessaria per la verifica della idoneità tecnico professionale ai sensi del D. Lgs 81/2008, tra cui il DURC. b) Effettuare tutti i lavori commissionati a regola d'arte. c) Garantire che la data d'inizio lavori sia entro il ……………………………, con condizioni climatiche idonee alla posa. d) Che l'attività di posa prosegua in continuità. e) Mantenere pulito il cantiere stoccando i materiali di scarto e rifiuti in appositi luoghi e/o contenitori definiti con la committenza. f) Un tecnico in rappresentanza del fornitore assicurerà visite periodiche in cantiere. g) Durante le lavorazioni sarà possibile che Kalea S.r.l. esegua fotografie o riprese ai fini pubblicitari e di marketing che verranno possibilmente pubblicate sul sito internet o sui social network.
5) Condizioni Generali di fornitura e posa: a) I prezzi esposti nel presente contratto si intendono IVA esclusa. b) Il presente accordo s'intende a misura e non a corpo. Ai fini del pagamento delle fatture, si precisa che i lavori si intenderanno finiti e dunque l'importo riscuotibile anche qualora sopraggiungano impedimenti esterni e contingenti che determinino l'interruzione o la sospensione della posa in opera per cause indipendenti dalla volontà della scrivente Ditta. In tal caso sarà fatturata solo la metratura effettivamente consegnata ad opera d'arte.
6) Modalità di misurazione: Per le opere di posa, la pavimentazione verrà calcolata al mq conteggiando il 5% di sfrido di lavorazione. Accessori verranno calcolati al ML conteggiando il 5% di sfrido di lavorazione. Eventuali prestazioni extra richieste dal committente verranno addebitate a parte in economia nella misura di EURO 30,00/ora per persona applicata, più il costo del materiale utilizzato.
7) Ogni eventuale contestazione che dovesse sorgere tra le parti in ordine alla interpretazione, esecuzione o risoluzione del rapporto di cui al presente contratto sarà devoluta alla competenza esclusiva del Foro di Brescia.
8) Le parti di comune accordo stabiliscono di voler far prevalere l'obbligazione del fare e che quindi il presente contratto si considera di prestazione di servizi come attività prevalente.
9) Modalità di Pagamento: Primo acconto alla firma del presente 50% + IVA. Saldo a fine lavori.`}</div>
            </div>

            {/* Sezione Privacy firma */}
            <div style={{marginTop:20,padding:"12px 16px",border:"1px solid #E0DDD8",borderRadius:8}}>
              <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em",marginBottom:10}}>PRIVACY — D.Lgs. 196/2003 e Reg. UE 2016/679</div>
              <div style={{display:"grid",gridTemplateColumns:"24px 1fr",gap:8,alignItems:"flex-start",marginBottom:8,fontSize:12,color:"#6B6860"}}>
                <div style={{width:16,height:16,border:"1px solid #1A1A2E",borderRadius:2,marginTop:1}}></div>
                <span>Consento al trattamento dei miei dati personali ai sensi dell'art. 13 del Regolamento UE n. 2016/679</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"24px 1fr",gap:8,alignItems:"flex-start",fontSize:12,color:"#6B6860"}}>
                <div style={{width:16,height:16,border:"1px solid #1A1A2E",borderRadius:2,marginTop:1}}></div>
                <span>Autorizzo il trattamento dei dati personali per l'invio di materiale informativo e pubblicitario come indicato nell'Informativa</span>
              </div>
            </div>

            {/* Accettazione */}
            <div style={{marginTop:16,padding:"16px 20px",border:"2px solid #1A1A2E",borderRadius:8}}>
              <div style={{fontSize:11,color:"#6B6860",marginBottom:6}}>Le parti dichiarano di aver preso visione degli articoli 1,2,3,4,5,6,7,8,9 del presente contratto ai sensi degli artt. 1341 e 1342 c.c. e di approvarne il contenuto.</div>
              <div style={{fontSize:12,color:"#6B6860",marginBottom:16,fontStyle:"italic"}}>Il/La sottoscritto/a dichiara di accettare il presente preventivo</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
                <div>
                  <div style={{borderTop:"1px solid #1A1A2E",paddingTop:6,fontSize:11,color:"#9A9890"}}>Firma Cliente</div>
                </div>
                <div>
                  <div style={{borderTop:"1px solid #1A1A2E",paddingTop:6,fontSize:11,color:"#9A9890"}}>Per Kalēa</div>
                </div>
              </div>
              <div style={{marginTop:20,fontSize:12,color:"#6B6860"}}>Luogo e data: _______________________</div>
            </div>

            {/* Footer */}
            <div style={{marginTop:24,paddingTop:16,borderTop:"1px solid #E0DDD8",textAlign:"center",fontSize:11,color:"#9A9890"}}>
              Kalēa · Desenzano del Garda (BS) · info@kalea.space · kalea.space · P.IVA IT_____________
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body > * { display: none !important; }
          #pdf-preview { display: block !important; box-shadow: none !important; border: none !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
