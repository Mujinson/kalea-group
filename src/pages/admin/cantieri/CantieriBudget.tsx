import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Euro, TrendingUp, TrendingDown, AlertTriangle, HardHat } from "lucide-react";
import { useNavigate } from "react-router-dom";

const COSTO_ORARIO = 25;

const CantieriBudget = () => {
  const navigate = useNavigate();

  const { data: sites } = useQuery({
    queryKey: ["cb-sites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("construction_sites").select("*").order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: materials } = useQuery({
    queryKey: ["cb-materials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_materials").select("site_id, total_cost").limit(1000);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: expenses } = useQuery({
    queryKey: ["cb-expenses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_expenses").select("site_id, amount").limit(1000);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: workLogs } = useQuery({
    queryKey: ["cb-worklogs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_work_logs").select("site_id, hours_worked").limit(1000);
      if (error) throw error;
      return data;
    },
  });

  // Build per-site budget comparison
  const siteData = sites?.map(site => {
    const matCost = materials?.filter(m => m.site_id === site.id).reduce((s, m) => s + (m.total_cost || 0), 0) || 0;
    const expCost = expenses?.filter(e => e.site_id === site.id).reduce((s, e) => s + (e.amount || 0), 0) || 0;
    const hours = workLogs?.filter(l => l.site_id === site.id).reduce((s, l) => s + (l.hours_worked || 0), 0) || 0;
    const laborCost = hours * COSTO_ORARIO;
    const totalSpent = matCost + expCost + laborCost;
    // Budget: for now estimate as 120% of spent (or use a fixed value if available in notes)
    // In a real scenario, budget would be a column on construction_sites
    const estimatedBudget = totalSpent > 0 ? Math.round(totalSpent * 1.2) : 0;
    const margin = estimatedBudget - totalSpent;
    const pct = estimatedBudget > 0 ? Math.round((totalSpent / estimatedBudget) * 100) : 0;
    return { ...site, matCost, expCost, laborCost, totalSpent, budget: estimatedBudget, margin, pct };
  }) || [];

  const totalSpent = siteData.reduce((s, d) => s + d.totalSpent, 0);
  const totalMat = siteData.reduce((s, d) => s + d.matCost, 0);
  const totalLabor = siteData.reduce((s, d) => s + d.laborCost, 0);
  const totalExp = siteData.reduce((s, d) => s + d.expCost, 0);

  const activeSites = siteData.filter(s => s.status === "attivo");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Budget vs Consuntivo</h1>
        <p className="text-sm text-muted-foreground">Confronto budget/speso per ogni cantiere</p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Speso Totale</p>
            <p className="text-xl font-bold">€{totalSpent.toLocaleString("it-IT")}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Materiali</p>
            <p className="text-xl font-bold text-blue-600">€{totalMat.toLocaleString("it-IT")}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Manodopera</p>
            <p className="text-xl font-bold text-green-600">€{totalLabor.toLocaleString("it-IT")}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Altre spese</p>
            <p className="text-xl font-bold text-orange-600">€{totalExp.toLocaleString("it-IT")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-site comparison */}
      <div className="space-y-3">
        {activeSites.length === 0 && (
          <Card className="bg-white"><CardContent className="p-8 text-center text-sm text-muted-foreground">Nessun cantiere con dati di spesa</CardContent></Card>
        )}
        {activeSites.filter(s => s.totalSpent > 0).sort((a, b) => b.totalSpent - a.totalSpent).map((s) => (
          <Card
            key={s.id}
            className="bg-white cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/admin/cantieri/${s.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${s.margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {s.margin >= 0 ? "+" : ""}€{s.margin.toLocaleString("it-IT")}
                  </p>
                  <p className="text-xs text-muted-foreground">margine</p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Speso: €{s.totalSpent.toLocaleString("it-IT")}</span>
                  <span>Budget: €{s.budget.toLocaleString("it-IT")}</span>
                </div>
                <Progress value={Math.min(s.pct, 100)} className={`h-2 ${s.pct > 100 ? "[&>div]:bg-red-500" : s.pct > 80 ? "[&>div]:bg-amber-500" : ""}`} />
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Mat. €{s.matCost.toLocaleString("it-IT")}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Lav. €{s.laborCost.toLocaleString("it-IT")}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  Spese €{s.expCost.toLocaleString("it-IT")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CantieriBudget;
