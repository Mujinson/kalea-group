import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Plus, Search, RefreshCw, X, Check } from "lucide-react";
import {
  KpiCard,
  PageHeader,
  CrmToolbar,
  ToolbarSearch,
  ToolbarButton,
  CrmEmptyState,
} from "@/components/admin/crm-ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type CsvRow = Record<string, string>;

interface FlagRow {
  id: string;
  product_match_hint: string | null;
  issue_note: string | null;
  csv_row: CsvRow | null;
  resolved: boolean;
  created_at: string;
}

interface CatalogMatch {
  id: string;
  brand: string | null;
  name: string;
  format: string | null;
  list_price: number | null;
  price_base_sqm: number | null;
}

type FilterKey = "all" | "no_match" | "verify";

const num = (s?: string | null): number | null => {
  if (!s) return null;
  const v = parseFloat(String(s).replace(",", "."));
  return Number.isFinite(v) ? v : null;
};

export default function CatalogImportFlags() {
  const [rows, setRows] = useState<FlagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [totals, setTotals] = useState({ total: 0, resolved: 0, pending: 0 });

  const [createOpen, setCreateOpen] = useState<FlagRow | null>(null);
  const [assignOpen, setAssignOpen] = useState<FlagRow | null>(null);

  const load = async () => {
    setLoading(true);
    const [pendingRes, totalRes, resolvedRes] = await Promise.all([
      supabase
        .from("catalog_import_flags")
        .select("id, product_match_hint, issue_note, csv_row, resolved, created_at")
        .eq("resolved", false)
        .order("issue_note", { ascending: true })
        .order("product_match_hint", { ascending: true })
        .limit(2000),
      supabase.from("catalog_import_flags").select("id", { count: "exact", head: true }),
      supabase.from("catalog_import_flags").select("id", { count: "exact", head: true }).eq("resolved", true),
    ]);
    if (pendingRes.error) {
      toast.error("Errore nel caricamento segnalazioni");
      setLoading(false);
      return;
    }
    setRows((pendingRes.data as any) || []);
    setTotals({
      total: totalRes.count || 0,
      resolved: resolvedRes.count || 0,
      pending: (totalRes.count || 0) - (resolvedRes.count || 0),
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "no_match" && r.issue_note !== "no_match_in_db") return false;
      if (filter === "verify" && r.issue_note === "no_match_in_db") return false;
      if (!q) return true;
      const hay = [
        r.product_match_hint,
        r.issue_note,
        r.csv_row?.brand,
        r.csv_row?.name,
        r.csv_row?.format,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, filter]);

  const counts = useMemo(() => {
    const noMatch = rows.filter((r) => r.issue_note === "no_match_in_db").length;
    return { noMatch, verify: rows.length - noMatch };
  }, [rows]);

  const markResolved = async (id: string) => {
    const { error } = await supabase
      .from("catalog_import_flags")
      .update({ resolved: true })
      .eq("id", id);
    if (error) {
      toast.error("Errore: " + error.message);
      return;
    }
    toast.success("Segnalazione archiviata");
    setRows((prev) => prev.filter((r) => r.id !== id));
    setTotals((t) => ({ ...t, resolved: t.resolved + 1, pending: t.pending - 1 }));
  };

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumb={["CRM", "Catalogo", "Segnalazioni import"]}
        title="Segnalazioni Import Listino"
        subtitle="Righe del CSV che richiedono revisione manuale prima di scrivere i prezzi in catalogo."
        actions={
          <ToolbarButton onClick={load} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Aggiorna
          </ToolbarButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard
          label="Totali"
          value={totals.total}
          tone="neutral"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <KpiCard
          label="Risolte"
          value={totals.resolved}
          tone="success"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <KpiCard
          label="Da lavorare"
          value={totals.pending}
          tone="warning"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      <CrmToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Cerca per brand, nome, formato…" />
        <ToolbarButton active={filter === "all"} onClick={() => setFilter("all")}>
          Tutte ({rows.length})
        </ToolbarButton>
        <ToolbarButton active={filter === "no_match"} onClick={() => setFilter("no_match")}>
          Non trovati in DB ({counts.noMatch})
        </ToolbarButton>
        <ToolbarButton active={filter === "verify"} onClick={() => setFilter("verify")}>
          Da verificare ({counts.verify})
        </ToolbarButton>
      </CrmToolbar>

      {loading ? (
        <div className="crm-card p-6 text-sm text-crm-ink-muted">Caricamento…</div>
      ) : filtered.length === 0 ? (
        <div className="crm-card">
          <CrmEmptyState
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="Nessuna segnalazione"
            description={
              rows.length === 0
                ? "Tutte le righe sono state risolte. Buon lavoro."
                : "Nessuna segnalazione corrisponde ai filtri attivi."
            }
          />
        </div>
      ) : (
        <div className="crm-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-crm-ink-subtle border-b border-crm-border">
                  <th className="px-4 py-3">Prodotto (dal CSV)</th>
                  <th className="px-4 py-3">Formato</th>
                  <th className="px-4 py-3 text-right">Prezzo base €/mq</th>
                  <th className="px-4 py-3 text-right">Oltre paletta</th>
                  <th className="px-4 py-3 text-right">Oltre 3 palette</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const csv = r.csv_row || {};
                  const isNoMatch = r.issue_note === "no_match_in_db";
                  return (
                    <tr key={r.id} className="border-b border-crm-border/60 hover:bg-crm-bg-soft">
                      <td className="px-4 py-3">
                        <div className="font-medium text-crm-ink">{csv.name || "—"}</div>
                        <div className="text-[11px] text-crm-ink-subtle">{csv.brand || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-crm-ink-muted">{csv.format || "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-crm-ink">
                        {csv.prezzo_base_mq ? `€ ${csv.prezzo_base_mq}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-crm-ink-muted">
                        {csv.prezzo_oltre_paletta_mq ? `€ ${csv.prezzo_oltre_paletta_mq}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-crm-ink-muted">
                        {csv.prezzo_oltre_3_palette_mq ? `€ ${csv.prezzo_oltre_3_palette_mq}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            isNoMatch
                              ? "border-crm-danger/40 text-crm-danger bg-crm-danger-soft"
                              : "border-crm-warning/40 text-crm-warning bg-crm-warning-soft"
                          }
                        >
                          {isNoMatch ? "Non in DB" : "Da verificare"}
                        </Badge>
                        {!isNoMatch && csv.nome_da_verificare && (
                          <div className="text-[11px] text-crm-ink-subtle mt-1 max-w-xs">
                            {csv.nome_da_verificare}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <ToolbarButton
                            variant="primary"
                            icon={<Plus className="w-3.5 h-3.5" />}
                            onClick={() => setCreateOpen(r)}
                          >
                            Crea
                          </ToolbarButton>
                          <ToolbarButton
                            icon={<Search className="w-3.5 h-3.5" />}
                            onClick={() => setAssignOpen(r)}
                          >
                            Assegna
                          </ToolbarButton>
                          <ToolbarButton
                            variant="ghost"
                            icon={<X className="w-3.5 h-3.5" />}
                            onClick={() => markResolved(r.id)}
                          >
                            Ignora
                          </ToolbarButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {createOpen && (
        <CreateProductDialog
          flag={createOpen}
          onClose={() => setCreateOpen(null)}
          onDone={() => {
            setRows((prev) => prev.filter((r) => r.id !== createOpen.id));
            setTotals((t) => ({ ...t, resolved: t.resolved + 1, pending: t.pending - 1 }));
            setCreateOpen(null);
          }}
        />
      )}

      {assignOpen && (
        <AssignPriceDialog
          flag={assignOpen}
          onClose={() => setAssignOpen(null)}
          onDone={() => {
            setRows((prev) => prev.filter((r) => r.id !== assignOpen.id));
            setTotals((t) => ({ ...t, resolved: t.resolved + 1, pending: t.pending - 1 }));
            setAssignOpen(null);
          }}
        />
      )}
    </div>
  );
}

/* -------------------- Create product dialog -------------------- */
function CreateProductDialog({
  flag,
  onClose,
  onDone,
}: {
  flag: FlagRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const csv = flag.csv_row || {};
  const [brand, setBrand] = useState(csv.brand || "");
  const [name, setName] = useState(csv.name || "");
  const [format, setFormat] = useState(csv.format || "");
  const [p1, setP1] = useState<string>(csv.prezzo_base_mq || "");
  const [p2, setP2] = useState<string>(csv.prezzo_oltre_paletta_mq || "");
  const [p3, setP3] = useState<string>(csv.prezzo_oltre_3_palette_mq || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!brand.trim() || !name.trim()) {
      toast.error("Brand e nome sono obbligatori");
      return;
    }
    setSaving(true);
    const priceBase = num(p1);
    const insertRes = await supabase.from("catalog_products").insert({
      brand: brand.trim(),
      name: name.trim(),
      format: format.trim() || null,
      price_base_sqm: priceBase,
      price_over_pallet_sqm: num(p2),
      price_over_3_pallets_sqm: num(p3),
      list_price: priceBase, // keep list_price coerente per retrocompatibilità
      is_active: true,
      unit_of_measure: "mq",
    });
    if (insertRes.error) {
      toast.error("Errore: " + insertRes.error.message);
      setSaving(false);
      return;
    }
    await supabase.from("catalog_import_flags").update({ resolved: true }).eq("id", flag.id);
    toast.success("Prodotto creato e segnalazione archiviata");
    setSaving(false);
    onDone();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crea nuovo prodotto</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Brand *</Label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div>
              <Label>Formato</Label>
              <Input value={format} onChange={(e) => setFormat(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Nome *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Prezzo base €/mq</Label>
              <Input value={p1} onChange={(e) => setP1(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <Label>Oltre paletta</Label>
              <Input value={p2} onChange={(e) => setP2(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <Label>Oltre 3 palette</Label>
              <Input value={p3} onChange={(e) => setP3(e.target.value)} inputMode="decimal" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annulla
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Salvataggio…" : "Crea prodotto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------- Assign price dialog -------------------- */
function AssignPriceDialog({
  flag,
  onClose,
  onDone,
}: {
  flag: FlagRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const csv = flag.csv_row || {};
  const [query, setQuery] = useState(csv.name || "");
  const [results, setResults] = useState<CatalogMatch[]>([]);
  const [selected, setSelected] = useState<CatalogMatch | null>(null);
  const [searching, setSearching] = useState(false);
  const [p1, setP1] = useState<string>(csv.prezzo_base_mq || "");
  const [p2, setP2] = useState<string>(csv.prezzo_oltre_paletta_mq || "");
  const [p3, setP3] = useState<string>(csv.prezzo_oltre_3_palette_mq || "");
  const [saving, setSaving] = useState(false);

  const search = async () => {
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    let req = supabase
      .from("catalog_products")
      .select("id, brand, name, format, list_price, price_base_sqm")
      .ilike("name", `%${q}%`)
      .limit(30);
    if (csv.brand) req = req.ilike("brand", `%${csv.brand}%`);
    const { data, error } = await req;
    if (error) toast.error(error.message);
    setResults((data as any) || []);
    setSearching(false);
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = async () => {
    if (!selected) {
      toast.error("Seleziona un prodotto");
      return;
    }
    setSaving(true);
    const patch: any = {};
    if (num(p1) !== null) patch.price_base_sqm = num(p1);
    if (num(p2) !== null) patch.price_over_pallet_sqm = num(p2);
    if (num(p3) !== null) patch.price_over_3_pallets_sqm = num(p3);
    if (Object.keys(patch).length === 0) {
      toast.error("Nessun prezzo da applicare");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("catalog_products").update(patch).eq("id", selected.id);
    if (error) {
      toast.error("Errore: " + error.message);
      setSaving(false);
      return;
    }
    await supabase.from("catalog_import_flags").update({ resolved: true }).eq("id", flag.id);
    toast.success("Prezzo aggiornato e segnalazione archiviata");
    setSaving(false);
    onDone();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assegna prezzo a prodotto esistente</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="bg-crm-bg-soft border border-crm-border rounded-crm-sm p-3 text-[12px]">
            <div className="text-crm-ink-subtle mb-1">Dati dal CSV</div>
            <div className="font-medium text-crm-ink">
              {csv.brand} — {csv.name}
            </div>
            <div className="text-crm-ink-muted">
              Formato: {csv.format || "—"} · base €{csv.prezzo_base_mq || "—"}/mq
              {csv.prezzo_oltre_paletta_mq && ` · oltre paletta €${csv.prezzo_oltre_paletta_mq}`}
              {csv.prezzo_oltre_3_palette_mq && ` · oltre 3 palette €${csv.prezzo_oltre_3_palette_mq}`}
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca prodotto in catalogo…"
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <Button onClick={search} disabled={searching} variant="outline">
              <Search className="w-4 h-4 mr-1" />
              Cerca
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto border border-crm-border rounded-crm-sm">
            {results.length === 0 ? (
              <div className="p-4 text-[13px] text-crm-ink-muted text-center">
                {searching ? "Ricerca…" : "Nessun risultato."}
              </div>
            ) : (
              <ul className="divide-y divide-crm-border/60">
                {results.map((r) => {
                  const isSel = selected?.id === r.id;
                  return (
                    <li
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className={`p-2.5 cursor-pointer text-[13px] flex items-center gap-2 ${
                        isSel ? "bg-crm-primary-soft" : "hover:bg-crm-bg-soft"
                      }`}
                    >
                      {isSel ? (
                        <Check className="w-4 h-4 text-crm-primary shrink-0" />
                      ) : (
                        <span className="w-4" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-crm-ink truncate">{r.name}</div>
                        <div className="text-[11px] text-crm-ink-subtle">
                          {r.brand} · {r.format || "—"}
                        </div>
                      </div>
                      <div className="text-[11px] text-crm-ink-muted tabular-nums text-right shrink-0">
                        {r.price_base_sqm != null
                          ? `€ ${r.price_base_sqm}/mq`
                          : r.list_price != null
                            ? `list € ${r.list_price}`
                            : "—"}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Prezzo base €/mq</Label>
              <Input value={p1} onChange={(e) => setP1(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <Label>Oltre paletta</Label>
              <Input value={p2} onChange={(e) => setP2(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <Label>Oltre 3 palette</Label>
              <Input value={p3} onChange={(e) => setP3(e.target.value)} inputMode="decimal" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annulla
          </Button>
          <Button onClick={apply} disabled={saving || !selected}>
            {saving ? "Salvataggio…" : "Applica prezzo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
