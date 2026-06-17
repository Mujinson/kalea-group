import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HardHat, Plus, Search, MapPin, Eye, Trash2, Edit, Upload, X, Image, Film, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CrmPageHeader, CrmKpiTile, CrmKpiRow, CrmFilterBar, CrmTableCard } from "@/components/admin/CrmShell";

const TIPOLOGIE = [
  "Villa privata", "Appartamento", "Condominio", "Hotel", "Ristorante",
  "Ufficio", "Showroom", "Negozio", "Edificio pubblico", "Altro"
];

const AdminCantieri = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "attivo" | "completato" | "pausa">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "", project_name: "", address: "", city: "", province: "",
    region: "", postal_code: "", country: "Italia", tipologia: "",
    product_model: "", notes: "", contact_name: "", contact_surname: "",
    contact_email: "", contact_phone: "", status: "attivo",
    start_date: "", end_date: "",
  });

  const { data: sites, isLoading } = useQuery({
    queryKey: ["construction-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("construction_sites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = sites?.filter((s) => {
    if (statusFilter === "attivo" && s.status !== "attivo") return false;
    if (statusFilter === "completato" && s.status !== "completato") return false;
    if (statusFilter === "pausa" && (s.status === "attivo" || s.status === "completato")) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.address?.toLowerCase().includes(q) ||
      s.product_model?.toLowerCase().includes(q) ||
      s.tipologia?.toLowerCase().includes(q) ||
      s.project_name?.toLowerCase().includes(q)
    );
  });

  const resetForm = () => {
    setForm({
      title: "", project_name: "", address: "", city: "", province: "",
      region: "", postal_code: "", country: "Italia", tipologia: "",
      product_model: "", notes: "", contact_name: "", contact_surname: "",
      contact_email: "", contact_phone: "", status: "attivo",
      start_date: "", end_date: "",
    });
    setEditId(null);
    setPendingFiles([]);
  };

  const openEdit = (site: any) => {
    setForm({
      title: site.title || "", project_name: site.project_name || "",
      address: site.address || "", city: site.city || "", province: site.province || "",
      region: site.region || "", postal_code: site.postal_code || "",
      country: site.country || "Italia", tipologia: site.tipologia || "",
      product_model: site.product_model || "", notes: site.notes || "",
      contact_name: site.contact_name || "", contact_surname: site.contact_surname || "",
      contact_email: site.contact_email || "", contact_phone: site.contact_phone || "",
      status: site.status || "attivo",
      start_date: site.start_date || "", end_date: site.end_date || "",
    });
    setEditId(site.id);
    setCreateOpen(true);
  };

  const uploadFilesForSite = async (siteId: string) => {
    for (const file of pendingFiles) {
      const ext = file.name.split(".").pop();
      const path = `${siteId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("site-media").upload(path, file);
      if (uploadError) { toast.error(`Errore upload: ${file.name}`); continue; }
      const { data: urlData } = supabase.storage.from("site-media").getPublicUrl(path);
      const fileType = file.type.startsWith("video") ? "video" : file.type.startsWith("image") ? "image" : "document";
      await supabase.from("site_media").insert({
        site_id: siteId, file_url: urlData.publicUrl, file_name: file.name, file_type: fileType, file_size: file.size,
      });
    }
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Il titolo è obbligatorio"); return; }
    
    const payload = {
      ...form,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    if (editId) {
      const { error } = await supabase.from("construction_sites").update(payload).eq("id", editId);
      if (error) { toast.error("Errore nel salvataggio"); return; }
      if (pendingFiles.length > 0) await uploadFilesForSite(editId);
      toast.success("Cantiere aggiornato");
    } else {
      const { data, error } = await supabase.from("construction_sites").insert(payload).select("id").single();
      if (error || !data) { toast.error("Errore nella creazione"); return; }
      if (pendingFiles.length > 0) await uploadFilesForSite(data.id);
      toast.success("Cantiere creato");
    }
    setCreateOpen(false);
    resetForm();
    queryClient.invalidateQueries({ queryKey: ["construction-sites"] });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    e.target.value = "";
  };

  const removeFile = (idx: number) => setPendingFiles(prev => prev.filter((_, i) => i !== idx));

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image")) return <Image className="w-4 h-4 text-blue-500" />;
    if (file.type.startsWith("video")) return <Film className="w-4 h-4 text-purple-500" />;
    return <FileText className="w-4 h-4 text-muted-foreground" />;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questo cantiere e tutti i file associati?")) return;
    await supabase.from("construction_sites").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["construction-sites"] });
    toast.success("Cantiere eliminato");
  };

  return (
    <div className="space-y-4">
      <CrmPageHeader
        breadcrumb={["CRM", "Cantieri"]}
        title="Cantieri"
        subtitle="Gestione progetti, posa e installazioni"
        actions={
          <Button onClick={() => { resetForm(); setCreateOpen(true); }} size="sm" className="bg-white text-[#1E1B4B] hover:bg-white/90">
            <Plus className="w-4 h-4 mr-2" /> Nuovo Cantiere
          </Button>
        }
      />

      <CrmKpiRow cols={4}>
        <CrmKpiTile label="Totale" value={sites?.length || 0} color="indigo" icon={<HardHat className="w-4 h-4" />} />
        <CrmKpiTile label="Attivi" value={sites?.filter(s => s.status === 'attivo').length || 0} color="green" />
        <CrmKpiTile label="Completati" value={sites?.filter(s => s.status === 'completato').length || 0} color="blue" />
        <CrmKpiTile label="In pausa" value={sites?.filter(s => s.status !== 'attivo' && s.status !== 'completato').length || 0} color="amber" />
      </CrmKpiRow>

      <CrmFilterBar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, città, modello…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-0 bg-[#F5F0EA]/60"
          />
        </div>
      </CrmFilterBar>

      <CrmTableCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F0EA]/50 border-b border-[#E7E3DA]">
              <tr className="text-left">
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#8A7060]">Titolo</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#8A7060]">Tipologia</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#8A7060]">Città</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#8A7060]">CAP</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#8A7060]">Modello</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#8A7060]">Stato</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((site) => (
                <tr key={site.id} className="border-b last:border-0 border-[#F0EBE0] hover:bg-[#FAF6EF] transition-colors cursor-pointer" onClick={() => navigate(`/admin/cantieri/${site.id}`)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{site.title}</p>
                    {site.project_name && <p className="text-xs text-muted-foreground">{site.project_name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {site.tipologia && <Badge variant="outline" className="text-xs">{site.tipologia}</Badge>}
                  </td>
                  <td className="px-4 py-3 text-sm">{site.city}</td>
                  <td className="px-4 py-3 text-sm">{site.postal_code}</td>
                  <td className="px-4 py-3 text-sm">{site.product_model}</td>
                  <td className="px-4 py-3">
                    <Badge variant={site.status === 'attivo' ? 'default' : 'secondary'} className="text-xs">
                      {site.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => navigate(`/admin/cantieri/${site.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(site)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(site.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!filtered || filtered.length === 0) && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    {isLoading ? "Caricamento..." : "Nessun cantiere trovato"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered && filtered.length > 0 && (
          <p className="text-[11px] uppercase tracking-wider text-[#8A7060] font-semibold px-4 py-2 border-t border-[#F0EBE0] bg-[#FAF6EF]/40">
            {filtered.length} risultat{filtered.length === 1 ? 'o' : 'i'}
          </p>
        )}
      </CrmTableCard>


      {/* Create/Edit Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifica Cantiere" : "Nuovo Cantiere"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Titolo *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Nome progetto</Label>
                  <Input value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Paese</Label>
                  <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Indirizzo</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>CAP</Label>
                  <Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Città</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Note</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tipologia</Label>
                  <Select value={form.tipologia} onValueChange={(v) => setForm({ ...form, tipologia: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleziona un'opzione" /></SelectTrigger>
                    <SelectContent>
                      {TIPOLOGIE.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Modello posato</Label>
                  <Input value={form.product_model} onChange={(e) => setForm({ ...form, product_model: e.target.value })} placeholder="Es: Biomag Oak Natural" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data inizio</Label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Data fine</Label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>

              {/* File upload */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-sm mb-2">Allegati</h3>
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Carica file
                </Button>
                {pendingFiles.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {pendingFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs bg-background rounded px-2 py-1">
                        {getFileIcon(file)}
                        <span className="truncate flex-1">{file.name}</span>
                        <button onClick={() => removeFile(idx)} className="text-destructive hover:text-destructive/80">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact sidebar */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
              <h3 className="font-semibold text-sm">Contatto</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cognome</Label>
                  <Input value={form.contact_surname} onChange={(e) => setForm({ ...form, contact_surname: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Telefono</Label>
                  <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>Annulla</Button>
            <Button onClick={handleSave}>Salva</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCantieri;
