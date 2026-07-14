import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, AlertTriangle, Package, Truck, Wrench, Building2, History } from "lucide-react";
import { toast } from "sonner";
import { fetchAllRows } from "@/lib/fetchAllRows";
import { CrmPageHeader, CrmKpiTile, CrmKpiRow } from "@/components/admin/CrmShell";

type CatalogProduct = any;

const emptyProduct = {
  product_code: "",
  supplier_code: "",
  name: "",
  description: "",
  category_id: "",
  product_type: "article",
  collection: "",
  brand: "",
  supplier_id: "",
  list_price: 0,
  supplier_discount_percentage: 0,
  markup_percentage: 60,
  max_customer_discount_percentage: 10,
  min_margin_percentage: 25,
  vat_percentage: 22,
  unit_of_measure: "mq",
  format: "",
  thickness_mm: "",
  finish: "",
  color: "",
  weight_per_unit: "",
  certifications: [] as string[],
  technical_sheet_url: "",
  min_order_quantity: 0,
  pieces_per_pack: "",
  pack_per_pallet: "",
  pallet_weight_kg: "",
  available_stock: 0,
  low_stock_threshold: 0,
  warehouse_location: "",
  is_active: true,
  notes: "",
};

const AdminCatalog = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSupplier, setFilterSupplier] = useState<string>("all");
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openSupplierDialog, setOpenSupplierDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [historyProductId, setHistoryProductId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyProduct);
  const [supplierForm, setSupplierForm] = useState({ name: "", contact_person: "", email: "", phone: "", default_discount_percentage: 0, payment_terms: "", lead_time_days: "", notes: "" });

  const { data: products = [] } = useQuery({
    queryKey: ["catalog-products"],
    queryFn: async () => {
      return fetchAllRows<CatalogProduct>(
        supabase.from("catalog_products").select("*, product_suppliers(name), product_categories(name)").order("name")
      );
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["product-suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_suppliers").select("*").order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_categories").select("*").order("display_order");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: priceHistory = [] } = useQuery({
    queryKey: ["price-history", historyProductId],
    queryFn: async () => {
      if (!historyProductId) return [];
      const { data, error } = await supabase.from("catalog_price_history").select("*").eq("product_id", historyProductId).order("changed_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!historyProductId,
  });

  const filtered = useMemo(() => {
    return products.filter((p: any) => {
      const matchSearch = !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.product_code?.toLowerCase().includes(search.toLowerCase()) ||
        p.supplier_code?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === "all" || p.category_id === filterCategory;
      const matchSup = filterSupplier === "all" || p.supplier_id === filterSupplier;
      return matchSearch && matchCat && matchSup;
    });
  }, [products, search, filterCategory, filterSupplier]);

  const stats = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter((p: any) => p.available_stock <= p.low_stock_threshold && p.low_stock_threshold > 0).length;
    const lowMargin = products.filter((p: any) => {
      const margin = p.sale_price > 0 ? ((p.sale_price - p.net_cost) / p.sale_price) * 100 : 0;
      return margin < p.min_margin_percentage;
    }).length;
    return { total, lowStock, lowMargin };
  }, [products]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyProduct);
    setOpenProductDialog(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      ...emptyProduct,
      ...p,
      category_id: p.category_id || "",
      supplier_id: p.supplier_id || "",
      thickness_mm: p.thickness_mm ?? "",
      weight_per_unit: p.weight_per_unit ?? "",
      pieces_per_pack: p.pieces_per_pack ?? "",
      pack_per_pallet: p.pack_per_pallet ?? "",
      pallet_weight_kg: p.pallet_weight_kg ?? "",
      certifications: p.certifications || [],
    });
    setOpenProductDialog(true);
  };

  const saveProduct = async () => {
    if (!form.product_code || !form.name) {
      toast.error("Codice prodotto e nome sono obbligatori");
      return;
    }
    const payload: any = {
      ...form,
      category_id: form.category_id || null,
      supplier_id: form.supplier_id || null,
      thickness_mm: form.thickness_mm === "" ? null : Number(form.thickness_mm),
      weight_per_unit: form.weight_per_unit === "" ? null : Number(form.weight_per_unit),
      pieces_per_pack: form.pieces_per_pack === "" ? null : Number(form.pieces_per_pack),
      pack_per_pallet: form.pack_per_pallet === "" ? null : Number(form.pack_per_pallet),
      pallet_weight_kg: form.pallet_weight_kg === "" ? null : Number(form.pallet_weight_kg),
      list_price: Number(form.list_price) || 0,
      supplier_discount_percentage: Number(form.supplier_discount_percentage) || 0,
      markup_percentage: Number(form.markup_percentage) || 0,
      max_customer_discount_percentage: Number(form.max_customer_discount_percentage) || 0,
      min_margin_percentage: Number(form.min_margin_percentage) || 0,
      vat_percentage: Number(form.vat_percentage) || 22,
      min_order_quantity: Number(form.min_order_quantity) || 0,
      available_stock: Number(form.available_stock) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 0,
    };
    // remove generated columns
    delete payload.net_cost;
    delete payload.sale_price;
    delete payload.product_suppliers;
    delete payload.product_categories;
    delete payload.created_at;
    delete payload.updated_at;

    let error;
    if (editing) {
      ({ error } = await supabase.from("catalog_products").update(payload).eq("id", editing.id));
    } else {
      delete payload.id;
      ({ error } = await supabase.from("catalog_products").insert(payload));
    }
    if (error) {
      toast.error("Errore: " + error.message);
    } else {
      toast.success(editing ? "Prodotto aggiornato" : "Prodotto creato");
      setOpenProductDialog(false);
      qc.invalidateQueries({ queryKey: ["catalog-products"] });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Eliminare definitivamente il prodotto?")) return;
    const { error } = await supabase.from("catalog_products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Eliminato");
      qc.invalidateQueries({ queryKey: ["catalog-products"] });
    }
  };

  const saveSupplier = async () => {
    if (!supplierForm.name) {
      toast.error("Nome fornitore obbligatorio");
      return;
    }
    const payload: any = {
      ...supplierForm,
      default_discount_percentage: Number(supplierForm.default_discount_percentage) || 0,
      lead_time_days: supplierForm.lead_time_days === "" ? null : Number(supplierForm.lead_time_days),
    };
    const { error } = await supabase.from("product_suppliers").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success("Fornitore creato");
      setOpenSupplierDialog(false);
      setSupplierForm({ name: "", contact_person: "", email: "", phone: "", default_discount_percentage: 0, payment_terms: "", lead_time_days: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["product-suppliers"] });
    }
  };

  const computeMargin = (p: any) => {
    if (!p.sale_price || p.sale_price === 0) return 0;
    return ((p.sale_price - p.net_cost) / p.sale_price) * 100;
  };

  return (
    <div className="space-y-4">
      <CrmPageHeader
        breadcrumb={["CRM", "Catalogo"]}
        title="Catalogo Prodotti"
        subtitle="Listini fornitori, prezzi vendita e regole anti-perdita"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpenSupplierDialog(true)} className="border-crm-border text-crm-ink hover:bg-crm-bg-soft">
              <Building2 className="w-4 h-4 mr-2" /> Nuovo fornitore
            </Button>
            <Button size="sm" onClick={openNew} className="bg-crm-primary hover:bg-crm-primary-600 text-white shadow-crm-sm">
              <Plus className="w-4 h-4 mr-2" /> Nuovo prodotto
            </Button>
          </>
        }
      />

      <CrmKpiRow cols={3}>
        <CrmKpiTile label="Prodotti totali" value={stats.total} color="indigo" icon={<Package className="w-4 h-4" />} />
        <CrmKpiTile label="Sotto scorta" value={stats.lowStock} color={stats.lowStock > 0 ? "orange" : "slate"} icon={stats.lowStock > 0 ? <AlertTriangle className="w-4 h-4" /> : undefined} />
        <CrmKpiTile label="Margine sotto soglia" value={stats.lowMargin} color={stats.lowMargin > 0 ? "red" : "slate"} icon={stats.lowMargin > 0 ? <AlertTriangle className="w-4 h-4" /> : undefined} />
      </CrmKpiRow>


      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8A7060" }} />
          <Input placeholder="Cerca per codice, nome, codice fornitore..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px] bg-white"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSupplier} onValueChange={setFilterSupplier}>
          <SelectTrigger className="w-[180px] bg-white"><SelectValue placeholder="Fornitore" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i fornitori</SelectItem>
            {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: "rgba(59,35,20,0.1)" }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codice</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead className="text-right">Sp.</TableHead>
              <TableHead>Fornitore</TableHead>
              <TableHead className="text-right">Listino</TableHead>
              <TableHead className="text-right">Sconto</TableHead>
              <TableHead className="text-right">Costo netto</TableHead>
              <TableHead className="text-right">Ricarico</TableHead>
              <TableHead className="text-right">Vendita</TableHead>
              <TableHead className="text-right">Margine</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={14} className="text-center py-8" style={{ color: "#8A7060" }}>Nessun prodotto trovato</TableCell></TableRow>
            ) : filtered.map((p: any) => {
              const margin = computeMargin(p);
              const lowMargin = margin < p.min_margin_percentage;
              const lowStock = p.available_stock <= p.low_stock_threshold && p.low_stock_threshold > 0;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.product_code}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap font-medium" style={{ color: "#64748B" }}>{p.brand || "—"}</TableCell>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    {p.product_categories?.name && <div className="text-xs" style={{ color: "#8A7060" }}>{p.product_categories.name}</div>}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{p.format || "—"}</TableCell>
                  <TableCell className="text-right text-sm">{p.thickness_mm ? `${p.thickness_mm}mm` : "—"}</TableCell>
                  <TableCell className="text-sm">{p.product_suppliers?.name || "—"}</TableCell>
                  <TableCell className="text-right">€{Number(p.list_price).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{Number(p.supplier_discount_percentage).toFixed(1)}%</TableCell>
                  <TableCell className="text-right">€{Number(p.net_cost).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{Number(p.markup_percentage).toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-semibold">€{Number(p.sale_price).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={lowMargin ? "destructive" : "outline"} style={!lowMargin ? { color: "#2D7A4F", borderColor: "#2D7A4F" } : {}}>
                      {margin.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {lowStock ? (
                      <Badge variant="outline" style={{ color: "#C97A4A", borderColor: "#C97A4A" }}>{p.available_stock} {p.unit_of_measure}</Badge>
                    ) : (
                      <span className="text-sm">{Number(p.available_stock).toFixed(0)} {p.unit_of_measure}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => { setHistoryProductId(p.id); setOpenHistoryDialog(true); }}>
                        <History className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)}>
                        <Trash2 className="w-4 h-4" style={{ color: "#C0392B" }} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Product dialog */}
      <Dialog open={openProductDialog} onOpenChange={setOpenProductDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifica prodotto" : "Nuovo prodotto"}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="commerciale" className="mt-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="commerciale"><Package className="w-4 h-4 mr-1" /> Base + Commerciale</TabsTrigger>
              <TabsTrigger value="tecnici"><Wrench className="w-4 h-4 mr-1" /> Tecnici</TabsTrigger>
              <TabsTrigger value="logistica"><Truck className="w-4 h-4 mr-1" /> Logistica</TabsTrigger>
              <TabsTrigger value="anti-perdita"><AlertTriangle className="w-4 h-4 mr-1" /> Anti-perdita</TabsTrigger>
            </TabsList>

            <TabsContent value="commerciale" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Codice prodotto *</Label>
                  <Input value={form.product_code} onChange={(e) => setForm({ ...form, product_code: e.target.value })} />
                </div>
                <div>
                  <Label>Codice fornitore</Label>
                  <Input value={form.supplier_code} onChange={(e) => setForm({ ...form, supplier_code: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Nome *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Descrizione</Label>
                  <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fornitore</Label>
                  <Select value={form.supplier_id} onValueChange={(v) => setForm({ ...form, supplier_id: v })}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.product_type} onValueChange={(v) => setForm({ ...form, product_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Articolo</SelectItem>
                      <SelectItem value="accessory">Accessorio</SelectItem>
                      <SelectItem value="service">Servizio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Collezione</Label>
                  <Input value={form.collection} onChange={(e) => setForm({ ...form, collection: e.target.value })} />
                </div>
                <div>
                  <Label>Brand</Label>
                  <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </div>
                <div>
                  <Label>Unità di misura</Label>
                  <Select value={form.unit_of_measure} onValueChange={(v) => setForm({ ...form, unit_of_measure: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mq">m²</SelectItem>
                      <SelectItem value="ml">m lineari</SelectItem>
                      <SelectItem value="pz">pezzi</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lt">litri</SelectItem>
                      <SelectItem value="confezione">confezione</SelectItem>
                      <SelectItem value="pallet">pallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "#8A7060", letterSpacing: "0.12em" }}>Flusso prezzo (anti-perdita)</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Listino fornitore (€)</Label>
                    <Input type="number" step="0.01" value={form.list_price} onChange={(e) => setForm({ ...form, list_price: e.target.value })} />
                  </div>
                  <div>
                    <Label>− Sconto fornitore %</Label>
                    <Input type="number" step="0.1" value={form.supplier_discount_percentage} onChange={(e) => setForm({ ...form, supplier_discount_percentage: e.target.value })} />
                  </div>
                  <div>
                    <Label>+ Ricarico Kalēa %</Label>
                    <Input type="number" step="0.1" value={form.markup_percentage} onChange={(e) => setForm({ ...form, markup_percentage: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 p-3 rounded-md" style={{ background: "rgba(200,169,110,0.10)" }}>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8A7060" }}>= Costo netto</div>
                    <div className="text-lg font-bold" style={{ color: "#1A1008" }}>
                      €{((Number(form.list_price) || 0) * (1 - (Number(form.supplier_discount_percentage) || 0) / 100)).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8A7060" }}>= Prezzo vendita (al cliente, +IVA)</div>
                    <div className="text-lg font-bold" style={{ color: "#C8A96E" }}>
                      €{((Number(form.list_price) || 0) * (1 - (Number(form.supplier_discount_percentage) || 0) / 100) * (1 + (Number(form.markup_percentage) || 0) / 100)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tecnici" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Formato</Label>
                  <Input placeholder="es. 60x60 cm" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} />
                </div>
                <div>
                  <Label>Spessore (mm)</Label>
                  <Input type="number" step="0.1" value={form.thickness_mm} onChange={(e) => setForm({ ...form, thickness_mm: e.target.value })} />
                </div>
                <div>
                  <Label>Finitura</Label>
                  <Input value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} />
                </div>
                <div>
                  <Label>Colore</Label>
                  <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                </div>
                <div>
                  <Label>Peso per unità (kg)</Label>
                  <Input type="number" step="0.01" value={form.weight_per_unit} onChange={(e) => setForm({ ...form, weight_per_unit: e.target.value })} />
                </div>
                <div>
                  <Label>Certificazioni (separate da virgola)</Label>
                  <Input value={form.certifications.join(", ")} onChange={(e) => setForm({ ...form, certifications: e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean) })} />
                </div>
                <div className="col-span-2">
                  <Label>URL scheda tecnica PDF</Label>
                  <Input value={form.technical_sheet_url} onChange={(e) => setForm({ ...form, technical_sheet_url: e.target.value })} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logistica" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantità minima ordine</Label>
                  <Input type="number" step="0.01" value={form.min_order_quantity} onChange={(e) => setForm({ ...form, min_order_quantity: e.target.value })} />
                </div>
                <div>
                  <Label>Pezzi per pacco</Label>
                  <Input type="number" step="0.01" value={form.pieces_per_pack} onChange={(e) => setForm({ ...form, pieces_per_pack: e.target.value })} />
                </div>
                <div>
                  <Label>Pacchi per pallet</Label>
                  <Input type="number" step="0.01" value={form.pack_per_pallet} onChange={(e) => setForm({ ...form, pack_per_pallet: e.target.value })} />
                </div>
                <div>
                  <Label>Peso pallet (kg)</Label>
                  <Input type="number" step="0.01" value={form.pallet_weight_kg} onChange={(e) => setForm({ ...form, pallet_weight_kg: e.target.value })} />
                </div>
                <div>
                  <Label>Stock disponibile</Label>
                  <Input type="number" step="0.01" value={form.available_stock} onChange={(e) => setForm({ ...form, available_stock: e.target.value })} />
                </div>
                <div>
                  <Label>Soglia scorta minima</Label>
                  <Input type="number" step="0.01" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Ubicazione magazzino</Label>
                  <Input value={form.warehouse_location} onChange={(e) => setForm({ ...form, warehouse_location: e.target.value })} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="anti-perdita" className="space-y-4 mt-4">
              <div className="text-sm p-3 rounded-md" style={{ background: "rgba(192,57,43,0.06)", color: "#1A1008" }}>
                Queste regole verranno applicate automaticamente nei preventivi: alert margine, blocco sconto eccessivo, IVA sempre separata.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sconto cliente massimo %</Label>
                  <Input type="number" step="0.1" value={form.max_customer_discount_percentage} onChange={(e) => setForm({ ...form, max_customer_discount_percentage: e.target.value })} />
                  <p className="text-xs mt-1" style={{ color: "#8A7060" }}>Oltre questa soglia il preventivo richiede approvazione</p>
                </div>
                <div>
                  <Label>Margine minimo accettabile %</Label>
                  <Input type="number" step="0.1" value={form.min_margin_percentage} onChange={(e) => setForm({ ...form, min_margin_percentage: e.target.value })} />
                  <p className="text-xs mt-1" style={{ color: "#8A7060" }}>Sotto questa soglia: alert rosso</p>
                </div>
                <div>
                  <Label>IVA %</Label>
                  <Input type="number" step="0.1" value={form.vat_percentage} onChange={(e) => setForm({ ...form, vat_percentage: e.target.value })} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                    Prodotto attivo
                  </label>
                </div>
                <div className="col-span-2">
                  <Label>Note interne</Label>
                  <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenProductDialog(false)}>Annulla</Button>
            <Button onClick={saveProduct} style={{ background: "#C8A96E", color: "#1A1008" }}>{editing ? "Salva modifiche" : "Crea prodotto"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier dialog */}
      <Dialog open={openSupplierDialog} onOpenChange={setOpenSupplierDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuovo fornitore</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2">
              <Label>Nome *</Label>
              <Input value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Persona di riferimento</Label>
              <Input value={supplierForm.contact_person} onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} />
            </div>
            <div>
              <Label>Telefono</Label>
              <Input value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
            </div>
            <div>
              <Label>Sconto default %</Label>
              <Input type="number" step="0.1" value={supplierForm.default_discount_percentage} onChange={(e) => setSupplierForm({ ...supplierForm, default_discount_percentage: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Termini pagamento</Label>
              <Input placeholder="es. 30gg DF" value={supplierForm.payment_terms} onChange={(e) => setSupplierForm({ ...supplierForm, payment_terms: e.target.value })} />
            </div>
            <div>
              <Label>Lead time (giorni)</Label>
              <Input type="number" value={supplierForm.lead_time_days} onChange={(e) => setSupplierForm({ ...supplierForm, lead_time_days: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Note</Label>
              <Textarea rows={2} value={supplierForm.notes} onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSupplierDialog(false)}>Annulla</Button>
            <Button onClick={saveSupplier} style={{ background: "#C8A96E", color: "#1A1008" }}>Crea fornitore</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      <Dialog open={openHistoryDialog} onOpenChange={setOpenHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Storico modifiche prezzo</DialogTitle></DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {priceHistory.length === 0 ? (
              <div className="text-center py-8 text-sm" style={{ color: "#8A7060" }}>Nessuna modifica registrata</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead className="text-right">Vecchio</TableHead>
                    <TableHead className="text-right">Nuovo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceHistory.map((h: any) => (
                    <TableRow key={h.id}>
                      <TableCell className="text-xs">{new Date(h.changed_at).toLocaleString("it-IT")}</TableCell>
                      <TableCell className="text-sm">{h.changed_field}</TableCell>
                      <TableCell className="text-right text-sm">{h.old_value !== null ? Number(h.old_value).toFixed(2) : "—"}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{h.new_value !== null ? Number(h.new_value).toFixed(2) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCatalog;
