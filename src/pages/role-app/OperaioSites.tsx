import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Hammer, MapPin, Loader2, ChevronRight } from 'lucide-react';

const statusColor = (s: string) => {
  const k = (s || '').toLowerCase();
  if (k.includes('attiv') || k.includes('corso')) return '#16A34A';
  if (k.includes('complet') || k.includes('chiuso')) return '#6B6258';
  if (k.includes('sospes') || k.includes('pausa')) return '#EAB308';
  return '#1E1B4B';
};

const OperaioSites = () => {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data: assigns } = await supabase
        .from('site_workers')
        .select('site_id, construction_sites(id,title,address,city,product_model,status,start_date,end_date)')
        .eq('worker_user_id', user.id)
        .eq('is_active', true);

      const list = (assigns || [])
        .map((a: any) => a.construction_sites)
        .filter(Boolean);
      setSites(list);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="p-4 space-y-3">
      <div>
        <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider">Tutti i cantieri</p>
        <h1 className="text-[24px] font-semibold text-[#1E1B4B] mt-1">
          {sites.length} {sites.length === 1 ? 'cantiere' : 'cantieri'}
        </h1>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E1B4B]" />
        </div>
      )}

      {!loading && sites.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258]">
          Nessun cantiere assegnato.
        </div>
      )}

      {sites.map((s) => {
        const place = [s.address, s.city].filter(Boolean).join(', ');
        return (
          <button
            key={s.id}
            onClick={() => navigate(`/app/operaio/cantieri/${s.id}`)}
            className="w-full text-left bg-white rounded-xl border border-[#E5E2DD] p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-[#F5F0EA] flex items-center justify-center text-[#1E1B4B] shrink-0">
              <Hammer className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold text-[#1E1B4B] truncate">{s.title}</div>
              {place && (
                <div className="text-[12px] text-[#6B6258] truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {place}
                </div>
              )}
              <span
                className="inline-block mt-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                style={{ background: statusColor(s.status) }}
              >
                {s.status}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8C7B6B] shrink-0" />
          </button>
        );
      })}
    </div>
  );
};

export default OperaioSites;
