import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { trackGenerateLead } from "@/lib/analytics";

// Warm tan ridged background — same identity as ChiSiamoManifesto
const tanBgStyle: React.CSSProperties = {
  backgroundColor: "hsl(34 32% 68%)",
  backgroundImage:
    "repeating-linear-gradient(0deg, rgba(74,42,19,0.10) 0px, rgba(74,42,19,0.10) 1px, transparent 1px, transparent 6px), radial-gradient(circle at 15% 8%, rgba(74,42,19,0.10), transparent 55%), radial-gradient(circle at 85% 92%, rgba(74,42,19,0.08), transparent 55%)",
};

const interestKeys = [
  "biomag",
  "hypermatt",
  "parquet",
  "spc",
  "laminati",
  "ceramicheInterni",
  "externo",
  "kaleaElements",
  "ceramicheEsterni",
  "sopraelevati",
  "partnership",
  "other",
] as const;

const Contatti = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    tipoUtente: "",
    interessi: [] as string[],
    messaggio: "",
    privacy: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.privacy) {
      toast({
        title: t("contacts.errorTitle"),
        description: t("contacts.errorMessage"),
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: formData.nome,
          surname: formData.cognome,
          email: formData.email,
          phone: formData.telefono,
          userType: formData.tipoUtente,
          interests: formData.interessi,
          message: formData.messaggio,
        },
      });
      if (error) throw error;
      trackGenerateLead({
        source: "contact_form",
        method: "email",
        user_type: formData.tipoUtente || undefined,
        interests: formData.interessi,
      });
      toast({
        title: t("contacts.successTitle"),
        description: t("contacts.successMessage"),
      });
      setFormData({
        nome: "",
        cognome: "",
        email: "",
        telefono: "",
        tipoUtente: "",
        interessi: [],
        messaggio: "",
        privacy: false,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'invio del messaggio. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interessi: prev.interessi.includes(interest)
        ? prev.interessi.filter((i) => i !== interest)
        : [...prev.interessi, interest],
    }));
  };

  return (
    <div className="min-h-screen font-heading font-light text-white" style={tanBgStyle}>
      <SEOHead
        title="Contatti — Kalēa® | Architetti, Designer, Imprese"
        description="Architetti, interior designer, geometri, imprese edili, rivenditori e privati: contatta Kalēa® per informazioni, campioni, preventivi e collaborazioni."
        keywords="contatti Kalēa, diventa partner, architetti, interior designer, geometri, imprese edili, privati, preventivo pavimenti"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Kalēa",
          url: "https://kalea.space",
          telephone: "+39 352 035 1738",
          email: "info@kalea.space",
          image: "https://kalea.space/favicon-k-512.png",
          areaServed: ["IT", "EU"],
        }}
      />

      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 md:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(140,123,107,0.10) 0%, rgba(247,241,231,0) 70%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center py-28">
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl md:text-5xl lg:text-6xl font-light leading-tight mb-6"
            style={{ letterSpacing: "0.005em" }}
          >
            {t("contacts.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-base md:text-lg lg:text-xl font-light leading-relaxed max-w-3xl mx-auto italic"
          >
            {t("contacts.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* MAIN */}
      <section className="pb-24 md:pb-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* FORM */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-10 text-[#3a2a1a] font-sans"
          >
            <h2 className="text-2xl md:text-3xl font-heading font-light mb-2 italic">
              {t("contacts.formTitle")}
            </h2>
            <div className="h-px w-16 bg-[#3a2a1a]/30 mb-6" />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">{t("contacts.firstName")} *</Label>
                  <Input
                    id="nome"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Mario"
                    className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a] mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="cognome">{t("contacts.lastName")} *</Label>
                  <Input
                    id="cognome"
                    required
                    value={formData.cognome}
                    onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                    placeholder="Rossi"
                    className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a] mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">{t("contacts.email")} *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="mario.rossi@example.com"
                  className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a] mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="telefono">{t("contacts.phone")}</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+39 123 456 7890"
                  className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a] mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="tipoUtente">{t("contacts.userType")} *</Label>
                <Select
                  value={formData.tipoUtente}
                  onValueChange={(value) => setFormData({ ...formData, tipoUtente: value })}
                >
                  <SelectTrigger className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a] mt-1.5">
                    <SelectValue placeholder={t("contacts.userTypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="architetto">{t("contacts.userTypes.architect")}</SelectItem>
                    <SelectItem value="designer">{t("contacts.userTypes.designer")}</SelectItem>
                    <SelectItem value="geometra">{t("contacts.userTypes.geometra")}</SelectItem>
                    <SelectItem value="impresa">{t("contacts.userTypes.builder")}</SelectItem>
                    <SelectItem value="rivenditore">{t("contacts.userTypes.retailer")}</SelectItem>
                    <SelectItem value="privato">{t("contacts.userTypes.private")}</SelectItem>
                    <SelectItem value="altro">{t("contacts.userTypes.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-3 block">{t("contacts.interests")}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {interestKeys.map((key) => {
                    const label = t(`contacts.interestsList.${key}`);
                    const checked = formData.interessi.includes(label);
                    const id = `interest-${key}`;
                    return (
                      <label
                        key={key}
                        htmlFor={id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                          checked
                            ? "bg-[#3a2a1a]/5 border-[#3a2a1a]/40"
                            : "border-[#3a2a1a]/15 hover:border-[#3a2a1a]/30"
                        }`}
                      >
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={() => handleInterestToggle(label)}
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="messaggio">{t("contacts.message")} *</Label>
                <Textarea
                  id="messaggio"
                  required
                  value={formData.messaggio}
                  onChange={(e) => setFormData({ ...formData, messaggio: e.target.value })}
                  placeholder={t("contacts.messagePlaceholder")}
                  rows={5}
                  className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a] mt-1.5"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  checked={formData.privacy}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, privacy: checked as boolean })
                  }
                />
                <label
                  htmlFor="privacy"
                  className="text-sm text-[#3a2a1a]/70 cursor-pointer leading-relaxed"
                >
                  {t("contacts.privacy")} *
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[#3a2a1a] text-white hover:bg-[#3a2a1a]/90 text-base font-medium"
              >
                {isSubmitting ? "Invio in corso..." : t("contacts.submit")}
              </Button>
            </form>
          </motion.div>

          {/* INFO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-light italic mb-2">
                {t("contacts.infoTitle")}
              </h2>
              <div className="h-px w-16 bg-white/40 mb-6" />
              <p className="text-white/85 leading-relaxed mb-8 font-light">
                {t("contacts.infoText")}
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" strokeWidth={1.4} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{t("contacts.emailLabel")}</h3>
                    <a
                      href="mailto:info@kalea.space"
                      className="text-white/85 hover:text-white transition-colors font-light"
                    >
                      info@kalea.space
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" strokeWidth={1.4} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{t("contacts.phoneLabel")}</h3>
                    <a
                      href="tel:+393520351738"
                      className="text-white/85 hover:text-white transition-colors font-light"
                    >
                      +39 352 035 1738
                    </a>
                    <p className="text-sm text-white/70 mt-1 font-light">
                      {t("contacts.phoneHours")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" strokeWidth={1.4} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">{t("contacts.locationLabel")}</h3>
                    <div className="space-y-3 text-white/85 font-light text-sm">
                      <div>
                        <p className="font-medium text-white">{t("footer.legalHQ")}</p>
                        <p>Via 4 Novembre, 15</p>
                        <p>25078 Vestone (BS) Italy</p>
                      </div>
                      <div>
                        <p className="font-medium text-white">{t("footer.operationalHQ")}</p>
                        <p>Via Generale Bernasconi, 8A</p>
                        <p>25015 Desenzano del Garda (BS)</p>
                      </div>
                      <div className="pt-2 border-t border-white/20">
                        <p>P.IVA: 04797310986</p>
                        <p>REA: BS - 642362</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-xl font-light italic mb-4">{t("contacts.hoursTitle")}</h3>
              <div className="space-y-2 text-white/85 font-light">
                <div className="flex justify-between">
                  <span>{t("contacts.hoursWeekdays")}</span>
                  <span className="font-medium text-white">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("contacts.hoursSaturday")}</span>
                  <span className="font-medium text-white">9:00 - 13:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("contacts.hoursSunday")}</span>
                  <span className="font-medium text-white">{t("contacts.hoursClosed")}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contatti;
