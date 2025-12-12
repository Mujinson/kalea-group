import { motion } from "framer-motion";
import ApplicationCard from "@/components/ApplicationCard";
import MgoBook from "@/components/MgoBook";
import ProductGallerySection from "@/components/ProductGallerySection";
import { Layers, Shield, Sparkles, Home as HomeIcon, Building2, ShoppingBag, Briefcase, Heart, ShoppingCart, Leaf, Clock, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-kalea-surfaces.jpg";
import logo from "@/assets/logo.png";
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
import { useCardTilt } from "@/hooks/useCardTilt";

const Home = () => {
  const { t, language } = useTranslation();
  
  const productLines = [
    {
      icon: Layers,
      title: t('home.stonecore.title'),
      description: t('home.stonecore.description'),
      link: `/${language}/stonecore-10`,
    },
    {
      icon: Shield,
      title: t('home.edgeline.title'),
      description: t('home.edgeline.description'),
      link: `/${language}/edgeline`,
    },
    {
      icon: Sparkles,
      title: t('home.onewall.title'),
      description: t('home.onewall.description'),
      link: `/${language}/onewall`,
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
    { icon: Leaf, title: t('home.sustainability.impact.title'), description: t('home.sustainability.impact.description'), bg: bgSustainabilityForest },
    { icon: Clock, title: t('home.sustainability.durability.title'), description: t('home.sustainability.durability.description'), bg: bgSustainabilityDurability },
    { icon: Wrench, title: t('home.sustainability.maintenance.title'), description: t('home.sustainability.maintenance.description'), bg: bgSustainabilityMaintenance },
  ];

  return (
    <div>
      {/* Sticky Stacking Container */}
      <div className="relative">
        {/* Hero Section */}
        <section className="relative min-h-screen md:h-screen flex items-center justify-center overflow-hidden pt-32 pb-12 md:pt-20 md:pb-0">
          {/* Background */}
          <motion.div 
            className="absolute inset-0 z-0"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          >
            <img 
              src={heroImage} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />
          </motion.div>

        {/* Content */}
        <div className="container-custom relative z-10 text-center pt-8 md:pt-12">
          <div className="max-w-5xl mx-auto">
            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-white/90 font-light mb-4 tracking-wide"
            >
              SURFACE SYSTEM<sup className="text-[0.5em] align-super">®</sup>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-xl md:text-2xl lg:text-3xl text-white/90 font-light mb-2 tracking-wide"
            >
              {t('hero.home.newStandard')}
            </motion.p>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="text-base md:text-lg text-white/65 font-light mb-12 tracking-widest uppercase"
            >
              {t('hero.home.tagline')}
            </motion.p>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="w-24 h-px bg-white/30 mx-auto mb-10"
            />

            {/* System Description */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85 }}
              className="max-w-3xl mx-auto mb-12"
            >
              <p className="text-white/75 text-base md:text-lg leading-relaxed mb-8">
                {t('hero.home.systemDescription')}
              </p>

              {/* Product Lines */}
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  className="aspect-square md:aspect-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center md:flex-col md:p-5 hover:bg-white/10 transition-colors"
                >
                  <h3 className="text-white font-semibold text-[10px] md:text-sm tracking-wider text-center md:mb-2">STONECORE 10</h3>
                  <p className="hidden md:block text-white/60 text-sm leading-relaxed text-center">
                    {t('hero.home.stonecoreHero')}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="aspect-square md:aspect-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center md:flex-col md:p-5 hover:bg-white/10 transition-colors"
                >
                  <h3 className="text-white font-semibold text-[10px] md:text-sm tracking-wider text-center md:mb-2">EDGELINE</h3>
                  <p className="hidden md:block text-white/60 text-sm leading-relaxed text-center">
                    {t('hero.home.edgelineHero')}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="aspect-square md:aspect-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center md:flex-col md:p-5 hover:bg-white/10 transition-colors"
                >
                  <h3 className="text-white font-semibold text-[10px] md:text-sm tracking-wider text-center md:mb-2">ONEWALL</h3>
                  <p className="hidden md:block text-white/60 text-sm leading-relaxed text-center">
                    {t('hero.home.onewallHero')}
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.35 }}
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
        </div>
        </section>

      {/* Manifesto Section - below hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src={bgManifesto} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/55" />
        </div>

        {/* Content */}
        <div className="w-full relative z-10 text-center px-6 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto space-y-2"
          >
            <p className="text-base md:text-lg lg:text-xl text-white/90 font-light tracking-wide leading-relaxed">
              {t('hero.manifesto.line1')}
            </p>
            <p className="text-base md:text-lg lg:text-xl text-white/90 font-light tracking-wide leading-relaxed">
              {t('hero.manifesto.line2')}
            </p>
            <p className="text-base md:text-lg lg:text-xl text-white/90 font-light tracking-wide leading-relaxed">
              {t('hero.manifesto.line3')}
            </p>
            <p className="text-base md:text-lg lg:text-xl text-white/90 font-light tracking-wide leading-relaxed">
              {t('hero.manifesto.line4')}
            </p>
            <p className="text-base md:text-lg lg:text-xl text-white/90 font-light tracking-wide leading-relaxed">
              {t('hero.manifesto.line5')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Gallery Section */}
      <ProductGallerySection />

        {/* Le linee Kalēa Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden py-12 md:py-24 lg:py-32">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img src={bgProducts} alt="" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-black/75" />
          </div>
          
          <div className="container-custom relative z-10 w-full px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-6 md:mb-12 lg:mb-16"
            >
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-2 md:mb-4">
                {t('home.linesTitle')}
              </h2>
              <p className="text-sm md:text-lg text-white/70 max-w-2xl mx-auto">
                {t('home.linesSubtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8 lg:gap-10">
              {productLines.map((product, index) => (
                <Link key={product.title} to={product.link}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{
                      y: -6,
                      rotateX: 2,
                      rotateY: -2,
                      boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
                    }}
                    transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 0.61, 0.36, 1] }}
                    className="kalea-card group relative overflow-hidden h-full flex flex-col rounded-2xl"
                  >
                    <div className="absolute inset-0 bg-foreground/85" />
                    <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 to-foreground/80" />
                    
                    <div className="relative z-10 flex flex-col h-full p-4 md:p-8 lg:p-10">
                      <div className="mb-2 md:mb-6">
                        <product.icon className="w-6 h-6 md:w-10 md:h-10 text-background" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-heading font-semibold text-background tracking-tight text-base md:text-2xl mb-1 md:mb-3" style={{ lineHeight: '1.15' }}>
                        {product.title}
                      </h3>
                      <p className="text-background/80 flex-grow text-xs md:text-base leading-snug">
                        {product.description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
      {/* End Sticky Stacking Container */}

      {/* Perché MgO - 3D Book */}
      <MgoBook />

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
      <section className="section-spacing relative overflow-hidden">
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
              className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6 flex flex-wrap items-center justify-center gap-3 text-white"
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
              className="text-lg mb-10 max-w-2xl mx-auto text-white/90"
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
      </section>
    </div>
  );
};

export default Home;
