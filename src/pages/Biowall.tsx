import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { Zap, Shield, Palette, Droplets, Flame, Clock, Grid3x3, Layers, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/biowall/hero.webp";
import bgOneWall from "@/assets/bg-onewall.jpg";
import bgOneWallApplications from "@/assets/bg-onewall-applications.jpg";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";
import TechSpecBar from "@/components/TechSpecBar";
import { biowallCollections } from "@/data/biowallCollections";

const Biowall = () => {
  const { t, language } = useTranslation();
  
  const advantages = [
    {
      icon: Zap,
      title: t('onewall.advantages.fast.title'),
      description: t('onewall.advantages.fast.description'),
    },
    {
      icon: Shield,
      title: t('onewall.advantages.resistance.title'),
      description: t('onewall.advantages.resistance.description'),
    },
    {
      icon: Droplets,
      title: t('onewall.advantages.waterproof.title'),
      description: t('onewall.advantages.waterproof.description'),
    },
    {
      icon: Flame,
      title: t('onewall.advantages.fireproof.title'),
      description: t('onewall.advantages.fireproof.description'),
    },
    {
      icon: Palette,
      title: t('onewall.advantages.aesthetic.title'),
      description: t('onewall.advantages.aesthetic.description'),
    },
    {
      icon: Clock,
      title: t('onewall.advantages.maintenance.title'),
      description: t('onewall.advantages.maintenance.description'),
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: t('onewall.howItWorks.step1.title'),
      description: t('onewall.howItWorks.step1.description'),
    },
    {
      step: "2",
      title: t('onewall.howItWorks.step2.title'),
      description: t('onewall.howItWorks.step2.description'),
    },
    {
      step: "3",
      title: t('onewall.howItWorks.step3.title'),
      description: t('onewall.howItWorks.step3.description'),
    },
  ];


  return (
    <div>
      <SEOHead
        title={language === 'it' ? "BIOWALL® — Pannelli a Parete in MgO per Interni | Kalēa®" :
               language === 'en' ? "BIOWALL® — MgO Wall Panels for Interiors | Kalēa®" :
               language === 'de' ? "BIOWALL® — MgO-Wandpaneele für Innenräume | Kalēa®" :
               "BIOWALL® — Panneaux Muraux en MgO pour Intérieurs | Kalēa®"}
        description={language === 'it' ? "BIOWALL® di Kalēa®: pannelli a parete in MgO, resistenti al fuoco e all'umidità. Installazione rapida, design contemporaneo per ambienti interni." :
                     language === 'en' ? "BIOWALL® by Kalēa®: MgO wall panels, fire and moisture resistant. Quick installation, contemporary design." :
                     language === 'de' ? "BIOWALL® von Kalēa®: MgO-Wandpaneele, feuer- und feuchtigkeitsbeständig. Schnelle Installation." :
                     "BIOWALL® par Kalēa® : panneaux muraux en MgO, résistants au feu et à l'humidité. Installation rapide."}
        keywords="pannelli parete MgO, rivestimento parete minerale, pannelli murali ignifughi, rivestimento parete impermeabile, BIOWALL, parete decorativa"
      />
      {/* Hero */}
      <HeroSection
        title={t('hero.onewall.title')}
        subtitle={t('hero.onewall.subtitle')}
        ctaPrimary={{ text: t('hero.onewall.ctaPrimary'), link: `/${language}/contatti` }}
        ctaSecondary={{ text: t('hero.onewall.ctaSecondary'), link: `/${language}/area-tecnica` }}
        backgroundImage={heroImage}
      />

      {/* Come funziona */}
      <section className="relative z-[1] section-spacing bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t('onewall.howItWorksTitle')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('onewall.howItWorksSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-heading font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collezioni Tech Wall */}
      <section className="relative z-[2] section-spacing bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Le collezioni a parete
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Selezione esclusiva <span className="whitespace-nowrap">Kalēa®</span> di decorativi Tech Wall.
              Tre spessori (TW1 · TW2 · TW3) declinati in cinque famiglie estetiche.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {biowallCollections.map((c, i) => (
              <Link key={c.slug} to={`/${language}/biowall/${c.slug}`} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-2xl bg-card shadow-md hover:shadow-xl transition-shadow duration-500"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <h3 className="text-xl md:text-2xl font-heading font-semibold text-kalea-tan tracking-wide whitespace-nowrap">
                      {c.name}
                    </h3>
                    <p className="text-sm text-kalea-cream/80 mt-1 mb-3">{c.tagline}</p>
                    <span className="inline-flex items-center gap-2 text-kalea-cream/90 text-xs font-medium uppercase tracking-wider">
                      Scopri
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vantaggi tecnici */}
      <section
        className="relative z-[3] section-spacing"
        style={{
          backgroundImage: `url(${bgOneWall})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-kalea-tan mb-4">{t('onewall.advantagesTitle')}</h2>
            <p className="text-lg text-kalea-cream/80 max-w-2xl mx-auto">
              {t('onewall.advantagesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {advantages.map((advantage, index) => (
              <FeatureCard key={advantage.title} {...advantage} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Applicazioni */}
      <section
        className="relative z-[4] section-spacing py-24"
        style={{
          backgroundImage: `url(${bgOneWallApplications})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/25" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-kalea-tan mb-4">
              {t('onewall.applicationsTitle')}
            </h2>
            <p className="text-lg text-kalea-cream/80 max-w-2xl mx-auto">
              {t('onewall.applicationsSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: Grid3x3, title: "Pareti divisorie architettoniche", description: "Soluzione ideale per creare ambienti flessibili e leggeri in uffici, abitazioni e spazi commerciali." },
              { icon: Droplets, title: "Pareti di rivestimento impermeabili", description: "Perfette in bagni e cucine grazie alla totale resistenza all'umidità e alla stabilità nel tempo." },
              { icon: Layers, title: "Controsoffitti e pannellature tecniche", description: "Installazione rapida, finitura immediata e prestazioni superiori rispetto al cartongesso tradizionale." },
              { icon: Sparkles, title: "Pareti decorative e accent walls", description: "Per creare elementi scenografici in reception, showroom, hotel e zone living." },
            ].map((application, index) => (
              <FeatureCard
                key={application.title}
                icon={application.icon}
                title={application.title}
                description={application.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-[5] bg-background">
        <TechSpecBar
          title={t('productSpecs.title')}
          subtitle={t('productSpecs.subtitle')}
          specs={[
            { label: "Linea", value: "Tech Wall" },
            { label: "Spessori", value: "TW1 4 mm · TW2 8 mm · TW3 12 mm" },
            { label: "Formati", value: "Pannelli modulari grande formato" },
            { label: t('productSpecs.finish'), value: "Decorativi a registro" },
            { label: "Applicazione", value: "Pareti · Soffitti · Accent walls" },
          ]}
        />
      </div>

      {/* CTA finale */}
      <section className="relative z-[6] section-spacing overflow-hidden bg-background">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgCtaCollabora})` }}
        />
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%)' 
          }}
        />
        
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 
              className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white"
              style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
            >
              {t('onewall.ctaTitle')}
            </h2>
            <p 
              className="text-lg mb-8 max-w-2xl mx-auto text-white/90"
              style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
            >
              {t('onewall.ctaSubtitle')}
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to={`/${language}/contatti`}>{t('onewall.ctaButton')}</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Biowall;