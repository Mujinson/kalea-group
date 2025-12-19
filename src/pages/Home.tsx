import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import MgoBook from "@/components/MgoBook";
import ProductGallerySection from "@/components/ProductGallerySection";
import WindowHero from "@/components/WindowHero";
import Carousel3D from "@/components/Carousel3D";
import { Layers, Shield, Sparkles, Home as HomeIcon, Building2, ShoppingBag, Briefcase, Heart, ShoppingCart, Leaf, Clock, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
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
  const carouselRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const mgoRef = useRef<HTMLDivElement>(null);
  const applicationsRef = useRef<HTMLDivElement>(null);
  const sustainabilityRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Carousel section scroll effects
  const { scrollYProgress: carouselProgress } = useScroll({
    target: carouselRef,
    offset: ["start end", "end start"],
  });
  const carouselScale = useTransform(carouselProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const carouselBorderRadius = useTransform(carouselProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

  // Products section scroll effects
  const { scrollYProgress: productsProgress } = useScroll({
    target: productsRef,
    offset: ["start end", "end start"],
  });
  const productsScale = useTransform(productsProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const productsBorderRadius = useTransform(productsProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

  // Manifesto section scroll effects
  const { scrollYProgress: manifestoProgress } = useScroll({
    target: manifestoRef,
    offset: ["start end", "end start"],
  });
  const manifestoScale = useTransform(manifestoProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const manifestoBorderRadius = useTransform(manifestoProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

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
    <div className="relative bg-kalea-dark">
      {/* Window Hero Section */}
      <WindowHero />

      {/* 3D Carousel Collection - Sticky z-[39] */}
      <section ref={carouselRef} className="relative h-screen sticky top-0 z-[39]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: carouselScale,
            borderRadius: carouselBorderRadius,
          }}
        >
          <Carousel3D />
        </motion.div>
      </section>

      {/* Products Section - Sticky z-[40] */}
      <section ref={productsRef} className="relative h-screen sticky top-0 z-[40]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: productsScale,
            borderRadius: productsBorderRadius,
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
              className="text-white/85 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto mb-6 md:mb-12"
            >
              {t('hero.home.systemDescription')}
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 max-w-5xl mx-auto">
              {productLines.map((product, index) => (
                product.comingSoon ? (
                  <motion.div
                    key={product.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 md:p-8 cursor-default relative h-full min-h-[140px] sm:min-h-[160px] md:min-h-[180px] flex flex-col justify-center"
                  >
                    <div className="absolute top-3 right-3 bg-white/20 text-white text-[10px] font-medium px-2 py-1 rounded-full">
                      {product.comingSoonLabel || "Novità in arrivo"}
                    </div>
                    <h3 className="text-white/60 font-semibold text-xs sm:text-sm md:text-base tracking-wider mb-2 md:mb-3">
                      {product.title.toUpperCase()}
                    </h3>
                    <p className="text-white/40 text-xs sm:text-sm md:text-base leading-relaxed">
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
                      className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 sm:p-5 md:p-8 hover:bg-white/15 transition-colors cursor-pointer h-full min-h-[140px] sm:min-h-[160px] md:min-h-[180px] flex flex-col justify-center"
                    >
                      <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base tracking-wider mb-2 md:mb-3">
                        {product.title.toUpperCase()}
                      </h3>
                      <p className="text-white/70 text-xs sm:text-sm md:text-base leading-relaxed">
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

      {/* Manifesto Section - Sticky z-[41] */}
      <section ref={manifestoRef} className="relative h-screen sticky top-0 z-[41]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: manifestoScale,
            borderRadius: manifestoBorderRadius,
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

      {/* Product Gallery Section - Sticky z-[42] */}
      <section ref={galleryRef} className="relative h-screen sticky top-0 z-[42]">
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

      {/* Perché MgO - 3D Book - Sticky z-[43] */}
      <section ref={mgoRef} className="relative h-screen sticky top-0 z-[43]">
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

      {/* Applicazioni - Sticky z-[44] */}
      <section ref={applicationsRef} className="relative h-screen sticky top-0 z-[44]">
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

      {/* Sostenibilità - Sticky z-[45] */}
      <section ref={sustainabilityRef} className="relative h-screen sticky top-0 z-[45]">
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

      {/* CTA Finale - Sticky z-[46] */}
      <section ref={ctaRef} className="relative h-screen sticky top-0 z-[46]">
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
      <div className="relative z-[60] h-16" />
    </div>
  );
};

export default Home;
