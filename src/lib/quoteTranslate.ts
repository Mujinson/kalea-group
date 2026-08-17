// Traduzione completa del preventivo Kalēa: etichette fisse (statiche)
// + voci libere (descrizioni, note, termini) tradotte via edge function AI.
import { supabase } from "@/integrations/supabase/client";

export type QuoteLang = "IT" | "EN" | "DE" | "FR" | "RO";

export const QUOTE_LANGS: QuoteLang[] = ["IT", "EN", "DE", "FR", "RO"];

type LabelKey =
  | "tonalita"
  | "articoli"
  | "accessori"
  | "servizi"
  | "cond_fornitura"
  | "cond_generiche"
  | "metodo_trasporto"
  | "tempi_consegna"
  | "tipo_pagamento"
  | "aliquota_iva"
  | "cond_pagamento"
  | "privacy_titolo"
  | "luogo_data";

export const PDF_LABELS: Record<QuoteLang, Record<LabelKey, string>> = {
  IT: {
    tonalita: "Tonalità",
    articoli: "Articoli",
    accessori: "Accessori",
    servizi: "Servizi",
    cond_fornitura: "Condizioni di fornitura",
    cond_generiche: "Condizioni",
    metodo_trasporto: "Metodo di trasporto",
    tempi_consegna: "Tempi di consegna",
    tipo_pagamento: "Tipo di pagamento",
    aliquota_iva: "Aliquota IVA",
    cond_pagamento: "Condizioni di pagamento",
    privacy_titolo: "PRIVACY — D.Lgs. 196/2003 e Reg. UE 2016/679",
    luogo_data: "Luogo e data",
  },
  EN: {
    tonalita: "Shades",
    articoli: "Items",
    accessori: "Accessories",
    servizi: "Services",
    cond_fornitura: "Supply conditions",
    cond_generiche: "Conditions",
    metodo_trasporto: "Shipping method",
    tempi_consegna: "Delivery time",
    tipo_pagamento: "Payment method",
    aliquota_iva: "VAT rate",
    cond_pagamento: "Payment terms",
    privacy_titolo: "PRIVACY — Italian Legislative Decree 196/2003 and EU Reg. 2016/679",
    luogo_data: "Place and date",
  },
  DE: {
    tonalita: "Farbtöne",
    articoli: "Artikel",
    accessori: "Zubehör",
    servizi: "Dienstleistungen",
    cond_fornitura: "Lieferbedingungen",
    cond_generiche: "Bedingungen",
    metodo_trasporto: "Versandart",
    tempi_consegna: "Lieferzeit",
    tipo_pagamento: "Zahlungsart",
    aliquota_iva: "MwSt.-Satz",
    cond_pagamento: "Zahlungsbedingungen",
    privacy_titolo: "DATENSCHUTZ — it. GvD 196/2003 und EU-VO 2016/679",
    luogo_data: "Ort und Datum",
  },
  FR: {
    tonalita: "Teintes",
    articoli: "Articles",
    accessori: "Accessoires",
    servizi: "Services",
    cond_fornitura: "Conditions de fourniture",
    cond_generiche: "Conditions",
    metodo_trasporto: "Mode de transport",
    tempi_consegna: "Délais de livraison",
    tipo_pagamento: "Mode de paiement",
    aliquota_iva: "Taux de TVA",
    cond_pagamento: "Conditions de paiement",
    privacy_titolo: "CONFIDENTIALITÉ — D.Lgs. it. 196/2003 et Règl. UE 2016/679",
    luogo_data: "Lieu et date",
  },
  RO: {
    tonalita: "Nuanțe",
    articoli: "Articole",
    accessori: "Accesorii",
    servizi: "Servicii",
    cond_fornitura: "Condiții de furnizare",
    cond_generiche: "Condiții",
    metodo_trasporto: "Metodă de transport",
    tempi_consegna: "Termen de livrare",
    tipo_pagamento: "Modalitate de plată",
    aliquota_iva: "Cotă TVA",
    cond_pagamento: "Condiții de plată",
    privacy_titolo: "CONFIDENȚIALITATE — D.Lgs. it. 196/2003 și Reg. UE 2016/679",
    luogo_data: "Loc și dată",
  },
};

type ValueMap = Record<string, Partial<Record<QuoteLang, string>>>;

const TRASPORTO: ValueMap = {
  "Trasporto a cura Kalēa": { EN: "Shipping by Kalēa", DE: "Transport durch Kalēa", FR: "Transport assuré par Kalēa", RO: "Transport asigurat de Kalēa" },
  "Corriere espresso": { EN: "Express courier", DE: "Expresskurier", FR: "Coursier express", RO: "Curier expres" },
  "Ritiro in sede": { EN: "Pick-up at our premises", DE: "Abholung im Werk", FR: "Retrait sur place", RO: "Ridicare de la sediu" },
  "Franco cantiere": { EN: "Delivered to site", DE: "Frei Baustelle", FR: "Franco chantier", RO: "Franco șantier" },
  "Franco fabbrica": { EN: "Ex works", DE: "Ab Werk", FR: "Départ usine", RO: "Franco fabrică" },
  "A cura del cliente": { EN: "Arranged by the client", DE: "Durch den Kunden", FR: "À la charge du client", RO: "În sarcina clientului" },
};

const PAGAMENTO: ValueMap = {
  "Bonifico bancario": { EN: "Bank transfer", DE: "Banküberweisung", FR: "Virement bancaire", RO: "Transfer bancar" },
  "Contanti": { EN: "Cash", DE: "Barzahlung", FR: "Espèces", RO: "Numerar" },
  "Assegno": { EN: "Cheque", DE: "Scheck", FR: "Chèque", RO: "Cec" },
  "Carta di credito": { EN: "Credit card", DE: "Kreditkarte", FR: "Carte de crédit", RO: "Card de credit" },
  "Rateale": { EN: "Instalments", DE: "Ratenzahlung", FR: "Paiement échelonné", RO: "În rate" },
  "Ri.Ba.": {},
  "Anticipato": { EN: "Payment in advance", DE: "Vorauszahlung", FR: "Paiement anticipé", RO: "Plată în avans" },
};

const RATE: ValueMap = {
  "Acconto": { EN: "Deposit", DE: "Anzahlung", FR: "Acompte", RO: "Avans" },
  "A metà lavori": { EN: "Mid-works instalment", DE: "Bei Halbfertigstellung", FR: "À mi-chantier", RO: "La jumătatea lucrărilor" },
  "Saldo finale": { EN: "Final balance", DE: "Restzahlung", FR: "Solde final", RO: "Plata finală" },
  "Saldo": { EN: "Balance", DE: "Restzahlung", FR: "Solde", RO: "Sold" },
};

const UNITA: ValueMap = {
  "a corpo": { EN: "lump sum", DE: "pauschal", FR: "forfait", RO: "la corp" },
  "mq": { EN: "sqm", DE: "m²", FR: "m²", RO: "mp" },
  "ml": { EN: "lm", DE: "lfm", FR: "ml", RO: "ml" },
  "pz": { EN: "pcs", DE: "Stk.", FR: "pcs", RO: "buc" },
  "h": { EN: "h", DE: "Std.", FR: "h", RO: "h" },
  "kg": {},
};

const COMPLESSITA: ValueMap = {
  "Semplice": { EN: "Simple", DE: "Einfach", FR: "Simple", RO: "Simplă" },
  "Media": { EN: "Medium", DE: "Mittel", FR: "Moyenne", RO: "Medie" },
  "Complessa": { EN: "Complex", DE: "Komplex", FR: "Complexe", RO: "Complexă" },
};

const pick = (map: ValueMap, lang: QuoteLang, value: string) => {
  if (!value) return value;
  if (lang === "IT") return value;
  const entry = map[value.trim()];
  return entry?.[lang] ?? value;
};

export const trTrasporto = (lang: QuoteLang, v: string) => pick(TRASPORTO, lang, v);
export const trPagamento = (lang: QuoteLang, v: string) => pick(PAGAMENTO, lang, v);
export const trRata = (lang: QuoteLang, v: string) => pick(RATE, lang, v);
export const trUnita = (lang: QuoteLang, v: string) => pick(UNITA, lang, v);
export const trComplessita = (lang: QuoteLang, v: string) => pick(COMPLESSITA, lang, v);

/** Traduce un blocco di testi liberi (descrizioni, note, termini) nella lingua scelta. */
export async function translateQuoteTexts(lang: QuoteLang, items: string[]): Promise<string[]> {
  const clean = items.map((s) => (s ?? "").toString());
  if (lang === "IT" || clean.every((s) => !s.trim())) return clean;

  const idx: number[] = [];
  const payload: string[] = [];
  clean.forEach((s, i) => {
    if (s.trim()) { idx.push(i); payload.push(s); }
  });

  const { data, error } = await supabase.functions.invoke("quote-translate", {
    body: { lang, items: payload },
  });
  if (error) throw new Error(error.message || "Traduzione non riuscita.");
  if ((data as any)?.error) throw new Error((data as any).error);

  const out = Array.isArray((data as any)?.items) ? (data as any).items as string[] : [];
  const result = [...clean];
  idx.forEach((target, k) => {
    const v = out[k];
    if (typeof v === "string" && v.trim()) result[target] = v;
  });
  return result;
}
