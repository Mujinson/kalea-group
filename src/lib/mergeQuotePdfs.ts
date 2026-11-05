import { PDFDocument } from 'pdf-lib';

/** Append all technical sheets after every quote page, preserving page size and order. */
export async function mergeQuotePdfs(quote: ArrayBuffer | Uint8Array, attachments: (ArrayBuffer | Uint8Array)[]) {
  const result = await PDFDocument.load(quote, { ignoreEncryption: true });
  for (const bytes of attachments) {
    const document = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await result.copyPages(document, document.getPageIndices());
    pages.forEach((page) => result.addPage(page));
  }
  return result.save();
}