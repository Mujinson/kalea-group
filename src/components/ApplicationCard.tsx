import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useCardTilt } from "@/hooks/useCardTilt";

interface ApplicationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  backgroundImage?: string;
  index: number;
}

const ApplicationCard = ({ icon: Icon, title, description, backgroundImage, index }: ApplicationCardProps) => {
  const { cardRef, tilt, isHovered, handleMouseEnter, handleMouseMove, handleMouseLeave } = useCardTilt(6);
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="kalea-card group relative aspect-square rounded-2xl bg-muted overflow-hidden"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(${isHovered ? '-6px' : '0px'})`,
        transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
      }}
    >
      {backgroundImage && (
        <img 
          src={backgroundImage} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/80" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
        <Icon className="w-12 h-12 text-background mb-4" />
        <h3 className="text-xl font-heading font-semibold text-background mb-2">{title}</h3>
        <p className="text-sm text-background/80">{description}</p>
      </div>
    </motion.div>
  );
};

export default ApplicationCard;
