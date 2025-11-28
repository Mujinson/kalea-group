import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

const FeatureCard = ({ icon: Icon, title, description, index = 0 }: FeatureCardProps) => {
  const delay = index * 0.15;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      className="group relative overflow-hidden transition-all duration-200 h-full flex flex-col"
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "32px",
        padding: "48px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Hover overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
        style={{
          background: "rgba(255, 255, 255, 0.12)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          borderRadius: "32px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon - no background, just floating */}
        <div className="mb-8">
          <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>
        
        {/* Title - bold and premium */}
        <h3 className="text-3xl font-heading font-bold text-white mb-6 leading-tight tracking-tight">
          {title}
        </h3>
        
        {/* Description - white with 80% opacity */}
        <p className="text-white/80 leading-relaxed text-base font-light flex-grow">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
