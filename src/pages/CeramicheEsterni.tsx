import { motion } from "framer-motion";
import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { ChevronDown, ArrowRight, ArrowUpRight, Snowflake, Sun, Droplets, Shield, Layers, Wind } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import AnimatedTitle from "@/components/AnimatedTitle";
import TechSpecBar from "@/components/TechSpecBar";
import SEOHead from "@/components/SEOHead";
import { getCollectionsByCategory } from "@/data/ceramicheCollections";

import heroEsterni from "@/assets/ceramiche-esterni-hero.jpg";
import imgPiscine from "@/assets/ceramiche-esterni/piscine.jpg";
import imgGiardini from "@/assets/ceramiche-esterni/giardini.jpg";
import imgTerrazze from "@/assets/ceramiche-esterni/terrazze.jpg";

interface ApplicationArea {
  title: string;
  description: string;
  image: string;
}

const applicationAreas: ApplicationArea[] = [
  {
    title: "Piscine",
    description: "Superfici antiscivolo certificate, resistenti al cloro e agli agenti chimici. Bordi piscina e camminamenti che combinano sicurezza e bellezza.",
    image: imgPiscine,
  },
  {
    title: "Giardini",
    description: "Posa su erba, sabbia o ghiaia per camminamenti e aree living all'aperto. Rimovibili e riutilizzabili, resistenti al gelo e alla muffa.",
    image: imgGiardini,
  },
  {
    title: "Terrazze",
    description: "Pavimenti sopraelevati o incollati per terrazze e balconi. Continuità estetica con l'interno e resistenza agli agenti atmosferici.",
    image: imgTerrazze,
  },
];

const advantages = [
  { icon: Snowflake, label: "Resistenza al gelo" },
  { icon: Sun, label: "Resistenza UV" },
  { icon: Droplets, label: "Impermeabilità" },
  { icon: Shield, label: "Antiscivolo R11" },
  { icon: Layers, label: "Posa versatile" },
  { icon: Wind, label: "Zero manutenzione" },
];

const CeramicheEsterni = () => {
  const { language } = useTranslation();
  const isMobile = useIsMobile();
  const outdoorCollections = getCollectionsByCategory("esterni");

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

  return (
    <div className="relative bg-background">
      <SEOHead
        title="Ceramiche da Esterni | Gres Porcellanato 20mm | Kalēa®"
        description="Superfici ceramiche da esterno selezionate da Kalēa®. Gres porcellanato spessore 20mm per terrazze, piscine, giardini e facciate. Continuità estetica indoor-outdoor."
        keywords="ceramiche esterni, gres porcellanato 20mm, piastrelle esterno, pavimenti piscina, pavimenti terrazza, gres outdoor, posa sopraelevata"
      />

      {/* Hero */}
      <div ref={heroRef} className="fixed inset-0 z-[0]">
        <motion.div
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ scale: heroScale, borderRadius: heroBorderRadius }}
        >
          <motion.img
            src={heroEsterni}
            alt="Ceramiche da Esterni Kalēa"
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{ y: heroImageY, scale: 1.1 }}
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
                text="Ceramiche da Esterni"
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight"
              />
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto"
              >
                Continuità e resistenza eterna per ogni spazio all'aperto.
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
      </div>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Collections - subito dopo hero */}
      <section className="relative z-[1] bg-background py-20 md:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14 md:mb-20"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Le Collezioni Outdoor
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Gres porcellanato spessore 20mm per prestazioni estreme e design senza tempo.
            </p>
          </motion.div>

          <div className="space-y-12 md:space-y-16">
            {outdoorCollections.map((collection, index) => (
              <motion.div
                key={collection.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-6 md:gap-10 items-center`}
              >
                <div className="w-full md:w-1/2 overflow-hidden rounded-2xl">
                  <img
                    src={collection.hero}
                    alt={collection.name}
                    className="w-full h-[280px] md:h-[400px] object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <span className="text-xs uppercase tracking-[0.2em] text-primary/60 font-medium">
                    Spessore {collection.thickness}
                  </span>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mt-2 mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-sm md:text-base text-primary/70 font-medium italic mb-4">
                    {collection.tagline}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                    {collection.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-xs uppercase tracking-widest text-foreground/50 font-medium">Effetto</span>
                    <p className="text-sm text-foreground/80 mt-1">{collection.effect}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {collection.applications.map((app) => (
                      <span
                        key={app}
                        className="text-[10px] md:text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/${language}/ceramiche/${collection.slug}`}
                    className="inline-flex items-center gap-2 text-foreground font-medium hover:gap-3 transition-all group"
                  >
                    Esplora la collezione
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="relative z-[1] bg-background py-20 md:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-primary/60 mb-4 font-medium">
              Kalēa® Surface System®
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
              Resistenza superiore, design senza confini
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Superfici ceramiche da esterno selezionate da Kalēa® per la loro eccellenza tecnica 
              e resistenza agli agenti atmosferici. Gres porcellanato ad alto spessore che garantisce 
              continuità estetica tra indoor e outdoor, versatilità di posa e durata nel tempo senza compromessi.
            </p>
          </motion.div>

          {/* Advantages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 max-w-4xl mx-auto mt-14"
          >
            {advantages.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] md:text-xs text-foreground/70 font-medium text-center leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Application Areas */}
      <section className="relative z-[1] bg-background py-20 md:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14 md:mb-20"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Ambiti di applicazione
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Soluzioni versatili per ogni contesto outdoor, dalla piscina al giardino.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {applicationAreas.map((area, index) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative block h-[320px] md:h-[400px] rounded-2xl overflow-hidden"
              >
                <img
                  src={area.image}
                  alt={area.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                    {area.title}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed">
                    {area.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TechSpecBar
        title={t('productSpecs.title')}
        subtitle={t('productSpecs.subtitle')}
        specs={[
          { label: t('productSpecs.material'), value: "Gres porcellanato 2 cm" },
          { label: t('productSpecs.thickness'), value: "20 mm" },
          { label: t('productSpecs.format'), value: "60×60 · 60×120 · 80×80 · 100×100 cm" },
          { label: t('productSpecs.finish'), value: "Strutturata" },
          { label: t('productSpecs.edge'), value: "Rettificato" },
          { label: t('productSpecs.slip'), value: "R11 A+B+C" },
        ]}
        applicationsLabel={t('productSpecs.installation')}
        applications={["Posa a secco su erba/ghiaia", "Posa su sabbia", "Posa su supporti", "Posa incollata"]}
      />

      {/* CTA Section */}
      <section className="relative z-[1] bg-primary py-20 md:py-28">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-6">
              Progetta il tuo spazio esterno
            </h2>
            <p className="text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Dalla scelta dei materiali alla consulenza sulla posa: il team Kalēa® ti accompagna 
              nella realizzazione di ambienti outdoor che resistono al tempo e alle intemperie.
            </p>
            <Link
              to={`/${language}/contatti`}
              className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-3.5 rounded-full font-medium hover:bg-background/90 transition-colors"
            >
              Richiedi consulenza
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CeramicheEsterni;
