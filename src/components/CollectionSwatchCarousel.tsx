import { motion } from "framer-motion";
import { useDragScroll } from "@/hooks/useDragScroll";
import { Link } from "react-router-dom";

interface SwatchProduct {
  id: string | number;
  name: string;
  image: string;
}

interface Props {
  title: string;
  subtitle?: string;
  products: SwatchProduct[];
  link: string;
  buttonLabel?: string;
}

const CollectionSwatchCarousel = ({ title, subtitle, products, link, buttonLabel = "Scopri" }: Props) => {
  const { containerRef, isDragging, handlers } = useDragScroll({ autoScrollSpeed: 0.6, direction: 'left' });
  const extended = [...products, ...products, ...products];

  return (
    <section className="relative z-[1] bg-background py-12 md:py-16">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </motion.div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div
            ref={containerRef}
            {...handlers}
            className={`flex gap-6 md:gap-8 py-4 overflow-x-auto scrollbar-hide items-center justify-start ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {extended.map((product, index) => (
              <motion.div
                key={`${product.id}-${index}`}
                className="flex-shrink-0 flex flex-col items-center"
                whileHover={{ scale: 1.06, transition: { duration: 0.25 } }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-md">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-foreground/80 mt-1.5 text-center whitespace-nowrap uppercase tracking-wider">
                  {product.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-4">
          <Link
            to={link}
            className="inline-flex items-center justify-center border border-foreground/20 text-foreground text-xs md:text-sm font-medium rounded-full px-6 py-2 hover:bg-foreground hover:text-background transition-all duration-200"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CollectionSwatchCarousel;
