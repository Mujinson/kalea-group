import { motion } from "framer-motion";

interface FinishCardProps {
  name: string;
  image?: string;
  index: number;
  variant?: "simple" | "image";
}

const FinishCard = ({ name, image, index, variant = "simple" }: FinishCardProps) => {
  if (variant === "image" && image) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
        whileHover={{
          y: -6,
          rotateX: 2,
          rotateY: -2,
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
        }}
        className="kalea-card group relative aspect-square rounded-2xl overflow-hidden border border-border/40 shadow-lg"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
          role="img"
          aria-label={name}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center pb-4">
          <p className="text-base md:text-lg font-heading font-medium text-white tracking-wide">
            {name}
          </p>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
      whileHover={{
        y: -6,
        rotateX: 2,
        rotateY: -2,
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
      }}
      className="kalea-card aspect-square rounded-xl bg-muted border-2 border-border hover:border-primary transition-colors flex items-center justify-center text-center p-4"
    >
      <p className="text-sm font-medium text-foreground">{name}</p>
    </motion.div>
  );
};

export default FinishCard;
