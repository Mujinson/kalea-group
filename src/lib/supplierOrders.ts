export interface OrderLine {
  code?: string;          // codice Kalea / prodotto
  supplierCode?: string;  // codice articolo fornitore
  description: string;
  um: string;
  qty: number;
  price?: number | null;  // prezzo acquisto unitario
  discount?: number | null; // %
  vat?: number | null;    // %
}

export const lineNet = (l: OrderLine) =>
  Math.round((Number(l.qty) || 0) * (Number(l.price) || 0) * (1 - (Number(l.discount) || 0) / 100) * 100) / 100;

export function orderTotals(lines: OrderLine[]) {
  let net = 0, vat = 0;
  for (const l of lines) {
    const n = lineNet(l);
    net += n;
    vat += n * ((l.vat ?? 22) / 100);
  }
  net = Math.round(net * 100) / 100;
  vat = Math.round(vat * 100) / 100;
  return { net, vat, total: Math.round((net + vat) * 100) / 100 };
}

/** Next number in the form ORD-YYYY-NNN given existing numbers. */
export function nextOrderNumber(existing: string[], year: number) {
  const prefix = `ORD-${year}-`;
  const max = existing.filter((n) => n.startsWith(prefix)).reduce((m, n) => Math.max(m, parseInt(n.slice(prefix.length), 10) || 0), 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

export const ORDER_STATUSES: Record<string, string> = {
  bozza: "Bozza",
  inviato: "Inviato",
  confermato: "Confermato",
  consegnato: "Consegnato",
  annullato: "Annullato",
};
