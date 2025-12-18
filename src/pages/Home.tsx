import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ApplicationCard from "@/components/ApplicationCard";
import MgoBook from "@/components/MgoBook";
import ProductGallerySection from "@/components/ProductGallerySection";
import HitobaSection from "@/components/HitobaSection";
import { Layers, Shield, Sparkles, Home as HomeIcon, Building2, ShoppingBag, Briefcase, Heart, ShoppingCart, Leaf, Clock, Wrench, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-kalea.webp";
import logo from "@/assets/logo-new.png";
import bgProducts from "@/assets/bg-products.jpg";
import bgManifesto from "@/assets/bg-manifesto.jpg";
import bgMgoSection from "@/assets/bg-mgo-section.webp";
import bgSustainabilityForest from "@/assets/bg-sustainability-forest.jpg";
import bgSustainabilityDurability from "@/assets/bg-sustainability-durability.jpg";
import bgSustainabilityMaintenance from "@/assets/bg-sustainability-maintenance.jpg";
import bgApplicationResidential from "@/assets/bg-application-residential.jpg";
import bgApplicationHospitality from "@/assets/bg-application-hospitality.jpg";
import bgApplicationRetail from "@/assets/bg-application-retail.jpg";
import bgApplicationOffices from "@/assets/bg-application-offices.jpg";
import bgApplicationHealthcare from "@/assets/bg-application-healthcare.jpg";
import bgApplicationCommercial from "@/assets/bg-application-commercial.jpg";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const { t, language } = useTranslation();
  const isMobile = useIsMobile();
  
  // Refs for scroll tracking
  const heroRef = useRef<HTMLDivElement>(null);

  // Hero scroll effects
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroScale = useTransform(heroProgress, [0, 1], isMobile ? [1, 0.94] : [1, 0.86]);
  const heroBorderRadius = useTransform(heroProgress, [0, 0.5], ["0px", isMobile ? "20px" : "32px"]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.35], [1, 0]);
  const heroContentY = useTransform(heroProgress, [0, 0.4], [0, isMobile ? -50 : -100]);
  const heroImageY = useTransform(heroProgress, [0, 1], ["0%", isMobile ? "10%" : "20%"]);
  const heroOverlayOpacity = useTransform(heroProgress, [0, 0.5], [1, 0.5]);

  const productLines = [
    {
      icon: Layers,
      title: t('home.stonecore.title'),
      description: t('home.stonecore.description'),
      link: `/${language}/stonecore-10`,
      comingSoon: false,
    },
    {
      icon: Shield,
      title: t('home.edgeline.title'),
      description: t('home.edgeline.description'),
      link: `/${language}/edgeline`,
      comingSoon: false,
    },
    {
      icon: Sparkles,
      title: t('home.onewall.title'),
      description: t('home.onewall.description'),
      link: `/${language}/onewall`,
      comingSoon: true,
      comingSoonLabel: t('home.onewall.comingSoonLabel'),
    },
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
    { icon: Leaf, title: t('home.sustainability.impact.title'), description: t('home.sustainability.impact.description'), bg: bgSustainabilityForest, link: `/${language}/sostenibilita/impatto-ambientale` },
    { icon: Clock, title: t('home.sustainability.durability.title'), description: t('home.sustainability.durability.description'), bg: bgSustainabilityDurability, link: `/${language}/sostenibilita/lunga-durata` },
    { icon: Wrench, title: t('home.sustainability.maintenance.title'), description: t('home.sustainability.maintenance.description'), bg: bgSustainabilityMaintenance, link: `/${language}/sostenibilita/manutenzione` },
  ];

  return (
    <div className="bg-[#0a0a0a]">
      {/* Hero Section */}
      <div ref={heroRef} className="relative h-screen min-h-[600px]" style={{ zIndex: 0 }}>
        <motion.div 
          className="fixed inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: heroScale,
            borderRadius: heroBorderRadius,
            zIndex: 0,
          }}
        >
          <motion.img 
            src={heroImage} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{ 
              y: heroImageY,
              scale: 1.15,
            }}
            initial={{ filter: "blur(12px)", scale: 1.25 }}
            animate={{ filter: "blur(0px)", scale: 1.15 }}
            transition={{ duration: 1.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"
            style={{ opacity: heroOverlayOpacity }}
          />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.div 
            style={{ opacity: heroContentOpacity, y: heroContentY }} 
            className="container-custom text-center pt-[55vh] md:pt-[58vh] will-change-transform"
          >
            <div className="max-w-5xl mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-white/90 font-light mb-4 tracking-wide"
              >
                SURFACE SYSTEM<sup className="text-[0.5em] align-super">®</sup>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-xl md:text-2xl lg:text-3xl text-white/90 font-light mb-10 tracking-wide"
              >
                {t('hero.home.newStandard')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link 
                  to={`/${language}/diventa-partner`}
                  className="group inline-flex items-center justify-center gap-2 bg-white text-[#111] text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
                >
                  {t('hero.home.ctaInfo')}
                </Link>
                <Link 
                  to={`/${language}/stonecore-10`}
                  className="inline-flex items-center justify-center gap-2 border border-white/30 text-white text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-white/10 transition-all duration-150"
                >
                  {t('hero.home.ctaProducts')}
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={{ opacity: heroContentOpacity }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-6 h-6 text-white/60" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Products Section */}
      <HitobaSection
        backgroundImage={bgProducts}
        overlayClassName="bg-gradient-to-b from-black/70 via-black/60 to-black/70"
        zIndex={1}
        minHeight="min-h-screen"
      >
        <div className="h-full flex items-center justify-center py-16">
          <div className="container-custom text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-white/85 text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto mb-12"
            >
              {t('hero.home.systemDescription')}
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {productLines.map((product, index) => (
                product.comingSoon ? (
                  <motion.div
                    key={product.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 cursor-default relative h-full min-h-[180px] flex flex-col justify-center"
                  >
                    <div className="absolute top-3 right-3 bg-white/20 text-white text-[10px] font-medium px-2 py-1 rounded-full">
                      {product.comingSoonLabel || "Novità in arrivo"}
                    </div>
                    <h3 className="text-white/60 font-semibold text-sm md:text-base tracking-wider mb-3">
                      {product.title.toUpperCase()}
                    </h3>
                    <p className="text-white/40 text-sm md:text-base leading-relaxed">
                      {product.description}
                    </p>
                  </motion.div>
                ) : (
                  <Link key={product.title} to={product.link} className="h-full">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      whileHover={{
                        y: -8,
                        scale: 1.03,
                        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
                      }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 md:p-8 hover:bg-white/15 transition-colors cursor-pointer h-full min-h-[180px] flex flex-col justify-center"
                    >
                      <h3 className="text-white font-semibold text-sm md:text-base tracking-wider mb-3">
                        {product.title.toUpperCase()}
                      </h3>
                      <p className="text-white/70 text-sm md:text-base leading-relaxed">
                        {product.description}
                      </p>
                    </motion.div>
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      </HitobaSection>

      {/* Manifesto Section */}
      <HitobaSection
        backgroundImage={bgManifesto}
        overlayClassName="bg-gradient-to-b from-black/55 via-black/45 to-black/60"
        zIndex={2}
        minHeight="min-h-screen"
      >
        <div className="h-full flex items-center justify-center py-16">
          <div className="w-full px-6 md:px-12 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="max-w-3xl mx-auto text-center space-y-3 md:space-y-4"
            >
              <div className="space-y-1.5 md:space-y-2">
                <p className="text-base md:text-lg lg:text-xl text-white/90 font-light tracking-wide leading-relaxed italic">
                  {t('hero.manifesto.line1')}
                </p>
                <p className="text-base md:text-lg lg:text-xl text-white/90 font-light tracking-wide leading-relaxed italic">
                  {t('hero.manifesto.line2')}
                </p>
                <p className="text-base md:text-lg lg:text-xl text-white/90 font-light tracking-wide leading-relaxed italic">
                  {t('hero.manifesto.line3')}
                </p>
                <p className="text-base md:text-lg lg:text-xl text-white/90 font-light tracking-wide leading-relaxed italic">
                  {t('hero.manifesto.line4')}
                </p>
                <p className="text-base md:text-lg lg:text-xl text-white/90 font-light tracking-wide leading-relaxed italic">
                  {t('hero.manifesto.line5')}
                </p>
              </div>

              <div className="h-px w-16 mx-auto bg-white/40 my-3" />

              <div className="space-y-1.5 text-xs md:text-sm text-white/85 font-light leading-relaxed">
                <p>{t('hero.manifesto.problem1')}<br />{t('hero.manifesto.problem2')}</p>
                <p className="mt-2">{t('hero.manifesto.question1')}<br /><span className="italic">{t('hero.manifesto.question2')}</span></p>
                <p className="mt-2">{t('hero.manifesto.reflection1')}<br />{t('hero.manifesto.reflection2')}<br />{t('hero.manifesto.reflection3')}<br />{t('hero.manifesto.reflection4')}</p>
                <p className="mt-2">{t('hero.manifesto.value1')}<br />{t('hero.manifesto.value2')}<br />{t('hero.manifesto.value3')}<br />{t('hero.manifesto.value4')}</p>
                <p className="mt-2">{t('hero.manifesto.conclusion1')}<br />{t('hero.manifesto.conclusion2')}</p>
              </div>

              <div className="pt-4 md:pt-6 space-y-1.5">
                <p className="text-xs md:text-sm lg:text-base tracking-[0.25em] text-white/90 font-medium uppercase">
                  KALĒA — SURFACE SYSTEM®
                </p>
                <p className="text-xs md:text-sm text-white/85 font-light">
                  {t('hero.manifesto.brandStatement')}
                </p>
                <p className="text-xs md:text-sm text-white/85 font-light">
                  {t('hero.manifesto.brandStatement2')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </HitobaSection>

      {/* Product Gallery Section */}
      <HitobaSection
        zIndex={3}
        minHeight="min-h-[600px]"
        bgColor="bg-background"
      >
        <ProductGallerySection />
      </HitobaSection>

      {/* Perché MgO - 3D Book */}
      <HitobaSection
        backgroundImage={bgMgoSection}
        overlayClassName="bg-gradient-to-b from-black/70 via-black/60 to-black/70"
        zIndex={4}
        minHeight="min-h-screen"
      >
        <div className="h-full flex items-center justify-center">
          <MgoBook />
        </div>
      </HitobaSection>

      {/* Applicazioni */}
      <HitobaSection
        zIndex={5}
        minHeight="min-h-screen"
        bgColor="bg-card"
      >
        <div className="h-full flex flex-col justify-center py-16">
          <div className="w-full px-6 md:px-12 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-6 md:mb-8"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
                {t('home.applicationsTitle')}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                {t('home.applicationsSubtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 max-w-6xl mx-auto">
              {applications.map((app, index) => (
                <motion.div
                  key={app.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ApplicationCard
                    icon={app.icon}
                    title={app.title}
                    description={app.description}
                    backgroundImage={app.bg}
                    index={index}
                    compact
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </HitobaSection>

      {/* Sostenibilità */}
      <HitobaSection
        zIndex={6}
        minHeight="min-h-screen"
        bgColor="bg-background"
      >
        <div className="h-full flex items-center py-16">
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
                <Link key={item.title} to={item.link}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ApplicationCard
                      icon={item.icon}
                      title={item.title}
                      description={item.description}
                      backgroundImage={item.bg}
                      index={index}
                    />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </HitobaSection>

      {/* CTA Finale */}
      <HitobaSection
        backgroundImage={bgCtaCollabora}
        overlayClassName="bg-gradient-to-b from-black/25 via-black/35 to-black/45"
        zIndex={7}
        minHeight="min-h-screen"
      >
        <div className="h-full flex items-center justify-center py-16">
          <div className="container-custom text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 
                className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-6 flex flex-wrap items-center justify-center gap-3 text-white"
                style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
              >
                <span>{t('home.ctaTitleBefore')}</span>
                <img 
                  src={logo} 
                  alt="Kalēa" 
                  className="inline-block h-[1.2em] w-auto"
                  style={{ 
                    filter: 'brightness(0) invert(1)',
                    verticalAlign: 'middle',
                    transform: 'translateY(0.02em)'
                  }}
                />
                <span>{t('home.ctaTitleAfter')}</span>
              </h2>
              <p 
                className="text-base mb-10 max-w-2xl mx-auto text-white/90"
                style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
              >
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
                  to={`/${language}/diventa-partner`}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#111] text-button rounded-xl px-10 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
                >
                  {t('home.ctaButton2')}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </HitobaSection>
    </div>
  );
};

export default Home;