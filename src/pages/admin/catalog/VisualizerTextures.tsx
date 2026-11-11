import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CrmPageHeader } from "@/components/admin/CrmShell";
import { floorRegistry } from "@/lib/visualizer/floorRegistry";

type Row = { product_slug: string; texture_url: string | null; real_width_cm: number | null; default_rotation: number; enabled: boolean };

export default function VisualizerTextures() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const { data: rows = [] } = useQuery({
    queryKey: ["floor_visualizer_textures"],
    queryFn: async () => {
      const { data, error } = await supabase.from("floor_visualizer_textures").select("product_slug, texture_url, real_width_cm, default_rotation, enabled");
      if (error) throw error;
      return data as Row[];
    },
  });
  const { data: previews = {} } = useQuery({
    queryKey: ["floor_visualizer_previews", rows.map((r) => r.texture_url).join("|")],
    queryFn: async () => {
      const paths = rows.map((r) => r.texture_url).filter(Boolean) as string[];
      if (!paths.length) return {};
      return Object.fromEntries(paths.map((path) => [
        path,
        supabase.storage.from("visualizer-textures").getPublicUrl(path).data.publicUrl,
      ]));
    },
  });
  const byslug = new Map(rows.map((r) => [r.product_slug, r]));

  const save = async (slug: string, patch: Partial<Row>) => {
    const cur = byslug.get(slug);
    const { error } = await supabase.from("floor_visualizer_textures").upsert(
      { product_slug: slug, texture_url: cur?.texture_url ?? null, real_width_cm: cur?.real_width_cm ?? null, default_rotation: cur?.default_rotation ?? 0, enabled: cur?.enabled ?? true, ...patch, updated_at: new Date().toISOString() },
      { onConflict: "product_slug" },
    );
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["floor_visualizer_textures"] });
  };

  const upload = async (slug: string, file: File) => {
    const path = `${slug}/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`;
    const { error } = await supabase.storage.from("visualizer-textures").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    await save(slug, { texture_url: path });
    toast.success("Texture caricata");
  };

  const list = floorRegistry.filter((f) => `${f.category} ${f.name}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-4">
      <CrmPageHeader breadcrumb={["Catalogo", "Texture visualizzatore"]} title="Texture visualizzatore" />
      <p className="text-sm text-muted-foreground max-w-3xl">
        Per ogni pavimento puoi caricare un'immagine vista dall'alto e ripetibile senza cuciture e indicarne la larghezza reale in cm.
        Se non c'è, il visualizzatore usa l'immagine del prodotto con una misura standard.
      </p>
      <Input placeholder="Cerca pavimento…" value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-sm" />
      <div className="grid gap-2">
        {list.map((f) => {
          const r = byslug.get(f.slug);
          const preview = (r?.texture_url && previews[r.texture_url]) || f.image;
          return (
            <div key={f.slug} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-2">
              <img src={preview} alt={f.name} className="w-14 h-14 object-cover rounded" />
              <div className="w-48"><p className="font-medium whitespace-nowrap truncate">{f.name}</p><p className="text-xs text-muted-foreground">{f.category}{r?.texture_url ? " · texture dedicata" : ""}</p></div>
              <label className="text-xs">Larghezza reale (cm)
                <Input type="number" className="w-24 h-8" defaultValue={r?.real_width_cm ?? f.widthCm}
                  onBlur={(e) => { const v = Number(e.target.value); if (v > 0 && v !== Number(r?.real_width_cm ?? f.widthCm)) save(f.slug, { real_width_cm: v }); }} />
              </label>
              <label className="text-xs">Rotazione (°)
                <Input type="number" className="w-20 h-8" defaultValue={r?.default_rotation ?? 0}
                  onBlur={(e) => { const v = Number(e.target.value) || 0; if (v !== Number(r?.default_rotation ?? 0)) save(f.slug, { default_rotation: v }); }} />
              </label>
              <Button asChild size="sm" variant="outline"><label className="cursor-pointer">Carica texture
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(f.slug, file); }} /></label></Button>
              {r?.texture_url && <Button size="sm" variant="ghost" onClick={() => save(f.slug, { texture_url: null })}>Usa immagine prodotto</Button>}
              <div className="flex items-center gap-2 ml-auto text-xs">Visibile<Switch checked={r?.enabled ?? true} onCheckedChange={(v) => save(f.slug, { enabled: v })} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
