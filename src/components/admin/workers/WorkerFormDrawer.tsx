import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export interface Worker {
  id?: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  fiscal_code?: string | null;
  role?: string | null;
  hourly_cost: number;
  hire_date?: string | null;
  status: string;
  photo_url?: string | null;
  notes?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  worker?: Worker | null;
  onSaved: () => void;
}

const empty: Worker = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  fiscal_code: "",
  role: "",
  hourly_cost: 25,
  hire_date: new Date().toISOString().slice(0, 10),
  status: "attivo",
  photo_url: "",
  notes: "",
};

export const WorkerFormDrawer = ({ open, onOpenChange, worker, onSaved }: Props) => {
  const [form, setForm] = useState<Worker>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setForm(worker ? { ...empty, ...worker } : empty);
  }, [open, worker]);

  const set = <K extends keyof Worker>(k: K, v: Worker[K]) => setForm((s) => ({ ...s, [k]: v }));

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `photos/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("worker-files").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = await supabase.storage.from("worker-files").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      set("photo_url", data?.signedUrl || path);
    } catch (e: any) {
      toast.error("Upload foto fallito: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.first_name || !form.last_name) {
      toast.error("Nome e cognome obbligatori");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, hourly_cost: Number(form.hourly_cost) || 0 };
      if (worker?.id) {
        const { error } = await supabase.from("workers" as any).update(payload).eq("id", worker.id);
        if (error) throw error;
        toast.success("Operaio aggiornato");
      } else {
        const { error } = await supabase.from("workers" as any).insert(payload);
        if (error) throw error;
        toast.success("Operaio creato");
      }
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
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{worker?.id ? "Modifica operaio" : "Nuovo operaio"}</SheetTitle>
          <SheetDescription>Anagrafica completa</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={form.photo_url || undefined} />
              <AvatarFallback>{(form.first_name[0] || "?") + (form.last_name[0] || "")}</AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Upload className="w-3 h-3 mr-2" />}
                Carica foto
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome *</Label><Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} /></div>
            <div><Label>Cognome *</Label><Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} /></div>
            <div><Label>Telefono</Label><Input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} /></div>
            <div className="col-span-2"><Label>Codice fiscale</Label><Input value={form.fiscal_code || ""} onChange={(e) => set("fiscal_code", e.target.value.toUpperCase())} /></div>
            <div><Label>Mansione</Label><Input placeholder="es. Posatore" value={form.role || ""} onChange={(e) => set("role", e.target.value)} /></div>
            <div><Label>Costo orario (€)</Label><Input type="number" step="0.5" value={form.hourly_cost} onChange={(e) => set("hourly_cost", Number(e.target.value))} /></div>
            <div><Label>Data assunzione</Label><Input type="date" value={form.hire_date || ""} onChange={(e) => set("hire_date", e.target.value)} /></div>
            <div>
              <Label>Stato</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="attivo">Attivo</SelectItem>
                  <SelectItem value="ferie">In ferie</SelectItem>
                  <SelectItem value="sospeso">Sospeso</SelectItem>
                  <SelectItem value="non_attivo">Non attivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Note</Label><Textarea rows={3} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} /></div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
            Salva
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
