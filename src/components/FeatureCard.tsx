import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
  backgroundImage?: string;
}

const FeatureCard = ({ icon: Icon, title, description, index = 0, backgroundImage }: FeatureCardProps) => {
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
      {/* Background - image or gradient */}
      {backgroundImage ? (
        <img 
          src={backgroundImage} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-foreground/85" />
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 to-foreground/80" />
      
      <div className="relative z-10 flex flex-col h-full p-8 md:p-10">
        {/* Icon */}
        <div className="mb-6">
          <Icon className="w-10 h-10 text-background" strokeWidth={1.5} />
        </div>
        
        {/* Title */}
        <h3 className="text-xl md:text-2xl font-heading font-semibold text-background mb-3 tracking-tight" style={{ lineHeight: '1.15' }}>
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-background/80 text-body flex-grow">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
