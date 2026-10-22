/// <reference types="node" />
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { PDFDocument } from 'pdf-lib';
import { mergeQuotePdfs } from './mergeQuotePdfs';

async function pdfWithPages(widths: number[]) {
  const pdf = await PDFDocument.create();
  widths.forEach((width) => pdf.addPage([width, 842]));
  return pdf.save();
}

test('technical sheets follow all quote pages, in selected order and original sizes', async () => {
  const bytes = await mergeQuotePdfs(await pdfWithPages([595, 596]), [await pdfWithPages([600, 601]), await pdfWithPages([700])]);
  const result = await PDFDocument.load(bytes);
  assert.equal(result.getPageCount(), 5);
  assert.deepEqual(result.getPages().map((page) => page.getWidth()), [595, 596, 600, 601, 700]);
});

test('quotes without attachments keep their pages', async () => {
  const result = await PDFDocument.load(await mergeQuotePdfs(await pdfWithPages([595]), []));
  assert.equal(result.getPageCount(), 1);
});

test('unreadable attachment fails rather than silently exporting an incomplete quote', async () => {
  const quote = await pdfWithPages([595]);
  await assert.rejects(() => mergeQuotePdfs(quote, [new Uint8Array([1, 2, 3])]));
});