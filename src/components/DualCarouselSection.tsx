import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useDragScroll } from "@/hooks/useDragScroll";
import { hypermattXL, hypermattSpina, hypermatt55, type HypermattProduct } from "@/data/hypermattProducts";
import { externoTraditional, externoSkudo } from "@/data/externoProducts";

// Import BIOMAG finish images
import finishAurora from "@/assets/finish-aurora.jpg";
import finishCorteccia from "@/assets/finish-corteccia.jpg";
import finishPerla from "@/assets/finish-perla.jpg";
import finishSabbia from "@/assets/finish-sabbia.jpg";
import finishSilven from "@/assets/finish-silven.jpg";
import finishTerram from "@/assets/finish-terram.jpg";
import finishVelora from "@/assets/finish-velora.jpg";

interface ProductType {
  id: number | string;
  name: string;
  image: string;
}

interface CollectionCard {
  title: string;
  subtitle: string;
  link: string;
  products: ProductType[];
  direction: 'left' | 'right';
}

const biomagProducts: ProductType[] = [
  { id: 1, name: "Aurora", image: finishAurora },
  { id: 2, name: "Corteccia", image: finishCorteccia },
  { id: 3, name: "Sabbia", image: finishSabbia },
  { id: 4, name: "Terram", image: finishTerram },
  { id: 5, name: "Velora", image: finishVelora },
  { id: 6, name: "Perla", image: finishPerla },
  { id: 7, name: "Silven", image: finishSilven },
];

// Convert Hypermatt data to ProductType
const toProductType = (products: HypermattProduct[]): ProductType[] =>
  products.map(p => ({ id: p.id, name: p.name, image: p.image }));

// Parquet finishes
const parquetProducts: ProductType[] = [
  { id: 1, name: "Rovere Naturale", image: finishCorteccia },
  { id: 2, name: "Noce Scuro", image: finishTerram },
  { id: 3, name: "Frassino Chiaro", image: finishAurora },
  { id: 4, name: "Teak Dorato", image: finishSabbia },
  { id: 5, name: "Acero Bianco", image: finishPerla },
  { id: 6, name: "Ciliegio", image: finishVelora },
];

// Externo products from data file
const externoTraditionalProducts: ProductType[] = externoTraditional.products.map(p => ({ id: p.id, name: p.name, image: p.image }));
const externoSkudoProducts: ProductType[] = externoSkudo.products.map(p => ({ id: p.id, name: p.name, image: p.image }));

const MiniProductCard = ({ product, link }: { product: ProductType; link: string }) => (
  <Link to={link}>
    <motion.div
      className="relative flex-shrink-0 flex flex-col items-center group cursor-pointer"
      whileHover={{ scale: 1.05, transition: { duration: 0.3, ease: "easeOut" } }}
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-500">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <p className="text-[10px] sm:text-xs font-medium text-foreground mt-2 text-center whitespace-nowrap">
        {product.name}
      </p>
    </motion.div>
  </Link>
);

const MiniCarousel = ({ products, link, direction }: { products: ProductType[]; link: string; direction: 'left' | 'right' }) => {
  const { containerRef, isDragging, handlers } = useDragScroll({ autoScrollSpeed: 0.8, direction });
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
          <MiniProductCard key={`${product.id}-${index}`} product={product} link={link} />
        ))}
      </div>
    </div>
  );
};

const DualCarouselSection = () => {
  const { language, t } = useTranslation();

  const collections: CollectionCard[] = [
    {
      title: "Biomag Floor®",
      subtitle: t("dualCarousel.biomagSubtitle"),
      link: `/${language}/biomag-floor`,
      products: biomagProducts,
      direction: 'left',
    },
    {
      title: hypermattXL.title,
      subtitle: hypermattXL.subtitle,
      link: `/${language}/hypermatt-xl`,
      products: toProductType(hypermattXL.products),
      direction: 'right',
    },
    {
      title: hypermattSpina.title,
      subtitle: hypermattSpina.subtitle,
      link: `/${language}/hypermatt-spina`,
      products: toProductType(hypermattSpina.products),
      direction: 'left',
    },
    {
      title: hypermatt55.title,
      subtitle: hypermatt55.subtitle,
      link: `/${language}/hypermatt-55`,
      products: toProductType(hypermatt55.products),
      direction: 'right',
    },
    {
      title: t("dualCarousel.parquetTitle"),
      subtitle: t("dualCarousel.parquetSubtitle"),
      link: `/${language}/indoor`,
      products: parquetProducts,
      direction: 'left',
    },
    {
      title: t("dualCarousel.externoTraditionalTitle"),
      subtitle: t("dualCarousel.externoTraditionalSubtitle"),
      link: `/${language}/externo`,
      products: externoTraditionalProducts,
      direction: 'right',
    },
    {
      title: t("dualCarousel.externoSkudoTitle"),
      subtitle: t("dualCarousel.externoSkudoSubtitle"),
      link: `/${language}/externo`,
      products: externoSkudoProducts,
      direction: 'left',
    },
  ];

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
            {t("dualCarousel.title")}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
            {t("dualCarousel.subtitle")}
          </p>
        </motion.div>
      </div>

      {/* Six Cards - 2x3 Grid */}
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {collections.map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-card rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg"
            >
              <Link
                to={col.link}
                className="flex items-center justify-between mb-4 group/header hover:opacity-80 transition-opacity"
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                    {col.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground/60 mt-1">
                    {col.subtitle}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-foreground/70 group-hover/header:text-foreground group-hover/header:translate-x-1 transition-all" />
              </Link>
              <div className="h-32 sm:h-36 md:h-40">
                <MiniCarousel products={col.products} link={col.link} direction={col.direction} />
              </div>
            </motion.div>
          ))}
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
          {t("dualCarousel.dragHint")}
        </motion.p>
      </div>
    </section>
  );
};

export default DualCarouselSection;
