import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import FeatureCard from "@/components/FeatureCard";
import AnimatedTitle from "@/components/AnimatedTitle";
import CertificationsSection from "@/components/CertificationsSection";
import ColorCircleGallery, { cwcColors } from "@/components/ColorCircleGallery";
import { Leaf, Recycle, Heart, AudioWaveform, Layers, Shield, Check, ChevronDown, Droplets, ThermometerSun } from "lucide-react";
import FloatingFloorIcon from "@/components/icons/FloatingFloorIcon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/product-biocore-floor.jpg";
import bgStoneCore from "@/assets/bg-stonecore.jpg";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";
import bgAtossicoCard from "@/assets/bg-atossico-card.png";
import bgBiodegradabileCard from "@/assets/bg-biodegradabile-card.png";
import bgComfortCard from "@/assets/bg-comfort-card.png";
import bgAcusticaCard from "@/assets/bg-acustica-card.png";
import bgNoPlasticCard from "@/assets/bg-no-plastic-card.png";
import bgStabilitaCard from "@/assets/bg-stabilita-card.png";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";

const BiocoreFloor = () => {
  const { language } = useTranslation();
  const isMobile = useIsMobile();
  
  // Refs for scroll tracking
  const heroRef = useRef<HTMLDivElement>(null);
  const advantagesRef = useRef<HTMLDivElement>(null);
  const structureRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const applicationsRef = useRef<HTMLDivElement>(null);
  const whyKaleaRef = useRef<HTMLDivElement>(null);
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

  // Structure section scroll effects  
  const { scrollYProgress: structureProgress } = useScroll({
    target: structureRef,
    offset: ["start end", "end start"],
  });

  // Tech section scroll effects
  const { scrollYProgress: techProgress } = useScroll({
    target: techRef,
    offset: ["start end", "end start"],
  });

  // Applications section scroll effects
  const { scrollYProgress: applicationsProgress } = useScroll({
    target: applicationsRef,
    offset: ["start end", "end start"],
  });

  // Why Kalea section scroll effects
  const { scrollYProgress: whyKaleaProgress } = useScroll({
    target: whyKaleaRef,
    offset: ["start end", "end start"],
  });

  // CTA section scroll effects
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });

  const advantages = [
    {
      icon: Leaf,
      title: "Completamente atossico",
      description: "Privo di sostanze nocive per la salute. Ideale per ambienti abitativi e professionali attenti al benessere.",
    },
    {
      icon: Shield,
      title: "Privo di plastica e PVC",
      description: "Materiale naturale senza componenti plastici o sintetici tossici.",
    },
    {
      icon: Recycle,
      title: "Materiale biodegradabile",
      description: "Composizione eco-sostenibile con fibre naturali e leganti di origine vegetale.",
    },
    {
      icon: Heart,
      title: "Elevato comfort di calpestio",
      description: "Sensazione naturale e piacevole ad ogni passo. Superficie calda e accogliente.",
    },
    {
      icon: AudioWaveform,
      title: "Ottime prestazioni acustiche",
      description: "Riduzione efficace della trasmissione del rumore per ambienti più silenziosi.",
    },
    {
      icon: Layers,
      title: "Stabilità dimensionale avanzata",
      description: "Non si espande né si contrae. Perfetto per grandi superfici continue.",
    },
  ];

  const layers = [
    {
      name: "Strato protettivo naturale anti-usura",
      description: "Protezione superficiale resistente, priva di sostanze nocive.",
    },
    {
      name: "Strato decorativo ad alta definizione",
      description: "Effetto legno realistico con resa naturale e profonda.",
    },
    {
      name: "Core in fibre di legno e carbonio",
      description: "Composito naturale di fibre di legno, carbonio e leganti naturali per stabilità e comfort.",
    },
    {
      name: "Strato di bilanciamento inferiore",
      description: "Garantisce planarità, durata e posa flottante stabile.",
    },
  ];

  const applications = [
    { title: "Abitazioni private", description: "Ambienti domestici attenti alla salubrità" },
    { title: "Spazi commerciali", description: "Showroom e negozi eco-consapevoli" },
    { title: "Uffici", description: "Ambienti di lavoro sostenibili" },
    { title: "Boutique", description: "Spazi retail di alta gamma" },
    { title: "Hospitality", description: "Hotel e strutture ricettive green" },
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
            alt="Pavimenti BIOCORE® naturale evoluto"
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
                text="Pavimenti BIOCORE®"
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight"
              />

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto"
              >
                BIOCORE® (pavimento naturale evoluto con fibre di legno e carbonio). Pavimenti di nuova generazione progettati per unire prestazioni tecniche, comfort ed ecosostenibilità.
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
                  Richiedi campioni
                </Link>
                <Link 
                  to={`/${language}/area-tecnica`}
                  className="inline-flex items-center justify-center gap-2 border border-white/30 text-white text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-white/10 transition-all duration-150"
                >
                  Scarica scheda tecnica
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

      {/* Descrizione del materiale Section */}
      <section className="relative z-[1] bg-background py-20">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
              Il materiale del futuro
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-lg leading-relaxed mb-6">
                I pavimenti KALĒA BIOCORE® sono realizzati con fibre di legno selezionate, componenti a base di carbonio e leganti naturali, senza plastica, senza PVC e senza sostanze tossiche.
              </p>
              <p className="text-lg leading-relaxed">
                Il core strutturale utilizza resine di origine naturale come legante, rendendo il pavimento atossico, eco-sostenibile e biodegradabile, ideale per ambienti abitativi e professionali attenti alla salute e all'impatto ambientale.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Struttura multistrato Section */}
      <section ref={structureRef} className="relative z-[2] bg-background py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Struttura multistrato
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Ogni tavola BIOCORE® è progettata per offrire stabilità, comfort e prestazioni durature nel tempo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {layers.map((layer, index) => (
              <motion.div
                key={layer.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card-surface"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-white mb-2">{layer.name}</h3>
                    <p className="text-sm text-white/80 font-medium">{layer.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collezione Section */}
      <section className="relative z-[3] bg-background py-20">
        <div className="container-custom">
          <ColorCircleGallery 
            title="La Collezione BIOCORE®"
            subtitle="Sette tonalità naturali ispirate alle essenze del legno, per ogni stile abitativo"
            colors={cwcColors}
          />
        </div>
      </section>

      {/* Vantaggi Section */}
      <section ref={advantagesRef} className="relative z-[3] bg-background py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Vantaggi principali
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un pavimento naturale progettato per il benessere e la sostenibilità
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {advantages.map((advantage, index) => (
              <FeatureCard 
                key={advantage.title} 
                {...advantage} 
                index={index} 
                backgroundImage={
                  advantage.title === "Completamente atossico" ? bgAtossicoCard : 
                  advantage.title === "Privo di plastica e PVC" ? bgNoPlasticCard :
                  advantage.title === "Materiale biodegradabile" ? bgBiodegradabileCard : 
                  advantage.title === "Elevato comfort di calpestio" ? bgComfortCard :
                  advantage.title === "Ottime prestazioni acustiche" ? bgAcusticaCard :
                  advantage.title === "Stabilità dimensionale avanzata" ? bgStabilitaCard :
                  undefined
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Prestazioni tecniche Section */}
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
                <TabsTrigger value="caratteristiche">Prestazioni</TabsTrigger>
                <TabsTrigger value="posa">Posa</TabsTrigger>
                <TabsTrigger value="manutenzione">Manutenzione</TabsTrigger>
              </TabsList>

              <TabsContent value="caratteristiche" className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl p-8 bg-card-surface"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
                >
                  <h3 className="text-xl font-heading font-semibold text-white mb-6">Prestazioni tecniche</h3>
                  <ul className="space-y-3 text-white/90">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Stabilità dimensionale nel tempo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Comfort termico e acustico superiore</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Resistenza all'umidità</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Posa flottante a incastro</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Utilizzo in ambienti residenziali e commerciali</span>
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
                  <ul className="space-y-3 text-white/90">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Sistema flottante senza colla</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Preparazione sottofondo: livellato e pulito</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Acclimatazione: 24-48 ore in ambiente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Giunto perimetrale: 8-10 mm</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
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
                  <ul className="space-y-3 text-white/90">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Pulizia quotidiana: panno umido o aspirapolvere</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Detergenti neutri per macchie ostinate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Evitare prodotti abrasivi o solventi aggressivi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Protezioni in feltro sotto mobili pesanti</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                      <span>Nessuna ceratura o trattamento periodico necessario</span>
                    </li>
                  </ul>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Ambiti di utilizzo Section */}
      <section ref={applicationsRef} className="relative z-[5] bg-background py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Ambiti di utilizzo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ideale per spazi in cui salubrità e sostenibilità sono prioritarie
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {applications.map((app, index) => (
              <motion.div
                key={app.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card-surface text-center"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
              >
                <h3 className="font-heading font-semibold text-white mb-2">{app.title}</h3>
                <p className="text-sm text-white/80 font-medium">{app.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Perché KALEA Section */}
      <section ref={whyKaleaRef} className="relative z-[6] bg-background py-20">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
              Perché scegliere KALĒA
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              KALĒA seleziona materiali innovativi e naturali, combinando design europeo, ricerca tecnica e attenzione all'ambiente per offrire pavimenti di nuova generazione.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl p-8 bg-card-surface"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white font-medium">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Design italiano contemporaneo</span>
              </li>
              <li className="flex items-start gap-3 text-white font-medium">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Ricerca continua sui materiali naturali</span>
              </li>
              <li className="flex items-start gap-3 text-white font-medium">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Attenzione all'impatto ambientale</span>
              </li>
              <li className="flex items-start gap-3 text-white font-medium">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Soluzioni per professionisti esigenti</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section ref={ctaRef} className="relative z-[7] bg-background">
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
                Scopri la collezione BIOCORE® KALĒA
              </h2>
              <p 
                className="text-lg mb-8 max-w-2xl mx-auto text-white/90"
                style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
              >
                Porta nei tuoi spazi un pavimento naturale, evoluto e sostenibile.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link to={`/${language}/contatti`}>Richiedi informazioni</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certificazioni */}
      <div className="relative z-[8] bg-background">
        <CertificationsSection variant="compact" />
      </div>
    </div>
  );
};

export default BiocoreFloor;
