import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ApplicationCard from "@/components/ApplicationCard";
import MgoBook from "@/components/MgoBook";
import ProductGallerySection from "@/components/ProductGallerySection";
import { Layers, Shield, Sparkles, Home as HomeIcon, Building2, ShoppingBag, Briefcase, Heart, ShoppingCart, Leaf, Clock, Wrench, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-kalea.webp";
import logo from "@/assets/logo-new.png";
import bgProducts from "@/assets/bg-products.jpg";
import bgManifesto from "@/assets/bg-manifesto.jpg";
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
  const productsRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const mgoRef = useRef<HTMLDivElement>(null);
  const applicationsRef = useRef<HTMLDivElement>(null);
  const sustainabilityRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Hero scroll effects
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroScale = useTransform(heroProgress, [0, 1], isMobile ? [1, 0.96] : [1, 0.88]);
  const heroBorderRadius = useTransform(heroProgress, [0, 0.5], ["0px", isMobile ? "16px" : "28px"]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.3], [1, 0]);
  const heroContentY = useTransform(heroProgress, [0, 0.4], [0, isMobile ? -40 : -80]);
  const heroImageY = useTransform(heroProgress, [0, 1], ["0%", isMobile ? "8%" : "15%"]);

  // Products section scroll effects
  const { scrollYProgress: productsProgress } = useScroll({
    target: productsRef,
    offset: ["start end", "end start"],
  });
  
  const productsScale = useTransform(productsProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const productsBorderRadius = useTransform(productsProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);
  const productsOpacity = useTransform(productsProgress, [0, 0.15, 0.85, 1], [0.7, 1, 1, 0.7]);

  // Manifesto section scroll effects
  const { scrollYProgress: manifestoProgress } = useScroll({
    target: manifestoRef,
    offset: ["start end", "end start"],
  });
  
  const manifestoScale = useTransform(manifestoProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const manifestoBorderRadius = useTransform(manifestoProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);
  const manifestoOpacity = useTransform(manifestoProgress, [0, 0.15, 0.85, 1], [0.7, 1, 1, 0.7]);

  // Gallery section scroll effects
  const { scrollYProgress: galleryProgress } = useScroll({
    target: galleryRef,
    offset: ["start end", "end start"],
  });
  
  const galleryScale = useTransform(galleryProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const galleryBorderRadius = useTransform(galleryProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

  // MgO section scroll effects
  const { scrollYProgress: mgoProgress } = useScroll({
    target: mgoRef,
    offset: ["start end", "end start"],
  });
  
  const mgoScale = useTransform(mgoProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const mgoBorderRadius = useTransform(mgoProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

  // Applications section scroll effects
  const { scrollYProgress: applicationsProgress } = useScroll({
    target: applicationsRef,
    offset: ["start end", "end start"],
  });
  
  const applicationsScale = useTransform(applicationsProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const applicationsBorderRadius = useTransform(applicationsProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

  // Sustainability section scroll effects
  const { scrollYProgress: sustainabilityProgress } = useScroll({
    target: sustainabilityRef,
    offset: ["start end", "end start"],
  });
  
  const sustainabilityScale = useTransform(sustainabilityProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const sustainabilityBorderRadius = useTransform(sustainabilityProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

  // CTA section scroll effects
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  
  const ctaScale = useTransform(ctaProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const ctaBorderRadius = useTransform(ctaProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

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
    <div className="relative bg-[#0a0a0a]">
      {/* Hero Section - Sticky with scroll shrink effect */}
      <section ref={heroRef} className="relative h-screen sticky top-0 z-[0]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: heroScale,
            borderRadius: heroBorderRadius,
          }}
        >
          <motion.img 
            src={heroImage} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{ 
              y: heroImageY,
              scale: 1.1,
            }}
            initial={{ filter: "blur(10px)", scale: 1.15 }}
            animate={{ filter: "blur(0px)", scale: 1.1 }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </motion.div>

        {/* Hero Content - positioned at bottom to not overlap logo in image */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 md:pb-28">
          <motion.div 
            style={{ opacity: heroContentOpacity, y: heroContentY }} 
            className="container-custom text-center will-change-transform"
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
                className="text-xl md:text-2xl lg:text-3xl text-white/90 font-light mb-8 tracking-wide"
              >
                {t('hero.home.newStandard')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
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

              {/* Scroll indicator */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                style={{ opacity: heroContentOpacity }}
              >
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex justify-center"
                >
                  <ChevronDown className="w-6 h-6 text-white/60" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Section - Stacks on top of hero */}
      <section ref={productsRef} className="relative h-screen sticky top-0 z-[1]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: productsScale,
            borderRadius: productsBorderRadius,
            opacity: productsOpacity,
          }}
        >
          <img 
            src={bgProducts} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        </motion.div>

        <div className="relative z-10 h-full flex items-center justify-center">
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
                        y: -6,
                        scale: 1.02,
                        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
                      }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
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
      </section>

      {/* Manifesto Section - Stacks on top of products */}
      <section ref={manifestoRef} className="relative h-screen sticky top-0 z-[2]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: manifestoScale,
            borderRadius: manifestoBorderRadius,
            opacity: manifestoOpacity,
          }}
        >
          <img 
            src={bgManifesto} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/60" />
        </motion.div>

        <div className="relative z-10 h-full flex items-center justify-center">
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
      </section>

      {/* Product Gallery Section - Sticky z-[3] */}
      <section ref={galleryRef} className="relative h-screen sticky top-0 z-[3]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform bg-background"
          style={{ 
            scale: galleryScale,
            borderRadius: galleryBorderRadius,
          }}
        >
          <ProductGallerySection />
        </motion.div>
      </section>

      {/* Perché MgO - 3D Book - Sticky z-[4] */}
      <section ref={mgoRef} className="relative h-screen sticky top-0 z-[4]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: mgoScale,
            borderRadius: mgoBorderRadius,
          }}
        >
          <MgoBook />
        </motion.div>
      </section>

      {/* Applicazioni - Sticky z-[5] */}
      <section ref={applicationsRef} className="relative h-screen sticky top-0 z-[5]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform bg-card"
          style={{ 
            scale: applicationsScale,
            borderRadius: applicationsBorderRadius,
          }}
        >
          <div className="h-full flex flex-col px-6 md:px-12 lg:px-20 py-10 md:py-14">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-6 md:mb-8"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
                {t('home.applicationsTitle')}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('home.applicationsSubtitle')}
              </p>
            </motion.div>

            {/* Cards - 3 per row on desktop, 2 rows */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto w-full">
              {applications.map((app, index) => (
                <motion.div
                  key={app.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{
                    y: -6,
                    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.25)",
                  }}
                  className="relative rounded-2xl overflow-hidden group"
                >
                  <img
                    src={app.bg}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/10 to-foreground/75" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <app.icon className="w-10 h-10 md:w-12 md:h-12 text-background mb-3" strokeWidth={1.5} />
                    <h3 className="text-base md:text-lg lg:text-xl font-heading font-semibold text-background mb-1">
                      {app.title}
                    </h3>
                    <p className="text-xs md:text-sm text-background/80 hidden sm:block">
                      {app.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Sostenibilità - Sticky z-[6] */}
      <section ref={sustainabilityRef} className="relative h-screen sticky top-0 z-[6]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform bg-background"
          style={{ 
            scale: sustainabilityScale,
            borderRadius: sustainabilityBorderRadius,
          }}
        >
          <div className="h-full flex flex-col px-6 md:px-12 lg:px-20 py-10 md:py-14">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 md:mb-10"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
                {t('home.sustainabilityTitle')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('home.sustainabilitySubtitle')}
              </p>
            </motion.div>

            {/* Cards - fill remaining height */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 max-w-7xl mx-auto w-full">
              {sustainability.map((item, index) => (
                <Link key={item.title} to={item.link} className="block h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{
                      y: -6,
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
                    }}
                    className="relative h-full rounded-3xl overflow-hidden group"
                  >
                    <img
                      src={item.bg}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/10 to-foreground/70" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                      <item.icon className="w-12 h-12 md:w-14 md:h-14 text-background mb-4" strokeWidth={1.5} />
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-background mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm md:text-base text-background/85 max-w-xs">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Finale - Sticky z-[7] */}
      <section ref={ctaRef} className="relative h-screen sticky top-0 z-[7]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: ctaScale,
            borderRadius: ctaBorderRadius,
          }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bgCtaCollabora})` }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%)' 
            }}
          />
          
          <div className="relative z-10 h-full flex items-center justify-center">
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
        </motion.div>
      </section>

      {/* Spacer to push footer below sticky sections */}
      <div className="relative z-[50] h-16" />
    </div>
  );
};

export default Home;