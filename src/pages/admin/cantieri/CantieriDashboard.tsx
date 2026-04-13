import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  HardHat, Clock, Euro, Package, AlertTriangle, TrendingUp, Users, CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const CantieriDashboard = () => {
  const navigate = useNavigate();

  const { data: sites } = useQuery({
    queryKey: ["cd-sites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("construction_sites").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: workLogs } = useQuery({
    queryKey: ["cd-worklogs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_work_logs").select("site_id, hours_worked, work_date").limit(1000);
      if (error) throw error;
      return data;
    },
  });

  const { data: materials } = useQuery({
    queryKey: ["cd-materials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_materials").select("site_id, total_cost, material_name").limit(1000);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: expenses } = useQuery({
    queryKey: ["cd-expenses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_expenses").select("site_id, amount, is_paid, expense_type").limit(1000);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: workers } = useQuery({
    queryKey: ["cd-workers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_workers").select("site_id, is_active").limit(1000);
      if (error) throw error;
      return data as any[];
    },
  });

  const activeSites = sites?.filter(s => s.status === "attivo") || [];
  const totalSites = sites?.length || 0;
  const totalHours = workLogs?.reduce((s, l) => s + (l.hours_worked || 0), 0) || 0;
  const totalMaterialCost = materials?.reduce((s, m) => s + (m.total_cost || 0), 0) || 0;
  const totalExpenses = expenses?.reduce((s, e) => s + (e.amount || 0), 0) || 0;
  const unpaidExpenses = expenses?.filter(e => !e.is_paid).reduce((s, e) => s + (e.amount || 0), 0) || 0;
  const totalWorkers = new Set(workers?.map(w => w.site_id)).size;
  const totalBudget = totalMaterialCost + totalExpenses;

  // Per-site stats
  const siteStats = activeSites.map(site => {
    const siteHours = workLogs?.filter(l => l.site_id === site.id).reduce((s, l) => s + (l.hours_worked || 0), 0) || 0;
    const siteMat = materials?.filter(m => m.site_id === site.id).reduce((s, m) => s + (m.total_cost || 0), 0) || 0;
    const siteExp = expenses?.filter(e => e.site_id === site.id).reduce((s, e) => s + (e.amount || 0), 0) || 0;
    const siteWorkers = workers?.filter(w => w.site_id === site.id && w.is_active).length || 0;
    return { ...site, hours: siteHours, materialCost: siteMat, expenseCost: siteExp, totalCost: siteMat + siteExp, workerCount: siteWorkers };
  });

  // Today's activity
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = workLogs?.filter(l => l.work_date === today) || [];
  const todayHours = todayLogs.reduce((s, l) => s + (l.hours_worked || 0), 0);

  // Alerts
  const alerts: { text: string; type: "warning" | "danger" }[] = [];
  if (unpaidExpenses > 0) alerts.push({ text: `€${unpaidExpenses.toLocaleString("it-IT")} in spese non pagate`, type: "warning" });
  siteStats.filter(s => s.totalCost > 10000).forEach(s => alerts.push({ text: `${s.title}: costi elevati (€${s.totalCost.toLocaleString("it-IT")})`, type: "danger" }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Cantieri</h1>
        <p className="text-sm text-muted-foreground">Panoramica in tempo reale</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Cantieri attivi", value: activeSites.length, sub: `${totalSites} totali`, icon: HardHat, bg: "bg-blue-50", ic: "text-blue-600" },
          { label: "Ore totali", value: `${totalHours.toFixed(0)}h`, sub: `${todayHours.toFixed(1)}h oggi`, icon: Clock, bg: "bg-green-50", ic: "text-green-600" },
          { label: "Costi totali", value: `€${totalBudget.toLocaleString("it-IT")}`, sub: `Mat. €${totalMaterialCost.toLocaleString("it-IT")}`, icon: Euro, bg: "bg-orange-50", ic: "text-orange-600" },
          { label: "Spese non pagate", value: `€${unpaidExpenses.toLocaleString("it-IT")}`, sub: `${expenses?.filter(e => !e.is_paid).length || 0} voci`, icon: AlertTriangle, bg: unpaidExpenses > 0 ? "bg-red-50" : "bg-green-50", ic: unpaidExpenses > 0 ? "text-red-600" : "text-green-600" },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.ic}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-white border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${a.type === "danger" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active sites progress */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Avanzamento cantieri attivi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {siteStats.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nessun cantiere attivo</p>}
          {siteStats.map((s) => {
            // Calculate progress based on dates if available
            let progress = 50;
            if (s.start_date && s.end_date) {
              const start = new Date(s.start_date).getTime();
              const end = new Date(s.end_date).getTime();
              const now = Date.now();
              progress = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
            }
            return (
              <div
                key={s.id}
                className="p-3 rounded-xl border hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => navigate(`/admin/cantieri/${s.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.city} · {s.workerCount} operai · {s.hours}h</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">€{s.totalCost.toLocaleString("it-IT")}</p>
                    <Badge variant="outline" className="text-xs">{progress}%</Badge>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default CantieriDashboard;
