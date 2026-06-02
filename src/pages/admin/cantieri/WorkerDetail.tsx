import { useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Pencil, Clock, HardHat, Euro, FileText, Upload, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { WorkerFormDrawer, type Worker } from "@/components/admin/workers/WorkerFormDrawer";

const statusLabel: Record<string, string> = {
  attivo: "Attivo", ferie: "In ferie", sospeso: "Sospeso", non_attivo: "Non attivo",
};

const WorkerDetail = () => {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("contratto");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: worker } = useQuery({
    queryKey: ["worker", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("workers" as any).select("*").eq("id", id).single();
      if (error) throw error;
      return data as any;
    },
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["worker-logs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_work_logs").select("*, construction_sites(title)")
        .eq("worker_id", id).order("work_date", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["worker-assignments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_workers").select("*, construction_sites(title, status, city)")
        .eq("worker_id", id);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: docs = [] } = useQuery({
    queryKey: ["worker-docs", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("worker_documents" as any).select("*").eq("worker_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const totalHours = useMemo(() => logs.reduce((s, l) => s + Number(l.hours_worked || 0), 0), [logs]);
  const totalCost = useMemo(() => logs.reduce((s, l) => s + Number(l.hours_worked || 0) * Number(l.hourly_cost || worker?.hourly_cost || 0), 0), [logs, worker]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["worker", id] });
    qc.invalidateQueries({ queryKey: ["worker-docs", id] });
  };

  const uploadDoc = async (file: File) => {
    if (!docTitle) return toast.error("Inserisci titolo documento");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `documents/${id}/${crypto.randomUUID()}.${ext}`;
      const { error: ue } = await supabase.storage.from("worker-files").upload(path, file);
      if (ue) throw ue;
      const { data: signed } = await supabase.storage.from("worker-files").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      const { error } = await supabase.from("worker_documents" as any).insert({
        worker_id: id, title: docTitle, document_type: docType, file_url: signed?.signedUrl || path,
      });
      if (error) throw error;
      toast.success("Documento caricato");
      setDocTitle("");
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteDoc = async (docId: string) => {
    const { error } = await supabase.from("worker_documents" as any).delete().eq("id", docId);
    if (error) return toast.error(error.message);
    toast.success("Documento eliminato");
    refresh();
  };

  if (!worker) return <div className="p-8 text-sm text-muted-foreground">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <Link to="/admin/cantieri-operai" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Tutti gli operai
      </Link>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <Avatar className="w-20 h-20">
              <AvatarImage src={worker.photo_url || undefined} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">{worker.first_name?.[0]}{worker.last_name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{worker.first_name} {worker.last_name}</h1>
              <p className="text-sm text-muted-foreground">{worker.role || "Operaio"} · €{worker.hourly_cost}/h</p>
              <Badge className="mt-2" variant="outline">{statusLabel[worker.status] || worker.status}</Badge>
            </div>
            <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="w-4 h-4 mr-2" />Modifica</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <Stat icon={Clock} label="Ore totali" value={`${totalHours.toFixed(1)}h`} />
            <Stat icon={Euro} label="Costo generato" value={`€${totalCost.toLocaleString("it-IT", { maximumFractionDigits: 0 })}`} />
            <Stat icon={HardHat} label="Cantieri assegnati" value={assignments.length} />
            <Stat icon={FileText} label="Documenti" value={docs.length} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="bg-white border h-10">
          <TabsTrigger value="info">Anagrafica</TabsTrigger>
          <TabsTrigger value="hours">Ore</TabsTrigger>
          <TabsTrigger value="sites">Cantieri</TabsTrigger>
          <TabsTrigger value="docs">Documenti</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="bg-white"><CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <Row label="Email" value={worker.email} />
            <Row label="Telefono" value={worker.phone} />
            <Row label="Codice fiscale" value={worker.fiscal_code} />
            <Row label="Mansione" value={worker.role} />
            <Row label="Data assunzione" value={worker.hire_date ? format(new Date(worker.hire_date), "dd MMMM yyyy", { locale: it }) : "—"} />
            <Row label="Costo orario" value={`€${worker.hourly_cost}`} />
            <Row label="Note" value={worker.notes} full />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card className="bg-white"><CardContent className="p-4">
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="text-left">
                    <th className="p-3 text-xs font-semibold">Data</th>
                    <th className="p-3 text-xs font-semibold">Cantiere</th>
                    <th className="p-3 text-xs font-semibold">Orario</th>
                    <th className="p-3 text-xs font-semibold text-right">Ore</th>
                    <th className="p-3 text-xs font-semibold text-right">Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="p-3 text-xs">{format(new Date(l.work_date), "dd/MM/yy")}</td>
                      <td className="p-3 text-xs">{l.construction_sites?.title || "—"}</td>
                      <td className="p-3 text-xs">{l.start_time}–{l.end_time}</td>
                      <td className="p-3 text-xs text-right font-semibold">{Number(l.hours_worked || 0).toFixed(2)}h</td>
                      <td className="p-3 text-xs text-right">€{(Number(l.hours_worked || 0) * Number(l.hourly_cost || worker.hourly_cost || 0)).toFixed(0)}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-xs text-muted-foreground">Nessuna ora registrata</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="sites">
          <Card className="bg-white"><CardContent className="p-4 space-y-2">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{a.construction_sites?.title}</p>
                  <p className="text-xs text-muted-foreground">{a.construction_sites?.city} · {a.worker_role}</p>
                </div>
                <Badge variant={a.is_active ? "default" : "outline"}>{a.is_active ? "Attivo" : "Cessato"}</Badge>
              </div>
            ))}
            {assignments.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Nessun cantiere assegnato</p>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card className="bg-white"><CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2 items-end p-3 rounded-lg bg-muted/30">
              <div><Label className="text-xs">Titolo documento</Label><Input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="es. Contratto 2025" /></div>
              <div><Label className="text-xs">Tipo</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contratto">Contratto</SelectItem>
                    <SelectItem value="patente">Patente</SelectItem>
                    <SelectItem value="certificazione">Certificazione</SelectItem>
                    <SelectItem value="altro">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadDoc(e.target.files[0])} />
                <Button onClick={() => fileRef.current?.click()} disabled={uploading || !docTitle}>
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Carica
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{d.document_type} · {format(new Date(d.created_at), "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {d.file_url && <Button variant="ghost" size="sm" asChild><a href={d.file_url} target="_blank" rel="noreferrer">Apri</a></Button>}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteDoc(d.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                  </div>
                </div>
              ))}
              {docs.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Nessun documento</p>}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <WorkerFormDrawer open={editOpen} onOpenChange={setEditOpen} worker={worker as Worker} onSaved={refresh} />
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
    <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-base font-semibold">{value}</p></div>
  </div>
);

const Row = ({ label, value, full }: { label: string; value?: string | null; full?: boolean }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-sm mt-0.5">{value || "—"}</p>
  </div>
);

export default WorkerDetail;
