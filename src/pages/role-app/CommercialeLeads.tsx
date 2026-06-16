import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Phone, Mail, MapPin, User, Loader2, Plus } from 'lucide-react';
import QuickNewLeadSheet from '@/components/role-app/QuickNewLeadSheet';

const stageColor = (s: string) => {
  const k = (s || '').toLowerCase();
  if (k.includes('nuovo') || k.includes('new')) return '#1E1B4B';
  if (k.includes('contat')) return '#8B6F4E';
  if (k.includes('qual')) return '#EAB308';
  if (k.includes('preventiv') || k.includes('quote')) return '#0EA5E9';
  if (k.includes('vinto') || k.includes('won')) return '#16A34A';
  if (k.includes('perso') || k.includes('lost')) return '#DC2626';
  return '#6B6258';
};

const CommercialeLeads = () => {
  const { user, salespersonId } = useAdminAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let q = supabase
      .from('leads')
      .select('id,name,phone,email,city,province,pipeline_stage,status,project_type,last_interaction_at,created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (salespersonId) {
      q = q.or(`assigned_salesperson_id.eq.${salespersonId},created_by_user_id.eq.${user.id}`);
    } else {
      q = q.eq('created_by_user_id', user.id);
    }
    const { data } = await q;
    setLeads(data || []);
    setLoading(false);
  }, [user, salespersonId]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  return (
    <div className="p-4 space-y-3">
      <div>
        <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider">I miei Lead</p>
        <h1 className="text-[24px] font-semibold text-[#1E1B4B] mt-1">
          {leads.length} {leads.length === 1 ? 'contatto' : 'contatti'}
        </h1>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E1B4B]" />
        </div>
      )}

      {!loading && leads.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258]">
          Nessun lead assegnato.
        </div>
      )}

      {leads.map((l) => {
        const place = [l.city, l.province].filter(Boolean).join(', ');
        const basePath = window.location.pathname.startsWith('/app/ibrido') ? '/app/ibrido' : '/app/commerciale';
        return (
          <div key={l.id} className="bg-white rounded-xl border border-[#E5E2DD] p-4 space-y-2">
            <a href={`${basePath}/lead/${l.id}`} className="block space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-[#1E1B4B] font-semibold text-[16px]">
                <User className="w-4 h-4 text-[#8C7B6B]" />
                {l.name}
              </div>
              <span
                className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full text-white shrink-0"
                style={{ background: stageColor(l.pipeline_stage) }}
              >
                {l.pipeline_stage || 'nuovo'}
              </span>
            </div>

            {l.project_type && (
              <div className="text-[13px] text-[#6B6258]">{l.project_type}</div>
            )}
            {place && (
              <div className="text-[13px] text-[#6B6258] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {place}
              </div>
            )}
            </a>


            <div className="flex gap-2 pt-2">
              {l.phone && (
                <a
                  href={`tel:${l.phone}`}
                  className="flex-1 h-[44px] rounded-lg bg-[#1E1B4B] text-white text-[13px] font-medium flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Chiama
                </a>
              )}
              {l.email && (
                <a
                  href={`mailto:${l.email}`}
                  className="flex-1 h-[44px] rounded-lg border border-[#E5E2DD] text-[#1E1B4B] text-[13px] font-medium flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
            </div>
          </div>
        );
      })}

      <button
        onClick={() => setShowNew(true)}
        className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-[#1E1B4B] text-white shadow-lg flex items-center justify-center"
        aria-label="Nuovo lead"
      >
        <Plus className="w-6 h-6" />
      </button>

      <QuickNewLeadSheet open={showNew} onClose={() => setShowNew(false)} onCreated={() => load()} />
    </div>
  );
};

export default CommercialeLeads;
