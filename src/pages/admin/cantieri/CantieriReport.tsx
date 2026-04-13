import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Euro, HardHat, Package, Users, TrendingUp } from "lucide-react";

const COSTO_ORARIO = 25;

const CantieriReport = () => {
  const { data: sites } = useQuery({
    queryKey: ["cr-sites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("construction_sites").select("id, title, status, city");
      if (error) throw error;
      return data;
    },
  });

  const { data: materials } = useQuery({
    queryKey: ["cr-materials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_materials").select("site_id, material_name, total_cost, notes, unit_cost, quantity").limit(1000);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: expenses } = useQuery({
    queryKey: ["cr-expenses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_expenses").select("site_id, amount, expense_type, is_paid").limit(1000);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: workLogs } = useQuery({
    queryKey: ["cr-worklogs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_work_logs").select("site_id, hours_worked").limit(1000);
      if (error) throw error;
      return data;
    },
  });

  const totalMatCost = materials?.reduce((s, m) => s + (m.total_cost || 0), 0) || 0;
  const totalExpCost = expenses?.reduce((s, e) => s + (e.amount || 0), 0) || 0;
  const totalHours = workLogs?.reduce((s, l) => s + (l.hours_worked || 0), 0) || 0;
  const totalLaborCost = totalHours * COSTO_ORARIO;
  const grandTotal = totalMatCost + totalExpCost + totalLaborCost;

  // Material % vs Labor %
  const matPct = grandTotal > 0 ? Math.round((totalMatCost / grandTotal) * 100) : 0;
  const laborPct = grandTotal > 0 ? Math.round((totalLaborCost / grandTotal) * 100) : 0;
  const expPct = grandTotal > 0 ? Math.round((totalExpCost / grandTotal) * 100) : 0;

  // Supplier ranking (from notes field)
  const supplierMap = new Map<string, number>();
  materials?.forEach((m: any) => {
    const match = m.notes?.match(/Fornitore:\s*([^|]+)/);
    if (match) {
      const supplier = match[1].trim();
      supplierMap.set(supplier, (supplierMap.get(supplier) || 0) + (m.total_cost || 0));
    }
  });
  const supplierRanking = Array.from(supplierMap.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  // Per-site summary
  const siteSummary = sites?.map(site => {
    const matC = materials?.filter(m => m.site_id === site.id).reduce((s, m) => s + (m.total_cost || 0), 0) || 0;
    const expC = expenses?.filter(e => e.site_id === site.id).reduce((s, e) => s + (e.amount || 0), 0) || 0;
    const hrs = workLogs?.filter(l => l.site_id === site.id).reduce((s, l) => s + (l.hours_worked || 0), 0) || 0;
    const labC = hrs * COSTO_ORARIO;
    return { ...site, matC, expC, labC, total: matC + expC + labC, hours: hrs };
  })?.filter(s => s.total > 0).sort((a, b) => b.total - a.total) || [];

  // Expense type breakdown
  const expTypeMap = new Map<string, number>();
  expenses?.forEach((e: any) => {
    expTypeMap.set(e.expense_type, (expTypeMap.get(e.expense_type) || 0) + (e.amount || 0));
  });
  const expTypeRanking = Array.from(expTypeMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Report Cantieri</h1>
        <p className="text-sm text-muted-foreground">Riepilogo generale, fornitori e ripartizione costi</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Costo Totale</p>
            <p className="text-xl font-bold">€{grandTotal.toLocaleString("it-IT")}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Cantieri</p>
            <p className="text-xl font-bold">{sites?.length || 0}</p>
            <p className="text-xs text-muted-foreground">{sites?.filter(s => s.status === "attivo").length || 0} attivi</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Ore Totali</p>
            <p className="text-xl font-bold">{totalHours.toFixed(0)}h</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Voci materiali</p>
            <p className="text-xl font-bold">{materials?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost distribution */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Ripartizione Costi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500" /> Materiali</span>
                <span className="font-medium">€{totalMatCost.toLocaleString("it-IT")} ({matPct}%)</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${matPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500" /> Manodopera</span>
                <span className="font-medium">€{totalLaborCost.toLocaleString("it-IT")} ({laborPct}%)</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${laborPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500" /> Altre spese</span>
                <span className="font-medium">€{totalExpCost.toLocaleString("it-IT")} ({expPct}%)</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${expPct}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supplier ranking */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Classifica Fornitori</CardTitle>
          </CardHeader>
          <CardContent>
            {supplierRanking.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nessun fornitore registrato</p>}
            <div className="space-y-2">
              {supplierRanking.slice(0, 10).map((s, i) => (
                <div key={s.name} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold">€{s.total.toLocaleString("it-IT")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Site ranking */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><HardHat className="w-4 h-4" /> Cantieri per spesa</CardTitle>
          </CardHeader>
          <CardContent>
            {siteSummary.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nessun dato</p>}
            <div className="space-y-2">
              {siteSummary.slice(0, 10).map((s, i) => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.city} · {s.hours}h</p>
                  </div>
                  <span className="text-sm font-bold">€{s.total.toLocaleString("it-IT")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense type breakdown */}
      {expTypeRanking.length > 0 && (
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Spese per categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {expTypeRanking.map(([type, amount]) => (
                <div key={type} className="p-3 rounded-xl border text-center">
                  <p className="text-xs text-muted-foreground">{type}</p>
                  <p className="text-lg font-bold mt-1">€{amount.toLocaleString("it-IT")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CantieriReport;
