import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cwcColors } from "@/data/cwcColors";
import { useDragScroll } from "@/hooks/useDragScroll";

interface CWCProductType {
  id: string;
  name: string;
  colorHex: string;
  image: string;
}

const CWCProductCard = ({ product, language }: { product: CWCProductType; language: string }) => {
  return (
    <Link to={`/${language}/biocore-floor`}>
      <motion.div
        className="relative flex-shrink-0 flex flex-col items-center group cursor-pointer"
        whileHover={{ 
          scale: 1.08,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
      >
        {/* Circle Image Container */}
        <div className="relative">
          <div 
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-kalea-tan/30 transition-all duration-500"
          >
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
          </div>
          
          {/* Badge positioned at top-right of circle */}
          <div className="absolute -top-1 -right-1 sm:top-0 sm:right-0">
            <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-medium bg-kalea-cream/90 backdrop-blur-sm text-kalea-dark shadow-sm">
              Hypermatt
            </span>
          </div>
        </div>

        {/* Content below circle */}
        <div className="text-center mt-4 sm:mt-5">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground tracking-wide">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-foreground/60 mt-1">
            SPC ultra-matte laser
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

const CWCGallerySection = () => {
  const { t, language } = useTranslation();
  const { containerRef, isDragging, handlers } = useDragScroll({ autoScrollSpeed: 1, direction: 'right' });

  // Map cwcColors to the format we need
  const products: CWCProductType[] = cwcColors.map(color => ({
    id: color.id,
    name: color.name,
    colorHex: color.colorHex,
    image: color.image,
  }));

  // Triple products for infinite scroll
  const extendedProducts = [...products, ...products, ...products];

  return (
    <section className="h-full w-full flex flex-col justify-center bg-background overflow-hidden">
      {/* Header */}
      <div className="container-custom text-center mb-5 md:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
<h2 className="text-[clamp(1.25rem,5vw,3rem)] font-heading font-bold text-foreground mb-2 md:mb-4 whitespace-nowrap">
            Esplora la Collezione Hypermatt
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
            Collezione SPC Hypermatt con finitura laser ultra-matte. Texture, colori e dettagli.
          </p>
        </motion.div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Draggable carousel with auto-scroll */}
        <div 
          ref={containerRef}
          {...handlers}
          className={`flex gap-8 sm:gap-10 md:gap-12 py-4 overflow-x-auto scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ 
            WebkitOverflowScrolling: 'touch'
          }}
        >
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
<p className="text-sm md:text-lg text-foreground/70 leading-relaxed mb-4 md:mb-8">
            {language === 'it' ? 'BIOCORE FLOOR® è il pavimento naturale evoluto KALEA, realizzato con fibre di legno e carbonio e leganti naturali, privo di plastica e sostanze tossiche.' : 
             language === 'en' ? 'BIOCORE FLOOR® is the evolved natural KALEA flooring, made with wood fibers and carbon and natural binders, free from plastic and toxic substances.' :
             language === 'de' ? 'BIOCORE FLOOR® ist der weiterentwickelte natürliche KALEA-Boden, hergestellt aus Holzfasern und Kohlenstoff und natürlichen Bindemitteln, frei von Plastik und Giftstoffen.' :
             'BIOCORE FLOOR® est le sol naturel évolué KALEA, fabriqué avec des fibres de bois et carbone et des liants naturels, sans plastique ni substances toxiques.'}
          </p>
          <Link
            to={`/${language}/biocore-floor`}
            className="inline-flex items-center gap-2 text-foreground font-medium hover:gap-3 transition-all duration-300 group"
          >
            {language === 'it' ? 'Scopri tutta la collezione BIOCORE FLOOR®' : 
             language === 'en' ? 'Discover the full BIOCORE FLOOR® collection' :
             language === 'de' ? 'Entdecken Sie die komplette BIOCORE FLOOR®-Kollektion' :
             'Découvrez toute la collection BIOCORE FLOOR®'}
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CWCGallerySection;
