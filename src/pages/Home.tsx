import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import ApplicationCard from "@/components/ApplicationCard";
import KaleaIntroSection from "@/components/KaleaIntroSection";
import MgoBook from "@/components/MgoBook";
import { Layers, Shield, Sparkles, Home as HomeIcon, Building2, ShoppingBag, Briefcase, Heart, ShoppingCart, Leaf, Clock, Wrench } from "lucide-react";
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

      {/* Perché MgO - 3D Book */}
      <MgoBook />

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
              <span>Vuoi usare</span>
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
              <span>nei tuoi progetti?</span>
            </h2>
            <p 
              className="text-lg mb-10 max-w-2xl mx-auto text-white/90"
              style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
            >
              {t('home.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to={`/${language}/contatti`}>
                  {t('home.ctaButton1')}
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link to={`/${language}/diventa-partner`}>
                  {t('home.ctaButton2')}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
