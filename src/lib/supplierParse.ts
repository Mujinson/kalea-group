export interface BankAccount { bank?: string; iban: string }
export interface SupplierFields {
  name?: string; vat_number?: string; fiscal_code?: string; address?: string; postal_code?: string;
  city?: string; province?: string; phone?: string; email?: string; pec?: string; sdi_code?: string;
  website?: string; bank_accounts?: BankAccount[];
}

/** Estrae i dati di un fornitore da un testo incollato (intestazione documento, firma email, visura). */
export function parseSupplierText(text: string): SupplierFields {
  const out: SupplierFields = {};
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const flat = lines.join("\n");

  const ibans: BankAccount[] = [];
  for (const l of lines) {
    const m = l.replace(/\s+/g, " ").match(/IT\s?\d{2}\s?[A-Z](?:\s?[0-9A-Z]){22}/i);
    if (m) {
      const iban = m[0].replace(/\s+/g, "").toUpperCase();
      const bank = l.slice(0, m.index).replace(/[:\-–|]+$/, "").trim() || undefined;
      if (!ibans.some((b) => b.iban === iban)) ibans.push({ bank, iban });
    }
  }
  if (ibans.length) out.bank_accounts = ibans;

  const piva = flat.match(/P\.?\s?IVA(?:\s?\/\s?C\.?F\.?)?\s*[:.]?\s*(?:IT)?\s*(\d{11})/i);
  if (piva) { out.vat_number = piva[1]; if (/C\.?F/i.test(piva[0])) out.fiscal_code = piva[1]; }
  const cf = flat.match(/(?:C\.?F\.?|Codice fiscale)\s*[:.]?\s*([A-Z0-9]{11,16})/i);
  if (cf && !out.fiscal_code) out.fiscal_code = cf[1].toUpperCase();

  const emails = flat.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || [];
  for (const e of emails) {
    if (/pec|legalmail|postacert/i.test(e)) out.pec ??= e; else out.email ??= e;
  }
  const tel = flat.match(/(?:Tel\.?|Telefono|Phone)\s*[:.]?\s*(\+?[\d\s/.-]{6,})/i);
  if (tel) out.phone = tel[1].trim().replace(/\//g, " ");
  const sdi = flat.match(/(?:SDI|Codice (?:univoco|destinatario))\s*[:.]?\s*([A-Z0-9]{7})\b/i);
  if (sdi) out.sdi_code = sdi[1].toUpperCase();
  const web = flat.match(/\b(?:https?:\/\/)?www\.[\w-]+\.[a-z.]{2,}/i);
  if (web) out.website = web[0];

  const addr = lines.find((l) => /^(via|viale|v\.le|piazza|p\.za|corso|c\.so|strada|loc\.|località|largo)\b/i.test(l));
  if (addr) {
    const m = addr.match(/^(.*?)(?:\s*[-,]\s*|\s+)(?:(\d{5})\s+)?([A-Za-zÀ-ÿ' ]+?)\s*\(([A-Z]{2})\)\s*$/);
    if (m) {
      out.address = m[1].trim(); if (m[2]) out.postal_code = m[2];
      out.city = m[3].trim().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w.toLowerCase());
      out.province = m[4];
    } else out.address = addr;
  }
  const name = lines.find((l) => /\b(s\.?r\.?l|s\.?p\.?a|s\.?n\.?c|s\.?a\.?s|soc\.?\s?coop|coop|gmbh|ltd)\b\.?/i.test(l) && !/banca|cassa|credito/i.test(l));
  if (name) out.name = name;
  return out;
}

export const formatIban = (iban: string) => iban.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
