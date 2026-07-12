import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CrmPageHeader } from "@/components/admin/CrmShell";
import DataTable from "@/components/admin/DataTable";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const ACTION_LABEL: Record<string, string> = {
  insert: "Creato",
  update: "Modificato",
  delete: "Eliminato",
};
const ACTION_COLOR: Record<string, string> = {
  insert: "bg-emerald-100 text-emerald-800",
  update: "bg-amber-100 text-amber-800",
  delete: "bg-red-100 text-red-800",
};
const ENTITY_LABEL: Record<string, string> = {
  catalog_products: "Prodotto",
  catalog_brands: "Marca",
  catalog_collections: "Collezione",
};

export default function CatalogAuditLog() {
  const [filterEntity, setFilterEntity] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [detail, setDetail] = useState<any>(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["catalog-audit-log", filterEntity, filterAction],
    queryFn: async () => {
      let q = supabase
        .from("catalog_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (filterEntity !== "all") q = q.eq("entity_type", filterEntity);
      if (filterAction !== "all") q = q.eq("action", filterAction);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const diffFields = useMemo(() => {
    if (!detail) return [] as Array<{ field: string; old: any; new: any }>;
    const oldV = detail.old_value || {};
    const newV = detail.new_value || {};
    const keys = new Set([...Object.keys(oldV), ...Object.keys(newV)]);
    const skip = new Set(["updated_at", "created_at"]);
    return Array.from(keys)
      .filter((k) => !skip.has(k))
      .map((k) => ({ field: k, old: (oldV as any)[k], new: (newV as any)[k] }))
      .filter((r) => JSON.stringify(r.old) !== JSON.stringify(r.new));
  }, [detail]);

  return (
    <div className="space-y-4 p-6">
      <CrmPageHeader
        breadcrumb={["Catalogo", "Storico modifiche"]}
        title="Storico modifiche"
        subtitle="Ogni modifica a prodotti, marche e collezioni viene tracciata automaticamente."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="w-[200px] bg-white"><SelectValue placeholder="Entità" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le entità</SelectItem>
            <SelectItem value="catalog_products">Prodotti</SelectItem>
            <SelectItem value="catalog_brands">Marche</SelectItem>
            <SelectItem value="catalog_collections">Collezioni</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[200px] bg-white"><SelectValue placeholder="Azione" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le azioni</SelectItem>
            <SelectItem value="insert">Creazioni</SelectItem>
            <SelectItem value="update">Modifiche</SelectItem>
            <SelectItem value="delete">Eliminazioni</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={logs as any[]}
        loading={isLoading}
        searchPlaceholder="Cerca per codice/nome…"
        emptyTitle="Nessuna modifica"
        emptyDescription="Le modifiche future saranno tracciate qui."
        columns={[
          {
            key: "created_at",
            header: "Data",
            sortable: true,
            cell: (l: any) => (
              <span className="text-xs">{format(new Date(l.created_at), "dd MMM yyyy HH:mm", { locale: it })}</span>
            ),
          },
          {
            key: "entity_type",
            header: "Tipo",
            cell: (l: any) => <Badge variant="outline">{ENTITY_LABEL[l.entity_type] || l.entity_type}</Badge>,
          },
          { key: "entity_code", header: "Codice / Nome", cell: (l: any) => <span className="font-medium text-sm">{l.entity_code || "—"}</span> },
          {
            key: "action",
            header: "Azione",
            cell: (l: any) => <Badge className={`${ACTION_COLOR[l.action] || ""} border-0`}>{ACTION_LABEL[l.action] || l.action}</Badge>,
          },
          { key: "user_email", header: "Utente", cell: (l: any) => <span className="text-xs text-muted-foreground">{l.user_email || "sistema"}</span> },
          {
            key: "actions",
            header: "",
            cell: (l: any) => (
              <Button variant="ghost" size="sm" onClick={() => setDetail(l)}>Dettaglio</Button>
            ),
            className: "text-right",
          },
        ]}
      />

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Dettaglio modifica</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs bg-muted p-3 rounded">
                <div><strong>Data:</strong> {format(new Date(detail.created_at), "dd/MM/yyyy HH:mm:ss")}</div>
                <div><strong>Azione:</strong> {ACTION_LABEL[detail.action]}</div>
                <div><strong>Entità:</strong> {ENTITY_LABEL[detail.entity_type]}</div>
                <div><strong>Codice:</strong> {detail.entity_code || "—"}</div>
                <div className="col-span-2"><strong>Utente:</strong> {detail.user_email || "sistema"}</div>
              </div>
              {detail.action === "update" && (
                <div>
                  <div className="font-semibold mb-2">Campi modificati ({diffFields.length})</div>
                  <div className="border rounded overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-2">Campo</th>
                          <th className="text-left p-2">Prima</th>
                          <th className="text-left p-2">Dopo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diffFields.map((r) => (
                          <tr key={r.field} className="border-t">
                            <td className="p-2 font-medium">{r.field}</td>
                            <td className="p-2 text-red-700">{JSON.stringify(r.old)}</td>
                            <td className="p-2 text-emerald-700">{JSON.stringify(r.new)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {detail.action !== "update" && (
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
                  {JSON.stringify(detail.new_value || detail.old_value, null, 2)}
                </pre>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
