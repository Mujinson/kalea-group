import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { Sparkles, Shield, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-edgeline.jpg";
import bgEdgeLine from "@/assets/bg-edgeline.jpg";
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
    {
      title: t('edgeline.products.terminal.title'),
      description: t('edgeline.products.terminal.description'),
    },
    {
      title: t('edgeline.products.junction.title'),
      description: t('edgeline.products.junction.description'),
    },
    {
      title: t('edgeline.products.expansion.title'),
      description: t('edgeline.products.expansion.description'),
    },
    {
      title: t('edgeline.products.baseboard.title'),
      description: t('edgeline.products.baseboard.description'),
    },
    {
      title: t('edgeline.products.step.title'),
      description: t('edgeline.products.step.description'),
    },
  ];

  return (
    <div>
      {/* Hero */}
      <HeroSection
        title={t('hero.edgeline.title')}
        subtitle={t('hero.edgeline.subtitle')}
        ctaPrimary={{ text: t('hero.edgeline.ctaPrimary'), link: `/${language}/contatti` }}
        ctaSecondary={{ text: t('hero.edgeline.ctaSecondary'), link: `/${language}/stonecore-10` }}
        backgroundImage={heroImage}
      />

      {/* Vantaggi */}
      <section 
        className="section-spacing relative"
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
      <section className="section-spacing bg-card">
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
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-background border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <p className="text-muted-foreground text-xs">Immagine prodotto</p>
                  </div>
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">{product.title}</h3>
                <p className="text-muted-foreground text-sm">{product.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Finiture */}
      <section className="section-spacing">
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
              <motion.div
                key={finish}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="aspect-square rounded-xl bg-muted border-2 border-border hover:border-primary transition-colors flex items-center justify-center text-center p-4 cursor-pointer hover-lift"
              >
                <p className="text-sm font-medium text-foreground">{finish}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="section-spacing bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              {t('edgeline.ctaTitle')}
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
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