import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import React from "react";

interface FeatureCardProps {
  icon: LucideIcon | React.ComponentType<{ className?: string; strokeWidth?: number; size?: number }>;
  title: string;
  description: string;
  index?: number;
  backgroundImage?: string;
  compact?: boolean;
}

const FeatureCard = ({ icon: Icon, title, description, index = 0, backgroundImage, compact = false }: FeatureCardProps) => {
  const delay = index * 0.15;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        y: -6,
        rotateX: 2,
        rotateY: -2,
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
      }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className="kalea-card group relative overflow-hidden h-full flex flex-col rounded-2xl"
    >
      {/* Background - image or solid beige color */}
      {backgroundImage ? (
        <img 
          src={backgroundImage} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-card-surface" />
      )}
      
      {/* Gradient overlay - only for images */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-card-surface/50 to-card-surface/80" />
      )}
      
      <div className={`relative z-10 flex flex-col h-full ${compact ? 'p-4 md:p-8 lg:p-10' : 'p-8 md:p-10'}`}>
        {/* Icon */}
        <div className={compact ? 'mb-2 md:mb-6' : 'mb-6'}>
          <Icon className={`${compact ? 'w-6 h-6 md:w-10 md:h-10' : 'w-10 h-10'} text-foreground`} strokeWidth={1.5} />
        </div>
        
        {/* Title */}
        <h3 className={`font-heading font-semibold text-foreground tracking-tight ${compact ? 'text-base md:text-2xl mb-1 md:mb-3' : 'text-xl md:text-2xl mb-3'}`} style={{ lineHeight: '1.15' }}>
          {title}
        </h3>
        
        {/* Description */}
        <p className={`text-foreground/70 flex-grow ${compact ? 'text-xs md:text-base leading-snug' : 'text-body'}`}>
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
