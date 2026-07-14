// @ts-nocheck
import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import WoodcoBlock, { emptyWoodcoSelection, type WoodcoSelection } from "@/components/preventivo/WoodcoBlock";
import QuoteCatalogSections, { catalogLinesTotal, type CatalogLine } from "@/components/admin/quotes/QuoteCatalogSections";

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
  { id:"fl-pxlw", nome:"Flow+ XL Wood", fornitore:"Flow", categoria:"SPC a secco", dims:"1800×228,6×5,5+1mm", listino:54.10, coeff:0.45, tappetino:"mai" },
  { id:"fl-pxlt", nome:"Flow+ XL Tile", fornitore:"Flow", categoria:"SPC a secco", dims:"1200×600×5,5+1mm", listino:55.30, coeff:0.45, tappetino:"mai" },
  { id:"fl-pspita", nome:"Flow+ Spina Italiana", fornitore:"Flow", categoria:"SPC a secco", dims:"640×128×5,5+1mm", listino:54.40, coeff:0.45, tappetino:"mai" },
  { id:"fl-pspfr", nome:"Flow+ Spina Francese", fornitore:"Flow", categoria:"SPC a secco", dims:"625×127×5,5+1mm", listino:61.80, coeff:0.45, tappetino:"mai" },
  { id:"fl-55gdw", nome:"Flow 55 GD Wood", fornitore:"Flow", categoria:"Vinilico colla", dims:"1500×230×2,5mm", listino:32.10, coeff:0.45, tappetino:"mai" },
  { id:"fl-55gdc", nome:"Flow 55 GD Cement", fornitore:"Flow", categoria:"Vinilico colla", dims:"914,4×457,2×2,5mm", listino:31.40, coeff:0.45, tappetino:"mai" },
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
  { id:"pq-dream", nome:"Parquet Dream", fornitore:"Parquet Woodco", categoria:"Parquet Dream", dims:"160×1200/2200 14mm", listino:152.20, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-ground", nome:"Parquet Ground", fornitore:"Parquet Woodco", categoria:"Parquet Ground", dims:"—", listino:0, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-kalika", nome:"Parquet Kalika", fornitore:"Parquet Woodco", categoria:"Parquet Kalika", dims:"—", listino:0, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-element", nome:"Parquet Element", fornitore:"Parquet Woodco", categoria:"Parquet Element", dims:"—", listino:0, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-sense", nome:"Parquet Sense", fornitore:"Parquet Woodco", categoria:"Parquet Sense", dims:"—", listino:0, coeff:0.45, tappetino:"opzionale" },
  { id:"pq-star", nome:"Parquet Star", fornitore:"Parquet Woodco", categoria:"Parquet Star", dims:"—", listino:98.80, coeff:0.45, tappetino:"mai" },
  { id:"pq-him", nome:"Parquet Him", fornitore:"Parquet Woodco", categoria:"Parquet Him", dims:"—", listino:0, coeff:0.45, tappetino:"mai" },
  { id:"pq-her", nome:"Parquet Her", fornitore:"Parquet Woodco", categoria:"Parquet Her", dims:"—", listino:86.10, coeff:0.45, tappetino:"mai" },
  { id:"sg-s45nat", nome:"Signature Spina 45 Rovere Naturale", fornitore:"Parquet Woodco", categoria:"Parquet Premium", dims:"180×620mm", listino:223.00, coeff:0.45, tappetino:"mai" },
  { id:"sg-s45crema", nome:"Signature Spina 45 Rovere Crema", fornitore:"Parquet Woodco", categoria:"Parquet Premium", dims:"180×620mm", listino:242.30, coeff:0.45, tappetino:"mai" },
  { id:"sg-escnat", nome:"Signature Esagono Rovere Naturale", fornitore:"Parquet Woodco", categoria:"Parquet Premium", dims:"200×231mm", listino:281.10, coeff:0.45, tappetino:"mai" },
  { id:"sg-q1nat", nome:"Signature Q1 Rovere Naturale", fornitore:"Parquet Woodco", categoria:"Parquet Premium", dims:"600×600mm", listino:316.40, coeff:0.45, tappetino:"mai" },
  // ─── Biomag (kalea.space/it/biomag-floor) — produzione Kalēa, gestito a magazzino ───
  { id:"bm-mgo", nome:"Biomag Floor MgO", fornitore:"Biomag", categoria:"Pannello MgO", dims:"1220×2440×6mm", listino:50.00, coeff:0.30, tappetino:"mai", magazzino:true, magazzinoProductType:"MgO" },
];

const FORNITORI_LIST = ["Tutti","Flow","Kronos","Externo","BerryAlloc","Parquet Woodco","Biomag"];
const FORN_STYLE: Record<string, { bg: string; c: string }> = {
  "Flow":{bg:"#E6F1FB",c:"#0C447C"},"Kronos":{bg:"#FCE4EC",c:"#880E4F"},
  "Externo":{bg:"#E1F5EE",c:"#085041"},"BerryAlloc":{bg:"#FAEEDA",c:"#633806"},
  "Parquet Woodco":{bg:"#FFF3E0",c:"#7B3A10"},"Signature":{bg:"#EEEDFE",c:"#3C3489"},
  "Biomag":{bg:"#EAF3DE",c:"#27500A"},
};
const prodStyle = (p: any) => FORN_STYLE[p.nome?.startsWith("Signature") ? "Signature" : p.fornitore] || {bg:"#F1F5F9",c:"#5F5E5A"};
const prodBadgeLabel = (p: any) => p.nome?.startsWith("Signature") ? "Signature" : p.fornitore;

// ─── TONALITÀ per prodotto (datalist suggestion, input libero comunque consentito) ─
// Nomi commerciali REALI delle tonalità — fonti ufficiali verificate:
// pavimentoflow.it, kronosceramiche.com, berryalloc.com.
// Per le collezioni non verificate l'array è vuoto: scrivere il nome a mano nel preventivo.
const TONALITA_BY_PRODUCT: Record<string, string[]> = {
  // ─── Flow Floor (pavimentoflow.it) — nomi di montagne e vulcani ───
  "fl-40":     ["Vinson","Sinai","Pirenei","Pamir","Cook","Carpazi"],
  "fl-55w":    ["Annapurna","Nanga Parbat","Himalaya","Kilimangiaro","Cerro Torre","Atlante","Dolomiti","Monte Bianco","K2","Everest"],
  "fl-55c":    ["Teide","Fuji","Asama"],
  "fl-xl":     ["Cordillera","Rocky","Ararat","Whitney","Meru","Logan","Caucaso","Ambrym","Aso","Vesuvio","Nabro","Kibo"],
  "fl-spina":  ["Karu","Zagros","Ural","Taurus","Jura"],
  "fl-pxlw":   ["Cordillera","Rocky","Ararat","Whitney","Meru","Logan","Caucaso"],
  "fl-pxlt":   ["Ambrym","Aso","Vesuvio","Nabro","Kibo"],
  "fl-pspita": ["Karu","Zagros","Ural"],
  "fl-pspfr":  ["Taurus","Jura"],
  "fl-55gdw":  [],
  "fl-55gdc":  [],

  // ─── Kronos Ceramiche (kronosceramiche.com) ───
  // Pierre Vive (collezione Maxi)
  "kp-pv120x280": ["Loire Noble","Orval Noble","Morvan Noble","Brionne Noble"],
  "kp-pv120x120": ["Loire Noble","Orval Noble","Morvan Noble","Brionne Noble"],
  "kp-pv60x120":  ["Loire Noble","Orval Noble","Morvan Noble","Brionne Noble"],
  "kp-pv60x120g": ["Loire Noble","Orval Noble","Morvan Noble","Brionne Noble"],
  "kp-pv60x60":   ["Loire Noble","Orval Noble","Morvan Noble","Brionne Noble"],
  // Materia
  "kp-ma120x280": ["Gesso","Cemento","Sandalo","Seta","Cenere","Tortora","Incenso","Pesca","Oliva"],
  "kp-ma120x120": ["Gesso","Cemento","Sandalo","Seta","Cenere","Tortora","Incenso","Pesca","Oliva"],
  "kp-ma60x120":  ["Gesso","Cemento","Sandalo","Seta","Cenere","Tortora","Incenso","Pesca","Oliva"],
  // Piasentina Stone
  "kp-ps60x120":  ["Velvet","Flamed","Milled"],
  // Nativa (Vena)
  "kp-na60x120":  ["Vena Lux","Vena Aurum","Vena Tibur","Vena Lapillo"],
  // Metallique
  "kp-me120x280": ["Noir","Lame","Brune","Noir Oxyde","Lame Oxyde","Brune Oxyde"],
  "kp-me60x120":  ["Noir","Lame","Brune","Noir Oxyde","Lame Oxyde","Brune Oxyde"],
  // Le Reverse (chevron)
  "kp-lr150":     ["Opal Elegance","Opal Antique","Opal Carved","Dune Elegance","Dune Antique","Dune Carved","Taupe Elegance","Taupe Antique","Taupe Carved","Nuit Elegance","Nuit Antique","Nuit Carved"],
  // Wood Side
  "kp-ws240":     ["Oak","Nut"],
  // Outdoor SKE 2.0 — colori non confermati dal sito
  "kp-out95":     [],
  // Rocks
  "kp-rk102":     ["Porfido","Silver Black"],

  // ─── Externo (decking) — tonalità fornite dal cliente ───
  "ex-trad":  ["Traditional Dark Grey Polished","Traditional Dark Grey Zigrinato","Traditional Light Brown Polished","Traditional Light Brown Knurled"],
  "ex-skudo": ["Skudo Golden Polished","Brushed Golden Shield","Skudo Sand Polished","Skudo Sand Brushed","Skudo Antique Polished","Skudo Antique Brushed","Skudo Teak Polished","Skudo Teak Brushed","Skudo Ipe Polished","Brushed Ipe Shield"],

  // ─── BerryAlloc (berryalloc.com) ───
  "ba-ocean8v4":  ["Bloom Light Brown","Bloom Light Natural","Bloom Natural","Bloom Sand Natural","Bloom Silver Grey","Bloom Warm Natural","Canyon Light","Canyon Natural","Charme Black","Charme Light Natural","Charme White","Chestnut White","Crush Brown Natural","Crush Light","Crush Natural"],
  "ba-ocean12v4": ["Bloom Sand Natural","Bloom Silver Grey","Epic Light","Epic Natural","Gyant Light Sand","Gyant Sand Natural","Gyant Warm Brown","Gyant Warm Natural","Jazz Light Grey","Jazz Sand Natural","Select Light Brown","Select Sand Natural"],
  "ba-ocean8xl":  ["Bloom Sand Natural","Bloom Silver Grey","Gyant XL Light Sand","Gyant XL Sand Natural","Gyant XL Warm Brown","Gyant XL Warm Natural","Jazz XL Light Grey","Jazz XL Sand Natural","Select Light Brown","Select Sand Natural"],
  "ba-chateau":   ["Bloom Light Brown","Bloom Sand Natural","Charme Black","Charme Light Natural","Chestnut White","Gyant Dark Brown","Gyant Light","Java Light Grey"],
  "ba-cadenza":   ["Allegro Light","Allegro Natural","Allegro Brown","Allegro Dark Brown","Allegro Light Grey","Legato Light","Legato Light Natural","Legato Dark Brown","Legato Dark Grey"],
  // Zenn — nomi di città (verificato su berryalloc.com)
  "ba-zenn55p":   ["Caïro","Faro","Monsanto","Orlando","Oslo","Palermo","Porto","Sorrento"],
  "ba-zenn30p":   ["Caïro","Faro","Monsanto","Orlando","Oslo","Palermo","Porto","Sorrento"],
  "ba-zenngd55":  ["Caïro","Faro","Monsanto","Orlando","Oslo","Palermo","Porto","Sorrento"],
  // Le seguenti collezioni non sono confermate dal sito ufficiale — inserire il nome a mano
  "ba-origcomp":  [],
  "ba-grandav":   [],
  "ba-parqxl":    [],
  "ba-parqherr":  [],
  "ba-spirit55":  [],

  // ─── Parquet Woodco — tonalità fornite dal cliente ───
  "pq-dream":    ["Night","Cinnamon","Chocolate","Bark","Leather","Cognac","Earth","Tannin","Incense","Fog","Flint","Honey","Almond","Cumin","Malt","Fallow","Vicuña","Alpaca","Cashmere","Earth of Umber","Cookie","Sandstone","Golden","Natural","Moonlight","Spicy","Salt","Monk's Robe","Cream","Elegant","Camel","Ivory","Natural Oiled","White","Sand","Hemp"],
  "pq-star":     ["Smoked","Cream","Natural"],
  "pq-ground":   ["American","Forest","Arctic","Field","Underwood","Dune","Tundra","Peat","Calanca","Limo"],
  "pq-kalika":   ["Kalika"],
  "pq-element":  ["Clay","Ink","Paper","Plaster"],
  "pq-sense":    ["Canvas","Hessian","Mohair","Silk","Jute","Cotton","Wool"],
  "pq-him":      ["Naturale ABCD","Natural AB"],
  "pq-her":      ["Naturale","Cream","Fumé"],

  // ─── Signature — tonalità fornite dal cliente ───
  "sg-s45nat":   ["Dorato","Arenaria","Naturale","Chiaro di Luna","Elegante","Cammello","Veste di Monaco","Cannella Fumé","Speziato","Terra","Tannino"],
  "sg-s45crema": ["Dorato","Arenaria","Naturale","Chiaro di Luna","Elegante","Cammello","Veste di Monaco","Cannella Fumé","Speziato","Terra","Tannino"],
  "sg-escnat":   ["Dorato","Arenaria","Naturale","Chiaro di Luna","Elegante","Cammello","Veste di Monaco","Cannella Fumé","Speziato","Terra","Tannino"],
  "sg-q1nat":    ["Dorato","Arenaria","Naturale","Chiaro di Luna","Elegante","Cammello","Veste di Monaco","Cannella Fumé","Speziato","Terra","Tannino"],

  // ─── Biomag Floor MgO — tonalità Kalēa ───
  "bm-mgo":      ["Aurora","Corteccia","Cenere","Sabbia","Silven","Terram","Perla","Velora"],
};




// ─── HELPERS ─────────────────────────────────────────────────
const euro = (n: number) => "€ " + (Math.round(n*100)/100).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2});
const pct = (n: number) => n.toFixed(1)+"%";
const today = () => new Date().toLocaleDateString("it-IT");
const addDays = (d: any, n: number) => { const x=new Date(); x.setDate(x.getDate()+n); return x.toLocaleDateString("it-IT"); };
const nextNum = () => { const n=(parseInt(localStorage.getItem("kal_prev_num")||"0")+1); localStorage.setItem("kal_prev_num", String(n)); return "KAL-"+new Date().getFullYear()+"-"+String(n).padStart(3,"0"); };

function Slider({ label, min, max, value, step, onChange, format, unit, editable }: any) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}>
        <span style={{fontSize:13,color:"#6B6860"}}>{label}</span>
        {editable ? (
          <span style={{fontSize:13,fontWeight:500,display:"inline-flex",alignItems:"center",gap:4}}>
            <input
              type="number"
              value={value}
              min={min}
              step={step}
              onChange={e=>{
                const v = e.target.value === "" ? 0 : Number(e.target.value);
                if (!Number.isNaN(v)) onChange(v);
              }}
              style={{width:72,textAlign:"right",border:"1px solid #E0DDD8",borderRadius:6,padding:"2px 6px",fontSize:13,fontWeight:500,background:"#fff"}}
            />
            {unit && <span style={{color:"#6B6860"}}>{unit}</span>}
          </span>
        ) : (
          <span style={{fontSize:13,fontWeight:500}}>{format(value)}</span>
        )}
      </div>
      <input type="range" min={min} max={max} step={step} value={Math.min(Math.max(value,min),max)}
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
const T: any = {
  IT: {
    titolo: "PREVENTIVO", validita: "Valido fino al", cliente: "Cliente",
    indirizzo: "Indirizzo", telefono: "Telefono", email: "Email",
    desc: "Descrizione", mq: "mq", prezzo_unit: "Prezzo unit.", totale: "Totale",
    fornitura: "Fornitura materiali", posa: "Posa in opera", tappetino: "Materassino/sottofondo",
    trasporto: "Trasporto materiali", trasferta: "Supplemento trasferta",
    subtotale: "Subtotale imponibile", iva: "IVA 22%", totale_doc: "TOTALE",
    pagamenti: "CONDIZIONI DI PAGAMENTO", acconto: "Acconto", meta_lavori: "A metà lavori", saldo: "Saldo finale",
    note_cliente: "Note", termini: "TERMINI E CONDIZIONI",
    termini_testo: `Premesse\n1) La società committente dichiara di essere a conoscenza e di essere informata che la pavimentazione "Kalea" che il fornitore si appresta a fornire e posare con il presente contratto di posa e fornitura è esclusivamente un prodotto estetico, non ha proprietà di isolamento né di impermeabilizzazione e come tale deve essere considerato.\n2) Qualsiasi onere di impermeabilizzazione del fondo è da ritenersi a carico del Committente, pertanto nessuna responsabilità potrà essere addebitata al fornitore qualora si verificassero problematiche di infiltrazioni presso l\'immobile o comunque problematiche derivanti da un fondo non conforme sul quale il materiale venga posato.\n3) Sarà esclusiva cura del committente: a) Garantire corrente elettrica 220V e acqua. b) Effettuare l\'assistenza con proprio personale per la messa in quota del materiale fornito dal fornitore. c) Garantire il fondo di posa (fondo piano e asciutto) sul quale Kalea effettuerà il posizionamento dei suoi materiali.\n4) A cura del fornitore: a) Fornire il nominativo della squadra di posa che verrà inviata sul cantiere e tutta la documentazione necessaria per la verifica della idoneità tecnico professionale ai sensi del D. Lgs 81/2008, tra cui il DURC. b) Effettuare tutti i lavori commissionati a regola d\'arte. c) Garantire che la data d\'inizio lavori sia entro il ……………………………, con condizioni climatiche idonee alla posa. d) Che l\'attività di posa prosegua in continuità. e) Mantenere pulito il cantiere stoccando i materiali di scarto e rifiuti in appositi luoghi e/o contenitori definiti con la committenza. f) Un tecnico in rappresentanza del fornitore assicurerà visite periodiche in cantiere. g) Durante le lavorazioni sarà possibile che Kalea S.r.l. esegua fotografie o riprese ai fini pubblicitari e di marketing che verranno possibilmente pubblicate sul sito internet o sui social network.\n5) Condizioni Generali di fornitura e posa: a) I prezzi esposti nel presente contratto si intendono IVA esclusa. b) Il presente accordo s\'intende a misura e non a corpo. Ai fini del pagamento delle fatture, si precisa che i lavori si intenderanno finiti e dunque l\'importo riscuotibile anche qualora sopraggiungano impedimenti esterni e contingenti che determinino l\'interruzione o la sospensione della posa in opera per cause indipendenti dalla volontà della scrivente Ditta. In tal caso sarà fatturata solo la metratura effettivamente consegnata ad opera d\'arte.\n6) Modalità di misurazione: Per le opere di posa, la pavimentazione verrà calcolata al mq conteggiando il 5% di sfrido di lavorazione. Accessori verranno calcolati al ML conteggiando il 5% di sfrido di lavorazione. Eventuali prestazioni extra richieste dal committente verranno addebitate a parte in economia nella misura di EURO 30,00/ora per persona applicata, più il costo del materiale utilizzato.\n7) Ogni eventuale contestazione che dovesse sorgere tra le parti in ordine alla interpretazione, esecuzione o risoluzione del rapporto di cui al presente contratto sarà devoluta alla competenza esclusiva del Foro di Brescia.\n8) Le parti di comune accordo stabiliscono di voler far prevalere l\'obbligazione del fare e che quindi il presente contratto si considera di prestazione di servizi come attività prevalente.\n9) Modalità di Pagamento: Primo acconto alla firma del presente 50% + IVA. Saldo a fine lavori.\n\nPRIVACY\nConsento al trattamento dei miei dati personali ai sensi dell\'art. 13 del Regolamento UE n. 2016/679.\nAutorizzo il trattamento dei dati personali per l\'invio di materiale informativo e pubblicitario come indicato nell\'Informativa.\n\nIl presente contratto è composto da N 3 pagine compresa la presente.\nLe parti dichiarano di aver preso visione degli articoli: 1, 2, 3, 4, 5, 6, 7, 8, 9 del presente contratto ai sensi e per gli effetti degli articoli 1341 e 1342 del codice civile e di approvarne il contenuto.`,
    firma_cliente: "Firma Cliente", firma_kalēa: "Per Kalēa",
        payoff1: 'Innovate | Living | Nature',
    payoff2: 'Superfici · Pavimentazioni · Posa',
    step1: 'Calcolo & Verifica',
    step2: 'Intestazione & Note',
    step3: 'Anteprima & PDF',
    scegli_prod: 'Scegli il prodotto',
    articoli: "articoli",
    cerca_placeholder: 'Cerca nome, fornitore, categoria, formato...',
    mostra_tutti: 'Mostra tutti i',
    risultati: 'risultati',
    costo: "Costo",
    listino_forn: "Listino fornitore",
    tuo_costo: "Tuo costo",
    tuo_prezzo_mat: "Tuo prezzo mat.",
    params_cantiere: 'Parametri cantiere',
    complessita: 'Complessità posa',
    semplice: 'Semplice',
    semplice_desc: 'Ambienti aperti, posa dritta',
    media: 'Media',
    media_desc: 'Più ambienti, qualche angolo',
    complessa: 'Complessa',
    complessa_desc: 'Molti tagli, angoli, disegni',
    mq_posare: 'mq da posare',
    sfrido_pct: 'Sfrido / sovrappiù (%)',
    sconto_cliente: 'Sconto al cliente (%)',
    inc_posa: "Posa",
    inc_tapp: "Tappetino",
    inc_trasp: 'Trasporto (2€/km)',
    dist_desenzano: 'Distanza da Desenzano (km)',
    trasferta_attiva: "Trasferta attiva oltre 50km",
    km_fatturabili: "km fatturabili × 2€ =",
    trasporto_label: "trasporto · Suppl. posa",
    mat_aggiuntivi: 'Materiali aggiuntivi',
    aggiungi_riga: '+ Aggiungi riga',
    batt_profili: 'Battiscopa, profili, colla, rasante, smaltimento...',
    desc_label: 'Descrizione',
    costo_eu: 'Costo €',
    prezzo_eu: 'Prezzo €',
    costo_tot_extra: 'Costo totale extra:',
    prezzo_cliente: 'Prezzo al cliente:',
    verifica_margine: 'Verifica margine — SEI DENTRO?',
    tot_costi: 'Totale costi tuoi',
    prezzo_netto_label: 'Prezzo al cliente (netto sc.)',
    margine_eu: 'Margine lordo €',
    prezzo_mq_tot: 'Prezzo tutto incluso /mq',
    dettaglio_costi: 'Dettaglio costi vs prezzi',
    tuoi_costi: 'Tuoi costi',
    al_cliente: 'Al cliente',
    materiale_label: "Materiale",
    con_sfrido: "con sfrido",
    totale_costo: "TOTALE",
    margine_ottimo: "OTTIMO — Margine",
    margine_spazio: "Puoi ancora scontare fino a",
    margine_in_piu: "in più.",
    margine_attenzione: "ATTENZIONE — Margine",
    margine_sotto: "sotto il 25%. Lavori ma con poco cuscinetto per imprevisti.",
    margine_blocco_msg: "BLOCCO — Margine",
    margine_blocco_sotto: "sotto il 10%. Il PDF è bloccato. Non accettare questo lavoro così.",
    vai_intestazione: 'Vai a Intestazione & Note →',
    sblocca_margine: 'Sblocca prima il margine',
    intestazione_kalea: 'Intestazione Kalēa',
    logo_integrato: 'Logo Kalēa · integrato automaticamente',
    num_preventivo: 'N° preventivo',
    genera_auto: 'Genera automatico',
    data_label: "Data",
    desc_cantiere: 'Descrizione cantiere',
    desc_cantiere_ph: 'Es. Appartamento via Roma 12, Brescia',
    lingua_doc: 'Lingua documento',
    dati_cliente: 'Dati cliente',
    nome_rs: 'Nome / Ragione sociale',
    citta: 'Città',
    cond_pagamento: 'Condizioni di pagamento',
    aggiungi_rata: '+ Rata',
    rimuovi: '− Rimuovi',
    tot_rate: 'Totale rate:',
    deve_100: 'deve fare 100%',
    note_visibili: 'Note visibili al cliente',
    note_int_label: 'Note interne — NON appaiono nel PDF',
    vai_pdf: 'Vai ad Anteprima & PDF →',
    stampa_pdf: "Stampa / Salva PDF",
    margine_ok: "Margine",
    ok_generazione: "— OK per la generazione",
    torna_calcolo: 'Torna al calcolo e migliora il margine',
    oggetto: 'Cantiere / Oggetto',
    fornitura_mat: "Fornitura materiali",
    posa_label: 'Posa in opera — complessità',
    tappetino_label: "Materassino/sottofondo",
    trasporto_km: "Trasporto materiali",
    trasferta_label: "Supplemento trasferta",
    sconto_label: "Sconto",
    imponibile: "Imponibile scontato",
    privacy_titolo: 'PRIVACY — D.Lgs. 196/2003 e Reg. UE 2016/679',
    privacy_1: 'Consento al trattamento dei miei dati personali ai sensi dell\'art. 13 del Regolamento UE n. 2016/679',
    privacy_2: 'Autorizzo il trattamento dei dati personali per l\'invio di materiale informativo e pubblicitario come indicato nell\'Informativa',
    parti_dichiarano: 'Le parti dichiarano di aver preso visione degli articoli 1,2,3,4,5,6,7,8,9 del presente contratto ai sensi degli artt. 1341 e 1342 c.c. e di approvarne il contenuto.',
    stato_bozza: 'Bozza',
    stato_inviato: 'Inviato',
    stato_accettato: 'Accettato',
    stato_rifiutato: 'Rifiutato',
    porto_sicuro: 'Il tuo porto sicuro — calcola, verifica, genera, traccia',
    note_visibili_lbl: 'Note visibili al cliente',
    note_int_lbl: 'Note interne — NON appaiono nel PDF',
    note_ph: 'Es. Il prezzo include la rimozione del vecchio pavimento...',
    note_int_ph: 'Es. Cliente vuole sconto, trattare. Attenzione al piano rialzato...',
    sconto_riga: 'Sconto',
    imponibile_sc: 'Imponibile scontato',
    costo_posa_fissi: 'Costi posa fissi:',
    posa_pav: 'Posa pavimento:',
    posa_tapp: 'Posa tappetino/materassino:',
    basato_ccnl: 'Basato su operaio CCNL Edilizia',
    includi_prev: 'Includi nel preventivo',
    posa_btn: "Posa pavimento (20 €/mq cliente)",
    tapp_btn: "Tappetino/materassino (3€/mq)",
    trasp_btn: "Transport (2€/km)",
    param_globali: 'Parametri globali — si applicano a tutti i prodotti',
    markup_label: 'Markup Kalēa sui materiali', data: "Data",
    luogo: "Luogo e data", accetta: "Il/La sottoscritto/a dichiara di accettare il presente preventivo",
  },
  EN: {
    titolo: "QUOTATION", validita: "Valid until", cliente: "Client",
    indirizzo: "Address", telefono: "Phone", email: "Email",
    desc: "Description", mq: "sqm", prezzo_unit: "Unit price", totale: "Total",
    fornitura: "Materials supply", posa: "Installation", tappetino: "Underlay/membrane",
    trasporto: "Materials transport", trasferta: "Travel supplement",
    subtotale: "Subtotal", iva: "VAT 22%", totale_doc: "TOTAL",
    pagamenti: "PAYMENT TERMS", acconto: "Deposit", meta_lavori: "Mid-works", saldo: "Final balance",
    note_cliente: "Notes", termini: "TERMS & CONDITIONS",
    termini_testo: `Premises\n1) The client company declares to be aware and informed that the "Kalea" flooring that the supplier is about to supply and install under this supply and installation contract is exclusively an aesthetic product, has no insulation or waterproofing properties and must be considered as such.\n2) Any waterproofing obligation of the substrate is to be borne by the Client; therefore no liability can be attributed to the supplier if infiltration problems occur at the property or problems arising from a non-conforming substrate on which the material is laid.\n3) It shall be the exclusive responsibility of the client to: a) Ensure 220V electrical power and water supply. b) Provide assistance with own personnel for the levelling of the material supplied by the supplier. c) Guarantee the installation substrate (flat and dry surface) on which Kalea will position its materials.\n4) Supplier\'s responsibilities: a) Provide the name of the installation team to be sent to the site and all necessary documentation to verify technical and professional suitability pursuant to Legislative Decree 81/2008, including DURC. b) Carry out all commissioned work in a workmanlike manner. c) Guarantee that the work start date is by ……………………………, with weather conditions suitable for installation. d) That installation activity continues without interruption. e) Keep the site clean by storing waste materials and rubbish in designated areas and/or containers agreed with the client. f) A technical representative of the supplier will ensure periodic site visits. g) During the works, Kalea S.r.l. may take photographs or recordings for advertising and marketing purposes which may be published on the website or social networks.\n5) General conditions of supply and installation: a) Prices shown in this contract are exclusive of VAT. b) This agreement is based on actual measurements. For payment purposes, works shall be considered complete and the amount collectible even if external contingent impediments cause interruption or suspension of installation for reasons beyond the company\'s control. In such case, only the square metres actually delivered in a workmanlike manner shall be invoiced.\n6) Measurement method: For installation works, flooring will be calculated per sqm including 5% cutting waste. Accessories will be calculated per linear metre including 5% cutting waste. Any extra services requested by the client will be charged separately at EURO 30.00/hour per person, plus the cost of materials used.\n7) Any dispute arising between the parties regarding the interpretation, execution or termination of this contract shall be referred to the exclusive jurisdiction of the Court of Brescia.\n8) The parties mutually agree to give precedence to the obligation to perform and therefore this contract is considered a service contract as the prevailing activity.\n9) Payment terms: First deposit upon signing 50% + VAT. Balance upon completion of works.\n\nPRIVACY\nI consent to the processing of my personal data pursuant to art. 13 of EU Regulation No. 2016/679.\nI authorise the processing of personal data for the sending of informational and advertising material as indicated in the Privacy Notice.\n\nThis contract consists of 3 pages including this one.\nThe parties declare to have read articles: 1, 2, 3, 4, 5, 6, 7, 8, 9 of this contract pursuant to articles 1341 and 1342 of the Italian Civil Code and approve its content.`,
    firma_cliente: "Client Signature", firma_kalēa: "For Kalēa",
        payoff1: 'Innovate | Living | Nature',
    payoff2: "Surfaces · Flooring · Installation",
    step1: "Calculate & Verify",
    step2: "Header & Notes",
    step3: "Preview & PDF",
    scegli_prod: "Choose product",
    articoli: "products",
    cerca_placeholder: "Search by name, supplier, category, format...",
    mostra_tutti: "Show all",
    risultati: "results",
    costo: "Cost",
    listino_forn: "Supplier list price",
    tuo_costo: "Your cost",
    tuo_prezzo_mat: "Your material price",
    params_cantiere: "Job site parameters",
    complessita: "Installation complexity",
    semplice: "Simple",
    semplice_desc: "Open areas, straight lay",
    media: "Medium",
    media_desc: "Multiple rooms, some cuts",
    complessa: "Complex",
    complessa_desc: "Many cuts, patterns, angles",
    mq_posare: "sqm to install",
    sfrido_pct: "Waste / overage (%)",
    sconto_cliente: "Client discount (%)",
    inc_posa: "Installation",
    inc_tapp: "Underlay",
    inc_trasp: "Transport (2€/km)",
    dist_desenzano: "Distance from Desenzano (km)",
    trasferta_attiva: "Travel surcharge active beyond 50km",
    km_fatturabili: "billable km × 2€ =",
    trasporto_label: "transport · Installation surcharge",
    mat_aggiuntivi: "Additional materials",
    aggiungi_riga: "+ Add row",
    batt_profili: "Skirting, profiles, adhesive, levelling, disposal...",
    desc_label: "Description",
    costo_eu: "Cost €",
    prezzo_eu: "Price €",
    costo_tot_extra: "Total extra cost:",
    prezzo_cliente: "Client price:",
    verifica_margine: "Margin check — ARE YOU COVERED?",
    tot_costi: "Your total costs",
    prezzo_netto_label: "Client price (net discount)",
    margine_eu: "Gross margin €",
    prezzo_mq_tot: "All-in price /sqm",
    dettaglio_costi: "Cost vs revenue breakdown",
    tuoi_costi: "Your costs",
    al_cliente: "To client",
    materiale_label: "Material",
    con_sfrido: "incl. waste",
    totale_costo: "TOTAL",
    margine_ottimo: "EXCELLENT — Margin",
    margine_spazio: "You can still discount up to",
    margine_in_piu: "more.",
    margine_attenzione: "WARNING — Margin",
    margine_sotto: "below 25%. Working but with little buffer for contingencies.",
    margine_blocco_msg: "BLOCKED — Margin",
    margine_blocco_sotto: "below 10%. PDF is locked. Do not accept this job as is.",
    vai_intestazione: "Go to Header & Notes →",
    sblocca_margine: "Fix margin first",
    intestazione_kalea: "Kalēa Header",
    logo_integrato: "Kalēa logo · automatically integrated",
    num_preventivo: "Quote number",
    genera_auto: "Auto-generate",
    data_label: "Date",
    desc_cantiere: "Job site description",
    desc_cantiere_ph: "E.g. Apartment via Roma 12, Brescia",
    lingua_doc: "Document language",
    dati_cliente: "Client details",
    nome_rs: "Name / Company name",
    citta: "City",
    cond_pagamento: "Payment conditions",
    aggiungi_rata: "+ Add instalment",
    rimuovi: "− Remove",
    tot_rate: "Total instalments:",
    deve_100: "must equal 100%",
    note_visibili: "Notes visible to client",
    note_int_label: "Internal notes — do NOT appear in PDF",
    vai_pdf: "Go to Preview & PDF →",
    stampa_pdf: "Print / Save PDF",
    margine_ok: "Margin",
    ok_generazione: "— OK for generation",
    torna_calcolo: "Go back and improve the margin",
    oggetto: "Job site / Subject",
    fornitura_mat: "Materials supply",
    posa_label: "Installation — complexity",
    tappetino_label: "Underlay/membrane",
    trasporto_km: "Materials transport",
    trasferta_label: "Travel surcharge",
    sconto_label: "Discount",
    imponibile: "Discounted taxable amount",
    privacy_titolo: "PRIVACY — D.Lgs. 196/2003 & EU Reg. 2016/679",
    privacy_1: "I consent to the processing of my personal data pursuant to art. 13 of EU Regulation No. 2016/679",
    privacy_2: "I authorise the processing of personal data for the sending of informational and advertising material",
    parti_dichiarano: "The parties declare to have read articles 1-9 of this contract pursuant to articles 1341 and 1342 of the Italian Civil Code and approve its content.",
    stato_bozza: "Draft",
    stato_inviato: "Sent",
    stato_accettato: "Accepted",
    stato_rifiutato: "Rejected",
    porto_sicuro: "Your safe harbour — calculate, verify, generate, track",
    note_visibili_lbl: "Notes visible to client",
    note_int_lbl: "Internal notes — do NOT appear in PDF",
    note_ph: "E.g. Price includes removal of old flooring...",
    note_int_ph: "E.g. Client wants discount, negotiate. Note raised floor...",
    sconto_riga: "Discount",
    imponibile_sc: "Discounted taxable amount",
    costo_posa_fissi: "Fixed installation costs:",
    posa_pav: "Installation:",
    posa_tapp: "Underlay installation:",
    basato_ccnl: "Based on CCNL Construction worker",
    includi_prev: "Include in quote",
    posa_btn: "Installation (20 €/sqm to client)",
    tapp_btn: "Underlay (3€/sqm)",
    trasp_btn: "Transport (2€/km)",
    param_globali: "Global parameters — apply to all products",
    markup_label: "Kalēa markup on materials", data: "Date",
    luogo: "Place and date", accetta: "The undersigned declares acceptance of this quotation",
  },
  DE: {
    titolo: "KOSTENVORANSCHLAG", validita: "Gültig bis", cliente: "Kunde",
    indirizzo: "Adresse", telefono: "Telefon", email: "E-Mail",
    desc: "Beschreibung", mq: "m²", prezzo_unit: "Einzelpreis", totale: "Gesamt",
    fornitura: "Materiallieferung", posa: "Verlegung", tappetino: "Unterlagsmatte",
    trasporto: "Materialtransport", trasferta: "Reisezuschlag",
    subtotale: "Zwischensumme", iva: "MwSt. 22%", totale_doc: "GESAMT",
    pagamenti: "ZAHLUNGSBEDINGUNGEN", acconto: "Anzahlung", meta_lavori: "Zwischenzahlung", saldo: "Restzahlung",
    note_cliente: "Anmerkungen", termini: "AGB",
    termini_testo: `Vorbemerkungen\n1) Die Auftraggeber-Gesellschaft erklärt, darüber informiert zu sein, dass der Bodenbelag "Kalea", den der Lieferant im Rahmen dieses Liefer- und Verlegevertrags liefern und verlegen wird, ausschließlich ein ästhetisches Produkt ist und weder Dämm- noch Abdichtungseigenschaften besitzt.\n2) Jegliche Abdichtungspflicht des Untergrunds obliegt dem Auftraggeber; daher kann dem Lieferanten keine Haftung zugewiesen werden, wenn Feuchtigkeitsprobleme auftreten.\n3) Pflichten des Auftraggebers: a) 220V-Stromversorgung und Wasser sicherstellen. b) Unterstützung mit eigenem Personal für die Nivellierung des Materials. c) Verlegeuntergrund (eben und trocken) sicherstellen.\n4) Pflichten des Lieferanten: a) Namen des Verlegeteams und alle erforderlichen Unterlagen gemäß D. Lgs. 81/2008 bereitstellen. b) Alle beauftragten Arbeiten fachgerecht ausführen. c) Arbeitsbeginn bis …………………… garantieren. d) Kontinuierliche Verlegearbeiten sicherstellen. e) Baustelle sauber halten. f) Regelmäßige Baustellenbesuche durch einen Techniker. g) Fotografien/Aufnahmen für Marketingzwecke möglich.\n5) Allgemeine Liefer- und Verlegebedingungen: a) Preise verstehen sich ohne MwSt. b) Dieser Vertrag gilt aufmaßbezogen.\n6) Messverfahren: Belag wird pro m² berechnet, zuzüglich 5% Verschnitt. Zubehör pro lfd. Meter zuzüglich 5% Verschnitt. Zusatzleistungen: 30,00 EUR/Std./Person plus Materialkosten.\n7) Ausschließlicher Gerichtsstand: Brescia.\n8) Die Parteien vereinbaren, dem Dienstleistungscharakter dieses Vertrags Vorrang zu geben.\n9) Zahlungsbedingungen: Erste Anzahlung bei Unterzeichnung 50% + MwSt. Restzahlung bei Fertigstellung.\n\nDATENSCHUTZ\nIch stimme der Verarbeitung meiner personenbezogenen Daten gemäß Art. 13 der EU-Verordnung Nr. 2016/679 zu.`,
    firma_cliente: "Unterschrift Kunde", firma_kalēa: "Für Kalēa",
        payoff1: 'Innovate | Living | Nature',
    payoff2: "Oberflächen · Böden · Verlegung",
    step1: "Berechnen & Prüfen",
    step2: "Kopfzeile & Notizen",
    step3: "Vorschau & PDF",
    scegli_prod: "Produkt wählen",
    articoli: "Artikel",
    cerca_placeholder: "Suche nach Name, Lieferant, Kategorie, Format...",
    mostra_tutti: "Alle anzeigen",
    risultati: "Ergebnisse",
    costo: "Kosten",
    listino_forn: "Lieferantenlistenpreis",
    tuo_costo: "Ihre Kosten",
    tuo_prezzo_mat: "Ihr Materialpreis",
    params_cantiere: "Baustellenparameter",
    complessita: "Verlegekomplexität",
    semplice: "Einfach",
    semplice_desc: "Offene Bereiche, gerade Verlegung",
    media: "Mittel",
    media_desc: "Mehrere Räume, einige Schnitte",
    complessa: "Komplex",
    complessa_desc: "Viele Schnitte, Muster, Winkel",
    mq_posare: "m² zu verlegen",
    sfrido_pct: "Verschnitt (%)",
    sconto_cliente: "Kundenrabatt (%)",
    inc_posa: "Verlegung",
    inc_tapp: "Unterlagsmate",
    inc_trasp: "Transport (2€/km)",
    dist_desenzano: "Entfernung von Desenzano (km)",
    trasferta_attiva: "Reisezuschlag aktiv über 50km",
    km_fatturabili: "abrechenbare km × 2€ =",
    trasporto_label: "Transport · Verlegezuschlag",
    mat_aggiuntivi: "Zusätzliche Materialien",
    aggiungi_riga: "+ Zeile hinzufügen",
    batt_profili: "Sockelleisten, Profile, Kleber, Ausgleich, Entsorgung...",
    desc_label: "Beschreibung",
    costo_eu: "Kosten €",
    prezzo_eu: "Preis €",
    costo_tot_extra: "Zusatzkosten gesamt:",
    prezzo_cliente: "Kundenpreis:",
    verifica_margine: "Margenprüfung — SIND SIE ABGEDECKT?",
    tot_costi: "Ihre Gesamtkosten",
    prezzo_netto_label: "Kundenpreis (netto Rabatt)",
    margine_eu: "Bruttomarge €",
    prezzo_mq_tot: "Gesamtpreis /m²",
    dettaglio_costi: "Kosten vs. Einnahmen",
    tuoi_costi: "Ihre Kosten",
    al_cliente: "Zum Kunden",
    materiale_label: "Material",
    con_sfrido: "mit Verschnitt",
    totale_costo: "GESAMT",
    margine_ottimo: "AUSGEZEICHNET — Marge",
    margine_spazio: "Sie können noch bis zu",
    margine_in_piu: "mehr rabattieren.",
    margine_attenzione: "ACHTUNG — Marge",
    margine_sotto: "unter 25%. Gewinn vorhanden, aber wenig Puffer.",
    margine_blocco_msg: "GESPERRT — Marge",
    margine_blocco_sotto: "unter 10%. PDF gesperrt. Diesen Auftrag nicht so annehmen.",
    vai_intestazione: "Zu Kopfzeile & Notizen →",
    sblocca_margine: "Zuerst Marge verbessern",
    intestazione_kalea: "Kalēa Kopfzeile",
    logo_integrato: "Kalēa Logo · automatisch integriert",
    num_preventivo: "Angebotsnummer",
    genera_auto: "Auto-generieren",
    data_label: "Datum",
    desc_cantiere: "Baustellenbeschreibung",
    desc_cantiere_ph: "z.B. Wohnung Via Roma 12, Brescia",
    lingua_doc: "Dokumentsprache",
    dati_cliente: "Kundendaten",
    nome_rs: "Name / Firma",
    citta: "Stadt",
    cond_pagamento: "Zahlungsbedingungen",
    aggiungi_rata: "+ Rate hinzufügen",
    rimuovi: "− Entfernen",
    tot_rate: "Raten gesamt:",
    deve_100: "muss 100% ergeben",
    note_visibili: "Für Kunden sichtbare Notizen",
    note_int_label: "Interne Notizen — erscheinen NICHT im PDF",
    vai_pdf: "Zu Vorschau & PDF →",
    stampa_pdf: "Drucken / PDF speichern",
    margine_ok: "Marge",
    ok_generazione: "— OK zur Generierung",
    torna_calcolo: "Zurück zur Kalkulation",
    oggetto: "Baustelle / Betreff",
    fornitura_mat: "Materiallieferung",
    posa_label: "Verlegung — Komplexität",
    tappetino_label: "Unterlage/Membran",
    trasporto_km: "Materialtransport",
    trasferta_label: "Reisezuschlag",
    sconto_label: "Rabatt",
    imponibile: "Rabattierter Steuerbetrag",
    privacy_titolo: "DATENSCHUTZ — D.Lgs. 196/2003 & EU-VO 2016/679",
    privacy_1: "Ich stimme der Verarbeitung meiner personenbezogenen Daten gem. Art. 13 EU-VO 2016/679 zu",
    privacy_2: "Ich autorisiere die Verarbeitung personenbezogener Daten für Informations- und Werbematerial",
    parti_dichiarano: "Die Parteien erklären, Artikel 1-9 dieses Vertrags gemäß §§ 1341 und 1342 des ital. Zivilgesetzbuchs gelesen und genehmigt zu haben.",
    stato_bozza: "Entwurf",
    stato_inviato: "Gesendet",
    stato_accettato: "Angenommen",
    stato_rifiutato: "Abgelehnt",
    porto_sicuro: "Ihr sicherer Hafen — berechnen, prüfen, generieren, verfolgen",
    note_visibili_lbl: "Für Kunden sichtbare Notizen",
    note_int_lbl: "Interne Notizen — erscheinen NICHT im PDF",
    note_ph: "z.B. Preis beinhaltet Entfernung des alten Bodenbelags...",
    note_int_ph: "z.B. Kunde möchte Rabatt. Beachte erhöhten Boden...",
    sconto_riga: "Rabatt",
    imponibile_sc: "Rabattierter Steuerbetrag",
    costo_posa_fissi: "Feste Verlegekosten:",
    posa_pav: "Verlegung:",
    posa_tapp: "Unterlagsmatte Verlegung:",
    basato_ccnl: "Basierend auf CCNL Bauarbeiter",
    includi_prev: "In Angebot einschließen",
    posa_btn: "Verlegung (20 €/m² für Kunden)",
    tapp_btn: "Unterlagsmatte (3€/m²)",
    trasp_btn: "Transport (2€/km)",
    param_globali: "Globale Parameter — gelten für alle Produkte",
    markup_label: "Kalēa Aufschlag auf Materialien", data: "Datum",
    luogo: "Ort und Datum", accetta: "Der/Die Unterzeichnete erklärt die Annahme dieses Angebots",
  },
  FR: {
    titolo: "DEVIS", validita: "Valable jusqu'au", cliente: "Client",
    indirizzo: "Adresse", telefono: "Téléphone", email: "E-mail",
    desc: "Description", mq: "m²", prezzo_unit: "Prix unit.", totale: "Total",
    fornitura: "Fourniture matériaux", posa: "Pose", tappetino: "Sous-couche",
    trasporto: "Transport matériaux", trasferta: "Supplément déplacement",
    subtotale: "Sous-total HT", iva: "TVA 22%", totale_doc: "TOTAL",
    pagamenti: "CONDITIONS DE PAIEMENT", acconto: "Acompte", meta_lavori: "En cours de travaux", saldo: "Solde final",
    note_cliente: "Remarques", termini: "CONDITIONS GÉNÉRALES",
    termini_testo: `Préambules\n1) La société cliente déclare être informée que le revêtement de sol "Kalea" est exclusivement un produit esthétique, sans propriétés d\'isolation ni d\'imperméabilisation.\n2) Toute obligation d\'imperméabilisation du support incombe au Client ; aucune responsabilité ne pourra être imputée au fournisseur en cas de problèmes d\'infiltration.\n3) Responsabilités du client : a) Assurer l\'alimentation électrique 220V et l\'eau. b) Fournir une assistance pour la mise à niveau des matériaux. c) Garantir le support de pose (plat et sec).\n4) Responsabilités du fournisseur : a) Fournir les noms de l\'équipe et la documentation requise selon D. Lgs. 81/2008. b) Exécuter tous les travaux dans les règles de l\'art. c) Garantir la date de début des travaux au plus tard le ……………………… d) Assurer la continuité de la pose. e) Maintenir le chantier propre. f) Visites périodiques d\'un technicien. g) Des photos/vidéos à des fins marketing pourront être réalisées.\n5) Conditions générales : a) Prix hors TVA. b) Contrat au métré.\n6) Modalités de mesure : Revêtement calculé au m² avec 5% de chutes. Accessoires au mètre linéaire avec 5% de chutes. Prestations supplémentaires : 30,00 EUR/heure/personne plus coût des matériaux.\n7) Tribunal compétent exclusif : Brescia.\n8) Les parties conviennent de donner la priorité à l\'obligation de faire.\n9) Modalités de paiement : Premier acompte à la signature 50% + TVA. Solde à la fin des travaux.\n\nRGPD\nJe consens au traitement de mes données personnelles conformément à l\'art. 13 du Règlement UE n° 2016/679.`,
    firma_cliente: "Signature Client", firma_kalēa: "Pour Kalēa",
        payoff1: 'Innovate | Living | Nature',
    payoff2: "Surfaces · Revêtements · Pose",
    step1: "Calculer & Vérifier",
    step2: "En-tête & Notes",
    step3: "Aperçu & PDF",
    scegli_prod: "Choisir le produit",
    articoli: "articles",
    cerca_placeholder: "Rechercher par nom, fournisseur, catégorie, format...",
    mostra_tutti: "Afficher tous les",
    risultati: "résultats",
    costo: "Coût",
    listino_forn: "Prix catalogue fournisseur",
    tuo_costo: "Votre coût",
    tuo_prezzo_mat: "Votre prix matériau",
    params_cantiere: "Paramètres chantier",
    complessita: "Complexité de pose",
    semplice: "Simple",
    semplice_desc: "Espaces ouverts, pose droite",
    media: "Moyenne",
    media_desc: "Plusieurs pièces, quelques coupes",
    complessa: "Complexe",
    complessa_desc: "Nombreuses coupes, motifs, angles",
    mq_posare: "m² à poser",
    sfrido_pct: "Chutes / surplus (%)",
    sconto_cliente: "Remise client (%)",
    inc_posa: "Pose",
    inc_tapp: "Sous-couche",
    inc_trasp: "Transport (2€/km)",
    dist_desenzano: "Distance de Desenzano (km)",
    trasferta_attiva: "Supplément déplacement actif au-delà de 50km",
    km_fatturabili: "km facturables × 2€ =",
    trasporto_label: "transport · Supplément pose",
    mat_aggiuntivi: "Matériaux supplémentaires",
    aggiungi_riga: "+ Ajouter ligne",
    batt_profili: "Plinthes, profilés, colle, ragréage, évacuation...",
    desc_label: "Description",
    costo_eu: "Coût €",
    prezzo_eu: "Prix €",
    costo_tot_extra: "Coût extra total :",
    prezzo_cliente: "Prix client :",
    verifica_margine: "Vérification marge — ÊTES-VOUS COUVERT ?",
    tot_costi: "Vos coûts totaux",
    prezzo_netto_label: "Prix client (net remise)",
    margine_eu: "Marge brute €",
    prezzo_mq_tot: "Prix tout compris /m²",
    dettaglio_costi: "Détail coûts vs revenus",
    tuoi_costi: "Vos coûts",
    al_cliente: "Au client",
    materiale_label: "Matériau",
    con_sfrido: "avec chutes",
    totale_costo: "TOTAL",
    margine_ottimo: "EXCELLENT — Marge",
    margine_spazio: "Vous pouvez encore remettre jusqu'à",
    margine_in_piu: "de plus.",
    margine_attenzione: "ATTENTION — Marge",
    margine_sotto: "sous 25%. Vous travaillez avec peu de marge de sécurité.",
    margine_blocco_msg: "BLOQUÉ — Marge",
    margine_blocco_sotto: "sous 10%. PDF bloqué. N'acceptez pas ce travail ainsi.",
    vai_intestazione: "Aller à En-tête & Notes →",
    sblocca_margine: "Améliorez d'abord la marge",
    intestazione_kalea: "En-tête Kalēa",
    logo_integrato: "Logo Kalēa · intégré automatiquement",
    num_preventivo: "N° de devis",
    genera_auto: "Générer automatiquement",
    data_label: "Date",
    desc_cantiere: "Description du chantier",
    desc_cantiere_ph: "Ex. Appartement via Roma 12, Brescia",
    lingua_doc: "Langue du document",
    dati_cliente: "Coordonnées client",
    nome_rs: "Nom / Raison sociale",
    citta: "Ville",
    cond_pagamento: "Conditions de paiement",
    aggiungi_rata: "+ Ajouter versement",
    rimuovi: "− Supprimer",
    tot_rate: "Total versements :",
    deve_100: "doit faire 100%",
    note_visibili: "Notes visibles par le client",
    note_int_label: "Notes internes — N'apparaissent PAS dans le PDF",
    vai_pdf: "Aller à Aperçu & PDF →",
    stampa_pdf: "Imprimer / Enregistrer PDF",
    margine_ok: "Marge",
    ok_generazione: "— OK pour la génération",
    torna_calcolo: "Retour au calcul",
    oggetto: "Chantier / Objet",
    fornitura_mat: "Fourniture matériaux",
    posa_label: "Pose — complexité",
    tappetino_label: "Sous-couche/membrane",
    trasporto_km: "Transport matériaux",
    trasferta_label: "Supplément déplacement",
    sconto_label: "Remise",
    imponibile: "Base imposable remisée",
    privacy_titolo: "RGPD — D.Lgs. 196/2003 & Rèq. UE 2016/679",
    privacy_1: "Je consens au traitement de mes données personnelles conformément à l'art. 13 du Règlement UE 2016/679",
    privacy_2: "J'autorise le traitement de mes données pour l'envoi de matériel informatif et publicitaire",
    parti_dichiarano: "Les parties déclarent avoir pris connaissance des articles 1-9 du présent contrat conformément aux articles 1341 et 1342 du Code civil italien.",
    stato_bozza: "Brouillon",
    stato_inviato: "Envoyé",
    stato_accettato: "Accepté",
    stato_rifiutato: "Refusé",
    porto_sicuro: "Votre port sûr — calculer, vérifier, générer, suivre",
    note_visibili_lbl: "Notes visibles par le client",
    note_int_lbl: "Notes internes — N\'apparaissent PAS dans le PDF",
    note_ph: "Ex. Le prix inclut la dépose de l\'ancien revêtement...",
    note_int_ph: "Ex. Le client veut une remise. Attention au plancher surélevé...",
    sconto_riga: "Remise",
    imponibile_sc: "Base imposable remisée",
    costo_posa_fissi: "Coûts de pose fixes :",
    posa_pav: "Pose :",
    posa_tapp: "Sous-couche :",
    basato_ccnl: "Basé sur CCNL Bâtiment",
    includi_prev: "Inclure dans le devis",
    posa_btn: "Pose (20 €/m² client)",
    tapp_btn: "Sous-couche (3€/m²)",
    trasp_btn: "Transport (2€/km)",
    param_globali: "Paramètres globaux — s'appliquent à tous les produits",
    markup_label: "Majoration Kalēa sur les matériaux", data: "Date",
    luogo: "Lieu et date", accetta: "Le/La soussigné(e) déclare accepter le présent devis",
  },
  RO: {
    titolo: "OFERTĂ DE PREȚ", validita: "Valabilă până la", cliente: "Client",
    indirizzo: "Adresă", telefono: "Telefon", email: "Email",
    desc: "Descriere", mq: "mp", prezzo_unit: "Preț unitar", totale: "Total",
    fornitura: "Furnizare materiale", posa: "Montaj", tappetino: "Strat suport",
    trasporto: "Transport materiale", trasferta: "Supliment deplasare",
    subtotale: "Subtotal", iva: "TVA 22%", totale_doc: "TOTAL",
    pagamenti: "CONDIȚII DE PLATĂ", acconto: "Avans", meta_lavori: "La jumătatea lucrărilor", saldo: "Sold final",
    note_cliente: "Observații", termini: "TERMENI ȘI CONDIȚII",
    termini_testo: `Premise\n1) Societatea beneficiară declară că este informată că pavimentul "Kalea" este exclusiv un produs estetic, fără proprietăți de izolare sau impermeabilizare.\n2) Orice obligație de impermeabilizare a suportului revine Beneficiarului; furnizorul nu poate fi responsabil pentru probleme de infiltrații.\n3) Obligațiile beneficiarului: a) Asigurarea curentului electric 220V și apă. b) Asistență cu personal propriu pentru nivelarea materialului. c) Garantarea suprafeței de pozare (plată și uscată).\n4) Obligațiile furnizorului: a) Furnizarea documentației echipei conform D. Lgs. 81/2008. b) Executarea tuturor lucrărilor conform normelor. c) Garantarea datei de începere până la ……………………… d) Continuitatea lucrărilor de pozare. e) Menținerea curată a șantierului. f) Vizite periodice ale unui tehnician. g) Fotografii/filmări în scopuri de marketing pot fi efectuate.\n5) Condiții generale: a) Prețuri fără TVA. b) Contract la metraj.\n6) Modalitate de măsurare: Pavimentul calculat la mp cu 5% pierderi. Accesorii la ml cu 5% pierderi. Prestații suplimentare: 30,00 EUR/oră/persoană plus costul materialelor.\n7) Jurisdicție exclusivă: Tribunalul din Brescia.\n8) Părțile convin să acorde prioritate obligației de a face.\n9) Modalități de plată: Primul avans la semnare 50% + TVA. Sold la finalizarea lucrărilor.\n\nGDPR\nConsimț la prelucrarea datelor mele personale conform art. 13 din Regulamentul UE nr. 2016/679.`,
    firma_cliente: "Semnătura Client", firma_kalēa: "Pentru Kalēa",
        payoff1: 'Innovate | Living | Nature',
    payoff2: "Suprafețe · Pardoseli · Montaj",
    step1: "Calculați & Verificați",
    step2: "Antet & Note",
    step3: "Previzualizare & PDF",
    scegli_prod: "Alegeți produsul",
    articoli: "articole",
    cerca_placeholder: "Căutați după nume, furnizor, categorie, format...",
    mostra_tutti: "Afișați toate cele",
    risultati: "rezultate",
    costo: "Cost",
    listino_forn: "Preț catalog furnizor",
    tuo_costo: "Costul dvs.",
    tuo_prezzo_mat: "Prețul dvs. material",
    params_cantiere: "Parametri șantier",
    complessita: "Complexitate montaj",
    semplice: "Simplu",
    semplice_desc: "Spații deschise, montaj drept",
    media: "Mediu",
    media_desc: "Mai multe camere, câteva tăieturi",
    complessa: "Complex",
    complessa_desc: "Multe tăieturi, modele, unghiuri",
    mq_posare: "mp de montat",
    sfrido_pct: "Pierderi / surplus (%)",
    sconto_cliente: "Reducere client (%)",
    inc_posa: "Montaj",
    inc_tapp: "Strat suport",
    inc_trasp: "Transport (2€/km)",
    dist_desenzano: "Distanță de la Desenzano (km)",
    trasferta_attiva: "Supliment deplasare activ peste 50km",
    km_fatturabili: "km facturabili × 2€ =",
    trasporto_label: "transport · Supliment montaj",
    mat_aggiuntivi: "Materiale suplimentare",
    aggiungi_riga: "+ Adăugați rând",
    batt_profili: "Plinte, profile, adeziv, șapă, evacuare...",
    desc_label: "Descriere",
    costo_eu: "Cost €",
    prezzo_eu: "Preț €",
    costo_tot_extra: "Cost extra total:",
    prezzo_cliente: "Prețul clientului:",
    verifica_margine: "Verificare marjă — SUNTEȚI ACOPERIT?",
    tot_costi: "Costurile dvs. totale",
    prezzo_netto_label: "Prețul clientului (net reducere)",
    margine_eu: "Marjă brută €",
    prezzo_mq_tot: "Preț total inclus /mp",
    dettaglio_costi: "Detaliu costuri vs venituri",
    tuoi_costi: "Costurile dvs.",
    al_cliente: "Către client",
    materiale_label: "Material",
    con_sfrido: "cu pierderi",
    totale_costo: "TOTAL",
    margine_ottimo: "EXCELENT — Marjă",
    margine_spazio: "Puteți mai reduce până la",
    margine_in_piu: "în plus.",
    margine_attenzione: "ATENȚIE — Marjă",
    margine_sotto: "sub 25%. Lucrați dar cu puțin tampon pentru imprevizibil.",
    margine_blocco_msg: "BLOCAT — Marjă",
    margine_blocco_sotto: "sub 10%. PDF blocat. Nu acceptați această lucrare astfel.",
    vai_intestazione: "Mergeți la Antet & Note →",
    sblocca_margine: "Îmbunătățiți mai întâi marja",
    intestazione_kalea: "Antet Kalēa",
    logo_integrato: "Logo Kalēa · integrat automat",
    num_preventivo: "Nr. ofertă",
    genera_auto: "Generare automată",
    data_label: "Data",
    desc_cantiere: "Descriere șantier",
    desc_cantiere_ph: "Ex. Apartament via Roma 12, Brescia",
    lingua_doc: "Limba documentului",
    dati_cliente: "Date client",
    nome_rs: "Nume / Denumire societate",
    citta: "Oraș",
    cond_pagamento: "Condiții de plată",
    aggiungi_rata: "+ Adăugați rată",
    rimuovi: "− Eliminați",
    tot_rate: "Total rate:",
    deve_100: "trebuie să facă 100%",
    note_visibili: "Note vizibile de client",
    note_int_label: "Note interne — NU apar în PDF",
    vai_pdf: "Mergeți la Previzualizare & PDF →",
    stampa_pdf: "Tipăriți / Salvați PDF",
    margine_ok: "Marjă",
    ok_generazione: "— OK pentru generare",
    torna_calcolo: "Reveniți la calcul",
    oggetto: "Șantier / Obiect",
    fornitura_mat: "Furnizare materiale",
    posa_label: "Montaj — complexitate",
    tappetino_label: "Strat suport/membrană",
    trasporto_km: "Transport materiale",
    trasferta_label: "Supliment deplasare",
    sconto_label: "Reducere",
    imponibile: "Bază impozabilă redusă",
    privacy_titolo: "GDPR — D.Lgs. 196/2003 & Reg. UE 2016/679",
    privacy_1: "Consimț la prelucrarea datelor mele personale conform art. 13 din Regulamentul UE 2016/679",
    privacy_2: "Autorizez prelucrarea datelor personale pentru trimiterea de material informativ și publicitar",
    parti_dichiarano: "Părțile declară că au luat la cunoștință articolele 1-9 ale acestui contract conform art. 1341 și 1342 din Codul Civil Italian.",
    stato_bozza: "Ciornă",
    stato_inviato: "Trimis",
    stato_accettato: "Acceptat",
    stato_rifiutato: "Refuzat",
    porto_sicuro: "Portul dvs. sigur — calculați, verificați, generați, urmăriți",
    note_visibili_lbl: "Note vizibile de client",
    note_int_lbl: "Note interne — NU apar în PDF",
    note_ph: "Ex. Prețul include îndepărtarea vechiului parchet...",
    note_int_ph: "Ex. Clientul dorește reducere. Atenție la pardoseala înălțată...",
    sconto_riga: "Reducere",
    imponibile_sc: "Bază impozabilă redusă",
    costo_posa_fissi: "Costuri fixe montaj:",
    posa_pav: "Montaj:",
    posa_tapp: "Strat suport:",
    basato_ccnl: "Bazat pe CCNL Construcții",
    includi_prev: "Includeți în ofertă",
    posa_btn: "Montaj (20 €/mp client)",
    tapp_btn: "Strat suport (3€/mp)",
    trasp_btn: "Transport (2€/km)",
    param_globali: "Parametri globali — se aplică tuturor produselor",
    markup_label: "Adaos Kalēa pe materiale", data: "Data",
    luogo: "Loc și dată", accetta: "Subsemnatul/a declară că acceptă prezenta ofertă",
  },
};

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
  const [incTapp, setIncTapp] = useState(false);
  const [kmDist, setKmDist] = useState(0);
  const [incTrasporto, setIncTrasporto] = useState(false);
  const [sconto, setSconto] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [addingMore, setAddingMore] = useState(false);
  const [righeMat, setRigheMat] = useState<any[]>([]);
  // Sezioni catalogo (stile Geopietra): Articoli, Accessori, Servizi
  const [articoli, setArticoli] = useState<CatalogLine[]>([]);
  const [accessori, setAccessori] = useState<CatalogLine[]>([]);
  const [servizi, setServizi] = useState<CatalogLine[]>([]);
  // Override manuali per riga generata automaticamente (prezzo unit. al cliente, in €)
  // Se undefined → usa il calcolo automatico; se number → l'utente ha forzato quel prezzo al centesimo
  const [overrides, setOverrides] = useState<{
    matMq?: number;
    posaMq?: number;
    tappMq?: number;
    trasportoKm?: number;
    trasfertaMq?: number;
  }>({});
  const [totaleTarget, setTotaleTarget] = useState<string>("");
  const setOv = (k: keyof typeof overrides, v: number | undefined) =>
    setOverrides((o) => ({ ...o, [k]: v }));
  const resetOv = (k: keyof typeof overrides) =>
    setOverrides((o) => { const n = { ...o }; delete n[k]; return n; });
  const [tonalita, setTonalita] = useState<Array<{id:number; nome:string; mq:number}>>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  // Selezione Woodco da catalogo DB (collezione → essenza → finitura → formato + accessori)
  const [wcSel, setWcSel] = useState<WoodcoSelection>(emptyWoodcoSelection);
  const isWoodco = prodotto?.fornitore === "Parquet Woodco";
  const wcReady = isWoodco && wcSel.listPrice !== null && wcSel.formatCode !== null;

  // Carica giacenza per tonalità (solo prodotti gestiti a magazzino, es. Biomag MgO)
  useEffect(() => {
    if (!prodotto?.magazzino || !prodotto?.magazzinoProductType) {
      setStockMap({});
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("color, quantity_sqm, movement_type")
        .eq("product_type", prodotto.magazzinoProductType);
      if (error || !data) { setStockMap({}); return; }
      const map: Record<string, number> = {};
      for (const r of data) {
        const k = String(r.color || "").trim();
        if (!k) continue;
        const q = Number(r.quantity_sqm) || 0;
        const sign = r.movement_type === "OUT" ? -1 : 1;
        map[k] = (map[k] || 0) + sign * q;
      }
      setStockMap(map);
    })();
  }, [prodotto?.id, prodotto?.magazzino, prodotto?.magazzinoProductType]);

  const stockFor = (nome: string) => {
    const k = String(nome || "").trim();
    if (!k) return null;
    // match case-insensitive
    const found = Object.keys(stockMap).find(x => x.toLowerCase() === k.toLowerCase());
    return found ? stockMap[found] : 0;
  };

  const selectProdotto = (p: any) => {
    setProdotto(p);
    setTonalita([{ id: Date.now(), nome: "", mq: 0 }]);
    setWcSel(emptyWoodcoSelection);
  };
  const resetProdotto = () => {
    setProdotto(null);
    setTonalita([]);
    setWcSel(emptyWoodcoSelection);
  };
  const addTon = () => setTonalita(t => [...t, { id: Date.now()+Math.random(), nome:"", mq:0 }]);
  const updTon = (id:number,k:string,v:any) => setTonalita(t => t.map(x => x.id===id ? {...x,[k]:v} : x));
  const delTon = (id:number) => setTonalita(t => t.filter(x => x.id!==id));
  const tonMqTot = tonalita.reduce((s,x) => s + (Number(x.mq)||0), 0);

  // Tonalità che superano la giacenza (solo per prodotti a magazzino)
  const overstockRows = prodotto?.magazzino
    ? tonalita.filter(tn => {
        const av = stockFor(tn.nome);
        return av !== null && Number(tn.mq) > av;
      })
    : [];
  const hasOverstock = overstockRows.length > 0;

  // Auto-sync: i mq totali del preventivo seguono la somma delle tonalità
  useEffect(() => {
    if (tonalita.length > 0 && tonMqTot > 0 && tonMqTot !== mqPrev) {
      setMqPrev(tonMqTot);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tonMqTot, tonalita.length]);


  // INTESTAZIONE
  const [lingua, setLingua] = useState("IT");
  const t = T[lingua];
  const [numPrev, setNumPrev] = useState("");
  const [dataPrev, setDataPrev] = useState(today());
  const [cliente, setCliente] = useState({ nome:"", indirizzo:"", citta:"", telefono:"", email:"", tipo:"", tipoAltro:"", partitaIva:"", referente:"", ruoloReferente:"" });
  const [crmLink, setCrmLink] = useState<CrmRecord | null>(null);
  const [cantiere, setCantiere] = useState("");
  const [noteCliente, setNoteCliente] = useState("");
  const [noteInterne, setNoteInterne] = useState("");
  const [stato, setStato] = useState<"bozza"|"inviato"|"accettato"|"rifiutato">("bozza");
  const [saving, setSaving] = useState(false);
  const [preventivoId, setPreventivoId] = useState<string|null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const hasErr = (k: string) => errors.has(k);
  const errStyle = (k: string) => hasErr(k) ? { borderColor: "#DC2626", boxShadow: "0 0 0 2px rgba(220,38,38,.15)" } : {};

  const [pagamenti, setPagamenti] = useState<any[]>([
    { label:"Acconto", pct:30, data:"", note:"" },
    { label:"A metà lavori", pct:40, data:"", note:"" },
    { label:"Saldo finale", pct:30, data:"", note:"" },
  ]);

  // CONDIZIONI DI FORNITURA
  const [ivaRate, setIvaRate] = useState<number>(22);
  const [metodoTrasporto, setMetodoTrasporto] = useState<string>("Trasporto a cura Kalēa");
  const [tempiConsegna, setTempiConsegna] = useState<string>("");
  const [tipoPagamento, setTipoPagamento] = useState<string>("Bonifico bancario");

  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  useEffect(() => {
    if (!editId) {
      // Nuovo preventivo: reset stato per evitare di ereditare dati precedenti
      setPreventivoId(null);
      setNumPrev("");
      setCliente({ nome:"", indirizzo:"", citta:"", telefono:"", email:"", tipo:"", tipoAltro:"", partitaIva:"", referente:"", ruoloReferente:"" });
      setCrmLink(null);
      setCantiere("");
      setProdotto(null);
      setRigheMat([]);
      setOverrides({});
      setNoteCliente("");
      setNoteInterne("");
      setStato("bozza");
      setStep(1);

      // 1) Numero preventivo progressivo dal DB (KAL-YYYY-NNN)
      (async () => {
        try {
          const yy = new Date().getFullYear();
          const prefix = `KAL-${yy}-`;
          const { data } = await supabase
            .from("quotes")
            .select("quote_number")
            .like("quote_number", `${prefix}%`)
            .order("quote_number", { ascending: false })
            .limit(200);
          let maxN = 0;
          (data || []).forEach((r: any) => {
            const m = /^KAL-\d{4}-(\d+)$/.exec(r.quote_number || "");
            if (m) { const n = parseInt(m[1], 10); if (n > maxN) maxN = n; }
          });
          setNumPrev(`${prefix}${String(maxN + 1).padStart(3, "0")}`);
        } catch (e) { /* silent */ }
      })();

      // 2) Prefill da leadId/customerId passati in querystring
      const leadIdParam = searchParams.get("leadId");
      const customerIdParam = searchParams.get("customerId") || searchParams.get("customer");
      const leadName = searchParams.get("leadName");
      const leadEmail = searchParams.get("leadEmail");
      const leadPhone = searchParams.get("leadPhone");
      const leadCity = searchParams.get("leadCity");
      const leadAddress = searchParams.get("leadAddress");

      if (customerIdParam) {
        (async () => {
          const { data: c } = await supabase.from("customers")
            .select("id,first_name,last_name,company_name,email,phone,address,city")
            .eq("id", customerIdParam).maybeSingle();
          if (c) {
            const nome = c.company_name || `${c.first_name||""} ${c.last_name||""}`.trim();
            setCrmLink({
              source:"customer", id:c.id, label: nome || "—",
              sub: [c.email, c.phone, c.city].filter(Boolean).join(" · "),
              nome, indirizzo: c.address || "", citta: c.city || "",
              telefono: c.phone || "", email: c.email || "",
            });
            setCliente(prev => ({ ...prev, nome, indirizzo: c.address || "", citta: c.city || "", telefono: c.phone || "", email: c.email || "" }));
          }
        })();
      } else if (leadIdParam) {
        (async () => {
          const { data: l } = await supabase.from("leads")
            .select("id,name,company_name,email,phone,address,city")
            .eq("id", leadIdParam).maybeSingle();
          const nome = (l?.company_name || l?.name || leadName || "").trim();
          const indirizzo = l?.address || leadAddress || "";
          const citta = l?.city || leadCity || "";
          const telefono = l?.phone || leadPhone || "";
          const email = l?.email || leadEmail || "";
          if (l || leadName) {
            setCrmLink({
              source:"lead", id: l?.id || leadIdParam, label: nome || "—",
              sub: [email, telefono, citta].filter(Boolean).join(" · "),
              nome, indirizzo, citta, telefono, email,
            });
            setCliente(prev => ({ ...prev, nome, indirizzo, citta, telefono, email }));
          }
        })();
      } else if (leadName) {
        // Nessun id ma parametri manuali (compat)
        setCliente(prev => ({
          ...prev,
          nome: leadName,
          indirizzo: leadAddress || "",
          citta: leadCity || "",
          telefono: leadPhone || "",
          email: leadEmail || "",
        }));
      }
      return;
    }
    let cancelled = false;
    (async () => {
      const tId = toast.loading("Caricamento preventivo…");
      try {
        // Reset stato prima di popolare col nuovo preventivo (evita mix con quello precedente)
        setPreventivoId(null);
        setProdotto(null);
        setRigheMat([]);
        setOverrides({});
        setCrmLink(null);
        setCliente({ nome:"", indirizzo:"", citta:"", telefono:"", email:"", tipo:"", tipoAltro:"", partitaIva:"", referente:"", ruoloReferente:"" });
        setCantiere("");
        setNoteCliente("");
        setNoteInterne("");

        const { data: q } = await supabase.from("quotes").select("*").eq("id", editId).maybeSingle();
        if (cancelled) return;
        if (!q) {
          toast.error("Preventivo non trovato", { id: tId });
          return;
        }
        const statusMapRev: any = { draft: "bozza", sent: "inviato", accepted: "accettato", rejected: "rifiutato" };
        setPreventivoId(q.id);
        setNumPrev(q.quote_number || "");
        if (q.status) { const st = statusMapRev[q.status] || "bozza"; setStato(st); if (st === "accettato") setStep(3); else setStep(1); }
        if (q.project_name) setCantiere(q.project_name);
        const d: any = q.quote_data || {};
        if (d.lingua) setLingua(d.lingua);
        if (d.cliente) setCliente(d.cliente);
        if (d.prodotto) setProdotto(d.prodotto);
        if (d.complessita) setComplessita(d.complessita);
        if (typeof d.mqPrev === "number") setMqPrev(d.mqPrev);
        if (typeof d.sfrido === "number") setSfrido(d.sfrido);
        if (typeof d.sconto === "number") setSconto(d.sconto);
        if (typeof d.incPosa === "boolean") setIncPosa(d.incPosa);
        if (typeof d.incTapp === "boolean") setIncTapp(d.incTapp);
        if (typeof d.incTrasporto === "boolean") setIncTrasporto(d.incTrasporto);
        if (typeof d.kmDist === "number") setKmDist(d.kmDist);
        if (Array.isArray(d.righeMat)) setRigheMat(d.righeMat);
        if (d.catalog) {
          if (Array.isArray(d.catalog.articoli)) setArticoli(d.catalog.articoli);
          if (Array.isArray(d.catalog.accessori)) setAccessori(d.catalog.accessori);
          if (Array.isArray(d.catalog.servizi)) setServizi(d.catalog.servizi);
        }
        if (Array.isArray(d.pagamenti)) setPagamenti(d.pagamenti);
        if (typeof d.ivaRate === "number") setIvaRate(d.ivaRate);
        if (d.metodoTrasporto) setMetodoTrasporto(d.metodoTrasporto);
        if (d.tempiConsegna) setTempiConsegna(d.tempiConsegna);
        if (d.tipoPagamento) setTipoPagamento(d.tipoPagamento);
        if (Array.isArray(d.tonalita)) setTonalita(d.tonalita);
        if (d.wcSel) setWcSel(d.wcSel);
        if (d.noteCliente) setNoteCliente(d.noteCliente);
        if (d.noteInterne) setNoteInterne(d.noteInterne);
        if (d.overrides && typeof d.overrides === "object") setOverrides(d.overrides);
        toast.success("Preventivo caricato", { id: tId });
      } catch (e: any) {
        console.error(e);
        toast.error("Errore caricamento: " + (e?.message || ""), { id: tId });
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const filtered = useMemo(()=>PRODOTTI.filter(p=>{
    const fs = fornFilt==="Tutti" || p.fornitore===fornFilt;
    const ss = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || p.fornitore.toLowerCase().includes(search.toLowerCase()) || p.categoria.toLowerCase().includes(search.toLowerCase()) || p.dims.toLowerCase().includes(search.toLowerCase());
    return fs && ss;
  }), [search, fornFilt]);

  const calc = useMemo(()=>{
    if (!prodotto && (righeMat?.length || 0) === 0) return null;
    // Per Woodco usiamo il prezzo del listino DB (cascading) + lo sconto fornitore associato
    let listinoUsed = prodotto?.listino ?? 0;
    let coeffUsed = prodotto?.coeff ?? 0;
    if (prodotto && isWoodco && wcSel.listPrice !== null) {
      listinoUsed = wcSel.listPrice;
      const disc = wcSel.supplierDiscountPct ?? 55;
      coeffUsed = (100 - disc) / 100;
    }
    const costoMatMq = prodotto ? listinoUsed * coeffUsed : 0;
    const prezzoMatMqAuto = costoMatMq * MARKUP;
    const prezzoMatMq = overrides.matMq != null ? overrides.matMq : prezzoMatMqAuto;
    const mqOrd = prodotto ? mqPrev * (1 + sfrido/100) : 0;
    const costoMatTot = mqOrd * costoMatMq;
    const prezzoMatTot = mqOrd * prezzoMatMq;
    const prezzoPosaMqAuto = PREZZI_POSA[complessita];
    const prezzoPosaMq = overrides.posaMq != null ? overrides.posaMq : prezzoPosaMqAuto;
    const costoPosaTot = prodotto && incPosa ? mqPrev*COSTO_POSA_INTERNO : 0;
    const prezzoPosaTot = prodotto && incPosa ? mqPrev*prezzoPosaMq : 0;
    const tappNeeded = !!prodotto && incTapp && prodotto.tappetino !== "mai";
    const prezzoTappMqAuto = PREZZO_TAPPETINO_CLIENTE;
    const prezzoTappMq = overrides.tappMq != null ? overrides.tappMq : prezzoTappMqAuto;
    const costoTappTot = tappNeeded ? mqPrev*COSTO_TAPPETINO_INTERNO : 0;
    const prezzoTappTot = tappNeeded ? mqPrev*prezzoTappMq : 0;
    const kmExtra = Math.max(0, kmDist - KM_SOGLIA);
    const prezzoTrasportoKmAuto = COSTO_KM*MARKUP;
    const prezzoTrasportoKm = overrides.trasportoKm != null ? overrides.trasportoKm : prezzoTrasportoKmAuto;
    const costoTrasporto = incTrasporto && kmExtra>0 ? kmExtra*COSTO_KM : 0;
    const prezzoTrasporto = incTrasporto && kmExtra>0 ? kmExtra*prezzoTrasportoKm : 0;
    const trasfertaAttiva = kmDist > KM_SOGLIA && incPosa;
    const supplMqAuto = trasfertaAttiva ? SUPPL_TRASFERTA_POSA[complessita] : 0;
    const supplMq = overrides.trasfertaMq != null ? overrides.trasfertaMq : supplMqAuto;
    const costoTrasfertaTot = trasfertaAttiva ? mqPrev*SUPPL_TRASFERTA_POSA[complessita]*0.5 : 0;
    const prezzoTrasfertaTot = trasfertaAttiva ? mqPrev*supplMq : 0;
    // Accessori Woodco
    const costoAccTot = (wcSel.accessories || []).reduce((s,a)=>s + (a.costoUn||0)*(a.qta||0), 0);
    const prezzoAccTot = (wcSel.accessories || []).reduce((s,a)=>s + (a.prezzoUn||0)*(a.qta||0), 0);
    const costoExtraTot = righeMat.reduce((s,r)=>{
      const qta = Number(r.qta)||0;
      const qtaTot = qta * (1 + (Number(r.sfridoPct)||0)/100);
      return s + qtaTot*(Number(r.costoUn)||0);
    }, 0) + costoAccTot;
    const prezzoExtraTot = righeMat.reduce((s,r)=>{
      const qta = Number(r.qta)||0;
      const qtaTot = qta * (1 + (Number(r.sfridoPct)||0)/100);
      const lordo = qtaTot*(Number(r.prezzoUn)||0);
      const sc = r.scontoEur != null ? Number(r.scontoEur) : lordo*((Number(r.scontoPct)||0)/100);
      return s + lordo - sc;
    }, 0) + prezzoAccTot;
    const costoTotale = costoMatTot+costoPosaTot+costoTappTot+costoTrasporto+costoTrasfertaTot+costoExtraTot;
    const catalogArticoliTot = catalogLinesTotal(articoli);
    const catalogAccessoriTot = catalogLinesTotal(accessori);
    const catalogServiziTot = catalogLinesTotal(servizi);
    const catalogTot = catalogArticoliTot + catalogAccessoriTot + catalogServiziTot;
    const prezzoLordoTot = prezzoMatTot+prezzoPosaTot+prezzoTappTot+prezzoTrasporto+prezzoTrasfertaTot+prezzoExtraTot+catalogTot;
    const scontoAmt = prezzoLordoTot*(sconto/100);
    const prezzoNetto = prezzoLordoTot - scontoAmt;
    const iva = prezzoNetto*(ivaRate/100);
    const totaleIva = prezzoNetto + iva;
    const margineE = prezzoNetto - costoTotale;
    const marginePct = prezzoNetto>0 ? (margineE/prezzoNetto)*100 : 0;
    const prezzoMqTot = mqPrev>0 ? prezzoNetto/mqPrev : 0;
    const scontoMax = prezzoLordoTot>0 ? ((prezzoLordoTot-costoTotale)/prezzoLordoTot)*100 : 0;
    return { costoMatMq,prezzoMatMq,prezzoMatMqAuto,mqOrd,costoMatTot,prezzoMatTot,prezzoPosaMq,prezzoPosaMqAuto,costoPosaTot,prezzoPosaTot,prezzoTappMq,prezzoTappMqAuto,costoTappTot,prezzoTappTot,tappNeeded,prezzoTrasportoKm,prezzoTrasportoKmAuto,costoTrasporto,prezzoTrasporto,kmExtra,trasfertaAttiva,supplMq,supplMqAuto,costoTrasfertaTot,prezzoTrasfertaTot,costoExtraTot,prezzoExtraTot,costoAccTot,prezzoAccTot,costoTotale,prezzoLordoTot,scontoAmt,prezzoNetto,iva,totaleIva,margineE,marginePct,prezzoMqTot,scontoMax };
  }, [prodotto,complessita,mqPrev,sfrido,incPosa,incTapp,kmDist,incTrasporto,sconto,righeMat,ivaRate,isWoodco,wcSel,overrides,articoli,accessori,servizi]);

  const addRiga = () => setRigheMat(r=>[...r,{ id:Date.now(), desc:"", qta:1, unita:"a corpo", costoUn:0, prezzoUn:0, sfridoPct:0, scontoPct:0, scontoEur:null }]);
  const addRigaFromProdotto = (p:any) => {
    const costo = (p.listino||0) * (p.coeff||0.45);
    const prezzo = costo * MARKUP;
    setRigheMat(r=>[...r,{
      id: Date.now()+Math.random(),
      desc: `${p.fornitore} — ${p.nome}${p.dims?` (${p.dims})`:""}`,
      qta: 1, unita: "mq",
      costoUn: Math.round(costo*100)/100,
      prezzoUn: Math.round(prezzo*100)/100,
      prodId: p.id,
      sfridoPct: 10,
      scontoPct: 0,
      scontoEur: null,
    }]);
    toast.success(`Aggiunto: ${p.nome}`);
  };
  const updRiga = (id:any,k:string,v:any) => setRigheMat(r=>r.map(x=>x.id===id?{...x,[k]:v}:x));
  const updRigaMany = (id:any, patch:any) => setRigheMat(r=>r.map(x=>x.id===id?{...x,...patch}:x));
  const delRiga = (id:any) => setRigheMat(r=>r.filter(x=>x.id!==id));

  const selectCrm = (r: CrmRecord) => {
    setCrmLink(r);
    setCliente(c => ({ ...c, nome:r.nome, indirizzo:r.indirizzo, citta:r.citta, telefono:r.telefono, email:r.email }));
  };

  const salvaPreventivo = async () => {
    // Validazione dettagliata: raccoglie tutti i campi mancanti
    const missing: string[] = [];
    const errs = new Set<string>();
    const clienteName = (crmLink?.label || crmLink?.nome || cliente.nome || "").trim();
    if (!clienteName) { missing.push("Nome cliente / Ragione sociale"); errs.add("cliente.nome"); }
    const hasCatalogLine = (articoli.length + accessori.length + servizi.length) > 0;
    if (!prodotto && (righeMat?.length || 0) === 0 && !hasCatalogLine) {
      missing.push("Almeno un prodotto (principale, aggiuntivo o da catalogo)");
      errs.add("prodotto");
    }
    if (prodotto && (!mqPrev || mqPrev <= 0)) {
      missing.push("Metri quadri da posare (> 0)");
      errs.add("mqPrev");
    }
    if (isWoodco && !wcReady) {
      missing.push("Collezione, essenza, finitura e formato Woodco");
      errs.add("woodco");
    }
    if (hasOverstock) {
      const det = overstockRows.map(r => `${r.nome}: ${r.mq} mq richiesti / ${stockFor(r.nome)} mq disp.`).join("; ");
      missing.push(`Quantità superiore al magazzino — ${det}`);
    }
    setErrors(errs);
    if (missing.length > 0) {
      toast.error(`Manca: ${missing.join(" · ")}`, { duration: 6000 });
      return;
    }
    if (!calc) { toast.error("Errore nel calcolo del preventivo"); return; }
    setSaving(true);
    try {
      const num = numPrev || nextNum();
      if (!numPrev) setNumPrev(num);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi effettuare il login per salvare il preventivo");
      // Dettaglio completo del preventivo, salvato dentro quotes.quote_data
      const quoteData: any = {
        cliente, cantiere, prodotto, complessita, mqPrev, sfrido, sconto,
        incPosa, incTapp, incTrasporto, kmDist, righeMat, pagamenti,
        ivaRate, metodoTrasporto, tempiConsegna, tipoPagamento, tonalita,
        wcSel, noteCliente, noteInterne, calc, lingua, stato, overrides,
        catalog: { articoli, accessori, servizi },
      };

      const mapCatalog = (kind: string) => (r: CatalogLine) => ({
        type: kind,
        catalog_id: r.catalog_id || undefined,
        codice: r.code || undefined,
        descrizione: r.name + (r.description ? ` — ${r.description}` : ""),
        qta: r.quantity,
        unita: r.unit,
        prezzo_un: r.unit_price,
        sconto_pct: r.discount_pct,
        importo: (Number(r.quantity) || 0) * (Number(r.unit_price) || 0) * (1 - (Number(r.discount_pct) || 0) / 100),
      });

      const statusMap: any = { bozza: "draft", inviato: "sent", accettato: "accepted", rifiutato: "rejected" };
      const items = [
        prodotto && {
          type: "prodotto",
          descrizione: `${prodotto.fornitore} — ${prodotto.nome}${prodotto.dims ? ` (${prodotto.dims})` : ""}`,
          mq: mqPrev,
          prezzo_mq: calc.prezzoMatMq,
          importo: calc.prezzoMatTot,
          tonalita,
          woodco: isWoodco ? wcSel : undefined,
        },
        ...(righeMat || []).map((r: any) => ({
          type: "extra",
          descrizione: r.desc,
          qta: r.qta,
          unita: r.unita,
          prezzo_un: r.prezzoUn,
          importo: (r.prezzoUn || 0) * (r.qta || 0),
        })),
        ...articoli.map(mapCatalog("articolo")),
        ...accessori.map(mapCatalog("accessorio")),
        ...servizi.map(mapCatalog("servizio")),
      ].filter(Boolean);



      const quotePayload: any = {
        customer_id: crmLink?.source === "customer" ? crmLink.id : null,
        lead_id: crmLink?.source === "lead" ? crmLink.id : null,
        quote_number: num,
        status: statusMap[stato] || "draft",
        total_amount: Math.round(calc.totaleIva * 100) / 100,
        vat_amount: Math.round(calc.iva * 100) / 100,
        vat_included: true,
        vat_rate: ivaRate / 100,
        notes: noteCliente || null,
        items,
        additional_costs: [
          calc.prezzoPosaTot ? { label: "Posa", importo: calc.prezzoPosaTot } : null,
          calc.prezzoTappTot ? { label: "Tappetino", importo: calc.prezzoTappTot } : null,
          calc.prezzoTrasporto ? { label: "Trasporto", importo: calc.prezzoTrasporto } : null,
          calc.prezzoTrasfertaTot ? { label: "Trasferta posatori", importo: calc.prezzoTrasfertaTot } : null,
        ].filter(Boolean),
        created_by: user.email || user.id,
        project_name: cantiere || null,
        site_address: cliente.indirizzo || null,
        site_city: cliente.citta || null,
        transport_method: metodoTrasporto || null,
        delivery_time: tempiConsegna || null,
        payment_type: tipoPagamento || null,
        payment_terms_text: (pagamenti || []).map((p: any) => `${p.label}: ${p.pct}%`).join(" · ") || null,
        subject: prodotto ? `${prodotto.fornitore} — ${prodotto.nome}` : null,
        client_name: (crmLink?.label || crmLink?.nome || cliente.nome) || null,
        quote_data: quoteData,
      };

      if (preventivoId) {
        const { error } = await supabase.from("quotes").update(quotePayload).eq("id", preventivoId);
        if (error) throw error;
        toast.success("Preventivo aggiornato");
      } else {
        const { data, error } = await supabase.from("quotes").insert(quotePayload).select("id").single();
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

  const generaPDF = async () => {
    if (calc && calc.marginePct < MARGINE_BLOCCO) {
      alert(`⛔ BLOCCO: Margine ${pct(calc.marginePct)} sotto il ${MARGINE_BLOCCO}%. Rivedi il preventivo.`);
      return;
    }
    const preview = document.getElementById("pdf-preview") as HTMLElement | null;
    if (!preview) { toast.error("Vai su 'Anteprima & PDF' prima di scaricare"); return; }
    const tId = toast.loading("Generazione PDF...");
    try {
      const [{ default: html2canvas }, jsPDFmod] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const jsPDF = (jsPDFmod as any).jsPDF || (jsPDFmod as any).default;
      const canvas = await html2canvas(preview, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
        heightLeft -= pageH;
      }
      const fname = `Preventivo_${(numPrev || "Kalea").replace(/[^\w-]+/g, "_")}.pdf`;
      pdf.save(fname);
      toast.success("PDF scaricato", { id: tId });
    } catch (e: any) {
      console.error(e);
      toast.error(`Errore PDF: ${e?.message || e}`, { id: tId });
    }
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

      <div style={{display:"flex",gap:2,marginBottom:20,background:"#F1F5F9",borderRadius:10,padding:4,width:"fit-content",alignItems:"center"}}>
        {([["1","Calcolo & Verifica"],["2","Intestazione & Cliente"],["3","Anteprima & PDF"]] as const)
          .filter(([n]) => stato !== "accettato" || n === "3")
          .map(([n,l])=>(
          <button key={n} onClick={()=>setStep(Number(n))}
            style={{padding:"8px 20px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:step===Number(n)?500:400,
              background:step===Number(n)?"#fff":"transparent", color:step===Number(n)?"#1A1A2E":"#9A9890",
              boxShadow:step===Number(n)?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{n}. {l}</button>
        ))}
        {stato === "accettato" ? (
          <button onClick={()=>{ setStato("bozza"); setStep(1); toast.info("Preventivo sbloccato per modifica"); }}
            style={{marginLeft:8,padding:"8px 14px",borderRadius:8,border:"1px solid #E0DDD8",background:"#fff",cursor:"pointer",fontSize:12,color:"#6B6860"}}>
            🔓 Sblocca per modifica
          </button>
        ) : preventivoId && (
          <button onClick={()=>{ setStato("accettato"); setStep(3); toast.success("Preventivo bloccato"); }}
            style={{marginLeft:8,padding:"8px 14px",borderRadius:8,border:"1px solid #E0DDD8",background:"#fff",cursor:"pointer",fontSize:12,color:"#6B6860"}}>
            🔒 Blocca preventivo
          </button>
        )}
      </div>

      {/* STEP 1 */}
      {step===1 && (
        <div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={card}>
            {!prodotto ? (
              <>
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
                <div style={{maxHeight:520,overflowY:"auto",borderRadius:8,border:"1px solid #E0DDD8"}}>
                  {(showAll?filtered:filtered.slice(0,25)).map(p=>{
                    const costoMq=p.listino*p.coeff;
                    const prezzoMq=costoMq*MARKUP;
                    const fc=prodStyle(p);
                    return (
                      <div key={p.id}
                        style={{padding:"9px 12px",borderBottom:"0.5px solid #E0DDD8",borderLeft:"3px solid transparent",display:"flex",alignItems:"center",gap:10}}>
                        <div onClick={()=>selectProdotto(p)} style={{flex:1,cursor:"pointer",minWidth:0}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontWeight:500,fontSize:13}}>{p.nome}</span>
                            <span style={{fontSize:14,fontWeight:600,color:"#1A1A2E"}}>{euro(prezzoMq)}<span style={{fontSize:10,color:"#9A9890"}}>/mq</span></span>
                          </div>
                          <div style={{display:"flex",gap:6,alignItems:"center",fontSize:11,color:"#9A9890"}}>
                            <span style={{display:"inline-block",padding:"1px 6px",borderRadius:3,fontWeight:500,background:fc.bg,color:fc.c,fontSize:10}}>{prodBadgeLabel(p)}</span>
                            <span>{p.categoria}</span><span>· {p.dims}</span>
                            <span style={{marginLeft:"auto",color:"#6B6860"}}>costo {euro(costoMq)}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e)=>{e.stopPropagation(); addRigaFromProdotto(p);}}
                          title="Aggiungi al preventivo (puoi aggiungerne all'infinito)"
                          style={{padding:"6px 12px",borderRadius:7,border:"1px solid #1A1A2E",background:"#1A1A2E",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:500,whiteSpace:"nowrap",flexShrink:0}}>
                          + Aggiungi
                        </button>
                      </div>
                    );
                  })}
                  {!showAll && filtered.length>25 && (
                    <div style={{padding:10,textAlign:"center"}}>
                      <button onClick={()=>setShowAll(true)} style={{padding:"5px 16px",borderRadius:8,border:"1px solid #E0DDD8",background:"#F1F5F9",cursor:"pointer",fontSize:12,color:"#6B6860"}}>Mostra tutti i {filtered.length} risultati</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Prodotto selezionato — collassato */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,paddingBottom:12,borderBottom:"1px solid #E0DDD8"}}>
                  <div>
                    <div style={{fontSize:11,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Prodotto scelto</div>
                    <div style={{fontSize:17,fontWeight:500,color:"#1A1A2E"}}>{prodotto.nome}</div>
                    <div style={{fontSize:12,color:"#9A9890",marginTop:2}}>{prodotto.dims} · {prodotto.categoria}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginTop:8}}>
                      <span style={{fontSize:10,padding:"3px 9px",borderRadius:6,fontWeight:500,background:prodStyle(prodotto).bg,color:prodStyle(prodotto).c}}>{prodBadgeLabel(prodotto)}</span>
                      <span style={{fontSize:12,color:"#6B6860"}}>{euro(prodotto.listino*prodotto.coeff*MARKUP)}/mq</span>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                    <button onClick={()=>setAddingMore(v=>!v)}
                      style={{padding:"6px 12px",borderRadius:7,border:"1px solid #1A1A2E",background:addingMore?"#1A1A2E":"transparent",color:addingMore?"#fff":"#1A1A2E",cursor:"pointer",fontSize:12,fontWeight:500,whiteSpace:"nowrap"}}>
                      {addingMore ? "× Chiudi ricerca" : "+ Aggiungi prodotto"}
                    </button>
                    <button onClick={resetProdotto}
                      style={{padding:"6px 12px",borderRadius:7,border:"1px solid #E0DDD8",background:"transparent",cursor:"pointer",fontSize:12,color:"#6B6860",whiteSpace:"nowrap"}}>
                      ← Cambia prodotto
                    </button>
                  </div>
                </div>

                {/* Ricerca inline per aggiungere ulteriori prodotti (illimitati) come righe extra */}
                {addingMore && (
                  <div style={{marginBottom:14,padding:12,border:"1px dashed #C8A96E",borderRadius:10,background:"#FBF8F2"}}>
                    <div style={{fontSize:11,fontWeight:500,color:"#8A7060",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>
                      Aggiungi prodotti extra (illimitati)
                    </div>
                    <div style={{position:"relative",marginBottom:8}}>
                      <input value={search} onChange={e=>{setSearch(e.target.value);setShowAll(false);}}
                        placeholder="🔍 Cerca nome, fornitore, categoria..."
                        style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #E0DDD8",fontSize:13,outline:"none",background:"#fff",boxSizing:"border-box"}}/>
                    </div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                      {FORNITORI_LIST.map(f=>{
                        const fc=FORN_STYLE[f]||{bg:"#1A1A2E",c:"#fff"};
                        return <button key={f} onClick={()=>{setFornFilt(f);setShowAll(false);}}
                          style={{padding:"3px 10px",borderRadius:16,border:"1px solid",cursor:"pointer",fontSize:11,fontWeight:500,
                            background:fornFilt===f?(f==="Tutti"?"#1A1A2E":fc.bg):"transparent",
                            color:fornFilt===f?(f==="Tutti"?"#fff":fc.c):"#9A9890",
                            borderColor:fornFilt===f?(f==="Tutti"?"#1A1A2E":fc.c):"#E0DDD8"}}>{f}</button>;
                      })}
                    </div>
                    <div style={{maxHeight:340,overflowY:"auto",borderRadius:8,border:"1px solid #E0DDD8",background:"#fff"}}>
                      {(showAll?filtered:filtered.slice(0,25)).map(p=>{
                        const costoMq=p.listino*p.coeff;
                        const prezzoMq=costoMq*MARKUP;
                        const fc=prodStyle(p);
                        return (
                          <div key={p.id} style={{padding:"8px 12px",borderBottom:"0.5px solid #E0DDD8",display:"flex",alignItems:"center",gap:10}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                                <span style={{fontWeight:500,fontSize:13}}>{p.nome}</span>
                                <span style={{fontSize:13,fontWeight:600,color:"#1A1A2E"}}>{euro(prezzoMq)}<span style={{fontSize:10,color:"#9A9890"}}>/mq</span></span>
                              </div>
                              <div style={{display:"flex",gap:6,alignItems:"center",fontSize:11,color:"#9A9890"}}>
                                <span style={{display:"inline-block",padding:"1px 6px",borderRadius:3,fontWeight:500,background:fc.bg,color:fc.c,fontSize:10}}>{prodBadgeLabel(p)}</span>
                                <span>{p.categoria}</span><span>· {p.dims}</span>
                              </div>
                            </div>
                            <button
                              onClick={()=>{addRigaFromProdotto(p);}}
                              title="Aggiungi al preventivo (puoi aggiungerne all'infinito)"
                              style={{padding:"6px 12px",borderRadius:7,border:"1px solid #1A1A2E",background:"#1A1A2E",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:500,whiteSpace:"nowrap",flexShrink:0}}>
                              + Aggiungi
                            </button>
                          </div>
                        );
                      })}
                      {!showAll && filtered.length>25 && (
                        <div style={{padding:8,textAlign:"center"}}>
                          <button onClick={()=>setShowAll(true)} style={{padding:"5px 16px",borderRadius:8,border:"1px solid #E0DDD8",background:"#F1F5F9",cursor:"pointer",fontSize:12,color:"#6B6860"}}>Mostra tutti i {filtered.length} risultati</button>
                        </div>
                      )}
                    </div>
                    <div style={{fontSize:11,color:"#8A7060",marginTop:8}}>
                      Ogni "+ Aggiungi" crea una nuova riga sotto — puoi aggiungerne quanti vuoi. Le trovi in "Prodotti & accessori aggiuntivi" con quantità, sfrido e sconto per riga.
                    </div>
                  </div>
                )}

                {/* ─── Selezione Woodco da catalogo DB ─── */}
                {isWoodco && (
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:500,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>
                      Configurazione Woodco
                    </div>
                    <WoodcoBlock value={wcSel} onChange={setWcSel} />
                  </div>
                )}

                {/* Tonalità (nascosta per Woodco — la selezione DB la sostituisce) */}
                {!isWoodco && (
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{fontSize:11,fontWeight:500,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em"}}>Tonalità / colori</div>
                      <button onClick={addTon}
                        style={{padding:"4px 12px",borderRadius:6,border:"1px solid #1A1A2E",background:"transparent",cursor:"pointer",fontSize:12,color:"#1A1A2E"}}>+ Tonalità</button>
                    </div>
                    <datalist id={`ton-${prodotto.id}`}>
                      {(TONALITA_BY_PRODUCT[prodotto.id] || []).map(t => <option key={t} value={t} />)}
                    </datalist>
                    {tonalita.length === 0 && (
                      <div style={{fontSize:12,color:"#9A9890",padding:"8px 0"}}>Aggiungi almeno una tonalità con i relativi mq.</div>
                    )}
                    {tonalita.map((tn, idx) => {
                      const av = prodotto.magazzino ? stockFor(tn.nome) : null;
                      const over = av !== null && Number(tn.mq) > av;
                      return (
                      <div key={tn.id} style={{marginBottom:8}}>
                        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 120px 28px",gap:8,alignItems:"center"}}>
                          <input list={`ton-${prodotto.id}`} value={tn.nome}
                            onChange={e=>updTon(tn.id,"nome",e.target.value)}
                            placeholder={`Tonalità ${idx+1} (es. ${(TONALITA_BY_PRODUCT[prodotto.id]||["Rovere Naturale"])[0]})`}
                            style={{padding:"8px 10px",borderRadius:7,border:`1px solid ${over?"#A32D2D":"#E0DDD8"}`,fontSize:13,boxSizing:"border-box",width:"100%",minWidth:0,background:"#fff"}}/>
                          <div style={{position:"relative"}}>
                            <input type="number" min={0} step={0.5} value={tn.mq || ""}
                              onChange={e=>updTon(tn.id,"mq",Number(e.target.value))}
                              style={{width:"100%",padding:"8px 32px 8px 10px",borderRadius:7,border:`1px solid ${over?"#A32D2D":"#E0DDD8"}`,fontSize:13,textAlign:"right",boxSizing:"border-box",background:"#fff",MozAppearance:"textfield" as any}}/>
                            <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#9A9890",pointerEvents:"none"}}>mq</span>
                          </div>
                          <button onClick={()=>delTon(tn.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#A32D2D",fontSize:20,padding:0,lineHeight:1}}>×</button>
                        </div>
                        {prodotto.magazzino && tn.nome && av !== null && (
                          <div style={{fontSize:11,marginTop:4,marginLeft:2,color:over?"#A32D2D":"#6B6860"}}>
                            {over
                              ? `⚠ Disponibili solo ${av} mq di "${tn.nome}" — richiesti ${tn.mq} mq. Non è possibile preventivare questa quantità.`
                              : `Disponibili a magazzino: ${av} mq`}
                          </div>
                        )}
                      </div>
                      );
                    })}
                    {tonalita.length > 0 && (
                      <div style={{padding:"10px 12px",background:hasOverstock?"#FBEAEA":"#F1F5F9",borderRadius:8,marginTop:6,fontSize:12,color:hasOverstock?"#A32D2D":"#6B6860"}}>
                        Totale tonalità: <b style={{color:hasOverstock?"#A32D2D":"#1A1A2E"}}>{tonMqTot} mq</b>
                        <span style={{color:"#9A9890",marginLeft:8}}>· i mq del preventivo si aggiornano automaticamente</span>
                        {hasOverstock && (
                          <div style={{marginTop:6,fontWeight:500}}>
                            Quantità non disponibile a magazzino — riduci i mq o cambia tonalità prima di salvare il preventivo.
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid #E0DDD8"}}>
              <div style={{...sectionTitle,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <span>Prodotti & accessori aggiuntivi</span>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <select
                    value=""
                    onChange={(e)=>{
                      const p = PRODOTTI.find(x=>x.id===e.target.value);
                      if (p) addRigaFromProdotto(p);
                      e.target.value = "";
                    }}
                    style={{padding:"4px 8px",borderRadius:6,border:"1px solid #1A1A2E",background:"#fff",fontSize:12,cursor:"pointer",maxWidth:260}}
                  >
                    <option value="">+ Prodotto da catalogo…</option>
                    {FORNITORI_LIST.filter(f=>f!=="Tutti").map(forn=>(
                      <optgroup key={forn} label={forn}>
                        {PRODOTTI.filter(p=>p.fornitore===forn).map(p=>(
                          <option key={p.id} value={p.id}>{p.nome}{p.dims?` — ${p.dims}`:""}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button onClick={addRiga} style={{padding:"3px 12px",borderRadius:6,border:"1px solid #1A1A2E",background:"transparent",cursor:"pointer",fontSize:12,color:"#1A1A2E"}}>+ Riga libera</button>
                </div>
              </div>
              <div style={{fontSize:11,color:"#9A9890",marginBottom:8}}>
                Voci libere e prodotti extra. Metti quanto vuoi al centesimo (prezzo unitario €), anche negativo per uno sconto puntuale. Verranno stampate nel preventivo.
              </div>
              {righeMat.length === 0 && (
                <div style={{fontSize:12,color:"#9A9890",fontStyle:"italic",padding:"8px 0"}}>Nessuna voce aggiuntiva.</div>
              )}
              {righeMat.map(r=>{
                const qta = Number(r.qta)||0;
                const sfrPct = Number(r.sfridoPct)||0;
                const qtaSfr = qta * sfrPct/100;
                const qtaTot = qta + qtaSfr;
                const prezzoUn = Number(r.prezzoUn)||0;
                const costoUn = Number(r.costoUn)||0;
                const lordo = qtaTot * prezzoUn;
                const scEurStored = r.scontoEur != null ? Number(r.scontoEur) : null;
                const scEur = scEurStored != null ? scEurStored : lordo * ((Number(r.scontoPct)||0)/100);
                const scPctDisp = scEurStored != null ? (lordo>0 ? scEurStored/lordo*100 : 0) : (Number(r.scontoPct)||0);
                const netto = lordo - scEur;
                const costoTotRiga = qtaTot * costoUn;
                const marg = netto - costoTotRiga;
                return (
                <div key={r.id} style={{marginBottom:14,padding:"10px 12px",borderRadius:8,border:"1px solid #E0DDD8",background:"#FBFAF7"}}>
                  {/* Riga 1: descrizione + unit + costo/prezzo + elimina */}
                  <div style={{display:"grid",gridTemplateColumns:"minmax(0,2fr) 70px 90px 100px 26px",gap:6,alignItems:"center",marginBottom:8}}>
                    <input value={r.desc} onChange={e=>updRiga(r.id,"desc",e.target.value)} placeholder="Descrizione voce" style={{padding:"7px 9px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,minWidth:0}}/>
                    <input value={r.unita} onChange={e=>updRiga(r.id,"unita",e.target.value)} placeholder="mq / pz / ml" style={{padding:"7px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12}}/>
                    <div style={{position:"relative"}}>
                      <input value={r.costoUn} type="number" step="0.01" onChange={e=>updRiga(r.id,"costoUn",Number(e.target.value))} placeholder="Costo un." style={{width:"100%",padding:"7px 22px 7px 7px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,textAlign:"right",boxSizing:"border-box"}}/>
                      <span style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"#9A9890",pointerEvents:"none"}}>€</span>
                    </div>
                    <div style={{position:"relative"}}>
                      <input value={r.prezzoUn} type="number" step="0.01" onChange={e=>updRiga(r.id,"prezzoUn",Number(e.target.value))} placeholder="Prezzo un." style={{width:"100%",padding:"7px 22px 7px 7px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,textAlign:"right",fontWeight:500,boxSizing:"border-box",background:"#fff"}}/>
                      <span style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"#9A9890",pointerEvents:"none"}}>€</span>
                    </div>
                    <button onClick={()=>delRiga(r.id)} title="Elimina riga" style={{background:"none",border:"none",cursor:"pointer",color:"#A32D2D",fontSize:20,padding:0,lineHeight:1}}>×</button>
                  </div>

                  {/* Riga 2: Q.tà · Sfrido% · Q.tà sfrido · Q.tà totale */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:8}}>
                    <label style={{display:"flex",flexDirection:"column",gap:3}}>
                      <span style={{fontSize:10,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>Q.tà</span>
                      <input value={r.qta} type="number" step="0.01" onChange={e=>updRiga(r.id,"qta",Number(e.target.value))} style={{padding:"6px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,textAlign:"right"}}/>
                    </label>
                    <label style={{display:"flex",flexDirection:"column",gap:3}}>
                      <span style={{fontSize:10,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>Sfrido %</span>
                      <div style={{position:"relative"}}>
                        <input value={sfrPct} type="number" step="0.5" min={0} onChange={e=>updRiga(r.id,"sfridoPct",Number(e.target.value))} style={{width:"100%",padding:"6px 22px 6px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,textAlign:"right",boxSizing:"border-box"}}/>
                        <span style={{position:"absolute",right:7,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"#9A9890",pointerEvents:"none"}}>%</span>
                      </div>
                    </label>
                    <label style={{display:"flex",flexDirection:"column",gap:3}}>
                      <span style={{fontSize:10,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>Q.tà sfrido</span>
                      <input value={Number(qtaSfr.toFixed(3))} type="number" step="0.01" min={0}
                        onChange={e=>{
                          const v = Number(e.target.value);
                          const newPct = qta>0 ? (v/qta)*100 : 0;
                          updRiga(r.id,"sfridoPct", Math.round(newPct*1000)/1000);
                        }}
                        style={{padding:"6px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,textAlign:"right",background:"#fff"}}/>
                    </label>
                    <label style={{display:"flex",flexDirection:"column",gap:3}}>
                      <span style={{fontSize:10,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>Q.tà totale</span>
                      <input value={Number(qtaTot.toFixed(3))} type="number" step="0.01" min={0}
                        onChange={e=>{
                          const v = Number(e.target.value);
                          const newPct = qta>0 ? ((v-qta)/qta)*100 : 0;
                          updRiga(r.id,"sfridoPct", Math.round(newPct*1000)/1000);
                        }}
                        style={{padding:"6px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,textAlign:"right",background:"#fff",fontWeight:500}}/>
                    </label>
                  </div>

                  {/* Riga 3: Sconto % ↔ € + totali riga */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:6,alignItems:"end"}}>
                    <label style={{display:"flex",flexDirection:"column",gap:3}}>
                      <span style={{fontSize:10,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>Sconto %</span>
                      <div style={{position:"relative"}}>
                        <input value={Number(scPctDisp.toFixed(2))} type="number" step="0.1" min={0}
                          onChange={e=>updRigaMany(r.id,{scontoPct: Number(e.target.value), scontoEur: null})}
                          style={{width:"100%",padding:"6px 22px 6px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,textAlign:"right",boxSizing:"border-box"}}/>
                        <span style={{position:"absolute",right:7,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"#9A9890",pointerEvents:"none"}}>%</span>
                      </div>
                    </label>
                    <label style={{display:"flex",flexDirection:"column",gap:3}}>
                      <span style={{fontSize:10,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>Sconto €</span>
                      <div style={{position:"relative"}}>
                        <input value={Number(scEur.toFixed(2))} type="number" step="0.01" min={0}
                          onChange={e=>updRigaMany(r.id,{scontoEur: Number(e.target.value)})}
                          style={{width:"100%",padding:"6px 22px 6px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:12,textAlign:"right",boxSizing:"border-box"}}/>
                        <span style={{position:"absolute",right:7,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"#9A9890",pointerEvents:"none"}}>€</span>
                      </div>
                    </label>
                    <div style={{fontSize:11,color:"#6B6860",textAlign:"right",lineHeight:1.5}}>
                      <div>Lordo: <b style={{color:"#1A1A2E"}}>{euro(lordo)}</b> <span style={{color:"#9A9890"}}>({Number(qtaTot.toFixed(3))} × {euro(prezzoUn)})</span></div>
                      <div>Netto cliente: <b style={{color:"#1A1A2E",fontSize:13}}>{euro(netto)}</b> <span style={{color: marg>=0?"#2D7A4F":"#A32D2D"}}>· margine {euro(marg)}</span></div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:14}}>


            <div style={{...card,marginBottom:0}}>
              <div style={sectionTitle}>Parametri cantiere</div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:12,color:"#6B6860",marginBottom:8}}>Complessità posa</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
                  {(["semplice","media","complessa"] as const).map(k=>{
                    const isCustom = overrides.posaMq != null;
                    const active = complessita===k && !isCustom;
                    return (
                    <div key={k} onClick={()=>{ setComplessita(k); resetOv("posaMq"); }} style={{
                      padding:"10px 12px",borderRadius:8,cursor:"pointer",border:"1px solid",
                      background:active?"#1A1A2E":"#F1F5F9",
                      borderColor:active?"#1A1A2E":"#E0DDD8",
                      color:active?"#fff":"#1A1A1A"}}>
                      <div style={{fontWeight:500,fontSize:13,textTransform:"capitalize"}}>{k}</div>
                      <div style={{fontSize:13,fontWeight:600,marginTop:4}}>{PREZZI_POSA[k]}€/mq</div>
                    </div>
                    );
                  })}
                  {(() => {
                    const isCustom = overrides.posaMq != null;
                    return (
                      <div onClick={()=>{ if (!isCustom) setOv("posaMq", PREZZI_POSA[complessita]); }} style={{
                        padding:"10px 12px",borderRadius:8,cursor:"pointer",border:"1px solid",
                        background:isCustom?"#C8A96E":"#F1F5F9",
                        borderColor:isCustom?"#C8A96E":"#E0DDD8",
                        color:isCustom?"#fff":"#1A1A1A"}}>
                        <div style={{fontWeight:500,fontSize:13}}>Personalizzato</div>
                        {isCustom ? (
                          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}} onClick={e=>e.stopPropagation()}>
                            <input type="number" step="0.01" min={0} value={overrides.posaMq}
                              onChange={e=>setOv("posaMq", e.target.value===""?0:Number(e.target.value))}
                              style={{width:"100%",padding:"3px 6px",borderRadius:5,border:"1px solid rgba(255,255,255,.5)",background:"rgba(255,255,255,.15)",color:"#fff",fontSize:13,fontWeight:600,textAlign:"right",boxSizing:"border-box"}}/>
                            <span style={{fontSize:11}}>€/mq</span>
                          </div>
                        ) : (
                          <div style={{fontSize:12,marginTop:4,color:"#6B6860"}}>manuale €/mq</div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <Slider label="mq da posare" min={1} max={5000} value={mqPrev} step={0.01} onChange={setMqPrev} format={(v:any)=>v+" mq"} unit="mq" editable/>
              <Slider label="Sfrido (%)" min={0} max={25} value={sfrido} step={0.1} onChange={setSfrido} format={(v:any)=>v+"%"} unit="%" editable/>
              <Slider label="Sconto cliente (%)" min={0} max={40} value={sconto} step={0.1} onChange={setSconto} format={(v:any)=>v+"%"} unit="%" editable/>
              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                <Btn active={incPosa} onClick={()=>setIncPosa(!incPosa)}>{incPosa?"✓ ":""}Posa</Btn>
                <Btn active={false} onClick={()=>{
                  const preset = { id:Date.now(), desc:"Tappetino / sottofondo", qta: mqPrev||1, unita:"mq", costoUn: COSTO_TAPPETINO_INTERNO, prezzoUn: PREZZO_TAPPETINO_CLIENTE, sfridoPct:0, scontoPct:0, scontoEur:null, __tappetino:true };
                  setRigheMat(r=>[...r, preset]);
                  setIncTapp(false);
                  toast.success("Tappetino aggiunto — modificalo nella lista prodotti");
                }}>+ Tappetino</Btn>
                <Btn active={incTrasporto} onClick={()=>setIncTrasporto(!incTrasporto)}>{incTrasporto?"✓ ":""}Trasporto</Btn>
              </div>
              {incTrasporto && (
                <div style={{marginTop:12}}>
                  <Slider label="Distanza da Desenzano (km)" min={0} max={400} value={kmDist} step={5} onChange={setKmDist} format={(v:any)=>v+" km"}/>
                </div>
              )}
            </div>


            {calc && (
              <div style={{...card,marginBottom:0}}>
                <div style={sectionTitle}>Prezzi cliente — modifica al centesimo</div>
                <div style={{fontSize:11,color:"#9A9890",marginBottom:10}}>
                  Cambia il prezzo unitario per allinearlo a quanto pattuito col cliente. Il costo interno resta invariato: il margine si aggiorna in tempo reale così vedi subito se sei ancora coperto.
                </div>
                {(() => {
                  const rows: Array<{key: keyof typeof overrides; label: string; unit: string; auto: number; current: number}> = [];
                  rows.push({key:"matMq", label:`Fornitura ${prodotto?.nome || "materiale"}`, unit:"€/mq", auto: calc.prezzoMatMqAuto, current: calc.prezzoMatMq});
                  if (incPosa) rows.push({key:"posaMq", label:`Posa in opera (${complessita})`, unit:"€/mq", auto: calc.prezzoPosaMqAuto, current: calc.prezzoPosaMq});
                  if (calc.tappNeeded) rows.push({key:"tappMq", label:"Materassino / sottofondo", unit:"€/mq", auto: calc.prezzoTappMqAuto, current: calc.prezzoTappMq});
                  if (incTrasporto && calc.kmExtra > 0) rows.push({key:"trasportoKm", label:`Trasporto (${calc.kmExtra} km oltre soglia)`, unit:"€/km", auto: calc.prezzoTrasportoKmAuto, current: calc.prezzoTrasportoKm});
                  if (calc.trasfertaAttiva) rows.push({key:"trasfertaMq", label:"Supplemento trasferta posatori", unit:"€/mq", auto: calc.supplMqAuto, current: calc.supplMq});
                  return rows.map(row => {
                    const overridden = overrides[row.key] != null;
                    return (
                      <div key={row.key} style={{display:"grid",gridTemplateColumns:"1fr 110px 60px 28px",gap:8,alignItems:"center",marginBottom:6,padding:"6px 8px",borderRadius:7,background:overridden?"#FFF6E6":"transparent",border:overridden?"1px solid #E8DFC8":"1px solid transparent"}}>
                        <div style={{fontSize:12,color:"#1A1A2E",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {overridden ? "🔓 " : "🔒 "}{row.label}
                          {overridden && <span style={{fontSize:10,color:"#9A9890",marginLeft:6}}>auto: {euro(row.auto)}</span>}
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={overridden ? overrides[row.key] : row.auto.toFixed(2)}
                          onChange={e=>setOv(row.key, e.target.value===""?undefined:Number(e.target.value))}
                          style={{padding:"6px 8px",borderRadius:6,border:"1px solid #E0DDD8",fontSize:13,textAlign:"right",fontWeight:overridden?600:400,background:"#fff"}}
                        />
                        <span style={{fontSize:11,color:"#9A9890"}}>{row.unit}</span>
                        {overridden ? (
                          <button onClick={()=>resetOv(row.key)} title="Ripristina automatico"
                            style={{background:"none",border:"none",cursor:"pointer",color:"#6B6860",fontSize:14,padding:0}}>↺</button>
                        ) : <span/>}
                      </div>
                    );
                  });
                })()}

                <div style={{marginTop:14,paddingTop:12,borderTop:"1px dashed #E0DDD8"}}>
                  <div style={{fontSize:11,fontWeight:500,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>
                    Chiudi il totale a una cifra pattuita
                  </div>
                  <div style={{fontSize:11,color:"#9A9890",marginBottom:8}}>
                    Se col cliente hai pattuito, per esempio, <b>€ 8.500,00 IVA inclusa</b>, scrivi qui il totale e aggiungo una riga "Adeguamento commerciale" per far quadrare al centesimo.
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 130px",gap:8,alignItems:"center"}}>
                    <input
                      type="number" step="0.01" min="0"
                      value={totaleTarget}
                      onChange={e=>setTotaleTarget(e.target.value)}
                      placeholder={`Attuale: ${euro(calc.totaleIva)}`}
                      style={{padding:"8px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,textAlign:"right",background:"#fff"}}
                    />
                    <button
                      onClick={()=>{
                        const target = Number(totaleTarget);
                        if (!target || isNaN(target)) { toast.error("Inserisci un totale valido"); return; }
                        const currentTot = calc.totaleIva;
                        const deltaIva = target - currentTot;
                        // Converti in imponibile: deltaImponibile * (1 + iva/100) + eventuale sconto% deve dare deltaIva
                        // Se sconto%: deltaLordo * (1 - sconto/100) * (1 + iva/100) = deltaIva
                        const factor = (1 - sconto/100) * (1 + ivaRate/100);
                        const deltaLordo = factor > 0 ? deltaIva / factor : deltaIva;
                        const rounded = Math.round(deltaLordo * 100) / 100;
                        if (Math.abs(rounded) < 0.01) { toast.success("Totale già corretto"); return; }
                        setRigheMat(prev => {
                          const existing = prev.findIndex((r:any) => r.__adjustment);
                          const row = {
                            id: existing >= 0 ? prev[existing].id : Date.now()+Math.random(),
                            desc: "Adeguamento commerciale",
                            qta: 1, unita: "a corpo",
                            costoUn: 0,
                            prezzoUn: existing >= 0 ? Math.round((prev[existing].prezzoUn + rounded) * 100)/100 : rounded,
                            __adjustment: true,
                          };
                          if (existing >= 0) {
                            const copy = [...prev]; copy[existing] = row; return copy;
                          }
                          return [...prev, row];
                        });
                        setTotaleTarget("");
                        toast.success(`Totale chiuso a ${euro(target)}`);
                      }}
                      style={{padding:"8px 12px",borderRadius:7,border:"1px solid #1A1A2E",background:"#1A1A2E",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:500}}>
                      Applica
                    </button>
                  </div>
                  {righeMat.some((r:any)=>r.__adjustment) && (
                    <div style={{marginTop:6,fontSize:11,color:"#633806"}}>
                      ⚠ È attivo un adeguamento commerciale nelle voci libere. Puoi modificarlo o eliminarlo dalla lista sopra.
                    </div>
                  )}
                </div>
              </div>
            )}

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
                    <div key={k.l} style={{background:"#F1F5F9",borderRadius:8,padding:"10px 12px"}}>
                      <div style={{fontSize:11,color:"#9A9890"}}>{k.l}</div>
                      <div style={{fontSize:16,fontWeight:600,color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{padding:"8px 12px",background:"#F7F6F3",borderRadius:8,marginBottom:12,fontSize:12,color:"#6B6860",display:"flex",justifyContent:"space-between"}}>
                  <span>Totale IVA inclusa</span>
                  <b style={{color:"#1A1A2E",fontSize:14}}>{euro(calc.totaleIva)}</b>
                </div>
                <button onClick={()=>setStep(2)} style={{width:"100%",padding:"11px",borderRadius:9,border:"none",cursor:"pointer",fontSize:14,fontWeight:500,background:calc.marginePct>MARGINE_BLOCCO?"#1A1A2E":"#9A9890",color:"#fff"}}>
                  {calc.marginePct>MARGINE_BLOCCO ? "Vai a Intestazione & Cliente →" : "⛔ Sblocca prima il margine"}
                </button>

              </div>
            )}
          </div>
        </div>
        <div style={{marginTop:16}}>
          <QuoteCatalogSections
            articoli={articoli} setArticoli={setArticoli}
            accessori={accessori} setAccessori={setAccessori}
            servizi={servizi} setServizi={setServizi}
          />
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
                  <input value={(cliente as any)[k]} onChange={e=>{setCliente(c=>({...c,[k]:e.target.value})); if(k==="nome"&&e.target.value.trim()) setErrors(s=>{const n=new Set(s);n.delete("cliente.nome");return n;});}} placeholder={pl}
                    style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box", ...(k==="nome"?errStyle("cliente.nome"):{})}}/>
                  {k==="nome" && hasErr("cliente.nome") && <div style={{fontSize:11,color:"#DC2626",marginTop:3}}>Campo obbligatorio</div>}
                </div>
              ))}
              <div style={{marginBottom:8}}>
                <div style={{fontSize:11,color:"#6B6860",marginBottom:4}}>Tipologia cliente</div>
                <select value={cliente.tipo} onChange={e=>setCliente(c=>({...c,tipo:e.target.value, tipoAltro: e.target.value==="altro" ? c.tipoAltro : ""}))}
                  style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box",background:"#fff"}}>
                  <option value="">Seleziona tipologia…</option>
                  <option value="architetto">Architetto</option>
                  <option value="geometra">Geometra</option>
                  <option value="impresa_edile">Impresa edile</option>
                  <option value="cliente_privato">Cliente privato</option>
                  <option value="altro">Altro</option>
                </select>
              </div>
              {cliente.tipo === "altro" && (
                <div style={{marginBottom:8}}>
                  <input value={cliente.tipoAltro} onChange={e=>setCliente(c=>({...c,tipoAltro:e.target.value}))} placeholder="Specifica di cosa si tratta"
                    style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box"}}/>
                </div>
              )}
              <div style={{marginBottom:8}}>
                <input value={cliente.partitaIva} onChange={e=>setCliente(c=>({...c,partitaIva:e.target.value}))} placeholder="Partita IVA / Codice Fiscale"
                  style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <input value={cliente.referente} onChange={e=>setCliente(c=>({...c,referente:e.target.value}))} placeholder="Persona di riferimento"
                  style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box"}}/>
                <input value={cliente.ruoloReferente} onChange={e=>setCliente(c=>({...c,ruoloReferente:e.target.value}))} placeholder="Ruolo in azienda (es. titolare, geometra…)"
                  style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box"}}/>
              </div>
            </div>
          </div>

          <div>
            <div style={card}>
              <div style={sectionTitle}>{t.pagamenti}</div>
              {pagamenti.map((p,i)=>(
                <div key={i} style={{marginBottom:12,padding:"10px 12px",background:"#F1F5F9",borderRadius:8}}>
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
              <div style={sectionTitle}>Condizioni di fornitura</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div>
                  <div style={{fontSize:12,color:"#6B6860",marginBottom:4}}>Metodo di trasporto</div>
                  <select value={metodoTrasporto} onChange={e=>setMetodoTrasporto(e.target.value)}
                    style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box",background:"#fff"}}>
                    <option>Trasporto a cura Kalēa</option>
                    <option>Corriere espresso</option>
                    <option>Ritiro in sede</option>
                    <option>Franco cantiere</option>
                    <option>Franco fabbrica</option>
                    <option>A cura del cliente</option>
                  </select>
                </div>
                <div>
                  <div style={{fontSize:12,color:"#6B6860",marginBottom:4}}>Tempi di consegna</div>
                  <input value={tempiConsegna} onChange={e=>setTempiConsegna(e.target.value)} placeholder="Es. 15-20 giorni lavorativi"
                    style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{fontSize:12,color:"#6B6860",marginBottom:4}}>Tipo di pagamento</div>
                  <select value={tipoPagamento} onChange={e=>setTipoPagamento(e.target.value)}
                    style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box",background:"#fff"}}>
                    <option>Bonifico bancario</option>
                    <option>Contanti</option>
                    <option>Assegno</option>
                    <option>Carta di credito</option>
                    <option>Rateale</option>
                    <option>Ri.Ba.</option>
                    <option>Anticipato</option>
                  </select>
                </div>
                <div>
                  <div style={{fontSize:12,color:"#6B6860",marginBottom:4}}>Aliquota IVA</div>
                  <select value={ivaRate} onChange={e=>setIvaRate(Number(e.target.value))}
                    style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #E0DDD8",fontSize:13,boxSizing:"border-box",background:"#fff"}}>
                    <option value={0}>0% (esente)</option>
                    <option value={4}>4%</option>
                    <option value={10}>10%</option>
                    <option value={22}>22%</option>
                  </select>
                </div>
              </div>
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
                <div style={{fontSize:22,fontWeight:600,color:"#1A1A2E",letterSpacing:".05em"}}>{t.titolo}</div>
                <div style={{fontSize:13,color:"#6B6860",marginTop:4}}>N° <strong>{numPrev||"KAL-2026-001"}</strong></div>
                <div style={{fontSize:13,color:"#6B6860"}}>Data: <strong>{dataPrev}</strong></div>
                <div style={{fontSize:13,color:"#A32D2D"}}>{t.validita}: <strong>{addDays(dataPrev,30)}</strong></div>
              </div>
            </div>

            {/* Cliente */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:28}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>{t.cliente}</div>
                <div style={{fontSize:14,fontWeight:500}}>{cliente.nome||"—"}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cliente.indirizzo}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cliente.citta}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cliente.telefono}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cliente.email}</div>
              </div>
              {cantiere && <div>
                <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>{t.oggetto}</div>
                <div style={{fontSize:13,color:"#6B6860"}}>{cantiere}</div>
              </div>}
            </div>

            {/* Corpo preventivo */}
            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:24}}>
              <thead>
                <tr>
                  {[t.desc,t.mq,t.prezzo_unit,t.totale].map((h:string)=>(
                    <th key={h} style={{background:"#1A1A2E",padding:"9px 12px",textAlign:h===t.desc?"left":"right",fontSize:11,fontWeight:500,color:"#fff",textTransform:"uppercase",letterSpacing:".05em"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{background:"#F7F6F3"}}>
                  <td colSpan={4} style={{padding:"7px 12px",fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>{t.fornitura}</td>
                </tr>
                {prodotto && (
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>
                      {prodotto?.nome} — {prodotto?.dims}
                      {tonalita.filter(x=>x.nome).length>0 && (
                        <div style={{fontSize:11,color:"#6B6860",marginTop:3}}>
                          Tonalità: {tonalita.filter(x=>x.nome).map(x => `${x.nome}${x.mq>0?` (${x.mq} mq)`:""}`).join(" · ")}
                        </div>
                      )}
                    </td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{calc.mqOrd.toFixed(1)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(calc.prezzoMatMq)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoMatTot)}</td>
                  </tr>
                )}
                {righeMat.filter((r:any)=>r.desc).map((r:any)=>(
                  <tr key={r.id}>
                    <td style={{padding:"8px 12px",fontSize:13}}>{r.desc}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{r.qta} {r.unita}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(r.prezzoUn)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(r.prezzoUn*r.qta)}</td>
                  </tr>
                ))}
                {incPosa && calc.prezzoPosaTot>0 && <>
                  <tr style={{background:"#F7F6F3"}}>
                    <td colSpan={4} style={{padding:"7px 12px",fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>{t.posa}</td>
                  </tr>
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>{t.posa} — {complessita}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{mqPrev}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(calc.prezzoPosaMq)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoPosaTot)}</td>
                  </tr>
                </>}
                {calc.tappNeeded && <>
                  <tr style={{background:"#F7F6F3"}}>
                    <td colSpan={4} style={{padding:"7px 12px",fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em"}}>{t.tappetino}</td>
                  </tr>
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>{t.tappetino}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{mqPrev}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(calc.prezzoTappMq)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoTappTot)}</td>
                  </tr>
                </>}
                {incTrasporto && calc.kmExtra>0 && (
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>{t.trasporto} ({calc.kmExtra} km)</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{calc.kmExtra}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(calc.prezzoTrasportoKm)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoTrasporto)}</td>
                  </tr>
                )}
                {calc.trasfertaAttiva && (
                  <tr>
                    <td style={{padding:"8px 12px",fontSize:13}}>{t.trasferta}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{mqPrev}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right"}}>{euro(calc.supplMq)}</td>
                    <td style={{padding:"8px 12px",fontSize:13,textAlign:"right",fontWeight:500}}>{euro(calc.prezzoTrasfertaTot)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totali */}
            <div style={{marginLeft:"auto",width:280}}>
              {[
                {l:t.subtotale,v:euro(calc.prezzoLordoTot)},
                sconto>0 && {l:`${t.sconto_label||"Sconto"} ${sconto}%`,v:`− ${euro(calc.scontoAmt)}`,c:"#633806"},
                sconto>0 && {l:t.imponibile_sc||t.imponibile||"Imponibile",v:euro(calc.prezzoNetto)},
                {l:`IVA ${ivaRate}%`,v:euro(calc.iva)},
              ].filter(Boolean).map((r:any,i:number)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"0.5px solid #E0DDD8",fontSize:13}}>
                  <span style={{color:"#6B6860"}}>{r.l}</span>
                  <span style={{color:r.c||"#1A1A1A"}}>{r.v}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontWeight:700,fontSize:16,borderTop:"2px solid #1A1A2E",marginTop:4}}>
                <span>{t.totale_doc}</span>
                <span style={{color:"#1A1A2E"}}>{euro(calc.totaleIva)}</span>
              </div>
            </div>

            {/* Condizioni di fornitura */}
            <div style={{marginTop:28,paddingTop:20,borderTop:"1px solid #E0DDD8",clear:"both"}}>
              <div style={{fontSize:12,fontWeight:600,color:"#1A1A2E",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Condizioni di fornitura</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 24px",fontSize:13}}>
                <div><span style={{color:"#6B6860"}}>Metodo di trasporto: </span><span style={{fontWeight:500}}>{metodoTrasporto||"—"}</span></div>
                <div><span style={{color:"#6B6860"}}>Tempi di consegna: </span><span style={{fontWeight:500}}>{tempiConsegna||"—"}</span></div>
                <div><span style={{color:"#6B6860"}}>Tipo di pagamento: </span><span style={{fontWeight:500}}>{tipoPagamento||"—"}</span></div>
                <div><span style={{color:"#6B6860"}}>Aliquota IVA: </span><span style={{fontWeight:500}}>{ivaRate}%</span></div>
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
              <div style={{marginTop:20,padding:"12px 16px",background:"#F1F5F9",borderRadius:8,fontSize:13,color:"#6B6860",lineHeight:1.7}}>
                <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>{t.note_cliente}</div>
                {noteCliente}
              </div>
            )}

            {/* Termini */}
            <div style={{marginTop:28,paddingTop:20,borderTop:"1px solid #E0DDD8"}}>
              <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>{t.termini}</div>
              <div style={{fontSize:11,color:"#6B6860",lineHeight:1.8,whiteSpace:"pre-line"}}>{t.termini_testo}</div>
            </div>

            {/* Sezione Privacy firma */}
            <div style={{marginTop:20,padding:"12px 16px",border:"1px solid #E0DDD8",borderRadius:8}}>
              <div style={{fontSize:11,fontWeight:600,color:"#9A9890",textTransform:"uppercase",letterSpacing:".05em",marginBottom:10}}>PRIVACY — D.Lgs. 196/2003 e Reg. UE 2016/679</div>
              <div style={{display:"grid",gridTemplateColumns:"24px 1fr",gap:8,alignItems:"flex-start",marginBottom:8,fontSize:12,color:"#6B6860"}}>
                <div style={{width:16,height:16,border:"1px solid #1A1A2E",borderRadius:2,marginTop:1}}></div>
                <span>{t.privacy_1}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"24px 1fr",gap:8,alignItems:"flex-start",fontSize:12,color:"#6B6860"}}>
                <div style={{width:16,height:16,border:"1px solid #1A1A2E",borderRadius:2,marginTop:1}}></div>
                <span>{t.privacy_2}</span>
              </div>
            </div>

            {/* Accettazione */}
            <div style={{marginTop:16,padding:"16px 20px",border:"2px solid #1A1A2E",borderRadius:8}}>
              <div style={{fontSize:11,color:"#6B6860",marginBottom:6}}>{t.parti_dichiarano}</div>
              <div style={{fontSize:12,color:"#6B6860",marginBottom:16,fontStyle:"italic"}}>{t.accetta}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
                <div>
                  <div style={{borderTop:"1px solid #1A1A2E",paddingTop:6,fontSize:11,color:"#9A9890"}}>{t.firma_cliente}</div>
                </div>
                <div>
                  <div style={{borderTop:"1px solid #1A1A2E",paddingTop:6,fontSize:11,color:"#9A9890"}}>{t.firma_kalēa}</div>
                </div>
              </div>
              <div style={{marginTop:20,fontSize:12,color:"#6B6860"}}>{t.luogo}: _______________________</div>
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
