import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import regularFont from '@/assets/quote/unicode.ttf.asset.json';
import boldFont from '@/assets/quote/unicode-bold.ttf.asset.json';

const W = 210, H = 297, M = 16, TOP = 22, BOTTOM = 278;
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
async function image(url: string, trim = false, removeWhiteBackground = false) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('Immagine PDF non disponibile')); img.src = url; });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Immagine PDF non disponibile');
  ctx.drawImage(img, 0, 0);
  if (removeWhiteBackground) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
      const lightestChannel = Math.min(pixels[i], pixels[i + 1], pixels[i + 2]);
      if (lightestChannel >= 242) pixels[i + 3] = 0;
      else if (lightestChannel > 225) pixels[i + 3] = Math.round(pixels[i + 3] * (242 - lightestChannel) / 17);
    }
    ctx.putImageData(imageData, 0, 0);
  }
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
  let y = TOP;
  const newPage = () => { doc.addPage(); y = TOP; };
  const ensure = (height: number) => { if (y + height > BOTTOM && y > TOP) newPage(); };
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
  const cover = root.querySelector<HTMLElement>('[data-quote-cover]');
  if (cover) {
    const photoElement = cover.querySelector<HTMLImageElement>('[data-cover-photo]');
    if (!photoElement) throw new Error('Foto copertina non disponibile');
    const photo = await image(photoElement.src);
    // Reference coordinates are normalized from the supplied 768 × 1086 A4 artwork.
    const scale = Math.max(W / photo.width, H / photo.height);
    doc.addImage(photo.data, 'PNG', (W - photo.width * scale) / 2, 0, photo.width * scale, photo.height * scale);
    doc.setFillColor(...white); doc.setGState(doc.GState({ opacity: 0.89 }));
    doc.roundedRect(8.2, 69.5, 110, 133.7, 4, 4, 'F');
    doc.setGState(doc.GState({ opacity: 1 }));
    const coverLogo = await image(logoElement.src, true, true);
    doc.addImage(coverLogo.data, 'PNG', 21, 13, 52, logoH * 52 / 42);
    doc.setDrawColor(...bronze); doc.setLineWidth(0.5); doc.line(82.4, 11.5, 82.4, 38.5);
    doc.setFont('Quote', 'normal'); doc.setFontSize(10); doc.setTextColor(...ink);
    doc.text(['PAVIMENTAZIONI', 'RIVESTIMENTI', 'DECKING', 'CLADDING'], 93, 14.5, { lineHeightFactor: 1.45 });
    doc.text('FORNITURA E POSA', 93, 38.5); doc.setLineWidth(1); doc.line(93, 43, 108, 43);
    doc.setFontSize(12); doc.setTextColor(...white); doc.text(['Innovate', 'Living', 'Nature'], 179, 18, { lineHeightFactor: 1.2 });
    const value = (field: string) => cover.querySelector<HTMLElement>(`[data-cover-text="${field}"]`)?.innerText || '';
    const print = (v: string, x: number, yy: number, size: number, width: number, weight: 'normal' | 'bold' = 'normal') => {
      doc.setFont('Quote', weight); doc.setFontSize(size); doc.setTextColor(...ink);
      const lines = doc.splitTextToSize(v, width) as string[];
      doc.text(lines, x, yy, { lineHeightFactor: 1.3 });
      return lines.length * size * .352778 * 1.3;
    };
    print(value('title'), 16.5, 84, 22, 94);
    print(cover.querySelector<HTMLElement>('[data-cover-subtitle]')?.innerText || '', 16.5, 92, 10.5, 96);
    doc.setDrawColor(...bronze); doc.setLineWidth(1); doc.line(16.5, 97, 32, 97);
    doc.setFillColor(...ink); doc.lines([[69,0],[-5,10.5],[-64,0],[0,-10.5]],16.5,102.5,[1,1],'F',true);
    doc.setFillColor(...bronze); doc.lines([[2,0],[-5,10.5],[-2,0],[5,-10.5]],86.5,102.5,[1,1],'F',true);
    doc.setFont('Quote','bold'); doc.setFontSize(13); doc.setTextColor(...white); doc.text(value('number'),20.5,109.6);
    const calendar = (x: number, yy: number) => {
      doc.setDrawColor(...bronze); doc.setLineWidth(.45); doc.roundedRect(x,yy,4.2,4.2,.4,.4,'S');
      doc.line(x,yy+1.3,x+4.2,yy+1.3); doc.line(x+1,yy-.5,x+1,yy+.6); doc.line(x+3.2,yy-.5,x+3.2,yy+.6);
    };
    value('dates').split('\n').forEach((line,index) => { calendar(17,118+index*7.2); print(line,28.5,122+index*7.2,10,80); });
    let detailY = 140;
    for (const field of ['client','project']) {
      const lines = value(field).split('\n'); if (!value(field)) continue;
      const start = detailY;
      doc.setDrawColor(...bronze); doc.setLineWidth(.6);
      if (field === 'client') {
        doc.circle(23, detailY-3, 1.6,'S'); doc.roundedRect(20,detailY-.2,6,2.5,1,1,'S');
      } else {
        for (let i=0;i<3;i++) doc.lines([[4,-2],[4,2],[-4,2],[-4,-2]],20,detailY-3+i*1.5,[1,1],'S',true);
      }
      detailY += print(lines[0],33.5,detailY,10,77,'bold') + 2;
      detailY += print(lines.slice(1).join('\n'),33.5,detailY,9,77) + 7;
      doc.line(16.5,start-5,16.5,detailY-9);
    }
    const boxes = Array.from(cover.querySelectorAll<HTMLElement>('[data-cover-box]'));
    doc.setFillColor(...ink); doc.lines([[108,0],[-19,40],[-89,0],[0,-40]],0,213,[1,1],'F',true);
    doc.setFillColor(...paper); doc.lines([[97,0],[-20,40],[-96,0],[19,-40]],108,213,[1,1],'F',true);
    doc.setDrawColor(...white); doc.setLineWidth(.8); doc.line(0,213,206,213); doc.line(108,213,89,253);
    doc.setDrawColor(...bronze); doc.setLineWidth(1.2); doc.line(206,214,186,253);
    boxes.forEach((box, index) => {
      const x = index === 0 ? 18 : 128;
      doc.setFontSize(10); doc.setFont('Quote', 'normal'); doc.setTextColor(...(index === 0 ? white : ink));
      const title = box.firstElementChild?.textContent || '';
      doc.text(doc.splitTextToSize(title.toLocaleUpperCase(),65), x + 16, 222, { lineHeightFactor: 1.15 });
      calendar(x,220);
      doc.setTextColor(...(index === 0 ? white : ink)); doc.setFontSize(9);
      const contents = (Array.from(box.children).slice(1) as HTMLElement[]).map(el=>el.innerText).join('\n');
      const lines = doc.splitTextToSize(contents, index === 0 ? 76 : 66) as string[];
      doc.text(lines, x, 237, { lineHeightFactor: 1.4 });
    });
    doc.setFillColor(...paper); doc.setGState(doc.GState({opacity:.94})); doc.rect(0,253,W,44,'F'); doc.setGState(doc.GState({opacity:1}));
    doc.setDrawColor(...bronze); doc.setLineWidth(.5); doc.line(13.5,265,13.5,284);
    print('Kalea Group Srl',21,268,10,120,'bold');
    print('Desenzano del Garda (BS)\ninfo@kalea.space  |  kalea.space\nP.IVA 04797310986',21,274,9,120);
    newPage();
  }

  const blocks = Array.from(root.children) as HTMLElement[];
  for (const block of blocks) {
    if (block.hasAttribute('data-quote-cover')) continue;
    if (block.hasAttribute('data-quote-header')) {
      const company = block.children[0] as HTMLElement | undefined;
      const details = block.children[1] as HTMLElement | undefined;
      if (!company || !details) continue;
      const start = y;
      const companyWidth = 68;
      const centerX = M + companyWidth / 2;
      const headerLogoWidth = 42;
      doc.addImage(logo.data, 'PNG', centerX - headerLogoWidth / 2, start - 3, headerLogoWidth, logoH);
      let companyY = start + logoH + 5;
      const companyRows = (Array.from(company.children) as HTMLElement[]).filter(el => el.tagName !== 'IMG');
      companyRows.forEach((row, index) => {
        const size = index === 0 ? 9 : 8;
        doc.setFont('Quote', 'normal'); doc.setFontSize(size);
        doc.setTextColor(...(index === 0 ? bronze : muted));
        const lines = doc.splitTextToSize(row.innerText.trim(), companyWidth) as string[];
        doc.text(lines, centerX, companyY, { align: 'center', lineHeightFactor: 1.4 });
        companyY += lines.length * size * .352778 * 1.4 + .6;
      });
      let detailY = start;
      const detailWidth = 90;
      (Array.from(details.children) as HTMLElement[]).forEach((row, index) => {
        if (!row.innerText.trim()) return;
        if (index === 0) {
          doc.setFont('Quote', 'bold'); doc.setFontSize(17); doc.setTextColor(...ink);
          const lines = doc.splitTextToSize(row.innerText.trim(), detailWidth) as string[];
          doc.text(lines, W - M, detailY, { align: 'right', lineHeightFactor: 1.3 });
          detailY += lines.length * 7.8 + 2;
        } else {
          const strong = row.querySelector('strong');
          const value = strong?.innerText.trim() || '';
          const label = value ? row.innerText.slice(0, row.innerText.lastIndexOf(value)).trimEnd() + ' ' : row.innerText.trim();
          doc.setFontSize(9); doc.setFont('Quote', 'bold');
          const valueWidth = doc.getTextWidth(value);
          doc.setFont('Quote', 'normal');
          if (doc.getTextWidth(label) + valueWidth <= detailWidth) {
            doc.setTextColor(...muted); doc.text(label, W - M - valueWidth, detailY, { align: 'right' });
            doc.setFont('Quote', 'bold'); doc.setTextColor(...ink); doc.text(value, W - M, detailY, { align: 'right' });
            detailY += 5.5;
          } else {
            const lines = doc.splitTextToSize(row.innerText.trim(), detailWidth) as string[];
            doc.setTextColor(...ink); doc.text(lines, W - M, detailY, { align: 'right', lineHeightFactor: 1.4 });
            detailY += lines.length * 4.5 + 1;
          }
        }
      });
      y = Math.max(companyY, detailY) + 5;
      doc.setDrawColor(...ink); doc.setLineWidth(.5); doc.line(M, y, W - M, y);
      y += 12;
      continue;
    }
    if (block.hasAttribute('data-quote-customer')) {
      const width = (W - M * 2 - 10) / 2;
      const start = y;
      let end = start;
      (Array.from(block.children) as HTMLElement[]).forEach((column, index) => {
        y = start;
        const x = M + index * (width + 10);
        (Array.from(column.children) as HTMLElement[]).forEach((row, rowIndex) => {
          const value = row.innerText.trim();
          if (!value) return;
          const heading = rowIndex === 0;
          const primary = rowIndex === 1;
          const size = heading ? 8 : 9;
          const weight = heading || primary ? 'bold' : 'normal';
          doc.setFont('Quote', weight); doc.setFontSize(size);
          const lines = doc.splitTextToSize(heading ? value.toLocaleUpperCase() : value, width) as string[];
          for (const line of lines) {
            ensure(5);
            doc.setFont('Quote', weight); doc.setFontSize(size); doc.setTextColor(...(primary ? ink : muted));
            doc.text(line, x, y);
            y += 4.8;
          }
          if (heading) y += 3;
        });
        end = Math.max(end, y);
      });
      y = end + 9;
      continue;
    }
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
        margin: { top: TOP, left: M, right: M, bottom: H - BOTTOM }, showHead: 'everyPage', rowPageBreak: 'avoid',
        styles: { font: 'Quote', fontSize: 8.5, textColor: ink, cellPadding: 2.5, overflow: 'linebreak', lineColor: taupe, lineWidth: { bottom: 0.15 } },
        headStyles: { fillColor: ink, textColor: white, fontStyle: 'bold', fontSize: 7.5 },
        columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 27, halign: 'right' }, 2: { cellWidth: 30, halign: 'right' }, 3: { cellWidth: 31, halign: 'right' } },
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
      doc.setDrawColor(...bronze); doc.line(100, y - 4, 194, y - 4);
      rows.forEach((row, index) => {
        const cells = Array.from(row.children) as HTMLElement[];
        doc.setFont('Quote', index === rows.length - 1 ? 'bold' : 'normal'); doc.setFontSize(8); doc.setTextColor(...ink);
        if (cells[0]) doc.text(cells[0].innerText, 104, y);
        if (cells[1]) doc.text(cells[1].innerText, 190, y, { align: 'right' });
        y += 7;
      });
      y += 12; continue;
    }
    if (block.hasAttribute('data-quote-supply')) {
      const titleEl = block.firstElementChild as HTMLElement | null;
      const gridEl = block.children[1] as HTMLElement | undefined;
      const extraEl = block.children[2] as HTMLElement | undefined;
      const items = gridEl ? (Array.from(gridEl.children) as HTMLElement[]) : [];
      const rowCount = Math.ceil(items.length / 2);
      const extraLines = extraEl?.innerText.trim()
        ? (doc.setFont('Quote', 'normal'), doc.setFontSize(8), doc.splitTextToSize(extraEl.innerText.trim(), W - M * 2) as string[])
        : [];
      ensure(16 + rowCount * 6.5 + (extraLines.length ? extraLines.length * 4 + 4 : 0));
      doc.setDrawColor(...taupe); doc.setLineWidth(0.25); doc.line(M, y - 4, W - M, y - 4);
      y += 2;
      if (titleEl) {
        doc.setFont('Quote', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...ink);
        doc.text(titleEl.innerText.trim().toLocaleUpperCase(), M, y, { charSpace: 0.55 });
        y += 7;
      }
      const colGap = 10;
      const colWidth = (W - M * 2 - colGap) / 2;
      for (let i = 0; i < items.length; i += 2) {
        const pair = [items[i], items[i + 1]].filter(Boolean) as HTMLElement[];
        let rowHeight = 5.5;
        pair.forEach((cell, colIndex) => {
          const x = M + colIndex * (colWidth + colGap);
          const spans = Array.from(cell.children) as HTMLElement[];
          const labelText = spans[0]?.innerText ?? '';
          const valueText = spans[1]?.innerText ?? cell.innerText;
          doc.setFont('Quote', 'normal'); doc.setFontSize(8.5);
          if (labelText) {
            const labelWidth = doc.getTextWidth(labelText);
            doc.setTextColor(...muted);
            doc.text(labelText, x, y);
            const remainingWidth = Math.max(20, colWidth - labelWidth);
            const valLines = doc.splitTextToSize(valueText, remainingWidth) as string[];
            doc.setTextColor(...ink);
            valLines.forEach((line, li) => {
              doc.text(line, li === 0 ? x + labelWidth : x, y + li * 4.2);
            });
            rowHeight = Math.max(rowHeight, valLines.length * 4.2 + 2);
          } else {
            const valLines = doc.splitTextToSize(valueText, colWidth) as string[];
            doc.setTextColor(...ink);
            valLines.forEach((line, li) => doc.text(line, x, y + li * 4.2));
            rowHeight = Math.max(rowHeight, valLines.length * 4.2 + 2);
          }
        });
        y += rowHeight;
      }
      if (extraLines.length) {
        y += 2;
        doc.setFont('Quote', 'normal'); doc.setFontSize(8); doc.setTextColor(...muted);
        for (const line of extraLines) {
          ensure(5);
          doc.text(line, M, y);
          y += 4;
        }
      }
      y += 8;
      continue;
    }
    if (block.hasAttribute('data-quote-payment')) {
      const titleEl = block.firstElementChild as HTMLElement | null;
      const rows = Array.from(block.querySelectorAll<HTMLElement>('[data-quote-payment-row]'));
      const bankEl = block.querySelector<HTMLElement>('[data-quote-bank]');
      const bankLines = bankEl ? (Array.from(bankEl.children) as HTMLElement[]) : [];
      const bankHeight = bankEl ? 12.5 + Math.max(1, bankLines.length - 1) * 5.2 : 0;
      const estTotal = 16 + rows.length * 8.5 + (bankEl ? bankHeight + 8 : 0);
      ensure(Math.min(estTotal, 95));
      doc.setDrawColor(...taupe); doc.setLineWidth(0.25); doc.line(M, y - 4, W - M, y - 4);
      y += 2;
      if (titleEl) {
        doc.setFont('Quote', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...ink);
        doc.text(titleEl.innerText.trim().toLocaleUpperCase(), M, y, { charSpace: 0.55 });
        y += 8;
      }
      for (const row of rows) {
        const leftEl = row.children[0] as HTMLElement | undefined;
        const rightEl = row.children[1] as HTMLElement | undefined;
        const leftText = leftEl?.innerText.trim() ?? '';
        const rightText = rightEl?.innerText.trim() ?? '';
        doc.setFont('Quote', 'normal'); doc.setFontSize(8.5);
        const leftLines = doc.splitTextToSize(leftText, W - M * 2 - 48) as string[];
        const rowH = Math.max(leftLines.length * 4.3, 4.5) + 4;
        ensure(rowH + 2);
        doc.setFont('Quote', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...ink);
        leftLines.forEach((line, li) => doc.text(line, M, y + li * 4.3));
        if (rightText) {
          doc.setFont('Quote', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...ink);
          doc.text(rightText, W - M, y, { align: 'right' });
        }
        const lineY = y + Math.max(leftLines.length - 1, 0) * 4.3 + 2.6;
        doc.setDrawColor(...taupe); doc.setLineWidth(0.2); doc.line(M, lineY, W - M, lineY);
        y = lineY + 5.2;
      }
      if (bankEl && bankLines.length) {
        y += 2;
        ensure(bankHeight + 4);
        const boxY = y;
        doc.setFillColor(...paper);
        doc.roundedRect(M, boxY, W - M * 2, bankHeight, 2.5, 2.5, 'F');
        let by = boxY + 6.5;
        const bx = M + 6;
        const bankTitle = bankLines[0]?.innerText.trim() ?? '';
        if (bankTitle) {
          doc.setFont('Quote', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...ink);
          doc.text(bankTitle.toLocaleUpperCase(), bx, by, { charSpace: 0.4 });
          by += 6;
        }
        for (let bi = 1; bi < bankLines.length; bi++) {
          const lineEl = bankLines[bi];
          const raw = lineEl.innerText.trim();
          if (!raw) continue;
          if (bi === 1) {
            doc.setFont('Quote', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...ink);
            doc.text(raw, bx, by);
          } else if (raw.includes(':')) {
            const colonIdx = raw.indexOf(':');
            const prefix = raw.slice(0, colonIdx + 1) + ' ';
            const val = raw.slice(colonIdx + 1).trim();
            doc.setFont('Quote', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...muted);
            doc.text(prefix, bx, by);
            const pw = doc.getTextWidth(prefix);
            const isIban = /^iban/i.test(prefix);
            doc.setFont('Quote', isIban ? 'bold' : 'normal');
            doc.setTextColor(...(isIban ? ink : muted));
            doc.text(val, bx + pw, by, isIban ? { charSpace: 0.25 } : undefined);
          } else {
            doc.setFont('Quote', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...muted);
            doc.text(raw, bx, by);
          }
          by += 5.2;
        }
        y = boxY + bankHeight + 8;
      } else {
        y += 6;
      }
      continue;
    }
    if (block.hasAttribute('data-quote-notes')) {
      const titleEl = block.firstElementChild as HTMLElement | null;
      const titleText = titleEl?.innerText.trim() ?? '';
      const bodyText = fullText.replace(titleText, '').trim();
      doc.setFont('Quote', 'normal'); doc.setFontSize(8.5);
      const bodyLines = doc.splitTextToSize(bodyText, W - M * 2 - 12) as string[];
      const boxH = 14.5 + bodyLines.length * 4.4;
      ensure(Math.min(boxH + 4, 220));
      const boxY = y;
      doc.setFillColor(...paper);
      doc.roundedRect(M, boxY, W - M * 2, boxH, 2.5, 2.5, 'F');
      let ny = boxY + 6.5;
      if (titleText) {
        doc.setFont('Quote', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...muted);
        doc.text(titleText.toLocaleUpperCase(), M + 6, ny, { charSpace: 0.4 });
        ny += 5.8;
      }
      doc.setFont('Quote', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...muted);
      for (const line of bodyLines) {
        doc.text(line, M + 6, ny);
        ny += 4.4;
      }
      y = boxY + boxH + 8;
      continue;
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
    if (page === 1 && cover) continue;
    doc.setPage(page); doc.setFont('Quote', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...muted);
    doc.setDrawColor(...bronze); doc.line(M, 283, W - M, 283);
    doc.text('Kalea Group Srl · info@kalea.space · kalea.space · P.IVA 04797310986', M, 288);
    doc.text(`${number} · ${page}/${pages}`, W - M, 293, { align: 'right' });
  }
  return doc;
}