import { motion } from "framer-motion";
import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import AnimatedTitle from "@/components/AnimatedTitle";
import SEOHead from "@/components/SEOHead";
import heroIndoor from "@/assets/card-parquet-ambient.jpg";
import productBiomagFloor from "@/assets/product-biocore-floor-new.jpg";
import cardHypermattAmbient from "@/assets/card-hypermatt-ambient.jpg";
import productKaleabase from "@/assets/product-kaleabase-underlays.jpg";
import heroEdgeline from "@/assets/hero-edgeline.jpg";
import productBiowall from "@/assets/product-biowall.jpg";
import productKaleadeck from "@/assets/product-kaleadeck.jpg";
import cardParquetAmbient from "@/assets/card-parquet-ambient.jpg";
import ceramicheInterni from "@/assets/ceramiche-interni-hero.jpg";
import spcHero from "@/assets/spc/hero.webp";
import laminatiHero from "@/assets/laminati/hero.webp";





interface Surface {
  title: string;
  description: string;
  link?: string;
  image: string;
  comingSoon?: boolean;
}

const Indoor = () => {
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

  const surfaces: Surface[] = [
    {
      title: "Biomag Floor®",
      description: "Il cuore del sistema. Pavimento flottante in ossido di magnesio e fibre naturali. Impermeabile, ignifugo, leggero e ad altissima stabilità.",
      link: `/${language}/biomag-floor`,
      image: productBiomagFloor,
    },
    {
      title: "Hypermatt",
      description: "Ultra-matte al tatto con finitura laser. Realismo estremo del legno e del cemento, resistenza all'acqua e all'usura superiore.",
      link: `/${language}/hypermatt`,
      image: cardHypermattAmbient,
    },
    {
      title: "Parquet",
      description: "Legni selezionati e finiture artigianali per ambienti dove il calore e l'autenticità del materiale naturale diventano protagonisti.",
      link: `/${language}/parquet`,
      image: cardParquetAmbient,
    },
    {
      title: "SPC Selection",
      description: "Selezione esclusiva Kalēa® di pavimenti e rivestimenti SPC: doghe effetto legno, spina di pesce, lastre marmo, tiles industrial. Waterproof e posa rapida.",
      link: `/${language}/indoor/spc`,
      image: spcHero,
    },
    {
      title: "Laminati Tecnici",
      description: "Selezione esclusiva Kalēa® di laminati tecnici: maxi doghe, spina di pesce, tiles materici. Sincroporo, Hydro e altissima resistenza all'abrasione.",
      link: `/${language}/indoor/laminati`,
      image: laminatiHero,
    },
    {
      title: "Ceramiche da Interni",
      description: "Piastrelle di altissimo pregio per pavimenti e rivestimenti interni. Materiali esclusivi, finiture raffinate e design di nicchia.",
      image: ceramicheInterni,
      link: `/${language}/ceramiche-interni`,
    },
  ];

  const systemProducts = [
    {
      name: "KALEABASE®",
      description: "Sistemi modulari di sottopavimento per ogni esigenza.",
      image: productKaleabase,
      link: `/${language}/kaleabase`,
    },
    {
      name: "EDGELINE®",
      description: "Profili e battiscopa per finiture architettoniche.",
      image: heroEdgeline,
      link: `/${language}/edgeline`,
    },
    {
      name: "BIOWALL®",
      description: "Sistema di rivestimento indoor.",
      image: productBiowall,
      link: `/${language}/biowall`,
    },
  ];

  return (
    <div className="relative bg-background">
      <SEOHead
        title={language === 'it' ? "Pavimenti Flottanti per Interni | BIOMAG & Hypermatt | Kalēa®" :
               language === 'en' ? "Indoor Floating Floors | BIOMAG & Hypermatt | Kalēa®" :
               language === 'de' ? "Schwimmende Böden für Innenräume | BIOMAG & Hypermatt | Kalēa®" :
               "Sols Flottants d'Intérieur | BIOMAG & Hypermatt | Kalēa®"}
        description={language === 'it' ? "Scopri i pavimenti flottanti Kalēa® per interni: Biomag Floor in MgO e Collezione Hypermatt SPC ultra-matte. Installazione click-clack senza colla." :
                     language === 'en' ? "Discover Kalēa® indoor floating floors: Biomag Floor in MgO and Hypermatt SPC ultra-matte collection." :
                     language === 'de' ? "Entdecken Sie Kalēa® schwimmende Böden für Innenräume: Biomag Floor aus MgO und Hypermatt SPC Kollektion." :
                     "Découvrez les sols flottants Kalēa® pour intérieurs : Biomag Floor en MgO et collection Hypermatt SPC ultra-matte."}
        keywords="pavimenti flottanti interni, pavimento flottante indoor, pavimenti click clack, pavimenti senza colla, pavimenti MgO interni, Hypermatt, pavimento galleggiante interni"
      />

      {/* Hero Section - Fixed background */}
      <div ref={heroRef} className="fixed inset-0 z-[0]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ scale: heroScale, borderRadius: heroBorderRadius }}
        >
          <motion.img 
            src={heroIndoor} 
            alt="Indoor Solutions" 
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
                text="Indoor Solutions"
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight"
              />
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto"
              >
                Tecnologie avanzate per pavimenti e superfici indoor.
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

      {/* Le Nostre Superfici - 6 Cards Grid */}
      <section className="relative z-[1] bg-background py-20 md:py-32 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
              Le Nostre Superfici
            </h2>
            <p className="text-base md:text-lg text-foreground/70 font-light">
              KALĒA® — SURFACE SYSTEM® offre sei mondi di eccellenza per interni ed esterni.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
            {surfaces.map((surface, index) => {
              const cardContent = (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  whileHover={!surface.comingSoon ? { y: -6, boxShadow: "0 16px 48px rgba(0, 0, 0, 0.25)" } : undefined}
                  className={`relative group overflow-hidden rounded-2xl min-h-[220px] sm:min-h-[250px] md:min-h-[280px] ${surface.comingSoon ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <img
                    src={surface.image}
                    alt={surface.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${surface.comingSoon ? 'opacity-50' : 'group-hover:scale-105'}`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />

                  {surface.comingSoon && (
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-medium px-3 py-1 rounded-full z-20">
                      Novità in arrivo
                    </div>
                  )}

                  <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-6">
                    <h3 className="text-base md:text-lg lg:text-xl font-heading font-semibold text-white mb-1.5 tracking-wide">
                      {surface.title}
                    </h3>
                    <p className="text-[10px] md:text-xs text-white/85 leading-relaxed line-clamp-3 mb-2">
                      {surface.description}
                    </p>
                    {!surface.comingSoon && (
                      <span className="inline-flex items-center gap-2 text-white/90 text-[10px] md:text-xs font-medium transition-all duration-300 group-hover:text-white">
                        Scopri
                        <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    )}
                  </div>
                </motion.div>
              );

              if (surface.comingSoon) {
                return <div key={surface.title}>{cardContent}</div>;
              }

              return (
                <Link key={surface.title} to={surface.link!} className="block">
                  {cardContent}
                </Link>
              );
            })}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-center text-sm md:text-base text-foreground/60 font-light max-w-2xl mx-auto mt-8 md:mt-12 leading-relaxed"
          >
            Tutto completato con pezzi speciali per scale, battiscopa, profili e accessori coordinati.
          </motion.p>
        </div>
      </section>

      {/* System Products Section — hidden: not yet available */}
    </div>
  );
};

export default Indoor;
