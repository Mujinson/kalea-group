import { motion } from "framer-motion";
import { useCardTilt } from "@/hooks/useCardTilt";

interface ProductCardProps {
  title: string;
  description: string;
  index: number;
  imagePlaceholder?: boolean;
}

const ProductCard = ({ title, description, index, imagePlaceholder = true }: ProductCardProps) => {
  const { cardRef, tilt, handleMouseMove, handleMouseLeave } = useCardTilt(6);
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="kalea-card group bg-background border border-border rounded-xl p-6"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
      }}
    >
      {imagePlaceholder && (
        <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <p className="text-muted-foreground text-xs">Immagine prodotto</p>
          </div>
        </div>
      )}
      <h3 className="text-xl font-heading font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
};

export default ProductCard;
