import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { Zap, Shield, Palette, Droplets, Flame, Clock, Grid3x3, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-onewall.jpg";
import bgOneWall from "@/assets/bg-onewall.jpg";
import bgOneWallApplications from "@/assets/bg-onewall-applications.jpg";
import { useTranslation } from "@/i18n/useTranslation";

const OneWall = () => {
  const { t, language } = useTranslation();
  
  const advantages = [
    {
      icon: Zap,
      title: t('onewall.advantages.fast.title'),
      description: t('onewall.advantages.fast.description'),
    },
    {
      icon: Shield,
      title: t('onewall.advantages.resistance.title'),
      description: t('onewall.advantages.resistance.description'),
    },
    {
      icon: Droplets,
      title: t('onewall.advantages.waterproof.title'),
      description: t('onewall.advantages.waterproof.description'),
    },
    {
      icon: Flame,
      title: t('onewall.advantages.fireproof.title'),
      description: t('onewall.advantages.fireproof.description'),
    },
    {
      icon: Palette,
      title: t('onewall.advantages.aesthetic.title'),
      description: t('onewall.advantages.aesthetic.description'),
    },
    {
      icon: Clock,
      title: t('onewall.advantages.maintenance.title'),
      description: t('onewall.advantages.maintenance.description'),
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: t('onewall.howItWorks.step1.title'),
      description: t('onewall.howItWorks.step1.description'),
    },
    {
      step: "2",
      title: t('onewall.howItWorks.step2.title'),
      description: t('onewall.howItWorks.step2.description'),
    },
    {
      step: "3",
      title: t('onewall.howItWorks.step3.title'),
      description: t('onewall.howItWorks.step3.description'),
    },
  ];

  const finishes = [
    { 
      name: t('onewall.finishes.wood.title'), 
      description: t('onewall.finishes.wood.description')
    },
    { 
      name: t('onewall.finishes.marble.title'), 
      description: t('onewall.finishes.marble.description')
    },
    { 
      name: t('onewall.finishes.concrete.title'), 
      description: t('onewall.finishes.concrete.description')
    },
    { 
      name: t('onewall.finishes.wallpaper.title'), 
      description: t('onewall.finishes.wallpaper.description')
    },
    { 
      name: t('onewall.finishes.decorative.title'), 
      description: t('onewall.finishes.decorative.description')
    },
  ];

  return (
    <div>
      {/* Hero */}
      <HeroSection
        title={t('hero.onewall.title')}
        subtitle={t('hero.onewall.subtitle')}
        ctaPrimary={{ text: t('hero.onewall.ctaPrimary'), link: `/${language}/contatti` }}
        ctaSecondary={{ text: t('hero.onewall.ctaSecondary'), link: `/${language}/area-tecnica` }}
        backgroundImage={heroImage}
      />

      {/* Come funziona */}
      <section className="section-spacing">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t('onewall.howItWorksTitle')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('onewall.howItWorksSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-heading font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Finiture */}
      <section className="section-spacing bg-card">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('onewall.finishesTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('onewall.finishesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finishes.map((finish, index) => (
              <motion.div
                key={finish.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="kalea-card group bg-background border border-border rounded-xl overflow-hidden"
              >
                <div className="aspect-video bg-muted">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <p className="text-muted-foreground text-xs">Immagine finitura</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-2">{finish.name}</h3>
                  <p className="text-muted-foreground text-sm">{finish.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vantaggi tecnici */}
      <section 
        className="section-spacing relative"
        style={{
          backgroundImage: `url(${bgOneWall})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay scuro */}
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">{t('onewall.advantagesTitle')}</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {t('onewall.advantagesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {advantages.map((advantage, index) => (
              <FeatureCard key={advantage.title} {...advantage} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Applicazioni */}
      <section 
        className="section-spacing relative py-24"
        style={{
          backgroundImage: `url(${bgOneWallApplications})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/25" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              {t('onewall.applicationsTitle')}
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {t('onewall.applicationsSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: Grid3x3,
                title: "Pareti divisorie architettoniche",
                description: "Soluzione ideale per creare ambienti flessibili e leggeri in uffici, abitazioni e spazi commerciali.",
              },
              {
                icon: Droplets,
                title: "Pareti di rivestimento impermeabili",
                description: "Perfette in bagni e cucine grazie alla totale resistenza all'umidità e alla stabilità nel tempo.",
              },
              {
                icon: Layers,
                title: "Controsoffitti e pannellature tecniche",
                description: "Installazione rapida, finitura immediata e prestazioni superiori rispetto al cartongesso tradizionale.",
              },
              {
                icon: Sparkles,
                title: "Pareti decorative e accent walls",
                description: "Per creare elementi scenografici in reception, showroom, hotel e zone living.",
              },
            ].map((application, index) => (
              <FeatureCard 
                key={application.title} 
                icon={application.icon}
                title={application.title}
                description={application.description}
                index={index}
              />
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
              {t('onewall.ctaTitle')}
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              {t('onewall.ctaSubtitle')}
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to={`/${language}/contatti`}>{t('onewall.ctaButton')}</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OneWall;