// Import di un preventivo esistente (PDF / immagine / Excel / CSV)
// -> lettura AI (edge function "quote-import") -> prefill del generatore preventivi.
import { supabase } from "@/integrations/supabase/client";

export type ImportedLine = {
  sezione: "articolo" | "accessorio" | "servizio";
  codice?: string;
  descrizione: string;
  unita?: string;
  quantita: number;
  prezzo_unitario: number;
  sconto_pct?: number;
};

export type ImportedQuote = {
  numero?: string;
  data?: string;
  cliente: {
    nome: string;
    indirizzo?: string;
    citta?: string;
    telefono?: string;
    email?: string;
    partitaIva?: string;
    referente?: string;
  };
  cantiere?: string;
  iva_rate?: number;
  note?: string;
  righe: ImportedLine[];
  totale_imponibile?: number;
  totale_documento?: number;
};

export const IMPORT_STORAGE_KEY = "kalea:preventivo-import";

export function saveImportedQuote(q: ImportedQuote) {
  try { sessionStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(q)); } catch { /* quota */ }
}

export function takeImportedQuote(): ImportedQuote | null {
  try {
    const raw = sessionStorage.getItem(IMPORT_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(IMPORT_STORAGE_KEY);
    const parsed = JSON.parse(raw);
    if (!parsed?.righe) return null;
    return parsed as ImportedQuote;
  } catch { return null; }
}

const MAX_BYTES = 12 * 1024 * 1024;

const FUNCTION_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/quote-import`;

async function callQuoteImport(payload: Record<string, unknown>): Promise<ImportedQuote> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("Sessione scaduta: rientra nel CRM.");

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
    },
    body: JSON.stringify(payload),
  });

  let body: any = null;
  try { body = await res.json(); } catch { /* non JSON */ }
  if (!res.ok) throw new Error(body?.error || "Non sono riuscito a creare il preventivo.");
  if (!body?.preventivo?.righe?.length) throw new Error("Nessuna riga di preventivo trovata.");
  return body.preventivo as ImportedQuote;
}

/**
 * Riconosce una richiesta di preventivo dettata (a voce o scritta):
 * servono almeno un prezzo e un riferimento a lavorazione/quantità.
 */
export function sembraRichiestaPreventivo(text: string): boolean {
  const t = (text || "").toLowerCase();
  if (t.length < 25) return false;
  const prezzo = /(\d[\d.,]*\s*(€|euro))|((€|euro)\s*\d)/.test(t) ||
    /\b(prezzo|costo|tariffa)\b/.test(t);
  const lavorazione = /\b(fornitura|posa|battiscopa|tappetin|parquet|pavimento|levigatur|smaltiment|primer|collant|preventiv)\w*/.test(t);
  const quantita = /\b(mq|metri|ml|pz|pezzi|metro)\b/.test(t);
  const intento = /\b(preventivo|offerta|quotazione)\b/.test(t);
  const domanda = /^(quanto|quanti|quante|quando|chi|come|dove|perch|mostrami|fammi vedere|elenca|qual)/.test(t.trim());
  if (domanda && !intento) return false;
  return prezzo && lavorazione && (quantita || intento);
}

/** Crea le righe di preventivo da una richiesta dettata a voce o scritta. */
export async function parseQuoteText(text: string): Promise<ImportedQuote> {
  const clean = (text || "").trim();
  if (clean.length < 10) throw new Error("Dimmi almeno voci, quantità e prezzi.");
  return callQuoteImport({ text: clean.slice(0, 20_000), mode: "dettatura", filename: "dettatura" });
}

const isSpreadsheet = (f: File) =>
  /\.(xlsx|xls|csv)$/i.test(f.name) ||
  /spreadsheet|excel|csv/i.test(f.type);

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("Non sono riuscito a leggere il file."));
    r.readAsDataURL(file);
  });
}

/** Converte un foglio Excel/CSV in testo tabellare leggibile dall'AI. */
async function spreadsheetToText(file: File): Promise<string> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  return wb.SheetNames.map((name) => {
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[name], { blankrows: false });
    return `--- Foglio: ${name} ---\n${csv}`;
  }).join("\n\n").slice(0, 120_000);
}

/** Legge un preventivo esistente e restituisce i dati strutturati. */
export async function parseQuoteFile(file: File): Promise<ImportedQuote> {
  if (file.size === 0) throw new Error("Il file è vuoto.");
  if (file.size > MAX_BYTES) throw new Error("File troppo grande: massimo 12 MB.");

  const payload: Record<string, unknown> = { filename: file.name, mime: file.type };
  if (isSpreadsheet(file)) {
    const text = await spreadsheetToText(file);
    if (!text.trim()) throw new Error("Il foglio di calcolo sembra vuoto.");
    payload.text = text;
  } else {
    payload.file_data = await fileToDataUrl(file);
  }

  return callQuoteImport(payload);
}
