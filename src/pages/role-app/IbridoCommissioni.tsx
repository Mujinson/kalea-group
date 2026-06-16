import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Wallet, Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const eur = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

const statusColor = (s: string) => {
  const k = (s || '').toLowerCase();
  if (k.includes('liquidat') && !k.includes('da')) return '#16A34A';
  if (k.includes('da_liquidare') || k === 'pending') return '#F59E0B';
  return '#8C7B6B';
};

const IbridoCommissioni = () => {
  const { user } = useAdminAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('commissions')
        .select('id,customer_name,base_amount,percentage,amount,status,paid_at,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      setItems(data || []);
      setLoading(false);
    })();
  }, [user]);

  const totals = useMemo(() => {
    const pending = items
      .filter((i) => (i.status || '').toLowerCase().includes('da_liquidare'))
      .reduce((s, i) => s + Number(i.amount || 0), 0);
    const paid = items
      .filter((i) => (i.status || '').toLowerCase() === 'liquidata')
      .reduce((s, i) => s + Number(i.amount || 0), 0);
    return { pending, paid };
  }, [items]);

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Estratto Commissioni — Kalēa', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Generato il ${new Date().toLocaleDateString('it-IT')} · ${user?.email || ''}`,
      14, 25
    );
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 32,
      head: [['Data', 'Cliente', 'Base', '%', 'Importo', 'Stato']],
      body: items.map((c) => [
        new Date(c.created_at).toLocaleDateString('it-IT'),
        c.customer_name || '—',
        eur(Number(c.base_amount || 0)),
        `${Number(c.percentage || 0)}%`,
        eur(Number(c.amount || 0)),
        c.status || '—',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 27, 75] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.text(`Totale da liquidare: ${eur(totals.pending)}`, 14, finalY);
    doc.text(`Totale liquidato: ${eur(totals.paid)}`, 14, finalY + 6);

    doc.save(`commissioni-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider">Le mie commissioni</p>
          <h1 className="text-[24px] font-semibold text-[#1E1B4B] mt-1">
            {items.length} {items.length === 1 ? 'commissione' : 'commissioni'}
          </h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={exportPdf}
            className="h-10 px-3 rounded-lg border border-[#E5E2DD] bg-white text-[13px] text-[#1E1B4B] font-medium flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-4">
          <div className="text-[11px] uppercase tracking-wider text-[#8C7B6B]">Da liquidare</div>
          <div className="text-[20px] font-semibold text-[#F59E0B] mt-1">{eur(totals.pending)}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-4">
          <div className="text-[11px] uppercase tracking-wider text-[#8C7B6B]">Liquidate</div>
          <div className="text-[20px] font-semibold text-[#16A34A] mt-1">{eur(totals.paid)}</div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E1B4B]" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258]">
          Nessuna commissione registrata.
        </div>
      )}

      {items.map((c) => (
        <div key={c.id} className="bg-white rounded-xl border border-[#E5E2DD] p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-[#1E1B4B] truncate flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#8C7B6B]" />
                {c.customer_name || 'Cliente'}
              </div>
              <div className="text-[12px] text-[#6B6258] mt-1">
                Base {eur(Number(c.base_amount || 0))} · {Number(c.percentage || 0)}%
              </div>
            </div>
            <span
              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full text-white shrink-0"
              style={{ backgroundColor: statusColor(c.status) }}
            >
              {c.status || '—'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="text-[12px] text-[#8C7B6B]">
              {c.paid_at ? `Pagata il ${new Date(c.paid_at).toLocaleDateString('it-IT')}` : new Date(c.created_at).toLocaleDateString('it-IT')}
            </div>
            <div className="text-[18px] font-semibold text-[#1E1B4B]">{eur(Number(c.amount || 0))}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IbridoCommissioni;
