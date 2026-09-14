import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Row {
  id?: string;
  code: string;
  name: string;
  name_en: string | null;
  name_de: string | null;
  name_fr: string | null;
  description: string | null;
  category: string;
  unit: string;
  price_min: number;
  price_max: number;
  is_active: boolean;
  sort_order: number;
  notes: string | null;
  _dirty?: boolean;
  _new?: boolean;
}

const CATEGORIES = [
  { value: "fornitura", label: "Fornitura materiali" },
  { value: "preparazione", label: "Preparazione" },
  { value: "rimozione", label: "Rimozione" },
  { value: "posa", label: "Posa" },
  { value: "trattamento", label: "Trattamenti e finiture" },
];

const emptyRow = (sort: number): Row => ({
  code: "",
  name: "",
  name_en: "",
  name_de: "",
  name_fr: "",
  description: "",
  category: "fornitura",
  unit: "mq",
  price_min: 0,
  price_max: 0,
  is_active: true,
  sort_order: sort,
  notes: "",
  _dirty: true,
  _new: true,
});

const ListinoPubblico = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("public_quote_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error("Impossibile caricare il listino");
    setRows(((data as Row[]) || []).map((r) => ({ ...r, _dirty: false })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = (idx: number, changes: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...changes, _dirty: true } : r)));

  const saveAll = async () => {
    const dirty = rows.filter((r) => r._dirty);
    if (dirty.length === 0) return toast.info("Nessuna modifica da salvare");
    if (dirty.some((r) => !r.code.trim() || !r.name.trim())) {
      return toast.error("Codice e nome sono obbligatori su ogni voce");
    }
    if (dirty.some((r) => Number(r.price_max) < Number(r.price_min))) {
      return toast.error("Il prezzo massimo non può essere inferiore al minimo");
    }

    setSaving(true);
    try {
      const payload = dirty.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        code: r.code.trim(),
        name: r.name.trim(),
        name_en: r.name_en || null,
        name_de: r.name_de || null,
        name_fr: r.name_fr || null,
        description: r.description || null,
        category: r.category,
        unit: r.unit,
        price_min: Number(r.price_min) || 0,
        price_max: Number(r.price_max) || 0,
        is_active: r.is_active,
        sort_order: Number(r.sort_order) || 0,
        notes: r.notes || null,
      }));
      const { error } = await supabase.from("public_quote_items").upsert(payload, { onConflict: "code" });
      if (error) throw error;
      toast.success("Listino pubblico aggiornato");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Salvataggio non riuscito");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (idx: number) => {
    const row = rows[idx];
    if (!row.id) return setRows((prev) => prev.filter((_, i) => i !== idx));
    if (!confirm(`Eliminare "${row.name}" dal listino pubblico?`)) return;
    const { error } = await supabase.from("public_quote_items").delete().eq("id", row.id);
    if (error) return toast.error("Eliminazione non riuscita");
    toast.success("Voce eliminata");
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Listino pubblico</h1>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Fasce di prezzo usate dal preventivatore online dei clienti. Sono indicative: i clienti vedono sempre
            l'avviso che il preventivo definitivo arriva solo dopo il sopralluogo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setRows((prev) => [...prev, emptyRow((prev.length ? prev[prev.length - 1].sort_order : 0) + 10)])}
          >
            <Plus className="w-4 h-4 mr-2" /> Nuova voce
          </Button>
          <Button onClick={saveAll} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salva modifiche
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Caricamento…
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row, idx) => (
            <Card key={row.id || `new-${idx}`} className={row._dirty ? "border-primary/60" : ""}>
              <CardHeader className="pb-3 flex-row items-center justify-between gap-4">
                <CardTitle className="text-base">{row.name || "Nuova voce"}</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={row.is_active}
                      onCheckedChange={(v) => patch(idx, { is_active: v })}
                    />
                    <span className="text-xs text-muted-foreground">
                      {row.is_active ? "Visibile online" : "Nascosta"}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(idx)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Codice</Label>
                  <Input value={row.code} onChange={(e) => patch(idx, { code: e.target.value })} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Nome (IT)</Label>
                  <Input value={row.name} onChange={(e) => patch(idx, { name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Categoria</Label>
                  <Select value={row.category} onValueChange={(v) => patch(idx, { category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Unità</Label>
                  <Input value={row.unit} onChange={(e) => patch(idx, { unit: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Prezzo minimo €</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={row.price_min}
                    onChange={(e) => patch(idx, { price_min: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Prezzo massimo €</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={row.price_max}
                    onChange={(e) => patch(idx, { price_max: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Ordine</Label>
                  <Input
                    type="number"
                    value={row.sort_order}
                    onChange={(e) => patch(idx, { sort_order: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Nome EN</Label>
                  <Input value={row.name_en ?? ""} onChange={(e) => patch(idx, { name_en: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome DE</Label>
                  <Input value={row.name_de ?? ""} onChange={(e) => patch(idx, { name_de: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome FR</Label>
                  <Input value={row.name_fr ?? ""} onChange={(e) => patch(idx, { name_fr: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Note interne</Label>
                  <Input value={row.notes ?? ""} onChange={(e) => patch(idx, { notes: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListinoPubblico;
