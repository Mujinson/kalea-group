import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Phone, Mail, MapPin, User, Loader2, Plus, Search, Filter as FilterIcon, Building2 } from 'lucide-react';
import LeadFormDrawer from '@/components/admin/leads/LeadFormDrawer';
import { LeadStatusBadge } from '@/components/admin/leads/LeadStatusBadge';
import { LEAD_STATUSES, sourceLabel } from '@/components/admin/leads/leadConstants';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CommercialeLeads = () => {
  const { user, salespersonId } = useAdminAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let q = supabase
      .from('leads')
      .select('id,code,name,first_name,last_name,contact_type,phone,email,city,province,project_name,pipeline_stage,status,source,last_interaction_at,created_at,archived_at,deleted_at,assigned_salesperson_id,assigned_user_id,created_by_user_id,company_name')
      .is('archived_at', null)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(200);

    const orParts = [`assigned_user_id.eq.${user.id}`, `created_by_user_id.eq.${user.id}`];
    if (salespersonId) orParts.push(`assigned_salesperson_id.eq.${salespersonId}`);
    q = q.or(orParts.join(','));
    const { data } = await q;
    setLeads(data || []);
    setLoading(false);
  }, [user, salespersonId]);

  useEffect(() => { if (user) load(); }, [user, load]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false;
      if (!s) return true;
      const hay = [l.code, l.name, l.company_name, l.email, l.phone, l.city, l.first_name, l.last_name].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(s);
    });
  }, [leads, search, statusFilter]);

  const basePath = window.location.pathname.startsWith('/app/ibrido') ? '/app/ibrido' : '/app/commerciale';

  return (
    <div className="p-4 space-y-3 pb-32">
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider">I miei Lead</p>
          <h1 className="text-[24px] font-semibold text-[#1E1B4B] mt-1">
            {filtered.length} {filtered.length === 1 ? 'contatto' : 'contatti'}
          </h1>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C7B6B]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca…"
            className="w-full h-11 pl-10 pr-3 rounded-lg border border-[#E5E2DD] bg-white text-[14px] text-[#1E1B4B] focus:outline-none focus:border-[#1E1B4B]"
          />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className="h-11 px-3 rounded-lg border border-[#E5E2DD] bg-white text-[#1E1B4B] flex items-center gap-1.5 relative"
        >
          <FilterIcon className="w-4 h-4" />
          {statusFilter && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1E1B4B] text-white text-[9px] flex items-center justify-center">1</span>}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#1E1B4B]" /></div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258]">
          Nessun lead trovato.
        </div>
      )}

      {filtered.map((l) => {
        const display = l.contact_type === 'privato'
          ? `${l.first_name || ''} ${l.last_name || ''}`.trim() || l.name
          : l.company_name || l.name;
        const place = [l.city, l.province].filter(Boolean).join(', ');
        return (
          <div key={l.id} className="bg-white rounded-xl border border-[#E5E2DD] p-4 space-y-2">
            <a href={`${basePath}/lead/${l.id}`} className="block space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {l.contact_type === 'privato' ? <User className="w-4 h-4 text-[#8C7B6B] shrink-0" /> : <Building2 className="w-4 h-4 text-[#8C7B6B] shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-[16px] font-semibold text-[#1E1B4B] truncate">{display}</div>
                    {l.code && <div className="text-[10px] font-mono text-[#8C7B6B] uppercase tracking-wider">{l.code}</div>}
                  </div>
                </div>
                <LeadStatusBadge status={l.status} />
              </div>

              {l.project_name && <div className="text-[13px] text-[#1E1B4B]">📐 {l.project_name}</div>}
              <div className="flex items-center gap-3 text-[12px] text-[#8C7B6B]">
                {place && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{place}</span>}
                {l.source && <span>· {sourceLabel(l.source)}</span>}
              </div>
            </a>

            <div className="flex gap-2 pt-1">
              {l.phone && (
                <a href={`tel:${l.phone}`} className="flex-1 h-11 rounded-lg bg-[#1E1B4B] text-white text-[13px] font-medium flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> Chiama
                </a>
              )}
              {l.email && (
                <a href={`mailto:${l.email}`} className="flex-1 h-11 rounded-lg border border-[#E5E2DD] text-[#1E1B4B] text-[13px] font-medium flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
            </div>
          </div>
        );
      })}

      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-[#1E1B4B] text-white shadow-lg flex items-center justify-center"
        aria-label="Nuovo lead"
      >
        <Plus className="w-6 h-6" />
      </button>

      <LeadFormDrawer open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} />

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader><SheetTitle>Filtri</SheetTitle></SheetHeader>
          <div className="pt-4 space-y-3">
            <div>
              <label className="text-[12px] uppercase tracking-wider text-[#8C7B6B]">Stato</label>
              <Select value={statusFilter || '__all'} onValueChange={(v) => setStatusFilter(v === '__all' ? '' : v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutti gli stati</SelectItem>
                  {LEAD_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setStatusFilter(''); setFilterOpen(false); }} className="flex-1 h-11 rounded-lg border border-[#E5E2DD] text-[#1E1B4B] text-[13px] font-medium">Reimposta</button>
              <button onClick={() => setFilterOpen(false)} className="flex-1 h-11 rounded-lg bg-[#1E1B4B] text-white text-[13px] font-medium">Applica</button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CommercialeLeads;
