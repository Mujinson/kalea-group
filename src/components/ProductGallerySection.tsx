import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDragScroll } from "@/hooks/useDragScroll";

// Import finish images as fallbacks
import finishAurora from "@/assets/finish-aurora.jpg";
import finishCorteccia from "@/assets/finish-corteccia.jpg";
import finishPerla from "@/assets/finish-perla.jpg";
import finishSabbia from "@/assets/finish-sabbia.jpg";
import finishSilven from "@/assets/finish-silven.jpg";
import finishTerram from "@/assets/finish-terram.jpg";
import finishVelora from "@/assets/finish-velora.jpg";

// Fallback images map
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

// Map legacy paths to imported images
const legacyImageMap: Record<string, string> = {
  "/src/assets/finish-aurora.jpg": finishAurora,
  "/src/assets/finish-corteccia.jpg": finishCorteccia,
  "/src/assets/finish-sabbia.jpg": finishSabbia,
  "/src/assets/finish-silven.jpg": finishSilven,
  "/src/assets/finish-terram.jpg": finishTerram,
  "/src/assets/finish-perla.jpg": finishPerla,
  "/src/assets/finish-velora.jpg": finishVelora,
};

// Resolve image URL (handles legacy paths and storage URLs)
const resolveImageUrl = (url: string | undefined, fallback: string): string => {
  if (!url) return fallback;
  return legacyImageMap[url] || url;
};

const getProducts = (t: (key: string) => string, dbImages: Record<string, string>) => [
  { id: 1, name: "Aurora", slug: "aurora", image: resolveImageUrl(dbImages.aurora, fallbackImages.aurora), tagline: t('colors.aurora.tagline') },
  { id: 2, name: "Corteccia", slug: "corteccia", image: resolveImageUrl(dbImages.corteccia, fallbackImages.corteccia), tagline: t('colors.corteccia.tagline') },
  { id: 3, name: "Sabbia", slug: "sabbia", image: resolveImageUrl(dbImages.sabbia, fallbackImages.sabbia), tagline: t('colors.sabbia.tagline') },
  { id: 4, name: "Terram", slug: "terram", image: resolveImageUrl(dbImages.terram, fallbackImages.terram), tagline: t('colors.terram.tagline') },
  { id: 5, name: "Velora", slug: "velora", image: resolveImageUrl(dbImages.velora, fallbackImages.velora), tagline: t('colors.velora.tagline') },
  { id: 6, name: "Perla", slug: "perla", image: resolveImageUrl(dbImages.perla, fallbackImages.perla), tagline: t('colors.perla.tagline') },
  { id: 7, name: "Silven", slug: "silven", image: resolveImageUrl(dbImages.silven, fallbackImages.silven), tagline: t('colors.silven.tagline') },
  { id: 8, name: "Cenere", slug: "cenere", image: resolveImageUrl(dbImages.cenere, fallbackImages.cenere), tagline: t('colors.cenere.tagline') },
];

interface ProductType {
  id: number;
  name: string;
  slug: string;
  image: string;
  tagline: string;
}

const ProductCard = ({ product, language }: { product: ProductType; language: string }) => {
  return (
    <Link to={`/${language}/biomag-floor`}>
      <motion.div
        className="relative flex-shrink-0 flex flex-col items-center group cursor-pointer"
        whileHover={{ 
          scale: 1.08,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
      >
        {/* Circle Image Container */}
        <div className="relative">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-kalea-tan/30 transition-all duration-500">
            <img
              src={product.image}
              alt={`Kalēa ${product.name}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 filter contrast-[1.02] brightness-[1.02]"
              loading="lazy"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
          </div>
          
          {/* Badge positioned at top-right of circle */}
          <div className="absolute -top-1 -right-1 sm:top-0 sm:right-0">
            <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-medium bg-kalea-cream/90 backdrop-blur-sm text-kalea-dark shadow-sm">
              BIOMAG FLOOR®
            </span>
          </div>
        </div>

        {/* Content below circle */}
        <div className="text-center mt-4 sm:mt-5">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground tracking-wide">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-foreground/60 mt-1 max-w-[180px]">
            {product.tagline}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

const ProductGallerySection = () => {
  const { t, language } = useTranslation();
  const { containerRef, isDragging, handlers } = useDragScroll({ autoScrollSpeed: 1, direction: 'left' });

  // Fetch first image for each product from database
  const { data: productImages } = useQuery({
    queryKey: ["gallery-product-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("product_slug, image_url, display_order")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      
      // Group by product_slug and get first image for each
      const imageMap: Record<string, string> = {};
      data?.forEach((img) => {
        if (!imageMap[img.product_slug]) {
          imageMap[img.product_slug] = img.image_url;
        }
      });
      
      return imageMap;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const dbImages = productImages || {};
  const products = getProducts(t, dbImages);
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-2 md:mb-4">
            {t('gallery.title')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
            {t('gallery.subtitle')}
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
          className={`flex gap-4 sm:gap-6 md:gap-8 py-4 overflow-x-auto scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ 
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {extendedProducts.map((product, index) => (
            <ProductCard key={`${product.id}-${index}`} product={product} language={language} />
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
            {t('gallery.description')}
          </p>
<Link
            to={`/${language}/biomag-floor`}
            className="inline-flex items-center gap-2 text-foreground font-medium hover:gap-3 transition-all duration-300 group"
          >
            {t('gallery.cta')}
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductGallerySection;