import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link2, Loader2 } from "lucide-react";

interface Props {
  workers: Array<{ id: string; first_name: string; last_name: string; role?: string | null }>;
  sites: Array<{ id: string; title: string }>;
  assignments: Array<{ worker_id: string | null; site_id: string }>;
  onChange: () => void;
}

export const AssignmentBoard = ({ workers, sites, assignments, onChange }: Props) => {
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [targetSite, setTargetSite] = useState("");
  const [busy, setBusy] = useState(false);

  const assignedByWorker = useMemo(() => {
    const map = new Map<string, string[]>();
    assignments.forEach((a) => {
      if (!a.worker_id) return;
      const arr = map.get(a.worker_id) || [];
      arr.push(a.site_id);
      map.set(a.worker_id, arr);
    });
    return map;
  }, [assignments]);

  const toggle = (id: string) =>
    setSelectedWorkers((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const assign = async () => {
    if (!targetSite || selectedWorkers.length === 0) {
      toast.error("Seleziona operai e cantiere");
      return;
    }
    setBusy(true);
    try {
      const rows = selectedWorkers.map((wid) => ({ worker_id: wid, site_id: targetSite, worker_role: "operaio", is_active: true, worker_user_id: wid }));
      const { error } = await supabase.from("site_workers" as any).insert(rows);
      if (error) throw error;
      toast.success(`${selectedWorkers.length} operai assegnati`);
      setSelectedWorkers([]);
      onChange();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2"><Link2 className="w-4 h-4" /> Assegnazione operai → cantieri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select value={targetSite} onValueChange={setTargetSite}>
            <SelectTrigger className="w-72"><SelectValue placeholder="Seleziona cantiere" /></SelectTrigger>
            <SelectContent>
              {sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={assign} disabled={busy || !selectedWorkers.length || !targetSite}>
            {busy && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
            Assegna {selectedWorkers.length > 0 && `(${selectedWorkers.length})`}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {workers.map((w) => {
            const sitesIds = assignedByWorker.get(w.id) || [];
            const checked = selectedWorkers.includes(w.id);
            return (
              <label key={w.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${checked ? "bg-primary/5 border-primary/30" : "hover:bg-muted/30"}`}>
                <Checkbox checked={checked} onCheckedChange={() => toggle(w.id)} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{w.first_name} {w.last_name}</div>
                  <div className="text-xs text-muted-foreground">{w.role || "—"}</div>
                </div>
                <div className="flex flex-wrap gap-1 max-w-[50%] justify-end">
                  {sitesIds.slice(0, 3).map((sid) => {
                    const s = sites.find((x) => x.id === sid);
                    return <Badge key={sid} variant="secondary" className="text-[10px]">{s?.title?.slice(0, 12) || "?"}</Badge>;
                  })}
                  {sitesIds.length > 3 && <Badge variant="outline" className="text-[10px]">+{sitesIds.length - 3}</Badge>}
                </div>
              </label>
            );
          })}
          {workers.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center col-span-2">Nessun operaio</p>}
        </div>
      </CardContent>
    </Card>
  );
};
