import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Upload, Trash2, Image, Film, FileText, Search, Download,
  Users, Package, Receipt, Clock, Plus, CalendarDays, MapPin, Phone, Mail, X,
  CheckCircle2, AlertCircle, Euro, Settings, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import SiteConfigPanel, { priorityBadge } from "@/components/admin/cantieri/SiteConfigPanel";
import SiteIssuesPanel from "@/components/admin/cantieri/SiteIssuesPanel";

const EXPENSE_TYPES = [
  "Materiali", "Trasporto", "Attrezzatura", "Manodopera esterna",
  "Permessi", "Smaltimento", "Carburante", "Altro"
];

const MATERIAL_UNITS = ["pz", "mq", "ml", "kg", "lt", "sacchi", "bancali", "rotoli"];

const AdminCantiereDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");

  // Dialogs
  const [addWorkerOpen, setAddWorkerOpen] = useState(false);
  const [addMaterialOpen, setAddMaterialOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  // Worker form
  const [workerForm, setWorkerForm] = useState({ worker_email: "", worker_role: "operaio", notes: "" });
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  // Material form
  const [materialForm, setMaterialForm] = useState({ material_name: "", quantity: "", unit: "pz", unit_cost: "", notes: "" });
  // Expense form
  const [expenseForm, setExpenseForm] = useState({ expense_type: "Materiali", description: "", amount: "", expense_date: new Date().toISOString().split("T")[0], notes: "" });

  // Queries
  const { data: site } = useQuery({
    queryKey: ["construction-site", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("construction_sites").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: media, isLoading: mediaLoading } = useQuery({
    queryKey: ["site-media", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_media").select("*").eq("site_id", id!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: workers } = useQuery({
    queryKey: ["site-workers", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_workers" as any)
        .select("*, workers(id, first_name, last_name)")
        .eq("site_id", id!).order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!id,
  });

  const { data: materials } = useQuery({
    queryKey: ["site-materials", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_materials" as any).select("*").eq("site_id", id!).order("usage_date", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!id,
  });

  const { data: expenses } = useQuery({
    queryKey: ["site-expenses", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_expenses" as any).select("*").eq("site_id", id!).order("expense_date", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!id,
  });

  const { data: workLogs } = useQuery({
    queryKey: ["site-work-logs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_work_logs")
        .select("*, site_work_photos(*)")
        .eq("site_id", id!)
        .order("work_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: kpiChecklist } = useQuery({
    queryKey: ["site-checklist-kpi", id],
    queryFn: async () => {
      const { data } = await supabase.from("site_checklist_items" as any).select("completed_at").eq("site_id", id!);
      return (data as any[]) || [];
    },
    enabled: !!id,
  });
  const { data: kpiIssues } = useQuery({
    queryKey: ["site-issues-kpi", id],
    queryFn: async () => {
      const { data } = await supabase.from("site_issues" as any).select("status").eq("site_id", id!);
      return (data as any[]) || [];
    },
    enabled: !!id,
  });

  // --- Handlers ---

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !id) return;
    setUploading(true);
    let uploaded = 0;
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("site-media").upload(path, file);
      if (uploadError) { toast.error(`Errore upload: ${file.name}`); continue; }
      const { data: urlData } = supabase.storage.from("site-media").getPublicUrl(path);
      const fileType = file.type.startsWith("video") ? "video" : file.type.startsWith("image") ? "image" : "document";
      await supabase.from("site_media").insert({ site_id: id, file_url: urlData.publicUrl, file_name: file.name, file_type: fileType, file_size: file.size });
      uploaded++;
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    queryClient.invalidateQueries({ queryKey: ["site-media", id] });
    toast.success(`${uploaded} file caricati`);
  };

  const handleDeleteMedia = async (mediaId: string, fileUrl: string) => {
    const urlParts = fileUrl.split("/site-media/");
    if (urlParts[1]) await supabase.storage.from("site-media").remove([urlParts[1]]);
    await supabase.from("site_media").delete().eq("id", mediaId);
    queryClient.invalidateQueries({ queryKey: ["site-media", id] });
    toast.success("File eliminato");
  };

  const handleAddWorker = async () => {
    if (!workerForm.worker_email || !id) { toast.error("Email obbligatoria"); return; }
    // Find user by email - we search in auth via user_roles or just store email
    // Since we can't query auth.users, we'll store the email and try to find the user_id
    const { data: userData } = await supabase.from("user_roles").select("user_id").limit(100);
    // Try to find by checking all users with operaio role
    // For now, we insert with a placeholder approach - admin knows the user_id
    // Better: look up user by their email from salespeople or a profiles approach
    
    // Simplified: store worker_user_id as the email for now, or use a known user_id
    // Let's try to find the user via auth - but we can't. Instead use a workaround:
    // The admin should know the user's ID or we look for operaio users
    
    // Actually, let's just insert directly - the admin will pick from existing operaio users
    toast.error("Usa il selettore per aggiungere un operaio esistente");
  };

  const handleAssignSelected = async (allWorkers: any[]) => {
    if (!id || selectedWorkerIds.length === 0) { toast.error("Seleziona almeno un operaio"); return; }
    const rows = selectedWorkerIds.map((wid) => {
      const w = allWorkers.find((x) => x.id === wid);
      return {
        site_id: id,
        worker_id: wid,
        worker_user_id: w?.user_id || null,
        worker_role: workerForm.worker_role,
        notes: workerForm.notes || null,
      };
    });
    const { error } = await supabase.from("site_workers" as any).insert(rows);
    if (error) {
      if (error.code === '23505') toast.error("Uno o più operai sono già assegnati");
      else toast.error("Errore: " + error.message);
      return;
    }
    toast.success(`${rows.length} operai assegnati`);
    setAddWorkerOpen(false);
    setSelectedWorkerIds([]);
    setWorkerForm({ worker_email: "", worker_role: "operaio", notes: "" });
    queryClient.invalidateQueries({ queryKey: ["site-workers", id] });
  };

  const handleRemoveWorker = async (workerId: string) => {
    if (!confirm("Rimuovere questo operaio dal cantiere?")) return;
    await supabase.from("site_workers" as any).delete().eq("id", workerId);
    queryClient.invalidateQueries({ queryKey: ["site-workers", id] });
    toast.success("Operaio rimosso");
  };

  const handleAddMaterial = async () => {
    if (!materialForm.material_name || !materialForm.quantity || !id) {
      toast.error("Nome materiale e quantità obbligatori"); return;
    }
    const { error } = await supabase.from("site_materials" as any).insert({
      site_id: id, material_name: materialForm.material_name,
      quantity: parseFloat(materialForm.quantity), unit: materialForm.unit,
      unit_cost: materialForm.unit_cost ? parseFloat(materialForm.unit_cost) : 0,
      notes: materialForm.notes || null,
    });
    if (error) { toast.error("Errore nel salvataggio"); return; }
    toast.success("Materiale aggiunto");
    setAddMaterialOpen(false);
    setMaterialForm({ material_name: "", quantity: "", unit: "pz", unit_cost: "", notes: "" });
    queryClient.invalidateQueries({ queryKey: ["site-materials", id] });
  };

  const handleDeleteMaterial = async (matId: string) => {
    await supabase.from("site_materials" as any).delete().eq("id", matId);
    queryClient.invalidateQueries({ queryKey: ["site-materials", id] });
    toast.success("Materiale eliminato");
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount || !id) {
      toast.error("Descrizione e importo obbligatori"); return;
    }
    const { error } = await supabase.from("site_expenses" as any).insert({
      site_id: id, expense_type: expenseForm.expense_type, description: expenseForm.description,
      amount: parseFloat(expenseForm.amount), expense_date: expenseForm.expense_date,
      notes: expenseForm.notes || null,
    });
    if (error) { toast.error("Errore nel salvataggio"); return; }
    toast.success("Spesa aggiunta");
    setAddExpenseOpen(false);
    setExpenseForm({ expense_type: "Materiali", description: "", amount: "", expense_date: new Date().toISOString().split("T")[0], notes: "" });
    queryClient.invalidateQueries({ queryKey: ["site-expenses", id] });
  };

  const handleDeleteExpense = async (expId: string) => {
    await supabase.from("site_expenses" as any).delete().eq("id", expId);
    queryClient.invalidateQueries({ queryKey: ["site-expenses", id] });
    toast.success("Spesa eliminata");
  };

  const handleToggleExpensePaid = async (expId: string, currentPaid: boolean) => {
    await supabase.from("site_expenses" as any).update({
      is_paid: !currentPaid, paid_date: !currentPaid ? new Date().toISOString().split("T")[0] : null
    }).eq("id", expId);
    queryClient.invalidateQueries({ queryKey: ["site-expenses", id] });
  };

  // Fetch workers (operai/posatori) from workers table for assignment
  const { data: operaioUsers } = useQuery({
    queryKey: ["assignable-workers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workers")
        .select("id, first_name, last_name, user_id, role")
        .order("first_name");
      if (error) throw error;
      return data as any[];
    },
    enabled: addWorkerOpen,
  });

  const filteredMedia = media?.filter((m) => {
    if (!mediaSearch) return true;
    return m.file_name.toLowerCase().includes(mediaSearch.toLowerCase());
  });
  const images = filteredMedia?.filter((m) => m.file_type === "image") || [];
  const videos = filteredMedia?.filter((m) => m.file_type === "video") || [];
  const docs = filteredMedia?.filter((m) => m.file_type === "document") || [];

  // Stats
  const totalHours = workLogs?.reduce((sum, l) => sum + (l.hours_worked || 0), 0) || 0;
  const totalMaterialCost = materials?.reduce((sum, m) => sum + (m.total_cost || 0), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const unpaidExpenses = expenses?.filter(e => !e.is_paid).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

  // Incassi: somma preventivi accettati del cliente collegato al cantiere
  const { data: customerQuotes } = useQuery({
    queryKey: ["site-customer-quotes", site?.customer_id],
    enabled: !!site?.customer_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("id, total_amount, status, project_name")
        .eq("customer_id", site!.customer_id!)
        .in("status", ["accepted", "accettato"]);
      if (error) throw error;
      return data || [];
    },
  });
  const totalIncassi = (customerQuotes || []).reduce((s, q: any) => s + (q.total_amount || 0), 0);
  const totalCosti = totalMaterialCost + totalExpenses;
  const margine = totalIncassi - totalCosti;
  const marginePerc = totalIncassi > 0 ? (margine / totalIncassi) * 100 : 0;

  if (!site) return <div className="p-8 text-center text-muted-foreground">Caricamento...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/cantieri")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Cantieri › {site.title}</p>
          <h1 className="text-2xl font-bold text-foreground">{site.title}</h1>
          {site.project_name && <p className="text-sm text-muted-foreground">{site.project_name}</p>}
        </div>
        <div className="flex items-center gap-2">
          {site.priority && priorityBadge(site.priority)}
          {site.tipologia && <Badge variant="outline">{site.tipologia}</Badge>}
          <Badge variant={site.status === "attivo" ? "default" : "secondary"}>{site.status}</Badge>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><MapPin className="w-4 h-4 text-blue-600" /></div>
              <p className="text-xs text-muted-foreground">Indirizzo</p>
            </div>
            <p className="text-sm font-medium">{[site.address, site.city, site.province].filter(Boolean).join(", ") || "—"}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><Clock className="w-4 h-4 text-green-600" /></div>
              <p className="text-xs text-muted-foreground">Ore totali</p>
            </div>
            <p className="text-xl font-bold">{totalHours}h</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><Euro className="w-4 h-4 text-orange-600" /></div>
              <p className="text-xs text-muted-foreground">Spese totali</p>
            </div>
            <p className="text-xl font-bold">€{(totalExpenses + totalMaterialCost).toLocaleString("it-IT")}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><Users className="w-4 h-4 text-purple-600" /></div>
              <p className="text-xs text-muted-foreground">Contatto</p>
            </div>
            <p className="text-sm font-medium">{[site.contact_name, site.contact_surname].filter(Boolean).join(" ") || "—"}</p>
            {site.contact_phone && <p className="text-xs text-muted-foreground">{site.contact_phone}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Riepilogo economico */}
      <Card className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] text-white border-0">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Riepilogo economico</p>
              <p className="text-xs text-white/70 mt-0.5">Incassi da preventivi accettati · costi di cantiere · margine</p>
            </div>
            <Euro className="w-5 h-5 text-white/40" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/50">Incassi</p>
              <p className="text-2xl font-bold mt-1">€{totalIncassi.toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p className="text-[10px] text-white/50 mt-0.5">{customerQuotes?.length || 0} preventivi accettati</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/50">Materiali</p>
              <p className="text-2xl font-bold mt-1">€{totalMaterialCost.toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p className="text-[10px] text-white/50 mt-0.5">{materials?.length || 0} voci</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/50">Costi & trasporti</p>
              <p className="text-2xl font-bold mt-1">€{totalExpenses.toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p className="text-[10px] text-white/50 mt-0.5">{expenses?.length || 0} spese · €{unpaidExpenses.toLocaleString("it-IT")} da pagare</p>
            </div>
            <div className={`rounded-xl p-3 -m-1 ${margine >= 0 ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Margine</p>
              <p className={`text-2xl font-bold mt-1 ${margine >= 0 ? "text-emerald-300" : "text-red-300"}`}>€{margine.toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p className="text-[10px] text-white/60 mt-0.5">{marginePerc.toFixed(1)}% del fatturato</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI cantiere */}
      {(() => {
        const total = (kpiChecklist || []).length;
        const done = (kpiChecklist || []).filter((c) => c.completed_at).length;
        const progress = total ? Math.round((done / total) * 100) : 0;
        const endRef = site.planned_end_date || site.end_date;
        const daysLeft = endRef ? differenceInDays(new Date(endRef), new Date()) : null;
        const openIssues = (kpiIssues || []).filter((i) => i.status !== "chiusa").length;
        const photoCount = (media || []).filter((m) => m.file_type === "image").length;
        const est = Number(site.estimated_hours || 0);
        return (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard label="Avanzamento" value={`${progress}%`} sub={`${done}/${total} voci`} />
            <KpiCard label="Giorni residui" value={daysLeft === null ? "—" : String(daysLeft)} sub={daysLeft !== null && daysLeft < 0 ? "in ritardo" : ""} danger={daysLeft !== null && daysLeft < 0} />
            <KpiCard label="Ore lavorate" value={`${totalHours}h`} sub={est ? `su ${est}h previste` : "nessuna stima"} />
            <KpiCard label="Foto" value={String(photoCount)} sub="caricate" />
            <KpiCard label="Segnalazioni aperte" value={String(openIssues)} danger={openIssues > 0} />
          </div>
        );
      })()}

      {/* Date */}
      {(site.start_date || site.end_date || site.planned_start_date || site.planned_end_date) && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <CalendarDays className="w-4 h-4" />
          {site.planned_start_date && <span>Prev. inizio: {format(new Date(site.planned_start_date), "dd/MM/yyyy")}</span>}
          {site.planned_end_date && <span>Prev. fine: {format(new Date(site.planned_end_date), "dd/MM/yyyy")}</span>}
          {site.start_date && <span>Inizio: {format(new Date(site.start_date), "dd/MM/yyyy")}</span>}
          {site.end_date && <span>Fine: {format(new Date(site.end_date), "dd/MM/yyyy")}</span>}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="bg-white border flex-wrap h-auto">
          <TabsTrigger value="config" className="gap-2"><Settings className="w-4 h-4" /> Configurazione</TabsTrigger>
          <TabsTrigger value="workers" className="gap-2"><Users className="w-4 h-4" /> Operai ({workers?.length || 0})</TabsTrigger>
          <TabsTrigger value="materials" className="gap-2"><Package className="w-4 h-4" /> Materiali ({materials?.length || 0})</TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2"><Receipt className="w-4 h-4" /> Spese ({expenses?.length || 0})</TabsTrigger>
          <TabsTrigger value="worklogs" className="gap-2"><Clock className="w-4 h-4" /> Registro ({workLogs?.length || 0})</TabsTrigger>
          <TabsTrigger value="media" className="gap-2"><Image className="w-4 h-4" /> Media ({media?.length || 0})</TabsTrigger>
          <TabsTrigger value="issues" className="gap-2"><AlertTriangle className="w-4 h-4" /> Segnalazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <SiteConfigPanel siteId={id!} site={site} />
        </TabsContent>

        <TabsContent value="issues">
          <SiteIssuesPanel siteId={id!} />
        </TabsContent>

        {/* WORKERS TAB */}
        <TabsContent value="workers">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Operai assegnati</CardTitle>
                <Button size="sm" onClick={() => setAddWorkerOpen(true)}><Plus className="w-4 h-4 mr-2" /> Assegna operaio</Button>
              </div>
            </CardHeader>
            <CardContent>
              {workers && workers.length > 0 ? (
                <div className="space-y-3">
                  {workers.map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between p-3 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{w.workers ? `${w.workers.first_name} ${w.workers.last_name}` : (w.worker_user_id?.slice(0, 8) + "…")}</p>
                          <p className="text-xs text-muted-foreground">{w.worker_role} · {w.is_active ? "Attivo" : "Inattivo"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {w.start_date && <span className="text-xs text-muted-foreground">Dal {format(new Date(w.start_date), "dd/MM/yy")}</span>}
                        <Button size="icon" variant="ghost" onClick={() => handleRemoveWorker(w.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Nessun operaio assegnato a questo cantiere
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MATERIALS TAB */}
        <TabsContent value="materials">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Materiali</CardTitle>
                  {totalMaterialCost > 0 && <p className="text-sm text-muted-foreground mt-1">Costo totale: €{totalMaterialCost.toLocaleString("it-IT")}</p>}
                </div>
                <Button size="sm" onClick={() => setAddMaterialOpen(true)}><Plus className="w-4 h-4 mr-2" /> Aggiungi</Button>
              </div>
            </CardHeader>
            <CardContent>
              {materials && materials.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 text-xs font-medium text-muted-foreground">Materiale</th>
                        <th className="pb-2 text-xs font-medium text-muted-foreground">Quantità</th>
                        <th className="pb-2 text-xs font-medium text-muted-foreground">Costo unit.</th>
                        <th className="pb-2 text-xs font-medium text-muted-foreground">Totale</th>
                        <th className="pb-2 text-xs font-medium text-muted-foreground">Data</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((m: any) => (
                        <tr key={m.id} className="border-b last:border-0">
                          <td className="py-2 text-sm font-medium">{m.material_name}</td>
                          <td className="py-2 text-sm">{m.quantity} {m.unit}</td>
                          <td className="py-2 text-sm">€{(m.unit_cost || 0).toFixed(2)}</td>
                          <td className="py-2 text-sm font-medium">€{(m.total_cost || 0).toFixed(2)}</td>
                          <td className="py-2 text-xs text-muted-foreground">{m.usage_date ? format(new Date(m.usage_date), "dd/MM/yy") : "—"}</td>
                          <td className="py-2 text-right">
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteMaterial(m.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Nessun materiale registrato
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXPENSES TAB */}
        <TabsContent value="expenses">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Spese</CardTitle>
                  <div className="flex gap-4 mt-1">
                    <p className="text-sm text-muted-foreground">Totale: €{totalExpenses.toLocaleString("it-IT")}</p>
                    {unpaidExpenses > 0 && <p className="text-sm text-orange-600">Da pagare: €{unpaidExpenses.toLocaleString("it-IT")}</p>}
                  </div>
                </div>
                <Button size="sm" onClick={() => setAddExpenseOpen(true)}><Plus className="w-4 h-4 mr-2" /> Aggiungi</Button>
              </div>
            </CardHeader>
            <CardContent>
              {expenses && expenses.length > 0 ? (
                <div className="space-y-2">
                  {expenses.map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between p-3 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleToggleExpensePaid(e.id, e.is_paid)}>
                          {e.is_paid ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-orange-400" />
                          )}
                        </button>
                        <div>
                          <p className="text-sm font-medium">{e.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{e.expense_type}</Badge>
                            <span className="text-xs text-muted-foreground">{e.expense_date ? format(new Date(e.expense_date), "dd/MM/yy") : ""}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">€{(e.amount || 0).toLocaleString("it-IT")}</span>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteExpense(e.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Nessuna spesa registrata
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WORK LOGS TAB */}
        <TabsContent value="worklogs">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Registro attività ({totalHours}h totali)</CardTitle>
            </CardHeader>
            <CardContent>
              {workLogs && workLogs.length > 0 ? (
                <div className="space-y-3">
                  {workLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{log.hours_worked}h</Badge>
                          <span className="text-xs text-muted-foreground">{format(new Date(log.work_date), "dd/MM/yyyy")}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{log.worker_user_id?.slice(0, 8)}...</span>
                      </div>
                      {log.notes && <p className="text-sm text-muted-foreground mb-2">{log.notes}</p>}
                      {log.materials_used && log.materials_used.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {log.materials_used.map((m: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{m}</Badge>
                          ))}
                        </div>
                      )}
                      {(log as any).site_work_photos && (log as any).site_work_photos.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {(log as any).site_work_photos.map((photo: any) => (
                            <img
                              key={photo.id}
                              src={photo.file_url}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover cursor-pointer border"
                              onClick={() => window.open(photo.file_url, "_blank")}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Nessuna attività registrata dagli operai
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEDIA TAB */}
        <TabsContent value="media">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Media ({media?.length || 0})</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Cerca file..." value={mediaSearch} onChange={(e) => setMediaSearch(e.target.value)} className="pl-9 w-48" />
                  </div>
                  <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
                  <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} size="sm">
                    <Upload className="w-4 h-4 mr-2" /> {uploading ? "Caricamento..." : "Carica"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Image className="w-4 h-4" /> Foto ({images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {images.map((img) => (
                      <div key={img.id} className="group relative rounded-lg overflow-hidden border aspect-square">
                        <img src={img.file_url} alt={img.file_name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-1">
                            <Button size="icon" variant="secondary" className="w-8 h-8" onClick={() => window.open(img.file_url, "_blank")}><Download className="w-3.5 h-3.5" /></Button>
                            <Button size="icon" variant="destructive" className="w-8 h-8" onClick={() => handleDeleteMedia(img.id, img.file_url)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {videos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Film className="w-4 h-4" /> Video ({videos.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {videos.map((vid) => (
                      <div key={vid.id} className="rounded-lg overflow-hidden border">
                        <video src={vid.file_url} controls className="w-full aspect-video object-cover" />
                        <div className="p-2 flex items-center justify-between">
                          <p className="text-xs truncate flex-1">{vid.file_name}</p>
                          <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => handleDeleteMedia(vid.id, vid.file_url)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {docs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Documenti ({docs.length})</h3>
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.file_name}</p>
                            {doc.file_size && <p className="text-xs text-muted-foreground">{(doc.file_size / 1024 / 1024).toFixed(1)} MB</p>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => window.open(doc.file_url, "_blank")}><Download className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => handleDeleteMedia(doc.id, doc.file_url)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!filteredMedia || filteredMedia.length === 0) && !mediaLoading && (
                <div className="py-12 text-center">
                  <Image className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nessun file caricato</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ADD WORKER DIALOG */}
      <Dialog open={addWorkerOpen} onOpenChange={setAddWorkerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assegna operaio al cantiere</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ruolo</Label>
              <Select value={workerForm.worker_role} onValueChange={v => setWorkerForm({ ...workerForm, worker_role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="operaio">Operaio</SelectItem>
                  <SelectItem value="capo_cantiere">Capo cantiere</SelectItem>
                  <SelectItem value="elettricista">Elettricista</SelectItem>
                  <SelectItem value="idraulico">Idraulico</SelectItem>
                  <SelectItem value="posatore">Posatore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Input value={workerForm.notes} onChange={e => setWorkerForm({ ...workerForm, notes: e.target.value })} placeholder="Note opzionali" />
            </div>
            <div className="space-y-2">
              <Label>Seleziona operai (multi)</Label>
              <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-2">
                {operaioUsers?.map((u: any) => {
                  const isAlready = workers?.some((w: any) => w.worker_id === u.id || (u.user_id && w.worker_user_id === u.user_id));
                  const isSelected = selectedWorkerIds.includes(u.id);
                  return (
                    <label
                      key={u.id}
                      className={`flex items-center gap-2 w-full p-2 rounded-lg text-sm transition-colors ${isAlready ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'hover:bg-muted cursor-pointer'} ${isSelected ? 'bg-primary/10' : ''}`}
                    >
                      <input
                        type="checkbox"
                        disabled={isAlready}
                        checked={isSelected}
                        onChange={() => setSelectedWorkerIds((s) => s.includes(u.id) ? s.filter(x => x !== u.id) : [...s, u.id])}
                      />
                      <span className="font-medium flex-1">{u.first_name} {u.last_name}</span>
                      {u.role && <Badge variant="outline" className="text-[10px]">{u.role}</Badge>}
                      {isAlready && <span className="text-xs text-muted-foreground">(già)</span>}
                    </label>
                  );
                })}
                {(!operaioUsers || operaioUsers.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nessun operaio trovato. Crealo in "Operai".</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setAddWorkerOpen(false); setSelectedWorkerIds([]); }}>Annulla</Button>
              <Button onClick={() => handleAssignSelected(operaioUsers || [])} disabled={selectedWorkerIds.length === 0}>
                Assegna {selectedWorkerIds.length > 0 && `(${selectedWorkerIds.length})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD MATERIAL DIALOG */}
      <Dialog open={addMaterialOpen} onOpenChange={setAddMaterialOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiungi materiale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome materiale *</Label>
              <Input value={materialForm.material_name} onChange={e => setMaterialForm({ ...materialForm, material_name: e.target.value })} placeholder="Es: Cemento Portland" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Quantità *</Label>
                <Input type="number" value={materialForm.quantity} onChange={e => setMaterialForm({ ...materialForm, quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Unità</Label>
                <Select value={materialForm.unit} onValueChange={v => setMaterialForm({ ...materialForm, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MATERIAL_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Costo unit. (€)</Label>
                <Input type="number" step="0.01" value={materialForm.unit_cost} onChange={e => setMaterialForm({ ...materialForm, unit_cost: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Input value={materialForm.notes} onChange={e => setMaterialForm({ ...materialForm, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddMaterialOpen(false)}>Annulla</Button>
              <Button onClick={handleAddMaterial}>Salva</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD EXPENSE DIALOG */}
      <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiungi spesa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo spesa</Label>
              <Select value={expenseForm.expense_type} onValueChange={v => setExpenseForm({ ...expenseForm, expense_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrizione *</Label>
              <Input value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="Es: Noleggio ponteggio" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Importo (€) *</Label>
                <Input type="number" step="0.01" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={expenseForm.expense_date} onChange={e => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Input value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddExpenseOpen(false)}>Annulla</Button>
              <Button onClick={handleAddExpense}>Salva</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCantiereDetail;
