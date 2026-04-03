import { motion } from "framer-motion";
import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import FeatureCard from "@/components/FeatureCard";
import AnimatedTitle from "@/components/AnimatedTitle";
import { Droplets, Sun, Shield, Palette, Settings, CheckCircle, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import SEOHead from "@/components/SEOHead";
import heroOutdoor from "@/assets/hero-outdoor.jpg";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";
import { externoTraditional, externoSkudo } from "@/data/externoProducts";

const Kaleadeck = () => {
  const { language } = useTranslation();
  const isMobile = useIsMobile();
  
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroScale = useTransform(heroProgress, [0, 1], isMobile ? [1, 0.96] : [1, 0.88]);
  const heroBorderRadius = useTransform(heroProgress, [0, 0.5], ["0px", isMobile ? "16px" : "28px"]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.3], [1, 0]);
  const heroContentY = useTransform(heroProgress, [0, 0.4], [0, isMobile ? -40 : -80]);
  const heroImageY = useTransform(heroProgress, [0, 1], ["0%", isMobile ? "8%" : "15%"]);

  const advantages = [
    {
      icon: Droplets,
      title: "Resistenza all'acqua",
      description: "Perfetto per bordi piscina e aree soggette a umidità costante.",
    },
    {
      icon: Sun,
      title: "Antiscivolo certificato",
      description: "Superficie sicura anche quando bagnata, ideale per zone piscina.",
    },
    {
      icon: Shield,
      title: "Durabilità estrema",
      description: "Resiste agli agenti atmosferici, UV e variazioni termiche.",
    },
    {
      icon: Palette,
      title: "Design elegante",
      description: "Finiture estetiche che valorizzano ogni ambiente outdoor.",
    },
    {
      icon: Settings,
      title: "Manutenzione minima",
      description: "Facile da pulire e non richiede trattamenti periodici.",
    },
    {
      icon: CheckCircle,
      title: "Comfort termico",
      description: "Non si surriscalda al sole, confortevole a piedi nudi.",
    },
  ];

  const applications = [
    "Bordi piscina",
    "Terrazze panoramiche",
    "Portici e logge",
    "Spa e wellness",
    "Beach club",
    "Aree relax esterne",
  ];

  return (
    <div className="relative bg-background">
      <SEOHead
        title={language === 'it' ? "KALEADECK® — Decking per Esterni in MgO | Kalēa®" :
               language === 'en' ? "KALEADECK® — Outdoor MgO Decking | Kalēa®" :
               language === 'de' ? "KALEADECK® — MgO-Terrassendielen für Außen | Kalēa®" :
               "KALEADECK® — Terrasse Extérieure en MgO | Kalēa®"}
        description={language === 'it' ? "KALEADECK® di Kalēa®: decking in MgO per esterni, impermeabile, resistente a UV e gelo. Zero manutenzione, aspetto legno naturale." :
                     language === 'en' ? "KALEADECK® by Kalēa®: outdoor MgO decking, waterproof, UV and frost resistant. Zero maintenance, natural wood look." :
                     language === 'de' ? "KALEADECK® von Kalēa®: MgO-Terrassendielen für Außen, wasserdicht, UV- und frostbeständig. Wartungsfrei." :
                     "KALEADECK® par Kalēa® : terrasse en MgO pour extérieurs, imperméable, résistant UV et gel. Zéro entretien."}
        keywords="decking esterno, decking MgO, pavimento esterno impermeabile, decking senza manutenzione, terrazza pavimento, decking resistente gelo, pavimento esterno effetto legno"
      />
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen sticky top-0 z-[0]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: heroScale,
            borderRadius: heroBorderRadius,
          }}
        >
          <motion.img 
            src={heroOutdoor} 
            alt="KALEADECK" 
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

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 md:pb-32">
          <motion.div 
            style={{ opacity: heroContentOpacity, y: heroContentY }} 
            className="container-custom text-center will-change-transform"
          >
            <div className="max-w-4xl mx-auto">
              <AnimatedTitle
                text="KALEADECK"
                suffix={<sup className="text-2xl md:text-3xl">®</sup>}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight"
              />

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto"
              >
                Pavimentazione outdoor per portici, terrazze e piscine
              </motion.p>

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

      {/* Finiture Traditional Section */}
      <section className="relative z-[1] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
              {externoTraditional.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {externoTraditional.subtitle}
            </p>
            <p className="text-base text-muted-foreground/80 max-w-3xl mx-auto mt-4">
              Per non rinunciare alle emozioni che sa offrire la naturalezza del parquet, nasce Externo: la soluzione intelligente ed ecologica per vivere la passione dei pavimenti in legno anche all'esterno.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {externoTraditional.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group text-center"
              >
                <div className="w-28 h-28 md:w-36 md:h-36 mx-auto rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-105">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                </div>
                <p className="mt-3 text-sm md:text-base font-medium text-foreground whitespace-nowrap">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.finish}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Finiture Skudo Section */}
      <section className="relative z-[1] bg-muted/30 py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
              {externoSkudo.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {externoSkudo.subtitle}
            </p>
            <p className="text-base text-muted-foreground/80 max-w-3xl mx-auto mt-4">
              L'innovativo sistema di schermatura SKUDO: una copertura coestrusa con doga in polimero arricchito con stabilizzatori UV e antiossidanti, che la incapsula su tutti e quattro i lati.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {externoSkudo.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group text-center"
              >
                <div className="w-28 h-28 md:w-36 md:h-36 mx-auto rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-105">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                </div>
                <p className="mt-3 text-sm md:text-base font-medium text-foreground whitespace-nowrap">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.finish}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Perché sceglierlo Section */}
      <section className="relative z-[1] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Perché scegliere KALEADECK
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              La pavimentazione outdoor premium per i tuoi spazi esterni più belli.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {advantages.map((advantage, index) => (
              <FeatureCard key={advantage.title} {...advantage} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Technical Section */}
      <section className="relative z-[2] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Specifiche Tecniche
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto rounded-2xl p-8 bg-card-surface"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <ul className="space-y-4 text-white font-medium">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                <span>Spessore: 20-25 mm</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                <span>Classe antiscivolo: R11 / R12</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                <span>Resistenza UV: classe 5 (massima)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                <span>Resistenza al gelo: cicli illimitati</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                <span>Carico di rottura: &gt; 2000 N</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="relative z-[3] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Applicazioni
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Perfetto per ogni ambiente esterno di prestigio.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {applications.map((app, index) => (
              <motion.div
                key={app}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-foreground/5 rounded-xl p-4 text-center"
              >
                <span className="text-foreground/80 font-medium">{app}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon CTA */}
      <section className="relative z-[4] py-20 md:py-32 overflow-hidden bg-background">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgCtaCollabora})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Clock size={16} />
              COMING SOON
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white">
              Presto Disponibile
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-white font-medium">
              KALEADECK sarà presto disponibile. Contattaci per scoprire la nostra pavimentazione outdoor premium.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to={`/${language}/contatti`}>Richiedi Informazioni</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Kaleadeck;
