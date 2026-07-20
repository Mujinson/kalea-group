import { useState, useMemo } from "react";
import { useToolSettings } from "@/hooks/useToolSettings";

const fmt2 = (n: number) => "€ " + n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = (n: number) => "€ " + Math.round(n).toLocaleString("it-IT");
const fmtP = (n: number) => n.toFixed(1) + "%";

const COSTO_POSA_MQ = 18.00;
const COSTO_TAPPETINO_MQ = 1.50;

type Prod = {
  id: string; nome: string; fornitore: string; categoria: string;
  dims: string; listino: number; coeff: number;
  tappetino: "sempre" | "opzionale" | "mai";
};

const TUTTI_PRODOTTI: Prod[] = [
  // FLOW SPC (50+10 = 0.45)
  { id:"fl-40",      nome:"Flow 40",                   fornitore:"Flow",        categoria:"SPC a secco",    dims:"1524×228×4+1 mm",   listino:43.80, coeff:0.45, tappetino:"mai" },
  { id:"fl-55w",     nome:"Flow 55 Wood",              fornitore:"Flow",        categoria:"SPC a secco",    dims:"1524×228×4,5+1 mm", listino:49.00, coeff:0.45, tappetino:"mai" },
  { id:"fl-55c",     nome:"Flow 55 Cement",            fornitore:"Flow",        categoria:"SPC a secco",    dims:"920×460×5,5+1 mm",  listino:52.70, coeff:0.45, tappetino:"mai" },
  { id:"fl-xl",      nome:"Flow XL",                   fornitore:"Flow",        categoria:"SPC a secco",    dims:"1800×228×5+1 mm",   listino:53.00, coeff:0.45, tappetino:"mai" },
  { id:"fl-spina",   nome:"Flow Spina Ande",           fornitore:"Flow",        categoria:"SPC a secco",    dims:"640×128×4,5+1 mm",  listino:51.20, coeff:0.45, tappetino:"mai" },
  { id:"fl-55gdw",   nome:"Flow 55 GD Wood",           fornitore:"Flow",        categoria:"Vinilico colla", dims:"1500×230×2,5 mm",   listino:32.10, coeff:0.45, tappetino:"mai" },
  { id:"fl-55gdc",   nome:"Flow 55 GD Cement",         fornitore:"Flow",        categoria:"Vinilico colla", dims:"914×457×2,5 mm",    listino:31.40, coeff:0.45, tappetino:"mai" },
  { id:"fl-pxlw",    nome:"Flow+ XL Wood",             fornitore:"Flow",        categoria:"SPC a secco",    dims:"1800×228×5,5+1 mm", listino:54.10, coeff:0.45, tappetino:"mai" },
  { id:"fl-pxlt",    nome:"Flow+ XL Tile",             fornitore:"Flow",        categoria:"SPC a secco",    dims:"1200×600×5,5+1 mm", listino:55.30, coeff:0.45, tappetino:"mai" },
  { id:"fl-pspita",  nome:"Flow+ Spina Italiana",      fornitore:"Flow",        categoria:"SPC a secco",    dims:"640×128×5,5+1 mm",  listino:54.40, coeff:0.45, tappetino:"mai" },
  { id:"fl-pspfr",   nome:"Flow+ Spina Francese",      fornitore:"Flow",        categoria:"SPC a secco",    dims:"625×127×5,5+1 mm",  listino:61.80, coeff:0.45, tappetino:"mai" },

  // KRONOS (50+20+10 = 0.36)
  { id:"kp-pv120x280",nome:"Pierre Vive Noble MAXI",   fornitore:"Kronos",      categoria:"Gres Fine",      dims:"120×280 rett.",     listino:132,   coeff:0.36, tappetino:"mai" },
  { id:"kp-pv120x120",nome:"Pierre Vive Noble MAXI",   fornitore:"Kronos",      categoria:"Gres Fine",      dims:"120×120 rett.",     listino:95,    coeff:0.36, tappetino:"mai" },
  { id:"kp-pv60x120", nome:"Pierre Vive Noble",        fornitore:"Kronos",      categoria:"Gres Fine",      dims:"60×120 rett.",      listino:87,    coeff:0.36, tappetino:"mai" },
  { id:"kp-pv60x120g",nome:"Pierre Vive Noble Grip",   fornitore:"Kronos",      categoria:"Gres Fine Grip", dims:"60×120 rett.",      listino:90,    coeff:0.36, tappetino:"mai" },
  { id:"kp-pv60x60",  nome:"Pierre Vive Noble",        fornitore:"Kronos",      categoria:"Gres Fine",      dims:"60×60 rett.",       listino:70,    coeff:0.36, tappetino:"mai" },
  { id:"kp-ma120x280",nome:"Materia MAXI",             fornitore:"Kronos",      categoria:"Gres Fine",      dims:"120×280 rett.",     listino:132,   coeff:0.36, tappetino:"mai" },
  { id:"kp-ma120x120",nome:"Materia",                  fornitore:"Kronos",      categoria:"Gres Fine",      dims:"120×120 rett.",     listino:105,   coeff:0.36, tappetino:"mai" },
  { id:"kp-ma60x120", nome:"Materia",                  fornitore:"Kronos",      categoria:"Gres Fine",      dims:"60×120 rett.",      listino:105,   coeff:0.36, tappetino:"mai" },
  { id:"kp-ps60x120", nome:"Piasentina Stone",         fornitore:"Kronos",      categoria:"Gres Fine",      dims:"60×120 rett.",      listino:87,    coeff:0.36, tappetino:"mai" },
  { id:"kp-ps80x80",  nome:"Piasentina Stone",         fornitore:"Kronos",      categoria:"Gres Fine",      dims:"80×80 rett.",       listino:87,    coeff:0.36, tappetino:"mai" },
  { id:"kp-na60x120", nome:"Nativa Vena",              fornitore:"Kronos",      categoria:"Gres Fine",      dims:"60×120 rett.",      listino:95,    coeff:0.36, tappetino:"mai" },
  { id:"kp-me120x280",nome:"Metallique MAXI",          fornitore:"Kronos",      categoria:"Gres Fine",      dims:"120×280 rett.",     listino:132,   coeff:0.36, tappetino:"mai" },
  { id:"kp-me60x120", nome:"Metallique",               fornitore:"Kronos",      categoria:"Gres Fine",      dims:"60×120 rett.",      listino:87,    coeff:0.36, tappetino:"mai" },
  { id:"kp-lr150",    nome:"Le Reverse Chevron",       fornitore:"Kronos",      categoria:"Decorato",       dims:"varie",             listino:150,   coeff:0.36, tappetino:"mai" },
  { id:"kp-lr200",    nome:"Le Reverse Lappato",       fornitore:"Kronos",      categoria:"Decorato",       dims:"60×120",            listino:200,   coeff:0.36, tappetino:"mai" },
  { id:"kp-ws240",    nome:"Wood Side Mosaico Chalet", fornitore:"Kronos",      categoria:"Effetto Legno",  dims:"29×120",            listino:240,   coeff:0.36, tappetino:"mai" },
  { id:"kp-ws266",    nome:"Wood Side Listellato",     fornitore:"Kronos",      categoria:"Effetto Legno",  dims:"25×120",            listino:266,   coeff:0.36, tappetino:"mai" },
  { id:"kp-out95",    nome:"Outdoor SKE 2.0",          fornitore:"Kronos",      categoria:"Outdoor 20mm",   dims:"60×120×2cm",        listino:95,    coeff:0.36, tappetino:"mai" },
  { id:"kp-out87",    nome:"Outdoor SKE 2.0 MAXI",     fornitore:"Kronos",      categoria:"Outdoor 20mm",   dims:"80×80×2cm",         listino:87,    coeff:0.36, tappetino:"mai" },
  { id:"kp-rk102",    nome:"Rocks",                    fornitore:"Kronos",      categoria:"Gres Fine",      dims:"60×120 rett.",      listino:102,   coeff:0.36, tappetino:"mai" },

  // EXTERNO WPC (0.45)
  { id:"ex-skudo",    nome:"Externo SKUDO",            fornitore:"Externo",     categoria:"WPC Outdoor",    dims:"2000×138×23 mm",    listino:94.40, coeff:0.45, tappetino:"mai" },
  { id:"ex-trad",     nome:"Externo TRADITIONAL",      fornitore:"Externo",     categoria:"WPC Outdoor",    dims:"2000×140×25 mm",    listino:79.70, coeff:0.45, tappetino:"mai" },

  // BERRYALLOC (0.45)
  { id:"ba-ocean8v4",  nome:"Ocean 8 V4",                fornitore:"BerryAlloc",  categoria:"Laminato DPL",   dims:"1288×190×8 mm",     listino:34.20, coeff:0.45, tappetino:"sempre" },
  { id:"ba-ocean8xl",  nome:"Ocean 8 XL",                fornitore:"BerryAlloc",  categoria:"Laminato DPL",   dims:"2038×241×8 mm",     listino:39.90, coeff:0.45, tappetino:"sempre" },
  { id:"ba-ocean12v4", nome:"Ocean 12 V4",               fornitore:"BerryAlloc",  categoria:"Laminato DPL",   dims:"1288×190×12 mm",    listino:60.80, coeff:0.45, tappetino:"sempre" },
  { id:"ba-ocean12xl", nome:"Ocean 12 XL",               fornitore:"BerryAlloc",  categoria:"Laminato DPL",   dims:"2038×241×12 mm",    listino:63.80, coeff:0.45, tappetino:"sempre" },
  { id:"ba-chateau",   nome:"Chateau+",                  fornitore:"BerryAlloc",  categoria:"Laminato DPL",   dims:"504×84×8 mm spina", listino:57.90, coeff:0.45, tappetino:"sempre" },
  { id:"ba-cadenza",   nome:"Cadenza",                   fornitore:"BerryAlloc",  categoria:"Laminato DPL",   dims:"1383×214×8 mm",     listino:30.70, coeff:0.45, tappetino:"sempre" },
  { id:"ba-origcomp",  nome:"Original Comfort HPF",      fornitore:"BerryAlloc",  categoria:"Laminato HPF",   dims:"1207×198×9+2 mm",   listino:69.90, coeff:0.45, tappetino:"sempre" },
  { id:"ba-grandav",   nome:"Grand Avenue Comfort",      fornitore:"BerryAlloc",  categoria:"Laminato HPF",   dims:"2410×241×10,3+2 mm",listino:73.70, coeff:0.45, tappetino:"sempre" },
  { id:"ba-grandmaj",  nome:"Grand Majestic Comfort",    fornitore:"BerryAlloc",  categoria:"Laminato HPF",   dims:"2410×303×10,3+2 mm",listino:83.90, coeff:0.45, tappetino:"sempre" },
  { id:"ba-parqxl",    nome:"Parqwood XL",               fornitore:"BerryAlloc",  categoria:"Parquet Legno",  dims:"1190×185×10mm",     listino:75.10, coeff:0.45, tappetino:"opzionale" },
  { id:"ba-parqxxl",   nome:"Parqwood XXL Long",         fornitore:"BerryAlloc",  categoria:"Parquet Legno",  dims:"2200×210×10mm",     listino:78.30, coeff:0.45, tappetino:"opzionale" },
  { id:"ba-parqherr",  nome:"Parqwood Herringbone",      fornitore:"BerryAlloc",  categoria:"Parquet Legno",  dims:"504×84×9,5mm spina",listino:111.80,coeff:0.45, tappetino:"opzionale" },
  { id:"ba-parqhxl",   nome:"Parqwood Hydro XL",         fornitore:"BerryAlloc",  categoria:"Parquet Legno",  dims:"1190×185×12mm",     listino:78.60, coeff:0.45, tappetino:"opzionale" },
  { id:"ba-zenn30p",   nome:"Zenn RigidClick 30 Planks", fornitore:"BerryAlloc",  categoria:"Vinilico SPC",   dims:"1219×178×4+1 mm",   listino:43.80, coeff:0.45, tappetino:"mai" },
  { id:"ba-zenn55p",   nome:"Zenn RigidClick 55 Planks", fornitore:"BerryAlloc",  categoria:"Vinilico SPC",   dims:"1219×178×5+1 mm",   listino:57.90, coeff:0.45, tappetino:"mai" },
  { id:"ba-zenn55h",   nome:"Zenn RigidClick 55 Herringbone", fornitore:"BerryAlloc",categoria:"Vinilico SPC",dims:"610×108×5+1 mm",   listino:62.40, coeff:0.45, tappetino:"mai" },
  { id:"ba-zenngd30",  nome:"Zenn GD 30 Planks",         fornitore:"BerryAlloc",  categoria:"Vinilico colla", dims:"1219×178×2 mm",     listino:30.30, coeff:0.45, tappetino:"mai" },
  { id:"ba-zenngd55",  nome:"Zenn GD 55 Planks",         fornitore:"BerryAlloc",  categoria:"Vinilico colla", dims:"1219×178×2,5 mm",   listino:37.80, coeff:0.45, tappetino:"mai" },
  { id:"ba-spirit55",  nome:"Spirit Soul 55",            fornitore:"BerryAlloc",  categoria:"Vinilico SPC",   dims:"1524×228×5+1 mm",   listino:61.70, coeff:0.45, tappetino:"mai" },
  { id:"ba-spiritgd",  nome:"Spirit Pro GD 55",          fornitore:"BerryAlloc",  categoria:"Vinilico colla", dims:"1500×230×2,5 mm",   listino:42.80, coeff:0.45, tappetino:"mai" },

  // PARQUET WOODCO (0.45)
  { id:"pq-drnat",     nome:"Dream Rovere Naturale Spazz.",   fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm",listino:152.20,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-drnatlev",  nome:"Dream Rovere Naturale Levigato", fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm",listino:102.70,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-drcrema",   nome:"Dream Rovere Crema",             fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm",listino:175.00,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-drsabbia",  nome:"Dream Rovere Sabbia",            fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm",listino:175.00,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-drbianco",  nome:"Dream Rovere Bianco",            fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm",listino:176.80,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-dralpaca",  nome:"Dream Rovere Alpaca",            fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm",listino:182.40,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-drolio",    nome:"Dream Rovere Naturale Oliato",   fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm",listino:157.40,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-drcanapa",  nome:"Dream Rovere Canapa Oliato",     fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1200/2200 14mm",listino:172.40,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-nocenat",   nome:"Dream Noce Naturale Spazz.",     fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1000/2200 14mm",listino:218.30,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-nocecamm",  nome:"Dream Noce Cammello",            fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"160×1000/2200 14mm",listino:250.60,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-olmonat",   nome:"Dream Olmo Naturale",            fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"140/200×1000/2200", listino:229.70,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-castnat",   nome:"Dream Castagno Naturale",        fornitore:"Parquet Woodco",categoria:"Parquet Dream",  dims:"140/200×1000/2200", listino:225.90,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-slim120",   nome:"Slim 120 Rovere Naturale",       fornitore:"Parquet Woodco",categoria:"Parquet Slim",   dims:"120×800/1200 10mm", listino:114.80,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-slim180",   nome:"Slim 180 Rovere Naturale",       fornitore:"Parquet Woodco",categoria:"Parquet Slim",   dims:"180×1200/2200 10mm",listino:144.70,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-senselana", nome:"Sense Rovere Lana",              fornitore:"Parquet Woodco",categoria:"Parquet Sense",  dims:"150×1900 mm",       listino:73.80, coeff:0.45,tappetino:"mai" },
  { id:"pq-sensetwill",nome:"Sense Rovere Twill",             fornitore:"Parquet Woodco",categoria:"Parquet Sense",  dims:"150×1900 mm",       listino:99.50, coeff:0.45,tappetino:"mai" },
  { id:"pq-grdlimo",   nome:"Ground Rovere Limo",             fornitore:"Parquet Woodco",categoria:"Parquet Ground", dims:"180×1800/1900",     listino:93.60, coeff:0.45,tappetino:"opzionale" },
  { id:"pq-grdlaguna", nome:"Ground Rovere Laguna",           fornitore:"Parquet Woodco",categoria:"Parquet Ground", dims:"180×1800/1900",     listino:116.80,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-grdnoce",   nome:"Ground Noce Americano",          fornitore:"Parquet Woodco",categoria:"Parquet Ground", dims:"180×1800/1900",     listino:144.20,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-impkalika", nome:"Impression Rovere Kalika",       fornitore:"Parquet Woodco",categoria:"Parquet Ground", dims:"189×1800/1900",     listino:119.40,coeff:0.45,tappetino:"opzionale" },
  { id:"pq-hernat",    nome:"Her Rovere Naturale",            fornitore:"Parquet Woodco",categoria:"Parquet Spina",  dims:"90×600 spina ital.",listino:86.10, coeff:0.45,tappetino:"mai" },
  { id:"pq-starnat",   nome:"Star Rovere Naturale",           fornitore:"Parquet Woodco",categoria:"Parquet Spina",  dims:"90×510 spina 45°",  listino:98.80, coeff:0.45,tappetino:"mai" },

  // SIGNATURE WOODCO (0.45)
  { id:"sg-s45nat",    nome:"Signature Spina 45 Rovere Naturale",fornitore:"Signature",categoria:"Parquet Premium",dims:"180×620 mm",listino:223.00,coeff:0.45,tappetino:"mai" },
  { id:"sg-s45crema",  nome:"Signature Spina 45 Rovere Crema",  fornitore:"Signature",categoria:"Parquet Premium",dims:"180×620 mm",listino:242.30,coeff:0.45,tappetino:"mai" },
  { id:"sg-s45bianco", nome:"Signature Spina 45 Rovere Bianco", fornitore:"Signature",categoria:"Parquet Premium",dims:"180×620 mm",listino:244.20,coeff:0.45,tappetino:"mai" },
  { id:"sg-s45alpaca", nome:"Signature Spina 45 Rovere Alpaca", fornitore:"Signature",categoria:"Parquet Premium",dims:"180×620 mm",listino:250.00,coeff:0.45,tappetino:"mai" },
  { id:"sg-s52nat",    nome:"Signature Spina 52 Rovere Naturale",fornitore:"Signature",categoria:"Parquet Premium",dims:"180×590 mm",listino:223.00,coeff:0.45,tappetino:"mai" },
  { id:"sg-escnat",    nome:"Signature Esagono Rovere Naturale", fornitore:"Signature",categoria:"Parquet Premium",dims:"200×231 mm",listino:281.10,coeff:0.45,tappetino:"mai" },
  { id:"sg-lstnat",    nome:"Signature Listello Rovere Naturale",fornitore:"Signature",categoria:"Parquet Premium",dims:"70×800/1200 mm",listino:134.50,coeff:0.45,tappetino:"mai" },
  { id:"sg-q1nat",     nome:"Signature Q1 Rovere Naturale",     fornitore:"Signature",categoria:"Parquet Premium",dims:"600×600 mm",listino:316.40,coeff:0.45,tappetino:"mai" },
  { id:"sg-q1crema",   nome:"Signature Q1 Rovere Crema",        fornitore:"Signature",categoria:"Parquet Premium",dims:"600×600 mm",listino:335.80,coeff:0.45,tappetino:"mai" },
  { id:"sg-nocequadr", nome:"Signature Quadrotta Noce Naturale",fornitore:"Signature",categoria:"Parquet Premium",dims:"600×600 mm",listino:355.20,coeff:0.45,tappetino:"mai" },
  { id:"sg-arrnat",    nome:"Signature Arrow Rovere Naturale",  fornitore:"Signature",categoria:"Parquet Premium",dims:"45×450 mm",listino:153.20,coeff:0.45,tappetino:"mai" },
  { id:"sg-recupero",  nome:"Signature Rovere di Recupero",     fornitore:"Signature",categoria:"Parquet Premium",dims:"120/240×800/2500",listino:315.80,coeff:0.45,tappetino:"mai" },
  { id:"sg-s45olio",   nome:"Signature Spina 45 Rovere Oliato", fornitore:"Signature",categoria:"Parquet Premium",dims:"180×620 mm",listino:215.40,coeff:0.45,tappetino:"mai" },
  { id:"sg-noces45",   nome:"Signature Spina 45 Noce Naturale", fornitore:"Signature",categoria:"Parquet Premium",dims:"180×620 mm",listino:305.70,coeff:0.45,tappetino:"mai" },
];

const FORNITORI = ["Tutti", "Flow", "Kronos", "Externo", "BerryAlloc", "Parquet Woodco", "Signature"];

const FORN_COLORS: Record<string, { bg: string; color: string }> = {
  "Flow":           { bg: "#E6F1FB", color: "#0C447C" },
  "Kronos":         { bg: "#FCE4EC", color: "#880E4F" },
  "Externo":        { bg: "#E1F5EE", color: "#085041" },
  "BerryAlloc":     { bg: "#FAEEDA", color: "#633806" },
  "Parquet Woodco": { bg: "#FFF3E0", color: "#7B3A10" },
  "Signature":      { bg: "#EEEDFE", color: "#3C3489" },
};

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

function MargBadge({ pct }: { pct: number }) {
  const bg    = pct > 35 ? "#EAF3DE" : pct > 20 ? "#FAEEDA" : pct > 0 ? "#FCEBEB" : "#F1F5F9";
  const color = pct > 35 ? "#27500A" : pct > 20 ? "#633806" : pct > 0 ? "#A32D2D" : "#9A9890";
  return <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:5, fontWeight:500, fontSize:12, background:bg, color }}>{fmtP(pct)}</span>;
}

type S = { markup: number };
const defaults: S = { markup: 60 };

export default function Preventivatore() {
  const { settings, update } = useToolSettings<S>("preventivatore", defaults);
  const markup = settings.markup;
  const setMarkup = (v: number) => update({ markup: v });

  const [search, setSearch]             = useState("");
  const [fornitoreFilter, setFornitore] = useState("Tutti");
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [mqPrev, setMqPrev]             = useState(50);
  const [sfrido, setSfrido]             = useState(10);
  const [incPosa, setIncPosa]           = useState(true);
  const [incTapp, setIncTapp]           = useState(true);
  const [scCliente, setScCliente]       = useState(0);
  const [showAll, setShowAll]           = useState(false);

  const filtered = useMemo(() => {
    return TUTTI_PRODOTTI.filter(p => {
      const fs = fornitoreFilter === "Tutti" || p.fornitore === fornitoreFilter;
      const ss = !search || p.nome.toLowerCase().includes(search.toLowerCase())
                         || p.categoria.toLowerCase().includes(search.toLowerCase())
                         || p.fornitore.toLowerCase().includes(search.toLowerCase())
                         || p.dims.toLowerCase().includes(search.toLowerCase());
      return fs && ss;
    });
  }, [search, fornitoreFilter]);

  const displayed = showAll ? filtered : filtered.slice(0, 30);
  const selected  = TUTTI_PRODOTTI.find(p => p.id === selectedId);

  let prev: any = null;
  if (selected) {
    const costoAcqMq    = selected.listino * selected.coeff;
    const prezzoMatMq   = costoAcqMq * (1 + markup / 100);
    const mqOrd         = mqPrev * (1 + sfrido / 100);
    const costoMatTot   = mqOrd * costoAcqMq;
    const prezzoMatTot  = mqOrd * prezzoMatMq;

    const costoPosaTot  = incPosa ? mqPrev * COSTO_POSA_MQ : 0;
    const prezzoPosaTot = incPosa ? mqPrev * COSTO_POSA_MQ * (1 + markup / 100) : 0;

    const tappNeeded = incTapp && selected.tappetino !== "mai";
    const costoTappTot  = tappNeeded ? mqPrev * COSTO_TAPPETINO_MQ : 0;
    const prezzoTappTot = tappNeeded ? mqPrev * COSTO_TAPPETINO_MQ * (1 + markup / 100) : 0;

    const costoTotale    = costoMatTot + costoPosaTot + costoTappTot;
    const prezzoListino  = prezzoMatTot + prezzoPosaTot + prezzoTappTot;
    const prezzoFinale   = prezzoListino * (1 - scCliente / 100);
    const margineE       = prezzoFinale - costoTotale;
    const marginePct     = prezzoFinale > 0 ? (margineE / prezzoFinale) * 100 : 0;
    const scontoMaxPct   = ((prezzoListino - costoTotale) / prezzoListino) * 100;
    const prezzoMqFin    = mqPrev > 0 ? prezzoFinale / mqPrev : 0;

    prev = {
      costoAcqMq, prezzoMatMq, mqOrd,
      costoMatTot, prezzoMatTot,
      costoPosaTot, prezzoPosaTot,
      costoTappTot, prezzoTappTot, tappNeeded,
      costoTotale, prezzoListino, prezzoFinale,
      margineE, marginePct, scontoMaxPct, prezzoMqFin,
    };
  }

  const fColors = selected ? (FORN_COLORS[selected.fornitore] || { bg: "#F1F5F9", color: "#5F5E5A" }) : { bg: "", color: "" };

  return (
    <div style={{ fontFamily: "'new-order', sans-serif", color: "#1A1A1A", maxWidth: 1280, margin: "0 auto", padding: "8px 4px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 400, color: "#1A1A2E", marginBottom: 4 }}>Preventivatore Kalēa</h1>
        <p style={{ fontSize: 13, color: "#9A9890" }}>Tutti i fornitori · Materiale + Posa + Tappetino · Calcola se ci stai dentro con i prezzi</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "18px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #E0DDD8" }}>
          Parametri globali — si applicano a tutti i prodotti
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <div>
            <Slider label="Markup Kalēa sui materiali" min={20} max={130} value={markup} step={5} onChange={setMarkup} format={(v: number) => v + "%"} />
          </div>
          <div style={{ background: "#F1F5F9", borderRadius: 8, padding: "12px 14px", fontSize: 12, color: "#6B6860", lineHeight: 1.8 }}>
            <strong>Costi posa fissi:</strong><br />
            Posa pavimento: <strong>18,00 €/mq</strong><br />
            Posa tappetino/materassino: <strong>1,50 €/mq</strong><br />
            <span style={{ fontSize: 11, color: "#9A9890" }}>Basato su operaio CCNL Edilizia</span>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "#6B6860", marginBottom: 8 }}>Includi nel preventivo</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => setIncPosa(!incPosa)}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 12, textAlign: "left",
                  background: incPosa ? "#1A1A2E" : "#F1F5F9",
                  color: incPosa ? "#fff" : "#6B6860",
                  borderColor: incPosa ? "#1A1A2E" : "#E0DDD8" }}>
                {incPosa ? "✓" : "○"} Posa pavimento (18 €/mq)
              </button>
              <button onClick={() => setIncTapp(!incTapp)}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 12, textAlign: "left",
                  background: incTapp ? "#1A1A2E" : "#F1F5F9",
                  color: incTapp ? "#fff" : "#6B6860",
                  borderColor: incTapp ? "#1A1A2E" : "#E0DDD8" }}>
                {incTapp ? "✓" : "○"} Tappetino/materassino (1,50 €/mq)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "18px 22px" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #E0DDD8" }}>
              Scegli il prodotto — {TUTTI_PRODOTTI.length} articoli da {FORNITORI.length - 1} fornitori
            </div>

            <div style={{ position: "relative", marginBottom: 12 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#9A9890" }}>🔍</span>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setShowAll(false); }}
                placeholder="Cerca per nome, fornitore, categoria, formato..."
                style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: 10, border: "1px solid #E0DDD8", fontSize: 13, outline: "none", background: "#F7F6F3", boxSizing: "border-box" }}
              />
              {search && (
                <button onClick={() => setSearch("")}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9A9890" }}>×</button>
              )}
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {FORNITORI.map(f => {
                const fc = FORN_COLORS[f] || { bg: "#F1F5F9", color: "#5F5E5A" };
                return (
                  <button key={f} onClick={() => { setFornitore(f); setShowAll(false); }}
                    style={{ padding: "4px 12px", borderRadius: 16, border: "1px solid", cursor: "pointer", fontSize: 11, fontWeight: 500,
                      background: fornitoreFilter === f ? (f === "Tutti" ? "#1A1A2E" : fc.bg) : "transparent",
                      color: fornitoreFilter === f ? (f === "Tutti" ? "#fff" : fc.color) : "#9A9890",
                      borderColor: fornitoreFilter === f ? (f === "Tutti" ? "#1A1A2E" : fc.color) : "#E0DDD8" }}>
                    {f}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 11, color: "#9A9890", marginBottom: 8 }}>{filtered.length} risultati{filtered.length !== TUTTI_PRODOTTI.length ? " (filtrati)" : ""}</div>

            <div style={{ maxHeight: 480, overflowY: "auto", borderRadius: 8, border: "1px solid #E0DDD8" }}>
              {displayed.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#9A9890", fontSize: 13 }}>
                  Nessun prodotto trovato per "{search}"
                </div>
              ) : (
                <>
                  {displayed.map(p => {
                    const costoMq  = p.listino * p.coeff;
                    const prezzoMq = costoMq * (1 + markup / 100);
                    const margPct  = ((prezzoMq - costoMq) / prezzoMq) * 100;
                    const isSel    = p.id === selectedId;
                    const fc       = FORN_COLORS[p.fornitore] || { bg: "#F1F5F9", color: "#5F5E5A" };
                    return (
                      <div key={p.id} onClick={() => setSelectedId(p.id)}
                        style={{
                          padding: "10px 14px",
                          borderBottom: "0.5px solid #E0DDD8",
                          cursor: "pointer",
                          background: isSel ? "#E6F1FB" : "transparent",
                          borderLeft: isSel ? "3px solid #1A1A2E" : "3px solid transparent",
                          transition: "background .1s",
                        }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                          <div style={{ fontWeight: 500, fontSize: 13, flex: 1, paddingRight: 8 }}>{p.nome}</div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E", whiteSpace: "nowrap" }}>{fmt2(prezzoMq)}<span style={{ fontSize: 10, color: "#9A9890" }}>/mq</span></div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ display: "inline-block", fontSize: 10, padding: "1px 6px", borderRadius: 3, fontWeight: 500, background: fc.bg, color: fc.color }}>{p.fornitore}</span>
                          <span style={{ fontSize: 11, color: "#9A9890" }}>{p.categoria}</span>
                          <span style={{ fontSize: 11, color: "#9A9890" }}>· {p.dims}</span>
                          <span style={{ marginLeft: "auto" }}>
                            <MargBadge pct={margPct} />
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "#9A9890" }}>
                          <span>Listino: {fmt2(p.listino)}/mq · Tuo costo: {fmt2(costoMq)}/mq</span>
                          {p.tappetino === "sempre" && <span style={{ color: "#0C447C" }}>+ tappetino</span>}
                          {p.tappetino === "opzionale" && <span style={{ color: "#633806" }}>tappetino opz.</span>}
                        </div>
                      </div>
                    );
                  })}
                  {filtered.length > 30 && !showAll && (
                    <div style={{ padding: "12px", textAlign: "center" }}>
                      <button onClick={() => setShowAll(true)}
                        style={{ padding: "6px 18px", borderRadius: 8, border: "1px solid #E0DDD8", background: "#F1F5F9", cursor: "pointer", fontSize: 12, color: "#6B6860" }}>
                        Mostra tutti i {filtered.length} risultati
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          {!selected ? (
            <div style={{ background: "#F1F5F9", borderRadius: 12, padding: "40px 24px", textAlign: "center", color: "#9A9890" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>←</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Seleziona un prodotto</div>
              <div style={{ fontSize: 13 }}>Clicca qualsiasi articolo nella lista per calcolare il preventivo</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#fff", border: `1px solid ${fColors.color}`, borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#1A1A2E", marginBottom: 4 }}>{selected.nome}</div>
                    <div style={{ fontSize: 12, color: "#9A9890" }}>{selected.dims} · {selected.categoria}</div>
                  </div>
                  <span style={{ display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 6, fontWeight: 500, background: fColors.bg, color: fColors.color }}>{selected.fornitore}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
                  {[
                    { l: "Listino fornitore", v: fmt2(selected.listino) + "/mq", c: "#1A1A1A" },
                    { l: "Tuo costo acquisto", v: fmt2(selected.listino * selected.coeff) + "/mq", c: "#A32D2D" },
                    { l: "Tuo prezzo materiale", v: fmt2(selected.listino * selected.coeff * (1 + markup / 100)) + "/mq", c: "#27500A" },
                  ].map(k => (
                    <div key={k.l} style={{ background: "#F1F5F9", borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#9A9890", marginBottom: 3 }}>{k.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: k.c }}>{k.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "16px 20px" }}>
                <Slider label="mq da posare" min={5} max={500} value={mqPrev} step={5} onChange={setMqPrev} format={(v: number) => v + " mq"} />
                <Slider label="Sfrido / sovrappiù (%)" min={5} max={25} value={sfrido} step={1} onChange={setSfrido} format={(v: number) => v + "%"} />
                <Slider label="Sconto al cliente (%)" min={0} max={45} value={scCliente} step={1} onChange={setScCliente} format={(v: number) => v + "%"} />

                {selected.tappetino === "sempre" && (
                  <div style={{ background: "#E6F1FB", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#0C447C", marginTop: 4 }}>
                    ℹ Questo prodotto richiede sempre il tappetino (laminato flottante)
                  </div>
                )}
                {selected.tappetino === "opzionale" && (
                  <div style={{ background: "#FAEEDA", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#633806", marginTop: 4 }}>
                    ℹ Tappetino opzionale per questo prodotto (parquet — dipende dalla posa)
                  </div>
                )}
                {selected.tappetino === "mai" && (
                  <div style={{ background: "#F1F5F9", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#9A9890", marginTop: 4 }}>
                    Tappetino non applicabile per questo prodotto
                  </div>
                )}
              </div>

              {prev && (
                <div style={{ background: "#fff", border: "1px solid #E0DDD8", borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #E0DDD8" }}>
                    Conto economico preventivo
                  </div>

                  <div style={{ fontSize: 11, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Tuoi costi</div>
                  {[
                    { label: `Materiale (${prev.mqOrd.toFixed(1)} mq con sfrido)`, value: fmt0(prev.costoMatTot), color: "#A32D2D" },
                    incPosa && { label: `Posa (${mqPrev} mq × 18 €)`, value: fmt0(prev.costoPosaTot), color: "#A32D2D" },
                    prev.tappNeeded && { label: `Tappetino (${mqPrev} mq × 1,50 €)`, value: fmt0(prev.costoTappTot), color: "#A32D2D" },
                    { label: "Totale costo", value: fmt0(prev.costoTotale), color: "#A32D2D", bold: true },
                  ].filter(Boolean).map((r: any, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "0.5px solid #E0DDD8", fontSize: 13 }}>
                      <span style={{ color: "#6B6860", fontWeight: r.bold ? 500 : 400 }}>{r.label}</span>
                      <span style={{ fontWeight: 500, color: r.color }}>{r.value}</span>
                    </div>
                  ))}

                  <div style={{ height: 1, background: "#E0DDD8", margin: "10px 0" }} />

                  <div style={{ fontSize: 11, color: "#9A9890", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Al cliente</div>
                  {[
                    { label: `Materiale al cliente`, value: fmt0(prev.prezzoMatTot) },
                    incPosa && { label: `Posa al cliente`, value: fmt0(prev.prezzoPosaTot) },
                    prev.tappNeeded && { label: `Tappetino al cliente`, value: fmt0(prev.prezzoTappTot) },
                    { label: "Prezzo totale listino", value: fmt0(prev.prezzoListino), bold: true },
                    scCliente > 0 && { label: `Sconto ${scCliente}%`, value: `− ${fmt0(prev.prezzoListino - prev.prezzoFinale)}`, color: "#633806" },
                    { label: "Prezzo finale al cliente", value: fmt0(prev.prezzoFinale), big: true, color: "#0C447C" },
                    { label: "Prezzo al mq (tutto incluso)", value: fmt2(prev.prezzoMqFin) + "/mq", color: "#0C447C" },
                  ].filter(Boolean).map((r: any, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "0.5px solid #E0DDD8", fontSize: 13 }}>
                      <span style={{ color: "#6B6860", fontWeight: r.bold ? 500 : 400 }}>{r.label}</span>
                      <span style={{ fontWeight: 500, fontSize: r.big ? 16 : 13, color: r.color || "#1A1A1A" }}>{r.value}</span>
                    </div>
                  ))}

                  <div style={{ height: 1, background: "#E0DDD8", margin: "10px 0" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 }}>
                    <span style={{ color: "#6B6860" }}>Margine lordo €</span>
                    <span style={{ fontWeight: 500, color: prev.margineE > 0 ? "#27500A" : "#A32D2D" }}>{fmt0(prev.margineE)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 }}>
                    <span style={{ color: "#6B6860" }}>Margine lordo %</span>
                    <span style={{ fontWeight: 500 }}><MargBadge pct={prev.marginePct} /></span>
                  </div>

                  <div style={{
                    marginTop: 14, borderRadius: 10, padding: "12px 16px", fontSize: 13, lineHeight: 1.6,
                    background: prev.marginePct > 30 ? "#EAF3DE" : prev.marginePct > 15 ? "#FAEEDA" : "#FCEBEB",
                    border: `1px solid ${prev.marginePct > 30 ? "#639922" : prev.marginePct > 15 ? "#EF9F27" : "#E24B4A"}`,
                    color: prev.marginePct > 30 ? "#27500A" : prev.marginePct > 15 ? "#633806" : "#A32D2D",
                  }}>
                    {prev.marginePct > 30 && `✓ Buona posizione — margine ${fmtP(prev.marginePct)}. Puoi ancora offrire fino a ${fmtP(prev.scontoMaxPct - scCliente)} di sconto.`}
                    {prev.marginePct > 15 && prev.marginePct <= 30 && `⚠ Margine ridotto (${fmtP(prev.marginePct)}). Attenzione agli imprevisti — stai lavorando con poco cuscinetto.`}
                    {prev.marginePct <= 15 && `✗ Margine troppo basso (${fmtP(prev.marginePct)}). Non ci stai dentro — riduci lo sconto o aumenta il prezzo.`}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
