import { motion } from "framer-motion";
import FeatureCard from "@/components/FeatureCard";
import HeroSection from "@/components/HeroSection";
import { Target, Lightbulb, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import fondatore1 from "@/assets/fondatore-1.png";
import fondatore2 from "@/assets/fondatore-2.png";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";
import heroChiSiamo from "@/assets/hero-chi-siamo.webp";

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
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection
        title={t('aboutUs.title')}
        subtitle=""
        backgroundImage={heroChiSiamo}
        backgroundPosition="center 40%"
        overlayClassName="bg-gradient-to-b from-black/30 via-black/10 to-black/30"
        minHeight="min-h-[50vh]"
      />

      {/* Storia */}
      <section className="section-spacing bg-background">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-foreground mb-6">{t('aboutUs.historyTitle')}</h2>
            
            {/* Founder Images */}
            <div className="flex justify-center gap-6 md:gap-10 mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-border shadow-md mb-2">
                  <img 
                    src={fondatore1} 
                    alt="Andrea Facchinetti - Co-fondatore Kalēa®" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm md:text-base text-foreground font-medium">Andrea Facchinetti</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-border shadow-md mb-2">
                  <img 
                    src={fondatore2} 
                    alt="Gabriel Vladu - Co-fondatore Kalēa®" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm md:text-base text-foreground font-medium">Gabriel Vladu</span>
              </motion.div>
            </div>

            <div className="space-y-6 text-center text-muted-foreground max-w-3xl mx-auto">
              <p className="whitespace-pre-line font-medium text-foreground">{t('aboutUs.historyIntro')}</p>
              <p className="whitespace-pre-line">{t('aboutUs.historyAndrea')}</p>
              <p className="whitespace-pre-line">{t('aboutUs.historyGabriel')}</p>
              <p className="whitespace-pre-line italic text-foreground/80">{t('aboutUs.historyQuestions')}</p>
              <p className="whitespace-pre-line">{t('aboutUs.historyIntuition')}</p>
              <p className="whitespace-pre-line">{t('aboutUs.historyMgo')}</p>
              <p className="whitespace-pre-line">{t('aboutUs.historyJourney')}</p>
              <p className="whitespace-pre-line font-medium text-foreground">{t('aboutUs.historyResult')}</p>
              <p className="whitespace-pre-line font-medium text-foreground">{t('aboutUs.historyProducts')}</p>
              <p className="whitespace-pre-line">{t('aboutUs.historySystem')}</p>
              <p className="whitespace-pre-line font-medium text-foreground">{t('aboutUs.historyToday')}</p>
              <p className="whitespace-pre-line text-left inline-block">{t('aboutUs.historyValues')}</p>
              <p className="whitespace-pre-line">{t('aboutUs.historyProfessionals')}</p>
              <p className="whitespace-pre-line font-semibold text-foreground">{t('aboutUs.historyConclusion')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cosa ci guida */}
      <section className="section-spacing bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-foreground mb-4">{t('aboutUs.valuesTitle')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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

      {/* Per chi lavoriamo */}
      <section className="section-spacing bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-foreground mb-4">{t('aboutUs.customersTitle')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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
                {/* Background beige */}
                <div className="absolute inset-0 bg-card-surface" />
                
                <div className="relative z-10 p-8 md:p-10">
                  <h3 className="text-xl md:text-2xl font-heading font-semibold text-white mb-3">{customer.title}</h3>
                  <p className="text-white font-medium">{customer.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing relative overflow-hidden bg-background">
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
              className="font-heading mb-6 text-white"
              style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
            >
              {t('aboutUs.ctaTitle')}
            </h2>
            <p 
              className="mb-8 max-w-2xl mx-auto text-white/90"
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
    </div>
  );
};

export default ChiSiamo;