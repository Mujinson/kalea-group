import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useCardTilt } from "@/hooks/useCardTilt";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

const FeatureCard = ({ icon: Icon, title, description, index = 0 }: FeatureCardProps) => {
  const delay = index * 0.15;
  const { cardRef, tilt, handleMouseMove, handleMouseLeave } = useCardTilt(8);
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="kalea-card group relative overflow-hidden h-full flex flex-col"
      style={{
        background: "rgba(255, 255, 255, 0.18)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "32px",
        padding: "48px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(0px)`,
        transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
      }}
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon - no background, just floating */}
        <div className="mb-8">
          <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>
        
        {/* Title - bold and premium */}
        <h3 className="text-3xl font-heading font-semibold text-white mb-6 tracking-tight" style={{ lineHeight: '1.15' }}>
          {title}
        </h3>
        
        {/* Description - white with 80% opacity */}
        <p className="text-white/80 text-body flex-grow">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
