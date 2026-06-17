import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const TYPES = [
  { v: "materiale_mancante", l: "Materiale mancante" },
  { v: "problema_tecnico", l: "Problema tecnico" },
  { v: "ritardo", l: "Ritardo" },
  { v: "cliente_assente", l: "Cliente assente" },
  { v: "altro", l: "Altro" },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  siteId: string;
  user: any;
  onCreated?: () => void;
}

const SiteIssueSheet = ({ open, onOpenChange, siteId, user, onCreated }: Props) => {
  const [type, setType] = useState("materiale_mancante");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!file) { toast.error("Foto obbligatoria"); return; }
    if (!user?.id) return;
    setBusy(true);
    try {
      const path = `${siteId}/issue-${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
      const { error: upErr } = await supabase.storage.from("site-media").upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("site-media").getPublicUrl(path);
      const reporterName = (user.user_metadata?.full_name as string) || (user.email || "").split("@")[0];
      const { error } = await supabase.from("site_issues" as any).insert({
        site_id: siteId,
        reported_by: user.id,
        reporter_name: reporterName,
        issue_type: type,
        description: description || null,
        photo_url: pub.publicUrl,
      });
      if (error) throw error;
      toast.success("Segnalazione inviata");
      setType("materiale_mancante"); setDescription(""); setFile(null);
      onOpenChange(false);
      onCreated?.();
    } catch (err: any) {
      toast.error(err.message || "Errore invio");
    } finally { setBusy(false); }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-600" /> Segnala problema</SheetTitle></SheetHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-1">
            <Label className="text-xs">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Descrizione</Label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cosa è successo?" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Foto * (obbligatoria)</Label>
            <label className="flex items-center justify-center gap-2 h-24 border-2 border-dashed border-[#1E1B4B]/30 rounded-xl bg-white cursor-pointer text-[#1E1B4B]">
              <Camera className="w-5 h-5" />
              <span className="text-sm font-medium">{file ? file.name : "Scatta o carica foto"}</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <Button onClick={submit} disabled={busy || !file} className="w-full h-12">
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : "Invia segnalazione"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SiteIssueSheet;
