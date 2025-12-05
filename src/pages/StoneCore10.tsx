import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import FinishCard from "@/components/FinishCard";
import LayerDiagram from "@/components/LayerDiagram";
import MaterialPerformanceCard from "@/components/MaterialPerformanceCard";
import ScrollSection from "@/components/ScrollSection";
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
import finishAurora from "@/assets/finish-aurora.jpg";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";
import stonecoreLayers from "@/assets/stonecore-layers.png";
import { useTranslation } from "@/i18n/useTranslation";

const StoneCore10 = () => {
  const { t, language } = useTranslation();
  
  const advantages = [
    { icon: Droplets, title: t('stonecore.advantages.waterproof.title'), description: t('stonecore.advantages.waterproof.description') },
    { icon: Flame, title: t('stonecore.advantages.fireproof.title'), description: t('stonecore.advantages.fireproof.description') },
    { icon: Shield, title: t('stonecore.advantages.antimold.title'), description: t('stonecore.advantages.antimold.description') },
    { icon: Volume2, title: t('stonecore.advantages.acoustic.title'), description: t('stonecore.advantages.acoustic.description') },
    { icon: Zap, title: t('stonecore.advantages.floating.title'), description: t('stonecore.advantages.floating.description') },
    { icon: Layers, title: t('stonecore.advantages.stability.title'), description: t('stonecore.advantages.stability.description') },
  ];

  const finishes = [
    { name: t('stonecore.finishes.corteccia'), image: finishCorteccia },
    { name: t('stonecore.finishes.cenere'), image: "/placeholder.svg" },
    { name: t('stonecore.finishes.sabbia'), image: finishSabbia },
    { name: t('stonecore.finishes.silven'), image: finishSilven },
    { name: t('stonecore.finishes.terram'), image: finishTerram },
    { name: t('stonecore.finishes.perla'), image: finishPerla },
    { name: t('stonecore.finishes.velora'), image: finishVelora },
    { name: t('stonecore.finishes.aurora'), image: finishAurora },
  ];

  return (
    <div>
      <ScrollSection zIndex={1}>
        <HeroSection
          title={t('hero.stonecore.title')}
          subtitle={t('hero.stonecore.subtitle')}
          ctaPrimary={{ text: t('hero.stonecore.ctaPrimary'), link: `/${language}/contatti` }}
          ctaSecondary={{ text: t('hero.stonecore.ctaSecondary'), link: `/${language}/area-tecnica` }}
          backgroundImage={heroImage}
        />
      </ScrollSection>

      <ScrollSection zIndex={2}>
        <section className="section-spacing relative" style={{ backgroundImage: `url(${bgStoneCore})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="container-custom relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">{t('stonecore.advantagesTitle')}</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">{t('stonecore.advantagesSubtitle')}</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {advantages.map((advantage, index) => (<FeatureCard key={advantage.title} {...advantage} index={index} />))}
            </div>
          </div>
        </section>
      </ScrollSection>

      <ScrollSection zIndex={3}>
        <section className="section-spacing bg-background">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t('stonecore.finishesTitle')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('stonecore.finishesSubtitle')}</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {finishes.map((finish, index) => (<FinishCard key={finish.name} name={finish.name} image={finish.image} index={index} variant="image" />))}
            </div>
          </div>
        </section>
      </ScrollSection>

      <ScrollSection zIndex={4}>
        <section className="section-spacing bg-background">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t('stonecore.structureTitle')}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t('stonecore.structureSubtitle')}</p>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <img src={stonecoreLayers} alt="Struttura multistrato StoneCore 10" className="w-full h-auto rounded-[18px]" style={{ boxShadow: '0 4px 40px rgba(0, 0, 0, 0.08)' }} />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="h-full">
                <MaterialPerformanceCard />
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-12 max-w-2xl mx-auto">
              <LayerDiagram />
            </motion.div>
          </div>
        </section>
      </ScrollSection>

      <ScrollSection zIndex={5}>
        <section className="section-spacing bg-card">
          <div className="container-custom max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Tabs defaultValue="caratteristiche" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="caratteristiche">{t('stonecore.techTitle')}</TabsTrigger>
                  <TabsTrigger value="posa">{t('stonecore.techPosa')}</TabsTrigger>
                  <TabsTrigger value="manutenzione">{t('stonecore.techMaintenance')}</TabsTrigger>
                </TabsList>
                <TabsContent value="caratteristiche" className="mt-8">
                  <div className="rounded-2xl p-8 bg-gradient-to-b from-foreground/50 to-foreground/80" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                    <h3 className="text-xl font-heading font-semibold text-background mb-6">Specifiche tecniche</h3>
                    <ul className="space-y-3 text-background/85">
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Spessore totale: 10 mm (8,5 mm + 1,5 mm)</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Dimensioni plancia: 1220 x 180 mm</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Classe di reazione al fuoco: A2-s1, d0</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Resistenza all'acqua: IP68</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Resistenza all'abrasione: AC5</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Riduzione acustica: 19 dB</span></li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="posa" className="mt-8">
                  <div className="rounded-2xl p-8 bg-gradient-to-b from-foreground/50 to-foreground/80" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                    <h3 className="text-xl font-heading font-semibold text-background mb-6">Istruzioni di posa</h3>
                    <ul className="space-y-3 text-background/85">
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Sistema flottante senza colla</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Preparazione sottofondo: livellato e pulito</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Acclimatazione: 24-48 ore in ambiente</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Giunto perimetrale: 8-10 mm</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Totale assenza di fughe</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Calpestabile immediatamente dopo la posa</span></li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="manutenzione" className="mt-8">
                  <div className="rounded-2xl p-8 bg-gradient-to-b from-foreground/50 to-foreground/80" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                    <h3 className="text-xl font-heading font-semibold text-background mb-6">Cura e manutenzione</h3>
                    <ul className="space-y-3 text-background/85">
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Pulizia quotidiana: panno umido o aspirapolvere</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Detergenti neutri per macchie ostinate</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Evitare prodotti abrasivi o solventi aggressivi</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Protezioni in feltro sotto mobili pesanti</span></li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Nessuna ceratura o trattamento periodico necessario</span></li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>
      </ScrollSection>

      <ScrollSection zIndex={6}>
        <section className="section-spacing relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgCtaCollabora})` }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%)' }} />
          <div className="container-custom relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-white" style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}>{t('stonecore.ctaTitle')}</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90" style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}>{t('stonecore.ctaSubtitle')}</p>
              <Button asChild size="lg" variant="secondary"><Link to={`/${language}/area-tecnica`}>{t('stonecore.ctaButton')}</Link></Button>
            </motion.div>
          </div>
        </section>
      </ScrollSection>
    </div>
  );
};

export default StoneCore10;
