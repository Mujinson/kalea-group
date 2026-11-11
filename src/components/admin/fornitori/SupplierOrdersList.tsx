import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUSES } from "@/lib/supplierOrders";

export function SupplierOrdersList({ supplierId }: { supplierId: string }) {
  const { data = [] } = useQuery({
    queryKey: ["supplier_orders", "by-supplier", supplierId],
    queryFn: async () => (await supabase.from("supplier_orders").select("id,order_number,order_date,status,direction,supplier_reference,lines").eq("supplier_id", supplierId).order("order_date", { ascending: false })).data ?? [],
  });
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Ordini ({data.length})</h3>
        <Link to="/admin/ordini-fornitori" className="text-xs text-crm-primary hover:underline">Apri ordini fornitori</Link>
      </div>
      {data.length === 0 ? <p className="text-xs text-muted-foreground">Nessun ordine per questo fornitore.</p> : (
        <div className="rounded-lg border border-border divide-y divide-border">
          {data.map((o: any) => (
            <div key={o.id} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
              <Badge variant={o.direction === "entrata" ? "secondary" : "outline"}>{o.direction === "entrata" ? "Ricevuto" : "Inviato"}</Badge>
              <span className="font-mono">{o.order_number}</span>
              {o.supplier_reference && <span className="text-muted-foreground">rif. {o.supplier_reference}</span>}
              <span className="text-muted-foreground">{new Date(o.order_date).toLocaleDateString("it-IT")}</span>
              <span className="flex-1" />
              <span className="text-muted-foreground">{o.lines?.length || 0} righe</span>
              <Badge variant="outline">{ORDER_STATUSES[o.status] ?? o.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
