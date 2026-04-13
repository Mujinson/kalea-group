import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, Search, Plus, Truck, CheckCircle2, Clock, Euro, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const UNITS = ["pz", "mq", "ml", "kg", "lt", "sacchi", "bancali", "rotoli"];

const CantieriMateriali = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    site_id: "", material_name: "", quantity: "", unit: "pz",
    unit_cost: "", supplier: "", delivery_status: "in_attesa", notes: ""
  });

  const { data: sites } = useQuery({
    queryKey: ["cm-sites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("construction_sites").select("id, title").order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: materials, isLoading } = useQuery({
    queryKey: ["cm-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_materials")
        .select("*, construction_sites:site_id(title)")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as any[];
    },
  });

  const filtered = materials?.filter((m: any) => {
    const matchSite = siteFilter === "all" || m.site_id === siteFilter;
    const matchSearch = !search || m.material_name?.toLowerCase().includes(search.toLowerCase()) || m.notes?.toLowerCase().includes(search.toLowerCase());
    return matchSite && matchSearch;
  });

  const totalCost = filtered?.reduce((s: number, m: any) => s + (m.total_cost || 0), 0) || 0;
  const totalItems = filtered?.length || 0;

  const handleAdd = async () => {
    if (!form.site_id || !form.material_name || !form.quantity) {
      toast.error("Cantiere, nome materiale e quantità sono obbligatori");
      return;
    }
    const { error } = await supabase.from("site_materials").insert({
      site_id: form.site_id,
      material_name: form.material_name,
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : 0,
      notes: [form.supplier && `Fornitore: ${form.supplier}`, form.delivery_status && `Stato: ${form.delivery_status}`, form.notes].filter(Boolean).join(" | ") || null,
    });
    if (error) { toast.error("Errore nel salvataggio"); return; }
    toast.success("Materiale aggiunto");
    setAddOpen(false);
    setForm({ site_id: "", material_name: "", quantity: "", unit: "pz", unit_cost: "", supplier: "", delivery_status: "in_attesa", notes: "" });
    queryClient.invalidateQueries({ queryKey: ["cm-materials"] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questo materiale?")) return;
    await supabase.from("site_materials").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["cm-materials"] });
    toast.success("Eliminato");
  };

  const getDeliveryBadge = (notes: string | null) => {
    if (!notes) return null;
    if (notes.includes("Stato: consegnato")) return <Badge className="bg-green-100 text-green-700 text-xs">Consegnato</Badge>;
    if (notes.includes("Stato: in_transito")) return <Badge className="bg-blue-100 text-blue-700 text-xs">In transito</Badge>;
    if (notes.includes("Stato: in_attesa")) return <Badge className="bg-amber-100 text-amber-700 text-xs">In attesa</Badge>;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Materiali</h1>
          <p className="text-sm text-muted-foreground">Gestione forniture per cantiere</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-2" /> Aggiungi</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Package className="w-4 h-4 text-blue-600" /></div>
            </div>
            <p className="text-xl font-bold">{totalItems}</p>
            <p className="text-xs text-muted-foreground">Voci materiali</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><Euro className="w-4 h-4 text-orange-600" /></div>
            </div>
            <p className="text-xl font-bold">€{totalCost.toLocaleString("it-IT")}</p>
            <p className="text-xs text-muted-foreground">Costo totale</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Truck className="w-4 h-4 text-amber-600" /></div>
            </div>
            <p className="text-xl font-bold">{filtered?.filter((m: any) => m.notes?.includes("in_attesa")).length || 0}</p>
            <p className="text-xs text-muted-foreground">In attesa consegna</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-52 h-9 text-sm">
            <SelectValue placeholder="Tutti i cantieri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i cantieri</SelectItem>
            {sites?.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cerca materiale..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
      </div>

      {/* Table */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 text-xs font-medium text-muted-foreground">Materiale</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground">Cantiere</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Qtà</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">€/unità</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Totale</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground">Stato</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((m: any) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-2">
                      <p className="text-xs font-medium">{m.material_name}</p>
                    </td>
                    <td className="py-2 text-xs">{m.construction_sites?.title || "—"}</td>
                    <td className="py-2 text-xs text-right">{m.quantity} {m.unit}</td>
                    <td className="py-2 text-xs text-right">€{(m.unit_cost || 0).toFixed(2)}</td>
                    <td className="py-2 text-xs text-right font-medium">€{(m.total_cost || 0).toLocaleString("it-IT")}</td>
                    <td className="py-2">{getDeliveryBadge(m.notes)}</td>
                    <td className="py-2 text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!filtered || filtered.length === 0) && (
                  <tr><td colSpan={7} className="py-8 text-center text-xs text-muted-foreground">{isLoading ? "Caricamento..." : "Nessun materiale trovato"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nuovo Materiale</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Cantiere *</Label>
              <Select value={form.site_id} onValueChange={v => setForm({ ...form, site_id: v })}>
                <SelectTrigger><SelectValue placeholder="Seleziona cantiere" /></SelectTrigger>
                <SelectContent>{sites?.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nome materiale *</Label>
              <Input value={form.material_name} onChange={e => setForm({ ...form, material_name: e.target.value })} placeholder="Es: Colla per pavimenti" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Quantità *</Label>
                <Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Unità</Label>
                <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">€/unità</Label>
                <Input type="number" step="0.01" value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Fornitore</Label>
                <Input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Stato consegna</Label>
                <Select value={form.delivery_status} onValueChange={v => setForm({ ...form, delivery_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_attesa">In attesa</SelectItem>
                    <SelectItem value="in_transito">In transito</SelectItem>
                    <SelectItem value="consegnato">Consegnato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Note</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Annulla</Button>
            <Button onClick={handleAdd}>Salva</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CantieriMateriali;
