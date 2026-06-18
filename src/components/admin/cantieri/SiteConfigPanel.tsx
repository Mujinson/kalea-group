import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, Save, Upload, CheckCircle2, AlertCircle, GripVertical, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import CatalogProductPicker, { CatalogProduct } from "./CatalogProductPicker";

const FLOOR_TYPES = ["SPC", "Laminato", "Parquet", "PVC", "Ceramica", "Gres", "Resina", "Altro"];

const EQUIPMENT_TYPES = [
  "Taglierina", "Sega", "Livella laser", "Trapano", "Aspiratore", "Miscelatore",
  "Martello in gomma", "Carrello", "Scala", "Prolunghe", "DPI obbligatori", "Altro"
];
const PRIORITY_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: "bassa", label: "Bassa", color: "bg-slate-200 text-slate-700" },
  { value: "media", label: "Media", color: "bg-blue-100 text-blue-700" },
  { value: "alta", label: "Alta", color: "bg-amber-100 text-amber-800" },
  { value: "urgente", label: "Urgente", color: "bg-red-100 text-red-700" },
];

export const priorityBadge = (p?: string) => {
  const o = PRIORITY_OPTIONS.find((x) => x.value === p) || PRIORITY_OPTIONS[1];
  return <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${o.color}`}>{o.label}</span>;
};

interface Props {
  siteId: string;
  site: any;
}

const SiteConfigPanel = ({ siteId, site }: Props) => {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!site) return;
    setForm({
      floor_type: site.floor_type || "",
      floor_brand: site.floor_brand || "",
      floor_model: site.floor_model || "",
      floor_color: site.floor_color || "",
      floor_thickness: site.floor_thickness || "",
      floor_sqm: site.floor_sqm ?? "",
      floor_lot: site.floor_lot || "",
      floor_tech_notes: site.floor_tech_notes || "",
      floor_product_id: site.floor_product_id || null,
      worker_notes: site.worker_notes || "",
      planned_start_date: site.planned_start_date || "",
      planned_end_date: site.planned_end_date || "",
      available_days: site.available_days ?? "",
      estimated_hours: site.estimated_hours ?? "",
      building_floor: site.building_floor || "",
      has_elevator: !!site.has_elevator,
      access_difficulty: site.access_difficulty || "media",
      parking_available: !!site.parking_available,
      parking_distance_m: site.parking_distance_m ?? "",
      ztl_zone: !!site.ztl_zone,
      permits_required: !!site.permits_required,
      electricity_available: !!site.electricity_available,
      water_available: !!site.water_available,
      inhabited: !!site.inhabited,
      construction_type: site.construction_type || "",
      logistics_notes: site.logistics_notes || "",
      priority: site.priority || "media",
      latitude: site.latitude ?? "",
      longitude: site.longitude ?? "",
      contact_email: site.contact_email || "",
      contact_phone: site.contact_phone || "",
      contact_name: site.contact_name || "",
      contact_surname: site.contact_surname || "",
      address: site.address || "",
      city: site.city || "",
    });
  }, [site]);


  const saveAll = async () => {
    setSaving(true);
    const { __floor_product_obj, ...rest } = form;
    const payload: any = { ...rest };

    ["floor_sqm", "available_days", "estimated_hours", "parking_distance_m", "latitude", "longitude"].forEach((k) => {
      payload[k] = payload[k] === "" || payload[k] == null ? null : Number(payload[k]);
    });
    ["planned_start_date", "planned_end_date"].forEach((k) => {
      if (payload[k] === "") payload[k] = null;
    });
    const { error } = await supabase.from("construction_sites").update(payload).eq("id", siteId);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Configurazione salvata");
      qc.invalidateQueries({ queryKey: ["construction-site", siteId] });
    }
  };

  // ============ Accessories ============
  const { data: accessories } = useQuery({
    queryKey: ["site-accessories", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_accessories" as any).select("*").eq("site_id", siteId).order("created_at");
      if (error) throw error; return data as any[];
    },
  });
  const [newAcc, setNewAcc] = useState<{ product: CatalogProduct | null; quantity: string; notes: string }>({
    product: null,
    quantity: "",
    notes: "",
  });
  const addAcc = async () => {
    if (!newAcc.product) {
      toast.error("Seleziona un accessorio dal catalogo");
      return;
    }
    const { error } = await supabase.from("site_accessories" as any).insert({
      site_id: siteId,
      type: newAcc.product.name,
      product_name: [newAcc.product.brand, newAcc.product.name].filter(Boolean).join(" — "),
      catalog_product_id: newAcc.product.id,
      unit: newAcc.product.unit_of_measure,
      quantity: newAcc.quantity ? Number(newAcc.quantity) : null,
      notes: newAcc.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    setNewAcc({ product: null, quantity: "", notes: "" });
    qc.invalidateQueries({ queryKey: ["site-accessories", siteId] });
  };
  const delAcc = async (id: string) => {
    await supabase.from("site_accessories" as any).delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["site-accessories", siteId] });
  };


  // ============ Equipment ============
  const { data: equipment } = useQuery({
    queryKey: ["site-equipment", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_equipment" as any).select("*").eq("site_id", siteId).order("created_at");
      if (error) throw error; return data as any[];
    },
  });
  const toggleEquipment = async (type: string) => {
    const existing = (equipment || []).find((e: any) => e.type === type);
    if (existing) {
      await supabase.from("site_equipment" as any).delete().eq("id", existing.id);
    } else {
      await supabase.from("site_equipment" as any).insert({ site_id: siteId, type });
    }
    qc.invalidateQueries({ queryKey: ["site-equipment", siteId] });
  };

  // ============ Checklist ============
  const { data: checklist } = useQuery({
    queryKey: ["site-checklist", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_checklist_items" as any).select("*").eq("site_id", siteId).order("sort_order");
      if (error) throw error; return data as any[];
    },
  });
  const [newCheck, setNewCheck] = useState("");
  const addCheck = async () => {
    if (!newCheck.trim()) return;
    const max = (checklist || []).reduce((m: number, x: any) => Math.max(m, x.sort_order || 0), 0);
    await supabase.from("site_checklist_items" as any).insert({
      site_id: siteId, label: newCheck.trim(), sort_order: max + 1,
    });
    setNewCheck("");
    qc.invalidateQueries({ queryKey: ["site-checklist", siteId] });
  };
  const delCheck = async (id: string) => {
    await supabase.from("site_checklist_items" as any).delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["site-checklist", siteId] });
  };
  const resetCheck = async (id: string) => {
    await supabase.from("site_checklist_items" as any).update({ completed_at: null, completed_by: null }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["site-checklist", siteId] });
  };

  // ============ Attachments ============
  const { data: attachments } = useQuery({
    queryKey: ["site-attachments", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_attachments" as any).select("*").eq("site_id", siteId).order("created_at", { ascending: false });
      if (error) throw error; return data as any[];
    },
  });
  const [attCategory, setAttCategory] = useState("Planimetria");
  const [uploadingAtt, setUploadingAtt] = useState(false);
  const uploadAtt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
    setUploadingAtt(true);
    try {
      const path = `${siteId}/att-${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
      const { error: upErr } = await supabase.storage.from("site-media").upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("site-media").getPublicUrl(path);
      const { data: { user } } = await supabase.auth.getUser();
      const { error: insErr } = await supabase.from("site_attachments" as any).insert({
        site_id: siteId, category: attCategory, file_url: pub.publicUrl,
        file_name: file.name, file_type: file.type, file_size: file.size,
        uploaded_by: user?.id,
      });
      if (insErr) throw insErr;
      qc.invalidateQueries({ queryKey: ["site-attachments", siteId] });
    } catch (err: any) { toast.error(err.message || "Errore upload"); }
    finally { setUploadingAtt(false); }
  };
  const delAtt = async (id: string, url: string) => {
    const parts = url.split("/site-media/");
    if (parts[1]) await supabase.storage.from("site-media").remove([parts[1]]);
    await supabase.from("site_attachments" as any).delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["site-attachments", siteId] });
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={["dati", "tempi", "priorita"]} className="space-y-3">
        {/* ---------- Pavimento ---------- */}
        <AccordionItem value="dati" className="bg-white rounded-xl border px-4">
          <AccordionTrigger className="text-base font-semibold">Prodotto pavimento</AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-3">
              <Field label="Seleziona dal catalogo Kalēa">
                <CatalogProductPicker
                  value={
                    form.__floor_product_obj ||
                    (form.floor_product_id
                      ? {
                          id: form.floor_product_id,
                          product_code: form.floor_model || "—",
                          name: form.floor_model || "Prodotto selezionato",
                          brand: form.floor_brand,
                          collection: null,
                          format: null,
                          color: form.floor_color,
                          finish: null,
                          thickness_mm: null,
                          unit_of_measure: "mq",
                          list_price: 0,
                        }
                      : null)
                  }
                  onChange={(p) => {
                    if (!p) {
                      setForm({ ...form, floor_product_id: null, __floor_product_obj: null });
                      return;
                    }
                    setForm({
                      ...form,
                      __floor_product_obj: p,
                      floor_product_id: p.id,
                      floor_type: form.floor_type || "",
                      floor_brand: p.brand || "",
                      floor_model: p.name || "",
                      floor_color: [p.color, p.finish].filter(Boolean).join(" / "),
                      floor_thickness: p.thickness_mm ? `${p.thickness_mm} mm` : form.floor_thickness,
                    });
                  }}
                />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Tipologia">
                  <Select value={form.floor_type} onValueChange={(v) => setForm({ ...form, floor_type: v })}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{FLOOR_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="MQ da posare"><Input type="number" value={form.floor_sqm} onChange={(e) => setForm({ ...form, floor_sqm: e.target.value })} /></Field>
                <Field label="Lotto materiale"><Input value={form.floor_lot} onChange={(e) => setForm({ ...form, floor_lot: e.target.value })} /></Field>
                <div className="md:col-span-3">
                  <Field label="Note tecniche"><Textarea rows={2} value={form.floor_tech_notes} onChange={(e) => setForm({ ...form, floor_tech_notes: e.target.value })} /></Field>
                </div>
                <div className="md:col-span-3">
                  <Field label="Note per gli operai (visibili nell'app operaio)">
                    <Textarea
                      rows={3}
                      placeholder="Istruzioni di posa, accorgimenti, indicazioni del cliente…"
                      value={form.worker_notes}
                      onChange={(e) => setForm({ ...form, worker_notes: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>


        {/* ---------- Tempistiche ---------- */}
        <AccordionItem value="tempi" className="bg-white rounded-xl border px-4">
          <AccordionTrigger className="text-base font-semibold">Tempistiche</AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="Data inizio prevista"><Input type="date" value={form.planned_start_date} onChange={(e) => setForm({ ...form, planned_start_date: e.target.value })} /></Field>
              <Field label="Data fine prevista"><Input type="date" value={form.planned_end_date} onChange={(e) => setForm({ ...form, planned_end_date: e.target.value })} /></Field>
              <Field label="Giorni disponibili"><Input type="number" value={form.available_days} onChange={(e) => setForm({ ...form, available_days: e.target.value })} /></Field>
              <Field label="Ore previste"><Input type="number" value={form.estimated_hours} onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })} /></Field>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ---------- Caratteristiche cantiere ---------- */}
        <AccordionItem value="logistica" className="bg-white rounded-xl border px-4">
          <AccordionTrigger className="text-base font-semibold">Caratteristiche cantiere</AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Piano edificio"><Input value={form.building_floor} onChange={(e) => setForm({ ...form, building_floor: e.target.value })} /></Field>
              <Field label="Facilità accesso">
                <Select value={form.access_difficulty} onValueChange={(v) => setForm({ ...form, access_difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facile">Facile</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="difficile">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Tipo intervento">
                <Select value={form.construction_type} onValueChange={(v) => setForm({ ...form, construction_type: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nuova_costruzione">Nuova costruzione</SelectItem>
                    <SelectItem value="ristrutturazione">Ristrutturazione</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Distanza parcheggio (m)"><Input type="number" value={form.parking_distance_m} onChange={(e) => setForm({ ...form, parking_distance_m: e.target.value })} /></Field>
              <SwitchField label="Ascensore" checked={form.has_elevator} onChange={(v) => setForm({ ...form, has_elevator: v })} />
              <SwitchField label="Parcheggio disponibile" checked={form.parking_available} onChange={(v) => setForm({ ...form, parking_available: v })} />
              <SwitchField label="Zona ZTL" checked={form.ztl_zone} onChange={(v) => setForm({ ...form, ztl_zone: v })} />
              <SwitchField label="Permessi necessari" checked={form.permits_required} onChange={(v) => setForm({ ...form, permits_required: v })} />
              <SwitchField label="Corrente elettrica" checked={form.electricity_available} onChange={(v) => setForm({ ...form, electricity_available: v })} />
              <SwitchField label="Acqua disponibile" checked={form.water_available} onChange={(v) => setForm({ ...form, water_available: v })} />
              <SwitchField label="Ambiente abitato" checked={form.inhabited} onChange={(v) => setForm({ ...form, inhabited: v })} />
              <div className="md:col-span-3">
                <Field label="Note logistiche"><Textarea rows={2} value={form.logistics_notes} onChange={(e) => setForm({ ...form, logistics_notes: e.target.value })} /></Field>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ---------- Contatti ---------- */}
        <AccordionItem value="contatti" className="bg-white rounded-xl border px-4">
          <AccordionTrigger className="text-base font-semibold">Indirizzo & contatti</AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Indirizzo"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
              <Field label="Città"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Latitudine"><Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></Field>
                <Field label="Longitudine"><Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></Field>
              </div>
              <Field label="Nome referente"><Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></Field>
              <Field label="Cognome referente"><Input value={form.contact_surname} onChange={(e) => setForm({ ...form, contact_surname: e.target.value })} /></Field>
              <Field label="Telefono"><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></Field>
              <Field label="Email"><Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></Field>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ---------- Priorità ---------- */}
        <AccordionItem value="priorita" className="bg-white rounded-xl border px-4">
          <AccordionTrigger className="text-base font-semibold">Priorità</AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setForm({ ...form, priority: p.value })}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition ${form.priority === p.value ? p.color + " border-current" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end">
        <Button onClick={saveAll} disabled={saving}><Save className="w-4 h-4 mr-2" /> {saving ? "Salvataggio..." : "Salva configurazione"}</Button>
      </div>

      {/* ============ Accessori ============ */}
      <Card className="bg-white">
        <CardHeader className="pb-2"><CardTitle className="text-base">Accessori richiesti</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_110px_1fr_auto] gap-2 items-end">
            <div>
              <Label className="text-xs">Accessorio (dal catalogo)</Label>
              <CatalogProductPicker
                value={newAcc.product}
                onChange={(p) => setNewAcc({ ...newAcc, product: p })}
                placeholder="Cerca battiscopa, profili, colla, sottofondo…"
                categoryNames={["Accessori", "Sottofondi"]}
              />
            </div>
            <div>
              <Label className="text-xs">Quantità</Label>
              <Input
                type="number"
                placeholder={newAcc.product?.unit_of_measure || ""}
                value={newAcc.quantity}
                onChange={(e) => setNewAcc({ ...newAcc, quantity: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Note</Label>
              <Input value={newAcc.notes} onChange={(e) => setNewAcc({ ...newAcc, notes: e.target.value })} />
            </div>
            <Button onClick={addAcc} size="sm" disabled={!newAcc.product}>
              <Plus className="w-4 h-4 mr-1" /> Aggiungi
            </Button>
          </div>
          <div className="space-y-1">
            {(accessories || []).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">{a.product_name || a.type}</span>
                  {a.quantity ? ` · ${a.quantity}${a.unit ? " " + a.unit : ""}` : ""}
                  {a.notes ? ` · ${a.notes}` : ""}
                </div>
                <Button size="icon" variant="ghost" onClick={() => delAcc(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            ))}
            {!(accessories || []).length && <p className="text-sm text-muted-foreground py-2 text-center">Nessun accessorio.</p>}
          </div>
        </CardContent>

      </Card>

      {/* ============ Attrezzatura ============ */}
      <Card className="bg-white">
        <CardHeader className="pb-2"><CardTitle className="text-base">Attrezzatura richiesta agli operai</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EQUIPMENT_TYPES.map((t) => {
              const checked = !!(equipment || []).find((e: any) => e.type === t);
              return (
                <label key={t} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer ${checked ? "bg-primary/5 border-primary/30" : "bg-white"}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleEquipment(t)} />
                  <span className="text-sm">{t}</span>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ============ Checklist ============ */}
      <Card className="bg-white">
        <CardHeader className="pb-2"><CardTitle className="text-base">Checklist lavori</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Nuova voce (es. Posa battiscopa)" value={newCheck} onChange={(e) => setNewCheck(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addCheck(); }} />
            <Button onClick={addCheck} size="sm"><Plus className="w-4 h-4 mr-1" /> Aggiungi</Button>
          </div>
          <div className="space-y-1">
            {(checklist || []).map((c: any) => (
              <div key={c.id} className="flex items-center gap-2 p-2 border rounded-lg">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                {c.completed_at ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <span className="w-4 h-4 rounded border border-muted-foreground/40" />}
                <span className={`flex-1 text-sm ${c.completed_at ? "line-through text-muted-foreground" : ""}`}>{c.label}</span>
                {c.completed_at && (
                  <Button size="sm" variant="outline" onClick={() => resetCheck(c.id)}>Riapri</Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => delCheck(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            ))}
            {!(checklist || []).length && <p className="text-sm text-muted-foreground py-2 text-center">Nessuna voce. Aggiungila per definire la sequenza dei lavori.</p>}
          </div>
        </CardContent>
      </Card>

      {/* ============ Allegati ============ */}
      <Card className="bg-white">
        <CardHeader className="pb-2"><CardTitle className="text-base">Allegati (PDF, planimetrie, disegni)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="w-44">
              <Label className="text-xs">Categoria</Label>
              <Select value={attCategory} onValueChange={setAttCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Planimetria", "Disegno tecnico", "PDF", "Foto iniziale", "Documentazione", "Altro"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg bg-white hover:bg-slate-50 cursor-pointer text-sm">
              <Upload className="w-4 h-4" /> {uploadingAtt ? "Caricamento..." : "Carica file"}
              <input type="file" className="hidden" onChange={uploadAtt} disabled={uploadingAtt} />
            </label>
          </div>
          <div className="space-y-1">
            {(attachments || []).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="text-sm">
                  <Badge variant="outline" className="text-[10px] mr-2">{a.category}</Badge>
                  <span className="font-medium">{a.file_name}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => window.open(a.file_url, "_blank")}><Download className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => delAtt(a.id, a.file_url)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {!(attachments || []).length && <p className="text-sm text-muted-foreground py-2 text-center">Nessun allegato.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    {children}
  </div>
);

const SwitchField = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between p-2 border rounded-lg bg-white">
    <span className="text-sm">{label}</span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default SiteConfigPanel;
