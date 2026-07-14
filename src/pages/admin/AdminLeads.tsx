import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Search, Plus, Filter as FilterIcon, Columns3, Download, MoreVertical,
  Pencil, Eye, Archive, ArchiveRestore, Trash2, FileText, MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import { fetchAllRows } from '@/lib/fetchAllRows';
import { CrmPageHeader, CrmKpiTile, CrmKpiRow, CrmTableCard } from '@/components/admin/CrmShell';
import LeadFormDrawer from '@/components/admin/leads/LeadFormDrawer';
import LeadDetailSheet from '@/components/admin/leads/LeadDetailSheet';
import { LeadStatusBadge } from '@/components/admin/leads/LeadStatusBadge';
import { LEAD_STATUSES, LEAD_SOURCES, sourceLabel } from '@/components/admin/leads/leadConstants';
import { getSalespersonBadgeStyle } from '@/lib/salespersonColors';

const ALL_COLUMNS = [
  { key: 'code', label: 'Codice', default: true },
  { key: 'name', label: 'Nome contatto', default: true, sticky: true },
  { key: 'company_name', label: 'Cliente', default: true },
  { key: 'status', label: 'Stato', default: true },
  { key: 'responsibile', label: 'Responsabile', default: true },
  { key: 'created_at', label: 'Creato il', default: true },
  { key: 'email', label: 'Email', default: false },
  { key: 'phone', label: 'Telefono', default: false },
  { key: 'contact_type', label: 'Tipologia', default: false },
  { key: 'city', label: 'Città', default: false },
  { key: 'source', label: 'Provenienza', default: false },
  { key: 'project_name', label: 'Progetto', default: false },
  { key: 'last_interaction_at', label: 'Ultima interazione', default: false },
];

const COLS_STORAGE_KEY = 'admin_leads_visible_cols_v1';

export default function AdminLeads() {
  const { role, salespersonId } = useAdminAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isAdmin = role === 'admin';

  // State
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{
    status: string; source: string; country: string; salespersonId: string;
    referrerId: string; archived: 'without' | 'only' | 'all'; deleted: 'without' | 'only' | 'all';
  }>({
    status: '', source: '', country: '', salespersonId: '', referrerId: '',
    archived: 'without', deleted: 'without',
  });
  const [visibleCols, setVisibleCols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(COLS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ALL_COLUMNS.filter((c) => c.default).map((c) => c.key);
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const toggleCol = (key: string) => {
    setVisibleCols((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      try { localStorage.setItem(COLS_STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const { data: salespeople } = useQuery({
    queryKey: ['salespeople-list'],
    queryFn: async () => {
      const { data } = await supabase.from('salespeople').select('id, first_name, last_name').eq('is_active', true);
      return data || [];
    },
  });

  const { data: leads, isLoading } = useQuery({
    queryKey: ['admin-leads', isAdmin, salespersonId],
    queryFn: async () => {
      let q = supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (!isAdmin && salespersonId) q = q.eq('assigned_salesperson_id', salespersonId);
      return fetchAllRows<any>(q);
    },
  });

  const spName = (id: string | null) => {
    if (!id) return null;
    const s = (salespeople || []).find((x: any) => x.id === id);
    return s ? `${s.first_name} ${s.last_name}` : null;
  };

  const filtered = useMemo(() => {
    if (!leads) return [];
    const s = search.trim().toLowerCase();
    return leads.filter((l: any) => {
      if (filters.archived === 'without' && l.archived_at) return false;
      if (filters.archived === 'only' && !l.archived_at) return false;
      if (filters.deleted === 'without' && l.deleted_at) return false;
      if (filters.deleted === 'only' && !l.deleted_at) return false;
      if (filters.status && l.status !== filters.status) return false;
      if (filters.source && l.source !== filters.source) return false;
      if (filters.country && l.country !== filters.country) return false;
      if (filters.salespersonId && l.assigned_salesperson_id !== filters.salespersonId) return false;
      if (filters.referrerId && l.referrer_id !== filters.referrerId) return false;
      if (s) {
        const hay = [l.code, l.name, l.company_name, l.email, l.phone, l.city, l.first_name, l.last_name, l.project_name]
          .filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [leads, filters, search]);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'archived' || k === 'deleted') return v !== 'without';
    return !!v;
  }).length;

  const resetFilters = () => setFilters({ status: '', source: '', country: '', salespersonId: '', referrerId: '', archived: 'without', deleted: 'without' });

  const archive = async (id: string, restore = false) => {
    const { error } = await supabase.from('leads').update({ archived_at: restore ? null : new Date().toISOString() } as any).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(restore ? 'Ripristinato' : 'Archiviato');
    qc.invalidateQueries({ queryKey: ['admin-leads'] });
  };
  const softDelete = async (id: string, restore = false) => {
    const { error } = await supabase.from('leads').update({ deleted_at: restore ? null : new Date().toISOString() } as any).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(restore ? 'Ripristinato' : 'Eliminato');
    qc.invalidateQueries({ queryKey: ['admin-leads'] });
  };

  const goCreateQuote = (l: any) => {
    const p = new URLSearchParams();
    p.set('leadName', l.company_name || l.name);
    if (l.email) p.set('leadEmail', l.email);
    if (l.phone) p.set('leadPhone', l.phone);
    if (l.city) p.set('leadCity', l.city);
    if (l.address) p.set('leadAddress', l.address);
    p.set('leadId', l.id);
    navigate(`/admin/preventivi/nuovo?${p.toString()}`);
  };

  const exportCsv = () => {
    if (!filtered.length) return toast.error('Nessun lead');
    const headers = ['Codice', 'Nome', 'Cliente', 'Email', 'Telefono', 'Città', 'Stato', 'Responsabile', 'Provenienza', 'Creato il'];
    const rows = filtered.map((l: any) => [
      l.code, l.name, l.company_name || '', l.email || '', l.phone || '', l.city || '',
      l.status, spName(l.assigned_salesperson_id) || '', sourceLabel(l.source),
      format(new Date(l.created_at), 'dd/MM/yyyy HH:mm'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('Export CSV completato');
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { total: filtered.length };
    LEAD_STATUSES.forEach((s) => (c[s.value] = 0));
    filtered.forEach((l: any) => { if (c[l.status] !== undefined) c[l.status]++; });
    return c;
  }, [filtered]);

  return (
    <div className="space-y-4">
      <CrmPageHeader
        breadcrumb={['CRM', 'Lead']}
        title="Lead"
        subtitle={`${filtered.length} contatt${filtered.length === 1 ? 'o' : 'i'} · pipeline aggiornata`}
        actions={
          <>
            <Button onClick={() => navigate('/admin/map?layer=leads')} size="sm" variant="secondary" className="bg-white/15 hover:bg-white/25 text-white border-0">
              <MapPin className="w-4 h-4 mr-2" />Mappa
            </Button>
            <Button onClick={exportCsv} size="sm" variant="secondary" className="bg-white/15 hover:bg-white/25 text-white border-0">
              <Download className="w-4 h-4 mr-2" />Esporta
            </Button>
            <Button onClick={() => { setEditingId(null); setFormOpen(true); }} size="sm" className="bg-white text-[#0F172A] hover:bg-white/90">
              <Plus className="w-4 h-4 mr-2" />Nuovo
            </Button>
          </>
        }
      />

      <CrmKpiRow cols={5}>
        <CrmKpiTile label="Totale" value={counts.total} color="indigo" />
        <CrmKpiTile label="Nuovi" value={counts.nuovo} color="blue" />
        <CrmKpiTile label="Contattati" value={counts.contattato} color="orange" />
        <CrmKpiTile label="Qualificati" value={counts.qualificato} color="green" />
        <CrmKpiTile label="Proposta" value={counts.proposta} color="amber" />
      </CrmKpiRow>

      <CrmTableCard>
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input placeholder="Cerca codice, nome, email, città…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-[#F1F5F9]/60 border-0" />
          </div>

          {/* Filter popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <FilterIcon className="w-4 h-4 mr-2" />Filtri
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#0F172A] text-white text-[10px]">{activeFilterCount}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[520px] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[14px] font-semibold text-[#0F172A]">Filtri</div>
                <button onClick={resetFilters} className="text-[12px] text-[#DC2626] hover:underline">Reimposta</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FilterField label="Stato">
                  <Select value={filters.status || '__all'} onValueChange={(v) => setFilters((f) => ({ ...f, status: v === '__all' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Tutti" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">Tutti</SelectItem>
                      {LEAD_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="Provenienza">
                  <Select value={filters.source || '__all'} onValueChange={(v) => setFilters((f) => ({ ...f, source: v === '__all' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Tutti" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">Tutti</SelectItem>
                      {LEAD_SOURCES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="Responsabile">
                  <Select value={filters.salespersonId || '__all'} onValueChange={(v) => setFilters((f) => ({ ...f, salespersonId: v === '__all' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Tutti" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">Tutti</SelectItem>
                      {(salespeople || []).map((sp: any) => <SelectItem key={sp.id} value={sp.id}>{sp.first_name} {sp.last_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="Segnalatore">
                  <Select value={filters.referrerId || '__all'} onValueChange={(v) => setFilters((f) => ({ ...f, referrerId: v === '__all' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Tutti" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">Tutti</SelectItem>
                      {(salespeople || []).map((sp: any) => <SelectItem key={sp.id} value={sp.id}>{sp.first_name} {sp.last_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="Lead archiviati">
                  <Select value={filters.archived} onValueChange={(v: any) => setFilters((f) => ({ ...f, archived: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="without">Senza archiviati</SelectItem>
                      <SelectItem value="only">Solo archiviati</SelectItem>
                      <SelectItem value="all">Tutti</SelectItem>
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="Record eliminati">
                  <Select value={filters.deleted} onValueChange={(v: any) => setFilters((f) => ({ ...f, deleted: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="without">Senza eliminati</SelectItem>
                      <SelectItem value="only">Solo eliminati</SelectItem>
                      <SelectItem value="all">Tutti</SelectItem>
                    </SelectContent>
                  </Select>
                </FilterField>
              </div>
            </PopoverContent>
          </Popover>

          {/* Columns popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm"><Columns3 className="w-4 h-4 mr-2" />Colonne</Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-3">
              <div className="text-[13px] font-semibold text-[#0F172A] mb-2">Colonne visibili</div>
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                {ALL_COLUMNS.map((c) => (
                  <label key={c.key} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[#F1F5F9] cursor-pointer">
                    <Checkbox checked={visibleCols.includes(c.key)} onCheckedChange={() => toggleCol(c.key)} disabled={c.sticky} />
                    <span className="text-[13px] text-[#0F172A]">{c.label}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                {ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => (
                  <th key={c.key} className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-[#64748B] font-semibold">{c.label}</th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={visibleCols.length + 1} className="text-center py-12 text-[#64748B]">Caricamento…</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={visibleCols.length + 1} className="text-center py-12 text-[#64748B]">Nessun lead trovato con i filtri correnti.</td></tr>
              )}
              {filtered.map((l: any) => {
                const display = l.contact_type === 'privato'
                  ? `${l.first_name || ''} ${l.last_name || ''}`.trim() || l.name
                  : l.name;
                return (
                  <tr key={l.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] cursor-pointer" onClick={() => setDetailId(l.id)}>
                    {visibleCols.includes('code') && <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F1F5F9] text-[11px] font-mono text-[#0F172A]">{l.code || '—'}</span></td>}
                    {visibleCols.includes('name') && <td className="px-4 py-3 font-medium text-[#0F172A]">{display}</td>}
                    {visibleCols.includes('company_name') && <td className="px-4 py-3 text-[#475569]">{l.company_name || '—'}</td>}
                    {visibleCols.includes('status') && <td className="px-4 py-3"><LeadStatusBadge status={l.status} /></td>}
                    {visibleCols.includes('responsibile') && (
                      <td className="px-4 py-3">
                        {l.assigned_salesperson_id
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={getSalespersonBadgeStyle(l.assigned_salesperson_id)}>{spName(l.assigned_salesperson_id)}</span>
                          : <span className="text-[#64748B]">—</span>}
                      </td>
                    )}
                    {visibleCols.includes('created_at') && <td className="px-4 py-3 text-[#64748B]">{format(new Date(l.created_at), 'd MMM yyyy · HH:mm', { locale: it })}</td>}
                    {visibleCols.includes('email') && <td className="px-4 py-3 text-[#475569]">{l.email || '—'}</td>}
                    {visibleCols.includes('phone') && <td className="px-4 py-3 text-[#475569]">{l.phone || '—'}</td>}
                    {visibleCols.includes('contact_type') && <td className="px-4 py-3 text-[#475569] capitalize">{l.contact_type || '—'}</td>}
                    {visibleCols.includes('city') && <td className="px-4 py-3 text-[#475569]">{l.city || '—'}</td>}
                    {visibleCols.includes('source') && <td className="px-4 py-3 text-[#475569]">{sourceLabel(l.source)}</td>}
                    {visibleCols.includes('project_name') && <td className="px-4 py-3 text-[#475569]">{l.project_name || '—'}</td>}
                    {visibleCols.includes('last_interaction_at') && <td className="px-4 py-3 text-[#64748B]">{l.last_interaction_at ? format(new Date(l.last_interaction_at), 'd MMM yyyy', { locale: it }) : '—'}</td>}
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingId(l.id); setFormOpen(true); }}><Pencil className="w-4 h-4 mr-2" />Modifica</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDetailId(l.id)}><Eye className="w-4 h-4 mr-2" />Dettaglio</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => goCreateQuote(l)}><FileText className="w-4 h-4 mr-2" />Crea preventivo</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {l.archived_at
                            ? <DropdownMenuItem onClick={() => archive(l.id, true)}><ArchiveRestore className="w-4 h-4 mr-2" />Ripristina</DropdownMenuItem>
                            : <DropdownMenuItem onClick={() => archive(l.id)}><Archive className="w-4 h-4 mr-2" />Archivia</DropdownMenuItem>}
                          {l.deleted_at
                            ? <DropdownMenuItem onClick={() => softDelete(l.id, true)}><ArchiveRestore className="w-4 h-4 mr-2" />Ripristina eliminato</DropdownMenuItem>
                            : <DropdownMenuItem className="text-red-600" onClick={() => softDelete(l.id)}><Trash2 className="w-4 h-4 mr-2" />Elimina</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CrmTableCard>

      <LeadFormDrawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        leadId={editingId}
        onSaved={() => qc.invalidateQueries({ queryKey: ['admin-leads'] })}
      />
      <LeadDetailSheet
        open={!!detailId}
        onClose={() => setDetailId(null)}
        leadId={detailId}
        onEdit={() => { const id = detailId; setDetailId(null); setEditingId(id); setFormOpen(true); }}
        onArchive={() => { if (detailId) { archive(detailId); setDetailId(null); } }}
        onCreateQuote={() => { const l = filtered.find((x: any) => x.id === detailId); if (l) goCreateQuote(l); }}
      />
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[12px] text-[#64748B]">{label}</div>
      {children}
    </div>
  );
}
