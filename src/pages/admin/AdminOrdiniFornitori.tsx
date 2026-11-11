import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrmPageHeader } from "@/components/admin/CrmShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileDown, Save, ArrowLeft, Copy, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { nextOrderNumber, orderTotals, lineNet, ORDER_STATUSES, type OrderLine } from "@/lib/supplierOrders";
import { buildSupplierOrderPdf } from "@/lib/supplierOrderPdf";

const UMS = ["MQ", "ML", "N.", "PZ", "CF", "KG", "LT", "PAL", "SC"];
const today = () => new Date().toISOString().slice(0, 10);
const eur = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

type Order = {
  id?: string; order_number: string; order_date: string; supplier_id: string | null; supplier_snapshot: any;
  site_id: string | null; status: string; payment_terms: string | null; requested_delivery_date: string | null;
  delivery_place: string | null; carrier: string | null; transport: string | null; reference: string | null;
  notes: string | null; show_prices: boolean; lines: OrderLine[];
  direction: string; supplier_reference: string | null;
};

const emptyLine = (): OrderLine => ({ description: "", um: "MQ", qty: 1, vat: 22 });

export default function AdminOrdiniFornitori() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Order | null>(null);
  const [dir, setDir] = useState<"tutti" | "uscita" | "entrata">("tutti");

  const { data: orders = [] } = useQuery({
    queryKey: ["supplier_orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("supplier_orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as (Order & { id: string })[];
    },
  });
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers-min"],
    queryFn: async () => (await supabase.from("suppliers").select("*").order("name")).data ?? [],
  });
  const { data: sites = [] } = useQuery({
    queryKey: ["sites-min"],
    queryFn: async () => (await supabase.from("construction_sites").select("id,title,address,city,province").order("created_at", { ascending: false })).data ?? [],
  });

  const newOrder = (): Order => ({
    order_number: nextOrderNumber(orders.map((o) => o.order_number), new Date().getFullYear()),
    order_date: today(), supplier_id: null, supplier_snapshot: {}, site_id: null, status: "bozza",
    payment_terms: "", requested_delivery_date: null, delivery_place: "", carrier: "", transport: "",
    reference: "", notes: "", show_prices: false, lines: [emptyLine()], direction: "uscita", supplier_reference: "",
  });

  if (editing) return <OrderEditor order={editing} suppliers={suppliers} sites={sites} onBack={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["supplier_orders"] }); }} />;

  return (
    <div className="space-y-4">
      <CrmPageHeader breadcrumb={["Fornitori", "Ordini fornitori"]} title="Ordini fornitori"
        subtitle="Ordini inviati ai fornitori e conferme d'ordine ricevute: tutto resta salvato."
        actions={<Button size="sm" onClick={() => setEditing(newOrder())}><Plus className="w-4 h-4 mr-2" />Nuovo ordine</Button>} />
      <div className="flex gap-2">
        {([["tutti", "Tutti"], ["uscita", "Inviati da noi"], ["entrata", "Ricevuti dal fornitore"]] as const).map(([k, v]) => (
          <Button key={k} size="sm" variant={dir === k ? "default" : "outline"} onClick={() => setDir(k)}>{v}</Button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {orders.length === 0 && <p className="p-6 text-sm text-muted-foreground">Nessun ordine ancora. Premi «Nuovo ordine».</p>}
        {orders.filter((o) => dir === "tutti" || (o.direction || "uscita") === dir).map((o) => (
          <div key={o.id} className="flex flex-wrap items-center gap-3 p-3 hover:bg-muted/40 cursor-pointer" onClick={() => setEditing(o)}>
            <Badge variant={o.direction === "entrata" ? "secondary" : "outline"} className="w-20 justify-center">{o.direction === "entrata" ? "Ricevuto" : "Inviato"}</Badge>
            <span className="font-mono text-sm w-32">{o.order_number}</span>
            <span className="text-sm w-24 text-muted-foreground">{new Date(o.order_date).toLocaleDateString("it-IT")}</span>
            <span className="font-medium flex-1 min-w-[160px]">{o.supplier_snapshot?.name || "—"}</span>
            <span className="text-sm text-muted-foreground">{o.lines?.length || 0} righe</span>
            <Badge variant="outline">{ORDER_STATUSES[o.status] ?? o.status}</Badge>
            <Button size="sm" variant="ghost" title="Duplica" onClick={(e) => { e.stopPropagation(); const { id, ...rest } = o; setEditing({ ...rest, order_number: newOrder().order_number, order_date: today(), status: "bozza" }); }}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderEditor({ order, suppliers, sites, onBack }: { order: Order; suppliers: any[]; sites: any[]; onBack: () => void }) {
  const [o, setO] = useState<Order>(order);
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState("");
  const set = <K extends keyof Order>(k: K, v: Order[K]) => setO((p) => ({ ...p, [k]: v }));

  const { data: products = [] } = useQuery({
    queryKey: ["order-catalog", o.supplier_id],
    enabled: !!o.supplier_id,
    queryFn: async () => (await supabase.from("catalog_products").select("id,name,product_code,supplier_code,unit_of_measure,purchase_price,net_cost,vat_percentage").eq("supplier_id", o.supplier_id!).eq("is_active", true).order("name").limit(500)).data ?? [],
  });
  const filtered = useMemo(() => products.filter((p: any) => `${p.name} ${p.supplier_code ?? ""} ${p.product_code ?? ""}`.toLowerCase().includes(catFilter.toLowerCase())).slice(0, 30), [products, catFilter]);

  useEffect(() => {
    const s = suppliers.find((x) => x.id === o.supplier_id);
    if (s) setO((p) => ({ ...p, payment_terms: p.payment_terms || s.payment_terms || "", supplier_snapshot: {
      name: s.name, vat_number: s.vat_number, fiscal_code: s.fiscal_code, sdi_code: s.sdi_code, pec: s.pec,
      address: [s.address, [s.postal_code, s.city, s.province && `(${s.province})`].filter(Boolean).join(" ")].filter(Boolean).join(" - "),
      email: s.email, phone: s.phone, contact_person: s.contact_person, bank_accounts: s.bank_accounts || [],
    } }));
  }, [o.supplier_id, suppliers]);

  const setLine = (i: number, patch: Partial<OrderLine>) => setO((p) => ({ ...p, lines: p.lines.map((l, k) => (k === i ? { ...l, ...patch } : l)) }));
  const move = (i: number, d: number) => setO((p) => { const a = [...p.lines]; const j = i + d; if (j < 0 || j >= a.length) return p; [a[i], a[j]] = [a[j], a[i]]; return { ...p, lines: a }; });
  const addProduct = (p: any) => setO((s) => ({
    ...s,
    lines: [...s.lines.filter((l) => l.description.trim()), {
      code: p.product_code ?? undefined, supplierCode: p.supplier_code ?? undefined, description: p.name,
      um: (p.unit_of_measure || "MQ").toUpperCase(), qty: 1, price: p.purchase_price ?? p.net_cost ?? null, vat: p.vat_percentage ?? 22,
    }],
  }));

  const site = sites.find((s) => s.id === o.site_id);
  const siteLabel = site ? [site.title, [site.address, site.city, site.province && `(${site.province})`].filter(Boolean).join(" ")].filter(Boolean).join(" — ") : null;
  const validLines = o.lines.filter((l) => l.description.trim());

  const save = async () => {
    if (!o.supplier_id) return toast.error("Scegli il fornitore");
    if (!validLines.length) return toast.error("Aggiungi almeno un articolo");
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const payload: any = { ...o, lines: validLines, created_by: o.id ? undefined : u.user?.id };
    const res = o.id
      ? await supabase.from("supplier_orders").update(payload).eq("id", o.id).select().single()
      : await supabase.from("supplier_orders").insert(payload).select().single();
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    setO(res.data as any);
    toast.success("Ordine salvato");
  };

  const pdf = async () => {
    if (!validLines.length) return toast.error("Aggiungi almeno un articolo");
    const doc = await buildSupplierOrderPdf({ ...o, supplier: o.supplier_snapshot || {}, site_label: siteLabel, lines: validLines });
    const name = `Ordine-${o.order_number}-${(o.supplier_snapshot?.name || "fornitore").replace(/[^a-z0-9]+/gi, "-")}.pdf`;
    doc.save(name);
  };

  const remove = async () => {
    if (!o.id || !confirm("Eliminare questo ordine?")) return;
    const { error } = await supabase.from("supplier_orders").delete().eq("id", o.id);
    if (error) return toast.error(error.message);
    onBack();
  };

  const t = orderTotals(validLines);

  return (
    <div className="space-y-5">
      <CrmPageHeader breadcrumb={["Fornitori", "Ordini fornitori", o.order_number]} title={`Ordine ${o.order_number}`}
        actions={<div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" />Elenco</Button>
          <Button size="sm" variant="outline" onClick={pdf}><FileDown className="w-4 h-4 mr-1" />Scarica PDF</Button>
          <Button size="sm" onClick={save} disabled={saving}><Save className="w-4 h-4 mr-1" />{saving ? "Salvo…" : "Salva"}</Button>
        </div>} />

      <div className="grid md:grid-cols-3 gap-4 rounded-xl border border-border bg-card p-4">
        <F label="Fornitore">
          <Select value={o.supplier_id ?? ""} onValueChange={(v) => set("supplier_id", v)}>
            <SelectTrigger><SelectValue placeholder="Scegli fornitore" /></SelectTrigger>
            <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </F>
        <F label="Tipo">
          <Select value={o.direction || "uscita"} onValueChange={(v) => set("direction", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="uscita">Inviato da noi al fornitore</SelectItem><SelectItem value="entrata">Ricevuto dal fornitore (conferma)</SelectItem></SelectContent>
          </Select>
        </F>
        <F label="Numero"><Input value={o.order_number} onChange={(e) => set("order_number", e.target.value)} /></F>
        <F label="Data ordine"><Input type="date" value={o.order_date} onChange={(e) => set("order_date", e.target.value)} /></F>
        <F label="Stato">
          <Select value={o.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(ORDER_STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </F>
        <F label="Cantiere (facoltativo)">
          <Select value={o.site_id ?? "none"} onValueChange={(v) => {
            const s = sites.find((x) => x.id === v);
            setO((p) => ({ ...p, site_id: v === "none" ? null : v, delivery_place: p.delivery_place || (s ? [s.address, s.city, s.province && `(${s.province})`].filter(Boolean).join(" ") : "") }));
          }}>
            <SelectTrigger><SelectValue placeholder="Nessuno" /></SelectTrigger>
            <SelectContent><SelectItem value="none">Nessuno</SelectItem>{sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
          </Select>
        </F>
        <F label="Consegna richiesta entro"><Input type="date" value={o.requested_delivery_date ?? ""} onChange={(e) => set("requested_delivery_date", e.target.value || null)} /></F>
        <F label="Luogo di consegna"><Input value={o.delivery_place ?? ""} onChange={(e) => set("delivery_place", e.target.value)} placeholder="Magazzino o indirizzo cantiere" /></F>
        <F label="Pagamento"><Input value={o.payment_terms ?? ""} onChange={(e) => set("payment_terms", e.target.value)} placeholder="Es. RI.BA. 60 gg f.m." /></F>
        <F label="Riferimento"><Input value={o.reference ?? ""} onChange={(e) => set("reference", e.target.value)} placeholder="Es. Rif. Marco / commessa" /></F>
        <F label="N. ordine / conferma del fornitore"><Input value={o.supplier_reference ?? ""} onChange={(e) => set("supplier_reference", e.target.value)} placeholder="Numero sul loro documento" /></F>
        <F label="Trasporto"><Input value={o.transport ?? ""} onChange={(e) => set("transport", e.target.value)} placeholder="Franco cantiere, ritiro…" /></F>
        <F label="Vettore"><Input value={o.carrier ?? ""} onChange={(e) => set("carrier", e.target.value)} /></F>
        <div className="flex items-center gap-3 pt-6"><Switch id="sp" checked={o.show_prices} onCheckedChange={(v) => set("show_prices", v)} /><Label htmlFor="sp">Mostra prezzi nel PDF</Label></div>
      </div>

      {o.supplier_id && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="text-sm font-medium">Aggiungi dal catalogo di questo fornitore</p>
          <Input placeholder={products.length ? "Cerca articolo…" : "Nessun articolo in catalogo per questo fornitore: usa le righe libere"} value={catFilter} onChange={(e) => setCatFilter(e.target.value)} disabled={!products.length} />
          {catFilter && (
            <div className="max-h-56 overflow-y-auto divide-y divide-border border border-border rounded-md">
              {filtered.map((p: any) => (
                <button key={p.id} className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex justify-between gap-2" onClick={() => { addProduct(p); setCatFilter(""); }}>
                  <span>{p.name}</span><span className="text-muted-foreground font-mono text-xs">{p.supplier_code || p.product_code}</span>
                </button>
              ))}
              {!filtered.length && <p className="px-3 py-2 text-sm text-muted-foreground">Nessun risultato</p>}
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4 space-y-2 overflow-x-auto">
        <div className="grid gap-2 text-xs font-medium text-muted-foreground min-w-[760px]" style={{ gridTemplateColumns: o.show_prices ? "110px 1fr 80px 80px 90px 60px 60px 90px 80px" : "130px 1fr 90px 100px 80px" }}>
          <span>Cod. fornitore</span><span>Descrizione</span><span>U.M.</span><span>Quantità</span>
          {o.show_prices && <><span>Prezzo</span><span>Sc. %</span><span>IVA %</span><span className="text-right">Importo</span></>}
          <span />
        </div>
        {o.lines.map((l, i) => (
          <div key={i} className="grid gap-2 items-center min-w-[760px]" style={{ gridTemplateColumns: o.show_prices ? "110px 1fr 80px 80px 90px 60px 60px 90px 80px" : "130px 1fr 90px 100px 80px" }}>
            <Input value={l.supplierCode ?? ""} onChange={(e) => setLine(i, { supplierCode: e.target.value })} />
            <Input value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} placeholder="Descrizione articolo" />
            <Select value={l.um} onValueChange={(v) => setLine(i, { um: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Array.from(new Set([...UMS, l.um])).map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" step="0.01" min="0" value={l.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} />
            {o.show_prices && <>
              <Input type="number" step="0.01" value={l.price ?? ""} onChange={(e) => setLine(i, { price: e.target.value === "" ? null : Number(e.target.value) })} />
              <Input type="number" step="0.5" value={l.discount ?? ""} onChange={(e) => setLine(i, { discount: e.target.value === "" ? null : Number(e.target.value) })} />
              <Input type="number" value={l.vat ?? 22} onChange={(e) => setLine(i, { vat: Number(e.target.value) })} />
              <span className="text-right text-sm">{eur(lineNet(l))}</span>
            </>}
            <div className="flex">
              <Button size="icon" variant="ghost" className="h-8 w-6" onClick={() => move(i, -1)}><ArrowUp className="w-3 h-3" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-6" onClick={() => move(i, 1)}><ArrowDown className="w-3 h-3" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-7" onClick={() => setO((p) => ({ ...p, lines: p.lines.filter((_, k) => k !== i) }))}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setO((p) => ({ ...p, lines: [...p.lines, emptyLine()] }))}><Plus className="w-4 h-4 mr-1" />Riga libera</Button>
        {o.show_prices && <p className="text-right text-sm pt-2">Imponibile <b>{eur(t.net)}</b> · IVA {eur(t.vat)} · Totale <b>{eur(t.total)}</b></p>}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <F label="Note per il fornitore"><Textarea rows={3} value={o.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></F>
      </div>
      {o.id && <Button variant="ghost" className="text-destructive" onClick={remove}><Trash2 className="w-4 h-4 mr-1" />Elimina ordine</Button>}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
