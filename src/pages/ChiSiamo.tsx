import { motion } from "framer-motion";
import FeatureCard from "@/components/FeatureCard";
import KaleaIntroSection from "@/components/KaleaIntroSection";
import ScrollSection from "@/components/ScrollSection";
import { Target, Lightbulb, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import fondatore1 from "@/assets/fondatore-1.png";
import fondatore2 from "@/assets/fondatore-2.png";
import aziendaTeam from "@/assets/azienda-team.png";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";

const ChiSiamo = () => {
  const { t, language } = useTranslation();
  
  const values = [
    {
      icon: Target,
      title: t('aboutUs.values.innovation.title'),
      description: t('aboutUs.values.innovation.description'),
    },
    {
      icon: Lightbulb,
      title: t('aboutUs.values.design.title'),
      description: t('aboutUs.values.design.description'),
    },
    {
      icon: Users,
      title: t('aboutUs.values.collaboration.title'),
      description: t('aboutUs.values.collaboration.description'),
    },
    {
      icon: Award,
      title: t('aboutUs.values.quality.title'),
      description: t('aboutUs.values.quality.description'),
    },
  ];

  const customers = [
    { 
      title: t('aboutUs.customers.architects.title'), 
      description: t('aboutUs.customers.architects.description')
    },
    { 
      title: t('aboutUs.customers.designers.title'), 
      description: t('aboutUs.customers.designers.description')
    },
    { 
      title: t('aboutUs.customers.builders.title'), 
      description: t('aboutUs.customers.builders.description')
    },
    { 
      title: t('aboutUs.customers.retailers.title'), 
      description: t('aboutUs.customers.retailers.description')
    },
  ];

  return (
    <div className="min-h-screen pt-20 overflow-hidden">
      {/* Hero */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="w-full px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
                {t('aboutUs.title')}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
                {t('aboutUs.intro1')}
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {t('aboutUs.intro2')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[16/10] rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={aziendaTeam} 
                  alt="Stabilimento produttivo Kalēa" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chi è Kalēa */}
      <ScrollSection>
        <KaleaIntroSection variant="about" />
      </ScrollSection>

      {/* Storia */}
      <ScrollSection>
        <section className="section-spacing">
          <div className="container-custom max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">{t('aboutUs.historyTitle')}</h2>
              
              {/* Founder Images */}
              <div className="flex justify-center gap-8 mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-48 h-48 rounded-lg overflow-hidden border-2 border-border shadow-lg"
                >
                  <img 
                    src={fondatore1} 
                    alt="Fondatore 1" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="w-48 h-48 rounded-lg overflow-hidden border-2 border-border shadow-lg"
                >
                  <img 
                    src={fondatore2} 
                    alt="Fondatore 2" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>

              <div className="space-y-6 text-left text-muted-foreground leading-relaxed">
                <p>{t('aboutUs.history1')}</p>
                <p>{t('aboutUs.history2')}</p>
                <p>{t('aboutUs.history3')}</p>
              </div>
            </motion.div>
          </div>
        </section>
      </ScrollSection>

      {/* Cosa ci guida */}
      <ScrollSection>
        <section className="section-spacing bg-card">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t('aboutUs.valuesTitle')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('aboutUs.valuesSubtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {values.map((value, index) => (
                <FeatureCard key={value.title} {...value} index={index} />
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Per chi lavoriamo */}
      <ScrollSection>
        <section className="section-spacing">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t('aboutUs.customersTitle')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('aboutUs.customersSubtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customers.map((customer, index) => (
                <motion.div
                  key={customer.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{
                    y: -6,
                    rotateX: 2,
                    rotateY: -2,
                    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
                  className="kalea-card relative overflow-hidden rounded-2xl"
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-foreground/85" />
                  <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 to-foreground/80" />
                  
                  <div className="relative z-10 p-8 md:p-10">
                    <h3 className="text-xl md:text-2xl font-heading font-semibold text-background mb-3">{customer.title}</h3>
                    <p className="text-background/80">{customer.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* CTA */}
      <ScrollSection>
        <section className="section-spacing relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bgCtaCollabora})` }}
          />
          {/* Gradient Overlay - lighter at top, darker at bottom */}
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
                {t('aboutUs.ctaTitle')}
              </h2>
              <p 
                className="text-lg mb-8 max-w-2xl mx-auto text-white/90"
                style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
              >
                {t('aboutUs.ctaSubtitle')}
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link to={`/${language}/contatti`}>{t('aboutUs.ctaButton')}</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </ScrollSection>
    </div>
  );
};

export default ChiSiamo;
