import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Cpu,
  TrendingUp,
  Truck,
  FileText,
  Building2,
  PenTool,
  HardHat,
  Wrench,
  BadgePercent,
  Palette,
  GraduationCap,
  HeadphonesIcon,
  Package,
  UserCheck,
  Sparkles,
  ClipboardList,
  Phone,
  Send,
  CheckCircle2,
  Store,
  User,
  Ruler,
  Quote,
} from "lucide-react";

// Warm tan ridged background — same identity as ChiSiamoManifesto
const tanBgStyle: React.CSSProperties = {
  backgroundColor: "hsl(34 32% 68%)",
  backgroundImage:
    "repeating-linear-gradient(0deg, rgba(74,42,19,0.10) 0px, rgba(74,42,19,0.10) 1px, transparent 1px, transparent 6px), radial-gradient(circle at 15% 8%, rgba(74,42,19,0.10), transparent 55%), radial-gradient(circle at 85% 92%, rgba(74,42,19,0.08), transparent 55%)",
};

const interestKeys = [
  "biomag",
  
  "hypermatt",
  "externo",
  "ceramicheInterni",
  "ceramicheEsterni",
  "kaleabase",
  "edgeline",
  "biowall",
  "kaleaceiling",
  "partnership",
  "other",
] as const;

const DiventaPartner = () => {
  const { language, t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    website: "",
    category: "",
    volume: "",
    message: "",
  });

  const toggleInterest = (key: string) => {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success(t("partner.form.success"));
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      city: "",
      website: "",
      category: "",
      volume: "",
      message: "",
    });
    setInterests([]);
    setIsSubmitting(false);
  };

  const whyPartner = [
    { icon: Cpu, title: t("partner.why.tech.title"), description: t("partner.why.tech.description") },
    { icon: TrendingUp, title: t("partner.why.margins.title"), description: t("partner.why.margins.description") },
    { icon: Truck, title: t("partner.why.supply.title"), description: t("partner.why.supply.description") },
    { icon: FileText, title: t("partner.why.marketing.title"), description: t("partner.why.marketing.description") },
  ];

  const idealPartners = [
    { icon: PenTool, label: t("partner.ideal.architect") },
    { icon: Palette, label: t("partner.ideal.designer") },
    { icon: Ruler, label: t("partner.ideal.geometra") },
    { icon: HardHat, label: t("partner.ideal.contractor") },
    { icon: User, label: t("partner.ideal.private") },
    { icon: Store, label: t("partner.ideal.reseller") },
    { icon: Building2, label: t("partner.ideal.showroom") },
    { icon: Wrench, label: t("partner.ideal.installer") },
  ];

  const benefits = [
    { icon: BadgePercent, label: t("partner.benefits.pricing") },
    { icon: Palette, label: t("partner.benefits.marketing") },
    { icon: GraduationCap, label: t("partner.benefits.training") },
    { icon: HeadphonesIcon, label: t("partner.benefits.sales") },
    { icon: Package, label: t("partner.benefits.samples") },
    { icon: UserCheck, label: t("partner.benefits.support") },
    { icon: Sparkles, label: t("partner.benefits.priority") },
  ];

  const processSteps = [
    { icon: ClipboardList, label: t("partner.process.step1") },
    { icon: CheckCircle2, label: t("partner.process.step2") },
    { icon: Phone, label: t("partner.process.step3") },
    { icon: Send, label: t("partner.process.step4") },
  ];

  const testimonials = [
    { name: "Marco Rossi", role: t("partner.testimonials.role1"), quote: t("partner.testimonials.quote1") },
    { name: "Anna Bianchi", role: t("partner.testimonials.role2"), quote: t("partner.testimonials.quote2") },
    { name: "Giovanni Verdi", role: t("partner.testimonials.role3"), quote: t("partner.testimonials.quote3") },
  ];

  const categories = [
    { value: "architect", label: t("partner.form.category.architect") },
    { value: "designer", label: t("partner.form.category.designer") },
    { value: "geometra", label: t("partner.form.category.geometra") },
    { value: "contractor", label: t("partner.form.category.contractor") },
    { value: "private", label: t("partner.form.category.private") },
    { value: "reseller", label: t("partner.form.category.reseller") },
    { value: "showroom", label: t("partner.form.category.showroom") },
    { value: "installer", label: t("partner.form.category.installer") },
  ];

  return (
    <div className="min-h-screen font-heading font-light text-white" style={tanBgStyle}>
      <SEOHead
        title={
          language === "it"
            ? "Collabora con Kalēa® — Architetti, Designer, Imprese, Privati"
            : language === "en"
            ? "Collaborate with Kalēa® — Architects, Designers, Builders, Private clients"
            : language === "de"
            ? "Mit Kalēa® zusammenarbeiten — Architekten, Designer, Bauunternehmen, Privatkunden"
            : "Collaborer avec Kalēa® — Architectes, Designers, Entreprises, Particuliers"
        }
        description={
          language === "it"
            ? "Architetti, interior designer, geometri, imprese edili, rivenditori e privati: collabora con Kalēa® e accedi al sistema di superfici più evoluto."
            : language === "en"
            ? "Architects, interior designers, surveyors, builders, retailers and private clients: collaborate with Kalēa® and access the most advanced surface system."
            : language === "de"
            ? "Architekten, Innenarchitekten, Vermesser, Bauunternehmen, Händler und Privatkunden: arbeiten Sie mit Kalēa® zusammen."
            : "Architectes, designers, géomètres, entreprises, revendeurs et particuliers : collaborez avec Kalēa®."
        }
        keywords="diventa partner Kalēa, architetti, interior designer, geometri, imprese edili, rivenditori, privati"
      />

      {/* HERO */}
      <section className="relative min-h-[78vh] flex items-center justify-center px-6 md:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(140,123,107,0.10) 0%, rgba(247,241,231,0) 70%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center py-32">
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl md:text-5xl lg:text-6xl font-light leading-tight mb-8"
            style={{ letterSpacing: "0.005em" }}
          >
            {t("partner.hero.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-base md:text-lg lg:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-12 italic"
          >
            {t("partner.hero.subtitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a
              href="#partner-form"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-white/95 text-[#3a2a1a] font-sans font-medium tracking-wide hover:bg-white transition-all duration-300"
            >
              {t("partner.hero.cta")}
            </a>
          </motion.div>
        </div>
      </section>

      {/* WHY PARTNER */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-light text-center mb-16 italic"
          >
            {t("partner.why.title")}
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyPartner.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-8 backdrop-blur-sm bg-white/10 border border-white/15"
              >
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-white" strokeWidth={1.4} />
                </div>
                <h3 className="text-lg font-light mb-3">{item.title}</h3>
                <p className="text-sm text-white/85 font-light leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IDEAL PARTNERS */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-light text-center mb-6 italic"
          >
            {t("partner.ideal.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-white/85 text-center max-w-3xl mx-auto mb-16 font-light leading-relaxed"
          >
            {t("partner.ideal.description")}
          </motion.p>

          <div className="flex flex-wrap justify-center gap-4">
            {idealPartners.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm"
              >
                <item.icon className="w-4 h-4 text-white" strokeWidth={1.4} />
                <span className="text-sm font-light tracking-wide">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-light text-center mb-16 italic"
          >
            {t("partner.benefits.title")}
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {benefits.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex items-center gap-4 p-5 bg-white/10 border border-white/15 rounded-xl backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-white" strokeWidth={1.4} />
                </div>
                <span className="text-sm font-light">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-light text-center mb-16 italic"
          >
            {t("partner.process.title")}
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-white/30" />
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-full bg-white/15 border border-white/30 flex items-center justify-center mx-auto mb-4 relative z-10 backdrop-blur-sm">
                  <step.icon className="w-6 h-6 text-white" strokeWidth={1.4} />
                </div>
                <span className="text-xs font-light text-white/70 mb-2 block tracking-widest">
                  0{index + 1}
                </span>
                <p className="text-sm font-light">{step.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="partner-form" className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-light text-center mb-16 italic"
          >
            {t("partner.form.title")}
          </motion.h2>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 text-[#3a2a1a] font-sans"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("partner.form.companyName")}
                </label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("partner.form.contactName")} *
                </label>
                <Input
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("partner.form.email")} *</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("partner.form.phone")} *</label>
                <Input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("partner.form.city")} *</label>
                <Input
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("partner.form.website")}</label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a]"
                  placeholder="https://"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  {t("partner.form.categoryLabel")} *
                </label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a]">
                    <SelectValue placeholder={t("partner.form.categoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* INTERESTS */}
            <div className="mt-8">
              <label className="block text-sm font-medium mb-1">
                {t("partner.form.interestsLabel")}
              </label>
              <p className="text-xs text-[#3a2a1a]/60 mb-4">
                {t("partner.form.interestsHelper")}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {interestKeys.map((key) => {
                  const id = `interest-${key}`;
                  const checked = interests.includes(key);
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
                        onCheckedChange={() => toggleInterest(key)}
                      />
                      <span className="text-sm">
                        {t(`partner.form.interestsList.${key}`)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-medium mb-2">
                {t("partner.form.message")}
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="rounded-xl border-[#3a2a1a]/20 focus:border-[#3a2a1a] min-h-[120px]"
                placeholder={t("partner.form.messagePlaceholder")}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 py-4 rounded-xl bg-[#3a2a1a] text-white hover:bg-[#3a2a1a]/90 text-base font-medium"
            >
              {isSubmitting ? t("partner.form.sending") : t("partner.form.submit")}
            </Button>
          </motion.form>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-light text-center mb-16 italic"
          >
            {t("partner.testimonials.title")}
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 border border-white/15 rounded-2xl p-8 relative backdrop-blur-sm"
              >
                <Quote className="w-8 h-8 text-white/20 absolute top-6 right-6" />
                <p className="text-white/90 mb-6 italic font-light leading-relaxed text-sm">
                  "{item.quote}"
                </p>
                <div>
                  <p className="font-medium text-white text-sm">{item.name}</p>
                  <p className="text-xs text-white/70 mt-1">{item.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-light mb-6 italic"
          >
            {t("partner.cta.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-white/85 max-w-xl mx-auto mb-10 font-light leading-relaxed"
          >
            {t("partner.cta.description")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <a
              href="#partner-form"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-white/95 text-[#3a2a1a] font-sans font-medium tracking-wide hover:bg-white transition-all duration-300"
            >
              {t("partner.cta.button")}
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default DiventaPartner;
