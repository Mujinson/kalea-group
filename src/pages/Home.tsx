import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import ApplicationCard from "@/components/ApplicationCard";
import KaleaIntroSection from "@/components/KaleaIntroSection";
import { Layers, Shield, Sparkles, Home as HomeIcon, Building2, ShoppingBag, Briefcase, Heart, ShoppingCart, Leaf, Clock, Wrench, Flame, Droplets, Bug, Box, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-kalea-surfaces.jpg";
import logo from "@/assets/logo.png";
import bgProducts from "@/assets/bg-products.jpg";
import bgSustainabilityForest from "@/assets/bg-sustainability-forest.jpg";
import bgSustainabilityDurability from "@/assets/bg-sustainability-durability.jpg";
import bgSustainabilityMaintenance from "@/assets/bg-sustainability-maintenance.jpg";
import bgApplicationResidential from "@/assets/bg-application-residential.jpg";
import bgApplicationHospitality from "@/assets/bg-application-hospitality.jpg";
import bgApplicationRetail from "@/assets/bg-application-retail.jpg";
import bgApplicationOffices from "@/assets/bg-application-offices.jpg";
import bgApplicationHealthcare from "@/assets/bg-application-healthcare.jpg";
import bgApplicationCommercial from "@/assets/bg-application-commercial.jpg";
import { useTranslation } from "@/i18n/useTranslation";
import { useCardTilt } from "@/hooks/useCardTilt";

const Home = () => {
  const { t, language } = useTranslation();
  
  const productLines = [
    {
      icon: Layers,
      title: t('home.stonecore.title'),
      description: t('home.stonecore.description'),
    },
    {
      icon: Shield,
      title: t('home.edgeline.title'),
      description: t('home.edgeline.description'),
    },
    {
      icon: Sparkles,
      title: t('home.onewall.title'),
      description: t('home.onewall.description'),
    },
  ];

  const mgoAdvantages = [
    { icon: Flame, text: t('home.mgoAdvantages.fireproof') },
    { icon: Droplets, text: t('home.mgoAdvantages.waterproof') },
    { icon: Box, text: t('home.mgoAdvantages.stability') },
    { icon: Bug, text: t('home.mgoAdvantages.antimold') },
    { icon: Volume2, text: t('home.mgoAdvantages.acoustic') },
  ];

  const comparativeData = [
    { material: 'MgO', fire: '✓', water: '✓', mold: '✓', stability: '✓', acoustic: '✓' },
    { material: 'SPC', fire: '○', water: '✓', mold: '○', stability: '✓', acoustic: '○' },
    { material: 'MFC', fire: '✗', water: '✗', mold: '✗', stability: '○', acoustic: '○' },
    { material: 'HPL', fire: '○', water: '○', mold: '○', stability: '✓', acoustic: '✗' },
  ];

  const applications = [
    { icon: HomeIcon, title: t('home.applications.residential.title'), description: t('home.applications.residential.description'), bg: bgApplicationResidential },
    { icon: Building2, title: t('home.applications.hospitality.title'), description: t('home.applications.hospitality.description'), bg: bgApplicationHospitality },
    { icon: ShoppingBag, title: t('home.applications.retail.title'), description: t('home.applications.retail.description'), bg: bgApplicationRetail },
    { icon: Briefcase, title: t('home.applications.offices.title'), description: t('home.applications.offices.description'), bg: bgApplicationOffices },
    { icon: Heart, title: t('home.applications.healthcare.title'), description: t('home.applications.healthcare.description'), bg: bgApplicationHealthcare },
    { icon: ShoppingCart, title: t('home.applications.commercial.title'), description: t('home.applications.commercial.description'), bg: bgApplicationCommercial },
  ];

  const sustainability = [
    { icon: Leaf, title: t('home.sustainability.impact.title'), description: t('home.sustainability.impact.description'), bg: bgSustainabilityForest },
    { icon: Clock, title: t('home.sustainability.durability.title'), description: t('home.sustainability.durability.description'), bg: bgSustainabilityDurability },
    { icon: Wrench, title: t('home.sustainability.maintenance.title'), description: t('home.sustainability.maintenance.description'), bg: bgSustainabilityMaintenance },
  ];

  return (
    <div>
      {/* Hero */}
      <HeroSection
        title={t('hero.home.title')}
        subtitle={t('hero.home.subtitle')}
        ctaPrimary={{ text: t('hero.home.ctaPrimary'), link: `/${language}/stonecore-10` }}
        ctaSecondary={{ text: t('hero.home.ctaSecondary'), link: `/${language}/contatti` }}
        backgroundImage={heroImage}
        minHeight="min-h-[85vh]"
      />

      {/* Le linee Kalēa */}
      <section className="section-spacing relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={bgProducts} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-black/75" />
        </div>
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              {t('home.linesTitle')}
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {t('home.linesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {productLines.map((product, index) => (
              <FeatureCard key={product.title} {...product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Perché MgO */}
      <section className="section-spacing">
        <div className="w-full px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 max-w-[1400px] mx-auto">
            {/* Left Column - Text & Icons with Gradient Background */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative p-8 lg:p-12"
              style={{
                background: "radial-gradient(circle at top left, rgba(245, 242, 238, 0.55), rgba(40, 35, 30, 0.40))",
                borderRadius: "32px 0 0 32px",
              }}
            >
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 leading-tight"
              >
                {t('home.mgoTitle')}
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-muted-foreground mb-12 leading-relaxed"
              >
                {t('home.mgoDescription')}
              </motion.p>

              <div className="space-y-6 mb-12">
                {mgoAdvantages.map((advantage, index) => (
                  <motion.div
                    key={advantage.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-5 group"
                  >
                    <div className="p-3 rounded-xl bg-background/40 backdrop-blur-sm group-hover:bg-background/60 transition-all duration-200">
                      <advantage.icon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                    </div>
                    <span className="text-lg text-foreground font-medium">{advantage.text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Button asChild variant="outline" size="default" className="rounded-xl border-border hover:bg-muted">
                  <Link to={`/${language}/area-tecnica`}>{t('home.mgoButton')}</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Column - Glass Card with Comparison */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.97 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative"
            >
              <motion.div 
                className="relative overflow-hidden h-full flex flex-col"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(0, 0, 0, 0.40))",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "0 32px 32px 0",
                  padding: "32px 36px",
                  boxShadow: "0 28px 80px rgba(0, 0, 0, 0.35)",
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  boxShadow: "0 36px 90px rgba(0, 0, 0, 0.45)",
                  transition: { duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }
                }}
              >
                <h3 className="text-2xl font-heading font-semibold text-foreground mb-8">
                  {t('home.mgoComparison.title')}
                </h3>

                {/* Comparative Table */}
                <div className="space-y-4 flex-1">
                  {/* Header - Horizontal Icons */}
                  <div className="grid grid-cols-6 gap-3 pb-4 border-b border-foreground/20">
                    <div className="col-span-1"></div>
                    <div className="flex flex-col items-center gap-1">
                      <Flame className="w-5 h-5 text-foreground/90" strokeWidth={1.5} />
                      <span className="text-[10px] text-foreground/70 text-center leading-tight">{t('home.mgoComparison.fire')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Droplets className="w-5 h-5 text-foreground/90" strokeWidth={1.5} />
                      <span className="text-[10px] text-foreground/70 text-center leading-tight">{t('home.mgoComparison.water')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Bug className="w-5 h-5 text-foreground/90" strokeWidth={1.5} />
                      <span className="text-[10px] text-foreground/70 text-center leading-tight">{t('home.mgoComparison.mold')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Box className="w-5 h-5 text-foreground/90" strokeWidth={1.5} />
                      <span className="text-[10px] text-foreground/70 text-center leading-tight">{t('home.mgoComparison.stability')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Volume2 className="w-5 h-5 text-foreground/90" strokeWidth={1.5} />
                      <span className="text-[10px] text-foreground/70 text-center leading-tight">{t('home.mgoComparison.acoustic')}</span>
                    </div>
                  </div>

                  {/* Rows */}
                  {comparativeData.map((row, index) => (
                    <motion.div
                      key={row.material}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      className={`grid grid-cols-6 gap-3 py-4 rounded-2xl transition-colors duration-200 ${
                        row.material === 'MgO' 
                          ? 'bg-foreground/10 px-4' 
                          : 'px-4 hover:bg-foreground/5'
                      }`}
                    >
                      <div className={`col-span-1 text-base font-bold flex items-center ${
                        row.material === 'MgO' ? 'text-foreground' : 'text-foreground/80'
                      }`}>
                        {row.material}
                      </div>
                      <div className="text-center text-xl text-foreground flex items-center justify-center">{row.fire}</div>
                      <div className="text-center text-xl text-foreground flex items-center justify-center">{row.water}</div>
                      <div className="text-center text-xl text-foreground flex items-center justify-center">{row.mold}</div>
                      <div className="text-center text-xl text-foreground flex items-center justify-center">{row.stability}</div>
                      <div className="text-center text-xl text-foreground flex items-center justify-center">{row.acoustic}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-foreground/20 flex gap-6 text-xs text-foreground/60">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-foreground">✓</span>
                    <span>{t('home.mgoComparison.excellent')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-foreground">○</span>
                    <span>{t('home.mgoComparison.good')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-foreground">✗</span>
                    <span>{t('home.mgoComparison.poor')}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chi è Kalēa */}
      <KaleaIntroSection variant="home" />

      {/* Applicazioni */}
      <section className="section-spacing bg-card">
        <div className="w-full px-6 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              {t('home.applicationsTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.applicationsSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {applications.map((app, index) => (
              <ApplicationCard
                key={app.title}
                icon={app.icon}
                title={app.title}
                description={app.description}
                backgroundImage={app.bg}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Sostenibilità */}
      <section className="section-spacing">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              {t('home.sustainabilityTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.sustainabilitySubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {sustainability.map((item, index) => (
              <ApplicationCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                backgroundImage={item.bg}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="section-spacing bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6 flex flex-wrap items-center justify-center gap-3">
              <span>Vuoi usare</span>
              <img 
                src={logo} 
                alt="Kalēa" 
                className="inline-block h-[1.4em] w-auto"
                style={{ 
                  filter: 'brightness(0) invert(1)',
                  verticalAlign: 'baseline'
                }}
              />
              <span>nei tuoi progetti?</span>
            </h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto opacity-90">
              {t('home.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to={`/${language}/contatti`}
                className="inline-flex items-center justify-center gap-2 bg-white text-[#111] text-button rounded-xl px-10 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
              >
                {t('home.ctaButton1')}
              </Link>
              <Link 
                to={`/${language}/chi-siamo`}
                className="inline-flex items-center justify-center gap-2 bg-white text-[#111] text-button rounded-xl px-10 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
              >
                {t('home.ctaButton2')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
