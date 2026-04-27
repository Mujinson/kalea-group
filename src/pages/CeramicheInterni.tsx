import { motion } from "framer-motion";
import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { ChevronDown, ArrowRight, ArrowUpRight, Droplets, Flame, Shield, Maximize } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import AnimatedTitle from "@/components/AnimatedTitle";
import SEOHead from "@/components/SEOHead";
import { getCollectionsByCategory } from "@/data/ceramicheCollections";

import heroInterni from "@/assets/ceramiche-interni-hero.jpg";

const CeramicheInterni = () => {
  const { language } = useTranslation();
  const isMobile = useIsMobile();
  const collections = getCollectionsByCategory("interni");

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
        title="Ceramiche da Interni | Gres Porcellanato di Alta Gamma | Kalēa®"
        description="Superfici ceramiche selezionate da Kalēa® per l'eccellenza materica e la resistenza superiore. Gres porcellanato effetto pietra, cemento, metallo e legno per interni di alta gamma."
        keywords="ceramiche interni, gres porcellanato, piastrelle design, effetto pietra, effetto cemento, effetto legno, pavimenti lusso"
      />

      {/* Hero */}
      <div ref={heroRef} className="fixed inset-0 z-[0]">
        <motion.div
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ scale: heroScale, borderRadius: heroBorderRadius }}
        >
          <motion.img
            src={heroInterni}
            alt="Ceramiche da Interni Kalēa"
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
                text="Ceramiche da Interni"
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight"
              />
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto"
              >
                Raffinatezza e design di nicchia per interni d'eccellenza.
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

      {/* Collections Grid - subito dopo hero */}
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
              Le Collezioni
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Gres porcellanato di altissimo pregio per pavimenti e rivestimenti interni.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {collections.map((collection, index) => {
              const cardInner = (
                <div className="relative overflow-hidden rounded-2xl bg-background shadow-sm hover:shadow-xl transition-shadow duration-500 h-full">
                  <div className="relative h-[240px] md:h-[280px] overflow-hidden">
                    <img
                      src={collection.hero}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <span className="text-[10px] md:text-xs uppercase tracking-widest text-white/70 font-medium">
                        {collection.effect}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/90 font-medium bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        Scopri
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-1">
                      {collection.name}
                    </h3>
                    <p className="text-xs md:text-sm text-primary/70 font-medium mb-3 italic">
                      {collection.tagline}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {collection.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs text-foreground/50 font-mono">
                        {collection.formats.join(" · ")}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                        Esplora
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={collection.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  className="group"
                >
                  <Link to={`/${language}/ceramiche/${collection.slug}`} className="block h-full">
                    {cardInner}
                  </Link>
                </motion.div>
              );
            })}
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
              Superfici selezionate per l'eccellenza
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Ogni collezione è il risultato di una selezione rigorosa: materie prime di altissima qualità, 
              tecnologie produttive all'avanguardia e un'estetica che dialoga con l'architettura contemporanea. 
              Superfici selezionate da Kalēa® per la loro eccellenza materica e resistenza superiore, 
              parte integrante del nostro Surface System®.
            </p>
          </motion.div>

          {/* Feature icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto mt-14"
          >
            {[
              { icon: Droplets, label: "Impermeabile" },
              { icon: Flame, label: "Ignifugo" },
              { icon: Shield, label: "Antigraffio" },
              { icon: Maximize, label: "Grandi formati" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs md:text-sm text-foreground/70 font-medium">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Collections Grid */}
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
              Le Collezioni
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Gres porcellanato di altissimo pregio per pavimenti e rivestimenti interni.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {collections.map((collection, index) => {
              const cardInner = (
                <div className="relative overflow-hidden rounded-2xl bg-background shadow-sm hover:shadow-xl transition-shadow duration-500 h-full">
                  {/* Image */}
                  <div className="relative h-[240px] md:h-[280px] overflow-hidden">
                    <img
                      src={collection.hero}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <span className="text-[10px] md:text-xs uppercase tracking-widest text-white/70 font-medium">
                        {collection.effect}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/90 font-medium bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        Scopri
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 md:p-6">
                    <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-1">
                      {collection.name}
                    </h3>
                    <p className="text-xs md:text-sm text-primary/70 font-medium mb-3 italic">
                      {collection.tagline}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {collection.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs text-foreground/50 font-mono">
                        {collection.formats.join(" · ")}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                        Esplora
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={collection.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  className="group"
                >
                  <Link to={`/${language}/ceramiche/${collection.slug}`} className="block h-full">
                    {cardInner}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

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
              Richiedi una consulenza
            </h2>
            <p className="text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Il nostro team di specialisti è a disposizione per guidarti nella scelta della superficie 
              ceramica più adatta al tuo progetto architettonico.
            </p>
            <Link
              to={`/${language}/contatti`}
              className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-3.5 rounded-full font-medium hover:bg-background/90 transition-colors"
            >
              Contattaci
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CeramicheInterni;
