import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

const getProducts = (t: (key: string) => string, dbImages: Record<string, string>) => [
  { id: 1, name: "Aurora", slug: "aurora", image: dbImages.aurora || fallbackImages.aurora, tagline: t('colors.aurora.tagline') },
  { id: 2, name: "Corteccia", slug: "corteccia", image: dbImages.corteccia || fallbackImages.corteccia, tagline: t('colors.corteccia.tagline') },
  { id: 3, name: "Sabbia", slug: "sabbia", image: dbImages.sabbia || fallbackImages.sabbia, tagline: t('colors.sabbia.tagline') },
  { id: 4, name: "Terram", slug: "terram", image: dbImages.terram || fallbackImages.terram, tagline: t('colors.terram.tagline') },
  { id: 5, name: "Velora", slug: "velora", image: dbImages.velora || fallbackImages.velora, tagline: t('colors.velora.tagline') },
  { id: 6, name: "Perla", slug: "perla", image: dbImages.perla || fallbackImages.perla, tagline: t('colors.perla.tagline') },
  { id: 7, name: "Silven", slug: "silven", image: dbImages.silven || fallbackImages.silven, tagline: t('colors.silven.tagline') },
  { id: 8, name: "Cenere", slug: "cenere", image: dbImages.cenere || fallbackImages.cenere, tagline: t('colors.cenere.tagline') },
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
    <Link to={`/${language}/colore/${product.slug}`}>
      <motion.div
        className="relative flex-shrink-0 w-[220px] sm:w-[260px] md:w-[320px] lg:w-[360px] group cursor-pointer"
        whileHover={{ 
          rotateY: 5, 
          rotateX: -3,
          z: 50,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        style={{ perspective: 1000 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg group-hover:shadow-2xl transition-shadow duration-500">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={product.image}
              alt={`Kalēa ${product.name}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter contrast-[1.02] brightness-[1.02]"
              loading="lazy"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Badge */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
              <span className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground/80 shadow-sm">
                MgO 8,5 mm
              </span>
            </div>

            {/* Hover action */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
              <span className="inline-flex items-center gap-2 text-white text-xs sm:text-sm font-medium">
                {language === 'it' ? 'Vedi dettagli' : language === 'en' ? 'View details' : language === 'de' ? 'Details ansehen' : 'Voir détails'}
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 bg-card">
            <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-wide">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {product.tagline}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const ProductGallerySection = () => {
  const { t, language } = useTranslation();

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
            {t('gallery.title')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-kalea-cream/80 max-w-2xl mx-auto">
            {t('gallery.subtitle')}
          </p>
        </motion.div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-48 bg-gradient-to-r from-kalea-dark to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-48 bg-gradient-to-l from-kalea-dark to-transparent z-10 pointer-events-none" />

        {/* Scrolling carousel */}
        <div className="flex gap-4 sm:gap-6 md:gap-8 animate-scroll hover:[animation-play-state:paused]">
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
          <p className="text-sm md:text-lg text-kalea-cream/80 leading-relaxed mb-4 md:mb-8">
            {t('gallery.description')}
          </p>
          <Link
            to={`/${language}/stonecore-10`}
            className="inline-flex items-center gap-2 text-kalea-tan font-medium hover:gap-3 transition-all duration-300 group"
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