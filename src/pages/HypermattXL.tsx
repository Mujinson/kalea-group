import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedTitle from "@/components/AnimatedTitle";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import { xlWood, xlTile, type HypermattProduct } from "@/data/hypermattProducts";
import heroImage from "@/assets/hero-biomag-floor-new.webp";

const HypermattXL = () => {
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
                Formato grande, impatto straordinario
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
      {/* Description */}
      <section className="relative z-[1] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">La collezione che amplifica lo spazio</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Le doghe di grande formato creano continuità visiva e una sensazione di ampiezza che valorizza ogni interno.
            </p>
            <p className="text-base text-muted-foreground/80 leading-relaxed mb-4">
              La variante <strong>Wood</strong> esalta le venature naturali del legno con una finitura opaca e tridimensionale, mentre <strong>Tile</strong> reinterpreta la raffinatezza della pietra in chiave contemporanea, ideale per ambienti essenziali e sofisticati.
            </p>
            <p className="text-base text-muted-foreground/80 leading-relaxed">
              Tutte le superfici Hypermatt XL sono trattate con <strong>Hypermatt Laser Technology</strong>, la tecnologia laser esclusiva che rende la superficie ultra-opaca, vellutata e resistente. Formato: <strong>228,6 x 1800 mm</strong>, spessore <strong>6,5 mm</strong>, incastro <strong>5G</strong>.
            </p>
          </motion.div>

          {renderGallery(
            "Wood",
            "Nodi e venature esaltano la matericità del legno e la profondità della sua texture. La finitura Hypermatt Laser Technology amplifica il realismo visivo e la morbidezza al tatto.",
            xlWood
          )}
          {renderGallery(
            "Tile",
            "La forza della pietra si traduce in una superficie ampia, materica e dal fascino senza tempo, perfetto per ambienti minimalisti o industriali.",
            xlTile
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-[2] bg-muted/30 py-16 md:py-24">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-lg text-muted-foreground mb-6">Scopri le altre collezioni Hypermatt</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild variant="outline"><Link to={`/${language}/hypermatt-spina`}>Hypermatt Spina</Link></Button>
              <Button asChild variant="outline"><Link to={`/${language}/hypermatt-55`}>Hypermatt 55</Link></Button>
              <Button asChild><Link to={`/${language}/contatti`}>Richiedi Campionatura</Link></Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-lg p-0 bg-transparent border-none shadow-none">
          {selectedProduct && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex flex-col items-center">
              <button onClick={() => setSelectedProduct(null)} className="absolute -top-4 -right-4 w-10 h-10 bg-foreground/90 hover:bg-foreground rounded-full flex items-center justify-center z-50 shadow-lg" aria-label="Chiudi">
                <X className="w-5 h-5 text-background" />
              </button>
              <div className="bg-card/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-auto max-w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-lg" />
                <p className="text-center mt-4 text-lg font-semibold text-foreground uppercase tracking-wider">{selectedProduct.name}</p>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HypermattXL;
