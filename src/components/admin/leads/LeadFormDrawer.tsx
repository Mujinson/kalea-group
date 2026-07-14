import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Copy, Building2, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { LEAD_STATUSES, LEAD_SOURCES, LEAD_LANGUAGES, LEAD_PROFESSIONS, LEAD_COMPANY_TYPES, COUNTRIES } from './leadConstants';
import { getRegionNames, getProvincesForRegion } from '@/data/italianTerritories';

type LeadForm = Record<string, any>;

const emptyForm: LeadForm = {
  contact_type: 'azienda',
  language: 'it',
  source: '',
  company_name: '', vat_number: '', lead_type: '',
  first_name: '', last_name: '', profession: '',
  email: '', phone: '', linkedin_url: '', website: '',
  country: 'Italia', address: '', postal_code: '', city: '', province: '', region: '',
  site_country: 'Italia', site_address: '', site_postal_code: '', site_city: '', site_province: '',
  project_name: '', message: '', has_thermal_insulation: false, visited_showroom: false,
  status: 'nuovo', pipeline_stage: 'cold',
  assigned_salesperson_id: '', assigned_user_id: '', referrer_id: '',
  notes: '',
};

interface Props {
  open: boolean;
  onClose: () => void;
  leadId?: string | null;
  onSaved?: () => void;
}

export default function LeadFormDrawer({ open, onClose, leadId, onSaved }: Props) {
  const [form, setForm] = useState<LeadForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!leadId;

  const { data: salespeople } = useQuery({
    queryKey: ['salespeople-active'],
    queryFn: async () => {
      const { data } = await supabase.from('salespeople').select('id, first_name, last_name, user_id').eq('is_active', true);
      return data || [];
    },
    enabled: open,
  });

  const { data: assignableUsers } = useQuery({
    queryKey: ['assignable-users'],
    queryFn: async () => {
      const { data: roles } = await supabase.from('user_roles').select('user_id, role').in('role', ['commerciale', 'ibrido'] as any);
      const ids = Array.from(new Set((roles || []).map((r: any) => r.user_id)));
      if (!ids.length) return [];
      const { data: sp } = await supabase.from('salespeople').select('user_id, first_name, last_name').in('user_id', ids);
      const map = new Map((sp || []).map((s: any) => [s.user_id, `${s.first_name} ${s.last_name}`]));
      return ids.map((id) => ({ user_id: id, name: map.get(id) || 'Utente', role: (roles || []).find((r: any) => r.user_id === id)?.role }));
    },
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    if (!leadId) { setForm({ ...emptyForm }); return; }
    setLoading(true);
    supabase.from('leads').select('*').eq('id', leadId).maybeSingle().then(({ data }) => {
      if (data) setForm({ ...emptyForm, ...data });
      setLoading(false);
    });
  }, [open, leadId]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const copyContactToSite = () => {
    setForm((f) => ({
      ...f,
      site_country: f.country,
      site_address: f.address,
      site_postal_code: f.postal_code,
      site_city: f.city,
      site_province: f.province,
    }));
    toast.success('Indirizzo copiato');
  };

  const computedName = () => {
    if (form.contact_type === 'privato') {
      const full = `${form.first_name || ''} ${form.last_name || ''}`.trim();
      return full || form.company_name || 'Nuovo Lead';
    }
    return form.company_name || `${form.first_name || ''} ${form.last_name || ''}`.trim() || 'Nuovo Lead';
  };

  const save = async () => {
    if (!form.email && !form.phone) {
      toast.error('Inserisci almeno email o telefono');
      return;
    }
    if (form.contact_type === 'azienda' && !form.company_name) {
      toast.error('Ragione sociale obbligatoria per Azienda');
      return;
    }
    if (form.contact_type === 'privato' && !form.last_name) {
      toast.error('Cognome obbligatorio per Privato');
      return;
    }
    setSaving(true);
    const payload: any = {
      name: computedName(),
      contact_type: form.contact_type,
      language: form.language,
      source: form.source || null,
      company_name: form.company_name || null,
      vat_number: form.vat_number || null,
      lead_type: form.lead_type || null,
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      profession: form.profession || null,
      email: form.email || null,
      phone: form.phone || null,
      linkedin_url: form.linkedin_url || null,
      website: form.website || null,
      country: form.country || null,
      address: form.address || null,
      postal_code: form.postal_code || null,
      city: form.city || null,
      province: form.province || null,
      region: form.region || null,
      site_country: form.site_country || null,
      site_address: form.site_address || null,
      site_postal_code: form.site_postal_code || null,
      site_city: form.site_city || null,
      site_province: form.site_province || null,
      project_name: form.project_name || null,
      message: form.message || null,
      has_thermal_insulation: !!form.has_thermal_insulation,
      visited_showroom: !!form.visited_showroom,
      status: form.status,
      pipeline_stage: form.pipeline_stage || 'cold',
      assigned_salesperson_id: form.assigned_salesperson_id || null,
      assigned_user_id: form.assigned_user_id || null,
      referrer_id: form.referrer_id || null,
      notes: form.notes || null,
    };

    let leadDbId = leadId as string | undefined;
    if (isEdit) {
      const { error } = await supabase.from('leads').update(payload).eq('id', leadId!);
      if (error) { toast.error('Errore: ' + error.message); setSaving(false); return; }
    } else {
      const { data: userData } = await supabase.auth.getUser();
      payload.created_by_user_id = userData.user?.id;
      const { data, error } = await supabase.from('leads').insert(payload).select('id').maybeSingle();
      if (error) { toast.error('Errore: ' + error.message); setSaving(false); return; }
      leadDbId = data?.id;

      // log activity
      if (leadDbId && userData.user) {
        await supabase.from('lead_activities' as any).insert({
          lead_id: leadDbId,
          user_id: userData.user.id,
          type: 'note',
          title: 'Lead creato',
          description: 'Nuovo lead inserito nel CRM',
        });
      }
    }
    toast.success(isEdit ? 'Lead aggiornato' : 'Lead creato');
    setSaving(false);
    onSaved?.();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
        <div className="sticky top-0 z-20 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-[#64748B]">Lead · {isEdit ? 'Modifica' : 'Nuovo'}</div>
            <SheetTitle className="text-[22px] font-semibold text-[#0F172A] mt-0.5">
              {isEdit ? computedName() : 'Nuovo Lead'}
            </SheetTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Annulla</Button>
            <Button size="sm" onClick={save} disabled={saving || loading} className="bg-[#0F172A] hover:bg-[#0F172A]/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salva
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#0F172A]" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-0">
            {/* MAIN */}
            <div className="p-6 space-y-6 border-r border-[#E5E7EB]">
              {/* Provenienza & lingua */}
              <section className="space-y-3">
                <SectionTitle>Provenienza</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Provenienza" required>
                    <Select value={form.source || ''} onValueChange={(v) => set('source', v)}>
                      <SelectTrigger><SelectValue placeholder="Seleziona un'opzione" /></SelectTrigger>
                      <SelectContent>
                        {LEAD_SOURCES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Lingua" required>
                    <Select value={form.language} onValueChange={(v) => set('language', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LEAD_LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </section>

              {/* Contatto */}
              <section className="space-y-3">
                <SectionTitle>Contatto</SectionTitle>
                <div className="flex gap-2">
                  <TypeButton active={form.contact_type === 'azienda'} onClick={() => set('contact_type', 'azienda')} icon={<Building2 className="w-4 h-4" />} label="Azienda" />
                  <TypeButton active={form.contact_type === 'privato'} onClick={() => set('contact_type', 'privato')} icon={<User className="w-4 h-4" />} label="Privato" />
                </div>

                {form.contact_type === 'azienda' && (
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Ragione sociale" required>
                      <Input value={form.company_name || ''} onChange={(e) => set('company_name', e.target.value)} />
                    </Field>
                    <Field label="Tipologia azienda">
                      <Select value={form.lead_type || ''} onValueChange={(v) => set('lead_type', v)}>
                        <SelectTrigger><SelectValue placeholder="Seleziona un'opzione" /></SelectTrigger>
                        <SelectContent>
                          {LEAD_COMPANY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Partita IVA">
                      <Input value={form.vat_number || ''} onChange={(e) => set('vat_number', e.target.value)} />
                    </Field>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <Field label="Cognome" required={form.contact_type === 'privato'}>
                    <Input value={form.last_name || ''} onChange={(e) => set('last_name', e.target.value)} />
                  </Field>
                  <Field label="Nome" required={form.contact_type === 'privato'}>
                    <Input value={form.first_name || ''} onChange={(e) => set('first_name', e.target.value)} />
                  </Field>
                  <Field label="Professione">
                    <Select value={form.profession || ''} onValueChange={(v) => set('profession', v)}>
                      <SelectTrigger><SelectValue placeholder="Seleziona un'opzione" /></SelectTrigger>
                      <SelectContent>
                        {LEAD_PROFESSIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email"><Input type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} /></Field>
                  <Field label="Telefono"><Input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="LinkedIn"><Input value={form.linkedin_url || ''} onChange={(e) => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/…" /></Field>
                  <Field label="Sito web"><Input value={form.website || ''} onChange={(e) => set('website', e.target.value)} placeholder="https://…" /></Field>
                </div>

                <AddressGrid
                  prefix=""
                  form={form}
                  set={set}
                />

                <label className="flex items-center gap-3 pt-2">
                  <Switch checked={!!form.visited_showroom} onCheckedChange={(v) => set('visited_showroom', v)} />
                  <span className="text-sm text-[#0F172A]">Ha visitato la sala mostra</span>
                </label>
              </section>

              {/* Richiesta / Progetto */}
              <section className="space-y-3">
                <SectionTitle>Richiesta</SectionTitle>
                <Field label="Nome progetto">
                  <Input value={form.project_name || ''} onChange={(e) => set('project_name', e.target.value)} />
                </Field>

                <div className="space-y-2 border border-[#E5E7EB] rounded-lg p-4">
                  <div className="text-[13px] font-medium text-[#0F172A]">Indirizzo cantiere</div>
                  <AddressGrid prefix="site_" form={form} set={set} />
                  <button
                    type="button"
                    onClick={copyContactToSite}
                    className="inline-flex items-center gap-1.5 text-[13px] text-[#0F172A] hover:text-[#0F172A]/70 mt-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copia indirizzo dal contatto
                  </button>
                </div>

                <Field label="Richiesta / Dettagli">
                  <Textarea rows={5} value={form.message || ''} onChange={(e) => set('message', e.target.value)} placeholder="Descrizione della richiesta, materiali, tempistiche…" />
                </Field>

                <label className="flex items-center gap-3">
                  <Switch checked={!!form.has_thermal_insulation} onCheckedChange={(v) => set('has_thermal_insulation', v)} />
                  <span className="text-sm text-[#0F172A]">Ha un isolamento termico</span>
                </label>
              </section>

              <section className="space-y-3">
                <SectionTitle>Note interne</SectionTitle>
                <Textarea rows={4} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} />
              </section>
            </div>

            {/* SIDEBAR */}
            <div className="p-6 space-y-5 bg-[#F8FAFC]">
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-widest text-[#64748B]">Stato <span className="text-red-500">*</span></div>
                <Select value={form.status} onValueChange={(v) => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                          {s.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-widest text-[#64748B]">Segnalatore</div>
                <Select value={form.referrer_id || ''} onValueChange={(v) => set('referrer_id', v === '__none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Seleziona un'opzione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Nessuno</SelectItem>
                    {(salespeople || []).map((sp: any) => (
                      <SelectItem key={sp.id} value={sp.id}>{sp.first_name} {sp.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-widest text-[#64748B]">Responsabile <span className="text-red-500">*</span></div>
                <Select value={form.assigned_salesperson_id || ''} onValueChange={(v) => set('assigned_salesperson_id', v === '__none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Nessuno</SelectItem>
                    {(salespeople || []).map((sp: any) => (
                      <SelectItem key={sp.id} value={sp.id}>{sp.first_name} {sp.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-widest text-[#64748B]">Assegna a utente</div>
                <Select value={form.assigned_user_id || ''} onValueChange={(v) => set('assigned_user_id', v === '__none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Nessuno" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Nessuno</SelectItem>
                    {(assignableUsers || []).map((u: any) => (
                      <SelectItem key={u.user_id} value={u.user_id}>{u.name} · {u.role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-[#64748B]">Riceverà una notifica.</p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[15px] font-semibold text-[#0F172A] border-b border-[#E5E7EB] pb-2">{children}</h3>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] text-[#0F172A]">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function TypeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 h-10 rounded-lg border text-[13px] font-medium transition ${
        active ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-crm-primary text-white shadow-crm-sm border-[#E5E7EB] hover:border-[#0F172A]'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function AddressGrid({ prefix, form, set }: { prefix: string; form: LeadForm; set: (k: string, v: any) => void }) {
  const k = (name: string) => `${prefix}${name}`;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Paese">
          <Select value={form[k('country')] || 'Italia'} onValueChange={(v) => set(k('country'), v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Indirizzo">
          <Input value={form[k('address')] || ''} onChange={(e) => set(k('address'), e.target.value)} placeholder="Via, numero civico" />
        </Field>
      </div>
      <div className="grid grid-cols-[100px_1fr_120px] gap-3">
        <Field label="CAP"><Input value={form[k('postal_code')] || ''} onChange={(e) => set(k('postal_code'), e.target.value)} /></Field>
        <Field label="Città"><Input value={form[k('city')] || ''} onChange={(e) => set(k('city'), e.target.value)} /></Field>
        <Field label="Provincia"><Input value={form[k('province')] || ''} onChange={(e) => set(k('province'), e.target.value)} placeholder="MI" maxLength={2} /></Field>
      </div>
    </div>
  );
}
