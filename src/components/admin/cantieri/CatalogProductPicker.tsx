import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search, Loader2 } from "lucide-react";

export interface CatalogProduct {
  id: string;
  product_code: string;
  name: string;
  brand: string | null;
  collection: string | null;
  format: string | null;
  color: string | null;
  finish: string | null;
  thickness_mm: number | null;
  unit_of_measure: string;
  list_price: number;
}

interface Props {
  value: CatalogProduct | null;
  onChange: (p: CatalogProduct | null) => void;
  placeholder?: string;
  /** Filtro opzionale per restringere la ricerca (es. category slug o testo). */
  searchScope?: string;
  /** Filtro lato server: nomi categoria da includere (case-insensitive). */
  categoryNames?: string[];
}

export default function CatalogProductPicker({
  value,
  onChange,
  placeholder = "Cerca prodotto (codice, marca, nome, collezione)…",
  searchScope,
  categoryNames,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const [catIds, setCatIds] = useState<string[] | null>(null);

  // Risolve nomi categoria → id (una sola volta)
  useEffect(() => {
    if (!categoryNames || catIds) return;
    (async () => {
      const { data } = await supabase
        .from("product_categories")
        .select("id,name")
        .in("name", categoryNames);
      setCatIds((data || []).map((c: any) => c.id));
    })();
  }, [categoryNames, catIds]);

  // Ricerca debounced
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setLoading(true);
      let req = supabase
        .from("catalog_products")
        .select("id,product_code,name,brand,collection,format,color,finish,thickness_mm,unit_of_measure,list_price")
        .eq("is_active", true)
        .order("name", { ascending: true })
        .limit(30);
      const term = (q || searchScope || "").trim();
      if (term) {
        const like = `%${term}%`;
        req = req.or(
          `name.ilike.${like},product_code.ilike.${like},brand.ilike.${like},collection.ilike.${like},color.ilike.${like}`
        );
      }
      if (catIds && catIds.length) req = req.in("category_id", catIds);
      const { data } = await req;
      setResults((data as any) || []);
      setLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, [q, open, searchScope, catIds]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const display = useMemo(() => {
    if (!value) return null;
    const parts = [value.brand, value.collection, value.name].filter(Boolean).join(" · ");
    const meta = [value.format, value.color, value.finish, value.thickness_mm ? `${value.thickness_mm} mm` : null]
      .filter(Boolean)
      .join(" • ");
    return { parts, meta };
  }, [value]);

  return (
    <div ref={boxRef} className="relative">
      {value ? (
        <div className="flex items-start justify-between gap-2 p-2.5 border rounded-lg bg-primary/5 border-primary/30">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{display?.parts}</div>
            {display?.meta && <div className="text-xs text-muted-foreground truncate">{display.meta}</div>}
            <div className="text-[10px] text-muted-foreground mt-0.5">Cod. {value.product_code} · € {Number(value.list_price).toFixed(2)}/{value.unit_of_measure}</div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-muted-foreground hover:text-destructive shrink-0"
            aria-label="Rimuovi prodotto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={placeholder}
            value={q}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
          />
        </div>
      )}

      {open && !value && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-72 overflow-auto">
          {loading && (
            <div className="px-3 py-3 text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Ricerca…
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-3 py-3 text-xs text-muted-foreground">Nessun prodotto trovato.</div>
          )}
          {!loading &&
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                  setQ("");
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b last:border-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[13px] font-medium truncate">
                    {p.brand ? <span className="text-muted-foreground">{p.brand} · </span> : null}
                    {p.name}
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{p.product_code}</Badge>
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {[p.collection, p.format, p.color, p.thickness_mm ? `${p.thickness_mm} mm` : null]
                    .filter(Boolean)
                    .join(" • ")}
                  {" "}· € {Number(p.list_price).toFixed(2)}/{p.unit_of_measure}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
