import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";

interface LeadCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  pendingDownloadUrl?: string;
}

const LEAD_STORAGE_KEY = "kalea_lead_captured";

export const checkLeadCaptured = (): boolean => {
  return localStorage.getItem(LEAD_STORAGE_KEY) === "true";
};

export const setLeadCaptured = (): void => {
  localStorage.setItem(LEAD_STORAGE_KEY, "true");
};

const LeadCaptureDialog = ({ open, onOpenChange, onSuccess, pendingDownloadUrl }: LeadCaptureDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Inserisci un indirizzo email valido");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("leads").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company_name: formData.companyName.trim() || null,
        source: "area_tecnica",
      });

      if (error) {
        console.error("Error saving lead:", error);
        toast.error("Si è verificato un errore. Riprova.");
        return;
      }

      // Mark lead as captured in localStorage
      setLeadCaptured();
      
      toast.success("Grazie! Ora puoi scaricare i documenti.");
      onOpenChange(false);
      onSuccess();

      // Trigger download if there was a pending URL
      if (pendingDownloadUrl) {
        window.open(pendingDownloadUrl, "_blank");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Si è verificato un errore. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Scarica i documenti
          </DialogTitle>
          <DialogDescription>
            Inserisci i tuoi dati per accedere a tutti i documenti tecnici e le certificazioni.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome / Nome Azienda *</Label>
            <Input
              id="name"
              placeholder="Es. Mario Rossi o Rossi SRL"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@esempio.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefono *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+39 123 456 7890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Ragione Sociale (opzionale)</Label>
            <Input
              id="companyName"
              placeholder="Nome azienda"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Invio in corso...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Accedi ai documenti
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            I tuoi dati saranno trattati secondo la nostra{" "}
            <a href="/it/privacy" className="underline hover:text-primary">
              Privacy Policy
            </a>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureDialog;
