import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cwcColors } from "@/data/cwcColors";

// Helper function to darken a hex color for gradient
const adjustColor = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

interface CWCProductType {
  id: string;
  name: string;
  colorHex: string;
}

const CWCProductCard = ({ product, language }: { product: CWCProductType; language: string }) => {
  return (
    <Link to={`/${language}/cwc`}>
      <motion.div
        className="relative flex-shrink-0 flex flex-col items-center group cursor-pointer"
        whileHover={{ 
          scale: 1.08,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
      >
        {/* Circle Color Container */}
        <div className="relative">
          <div 
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-kalea-tan/30 transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${product.colorHex} 0%, ${adjustColor(product.colorHex, -30)} 100%)`
            }}
          >
            {/* Subtle wood grain texture overlay */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(0,0,0,0.05) 2px,
                  rgba(0,0,0,0.05) 4px
                )`
              }}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
          </div>
          
          {/* Badge positioned at top-right of circle */}
          <div className="absolute -top-1 -right-1 sm:top-0 sm:right-0">
            <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-medium bg-kalea-cream/90 backdrop-blur-sm text-kalea-dark shadow-sm">
              CWC
            </span>
          </div>
        </div>

        {/* Content below circle */}
        <div className="text-center mt-4 sm:mt-5">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-kalea-tan tracking-wide">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-kalea-cream/70 mt-1">
            Carbon Wood Composite
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

const CWCGallerySection = () => {
  const { t, language } = useTranslation();

  // Map cwcColors to the format we need
  const products: CWCProductType[] = cwcColors.map(color => ({
    id: color.id,
    name: color.name,
    colorHex: color.colorHex,
  }));

  // Triple the products for infinite scroll effect
  const extendedProducts = [...products, ...products, ...products];

  return (
    <section className="h-full w-full flex flex-col justify-center bg-kalea-dark overflow-hidden">
      {/* Header */}
      <div className="container-custom text-center mb-5 md:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-kalea-tan mb-2 md:mb-4">
            {language === 'it' ? 'Esplora la Collezione CWC' : 
             language === 'en' ? 'Explore the CWC Collection' :
             language === 'de' ? 'Entdecken Sie die CWC-Kollektion' :
             'Découvrez la Collection CWC'}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-kalea-cream/80 max-w-2xl mx-auto">
            {language === 'it' ? 'Texture, colori e dettagli del nostro pavimento in Carbon Wood Composite.' : 
             language === 'en' ? 'Texture, colors and details of our Carbon Wood Composite flooring.' :
             language === 'de' ? 'Texturen, Farben und Details unseres Carbon Wood Composite Bodens.' :
             'Textures, couleurs et détails de notre revêtement Carbon Wood Composite.'}
          </p>
        </motion.div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-48 bg-gradient-to-r from-kalea-dark to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-48 bg-gradient-to-l from-kalea-dark to-transparent z-10 pointer-events-none" />

        {/* Scrolling carousel - reverse direction */}
        <div className="flex gap-8 sm:gap-10 md:gap-12 animate-scroll-reverse hover:[animation-play-state:paused]">
          {extendedProducts.map((product, index) => (
            <CWCProductCard key={`${product.id}-${index}`} product={product} language={language} />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="container-custom text-center mt-5 md:mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-sm md:text-lg text-kalea-cream/80 leading-relaxed mb-4 md:mb-8">
            {language === 'it' ? 'Il pavimento CWC combina tecnologia in fibra di carbonio, resistenza superiore e un design naturale ispirato al legno autentico.' : 
             language === 'en' ? 'CWC flooring combines carbon fiber technology, superior resistance and a natural design inspired by authentic wood.' :
             language === 'de' ? 'CWC-Böden kombinieren Kohlefasertechnologie, überlegene Widerstandsfähigkeit und ein natürliches, von echtem Holz inspiriertes Design.' :
             'Le revêtement CWC combine la technologie en fibre de carbone, une résistance supérieure et un design naturel inspiré du bois authentique.'}
          </p>
          <Link
            to={`/${language}/cwc`}
            className="inline-flex items-center gap-2 text-kalea-tan font-medium hover:gap-3 transition-all duration-300 group"
          >
            {language === 'it' ? 'Scopri tutta la collezione CWC' : 
             language === 'en' ? 'Discover the full CWC collection' :
             language === 'de' ? 'Entdecken Sie die komplette CWC-Kollektion' :
             'Découvrez toute la collection CWC'}
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CWCGallerySection;
