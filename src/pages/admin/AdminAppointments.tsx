import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarClock, Plus, Phone, Video, MapPin, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

const APPOINTMENT_TYPES = [
  { value: "chiamata", label: "Chiamata", icon: Phone },
  { value: "videochiamata", label: "Videochiamata", icon: Video },
  { value: "visita", label: "Visita in loco", icon: MapPin },
];

const APPOINTMENT_STATUSES = [
  { value: "confermato", label: "Confermato", color: "bg-green-100 text-green-700" },
  { value: "completato", label: "Completato", color: "bg-blue-100 text-blue-700" },
  { value: "annullato", label: "Annullato", color: "bg-red-100 text-red-700" },
  { value: "riprogrammato", label: "Riprogrammato", color: "bg-amber-100 text-amber-700" },
];

const AdminAppointments = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    appointment_date: "",
    appointment_time: "10:00",
    duration_minutes: "30",
    appointment_type: "chiamata",
    location: "",
    notes: "",
    lead_id: "",
  });

  const { data: appointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, leads(name, company_name, phone, email)")
        .order("appointment_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: leads } = useQuery({
    queryKey: ["leads-for-appointments"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("id, name, company_name").order("name");
      return data || [];
    },
  });

  const handleCreate = async () => {
    if (!form.title || !form.appointment_date) {
      toast.error("Inserisci titolo e data");
      return;
    }
    const dateTime = `${form.appointment_date}T${form.appointment_time}:00`;
    const { error } = await supabase.from("appointments").insert({
      title: form.title,
      appointment_date: new Date(dateTime).toISOString(),
      duration_minutes: parseInt(form.duration_minutes),
      appointment_type: form.appointment_type,
      location: form.location || null,
      notes: form.notes || null,
      lead_id: form.lead_id || null,
    });
    if (error) {
      toast.error("Errore nella creazione");
    } else {
      toast.success("Appuntamento creato");
      setCreateOpen(false);
      setForm({ title: "", appointment_date: "", appointment_time: "10:00", duration_minutes: "30", appointment_type: "chiamata", location: "", notes: "", lead_id: "" });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("appointments").update({ status }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    toast.success("Stato aggiornato");
  };

  const today = new Date();
  const upcoming = appointments?.filter(a => new Date(a.appointment_date) >= today && a.status === "confermato") || [];
  const past = appointments?.filter(a => new Date(a.appointment_date) < today || a.status !== "confermato") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appuntamenti</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestisci chiamate, videochiamate e visite</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nuovo Appuntamento
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcoming.length}</p>
              <p className="text-xs text-muted-foreground">In programma</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{appointments?.filter(a => a.status === "completato").length || 0}</p>
              <p className="text-xs text-muted-foreground">Completati</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{appointments?.filter(a => a.appointment_type === "chiamata").length || 0}</p>
              <p className="text-xs text-muted-foreground">Chiamate</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{appointments?.filter(a => a.appointment_type === "visita").length || 0}</p>
              <p className="text-xs text-muted-foreground">Visite</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-lg font-semibold mb-3">🟢 Prossimi Appuntamenti</h2>
        <div className="space-y-2">
          {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nessun appuntamento in programma</p>}
          {upcoming.map((apt) => {
            const TypeIcon = APPOINTMENT_TYPES.find(t => t.value === apt.appointment_type)?.icon || Phone;
            return (
              <Card key={apt.id} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{apt.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(apt.appointment_date), "EEEE dd MMM yyyy 'alle' HH:mm", { locale: it })}
                        {apt.leads && ` • ${apt.leads.company_name || apt.leads.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(apt.id, "completato")}>
                      <Check className="w-3.5 h-3.5 mr-1" /> Completato
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(apt.id, "annullato")}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">📋 Storico</h2>
          <div className="space-y-2">
            {past.slice(0, 20).map((apt) => {
              const statusInfo = APPOINTMENT_STATUSES.find(s => s.value === apt.status);
              return (
                <Card key={apt.id} className="bg-white/70">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{apt.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(apt.appointment_date), "dd MMM yyyy HH:mm", { locale: it })}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusInfo?.color || ""}>
                      {statusInfo?.label || apt.status}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Appuntamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titolo *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Es: Chiamata con Arch. Rossi" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input type="date" value={form.appointment_date} onChange={e => setForm({ ...form, appointment_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ora</Label>
                <Input type="time" value={form.appointment_time} onChange={e => setForm({ ...form, appointment_time: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.appointment_type} onValueChange={v => setForm({ ...form, appointment_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durata (min)</Label>
                <Input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lead collegato</Label>
              <Select value={form.lead_id} onValueChange={v => setForm({ ...form, lead_id: v })}>
                <SelectTrigger><SelectValue placeholder="Seleziona lead..." /></SelectTrigger>
                <SelectContent>
                  {leads?.map(l => <SelectItem key={l.id} value={l.id}>{l.company_name || l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Luogo</Label>
              <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Indirizzo o link videochiamata" />
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Button onClick={handleCreate} className="w-full">Crea Appuntamento</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAppointments;
