import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import HitobaSection from "@/components/HitobaSection";
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
    { title: t('edgeline.products.terminal.title'), description: t('edgeline.products.terminal.description'), image: profiloTerminaleImage },
    { title: t('edgeline.products.junction.title'), description: t('edgeline.products.junction.description'), image: giuntoImage },
    { title: t('edgeline.products.expansion.title'), description: t('edgeline.products.expansion.description'), image: espansioneImage },
    { title: t('edgeline.products.baseboard.title'), description: t('edgeline.products.baseboard.description'), image: battiscopaImage },
    { title: t('edgeline.products.step.title'), description: t('edgeline.products.step.description') },
  ];

  return (
    <div className="bg-[#0a0a0a]">
      <HeroSection
        title={t('hero.edgeline.title')}
        subtitle={t('hero.edgeline.subtitle')}
        ctaPrimary={{ text: t('hero.edgeline.ctaPrimary'), link: `/${language}/contatti` }}
        ctaSecondary={{ text: t('hero.edgeline.ctaSecondary'), link: `/${language}/stonecore-10` }}
        backgroundImage={heroImage}
      />

      {/* Vantaggi */}
      <HitobaSection backgroundImage={bgEdgeLine} overlayClassName="bg-black/40" zIndex={1} minHeight="min-h-screen">
        <div className="h-full flex items-center py-16">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">{t('edgeline.advantagesTitle')}</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">{t('edgeline.advantagesSubtitle')}</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {advantages.map((advantage, index) => (
                <motion.div key={advantage.title} whileHover={{ y: -6, scale: 1.02 }} transition={{ duration: 0.3 }}>
                  <FeatureCard {...advantage} index={index} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </HitobaSection>

      {/* Griglia prodotti */}
      <HitobaSection zIndex={2} minHeight="min-h-screen" bgColor="bg-card">
        <div className="h-full flex items-center py-16">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t('edgeline.productsTitle')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('edgeline.productsSubtitle')}</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <motion.div key={product.title} whileHover={{ y: -6, scale: 1.02 }} transition={{ duration: 0.3 }}>
                  <ProductCard title={product.title} description={product.description} index={index} image={product.image} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </HitobaSection>

      {/* Finiture */}
      <HitobaSection zIndex={3} minHeight="min-h-[600px]" bgColor="bg-background">
        <div className="h-full flex items-center py-16">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t('edgeline.finishesTitle')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('edgeline.finishesSubtitle')}</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[t('edgeline.finishes.natural'), t('edgeline.finishes.bronze'), t('edgeline.finishes.black'), t('edgeline.finishes.silver')].map((finish, index) => (
                <motion.div key={finish} whileHover={{ y: -4, scale: 1.03 }} transition={{ duration: 0.3 }}>
                  <FinishCard name={finish} index={index} variant="simple" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </HitobaSection>

      {/* CTA finale */}
      <HitobaSection backgroundImage={bgCtaCollabora} overlayClassName="bg-gradient-to-b from-black/25 to-black/45" zIndex={4} minHeight="min-h-[500px]">
        <div className="h-full flex items-center justify-center py-16">
          <div className="container-custom text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white" style={{ textShadow: '0px 4px 16px rgba(0,0,0,0.55)' }}>{t('edgeline.ctaTitle')}</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90" style={{ textShadow: '0px 4px 16px rgba(0,0,0,0.55)' }}>{t('edgeline.ctaSubtitle')}</p>
              <Button asChild size="lg" variant="secondary"><Link to={`/${language}/contatti`}>{t('edgeline.ctaButton')}</Link></Button>
            </motion.div>
          </div>
        </div>
      </HitobaSection>
    </div>
  );
};

export default EdgeLine;