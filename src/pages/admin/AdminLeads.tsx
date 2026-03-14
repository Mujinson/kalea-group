import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Users, Search, Download, Plus, MoreVertical, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";
import { getSalespersonBadgeStyle } from "@/lib/salespersonColors";

const LEAD_STATUSES = [
  { value: 'nuovo', label: 'Nuovo', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'contattato', label: 'Contattato', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'qualificato', label: 'Qualificato', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'proposta', label: 'Proposta', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'vinto', label: 'Vinto', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'perso', label: 'Perso', color: 'bg-red-100 text-red-700 border-red-300' },
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
  created_at: string;
  updated_at: string;
}

interface Salesperson {
  id: string;
  first_name: string;
  last_name: string;
}

const AdminLeads = () => {
  const { role, salespersonId } = useAdminAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

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
      status: lead.status,
      assigned_salesperson_id: lead.assigned_salesperson_id || '',
      notes: lead.notes || '',
    });
    setEditDialogOpen(true);
  };

  const saveEdit = async () => {
    const { error } = await supabase.from("leads").update({
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      company_name: editForm.company_name || null,
      status: editForm.status,
      assigned_salesperson_id: editForm.assigned_salesperson_id || null,
      notes: editForm.notes || null,
    }).eq("id", editForm.id);

    if (error) { toast.error("Errore salvataggio"); return; }
    toast.success("Lead aggiornato");
    setEditDialogOpen(false);
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
                <TableHead>Nome contatto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Responsabile</TableHead>
                <TableHead>Creato il</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Caricamento...</TableCell></TableRow>
              ) : filteredLeads && filteredLeads.length > 0 ? (
                filteredLeads.map(lead => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailLead(lead)}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.company_name || '-'}</TableCell>
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
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nessun lead trovato" : "Nessun lead registrato"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifica Lead</DialogTitle>
            <DialogDescription>Aggiorna i dati e lo stato del lead</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nome contatto</Label>
                <Input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Azienda</Label>
                <Input value={editForm.company_name || ''} onChange={e => setEditForm({ ...editForm, company_name: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Telefono</Label>
                <Input value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Stato</Label>
                <Select value={editForm.status || 'nuovo'} onValueChange={v => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Responsabile</Label>
                <Select value={editForm.assigned_salesperson_id || ''} onValueChange={v => setEditForm({ ...editForm, assigned_salesperson_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                  <SelectContent>
                    {salespeople?.map(sp => (
                      <SelectItem key={sp.id} value={sp.id}>{sp.first_name} {sp.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Note / Dettagli conversazione</Label>
              <Textarea value={editForm.notes || ''} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} rows={4} placeholder="Cosa è stato discusso, next steps..." />
            </div>
            <Button onClick={saveEdit} className="w-full">Salva Modifiche</Button>
          </div>
        </DialogContent>
      </Dialog>

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
                {detailLead.company_name && detailLead.name && (
                  <span className="text-sm font-medium">Ref: {detailLead.name}</span>
                )}
                <span className="ml-auto">
                  {detailLead.assigned_salesperson_id 
                    ? getSalespersonBadge(detailLead.assigned_salesperson_id)
                    : <span className="text-sm text-muted-foreground">Non assegnato</span>}
                </span>
              </div>
              <Card>
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{detailLead.email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Telefono</span><span>{detailLead.phone}</span></div>
                  {detailLead.company_name && <div className="flex justify-between"><span className="text-muted-foreground">Azienda</span><span>{detailLead.company_name}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Fonte</span><Badge variant="secondary">{detailLead.source || 'area_tecnica'}</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span>{format(new Date(detailLead.created_at), "dd MMM yyyy, HH:mm", { locale: it })}</span></div>
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
