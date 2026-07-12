import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CrmPageHeader } from "@/components/admin/CrmShell";
import DataTable from "@/components/admin/DataTable";

type Brand = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  color: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
};

const emptyBrand: Partial<Brand> = {
  name: "",
  slug: "",
  logo_url: "",
  color: "#3B2314",
  description: "",
  display_order: 0,
  is_active: true,
};

export default function CatalogBrands() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<any>(emptyBrand);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["catalog-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_brands")
        .select("*, catalog_products(count)")
        .order("display_order")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyBrand });
    setOpen(true);
  };
  const openEdit = (b: Brand) => {
    setEditing(b);
    setForm({ ...b });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name?.trim()) {
      toast.error("Nome obbligatorio");
      return;
    }
    const payload: any = {
      name: form.name.trim(),
      slug: form.slug?.trim() || form.name.toLowerCase().replace(/\s+/g, "-"),
      logo_url: form.logo_url || null,
      color: form.color || null,
      description: form.description || null,
      display_order: Number(form.display_order) || 0,
      is_active: !!form.is_active,
    };
    const { error } = editing
      ? await supabase.from("catalog_brands").update(payload).eq("id", editing.id)
      : await supabase.from("catalog_brands").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success(editing ? "Marca aggiornata" : "Marca creata");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["catalog-brands"] });
    }
  };

  const remove = async (b: Brand) => {
    if (!confirm(`Eliminare la marca "${b.name}"? I prodotti collegati manterranno il nome testuale.`)) return;
    const { error } = await supabase.from("catalog_brands").delete().eq("id", b.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Marca eliminata");
      qc.invalidateQueries({ queryKey: ["catalog-brands"] });
    }
  };

  return (
    <div className="space-y-4 p-6">
      <CrmPageHeader
        breadcrumb={["Catalogo", "Marche"]}
        title="Marche"
        subtitle="Anagrafica marche fornitori. Ogni prodotto può essere collegato a una marca."
        actions={
          <Button size="sm" onClick={openNew} className="bg-white text-[#1E1B4B] hover:bg-white/90">
            <Plus className="w-4 h-4 mr-2" /> Nuova marca
          </Button>
        }
      />

      <DataTable
        data={brands as any[]}
        loading={isLoading}
        searchPlaceholder="Cerca marca…"
        emptyTitle="Nessuna marca"
        emptyDescription="Crea la prima marca per organizzare il catalogo."
        columns={[
          {
            key: "color",
            header: "",
            cell: (b: any) => (
              <div
                className="w-6 h-6 rounded border"
                style={{ background: b.color || "#eee", borderColor: "rgba(0,0,0,0.1)" }}
              />
            ),
            className: "w-10",
          },
          { key: "name", header: "Nome", sortable: true, cell: (b: any) => <span className="font-medium">{b.name}</span> },
          { key: "slug", header: "Slug", cell: (b: any) => <span className="text-xs text-muted-foreground">{b.slug || "—"}</span> },
          {
            key: "products",
            header: "Prodotti",
            cell: (b: any) => (
              <Badge variant="outline">{b.catalog_products?.[0]?.count ?? 0}</Badge>
            ),
            className: "text-right",
          },
          { key: "display_order", header: "Ordine", sortable: true, className: "text-right" },
          {
            key: "is_active",
            header: "Stato",
            cell: (b: any) =>
              b.is_active ? (
                <Badge className="bg-emerald-100 text-emerald-800 border-0">Attiva</Badge>
              ) : (
                <Badge variant="outline">Disattiva</Badge>
              ),
          },
          {
            key: "actions",
            header: "",
            cell: (b: any) => (
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(b)}>
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
            <DialogTitle>{editing ? "Modifica marca" : "Nuova marca"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Slug</Label>
                <Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" />
              </div>
              <div>
                <Label>Ordine</Label>
                <Input type="number" value={form.display_order || 0} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Logo URL</Label>
                <Input value={form.logo_url || ""} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
              </div>
              <div>
                <Label>Colore</Label>
                <Input type="color" value={form.color || "#3B2314"} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Descrizione</Label>
              <Textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={!!form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Marca attiva</Label>
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
