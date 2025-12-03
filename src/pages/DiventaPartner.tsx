import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Store,
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
  Home,
  ShoppingBag,
  Hotel,
  Bath,
  Quote,
} from "lucide-react";
import bgHero from "@/assets/bg-products.jpg";
import bgCta from "@/assets/bg-cta-collabora.png";

const DiventaPartner = () => {
  const { language, t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(t('partner.form.success'));
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
    setIsSubmitting(false);
  };

  const whyPartner = [
    {
      icon: Cpu,
      title: t('partner.why.tech.title'),
      description: t('partner.why.tech.description'),
    },
    {
      icon: TrendingUp,
      title: t('partner.why.margins.title'),
      description: t('partner.why.margins.description'),
    },
    {
      icon: Truck,
      title: t('partner.why.supply.title'),
      description: t('partner.why.supply.description'),
    },
    {
      icon: FileText,
      title: t('partner.why.marketing.title'),
      description: t('partner.why.marketing.description'),
    },
  ];

  const idealPartners = [
    { icon: Store, label: t('partner.ideal.reseller') },
    { icon: Building2, label: t('partner.ideal.showroom') },
    { icon: PenTool, label: t('partner.ideal.architect') },
    { icon: HardHat, label: t('partner.ideal.contractor') },
    { icon: Wrench, label: t('partner.ideal.installer') },
  ];

  const benefits = [
    { icon: BadgePercent, label: t('partner.benefits.pricing') },
    { icon: Palette, label: t('partner.benefits.marketing') },
    { icon: GraduationCap, label: t('partner.benefits.training') },
    { icon: HeadphonesIcon, label: t('partner.benefits.sales') },
    { icon: Package, label: t('partner.benefits.samples') },
    { icon: UserCheck, label: t('partner.benefits.support') },
    { icon: Sparkles, label: t('partner.benefits.priority') },
  ];

  const processSteps = [
    { icon: ClipboardList, label: t('partner.process.step1') },
    { icon: CheckCircle2, label: t('partner.process.step2') },
    { icon: Phone, label: t('partner.process.step3') },
    { icon: Send, label: t('partner.process.step4') },
  ];

  const applications = [
    { icon: Home, label: t('partner.applications.residential') },
    { icon: ShoppingBag, label: t('partner.applications.commercial') },
    { icon: Hotel, label: t('partner.applications.hospitality') },
    { icon: Bath, label: t('partner.applications.wet') },
  ];

  const testimonials = [
    {
      name: "Marco Rossi",
      role: t('partner.testimonials.role1'),
      quote: t('partner.testimonials.quote1'),
    },
    {
      name: "Anna Bianchi",
      role: t('partner.testimonials.role2'),
      quote: t('partner.testimonials.quote2'),
    },
    {
      name: "Giovanni Verdi",
      role: t('partner.testimonials.role3'),
      quote: t('partner.testimonials.quote3'),
    },
  ];

  const categories = [
    { value: "reseller", label: t('partner.form.category.reseller') },
    { value: "showroom", label: t('partner.form.category.showroom') },
    { value: "architect", label: t('partner.form.category.architect') },
    { value: "contractor", label: t('partner.form.category.contractor') },
    { value: "installer", label: t('partner.form.category.installer') },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <img
          src={bgHero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 to-foreground/50" />
        
        <div className="relative z-10 container mx-auto px-4 text-center py-32">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6"
            style={{ textShadow: "0px 4px 16px rgba(0,0,0,0.55)" }}
          >
            {t('partner.hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10"
            style={{ textShadow: "0px 4px 16px rgba(0,0,0,0.55)" }}
          >
            {t('partner.hero.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a
              href="#partner-form"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-white text-foreground font-semibold text-lg hover:bg-white/90 hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300"
            >
              {t('partner.hero.cta')}
            </a>
          </motion.div>
        </div>
      </section>

      {/* WHY PARTNER SECTION */}
      <section className="py-24 md:py-32 bg-[#F8F6F3]">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-16"
          >
            {t('partner.why.title')}
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyPartner.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
                whileHover={{
                  y: -6,
                  rotateX: 2,
                  rotateY: -2,
                  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
                }}
                className="kalea-card bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
              >
                <div className="w-14 h-14 rounded-xl bg-foreground/5 flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-foreground" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-foreground/70 text-body">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IDEAL PARTNERS SECTION */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-6"
          >
            {t('partner.ideal.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-foreground/70 text-center max-w-2xl mx-auto mb-16"
          >
            {t('partner.ideal.description')}
          </motion.p>
          
          <div className="flex flex-wrap justify-center gap-6">
            {idealPartners.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 px-6 py-4 bg-foreground/5 rounded-full"
              >
                <item.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                <span className="text-foreground font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-24 md:py-32 bg-[#F8F6F3]">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-16"
          >
            {t('partner.benefits.title')}
          </motion.h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 0.61, 0.36, 1] }}
                whileHover={{
                  y: -6,
                  rotateX: 2,
                  rotateY: -2,
                  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
                }}
                className="kalea-card flex items-center gap-4 p-5 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              >
                <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                </div>
                <span className="text-foreground font-medium text-sm">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-16"
          >
            {t('partner.process.title')}
          </motion.h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-foreground/10" />
              
              {processSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="text-center relative"
                >
                  <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mx-auto mb-4 relative z-10">
                    <step.icon className="w-7 h-7 text-background" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-semibold text-foreground/50 mb-2 block">
                    {index + 1}.
                  </span>
                  <p className="text-foreground font-medium">{step.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section id="partner-form" className="py-24 md:py-32 bg-[#F8F6F3]">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-16"
          >
            {t('partner.form.title')}
          </motion.h2>
          
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_48px_rgba(0,0,0,0.08)]"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('partner.form.companyName')} *
                </label>
                <Input
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="rounded-xl border-foreground/20 focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('partner.form.contactName')} *
                </label>
                <Input
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="rounded-xl border-foreground/20 focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('partner.form.email')} *
                </label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-xl border-foreground/20 focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('partner.form.phone')} *
                </label>
                <Input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-xl border-foreground/20 focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('partner.form.city')} *
                </label>
                <Input
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="rounded-xl border-foreground/20 focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('partner.form.website')}
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="rounded-xl border-foreground/20 focus:border-foreground"
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('partner.form.categoryLabel')} *
                </label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="rounded-xl border-foreground/20 focus:border-foreground">
                    <SelectValue placeholder={t('partner.form.categoryPlaceholder')} />
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('partner.form.volume')}
                </label>
                <Input
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  className="rounded-xl border-foreground/20 focus:border-foreground"
                  placeholder={t('partner.form.volumePlaceholder')}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('partner.form.message')}
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="rounded-xl border-foreground/20 focus:border-foreground min-h-[120px]"
                placeholder={t('partner.form.messagePlaceholder')}
              />
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 py-4 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-lg font-semibold"
            >
              {isSubmitting ? t('partner.form.sending') : t('partner.form.submit')}
            </Button>
          </motion.form>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-16"
          >
            {t('partner.testimonials.title')}
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#F8F6F3] rounded-2xl p-8 relative"
              >
                <Quote className="w-8 h-8 text-foreground/10 absolute top-6 right-6" />
                <p className="text-foreground/80 mb-6 italic">"{item.quote}"</p>
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-foreground/60">{item.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <img
          src={bgCta}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/50" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-bold text-white mb-6"
            style={{ textShadow: "0px 4px 16px rgba(0,0,0,0.55)" }}
          >
            {t('partner.cta.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/90 max-w-xl mx-auto mb-10"
            style={{ textShadow: "0px 4px 16px rgba(0,0,0,0.55)" }}
          >
            {t('partner.cta.description')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <a
              href="#partner-form"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-white text-foreground font-semibold text-lg hover:bg-white/90 hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300"
            >
              {t('partner.cta.button')}
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default DiventaPartner;
