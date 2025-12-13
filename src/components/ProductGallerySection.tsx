import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Import finish images
import finishAurora from "@/assets/finish-aurora.jpg";
import finishCorteccia from "@/assets/finish-corteccia.jpg";
import finishPerla from "@/assets/finish-perla.jpg";
import finishSabbia from "@/assets/finish-sabbia.jpg";
import finishSilven from "@/assets/finish-silven.jpg";
import finishTerram from "@/assets/finish-terram.jpg";
import finishVelora from "@/assets/finish-velora.jpg";

const products = [
  { id: 1, name: "Aurora", slug: "aurora", image: finishAurora, tagline: "Luce calda del mattino" },
  { id: 2, name: "Corteccia", slug: "corteccia", image: finishCorteccia, tagline: "Profondità legno vissuto" },
  { id: 3, name: "Sabbia", slug: "sabbia", image: finishSabbia, tagline: "Toni chiari senza tempo" },
  { id: 4, name: "Terram", slug: "terram", image: finishTerram, tagline: "Terra compatta naturale" },
  { id: 5, name: "Velora", slug: "velora", image: finishVelora, tagline: "Eleganza morbida contemporanea" },
  { id: 6, name: "Perla", slug: "perla", image: finishPerla, tagline: "Chiarezza raffinata luminosa" },
  { id: 7, name: "Silven", slug: "silven", image: finishSilven, tagline: "Grigio nobile setoso" },
  { id: 8, name: "Cenere", slug: "cenere", image: finishCorteccia, tagline: "Carattere intenso minerale" },
];

// Duplicate for infinite scroll effect
const extendedProducts = [...products, ...products, ...products];

const ProductCard = ({ product, language }: { product: typeof products[0]; language: string }) => {
  return (
    <Link to={`/${language}/colore/${product.slug}`}>
      <motion.div
        className="relative flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] group cursor-pointer"
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
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground/80 shadow-sm">
                MgO 8,5 mm
              </span>
            </div>

            {/* Hover action */}
            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
              <span className="inline-flex items-center gap-2 text-white text-sm font-medium">
                {language === 'it' ? 'Vedi dettagli' : language === 'en' ? 'View details' : language === 'de' ? 'Details ansehen' : 'Voir détails'}
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 bg-card">
            <h3 className="text-lg font-semibold text-foreground tracking-wide">
              Kalēa {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
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

  return (
    <section className="relative h-screen min-h-[600px] max-h-screen flex flex-col justify-center bg-background overflow-hidden">
      {/* Header */}
      <div className="container-custom text-center mb-8 md:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            {t('gallery.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('gallery.subtitle')}
          </p>
        </motion.div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling carousel */}
        <div className="flex gap-6 md:gap-8 animate-scroll hover:[animation-play-state:paused]">
          {extendedProducts.map((product, index) => (
            <ProductCard key={`${product.id}-${index}`} product={product} language={language} />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="container-custom text-center mt-8 md:mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
            {t('gallery.description')}
          </p>
          <Link
            to={`/${language}/stonecore-10`}
            className="inline-flex items-center gap-2 text-foreground font-medium hover:gap-3 transition-all duration-300 group"
          >
            {t('gallery.cta')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductGallerySection;
