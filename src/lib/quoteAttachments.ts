import { supabase } from '@/integrations/supabase/client';
import { mergeQuotePdfs } from '@/lib/mergeQuotePdfs';

export type QuoteAttachment = { id: string; name: string; pages: number; path?: string; url?: string };
export const QUOTE_ATTACHMENT_BUCKET = 'quote-attachments';

export async function attachmentBytes(attachment: QuoteAttachment): Promise<ArrayBuffer> {
  if (attachment.path) {
    const { data, error } = await supabase.storage.from(QUOTE_ATTACHMENT_BUCKET).download(attachment.path);
    if (error || !data) throw new Error(`Impossibile leggere ${attachment.name}`);
    return data.arrayBuffer();
  }
  if (!attachment.url) throw new Error(`Allegato non disponibile: ${attachment.name}`);
  const response = await fetch(attachment.url);
  if (!response.ok) throw new Error(`Impossibile leggere ${attachment.name}`);
  return response.arrayBuffer();
}

export async function downloadQuotePdf(quote: ArrayBuffer, attachments: QuoteAttachment[], filename: string) {
  const bytes = await mergeQuotePdfs(quote, await Promise.all(attachments.map(attachmentBytes)));
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}