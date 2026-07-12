import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CrmPageHeader } from "@/components/admin/CrmShell";
import DataTable from "@/components/admin/DataTable";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800",
  applied: "bg-emerald-100 text-emerald-800",
  archived: "bg-gray-200 text-gray-700",
};

export default function CatalogPriceLists() {
  const [detail, setDetail] = useState<any>(null);

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["catalog-price-lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_price_lists")
        .select("*, catalog_brands(name,color), catalog_price_list_items(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["catalog-price-list-items", detail?.id],
    enabled: !!detail?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_price_list_items")
        .select("*")
        .eq("price_list_id", detail.id)
        .order("diff_type");
      if (error) throw error;
      return data || [];
    },
  });

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = { new: [], updated: [], price_changed: [], deleted: [], unchanged: [] };
    items.forEach((i: any) => {
      (g[i.diff_type] || g.unchanged).push(i);
    });
    return g;
  }, [items]);

  return (
    <div className="space-y-4 p-6">
      <CrmPageHeader
        breadcrumb={["Catalogo", "Listini & versioni"]}
        title="Listini & versioni"
        subtitle="Storico dei listini importati con confronto tra versioni."
      />

      <DataTable
        data={lists as any[]}
        loading={isLoading}
        searchPlaceholder="Cerca listino…"
        emptyTitle="Nessun listino importato"
        emptyDescription="Usa la sezione Importa per caricare il primo listino fornitore."
        columns={[
          { key: "name", header: "Nome", cell: (l: any) => <span className="font-medium">{l.name}</span> },
          { key: "version", header: "Versione", cell: (l: any) => <Badge variant="outline">v{l.version}</Badge> },
          {
            key: "brand",
            header: "Marca",
            cell: (l: any) =>
              l.catalog_brands ? (
                <span className="inline-flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded" style={{ background: l.catalog_brands.color || "#ccc" }} />
                  {l.catalog_brands.name}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Globale</span>
              ),
          },
          {
            key: "created_at",
            header: "Data",
            cell: (l: any) => <span className="text-xs">{format(new Date(l.created_at), "dd MMM yyyy", { locale: it })}</span>,
          },
          {
            key: "status",
            header: "Stato",
            cell: (l: any) => <Badge className={`${STATUS_COLOR[l.status] || ""} border-0`}>{l.status}</Badge>,
          },
          {
            key: "items",
            header: "Righe",
            className: "text-right",
            cell: (l: any) => <Badge variant="outline">{l.catalog_price_list_items?.[0]?.count ?? 0}</Badge>,
          },
          {
            key: "actions",
            header: "",
            cell: (l: any) => <Button variant="ghost" size="sm" onClick={() => setDetail(l)}>Dettaglio</Button>,
            className: "text-right",
          },
        ]}
      />

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{detail?.name} — v{detail?.version}</DialogTitle>
          </DialogHeader>
          {itemsLoading ? (
            <div className="text-sm text-muted-foreground">Caricamento…</div>
          ) : (
            <div className="space-y-4">
              {(["new", "updated", "price_changed", "deleted"] as const).map((type) => (
                <div key={type}>
                  <div className="text-sm font-semibold mb-2 capitalize">
                    {type === "new" && "Nuovi"}
                    {type === "updated" && "Aggiornati"}
                    {type === "price_changed" && "Prezzi cambiati"}
                    {type === "deleted" && "Eliminati"}
                    <Badge variant="outline" className="ml-2">{grouped[type].length}</Badge>
                  </div>
                  {grouped[type].length > 0 && (
                    <div className="border rounded text-xs overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Codice</th>
                            <th className="text-left p-2">Nome</th>
                            <th className="text-right p-2">Prezzo prec.</th>
                            <th className="text-right p-2">Nuovo prezzo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grouped[type].slice(0, 50).map((i: any) => (
                            <tr key={i.id} className="border-t">
                              <td className="p-2 font-mono">{i.product_code}</td>
                              <td className="p-2">{i.name}</td>
                              <td className="p-2 text-right text-muted-foreground">
                                {i.previous_price != null ? `€ ${Number(i.previous_price).toFixed(2)}` : "—"}
                              </td>
                              <td className="p-2 text-right font-medium">
                                {i.new_price != null ? `€ ${Number(i.new_price).toFixed(2)}` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {grouped[type].length > 50 && (
                        <div className="p-2 text-center text-muted-foreground text-xs bg-muted">
                          … e altre {grouped[type].length - 50} righe
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
