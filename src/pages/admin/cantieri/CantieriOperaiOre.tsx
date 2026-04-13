import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Users, Euro, Search, HardHat, Calendar } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const COSTO_ORARIO_DEFAULT = 25; // €/h default

const CantieriOperaiOre = () => {
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");

  const { data: sites } = useQuery({
    queryKey: ["coo-sites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("construction_sites").select("id, title").order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: workers } = useQuery({
    queryKey: ["coo-workers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_workers").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: workLogs } = useQuery({
    queryKey: ["coo-worklogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_work_logs")
        .select("*, construction_sites(title)")
        .order("work_date", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data;
    },
  });

  // Group workers by user_id and calculate totals
  const workerMap = new Map<string, { userId: string; role: string; sites: string[]; totalHours: number; totalCost: number }>();
  workers?.forEach((w: any) => {
    const existing = workerMap.get(w.worker_user_id) || { userId: w.worker_user_id, role: w.worker_role || "operaio", sites: [], totalHours: 0, totalCost: 0 };
    const siteName = sites?.find(s => s.id === w.site_id)?.title || w.site_id.slice(0, 8);
    if (!existing.sites.includes(siteName)) existing.sites.push(siteName);
    workerMap.set(w.worker_user_id, existing);
  });

  // Add hours to workers
  workLogs?.forEach((log: any) => {
    const existing = workerMap.get(log.worker_user_id);
    if (existing) {
      existing.totalHours += log.hours_worked || 0;
      existing.totalCost = existing.totalHours * COSTO_ORARIO_DEFAULT;
    }
  });

  const workerList = Array.from(workerMap.values());
  const totalHours = workerList.reduce((s, w) => s + w.totalHours, 0);
  const totalCost = totalHours * COSTO_ORARIO_DEFAULT;

  // Filter logs
  const filteredLogs = workLogs?.filter((log: any) => {
    const matchSite = siteFilter === "all" || log.site_id === siteFilter;
    const matchSearch = !search || log.construction_sites?.title?.toLowerCase().includes(search.toLowerCase()) || log.notes?.toLowerCase().includes(search.toLowerCase());
    return matchSite && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Operai & Ore</h1>
        <p className="text-sm text-muted-foreground">Schede operai e registro ore per cantiere</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Users className="w-4 h-4 text-blue-600" /></div>
            </div>
            <p className="text-xl font-bold">{workerList.length}</p>
            <p className="text-xs text-muted-foreground">Operai registrati</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><Clock className="w-4 h-4 text-green-600" /></div>
            </div>
            <p className="text-xl font-bold">{totalHours.toFixed(0)}h</p>
            <p className="text-xs text-muted-foreground">Ore totali</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><Euro className="w-4 h-4 text-orange-600" /></div>
            </div>
            <p className="text-xl font-bold">€{totalCost.toLocaleString("it-IT")}</p>
            <p className="text-xs text-muted-foreground">Costo manodopera</p>
          </CardContent>
        </Card>
      </div>

      {/* Worker cards */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Schede Operai</CardTitle>
        </CardHeader>
        <CardContent>
          {workerList.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nessun operaio assegnato</p>}
          <div className="space-y-2">
            {workerList.map((w) => (
              <div key={w.userId} className="flex items-center justify-between p-3 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{w.userId.slice(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground">{w.role} · {w.sites.length} cantier{w.sites.length === 1 ? "e" : "i"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{w.totalHours.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">€{w.totalCost.toLocaleString("it-IT")}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hours registry */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm">Registro Ore</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={siteFilter} onValueChange={setSiteFilter}>
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue placeholder="Tutti i cantieri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i cantieri</SelectItem>
                  {sites?.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input placeholder="Cerca..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-8 text-xs w-40" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 text-xs font-medium text-muted-foreground">Data</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground">Cantiere</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground">Operaio</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Ore</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Costo</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground">Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs?.slice(0, 100).map((log: any) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="py-2 text-xs">{format(new Date(log.work_date), "dd/MM/yy")}</td>
                    <td className="py-2 text-xs font-medium">{log.construction_sites?.title}</td>
                    <td className="py-2 text-xs">{log.worker_user_id.slice(0, 8)}...</td>
                    <td className="py-2 text-xs text-right font-medium">{log.hours_worked}h</td>
                    <td className="py-2 text-xs text-right">€{(log.hours_worked * COSTO_ORARIO_DEFAULT).toFixed(0)}</td>
                    <td className="py-2 text-xs text-muted-foreground truncate max-w-[150px]">{log.notes || "—"}</td>
                  </tr>
                ))}
                {(!filteredLogs || filteredLogs.length === 0) && (
                  <tr><td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">Nessun registro trovato</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CantieriOperaiOre;
