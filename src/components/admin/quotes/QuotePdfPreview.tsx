import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { buildPremiumQuotePdf } from '@/lib/premiumQuotePdf';

GlobalWorkerOptions.workerSrc = workerUrl;

/** The visible preview is rendered from the same PDF generator as download. */
export default function QuotePdfPreview() {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const source = document.getElementById('pdf-preview');
    if (!source) return;
    let cancelled = false;
    let revision = 0;
    let timer: ReturnType<typeof setTimeout>;
    const render = async () => {
      const current = ++revision;
      try {
        const pdf = await buildPremiumQuotePdf(source);
        const document = await getDocument({ data: new Uint8Array(pdf.output('arraybuffer')) }).promise;
        const fragment = window.document.createDocumentFragment();
        for (let i = 1; i <= document.numPages; i++) {
          if (cancelled || current !== revision) { await document.destroy(); return; }
          const page = await document.getPage(i);
          const viewport = page.getViewport({ scale: 1.6 });
          const canvas = window.document.createElement('canvas');
          canvas.width = viewport.width; canvas.height = viewport.height;
          canvas.setAttribute('aria-label', `Pagina ${i}`);
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Anteprima non disponibile');
          await page.render({ canvasContext: context, viewport }).promise;
          fragment.append(canvas);
        }
        if (!cancelled && current === revision) { container.current?.replaceChildren(fragment); setError(''); }
        await document.destroy();
      } catch { if (!cancelled) setError('Anteprima non disponibile. Riprova aprendo questa scheda.'); }
    };
    const schedule = () => { clearTimeout(timer); timer = setTimeout(render, 250); };
    const observer = new MutationObserver(schedule);
    observer.observe(source, { subtree: true, childList: true, characterData: true, attributes: true });
    schedule();
    return () => { cancelled = true; revision++; clearTimeout(timer); observer.disconnect(); };
  }, []);
  return <div className="quote-rendered-preview" aria-label="Anteprima PDF">{error && <p role="alert">{error}</p>}<div ref={container} /></div>;
}