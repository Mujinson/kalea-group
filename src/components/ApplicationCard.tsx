import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ApplicationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  backgroundImage?: string;
  index: number;
  /** Smaller card used in dense grids (e.g. applications) */
  compact?: boolean;
  /** Visual shape override (default: square) */
  variant?: "square" | "tall";
  className?: string;
}

const ApplicationCard = ({
  icon: Icon,
  title,
  description,
  backgroundImage,
  index,
  compact = false,
  variant = "square",
  className = "",
}: ApplicationCardProps) => {
  const aspectClass = compact
    ? "aspect-[4/3]"
    : variant === "tall"
      ? "aspect-[4/5]"
      : "aspect-square";

  const iconClass = compact ? "w-8 h-8 md:w-10 md:h-10" : "w-12 h-12";
  const titleClass = compact ? "text-sm md:text-base" : "text-xl md:text-2xl";
  const descClass = compact
    ? "text-[10px] md:text-xs hidden sm:block"
    : "text-sm md:text-base";

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
      className={`kalea-card group relative rounded-2xl bg-muted overflow-hidden ${aspectClass} ${className}`}
    >
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/20 to-foreground/80" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-6">
        <Icon className={`text-background mb-3 ${iconClass}`} />
        <h3 className={`font-heading font-semibold text-background mb-2 ${titleClass}`}>{title}</h3>
        <p className={`text-background/80 leading-snug ${descClass}`}>{description}</p>
      </div>
    </motion.div>
  );
};

export default ApplicationCard;
