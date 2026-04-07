import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedTitle from "@/components/AnimatedTitle";
import SEOHead from "@/components/SEOHead";
import ProductLightbox from "@/components/ProductLightbox";
import HypermattCollectionCTA from "@/components/HypermattCollectionCTA";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import { spinaItaliana, spinaFrancese, hypermattSpina, type HypermattProduct } from "@/data/hypermattProducts";
import CollectionSwatchCarousel from "@/components/CollectionSwatchCarousel";
import heroImage from "@/assets/hero-hypermatt-spina.jpg";
import icon5G from "@/assets/hypermatt/5g-valinge.png";
import formatoSpina from "@/assets/hypermatt/formato-spina.jpg";

const HypermattSpina = () => {
  const { language } = useTranslation();
  const isMobile = useIsMobile();
  const [selectedProduct, setSelectedProduct] = useState<HypermattProduct | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(heroProgress, [0, 1], isMobile ? [1, 0.96] : [1, 0.88]);
  const heroBorderRadius = useTransform(heroProgress, [0, 0.5], ["0px", isMobile ? "16px" : "28px"]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.3], [1, 0]);
  const heroContentY = useTransform(heroProgress, [0, 0.4], [0, isMobile ? -40 : -80]);
  const heroImageY = useTransform(heroProgress, [0, 1], ["0%", isMobile ? "8%" : "15%"]);

  const renderGallery = (title: string, description: string, products: HypermattProduct[]) => (
    <div className="mb-16 md:mb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10">
        <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">{title}</h3>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
        {products.map((product, index) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.05 }} className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <button onClick={() => setSelectedProduct(product)} className="absolute -top-1 -right-1 md:top-0 md:right-0 w-8 h-8 md:w-10 md:h-10 bg-foreground/60 hover:bg-foreground/80 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm shadow-md" aria-label={`Visualizza ${product.name}`}>
                <Search className="w-4 h-4 md:w-5 md:h-5 text-background" />
              </button>
            </div>
            <h4 className="mt-4 text-sm md:text-base font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">{product.name}</h4>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative bg-background">
      <SEOHead
        title="Hypermatt Spina — Posa a Spina Italiana e Francese | Kalēa®"
        description="Hypermatt Spina: l'eleganza delle geometrie a spina italiana e francese con finitura Hypermatt Laser Technology."
        keywords="hypermatt spina, spina italiana, spina francese, pavimento a spina, spc spina"
      />

      {/* Hero */}
      <section ref={heroRef} className="relative h-screen sticky top-0 z-[0]">
        <motion.div className="absolute inset-0 overflow-hidden origin-center will-change-transform" style={{ scale: heroScale, borderRadius: heroBorderRadius }}>
          <motion.img src={heroImage} alt="Hypermatt Spina" className="absolute inset-0 w-full h-full object-cover will-change-transform" style={{ y: heroImageY, scale: 1.1 }}
            initial={{ filter: "blur(10px)", scale: 1.15 }} animate={{ filter: "blur(0px)", scale: 1.1 }} transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </motion.div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 md:pb-32">
          <motion.div style={{ opacity: heroContentOpacity, y: heroContentY }} className="container-custom text-center will-change-transform">
            <div className="max-w-4xl mx-auto">
              <AnimatedTitle text="Hypermatt Spina" className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight" />
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto">
                L'eleganza delle geometrie, l'innovazione del dettaglio
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={{ opacity: heroContentOpacity }}>
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="flex justify-center">
                  <ChevronDown className="w-6 h-6 text-white/60" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* All content after hero */}
      <div className="relative z-[1]">
      {/* Collection Swatch Carousel */}
      <CollectionSwatchCarousel
        title="Hypermatt Spina"
        subtitle={hypermattSpina.subtitle}
        products={hypermattSpina.products.map(p => ({ id: p.id, name: p.name, image: p.image }))}
        link={`/${language}/hypermatt-spina`}
        buttonLabel="Scopri Hypermatt Spina"
      />

      {/* Description */}
      <section className="bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">Il fascino dei pavimenti a spina</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Hypermatt Spina reinterpreta il fascino dei pavimenti a spina in chiave contemporanea: le due varianti, <strong>Italiana</strong> e <strong>Francese</strong>, amplificano la percezione di movimento e profondità, trasformando ogni interno in uno spazio armonioso e raffinato.
            </p>
            <p className="text-base text-muted-foreground/80 leading-relaxed">
              Trattata con <strong>Hypermatt Laser Technology</strong>, la tecnologia laser esclusiva che rende la superficie ultra-opaca e vellutata, Hypermatt Spina restituisce un effetto iperrealistico e naturale. Il sistema d'incastro <strong>5G</strong> garantisce una posa flottante, solida e senza colla.
            </p>
          </motion.div>

          {renderGallery(
            "Spina Italiana",
            "Linee equilibrate e proporzioni perfette disegnano la Spina Italiana dal carattere raffinato e senza tempo.",
            spinaItaliana
          )}
          {renderGallery(
            "Spina Francese",
            "Geometrie inclinate e ritmo regolare danno vita a una spina elegante, dinamica e luminosa.",
            spinaFrancese
          )}
        </div>
      </section>

      {/* Specifiche Tecniche */}
      <section className="bg-muted py-20 md:py-28">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Specifiche Tecniche</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">Prestazioni certificate per ogni ambiente</p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-card rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-heading font-bold text-foreground mb-4">SPECIFICHE TECNICHE</h3>
              <div className="mb-4">
                <img src={formatoSpina} alt="Formato spina 128x640 mm" className="max-w-[200px] h-auto" />
              </div>
              <p className="text-sm text-muted-foreground mb-6">128x640 mm</p>

              <h4 className="text-lg font-heading font-semibold text-foreground mb-4">Specifiche tecniche</h4>
              <div className="space-y-0 divide-y divide-border">
                {[
                  { label: "Formato", value: "128x640 mm" },
                  { label: "Spessore Totale", value: "6,5 mm" },
                  { label: "Classe D'uso", value: "23/33" },
                  { label: "Incastro", value: "5G" },
                  { label: "Resistenza Al Fuoco", value: "Bfl-s1" },
                  { label: "Materassino", value: "IXPE 1 mm" },
                  { label: "Strato D'usura", value: "0,55 mm" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-3">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-bold text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              {/* 5G Icon */}
              <div className="mt-8 flex items-center gap-4">
                <img src={icon5G} alt="5G Välinge" className="w-12 h-12" />
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                SPC effetto legno, listelli formato <strong>128 x 640 mm</strong> con spessore <strong>6,5 mm</strong>.
                Finitura ultra realistica e vellutata grazie all'esclusiva tecnologia al laser <strong>Hypermatt</strong>. Resistente ad acqua e usura.
                Facilità di installazione con <strong>aggancio a secco 5G</strong> e materassino fonoassorbente incorporato.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <HypermattCollectionCTA current="spina" />
      </div>

      {/* Lightbox */}
      <ProductLightbox
        open={!!selectedProduct}
        image={selectedProduct?.image}
        name={selectedProduct?.name}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
      />
    </div>
  );
};

export default HypermattSpina;
