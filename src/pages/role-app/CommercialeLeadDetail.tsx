import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft, Phone, Mail, MapPin, Save, Loader2, CalendarPlus,
  Building2, User, Globe, Linkedin, MessageSquare, PhoneCall, StickyNote,
  Calendar as CalIcon, CheckCircle2, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { LeadStatusBadge } from '@/components/admin/leads/LeadStatusBadge';
import { LEAD_STATUSES, sourceLabel } from '@/components/admin/leads/leadConstants';
import LeadFormDrawer from '@/components/admin/leads/LeadFormDrawer';

const ACTIVITY_ICONS: Record<string, any> = {
  note: StickyNote, call: PhoneCall, email: Mail, whatsapp: MessageSquare,
  meeting: CalIcon, status_change: CheckCircle2, task: CheckCircle2, sms: MessageSquare,
};

const CommercialeLeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const path = window.location.pathname;
  const basePath = path.startsWith('/app/ibrido') ? '/app/ibrido' : path.startsWith('/app/operaio') ? '/app/operaio' : '/app/commerciale';
  const [lead, setLead] = useState<any | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'call' | 'email' | 'meeting' | 'whatsapp'>('note');
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: l }, { data: acts }] = await Promise.all([
      supabase.from('leads').select('*').eq('id', id).maybeSingle(),
      supabase.from('lead_activities').select('*').eq('lead_id', id).order('occurred_at', { ascending: false }),
    ]);
    setLead(l);
    setActivities(acts || []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (newStatus: string) => {
    if (!lead) return;
    setSaving(true);
    const oldStatus = lead.status;
    await supabase.from('leads').update({ status: newStatus, last_interaction_at: new Date().toISOString() }).eq('id', lead.id);
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from('lead_activities').insert({
      lead_id: lead.id, user_id: userData.user?.id, type: 'status_change',
      title: `Stato → ${newStatus}`, description: `Da ${oldStatus} a ${newStatus}`,
    });
    setSaving(false);
    toast.success('Stato aggiornato');
    load();
  };

  const addActivity = async () => {
    if (!newNote.trim() || !id) return;
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('lead_activities').insert({
      lead_id: id, user_id: userData.user?.id ?? null, type: noteType, description: newNote.trim(),
    });
    if (error) return toast.error(error.message);
    await supabase.from('leads').update({ last_interaction_at: new Date().toISOString() }).eq('id', id);
    setNewNote('');
    toast.success('Registrata');
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#1E1B4B]" /></div>;
  }
  if (!lead) return <div className="p-4 text-[#6B6258]">Lead non trovato.</div>;

  const displayName = lead.contact_type === 'privato'
    ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.name
    : lead.company_name || lead.name;
  const place = [lead.city, lead.province].filter(Boolean).join(', ');
  const siteAddress = [lead.site_address, lead.site_postal_code, lead.site_city, lead.site_province].filter(Boolean).join(', ');

  return (
    <div className="p-4 space-y-4 pb-32">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(`${basePath}/lead`)} className="flex items-center gap-1 text-[13px] text-[#8C7B6B]">
          <ArrowLeft className="w-4 h-4" /> Indietro
        </button>
        <button onClick={() => setEditOpen(true)} className="text-[13px] text-[#1E1B4B] inline-flex items-center gap-1">
          <Pencil className="w-3.5 h-3.5" /> Modifica
        </button>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-[#E5E2DD] p-5 space-y-2">
        <div className="flex items-start gap-2">
          {lead.contact_type === 'privato' ? <User className="w-4 h-4 text-[#8C7B6B] mt-1" /> : <Building2 className="w-4 h-4 text-[#8C7B6B] mt-1" />}
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-semibold text-[#1E1B4B] leading-tight">{displayName}</h1>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8C7B6B]">
              {lead.code && <span className="font-mono uppercase">{lead.code}</span>}
              {lead.source && <span>· {sourceLabel(lead.source)}</span>}
            </div>
          </div>
        </div>
        <LeadStatusBadge status={lead.status} />
        {lead.project_name && <div className="text-[13px] text-[#6B6258]">📐 {lead.project_name}</div>}
        {place && <div className="text-[13px] text-[#6B6258] flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {place}</div>}
        <div className="flex gap-2 pt-2">
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="flex-1 h-11 rounded-lg bg-[#1E1B4B] text-white text-[13px] font-medium flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> Chiama
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="flex-1 h-11 rounded-lg border border-[#E5E2DD] text-[#1E1B4B] text-[13px] font-medium flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </a>
          )}
        </div>
      </div>

      {/* Pipeline quick */}
      <div className="bg-white rounded-xl border border-[#E5E2DD] p-4 space-y-2">
        <div className="text-[11px] uppercase tracking-widest text-[#8C7B6B]">Cambia stato</div>
        <div className="grid grid-cols-3 gap-2">
          {LEAD_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => changeStatus(s.value)}
              disabled={saving}
              className={`h-10 rounded-lg text-[11px] font-medium border transition ${
                lead.status === s.value ? 'bg-[#1E1B4B] text-white border-[#1E1B4B]' : 'bg-white text-[#1E1B4B] border-[#E5E2DD]'
              }`}
            >{s.label}</button>
          ))}
        </div>
      </div>

      {/* Contatto details */}
      <div className="bg-white rounded-xl border border-[#E5E2DD] p-4 space-y-2">
        <div className="text-[11px] uppercase tracking-widest text-[#8C7B6B]">Contatto</div>
        {lead.company_name && <DetailRow label="Azienda" value={lead.company_name} />}
        {lead.vat_number && <DetailRow label="P.IVA" value={lead.vat_number} />}
        {(lead.first_name || lead.last_name) && <DetailRow label="Referente" value={`${lead.first_name || ''} ${lead.last_name || ''}`.trim()} />}
        {lead.profession && <DetailRow label="Professione" value={lead.profession} />}
        {lead.website && <DetailRow label="Sito" icon={<Globe className="w-3.5 h-3.5" />} value={<a href={lead.website} target="_blank" rel="noreferrer" className="text-[#1E1B4B] underline">{lead.website}</a>} />}
        {lead.linkedin_url && <DetailRow label="LinkedIn" icon={<Linkedin className="w-3.5 h-3.5" />} value={<a href={lead.linkedin_url} target="_blank" rel="noreferrer" className="text-[#1E1B4B] underline">Profilo</a>} />}
      </div>

      {siteAddress && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-4 space-y-2">
          <div className="text-[11px] uppercase tracking-widest text-[#8C7B6B]">Cantiere</div>
          <div className="text-[13px] text-[#1E1B4B] flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#8C7B6B] mt-0.5" /> {siteAddress}
          </div>
        </div>
      )}

      {lead.message && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-4 space-y-1">
          <div className="text-[11px] uppercase tracking-widest text-[#8C7B6B]">Richiesta</div>
          <p className="text-[13px] text-[#1E1B4B] whitespace-pre-wrap">{lead.message}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-[#E5E2DD] p-4 space-y-3">
        <div className="text-[11px] uppercase tracking-widest text-[#8C7B6B]">Timeline</div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as any)}
              className="h-10 rounded-lg border border-[#E5E2DD] bg-white px-2 text-[13px] text-[#1E1B4B]"
            >
              <option value="note">📝 Nota</option>
              <option value="call">📞 Chiamata</option>
              <option value="email">✉️ Email</option>
              <option value="whatsapp">💬 WhatsApp</option>
              <option value="meeting">📅 Meeting</option>
            </select>
            <button onClick={addActivity} disabled={!newNote.trim()} className="h-10 px-4 rounded-lg bg-[#1E1B4B] text-white text-[13px] font-medium disabled:opacity-40">Aggiungi</button>
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={2}
            placeholder="Es. chiamato, richiama domani…"
            className="w-full rounded-lg border border-[#E5E2DD] bg-white px-3 py-2 text-[14px] text-[#1E1B4B] focus:outline-none focus:border-[#1E1B4B]"
          />
        </div>

        {activities.length === 0 && <p className="text-[12px] text-[#8C7B6B] text-center py-2">Nessuna attività ancora.</p>}
        <ol className="relative border-l border-[#E5E2DD] ml-2 space-y-3 mt-2">
          {activities.map((a) => {
            const Icon = ACTIVITY_ICONS[a.type] || StickyNote;
            return (
              <li key={a.id} className="ml-4">
                <span className="absolute -left-[9px] w-[18px] h-[18px] rounded-full bg-[#1E1B4B] text-white flex items-center justify-center">
                  <Icon className="w-2.5 h-2.5" />
                </span>
                <div className="rounded-lg border border-[#E5E2DD] p-2.5 bg-[#FAF7F2]">
                  <div className="flex items-center justify-between text-[10px] text-[#8C7B6B]">
                    <span className="uppercase tracking-wider font-medium">{a.type}</span>
                    <span>{format(new Date(a.occurred_at), 'd MMM · HH:mm', { locale: it })}</span>
                  </div>
                  {a.title && <div className="text-[13px] font-medium text-[#1E1B4B] mt-0.5">{a.title}</div>}
                  {a.description && <div className="text-[13px] text-[#1E1B4B] mt-0.5 whitespace-pre-wrap">{a.description}</div>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <button
        onClick={() => navigate(`${basePath}/calendario?lead=${lead.id}`)}
        className="w-full h-12 rounded-lg border border-[#E5E2DD] text-[#1E1B4B] font-medium flex items-center justify-center gap-2"
      >
        <CalendarPlus className="w-5 h-5" /> Nuovo appuntamento
      </button>

      <LeadFormDrawer open={editOpen} onClose={() => setEditOpen(false)} leadId={lead.id} onSaved={load} />
    </div>
  );
};

function DetailRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="text-[#8C7B6B] flex items-center gap-1">{icon} {label}</span>
      <span className="text-[#1E1B4B] text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}

export default CommercialeLeadDetail;
