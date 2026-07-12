import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CrmPageHeader } from "@/components/admin/CrmShell";
import DataTable from "@/components/admin/DataTable";

type Collection = {
  id: string;
  brand_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
};

const emptyCollection: any = {
  brand_id: "",
  name: "",
  description: "",
  image_url: "",
  display_order: 0,
  is_active: true,
};

export default function CatalogCollections() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [form, setForm] = useState<any>(emptyCollection);
  const [filterBrand, setFilterBrand] = useState<string>("all");

  const { data: brands = [] } = useQuery({
    queryKey: ["catalog-brands-min"],
    queryFn: async () => {
      const { data } = await supabase.from("catalog_brands").select("id,name,color").order("name");
      return data || [];
    },
  });

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["catalog-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_collections")
        .select("*, catalog_brands(id,name,color), catalog_products(count)")
        .order("display_order")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    if (filterBrand === "all") return collections;
    if (filterBrand === "none") return collections.filter((c: any) => !c.brand_id);
    return collections.filter((c: any) => c.brand_id === filterBrand);
  }, [collections, filterBrand]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyCollection });
    setOpen(true);
  };
  const openEdit = (c: Collection) => {
    setEditing(c);
    setForm({ ...c, brand_id: c.brand_id || "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name?.trim()) {
      toast.error("Nome obbligatorio");
      return;
    }
    const payload: any = {
      brand_id: form.brand_id || null,
      name: form.name.trim(),
      description: form.description || null,
      image_url: form.image_url || null,
      display_order: Number(form.display_order) || 0,
      is_active: !!form.is_active,
    };
    const { error } = editing
      ? await supabase.from("catalog_collections").update(payload).eq("id", editing.id)
      : await supabase.from("catalog_collections").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success(editing ? "Collezione aggiornata" : "Collezione creata");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["catalog-collections"] });
    }
  };

  const remove = async (c: Collection) => {
    if (!confirm(`Eliminare la collezione "${c.name}"?`)) return;
    const { error } = await supabase.from("catalog_collections").delete().eq("id", c.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Collezione eliminata");
      qc.invalidateQueries({ queryKey: ["catalog-collections"] });
    }
  };

  return (
    <div className="space-y-4 p-6">
      <CrmPageHeader
        breadcrumb={["Catalogo", "Collezioni"]}
        title="Collezioni"
        subtitle="Raggruppa i prodotti per collezione, con associazione alla marca."
        actions={
          <Button size="sm" onClick={openNew} className="bg-white text-[#1E1B4B] hover:bg-white/90">
            <Plus className="w-4 h-4 mr-2" /> Nuova collezione
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger className="w-[220px] bg-white">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le marche</SelectItem>
            <SelectItem value="none">Senza marca</SelectItem>
            {brands.map((b: any) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={filtered as any[]}
        loading={isLoading}
        searchPlaceholder="Cerca collezione…"
        emptyTitle="Nessuna collezione"
        columns={[
          { key: "name", header: "Nome", sortable: true, cell: (c: any) => <span className="font-medium">{c.name}</span> },
          {
            key: "brand",
            header: "Marca",
            cell: (c: any) =>
              c.catalog_brands ? (
                <span className="inline-flex items-center gap-2 text-sm">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ background: c.catalog_brands.color || "#ccc" }}
                  />
                  {c.catalog_brands.name}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              ),
          },
          {
            key: "products",
            header: "Prodotti",
            cell: (c: any) => <Badge variant="outline">{c.catalog_products?.[0]?.count ?? 0}</Badge>,
            className: "text-right",
          },
          { key: "display_order", header: "Ordine", sortable: true, className: "text-right" },
          {
            key: "is_active",
            header: "Stato",
            cell: (c: any) =>
              c.is_active ? (
                <Badge className="bg-emerald-100 text-emerald-800 border-0">Attiva</Badge>
              ) : (
                <Badge variant="outline">Disattiva</Badge>
              ),
          },
          {
            key: "actions",
            header: "",
            cell: (c: any) => (
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(c)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ),
            className: "text-right",
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifica collezione" : "Nuova collezione"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Marca</Label>
              <Select value={form.brand_id || "none"} onValueChange={(v) => setForm({ ...form, brand_id: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuna</SelectItem>
                  {brands.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Immagine URL</Label>
                <Input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
              <div>
                <Label>Ordine</Label>
                <Input type="number" value={form.display_order || 0} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Descrizione</Label>
              <Textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={!!form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Collezione attiva</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annulla</Button>
            <Button onClick={save}>{editing ? "Salva" : "Crea"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
