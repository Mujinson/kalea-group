import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import HitobaSection from "@/components/HitobaSection";
import FeatureCard from "@/components/FeatureCard";
import FinishCard from "@/components/FinishCard";
import LayerDiagram from "@/components/LayerDiagram";
import MaterialPerformanceCard from "@/components/MaterialPerformanceCard";
import CertificationsSection from "@/components/CertificationsSection";
import { Droplets, Flame, ShieldOff, AudioWaveform, Layers, ThermometerSun, Check } from "lucide-react";
import FloatingFloorIcon from "@/components/icons/FloatingFloorIcon";
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
    { icon: ShieldOff, title: t('stonecore.advantages.antimold.title'), description: t('stonecore.advantages.antimold.description') },
    { icon: AudioWaveform, title: t('stonecore.advantages.acoustic.title'), description: t('stonecore.advantages.acoustic.description') },
    { icon: FloatingFloorIcon, title: t('stonecore.advantages.floating.title'), description: t('stonecore.advantages.floating.description') },
    { icon: Layers, title: t('stonecore.advantages.stability.title'), description: t('stonecore.advantages.stability.description') },
  ];

  const finishes = [
    { name: t('stonecore.finishes.corteccia'), image: finishCorteccia, slug: 'corteccia' },
    { name: t('stonecore.finishes.cenere'), image: finishCorteccia, slug: 'cenere' },
    { name: t('stonecore.finishes.sabbia'), image: finishSabbia, slug: 'sabbia' },
    { name: t('stonecore.finishes.silven'), image: finishSilven, slug: 'silven' },
    { name: t('stonecore.finishes.terram'), image: finishTerram, slug: 'terram' },
    { name: t('stonecore.finishes.perla'), image: finishPerla, slug: 'perla' },
    { name: t('stonecore.finishes.velora'), image: finishVelora, slug: 'velora' },
    { name: t('stonecore.finishes.aurora'), image: finishAurora, slug: 'aurora' },
  ];

  return (
    <div className="bg-[#0a0a0a]">
      <HeroSection title={t('hero.stonecore.title')} subtitle={t('hero.stonecore.subtitle')} ctaPrimary={{ text: t('hero.stonecore.ctaPrimary'), link: `/${language}/contatti` }} ctaSecondary={{ text: t('hero.stonecore.ctaSecondary'), link: `/${language}/area-tecnica` }} backgroundImage={heroImage} />

      {/* Vantaggi */}
      <HitobaSection backgroundImage={bgStoneCore} overlayClassName="bg-black/35" zIndex={1} minHeight="min-h-screen">
        <div className="h-full flex items-center py-16">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">{t('stonecore.advantagesTitle')}</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">{t('stonecore.advantagesSubtitle')}</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {advantages.map((adv, i) => <motion.div key={adv.title} whileHover={{ y: -6, scale: 1.02 }}><FeatureCard {...adv} index={i} /></motion.div>)}
            </div>
          </div>
        </div>
      </HitobaSection>

      {/* Finiture */}
      <HitobaSection zIndex={2} minHeight="min-h-screen" bgColor="bg-background">
        <div className="h-full flex items-center py-16">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t('stonecore.finishesTitle')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('stonecore.finishesSubtitle')}</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {finishes.map((f, i) => <motion.div key={f.name} whileHover={{ y: -6, scale: 1.02 }}><FinishCard name={f.name} image={f.image} index={i} variant="image" slug={f.slug} /></motion.div>)}
            </div>
          </div>
        </div>
      </HitobaSection>

      {/* Schema multistrato */}
      <HitobaSection zIndex={3} minHeight="min-h-screen" bgColor="bg-background">
        <div className="h-full flex items-center py-16">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t('stonecore.structureTitle')}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t('stonecore.structureSubtitle')}</p>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}><img src={stonecoreLayers} alt="Struttura multistrato StoneCore 10" className="w-full h-auto rounded-[18px]" style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.08)' }} /></motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="h-full"><MaterialPerformanceCard /></motion.div>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 max-w-2xl mx-auto"><LayerDiagram /></motion.div>
          </div>
        </div>
      </HitobaSection>

      {/* Tabs tecnici */}
      <HitobaSection zIndex={4} minHeight="min-h-[600px]" bgColor="bg-card">
        <div className="h-full flex items-center py-16">
          <div className="container-custom max-w-4xl">
            <Tabs defaultValue="caratteristiche" className="w-full">
              <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="caratteristiche">{t('stonecore.techTitle')}</TabsTrigger><TabsTrigger value="posa">{t('stonecore.techPosa')}</TabsTrigger><TabsTrigger value="manutenzione">{t('stonecore.techMaintenance')}</TabsTrigger></TabsList>
              <TabsContent value="caratteristiche" className="mt-8"><div className="rounded-2xl p-8 bg-gradient-to-b from-foreground/50 to-foreground/80" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}><h3 className="text-xl font-heading font-semibold text-background mb-6">Specifiche tecniche</h3><ul className="space-y-3 text-background/85"><li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Spessore totale: 10 mm</span></li><li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Dimensioni plancia: 1220 x 180 mm</span></li><li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Classe di reazione al fuoco: A2-s1, d0</span></li></ul></div></TabsContent>
              <TabsContent value="posa" className="mt-8"><div className="rounded-2xl p-8 bg-gradient-to-b from-foreground/50 to-foreground/80"><h3 className="text-xl font-heading font-semibold text-background mb-6">Istruzioni di posa</h3><ul className="space-y-3 text-background/85"><li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Sistema flottante senza colla</span></li></ul></div></TabsContent>
              <TabsContent value="manutenzione" className="mt-8"><div className="rounded-2xl p-8 bg-gradient-to-b from-foreground/50 to-foreground/80"><h3 className="text-xl font-heading font-semibold text-background mb-6">Cura e manutenzione</h3><ul className="space-y-3 text-background/85"><li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-background/60 mt-2 flex-shrink-0" /><span>Pulizia quotidiana: panno umido</span></li></ul></div></TabsContent>
            </Tabs>
          </div>
        </div>
      </HitobaSection>

      {/* Certificazioni */}
      <HitobaSection zIndex={5} minHeight="min-h-[400px]" bgColor="bg-background"><div className="h-full"><CertificationsSection variant="compact" /></div></HitobaSection>

      {/* CTA finale */}
      <HitobaSection backgroundImage={bgCtaCollabora} overlayClassName="bg-gradient-to-b from-black/25 to-black/45" zIndex={6} minHeight="min-h-[500px]">
        <div className="h-full flex items-center justify-center py-16">
          <div className="container-custom text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white" style={{ textShadow: '0px 4px 16px rgba(0,0,0,0.55)' }}>Scopri StoneCore 10</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90" style={{ textShadow: '0px 4px 16px rgba(0,0,0,0.55)' }}>Richiedi informazioni o campioni per il tuo progetto</p>
              <Button asChild size="lg" variant="secondary"><Link to={`/${language}/contatti`}>Contattaci</Link></Button>
            </motion.div>
          </div>
        </div>
      </HitobaSection>
    </div>
  );
};

export default StoneCore10;