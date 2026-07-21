import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarClock, Plus, Phone, Video, MapPin, Check, X, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { fetchAllRows } from "@/lib/fetchAllRows";
import { CrmPageHeader, CrmKpiTile, CrmKpiRow } from "@/components/admin/CrmShell";

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

const COLORS = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#ec4899", "#06b6d4"];

const AdminAppointments = () => {
  const queryClient = useQueryClient();
  const { role, salespersonId } = useAdminAuth();
  const isAdmin = role === "admin";
  const [createOpen, setCreateOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPerson, setSelectedPerson] = useState<string>("all");
  const [form, setForm] = useState({
    title: "", appointment_date: "", appointment_time: "10:00",
    duration_minutes: "30", appointment_type: "chiamata",
    location: "", notes: "", lead_id: "", assigned_to: "",
  });

  const { data: appointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, leads(name, company_name, phone, email), salespeople:assigned_to(id, first_name, last_name)")
        .order("appointment_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: leads } = useQuery({
    queryKey: ["leads-for-appointments"],
    queryFn: async () => {
      return fetchAllRows(supabase.from("leads").select("id, name, company_name").order("name"));
    },
  });

  const { data: salespeople } = useQuery({
    queryKey: ["salespeople-list"],
    queryFn: async () => {
      const { data } = await supabase.from("salespeople").select("id, first_name, last_name").eq("is_active", true).order("first_name");
      return data || [];
    },
  });

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    if (selectedPerson === "all") return appointments;
    if (selectedPerson === "unassigned") return appointments.filter((a) => !a.assigned_to);
    return appointments.filter((a) => a.assigned_to === selectedPerson);
  }, [appointments, selectedPerson]);

  // Calendar data
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const getAppointmentsForDay = (day: Date) =>
    filteredAppointments.filter((a) => isSameDay(new Date(a.appointment_date), day));

  const getPersonColor = (personId: string | null) => {
    if (!personId || !salespeople) return "#94a3b8";
    const idx = salespeople.findIndex((s) => s.id === personId);
    return COLORS[idx % COLORS.length];
  };

  const handleCreate = async () => {
    if (!form.title || !form.appointment_date) {
      toast.error("Inserisci titolo e data"); return;
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
      assigned_to: form.assigned_to || null,
    });
    if (error) { toast.error("Errore nella creazione"); }
    else {
      toast.success("Appuntamento creato");
      setCreateOpen(false);
      setForm({ title: "", appointment_date: "", appointment_time: "10:00", duration_minutes: "30", appointment_type: "chiamata", location: "", notes: "", lead_id: "", assigned_to: "" });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("appointments").update({ status }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    toast.success("Stato aggiornato");
  };

  const today = new Date();
  const upcoming = filteredAppointments.filter((a) => new Date(a.appointment_date) >= today && a.status === "confermato");

  return (
    <div className="space-y-4">
      <CrmPageHeader
        breadcrumb={["CRM", "Appuntamenti"]}
        title="Appuntamenti"
        subtitle="Chiamate, videochiamate e visite"
        actions={
          <Button onClick={() => setCreateOpen(true)} size="sm" className="bg-crm-primary hover:bg-crm-primary-600 text-white shadow-crm-sm">
            <Plus className="w-4 h-4 mr-2" /> Nuovo Appuntamento
          </Button>
        }
      />

      {/* Person filter - only for admins */}
      {isAdmin && salespeople && salespeople.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Users className="w-4 h-4 text-muted-foreground" />
          <Button size="sm" variant={selectedPerson === "all" ? "default" : "outline"} className="rounded-xl text-xs h-8" onClick={() => setSelectedPerson("all")}>
            Tutti
          </Button>
          {salespeople.map((sp, i) => (
            <Button
              key={sp.id}
              size="sm"
              variant={selectedPerson === sp.id ? "default" : "outline"}
              className="rounded-xl text-xs h-8"
              onClick={() => setSelectedPerson(sp.id)}
            >
              <span className="w-2 h-2 rounded-full mr-1.5" style={{ background: COLORS[i % COLORS.length] }} />
              {sp.first_name} {sp.last_name}
            </Button>
          ))}
        </div>
      )}

      <CrmKpiRow>
        <CrmKpiTile label="In programma" value={upcoming.length} color="green" icon={<CalendarClock className="w-4 h-4" />} />
        <CrmKpiTile label="Completati" value={filteredAppointments.filter((a) => a.status === "completato").length} color="blue" icon={<Check className="w-4 h-4" />} />
        <CrmKpiTile label="Chiamate" value={filteredAppointments.filter((a) => a.appointment_type === "chiamata").length} color="amber" icon={<Phone className="w-4 h-4" />} />
        <CrmKpiTile label="Visite" value={filteredAppointments.filter((a) => a.appointment_type === "visita").length} color="purple" icon={<MapPin className="w-4 h-4" />} />
      </CrmKpiRow>


      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="google">Google Calendar</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>


        <TabsContent value="calendar">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: it })}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Calendar grid */}
          <Card className="bg-white overflow-hidden">
            <div className="grid grid-cols-7">
              {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
                <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground border-b">
                  {d}
                </div>
              ))}
              {calendarDays.map((day) => {
                const dayAppts = getAppointmentsForDay(day);
                const inMonth = isSameMonth(day, currentMonth);
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[90px] p-1 border-b border-r ${!inMonth ? "bg-muted/30" : ""} ${isToday(day) ? "bg-primary/5" : ""}`}
                  >
                    <p className={`text-xs text-right pr-1 mb-1 ${!inMonth ? "text-muted-foreground/40" : isToday(day) ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      {format(day, "d")}
                    </p>
                    <div className="space-y-0.5">
                      {dayAppts.slice(0, 3).map((apt) => {
                        const color = getPersonColor(apt.assigned_to);
                        return (
                          <div
                            key={apt.id}
                            className="text-[10px] px-1.5 py-0.5 rounded truncate text-white cursor-default"
                            style={{ backgroundColor: color }}
                            title={`${apt.title} - ${format(new Date(apt.appointment_date), "HH:mm")}`}
                          >
                            {format(new Date(apt.appointment_date), "HH:mm")} {apt.title}
                          </div>
                        );
                      })}
                      {dayAppts.length > 3 && (
                        <p className="text-[10px] text-muted-foreground px-1">+{dayAppts.length - 3} altri</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="google">
          <Card className="bg-white overflow-hidden">
            <div className="p-3 border-b bg-amber-50 text-xs text-amber-900">
              💡 Se non vedi gli eventi: apri Google Calendar → Impostazioni del calendario Kalēa → <b>"Rendi disponibile pubblicamente"</b> (o condividi il calendario con il tuo account). L'embed mostra solo eventi visibili pubblicamente.
            </div>
            <div className="w-full" style={{ aspectRatio: "4 / 3", minHeight: 600 }}>
              <iframe
                src="https://calendar.google.com/calendar/embed?src=135b1a2f990dd0c5081b9ac59698f6c310f5d5bf93ac607c75d13922ba84eac6%40group.calendar.google.com&ctz=Europe%2FRome"
                className="w-full h-full border-0"
                title="Google Calendar Kalēa"
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="list">

          {/* Upcoming */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">🟢 Prossimi Appuntamenti</h2>
            <div className="space-y-2">
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nessun appuntamento in programma</p>}
              {upcoming.map((apt) => {
                const TypeIcon = APPOINTMENT_TYPES.find((t) => t.value === apt.appointment_type)?.icon || Phone;
                const sp = (apt as any).salespeople;
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
                            {apt.leads && ` • ${(apt.leads as any).company_name || (apt.leads as any).name}`}
                          </p>
                          {sp && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              👤 {(sp as any).first_name} {(sp as any).last_name}
                            </p>
                          )}
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

            {/* Past */}
            {filteredAppointments.filter((a) => new Date(a.appointment_date) < today || a.status !== "confermato").length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">📋 Storico</h2>
                <div className="space-y-2">
                  {filteredAppointments
                    .filter((a) => new Date(a.appointment_date) < today || a.status !== "confermato")
                    .slice(0, 20)
                    .map((apt) => {
                      const statusInfo = APPOINTMENT_STATUSES.find((s) => s.value === apt.status);
                      const sp = (apt as any).salespeople;
                      return (
                        <Card key={apt.id} className="bg-white/70">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{apt.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(apt.appointment_date), "dd MMM yyyy HH:mm", { locale: it })}
                                {sp && ` • ${(sp as any).first_name} ${(sp as any).last_name}`}
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Appuntamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titolo *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Es: Chiamata con Arch. Rossi" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ora</Label>
                <Input type="time" value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.appointment_type} onValueChange={(v) => setForm({ ...form, appointment_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durata (min)</Label>
                <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
              </div>
            </div>
            {isAdmin && salespeople && (
              <div className="space-y-2">
                <Label>Assegna a</Label>
                <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleziona persona..." /></SelectTrigger>
                  <SelectContent>
                    {salespeople.map((sp) => (
                      <SelectItem key={sp.id} value={sp.id}>{sp.first_name} {sp.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Lead collegato</Label>
              <Select value={form.lead_id} onValueChange={(v) => setForm({ ...form, lead_id: v })}>
                <SelectTrigger><SelectValue placeholder="Seleziona lead..." /></SelectTrigger>
                <SelectContent>
                  {leads?.map((l) => <SelectItem key={l.id} value={l.id}>{l.company_name || l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Luogo</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Indirizzo o link videochiamata" />
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Button onClick={handleCreate} className="w-full">Crea Appuntamento</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAppointments;
