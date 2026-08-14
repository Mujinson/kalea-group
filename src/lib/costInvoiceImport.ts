// Fatture passive (costi fornitori): lettura AI del PDF, salvataggio dell'allegato
// e registrazione nel ciclo passivo del CRM.
import { supabase } from "@/integrations/supabase/client";
import { COST_CATEGORIES } from "@/lib/finance";

export const SUPPLIER_INVOICE_BUCKET = "supplier-invoices";

export type ParsedCostInvoice = {
  fornitore: { nome: string; partitaIva?: string; indirizzo?: string; email?: string; telefono?: string };
  numero_fattura: string;
  data_fattura?: string;
  data_scadenza?: string;
  imponibile: number;
  aliquota_iva?: number;
  importo_iva?: number;
  totale: number;
  reverse_charge?: boolean;
  metodo_pagamento?: string;
  categoria?: string;
  descrizione?: string;
  gia_pagata?: boolean;
};

export type SavedCostInvoice = {
  id: string;
  supplier_name: string;
  invoice_number: string;
  total: number;
  subtotal: number;
  status: string;
  attachment_url: string | null;
};

const MAX_BYTES = 15 * 1024 * 1024;
const FUNCTION_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/cost-invoice-import`;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("Non sono riuscito a leggere il file."));
    r.readAsDataURL(file);
  });
}

/** Riconosce l'intenzione "questi sono costi / fatture fornitore". */
export function sembraRichiestaCosto(text: string): boolean {
  const t = (text || "").toLowerCase();
  return /\b(cost[oi]|fattur\w+\s+(passiv\w+|fornitor\w+|di costo)|fornitor\w+|da pagare|ciclo passivo)\b/.test(t);
}

const isoDate = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

function mapCategoria(v?: string): string | null {
  if (!v) return null;
  const clean = v.toLowerCase().trim().replace(/\s+/g, "_");
  const exact = COST_CATEGORIES.find((c) => c.value === clean);
  if (exact) return exact.value;
  if (/material|acquist|merc|prodott/.test(clean)) return "materiali";
  if (/trasport|spedizi|corrier/.test(clean)) return "trasporti";
  if (/consulen|commercialist|studio/.test(clean)) return "consulenze";
  if (/utenz|luce|gas|telefon|internet/.test(clean)) return "utenze";
  if (/auto|veicol|carburant/.test(clean)) return "automezzi";
  if (/tass|contribut|inps|f24/.test(clean)) return "contributi_tasse";
  return "altri";
}

/** Legge la fattura con l'AI. */
export async function parseCostInvoiceFile(file: File): Promise<ParsedCostInvoice> {
  if (file.size === 0) throw new Error("Il file è vuoto.");
  if (file.size > MAX_BYTES) throw new Error("File troppo grande: massimo 15 MB.");

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
    body: JSON.stringify({ filename: file.name, mime: file.type, file_data: await fileToDataUrl(file) }),
  });

  let body: any = null;
  try { body = await res.json(); } catch { /* non JSON */ }
  if (!res.ok) throw new Error(body?.error || "Non sono riuscito a leggere la fattura.");
  if (!body?.fattura) throw new Error("Nessun dato di fattura trovato nel documento.");
  return body.fattura as ParsedCostInvoice;
}

/** Trova il fornitore per nome/P.IVA o lo crea. */
async function findOrCreateSupplier(f: ParsedCostInvoice["fornitore"]): Promise<string> {
  const nome = f.nome.trim();
  const { data: existing } = await supabase
    .from("suppliers")
    .select("id, name, vat_number")
    .or(`name.ilike.${nome.replace(/[,%]/g, " ")},vat_number.eq.${f.partitaIva || "___"}`)
    .limit(5);
  const match = (existing || []).find(
    (s: any) => (f.partitaIva && s.vat_number === f.partitaIva) || s.name?.toLowerCase() === nome.toLowerCase(),
  );
  if (match) return match.id;

  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      name: nome,
      vat_number: f.partitaIva || null,
      address: f.indirizzo || null,
      email: f.email || null,
      phone: f.telefono || null,
    })
    .select("id")
    .single();
  if (error) throw new Error(`Non sono riuscito a creare il fornitore: ${error.message}`);
  return data.id;
}

/** Carica il PDF nell'archivio privato e restituisce il percorso salvato. */
async function uploadAttachment(file: File, supplierId: string, numero: string): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "pdf").toLowerCase().slice(0, 5);
  const safe = numero.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 40) || "fattura";
  const path = `${supplierId}/${Date.now()}-${safe}.${ext}`;
  const { error } = await supabase.storage
    .from(SUPPLIER_INVOICE_BUCKET)
    .upload(path, file, { contentType: file.type || "application/pdf", upsert: false });
  if (error) {
    console.error("upload allegato fattura", error);
    return null;
  }
  return path;
}

/** Link temporaneo per aprire l'allegato (bucket privato). */
export async function getInvoiceAttachmentUrl(pathOrUrl: string): Promise<string> {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  const { data, error } = await supabase.storage
    .from(SUPPLIER_INVOICE_BUCKET)
    .createSignedUrl(pathOrUrl, 60 * 10);
  if (error || !data?.signedUrl) throw new Error("Allegato non disponibile.");
  return data.signedUrl;
}

/** Legge la fattura, salva l'allegato e la registra fra le fatture di costo. */
export async function importCostInvoice(file: File): Promise<SavedCostInvoice> {
  const f = await parseCostInvoiceFile(file);

  const supplierId = await findOrCreateSupplier(f.fornitore);
  const attachment = await uploadAttachment(file, supplierId, f.numero_fattura);

  const subtotal = Number(f.imponibile) || 0;
  const total = Number(f.totale) || subtotal;
  const vatAmount = Number(f.importo_iva ?? Math.max(0, total - subtotal)) || 0;
  const vatRate = Number(f.aliquota_iva ?? (subtotal > 0 ? Math.round((vatAmount / subtotal) * 100) : 0)) || 0;

  const { data: dup } = await supabase
    .from("supplier_invoices")
    .select("id")
    .eq("supplier_id", supplierId)
    .eq("invoice_number", f.numero_fattura)
    .maybeSingle();
  if (dup) throw new Error(`La fattura ${f.numero_fattura} di ${f.fornitore.nome} è già registrata.`);

  const { data, error } = await supabase
    .from("supplier_invoices")
    .insert({
      supplier_id: supplierId,
      invoice_number: f.numero_fattura,
      invoice_date: isoDate(f.data_fattura) || new Date().toISOString().split("T")[0],
      due_date: isoDate(f.data_scadenza),
      subtotal,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total,
      is_reverse_charge: !!f.reverse_charge,
      category: mapCategoria(f.categoria),
      payment_method: f.metodo_pagamento || null,
      attachment_url: attachment,
      notes: f.descrizione || null,
      status: "da_pagare",
      paid_amount: 0,
    })
    .select("id, invoice_number, total, subtotal, status, attachment_url")
    .single();
  if (error) throw new Error(`Non sono riuscito a registrare la fattura: ${error.message}`);

  return { ...(data as any), supplier_name: f.fornitore.nome } as SavedCostInvoice;
}
