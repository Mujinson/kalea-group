import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Users, Clock, Euro, HardHat, Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, ClockArrowUp, Download, Calendar as CalIcon, TrendingUp, BadgeCheck,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isSameMonth, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkerFormDrawer, type Worker } from "@/components/admin/workers/WorkerFormDrawer";
import { WorkLogFormDrawer } from "@/components/admin/workers/WorkLogFormDrawer";
import { AssignmentBoard } from "@/components/admin/workers/AssignmentBoard";
import { exportCSV, exportXLSX, exportPDF } from "@/lib/exports";
import { Calendar } from "@/components/ui/calendar";

const statusColors: Record<string, string> = {
  attivo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ferie: "bg-amber-50 text-amber-700 border-amber-200",
  sospeso: "bg-orange-50 text-orange-700 border-orange-200",
  non_attivo: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusLabel: Record<string, string> = {
  attivo: "Attivo",
  ferie: "In ferie",
  sospeso: "Sospeso",
  non_attivo: "Non attivo",
};

const CantieriOperaiOre = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [logWorkerId, setLogWorkerId] = useState<string | undefined>();
  const [calDate, setCalDate] = useState<Date | undefined>(new Date());

  const { data: workers = [], isLoading: lw } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("workers" as any).select("*").is("deleted_at", null).order("last_name");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: sites = [] } = useQuery({
    queryKey: ["sites-min"],
    queryFn: async () => {
      const { data, error } = await supabase.from("construction_sites").select("id, title").order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["site-workers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_workers").select("worker_id, site_id, is_active").eq("is_active", true);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["work-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_work_logs")
        .select("*, construction_sites(title)")
        .order("work_date", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return data as any[];
    },
  });

  const workerById = useMemo(() => Object.fromEntries(workers.map((w) => [w.id, w])), [workers]);
  const siteById = useMemo(() => Object.fromEntries(sites.map((s) => [s.id, s])), [sites]);

  // KPIs
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const activeWorkers = workers.filter((w) => w.status === "attivo").length;
  const assignedWorkers = new Set(assignments.map((a) => a.worker_id).filter(Boolean)).size;
  const todayLogs = logs.filter((l) => isSameDay(new Date(l.work_date), today));
  const monthLogs = logs.filter((l) => {
    const d = new Date(l.work_date);
    return d >= monthStart && d <= monthEnd;
  });
  const hoursToday = todayLogs.reduce((s, l) => s + Number(l.hours_worked || 0), 0);
  const hoursMonth = monthLogs.reduce((s, l) => s + Number(l.hours_worked || 0), 0);
  const costMonth = monthLogs.reduce((s, l) => {
    const w = workerById[l.worker_id || ""];
    const hc = Number(l.hourly_cost || w?.hourly_cost || 0);
    return s + Number(l.hours_worked || 0) * hc;
  }, 0);
  const sitesWithLogs = new Set(monthLogs.map((l) => l.site_id)).size || 1;
  const avgCostSite = costMonth / sitesWithLogs;

  // worker month aggregates
  const workerStats = useMemo(() => {
    const m = new Map<string, { hours: number; cost: number }>();
    monthLogs.forEach((l) => {
      const wid = l.worker_id;
      if (!wid) return;
      const w = workerById[wid];
      const hc = Number(l.hourly_cost || w?.hourly_cost || 0);
      const prev = m.get(wid) || { hours: 0, cost: 0 };
      prev.hours += Number(l.hours_worked || 0);
      prev.cost += Number(l.hours_worked || 0) * hc;
      m.set(wid, prev);
    });
    return m;
  }, [monthLogs, workerById]);

  const assignedSitesByWorker = useMemo(() => {
    const m = new Map<string, string[]>();
    assignments.forEach((a) => {
      if (!a.worker_id) return;
      const arr = m.get(a.worker_id) || [];
      arr.push(a.site_id);
      m.set(a.worker_id, arr);
    });
    return m;
  }, [assignments]);

  const filteredWorkers = workers.filter((w) => {
    if (statusFilter !== "all" && w.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${w.first_name} ${w.last_name} ${w.role || ""}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredLogs = logs.filter((l) => {
    if (siteFilter !== "all" && l.site_id !== siteFilter) return false;
    if (search) {
      const w = workerById[l.worker_id || ""];
      const q = search.toLowerCase();
      const hay = `${w?.first_name || ""} ${w?.last_name || ""} ${l.construction_sites?.title || ""} ${l.notes || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["workers"] });
    qc.invalidateQueries({ queryKey: ["work-logs"] });
    qc.invalidateQueries({ queryKey: ["site-workers"] });
  };

  const deleteWorker = async (id: string) => {
    const { error } = await supabase.from("workers" as any).update({ deleted_at: new Date().toISOString(), status: "non_attivo" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Operaio archiviato");
    refresh();
  };

  const deleteLog = async (id: string) => {
    const { error } = await supabase.from("site_work_logs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Registro eliminato");
    refresh();
  };

  const exportLogs = (fmt: "csv" | "xlsx" | "pdf") => {
    const rows = filteredLogs.map((l) => {
      const w = workerById[l.worker_id || ""];
      return {
        Data: format(new Date(l.work_date), "dd/MM/yyyy"),
        Operaio: w ? `${w.first_name} ${w.last_name}` : "—",
        Cantiere: l.construction_sites?.title || "—",
        Inizio: l.start_time || "—",
        Fine: l.end_time || "—",
        Pausa_min: l.break_minutes || 0,
        Ore: Number(l.hours_worked || 0).toFixed(2),
        Costo_EUR: (Number(l.hours_worked || 0) * Number(l.hourly_cost || w?.hourly_cost || 0)).toFixed(2),
        Note: l.notes || "",
      };
    });
    if (!rows.length) return toast.error("Nessun dato da esportare");
    const name = `registro-ore-${format(new Date(), "yyyy-MM-dd")}`;
    if (fmt === "csv") exportCSV(rows, name);
    if (fmt === "xlsx") exportXLSX(rows, name, "Registro Ore");
    if (fmt === "pdf") exportPDF(rows, name, "Registro Ore Kalēa");
  };

  // calendar logs by selected day
  const dayLogs = calDate ? logs.filter((l) => isSameDay(new Date(l.work_date), calDate)) : [];

  const kpis = [
    { icon: BadgeCheck, label: "Operai attivi", value: activeWorkers, tint: "bg-emerald-50 text-emerald-600" },
    { icon: HardHat, label: "Assegnati", value: assignedWorkers, tint: "bg-blue-50 text-blue-600" },
    { icon: Clock, label: "Ore oggi", value: `${hoursToday.toFixed(1)}h`, tint: "bg-violet-50 text-violet-600" },
    { icon: TrendingUp, label: "Ore mese", value: `${hoursMonth.toFixed(0)}h`, tint: "bg-cyan-50 text-cyan-600" },
    { icon: Euro, label: "Costo mese", value: `€${costMonth.toLocaleString("it-IT", { maximumFractionDigits: 0 })}`, tint: "bg-amber-50 text-amber-600" },
    { icon: Users, label: "Costo/cantiere", value: `€${avgCostSite.toLocaleString("it-IT", { maximumFractionDigits: 0 })}`, tint: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestione Operai</h1>
          <p className="text-sm text-muted-foreground">Anagrafica, ore, costi e assegnazione cantieri</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setLogWorkerId(undefined); setLogOpen(true); }}>
            <ClockArrowUp className="w-4 h-4 mr-2" /> Registra ore
          </Button>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Nuovo operaio
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <Card key={k.label} className="bg-white">
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${k.tint}`}>
                <k.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold leading-tight">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="workers" className="space-y-4">
        <TabsList className="bg-white border h-10">
          <TabsTrigger value="workers">Operai</TabsTrigger>
          <TabsTrigger value="logs">Registro Ore</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="assign">Assegnazioni</TabsTrigger>
        </TabsList>

        {/* WORKERS */}
        <TabsContent value="workers" className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cerca operaio o mansione..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="attivo">Attivo</SelectItem>
                <SelectItem value="ferie">In ferie</SelectItem>
                <SelectItem value="sospeso">Sospeso</SelectItem>
                <SelectItem value="non_attivo">Non attivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {lw ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
            </div>
          ) : filteredWorkers.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="py-16 text-center">
                <Users className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">Nessun operaio. Crea il primo per iniziare.</p>
                <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="w-4 h-4 mr-2" />Nuovo operaio</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredWorkers.map((w) => {
                const stats = workerStats.get(w.id) || { hours: 0, cost: 0 };
                const sitesAssigned = assignedSitesByWorker.get(w.id) || [];
                return (
                  <Card key={w.id} className="bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={w.photo_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {w.first_name?.[0]}{w.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <Link to={`/admin/cantieri-operai/${w.id}`} className="font-semibold text-sm hover:underline block truncate">
                            {w.first_name} {w.last_name}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">{w.role || "Operaio"}</p>
                          <Badge variant="outline" className={`mt-1.5 text-[10px] ${statusColors[w.status] || ""}`}>
                            {statusLabel[w.status] || w.status}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link to={`/admin/cantieri-operai/${w.id}`}><Eye className="w-4 h-4 mr-2" />Visualizza</Link></DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditing(w); setFormOpen(true); }}><Pencil className="w-4 h-4 mr-2" />Modifica</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setLogWorkerId(w.id); setLogOpen(true); }}><ClockArrowUp className="w-4 h-4 mr-2" />Registra ore</DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Elimina</DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminare {w.first_name} {w.last_name}?</AlertDialogTitle>
                                  <AlertDialogDescription>L'operaio verrà archiviato (soft delete). Lo storico ore e cantieri verrà mantenuto.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteWorker(w.id)} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Cantieri</p>
                          <p className="text-sm font-semibold">{sitesAssigned.length}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Ore mese</p>
                          <p className="text-sm font-semibold">{stats.hours.toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Costo mese</p>
                          <p className="text-sm font-semibold">€{stats.cost.toFixed(0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* LOGS */}
        <TabsContent value="logs" className="space-y-3">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 items-center mb-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Cerca..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={siteFilter} onValueChange={setSiteFilter}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Tutti i cantieri" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i cantieri</SelectItem>
                    {sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline"><Download className="w-4 h-4 mr-2" />Esporta</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportLogs("csv")}>CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportLogs("xlsx")}>Excel (XLSX)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportLogs("pdf")}>PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr className="text-left">
                      <th className="p-3 text-xs font-semibold text-muted-foreground">Data</th>
                      <th className="p-3 text-xs font-semibold text-muted-foreground">Operaio</th>
                      <th className="p-3 text-xs font-semibold text-muted-foreground">Cantiere</th>
                      <th className="p-3 text-xs font-semibold text-muted-foreground">Inizio</th>
                      <th className="p-3 text-xs font-semibold text-muted-foreground">Fine</th>
                      <th className="p-3 text-xs font-semibold text-muted-foreground">Pausa</th>
                      <th className="p-3 text-xs font-semibold text-muted-foreground text-right">Ore</th>
                      <th className="p-3 text-xs font-semibold text-muted-foreground text-right">Costo</th>
                      <th className="p-3 text-xs font-semibold text-muted-foreground">Note</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.slice(0, 200).map((l) => {
                      const w = workerById[l.worker_id || ""];
                      const hc = Number(l.hourly_cost || w?.hourly_cost || 0);
                      const cost = Number(l.hours_worked || 0) * hc;
                      return (
                        <tr key={l.id} className="border-t hover:bg-muted/20">
                          <td className="p-3 text-xs whitespace-nowrap">{format(new Date(l.work_date), "dd/MM/yy")}</td>
                          <td className="p-3 text-xs font-medium">{w ? `${w.first_name} ${w.last_name}` : "—"}</td>
                          <td className="p-3 text-xs">{l.construction_sites?.title || "—"}</td>
                          <td className="p-3 text-xs">{l.start_time || "—"}</td>
                          <td className="p-3 text-xs">{l.end_time || "—"}</td>
                          <td className="p-3 text-xs">{l.break_minutes || 0}m</td>
                          <td className="p-3 text-xs text-right font-semibold">{Number(l.hours_worked || 0).toFixed(2)}h</td>
                          <td className="p-3 text-xs text-right">€{cost.toFixed(0)}</td>
                          <td className="p-3 text-xs text-muted-foreground truncate max-w-[180px]">{l.notes || "—"}</td>
                          <td className="p-3 text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="w-3 h-3 text-red-500" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminare il record?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteLog(l.id)} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredLogs.length === 0 && (
                      <tr><td colSpan={10} className="p-12 text-center text-xs text-muted-foreground">Nessun registro</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredLogs.length > 200 && <p className="text-xs text-muted-foreground text-center mt-3">Mostrati primi 200 — usa filtri per restringere</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CALENDAR */}
        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
            <Card className="bg-white">
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={calDate}
                  onSelect={setCalDate}
                  locale={it}
                  className="pointer-events-auto"
                  modifiers={{
                    hasLogs: (d) => logs.some((l) => isSameDay(new Date(l.work_date), d)),
                  }}
                  modifiersClassNames={{
                    hasLogs: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary relative",
                  }}
                />
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2"><CalIcon className="w-4 h-4" />
                    {calDate ? format(calDate, "EEEE d MMMM yyyy", { locale: it }) : ""}
                  </h3>
                  <Badge variant="secondary">{dayLogs.length} registri</Badge>
                </div>
                <div className="space-y-2">
                  {dayLogs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nessun registro per questo giorno</p>}
                  {dayLogs.map((l) => {
                    const w = workerById[l.worker_id || ""];
                    return (
                      <div key={l.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={w?.photo_url || undefined} />
                          <AvatarFallback className="text-xs">{w?.first_name?.[0]}{w?.last_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{w ? `${w.first_name} ${w.last_name}` : "—"}</p>
                          <p className="text-xs text-muted-foreground truncate">{l.construction_sites?.title} · {l.start_time}–{l.end_time}</p>
                        </div>
                        <Badge variant="outline">{Number(l.hours_worked || 0).toFixed(1)}h</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ASSIGN */}
        <TabsContent value="assign">
          <AssignmentBoard
            workers={workers.filter((w) => w.status === "attivo")}
            sites={sites}
            assignments={assignments}
            onChange={refresh}
          />
        </TabsContent>
      </Tabs>

      <WorkerFormDrawer open={formOpen} onOpenChange={setFormOpen} worker={editing} onSaved={refresh} />
      <WorkLogFormDrawer
        open={logOpen}
        onOpenChange={setLogOpen}
        workers={workers}
        sites={sites}
        defaultWorkerId={logWorkerId}
        onSaved={refresh}
      />
    </div>
  );
};

export default CantieriOperaiOre;
