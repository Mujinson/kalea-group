import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CrmPageHeader } from "@/components/admin/CrmShell";
import DataTable from "@/components/admin/DataTable";

const MACRO = [
  { value: "articoli", label: "Articoli (pavimenti)" },
  { value: "accessori", label: "Accessori" },
  { value: "servizi", label: "Servizi" },
];

const emptyCat: any = {
  name: "",
  slug: "",
  parent_id: "",
  macro_category: "articoli",
  display_order: 0,
  description: "",
};

export default function CatalogCategories() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyCat);
  const [filterMacro, setFilterMacro] = useState<string>("all");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["product-categories-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*, catalog_products(count)")
        .order("display_order")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    if (filterMacro === "all") return categories;
    return categories.filter((c: any) => c.macro_category === filterMacro);
  }, [categories, filterMacro]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyCat });
    setOpen(true);
  };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      ...c,
      parent_id: c.parent_id || "",
      macro_category: c.macro_category || "articoli",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name?.trim()) {
      toast.error("Nome obbligatorio");
      return;
    }
    const slug = form.slug?.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const payload: any = {
      name: form.name.trim(),
      slug,
      parent_id: form.parent_id || null,
      macro_category: form.macro_category || null,
      display_order: Number(form.display_order) || 0,
      description: form.description || null,
    };
    const { error } = editing
      ? await supabase.from("product_categories").update(payload).eq("id", editing.id)
      : await supabase.from("product_categories").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success(editing ? "Categoria aggiornata" : "Categoria creata");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["product-categories-full"] });
    }
  };

  const remove = async (c: any) => {
    if (!confirm(`Eliminare la categoria "${c.name}"?`)) return;
    const { error } = await supabase.from("product_categories").delete().eq("id", c.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Categoria eliminata");
      qc.invalidateQueries({ queryKey: ["product-categories-full"] });
    }
  };

  const parentName = (id: string | null) => (id ? categories.find((c: any) => c.id === id)?.name : null);

  return (
    <div className="space-y-4 p-6">
      <CrmPageHeader
        breadcrumb={["Catalogo", "Categorie"]}
        title="Categorie"
        subtitle="Gerarchia categorie con macro-categoria: Articoli, Accessori, Servizi."
        actions={
          <Button size="sm" onClick={openNew} className="bg-white text-[#0F172A] hover:bg-white/90">
            <Plus className="w-4 h-4 mr-2" /> Nuova categoria
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Select value={filterMacro} onValueChange={setFilterMacro}>
          <SelectTrigger className="w-[220px] bg-white">
            <SelectValue placeholder="Macro-categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le macro</SelectItem>
            {MACRO.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={filtered as any[]}
        loading={isLoading}
        searchPlaceholder="Cerca categoria…"
        emptyTitle="Nessuna categoria"
        columns={[
          { key: "name", header: "Nome", sortable: true, cell: (c: any) => <span className="font-medium">{c.name}</span> },
          {
            key: "macro_category",
            header: "Macro",
            cell: (c: any) =>
              c.macro_category ? (
                <Badge variant="outline" className="capitalize">{c.macro_category}</Badge>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              ),
          },
          {
            key: "parent",
            header: "Padre",
            cell: (c: any) => parentName(c.parent_id) || <span className="text-xs text-muted-foreground">—</span>,
          },
          { key: "slug", header: "Slug", cell: (c: any) => <span className="text-xs text-muted-foreground">{c.slug}</span> },
          {
            key: "products",
            header: "Prodotti",
            cell: (c: any) => <Badge variant="outline">{c.catalog_products?.[0]?.count ?? 0}</Badge>,
            className: "text-right",
          },
          { key: "display_order", header: "Ordine", sortable: true, className: "text-right" },
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
            <DialogTitle>{editing ? "Modifica categoria" : "Nuova categoria"}</DialogTitle>
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
                <Label>Macro-categoria</Label>
                <Select value={form.macro_category || "articoli"} onValueChange={(v) => setForm({ ...form, macro_category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MACRO.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria padre</Label>
                <Select value={form.parent_id || "none"} onValueChange={(v) => setForm({ ...form, parent_id: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessuna (root)</SelectItem>
                    {categories
                      .filter((c: any) => !editing || c.id !== editing.id)
                      .map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Descrizione</Label>
              <Textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
