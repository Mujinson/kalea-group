import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import regularFont from '@/assets/quote/unicode.ttf.asset.json';
import boldFont from '@/assets/quote/unicode-bold.ttf.asset.json';

const W = 210, H = 297, M = 16, BOTTOM = 278;
function rgb(role: string): [number, number, number] {
  const probe = document.createElement('span');
  probe.style.color = `hsl(var(--quote-${role}))`;
  document.body.append(probe);
  const values = getComputedStyle(probe).color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  probe.remove();
  if (!values || values.length !== 3) throw new Error(`Missing quote token: ${role}`);
  return [values[0], values[1], values[2]];
}
async function base64(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Carattere PDF non disponibile');
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
async function image(url: string, trim = false) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('Immagine PDF non disponibile')); img.src = url; });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Immagine PDF non disponibile');
  ctx.drawImage(img, 0, 0);
  if (trim) {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let left = canvas.width, top = canvas.height, right = 0, bottom = 0;
    for (let yy = 0; yy < canvas.height; yy++) for (let xx = 0; xx < canvas.width; xx++) {
      const i = (yy * canvas.width + xx) * 4;
      if (pixels[i + 3] > 20 && Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) < 235) {
        left = Math.min(left, xx); right = Math.max(right, xx); top = Math.min(top, yy); bottom = Math.max(bottom, yy);
      }
    }
    if (right > left && bottom > top) {
      const crop = document.createElement('canvas'); crop.width = right - left + 1; crop.height = bottom - top + 1;
      const cropCtx = crop.getContext('2d');
      if (cropCtx) { cropCtx.drawImage(canvas, left, top, crop.width, crop.height, 0, 0, crop.width, crop.height); return { data: crop.toDataURL('image/png'), width: crop.width, height: crop.height }; }
    }
  }
  return { data: canvas.toDataURL('image/png'), width: img.naturalWidth, height: img.naturalHeight };
}

/** Presentation-only: consumes the existing rendered quote, never business data or calculations. */
export async function buildPremiumQuotePdf(root: HTMLElement): Promise<jsPDF> {
  await document.fonts.ready;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const [regular, bold] = await Promise.all([base64(regularFont.url), base64(boldFont.url)]);
  doc.addFileToVFS('quote.ttf', regular); doc.addFont('quote.ttf', 'Quote', 'normal');
  doc.addFileToVFS('quote-bold.ttf', bold); doc.addFont('quote-bold.ttf', 'Quote', 'bold');
  const ink = rgb('ink'), muted = rgb('muted'), paper = rgb('paper'), white = rgb('white'), taupe = rgb('taupe'), bronze = rgb('bronze');
  const logoElement = root.querySelector<HTMLImageElement>('[data-quote-logo]');
  if (!logoElement) throw new Error('Logo originale non disponibile');
  const logo = await image(logoElement.src, true);
  const logoH = 42 * logo.height / logo.width;
  const number = root.dataset.quoteNumber || '';
  const brand = 'PAVIMENTAZIONI · RIVESTIMENTI · DECKING · CLADDING';
  const header = () => {
    doc.setFillColor(...paper); doc.rect(0, 0, W, 30, 'F');
    doc.addImage(logo.data, 'PNG', M, 7, 42, logoH);
    doc.setDrawColor(...bronze); doc.line(65, 8, 65, 23);
    doc.setFont('Quote', 'normal'); doc.setFontSize(7); doc.setTextColor(...ink);
    doc.text('PAVIMENTAZIONI · RIVESTIMENTI', 72, 12);
    doc.text('DECKING · CLADDING', 72, 17);
    doc.text('FORNITURA E POSA', 72, 23);
  };
  let y = 40;
  const newPage = () => { doc.addPage(); header(); y = 40; };
  const ensure = (height: number) => { if (y + height > BOTTOM && y > 40) newPage(); };
  const text = (value: string, size = 9, weight: 'normal' | 'bold' = 'normal', x = M, width = W - M * 2) => {
    doc.setFont('Quote', weight); doc.setFontSize(size); doc.setTextColor(...ink);
    const lines = doc.splitTextToSize(value, width) as string[];
    const leading = size * 0.352778 * 1.48;
    for (const line of lines) {
      ensure(leading + 1);
      doc.setFont('Quote', weight); doc.setFontSize(size); doc.setTextColor(...ink);
      if (line) doc.text(line, x, y);
      y += leading;
    }
  };
  const columns = (block: HTMLElement) => {
    const children = Array.from(block.children) as HTMLElement[];
    if (children.length !== 2) return false;
    const width = (W - M * 2 - 10) / 2;
    doc.setFont('Quote', 'normal'); doc.setFontSize(8);
    const texts = children.map(el => doc.splitTextToSize(el.innerText, width) as string[]);
    const height = Math.max(...texts.map(lines => lines.length)) * 4.18 + 8;
    ensure(height);
    const start = y;
    texts.forEach((lines, index) => {
      y = start;
      text(lines.join('\n'), 8, 'normal', M + index * (width + 10), width);
    });
    y = start + height;
    return true;
  };
  const cover = root.querySelector<HTMLElement>('[data-quote-cover]');
  if (cover) {
    const photoElement = cover.querySelector<HTMLImageElement>('[data-cover-photo]');
    if (!photoElement) throw new Error('Foto copertina non disponibile');
    const photo = await image(photoElement.src);
    // Image occupies the photographic band without stretching its proportions.
    const scale = Math.max(W / photo.width, 238 / photo.height);
    doc.addImage(photo.data, 'PNG', (W - photo.width * scale) / 2, 0, photo.width * scale, photo.height * scale);
    doc.setFillColor(...white); doc.setGState(doc.GState({ opacity: 0.94 }));
    doc.rect(12, 16, 186, 40, 'F'); doc.rect(12, 72, 143, 151, 'F');
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.addImage(logo.data, 'PNG', 20, 23, 47, logoH * 47 / 42);
    doc.setFont('Quote', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...ink);
    doc.text(doc.splitTextToSize(brand, 108), 78, 28); doc.text('FORNITURA E POSA', 78, 43);
    y = 85;
    const coverTexts = Array.from(cover.querySelectorAll<HTMLElement>('[data-cover-text]'));
    // Adapt typography to unusually long client/project details, never omit them.
    let coverSize = 10;
    for (; coverSize > 7; coverSize -= 0.5) {
      doc.setFont('Quote', 'normal'); doc.setFontSize(coverSize);
      const height = coverTexts.reduce((sum, el) => sum + (el.dataset.coverText === 'title' ? 21 : (doc.splitTextToSize(el.innerText, 125) as string[]).length * coverSize * .352778 * 1.48 + 3), 0);
      if (height < 127) break;
    }
    for (const el of coverTexts) {
      const isTitle = el.dataset.coverText === 'title';
      text(el.innerText, isTitle ? 23 : coverSize, isTitle ? 'bold' : 'normal', 20, 125); y += isTitle ? 5 : 3;
    }
    const boxes = Array.from(cover.querySelectorAll<HTMLElement>('[data-cover-box]'));
    doc.setFillColor(...taupe); doc.rect(0, 239, W, 39, 'F');
    boxes.forEach((box, index) => {
      const x = M + index * 94;
      doc.setFontSize(8); doc.setFont('Quote', 'normal'); doc.setTextColor(...ink);
      const lines = doc.splitTextToSize(box.innerText, 83) as string[];
      if (lines.length > 8) return; // Complete payment plan remains in the economic detail.
      doc.text(lines, x, 246, { lineHeightFactor: 1.4 });
    });
    newPage();
  } else header();

  const blocks = Array.from(root.children) as HTMLElement[];
  for (const [blockIndex, block] of blocks.entries()) {
    if (block.hasAttribute('data-quote-cover')) continue;
    if ((blockIndex === 1 || blockIndex === 2) && columns(block)) continue;
    if (block.tagName === 'TABLE') {
      const table = block as HTMLTableElement;
      const head = Array.from(table.querySelectorAll('thead th')).map(cell => (cell as HTMLElement).innerText);
      const body = Array.from(table.querySelectorAll<HTMLTableRowElement>('tbody tr')).map(row => {
        const cells = Array.from(row.cells);
        if (cells.length === 1) return [{ content: cells[0].innerText, colSpan: 4, styles: { fillColor: taupe, fontStyle: 'bold' as const, textColor: ink } }];
        return cells.map(cell => cell.innerText);
      });
      // Do not print an orphan table header/section when the first real row must move.
      doc.setFont('Quote', 'normal'); doc.setFontSize(8.5);
      const firstRow = table.querySelector<HTMLTableRowElement>('tbody tr:has(td:nth-child(2))');
      const firstLines = firstRow ? (doc.splitTextToSize(firstRow.cells[0].innerText, 85) as string[]).length : 1;
      ensure(Math.min(220, firstLines * 4.45 + 21));
      autoTable(doc, { startY: y, head: [head], body, theme: 'plain',
        margin: { top: 40, left: M, right: M, bottom: H - BOTTOM }, showHead: 'everyPage', rowPageBreak: 'avoid',
        styles: { font: 'Quote', fontSize: 8.5, textColor: ink, cellPadding: 2.5, overflow: 'linebreak', lineColor: taupe, lineWidth: { bottom: 0.15 } },
        headStyles: { fillColor: ink, textColor: white, fontStyle: 'bold', fontSize: 7.5 },
        columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 27, halign: 'right' }, 2: { cellWidth: 30, halign: 'right' }, 3: { cellWidth: 31, halign: 'right' } },
        willDrawPage: () => { header(); },
      });
      const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
      y = (finalY ?? y) + 9;
      continue;
    }
    // Start a dedicated contract page only when it will not strand a short tail
    // of payment/notes on an almost empty preceding page.
    if (block.hasAttribute('data-quote-terms') && y > 115) newPage();
    const fullText = block.innerText;
    if (!fullText.trim()) continue;
    if (block.hasAttribute('data-quote-totals')) {
      const rows = Array.from(block.children) as HTMLElement[];
      ensure(rows.length * 7 + 10);
      doc.setFillColor(...paper); doc.rect(100, y - 4, 94, rows.length * 7 + 8, 'F');
      doc.setDrawColor(...bronze); doc.line(106, y - 4, 194, y - 4);
      rows.forEach((row, index) => {
        const cells = Array.from(row.children) as HTMLElement[];
        doc.setFont('Quote', index === rows.length - 1 ? 'bold' : 'normal'); doc.setFontSize(8); doc.setTextColor(...ink);
        if (cells[0]) doc.text(cells[0].innerText, 104, y);
        if (cells[1]) doc.text(cells[1].innerText, 190, y, { align: 'right' });
        y += 7;
      });
      y += 8; continue;
    }
    const framed = block.hasAttribute('data-quote-framed');
    if (framed) {
      doc.setFont('Quote', 'normal'); doc.setFontSize(8.5);
      const lineCount = (doc.splitTextToSize(fullText, 168) as string[]).length;
      ensure(Math.min(lineCount * 4.45 + 15, 225));
    } else ensure(18);
    doc.setDrawColor(...bronze); doc.setLineWidth(0.3); doc.line(M, y - 4, W - M, y - 4);
    if (block.hasAttribute('data-quote-privacy')) {
      const title = block.firstElementChild as HTMLElement | null;
      if (title) { text(title.innerText, 9, 'bold'); y += 3; }
      for (const row of Array.from(block.children).slice(1) as HTMLElement[]) {
        ensure(15); doc.setDrawColor(...ink); doc.rect(M, y - 3, 3, 3);
        text(row.innerText, 8.5, 'normal', M + 6, W - M * 2 - 6); y += 3;
      }
    } else if (block.hasAttribute('data-quote-signatures')) {
      const parts = Array.from(block.children) as HTMLElement[];
      if (parts[0]) text(parts[0].innerText, 8.5);
      y += 3;
      if (parts[1]) text(parts[1].innerText, 8.5);
      ensure(28); y += 13;
      doc.line(M, y, 90, y); doc.line(120, y, W - M, y); y += 5;
      const labels = parts[2] ? Array.from(parts[2].children) as HTMLElement[] : [];
      doc.setFont('Quote', 'normal'); doc.setFontSize(8); doc.setTextColor(...ink);
      if (labels[0]) doc.text(labels[0].innerText, M, y);
      if (labels[1]) doc.text(labels[1].innerText, 120, y);
      y += 10;
      if (parts[3]) text(parts[3].innerText, 8.5);
    } else if (block.hasAttribute('data-quote-terms')) {
      const title = block.firstElementChild as HTMLElement | null;
      if (title) { text(title.innerText, 13, 'bold'); y += 5; }
      const clauses = block.querySelectorAll<HTMLElement>('[data-pdf-block]');
      for (const clause of Array.from(clauses)) { text(clause.innerText, 8.5); y += 4; }
    } else {
      // Inline labels and values remain on the same line rather than each span consuming a line.
      const lines = block.hasAttribute('data-pdf-block') && !framed
        ? (Array.from(block.children) as HTMLElement[]).flatMap(child => {
          if (getComputedStyle(child).display === 'grid') return (Array.from(child.children) as HTMLElement[]).map(el => el.innerText.replace(/\n/g, ' '));
          if (child.children.length > 0 && getComputedStyle(child).display === 'flex') return [child.innerText.replace(/\n/g, ' ')];
          return child.innerText.split('\n');
        })
        : fullText.split('\n');
      for (const line of lines) {
        if (line.includes('________________')) {
          ensure(16); y += 5;
        }
        text(line, framed ? 8.5 : 9);
      }
    }
    y += 9;
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page); doc.setFont('Quote', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...muted);
    doc.setDrawColor(...bronze); doc.line(M, 283, W - M, 283);
    doc.text('Kalea Group Srl · info@kalea.space · kalea.space · P.IVA 04797310986', M, 288);
    doc.text(`${number} · ${page}/${pages}`, W - M, 293, { align: 'right' });
  }
  return doc;
}