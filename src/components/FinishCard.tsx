import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface FinishCardProps {
  name: string;
  image?: string;
  index: number;
  variant?: "simple" | "image";
  slug?: string;
}

const FinishCard = ({ name, image, index, variant = "simple", slug }: FinishCardProps) => {
  const { language } = useTranslation();
  
  const cardContent = (
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
      className="kalea-card group relative aspect-square rounded-2xl overflow-hidden border border-border/40 shadow-lg cursor-pointer"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
        role="img"
        aria-label={name}
      />
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Hover action */}
      {slug && (
        <div className="absolute bottom-12 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <span className="inline-flex items-center gap-2 text-white text-sm font-medium">
            {language === 'it' ? 'Vedi dettagli' : language === 'en' ? 'View details' : language === 'de' ? 'Details ansehen' : 'Voir détails'}
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center pb-4">
        <p className="text-base md:text-lg font-heading font-medium text-white tracking-wide">
          {name}
        </p>
      </div>
    </motion.div>
  );

  if (variant === "image" && image) {
    if (slug) {
      return (
        <Link to={`/${language}/stonecore-10`}>
          {cardContent}
        </Link>
      );
    }
    return cardContent;
  }
  
  const simpleCardContent = (
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
      className="kalea-card aspect-square rounded-xl bg-muted border-2 border-border hover:border-primary transition-colors flex items-center justify-center text-center p-4 cursor-pointer"
    >
      <p className="text-sm font-medium text-foreground">{name}</p>
    </motion.div>
  );

  if (slug) {
    return (
      <Link to={`/${language}/stonecore-10`}>
        {simpleCardContent}
      </Link>
    );
  }
  
  return simpleCardContent;
};

export default FinishCard;
