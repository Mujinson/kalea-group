import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { Droplets, Flame, Shield, Volume2, Zap, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-stonecore.jpg";
import bgStoneCore from "@/assets/bg-stonecore.jpg";
import finishCorteccia from "@/assets/finish-corteccia.jpg";
import finishSabbia from "@/assets/finish-sabbia.jpg";
import finishSilven from "@/assets/finish-silven.jpg";
import finishTerram from "@/assets/finish-terram.jpg";
import finishPerla from "@/assets/finish-perla.jpg";
import finishVelora from "@/assets/finish-velora.jpg";
import { useTranslation } from "@/i18n/useTranslation";

const StoneCore10 = () => {
  const { t, language } = useTranslation();
  
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
      icon: Shield,
      title: t('stonecore.advantages.antimold.title'),
      description: t('stonecore.advantages.antimold.description'),
    },
    {
      icon: Volume2,
      title: t('stonecore.advantages.acoustic.title'),
      description: t('stonecore.advantages.acoustic.description'),
    },
    {
      icon: Zap,
      title: t('stonecore.advantages.floating.title'),
      description: t('stonecore.advantages.floating.description'),
    },
    {
      icon: Layers,
      title: t('stonecore.advantages.stability.title'),
      description: t('stonecore.advantages.stability.description'),
    },
  ];

  const finishes = [
    { name: t('stonecore.finishes.corteccia'), image: finishCorteccia },
    { name: t('stonecore.finishes.cenere'), image: "/placeholder.svg" },
    { name: t('stonecore.finishes.sabbia'), image: finishSabbia },
    { name: t('stonecore.finishes.silven'), image: finishSilven },
    { name: t('stonecore.finishes.terram'), image: finishTerram },
    { name: t('stonecore.finishes.perla'), image: finishPerla },
    { name: t('stonecore.finishes.velora'), image: finishVelora },
    { name: t('stonecore.finishes.aurora'), image: "/placeholder.svg" },
  ];

  return (
    <div>
      {/* Hero */}
      <HeroSection
        title={t('hero.stonecore.title')}
        subtitle={t('hero.stonecore.subtitle')}
        ctaPrimary={{ text: t('hero.stonecore.ctaPrimary'), link: `/${language}/contatti` }}
        ctaSecondary={{ text: t('hero.stonecore.ctaSecondary'), link: `/${language}/area-tecnica` }}
        backgroundImage={heroImage}
      />

      {/* Schema multistrato */}
      <section className="section-spacing bg-background" style={{ zIndex: 1 }}>
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
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('stonecore.structureSubtitle')}
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-3">
              {[
                { label: t('stonecore.layers.decorative'), height: "h-8", bg: "bg-secondary" },
                { label: t('stonecore.layers.wear'), height: "h-6", bg: "bg-primary/30" },
                { label: t('stonecore.layers.core'), height: "h-32", bg: "bg-primary" },
                { label: t('stonecore.layers.mat'), height: "h-4", bg: "bg-muted" },
              ].map((layer, index) => (
                <motion.div
                  key={layer.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${layer.height} ${layer.bg} rounded-lg flex items-center px-6 text-foreground font-medium`}
                >
                  {layer.label}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vantaggi */}
      <section 
        className="section-spacing section-overlap relative"
        style={{
          zIndex: 2,
          backgroundImage: `url(${bgStoneCore})`,
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
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              {t('stonecore.advantagesTitle')}
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
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

      {/* Finiture */}
      <section className="section-spacing section-overlap bg-background" style={{ zIndex: 3 }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('stonecore.finishesTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('stonecore.finishesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {finishes.map((finish, index) => (
              <motion.div
                key={finish.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-border/40 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Image background with zoom effect */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${finish.image})` }}
                />
                
                {/* Bottom gradient overlay with name */}
                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center pb-4">
                  <p className="text-base md:text-lg font-heading font-medium text-white tracking-wide">
                    {finish.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs tecnici */}
      <section className="section-spacing section-overlap bg-card" style={{ zIndex: 4 }}>
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

              <TabsContent value="caratteristiche" className="mt-8 space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-4">Specifiche tecniche</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Spessore totale: 10 mm (8,5 mm + 1,5 mm)</li>
                    <li>Dimensioni plancia: 1220 x 180 mm</li>
                    <li>Classe di reazione al fuoco: A2-s1, d0</li>
                    <li>Resistenza all'acqua: IP68</li>
                    <li>Resistenza all'abrasione: AC5</li>
                    <li>Riduzione acustica: 19 dB</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="posa" className="mt-8 space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-4">Istruzioni di posa</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Sistema flottante senza colla</li>
                    <li>Preparazione sottofondo: livellato e pulito</li>
                    <li>Acclimatazione: 24-48 ore in ambiente</li>
                    <li>Giunto perimetrale: 8-10 mm</li>
                    <li>Posa a spina di pesce o dritta</li>
                    <li>Calpestabile immediatamente dopo la posa</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="manutenzione" className="mt-8 space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-4">Cura e manutenzione</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Pulizia quotidiana: panno umido o aspirapolvere</li>
                    <li>Detergenti neutri per macchie ostinate</li>
                    <li>Evitare prodotti abrasivi o solventi aggressivi</li>
                    <li>Protezioni in feltro sotto mobili pesanti</li>
                    <li>Nessuna ceratura o trattamento periodico necessario</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* CTA Download */}
      <section className="section-spacing section-overlap bg-background" style={{ zIndex: 5 }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">{t('stonecore.ctaTitle')}</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              {t('stonecore.ctaSubtitle')}
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to={`/${language}/area-tecnica`}>{t('stonecore.ctaButton')}</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StoneCore10;