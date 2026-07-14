import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Loader2, Phone, Mail, MapPin, Globe, Linkedin, Building2, User,
  FileText, Pencil, Archive, StickyNote, PhoneCall, MessageSquare, Calendar as CalIcon,
  CheckCircle2, MapPinned,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LEAD_STATUSES, sourceLabel } from './leadConstants';

interface Props {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  onEdit?: () => void;
  onArchive?: () => void;
  onCreateQuote?: () => void;
}

const ACTIVITY_ICONS: Record<string, any> = {
  note: StickyNote, call: PhoneCall, email: Mail, whatsapp: MessageSquare,
  meeting: CalIcon, status_change: CheckCircle2, task: CheckCircle2, sms: MessageSquare,
};

export default function LeadDetailSheet({ open, onClose, leadId, onEdit, onArchive, onCreateQuote }: Props) {
  const [lead, setLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'call' | 'email' | 'meeting' | 'whatsapp'>('note');

  const load = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    const [{ data: l }, { data: acts }] = await Promise.all([
      supabase.from('leads').select('*').eq('id', leadId).maybeSingle(),
      supabase.from('lead_activities' as any).select('*').eq('lead_id', leadId).order('occurred_at', { ascending: false }),
    ]);
    setLead(l);
    setActivities(acts || []);
    setLoading(false);
  }, [leadId]);

  useEffect(() => { if (open && leadId) load(); }, [open, leadId, load]);

  const addActivity = async () => {
    if (!newNote.trim() || !leadId) return;
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('lead_activities' as any).insert({
      lead_id: leadId, user_id: userData.user?.id, type: noteType, description: newNote.trim(),
    });
    if (error) { toast.error(error.message); return; }
    setNewNote('');
    toast.success('Attività registrata');
    load();
    // update last_interaction_at
    await supabase.from('leads').update({ last_interaction_at: new Date().toISOString() }).eq('id', leadId);
  };

  const quickStatus = async (newStatus: string) => {
    if (!lead) return;
    await supabase.from('leads').update({ status: newStatus }).eq('id', lead.id);
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from('lead_activities' as any).insert({
      lead_id: lead.id, user_id: userData.user?.id, type: 'status_change',
      title: `Stato → ${newStatus}`, description: `Da ${lead.status} a ${newStatus}`,
    });
    load();
  };

  const displayName = lead
    ? (lead.contact_type === 'privato'
      ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.name
      : lead.company_name || lead.name)
    : '';

  const contactAddress = lead
    ? [lead.address, lead.postal_code, lead.city, lead.province].filter(Boolean).join(', ')
    : '';
  const siteAddress = lead
    ? [lead.site_address, lead.site_postal_code, lead.site_city, lead.site_province].filter(Boolean).join(', ')
    : '';

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
        {loading || !lead ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#0F172A]" /></div>
        ) : (
          <>
            {/* header */}
            <div className="sticky top-0 z-20 bg-white border-b border-[#E5E7EB] px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#64748B]">
                    <span className="font-mono">{lead.code || '—'}</span>
                    <span>·</span>
                    <span>{sourceLabel(lead.source)}</span>
                  </div>
                  <SheetTitle className="text-[22px] font-semibold text-[#0F172A] mt-1 truncate">{displayName}</SheetTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <LeadStatusBadge status={lead.status} />
                    <Select value={lead.status} onValueChange={quickStatus}>
                      <SelectTrigger className="h-7 w-[160px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            <span className="inline-flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />{s.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="w-4 h-4 mr-2" />Modifica</Button>
                  <Button size="sm" variant="outline" onClick={onCreateQuote}><FileText className="w-4 h-4 mr-2" />Preventivo</Button>
                  <Button size="sm" variant="outline" onClick={onArchive}><Archive className="w-4 h-4 mr-2" />Archivia</Button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Panoramica</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline ({activities.length})</TabsTrigger>
                  <TabsTrigger value="quotes">Preventivi</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contatto */}
                    <div className="rounded-xl border border-[#E5E7EB] p-4 space-y-3">
                      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0F172A]">
                        {lead.contact_type === 'privato' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                        Contatto
                      </div>
                      {lead.company_name && <Row icon={<Building2 className="w-4 h-4" />} label="Ragione sociale" value={lead.company_name} />}
                      {lead.vat_number && <Row label="P.IVA" value={lead.vat_number} />}
                      {(lead.first_name || lead.last_name) && <Row label="Referente" value={`${lead.first_name || ''} ${lead.last_name || ''}`.trim()} />}
                      {lead.profession && <Row label="Professione" value={lead.profession} />}
                      {lead.phone && <Row icon={<Phone className="w-4 h-4" />} value={<a className="text-[#0F172A] hover:underline" href={`tel:${lead.phone}`}>{lead.phone}</a>} />}
                      {lead.email && <Row icon={<Mail className="w-4 h-4" />} value={<a className="text-[#0F172A] hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a>} />}
                      {lead.website && <Row icon={<Globe className="w-4 h-4" />} value={<a className="text-[#0F172A] hover:underline truncate" href={lead.website} target="_blank" rel="noreferrer">{lead.website}</a>} />}
                      {lead.linkedin_url && <Row icon={<Linkedin className="w-4 h-4" />} value={<a className="text-[#0F172A] hover:underline truncate" href={lead.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>} />}
                      {contactAddress && <Row icon={<MapPin className="w-4 h-4" />} value={contactAddress} />}
                    </div>

                    {/* Progetto */}
                    <div className="rounded-xl border border-[#E5E7EB] p-4 space-y-3">
                      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0F172A]">
                        <MapPinned className="w-4 h-4" />
                        Progetto & cantiere
                      </div>
                      {lead.project_name && <Row label="Nome progetto" value={lead.project_name} />}
                      {siteAddress && <Row icon={<MapPin className="w-4 h-4" />} value={siteAddress} />}
                      <Row label="Isolamento termico" value={lead.has_thermal_insulation ? 'Sì' : 'No'} />
                      <Row label="Visita showroom" value={lead.visited_showroom ? 'Sì' : 'No'} />
                      {lead.message && (
                        <div className="pt-2 border-t border-[#E5E7EB]">
                          <div className="text-[11px] uppercase tracking-widest text-[#64748B] mb-1">Richiesta</div>
                          <p className="text-[13px] text-[#0F172A] whitespace-pre-wrap">{lead.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="rounded-xl border border-[#E5E7EB] p-4">
                      <div className="text-[11px] uppercase tracking-widest text-[#64748B] mb-1">Note interne</div>
                      <p className="text-[13px] text-[#0F172A] whitespace-pre-wrap">{lead.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <div className="rounded-xl border border-[#E5E7EB] p-4 space-y-2">
                    <div className="flex gap-2">
                      <Select value={noteType} onValueChange={(v) => setNoteType(v as any)}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="note">📝 Nota</SelectItem>
                          <SelectItem value="call">📞 Chiamata</SelectItem>
                          <SelectItem value="email">✉️ Email</SelectItem>
                          <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                          <SelectItem value="meeting">📅 Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={addActivity} disabled={!newNote.trim()} className="bg-[#0F172A]">Aggiungi</Button>
                    </div>
                    <Textarea rows={3} value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Cos'è successo? (es. chiamato, non risponde, richiamare domani)" />
                  </div>

                  {activities.length === 0 && <p className="text-[13px] text-[#64748B] text-center py-6">Nessuna attività registrata.</p>}

                  <ol className="relative border-l border-[#E5E7EB] ml-3 space-y-4">
                    {activities.map((a) => {
                      const Icon = ACTIVITY_ICONS[a.type] || StickyNote;
                      return (
                        <li key={a.id} className="ml-6">
                          <span className="absolute -left-3 w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center">
                            <Icon className="w-3 h-3" />
                          </span>
                          <div className="rounded-lg border border-[#E5E7EB] p-3 bg-white">
                            <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                              <span className="uppercase tracking-wider font-medium">{a.type}</span>
                              <span>{format(new Date(a.occurred_at), 'dd MMM yyyy · HH:mm', { locale: it })}</span>
                            </div>
                            {a.title && <div className="text-[14px] font-medium text-[#0F172A] mt-1">{a.title}</div>}
                            {a.description && <div className="text-[13px] text-[#0F172A] mt-1 whitespace-pre-wrap">{a.description}</div>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </TabsContent>

                <TabsContent value="quotes">
                  <p className="text-[13px] text-[#64748B]">Vai al dettaglio lead per gestire i preventivi collegati.</p>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ icon, label, value }: { icon?: React.ReactNode; label?: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-[13px]">
      {icon && <span className="text-[#64748B] mt-0.5">{icon}</span>}
      <div className="min-w-0 flex-1">
        {label && <div className="text-[11px] uppercase tracking-wider text-[#64748B]">{label}</div>}
        <div className="text-[#0F172A] truncate">{value}</div>
      </div>
    </div>
  );
}
