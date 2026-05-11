import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import ProductCard from "@/components/ProductCard";
import FinishCard from "@/components/FinishCard";
import { Sparkles, Shield, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-edgeline.jpg";
import bgEdgeLine from "@/assets/bg-edgeline.jpg";
import profiloTerminaleImage from "@/assets/edgeline-profilo-terminale-2.png";
import battiscopaImage from "@/assets/edgeline-battiscopa.jpg";
import espansioneImage from "@/assets/edgeline-espansione.jpg";
import giuntoImage from "@/assets/edgeline-giunto.jpg";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";
import TechSpecBar from "@/components/TechSpecBar";

const EdgeLine = () => {
  const { t, language } = useTranslation();
  
  const advantages = [
    {
      icon: Sparkles,
      title: t('edgeline.advantages.design.title'),
      description: t('edgeline.advantages.design.description'),
    },
    {
      icon: Shield,
      title: t('edgeline.advantages.resistance.title'),
      description: t('edgeline.advantages.resistance.description'),
    },
    {
      icon: Ruler,
      title: t('edgeline.advantages.versatility.title'),
      description: t('edgeline.advantages.versatility.description'),
    },
  ];

  const products = [
    {
      title: t('edgeline.products.terminal.title'),
      description: t('edgeline.products.terminal.description'),
      image: profiloTerminaleImage,
    },
    {
      title: t('edgeline.products.junction.title'),
      description: t('edgeline.products.junction.description'),
      image: giuntoImage,
    },
    {
      title: t('edgeline.products.expansion.title'),
      description: t('edgeline.products.expansion.description'),
      image: espansioneImage,
    },
    {
      title: t('edgeline.products.baseboard.title'),
      description: t('edgeline.products.baseboard.description'),
      image: battiscopaImage,
    },
    {
      title: t('edgeline.products.step.title'),
      description: t('edgeline.products.step.description'),
    },
  ];

  return (
    <div>
      <SEOHead
        title={language === 'it' ? "EDGELINE® — Profili e Battiscopa per Pavimenti Flottanti | Kalēa®" :
               language === 'en' ? "EDGELINE® — Profiles & Skirting for Floating Floors | Kalēa®" :
               language === 'de' ? "EDGELINE® — Profile & Sockelleisten für Schwimmböden | Kalēa®" :
               "EDGELINE® — Profilés et Plinthes pour Sols Flottants | Kalēa®"}
        description={language === 'it' ? "EDGELINE® di Kalēa®: profili terminali, battiscopa e giunti di espansione coordinati per pavimenti flottanti. Design minimale, resistenza superiore." :
                     language === 'en' ? "EDGELINE® by Kalēa®: coordinated profiles, skirting boards and expansion joints for floating floors. Minimal design, superior resistance." :
                     language === 'de' ? "EDGELINE® von Kalēa®: koordinierte Profile, Sockelleisten und Dehnungsfugen für Schwimmböden." :
                     "EDGELINE® par Kalēa® : profilés, plinthes et joints de dilatation coordonnés pour sols flottants."}
        keywords="battiscopa pavimenti flottanti, profili pavimento, giunti espansione pavimento, accessori pavimento flottante, profilo terminale, battiscopa minerale"
      />
      {/* Hero */}
      <HeroSection
        title={t('hero.edgeline.title')}
        subtitle={t('hero.edgeline.subtitle')}
        ctaPrimary={{ text: t('hero.edgeline.ctaPrimary'), link: `/${language}/contatti` }}
        ctaSecondary={{ text: t('hero.edgeline.ctaSecondary'), link: `/${language}/biocore` }}
        backgroundImage={heroImage}
      />

      {/* Vantaggi */}
      <section 
        className="section-spacing relative z-10"
        style={{
          backgroundImage: `url(${bgEdgeLine})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay scuro */}
        <div className="absolute inset-0 bg-black/35" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              {t('edgeline.advantagesTitle')}
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {t('edgeline.advantagesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {advantages.map((advantage, index) => (
              <FeatureCard key={advantage.title} {...advantage} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Griglia prodotti */}
      <section className="section-spacing bg-background relative z-10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t('edgeline.productsTitle')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('edgeline.productsSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.title}
                title={product.title}
                description={product.description}
                index={index}
                image={product.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Finiture */}
      <section className="section-spacing bg-background relative z-10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t('edgeline.finishesTitle')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('edgeline.finishesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              t('edgeline.finishes.natural'),
              t('edgeline.finishes.bronze'),
              t('edgeline.finishes.black'),
              t('edgeline.finishes.silver')
            ].map((finish, index) => (
              <FinishCard
                key={finish}
                name={finish}
                index={index}
                variant="simple"
              />
            ))}
          </div>
        </div>
      </section>

      <TechSpecBar
        title={t('productSpecs.title')}
        subtitle={t('productSpecs.subtitle')}
        specs={[
          { label: t('productSpecs.material'), value: "Alluminio anodizzato · PVC" },
          { label: t('productSpecs.thickness'), value: "8 · 10 · 12 · 15 mm" },
          { label: t('productSpecs.format'), value: "L 2700 mm · L 2500 mm" },
          { label: t('productSpecs.finish'), value: "Naturale · Argento · Bronzo · Oro" },
        ]}
        applicationsLabel={t('productSpecs.installation')}
        applications={["Battiscopa", "Profilo terminale", "Giunto di dilatazione", "Profilo di espansione"]}
      />

      {/* CTA finale */}
      <section className="section-spacing relative z-10 overflow-hidden bg-background">
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
              {t('edgeline.ctaTitle')}
            </h2>
            <p 
              className="text-lg mb-8 max-w-2xl mx-auto text-white/90"
              style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
            >
              {t('edgeline.ctaSubtitle')}
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to={`/${language}/contatti`}>{t('edgeline.ctaButton')}</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default EdgeLine;