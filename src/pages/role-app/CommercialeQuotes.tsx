import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { FileText, Loader2 } from 'lucide-react';

const eur = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

const statusColor = (s: string) => {
  const k = (s || '').toLowerCase();
  if (['accepted', 'accettato'].includes(k)) return '#16A34A';
  if (['rejected', 'rifiutato'].includes(k)) return '#DC2626';
  if (['sent', 'inviato'].includes(k)) return '#0EA5E9';
  return '#8C7B6B';
};

const CommercialeQuotes = () => {
  const { user } = useAdminAuth();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('quotes')
        .select('id,quote_number,subject,project_name,status,total_amount,created_at,sent_date,accepted_date')
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(100);
      setQuotes(data || []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="p-4 space-y-3">
      <div>
        <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider">I miei preventivi</p>
        <h1 className="text-[24px] font-semibold text-[#1E1B4B] mt-1">
          {quotes.length} {quotes.length === 1 ? 'preventivo' : 'preventivi'}
        </h1>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E1B4B]" />
        </div>
      )}

      {!loading && quotes.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258]">
          Nessun preventivo creato.
        </div>
      )}

      {quotes.map((q) => (
        <div key={q.id} className="bg-white rounded-xl border border-[#E5E2DD] p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-[#1E1B4B] truncate">
                {q.quote_number ? `#${q.quote_number}` : 'Senza numero'}
              </div>
              <div className="text-[13px] text-[#6B6258] truncate">
                {q.project_name || q.subject || '—'}
              </div>
            </div>
            <span
              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full text-white shrink-0"
              style={{ background: statusColor(q.status) }}
            >
              {q.status || 'bozza'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-[12px] text-[#8C7B6B]">
              <FileText className="inline w-3.5 h-3.5 mr-1" />
              {new Date(q.created_at).toLocaleDateString('it-IT')}
            </span>
            <span className="text-[18px] font-semibold text-[#1E1B4B]">
              {eur(Number(q.total_amount || 0))}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommercialeQuotes;
