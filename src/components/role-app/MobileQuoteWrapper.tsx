import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download, Save } from 'lucide-react';
import CreaPreventivo from '@/pages/admin/strumenti/CreaPreventivo';
import { toast } from 'sonner';

/**
 * Mobile-first wrapper for the desktop CreaPreventivo tool.
 * - Adds a sticky top back bar
 * - Forces all 2-column grids to 1 column and removes max width on small screens
 * - Adds a sticky bottom action bar that tracks the current step (via DOM
 *   inspection of the step tabs) and exposes:
 *     · Step 1 → Avanti (next)
 *     · Step 2 → Avanti (next)
 *     · Step 3 → Salva su CRM + Scarica PDF (true file download)
 */
const MobileQuoteWrapper = () => {
  const navigate = useNavigate();
  const scopeRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<number>(1);
  const [downloading, setDownloading] = useState(false);

  // Observe the active step button (CreaPreventivo's own tabs) to keep
  // the bottom bar in sync with the inner state.
  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return;

    const findStepButtons = () =>
      Array.from(root.querySelectorAll('button')).filter((b) =>
        /^\s*[1-3]\.\s/.test(b.textContent || '')
      );

    const detectStep = () => {
      const btns = findStepButtons();
      // The active tab has white background (#fff). Match the inline style.
      const active = btns.find((b) => /background:\s*(rgb\(255,\s*255,\s*255\)|#fff)/i.test(b.getAttribute('style') || ''));
      if (active) {
        const n = parseInt((active.textContent || '').trim().charAt(0), 10);
        if (n >= 1 && n <= 3) setStep(n);
      }
    };

    detectStep();
    const obs = new MutationObserver(detectStep);
    obs.observe(root, { subtree: true, attributes: true, attributeFilter: ['style'], childList: true });
    return () => obs.disconnect();
  }, []);

  const clickInnerStep = (n: number) => {
    const root = scopeRef.current;
    if (!root) return;
    const btn = Array.from(root.querySelectorAll('button')).find((b) =>
      new RegExp(`^\\s*${n}\\.\\s`).test(b.textContent || '')
    );
    (btn as HTMLButtonElement | undefined)?.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clickSave = () => {
    const root = scopeRef.current;
    if (!root) return;
    const btn = Array.from(root.querySelectorAll('button')).find((b) =>
      /salva preventivo|aggiorna preventivo|aggiorna$/i.test((b.textContent || '').trim())
    );
    if (!btn) {
      toast.error('Pulsante salva non trovato');
      return;
    }
    (btn as HTMLButtonElement).click();
  };

  const downloadPdf = async () => {
    const root = scopeRef.current;
    if (!root) return;
    const preview = root.querySelector('#pdf-preview') as HTMLElement | null;
    if (!preview) {
      toast.error('Apri prima l\'anteprima (step 3)');
      return;
    }
    setDownloading(true);
    const t = toast.loading('Generazione PDF...');
    try {
      const [{ default: html2canvas }, jsPDFmod] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const jsPDF = (jsPDFmod as any).jsPDF || (jsPDFmod as any).default;

      const canvas = await html2canvas(preview, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;

      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
        heightLeft -= pageH;
      }

      const fname = `Preventivo_Kalea_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fname);
      toast.success('PDF scaricato', { id: t });
    } catch (e: any) {
      console.error(e);
      toast.error(`Errore PDF: ${e.message || e}`, { id: t });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E7]">
      {/* Mobile back bar */}
      <div className="md:hidden flex items-center gap-3 px-4 h-12 bg-[#1E1B4B] text-white">
        <button onClick={() => navigate(-1)} className="-ml-2 p-2" aria-label="Indietro">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-[15px] font-medium">Nuovo preventivo · Step {step}/3</span>
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-quote-scope > div[style] {
            max-width: 100% !important;
            padding: 16px 12px 120px 12px !important;
          }
          .mobile-quote-scope div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          .mobile-quote-scope input,
          .mobile-quote-scope select,
          .mobile-quote-scope textarea {
            font-size: 16px !important;
            min-height: 44px;
          }
          .mobile-quote-scope button { min-height: 40px; }
          .mobile-quote-scope #pdf-preview {
            padding: 20px 16px !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border-radius: 8px !important;
          }
        }
      `}</style>

      <div ref={scopeRef} className="mobile-quote-scope">
        <CreaPreventivo />
      </div>

      {/* Sticky mobile action bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-[#E5E2DD] px-3 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        {step < 3 ? (
          <button
            onClick={() => clickInnerStep(step + 1)}
            className="w-full h-12 rounded-xl bg-[#1E1B4B] text-white font-medium text-[15px] flex items-center justify-center gap-2"
          >
            Avanti — Step {step + 1}/3 <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={clickSave}
              className="h-12 rounded-xl border border-[#1E1B4B] text-[#1E1B4B] bg-white font-medium text-[14px] flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Salva CRM
            </button>
            <button
              disabled={downloading}
              onClick={downloadPdf}
              className="h-12 rounded-xl bg-[#8B6F4E] text-white font-medium text-[14px] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Download className="w-4 h-4" /> {downloading ? 'PDF...' : 'Scarica PDF'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileQuoteWrapper;
