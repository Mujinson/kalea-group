import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarPlus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import AssignmentDialog from "@/components/admin/planner/AssignmentDialog";

interface Props {
  site: { id: string; title?: string | null; project_name?: string | null; city?: string | null; planned_start_date?: string | null; planned_end_date?: string | null };
}

/** Assegnazione posatori (squadre) al cantiere con date: appare nel Planner e nel Calendario. */
export default function SiteCrewPanel({ site }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const db = supabase as any;

  const { data: crews = [] } = useQuery({
    queryKey: ["crews-active"],
    queryFn: async () => (await db.from("crews").select("*").eq("active", true).order("name")).data || [],
  });
  const { data: assignments = [] } = useQuery({
    queryKey: ["site-crew-assignments", site.id],
    queryFn: async () =>
      (await db.from("crew_assignments").select("*, crews(name, color)").eq("site_id", site.id).order("start_date")).data || [],
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["site-crew-assignments", site.id] });
    qc.invalidateQueries({ queryKey: ["calendar-crew-assignments"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Rimuovere questa assegnazione?")) return;
    const { error } = await db.from("crew_assignments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Assegnazione rimossa");
    refresh();
  };

  const start = site.planned_start_date || undefined;
  const initial = useMemo(
    () => ({ site_id: site.id, start_date: start, end_date: site.planned_end_date || start }),
    [site.id, start, site.planned_end_date],
  );
  const siteList = useMemo(() => [{ id: site.id, name: site.project_name || site.title, city: site.city }], [site.id, site.project_name, site.title, site.city]);
  const fmt = (d: string) => format(new Date(d + "T00:00:00"), "dd MMM yyyy", { locale: it });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Posatori assegnati</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}><CalendarPlus className="w-4 h-4 mr-1" /> Assegna posatori</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {assignments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nessuna squadra assegnata.{start ? ` Inizio previsto: ${fmt(start)}.` : ""}
          </p>
        )}
        {assignments.map((a: any) => (
          <div key={a.id} className="flex items-center justify-between border rounded-md px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: a.crews?.color || "hsl(var(--primary))" }} />
              <span className="font-medium">{a.crews?.name || "Squadra"}</span>
              <span className="text-muted-foreground">
                {fmt(a.start_date)}{a.end_date && a.end_date !== a.start_date ? ` → ${fmt(a.end_date)}` : ""} · {a.hours_per_day}h/g
              </span>
            </div>
            <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
      </CardContent>
      <AssignmentDialog
        open={open}
        onOpenChange={setOpen}
        crews={crews}
        sites={siteList}
        initial={initial}
        onSaved={refresh}
      />
    </Card>
  );
}
