import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CreaPreventivo from '@/pages/admin/strumenti/CreaPreventivo';

/**
 * Mobile-first wrapper for the desktop CreaPreventivo tool.
 * - Adds a sticky top back bar (mobile only)
 * - Overrides inline 2-column grids and fixed maxWidth on small screens
 *   so the entire flow stacks vertically and stays inside the viewport.
 */
const MobileQuoteWrapper = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F1E7]">
      {/* Mobile back bar */}
      <div className="md:hidden flex items-center gap-3 px-4 h-12 bg-[#1E1B4B] text-white">
        <button onClick={() => navigate(-1)} className="-ml-2 p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-[15px] font-medium">Nuovo preventivo</span>
      </div>

      {/* Responsive override styles scoped to this page */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-quote-scope > div[style] {
            max-width: 100% !important;
            padding: 16px 12px !important;
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
          .mobile-quote-scope button {
            min-height: 44px;
          }
          .mobile-quote-scope #pdf-preview {
            padding: 20px 16px !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border-radius: 8px !important;
          }
        }
      `}</style>

      <div className="mobile-quote-scope">
        <CreaPreventivo />
      </div>
    </div>
  );
};

export default MobileQuoteWrapper;
