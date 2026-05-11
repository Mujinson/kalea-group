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
import { h55Wood, h55Cement, hypermatt55, type HypermattProduct } from "@/data/hypermattProducts";
import CarouselWheel3D from "@/components/CarouselWheel3D";
import heroImage from "@/assets/hero-hypermatt55.jpg";
import TechSpecBar from "@/components/TechSpecBar";

const Hypermatt55 = () => {
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
        title="Hypermatt 55 — Collezione SPC Versatile | Kalēa®"
        description="Hypermatt 55: caldo ed elegante, l'alleato ideale per progetti di interior design. Effetto legno e cemento."
        keywords="hypermatt 55, spc versatile, pavimento effetto legno, pavimento effetto cemento"
      />

      {/* Hero — sticky parallax */}
      <section ref={heroRef} className="relative h-screen sticky top-0 z-[0]">
        <motion.div className="absolute inset-0 overflow-hidden origin-center will-change-transform" style={{ scale: heroScale, borderRadius: heroBorderRadius }}>
          <motion.img src={heroImage} alt="Hypermatt 55" className="absolute inset-0 w-full h-full object-cover will-change-transform" style={{ y: heroImageY, scale: 1.1 }}
            initial={{ filter: "blur(10px)", scale: 1.15 }} animate={{ filter: "blur(0px)", scale: 1.1 }} transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </motion.div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 md:pb-32">
          <motion.div style={{ opacity: heroContentOpacity, y: heroContentY }} className="container-custom text-center will-change-transform">
            <div className="max-w-4xl mx-auto">
              <AnimatedTitle text="Hypermatt 55" className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight" />
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto">
                {t("hypermatt55.heroSubtitle")}
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

      {/* All content after hero — relative + z-index to cover the sticky hero */}
      <div className="relative z-[1]">
        {/* 3D Carousel */}
        <CarouselWheel3D
          title="Hypermatt 55"
          planks={hypermatt55.products.map(p => ({ id: p.id, name: p.name, image: p.image }))}
          link="/hypermatt-55"
        />

        {/* Description + Galleries */}
        <section className="bg-background py-20 md:py-32">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">{t("hypermatt55.descTitle")}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">{t("hypermatt55.desc1")}</p>
              <p className="text-base text-muted-foreground/80 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: t("hypermatt55.desc2") }} />
              <p className="text-base text-muted-foreground/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: t("hypermatt55.desc3") }} />
            </motion.div>

            {renderGallery(
              t("hypermatt55.woodTitle"),
              t("hypermatt55.woodDesc"),
              h55Wood
            )}
            {renderGallery(
              t("hypermatt55.cementTitle"),
              t("hypermatt55.cementDesc"),
              h55Cement
            )}
          </div>
        </section>

        {/* Specifiche Tecniche — editorial dark bars */}
        <TechSpecBar
          title={t("hypermatt55.specsHeader1")}
          subtitle={t("hypermatt55.specsSubtitle")}
          specs={[
            { label: t("hypermatt55.specFormat"), value: "228,6×1524 mm" },
            { label: t("hypermatt55.specThickness"), value: "5,5 mm" },
            { label: t("hypermatt55.specClass"), value: "23/33" },
            { label: t("hypermatt55.specClick"), value: "Välinge 5G" },
          ]}
          applicationsLabel={t("hypermatt55.specFire") + " · " + t("hypermatt55.specPad") + " · " + t("hypermatt55.specWear")}
          applications={["Bfl-s1", "IXPE 1 mm", "0,55 mm"]}
        />

        <TechSpecBar
          title={t("hypermatt55.specsHeader2")}
          specs={[
            { label: t("hypermatt55.specFormat"), value: "460×920 mm" },
            { label: t("hypermatt55.specThickness"), value: "6,5 mm" },
            { label: t("hypermatt55.specClass"), value: "23/33" },
            { label: t("hypermatt55.specClick"), value: "Välinge 5G" },
          ]}
          applicationsLabel={t("hypermatt55.specFire") + " · " + t("hypermatt55.specPad") + " · " + t("hypermatt55.specWear")}
          applications={["Bfl-s1", "IXPE 1 mm", "0,55 mm"]}
        />

        <HypermattCollectionCTA current="55" />
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

export default Hypermatt55;
