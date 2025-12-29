import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import FeatureCard from "@/components/FeatureCard";
import AnimatedTitle from "@/components/AnimatedTitle";
import ColorCircleGallery, { stonecoreColors } from "@/components/ColorCircleGallery";
import LayerDiagram from "@/components/LayerDiagram";
import MaterialPerformanceCard from "@/components/MaterialPerformanceCard";
import CertificationsSection from "@/components/CertificationsSection";
import { Droplets, Flame, ShieldOff, AudioWaveform, Layers, ThermometerSun, Check, ChevronDown } from "lucide-react";
import FloatingFloorIcon from "@/components/icons/FloatingFloorIcon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-stonecore.jpg";
import bgStoneCore from "@/assets/bg-stonecore.jpg";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";
import stonecoreLayers from "@/assets/stonecore-layers.png";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";

const BiomagFloor = () => {
  const { t, language } = useTranslation();
  const isMobile = useIsMobile();
  
  // Refs for scroll tracking
  const heroRef = useRef<HTMLDivElement>(null);
  const advantagesRef = useRef<HTMLDivElement>(null);
  const finishesRef = useRef<HTMLDivElement>(null);
  const structureRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const heatingRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Hero scroll effects
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroScale = useTransform(heroProgress, [0, 1], isMobile ? [1, 0.96] : [1, 0.88]);
  const heroBorderRadius = useTransform(heroProgress, [0, 0.5], ["0px", isMobile ? "16px" : "28px"]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.3], [1, 0]);
  const heroContentY = useTransform(heroProgress, [0, 0.4], [0, isMobile ? -40 : -80]);
  const heroImageY = useTransform(heroProgress, [0, 1], ["0%", isMobile ? "8%" : "15%"]);

  // Advantages section scroll effects
  const { scrollYProgress: advantagesProgress } = useScroll({
    target: advantagesRef,
    offset: ["start end", "end start"],
  });
  
  const advantagesScale = useTransform(advantagesProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const advantagesBorderRadius = useTransform(advantagesProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);
  const advantagesOpacity = useTransform(advantagesProgress, [0, 0.15, 0.85, 1], [0.7, 1, 1, 0.7]);

  // Finishes section scroll effects
  const { scrollYProgress: finishesProgress } = useScroll({
    target: finishesRef,
    offset: ["start end", "end start"],
  });
  
  const finishesScale = useTransform(finishesProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const finishesBorderRadius = useTransform(finishesProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

  // Structure section scroll effects
  const { scrollYProgress: structureProgress } = useScroll({
    target: structureRef,
    offset: ["start end", "end start"],
  });
  
  const structureScale = useTransform(structureProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const structureBorderRadius = useTransform(structureProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

  // Tech section scroll effects
  const { scrollYProgress: techProgress } = useScroll({
    target: techRef,
    offset: ["start end", "end start"],
  });
  
  const techScale = useTransform(techProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const techBorderRadius = useTransform(techProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

  // Heating section scroll effects
  const { scrollYProgress: heatingProgress } = useScroll({
    target: heatingRef,
    offset: ["start end", "end start"],
  });
  
  const heatingScale = useTransform(heatingProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const heatingBorderRadius = useTransform(heatingProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

  // CTA section scroll effects
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  
  const ctaScale = useTransform(ctaProgress, [0, 0.3, 0.7, 1], isMobile ? [0.98, 1, 1, 0.98] : [0.94, 1, 1, 0.92]);
  const ctaBorderRadius = useTransform(ctaProgress, [0, 0.2, 0.8, 1], ["20px", "0px", "0px", "24px"]);

  const advantages = [
    {
      icon: Droplets,
      title: t('stonecore.advantages.waterproof.title'),
      description: t('stonecore.advantages.waterproof.description'),
    },
    {
      icon: Flame,
      title: t('stonecore.advantages.fireproof.title'),
      description: t('stonecore.advantages.fireproof.description'),
    },
    {
      icon: ShieldOff,
      title: t('stonecore.advantages.antimold.title'),
      description: t('stonecore.advantages.antimold.description'),
    },
    {
      icon: AudioWaveform,
      title: t('stonecore.advantages.acoustic.title'),
      description: t('stonecore.advantages.acoustic.description'),
    },
    {
      icon: FloatingFloorIcon,
      title: t('stonecore.advantages.floating.title'),
      description: t('stonecore.advantages.floating.description'),
    },
    {
      icon: Layers,
      title: t('stonecore.advantages.stability.title'),
      description: t('stonecore.advantages.stability.description'),
    },
  ];


  return (
    <div className="relative bg-background">
      {/* Hero Section - Sticky with scroll shrink effect */}
      <section ref={heroRef} className="relative h-screen sticky top-0 z-[0]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: heroScale,
            borderRadius: heroBorderRadius,
          }}
        >
          <motion.img 
            src={heroImage} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{ 
              y: heroImageY,
              scale: 1.1,
            }}
            initial={{ filter: "blur(10px)", scale: 1.15 }}
            animate={{ filter: "blur(0px)", scale: 1.1 }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </motion.div>

        {/* Hero Content - positioned at bottom to avoid logo overlap */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 md:pb-32">
          <motion.div 
            style={{ opacity: heroContentOpacity, y: heroContentY }} 
            className="container-custom text-center will-change-transform"
          >
            <div className="max-w-4xl mx-auto">
              <AnimatedTitle
                text={t('hero.stonecore.title')}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight"
              />

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto"
              >
                {t('hero.stonecore.subtitle')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
              >
                <Link 
                  to={`/${language}/contatti`}
                  className="group inline-flex items-center justify-center gap-2 bg-white text-[#111] text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
                >
                  {t('hero.stonecore.ctaPrimary')}
                </Link>
                <Link 
                  to={`/${language}/area-tecnica`}
                  className="inline-flex items-center justify-center gap-2 border border-white/30 text-white text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-white/10 transition-all duration-150"
                >
                  {t('hero.stonecore.ctaSecondary')}
                </Link>
              </motion.div>

              {/* Scroll indicator */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                style={{ opacity: heroContentOpacity }}
              >
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex justify-center"
                >
                  <ChevronDown className="w-6 h-6 text-white/60" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Finiture Section - Normal scroll */}
      <section ref={finishesRef} className="relative z-[1] bg-background py-20">
        <div className="container-custom">
          <ColorCircleGallery 
            title={t('stonecore.finishesTitle')}
            subtitle={t('stonecore.finishesSubtitle')}
            colors={stonecoreColors}
          />
        </div>
      </section>

      {/* Vantaggi Section - Normal scroll */}
      <section ref={advantagesRef} className="relative z-[2] bg-background py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('stonecore.advantagesTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('stonecore.advantagesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {advantages.map((advantage, index) => (
              <FeatureCard key={advantage.title} {...advantage} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Schema multistrato Section - Normal scroll */}
      <section ref={structureRef} className="relative z-[3] bg-background py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('stonecore.structureTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('stonecore.structureSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center"
            >
              <img 
                src={stonecoreLayers} 
                alt="Struttura multistrato StoneCore 10" 
                className="w-auto max-w-full h-auto max-h-[325px] object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-full"
            >
              <MaterialPerformanceCard />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <LayerDiagram />
          </motion.div>
        </div>
      </section>

      {/* Tabs tecnici Section - Normal scroll */}
      <section ref={techRef} className="relative z-[4] bg-background py-20">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Tabs defaultValue="caratteristiche" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="caratteristiche">{t('stonecore.techTitle')}</TabsTrigger>
                <TabsTrigger value="posa">{t('stonecore.techPosa')}</TabsTrigger>
                <TabsTrigger value="manutenzione">{t('stonecore.techMaintenance')}</TabsTrigger>
              </TabsList>

              <TabsContent value="caratteristiche" className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl p-8 bg-card-surface"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
                >
                  <h3 className="text-xl font-heading font-semibold text-white mb-6">Specifiche tecniche</h3>
                  <ul className="space-y-3 text-white font-medium">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Spessore totale: 10 mm (8,5 mm + 1,5 mm)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Dimensioni plancia: 1220 x 180 mm</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Classe di reazione al fuoco: A2-s1, d0</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Resistenza all'acqua: IP68</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Resistenza all'abrasione: AC5</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Riduzione acustica: 19 dB</span>
                    </li>
                  </ul>
                </motion.div>
              </TabsContent>

              <TabsContent value="posa" className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl p-8 bg-card-surface"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
                >
                  <h3 className="text-xl font-heading font-semibold text-white mb-6">Istruzioni di posa</h3>
                  <ul className="space-y-3 text-white font-medium">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Sistema flottante senza colla</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Preparazione sottofondo: livellato e pulito</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Acclimatazione: 24-48 ore in ambiente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Giunto perimetrale: 8-10 mm</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Totale assenza di fughe</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Calpestabile immediatamente dopo la posa</span>
                    </li>
                  </ul>
                </motion.div>
              </TabsContent>

              <TabsContent value="manutenzione" className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl p-8 bg-card-surface"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
                >
                  <h3 className="text-xl font-heading font-semibold text-white mb-6">Cura e manutenzione</h3>
                  <ul className="space-y-3 text-white font-medium">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Pulizia quotidiana: panno umido o aspirapolvere</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Detergenti neutri per macchie ostinate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Evitare prodotti abrasivi o solventi aggressivi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Protezioni in feltro sotto mobili pesanti</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" />
                      <span>Nessuna ceratura o trattamento periodico necessario</span>
                    </li>
                  </ul>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Riscaldamento a pavimento Section - Normal scroll */}
      <section ref={heatingRef} className="relative z-[5] bg-background py-20">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <ThermometerSun className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Perfetto per impianti di riscaldamento a pavimento
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              StoneCore 10 è particolarmente indicato per l'utilizzo con impianti di riscaldamento a pavimento grazie alla sua elevata conducibilità e stabilità termica.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="prose prose-lg max-w-none text-center mb-12"
          >
            <p className="text-lg text-muted-foreground leading-relaxed">
              L'ossido di magnesio permette una trasmissione uniforme del calore, trattenendolo più a lungo rispetto a molti pavimenti tradizionali. Questo si traduce in un comfort superiore e in un risparmio energetico reale nel tempo, poiché l'impianto lavora in modo più efficiente.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl p-8 bg-card-surface"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <h3 className="text-xl font-heading font-semibold text-white mb-6">
              Perché è migliore
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white font-medium">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Distribuzione del calore più omogenea</span>
              </li>
              <li className="flex items-start gap-3 text-white font-medium">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Minore dispersione termica</span>
              </li>
              <li className="flex items-start gap-3 text-white font-medium">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Superficie sempre confortevole</span>
              </li>
              <li className="flex items-start gap-3 text-white font-medium">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Riduzione dei consumi energetici nel lungo periodo</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 p-6 rounded-2xl bg-card border border-border text-center"
          >
            <p className="text-lg text-foreground italic">
              Un pavimento che lavora insieme all'impianto, non contro di esso.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Download Section - Normal scroll */}
      <section ref={ctaRef} className="relative z-[6] bg-background">
        <div className="absolute inset-0">
          <img 
            src={bgCtaCollabora} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%)' 
            }}
          />
        </div>

        <div className="relative z-10 py-32 md:py-40">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 
                className="text-3xl md:text-4xl font-heading font-bold mb-4 text-white"
                style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
              >
                {t('stonecore.ctaTitle')}
              </h2>
              <p 
                className="text-lg mb-8 max-w-2xl mx-auto text-white/90"
                style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
              >
                {t('stonecore.ctaSubtitle')}
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link to={`/${language}/area-tecnica`}>{t('stonecore.ctaButton')}</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certificazioni */}
      <div className="relative z-[7] bg-background">
        <CertificationsSection variant="compact" />
      </div>
    </div>
  );
};

export default BiomagFloor;
