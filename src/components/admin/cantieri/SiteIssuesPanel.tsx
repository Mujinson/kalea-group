import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const ISSUE_LABELS: Record<string, string> = {
  materiale_mancante: "Materiale mancante",
  problema_tecnico: "Problema tecnico",
  ritardo: "Ritardo",
  cliente_assente: "Cliente assente",
  altro: "Altro",
};

const SiteIssuesPanel = ({ siteId }: { siteId: string }) => {
  const qc = useQueryClient();
  const { data: issues } = useQuery({
    queryKey: ["site-issues", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_issues" as any).select("*").eq("site_id", siteId).order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const resolve = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("site_issues" as any).update({
      status: "chiusa", resolved_at: new Date().toISOString(), resolved_by: user?.id,
    }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Segnalazione chiusa");
      qc.invalidateQueries({ queryKey: ["site-issues", siteId] });
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader><CardTitle className="text-lg">Segnalazioni operai</CardTitle></CardHeader>
      <CardContent>
        {!(issues || []).length && <p className="text-sm text-muted-foreground py-8 text-center">Nessuna segnalazione.</p>}
        <div className="space-y-3">
          {(issues || []).map((i: any) => (
            <div key={i.id} className={`border rounded-xl p-3 ${i.status === "chiusa" ? "bg-muted/30" : "bg-white"}`}>
              <div className="flex items-start gap-3">
                {i.photo_url && (
                  <a href={i.photo_url} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={i.photo_url} alt="" className="w-full h-full object-cover" />
                  </a>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {i.status === "chiusa"
                      ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                      : <AlertCircle className="w-4 h-4 text-amber-600" />
                    }
                    <Badge variant="outline" className="text-[10px]">{ISSUE_LABELS[i.issue_type] || i.issue_type}</Badge>
                    <span className="text-xs text-muted-foreground">{i.reporter_name || "Operaio"}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{format(new Date(i.created_at), "dd/MM/yy HH:mm")}</span>
                  </div>
                  {i.description && <p className="text-sm text-foreground/80">{i.description}</p>}
                  {i.status !== "chiusa" && (
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" onClick={() => resolve(i.id)}>Segna come risolta</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteIssuesPanel;
