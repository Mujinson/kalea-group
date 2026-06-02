import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  workers: Array<{ id: string; first_name: string; last_name: string; hourly_cost: number }>;
  sites: Array<{ id: string; title: string }>;
  defaultWorkerId?: string;
  onSaved: () => void;
}

export const WorkLogFormDrawer = ({ open, onOpenChange, workers, sites, defaultWorkerId, onSaved }: Props) => {
  const [workerId, setWorkerId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("17:00");
  const [pause, setPause] = useState(60);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setWorkerId(defaultWorkerId || "");
      setSiteId("");
      setDate(new Date().toISOString().slice(0, 10));
      setStart("08:00");
      setEnd("17:00");
      setPause(60);
      setNotes("");
    }
  }, [open, defaultWorkerId]);

  const worker = workers.find((w) => w.id === workerId);

  const { hours, cost } = useMemo(() => {
    if (!start || !end) return { hours: 0, cost: 0 };
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const mins = eh * 60 + em - (sh * 60 + sm) - Number(pause || 0);
    const h = Math.max(0, mins / 60);
    return { hours: h, cost: h * (worker?.hourly_cost || 0) };
  }, [start, end, pause, worker]);

  const save = async () => {
    if (!workerId || !siteId) {
      toast.error("Operaio e cantiere obbligatori");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("site_work_logs" as any).insert({
        worker_id: workerId,
        worker_user_id: workerId, // legacy NOT NULL? was dropped. keep as same id for safety
        site_id: siteId,
        work_date: date,
        start_time: start,
        end_time: end,
        break_minutes: pause,
        hours_worked: Number(hours.toFixed(2)),
        hourly_cost: worker?.hourly_cost || 0,
        notes,
      });
      if (error) throw error;
      toast.success("Ore registrate");
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Errore: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Registra ore</SheetTitle>
          <SheetDescription>Calcolo automatico ore e costo</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Operaio</Label>
            <Select value={workerId} onValueChange={setWorkerId}>
              <SelectTrigger><SelectValue placeholder="Seleziona operaio" /></SelectTrigger>
              <SelectContent>
                {workers.map((w) => <SelectItem key={w.id} value={w.id}>{w.first_name} {w.last_name} · €{w.hourly_cost}/h</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cantiere</Label>
            <Select value={siteId} onValueChange={setSiteId}>
              <SelectTrigger><SelectValue placeholder="Seleziona cantiere" /></SelectTrigger>
              <SelectContent>
                {sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Data</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><Label>Pausa (min)</Label><Input type="number" value={pause} onChange={(e) => setPause(Number(e.target.value))} /></div>
            <div><Label>Inizio</Label><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div><Label>Fine</Label><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4 grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">Ore lavorate:</span> <b>{hours.toFixed(2)}h</b></div>
            <div><span className="text-muted-foreground">Costo:</span> <b>€{cost.toFixed(2)}</b></div>
          </div>
          <div><Label>Note</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
            Registra
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
