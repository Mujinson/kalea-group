import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t, language } = useTranslation();
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
      toast.error(t('leadCapture.errorRequired'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t('leadCapture.errorEmail'));
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
        toast.error(t('leadCapture.errorGeneric'));
        return;
      }

      // Mark lead as captured in localStorage
      setLeadCaptured();
      
      toast.success(t('leadCapture.successMessage'));
      onOpenChange(false);
      onSuccess();

      // Trigger download if there was a pending URL
      if (pendingDownloadUrl) {
        window.open(pendingDownloadUrl, "_blank");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(t('leadCapture.errorGeneric'));
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
            {t('leadCapture.title')}
          </DialogTitle>
          <DialogDescription>
            {t('leadCapture.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('leadCapture.nameLabel')} *</Label>
            <Input
              id="name"
              placeholder={t('leadCapture.namePlaceholder')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('leadCapture.emailLabel')} *</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('leadCapture.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('leadCapture.phoneLabel')} *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t('leadCapture.phonePlaceholder')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">{t('leadCapture.companyLabel')}</Label>
            <Input
              id="companyName"
              placeholder={t('leadCapture.companyPlaceholder')}
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('leadCapture.submitting')}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {t('leadCapture.submitButton')}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t('leadCapture.privacyText')}{" "}
            <a href={`/${language}/privacy`} className="underline hover:text-primary">
              {t('leadCapture.privacyLink')}
            </a>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureDialog;