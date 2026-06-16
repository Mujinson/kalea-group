import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Loader2 } from 'lucide-react';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });

const OperaioCalendario = () => {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const basePath = window.location.pathname.startsWith('/app/ibrido') ? '/app/ibrido' : '/app/operaio';

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from('site_workers')
        .select('construction_sites(id,title,address,city,status,start_date,end_date)')
        .eq('worker_user_id', user.id)
        .eq('is_active', true);
      const list = (data || [])
        .map((r: any) => r.construction_sites)
        .filter(Boolean)
        .filter((s: any) => !s.end_date || s.end_date >= today)
        .sort((a: any, b: any) => (a.start_date || '').localeCompare(b.start_date || ''));
      setSites(list);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="p-4 space-y-3">
      <div>
        <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider">Calendario cantieri</p>
        <h1 className="text-[24px] font-semibold text-[#1E1B4B] mt-1">Prossimi e attivi</h1>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E1B4B]" />
        </div>
      )}

      {!loading && sites.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258]">
          Nessun cantiere in programma.
        </div>
      )}

      {sites.map((s) => {
        const addr = [s.address, s.city].filter(Boolean).join(', ');
        return (
          <button
            key={s.id}
            onClick={() => navigate(`${basePath}/cantieri/${s.id}`)}
            className="w-full text-left bg-white rounded-xl border border-[#E5E2DD] p-4 space-y-2"
          >
            <div className="flex items-center gap-2 text-[12px] text-[#8C7B6B] uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              {s.start_date ? fmtDate(s.start_date) : '—'}
              {s.end_date ? ` → ${fmtDate(s.end_date)}` : ''}
            </div>
            <div className="text-[16px] font-semibold text-[#1E1B4B]">{s.title}</div>
            {addr && (
              <div className="flex items-center gap-2 text-[13px] text-[#6B6258]">
                <MapPin className="w-4 h-4" /> {addr}
              </div>
            )}
            <div className="text-[11px] uppercase tracking-wider text-[#8C7B6B]">
              Stato: <span className="text-[#1E1B4B] font-medium">{s.status}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default OperaioCalendario;
