import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "@/assets/logo-kalea-scuro.png";
import { lineNet, orderTotals, type OrderLine } from "./supplierOrders";

export interface OrderPdfData {
  order_number: string;
  order_date: string;
  supplier: { name?: string; address?: string; vat_number?: string; fiscal_code?: string; sdi_code?: string; pec?: string; email?: string; phone?: string; contact_person?: string };
  payment_terms?: string | null;
  requested_delivery_date?: string | null;
  delivery_place?: string | null;
  carrier?: string | null;
  transport?: string | null;
  reference?: string | null;
  site_label?: string | null;
  notes?: string | null;
  show_prices: boolean;
  lines: OrderLine[];
}

// Stessa palette neutra del PDF preventivo: blu-notte, grigi ardesia, bordi chiari
const OLIVE: [number, number, number] = [26, 26, 46];
const TAN: [number, number, number] = [100, 116, 139];
const INK: [number, number, number] = [26, 26, 46];
const CREAM: [number, number, number] = [248, 250, 252];
const MUTED: [number, number, number] = [71, 85, 105];
const LINE: [number, number, number] = [230, 233, 240];

const fmtDate = (d?: string | null) => (d ? new Date(d + "T00:00:00").toLocaleDateString("it-IT") : "");
const eur = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
const num = (n: number) => new Intl.NumberFormat("it-IT", { maximumFractionDigits: 3 }).format(n);

async function loadImage(src: string) {
  const img = new Image();
  await new Promise<void>((r, j) => { img.onload = () => r(); img.onerror = j; img.src = src; });
  return img;
}

export async function buildSupplierOrderPdf(o: OrderPdfData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 16;
  doc.setTextColor(...INK);

  try {
    const logo = await loadImage(logoUrl);
    const h = 16, w = (logo.naturalWidth / logo.naturalHeight) * h;
    doc.addImage(logo, "PNG", M, 9, w, h);
  } catch { /* ignore */ }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  ["Kalea Group Srl", "Desenzano del Garda (BS)", "P.IVA 04797310986 - Codice univoco T9K4ZHO", "info@kalea.space - www.kalea.space - +39 352 035 1738"]
    .forEach((t, i) => doc.text(t, M, 30 + i * 3.6));

  doc.setTextColor(...OLIVE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ORDINE FORNITORE", W - M, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(`N. ${o.order_number}`, W - M, 26, { align: "right" });
  doc.text(`del ${fmtDate(o.order_date)}`, W - M, 31, { align: "right" });
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.4);
  doc.line(M, 46, W - M, 46);

  // Supplier & delivery boxes
  let y = 56;
  const colW = (W - 2 * M - 8) / 2;
  const label = (t: string, x: number, yy: number) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...TAN);
    doc.text(t.toUpperCase(), x, yy, { charSpace: 0.4 });
  };
  label("Spett.le fornitore", M, y);
  label("Consegna", M + colW + 8, y);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...INK);
  doc.text(o.supplier.name || "-", M, y + 6);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...MUTED);
  const sup = [
    ...(o.supplier.address ? doc.splitTextToSize(o.supplier.address, colW) : []),
    [o.supplier.vat_number && `P.IVA ${o.supplier.vat_number}`, o.supplier.fiscal_code && o.supplier.fiscal_code !== o.supplier.vat_number && `C.F. ${o.supplier.fiscal_code}`].filter(Boolean).join(" - "),
    [o.supplier.sdi_code && `SDI ${o.supplier.sdi_code}`, o.supplier.pec && `PEC ${o.supplier.pec}`].filter(Boolean).join(" - "),
    o.supplier.contact_person && `Att.ne ${o.supplier.contact_person}`,
    [o.supplier.phone, o.supplier.email].filter(Boolean).join(" - "),
  ].filter(Boolean) as string[];
  sup.forEach((t, i) => doc.text(t, M, y + 11 + i * 4.3));

  const deliv: [string, string | null | undefined][] = [
    ["Luogo", o.delivery_place],
    ["Data richiesta", fmtDate(o.requested_delivery_date)],
    ["Cantiere", o.site_label],
    ["Trasporto", [o.transport, o.carrier].filter(Boolean).join(" - ")],
  ];
  let dy = y + 6;
  const dx = M + colW + 8;
  for (const [k, v] of deliv) {
    if (!v) continue;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text(k, dx, dy);
    doc.setTextColor(...INK); doc.setFontSize(9);
    const lines = doc.splitTextToSize(v, colW - 28);
    doc.text(lines, dx + 28, dy);
    dy += 4.6 * lines.length;
  }
  y = Math.max(y + 11 + sup.length * 4.3, dy) + 4;

  // Info strip
  const info: [string, string][] = [
    ["Pagamento", o.payment_terms || "Da concordare"],
    ["Riferimento", o.reference || "-"],
    ["Righe", String(o.lines.length)],
  ];
  doc.setFillColor(...CREAM); doc.setDrawColor(...LINE); doc.setLineWidth(0.3);
  doc.roundedRect(M, y, W - 2 * M, 13, 2, 2, "FD");
  const cw = (W - 2 * M) / info.length;
  info.forEach(([k, v], i) => {
    const x = M + 5 + i * cw;
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...TAN);
    doc.text(k.toUpperCase(), x, y + 5, { charSpace: 0.3 });
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...INK);
    doc.text(doc.splitTextToSize(v, cw - 8)[0], x, y + 10);
  });
  y += 20;

  // Lines table
  const head = o.show_prices
    ? [["#", "Cod. fornitore", "Descrizione", "U.M.", "Q.tà", "Prezzo", "Sc. %", "IVA", "Importo"]]
    : [["#", "Cod. fornitore", "Descrizione", "U.M.", "Q.tà"]];
  const body = o.lines.map((l, i) => {
    const base = [String(i + 1), l.supplierCode || l.code || "", l.description, l.um, num(Number(l.qty) || 0)];
    return o.show_prices
      ? [...base, l.price != null ? eur(Number(l.price)) : "", l.discount ? `${l.discount}` : "", `${l.vat ?? 22}%`, eur(lineNet(l))]
      : base;
  });
  autoTable(doc, {
    startY: y,
    head, body,
    margin: { left: M, right: M, bottom: 18, top: 16 },
    rowPageBreak: "avoid",
    showHead: "everyPage",
    didParseCell: (d: any) => { if (d.section === "head") { const cs = (d.table.settings.columnStyles || {})[d.column.index]; if (cs?.halign) d.cell.styles.halign = cs.halign; } },
    theme: "plain",
    styles: { font: "helvetica", fontSize: 9, textColor: INK, cellPadding: { top: 1.9, bottom: 1.9, left: 2, right: 2 }, valign: "middle" },
    headStyles: { fillColor: OLIVE, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: CREAM },
    bodyStyles: { lineColor: LINE, lineWidth: { bottom: 0.2 } as any },
    columnStyles: o.show_prices
      ? { 0: { cellWidth: 8, textColor: MUTED }, 1: { cellWidth: 24 }, 3: { cellWidth: 12, halign: "center" }, 4: { cellWidth: 15, halign: "right", fontStyle: "bold" }, 5: { cellWidth: 20, halign: "right" }, 6: { cellWidth: 12, halign: "right" }, 7: { cellWidth: 12, halign: "right" }, 8: { cellWidth: 24, halign: "right" } }
      : { 0: { cellWidth: 10, textColor: MUTED }, 1: { cellWidth: 32 }, 3: { cellWidth: 18, halign: "center" }, 4: { cellWidth: 22, halign: "right", fontStyle: "bold" } },
    didDrawPage: () => {
      doc.setDrawColor(...TAN); doc.setLineWidth(0.2);
    },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  const ensure = (h: number) => { if (y + h > 297 - 16) { doc.addPage(); y = 20; } };

  if (o.show_prices) {
    const t = orderTotals(o.lines);
    ensure(24);
    const x = W - M - 70;
    ([["Imponibile", t.net], ["IVA", t.vat], ["Totale", t.total]] as [string, number][]).forEach(([k, v], i) => {
      const last = i === 2;
      if (last) { doc.setFillColor(...OLIVE); doc.rect(x, y + i * 6.5 - 4.3, 70, 6.5, "F"); }
      doc.setFont("helvetica", last ? "bold" : "normal"); doc.setFontSize(9.5);
      doc.setTextColor(...(last ? ([255, 255, 255] as [number, number, number]) : INK));
      doc.text(k, x + 3, y + i * 6.5);
      doc.text(eur(v), W - M - 3, y + i * 6.5, { align: "right" });
    });
    y += 24;
  }

  if (o.notes) {
    const lines = doc.splitTextToSize(o.notes, W - 2 * M - 10);
    ensure(12 + lines.length * 4.3);
    label("Note", M, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...INK);
    doc.text(lines, M, y + 5.5);
    y += 9 + lines.length * 4.3;
  }

  ensure(32);
  y += 4;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...MUTED);
  doc.text(doc.splitTextToSize("Si prega di confermare l'ordine indicando data di consegna prevista, rispondendo a info@kalea.space. Indicare sempre il numero d'ordine in DDT e fattura.", W - 2 * M), M, y);
  y += 10;
  doc.setDrawColor(...INK); doc.setLineWidth(0.2);
  doc.line(M, y + 10, M + 70, y + 10);
  doc.line(W - M - 70, y + 10, W - M, y + 10);
  doc.setFontSize(7.5);
  doc.text("Per Kalea Group Srl", M, y + 14);
  doc.text("Timbro e firma fornitore per conferma", W - M - 70, y + 14);

  // footer
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...LINE); doc.setLineWidth(0.3);
    doc.line(M, 285, W - M, 285);
    doc.setFontSize(7); doc.setTextColor(...MUTED);
    doc.text("Kalea – Surface System®", M, 290);
    doc.text(`Ordine ${o.order_number} - Pagina ${p} di ${pages}`, W - M, 290, { align: "right" });
  }
  return doc;
}
