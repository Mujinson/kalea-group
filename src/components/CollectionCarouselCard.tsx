import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useDragScroll } from "@/hooks/useDragScroll";

interface ProductType {
  id: number | string;
  name: string;
  image: string;
  link?: string;
}

interface Props {
  title: string;
  subtitle: string;
  products: ProductType[];
  direction?: 'left' | 'right';
}

const CollectionCarouselCard = ({ title, subtitle, products, direction = 'left' }: Props) => {
  const { containerRef, isDragging, handlers } = useDragScroll({ autoScrollSpeed: 0.8, direction });
  const extendedProducts = [...products, ...products, ...products];

  return (
    <section className="relative z-[1] bg-background py-10 md:py-14">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg"
        >
          <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-foreground/60 mt-1">
              {subtitle}
            </p>
          </div>

          <div className="relative h-32 sm:h-36 md:h-40">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
            <div
              ref={containerRef}
              {...handlers}
              className={`flex gap-3 sm:gap-4 py-2 overflow-x-auto scrollbar-hide h-full items-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {extendedProducts.map((product, index) => {
                const inner = (
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
                );
                return product.link ? (
                  <Link key={`${product.id}-${index}`} to={product.link} className="flex-shrink-0">
                    {inner}
                  </Link>
                ) : (
                  <div key={`${product.id}-${index}`} className="flex-shrink-0">
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CollectionCarouselCard;
