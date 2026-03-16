import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Search, Download, Plus, MoreVertical, Pencil, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import { getSalespersonBadgeStyle } from "@/lib/salespersonColors";
import { getRegionNames, getProvincesForRegion, getCitiesForProvince } from "@/data/italianTerritories";

const LEAD_STATUSES = [
  { value: 'nuovo', label: 'Nuovo', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'contattato', label: 'Contattato', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'qualificato', label: 'Qualificato', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'proposta', label: 'Proposta', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'vinto', label: 'Vinto', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'perso', label: 'Perso', color: 'bg-red-100 text-red-700 border-red-300' },
];

const LEAD_TYPES = [
  { value: 'rivenditore', label: 'Rivenditore' },
  { value: 'architetto', label: 'Architetto' },
  { value: 'geometra', label: 'Geometra' },
  { value: 'impresa_edile', label: 'Impresa Edile' },
  { value: 'general_contractor', label: 'General Contractor' },
  { value: 'interior_designer', label: 'Interior Designer' },
  { value: 'showroom', label: 'Showroom' },
  { value: 'posatore', label: 'Posatore' },
  { value: 'costruttore', label: 'Costruttore' },
  { value: 'privato', label: 'Privato' },
  { value: 'studio_design', label: 'Studio Design' },
  { value: 'azienda_pubblica', label: 'Azienda Pubblica' },
  { value: 'altro', label: 'Altro' },
];

const CONTACT_ROLES = [
  { value: 'titolare', label: 'Titolare' },
  { value: 'ceo', label: 'CEO' },
  { value: 'direttore_commerciale', label: 'Direttore Commerciale' },
  { value: 'responsabile_acquisti', label: 'Resp. Acquisti' },
  { value: 'architetto', label: 'Architetto' },
  { value: 'geometra', label: 'Geometra' },
  { value: 'ingegnere', label: 'Ingegnere' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'dipendente', label: 'Dipendente' },
  { value: 'altro', label: 'Altro' },
];

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string | null;
  source: string | null;
  status: string;
  assigned_salesperson_id: string | null;
  notes: string | null;
  region: string | null;
  province: string | null;
  city: string | null;
  lead_type: string | null;
  contact_person_name: string | null;
  contact_person_role: string | null;
  contact_person_email: string | null;
  contact_person_phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

interface Salesperson {
  id: string;
  first_name: string;
  last_name: string;
}

const LEAD_SOURCES = [
  { value: 'area_tecnica', label: 'Area Tecnica' },
  { value: 'sito_web', label: 'Sito Web' },
  { value: 'referral', label: 'Referral' },
  { value: 'fiera', label: 'Fiera' },
  { value: 'social', label: 'Social Media' },
  { value: 'telefono', label: 'Telefono' },
  { value: 'email', label: 'Email' },
  { value: 'altro', label: 'Altro' },
];

const emptyLeadForm = {
  name: '',
  email: '',
  phone: '',
  company_name: '',
  source: 'area_tecnica',
  status: 'nuovo',
  assigned_salesperson_id: '',
  notes: '',
  region: '',
  province: '',
  city: '',
  lead_type: '',
  contact_person_name: '',
  contact_person_role: '',
  contact_person_email: '',
  contact_person_phone: '',
  address: '',
};

const AdminLeads = () => {
  const { role, salespersonId } = useAdminAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<any>({ ...emptyLeadForm });
  const [quoteSearchOpen, setQuoteSearchOpen] = useState(false);
  const [quoteSearchTerm, setQuoteSearchTerm] = useState("");

  const isAdmin = role === 'admin';

  const { data: salespeople } = useQuery({
    queryKey: ["salespeople-list"],
    queryFn: async () => {
      const { data } = await supabase.from("salespeople").select("id, first_name, last_name").eq("is_active", true);
      return (data || []) as Salesperson[];
    },
  });

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads", salespersonId, isAdmin],
    queryFn: async () => {
      let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
      
      // Commerciali see only leads assigned to them
      if (!isAdmin && salespersonId) {
        query = query.eq("assigned_salesperson_id", salespersonId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Lead[];
    },
  });

  const getSalespersonName = (id: string | null) => {
    if (!id || !salespeople) return '-';
    const sp = salespeople.find(s => s.id === id);
    return sp ? `${sp.first_name} ${sp.last_name}` : '-';
  };

  const getSalespersonBadge = (id: string | null) => {
    if (!id || !salespeople) return <span className="text-muted-foreground">-</span>;
    const sp = salespeople.find(s => s.id === id);
    if (!sp) return <span className="text-muted-foreground">-</span>;
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={getSalespersonBadgeStyle(sp.id)}>
        {sp.first_name} {sp.last_name}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const s = LEAD_STATUSES.find(ls => ls.value === status) || LEAD_STATUSES[0];
    return <Badge variant="outline" className={`${s.color} text-xs font-medium`}>● {s.label}</Badge>;
  };

  const filteredLeads = leads?.filter(lead => {
    const matchSearch = searchTerm === '' ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company_name && lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openEdit = (lead: Lead) => {
    setEditForm({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company_name: lead.company_name || '',
      source: lead.source || 'area_tecnica',
      status: lead.status,
      assigned_salesperson_id: lead.assigned_salesperson_id || '',
      notes: lead.notes || '',
      region: lead.region || '',
      province: lead.province || '',
      city: lead.city || '',
      lead_type: lead.lead_type || '',
      contact_person_name: lead.contact_person_name || '',
      contact_person_role: lead.contact_person_role || '',
      contact_person_email: lead.contact_person_email || '',
      contact_person_phone: lead.contact_person_phone || '',
      address: lead.address || '',
    });
    setEditDialogOpen(true);
  };

  const saveEdit = async () => {
    const { error } = await supabase.from("leads").update({
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      company_name: editForm.company_name || null,
      source: editForm.source || null,
      status: editForm.status,
      assigned_salesperson_id: editForm.assigned_salesperson_id || null,
      notes: editForm.notes || null,
      region: editForm.region || null,
      province: editForm.province || null,
      city: editForm.city || null,
      lead_type: editForm.lead_type || null,
      contact_person_name: editForm.contact_person_name || null,
      contact_person_role: editForm.contact_person_role || null,
      contact_person_email: editForm.contact_person_email || null,
      contact_person_phone: editForm.contact_person_phone || null,
      address: editForm.address || null,
    } as any).eq("id", editForm.id);

    if (error) { toast.error("Errore salvataggio"); return; }
    toast.success("Lead aggiornato");
    setEditDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  const createLead = async () => {
    if (!createForm.name || !createForm.email || !createForm.phone) {
      toast.error("Nome, email e telefono sono obbligatori");
      return;
    }
    const { error } = await supabase.from("leads").insert({
      name: createForm.name,
      email: createForm.email,
      phone: createForm.phone,
      company_name: createForm.company_name || null,
      source: createForm.source || null,
      status: createForm.status || 'nuovo',
      assigned_salesperson_id: createForm.assigned_salesperson_id || null,
      notes: createForm.notes || null,
      region: createForm.region || null,
      province: createForm.province || null,
      city: createForm.city || null,
      lead_type: createForm.lead_type || null,
      contact_person_name: createForm.contact_person_name || null,
      contact_person_role: createForm.contact_person_role || null,
      contact_person_email: createForm.contact_person_email || null,
      contact_person_phone: createForm.contact_person_phone || null,
      address: createForm.address || null,
    } as any);

    if (error) { toast.error("Errore creazione lead"); return; }
    toast.success("Lead creato con successo");
    setCreateDialogOpen(false);
    setCreateForm({ ...emptyLeadForm });
    queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  const quickStatusChange = async (leadId: string, newStatus: string) => {
    const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
    if (error) { toast.error("Errore"); return; }
    queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  const exportToCsv = () => {
    if (!leads || leads.length === 0) { toast.error("Nessun lead"); return; }
    const headers = ["Nome", "Email", "Telefono", "Azienda", "Stato", "Responsabile", "Data"];
    const csvContent = [
      headers.join(","),
      ...leads.map(l => [
        `"${l.name}"`, `"${l.email}"`, `"${l.phone}"`, `"${l.company_name || ''}"`,
        `"${l.status}"`, `"${getSalespersonName(l.assigned_salesperson_id)}"`,
        `"${format(new Date(l.created_at), "dd/MM/yyyy HH:mm", { locale: it })}"`,
      ].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Export completato");
  };

  const statCounts = {
    total: leads?.length || 0,
    nuovo: leads?.filter(l => l.status === 'nuovo').length || 0,
    contattato: leads?.filter(l => l.status === 'contattato').length || 0,
    qualificato: leads?.filter(l => l.status === 'qualificato').length || 0,
    proposta: leads?.filter(l => l.status === 'proposta').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Lead &gt; Lista</p>
          <h1 className="text-2xl font-bold">Lead</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setCreateForm({ ...emptyLeadForm }); setCreateDialogOpen(true); }} size="sm">
            <Plus className="w-4 h-4 mr-2" />Aggiungi Lead
          </Button>
          <Button onClick={exportToCsv} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />Esporta
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Totale', count: statCounts.total, color: '' },
          { label: 'Nuovi', count: statCounts.nuovo, color: 'text-blue-600' },
          { label: 'Contattati', count: statCounts.contattato, color: 'text-orange-600' },
          { label: 'Qualificati', count: statCounts.qualificato, color: 'text-green-600' },
          { label: 'Proposta', count: statCounts.proposta, color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cerca..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Stato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                {LEAD_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referente</TableHead>
                <TableHead>Azienda</TableHead>
                <TableHead>Tipologia</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Commerciale</TableHead>
                <TableHead>Creato il</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Caricamento...</TableCell></TableRow>
              ) : filteredLeads && filteredLeads.length > 0 ? (
                filteredLeads.map(lead => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailLead(lead)}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.company_name || '-'}</TableCell>
                    <TableCell>{(lead as any).lead_type ? <Badge variant="outline" className="text-xs">{LEAD_TYPES.find(t => t.value === (lead as any).lead_type)?.label || (lead as any).lead_type}</Badge> : '-'}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>{getSalespersonBadge(lead.assigned_salesperson_id)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(lead.created_at), "dd MMM yyyy · HH:mm", { locale: it })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(lead); }}>
                            <Pencil className="w-4 h-4 mr-2" />Modifica
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDetailLead(lead); }}>
                            <Eye className="w-4 h-4 mr-2" />Dettaglio
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nessun lead trovato" : "Nessun lead registrato"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lead Form Dialog (shared for create & edit) */}
      {[
        { open: editDialogOpen, setOpen: setEditDialogOpen, form: editForm, setForm: setEditForm, onSave: saveEdit, title: "Modifica Lead", desc: "Aggiorna i dati e lo stato del lead", btnLabel: "Salva Modifiche" },
        { open: createDialogOpen, setOpen: setCreateDialogOpen, form: createForm, setForm: setCreateForm, onSave: createLead, title: "Nuovo Lead", desc: "Inserisci i dati del nuovo lead", btnLabel: "Crea Lead" },
      ].map((dlg, idx) => (
        <Dialog key={idx} open={dlg.open} onOpenChange={dlg.setOpen}>
           <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{dlg.title}</DialogTitle>
              <DialogDescription>{dlg.desc}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Sezione Azienda */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">Dati Azienda</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Azienda</Label>
                  <Input value={dlg.form.company_name || ''} onChange={e => dlg.setForm({ ...dlg.form, company_name: e.target.value })} placeholder="Azienda S.r.l." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tipologia</Label>
                  <Select value={dlg.form.lead_type || 'none'} onValueChange={v => dlg.setForm({ ...dlg.form, lead_type: v === 'none' ? '' : v })}>
                    <SelectTrigger><SelectValue placeholder="Seleziona tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-</SelectItem>
                      {LEAD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Email azienda *</Label>
                  <Input type="email" value={dlg.form.email || ''} onChange={e => dlg.setForm({ ...dlg.form, email: e.target.value })} placeholder="info@azienda.it" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Telefono azienda *</Label>
                  <Input value={dlg.form.phone || ''} onChange={e => dlg.setForm({ ...dlg.form, phone: e.target.value })} placeholder="+39 06 1234567" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Indirizzo</Label>
                <Input value={dlg.form.address || ''} onChange={e => dlg.setForm({ ...dlg.form, address: e.target.value })} placeholder="Via Roma 1" />
              </div>

              {/* Sezione Persona di Riferimento */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1 mt-2">Persona di Riferimento</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome referente *</Label>
                  <Input value={dlg.form.name || ''} onChange={e => dlg.setForm({ ...dlg.form, name: e.target.value })} placeholder="Mario Rossi" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ruolo</Label>
                  <Select value={dlg.form.contact_person_role || 'none'} onValueChange={v => dlg.setForm({ ...dlg.form, contact_person_role: v === 'none' ? '' : v })}>
                    <SelectTrigger><SelectValue placeholder="Seleziona ruolo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-</SelectItem>
                      {CONTACT_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Email referente</Label>
                  <Input type="email" value={dlg.form.contact_person_email || ''} onChange={e => dlg.setForm({ ...dlg.form, contact_person_email: e.target.value })} placeholder="mario@azienda.it" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Telefono referente</Label>
                  <Input value={dlg.form.contact_person_phone || ''} onChange={e => dlg.setForm({ ...dlg.form, contact_person_phone: e.target.value })} placeholder="+39 333 1234567" />
                </div>
              </div>

              {/* Sezione Gestione */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1 mt-2">Gestione Lead</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Stato</Label>
                  <Select value={dlg.form.status || 'nuovo'} onValueChange={v => dlg.setForm({ ...dlg.form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fonte</Label>
                  <Select value={dlg.form.source || 'area_tecnica'} onValueChange={v => dlg.setForm({ ...dlg.form, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Commerciale</Label>
                  <Select value={dlg.form.assigned_salesperson_id || 'none'} onValueChange={v => dlg.setForm({ ...dlg.form, assigned_salesperson_id: v === 'none' ? '' : v })}>
                    <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nessuno</SelectItem>
                      {salespeople?.map(sp => (
                        <SelectItem key={sp.id} value={sp.id}>{sp.first_name} {sp.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Localizzazione */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Regione</Label>
                  <Select value={dlg.form.region || 'none'} onValueChange={v => dlg.setForm({ ...dlg.form, region: v === 'none' ? '' : v, province: '', city: '' })}>
                    <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-</SelectItem>
                      {getRegionNames().map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Provincia</Label>
                  <Select value={dlg.form.province || 'none'} onValueChange={v => dlg.setForm({ ...dlg.form, province: v === 'none' ? '' : v, city: '' })} disabled={!dlg.form.region}>
                    <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-</SelectItem>
                      {dlg.form.region && getProvincesForRegion(dlg.form.region).map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Città</Label>
                  <Select value={dlg.form.city || 'none'} onValueChange={v => dlg.setForm({ ...dlg.form, city: v === 'none' ? '' : v })} disabled={!dlg.form.province}>
                    <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-</SelectItem>
                      {dlg.form.province && dlg.form.region && getCitiesForProvince(dlg.form.region, dlg.form.province).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Note / Dettagli</Label>
                <Textarea value={dlg.form.notes || ''} onChange={e => dlg.setForm({ ...dlg.form, notes: e.target.value })} rows={3} placeholder="Dettagli, next steps..." />
              </div>
              <Button onClick={dlg.onSave} className="w-full">{dlg.btnLabel}</Button>
            </div>
          </DialogContent>
        </Dialog>
      ))}

      {/* Detail Sheet */}
      <Sheet open={!!detailLead} onOpenChange={open => { if (!open) setDetailLead(null); }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detailLead?.company_name || detailLead?.name}</SheetTitle>
          </SheetHeader>
          {detailLead && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(detailLead.status)}
                {(detailLead as any).lead_type && (
                  <Badge variant="secondary" className="text-xs">{LEAD_TYPES.find(t => t.value === (detailLead as any).lead_type)?.label || (detailLead as any).lead_type}</Badge>
                )}
                <span className="ml-auto">
                  {detailLead.assigned_salesperson_id 
                    ? getSalespersonBadge(detailLead.assigned_salesperson_id)
                    : <span className="text-sm text-muted-foreground">Non assegnato</span>}
                </span>
              </div>

              {/* Dati Azienda */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Dati Azienda</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0 space-y-2 text-sm">
                  {detailLead.company_name && <div className="flex justify-between"><span className="text-muted-foreground">Azienda</span><span>{detailLead.company_name}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{detailLead.email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Telefono</span><span>{detailLead.phone}</span></div>
                  {(detailLead as any).address && <div className="flex justify-between"><span className="text-muted-foreground">Indirizzo</span><span>{(detailLead as any).address}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Fonte</span><Badge variant="secondary">{detailLead.source || 'area_tecnica'}</Badge></div>
                  {detailLead.region && <div className="flex justify-between"><span className="text-muted-foreground">Località</span><span>{[detailLead.city, detailLead.province, detailLead.region].filter(Boolean).join(', ')}</span></div>}
                </CardContent>
              </Card>

              {/* Persona di Riferimento */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Persona di Riferimento</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Nome</span><span>{detailLead.name}</span></div>
                  {(detailLead as any).contact_person_role && <div className="flex justify-between"><span className="text-muted-foreground">Ruolo</span><Badge variant="outline">{CONTACT_ROLES.find(r => r.value === (detailLead as any).contact_person_role)?.label || (detailLead as any).contact_person_role}</Badge></div>}
                  {(detailLead as any).contact_person_email && <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{(detailLead as any).contact_person_email}</span></div>}
                  {(detailLead as any).contact_person_phone && <div className="flex justify-between"><span className="text-muted-foreground">Telefono</span><span>{(detailLead as any).contact_person_phone}</span></div>}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Data creazione</span><span>{format(new Date(detailLead.created_at), "dd MMM yyyy, HH:mm", { locale: it })}</span></div>
                </CardContent>
              </Card>

              {detailLead.notes && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Note</CardTitle></CardHeader>
                  <CardContent className="text-sm whitespace-pre-wrap">{detailLead.notes}</CardContent>
                </Card>
              )}
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => { openEdit(detailLead); setDetailLead(null); }}>
                  <Pencil className="w-4 h-4 mr-2" />Modifica
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLeads;
