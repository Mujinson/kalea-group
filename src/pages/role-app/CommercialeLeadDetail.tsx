import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Phone, Mail, MapPin, Save, Loader2, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';

const STAGES = [
  { v: 'cold', label: 'Cold' },
  { v: 'warm', label: 'Warm' },
  { v: 'hot', label: 'Hot' },
  { v: 'opportunity', label: 'Opportunity' },
  { v: 'won', label: 'Vinto' },
  { v: 'lost', label: 'Perso' },
];

const STATUSES = ['nuovo', 'contattato', 'qualificato', 'preventivo', 'chiuso'];

const CommercialeLeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = window.location.pathname.startsWith('/app/ibrido') ? '/app/ibrido' : '/app/commerciale';
  const [lead, setLead] = useState<any | null>(null);
  const [stage, setStage] = useState('cold');
  const [status, setStatus] = useState('nuovo');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (data) {
        setLead(data);
        setStage(data.pipeline_stage || 'cold');
        setStatus(data.status || 'nuovo');
        setNotes(data.notes || '');
      }
      setLoading(false);
    })();
  }, [id]);

  const save = async () => {
    if (!id) return;
    setSaving(true);
    const { error } = await supabase
      .from('leads')
      .update({
        pipeline_stage: stage,
        status,
        notes: notes.trim() || null,
        last_interaction_at: new Date().toISOString(),
      })
      .eq('id', id);
    setSaving(false);
    if (error) {
      toast.error(`Errore: ${error.message}`);
      return;
    }
    toast.success('Lead aggiornato');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-[#1E1B4B]" />
      </div>
    );
  }

  if (!lead) {
    return <div className="p-4 text-[#6B6258]">Lead non trovato.</div>;
  }

  const place = [lead.city, lead.province].filter(Boolean).join(', ');

  return (
    <div className="p-4 space-y-4 pb-32">
      <button
        onClick={() => navigate(`${basePath}/lead`)}
        className="flex items-center gap-1 text-[13px] text-[#8C7B6B]"
      >
        <ArrowLeft className="w-4 h-4" /> Lead
      </button>

      <div className="bg-white rounded-xl border border-[#E5E2DD] p-5 space-y-2">
        <h1 className="text-[22px] font-semibold text-[#1E1B4B]">{lead.name}</h1>
        {lead.project_type && (
          <div className="text-[13px] text-[#6B6258]">{lead.project_type}</div>
        )}
        {place && (
          <div className="text-[13px] text-[#6B6258] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {place}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="flex-1 h-[44px] rounded-lg bg-[#1E1B4B] text-white text-[13px] font-medium flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" /> Chiama
            </a>
          )}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex-1 h-[44px] rounded-lg border border-[#E5E2DD] text-[#1E1B4B] text-[13px] font-medium flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" /> Email
            </a>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E2DD] p-4 space-y-3">
        <div>
          <label className="text-[12px] uppercase tracking-wider text-[#8C7B6B]">Pipeline</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {STAGES.map((s) => (
              <button
                key={s.v}
                onClick={() => setStage(s.v)}
                className={`h-[40px] rounded-lg text-[12px] font-medium border ${
                  stage === s.v
                    ? 'bg-[#1E1B4B] text-white border-[#1E1B4B]'
                    : 'bg-white text-[#1E1B4B] border-[#E5E2DD]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[12px] uppercase tracking-wider text-[#8C7B6B]">Stato</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 w-full h-[44px] rounded-lg border border-[#E5E2DD] bg-white px-3 text-[15px] text-[#1E1B4B] focus:outline-none focus:border-[#1E1B4B]"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[12px] uppercase tracking-wider text-[#8C7B6B]">Note</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="mt-2 w-full rounded-lg border border-[#E5E2DD] bg-white px-3 py-2 text-[15px] text-[#1E1B4B] focus:outline-none focus:border-[#1E1B4B]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="h-[52px] rounded-lg bg-[#1E1B4B] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Salva
        </button>
        <button
          onClick={() => navigate(`${basePath}/calendario?lead=${lead.id}`)}
          className="h-[52px] rounded-lg border border-[#E5E2DD] text-[#1E1B4B] font-medium flex items-center justify-center gap-2"
        >
          <CalendarPlus className="w-5 h-5" /> Appuntamento
        </button>
      </div>
    </div>
  );
};

export default CommercialeLeadDetail;
