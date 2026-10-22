import { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Paperclip, Eye, X, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { attachmentBytes, QUOTE_ATTACHMENT_BUCKET, type QuoteAttachment } from '@/lib/quoteAttachments';

export default function QuoteAttachments({ quoteId, attachments, onChange }: {
  quoteId: string | null;
  attachments: QuoteAttachment[];
  onChange: (next: QuoteAttachment[]) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const change = async (next: QuoteAttachment[]) => {
    setBusy(true);
    try { await onChange(next); } catch (error) { toast.error(error instanceof Error ? error.message : 'Errore salvataggio allegati'); }
    finally { setBusy(false); }
  };
  const upload = async (files: FileList | null) => {
    if (!files?.length || !quoteId) return;
    setBusy(true);
    const added: QuoteAttachment[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.name.toLowerCase().endsWith('.pdf')) throw new Error('Seleziona un file PDF');
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const id = crypto.randomUUID();
        const path = `${quoteId}/${id}.pdf`;
        const { error } = await supabase.storage.from(QUOTE_ATTACHMENT_BUCKET).upload(path, file, { contentType: 'application/pdf' });
        if (error) throw error;
        added.push({ id, path, name: file.name, pages: pdf.getPageCount() });
      }
      await onChange([...attachments, ...added]);
      toast.success('Schede tecniche allegate');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Errore caricamento PDF'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  const preview = async (item: QuoteAttachment) => {
    // Open synchronously so browsers do not block the new tab after download.
    const tab = window.open('about:blank', '_blank');
    if (tab) tab.opener = null;
    try {
      const url = URL.createObjectURL(new Blob([await attachmentBytes(item)], { type: 'application/pdf' }));
      if (tab) tab.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { tab?.close(); toast.error('Impossibile aprire la scheda'); }
  };
  return <section className="mb-5 space-y-3 border-y border-border py-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="font-semibold text-foreground">Schede tecniche · {attachments.length}</h3>
      <Button variant="outline" size="sm" disabled={busy || !quoteId} onClick={() => input.current?.click()}>
        {busy ? <Loader2 className="animate-spin" /> : <Paperclip />} Allega PDF
      </Button>
      <input ref={input} type="file" accept="application/pdf,.pdf" multiple hidden onChange={(event) => upload(event.target.files)} />
    </div>
    {!quoteId && <p className="text-sm text-muted-foreground">Salva prima il preventivo.</p>}
    {attachments.map((item, index) => <div key={item.id} className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
      <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 break-words text-sm text-foreground">{item.name} · {item.pages} {item.pages === 1 ? 'pagina' : 'pagine'}</span>
      <Button size="icon" variant="ghost" title="Apri scheda" aria-label={`Apri ${item.name}`} onClick={() => preview(item)}><Eye /></Button>
      <Button size="icon" variant="ghost" title="Sposta prima" aria-label={`Sposta prima ${item.name}`} disabled={busy || index === 0} onClick={() => { const next = [...attachments]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; change(next); }}><ArrowUp /></Button>
      <Button size="icon" variant="ghost" title="Sposta dopo" aria-label={`Sposta dopo ${item.name}`} disabled={busy || index === attachments.length - 1} onClick={() => { const next = [...attachments]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; change(next); }}><ArrowDown /></Button>
      <Button size="icon" variant="ghost" title="Rimuovi dal preventivo" aria-label={`Rimuovi ${item.name}`} disabled={busy} onClick={() => change(attachments.filter((row) => row.id !== item.id))}><X /></Button>
    </div>)}
  </section>;
}