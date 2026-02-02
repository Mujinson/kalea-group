import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDragScroll } from "@/hooks/useDragScroll";
import { cwcColors } from "@/data/cwcColors";

// Import BIOMAG finish images
import finishAurora from "@/assets/finish-aurora.jpg";
import finishCorteccia from "@/assets/finish-corteccia.jpg";
import finishPerla from "@/assets/finish-perla.jpg";
import finishSabbia from "@/assets/finish-sabbia.jpg";
import finishSilven from "@/assets/finish-silven.jpg";
import finishTerram from "@/assets/finish-terram.jpg";
import finishVelora from "@/assets/finish-velora.jpg";

// Fallback images map for BIOMAG
const fallbackImages: Record<string, string> = {
  aurora: finishAurora,
  corteccia: finishCorteccia,
  sabbia: finishSabbia,
  terram: finishTerram,
  velora: finishVelora,
  perla: finishPerla,
  silven: finishSilven,
  cenere: finishCorteccia,
};

const getBiomagProducts = (t: (key: string) => string) => [
  { id: 1, name: "Aurora", slug: "aurora", image: fallbackImages.aurora },
  { id: 2, name: "Corteccia", slug: "corteccia", image: fallbackImages.corteccia },
  { id: 3, name: "Sabbia", slug: "sabbia", image: fallbackImages.sabbia },
  { id: 4, name: "Terram", slug: "terram", image: fallbackImages.terram },
  { id: 5, name: "Velora", slug: "velora", image: fallbackImages.velora },
  { id: 6, name: "Perla", slug: "perla", image: fallbackImages.perla },
  { id: 7, name: "Silven", slug: "silven", image: fallbackImages.silven },
];

interface ProductType {
  id: number | string;
  name: string;
  slug?: string;
  image: string;
}

const MiniProductCard = ({ product, language, productLine }: { product: ProductType; language: string; productLine: 'biomag' | 'biocore' }) => {
  const linkPath = productLine === 'biomag' ? `/${language}/biomag-floor` : `/${language}/biocore-floor`;
  
  return (
    <Link to={linkPath}>
      <motion.div
        className="relative flex-shrink-0 flex flex-col items-center group cursor-pointer"
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-500">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        <p className="text-[10px] sm:text-xs font-medium text-foreground mt-2 text-center">
          {product.name}
        </p>
      </motion.div>
    </Link>
  );
};

const BiocoreMiniCarousel = ({ language }: { language: string }) => {
  const { containerRef, isDragging, handlers } = useDragScroll({ autoScrollSpeed: 0.8, direction: 'right' });
  
  const products = cwcColors.map(color => ({
    id: color.id,
    name: color.name,
    image: color.image,
  }));
  
  const extendedProducts = [...products, ...products, ...products];
  
  return (
    <div className="relative h-full">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
      
      <div 
        ref={containerRef}
        {...handlers}
        className={`flex gap-3 sm:gap-4 py-2 overflow-x-auto scrollbar-hide h-full items-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {extendedProducts.map((product, index) => (
          <MiniProductCard 
            key={`biocore-${product.id}-${index}`} 
            product={product} 
            language={language}
            productLine="biocore"
          />
        ))}
      </div>
    </div>
  );
};

const BiomagMiniCarousel = ({ language, t }: { language: string; t: (key: string) => string }) => {
  const { containerRef, isDragging, handlers } = useDragScroll({ autoScrollSpeed: 0.8, direction: 'left' });
  
  const products = getBiomagProducts(t);
  const extendedProducts = [...products, ...products, ...products];
  
  return (
    <div className="relative h-full">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
      
      <div 
        ref={containerRef}
        {...handlers}
        className={`flex gap-3 sm:gap-4 py-2 overflow-x-auto scrollbar-hide h-full items-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {extendedProducts.map((product, index) => (
          <MiniProductCard 
            key={`biomag-${product.id}-${index}`} 
            product={product} 
            language={language}
            productLine="biomag"
          />
        ))}
      </div>
    </div>
  );
};

const DualCarouselSection = () => {
  const { t, language } = useTranslation();

  return (
    <section className="min-h-[70vh] w-full flex flex-col justify-center bg-background py-12 md:py-20">
      {/* Header */}
      <div className="container-custom text-center mb-8 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
            {language === 'it' ? 'Le Nostre Linee di Pavimenti' : 
             language === 'en' ? 'Our Flooring Lines' :
             language === 'de' ? 'Unsere Bodenbelagslinien' :
             'Nos Gammes de Sols'}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
            {language === 'it' ? 'Due tecnologie innovative, infinite possibilità di design' : 
             language === 'en' ? 'Two innovative technologies, endless design possibilities' :
             language === 'de' ? 'Zwei innovative Technologien, unendliche Designmöglichkeiten' :
             'Deux technologies innovantes, des possibilités de design infinies'}
          </p>
        </motion.div>
      </div>

      {/* Two Cards Side by Side */}
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* BIOMAG FLOOR Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg"
          >
            <Link 
              to={`/${language}/biomag-floor`}
              className="flex items-center justify-between mb-4 group/header hover:opacity-80 transition-opacity"
            >
              <div>
                <h3 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                  BIOMAG FLOOR®
                </h3>
                <p className="text-xs sm:text-sm text-foreground/60 mt-1">
                  {language === 'it' ? 'Tecnologia MgO avanzata' : 
                   language === 'en' ? 'Advanced MgO technology' :
                   language === 'de' ? 'Fortschrittliche MgO-Technologie' :
                   'Technologie MgO avancée'}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-foreground/70 group-hover/header:text-foreground group-hover/header:translate-x-1 transition-all" />
            </Link>
            
            {/* Mini Carousel */}
            <div className="h-32 sm:h-36 md:h-40">
              <BiomagMiniCarousel language={language} t={t} />
            </div>
          </motion.div>

          {/* BIOCORE FLOOR Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg"
          >
            <Link 
              to={`/${language}/biocore-floor`}
              className="flex items-center justify-between mb-4 group/header hover:opacity-80 transition-opacity"
            >
              <div>
                <h3 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                  BIOCORE FLOOR®
                </h3>
                <p className="text-xs sm:text-sm text-foreground/60 mt-1">
                  {language === 'it' ? 'Fibre naturali e carbonio' : 
                   language === 'en' ? 'Natural fibers and carbon' :
                   language === 'de' ? 'Naturfasern und Kohlenstoff' :
                   'Fibres naturelles et carbone'}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-foreground/70 group-hover/header:text-foreground group-hover/header:translate-x-1 transition-all" />
            </Link>
            
            {/* Mini Carousel */}
            <div className="h-32 sm:h-36 md:h-40">
              <BiocoreMiniCarousel language={language} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA */}
      <div className="container-custom text-center mt-8 md:mt-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-base text-foreground/60"
        >
          {language === 'it' ? 'Trascina per esplorare le collezioni' : 
           language === 'en' ? 'Drag to explore the collections' :
           language === 'de' ? 'Ziehen Sie, um die Kollektionen zu erkunden' :
           'Faites glisser pour explorer les collections'}
        </motion.p>
      </div>
    </section>
  );
};

export default DualCarouselSection;
