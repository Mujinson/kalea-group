import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { Layers, Shield, Sparkles, Home as HomeIcon, Building2, ShoppingBag, Briefcase, Leaf, Clock, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-home.jpg";
import bgProducts from "@/assets/bg-products.jpg";
import { useTranslation } from "@/i18n/useTranslation";

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

  const mgoAdvantages = [
    { icon: Shield, text: t('home.mgoAdvantages.fireproof') },
    { icon: Layers, text: t('home.mgoAdvantages.waterproof') },
    { icon: Sparkles, text: t('home.mgoAdvantages.stability') },
    { icon: Shield, text: t('home.mgoAdvantages.antimold') },
    { icon: Layers, text: t('home.mgoAdvantages.acoustic') },
    { icon: Sparkles, text: t('home.mgoAdvantages.floating') },
  ];

  const applications = [
    { icon: HomeIcon, title: t('home.applications.residential.title'), description: t('home.applications.residential.description') },
    { icon: Building2, title: t('home.applications.hospitality.title'), description: t('home.applications.hospitality.description') },
    { icon: ShoppingBag, title: t('home.applications.retail.title'), description: t('home.applications.retail.description') },
    { icon: Briefcase, title: t('home.applications.offices.title'), description: t('home.applications.offices.description') },
  ];

  const sustainability = [
    { icon: Leaf, title: t('home.sustainability.impact.title'), description: t('home.sustainability.impact.description') },
    { icon: Clock, title: t('home.sustainability.durability.title'), description: t('home.sustainability.durability.description') },
    { icon: Wrench, title: t('home.sustainability.maintenance.title'), description: t('home.sustainability.maintenance.description') },
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
          <img src={bgProducts} alt="" className="w-full h-full object-cover" />
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

      {/* Perché MgO */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">{t('home.mgoTitle')}</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t('home.mgoDescription')}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {mgoAdvantages.map((advantage, index) => (
                  <motion.div
                    key={advantage.text}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <advantage.icon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-foreground">{advantage.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <Button asChild variant="default">
                  <Link to={`/${language}/area-tecnica`}>{t('home.mgoButton')}</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-muted overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Schema comparativo MgO</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Applicazioni */}
      <section className="section-spacing bg-card">
        <div className="container-custom">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {applications.map((app, index) => (
              <motion.div
                key={app.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative aspect-square rounded-2xl bg-muted overflow-hidden hover-lift"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/80" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <app.icon className="w-12 h-12 text-background mb-4" />
                  <h3 className="text-xl font-heading font-semibold text-background mb-2">{app.title}</h3>
                  <p className="text-sm text-background/80">{app.description}</p>
                </div>
              </motion.div>
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
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative aspect-square rounded-2xl bg-muted overflow-hidden hover-lift"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/80" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <item.icon className="w-12 h-12 text-background mb-4" />
                  <h3 className="text-xl font-heading font-semibold text-background mb-2">{item.title}</h3>
                  <p className="text-sm text-background/80">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="section-spacing bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">
              {t('home.ctaTitle')}
            </h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto opacity-90">
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
                to={`/${language}/chi-siamo`}
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
