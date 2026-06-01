import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedTitle from "@/components/AnimatedTitle";
import SEOHead from "@/components/SEOHead";
import ProductLightbox from "@/components/ProductLightbox";
import HypermattCollectionCTA from "@/components/HypermattCollectionCTA";
import TechSpecBar from "@/components/TechSpecBar";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import { xlWood, xlTile, hypermattXL, type HypermattProduct } from "@/data/hypermattProducts";
import CarouselWheel3D from "@/components/CarouselWheel3D";
import heroImage from "@/assets/hero-hypermatt-xl.jpg";
import lifestyleLiving from "@/assets/hypermatt-xl/lifestyle-living.webp";
import lifestyleKitchen from "@/assets/hypermatt-xl/lifestyle-kitchen.webp";

const HypermattXL = () => {
  const { language, t } = useTranslation();
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">{title}</h3>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="flex flex-col items-center"
          >
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => setSelectedProduct(product)}
                className="absolute -top-1 -right-1 md:top-0 md:right-0 w-8 h-8 md:w-10 md:h-10 bg-foreground/60 hover:bg-foreground/80 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm shadow-md"
                aria-label={`Visualizza ${product.name}`}
              >
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
        title="Hypermatt XL — Collezione SPC Grande Formato | Kalēa®"
        description="Hypermatt XL: doghe di grande formato con finitura Hypermatt Laser Technology. Effetto legno e pietra ultra-realistico."
        keywords="hypermatt xl, spc grande formato, pavimento effetto legno, pavimento effetto pietra, hypermatt laser"
      />

      {/* Hero */}
      <section ref={heroRef} className="relative h-screen sticky top-0 z-[0]">
        <motion.div className="absolute inset-0 overflow-hidden origin-center will-change-transform" style={{ scale: heroScale, borderRadius: heroBorderRadius }}>
          <motion.img src={heroImage} alt="Hypermatt XL" className="absolute inset-0 w-full h-full object-cover will-change-transform" style={{ y: heroImageY, scale: 1.1 }}
            initial={{ filter: "blur(10px)", scale: 1.15 }} animate={{ filter: "blur(0px)", scale: 1.1 }} transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </motion.div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 md:pb-32">
          <motion.div style={{ opacity: heroContentOpacity, y: heroContentY }} className="container-custom text-center will-change-transform">
            <div className="max-w-4xl mx-auto">
              <AnimatedTitle text="Hypermatt XL" className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight" />
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto">
                {t("hypermattXL.heroSubtitle")}
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

      {/* 3D Carousel */}
      <CarouselWheel3D
        title="Hypermatt XL"
        planks={hypermattXL.products.map(p => ({ id: p.id, name: p.name, image: p.image }))}
        link="/hypermatt-xl"
      />

      {/* Lifestyle Section */}
      <section className="bg-background py-20 md:py-32">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">{t("hypermattXL.lifestyleTitle")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("hypermattXL.lifestyleDesc")}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="overflow-hidden rounded-2xl shadow-xl">
              <img src={lifestyleLiving} alt="Soggiorno con pavimento Hypermatt XL" className="w-full h-[300px] md:h-[400px] object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="overflow-hidden rounded-2xl shadow-xl">
              <img src={lifestyleKitchen} alt="Cucina con pavimento Hypermatt XL" className="w-full h-[300px] md:h-[400px] object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">{t("hypermattXL.descTitle")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              {t("hypermattXL.desc1")}
            </p>
            <p className="text-base text-muted-foreground/80 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: t("hypermattXL.desc2") }} />
            <p className="text-base text-muted-foreground/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: t("hypermattXL.desc3") }} />
          </motion.div>

          {renderGallery(
            t("hypermattXL.woodTitle"),
            t("hypermattXL.woodDesc"),
            xlWood
          )}
          {renderGallery(
            t("hypermattXL.tileTitle"),
            t("hypermattXL.tileDesc"),
            xlTile
          )}
        </div>
      </section>

      <TechSpecBar
        title={t('productSpecs.title')}
        subtitle={t('productSpecs.subtitle')}
        specs={[
          { label: t('productSpecs.thickness'), value: "6,5 mm" },
          { label: t('productSpecs.finish'), value: "Legno · Pietra" },
          { label: t('productSpecs.format'), value: "228,6×1800 mm · 600×1200 mm" },
        ]}
        effectStoryTitle="Materia amplificata, su scala maggiore"
        effectStory={`Hypermatt XL è la collezione che amplifica lo spazio e porta la materia a una nuova scala di eleganza. Le doghe di grande formato creano continuità visiva e una sensazione di ampiezza che valorizza ogni interno.\n\nLa variante Wood esalta nodi e venature naturali del legno con una finitura opaca e tridimensionale, mentre Tile reinterpreta la raffinatezza della pietra in chiave contemporanea, ideale per ambienti essenziali e sofisticati.\n\nTutte le superfici sono trattate con Hypermatt Laser Technology, la tecnologia laser esclusiva che rende la superficie ultra-opaca, vellutata e resistente, elevando il realismo materico a nuovi livelli.`}
        applications={[
          { label: "Hypermatt Laser Technology", description: "Finitura ultra-opaca ottenuta tramite tecnologia laser esclusiva: modifica la microstruttura superficiale per un aspetto vellutato, naturale e resistente a micrograffi, impronte e usura." },
          { label: "Grande formato XL", description: "Doghe 228,6×1800 mm (Wood) e lastre 600×1200 mm (Tile) per una posa continua, con meno fughe e maggiore impatto visivo." },
          { label: "Sistema 5G Välinge", description: "Incastro a secco, posa flottante rapida e senza colla. Spessore totale 6,5 mm con materassino IXPE 1 mm integrato, strato d'usura 0,55 mm, classe 23/33, reazione al fuoco Bfl-s1." },
        ]}
      />

      <HypermattCollectionCTA current="xl" />
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

export default HypermattXL;
