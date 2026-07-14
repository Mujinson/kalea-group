// Prodotti Kronos Ceramiche 2026 — fonte: cataloghi PDF analizzati
// Prezzi €/mq listino fornitore. Da aggiornare con listino ufficiale bonificato.
// Naming policy: nessun riferimento al produttore nella UI pubblica.

export type KronosCollection =
  | 'Pierre Vive'
  | 'Materia'
  | 'Piasentina Stone'
  | 'Nativa'
  | 'Métallique'
  | 'Le Reverse'
  | 'Les Bois'
  | 'Carrière'
  | 'Rocks'
  | 'Prima Materia'
  | 'Terra Crea'
  | 'Essence'
  | 'Évolution'
  | 'Woodside'
  | 'Talco'
  | 'Outdoor SKE 2.0'
  | 'Block';

export interface KronosProduct {
  code: string;           // codice produttore da catalogo
  name: string;           // nome commerciale Kalēa (senza brand produttore)
  collection: KronosCollection;
  color?: string;         // colore/variante (es. "Loire", "Opal Elegance")
  surface?: string;       // finitura (es. "rett.", "grip", "lapp.")
  format: string;         // formato in cm (es. "60×120")
  thickness: string;      // spessore (es. "10 mm", "20 mm")
  listPrice: number;      // €/mq listino fornitore
  unit?: 'mq' | 'ml' | 'pz'; // unità di misura (default mq)
  outdoor?: boolean;
  notes?: string;
}

// ─── PIERRE VIVE ──────────────────────────────────────────────────────────────
export const pierreViveProducts: KronosProduct[] = [
  { code:"PV001", name:"Pierre Vive Noble Lastra Grande", collection:"Pierre Vive", surface:"rett.", format:"120×280", thickness:"6 mm", listPrice:132 },
  { code:"PV006", name:"Pierre Vive Noble", collection:"Pierre Vive", surface:"rett.", format:"120×120", thickness:"9 mm", listPrice:95 },
  { code:"PV206", name:"Pierre Vive Noble Grip", collection:"Pierre Vive", surface:"grip", format:"120×120", thickness:"9 mm", listPrice:97, outdoor:true },
  { code:"PV011", name:"Pierre Vive Noble", collection:"Pierre Vive", surface:"rett.", format:"60×120", thickness:"9 mm", listPrice:87 },
  { code:"PV176", name:"Pierre Vive Noble Grip", collection:"Pierre Vive", surface:"grip", format:"60×120", thickness:"9 mm", listPrice:90, outdoor:true },
  { code:"PV016", name:"Pierre Vive Noble Trace", collection:"Pierre Vive", surface:"trace", format:"60×120", thickness:"9 mm", listPrice:90, notes:"superficie scanalata — solo 60×120" },
  { code:"PV211", name:"Pierre Vive Noble", collection:"Pierre Vive", surface:"rett.", format:"60×60", thickness:"9 mm", listPrice:70 },
  { code:"PV181", name:"Pierre Vive Noble Battiscopa", collection:"Pierre Vive", format:"4,6×60", thickness:"9 mm", listPrice:18, unit:"ml" },
  { code:"PV021", name:"Pierre Vive Ancienne", collection:"Pierre Vive", surface:"rett.", format:"60×120", thickness:"9 mm", listPrice:87 },
  { code:"PV026", name:"Pierre Vive Ancienne Grip", collection:"Pierre Vive", surface:"grip", format:"60×120", thickness:"9 mm", listPrice:90, outdoor:true },
  { code:"PV031", name:"Pierre Vive Ancienne", collection:"Pierre Vive", surface:"rett.", format:"80×80", thickness:"9 mm", listPrice:87 },
  { code:"PV036", name:"Pierre Vive Ancienne Grip", collection:"Pierre Vive", surface:"grip", format:"80×80", thickness:"9 mm", listPrice:90, outdoor:true },
  { code:"PV041", name:"Pierre Vive Ancienne", collection:"Pierre Vive", surface:"rett.", format:"40×80", thickness:"9 mm", listPrice:80 },
  { code:"PV046", name:"Pierre Vive Ancienne Grip", collection:"Pierre Vive", surface:"grip", format:"40×80", thickness:"9 mm", listPrice:83, outdoor:true },
  { code:"PV051", name:"Pierre Vive Ancienne", collection:"Pierre Vive", surface:"rett.", format:"60×60", thickness:"9 mm", listPrice:70 },
  { code:"PV056", name:"Pierre Vive Ancienne Grip", collection:"Pierre Vive", surface:"grip", format:"60×60", thickness:"9 mm", listPrice:73, outdoor:true },
  { code:"PV061", name:"Pierre Vive Ancienne Vintage", collection:"Pierre Vive", surface:"rett.", format:"80×80", thickness:"9 mm", listPrice:87 },
  { code:"PV066", name:"Pierre Vive Ancienne Vintage", collection:"Pierre Vive", surface:"rett.", format:"40×80", thickness:"9 mm", listPrice:80 },
  { code:"PV071", name:"Pierre Vive Ancienne Vintage", collection:"Pierre Vive", surface:"rett.", format:"40×40", thickness:"9 mm", listPrice:72 },
  { code:"PV076", name:"Pierre Vive Ancienne Vintage", collection:"Pierre Vive", surface:"rett.", format:"60×60", thickness:"9 mm", listPrice:70 },
  { code:"PV081", name:"Pierre Vive Ancienne Vintage", collection:"Pierre Vive", surface:"rett.", format:"20×20", thickness:"9 mm", listPrice:65 },
  { code:"PV126", name:"Pierre Vive Ancienne Battiscopa", collection:"Pierre Vive", format:"4,6×60", thickness:"9 mm", listPrice:18, unit:"ml" },
  { code:"PV_SKE_N", name:"Pierre Vive Noble SKE 2.0", collection:"Pierre Vive", surface:"20mm", format:"60×120", thickness:"20 mm", listPrice:95, outdoor:true },
  { code:"PV_SKE_A1", name:"Pierre Vive Ancienne SKE 2.0", collection:"Pierre Vive", surface:"20mm", format:"60×120", thickness:"20 mm", listPrice:95, outdoor:true },
  { code:"PV_SKE_A2", name:"Pierre Vive Ancienne SKE 2.0", collection:"Pierre Vive", surface:"20mm", format:"60×60", thickness:"20 mm", listPrice:80, outdoor:true },
];

// ─── MATERIA ──────────────────────────────────────────────────────────────────
export const materiaProducts: KronosProduct[] = [
  { code:"MA001", name:"Materia Lastra Grande", collection:"Materia", format:"120×280", thickness:"6 mm", listPrice:132 },
  { code:"MA016", name:"Materia", collection:"Materia", format:"120×120", thickness:"9 mm", listPrice:105 },
  { code:"MA021", name:"Materia", collection:"Materia", format:"80×80", thickness:"9 mm", listPrice:95 },
  { code:"MA041", name:"Materia", collection:"Materia", format:"60×120", thickness:"9 mm", listPrice:105 },
  { code:"MA086", name:"Materia Grip", collection:"Materia", format:"60×120", thickness:"9 mm", listPrice:108, outdoor:true },
  { code:"MA051", name:"Materia", collection:"Materia", format:"60×60", thickness:"9 mm", listPrice:85 },
  { code:"MA061", name:"Materia", collection:"Materia", format:"30×60", thickness:"9 mm", listPrice:70 },
  { code:"MA081", name:"Materia Grip", collection:"Materia", format:"120×120", thickness:"9 mm", listPrice:108, outdoor:true },
  { code:"MA_SKE1", name:"Materia SKE 2.0", collection:"Materia", format:"120×120", thickness:"20 mm", listPrice:110, outdoor:true },
  { code:"MA_SKE2", name:"Materia SKE 2.0", collection:"Materia", format:"60×120", thickness:"20 mm", listPrice:95, outdoor:true },
];

// ─── PIASENTINA STONE ─────────────────────────────────────────────────────────
export const piasentinаProducts: KronosProduct[] = [
  { code:"PS001", name:"Piasentina Stone Velvet", collection:"Piasentina Stone", surface:"velvet", format:"120×280", thickness:"6 mm", listPrice:132 },
  { code:"PS004", name:"Piasentina Stone Velvet", collection:"Piasentina Stone", surface:"velvet", format:"120×120", thickness:"9 mm", listPrice:90 },
  { code:"PS019", name:"Piasentina Stone Velvet", collection:"Piasentina Stone", surface:"velvet", format:"60×120", thickness:"9 mm", listPrice:87 },
  { code:"PS003", name:"Piasentina Stone Milled", collection:"Piasentina Stone", surface:"milled", format:"120×280", thickness:"6 mm", listPrice:132 },
  { code:"PS009", name:"Piasentina Stone Milled", collection:"Piasentina Stone", surface:"milled", format:"60×120", thickness:"9 mm", listPrice:87 },
  { code:"PS002", name:"Piasentina Stone Flamed", collection:"Piasentina Stone", surface:"flamed", format:"120×280", thickness:"6 mm", listPrice:132 },
  { code:"PS005", name:"Piasentina Stone Flamed", collection:"Piasentina Stone", surface:"flamed", format:"120×120", thickness:"9 mm", listPrice:90 },
  { code:"PS006", name:"Piasentina Stone Flamed", collection:"Piasentina Stone", surface:"flamed", format:"80×180", thickness:"9 mm", listPrice:110 },
  { code:"PS014", name:"Piasentina Stone Flamed Grip", collection:"Piasentina Stone", surface:"flamed grip", format:"80×180", thickness:"9 mm", listPrice:113, outdoor:true },
  { code:"PS008", name:"Piasentina Stone Flamed", collection:"Piasentina Stone", surface:"flamed", format:"60×120", thickness:"9 mm", listPrice:87 },
  { code:"PS016", name:"Piasentina Stone Flamed Grip", collection:"Piasentina Stone", surface:"flamed grip", format:"60×120", thickness:"9 mm", listPrice:90, outdoor:true },
  { code:"PS007", name:"Piasentina Stone Flamed", collection:"Piasentina Stone", surface:"flamed", format:"40×80", thickness:"9 mm", listPrice:80 },
  { code:"PS015", name:"Piasentina Stone Flamed Grip", collection:"Piasentina Stone", surface:"flamed grip", format:"40×80", thickness:"9 mm", listPrice:83, outdoor:true },
  { code:"PS010", name:"Piasentina Stone Flamed SKE 2.0", collection:"Piasentina Stone", surface:"flamed", format:"80×180", thickness:"20 mm", listPrice:120, outdoor:true },
  { code:"PS011", name:"Piasentina Stone Flamed SKE 2.0", collection:"Piasentina Stone", surface:"flamed", format:"60×120", thickness:"20 mm", listPrice:105, outdoor:true },
  { code:"PS017", name:"Piasentina Stone Flamed SKE 2.0", collection:"Piasentina Stone", surface:"flamed", format:"40×120", thickness:"20 mm", listPrice:98, outdoor:true },
  { code:"PS012", name:"Piasentina Stone Flamed SKE 2.0", collection:"Piasentina Stone", surface:"flamed", format:"40×180", thickness:"20 mm", listPrice:115, outdoor:true },
  { code:"PS013", name:"Piasentina Stone Flamed SKE 2.0", collection:"Piasentina Stone", surface:"flamed", format:"60×60", thickness:"20 mm", listPrice:90, outdoor:true },
];

// ─── NATIVA ───────────────────────────────────────────────────────────────────
export const nativaProducts: KronosProduct[] = [
  { code:"NA001", name:"Nativa Vena", collection:"Nativa", surface:"vena", format:"60×120", thickness:"9 mm", listPrice:95 },
  { code:"NA002", name:"Nativa Vena Grip", collection:"Nativa", surface:"vena grip", format:"60×120", thickness:"9 mm", listPrice:98, outdoor:true },
  { code:"NA010", name:"Nativa Falda", collection:"Nativa", surface:"falda", format:"60×120", thickness:"9 mm", listPrice:95 },
  { code:"NA011", name:"Nativa Falda Heritage", collection:"Nativa", surface:"falda heritage", format:"60×120", thickness:"9 mm", listPrice:100 },
  { code:"NA_SKE_V1", name:"Nativa Vena SKE 2.0", collection:"Nativa", surface:"vena", format:"80×180", thickness:"20 mm", listPrice:120, outdoor:true },
  { code:"NA_SKE_V2", name:"Nativa Vena SKE 2.0", collection:"Nativa", surface:"vena", format:"60×120", thickness:"20 mm", listPrice:105, outdoor:true },
  { code:"NA_SKE_F1", name:"Nativa Falda SKE 2.0", collection:"Nativa", surface:"falda", format:"60×120", thickness:"20 mm", listPrice:105, outdoor:true },
  { code:"NA_SKE_F2", name:"Nativa Falda SKE 2.0", collection:"Nativa", surface:"falda", format:"60×60", thickness:"20 mm", listPrice:90, outdoor:true },
  { code:"NA088", name:"Nativa Armis SKE 2.0", collection:"Nativa", surface:"armis", format:"80×180", thickness:"20 mm", listPrice:130, outdoor:true, notes:"solo outdoor — elemento decorativo cornici/strutture" },
];

// ─── MÉTALLIQUE ───────────────────────────────────────────────────────────────
export const metalliqueProducts: KronosProduct[] = [
  { code:"ME001", name:"Métallique Lastra Grande", collection:"Métallique", format:"120×280", thickness:"6 mm", listPrice:132 },
  { code:"ME011", name:"Métallique", collection:"Métallique", format:"60×120", thickness:"9 mm", listPrice:87 },
  { code:"ME021", name:"Métallique", collection:"Métallique", format:"80×80", thickness:"9 mm", listPrice:87 },
  { code:"ME031", name:"Métallique", collection:"Métallique", format:"60×60", thickness:"9 mm", listPrice:72 },
  { code:"ME041", name:"Métallique Oxyde", collection:"Métallique", format:"60×120", thickness:"9 mm", listPrice:90 },
  { code:"ME051", name:"Métallique Battiscopa", collection:"Métallique", format:"4,6×60", thickness:"9 mm", listPrice:18, unit:"ml" },
];

// ─── LE REVERSE ───────────────────────────────────────────────────────────────
// Spessore 10mm (NON 9mm). Superfici reali: Elegance, Antique, Carved.
// NON esistono: Chevron, Versailles, Esagono, Lappato.
export const leReverseProducts: KronosProduct[] = [
  { code:"RS001", name:"Le Reverse Elegance Lastra Grande", collection:"Le Reverse", surface:"elegance", format:"120×280", thickness:"6 mm", listPrice:132 },
  { code:"RS011", name:"Le Reverse Elegance", collection:"Le Reverse", surface:"elegance", format:"60×120", thickness:"10 mm", listPrice:95 },
  { code:"RS021", name:"Le Reverse Elegance", collection:"Le Reverse", surface:"elegance", format:"80×80", thickness:"10 mm", listPrice:95 },
  { code:"RS031", name:"Le Reverse Elegance", collection:"Le Reverse", surface:"elegance", format:"60×60", thickness:"10 mm", listPrice:78 },
  { code:"RS041", name:"Le Reverse Elegance", collection:"Le Reverse", surface:"elegance", format:"40×80", thickness:"10 mm", listPrice:85 },
  { code:"RS051", name:"Le Reverse Antique", collection:"Le Reverse", surface:"antique", format:"60×120", thickness:"10 mm", listPrice:98 },
  { code:"RS061", name:"Le Reverse Antique", collection:"Le Reverse", surface:"antique", format:"80×80", thickness:"10 mm", listPrice:98 },
  { code:"RS071", name:"Le Reverse Antique", collection:"Le Reverse", surface:"antique", format:"60×60", thickness:"10 mm", listPrice:80 },
  { code:"RS081", name:"Le Reverse Antique", collection:"Le Reverse", surface:"antique", format:"40×80", thickness:"10 mm", listPrice:88 },
  { code:"RS036", name:"Le Reverse Carved", collection:"Le Reverse", surface:"carved (bocciardato)", format:"60×120", thickness:"9 mm", listPrice:98 },
  { code:"RS086", name:"Le Reverse Carved", collection:"Le Reverse", surface:"carved (bocciardato)", format:"60×60", thickness:"9 mm", listPrice:80 },
  { code:"RS076", name:"Le Reverse Carved", collection:"Le Reverse", surface:"carved (bocciardato)", format:"40×80", thickness:"9 mm", listPrice:88 },
  { code:"8039", name:"Le Reverse Carved SKE 2.0 Nuit 80×180", collection:"Le Reverse", color:"Nuit", surface:"carved SKE2.0", format:"80×180", thickness:"20 mm", listPrice:130, outdoor:true, notes:"SOLO colore Nuit" },
  { code:"RS181", name:"Le Reverse Carved SKE 2.0", collection:"Le Reverse", surface:"carved SKE2.0", format:"60×120", thickness:"20 mm", listPrice:110, outdoor:true },
  { code:"RS176", name:"Le Reverse Carved SKE 2.0", collection:"Le Reverse", surface:"carved SKE2.0", format:"60×60", thickness:"20 mm", listPrice:95, outdoor:true },
];

// ─── CARRIÈRE ────────────────────────────────────────────────────────────────
export const carriereProducts: KronosProduct[] = [
  { code:"CA001", name:"Carrière", collection:"Carrière", format:"60×120", thickness:"9 mm", listPrice:92 },
  { code:"CA011", name:"Carrière", collection:"Carrière", format:"60,8×60,8", thickness:"9 mm", listPrice:85 },
  { code:"CA021", name:"Carrière Anticato", collection:"Carrière", format:"60×120", thickness:"9 mm", listPrice:95 },
  { code:"CA031", name:"Carrière Anticato", collection:"Carrière", format:"60,8×60,8", thickness:"9 mm", listPrice:88 },
  { code:"CA051", name:"Carrière Aspetto Nobile", collection:"Carrière", format:"60×120", thickness:"9 mm", listPrice:105 },
  { code:"CA061", name:"Carrière Aspetto di Recupero", collection:"Carrière", format:"60×120", thickness:"9 mm", listPrice:105 },
  { code:"CA_G9", name:"Carrière Grip Outdoor", collection:"Carrière", format:"60×60", thickness:"9 mm", listPrice:90, outdoor:true },
  { code:"CA_G20", name:"Carrière SKE 2.0 Outdoor", collection:"Carrière", format:"60×60", thickness:"20 mm", listPrice:95, outdoor:true },
];

// ─── ROCKS ────────────────────────────────────────────────────────────────────
export const rocksProducts: KronosProduct[] = [
  { code:"RK001", name:"Rocks Porfido", collection:"Rocks", color:"Porfido", format:"60×120", thickness:"9 mm", listPrice:102 },
  { code:"RK002", name:"Rocks Porfido", collection:"Rocks", color:"Porfido", format:"80×180", thickness:"9 mm", listPrice:115 },
  { code:"RK003", name:"Rocks Porfido Grip", collection:"Rocks", color:"Porfido", format:"80×180", thickness:"9 mm", listPrice:118, outdoor:true },
  { code:"RK004", name:"Rocks Porfido Grip", collection:"Rocks", color:"Porfido", format:"60×120", thickness:"9 mm", listPrice:105, outdoor:true },
  { code:"RK005", name:"Rocks Porfido Grip", collection:"Rocks", color:"Porfido", format:"40×80", thickness:"9 mm", listPrice:95, outdoor:true },
  { code:"RK006", name:"Rocks Porfido SKE 2.0", collection:"Rocks", color:"Porfido", format:"80×180", thickness:"20 mm", listPrice:130, outdoor:true },
  { code:"RK007", name:"Rocks Porfido SKE 2.0", collection:"Rocks", color:"Porfido", format:"40×120", thickness:"20 mm", listPrice:110, outdoor:true },
  { code:"RK011", name:"Rocks Silver Black", collection:"Rocks", color:"Silver Black", format:"60×120", thickness:"9 mm", listPrice:102 },
  { code:"RK012", name:"Rocks Silver Black", collection:"Rocks", color:"Silver Black", format:"30×60", thickness:"9 mm", listPrice:78 },
  { code:"RK013", name:"Rocks Silver Black Grip", collection:"Rocks", color:"Silver Black", format:"60×120", thickness:"9 mm", listPrice:105, outdoor:true },
  { code:"RK014", name:"Rocks Silver Black SKE 2.0", collection:"Rocks", color:"Silver Black", format:"60×120", thickness:"20 mm", listPrice:115, outdoor:true },
  { code:"RK015", name:"Rocks Silver Black SKE 2.0", collection:"Rocks", color:"Silver Black", format:"60×60", thickness:"20 mm", listPrice:95, outdoor:true },
];

// ─── PRIMA MATERIA ────────────────────────────────────────────────────────────
// Spessore 10mm (NON 9mm). MAXI = 120×240 (NON 120×280).
export const primaMateriaProducts: KronosProduct[] = [
  { code:"8127", name:"Prima Materia Cemento Lastra Grande", collection:"Prima Materia", color:"Cemento", format:"120×240", thickness:"6 mm", listPrice:125 },
  { code:"8128", name:"Prima Materia Cenere Lastra Grande", collection:"Prima Materia", color:"Cenere", format:"120×240", thickness:"6 mm", listPrice:125 },
  { code:"8129", name:"Prima Materia Sandalo Lastra Grande", collection:"Prima Materia", color:"Sandalo", format:"120×240", thickness:"6 mm", listPrice:125 },
  { code:"8100", name:"Prima Materia Cemento", collection:"Prima Materia", color:"Cemento", surface:"rett.", format:"80×180", thickness:"10 mm", listPrice:115 },
  { code:"8105", name:"Prima Materia Cemento Cerato", collection:"Prima Materia", color:"Cemento", surface:"cerato rett.", format:"80×180", thickness:"10 mm", listPrice:118 },
  { code:"8110", name:"Prima Materia Cemento", collection:"Prima Materia", color:"Cemento", surface:"rett.", format:"80×80", thickness:"10 mm", listPrice:95 },
  { code:"8120", name:"Prima Materia Cemento", collection:"Prima Materia", color:"Cemento", surface:"rett.", format:"40×80", thickness:"10 mm", listPrice:82 },
  { code:"8135", name:"Prima Materia Cemento Grip", collection:"Prima Materia", color:"Cemento", surface:"grip rett.", format:"40×80", thickness:"10 mm", listPrice:85, outdoor:true },
  { code:"8175", name:"Prima Materia Cemento", collection:"Prima Materia", color:"Cemento", surface:"rett.", format:"20×80", thickness:"10 mm", listPrice:75 },
  { code:"8140", name:"Prima Materia Cemento", collection:"Prima Materia", color:"Cemento", surface:"rett.", format:"60×120", thickness:"10 mm", listPrice:98 },
  { code:"8150", name:"Prima Materia Cemento Cerato", collection:"Prima Materia", color:"Cemento", surface:"cerato rett.", format:"60×120", thickness:"10 mm", listPrice:100 },
  { code:"8155", name:"Prima Materia Cemento Grip", collection:"Prima Materia", color:"Cemento", surface:"grip rett.", format:"60×120", thickness:"10 mm", listPrice:100, outdoor:true },
  { code:"8160", name:"Prima Materia Cemento", collection:"Prima Materia", color:"Cemento", surface:"rett.", format:"20×120", thickness:"10 mm", listPrice:85 },
  { code:"8231", name:"Prima Materia Cemento", collection:"Prima Materia", color:"Cemento", surface:"rett.", format:"60×60", thickness:"10 mm", listPrice:78 },
  { code:"8185", name:"Prima Materia Battiscopa Cemento", collection:"Prima Materia", color:"Cemento", format:"4,6×60", thickness:"10 mm", listPrice:18, unit:"ml" },
  { code:"8101", name:"Prima Materia Cenere", collection:"Prima Materia", color:"Cenere", surface:"rett.", format:"80×180", thickness:"10 mm", listPrice:115 },
  { code:"8141", name:"Prima Materia Cenere", collection:"Prima Materia", color:"Cenere", surface:"rett.", format:"60×120", thickness:"10 mm", listPrice:98 },
  { code:"8161", name:"Prima Materia Cenere", collection:"Prima Materia", color:"Cenere", surface:"rett.", format:"20×120", thickness:"10 mm", listPrice:85 },
  { code:"8232", name:"Prima Materia Cenere", collection:"Prima Materia", color:"Cenere", surface:"rett.", format:"60×60", thickness:"10 mm", listPrice:78 },
  { code:"8186", name:"Prima Materia Battiscopa Cenere", collection:"Prima Materia", color:"Cenere", format:"4,6×60", thickness:"10 mm", listPrice:18, unit:"ml" },
  { code:"8103", name:"Prima Materia Sandalo", collection:"Prima Materia", color:"Sandalo", surface:"rett.", format:"80×180", thickness:"10 mm", listPrice:115 },
  { code:"8143", name:"Prima Materia Sandalo", collection:"Prima Materia", color:"Sandalo", surface:"rett.", format:"60×120", thickness:"10 mm", listPrice:98 },
  { code:"8163", name:"Prima Materia Sandalo", collection:"Prima Materia", color:"Sandalo", surface:"rett.", format:"20×120", thickness:"10 mm", listPrice:85 },
  { code:"8233", name:"Prima Materia Sandalo", collection:"Prima Materia", color:"Sandalo", surface:"rett.", format:"60×60", thickness:"10 mm", listPrice:78 },
  { code:"8188", name:"Prima Materia Battiscopa Sandalo", collection:"Prima Materia", color:"Sandalo", format:"4,6×60", thickness:"10 mm", listPrice:18, unit:"ml" },
  { code:"8038", name:"Prima Materia Cemento SKE 2.0", collection:"Prima Materia", color:"Cemento", format:"80×180", thickness:"20 mm", listPrice:130, outdoor:true },
  { code:"8075", name:"Prima Materia Cemento SKE 2.0", collection:"Prima Materia", color:"Cemento", format:"80×80", thickness:"20 mm", listPrice:105, outdoor:true },
  { code:"8095", name:"Prima Materia Cemento SKE 2.0", collection:"Prima Materia", color:"Cemento", format:"40×120", thickness:"20 mm", listPrice:110, outdoor:true },
  { code:"8090", name:"Prima Materia Cemento SKE 2.0", collection:"Prima Materia", color:"Cemento", format:"20×120", thickness:"20 mm", listPrice:95, outdoor:true },
  { code:"8062", name:"Prima Materia Cemento SKE 2.0", collection:"Prima Materia", color:"Cemento", format:"60×60", thickness:"20 mm", listPrice:90, outdoor:true },
  { code:"8076", name:"Prima Materia Cenere SKE 2.0", collection:"Prima Materia", color:"Cenere", format:"80×80", thickness:"20 mm", listPrice:105, outdoor:true },
  { code:"8096", name:"Prima Materia Cenere SKE 2.0", collection:"Prima Materia", color:"Cenere", format:"40×120", thickness:"20 mm", listPrice:110, outdoor:true },
  { code:"8091", name:"Prima Materia Cenere SKE 2.0", collection:"Prima Materia", color:"Cenere", format:"20×120", thickness:"20 mm", listPrice:95, outdoor:true },
  { code:"8063", name:"Prima Materia Cenere SKE 2.0", collection:"Prima Materia", color:"Cenere", format:"60×60", thickness:"20 mm", listPrice:90, outdoor:true },
  { code:"8077", name:"Prima Materia Sandalo SKE 2.0", collection:"Prima Materia", color:"Sandalo", format:"80×80", thickness:"20 mm", listPrice:105, outdoor:true },
  { code:"8098", name:"Prima Materia Sandalo SKE 2.0", collection:"Prima Materia", color:"Sandalo", format:"40×120", thickness:"20 mm", listPrice:110, outdoor:true },
  { code:"8093", name:"Prima Materia Sandalo SKE 2.0", collection:"Prima Materia", color:"Sandalo", format:"20×120", thickness:"20 mm", listPrice:95, outdoor:true },
  { code:"8064", name:"Prima Materia Sandalo SKE 2.0", collection:"Prima Materia", color:"Sandalo", format:"60×60", thickness:"20 mm", listPrice:90, outdoor:true },
];

// ─── TALCO ────────────────────────────────────────────────────────────────────
export const talcoProducts: KronosProduct[] = [
  { code:"4001", name:"Prima Materia Talco", collection:"Talco", color:"Talco", format:"60×60", thickness:"9 mm", listPrice:96 },
  { code:"4002", name:"Prima Materia Talco", collection:"Talco", color:"Talco", format:"60×120", thickness:"9 mm", listPrice:96 },
];

// ─── TERRA CREA ───────────────────────────────────────────────────────────────
// Spessore 10mm. Outdoor: "RUDE R11" (non "GRIP R11").
export const terraCreaProducts: KronosProduct[] = [
  { code:"TC061", name:"Terra Crea Lastra Grande", collection:"Terra Crea", format:"120×280", thickness:"6 mm", listPrice:135 },
  { code:"TC001", name:"Terra Crea", collection:"Terra Crea", format:"60×120", thickness:"10 mm", listPrice:105 },
  { code:"TC011", name:"Terra Crea", collection:"Terra Crea", format:"60×60", thickness:"10 mm", listPrice:85 },
  { code:"TC021", name:"Terra Crea", collection:"Terra Crea", format:"80×80", thickness:"10 mm", listPrice:98 },
  { code:"TC031", name:"Terra Crea", collection:"Terra Crea", format:"80×180", thickness:"10 mm", listPrice:115 },
  { code:"TC041", name:"Terra Crea", collection:"Terra Crea", format:"120×120", thickness:"10 mm", listPrice:110 },
  { code:"TC_R1", name:"Terra Crea Rude R11", collection:"Terra Crea", surface:"rude r11", format:"80×180", thickness:"10 mm", listPrice:118, outdoor:true },
  { code:"TC_R2", name:"Terra Crea Rude R11", collection:"Terra Crea", surface:"rude r11", format:"60×120", thickness:"10 mm", listPrice:108, outdoor:true },
  { code:"TC_R3", name:"Terra Crea Rude R11", collection:"Terra Crea", surface:"rude r11", format:"80×80", thickness:"10 mm", listPrice:102, outdoor:true },
  { code:"TC_R4", name:"Terra Crea Rude R11", collection:"Terra Crea", surface:"rude r11", format:"60×60", thickness:"10 mm", listPrice:90, outdoor:true },
  { code:"TC_SKE1", name:"Terra Crea SKE 2.0", collection:"Terra Crea", format:"60×120", thickness:"20 mm", listPrice:112, outdoor:true },
  { code:"TC_SKE2", name:"Terra Crea SKE 2.0", collection:"Terra Crea", format:"60×60", thickness:"20 mm", listPrice:95, outdoor:true },
];

// ─── ESSENCE ─────────────────────────────────────────────────────────────────
export const essenceProducts: KronosProduct[] = [
  { code:"ES001", name:"Essence Pure", collection:"Essence", color:"Pure", format:"20×120", thickness:"9 mm", listPrice:105 },
  { code:"ES002", name:"Essence Pure", collection:"Essence", color:"Pure", format:"26×180", thickness:"9 mm", listPrice:115 },
  { code:"ES003", name:"Essence Pure Lastra Grande", collection:"Essence", color:"Pure", format:"120×280", thickness:"6 mm", listPrice:135 },
  { code:"ES011", name:"Essence Ambre", collection:"Essence", color:"Ambre", format:"20×120", thickness:"9 mm", listPrice:105 },
  { code:"ES012", name:"Essence Ambre", collection:"Essence", color:"Ambre", format:"26×180", thickness:"9 mm", listPrice:115 },
  { code:"ES021", name:"Essence Musk", collection:"Essence", color:"Musk", format:"20×120", thickness:"9 mm", listPrice:105 },
  { code:"ES022", name:"Essence Musk", collection:"Essence", color:"Musk", format:"26×180", thickness:"9 mm", listPrice:115 },
  { code:"ES031", name:"Essence Moka Lastra Grande", collection:"Essence", color:"Moka", format:"120×280", thickness:"6 mm", listPrice:135 },
  { code:"ES041", name:"Essence Chevron", collection:"Essence", format:"9×58,5", thickness:"9 mm", listPrice:145 },
  { code:"ES091", name:"Essence Deck Pure", collection:"Essence", color:"Pure", format:"20×120", thickness:"20 mm", listPrice:125, outdoor:true },
  { code:"ES092", name:"Essence Deck Ambre", collection:"Essence", color:"Ambre", format:"20×120", thickness:"20 mm", listPrice:125, outdoor:true },
  { code:"ES093", name:"Essence Deck Musk", collection:"Essence", color:"Musk", format:"20×120", thickness:"20 mm", listPrice:125, outdoor:true },
];

// ─── ÉVOLUTION ────────────────────────────────────────────────────────────────
// Solo SKE 2.0 20mm outdoor. Formato outdoor unico: 100×100.
export const evolutionProducts: KronosProduct[] = [
  { code:"EV001", name:"Évolution", collection:"Évolution", surface:"nat.", format:"60×120", thickness:"9 mm", listPrice:92 },
  { code:"EV002", name:"Évolution Lappato", collection:"Évolution", surface:"lapp.", format:"60×120", thickness:"9 mm", listPrice:95 },
  { code:"EV003", name:"Évolution Bocciardato", collection:"Évolution", surface:"bocciardato", format:"60×120", thickness:"9 mm", listPrice:98 },
  { code:"EV010", name:"Évolution SKE 2.0 Noir", collection:"Évolution", color:"Noir", surface:"bocciardato", format:"100×100", thickness:"20 mm", listPrice:135, outdoor:true },
  { code:"EV011", name:"Évolution SKE 2.0 Gris Foncé", collection:"Évolution", color:"Gris Foncé", surface:"bocciardato", format:"100×100", thickness:"20 mm", listPrice:135, outdoor:true },
  { code:"EV012", name:"Évolution SKE 2.0 Greyge", collection:"Évolution", color:"Greyge", surface:"bocciardato", format:"100×100", thickness:"20 mm", listPrice:135, outdoor:true },
];

// ─── WOODSIDE ─────────────────────────────────────────────────────────────────
export const woodsideProducts: KronosProduct[] = [
  { code:"WD001", name:"Woodside", collection:"Woodside", format:"20×120", thickness:"9 mm", listPrice:105 },
  { code:"WD002", name:"Woodside", collection:"Woodside", format:"26×180", thickness:"9 mm", listPrice:120 },
  { code:"WD003", name:"Woodside Chalet", collection:"Woodside", format:"29×120", thickness:"9 mm", listPrice:240 },
  { code:"WD_DECK", name:"Woodside Deck", collection:"Woodside", format:"20×120", thickness:"20 mm", listPrice:130, outdoor:true },
];

// ─── LES BOIS ─────────────────────────────────────────────────────────────────
export const lesBoísProducts: KronosProduct[] = [
  { code:"LB001", name:"Les Bois Slavonia", collection:"Les Bois", color:"Slavonia", format:"20×120", thickness:"9 mm", listPrice:185 },
  { code:"LB002", name:"Les Bois Slavonia", collection:"Les Bois", color:"Slavonia", format:"26×180", thickness:"9 mm", listPrice:200 },
  { code:"LB011", name:"Les Bois Bocote", collection:"Les Bois", color:"Bocote", format:"20×120", thickness:"9 mm", listPrice:185 },
  { code:"LB021", name:"Les Bois Mogano", collection:"Les Bois", color:"Mogano", format:"20×120", thickness:"9 mm", listPrice:185 },
  { code:"LB031", name:"Les Bois Cobolo", collection:"Les Bois", color:"Cobolo", format:"80×180", thickness:"9 mm", listPrice:220 },
  { code:"LB032", name:"Les Bois Cobolo", collection:"Les Bois", color:"Cobolo", format:"20×120", thickness:"9 mm", listPrice:185 },
];

// ─── OUTDOOR GENERICO ─────────────────────────────────────────────────────────
export const outdoorGenericProducts: KronosProduct[] = [
  { code:"OUT001", name:"SKE 2.0 Outdoor", collection:"Outdoor SKE 2.0", format:"60×120", thickness:"20 mm", listPrice:95, outdoor:true },
  { code:"OUT010", name:"SKE 2.0 Outdoor", collection:"Outdoor SKE 2.0", format:"80×80", thickness:"20 mm", listPrice:87, outdoor:true },
  { code:"OUT020", name:"SKE 2.0 Outdoor", collection:"Outdoor SKE 2.0", format:"40×80", thickness:"20 mm", listPrice:72, outdoor:true },
  { code:"OUT030", name:"SKE 2.0 Outdoor Grip", collection:"Outdoor SKE 2.0", format:"60×60", thickness:"20 mm", listPrice:80, outdoor:true },
];

// ─── BLOCK ────────────────────────────────────────────────────────────────────
export const blockProducts: KronosProduct[] = [
  { code:"BL001", name:"Block Namur Antique", collection:"Block", color:"Namur", format:"20,2×20,2", thickness:"18 mm", listPrice:65, outdoor:true },
  { code:"BL051", name:"Block Namur Antique", collection:"Block", color:"Namur", format:"20,2×30,4", thickness:"18 mm", listPrice:70, outdoor:true },
  { code:"BL002", name:"Block Gent Antique", collection:"Block", color:"Gent", format:"20,2×20,2", thickness:"18 mm", listPrice:65, outdoor:true },
  { code:"BL052", name:"Block Gent Antique", collection:"Block", color:"Gent", format:"20,2×30,4", thickness:"18 mm", listPrice:70, outdoor:true },
  { code:"BL003", name:"Block Bruges Antique", collection:"Block", color:"Bruges", format:"20,2×20,2", thickness:"18 mm", listPrice:65, outdoor:true },
  { code:"BL053", name:"Block Bruges Antique", collection:"Block", color:"Bruges", format:"20,2×30,4", thickness:"18 mm", listPrice:70, outdoor:true },
  { code:"BL004", name:"Block Cotto", collection:"Block", color:"Cotto", format:"20,2×20,2", thickness:"18 mm", listPrice:65, outdoor:true },
  { code:"BL054", name:"Block Cotto", collection:"Block", color:"Cotto", format:"20,2×30,4", thickness:"18 mm", listPrice:70, outdoor:true },
  { code:"BL005", name:"Block Porfido", collection:"Block", color:"Porfido", format:"20,2×20,2", thickness:"18 mm", listPrice:65, outdoor:true },
  { code:"BL055", name:"Block Porfido", collection:"Block", color:"Porfido", format:"20,2×30,4", thickness:"18 mm", listPrice:70, outdoor:true },
  { code:"BL006", name:"Block Piasentina Flamed 1.8", collection:"Block", color:"Flamed", format:"20,2×20,2", thickness:"18 mm", listPrice:72, outdoor:true },
  { code:"BL056", name:"Block Piasentina Flamed 1.8", collection:"Block", color:"Flamed", format:"20,2×30,4", thickness:"18 mm", listPrice:77, outdoor:true },
];

// ─── EXPORT COMPLETO ──────────────────────────────────────────────────────────
export const kronosProducts: KronosProduct[] = [
  ...pierreViveProducts,
  ...materiaProducts,
  ...piasentinаProducts,
  ...nativaProducts,
  ...metalliqueProducts,
  ...leReverseProducts,
  ...carriereProducts,
  ...rocksProducts,
  ...primaMateriaProducts,
  ...talcoProducts,
  ...terraCreaProducts,
  ...essenceProducts,
  ...evolutionProducts,
  ...woodsideProducts,
  ...lesBoísProducts,
  ...outdoorGenericProducts,
  ...blockProducts,
];

export const kronosCollections: KronosCollection[] = [
  'Pierre Vive',
  'Materia',
  'Piasentina Stone',
  'Nativa',
  'Métallique',
  'Le Reverse',
  'Carrière',
  'Rocks',
  'Prima Materia',
  'Talco',
  'Terra Crea',
  'Essence',
  'Évolution',
  'Woodside',
  'Les Bois',
  'Outdoor SKE 2.0',
  'Block',
];
