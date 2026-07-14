import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportRow = Record<string, string | number | null | undefined>;

export const exportCSV = (rows: ExportRow[], filename: string) => {
  if (!rows.length) return false;
  const headers = Object.keys(rows[0]);
  const sep = ";"; // Italian Excel default
  const escape = (v: unknown) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return /[";\n\r]/.test(s) ? `"${s}"` : s;
  };
  const csv = [
    headers.join(sep),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(sep)),
  ].join("\r\n");
  // UTF-8 BOM so Excel opens accented chars correctly
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
  return true;
};

export const exportXLSX = (rows: ExportRow[], filename: string, sheetName = "Sheet1") => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportPDF = (rows: ExportRow[], filename: string, title: string) => {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString("it-IT"), 14, 22);
  if (rows.length) {
    const headers = Object.keys(rows[0]);
    autoTable(doc, {
      startY: 28,
      head: [headers],
      body: rows.map((r) => headers.map((h) => String(r[h] ?? ""))),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 35, 20] },
    });
  }
  doc.save(`${filename}.pdf`);
};

const triggerDownload = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};
