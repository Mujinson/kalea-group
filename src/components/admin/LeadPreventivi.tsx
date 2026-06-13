import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Props { leadId: string }

export default function LeadPreventivi({ leadId }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("preventivi" as any)
        .select("id,numero_preventivo,data,importo_totale,stato,lingua,cliente_nome,cantiere,created_at")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (active) { setRows((data as any[]) || []); setLoading(false); }
    })();
    return () => { active = false; };
  }, [leadId]);

  const statoColor: Record<string,string> = {
    bozza: "bg-gray-100 text-gray-700",
    inviato: "bg-blue-100 text-blue-700",
    accettato: "bg-green-100 text-green-700",
    rifiutato: "bg-red-100 text-red-700",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Preventivi collegati ({rows.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2 text-sm">
        {loading && <div className="text-muted-foreground text-xs">Caricamento…</div>}
        {!loading && rows.length === 0 && (
          <div className="text-muted-foreground text-xs">Nessun preventivo collegato a questo lead.</div>
        )}
        {rows.map((p) => (
          <div key={p.id} className="flex justify-between items-start border-b pb-2 last:border-0">
            <div>
              <div className="font-medium">{p.numero_preventivo}</div>
              <div className="text-xs text-muted-foreground">
                {p.cantiere || p.cliente_nome || "—"} · {format(new Date(p.data || p.created_at), "dd/MM/yyyy")}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">€ {Number(p.importo_totale).toLocaleString("it-IT", { minimumFractionDigits: 2 })}</div>
              <Badge className={statoColor[p.stato] || "bg-gray-100"} variant="secondary">{p.stato}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
