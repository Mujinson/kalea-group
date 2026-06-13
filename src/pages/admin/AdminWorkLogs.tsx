import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Camera, Package, Search, Calendar, HardHat, User, ChevronDown, ChevronRight } from "lucide-react";
import { CrmPageHeader, CrmKpiTile, CrmKpiRow } from "@/components/admin/CrmShell";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const AdminWorkLogs = () => {
  const [search, setSearch] = useState("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-work-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_work_logs")
        .select("*, construction_sites(title, city)")
        .order("work_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const { data: photos } = useQuery({
    queryKey: ["admin-work-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_work_photos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const photosMap = new Map<string, typeof photos>();
  photos?.forEach((p) => {
    const existing = photosMap.get(p.work_log_id) || [];
    existing.push(p);
    photosMap.set(p.work_log_id, existing);
  });

  const filteredLogs = logs?.filter((log: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      log.construction_sites?.title?.toLowerCase().includes(s) ||
      log.notes?.toLowerCase().includes(s) ||
      log.materials_used?.some((m: string) => m.toLowerCase().includes(s))
    );
  });

  // Stats
  const totalHours = filteredLogs?.reduce((sum: number, l: any) => sum + (l.hours_worked || 0), 0) || 0;
  const totalPhotos = photos?.length || 0;
  const uniqueSites = new Set(filteredLogs?.map((l: any) => l.site_id)).size;
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = filteredLogs?.filter((l: any) => l.work_date === today) || [];

  return (
    <div className="space-y-4">
      <CrmPageHeader breadcrumb={["CRM", "Cantieri", "Registro Lavori"]} title="Registro Lavori" subtitle="Attività giornaliere degli operai" />

      <CrmKpiRow>
        <CrmKpiTile label="Ore Totali" value={totalHours.toFixed(1)} color="blue" icon={<Clock className="w-4 h-4" />} />
        <CrmKpiTile label="Foto Caricate" value={totalPhotos} color="green" icon={<Camera className="w-4 h-4" />} />
        <CrmKpiTile label="Cantieri Attivi" value={uniqueSites} color="amber" icon={<HardHat className="w-4 h-4" />} />
        <CrmKpiTile label="Attività Oggi" value={todayLogs.length} color="purple" icon={<Calendar className="w-4 h-4" />} />
      </CrmKpiRow>


      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per cantiere, note, materiali..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Logs list */}
      <div className="space-y-2">
        {isLoading && <p className="text-center text-muted-foreground py-8">Caricamento...</p>}
        {filteredLogs?.map((log: any) => {
          const logPhotos = photosMap.get(log.id) || [];
          const expanded = expandedLog === log.id;

          return (
            <Card key={log.id} className="bg-white border-0 shadow-sm">
              <button
                onClick={() => setExpandedLog(expanded ? null : log.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#075E54]/10 flex items-center justify-center shrink-0">
                    <HardHat className="w-5 h-5 text-[#075E54]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {log.construction_sites?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.work_date), "dd MMM yyyy", { locale: it })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {log.hours_worked}h
                    </Badge>
                    {logPhotos.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Camera className="w-3 h-3 mr-1" />
                        {logPhotos.length}
                      </Badge>
                    )}
                    {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
              </button>

              {expanded && (
                <div className="px-4 pb-4 pt-0 space-y-3 border-t">
                  {log.notes && (
                    <p className="text-sm text-foreground mt-3">{log.notes}</p>
                  )}
                  {log.materials_used && log.materials_used.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Package className="w-3 h-3" /> Materiali
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {log.materials_used.map((m: string) => (
                          <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {logPhotos.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Foto</p>
                      <div className="grid grid-cols-3 gap-2">
                        {logPhotos.map((p: any) => (
                          <a key={p.id} href={p.file_url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg overflow-hidden">
                            <img src={p.file_url} alt={p.file_name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
        {filteredLogs?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nessuna attività registrata</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWorkLogs;
