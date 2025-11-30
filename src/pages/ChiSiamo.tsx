import { motion } from "framer-motion";
import FeatureCard from "@/components/FeatureCard";
import KaleaIntroSection from "@/components/KaleaIntroSection";
import { Target, Lightbulb, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";

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
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="section-spacing bg-gradient-to-b from-muted/30 to-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
                {t('aboutUs.title')}
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {t('aboutUs.intro1')}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('aboutUs.intro2')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl bg-muted overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Immagine azienda / team</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chi è Kalēa */}
      <KaleaIntroSection variant="about" />

      {/* Storia */}
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
            <div className="space-y-6 text-left text-muted-foreground leading-relaxed">
              <p>{t('aboutUs.history1')}</p>
              <p>{t('aboutUs.history2')}</p>
              <p>{t('aboutUs.history3')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cosa ci guida */}
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

      {/* Per chi lavoriamo */}
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
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="kalea-card bg-card border border-border rounded-xl p-8"
              >
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">{customer.title}</h3>
                <p className="text-muted-foreground">{customer.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">{t('aboutUs.ctaTitle')}</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
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