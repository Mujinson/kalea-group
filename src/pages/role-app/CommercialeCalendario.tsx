import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

const CommercialeCalendario = () => {
  const { user } = useAdminAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const fromIso = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const { data } = await supabase
        .from('appointments')
        .select('id,title,appointment_date,duration_minutes,appointment_type,status,location,notes')
        .eq('assigned_to', user.id)
        .gte('appointment_date', fromIso)
        .order('appointment_date', { ascending: true })
        .limit(100);
      setItems(data || []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="p-4 space-y-3">
      <div>
        <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider">Calendario</p>
        <h1 className="text-[24px] font-semibold text-[#1E1B4B] mt-1">
          {items.length} {items.length === 1 ? 'appuntamento' : 'appuntamenti'}
        </h1>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E1B4B]" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258]">
          Nessun appuntamento in programma.
        </div>
      )}

      {items.map((a) => (
        <div key={a.id} className="bg-white rounded-xl border border-[#E5E2DD] p-4 space-y-2">
          <div className="flex items-center gap-2 text-[12px] text-[#8C7B6B] uppercase tracking-wider">
            <Calendar className="w-4 h-4" /> {fmtDate(a.appointment_date)}
            <span className="ml-auto inline-flex items-center gap-1">
              <Clock className="w-4 h-4" /> {fmtTime(a.appointment_date)}
              {a.duration_minutes ? ` · ${a.duration_minutes}m` : ''}
            </span>
          </div>
          <div className="text-[16px] font-semibold text-[#1E1B4B]">{a.title || a.appointment_type || 'Appuntamento'}</div>
          {a.location && (
            <div className="flex items-center gap-2 text-[13px] text-[#6B6258]">
              <MapPin className="w-4 h-4" /> {a.location}
            </div>
          )}
          {a.notes && <p className="text-[13px] text-[#6B6258] leading-relaxed">{a.notes}</p>}
          <div className="text-[11px] uppercase tracking-wider text-[#8C7B6B]">
            Stato: <span className="text-[#1E1B4B] font-medium">{a.status || 'programmato'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommercialeCalendario;
