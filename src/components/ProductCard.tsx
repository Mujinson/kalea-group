import { motion } from "framer-motion";

interface ProductCardProps {
  title: string;
  description: string;
  index: number;
  imagePlaceholder?: boolean;
  image?: string;
}

const ProductCard = ({ title, description, index, imagePlaceholder = true, image }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
      whileHover={{
        y: -6,
        rotateX: 2,
        rotateY: -2,
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
      }}
      className="kalea-card group bg-background border border-border rounded-xl p-6"
    >
      {imagePlaceholder && (
        <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
          {image ? (
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <p className="text-muted-foreground text-xs">Immagine prodotto</p>
            </div>
          )}
        </div>
      )}
      <h3 className="text-xl font-heading font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
};

export default ProductCard;
