import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
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
import { ArrowRight, Phone, Mail, MapPin, Building2, Thermometer, Plus } from "lucide-react";
import { CrmPageHeader } from "@/components/admin/CrmShell";
import { toast } from "sonner";
import { fetchAllRows } from "@/lib/fetchAllRows";

const PIPELINE_STAGES = [
  { value: "cold", label: "Cold", color: "bg-blue-50 border-blue-200", badgeColor: "bg-blue-100 text-blue-700", icon: "❄️" },
  { value: "warm", label: "Warm", color: "bg-amber-50 border-amber-200", badgeColor: "bg-amber-100 text-amber-700", icon: "🔥" },
  { value: "hot", label: "Hot", color: "bg-red-50 border-red-200", badgeColor: "bg-red-100 text-red-700", icon: "🔴" },
  { value: "appointment", label: "Appuntamento", color: "bg-green-50 border-green-200", badgeColor: "bg-green-100 text-green-700", icon: "📅" },
];

const AdminPipeline = () => {
  const { role } = useAdminAuth();
  const queryClient = useQueryClient();
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const { data: leads } = useQuery({
    queryKey: ["pipeline-leads"],
    queryFn: async () => {
      return fetchAllRows(
        supabase
          .from("leads")
          .select("*")
          .order("updated_at", { ascending: false })
      );
    },
  });

  const handleDragStart = (leadId: string) => setDraggedLead(leadId);

  const handleDrop = async (stage: string) => {
    if (!draggedLead) return;
    const { error } = await supabase
      .from("leads")
      .update({ pipeline_stage: stage, updated_at: new Date().toISOString() })
      .eq("id", draggedLead);

    if (error) {
      toast.error("Errore nello spostamento");
    } else {
      toast.success(`Lead spostato a ${PIPELINE_STAGES.find(s => s.value === stage)?.label}`);
      queryClient.invalidateQueries({ queryKey: ["pipeline-leads"] });
    }
    setDraggedLead(null);
  };

  const getLeadsByStage = (stage: string) =>
    leads?.filter((l) => (l.pipeline_stage || "cold") === stage) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline Lead</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestisci i lead attraverso le fasi di qualificazione</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Thermometer className="w-4 h-4" /> {leads?.length || 0} lead totali</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = getLeadsByStage(stage.value);
          return (
            <div
              key={stage.value}
              className={`rounded-xl border-2 ${stage.color} p-4 min-h-[400px] transition-colors ${
                draggedLead ? "border-dashed" : ""
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.value)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stage.icon}</span>
                  <h3 className="font-semibold text-sm">{stage.label}</h3>
                </div>
                <Badge variant="outline" className={`${stage.badgeColor} text-xs`}>
                  {stageLeads.length}
                </Badge>
              </div>

              <div className="space-y-2">
                {stageLeads.map((lead) => (
                  <Card
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    onClick={() => setSelectedLead(lead)}
                    className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-white"
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{lead.company_name || lead.name}</p>
                          {lead.company_name && (
                            <p className="text-xs text-muted-foreground">{lead.name}</p>
                          )}
                        </div>
                        {lead.source && (
                          <Badge variant="outline" className="text-[10px] px-1.5">
                            {lead.source.replace("chatbot_", "").replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                        {lead.city && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {lead.city}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="flex items-center gap-0.5">
                            <Phone className="w-3 h-3" /> {lead.phone}
                          </span>
                        )}
                      </div>
                      {lead.project_type && (
                        <Badge variant="secondary" className="text-[10px]">
                          {lead.project_type}
                        </Badge>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(lead.created_at), "dd MMM yyyy", { locale: it })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead detail dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedLead?.company_name || selectedLead?.name}</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedLead.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Telefono</Label>
                  <p className="font-medium">{selectedLead.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Città</Label>
                  <p className="font-medium">{selectedLead.city || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo Progetto</Label>
                  <p className="font-medium">{selectedLead.project_type || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Metratura</Label>
                  <p className="font-medium">{selectedLead.project_sqm || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Budget</Label>
                  <p className="font-medium">{selectedLead.budget_range || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fonte</Label>
                  <p className="font-medium">{selectedLead.source || "-"}</p>
                </div>
              </div>
              {selectedLead.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Note</Label>
                  <p className="text-sm bg-muted/50 p-2 rounded-lg">{selectedLead.notes}</p>
                </div>
              )}
              <div className="flex gap-2">
                {PIPELINE_STAGES.map((stage) => (
                  <Button
                    key={stage.value}
                    size="sm"
                    variant={selectedLead.pipeline_stage === stage.value ? "default" : "outline"}
                    onClick={async () => {
                      await supabase.from("leads").update({ pipeline_stage: stage.value }).eq("id", selectedLead.id);
                      queryClient.invalidateQueries({ queryKey: ["pipeline-leads"] });
                      setSelectedLead({ ...selectedLead, pipeline_stage: stage.value });
                      toast.success(`Spostato a ${stage.label}`);
                    }}
                    className="text-xs"
                  >
                    {stage.icon} {stage.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPipeline;
